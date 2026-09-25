from typing import Optional
import ollama

class OllamaClient:
    """
    Resilient wrapper around Ollama Python client for running inference
    with local models (e.g. qwen3:8b) under governance instructions.
    """
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
