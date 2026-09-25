"""Pydantic data models for the Provenance Layer."""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class SourceNode(BaseModel):
    """Represents the raw or ingested source document in the lineage graph."""
    model_config = ConfigDict(extra="ignore")

    document_id: str
    filename: str
    source_type: str
    sha256_hash: str
    ingest_timestamp: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ExtractionNode(BaseModel):
    """Represents the structured extraction stage in the lineage graph."""
    model_config = ConfigDict(extra="ignore")

    document_id: str
    total_blocks: int
    block_types: Dict[str, int] = Field(default_factory=dict)
    extracted_pointers: List[str] = Field(default_factory=list)
    sha256_hash: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class GenerationNode(BaseModel):
    """Represents the LLM generation transformation stage in the lineage graph."""
    model_config = ConfigDict(extra="ignore")

    generation_id: str
    document_id: str
    model_name: str
    instruction: str
    generated_text_length: int
    total_claims: int
    sha256_hash: str
    created_at: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class VerificationNode(BaseModel):
    """Represents the dual verification stage in the lineage graph."""
    model_config = ConfigDict(extra="ignore")

    verification_id: str
    overall_verdict: str
    claims_verified: int
    claims_contradicted: int
    claims_unsupported: int
    overall_confidence: float
    sha256_hash: str
    created_at: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LineageEdge(BaseModel):
    """Directed connection between provenance nodes representing artifact derivation."""
    model_config = ConfigDict(extra="ignore")

    source_id: str
    target_id: str
    relationship: str


class ProvenanceRecord(BaseModel):
    """Immutable, tamper-evident manifest encapsulating full pipeline lineage."""
    model_config = ConfigDict(extra="ignore")

    provenance_id: str
    created_at: str
    source_node: SourceNode
    extraction_node: Optional[ExtractionNode] = None
    generation_node: Optional[GenerationNode] = None
    verification_node: Optional[VerificationNode] = None
    edges: List[LineageEdge] = Field(default_factory=list)
    integrity_hash: str
    status: str = "ACTIVE"
    metadata: Dict[str, Any] = Field(default_factory=dict)
