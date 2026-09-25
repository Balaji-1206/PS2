from typing import Optional
from pydantic import BaseModel
from extraction.models.extraction_models import ExtractionResult

class ErrorResponse(BaseModel):
    status: str = "error"
    message: str

class ExtractionAPIResponse(BaseModel):
    status: str = "success"
    document_id: str
    source_type: str
    data: Optional[ExtractionResult] = None
