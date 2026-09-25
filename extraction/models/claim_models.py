"""Pydantic data models for the Atomic Source Claim Layer."""
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SensitivityLevel(str, Enum):
    """Categorical disclosure/sensitivity classification for claims and documents."""
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    CONFIDENTIAL = "CONFIDENTIAL"
    RESTRICTED = "RESTRICTED"


class AtomicSourceClaim(BaseModel):
    """Represents a single, atomic factual assertion derived from an extracted source block."""
    claim_id: str
    document_id: str
    statement: str
    source_pointer: str
    confidence: float = 1.0
    sensitivity_label: SensitivityLevel = SensitivityLevel.PUBLIC
    linked_entities: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ClaimBank(BaseModel):
    """Collection of atomic claims extracted from a source document."""
    document_id: str
    total_claims: int
    claims: List[AtomicSourceClaim] = Field(default_factory=list)
    extracted_at: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
