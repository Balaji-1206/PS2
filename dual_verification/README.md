# Dual Verification Module — Governed Content Transformation Platform

The Dual Verification Layer provides automated factual verification and hallucination detection gates for generated claims.

## Capabilities
- **Primary Verifier (NLI)**: Uses local Ollama (`qwen3:8b`) to perform Natural Language Inference against cited source blocks.
- **Secondary Verifier (Rule & Entity Gate)**: Performs strict entity validation (numbers, dates, currency, percentages) and lexical consistency matching.
- **Verification Arbiter**: Reconciles Primary and Secondary outputs into consensus verdicts (`VERIFIED`, `CONTRADICTED`, `UNSUPPORTED`).
- **REST API**:
  - `POST /verify`: Runs dual verification over claims or generation IDs.
  - `GET /verify/{verification_id}`: Retrieves stored verification reports.
  - `GET /health`: Health-check endpoint.

## Running the Service
```bash
python -m uvicorn dual_verification.main:app --reload --port 8002
```
