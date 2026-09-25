"""End-to-End integration test validating the entire Governed Content Transformation backend pipeline:
Extraction -> Generation -> Dual Verification -> Provenance.
"""
from pathlib import Path
from unittest.mock import MagicMock
import pytest

from extraction.services.extraction_service import ExtractionService
from extraction.services.storage_service import StorageService as ExtractionStorageService
from generation.services.generation_service import GenerationService
from generation.models.generation_models import GenerationRequest
from dual_verification.services.verification_service import VerificationService
from dual_verification.models.verification_models import VerificationRequest, VerificationVerdict
from dual_verification.services.primary_verifier import PrimaryVerifier
from dual_verification.services.storage_service import VerificationStorageService
from provenance.services.provenance_service import ProvenanceService
from provenance.services.storage_service import ProvenanceStorageService
from provenance.services.lineage_builder import verify_record_integrity


@pytest.mark.asyncio
async def test_full_governed_backend_pipeline(tmp_path: Path):
    """
    Validates that the entire backend operates seamlessly across all 4 stages:
    1. Extraction Layer parses and indexes raw text with source mappings.
    2. Generation Layer ingests extraction output, producing claims with pointers.
    3. Dual Verification Layer checks generated claims against source evidence.
    4. Provenance Layer builds an immutable, cryptographically sealed audit trail.
    """
    ext_dir = tmp_path / "extraction_storage"
    gen_dir = tmp_path / "generation_storage"
    ver_dir = tmp_path / "verification_storage"
    prov_dir = tmp_path / "provenance_storage"

    # =========================================================================
    # Stage 1: Extraction Layer
    # =========================================================================
    ext_storage = ExtractionStorageService(storage_dir=ext_dir)
    ext_service = ExtractionService(storage_service=ext_storage)

    raw_document_text = (
        "# City Budget Report 2026\n\n"
        "The municipal infrastructure budget increased by 15 percent to 45 million dollars in 2026."
    )
    extraction_result = await ext_service.extract_text(
        text=raw_document_text,
        source_type="md",
    )
    document_id = extraction_result.document_id
    assert document_id.startswith("doc_")
    assert len(extraction_result.content.paragraphs) >= 1
    stored_doc = ext_storage.get(document_id)
    assert stored_doc is not None
    assert stored_doc.document_id == document_id

    # The paragraph id
    para_id = extraction_result.content.paragraphs[0].id
    source_pointer = f"{document_id}#{para_id}"

    # =========================================================================
    # Stage 2: Generation Layer
    # =========================================================================
    mock_workflow = MagicMock()
    mock_workflow.invoke.return_value = {
        "generated_text": f"The infrastructure budget reached 45 million dollars in 2026 [{source_pointer}].",
        "claims": [
            {
                "claim_id": "claim_budget_01",
                "statement": "The infrastructure budget reached 45 million dollars in 2026.",
                "cited_source_pointers": [source_pointer],
            }
        ],
    }

    gen_service = GenerationService(
        workflow=mock_workflow,
        storage_dir=gen_dir,
        extraction_storage_dir=ext_dir,
    )

    gen_request = GenerationRequest(
        document_id=document_id,
        instruction="Summarize key financial figures",
    )
    generation_result = gen_service.execute(gen_request)
    generation_id = generation_result.generation_id
    assert generation_id.startswith("gen_")
    assert len(generation_result.claims) == 1
    assert generation_result.claims[0].cited_source_pointers == [source_pointer]

    # =========================================================================
    # Stage 3: Dual Verification Layer
    # =========================================================================
    mock_primary_verifier = MagicMock(spec=PrimaryVerifier)
    mock_primary_verifier.verify_claim.return_value = (
        VerificationVerdict.VERIFIED,
        0.97,
        "Source strictly entails budget figure of 45 million dollars.",
    )

    ver_service = VerificationService(
        primary_verifier=mock_primary_verifier,
        storage_dir=ver_dir,
        extraction_storage_dir=ext_dir,
        generation_storage_dir=gen_dir,
    )

    ver_request = VerificationRequest(
        generation_id=generation_id,
    )
    ver_result = ver_service.verify(ver_request)
    verification_id = ver_result.verification_id
    assert verification_id.startswith("ver_")
    assert ver_result.overall_status == VerificationVerdict.VERIFIED
    assert ver_result.pass_rate == 1.0
    assert len(ver_result.verified_claims) == 1

    # =========================================================================
    # Stage 4: Provenance Layer
    # =========================================================================
    prov_storage = ProvenanceStorageService(storage_dir=prov_dir)
    prov_service = ProvenanceService(storage_service=prov_storage)

    # Assemble provenance using verification_id with automatic resolution
    import unittest.mock as mock
    with mock.patch("extraction.services.storage_service.StorageService", return_value=ext_storage), \
         mock.patch("generation.services.storage_service.GenerationStorageService", return_value=gen_service.storage), \
         mock.patch("dual_verification.services.storage_service.VerificationStorageService", return_value=ver_service.storage):
        prov_record = prov_service.build_from_pipeline(verification_id=verification_id)

    assert prov_record.provenance_id.startswith("prov_")
    assert prov_record.status == "ACTIVE"
    assert prov_record.source_node.document_id == document_id
    assert prov_record.extraction_node.document_id == document_id
    assert prov_record.generation_node.generation_id == generation_id
    assert prov_record.verification_node.verification_id == verification_id
    assert len(prov_record.edges) == 3

    # Cryptographic integrity check
    assert verify_record_integrity(prov_record) is True

    # Stored record check
    integrity_check = prov_service.verify_record_integrity(prov_record.provenance_id)
    assert integrity_check["is_valid"] is True
    assert integrity_check["provenance_id"] == prov_record.provenance_id

    # Tampering check
    tampered_record = prov_record.model_copy(deep=True)
    tampered_record.source_node.sha256_hash = "0" * 64
    assert verify_record_integrity(tampered_record) is False
