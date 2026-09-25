from generation.graph.state import GenerationState
from generation.graph.nodes import prepare_context_node

def test_prepare_context_node():
    extraction_data = {
        "content": {
            "paragraphs": [
                {"id": "p_0", "text": "First paragraph text.", "page": 1, "section": "Intro"},
                {"id": "p_1", "text": "Second paragraph text.", "page": 1, "section": "Intro"}
            ],
            "tables": [
                {
                    "page": 2,
                    "cell_values": [["Header 1", "Header 2"], ["Val 1", "Val 2"]]
                }
            ]
        }
    }
    state: GenerationState = {
        "generation_id": "gen_001",
        "document_id": "doc_test",
        "extraction_data": extraction_data,
        "instruction": "Summarize text",
        "guidelines": ["Strict grounding"],
        "context_blocks": "",
        "generated_text": "",
        "claims": [],
        "error": None
    }
    updated = prepare_context_node(state)
    assert "[doc_test#p_0]" in updated["context_blocks"]
    assert "First paragraph text." in updated["context_blocks"]
    assert "[doc_test#p_1]" in updated["context_blocks"]
    assert "[doc_test#table_0]" in updated["context_blocks"]
    assert "Header 1 | Header 2" in updated["context_blocks"]
