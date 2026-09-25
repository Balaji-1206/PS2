from fastapi import APIRouter, HTTPException, status

from generation.api.schemas import (
    ErrorResponse,
    GenerationAPIResponse,
    MultiChannelGenerationRequest,
    MultiChannelGenerationResponse,
)
from generation.models.generation_models import GenerationRequest, GenerationResult
from generation.services.generation_service import GenerationService

router = APIRouter()
generation_service = GenerationService()


@router.post(
    "/generate",
    response_model=GenerationAPIResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def generate_content(request: GenerationRequest):
    """
    Executes a governed content transformation using LangGraph and Ollama qwen3:8b.
    Accepts 'document_id', direct 'extraction_data', or operates in Free Prompt Mode.
    """
    if not request.document_id and not request.extraction_data and not getattr(request, "allow_free_prompt", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either 'document_id' or 'extraction_data'."
        )

    try:
        result = generation_service.execute(request)
        return GenerationAPIResponse(
            status="success",
            generation_id=result.generation_id,
            document_id=result.document_id,
            data=result,
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation pipeline error: {str(e)}",
        )


@router.post(
    "/generate/channels",
    response_model=MultiChannelGenerationResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def generate_multi_channel_content(request: MultiChannelGenerationRequest):
    """
    Executes concurrent Parallel Multi-Channel Rendering across requested channels
    (Executive Summary, LinkedIn, X/Twitter, Advisory, Infographic, Presentation)
    grounded in the shared, filtered claim bank.
    """
    try:
        response = await generation_service.execute_multi_channel(request)
        return response
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Multi-channel generation error: {str(e)}",
        )


@router.get(
    "/generate/{generation_id}",
    response_model=GenerationResult,
    responses={404: {"model": ErrorResponse}},
)
async def get_generation(generation_id: str):
    """Retrieves a stored generation result by generation_id."""
    result = generation_service.storage.get(generation_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Generation artifact '{generation_id}' not found.",
        )
    return result
