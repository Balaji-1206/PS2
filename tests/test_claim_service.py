from pathlib import Path
import pytest

from extraction.models.extraction_models import (
    ExtractionResult,
    ExtractedContent,
    ParagraphItem,
    TableItem,
    SourceMappingItem,
    DocumentMetadata,
)
from extraction.models.claim_models import (
    SensitivityLevel,
    AtomicSourceClaim,
    ClaimBank,
)
from extraction.services.claim_service import SourceClaimService


def test_claim_models_creation():
    claim = AtomicSourceClaim(
        claim_id="sclaim_01",
        document_id="doc_test",
        statement="Quarterly revenue reached $50M in 2026.",
        source_pointer="doc_test#p_0",
        confidence=0.98,
        sensitivity_label=SensitivityLevel.INTERNAL,
        linked_entities=["$50M", "2026"],
    )
    assert claim.claim_id == "sclaim_01"
    assert claim.sensitivity_label == SensitivityLevel.INTERNAL
    assert len(claim.linked_entities) == 2


def test_source_claim_service_extraction_and_retrieval(tmp_path: Path):
    storage_dir = tmp_path / "claim_banks"
    service = SourceClaimService(storage_dir=storage_dir)

    extraction = ExtractionResult(
        document_id="doc_claims_1",
        source_type="md",
        metadata=DocumentMetadata(filename="financials.md"),
        content=ExtractedContent(
            paragraphs=[
                ParagraphItem(
                    id="p_0",
                    text="The organization achieved 25% year-over-year revenue expansion in 2025. Total revenue stood at $120M.",
                ),
                ParagraphItem(
                    id="p_1",
                    text="CONFIDENTIAL: Internal operating margins were restricted to executive leadership review only.",
                ),
            ],
            tables=[
                TableItem(
                    rows=2,
                    columns=2,
                    cell_values=[
                        ["Region", "Target"],
                        ["APAC", "$30M"],
                    ],
                )
            ],
        ),
        source_mapping=[
            SourceMappingItem(id="p_0", source_pointer="doc_claims_1#p_0"),
            SourceMappingItem(id="p_1", source_pointer="doc_claims_1#p_1"),
        ],
    )

    claim_bank = service.extract_claim_bank(extraction)
    assert claim_bank.document_id == "doc_claims_1"
    assert claim_bank.total_claims >= 3

    # Check sensitivity classification
    public_claims = [c for c in claim_bank.claims if c.sensitivity_label == SensitivityLevel.PUBLIC]
    confidential_claims = [c for c in claim_bank.claims if c.sensitivity_label == SensitivityLevel.CONFIDENTIAL]

    assert len(public_claims) >= 2
    assert len(confidential_claims) >= 1
    assert "CONFIDENTIAL" in confidential_claims[0].statement or "Internal" in confidential_claims[0].statement

    # Check persistence and retrieval
    loaded = service.get_claim_bank("doc_claims_1")
    assert loaded is not None
    assert loaded.document_id == "doc_claims_1"
    assert loaded.total_claims == claim_bank.total_claims
