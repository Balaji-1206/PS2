"""Domain profiles and operator claim filtering service."""
from typing import Any, Dict, List, Optional, Set
from extraction.models.claim_models import AtomicSourceClaim, SensitivityLevel
from extraction.services.claim_service import SENSITIVITY_HIERARCHY
from generation.models.operator_models import OperatorConfig

DOMAIN_PROFILES: Dict[str, Dict[str, Any]] = {
    "corporate": {
        "name": "corporate",
        "guidelines": [
            "Maintain professional brand voice and investor-grade factual rigor.",
            "Highlight clear business value and measurable operational outcomes.",
            "Avoid speculative forward-looking claims without clear attribution.",
        ],
        "default_tone": "formal_objective",
        "default_audience": "stakeholders",
    },
    "healthcare": {
        "name": "healthcare",
        "guidelines": [
            "Strict claim attribution required for any medical, clinical, or health assertion.",
            "Do not formulate unverified medical advice or diagnostic conclusions.",
            "Explicitly preserve patient safety guidance and health warnings.",
        ],
        "default_tone": "clinical_empathetic",
        "default_audience": "patients_and_practitioners",
    },
    "government": {
        "name": "government",
        "guidelines": [
            "Ensure statutory compliance, public accountability, and transparency.",
            "Use clear, accessible language free of bureaucratic ambiguity.",
            "Cite formal gazette, regulatory, or policy section pointers.",
        ],
        "default_tone": "authoritative_neutral",
        "default_audience": "citizens",
    },
    "disaster_response": {
        "name": "disaster_response",
        "guidelines": [
            "Prioritize actionable life-safety, shelter, and evacuation guidance.",
            "Verify all casualty, shelter capacity, and emergency contact figures strictly.",
            "Express urgent directives clearly without panic-inducing rhetoric.",
        ],
        "default_tone": "urgent_clear",
        "default_audience": "affected_population_and_first_responders",
    },
    "cybersecurity": {
        "name": "cybersecurity",
        "guidelines": [
            "Strictly redact active credentials, private keys, or exploitable payloads.",
            "Provide defensive mitigation steps alongside identified vulnerability facts.",
            "Follow responsible disclosure conventions.",
        ],
        "default_tone": "technical_concise",
        "default_audience": "security_engineers_and_cisos",
    },
}


def get_domain_profile(profile_name: Optional[str] = None) -> Dict[str, Any]:
    """Retrieves domain governance profile or defaults to corporate."""
    if not profile_name or profile_name not in DOMAIN_PROFILES:
        return DOMAIN_PROFILES["corporate"]
    return DOMAIN_PROFILES[profile_name]


def filter_claims_for_operator(
    claims: List[AtomicSourceClaim],
    config: OperatorConfig,
) -> List[AtomicSourceClaim]:
    """
    Implements Subset Selection by enforcing the operator's disclosure ceiling
    and optional explicit claim ID whitelist.
    """
    max_rank = SENSITIVITY_HIERARCHY.get(config.disclosure_level, 1)
    allowed_ids = set(config.selected_claim_ids) if config.selected_claim_ids else None

    permitted: List[AtomicSourceClaim] = []
    for claim in claims:
        claim_rank = SENSITIVITY_HIERARCHY.get(claim.sensitivity_label, 1)
        if claim_rank > max_rank:
            continue
        if allowed_ids and claim.claim_id not in allowed_ids:
            continue
        permitted.append(claim)

    return permitted
