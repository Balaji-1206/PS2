"""End-to-End Governance Lifecycle Integration Test.
Validates the complete governed pipeline across all 6 architectural governance pillars:
1. Source Ingestion -> Atomic Claim Bank Extraction & Sensitivity Classification
2. Operator Configuration & Disclosure Gating (Pre-Generation Subset Selection)
3. Parallel Multi-Channel Rendering (Executive Summary, LinkedIn Post)
4. Dual Verification Gate 1 (Fidelity Grounding) + Gate 2 (Appropriateness & PII Scanning)
5. Sign & Publish Workflow with Cryptographic Hash Resealing
6. Pinpoint Reverse Traceability from Claim to Source Bounding Box
7. Free Prompt Mode with Synthetic Claim Tagging
"""
from pathlib import Path
from unittest.mock import MagicMock, patch
import pytest

from extraction.models.claim_models import SensitivityLevel
from extraction.services.extraction_service import ExtractionService
from extraction.services.storage_service import StorageService as ExtractionStorageService
from extraction.services.claim_service import SourceClaimService
from generation.models.generation_models import GenerationRequest
from generation.models.operator_models import (
    ChannelType,
    MultiChannelGenerationRequest,
    OperatorConfig,
)
from generation.services.domain_profiles import filter_claims_for_operator
from generation.services.generation_service import GenerationService
from dual_verification.models.verification_models import (
    AppropriatenessVerdict,
    VerificationRequest,
    VerificationVerdict,
)
from dual_verification.services.primary_verifier import PrimaryVerifier
from dual_verification.services.verification_service import VerificationService
from provenance.models.provenance_models import ReverseTraceResult
from provenance.services.lineage_builder import verify_record_integrity
from provenance.services.provenance_service import ProvenanceService
from provenance.services.storage_service import ProvenanceStorageService


