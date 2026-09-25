from pathlib import Path
from generation.services.storage_service import GenerationStorageService
from generation.models.generation_models import GenerationResult, GenerationMetadata

def test_generation_storage(tmp_path: Path):
    storage = GenerationStorageService(storage_dir=tmp_path)
    result = GenerationResult(
        generation_id="gen_stored_1",
        document_id="doc_1",
        instruction="Transform",
        generated_text="Content",
        claims=[],
        metadata=GenerationMetadata()
    )
    saved_path = storage.save(result)
    assert saved_path.exists()

    retrieved = storage.get("gen_stored_1")
    assert retrieved is not None
    assert retrieved.generation_id == "gen_stored_1"
    assert retrieved.document_id == "doc_1"

def test_generation_storage_not_found(tmp_path: Path):
    storage = GenerationStorageService(storage_dir=tmp_path)
    assert storage.get("non_existent_gen") is None
