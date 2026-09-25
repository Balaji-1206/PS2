import json
import uuid
from pathlib import Path
from typing import Optional, Dict, Any, List
from dual_verification.models.verification_models import (
    VerificationRequest,
    VerificationResult,
    ClaimVerificationResult,
    VerificationVerdict,
)
from dual_verification.services.primary_verifier import PrimaryVerifier
from dual_verification.services.secondary_verifier import SecondaryVerifier
from dual_verification.services.arbiter import VerificationArbiter
from dual_verification.services.storage_service import VerificationStorageService

DEFAULT_EXTRACTION_STORAGE_DIR = (
    Path(__file__).resolve().parent.parent.parent / "extraction" / "storage" / "extracted_json"
)
DEFAULT_GENERATION_STORAGE_DIR = (
    Path(__file__).resolve().parent.parent.parent / "generation" / "storage" / "generated_content"
)

class VerificationService:
    """
    Central Verification Orchestrator linking Generation claims with Extraction blocks,
    executing Dual Verification (Primary LLM NLI + Secondary Rule/Entity gate),
    and arbitrating consensus verdicts.
    """
    def __init__(
        self,
        primary_verifier: Optional[PrimaryVerifier] = None,
        secondary_verifier: Optional[SecondaryVerifier] = None,
        arbiter: Optional[VerificationArbiter] = None,
        storage_dir: Optional[Path] = None,
        extraction_storage_dir: Optional[Path] = None,
        generation_storage_dir: Optional[Path] = None
    ):
        self.primary = primary_verifier or PrimaryVerifier()
        self.secondary = secondary_verifier or SecondaryVerifier()
        self.arbiter = arbiter or VerificationArbiter()
        self.storage = VerificationStorageService(storage_dir=storage_dir)
        self.extraction_dir = Path(extraction_storage_dir) if extraction_storage_dir else DEFAULT_EXTRACTION_STORAGE_DIR
        self.generation_dir = Path(generation_storage_dir) if generation_storage_dir else DEFAULT_GENERATION_STORAGE_DIR

    def _resolve_data(self, request: VerificationRequest) -> tuple[str, str, List[Dict[str, Any]], Dict[str, Any]]:
        gen_id = request.generation_id or f"gen_{uuid.uuid4().hex[:8]}"
        doc_id = request.document_id or ""
        claims = request.claims or []
        source_content = request.source_content or {}

        # If generation_id is provided, load claims from generation storage
        if request.generation_id and not claims:
            gen_file = self.generation_dir / f"{request.generation_id}.json"
            if gen_file.exists():
                with open(gen_file, "r", encoding="utf-8") as f:
                    gen_data = json.load(f)
                    claims = gen_data.get("claims", [])
                    if not doc_id:
                        doc_id = gen_data.get("document_id", "")

        # If doc_id is known, load source content from extraction storage
        if doc_id and not source_content:
            doc_file = self.extraction_dir / f"{doc_id}.json"
            if doc_file.exists():
                with open(doc_file, "r", encoding="utf-8") as f:
                    source_content = json.load(f)

        return gen_id, doc_id, claims, source_content

    def _extract_evidence_for_pointers(
        self,
        pointers: List[str],
        source_content: Dict[str, Any]
    ) -> str:
        content = source_content.get("content", {})
        paragraphs = content.get("paragraphs", [])
        tables = content.get("tables", [])

        # Map id to text
        evidence_snippets: List[str] = []
        for ptr in pointers:
            target_id = ptr.split("#")[-1] if "#" in ptr else ptr
            # Match paragraph
            matched = False
            for p in paragraphs:
                if p.get("id") == target_id:
                    evidence_snippets.append(p.get("text", ""))
                    matched = True
                    break

            if not matched:
                # Match table
                if "table" in target_id:
                    for idx, t in enumerate(tables):
                        if f"table_{idx}" == target_id:
                            rows = t.get("cell_values", [])
                            evidence_snippets.append("\n".join([" | ".join(r) for r in rows]))
                            matched = True
                            break

        return "\n\n".join(evidence_snippets)

    def verify(self, request: VerificationRequest) -> VerificationResult:
        gen_id, doc_id, claims, source_content = self._resolve_data(request)
        verification_id = f"ver_{uuid.uuid4().hex[:8]}"

        verified_claims: List[ClaimVerificationResult] = []
        discrepancies: List[str] = []
        verified_count = 0

        for c in claims:
            c_id = c.get("claim_id", f"claim_{len(verified_claims)}")
            stmt = c.get("statement", "")
            pointers = c.get("cited_source_pointers", [])

            # Extract source evidence for cited pointers
            evidence = self._extract_evidence_for_pointers(pointers, source_content)

            # 1. Primary Verifier (NLI)
            prim_verdict, prim_conf, prim_reasoning = self.primary.verify_claim(stmt, evidence)

            # 2. Secondary Verifier (Rules/Entities)
            sec_verdict, sec_conf, sec_details = self.secondary.verify(stmt, evidence)

            # 3. Arbiter Consensus
            final_v, final_conf, final_note = self.arbiter.arbitrate(
                prim_verdict, prim_conf, sec_verdict, sec_conf
            )

            if final_v == VerificationVerdict.VERIFIED:
                verified_count += 1
            else:
                discrepancies.append(f"{c_id}: {final_v.value} — {final_note} (NLI: {prim_reasoning}; Rule: {sec_details})")

            verified_claims.append(ClaimVerificationResult(
                claim_id=c_id,
                statement=stmt,
                cited_source_pointers=pointers,
                primary_verdict=prim_verdict,
                secondary_verdict=sec_verdict,
                final_verdict=final_v,
                confidence=final_conf,
                reasoning=f"{final_note} | NLI: {prim_reasoning} | Entities: {sec_details}"
            ))

        total = len(verified_claims)
        pass_rate = round(verified_count / total, 2) if total > 0 else 1.0

        overall_status = VerificationVerdict.VERIFIED
        if any(vc.final_verdict == VerificationVerdict.CONTRADICTED for vc in verified_claims):
            overall_status = VerificationVerdict.CONTRADICTED
        elif any(vc.final_verdict == VerificationVerdict.UNSUPPORTED for vc in verified_claims):
            overall_status = VerificationVerdict.UNSUPPORTED

        result = VerificationResult(
            verification_id=verification_id,
            generation_id=gen_id,
            document_id=doc_id,
            overall_status=overall_status,
            verified_claims=verified_claims,
            discrepancies=discrepancies,
            pass_rate=pass_rate
        )

        self.storage.save(result)
        return result
