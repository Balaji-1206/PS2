"""Pydantic schemas for the Provenance Layer REST API."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from provenance.models.provenance_models import ProvenanceRecord, ReverseTraceResult


class BuildProvenanceRequest(BaseModel):
    """Request payload for building or resolving end-to-end provenance records."""
    document_id: Optional[str] = None
    generation_id: Optional[str] = None
    verification_id: Optional[str] = None
    source_content: Optional[str] = None
    filename: Optional[str] = None
    source_type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class PublishProvenanceRequest(BaseModel):
    """Payload for signing and publishing a provenance record."""
    approver_id: str
    digital_signature: Optional[str] = None
    disclosure_level: Optional[str] = "PUBLIC"


class ReverseTraceResponse(BaseModel):
    """API response for reverse traceability query."""
    status: str = "success"
    data: ReverseTraceResult


class ProvenanceAPIResponse(BaseModel):
    """Standard API response encapsulating a created or fetched ProvenanceRecord."""
    status: str = "success"
    provenance_id: str
    integrity_hash: str
    data: Optional[ProvenanceRecord] = None


class LineageListResponse(BaseModel):
    """API response for querying document transformation lineage manifests."""
    status: str = "success"
    document_id: str
    total_records: int
    records: List[ProvenanceRecord] = Field(default_factory=list)


class IntegrityVerifyResponse(BaseModel):
    """API response for cryptographic manifest integrity check."""
    status: str = "success"
    provenance_id: str
    is_valid: bool
    integrity_hash: Optional[str] = None
    record_status: Optional[str] = None
    error: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standard error response model."""
    status: str = "error"
    message: str

