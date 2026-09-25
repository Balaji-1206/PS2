from dual_verification.services.secondary_verifier import SecondaryVerifier
from dual_verification.models.verification_models import VerificationVerdict

def test_secondary_verifier_exact_numbers_match():
    verifier = SecondaryVerifier()
    # Number matches
    verdict, conf, details = verifier.verify(
        statement="Total revenue was $500M in 2025.",
        source_evidence="In 2025, revenue was $500M."
    )
    assert verdict == VerificationVerdict.VERIFIED
    assert conf >= 0.9

def test_secondary_verifier_number_mismatch():
    verifier = SecondaryVerifier()
    # Statement claims $700M but source only mentions $500M
    verdict, conf, details = verifier.verify(
        statement="Total revenue was $700M.",
        source_evidence="Total revenue was $500M."
    )
    assert verdict == VerificationVerdict.CONTRADICTED
    assert "700" in details

def test_secondary_verifier_empty_evidence():
    verifier = SecondaryVerifier()
    verdict, conf, details = verifier.verify(
        statement="Any statement.",
        source_evidence=""
    )
    assert verdict == VerificationVerdict.UNSUPPORTED
