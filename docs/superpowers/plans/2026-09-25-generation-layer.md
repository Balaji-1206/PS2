# Governed Generation Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modular Governed Generation service using LangGraph and Ollama (`qwen3:8b`) that transforms extracted document JSON into governed content with atomic claims linked to source pointers.

**Architecture:** A LangGraph state graph pipeline consuming `ExtractionResult` objects, structuring context blocks with explicit source pointers (`doc_xxx#p_0`), prompting `qwen3:8b` under strict governance constraints, decomposing outputs into verifiable `ClaimItem`s, and exposing FastAPI REST endpoints with local JSON persistence.

**Tech Stack:** Python 3.10+, FastAPI, LangGraph, LangChain Core, Ollama Python SDK, Pydantic v2, Pytest.

**Spec:** [`docs/superpowers/specs/2026-09-25-generation-layer-design.md`](file:///c:/Projects/PS2/docs/superpowers/specs/2026-09-25-generation-layer-design.md)

## Global Constraints

- Python runtime: Python 3.10+ in `.venv`.
- Model: Ollama running `qwen3:8b`.
- Input Contract: Consumes `ExtractionResult` from the Extraction Layer or fetches via `document_id`.
- Output Contract: Generates `GenerationResult` JSON with text and discrete claims linked to `source_pointer` tags.
- REST Endpoints: `POST /generate` and `GET /generate/{generation_id}` with consistent error JSON.
- Code cleanliness: Small focused functions, strict type hints, no magic numbers, 100% test coverage.
- Git policy: Commit locally per task; do NOT push to GitHub until user gives final approval.

---

### Task 1: Canonical Generation Data Models

**Files:**
- Create: `generation/models/__init__.py`
- Create: `generation/models/generation_models.py`
- Create: `tests/test_generation_models.py`

**Interfaces:**
- Produces: `ClaimItem`, `GenerationMetadata`, `GenerationResult`, `GenerationRequest`, `GenerationResponse`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_generation_models.py
from datetime import datetime, timezone
from generation.models.generation_models import (
    ClaimItem,
    GenerationMetadata,
    GenerationResult,
    GenerationRequest,
    GenerationResponse
)

def test_generation_models_serialization():
    claim = ClaimItem(
        claim_id="claim_0",
        statement="Company revenue was $500M in FY25.",
        cited_source_pointers=["doc_123#p_0"]
    )
    metadata = GenerationMetadata(
        model="qwen3:8b",
        claim_count=1,
        generated_at=datetime.now(timezone.utc)
    )
    result = GenerationResult(
        generation_id="gen_001",
        document_id="doc_123",
        instruction="Summarize revenue",
        generated_text="Company revenue was $500M in FY25 [doc_123#p_0].",
        claims=[claim],
        metadata=metadata
    )
    dumped = result.model_dump(mode="json")
    assert dumped["generation_id"] == "gen_001"
    assert dumped["claims"][0]["claim_id"] == "claim_0"
    assert dumped["claims"][0]["cited_source_pointers"] == ["doc_123#p_0"]

def test_generation_request_validation():
    req = GenerationRequest(
        document_id="doc_123",
        instruction="Create executive brief",
        guidelines=["Be concise"]
    )
    assert req.document_id == "doc_123"
    assert req.guidelines == ["Be concise"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_generation_models.py -v`
Expected: FAIL (ModuleNotFoundError: No module named 'generation.models')

- [ ] **Step 3: Implement generation_models.py**

```python
# generation/models/generation_models.py
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ClaimItem(BaseModel):
    claim_id: str
    statement: str
    cited_source_pointers: List[str] = Field(default_factory=list)

class GenerationMetadata(BaseModel):
    model: str = "qwen3:8b"
    claim_count: int = 0
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GenerationResult(BaseModel):
    generation_id: str
    document_id: str
    instruction: str
    generated_text: str
    claims: List[ClaimItem] = Field(default_factory=list)
    metadata: GenerationMetadata

class GenerationRequest(BaseModel):
    document_id: Optional[str] = None
    extraction_data: Optional[Dict[str, Any]] = None
    instruction: str
    guidelines: List[str] = Field(default_factory=list)

class GenerationResponse(BaseModel):
    status: str = "success"
    generation_id: str
    document_id: str
    data: Optional[GenerationResult] = None
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_generation_models.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add generation/models/ tests/test_generation_models.py
git commit -m "feat(models): add canonical generation and claim models"
```

---

### Task 2: Resilient Ollama Client Wrapper

**Files:**
- Create: `generation/services/ollama_client.py`
- Create: `tests/test_ollama_client.py`

**Interfaces:**
- Produces: `OllamaClient.generate(prompt: str, system: Optional[str]) -> str`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_ollama_client.py
from unittest.mock import patch, MagicMock
from generation.services.ollama_client import OllamaClient

def test_ollama_client_generate():
    client = OllamaClient(model="qwen3:8b")
    with patch("ollama.generate") as mock_generate:
        mock_generate.return_value = {"response": "Generated summary [doc_123#p_0]"}
        response = client.generate("Please summarize", system="You are a governed AI")
        assert "Generated summary" in response
        mock_generate.assert_called_once()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_ollama_client.py -v`
Expected: FAIL (cannot import OllamaClient)

- [ ] **Step 3: Implement ollama_client.py**

```python
# generation/services/ollama_client.py
from typing import Optional
import ollama

class OllamaClient:
    def __init__(self, model: str = "qwen3:8b", host: Optional[str] = None):
        self.model = model
        self.host = host

    def generate(self, prompt: str, system: Optional[str] = None) -> str:
        options = {"temperature": 0.2}
        response = ollama.generate(
            model=self.model,
            prompt=prompt,
            system=system or "You are a precise, governed assistant.",
            options=options
        )
        return response.get("response", "").strip()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_ollama_client.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add generation/services/ollama_client.py tests/test_ollama_client.py
git commit -m "feat(services): add Ollama client wrapper for qwen3:8b"
```

---

### Task 3: LangGraph State & Context Preparation Node

**Files:**
- Create: `generation/graph/__init__.py`
- Create: `generation/graph/state.py`
- Create: `generation/graph/nodes.py`
- Create: `tests/test_generation_graph_nodes.py`

**Interfaces:**
- Produces: `GenerationState`, `prepare_context_node(state: GenerationState) -> GenerationState`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_generation_graph_nodes.py
from generation.graph.state import GenerationState
from generation.graph.nodes import prepare_context_node

def test_prepare_context_node():
    extraction_data = {
        "content": {
            "paragraphs": [
                {"id": "p_0", "text": "First paragraph text.", "page": 1, "section": "Intro"},
                {"id": "p_1", "text": "Second paragraph text.", "page": 1, "section": "Intro"}
            ],
            "tables": []
        }
    }
    state: GenerationState = {
        "generation_id": "gen_001",
        "document_id": "doc_test",
        "extraction_data": extraction_data,
        "instruction": "Summarize text",
        "guidelines": ["Strict grounding"],
        "context_blocks": "",
        "generated_text": "",
        "claims": [],
        "error": None
    }
    updated = prepare_context_node(state)
    assert "[doc_test#p_0]" in updated["context_blocks"]
    assert "First paragraph text." in updated["context_blocks"]
    assert "[doc_test#p_1]" in updated["context_blocks"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_generation_graph_nodes.py -v`
Expected: FAIL (No module named 'generation.graph')

- [ ] **Step 3: Implement state.py and nodes.py (prepare_context_node)**

```python
# generation/graph/state.py
from typing import TypedDict, List, Dict, Any, Optional

class GenerationState(TypedDict):
    generation_id: str
    document_id: str
    extraction_data: Dict[str, Any]
    instruction: str
    guidelines: List[str]
    context_blocks: str
    generated_text: str
    claims: List[Dict[str, Any]]
    error: Optional[str]
```

```python
# generation/graph/nodes.py
from typing import Dict, Any, List
from generation.graph.state import GenerationState

def prepare_context_node(state: GenerationState) -> Dict[str, Any]:
    doc_id = state.get("document_id", "doc")
    extraction = state.get("extraction_data", {})
    content = extraction.get("content", {})
    paragraphs = content.get("paragraphs", [])
    tables = content.get("tables", [])

    blocks: List[str] = []
    for p in paragraphs:
        p_id = p.get("id", "p")
        text = p.get("text", "")
        sec = p.get("section", "General")
        page = p.get("page", 1)
        pointer = f"{doc_id}#{p_id}"
        blocks.append(f"[{pointer}] (Page {page}, Section: {sec})\n{text}")

    for idx, t in enumerate(tables):
        page = t.get("page", 1)
        pointer = f"{doc_id}#table_{idx}"
        rows = t.get("cell_values", [])
        table_str = "\n".join([" | ".join(row) for row in rows])
        blocks.append(f"[{pointer}] (Page {page}, Table)\n{table_str}")

    return {"context_blocks": "\n\n".join(blocks)}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_generation_graph_nodes.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add generation/graph/ tests/test_generation_graph_nodes.py
git commit -m "feat(graph): add GenerationState and context preparation node"
```

---

### Task 4: Governed Generation & Claim Decomposition Nodes

**Files:**
- Modify: `generation/graph/nodes.py`
- Create: `tests/test_claim_decomposition.py`

**Interfaces:**
- Produces: `governed_generate_node(state: GenerationState, ollama_client) -> Dict`, `decompose_claims_node(state: GenerationState) -> Dict`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_claim_decomposition.py
from generation.graph.nodes import decompose_claims_node
from generation.graph.state import GenerationState

def test_claim_decomposition():
    generated_text = (
        "Revenue grew by 20% to $500M [doc_123#p_0]. "
        "Operating costs remained flat [doc_123#p_1]."
    )
    state: GenerationState = {
        "generation_id": "gen_001",
        "document_id": "doc_123",
        "extraction_data": {},
        "instruction": "",
        "guidelines": [],
        "context_blocks": "",
        "generated_text": generated_text,
        "claims": [],
        "error": None
    }
    result = decompose_claims_node(state)
    claims = result["claims"]
    assert len(claims) == 2
    assert claims[0]["claim_id"] == "claim_0"
    assert "Revenue grew by 20%" in claims[0]["statement"]
    assert claims[0]["cited_source_pointers"] == ["doc_123#p_0"]
    assert claims[1]["cited_source_pointers"] == ["doc_123#p_1"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_claim_decomposition.py -v`
Expected: FAIL (cannot import decompose_claims_node)

- [ ] **Step 3: Implement governed_generate_node and decompose_claims_node**

Update `generation/graph/nodes.py` with regex parsing and governed generation logic.

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_claim_decomposition.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add generation/graph/nodes.py tests/test_claim_decomposition.py
git commit -m "feat(graph): add governed generation and claim decomposition nodes"
```

---

### Task 5: LangGraph Workflow Assembly

**Files:**
- Create: `generation/graph/workflow.py`
- Create: `tests/test_generation_workflow.py`

**Interfaces:**
- Produces: `create_generation_workflow(ollama_client: Optional[OllamaClient] = None) -> CompiledStateGraph`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_generation_workflow.py
from unittest.mock import MagicMock
from generation.graph.workflow import create_generation_workflow
from generation.graph.state import GenerationState

def test_workflow_execution():
    mock_client = MagicMock()
    mock_client.generate.return_value = "Summary statement [doc_001#p_0]."
    graph = create_generation_workflow(ollama_client=mock_client)

    initial_state: GenerationState = {
        "generation_id": "gen_test",
        "document_id": "doc_001",
        "extraction_data": {
            "content": {"paragraphs": [{"id": "p_0", "text": "Source text."}], "tables": []}
        },
        "instruction": "Summarize",
        "guidelines": ["Grounded only"],
        "context_blocks": "",
        "generated_text": "",
        "claims": [],
        "error": None
    }
    final_state = graph.invoke(initial_state)
    assert final_state["generated_text"] == "Summary statement [doc_001#p_0]."
    assert len(final_state["claims"]) == 1
    assert final_state["claims"][0]["cited_source_pointers"] == ["doc_001#p_0"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_generation_workflow.py -v`
Expected: FAIL (cannot import create_generation_workflow)

- [ ] **Step 3: Implement workflow.py using LangGraph StateGraph**

Assemble `prepare_context` -> `governed_generate` -> `decompose_claims`.

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_generation_workflow.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add generation/graph/workflow.py tests/test_generation_workflow.py
git commit -m "feat(graph): assemble and compile LangGraph generation workflow"
```

---

### Task 6: Storage Service for Generation Artifacts

**Files:**
- Create: `generation/services/storage_service.py`
- Create: `tests/test_generation_storage.py`

**Interfaces:**
- Produces: `GenerationStorageService.save(result: GenerationResult) -> Path`, `GenerationStorageService.get(generation_id: str) -> Optional[GenerationResult]`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_generation_storage.py
from pathlib import Path
from generation.services.storage_service import GenerationStorageService
from generation.models.generation_models import GenerationResult, GenerationMetadata

def test_generation_storage(tmp_path: Path):
    storage = GenerationStorageService(storage_dir=tmp_path)
    result = GenerationResult(
        generation_id="gen_stored_1",
        document_id="doc_1",
        instruction="Transform",
        generated_text="Content",
        claims=[],
        metadata=GenerationMetadata()
    )
    storage.save(result)
    retrieved = storage.get("gen_stored_1")
    assert retrieved is not None
    assert retrieved.generation_id == "gen_stored_1"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_generation_storage.py -v`
Expected: FAIL (cannot import GenerationStorageService)

- [ ] **Step 3: Implement storage_service.py**

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_generation_storage.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add generation/services/storage_service.py tests/test_generation_storage.py
git commit -m "feat(services): add generation storage service for artifact persistence"
```

---

### Task 7: Generation Orchestrator Service (Extraction Bridge)

**Files:**
- Create: `generation/services/generation_service.py`
- Create: `tests/test_generation_service.py`

**Interfaces:**
- Consumes: `GenerationRequest` (with `document_id` or `extraction_data`), Extraction storage.
- Produces: `GenerationService.generate(request: GenerationRequest) -> GenerationResult`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_generation_service.py
from unittest.mock import MagicMock
from pathlib import Path
from generation.services.generation_service import GenerationService
from generation.models.generation_models import GenerationRequest

def test_generation_service_with_direct_payload(tmp_path: Path):
    mock_workflow = MagicMock()
    mock_workflow.invoke.return_value = {
        "generated_text": "Transformed content [doc_1#p_0]",
        "claims": [{"claim_id": "c0", "statement": "Statement", "cited_source_pointers": ["doc_1#p_0"]}]
    }
    service = GenerationService(workflow=mock_workflow, storage_dir=tmp_path)
    request = GenerationRequest(
        document_id="doc_1",
        extraction_data={"content": {"paragraphs": [{"id": "p_0", "text": "Sample"}]}},
        instruction="Summarize"
    )
    result = service.execute(request)
    assert result.generation_id.startswith("gen_")
    assert result.document_id == "doc_1"
    assert len(result.claims) == 1
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_generation_service.py -v`
Expected: FAIL (cannot import GenerationService)

- [ ] **Step 3: Implement generation_service.py**

Fetch from extraction storage if only `document_id` is supplied, invoke LangGraph workflow, persist, return `GenerationResult`.

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_generation_service.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add generation/services/ tests/test_generation_service.py
git commit -m "feat(services): add generation orchestrator linking extraction and LangGraph"
```

---

### Task 8: FastAPI Endpoints & App Entry Point

**Files:**
- Create: `generation/api/__init__.py`
- Create: `generation/api/schemas.py`
- Create: `generation/api/routes.py`
- Create: `generation/main.py`
- Create: `tests/test_generation_api.py`

**Interfaces:**
- Produces: `POST /generate`, `GET /generate/{generation_id}`, `GET /health`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_generation_api.py
import pytest
from httpx import AsyncClient, ASGITransport
from generation.main import app

@pytest.mark.asyncio
async def test_generation_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_generate_missing_instruction_returns_422():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/generate", json={"document_id": "doc_123"})
        assert res.status_code == 422
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_generation_api.py -v`
Expected: FAIL (No module named 'generation.main')

- [ ] **Step 3: Implement schemas.py, routes.py, and main.py**

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_generation_api.py -v`
Expected: PASS

- [ ] **Step 5: Run full test suite across extraction and generation**

Run: `.\.venv\Scripts\python.exe -m pytest tests/ -v`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add generation/api/ generation/main.py tests/test_generation_api.py
git commit -m "feat(api): add generation FastAPI endpoints and service entry point"
```
