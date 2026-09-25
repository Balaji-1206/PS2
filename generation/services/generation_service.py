"""Generation service with LangGraph workflow, claim subset gating, multi-channel rendering, and Free Prompt Mode."""
import asyncio
import json
import logging
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

from extraction.models.claim_models import AtomicSourceClaim, SensitivityLevel
from extraction.services.claim_service import SourceClaimService
from generation.models.operator_models import (
    ChannelOutput,
    MultiChannelGenerationRequest,
    MultiChannelGenerationResponse,
)
from generation.graph.state import GenerationState
from generation.models.generation_models import (
    ClaimItem,
    GenerationMetadata,
    GenerationRequest,
    GenerationResult,
)
from generation.models.operator_models import ChannelType, OperatorConfig
from generation.services.domain_profiles import (
    filter_claims_for_operator,
    get_domain_profile,
)
from generation.services.storage_service import GenerationStorageService

logger = logging.getLogger(__name__)

DEFAULT_EXTRACTION_STORAGE_DIR = (
    Path(__file__).resolve().parent.parent.parent / "extraction" / "storage" / "extracted_json"
)
DEFAULT_CLAIM_STORAGE_DIR = (
    Path(__file__).resolve().parent.parent.parent / "extraction" / "storage" / "claim_banks"
)

CHANNEL_TEMPLATES: Dict[ChannelType, str] = {
    ChannelType.EXECUTIVE_SUMMARY: (
        "Draft a high-level executive summary tailored for senior decision-makers, "
        "emphasizing strategic outcomes and key quantitative findings."
    ),
    ChannelType.LINKEDIN_POST: (
        "Draft an engaging professional LinkedIn post highlighting key achievements, "
        "including industry context and 2-3 relevant hashtags."
    ),
    ChannelType.TWITTER_POST: (
        "Draft a punchy, concise post for X/Twitter under 280 characters, "
        "highlighting the headline fact with source pointer citation."
    ),
    ChannelType.TWITTER_THREAD: (
        "Draft a punchy, structured thread for X/Twitter with sequential numbered points, "
        "highlighting key findings and source pointer citations."
    ),
    ChannelType.ADVISORY: (
        "Draft a formal operational advisory notice outlining urgent directives, "
        "compliance rules, and recommended actions."
    ),
    ChannelType.INFOGRAPHIC_BRIEF: (
        "Draft a structured data brief for a visual infographic, highlighting numerical stats, "
        "key metric callouts, and clean data labels."
    ),
    ChannelType.PRESENTATION_OUTLINE: (
        "Draft a structured slide presentation outline detailing Slide Titles, "
        "Key Bullet Points, and Speaker Notes."
    ),
    ChannelType.VIDEO_PACKAGE: (
        "Draft a complete video package including script, storyboard, scene descriptions, "
        "narration text, subtitles, and visual recommendations."
    ),
}


