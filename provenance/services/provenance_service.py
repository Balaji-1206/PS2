import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from provenance.models.provenance_models import (
    SourceNode,
    ExtractionNode,
    GenerationNode,
    VerificationNode,
    ProvenanceRecord,
    ReverseTraceResult,
)
from provenance.services.lineage_builder import (
    LineageBuilder,
    compute_manifest_integrity_hash,
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

    def publish_record(
        self,
        provenance_id: str,
        approver_id: str,
        digital_signature: Optional[str] = None,
        disclosure_level: Optional[str] = "PUBLIC",
    ) -> ProvenanceRecord:
        """Signs and seals a ProvenanceRecord for publication, cryptographically resealing its integrity hash."""
        record = self.storage.get_record(provenance_id)
        if not record:
            raise ValueError(f"Provenance record '{provenance_id}' not found.")

        record.status = "PUBLISHED"
        record.approver_id = approver_id
        if disclosure_level:
            record.disclosure_level = disclosure_level
        if digital_signature:
            record.metadata["digital_signature"] = digital_signature
        record.published_at = datetime.now(timezone.utc).isoformat()

        # Reseal integrity hash
        record.integrity_hash = compute_manifest_integrity_hash(record)
        self.storage.save_record(record)
        return record

    def trace_source_pointer(
        self,
        pointer: str,
        document_id: Optional[str] = None,
    ) -> Optional[ReverseTraceResult]:
        """Resolves a claim or block source pointer back to its raw extraction bounding box and text."""
        doc_id = document_id
        block_id = pointer
        if "#" in pointer:
            parts = pointer.split("#", 1)
            doc_id = doc_id or parts[0]
            block_id = parts[1]

        if not doc_id:
            return None

        try:
            from extraction.services.storage_service import StorageService
            ext_storage = StorageService()
            doc = ext_storage.get(doc_id)
        except Exception as e:
            logger.warning(f"Failed to lookup extraction doc '{doc_id}': {e}")
            return None

        if not doc:
            return None

        matching_mapping = None
        source_mappings = getattr(doc, "source_mapping", None) or []
        for sm in source_mappings:
            sm_id = getattr(sm, "id", None) or (sm.get("id") if isinstance(sm, dict) else None)
            sm_ptr = getattr(sm, "source_pointer", None) or (sm.get("source_pointer") if isinstance(sm, dict) else None)
            if sm_id == block_id or sm_ptr == pointer or (sm_ptr and sm_ptr.endswith(f"#{block_id}")):
                matching_mapping = sm
                break

        source_text = ""
        content = getattr(doc, "content", None)
        if content:
            paragraphs = getattr(content, "paragraphs", None) or []
            for p in paragraphs:
                p_id = getattr(p, "id", None) or (p.get("id") if isinstance(p, dict) else None)
                if p_id == block_id:
                    source_text = getattr(p, "text", "") or (p.get("text", "") if isinstance(p, dict) else "")
                    break

            if not source_text:
                tables = getattr(content, "tables", None) or []
                for t in tables:
                    t_id = getattr(t, "id", None) or (t.get("id") if isinstance(t, dict) else None)
                    if t_id == block_id:
                        source_text = str(getattr(t, "data", "") or (t.get("data", "") if isinstance(t, dict) else ""))
                        break

        page = None
        reading_order = None
        bounding_box = None
        confidence = 1.0

        if matching_mapping:
            page = getattr(matching_mapping, "page", None) if not isinstance(matching_mapping, dict) else matching_mapping.get("page")
            reading_order = getattr(matching_mapping, "reading_order", None) if not isinstance(matching_mapping, dict) else matching_mapping.get("reading_order")
            bounding_box = getattr(matching_mapping, "bounding_box", None) if not isinstance(matching_mapping, dict) else matching_mapping.get("bounding_box")
            raw_conf = getattr(matching_mapping, "confidence", 1.0) if not isinstance(matching_mapping, dict) else matching_mapping.get("confidence", 1.0)
            if raw_conf is not None:
                confidence = float(raw_conf)

        return ReverseTraceResult(
            document_id=doc_id,
            source_pointer=pointer if "#" in pointer else f"{doc_id}#{pointer}",
            source_text=source_text,
            page=page,
            reading_order=reading_order,
            bounding_box=bounding_box,
            confidence=confidence,
        )

