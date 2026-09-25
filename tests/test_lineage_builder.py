import json
import pytest
from provenance.services.lineage_builder import (
    compute_sha256,
    compute_manifest_integrity_hash,
    verify_record_integrity,
    LineageBuilder,
)
from provenance.models.provenance_models import SourceNode, ProvenanceRecord


def test_compute_sha256_deterministic():
    data_str = "GovPulse sample text"
    hash1 = compute_sha256(data_str)
    hash2 = compute_sha256(data_str)
    assert hash1 == hash2
    assert len(hash1) == 64

    dict_a = {"b": 2, "a": 1}
    dict_b = {"a": 1, "b": 2}
    assert compute_sha256(dict_a) == compute_sha256(dict_b)


def test_build_source_node():
    builder = LineageBuilder()
    node = builder.build_source_node(
        document_id="doc_test_1",
        filename="policy.txt",
        content="Policy guideline text content",
        source_type="txt",
    )
    assert node.document_id == "doc_test_1"
    assert node.filename == "policy.txt"
    assert node.source_type == "txt"
    assert len(node.sha256_hash) == 64


def test_build_extraction_node():
    builder = LineageBuilder()
    doc_dict = {
        "document_id": "doc_test_1",
        "blocks": [
            {"pointer": "doc_test_1#h_0", "block_type": "heading", "content": "Header"},
            {"pointer": "doc_test_1#p_1", "block_type": "paragraph", "content": "Body text"},
            {"pointer": "doc_test_1#p_2", "block_type": "paragraph", "content": "Second paragraph"},
        ]
    }
    node = builder.build_extraction_node(doc_dict)
    assert node.document_id == "doc_test_1"
    assert node.total_blocks == 3
    assert node.block_types == {"heading": 1, "paragraph": 2}
    assert "doc_test_1#p_1" in node.extracted_pointers


def test_build_generation_node():
    builder = LineageBuilder()
    gen_dict = {
        "generation_id": "gen_test_1",
        "document_id": "doc_test_1",
        "model_name": "qwen3:8b",
        "instruction": "Draft briefing",
        "generated_text": "This is a governed summary.",
        "claims": [
            {"claim_id": "c1", "text": "Claim 1", "source_pointer": "doc_test_1#p_1"},
            {"claim_id": "c2", "text": "Claim 2", "source_pointer": "doc_test_1#p_2"},
        ]
    }
    node = builder.build_generation_node(gen_dict)
    assert node.generation_id == "gen_test_1"
    assert node.total_claims == 2
    assert node.generated_text_length == len("This is a governed summary.")


def test_build_verification_node():
    builder = LineageBuilder()
    ver_dict = {
        "verification_id": "ver_test_1",
        "overall_verdict": "VERIFIED",
        "overall_confidence": 0.95,
        "results": [
            {"claim_id": "c1", "verdict": "VERIFIED"},
            {"claim_id": "c2", "verdict": "VERIFIED"},
        ]
    }
    node = builder.build_verification_node(ver_dict)
    assert node.verification_id == "ver_test_1"
    assert node.overall_verdict == "VERIFIED"
    assert node.claims_verified == 2
    assert node.claims_contradicted == 0


def test_build_full_provenance_record_and_integrity_check():
    builder = LineageBuilder()
    source = builder.build_source_node("doc_1", "doc.txt", "raw text content")
    ext = builder.build_extraction_node({
        "document_id": "doc_1",
        "blocks": [{"pointer": "doc_1#p_0", "block_type": "paragraph", "content": "raw text content"}]
    })
    gen = builder.build_generation_node({
        "generation_id": "gen_1",
        "document_id": "doc_1",
        "model_name": "qwen3:8b",
        "instruction": "summarize",
        "generated_text": "summary text",
        "claims": [{"claim_id": "c1", "text": "summary claim", "source_pointer": "doc_1#p_0"}]
    })
    ver = builder.build_verification_node({
        "verification_id": "ver_1",
        "overall_verdict": "VERIFIED",
        "overall_confidence": 0.95,
        "results": [{"claim_id": "c1", "verdict": "VERIFIED"}]
    })

    record = builder.build_record(
        source_node=source,
        extraction_node=ext,
        generation_node=gen,
        verification_node=ver,
        provenance_id="prov_test_123",
    )

    assert record.provenance_id == "prov_test_123"
    assert len(record.edges) == 3
    assert verify_record_integrity(record) is True

    # Tampering test
    record_tampered = record.model_copy(deep=True)
    record_tampered.generation_node.model_name = "malicious_unauthorized_model"
    assert verify_record_integrity(record_tampered) is False
