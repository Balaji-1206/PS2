from unittest.mock import patch, MagicMock
from generation.services.ollama_client import OllamaClient

def test_ollama_client_generate():
    client = OllamaClient(model="qwen3:8b")
    with patch("ollama.generate") as mock_generate:
        mock_generate.return_value = {"response": "Generated summary [doc_123#p_0]"}
        response = client.generate("Please summarize", system="You are a governed AI")
        assert "Generated summary" in response
        mock_generate.assert_called_once()
