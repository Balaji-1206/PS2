# PRAMAAN Enhanced Governance Architecture — Technical Design Specification (v2.0)

**Date**: 2026-09-25  
**Component**: Core Governance Extensions (PRAMAAN Platform)  
**Status**: Approved Specification  

---

## 1. Overview & Objectives

This specification defines the architectural enhancements required to elevate the PRAMAAN backend from single-pass grounded generation into a complete governed content transformation platform.

### Key Objectives
1. **Pre-Generation Atomic Source Claim Layer (Feature 2)**: Extract and index discrete, atomic source claims with confidence, sensitivity/disclosure classification, and linked entities from source extraction artifacts before generation.
2. **Structured Operator Configuration (Feature 3)**: Formalize operator controls into typed schemas (`OperatorConfig`) covering audience, tone, language, detail level, objective, style, disclosure level, and domain profiles.
3. **Subset Selection & Pre-Gen Gating (Feature 4)**: Filter permitted claims from the Claim Bank based on the operator's configured disclosure level before context compilation and LLM generation.
4. **Parallel Multi-Channel Rendering (Feature 5)**: Concurrently generate consistent text transformations across 6 target channels (`executive_summary`, `linkedin_post`, `twitter_post`, `advisory`, `infographic_brief`, `presentation_outline`) from the shared filtered claim set.
5. **Gate 2 – Appropriateness Verification (Feature 7)**: Implement independent appropriateness auditing evaluating disclosure-level compliance, PII/secret leakage, and audience suitability.
6. **Sign & Publish Audit Workflow (Feature 9)**: Extend provenance manifests with human approver signatures, publication status, and cryptographic resealing.
7. **Reverse Traceability API (Feature 10)**: Provide direct reverse-lookup endpoints mapping generated claims back to source text, document pages, and visual bounding boxes.
8. **Free Prompt Mode**: Allow ungrounded draft generation when no source is supplied, marking all claims as `SYNTHETIC_MODEL_GENERATED` with `UNVERIFIED_FREE_PROMPT` provenance.

---

## 2. Architecture & Data Contracts

### 2.1 Atomic Source Claim Layer (`extraction/` & `generation/`)

#### Model: `AtomicSourceClaim` (`extraction/models/claim_models.py`)
```python
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SensitivityLevel(str, Enum):
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    CONFIDENTIAL = "CONFIDENTIAL"
    RESTRICTED = "RESTRICTED"

class AtomicSourceClaim(BaseModel):
    claim_id: str
    document_id: str
    statement: str
    source_pointer: str
    confidence: float = 1.0
    sensitivity_label: SensitivityLevel = SensitivityLevel.PUBLIC
    linked_entities: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ClaimBank(BaseModel):
    document_id: str
    total_claims: int
    claims: List[AtomicSourceClaim] = Field(default_factory=list)
    extracted_at: str
```

#### Service: `SourceClaimService` (`extraction/services/claim_service.py`)
- Analyzes `ExtractionResult` paragraphs and table elements.
- Extracts individual assertions, assigns `source_pointer` (e.g. `doc_xxx#p_0`), extracts entities, and labels sensitivity based on keyword heuristics (e.g., financial figures, credentials, confidential markers).
- Persists to `extraction/storage/claim_banks/{document_id}.json`.

---

### 2.2 Operator Configuration & Domain Profiles (`generation/models/operator_models.py`)

```python
class ChannelType(str, Enum):
    EXECUTIVE_SUMMARY = "executive_summary"
    LINKEDIN_POST = "linkedin_post"
    TWITTER_POST = "twitter_post"
    ADVISORY = "advisory"
    INFOGRAPHIC_BRIEF = "infographic_brief"
    PRESENTATION_OUTLINE = "presentation_outline"

class OperatorConfig(BaseModel):
    audience: str = "general_public"
    tone: str = "formal_objective"
    language: str = "en"
    detail_level: str = "standard"
    objective: Optional[str] = None
    style: Optional[str] = None
    disclosure_level: SensitivityLevel = SensitivityLevel.PUBLIC
    domain_profile: Optional[str] = "corporate"
    selected_claim_ids: Optional[List[str]] = None
```

#### Domain Profiles Registry (`generation/services/domain_profiles.py`)
- `corporate`: Focus on brand integrity, factual accuracy, stakeholder value.
- `healthcare`: Strict claim attribution, disclaimer requirements, no speculative medical diagnosis.
- `government`: Public accountability, neutral tone, policy clarity.
- `disaster_response`: High-urgency life-safety notices, verified casualty and evacuation statistics.
- `cybersecurity`: Strict vulnerability detail handling, redaction of active exploit indicators.

---

### 2.3 Parallel Multi-Channel Rendering (`generation/`)

#### Request & Response Schemas (`generation/api/schemas.py`)
```python
class MultiChannelGenerationRequest(BaseModel):
    document_id: Optional[str] = None
    config: OperatorConfig = Field(default_factory=OperatorConfig)
    channels: List[ChannelType] = Field(
        default_factory=lambda: [ChannelType.EXECUTIVE_SUMMARY, ChannelType.LINKEDIN_POST]
    )
    instruction: Optional[str] = None

class ChannelOutput(BaseModel):
    channel: ChannelType
    generated_text: str
    claims: List[ClaimItem] = Field(default_factory=list)
    claim_count: int

class MultiChannelGenerationResponse(BaseModel):
    status: str = "success"
    document_id: Optional[str] = None
    outputs: Dict[str, ChannelOutput]
    used_claim_count: int
    disclosure_level: str
    is_ungrounded: bool = False
```

