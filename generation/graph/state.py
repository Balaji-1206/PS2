from typing import TypedDict, List, Dict, Any, Optional

class GenerationState(TypedDict):
    """
    LangGraph state schema representing the lifecycle of a governed content transformation.
    """
    generation_id: str
    document_id: str
    extraction_data: Dict[str, Any]
    instruction: str
    guidelines: List[str]
    context_blocks: str
    generated_text: str
    claims: List[Dict[str, Any]]
    error: Optional[str]
