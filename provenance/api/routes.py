"""FastAPI routes for the Provenance Layer."""
from fastapi import APIRouter, HTTPException, status

from provenance.api.schemas import (
    BuildProvenanceRequest,
    PublishProvenanceRequest,
    ReverseTraceResponse,
    ProvenanceAPIResponse,
    LineageListResponse,
    IntegrityVerifyResponse,
    ErrorResponse,
)
from provenance.models.provenance_models import ProvenanceRecord
from provenance.services.provenance_service import ProvenanceService

router = APIRouter()
provenance_service = ProvenanceService()


@router.post(
    "/provenance/build",
    response_model=ProvenanceAPIResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def build_provenance_record(request: BuildProvenanceRequest):
    """
    Assembles an end-to-end provenance record and tamper-evident lineage graph
    by resolving artifacts across extraction, generation, and dual-verification stages.
    """
    has_lookup_id = any([request.document_id, request.generation_id, request.verification_id])
    if not has_lookup_id and not request.source_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide at least 'document_id', 'generation_id', 'verification_id', or 'source_content'.",
        )

    try:
        record = provenance_service.build_from_pipeline(
            document_id=request.document_id,
            generation_id=request.generation_id,
            verification_id=request.verification_id,
            source_content=request.source_content,
            filename=request.filename,
            source_type=request.source_type,
        )
        return ProvenanceAPIResponse(
            status="success",
            provenance_id=record.provenance_id,
            integrity_hash=record.integrity_hash,
            data=record,
        )
    except FileNotFoundError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Provenance build failure: {str(err)}",
        )


@router.get(
    "/provenance/{provenance_id}",
    response_model=ProvenanceRecord,
    responses={404: {"model": ErrorResponse}},
)
async def get_provenance_record(provenance_id: str):
    """Retrieves an immutable provenance manifest by its provenance_id."""
    record = provenance_service.get_record(provenance_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provenance record '{provenance_id}' not found.",
        )
    return record


@router.get(
    "/provenance/lineage/{document_id}",
    response_model=LineageListResponse,
    responses={404: {"model": ErrorResponse}},
)
async def get_lineage_for_document(document_id: str):
    """Traces historical transformation lineage records associated with a document_id."""
    records = provenance_service.get_lineage_by_document(document_id)
    return LineageListResponse(
        status="success",
        document_id=document_id,
        total_records=len(records),
        records=records,
    )


@router.get(
    "/provenance/{provenance_id}/verify",
    response_model=IntegrityVerifyResponse,
    responses={404: {"model": ErrorResponse}},
)
async def verify_provenance_integrity(provenance_id: str):
    """Cryptographically verifies that the stored provenance manifest has not been altered."""
    record = provenance_service.get_record(provenance_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provenance record '{provenance_id}' not found.",
        )

    verification = provenance_service.verify_record_integrity(provenance_id)
    return IntegrityVerifyResponse(
        status="success",
        provenance_id=provenance_id,
        is_valid=verification.get("is_valid", False),
        integrity_hash=verification.get("integrity_hash"),
        record_status=verification.get("status"),
        error=verification.get("error"),
    )


@router.post(
    "/provenance/{provenance_id}/publish",
    response_model=ProvenanceAPIResponse,
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def publish_provenance(provenance_id: str, request: PublishProvenanceRequest):
    """Signs, seals, and transitions a ProvenanceRecord to PUBLISHED status with resealed integrity hash."""
    try:
        record = provenance_service.publish_record(
            provenance_id=provenance_id,
            approver_id=request.approver_id,
            digital_signature=request.digital_signature,
            disclosure_level=request.disclosure_level,
        )
        return ProvenanceAPIResponse(
            status="success",
            provenance_id=record.provenance_id,
            integrity_hash=record.integrity_hash,
            data=record,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Publication failed: {str(err)}",
        )


@router.get(
    "/provenance/trace/{document_id}/{block_id}",
    response_model=ReverseTraceResponse,
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def reverse_trace_pointer(document_id: str, block_id: str):
    """Resolves a claim pointer back to its exact bounding box, layout page, and source text."""
    pointer = f"{document_id}#{block_id}"
    trace = provenance_service.trace_source_pointer(pointer=pointer, document_id=document_id)
    if not trace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trace pointer '{pointer}' could not be resolved.",
        )
    return ReverseTraceResponse(
        status="success",
        data=trace,
    )

