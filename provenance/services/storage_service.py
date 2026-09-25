"""Storage service for persisting and retrieving Provenance Records."""
import json
import logging
from pathlib import Path
from typing import List, Optional

from provenance.models.provenance_models import ProvenanceRecord

logger = logging.getLogger(__name__)

DEFAULT_PROVENANCE_STORAGE_DIR = Path(__file__).resolve().parent.parent / "storage" / "records"


class ProvenanceStorageService:
    """Handles filesystem persistence for immutable provenance manifests."""

    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = Path(storage_dir) if storage_dir else DEFAULT_PROVENANCE_STORAGE_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def save_record(self, record: ProvenanceRecord) -> Path:
        """Saves a ProvenanceRecord to a JSON file identified by its provenance_id."""
        file_path = self.storage_dir / f"{record.provenance_id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(record.model_dump_json(indent=2))
        logger.info(f"Saved ProvenanceRecord {record.provenance_id} to {file_path}")
        return file_path

    def get_record(self, provenance_id: str) -> Optional[ProvenanceRecord]:
        """Loads a ProvenanceRecord by ID if present on disk."""
        file_path = self.storage_dir / f"{provenance_id}.json"
        if not file_path.exists():
            return None
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return ProvenanceRecord.model_validate(data)
        except Exception as e:
            logger.error(f"Error loading ProvenanceRecord {provenance_id}: {e}")
            return None

    def list_records(self) -> List[str]:
        """Returns a list of all stored provenance record IDs."""
        if not self.storage_dir.exists():
            return []
        records = []
        for file in self.storage_dir.glob("*.json"):
            records.append(file.stem)
        return sorted(records)

    def find_by_document_id(self, document_id: str) -> List[ProvenanceRecord]:
        """Scans records to find all transformation manifests associated with a given document_id."""
        matches: List[ProvenanceRecord] = []
        for record_id in self.list_records():
            record = self.get_record(record_id)
            if not record:
                continue
            doc_id_in_source = record.source_node and record.source_node.document_id == document_id
            doc_id_in_ext = record.extraction_node and record.extraction_node.document_id == document_id
            doc_id_in_gen = record.generation_node and record.generation_node.document_id == document_id

            if doc_id_in_source or doc_id_in_ext or doc_id_in_gen:
                matches.append(record)
        return matches
