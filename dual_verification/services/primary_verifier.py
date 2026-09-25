import re
from typing import Tuple, Optional
from dual_verification.models.verification_models import VerificationVerdict
from generation.services.ollama_client import OllamaClient

class PrimaryVerifier:
    """
    Primary LLM-based Natural Language Inference (NLI) Verifier.
    Uses qwen3:8b via Ollama to determine if source evidence entails,
    contradicts, or fails to support a given claim statement.
    """
    def __init__(self, ollama_client: Optional[OllamaClient] = None):
        import os
        verify_timeout = float(os.getenv("OLLAMA_VERIFY_TIMEOUT", "12.0"))
        self.ollama = ollama_client or OllamaClient(timeout=verify_timeout)

    def verify_claim(
        self,
        statement: str,
        source_evidence: str
    ) -> Tuple[VerificationVerdict, float, str]:
        if not source_evidence.strip():
            return VerificationVerdict.UNSUPPORTED, 0.0, "No source evidence found for cited pointers."


        system_prompt = (
            "You are a rigorous Natural Language Inference (NLI) Fact-Checking Engine.\n"
            "Analyze whether the CLAIM is strictly supported by the SOURCE EVIDENCE.\n"
            "Respond in the exact format:\n"
            "VERDICT: [VERIFIED | CONTRADICTED | UNSUPPORTED]\n"
            "CONFIDENCE: [0.0 - 1.0]\n"
            "REASONING: [Brief explanation]"
        )

        user_prompt = (
            f"SOURCE EVIDENCE:\n{source_evidence}\n\n"
            f"CLAIM STATEMENT:\n{statement}\n\n"
            "NLI EVALUATION:"
        )

        response = self.ollama.generate(prompt=user_prompt, system=system_prompt)

        # Parse verdict
        verdict = VerificationVerdict.UNSUPPORTED
        if "VERDICT: VERIFIED" in response or "VERDICT: [VERIFIED]" in response or "VERIFIED" in response[:30]:
            verdict = VerificationVerdict.VERIFIED
        elif "VERDICT: CONTRADICTED" in response or "VERDICT: [CONTRADICTED]" in response or "CONTRADICTED" in response[:30]:
            verdict = VerificationVerdict.CONTRADICTED
        elif "VERDICT: UNSUPPORTED" in response or "VERDICT: [UNSUPPORTED]" in response or "UNSUPPORTED" in response[:30]:
            verdict = VerificationVerdict.UNSUPPORTED

        # Parse confidence
        conf_match = re.search(r"CONFIDENCE:\s*([0-1](?:\.\d+)?)", response)
        confidence = float(conf_match.group(1)) if conf_match else (0.95 if verdict != VerificationVerdict.UNSUPPORTED else 0.5)

        # Parse reasoning
        reasoning_match = re.search(r"REASONING:\s*(.*)", response, re.DOTALL)
        reasoning = reasoning_match.group(1).strip() if reasoning_match else response

        return verdict, confidence, reasoning
