from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ClaimItem(BaseModel):
    claim_id: str
    statement: str
    cited_source_pointers: List[str] = Field(default_factory=list)

class GenerationMetadata(BaseModel):
    model: str = "qwen3:8b"
    claim_count: int = 0
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GenerationResult(BaseModel):
    generation_id: str
    document_id: str
    instruction: str
    generated_text: str
    claims: List[ClaimItem] = Field(default_factory=list)
    metadata: GenerationMetadata

class GenerationRequest(BaseModel):
    document_id: Optional[str] = None
    extraction_data: Optional[Dict[str, Any]] = None
    instruction: str
    guidelines: List[str] = Field(default_factory=list)

class GenerationResponse(BaseModel):
    status: str = "success"
    generation_id: str
    document_id: str
    data: Optional[GenerationResult] = None
