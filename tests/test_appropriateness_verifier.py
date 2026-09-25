import pytest
from extraction.models.claim_models import SensitivityLevel
from dual_verification.models.verification_models import AppropriatenessVerdict
from dual_verification.services.appropriateness_verifier import AppropriatenessVerifier


def test_appropriateness_verifier_clean_statement():
    verifier = AppropriatenessVerifier()
    res = verifier.verify(
        statement="City public transport schedules will operate normally during holidays.",
        max_disclosure_level=SensitivityLevel.PUBLIC,
        source_evidence="Public transport operates normally on public holidays.",
    )
    assert res.verdict == AppropriatenessVerdict.APPROPRIATE
    assert res.passed is True
    assert len(res.violations) == 0


def test_appropriateness_verifier_pii_detection():
    verifier = AppropriatenessVerifier()
    # Test Aadhaar pattern
    res = verifier.verify(
        statement="Citizen verified with identity 1234 5678 9012.",
        max_disclosure_level=SensitivityLevel.PUBLIC,
    )
    assert res.verdict == AppropriatenessVerdict.PII_FLAGGED
    assert res.passed is False
    assert any("Identity" in v or "PII" in v for v in res.violations)


def test_appropriateness_verifier_disclosure_violation():
    verifier = AppropriatenessVerifier()
    # Leaking confidential keyword when disclosure ceiling is PUBLIC
    res = verifier.verify(
        statement="The confidential trade secret formula was disclosed to partners.",
        max_disclosure_level=SensitivityLevel.PUBLIC,
    )
    assert res.verdict == AppropriatenessVerdict.DISCLOSURE_VIOLATION
    assert res.passed is False
    assert any("Disclosure" in v or "Confidential" in v for v in res.violations)
