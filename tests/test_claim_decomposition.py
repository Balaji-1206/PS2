from unittest.mock import MagicMock
from generation.graph.nodes import decompose_claims_node, governed_generate_node
from generation.graph.state import GenerationState

def test_claim_decomposition():
    generated_text = (
        "Revenue grew by 20% to $500M [doc_123#p_0]. "
        "Operating costs remained flat [doc_123#p_1]."
    )
    state: GenerationState = {
        "generation_id": "gen_001",
        "document_id": "doc_123",
        "extraction_data": {},
        "instruction": "",
        "guidelines": [],
        "context_blocks": "",
        "generated_text": generated_text,
        "claims": [],
        "error": None
    }
    result = decompose_claims_node(state)
    claims = result["claims"]
    assert len(claims) == 2
    assert claims[0]["claim_id"] == "claim_0"
    assert "Revenue grew by 20%" in claims[0]["statement"]
    assert claims[0]["cited_source_pointers"] == ["doc_123#p_0"]
    assert claims[1]["cited_source_pointers"] == ["doc_123#p_1"]

def test_governed_generate_node():
    mock_client = MagicMock()
    mock_client.generate.return_value = "Generated text [doc_123#p_0]"
    state: GenerationState = {
        "generation_id": "gen_001",
        "document_id": "doc_123",
        "extraction_data": {},
        "instruction": "Summarize",
        "guidelines": ["Strict grounding"],
        "context_blocks": "[doc_123#p_0] Context text",
        "generated_text": "",
        "claims": [],
        "error": None
    }
    result = governed_generate_node(state, ollama_client=mock_client)
    assert result["generated_text"] == "Generated text [doc_123#p_0]"
    mock_client.generate.assert_called_once()
