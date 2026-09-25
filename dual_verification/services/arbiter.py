from typing import Tuple
from dual_verification.models.verification_models import VerificationVerdict

class VerificationArbiter:
    """
    Arbitrates Primary (LLM NLI) and Secondary (Rule/Entity) verification outputs
    into a definitive governed consensus verdict and confidence score.
    """
    def arbitrate(
        self,
        primary_verdict: VerificationVerdict,
        primary_conf: float,
        secondary_verdict: VerificationVerdict,
        secondary_conf: float
    ) -> Tuple[VerificationVerdict, float, str]:
        # Rule 1: Zero tolerance for contradictions - if either flags contradiction, fail it
        if (
            primary_verdict == VerificationVerdict.CONTRADICTED
            or secondary_verdict == VerificationVerdict.CONTRADICTED
        ):
            avg_conf = round((primary_conf + secondary_conf) / 2.0, 2)
            return (
                VerificationVerdict.CONTRADICTED,
                avg_conf,
                "Contradiction flagged by verification gate. Claim conflicts with source evidence."
            )

        # Rule 2: Both gates verify the claim
        if (
            primary_verdict == VerificationVerdict.VERIFIED
            and secondary_verdict == VerificationVerdict.VERIFIED
        ):
            avg_conf = round((primary_conf + secondary_conf) / 2.0, 2)
            return (
                VerificationVerdict.VERIFIED,
                avg_conf,
                "Consensus reached: both LLM NLI and Entity verification gates passed."
            )

        # Rule 3: Primary verifies, secondary unsupported (e.g. slight paraphrasing)
        if primary_verdict == VerificationVerdict.VERIFIED and primary_conf >= 0.9:
            return (
                VerificationVerdict.VERIFIED,
                round(primary_conf * 0.9, 2),
                "Verified by Primary NLI gate with acceptable semantic paraphrase."
            )

        # Default fallback: Unsupported
        avg_conf = round((primary_conf + secondary_conf) / 2.0, 2)
        return (
            VerificationVerdict.UNSUPPORTED,
            avg_conf,
            "Verification gates could not confirm sufficient grounding in source evidence."
        )
