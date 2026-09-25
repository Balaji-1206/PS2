import pytest
from pathlib import Path
from extraction.services.storage_service import StorageService
from extraction.models.extraction_models import (
    ExtractionResult,
    DocumentMetadata,
    ExtractedContent
)

def test_storage_save_and_retrieve(tmp_path: Path):
    storage = StorageService(storage_dir=tmp_path)
    result = ExtractionResult(
        document_id="doc_storage_test",
        source_type="txt",
        metadata=DocumentMetadata(filename="test.txt", pages=1),
        content=ExtractedContent(),
        source_mapping=[]
    )
    saved_path = storage.save(result)
    assert saved_path.exists()

    retrieved = storage.get("doc_storage_test")
    assert retrieved is not None
    assert retrieved.document_id == "doc_storage_test"
    assert retrieved.source_type == "txt"

def test_storage_not_found(tmp_path: Path):
    storage = StorageService(storage_dir=tmp_path)
    assert storage.get("non_existent_doc") is None
