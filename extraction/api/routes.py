from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from extraction.api.schemas import ExtractionAPIResponse, ErrorResponse
from extraction.models.extraction_models import ExtractionResult
from extraction.services.extraction_service import ExtractionService

router = APIRouter()
extraction_service = ExtractionService()

@router.post(
    "/extract",
    response_model=ExtractionAPIResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def extract_content(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    text: Optional[str] = Form(None)
):
    """
    Accepts multipart document file upload, web URL, or text prompt.
    Extracts structured content with source mapping and persists result.
    """
    if not file and not url and not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide at least one of: file, url, or text."
        )

    try:
        if file is not None:
            content_bytes = await file.read()
            if not content_bytes:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Uploaded file is empty."
                )
            result = await extraction_service.extract_file(file.filename or "uploaded_file", content_bytes)
        elif url is not None:
            result = await extraction_service.extract_url(url.strip())
        else:
            result = await extraction_service.extract_text(text or "", source_type="txt")

        return ExtractionAPIResponse(
            status="success",
            document_id=result.document_id,
            source_type=result.source_type,
            data=result
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Extraction failure: {str(e)}"
        )

@router.get(
    "/extract/{document_id}",
    response_model=ExtractionResult,
    responses={404: {"model": ErrorResponse}}
)
async def get_extraction(document_id: str):
    """
    Retrieves previously extracted document structured JSON by document_id.
    """
    result = extraction_service.storage.get(document_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found."
        )
    return result
