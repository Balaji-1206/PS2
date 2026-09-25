from unittest.mock import MagicMock
from dual_verification.services.primary_verifier import PrimaryVerifier
from dual_verification.models.verification_models import VerificationVerdict

def test_primary_verifier_verified():
    mock_ollama = MagicMock()
    mock_ollama.generate.return_value = "VERDICT: VERIFIED\nREASONING: The source text directly states revenue was $500M."
    verifier = PrimaryVerifier(ollama_client=mock_ollama)

    verdict, conf, reasoning = verifier.verify_claim(
        statement="Company revenue was $500M.",
        source_evidence="In FY25, company revenue was $500M."
    )
    assert verdict == VerificationVerdict.VERIFIED
    assert conf >= 0.9
    assert "revenue was $500M" in reasoning

def test_primary_verifier_contradicted():
    mock_ollama = MagicMock()
    mock_ollama.generate.return_value = "VERDICT: CONTRADICTED\nREASONING: The source text states revenue fell, not grew."
    verifier = PrimaryVerifier(ollama_client=mock_ollama)

    verdict, conf, reasoning = verifier.verify_claim(
        statement="Company revenue increased by 50%.",
        source_evidence="Revenue fell by 10% during the year."
    )
    assert verdict == VerificationVerdict.CONTRADICTED
    assert conf >= 0.9

def test_primary_verifier_unsupported():
    mock_ollama = MagicMock()
    mock_ollama.generate.return_value = "VERDICT: UNSUPPORTED\nREASONING: Source does not mention profits."
    verifier = PrimaryVerifier(ollama_client=mock_ollama)

    verdict, conf, reasoning = verifier.verify_claim(
        statement="Net profit reached $100M.",
        source_evidence="We opened two new stores in Europe."
    )
    assert verdict == VerificationVerdict.UNSUPPORTED
