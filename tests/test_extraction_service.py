import pytest
from pathlib import Path
from unittest.mock import MagicMock
from extraction.services.extraction_service import ExtractionService
from extraction.services.storage_service import StorageService
from extraction.models.extraction_models import ExtractedContent

@pytest.mark.asyncio
async def test_extraction_service_with_text(tmp_path: Path):
    storage = StorageService(storage_dir=tmp_path)
    service = ExtractionService(storage_service=storage)

    result = await service.extract_text(
        text="# Title\nFirst paragraph.",
        source_type="md"
    )
    assert result.document_id.startswith("doc_")
    assert result.source_type == "md"
    assert len(result.content.hierarchy) == 1
    assert len(result.content.paragraphs) == 1
    assert storage.get(result.document_id) is not None

@pytest.mark.asyncio
async def test_extraction_service_with_file_text(tmp_path: Path):
    storage = StorageService(storage_dir=tmp_path)
    service = ExtractionService(storage_service=storage)

    result = await service.extract_file(
        filename="test.txt",
        content_bytes=b"Hello plain text"
    )
    assert result.source_type == "txt"
    assert len(result.content.paragraphs) == 1
    assert result.content.paragraphs[0].text == "Hello plain text"

@pytest.mark.asyncio
async def test_extraction_service_with_binary_docling(tmp_path: Path):
    storage = StorageService(storage_dir=tmp_path)
    mock_docling = MagicMock()
    mock_docling.convert.return_value = (ExtractedContent(), [], 3)
    service = ExtractionService(storage_service=storage, docling_processor=mock_docling)

    result = await service.extract_file(
        filename="report.pdf",
        content_bytes=b"%PDF-1.4 mock pdf data"
    )
    assert result.source_type == "pdf"
    assert result.metadata.pages == 3
    mock_docling.convert.assert_called_once()
