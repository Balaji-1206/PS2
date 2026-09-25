from datetime import datetime, timezone
from dual_verification.models.verification_models import (
    VerificationVerdict,
    ClaimVerificationResult,
    VerificationRequest,
    VerificationResult,
    VerificationResponse
)

def test_verification_models_serialization():
    claim_res = ClaimVerificationResult(
        claim_id="claim_0",
        statement="Revenue was $500M.",
        cited_source_pointers=["doc_123#p_0"],
        primary_verdict=VerificationVerdict.VERIFIED,
        secondary_verdict=VerificationVerdict.VERIFIED,
        final_verdict=VerificationVerdict.VERIFIED,
        confidence=0.98,
        reasoning="Exact match in source text."
    )
    res = VerificationResult(
        verification_id="ver_001",
        generation_id="gen_001",
        document_id="doc_123",
        overall_status=VerificationVerdict.VERIFIED,
        verified_claims=[claim_res],
        discrepancies=[],
        pass_rate=1.0,
        verified_at=datetime.now(timezone.utc)
    )
    dumped = res.model_dump(mode="json")
    assert dumped["verification_id"] == "ver_001"
    assert dumped["verified_claims"][0]["final_verdict"] == "VERIFIED"
    assert dumped["pass_rate"] == 1.0

def test_verification_request_validation():
    req = VerificationRequest(
        generation_id="gen_001",
        document_id="doc_123"
    )
    assert req.generation_id == "gen_001"
