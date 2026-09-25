import json
from pathlib import Path
from unittest.mock import MagicMock
from dual_verification.services.verification_service import VerificationService
from dual_verification.models.verification_models import (
    VerificationRequest,
    VerificationVerdict,
)

def test_verification_service_with_direct_claims(tmp_path: Path):
    mock_primary = MagicMock()
    mock_primary.verify_claim.return_value = (VerificationVerdict.VERIFIED, 0.95, "Supported")
    mock_secondary = MagicMock()
    mock_secondary.verify.return_value = (VerificationVerdict.VERIFIED, 0.90, "Matched numbers")

    service = VerificationService(
        primary_verifier=mock_primary,
        secondary_verifier=mock_secondary,
        storage_dir=tmp_path / "verifications"
    )

    request = VerificationRequest(
        generation_id="gen_101",
        document_id="doc_101",
        claims=[
            {
                "claim_id": "claim_0",
                "statement": "Revenue was $500M.",
                "cited_source_pointers": ["doc_101#p_0"]
            }
        ],
        source_content={
            "content": {
                "paragraphs": [{"id": "p_0", "text": "In 2025, revenue was $500M."}]
            }
        }
    )

    result = service.verify(request)
    assert result.verification_id.startswith("ver_")
    assert result.overall_status == VerificationVerdict.VERIFIED
    assert len(result.verified_claims) == 1
    assert result.pass_rate == 1.0
    assert service.storage.get(result.verification_id) is not None

def test_verification_service_with_storage_lookups(tmp_path: Path):
    # Setup mock extraction file
    ext_dir = tmp_path / "extraction_storage"
    ext_dir.mkdir()
    with open(ext_dir / "doc_test.json", "w") as f:
        json.dump({
            "document_id": "doc_test",
            "content": {"paragraphs": [{"id": "p_0", "text": "Net income rose 10%."}]}
        }, f)

    # Setup mock generation file
    gen_dir = tmp_path / "generation_storage"
    gen_dir.mkdir()
    with open(gen_dir / "gen_test.json", "w") as f:
        json.dump({
            "generation_id": "gen_test",
            "document_id": "doc_test",
            "claims": [
                {
                    "claim_id": "claim_0",
                    "statement": "Net income rose 10%.",
                    "cited_source_pointers": ["doc_test#p_0"]
                }
            ]
        }, f)

    mock_primary = MagicMock()
    mock_primary.verify_claim.return_value = (VerificationVerdict.VERIFIED, 0.95, "Supported")

    service = VerificationService(
        primary_verifier=mock_primary,
        storage_dir=tmp_path / "ver_storage",
        extraction_storage_dir=ext_dir,
        generation_storage_dir=gen_dir
    )

    request = VerificationRequest(generation_id="gen_test")
    result = service.verify(request)
    assert result.document_id == "doc_test"
    assert result.overall_status == VerificationVerdict.VERIFIED
