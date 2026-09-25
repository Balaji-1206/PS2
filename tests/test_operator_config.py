import pytest
from extraction.models.claim_models import AtomicSourceClaim, SensitivityLevel
from generation.models.operator_models import ChannelType, OperatorConfig
from generation.services.domain_profiles import (
    get_domain_profile,
    filter_claims_for_operator,
    DOMAIN_PROFILES,
)


def test_operator_config_defaults():
    config = OperatorConfig()
    assert config.audience == "general_public"
    assert config.tone == "formal_objective"
    assert config.language == "en"
    assert config.disclosure_level == SensitivityLevel.PUBLIC
    assert config.domain_profile == "corporate"


def test_domain_profiles_registry():
    profiles = ["corporate", "healthcare", "government", "disaster_response", "cybersecurity"]
    for p in profiles:
        prof = get_domain_profile(p)
        assert prof["name"] == p
        assert len(prof["guidelines"]) >= 1

    # Fallback for unknown profile
    unknown = get_domain_profile("unknown_specialty")
    assert unknown["name"] == "corporate"


def test_filter_claims_for_operator_by_disclosure():
    claims = [
        AtomicSourceClaim(
            claim_id="c1",
            document_id="doc1",
            statement="Public press release",
            source_pointer="doc1#p_0",
            sensitivity_label=SensitivityLevel.PUBLIC,
        ),
        AtomicSourceClaim(
            claim_id="c2",
            document_id="doc1",
            statement="Internal roadmap targets",
            source_pointer="doc1#p_1",
            sensitivity_label=SensitivityLevel.INTERNAL,
        ),
        AtomicSourceClaim(
            claim_id="c3",
            document_id="doc1",
            statement="Confidential salary brackets",
            source_pointer="doc1#p_2",
            sensitivity_label=SensitivityLevel.CONFIDENTIAL,
        ),
    ]

    # Operator configured with PUBLIC disclosure ceiling
    pub_config = OperatorConfig(disclosure_level=SensitivityLevel.PUBLIC)
    permitted_pub = filter_claims_for_operator(claims, pub_config)
    assert len(permitted_pub) == 1
    assert permitted_pub[0].claim_id == "c1"

    # Operator configured with INTERNAL disclosure ceiling
    int_config = OperatorConfig(disclosure_level=SensitivityLevel.INTERNAL)
    permitted_int = filter_claims_for_operator(claims, int_config)
    assert len(permitted_int) == 2
    assert {c.claim_id for c in permitted_int} == {"c1", "c2"}

    # Operator configured with specific whitelist IDs
    sel_config = OperatorConfig(
        disclosure_level=SensitivityLevel.INTERNAL,
        selected_claim_ids=["c2"],
    )
    permitted_sel = filter_claims_for_operator(claims, sel_config)
    assert len(permitted_sel) == 1
    assert permitted_sel[0].claim_id == "c2"
