from unittest.mock import patch, MagicMock
from generation.services.ollama_client import OllamaClient

def test_ollama_client_generate():
    client = OllamaClient(model="qwen3:8b")
    with patch("ollama.Client") as mock_client_cls:
        mock_instance = mock_client_cls.return_value
        mock_instance.generate.return_value = {"response": "Generated summary [doc_123#p_0]"}
        response = client.generate("Please summarize", system="You are a governed AI")
        assert "Generated summary" in response
        mock_instance.generate.assert_called_once()
