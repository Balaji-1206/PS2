from typing import Optional
from pydantic import BaseModel
from generation.models.generation_models import GenerationResult

class ErrorResponse(BaseModel):
    status: str = "error"
    message: str

class GenerationAPIResponse(BaseModel):
    status: str = "success"
    generation_id: str
    document_id: str
    data: Optional[GenerationResult] = None
