"""Service for extracting, indexing, and querying atomic source claims from extraction results."""
import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Set

from extraction.models.claim_models import (
    AtomicSourceClaim,
    ClaimBank,
    SensitivityLevel,
)
from extraction.models.extraction_models import ExtractionResult

logger = logging.getLogger(__name__)

DEFAULT_CLAIM_STORAGE_DIR = Path(__file__).resolve().parent.parent / "storage" / "claim_banks"

SENSITIVITY_HIERARCHY = {
    SensitivityLevel.PUBLIC: 1,
    SensitivityLevel.INTERNAL: 2,
    SensitivityLevel.CONFIDENTIAL: 3,
    SensitivityLevel.RESTRICTED: 4,
}


class SourceClaimService:
    """Manages the creation, persistence, and filtering of atomic source claim banks."""

    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = Path(storage_dir) if storage_dir else DEFAULT_CLAIM_STORAGE_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self._cache: Dict[str, ClaimBank] = {}

    def _extract_entities(self, text: str) -> List[str]:
        """Extracts critical tokens like figures, currencies, dates, and percentages."""
        pattern = r"\$?\d+(?:,\d+)*(?:\.\d+)?%?[BMKbmk]?"
        tokens = re.findall(pattern, text)
        return list(dict.fromkeys(t for t in tokens if t.strip()))

    def _classify_sensitivity(self, text: str) -> SensitivityLevel:
        """Determines sensitivity classification using heuristic governance markers."""
        lower = text.lower()
        if any(w in lower for w in ["top secret", "secret:", "proprietary", "trade secret"]):
            return SensitivityLevel.RESTRICTED
        if any(w in lower for w in ["confidential", "do not disclose", "privileged", "under nda"]):
            return SensitivityLevel.CONFIDENTIAL
        if any(w in lower for w in ["internal only", "internal use", "not for external", "staff only", "internal:"]):
            return SensitivityLevel.INTERNAL
        return SensitivityLevel.PUBLIC

    def extract_claim_bank(self, extraction: ExtractionResult) -> ClaimBank:
        """Extracts discrete atomic assertions from paragraphs and tables in an ExtractionResult."""
        doc_id = extraction.document_id
        claims: List[AtomicSourceClaim] = []
        claim_counter = 0

        # Map paragraphs to claims
        for p in extraction.content.paragraphs:
            p_id = p.id
            pointer = f"{doc_id}#{p_id}"
            raw_sentences = re.split(r"(?<=[.!?])\s+", p.text.strip())

            for sent in raw_sentences:
                clean_sent = sent.strip()
                if not clean_sent or len(clean_sent) < 5:
                    continue

                entities = self._extract_entities(clean_sent)
                sensitivity = self._classify_sensitivity(clean_sent)

                claims.append(
                    AtomicSourceClaim(
                        claim_id=f"sclaim_{claim_counter:04d}",
                        document_id=doc_id,
                        statement=clean_sent,
                        source_pointer=pointer,
                        confidence=1.0,
                        sensitivity_label=sensitivity,
                        linked_entities=entities,
                    )
                )
                claim_counter += 1

        # Map tables to claims
        for idx, table in enumerate(extraction.content.tables):
            table_pointer = f"{doc_id}#table_{idx}"
            rows = table.cell_values
            if len(rows) >= 2:
                headers = rows[0]
                for row_idx, row in enumerate(rows[1:], start=1):
                    row_desc_parts = [
                        f"{headers[col_idx]}: {cell}"
                        for col_idx, cell in enumerate(row)
                        if col_idx < len(headers) and cell.strip()
                    ]
                    if row_desc_parts:
                        table_statement = f"Table {idx} record: " + ", ".join(row_desc_parts) + "."
                        entities = self._extract_entities(table_statement)
                        sensitivity = self._classify_sensitivity(table_statement)
                        claims.append(
                            AtomicSourceClaim(
                                claim_id=f"sclaim_{claim_counter:04d}",
                                document_id=doc_id,
                                statement=table_statement,
                                source_pointer=table_pointer,
                                confidence=1.0,
                                sensitivity_label=sensitivity,
                                linked_entities=entities,
                            )
                        )
                        claim_counter += 1

        timestamp = datetime.now(timezone.utc).isoformat()
        claim_bank = ClaimBank(
            document_id=doc_id,
            total_claims=len(claims),
            claims=claims,
            extracted_at=timestamp,
        )

        self.save_claim_bank(claim_bank)
        return claim_bank

    def save_claim_bank(self, bank: ClaimBank) -> Path:
        """Persists the claim bank JSON to disk and updates in-memory cache."""
        self._cache[bank.document_id] = bank
        file_path = self.storage_dir / f"{bank.document_id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(bank.model_dump_json(indent=2))
        return file_path

    def get_claim_bank(self, document_id: str) -> Optional[ClaimBank]:
        """Loads a stored claim bank by document_id."""
        if document_id in self._cache:
            return self._cache[document_id]

        file_path = self.storage_dir / f"{document_id}.json"
        if not file_path.exists():
            return None

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            bank = ClaimBank.model_validate(data)
            self._cache[document_id] = bank
            return bank
        except Exception as e:
            logger.error(f"Error loading ClaimBank for {document_id}: {e}")
            return None

    def filter_claims_by_disclosure(
        self,
        claims: List[AtomicSourceClaim],
        max_disclosure_level: SensitivityLevel,
        allowed_claim_ids: Optional[Set[str]] = None,
    ) -> List[AtomicSourceClaim]:
        """Filters claims so none exceed the permitted sensitivity ceiling, and matches explicit whitelists."""
        max_rank = SENSITIVITY_HIERARCHY.get(max_disclosure_level, 1)
        filtered = []
        for claim in claims:
            claim_rank = SENSITIVITY_HIERARCHY.get(claim.sensitivity_label, 1)
            if claim_rank > max_rank:
                continue
            if allowed_claim_ids and claim.claim_id not in allowed_claim_ids:
                continue
            filtered.append(claim)
        return filtered
