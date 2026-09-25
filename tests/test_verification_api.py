import pytest
from httpx import AsyncClient, ASGITransport
from dual_verification.main import app
from dual_verification.models.verification_models import VerificationVerdict, VerificationResult

@pytest.mark.asyncio
async def test_verification_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_verify_missing_body_returns_400():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/verify", json={})
        assert res.status_code == 400

@pytest.mark.asyncio
async def test_verify_endpoint_success(monkeypatch):
    from dual_verification.api import routes

    mock_result = VerificationResult(
        verification_id="ver_api_test",
        generation_id="gen_test",
        document_id="doc_test",
        overall_status=VerificationVerdict.VERIFIED,
        verified_claims=[],
        discrepancies=[],
        pass_rate=1.0
    )

    monkeypatch.setattr(routes.verification_service, "verify", lambda req: mock_result)
    monkeypatch.setattr(routes.verification_service.storage, "get", lambda vid: mock_result if vid == "ver_api_test" else None)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "generation_id": "gen_test",
            "document_id": "doc_test"
        }
        res = await client.post("/verify", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["verification_id"] == "ver_api_test"

        # Test retrieval
        get_res = await client.get("/verify/ver_api_test")
        assert get_res.status_code == 200
        assert get_res.json()["verification_id"] == "ver_api_test"

@pytest.mark.asyncio
async def test_get_verification_not_found_returns_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/verify/ver_non_existent")
        assert res.status_code == 404
