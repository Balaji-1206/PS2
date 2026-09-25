import pytest
from pathlib import Path
from provenance.models.provenance_models import (
    SourceNode,
    ExtractionNode,
    GenerationNode,
    VerificationNode,
    ProvenanceRecord,
)
from provenance.services.lineage_builder import LineageBuilder
from provenance.services.storage_service import ProvenanceStorageService
from provenance.services.provenance_service import ProvenanceService


def test_provenance_storage_save_and_retrieve(tmp_path: Path):
    storage = ProvenanceStorageService(storage_dir=tmp_path)
    builder = LineageBuilder()

    source = builder.build_source_node("doc_1", "doc.txt", "hello world")
    record = builder.build_record(source_node=source, provenance_id="prov_test_storage")

    saved_path = storage.save_record(record)
    assert saved_path.exists()

    loaded = storage.get_record("prov_test_storage")
    assert loaded is not None
    assert loaded.provenance_id == "prov_test_storage"
    assert loaded.source_node.document_id == "doc_1"

    all_ids = storage.list_records()
    assert "prov_test_storage" in all_ids

    by_doc = storage.find_by_document_id("doc_1")
    assert len(by_doc) == 1
    assert by_doc[0].provenance_id == "prov_test_storage"


def test_provenance_service_build_and_verify_integrity(tmp_path: Path):
    storage = ProvenanceStorageService(storage_dir=tmp_path / "prov")
    builder = LineageBuilder()
    service = ProvenanceService(storage_service=storage, lineage_builder=builder)

    source_node = builder.build_source_node("doc_abc", "doc.txt", "raw text")
    ext_node = builder.build_extraction_node({
        "document_id": "doc_abc",
        "blocks": [{"pointer": "doc_abc#p_0", "block_type": "paragraph", "content": "raw text"}]
    })

    record = service.create_record(
        source_node=source_node,
        extraction_node=ext_node,
    )
    assert record.provenance_id is not None
    assert record.source_node.document_id == "doc_abc"

    # Verify integrity through service
    check = service.verify_record_integrity(record.provenance_id)
    assert check["is_valid"] is True
    assert check["provenance_id"] == record.provenance_id


def test_provenance_service_get_lineage_by_document(tmp_path: Path):
    storage = ProvenanceStorageService(storage_dir=tmp_path / "prov")
    builder = LineageBuilder()
    service = ProvenanceService(storage_service=storage, lineage_builder=builder)

    source1 = builder.build_source_node("doc_shared", "doc1.txt", "content 1")
    service.create_record(source_node=source1, provenance_id="prov_1")

    source2 = builder.build_source_node("doc_shared", "doc2.txt", "content 2")
    service.create_record(source_node=source2, provenance_id="prov_2")

    lineage = service.get_lineage_by_document("doc_shared")
    assert len(lineage) == 2
    prov_ids = {r.provenance_id for r in lineage}
    assert "prov_1" in prov_ids and "prov_2" in prov_ids


def test_provenance_service_build_from_pipeline(tmp_path: Path):
    from extraction.models.extraction_models import (
        ExtractionResult,
        ExtractedContent,
        ParagraphItem,
        SourceMappingItem,
        DocumentMetadata,
    )
    from extraction.services.storage_service import StorageService
    from generation.models.generation_models import GenerationResult, ClaimItem, GenerationMetadata
    from generation.services.storage_service import GenerationStorageService
    from dual_verification.models.verification_models import VerificationResult, VerificationVerdict, ClaimVerificationResult
    from dual_verification.services.storage_service import VerificationStorageService

    # 1. Extraction artifact
    ext_storage = StorageService(storage_dir=tmp_path / "extractions")
    sample_doc = ExtractionResult(
        document_id="doc_pipeline_1",
        source_type="text/plain",
        metadata=DocumentMetadata(
            filename="policy.txt",
            pages=1,
            language="en",
        ),
        content=ExtractedContent(
            paragraphs=[
                ParagraphItem(id="p_0", text="This is extracted policy text.")
            ]
        ),
        source_mapping=[
            SourceMappingItem(id="p_0", source_pointer="doc_pipeline_1#p_0")
        ],
    )
    ext_storage.save(sample_doc)

    # 2. Generation artifact
    gen_storage = GenerationStorageService(storage_dir=tmp_path / "generations")
    sample_gen = GenerationResult(
        generation_id="gen_pipeline_1",
        document_id="doc_pipeline_1",
        instruction="Summarize policy",
        generated_text="Governed policy summary",
        claims=[
            ClaimItem(claim_id="c0", statement="Governed claim", cited_source_pointers=["doc_pipeline_1#p_0"])
        ],
        metadata=GenerationMetadata(model="qwen3:8b", claim_count=1),
    )
    gen_storage.save(sample_gen)

    # 3. Verification artifact
    ver_storage = VerificationStorageService(storage_dir=tmp_path / "verifications")
    sample_ver = VerificationResult(
        verification_id="ver_pipeline_1",
        generation_id="gen_pipeline_1",
        document_id="doc_pipeline_1",
        overall_status=VerificationVerdict.VERIFIED,
        verified_claims=[
            ClaimVerificationResult(
                claim_id="c0",
                statement="Governed claim",
                cited_source_pointers=["doc_pipeline_1#p_0"],
                primary_verdict=VerificationVerdict.VERIFIED,
                secondary_verdict=VerificationVerdict.VERIFIED,
                final_verdict=VerificationVerdict.VERIFIED,
                confidence=0.98,
            )
        ],
        pass_rate=1.0,
    )
    ver_storage.save(sample_ver)

    prov_storage = ProvenanceStorageService(storage_dir=tmp_path / "prov")
    service = ProvenanceService(storage_service=prov_storage)

    import unittest.mock as mock
    with mock.patch("extraction.services.storage_service.StorageService", return_value=ext_storage), \
         mock.patch("generation.services.storage_service.GenerationStorageService", return_value=gen_storage), \
         mock.patch("dual_verification.services.storage_service.VerificationStorageService", return_value=ver_storage):
        record = service.build_from_pipeline(verification_id="ver_pipeline_1")

    assert record.provenance_id is not None
    assert record.source_node.document_id == "doc_pipeline_1"
    assert record.source_node.filename == "policy.txt"
    assert record.extraction_node is not None
    assert record.extraction_node.total_blocks == 1
    assert "doc_pipeline_1#p_0" in record.extraction_node.extracted_pointers
    assert record.generation_node is not None
    assert record.generation_node.generation_id == "gen_pipeline_1"
    assert record.verification_node is not None
    assert record.verification_node.overall_verdict == "VERIFIED"
    assert len(record.edges) == 3
    assert record.edges[0].relationship == "extracted_from"
    assert record.edges[1].relationship == "generated_from"
    assert record.edges[2].relationship == "verified_against"


