import pytest
from httpx import AsyncClient, ASGITransport
from generation.main import app

@pytest.mark.asyncio
async def test_generation_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_generate_missing_instruction_returns_422():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/generate", json={"document_id": "doc_123"})
        assert res.status_code == 422

@pytest.mark.asyncio
async def test_generate_missing_document_returns_400():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/generate", json={"instruction": "Summarize"})
        assert res.status_code == 400
        assert "document_id" in res.json()["message"].lower()

@pytest.mark.asyncio
async def test_generate_with_direct_extraction_payload(monkeypatch):
    from generation.api import routes
    from generation.models.generation_models import GenerationResult, GenerationMetadata

    mock_result = GenerationResult(
        generation_id="gen_api_test",
        document_id="doc_api_test",
        instruction="Brief summary",
        generated_text="Statement [doc_api_test#p_0]",
        claims=[],
        metadata=GenerationMetadata(model="qwen3:8b", claim_count=0)
    )

    monkeypatch.setattr(routes.generation_service, "execute", lambda req: mock_result)
    monkeypatch.setattr(routes.generation_service.storage, "get", lambda gen_id: mock_result if gen_id == "gen_api_test" else None)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "document_id": "doc_api_test",
            "extraction_data": {"content": {"paragraphs": [{"id": "p_0", "text": "Text"}]}},
            "instruction": "Brief summary"
        }
        res = await client.post("/generate", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["generation_id"] == "gen_api_test"

        # Test retrieval
        get_res = await client.get("/generate/gen_api_test")
        assert get_res.status_code == 200
        assert get_res.json()["generation_id"] == "gen_api_test"

@pytest.mark.asyncio
async def test_get_generation_not_found_returns_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/generate/gen_non_existent")
        assert res.status_code == 404
        assert "not found" in res.json()["message"].lower()
