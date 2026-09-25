import json
from unittest.mock import MagicMock
from pathlib import Path
import pytest
from generation.services.generation_service import GenerationService
from generation.models.generation_models import GenerationRequest

def test_generation_service_with_direct_payload(tmp_path: Path):
    mock_workflow = MagicMock()
    mock_workflow.invoke.return_value = {
        "generated_text": "Transformed content [doc_1#p_0]",
        "claims": [{"claim_id": "claim_0", "statement": "Transformed content", "cited_source_pointers": ["doc_1#p_0"]}]
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
    assert result.claims[0].cited_source_pointers == ["doc_1#p_0"]

def test_generation_service_with_document_id_lookup(tmp_path: Path):
    # Setup mock extraction storage
    extraction_storage = tmp_path / "extraction_storage"
    extraction_storage.mkdir()
    doc_file = extraction_storage / "doc_stored.json"
    with open(doc_file, "w") as f:
        json.dump({
            "document_id": "doc_stored",
            "source_type": "txt",
            "content": {"paragraphs": [{"id": "p_0", "text": "Text in file"}]}
        }, f)

    mock_workflow = MagicMock()
    mock_workflow.invoke.return_value = {
        "generated_text": "Summary [doc_stored#p_0]",
        "claims": [{"claim_id": "claim_0", "statement": "Summary", "cited_source_pointers": ["doc_stored#p_0"]}]
    }

    gen_storage = tmp_path / "gen_storage"
    service = GenerationService(
        workflow=mock_workflow,
        storage_dir=gen_storage,
        extraction_storage_dir=extraction_storage
    )
    request = GenerationRequest(
        document_id="doc_stored",
        instruction="Summarize doc"
    )
    result = service.execute(request)
    assert result.document_id == "doc_stored"
    assert len(result.claims) == 1

def test_generation_service_missing_document_raises_404(tmp_path: Path):
    service = GenerationService(storage_dir=tmp_path, extraction_storage_dir=tmp_path / "non_existent")
    request = GenerationRequest(document_id="doc_missing", instruction="Summarize")
    with pytest.raises(FileNotFoundError, match="not found"):
        service.execute(request)
