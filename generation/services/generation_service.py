import json
import uuid
from pathlib import Path
from typing import Optional, Dict, Any
from generation.models.generation_models import (
    GenerationRequest,
    GenerationResult,
    GenerationMetadata,
    ClaimItem,
)
from generation.graph.workflow import create_generation_workflow
from generation.graph.state import GenerationState
from generation.services.storage_service import GenerationStorageService

DEFAULT_EXTRACTION_STORAGE_DIR = (
    Path(__file__).resolve().parent.parent.parent / "extraction" / "storage" / "extracted_json"
)

class GenerationService:
    """
    Orchestration service bridging the Extraction Layer and the LangGraph Generation workflow.
    Resolves document data (either direct payload or retrieved from extraction storage),
    executes the compiled LangGraph StateGraph, and stores the resulting GenerationResult.
    """
    def __init__(
        self,
        workflow=None,
        storage_dir: Optional[Path] = None,
        extraction_storage_dir: Optional[Path] = None
    ):
        self.workflow = workflow or create_generation_workflow()
        self.storage = GenerationStorageService(storage_dir=storage_dir)
        self.extraction_storage_dir = Path(extraction_storage_dir) if extraction_storage_dir else DEFAULT_EXTRACTION_STORAGE_DIR

    def _resolve_extraction_data(self, request: GenerationRequest) -> tuple[str, Dict[str, Any]]:
        if request.extraction_data:
            doc_id = request.document_id or request.extraction_data.get("document_id", f"doc_{uuid.uuid4().hex[:8]}")
            return doc_id, request.extraction_data

        if not request.document_id:
            raise ValueError("Must provide either 'document_id' or 'extraction_data'.")

        doc_file = self.extraction_storage_dir / f"{request.document_id}.json"
        if not doc_file.exists():
            raise FileNotFoundError(f"Extracted document '{request.document_id}' not found in extraction storage.")

        with open(doc_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return request.document_id, data

    def execute(self, request: GenerationRequest) -> GenerationResult:
        doc_id, extraction_data = self._resolve_extraction_data(request)
        gen_id = f"gen_{uuid.uuid4().hex[:8]}"

        initial_state: GenerationState = {
            "generation_id": gen_id,
            "document_id": doc_id,
            "extraction_data": extraction_data,
            "instruction": request.instruction,
            "guidelines": request.guidelines,
            "context_blocks": "",
            "generated_text": "",
            "claims": [],
            "error": None
        }

        final_state = self.workflow.invoke(initial_state)

        claims = [
            ClaimItem(
                claim_id=c.get("claim_id", f"claim_{i}"),
                statement=c.get("statement", ""),
                cited_source_pointers=c.get("cited_source_pointers", [])
            )
            for i, c in enumerate(final_state.get("claims", []))
        ]

        metadata = GenerationMetadata(
            model="qwen3:8b",
            claim_count=len(claims)
        )

        result = GenerationResult(
            generation_id=gen_id,
            document_id=doc_id,
            instruction=request.instruction,
            generated_text=final_state.get("generated_text", ""),
            claims=claims,
            metadata=metadata
        )

        self.storage.save(result)
        return result
