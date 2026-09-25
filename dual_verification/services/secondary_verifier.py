import re
from typing import Tuple, Set
from dual_verification.models.verification_models import VerificationVerdict

class SecondaryVerifier:
    """
    Deterministic rule-based and entity-level verification gate.
    Cross-checks critical tokens (numbers, dates, currency, percentages)
    and verifies lexical consistency between statement and source evidence.
    """
    def __init__(self):
        pass

    def _extract_numerical_entities(self, text: str) -> Set[str]:
        # Matches numbers, currency ($500M, $100, 20%, 2025, 1.5, etc.)
        pattern = r"\$?\d+(?:,\d+)*(?:\.\d+)?%?[BMKbmk]?"
        tokens = re.findall(pattern, text)
        return {t.lower().replace(",", "") for t in tokens if t.strip()}

    def verify(
        self,
        statement: str,
        source_evidence: str
    ) -> Tuple[VerificationVerdict, float, str]:
        if not source_evidence.strip():
            return VerificationVerdict.UNSUPPORTED, 0.0, "Source evidence is missing or empty."

        statement_nums = self._extract_numerical_entities(statement)
        source_nums = self._extract_numerical_entities(source_evidence)

        # Check for ungrounded numerical claims
        missing_nums = statement_nums - source_nums
        if missing_nums:
            return (
                VerificationVerdict.CONTRADICTED,
                0.85,
                f"Numerical entities in claim not found in source text: {list(missing_nums)}"
            )

        # Lexical word overlap check
        def get_words(t: str) -> Set[str]:
            return set(re.findall(r"\b[a-zA-Z]{3,}\b", t.lower()))

        stmt_words = get_words(statement)
        src_words = get_words(source_evidence)

        if not stmt_words:
            return VerificationVerdict.VERIFIED, 1.0, "No complex lexical entities to verify."

        overlap = stmt_words.intersection(src_words)
        overlap_ratio = len(overlap) / len(stmt_words)

        if overlap_ratio >= 0.4:
            return (
                VerificationVerdict.VERIFIED,
                round(min(1.0, 0.7 + overlap_ratio * 0.3), 2),
                f"Lexical overlap confirmed ({overlap_ratio:.1%}). Entity numbers match."
            )
        else:
            return (
                VerificationVerdict.UNSUPPORTED,
                0.6,
                f"Low lexical overlap ({overlap_ratio:.1%}) between claim and source block."
            )
