import re
from typing import Dict, Any, List, Optional
from generation.graph.state import GenerationState
from generation.services.ollama_client import OllamaClient

def prepare_context_node(state: GenerationState) -> Dict[str, Any]:
    """
    Transforms extracted document elements into structured, numbered reference blocks
    tagged with canonical source pointers for LLM grounding.
    """
    doc_id = state.get("document_id", "doc")
    extraction = state.get("extraction_data", {})
    content = extraction.get("content", {})
    paragraphs = content.get("paragraphs", [])
    tables = content.get("tables", [])

    blocks: List[str] = []
    for p in paragraphs:
        p_id = p.get("id", "p")
        text = p.get("text", "")
        sec = p.get("section", "General")
        page = p.get("page", 1)
        pointer = f"{doc_id}#{p_id}"
        blocks.append(f"[{pointer}] (Page {page}, Section: {sec})\n{text}")

    for idx, t in enumerate(tables):
        page = t.get("page", 1)
        pointer = f"{doc_id}#table_{idx}"
        rows = t.get("cell_values", [])
        table_str = "\n".join([" | ".join(row) for row in rows])
        blocks.append(f"[{pointer}] (Page {page}, Table)\n{table_str}")

    return {"context_blocks": "\n\n".join(blocks)}
