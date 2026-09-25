"""Cryptographic hashing and lineage graph builder for the Provenance Layer."""
import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel

from provenance.models.provenance_models import (
    SourceNode,
    ExtractionNode,
    GenerationNode,
    VerificationNode,
    LineageEdge,
    ProvenanceRecord,
)


def compute_sha256(data: Union[str, bytes, dict, list, BaseModel]) -> str:
    """Computes a deterministic SHA-256 hexadecimal digest for various data types."""
    if isinstance(data, BaseModel):
        data = data.model_dump()

    if isinstance(data, (dict, list)):
        serialized = json.dumps(data, sort_keys=True, separators=(",", ":"), default=str)
        byte_data = serialized.encode("utf-8")
    elif isinstance(data, str):
        byte_data = data.encode("utf-8")
    elif isinstance(data, bytes):
        byte_data = data
    else:
        byte_data = str(data).encode("utf-8")

    return hashlib.sha256(byte_data).hexdigest()


def compute_manifest_integrity_hash(record: ProvenanceRecord) -> str:
    """Computes a cryptographic digest over the full lineage graph structure, excluding the integrity_hash field."""
    canonical_dict = {
        "provenance_id": record.provenance_id,
        "created_at": record.created_at,
        "source_node": record.source_node.model_dump() if record.source_node else None,
        "extraction_node": record.extraction_node.model_dump() if record.extraction_node else None,
        "generation_node": record.generation_node.model_dump() if record.generation_node else None,
        "verification_node": record.verification_node.model_dump() if record.verification_node else None,
        "edges": [edge.model_dump() for edge in record.edges],
        "status": record.status,
    }
    return compute_sha256(canonical_dict)


def verify_record_integrity(record: ProvenanceRecord) -> bool:
    """Verifies that the provenance manifest has not been tampered with since creation."""
    expected_hash = compute_manifest_integrity_hash(record)
    return expected_hash == record.integrity_hash


