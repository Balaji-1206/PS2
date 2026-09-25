"""API request and response schemas for the Generation Layer."""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from generation.models.generation_models import ClaimItem, GenerationResult
from generation.models.operator_models import ChannelType, OperatorConfig


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str


class GenerationAPIResponse(BaseModel):
    status: str = "success"
    generation_id: str
    document_id: str
    data: Optional[GenerationResult] = None


class MultiChannelGenerationRequest(BaseModel):
    document_id: Optional[str] = None
    config: OperatorConfig = Field(default_factory=OperatorConfig)
    channels: List[ChannelType] = Field(
        default_factory=lambda: [ChannelType.EXECUTIVE_SUMMARY, ChannelType.LINKEDIN_POST]
    )
    instruction: Optional[str] = None


class ChannelOutput(BaseModel):
    channel: ChannelType
    generated_text: str
    claims: List[ClaimItem] = Field(default_factory=list)
    claim_count: int


class MultiChannelGenerationResponse(BaseModel):
    status: str = "success"
    document_id: Optional[str] = None
    outputs: Dict[str, ChannelOutput]
    used_claim_count: int
    disclosure_level: str
    is_ungrounded: bool = False
