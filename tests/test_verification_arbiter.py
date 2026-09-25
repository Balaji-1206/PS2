from dual_verification.services.arbiter import VerificationArbiter
from dual_verification.models.verification_models import VerificationVerdict

def test_arbiter_both_agree_verified():
    arbiter = VerificationArbiter()
    final_v, conf, note = arbiter.arbitrate(
        primary_verdict=VerificationVerdict.VERIFIED,
        primary_conf=0.95,
        secondary_verdict=VerificationVerdict.VERIFIED,
        secondary_conf=0.90
    )
    assert final_v == VerificationVerdict.VERIFIED
    assert conf >= 0.90
    assert "Consensus reached" in note

def test_arbiter_either_contradicts_triggers_contradicted():
    arbiter = VerificationArbiter()
    final_v, conf, note = arbiter.arbitrate(
        primary_verdict=VerificationVerdict.VERIFIED,
        primary_conf=0.90,
        secondary_verdict=VerificationVerdict.CONTRADICTED,
        secondary_conf=0.85
    )
    assert final_v == VerificationVerdict.CONTRADICTED
    assert "Contradiction flagged" in note

def test_arbiter_unsupported_when_neither_verifies():
    arbiter = VerificationArbiter()
    final_v, conf, note = arbiter.arbitrate(
        primary_verdict=VerificationVerdict.UNSUPPORTED,
        primary_conf=0.5,
        secondary_verdict=VerificationVerdict.UNSUPPORTED,
        secondary_conf=0.6
    )
    assert final_v == VerificationVerdict.UNSUPPORTED
