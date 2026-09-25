from typing import Optional
from langgraph.graph import StateGraph, START, END
from generation.graph.state import GenerationState
from generation.graph.nodes import (
    prepare_context_node,
    governed_generate_node,
    decompose_claims_node,
)
from generation.services.ollama_client import OllamaClient

def create_generation_workflow(ollama_client: Optional[OllamaClient] = None):
    """
    Constructs and compiles the Governed Generation LangGraph StateGraph:
    START -> prepare_context -> governed_generate -> decompose_claims -> END.
    """
    client = ollama_client or OllamaClient()

    workflow = StateGraph(GenerationState)

    # Define nodes
    workflow.add_node("prepare_context", prepare_context_node)
    
    # Wrap governed_generate_node to bind the ollama_client instance
    def generate_step(state: GenerationState):
        return governed_generate_node(state, ollama_client=client)

    workflow.add_node("governed_generate", generate_step)
    workflow.add_node("decompose_claims", decompose_claims_node)

    # Connect edges
    workflow.add_edge(START, "prepare_context")
    workflow.add_edge("prepare_context", "governed_generate")
    workflow.add_edge("governed_generate", "decompose_claims")
    workflow.add_edge("decompose_claims", END)

    return workflow.compile()
