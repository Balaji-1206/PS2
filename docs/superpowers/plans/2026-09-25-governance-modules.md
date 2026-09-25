# Dual Verification & Provenance Layers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Dual Verification Layer (fact-checking and contradiction detection) and the Provenance Layer (immutable audit trail and lineage graph) for the Governed Content Transformation Platform.

**Tech Stack:** Python 3.10+, FastAPI, Pydantic v2, Ollama (qwen3:8b), Pytest.

**Spec:** [`docs/superpowers/specs/2026-09-25-governance-modules-design.md`](file:///c:/Projects/PS2/docs/superpowers/specs/2026-09-25-governance-modules-design.md)

## Global Constraints
- Python 3.10+ in `.venv`.
- Seamless integration with `extraction/storage/extracted_json` and `generation/storage/generated_content`.
- Clean code architecture with single responsibility.
- 100% test coverage with unit & integration tests.
- Local commits only (do not push to GitHub without user request).

---

### Phase A: Dual Verification Module

- [x] **Task 1: Verification Data Models** (`dual_verification/models/verification_models.py`)
- [x] **Task 2: Primary Verifier (NLI with Ollama qwen3:8b)** (`dual_verification/services/primary_verifier.py`)
- [x] **Task 3: Secondary Verifier (Rule & Entity Gate)** (`dual_verification/services/secondary_verifier.py`)
- [x] **Task 4: Arbiter & Consensus Engine** (`dual_verification/services/arbiter.py`)
- [x] **Task 5: Storage & Verification Orchestrator** (`dual_verification/services/verification_service.py`)
- [x] **Task 6: Verification FastAPI API & Main App** (`dual_verification/main.py`, `dual_verification/api/routes.py`)

---

### Phase B: Provenance Module

- [x] **Task 7: Provenance Data Models** (`provenance/models/provenance_models.py`)
- [x] **Task 8: Lineage Builder & Hashing Engine** (`provenance/services/lineage_builder.py`)
- [x] **Task 9: Storage & Provenance Registry Service** (`provenance/services/provenance_service.py`)
- [x] **Task 10: Provenance FastAPI API & Main App** (`provenance/main.py`, `provenance/api/routes.py`)
