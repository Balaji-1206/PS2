 # Generation Module — Governed Content Transformation Layer

Governed Content Transformation Platform's generation service built on LangGraph and Ollama (`qwen3:8b`).

## Capabilities
- **Extraction Coupling**: Ingests either a `document_id` (fetches stored JSON from extraction storage) or direct `ExtractionResult` payload.
- **Governed Prompting**: Enforces strict grounding, avoids extrapolation, and requires citation of source pointer tags (`[doc_xxx#p_0]`).
- **Claim Decomposition**: Deconstructs transformed text into atomic statements mapped to cited source pointers for the Dual Verification layer.
- **LangGraph StateGraph**: Modular state transitions (`prepare_context` -> `governed_generate` -> `decompose_claims`).

## Running the Service
```bash
python -m uvicorn generation.main:app --reload --port 8001
```

## REST API
- `POST /generate`: Accepts `document_id` / `extraction_data`, `instruction`, and optional `guidelines`.
- `GET /generate/{generation_id}`: Retrieves stored generation result.
- `GET /health`: Health-check endpoint.
