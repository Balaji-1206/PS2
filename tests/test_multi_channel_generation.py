from pathlib import Path
from unittest.mock import MagicMock
import pytest

from extraction.models.claim_models import AtomicSourceClaim, ClaimBank, SensitivityLevel
from extraction.services.claim_service import SourceClaimService
from generation.models.operator_models import ChannelType, OperatorConfig
from generation.api.schemas import (
    MultiChannelGenerationRequest,
    MultiChannelGenerationResponse,
)
from generation.services.generation_service import GenerationService


def test_free_prompt_mode_generation(tmp_path: Path):
    mock_workflow = MagicMock()
    mock_workflow.invoke.return_value = {
        "generated_text": "AI generated advisory without source.",
        "claims": [{"claim_id": "c1", "statement": "AI generated advisory", "cited_source_pointers": []}],
    }

    service = GenerationService(
        workflow=mock_workflow,
        storage_dir=tmp_path / "gen",
    )

    from generation.models.generation_models import GenerationRequest

    req = GenerationRequest(
        instruction="Draft open advisory on cybersecurity",
        allow_free_prompt=True,
    )
    result = service.execute(req)
    assert result.generation_id.startswith("gen_")
    assert result.document_id == "free_prompt"
    assert len(result.claims) >= 1
    # Check synthetic tagging in free prompt mode
    assert result.claims[0].cited_source_pointers == ["SYNTHETIC_MODEL_GENERATED"]


@pytest.mark.asyncio
async def test_multi_channel_generation_with_claim_bank(tmp_path: Path):
    claims_dir = tmp_path / "claim_banks"
    claim_service = SourceClaimService(storage_dir=claims_dir)

    # Pre-populate claim bank
    bank = ClaimBank(
        document_id="doc_multi_test",
        total_claims=3,
        claims=[
            AtomicSourceClaim(
                claim_id="c1",
                document_id="doc_multi_test",
                statement="Revenue expanded by 20%.",
                source_pointer="doc_multi_test#p_0",
                sensitivity_label=SensitivityLevel.PUBLIC,
            ),
            AtomicSourceClaim(
                claim_id="c2",
                document_id="doc_multi_test",
                statement="Customer satisfaction index hit 94%.",
                source_pointer="doc_multi_test#p_1",
                sensitivity_label=SensitivityLevel.PUBLIC,
            ),
            AtomicSourceClaim(
                claim_id="c3",
                document_id="doc_multi_test",
                statement="Secret merger talks ongoing.",
                source_pointer="doc_multi_test#p_2",
                sensitivity_label=SensitivityLevel.CONFIDENTIAL,
            ),
        ],
        extracted_at="2026-09-25T12:00:00Z",
    )
    claim_service.save_claim_bank(bank)

    mock_workflow = MagicMock()
    mock_workflow.invoke.side_effect = lambda state: {
        "generated_text": f"Channel output for {state['instruction']} [doc_multi_test#p_0]",
        "claims": [
            {
                "claim_id": "claim_0",
                "statement": "Revenue expanded by 20%.",
                "cited_source_pointers": ["doc_multi_test#p_0"],
            }
        ],
    }

    service = GenerationService(
        workflow=mock_workflow,
        storage_dir=tmp_path / "gen",
        claim_storage_dir=claims_dir,
    )

    request = MultiChannelGenerationRequest(
        document_id="doc_multi_test",
        config=OperatorConfig(
            disclosure_level=SensitivityLevel.PUBLIC,
            domain_profile="corporate",
        ),
        channels=[
            ChannelType.EXECUTIVE_SUMMARY,
            ChannelType.LINKEDIN_POST,
            ChannelType.TWITTER_POST,
        ],
    )

    response = await service.execute_multi_channel(request)
    assert response.status == "success"
    assert response.document_id == "doc_multi_test"
    assert len(response.outputs) == 3
    assert ChannelType.EXECUTIVE_SUMMARY in response.outputs
    assert ChannelType.LINKEDIN_POST in response.outputs
    assert ChannelType.TWITTER_POST in response.outputs
    assert response.used_claim_count == 2  # c1 and c2 are PUBLIC; c3 was filtered out!
