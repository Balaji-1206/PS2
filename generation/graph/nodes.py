import re
from typing import Dict, Any, List, Optional
from generation.graph.state import GenerationState

def prepare_context_node(state: GenerationState) -> Dict[str, Any]:
    """
    Transforms extracted document elements into structured, numbered reference blocks
    tagged with canonical source pointers for LLM grounding.
    Preserves pre-existing context_blocks if already populated (e.g. from filtered claim banks).
    """
    existing_context = state.get("context_blocks")
    if existing_context and existing_context.strip():
        return {"context_blocks": existing_context}

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

def governed_generate_node(
    state: GenerationState,
    ollama_client: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Prompts Ollama qwen3:8b under strict governance instructions, requiring every
    factual assertion to cite source pointer tags like [doc_xxx#p_0].
    """
    if ollama_client is None:
        from generation.services.ollama_client import OllamaClient
        client = OllamaClient()
    else:
        client = ollama_client
    instruction = state.get("instruction", "Summarize and structure the document.")
    guidelines = state.get("guidelines", [])
    context = state.get("context_blocks", "")

    guidelines_text = "\n".join([f"- {g}" for g in guidelines]) if guidelines else "- Ensure strict factual grounding in the provided reference blocks."

    system_prompt = (
        "You are the Governed Generation Engine for an enterprise content transformation platform.\n"
        "Your task is to transform the provided source document content strictly according to user instructions.\n"
        "GOVERNANCE RULES:\n"
        f"{guidelines_text}\n"
        "- Ground every factual statement in the reference blocks.\n"
        "- Whenever you make a factual claim, cite the relevant source pointer in brackets, e.g., [doc_id#p_0].\n"
        "- Do NOT invent, extrapolate, or hallucinate details not present in the reference blocks."
    )

    user_prompt = (
        f"USER INSTRUCTION:\n{instruction}\n\n"
        f"SOURCE DOCUMENT REFERENCE BLOCKS:\n{context}\n\n"
        "GENERATE GOVERNED OUTPUT WITH SOURCE CITATIONS:"
    )

    generated = client.generate(prompt=user_prompt, system=system_prompt)
    return {"generated_text": generated}

def decompose_claims_node(state: GenerationState) -> Dict[str, Any]:
    """
    Deconstructs the generated text into discrete atomic claims and associates
    each claim with its cited source pointer tags for downstream Dual Verification.
    """
    generated_text = state.get("generated_text", "")
    if not generated_text:
        return {"claims": []}

    # Split text into sentences/statements
    # Match sentences ending with ., !, or ?
    raw_sentences = re.split(r"(?<=[.!?])\s+", generated_text.strip())
    claims: List[Dict[str, Any]] = []
    claim_idx = 0

    for sent in raw_sentences:
        clean_sent = sent.strip()
        if not clean_sent:
            continue

        # Find all cited source pointers: [doc_xxx#p_0] or [doc_xxx#table_0]
        cited_pointers = re.findall(r"\[([a-zA-Z0-9_]+#(?:p_\d+|table_\d+|block_\d+))\]", clean_sent)
        
        # Clean bracket citations from the claim statement text
        statement = re.sub(r"\s*\[[a-zA-Z0-9_]+#(?:p_\d+|table_\d+|block_\d+)\]", "", clean_sent).strip()

        claims.append({
            "claim_id": f"claim_{claim_idx}",
            "statement": statement,
            "cited_source_pointers": list(dict.fromkeys(cited_pointers))  # deduplicate preserving order
        })
        claim_idx += 1

    return {"claims": claims}