#### Pipeline Flow:
1. `resolve_claims`: Fetches `ClaimBank` for `document_id`.
2. `filter_claims`: Removes claims where `claim.sensitivity_level > config.disclosure_level`. If `config.selected_claim_ids` is specified, filters strictly to those IDs.
3. `parallel_render`: Uses `asyncio.gather` across channel-specific prompt templates to render all requested channel outputs concurrently.
4. `save_artifacts`: Persists each channel result in `generation/storage/generated_content/`.

---

### 2.4 Gate 2 – Appropriateness Verifier (`dual_verification/`)

#### Model: `AppropriatenessVerdict` (`dual_verification/models/verification_models.py`)
```python
class AppropriatenessVerdict(str, Enum):
    APPROPRIATE = "APPROPRIATE"
    DISCLOSURE_VIOLATION = "DISCLOSURE_VIOLATION"
    PII_FLAGGED = "PII_FLAGGED"
    INAPPROPRIATE_TONE = "INAPPROPRIATE_TONE"

class AppropriatenessResult(BaseModel):
    verdict: AppropriatenessVerdict
    passed: bool
    violations: List[str] = Field(default_factory=list)
    confidence: float = 1.0
```

#### Service: `AppropriatenessVerifier` (`dual_verification/services/appropriateness_verifier.py`)
- **Disclosure Check**: Compares claims against the operator's declared `disclosure_level`. Flags any claim citing confidential source blocks when target is `PUBLIC`.
- **PII & Secret Scanner**: Regex rules for Aadhaar/SSN patterns, sensitive email patterns, auth tokens/passwords.
- **Tone & Suitability Check**: Flags aggressive, speculative, or unhedged assertions.

---

### 2.5 Sign & Publish Workflow (`provenance/`)

#### Model Additions (`provenance/models/provenance_models.py`)
```python
class ProvenanceRecord(BaseModel):
    provenance_id: str
    created_at: str
    source_node: SourceNode
    extraction_node: Optional[ExtractionNode] = None
    generation_node: Optional[GenerationNode] = None
    verification_node: Optional[VerificationNode] = None
    edges: List[LineageEdge] = Field(default_factory=list)
    integrity_hash: str
    status: str = "ACTIVE"  # "ACTIVE", "PUBLISHED", "UNVERIFIED_FREE_PROMPT"
    approver_id: Optional[str] = None
    disclosure_level: Optional[str] = "PUBLIC"
    published_at: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
```

#### API: `POST /provenance/{provenance_id}/publish`
- Body: `{"approver_id": "operator_jane", "digital_signature": "sig_..."}`
- Transitions status to `PUBLISHED`, updates `published_at`, reseals `integrity_hash`.

---

### 2.6 Reverse Traceability API (`provenance/`)

#### API: `GET /provenance/trace/{claim_id}`
- Query parameters: `document_id: Optional[str]`, `pointer: Optional[str]`
- Returns:
```json
{
  "claim_id": "claim_0",
  "source_pointer": "doc_123#p_0",
  "source_text": "In FY2025, company revenue grew by 20% to $500M.",
  "page": 1,
  "reading_order": 0,
  "bounding_box": [72.0, 100.0, 520.0, 124.0],
  "confidence": 1.0,
  "document_id": "doc_123"
}
```

---

### 2.7 Free Prompt Mode (`generation/` & `provenance/`)
- When `document_id` and `extraction_data` are null:
  - Generation bypasses extraction lookup without error.
  - Context is marked as synthetic.
  - All decomposed claims cite `["SYNTHETIC_MODEL_GENERATED"]`.
  - Provenance marks status as `UNVERIFIED_FREE_PROMPT`.

---

## 3. Implementation Plan & Migration Strategy

1. **Step 1: Models & Claim Extraction**
   - Create `extraction/models/claim_models.py`.
   - Implement `extraction/services/claim_service.py` to extract atomic claims and build claim banks.
   - Unit tests in `tests/test_claim_service.py`.

2. **Step 2: Operator Configuration & Subset Gating**
   - Create `generation/models/operator_models.py` and `generation/services/domain_profiles.py`.
   - Add subset selection logic in `generation/services/generation_service.py`.
   - Unit tests in `tests/test_operator_config.py`.

3. **Step 3: Multi-Channel Rendering Engine & Free Prompt Mode**
   - Implement `POST /generate/channels` in `generation/api/routes.py`.
   - Enable Free Prompt Mode in `generation/services/generation_service.py`.
   - Unit tests in `tests/test_multi_channel_generation.py`.

4. **Step 4: Gate 2 – Appropriateness Verifier**
   - Create `dual_verification/services/appropriateness_verifier.py`.
   - Update `VerificationService.verify()` to execute both Gate 1 and Gate 2.
   - Unit tests in `tests/test_appropriateness_verifier.py`.

5. **Step 5: Sign & Publish and Reverse Traceability**
   - Update `ProvenanceRecord` schema with approver and publication attributes.
   - Implement `POST /provenance/{id}/publish` and `GET /provenance/trace/{claim_id}`.
   - Unit tests in `tests/test_publish_and_reverse_trace.py`.

6. **Step 6: End-to-End Pipeline & Regression**
   - Update end-to-end integration tests to cover the complete enriched lifecycle.
   - Verify all tests pass with 100% success.
