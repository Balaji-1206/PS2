import json
from pathlib import Path
from typing import Optional, Dict
from dual_verification.models.verification_models import VerificationResult

DEFAULT_STORAGE_DIR = Path(__file__).resolve().parent.parent / "storage" / "verifications"

class VerificationStorageService:
    """
    Persists and retrieves VerificationResult JSON artifacts with in-memory caching.
    """
    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = Path(storage_dir) if storage_dir else DEFAULT_STORAGE_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self._cache: Dict[str, VerificationResult] = {}

    def save(self, result: VerificationResult) -> Path:
        self._cache[result.verification_id] = result
        file_path = self.storage_dir / f"{result.verification_id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(result.model_dump_json(indent=2))
        return file_path

    def get(self, verification_id: str) -> Optional[VerificationResult]:
        if verification_id in self._cache:
            return self._cache[verification_id]

        file_path = self.storage_dir / f"{verification_id}.json"
        if not file_path.exists():
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            result = VerificationResult.model_validate(data)
            self._cache[verification_id] = result
            return result
