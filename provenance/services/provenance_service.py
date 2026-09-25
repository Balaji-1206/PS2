"""Provenance service orchestrating lineage tracking, pipeline assembly, and integrity checks."""
import logging
from typing import Any, Dict, List, Optional

from provenance.models.provenance_models import (
    SourceNode,
    ExtractionNode,
    GenerationNode,
    VerificationNode,
    ProvenanceRecord,
)
from provenance.services.lineage_builder import (
    LineageBuilder,
    verify_record_integrity,
)
from provenance.services.storage_service import ProvenanceStorageService

logger = logging.getLogger(__name__)


class ProvenanceService:
    """Orchestrator for recording, resolving, and verifying provenance records across pipeline stages."""

    def __init__(
        self,
        storage_service: Optional[ProvenanceStorageService] = None,
        lineage_builder: Optional[LineageBuilder] = None,
    ):
        self.storage = storage_service or ProvenanceStorageService()
        self.builder = lineage_builder or LineageBuilder()

    def create_record(
        self,
        source_node: SourceNode,
        extraction_node: Optional[ExtractionNode] = None,
        generation_node: Optional[GenerationNode] = None,
        verification_node: Optional[VerificationNode] = None,
        provenance_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ProvenanceRecord:
        """Assembles a ProvenanceRecord, seals its integrity hash, and persists it to disk."""
        record = self.builder.build_record(
            source_node=source_node,
            extraction_node=extraction_node,
            generation_node=generation_node,
            verification_node=verification_node,
            provenance_id=provenance_id,
            metadata=metadata,
        )
        self.storage.save_record(record)
        return record

    def get_record(self, provenance_id: str) -> Optional[ProvenanceRecord]:
        """Retrieves a provenance record by its ID."""
        return self.storage.get_record(provenance_id)

    def get_lineage_by_document(self, document_id: str) -> List[ProvenanceRecord]:
        """Returns all transformation lineage manifests for a given document."""
        return self.storage.find_by_document_id(document_id)

    def verify_record_integrity(self, provenance_id: str) -> Dict[str, Any]:
        """Verifies the tamper-evident cryptographic hash of a stored record."""
        record = self.storage.get_record(provenance_id)
        if not record:
            return {
                "provenance_id": provenance_id,
                "is_valid": False,
                "error": "Record not found",
            }

        is_valid = verify_record_integrity(record)
        return {
            "provenance_id": provenance_id,
            "is_valid": is_valid,
            "integrity_hash": record.integrity_hash,
            "status": record.status,
        }

    def build_from_pipeline(
        self,
        document_id: Optional[str] = None,
        generation_id: Optional[str] = None,
        verification_id: Optional[str] = None,
        source_content: Optional[str] = None,
        filename: Optional[str] = None,
        source_type: Optional[str] = None,
    ) -> ProvenanceRecord:
        """Assembles end-to-end lineage by looking up existing artifacts in extraction, generation, and verification storages."""
        extracted_doc = None
        gen_artifact = None
        ver_result = None

        # 1. Verification Lookup
        if verification_id:
            try:
                from dual_verification.services.storage_service import VerificationStorageService
                ver_storage = VerificationStorageService()
                ver_result = ver_storage.get(verification_id)
                if ver_result:
                    document_id = document_id or ver_result.document_id
                    generation_id = generation_id or ver_result.generation_id
            except Exception as e:
                logger.warning(f"Could not load verification {verification_id}: {e}")

        # 2. Generation Lookup
        if generation_id:
            try:
                from generation.services.storage_service import GenerationStorageService
                gen_storage = GenerationStorageService()
                gen_artifact = gen_storage.get(generation_id)
                if gen_artifact:
                    document_id = document_id or gen_artifact.document_id
            except Exception as e:
                logger.warning(f"Could not load generation {generation_id}: {e}")

        # 3. Extraction Lookup
        if document_id:
            try:
                from extraction.services.storage_service import StorageService
                ext_storage = StorageService()
                extracted_doc = ext_storage.get(document_id)
                if extracted_doc:
                    if not filename and getattr(extracted_doc, "metadata", None):
                        filename = getattr(extracted_doc.metadata, "filename", None)
                    if not source_type and hasattr(extracted_doc, "source_type"):
                        source_type = extracted_doc.source_type
            except Exception as e:
                logger.warning(f"Could not load extraction {document_id}: {e}")

        # Construct SourceNode
        final_doc_id = document_id or "doc_unknown"
        final_filename = filename or f"{final_doc_id}.txt"
        
        extracted_text = ""
        if extracted_doc:
            if hasattr(extracted_doc, "content") and getattr(extracted_doc.content, "paragraphs", None):
                extracted_text = "\n\n".join(p.text for p in extracted_doc.content.paragraphs)
            elif isinstance(extracted_doc, dict):
                content = extracted_doc.get("content", {})
                paragraphs = content.get("paragraphs", [])
                extracted_text = "\n\n".join(p.get("text", "") for p in paragraphs)

        final_content = source_content or extracted_text
        source_node = self.builder.build_source_node(
            document_id=final_doc_id,
            filename=final_filename,
            content=final_content,
            source_type=source_type or "text",
        )

        extraction_node = self.builder.build_extraction_node(extracted_doc) if extracted_doc else None
        generation_node = self.builder.build_generation_node(gen_artifact) if gen_artifact else None
        verification_node = self.builder.build_verification_node(ver_result) if ver_result else None

        return self.create_record(
            source_node=source_node,
            extraction_node=extraction_node,
            generation_node=generation_node,
            verification_node=verification_node,
        )
