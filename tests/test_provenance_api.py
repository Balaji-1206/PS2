"""Tests for the Provenance Layer FastAPI REST endpoints."""
from pathlib import Path
import pytest
from httpx import AsyncClient, ASGITransport

from provenance.main import app
from provenance.models.provenance_models import SourceNode, ProvenanceRecord
from provenance.services.lineage_builder import LineageBuilder
from provenance.services.storage_service import ProvenanceStorageService
from provenance.services.provenance_service import ProvenanceService


@pytest.fixture
def mock_provenance_service(tmp_path: Path):
    storage = ProvenanceStorageService(storage_dir=tmp_path / "prov_api_records")
    builder = LineageBuilder()
    service = ProvenanceService(storage_service=storage, lineage_builder=builder)

    # Pre-populate a record
    source = builder.build_source_node("doc_api_1", "policy.txt", "Sample policy body")
    service.create_record(source_node=source, provenance_id="prov_api_1")
    return service


@pytest.mark.asyncio
async def test_provenance_health():
    """Verify health check endpoint returns 200 and expected service status."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["service"] == "provenance-layer"


@pytest.mark.asyncio
async def test_provenance_build_missing_parameters_returns_400():
    """Verify build endpoint raises 400 when missing required IDs and content."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/provenance/build", json={})
        assert res.status_code == 400
        assert "Must provide at least" in res.json()["message"]


@pytest.mark.asyncio
async def test_provenance_build_success(monkeypatch, mock_provenance_service):
    """Verify build endpoint succeeds with valid input."""
    from provenance.api import routes

    monkeypatch.setattr(routes, "provenance_service", mock_provenance_service)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "document_id": "doc_api_new",
            "source_content": "Sample content for new document",
            "filename": "new_doc.txt",
        }
        res = await client.post("/provenance/build", json=payload)
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "success"
        assert body["provenance_id"].startswith("prov_")
        assert len(body["integrity_hash"]) == 64
        assert body["data"]["source_node"]["document_id"] == "doc_api_new"


@pytest.mark.asyncio
async def test_get_provenance_record_success_and_not_found(monkeypatch, mock_provenance_service):
    """Verify GET record endpoint returns record when found, and 404 when absent."""
    from provenance.api import routes

    monkeypatch.setattr(routes, "provenance_service", mock_provenance_service)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Existing record
        res = await client.get("/provenance/prov_api_1")
        assert res.status_code == 200
        data = res.json()
        assert data["provenance_id"] == "prov_api_1"
        assert data["source_node"]["document_id"] == "doc_api_1"

        # 2. Non-existent record
        not_found_res = await client.get("/provenance/prov_missing")
        assert not_found_res.status_code == 404


@pytest.mark.asyncio
async def test_get_lineage_for_document(monkeypatch, mock_provenance_service):
    """Verify querying lineage by document_id returns matches."""
    from provenance.api import routes

    monkeypatch.setattr(routes, "provenance_service", mock_provenance_service)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/provenance/lineage/doc_api_1")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["document_id"] == "doc_api_1"
        assert data["total_records"] == 1
        assert data["records"][0]["provenance_id"] == "prov_api_1"


@pytest.mark.asyncio
async def test_verify_provenance_integrity_endpoint(monkeypatch, mock_provenance_service):
    """Verify cryptographic manifest integrity verification endpoint."""
    from provenance.api import routes

    monkeypatch.setattr(routes, "provenance_service", mock_provenance_service)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Existing record verification
        res = await client.get("/provenance/prov_api_1/verify")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["provenance_id"] == "prov_api_1"
        assert data["is_valid"] is True
        assert len(data["integrity_hash"]) == 64

        # Non-existent record
        missing_res = await client.get("/provenance/prov_nonexistent/verify")
        assert missing_res.status_code == 404
