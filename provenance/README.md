# Provenance Layer — Governed Content Transformation Platform

The Provenance Layer provides an immutable, tamper-evident audit trail and cryptographic lineage graph connecting the raw source document through extraction, LLM transformation, and dual-verification stages.

## Capabilities
- **Lineage Builder (`LineageBuilder`)**:
  - Deterministic SHA-256 cryptographic hashing across all pipeline artifacts.
  - Builds structured lineage nodes: `SourceNode`, `ExtractionNode`, `GenerationNode`, `VerificationNode`.
  - Links transformation stages via directed `LineageEdge` connections (`extracted_from`, `generated_from`, `verified_against`).
- **Cryptographic Sealing & Verification**:
  - Sealing engine calculates a canonical manifest integrity hash over the complete lineage graph.
  - `verify_record_integrity`: Detects any unauthorized modification or tampering of pipeline artifacts.
- **Storage Service (`ProvenanceStorageService`)**:
  - Persists records to `provenance/storage/records/{provenance_id}.json`.
  - Multi-index document querying by `document_id`.
- **Pipeline Orchestrator (`ProvenanceService`)**:
  - `build_from_pipeline`: Automatically resolves artifacts across extraction (`StorageService`), generation (`GenerationStorageService`), and verification (`VerificationStorageService`).
- **REST API**:
  - `POST /provenance/build`: Assembles end-to-end lineage manifests from pipeline stages.
  - `GET /provenance/{provenance_id}`: Retrieves complete immutable audit record.
  - `GET /provenance/lineage/{document_id}`: Traces historical transformation lineage manifests for a document.
  - `GET /provenance/{provenance_id}/verify`: Performs cryptographic tamper-evidence verification.
  - `GET /health`: Health-check endpoint.

## Running the Service
```bash
python -m uvicorn provenance.main:app --reload --port 8003
```
