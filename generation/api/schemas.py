"""API request and response schemas for the Generation Layer."""
from typing import Optional
from pydantic import BaseModel

from generation.models.generation_models import GenerationResult
from generation.models.operator_models import (
    ChannelOutput,
    ChannelType,
    MultiChannelGenerationRequest,
    MultiChannelGenerationResponse,
    OperatorConfig,
)


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str


class GenerationAPIResponse(BaseModel):
    status: str = "success"
    generation_id: str
    document_id: str
    data: Optional[GenerationResult] = None


__all__ = [
    "ErrorResponse",
    "GenerationAPIResponse",
    "MultiChannelGenerationRequest",
    "ChannelOutput",
    "MultiChannelGenerationResponse",
    "ChannelType",
    "OperatorConfig",
]
