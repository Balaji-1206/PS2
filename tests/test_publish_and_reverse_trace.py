from pathlib import Path
import pytest

from extraction.models.extraction_models import (
    ExtractionResult,
    ExtractedContent,
    ParagraphItem,
    SourceMappingItem,
    DocumentMetadata,
)
from extraction.services.storage_service import StorageService
from provenance.models.provenance_models import SourceNode
from provenance.services.lineage_builder import LineageBuilder, verify_record_integrity
from provenance.services.storage_service import ProvenanceStorageService
from provenance.services.provenance_service import ProvenanceService


def test_sign_and_publish_manifest(tmp_path: Path):
    storage = ProvenanceStorageService(storage_dir=tmp_path / "prov")
    builder = LineageBuilder()
    service = ProvenanceService(storage_service=storage, lineage_builder=builder)

    source = builder.build_source_node("doc_pub", "report.txt", "Some content")
    record = service.create_record(source_node=source, provenance_id="prov_pub_1")
    assert record.status == "ACTIVE"
    assert record.approver_id is None
    assert record.published_at is None

    # Publish record
    published = service.publish_record(
        provenance_id="prov_pub_1",
        approver_id="auditor_sarah",
        digital_signature="sig_sha256_mock_hash",
    )
    assert published.status == "PUBLISHED"
    assert published.approver_id == "auditor_sarah"
    assert published.published_at is not None

    # Verify cryptographic integrity after resealing
    assert verify_record_integrity(published) is True

    # Re-verify through service
    check = service.verify_record_integrity("prov_pub_1")
    assert check["is_valid"] is True
    assert check["status"] == "PUBLISHED"


def test_reverse_traceability_to_source_bounding_box(tmp_path: Path):
    ext_storage = StorageService(storage_dir=tmp_path / "extractions")
    sample_doc = ExtractionResult(
        document_id="doc_trace_1",
        source_type="pdf",
        metadata=DocumentMetadata(filename="annual_report.pdf", pages=2),
        content=ExtractedContent(
            paragraphs=[
                ParagraphItem(
                    id="p_5",
                    text="Global renewable energy investments reached $500B in 2025.",
                    page=2,
                    reading_order=3,
                )
            ]
        ),
        source_mapping=[
            SourceMappingItem(
                id="p_5",
                source_pointer="doc_trace_1#p_5",
                page=2,
                reading_order=3,
                bounding_box=[72.0, 150.0, 480.0, 180.0],
                confidence=0.99,
            )
        ],
    )
    ext_storage.save(sample_doc)

    prov_storage = ProvenanceStorageService(storage_dir=tmp_path / "prov")
    service = ProvenanceService(storage_service=prov_storage)

    import unittest.mock as mock
    with mock.patch("extraction.services.storage_service.StorageService", return_value=ext_storage):
        trace = service.trace_source_pointer(pointer="doc_trace_1#p_5")

    assert trace is not None
    assert trace.document_id == "doc_trace_1"
    assert trace.source_pointer == "doc_trace_1#p_5"
    assert trace.page == 2
    assert trace.bounding_box == [72.0, 150.0, 480.0, 180.0]
    assert "renewable energy" in trace.source_text
    assert trace.confidence == 0.99


@pytest.mark.asyncio
async def test_api_publish_and_reverse_trace(tmp_path: Path):
    from httpx import AsyncClient, ASGITransport
    from provenance.main import app
    import provenance.api.routes as routes

    storage = ProvenanceStorageService(storage_dir=tmp_path / "prov_api")
    builder = LineageBuilder()
    service = ProvenanceService(storage_service=storage, lineage_builder=builder)

    source = builder.build_source_node("doc_api_pub", "report.txt", "Text")
    service.create_record(source_node=source, provenance_id="prov_api_pub_1")

    # Wire into router
    routes.provenance_service = service

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Publish
        pub_res = await client.post(
            "/provenance/prov_api_pub_1/publish",
            json={"approver_id": "chief_compliance_officer", "digital_signature": "sha_sig_123"},
        )
        assert pub_res.status_code == 200
        pub_data = pub_res.json()
        assert pub_data["status"] == "success"
        assert pub_data["data"]["status"] == "PUBLISHED"
        assert pub_data["data"]["approver_id"] == "chief_compliance_officer"

        # Reverse trace
        ext_storage = StorageService(storage_dir=tmp_path / "extractions")
        sample_doc = ExtractionResult(
            document_id="doc_api_pub",
            source_type="text",
            metadata=DocumentMetadata(filename="report.txt", pages=1),
            content=ExtractedContent(
                paragraphs=[
                    ParagraphItem(
                        id="p_1",
                        text="Revenue increased 25%",
                        page=1,
                        reading_order=1,
                    )
                ]
            ),
            source_mapping=[
                SourceMappingItem(
                    id="p_1",
                    source_pointer="doc_api_pub#p_1",
                    page=1,
                    reading_order=1,
                    bounding_box=[10.0, 20.0, 100.0, 50.0],
                    confidence=0.98,
                )
            ],
        )
        ext_storage.save(sample_doc)

        import unittest.mock as mock
        with mock.patch("extraction.services.storage_service.StorageService", return_value=ext_storage):
            trace_res = await client.get("/provenance/trace/doc_api_pub/p_1")
            assert trace_res.status_code == 200
            trace_data = trace_res.json()
            assert trace_data["status"] == "success"
            assert trace_data["data"]["document_id"] == "doc_api_pub"
            assert trace_data["data"]["source_text"] == "Revenue increased 25%"
            assert trace_data["data"]["bounding_box"] == [10.0, 20.0, 100.0, 50.0]

