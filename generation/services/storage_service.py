import json
from pathlib import Path
from typing import Optional, Dict
from generation.models.generation_models import GenerationResult

DEFAULT_STORAGE_DIR = Path(__file__).resolve().parent.parent / "storage" / "generated_content"

class GenerationStorageService:
    """
    Persists and retrieves GenerationResult JSON artifacts with in-memory cache.
    """
    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = Path(storage_dir) if storage_dir else DEFAULT_STORAGE_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self._cache: Dict[str, GenerationResult] = {}

    def save(self, result: GenerationResult) -> Path:
        self._cache[result.generation_id] = result
        file_path = self.storage_dir / f"{result.generation_id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(result.model_dump_json(indent=2))
        return file_path

    def get(self, generation_id: str) -> Optional[GenerationResult]:
        if generation_id in self._cache:
            return self._cache[generation_id]

        file_path = self.storage_dir / f"{generation_id}.json"
        if not file_path.exists():
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            result = GenerationResult.model_validate(data)
            self._cache[generation_id] = result
            return result