@pytest.mark.asyncio
async def test_end_to_end_governed_lifecycle(tmp_path: Path):
    ext_dir = tmp_path / "extraction_storage"
    gen_dir = tmp_path / "generation_storage"
    ver_dir = tmp_path / "verification_storage"
    prov_dir = tmp_path / "provenance_storage"
    claim_dir = tmp_path / "claim_storage"

    # =========================================================================
    # Step 1: Ingestion & Atomic Claim Bank Extraction
    # =========================================================================
    ext_storage = ExtractionStorageService(storage_dir=ext_dir)
    ext_service = ExtractionService(storage_service=ext_storage)
    claim_service = SourceClaimService(storage_dir=claim_dir)

    raw_text = (
        "# Clean Energy & Strategy Report\n\n"
        "Global solar installations grew by 35% in 2025 reaching 400 GW capacity.\n\n"
        "CONFIDENTIAL: Internal project codename Project Titan has a restricted budget of $12M."
    )

    extraction_result = await ext_service.extract_text(text=raw_text, source_type="md")
    document_id = extraction_result.document_id
    assert document_id.startswith("doc_")
    assert len(extraction_result.content.paragraphs) >= 2

    # Extract atomic claims with sensitivity classification
    claim_bank = claim_service.extract_claim_bank(extraction_result)
    assert len(claim_bank.claims) >= 2

    public_claims = [c for c in claim_bank.claims if c.sensitivity_label == SensitivityLevel.PUBLIC]
    restricted_claims = [c for c in claim_bank.claims if c.sensitivity_label in (SensitivityLevel.CONFIDENTIAL, SensitivityLevel.RESTRICTED)]
    assert len(public_claims) >= 1
    assert len(restricted_claims) >= 1

    # =========================================================================
    # Step 2: Operator Configuration & Pre-Gen Disclosure Gating
    # =========================================================================
    operator_config = OperatorConfig(
        audience="general_public",
        tone="professional",
        language="en",
        detail_level="standard",
        disclosure_level=SensitivityLevel.PUBLIC,
        domain_profile="corporate",
    )

    permitted_claims = filter_claims_for_operator(claim_bank.claims, operator_config)
    # Ensure restricted claims were gated out
    assert all(c.sensitivity_label == SensitivityLevel.PUBLIC for c in permitted_claims)
    assert len(permitted_claims) == len(public_claims)

    # =========================================================================
    # Step 3: Parallel Multi-Channel Rendering
    # =========================================================================
    mock_workflow = MagicMock()
    # Mock generation output honoring the permitted claim
    permitted_pointer = permitted_claims[0].source_pointer
    mock_workflow.invoke.return_value = {
        "generated_text": f"Solar installations rose 35% in 2025 to 400 GW [{permitted_pointer}].",
        "claims": [
            {
                "claim_id": "c_gen_01",
                "statement": "Solar installations rose 35% in 2025 to 400 GW.",
                "cited_source_pointers": [permitted_pointer],
            }
        ],
    }

    gen_service = GenerationService(
        workflow=mock_workflow,
        storage_dir=gen_dir,
        extraction_storage_dir=ext_dir,
        claim_storage_dir=claim_dir,
    )

    mc_request = MultiChannelGenerationRequest(
        document_id=document_id,
        config=operator_config,
        channels=[ChannelType.EXECUTIVE_SUMMARY, ChannelType.LINKEDIN_POST],
    )
    mc_response = await gen_service.execute_multi_channel(mc_request)

    assert mc_response.status == "success"
    assert ChannelType.EXECUTIVE_SUMMARY.value in mc_response.outputs
    assert ChannelType.LINKEDIN_POST.value in mc_response.outputs
    assert mc_response.disclosure_level == SensitivityLevel.PUBLIC.value
    assert mc_response.used_claim_count == len(permitted_claims)

    # Also generate a single standard generation result for downstream verification
    gen_result = gen_service.execute(
        GenerationRequest(
            document_id=document_id,
            instruction="Draft an executive summary",
        )
    )
    generation_id = gen_result.generation_id

    # =========================================================================
    # Step 4: Dual Verification (Gate 1: Fidelity + Gate 2: Appropriateness)
    # =========================================================================
    mock_primary_verifier = MagicMock(spec=PrimaryVerifier)
    mock_primary_verifier.verify_claim.return_value = (
        VerificationVerdict.VERIFIED,
        0.98,
        "Source confirms solar installations grew 35% to 400 GW.",
    )

    ver_service = VerificationService(
        primary_verifier=mock_primary_verifier,
        storage_dir=ver_dir,
        extraction_storage_dir=ext_dir,
        generation_storage_dir=gen_dir,
    )

    ver_request = VerificationRequest(
        generation_id=generation_id,
        disclosure_level="PUBLIC",
        target_audience="general_public",
    )
    ver_result = ver_service.verify(ver_request)
    verification_id = ver_result.verification_id

    # Gate 1 assertions
    assert ver_result.overall_status == VerificationVerdict.VERIFIED
    assert ver_result.pass_rate == 1.0

    # Gate 2 assertions
    assert ver_result.overall_appropriateness == AppropriatenessVerdict.APPROPRIATE
    assert ver_result.verified_claims[0].appropriateness is not None
    assert ver_result.verified_claims[0].appropriateness.passed is True
    assert ver_result.verified_claims[0].appropriateness.verdict == AppropriatenessVerdict.APPROPRIATE

    # Verify that Gate 2 catches violations if confidential information leaks into generated text
    leak_res = ver_service.appropriateness.verify(
        statement="Project Titan budget is strictly confidential with internal reserve of 12M.",
        source_evidence="Global solar installations grew by 35%.",
        max_disclosure_level="PUBLIC",
    )
    assert leak_res.passed is False
    assert leak_res.verdict == AppropriatenessVerdict.DISCLOSURE_VIOLATION

    # =========================================================================
    # Step 5: Provenance Assembly & Sign & Publish Workflow
    # =========================================================================
    prov_storage = ProvenanceStorageService(storage_dir=prov_dir)
    prov_service = ProvenanceService(storage_service=prov_storage)

    with patch("extraction.services.storage_service.StorageService", return_value=ext_storage), \
         patch("generation.services.storage_service.GenerationStorageService", return_value=gen_service.storage), \
         patch("dual_verification.services.storage_service.VerificationStorageService", return_value=ver_service.storage):
        prov_record = prov_service.build_from_pipeline(verification_id=verification_id)

    assert prov_record.status == "ACTIVE"
    assert prov_record.approver_id is None
    assert verify_record_integrity(prov_record) is True

    # Sign & Publish the manifest
    published_manifest = prov_service.publish_record(
        provenance_id=prov_record.provenance_id,
        approver_id="compliance_director_priya",
        digital_signature="sig_ed25519_tamper_evident_9988",
        disclosure_level="PUBLIC",
    )

    assert published_manifest.status == "PUBLISHED"
    assert published_manifest.approver_id == "compliance_director_priya"
    assert published_manifest.published_at is not None
    assert published_manifest.metadata.get("digital_signature") == "sig_ed25519_tamper_evident_9988"
    # Cryptographic integrity resealed and verifiable
    assert verify_record_integrity(published_manifest) is True

    # =========================================================================
    # Step 6: Pinpoint Reverse Traceability to Source Bounding Box
    # =========================================================================
    with patch("extraction.services.storage_service.StorageService", return_value=ext_storage):
        trace_result: ReverseTraceResult = prov_service.trace_source_pointer(pointer=permitted_pointer)

    assert trace_result is not None
    assert trace_result.document_id == document_id
    assert trace_result.source_pointer == permitted_pointer
    assert trace_result.page is not None
    assert trace_result.reading_order is not None
    assert "solar installations" in trace_result.source_text.lower()

    # Also verify reverse traceability with layout bounding box coordinates
    extraction_result.source_mapping[0].bounding_box = [10.0, 20.0, 300.0, 50.0]
    ext_storage.save(extraction_result)
    with patch("extraction.services.storage_service.StorageService", return_value=ext_storage):
        trace_bbox_result = prov_service.trace_source_pointer(pointer=permitted_pointer)
    assert trace_bbox_result.bounding_box == [10.0, 20.0, 300.0, 50.0]

    # =========================================================================
    # Step 7: Free Prompt Mode (Ungrounded Synthetic Tagging)
    # =========================================================================
    free_prompt_request = GenerationRequest(
        instruction="Generate creative ideas for a clean city without document context",
        allow_free_prompt=True,
    )
    free_result = gen_service.execute(free_prompt_request)
    assert free_result.document_id == "free_prompt"
    assert len(free_result.claims) >= 1
    assert "SYNTHETIC_MODEL_GENERATED" in free_result.claims[0].cited_source_pointers
