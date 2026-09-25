from typing import Optional
from pydantic import BaseModel
from dual_verification.models.verification_models import VerificationVerdict, VerificationResult

class ErrorResponse(BaseModel):
    status: str = "error"
    message: str

class VerificationAPIResponse(BaseModel):
    status: str = "success"
    verification_id: str
    overall_status: VerificationVerdict
    data: Optional[VerificationResult] = None
