"""Data models for Operator Configuration, Channels, and Governance Controls."""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

from extraction.models.claim_models import SensitivityLevel


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
