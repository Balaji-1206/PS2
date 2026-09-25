from unittest.mock import MagicMock
from generation.graph.workflow import create_generation_workflow
from generation.graph.state import GenerationState

def test_workflow_execution():
    mock_client = MagicMock()
    mock_client.generate.return_value = "Summary statement [doc_001#p_0]."
    graph = create_generation_workflow(ollama_client=mock_client)

    initial_state: GenerationState = {
        "generation_id": "gen_test",
        "document_id": "doc_001",
        "extraction_data": {
            "content": {"paragraphs": [{"id": "p_0", "text": "Source text."}], "tables": []}
        },
        "instruction": "Summarize",
        "guidelines": ["Grounded only"],
        "context_blocks": "",
        "generated_text": "",
        "claims": [],
        "error": None
    }
    final_state = graph.invoke(initial_state)
    assert final_state["generated_text"] == "Summary statement [doc_001#p_0]."
    assert len(final_state["claims"]) == 1
    assert final_state["claims"][0]["cited_source_pointers"] == ["doc_001#p_0"]
    assert "[doc_001#p_0]" in final_state["context_blocks"]
