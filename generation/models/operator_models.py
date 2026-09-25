"""Data models for Operator Configuration, Channels, and Governance Controls."""
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from extraction.models.claim_models import SensitivityLevel
from generation.models.generation_models import ClaimItem


class ChannelType(str, Enum):
    """Supported multi-channel output formats."""
    EXECUTIVE_SUMMARY = "executive_summary"
    LINKEDIN_POST = "linkedin_post"
    TWITTER_POST = "twitter_post"
    ADVISORY = "advisory"
    INFOGRAPHIC_BRIEF = "infographic_brief"
    PRESENTATION_OUTLINE = "presentation_outline"


class OperatorConfig(BaseModel):
    """
    Operator-specified governance constraints and transformation controls.
    """
    audience: str = "general_public"
    tone: str = "formal_objective"
    language: str = "en"
    detail_level: str = "standard"
    objective: Optional[str] = None
    style: Optional[str] = None
    disclosure_level: SensitivityLevel = SensitivityLevel.PUBLIC
    domain_profile: Optional[str] = "corporate"
    selected_claim_ids: Optional[List[str]] = Field(default_factory=list)


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
