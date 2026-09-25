"""Gate 2 Appropriateness Verifier evaluating disclosure ceiling compliance, PII leakage, and audience suitability."""
import re
from typing import List, Optional, Union
from extraction.models.claim_models import SensitivityLevel
from dual_verification.models.verification_models import (
    AppropriatenessResult,
    AppropriatenessVerdict,
)


class AppropriatenessVerifier:
    """Deterministic governance gate for data disclosure and sensitive content filtering."""

    # PII and Secret Regex Patterns
    PII_PATTERNS = [
        (r"\b\d{4}\s\d{4}\s\d{4}\b", "Aadhaar Identity Number format"),
        (r"\b\d{3}-\d{2}-\d{4}\b", "Social Security Number format"),
        (r"\b[A-Za-z0-9._%+-]+@(?:secret|confidential|internal)\.[A-Za-z]{2,}\b", "Internal restricted email"),
        (r"\b(?:sk_[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|api_key_[a-zA-Z0-9]{12,})\b", "Cryptographic API token / key"),
    ]

    CONFIDENTIAL_PATTERNS = [
        r"\bconfidential\b",
        r"\btrade secret\b",
        r"\btop secret\b",
        r"\bunder nda\b",
        r"\bdo not disclose\b",
        r"\binternal only\b",
    ]

    def verify(
        self,
        statement: str,
        max_disclosure_level: Union[SensitivityLevel, str] = SensitivityLevel.PUBLIC,
        source_evidence: str = "",
        target_audience: str = "general_public",
    ) -> AppropriatenessResult:
        """
        Evaluates a statement against disclosure ceilings, PII/secret patterns, and tone criteria.
        """
        violations: List[str] = []
        disclosure_str = (
            max_disclosure_level.value
            if hasattr(max_disclosure_level, "value")
            else str(max_disclosure_level).upper()
        )

        # 1. PII and Credential Scanning
        for pattern, label in self.PII_PATTERNS:
            if re.search(pattern, statement, re.IGNORECASE):
                violations.append(f"PII / Sensitive Identifier detected ({label})")

        if violations:
            return AppropriatenessResult(
                verdict=AppropriatenessVerdict.PII_FLAGGED,
                passed=False,
                violations=violations,
                confidence=1.0,
            )

        # 2. Disclosure Ceiling Compliance
        if disclosure_str == "PUBLIC":
            for pat in self.CONFIDENTIAL_PATTERNS:
                if re.search(pat, statement, re.IGNORECASE):
                    violations.append(f"Confidential governance marker leaked in PUBLIC content: matched '{pat}'")

        if violations:
            return AppropriatenessResult(
                verdict=AppropriatenessVerdict.DISCLOSURE_VIOLATION,
                passed=False,
                violations=violations,
                confidence=0.95,
            )

        # 3. Audience and Tone Check
        inappropriate_tone_markers = [r"\bunverified rumor\b", r"\bdefinitely guaranteed profit\b"]
        for marker in inappropriate_tone_markers:
            if re.search(marker, statement, re.IGNORECASE):
                violations.append(f"Inappropriate tone / unhedged speculation: '{marker}'")

        if violations:
            return AppropriatenessResult(
                verdict=AppropriatenessVerdict.INAPPROPRIATE_TONE,
                passed=False,
                violations=violations,
                confidence=0.9,
            )

        return AppropriatenessResult(
            verdict=AppropriatenessVerdict.APPROPRIATE,
            passed=True,
            violations=[],
            confidence=1.0,
        )
