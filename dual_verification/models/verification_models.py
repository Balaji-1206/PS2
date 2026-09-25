from enum import Enum
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class VerificationVerdict(str, Enum):
    VERIFIED = "VERIFIED"
    CONTRADICTED = "CONTRADICTED"
    UNSUPPORTED = "UNSUPPORTED"

class AppropriatenessVerdict(str, Enum):
    APPROPRIATE = "APPROPRIATE"
    DISCLOSURE_VIOLATION = "DISCLOSURE_VIOLATION"
    PII_FLAGGED = "PII_FLAGGED"
    INAPPROPRIATE_TONE = "INAPPROPRIATE_TONE"

class AppropriatenessResult(BaseModel):
    verdict: AppropriatenessVerdict
    passed: bool = True
    violations: List[str] = Field(default_factory=list)
    confidence: float = 1.0

class ClaimVerificationResult(BaseModel):
    claim_id: str
    statement: str
    cited_source_pointers: List[str] = Field(default_factory=list)
    primary_verdict: VerificationVerdict
    secondary_verdict: VerificationVerdict
    final_verdict: VerificationVerdict
    confidence: float = 1.0
    reasoning: str = ""
    appropriateness: Optional[AppropriatenessResult] = None

class VerificationResult(BaseModel):
    verification_id: str
    generation_id: str
    document_id: str
    overall_status: VerificationVerdict
    overall_appropriateness: AppropriatenessVerdict = AppropriatenessVerdict.APPROPRIATE
    verified_claims: List[ClaimVerificationResult] = Field(default_factory=list)
    discrepancies: List[str] = Field(default_factory=list)
    pass_rate: float = 1.0
    verified_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VerificationRequest(BaseModel):
    generation_id: Optional[str] = None
    document_id: Optional[str] = None
    claims: Optional[List[Dict[str, Any]]] = None
    source_content: Optional[Dict[str, Any]] = None
    disclosure_level: Optional[str] = "PUBLIC"
    target_audience: Optional[str] = "general_public"

class VerificationResponse(BaseModel):
    status: str = "success"
    verification_id: str
    overall_status: VerificationVerdict
    overall_appropriateness: AppropriatenessVerdict = AppropriatenessVerdict.APPROPRIATE
    data: Optional[VerificationResult] = None