class LineageBuilder:
    """Builds lineage nodes and assembles complete, tamper-evident Provenance Records."""

    def build_source_node(
        self,
        document_id: str,
        filename: str,
        content: Union[str, bytes],
        source_type: str = "text",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> SourceNode:
        """Constructs a SourceNode with a cryptographic hash of raw document content."""
        sha256_hash = compute_sha256(content)
        timestamp = datetime.now(timezone.utc).isoformat()
        return SourceNode(
            document_id=document_id,
            filename=filename,
            source_type=source_type,
            sha256_hash=sha256_hash,
            ingest_timestamp=timestamp,
            metadata=metadata or {},
        )

    def build_extraction_node(
        self,
        document_data: Union[Dict[str, Any], BaseModel],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ExtractionNode:
        """Constructs an ExtractionNode summarizing extracted blocks, types, and pointers."""
        data = document_data.model_dump() if isinstance(document_data, BaseModel) else document_data
        document_id = data.get("document_id", "unknown_doc")
        blocks = data.get("blocks", [])

        total_blocks = len(blocks)
        block_types: Dict[str, int] = {}
        extracted_pointers: List[str] = []

        for block in blocks:
            b_type = block.get("block_type", "paragraph")
            block_types[b_type] = block_types.get(b_type, 0) + 1
            if "pointer" in block:
                extracted_pointers.append(block["pointer"])

        sha256_hash = compute_sha256(blocks)
        return ExtractionNode(
            document_id=document_id,
            total_blocks=total_blocks,
            block_types=block_types,
            extracted_pointers=extracted_pointers,
            sha256_hash=sha256_hash,
            metadata=metadata or {},
        )

    def build_generation_node(
        self,
        generation_data: Union[Dict[str, Any], BaseModel],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> GenerationNode:
        """Constructs a GenerationNode capturing prompt instruction, model, and claim metrics."""
        data = generation_data.model_dump() if isinstance(generation_data, BaseModel) else generation_data
        generation_id = data.get("generation_id", f"gen_{uuid.uuid4().hex[:8]}")
        document_id = data.get("document_id", "unknown_doc")
        model_name = data.get("model_name", "qwen3:8b")
        instruction = data.get("instruction", "")
        generated_text = data.get("generated_text", "")
        claims = data.get("claims", [])
        created_at = data.get("created_at", datetime.now(timezone.utc).isoformat())

        sha256_hash = compute_sha256({
            "generated_text": generated_text,
            "claims": claims,
        })

        return GenerationNode(
            generation_id=generation_id,
            document_id=document_id,
            model_name=model_name,
            instruction=instruction,
            generated_text_length=len(generated_text),
            total_claims=len(claims),
            sha256_hash=sha256_hash,
            created_at=created_at,
            metadata=metadata or {},
        )

    def build_verification_node(
        self,
        verification_data: Union[Dict[str, Any], BaseModel],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> VerificationNode:
        """Constructs a VerificationNode recording consensus verdicts and confidence scores."""
        data = verification_data.model_dump() if isinstance(verification_data, BaseModel) else verification_data
        verification_id = data.get("verification_id", f"ver_{uuid.uuid4().hex[:8]}")
        overall_verdict = data.get("overall_verdict", "UNSUPPORTED")
        overall_confidence = float(data.get("overall_confidence", 0.0))
        created_at = data.get("created_at", datetime.now(timezone.utc).isoformat())
        results = data.get("results", [])

        claims_verified = sum(1 for r in results if r.get("verdict") == "VERIFIED")
        claims_contradicted = sum(1 for r in results if r.get("verdict") == "CONTRADICTED")
        claims_unsupported = sum(1 for r in results if r.get("verdict") == "UNSUPPORTED")

        sha256_hash = compute_sha256(results)

        return VerificationNode(
            verification_id=verification_id,
            overall_verdict=overall_verdict,
            claims_verified=claims_verified,
            claims_contradicted=claims_contradicted,
            claims_unsupported=claims_unsupported,
            overall_confidence=overall_confidence,
            sha256_hash=sha256_hash,
            created_at=created_at,
            metadata=metadata or {},
        )

    def build_lineage_edges(
        self,
        source_node: SourceNode,
        extraction_node: Optional[ExtractionNode] = None,
        generation_node: Optional[GenerationNode] = None,
        verification_node: Optional[VerificationNode] = None,
    ) -> List[LineageEdge]:
        """Constructs directed lineage edges linking pipeline transformation stages."""
        edges: List[LineageEdge] = []

        if extraction_node:
            edges.append(
                LineageEdge(
                    source_id=source_node.document_id,
                    target_id=extraction_node.document_id,
                    relationship="extracted_from",
                )
            )

        if extraction_node and generation_node:
            edges.append(
                LineageEdge(
                    source_id=extraction_node.document_id,
                    target_id=generation_node.generation_id,
                    relationship="generated_from",
                )
            )
        elif generation_node:
            edges.append(
                LineageEdge(
                    source_id=source_node.document_id,
                    target_id=generation_node.generation_id,
                    relationship="generated_from",
                )
            )

        if generation_node and verification_node:
            edges.append(
                LineageEdge(
                    source_id=generation_node.generation_id,
                    target_id=verification_node.verification_id,
                    relationship="verified_against",
                )
            )

        return edges

    def build_record(
        self,
        source_node: SourceNode,
        extraction_node: Optional[ExtractionNode] = None,
        generation_node: Optional[GenerationNode] = None,
        verification_node: Optional[VerificationNode] = None,
        provenance_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ProvenanceRecord:
        """Assembles and cryptographically seals a complete ProvenanceRecord."""
        record_id = provenance_id or f"prov_{uuid.uuid4().hex[:12]}"
        timestamp = datetime.now(timezone.utc).isoformat()

        edges = self.build_lineage_edges(
            source_node=source_node,
            extraction_node=extraction_node,
            generation_node=generation_node,
            verification_node=verification_node,
        )

        partial_record = ProvenanceRecord(
            provenance_id=record_id,
            created_at=timestamp,
            source_node=source_node,
            extraction_node=extraction_node,
            generation_node=generation_node,
            verification_node=verification_node,
            edges=edges,
            integrity_hash="",
            status="ACTIVE",
            metadata=metadata or {},
        )

        integrity_hash = compute_manifest_integrity_hash(partial_record)
        partial_record.integrity_hash = integrity_hash
        return partial_record
