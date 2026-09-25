from fastapi import APIRouter, HTTPException, status
from dual_verification.api.schemas import VerificationAPIResponse, ErrorResponse
from dual_verification.models.verification_models import VerificationRequest, VerificationResult
from dual_verification.services.verification_service import VerificationService

router = APIRouter()
verification_service = VerificationService()

@router.post(
    "/verify",
    response_model=VerificationAPIResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def verify_content(request: VerificationRequest):
    """
    Runs Dual Verification (Primary LLM NLI + Secondary Rule/Entity gate)
    over claims linked to source document evidence.
    """
    if not request.generation_id and not request.claims:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either 'generation_id' or explicit 'claims'."
        )

    try:
        result = verification_service.verify(request)
        return VerificationAPIResponse(
            status="success",
            verification_id=result.verification_id,
            overall_status=result.overall_status,
            data=result
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failure: {str(e)}"
        )

@router.get(
    "/verify/{verification_id}",
    response_model=VerificationResult,
    responses={404: {"model": ErrorResponse}}
)
async def get_verification(verification_id: str):
    """
    Retrieves stored verification report by verification_id.
    """
    result = verification_service.storage.get(verification_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verification report '{verification_id}' not found."
        )
    return result
