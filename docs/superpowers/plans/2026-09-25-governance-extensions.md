# PRAMAAN Enhanced Governance Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the enhanced governance features for PRAMAAN: Atomic Source Claim Layer, Operator Configuration & Domain Profiles, Parallel Multi-Channel Rendering, Gate 2 (Appropriateness), Sign & Publish Audit Workflow, Reverse Traceability API, and Free Prompt Mode.

**Architecture:** Extend existing extraction, generation, dual_verification, and provenance services with clean separation of concerns, Pydantic v2 schemas, persistent JSON storages, and async FastAPI endpoints.

**Tech Stack:** Python 3.10+, FastAPI, Pydantic v2, LangGraph, Ollama (`qwen3:8b`), Pytest.

**Spec:** [`docs/superpowers/specs/2026-09-25-governance-extensions-design.md`](file:///c:/Projects/PS2/docs/superpowers/specs/2026-09-25-governance-extensions-design.md)

## Global Constraints
- Python 3.10+ in `.venv`.
- 100% test coverage with fast unit and integration tests.
- Maintain existing 81 passing tests without regression.
- Local git commits per task (do not push to remote without user request).

---

### Task 1: Atomic Source Claim Layer

**Files:**
- Create: `extraction/models/claim_models.py`
- Create: `extraction/services/claim_service.py`
- Modify: `extraction/services/__init__.py`
- Test: `tests/test_claim_service.py`

**Interfaces:**
- Produces:
  - `SensitivityLevel(str, Enum)`: `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `RESTRICTED`
  - `AtomicSourceClaim`: `claim_id: str`, `document_id: str`, `statement: str`, `source_pointer: str`, `confidence: float`, `sensitivity_label: SensitivityLevel`, `linked_entities: List[str]`
  - `ClaimBank`: `document_id: str`, `total_claims: int`, `claims: List[AtomicSourceClaim]`, `extracted_at: str`
  - `SourceClaimService.extract_claim_bank(extraction_result: ExtractionResult) -> ClaimBank`
  - `SourceClaimService.get_claim_bank(document_id: str) -> Optional[ClaimBank]`

- [ ] **Step 1: Write the failing test** (`tests/test_claim_service.py`)
- [ ] **Step 2: Run test to verify it fails** (`pytest tests/test_claim_service.py`)
- [ ] **Step 3: Implement `AtomicSourceClaim`, `ClaimBank`, and `SourceClaimService`**
- [ ] **Step 4: Run test to verify it passes** (`pytest tests/test_claim_service.py`)
- [ ] **Step 5: Commit** (`git commit -m "feat(claims): implement atomic source claim bank and extraction service"`)

---

### Task 2: Operator Configuration & Domain Profiles

**Files:**
- Create: `generation/models/operator_models.py`
- Create: `generation/services/domain_profiles.py`
- Modify: `generation/models/__init__.py`
- Test: `tests/test_operator_config.py`

**Interfaces:**
- Produces:
  - `ChannelType(str, Enum)`: `executive_summary`, `linkedin_post`, `twitter_post`, `advisory`, `infographic_brief`, `presentation_outline`
  - `OperatorConfig`: `audience`, `tone`, `language`, `detail_level`, `objective`, `style`, `disclosure_level`, `domain_profile`, `selected_claim_ids`
  - `get_domain_profile(profile_name: str) -> Dict[str, Any]` (`corporate`, `healthcare`, `government`, `disaster_response`, `cybersecurity`)
  - `filter_claims_for_operator(claims: List[AtomicSourceClaim], config: OperatorConfig) -> List[AtomicSourceClaim]`

- [ ] **Step 1: Write the failing test** (`tests/test_operator_config.py`)
- [ ] **Step 2: Run test to verify it fails** (`pytest tests/test_operator_config.py`)
- [ ] **Step 3: Implement `OperatorConfig`, `ChannelType`, `domain_profiles`, and filtering**
- [ ] **Step 4: Run test to verify it passes** (`pytest tests/test_operator_config.py`)
- [ ] **Step 5: Commit** (`git commit -m "feat(operator): implement OperatorConfig, domain profiles, and claim filtering"`)

---

### Task 3: Parallel Multi-Channel Rendering & Free Prompt Mode

**Files:**
- Modify: `generation/api/schemas.py`
- Modify: `generation/services/generation_service.py`
- Modify: `generation/api/routes.py`
- Test: `tests/test_multi_channel_generation.py`

**Interfaces:**
- Produces:
  - `MultiChannelGenerationRequest`: `document_id: Optional[str]`, `config: OperatorConfig`, `channels: List[ChannelType]`, `instruction: Optional[str]`
  - `MultiChannelGenerationResponse`: `status: str`, `document_id: Optional[str]`, `outputs: Dict[str, ChannelOutput]`, `used_claim_count: int`, `is_ungrounded: bool`
  - `POST /generate/channels` endpoint
  - Free Prompt Mode support when `document_id` and `extraction_data` are omitted in `POST /generate` and `POST /generate/channels`

- [ ] **Step 1: Write the failing test** (`tests/test_multi_channel_generation.py`)
- [ ] **Step 2: Run test to verify it fails** (`pytest tests/test_multi_channel_generation.py`)
- [ ] **Step 3: Implement multi-channel parallel rendering and free prompt mode**
- [ ] **Step 4: Run test to verify it passes** (`pytest tests/test_multi_channel_generation.py`)
- [ ] **Step 5: Commit** (`git commit -m "feat(generation): implement parallel multi-channel rendering and free prompt mode"`)

---

### Task 4: Gate 2 – Appropriateness Verification

**Files:**
- Create: `dual_verification/services/appropriateness_verifier.py`
- Modify: `dual_verification/models/verification_models.py`
- Modify: `dual_verification/services/verification_service.py`
- Test: `tests/test_appropriateness_verifier.py`

**Interfaces:**
- Produces:
  - `AppropriatenessVerdict(str, Enum)`: `APPROPRIATE`, `DISCLOSURE_VIOLATION`, `PII_FLAGGED`, `INAPPROPRIATE_TONE`
  - `AppropriatenessResult`: `verdict`, `passed: bool`, `violations: List[str]`, `confidence: float`
  - `AppropriatenessVerifier.verify(statement: str, disclosure_level: str, source_evidence: str, target_audience: str) -> AppropriatenessResult`
  - Integrated into `VerificationResult` and `VerificationService.verify()`

- [ ] **Step 1: Write the failing test** (`tests/test_appropriateness_verifier.py`)
- [ ] **Step 2: Run test to verify it fails** (`pytest tests/test_appropriateness_verifier.py`)
- [ ] **Step 3: Implement `AppropriatenessVerifier` and wire into `VerificationService`**
- [ ] **Step 4: Run test to verify it passes** (`pytest tests/test_appropriateness_verifier.py`)
- [ ] **Step 5: Commit** (`git commit -m "feat(verification): implement Gate 2 Appropriateness Verifier with disclosure and PII scanning"`)

---

### Task 5: Sign & Publish and Reverse Traceability

**Files:**
- Modify: `provenance/models/provenance_models.py`
- Modify: `provenance/services/provenance_service.py`
- Modify: `provenance/api/schemas.py`
- Modify: `provenance/api/routes.py`
- Test: `tests/test_publish_and_reverse_trace.py`

**Interfaces:**
- Produces:
  - Extended `ProvenanceRecord` with `approver_id`, `disclosure_level`, `published_at`
  - `POST /provenance/{provenance_id}/publish` endpoint
  - `GET /provenance/trace/{claim_id}` reverse-lookup endpoint returning `source_text`, `page`, `bounding_box`, `confidence`

- [ ] **Step 1: Write the failing test** (`tests/test_publish_and_reverse_trace.py`)
- [ ] **Step 2: Run test to verify it fails** (`pytest tests/test_publish_and_reverse_trace.py`)
- [ ] **Step 3: Implement publishing and reverse trace resolution**
- [ ] **Step 4: Run test to verify it passes** (`pytest tests/test_publish_and_reverse_trace.py`)
- [ ] **Step 5: Commit** (`git commit -m "feat(provenance): implement Sign & Publish workflow and Reverse Traceability API"`)

---

### Task 6: End-to-End Governance Lifecycle Integration

**Files:**
- Create: `tests/test_end_to_end_governance_pipeline.py`

**Interfaces:**
- Validates:
  - Ingest raw document $\to$ Extract atomic claim bank with sensitivity.
  - Configure operator with disclosure level $\to$ subset selection gates restricted claims.
  - Multi-channel parallel rendering yields consistent outputs.
  - Dual Verification checks Gate 1 (Fidelity) + Gate 2 (Appropriateness).
  - Provenance signs, publishes, and supports reverse trace back to bounding box.
  - Free Prompt Mode operates cleanly with synthetic tags.

- [ ] **Step 1: Write and run end-to-end integration test**
- [ ] **Step 2: Run full test suite across entire repository** (`pytest`)
- [ ] **Step 3: Commit** (`git commit -m "test(governance): verify end-to-end multi-channel governed pipeline"`)
