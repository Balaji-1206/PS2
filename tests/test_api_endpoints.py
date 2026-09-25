import pytest
from httpx import AsyncClient, ASGITransport
from extraction.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_extract_text_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/extract", data={"text": "# Heading\nParagraph content"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        doc_id = data["document_id"]
        assert doc_id.startswith("doc_")

        # Retrieve
        get_res = await client.get(f"/extract/{doc_id}")
        assert get_res.status_code == 200
        retrieved = get_res.json()
        assert retrieved["document_id"] == doc_id
        assert retrieved["content"]["paragraphs"][0]["text"] == "Paragraph content"

@pytest.mark.asyncio
async def test_extract_missing_inputs_returns_400():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/extract", data={})
        assert res.status_code == 400
        assert "message" in res.json()

@pytest.mark.asyncio
async def test_extract_not_found_returns_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/extract/doc_non_existent")
        assert res.status_code == 404
        assert "not found" in res.json()["message"].lower()

@pytest.mark.asyncio
async def test_extract_file_upload_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        files = {"file": ("sample.txt", b"# Title in File\nFile body content.", "text/plain")}
        res = await client.post("/extract", files=files)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["source_type"] == "txt"
        assert data["data"]["metadata"]["filename"] == "sample.txt"
