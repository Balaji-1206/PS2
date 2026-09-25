from datetime import datetime, timezone
import pytest
from provenance.models.provenance_models import (
    SourceNode,
    ExtractionNode,
    GenerationNode,
    VerificationNode,
    LineageEdge,
    ProvenanceRecord,
)


def test_source_node_creation():
    node = SourceNode(
        document_id="doc_123",
        filename="report.pdf",
        source_type="pdf",
        sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        ingest_timestamp="2026-09-25T10:00:00Z",
        metadata={"file_size": 1024},
    )
    assert node.document_id == "doc_123"
    assert node.filename == "report.pdf"
    assert node.source_type == "pdf"
    assert len(node.sha256_hash) == 64


def test_extraction_node_creation():
    node = ExtractionNode(
        document_id="doc_123",
        total_blocks=5,
        block_types={"paragraph": 4, "table": 1},
        extracted_pointers=["doc_123#p_0", "doc_123#t_1"],
        sha256_hash="a" * 64,
    )
    assert node.document_id == "doc_123"
    assert node.total_blocks == 5
    assert len(node.extracted_pointers) == 2


def test_generation_node_creation():
    node = GenerationNode(
        generation_id="gen_456",
        document_id="doc_123",
        model_name="qwen3:8b",
        instruction="Summarize key points",
        generated_text_length=500,
        total_claims=3,
        sha256_hash="b" * 64,
        created_at="2026-09-25T10:05:00Z",
    )
    assert node.generation_id == "gen_456"
    assert node.model_name == "qwen3:8b"
    assert node.total_claims == 3


def test_verification_node_creation():
    node = VerificationNode(
        verification_id="ver_789",
        overall_verdict="VERIFIED",
        claims_verified=3,
        claims_contradicted=0,
        claims_unsupported=0,
        overall_confidence=0.95,
        sha256_hash="c" * 64,
        created_at="2026-09-25T10:06:00Z",
    )
    assert node.verification_id == "ver_789"
    assert node.overall_verdict == "VERIFIED"
    assert node.overall_confidence == 0.95


def test_provenance_record_serialization():
    source = SourceNode(
        document_id="doc_123",
        filename="test.txt",
        source_type="txt",
        sha256_hash="0" * 64,
        ingest_timestamp="2026-09-25T10:00:00Z",
    )
    edge = LineageEdge(
        source_id="doc_123",
        target_id="ext_doc_123",
        relationship="extracted_from",
    )
    record = ProvenanceRecord(
        provenance_id="prov_001",
        created_at="2026-09-25T10:07:00Z",
        source_node=source,
        edges=[edge],
        integrity_hash="d" * 64,
        status="ACTIVE",
    )
    dumped = record.model_dump()
    assert dumped["provenance_id"] == "prov_001"
    assert dumped["source_node"]["document_id"] == "doc_123"
    assert len(dumped["edges"]) == 1

    restored = ProvenanceRecord.model_validate(dumped)
    assert restored.provenance_id == record.provenance_id
    assert restored.source_node.filename == "test.txt"