class GenerationService:
    """Orchestration service bridging Extraction, LangGraph Generation, and Multi-Channel Rendering."""

    def __init__(
        self,
        workflow=None,
        storage_dir: Optional[Path] = None,
        extraction_storage_dir: Optional[Path] = None,
        claim_storage_dir: Optional[Path] = None,
    ):
        if workflow is None:
            from generation.graph.workflow import create_generation_workflow

            self.workflow = create_generation_workflow()
        else:
            self.workflow = workflow
        self.storage = GenerationStorageService(storage_dir=storage_dir)
        self.extraction_storage_dir = (
            Path(extraction_storage_dir) if extraction_storage_dir else DEFAULT_EXTRACTION_STORAGE_DIR
        )
        self.claim_service = SourceClaimService(
            storage_dir=claim_storage_dir or DEFAULT_CLAIM_STORAGE_DIR
        )

    def _resolve_extraction_data(self, request: GenerationRequest) -> tuple[str, Dict[str, Any]]:
        """Resolves extraction data or initializes Free Prompt Mode if no document was provided."""
        if request.extraction_data:
            doc_id = request.document_id or request.extraction_data.get(
                "document_id", f"doc_{uuid.uuid4().hex[:8]}"
            )
            return doc_id, request.extraction_data

        if not request.document_id:
            if getattr(request, "allow_free_prompt", False):
                return "free_prompt", {}
            raise ValueError("Must provide either 'document_id' or 'extraction_data', or set allow_free_prompt=True.")

        if request.document_id == "free_prompt":
            return "free_prompt", {}

        doc_file = self.extraction_storage_dir / f"{request.document_id}.json"
        if not doc_file.exists():
            raise FileNotFoundError(
                f"Extracted document '{request.document_id}' not found in extraction storage."
            )

        with open(doc_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return request.document_id, data

    def execute(self, request: GenerationRequest) -> GenerationResult:
        """Executes a single governed transformation workflow."""
        doc_id, extraction_data = self._resolve_extraction_data(request)
        gen_id = f"gen_{uuid.uuid4().hex[:8]}"
        is_free_prompt = doc_id == "free_prompt"

        context_override = (
            "[FREE_PROMPT_MODE: NO SOURCE DOCUMENT PROVIDED. UNGROUNDED SYNTHETIC GENERATION]"
            if is_free_prompt
            else ""
        )

        initial_state: GenerationState = {
            "generation_id": gen_id,
            "document_id": doc_id,
            "extraction_data": extraction_data,
            "instruction": request.instruction,
            "guidelines": request.guidelines,
            "context_blocks": context_override,
            "generated_text": "",
            "claims": [],
            "error": None,
        }

        final_state = self.workflow.invoke(initial_state)

        claims = []
        for i, c in enumerate(final_state.get("claims", [])):
            stmt = c.get("statement", "")
            pointers = c.get("cited_source_pointers", [])
            if is_free_prompt or not pointers:
                pointers = ["SYNTHETIC_MODEL_GENERATED"]
            claims.append(
                ClaimItem(
                    claim_id=c.get("claim_id", f"claim_{i}"),
                    statement=stmt,
                    cited_source_pointers=pointers,
                )
            )

        metadata = GenerationMetadata(
            model="qwen3:8b",
            claim_count=len(claims),
        )

        result = GenerationResult(
            generation_id=gen_id,
            document_id=doc_id,
            instruction=request.instruction,
            generated_text=final_state.get("generated_text", ""),
            claims=claims,
            metadata=metadata,
        )

        self.storage.save(result)
        return result

    async def _render_channel_task(
        self,
        channel: ChannelType,
        doc_id: str,
        extraction_data: Dict[str, Any],
        context_blocks: str,
        config: OperatorConfig,
        instruction_override: Optional[str] = None,
        is_free_prompt: bool = False,
    ) -> ChannelOutput:
        """Renders an individual channel format asynchronously."""
        channel_prompt = CHANNEL_TEMPLATES.get(channel, "Summarize and structure the document.")
        if instruction_override:
            channel_prompt = f"{channel_prompt} Specific instruction: {instruction_override}"

        profile = get_domain_profile(config.domain_profile)
        combined_guidelines = profile["guidelines"] + [
            f"Target Audience: {config.audience}",
            f"Tone of Voice: {config.tone}",
            f"Permitted Disclosure Ceiling: {config.disclosure_level.value if hasattr(config.disclosure_level, 'value') else config.disclosure_level}",
        ]

        state: GenerationState = {
            "generation_id": f"gen_{channel.value}_{uuid.uuid4().hex[:6]}",
            "document_id": doc_id,
            "extraction_data": extraction_data,
            "instruction": channel_prompt,
            "guidelines": combined_guidelines,
            "context_blocks": context_blocks,
            "generated_text": "",
            "claims": [],
            "error": None,
        }

        # Invoke graph workflow for this channel
        final_state = await asyncio.to_thread(self.workflow.invoke, state)

        claims = []
        for i, c in enumerate(final_state.get("claims", [])):
            stmt = c.get("statement", "")
            pointers = c.get("cited_source_pointers", [])
            if is_free_prompt or not pointers:
                pointers = ["SYNTHETIC_MODEL_GENERATED"]
            claims.append(
                ClaimItem(
                    claim_id=f"{channel.value}_c{i}",
                    statement=stmt,
                    cited_source_pointers=pointers,
                )
            )

        return ChannelOutput(
            channel=channel,
            generated_text=final_state.get("generated_text", ""),
            claims=claims,
            claim_count=len(claims),
        )

    async def execute_multi_channel(
        self,
        request: MultiChannelGenerationRequest,
    ) -> MultiChannelGenerationResponse:
        """
        Executes Parallel Multi-Channel Rendering concurrently across all requested channels
        from the shared, disclosure-filtered claim bank.
        """
        doc_id = request.document_id or "free_prompt"
        is_free_prompt = doc_id == "free_prompt"
        extraction_data: Dict[str, Any] = {}
        used_claim_count = 0
        context_blocks = ""

        if not is_free_prompt:
            # 1. Resolve Claim Bank & Perform Subset Selection
            claim_bank = self.claim_service.get_claim_bank(doc_id)
            if claim_bank:
                permitted_claims = filter_claims_for_operator(claim_bank.claims, request.config)
                used_claim_count = len(permitted_claims)
                context_blocks = "PERMITTED SOURCE CLAIMS:\n" + "\n".join(
                    f"[{c.source_pointer}] {c.statement}" for c in permitted_claims
                )
            else:
                # Fallback to extraction blocks if claim bank not yet built
                doc_file = self.extraction_storage_dir / f"{doc_id}.json"
                if doc_file.exists():
                    with open(doc_file, "r", encoding="utf-8") as f:
                        extraction_data = json.load(f)
        else:
            context_blocks = "[FREE_PROMPT_MODE: NO SOURCE DOCUMENT PROVIDED]"

        # 2. Concurrently render all channels using asyncio.gather
        tasks = [
            self._render_channel_task(
                channel=ch,
                doc_id=doc_id,
                extraction_data=extraction_data,
                context_blocks=context_blocks,
                config=request.config,
                instruction_override=request.instruction,
                is_free_prompt=is_free_prompt,
            )
            for ch in request.channels
        ]

        rendered_outputs = await asyncio.gather(*tasks)

        outputs_dict: Dict[str, ChannelOutput] = {
            out.channel: out for out in rendered_outputs
        }

        # 3. Persist combined or individual outputs to storage
        for out in rendered_outputs:
            single_result = GenerationResult(
                generation_id=f"gen_{out.channel.value}_{uuid.uuid4().hex[:6]}",
                document_id=doc_id,
                instruction=f"Channel output for {out.channel.value}",
                generated_text=out.generated_text,
                claims=out.claims,
                metadata=GenerationMetadata(
                    model="qwen3:8b",
                    claim_count=out.claim_count,
                ),
            )
            self.storage.save(single_result)

        return MultiChannelGenerationResponse(
            status="success",
            document_id=doc_id if not is_free_prompt else None,
            outputs=outputs_dict,
            used_claim_count=used_claim_count,
            disclosure_level=request.config.disclosure_level.value
            if hasattr(request.config.disclosure_level, "value")
            else str(request.config.disclosure_level),
            is_ungrounded=is_free_prompt,
        )
