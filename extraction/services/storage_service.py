import json
from pathlib import Path
from typing import Optional, Dict
from extraction.models.extraction_models import ExtractionResult

DEFAULT_STORAGE_DIR = Path(__file__).resolve().parent.parent / "storage" / "extracted_json"

class StorageService:
    """
    Manages filesystem persistence and retrieval of extracted document JSON artifacts
    with an in-memory index cache.
    """
    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = Path(storage_dir) if storage_dir else DEFAULT_STORAGE_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self._cache: Dict[str, ExtractionResult] = {}

    def save(self, result: ExtractionResult) -> Path:
        self._cache[result.document_id] = result
        file_path = self.storage_dir / f"{result.document_id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(result.model_dump_json(indent=2))
        return file_path

    def get(self, document_id: str) -> Optional[ExtractionResult]:
        if document_id in self._cache:
            return self._cache[document_id]

        file_path = self.storage_dir / f"{document_id}.json"
        if not file_path.exists():
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            result = ExtractionResult.model_validate(data)
            self._cache[document_id] = result
            return result
