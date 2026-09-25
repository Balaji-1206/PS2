from datetime import datetime, timezone
from generation.models.generation_models import (
    ClaimItem,
    GenerationMetadata,
    GenerationResult,
    GenerationRequest,
    GenerationResponse
)

def test_generation_models_serialization():
    claim = ClaimItem(
        claim_id="claim_0",
        statement="Company revenue was $500M in FY25.",
        cited_source_pointers=["doc_123#p_0"]
    )
    metadata = GenerationMetadata(
        model="qwen3:8b",
        claim_count=1,
        generated_at=datetime.now(timezone.utc)
    )
    result = GenerationResult(
        generation_id="gen_001",
        document_id="doc_123",
        instruction="Summarize revenue",
        generated_text="Company revenue was $500M in FY25 [doc_123#p_0].",
        claims=[claim],
        metadata=metadata
    )
    dumped = result.model_dump(mode="json")
    assert dumped["generation_id"] == "gen_001"
    assert dumped["claims"][0]["claim_id"] == "claim_0"
    assert dumped["claims"][0]["cited_source_pointers"] == ["doc_123#p_0"]

def test_generation_request_validation():
    req = GenerationRequest(
        document_id="doc_123",
        instruction="Create executive brief",
        guidelines=["Be concise"]
    )
    assert req.document_id == "doc_123"
    assert req.guidelines == ["Be concise"]
