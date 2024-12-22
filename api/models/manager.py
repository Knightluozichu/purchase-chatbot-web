from typing import Optional, List
from langchain_core.messages import SystemMessage, HumanMessage
from .providers.base import FileContent
from .providers import (
    ModelConfig,
    OpenAIProvider,
    AnthropicProvider,
    OllamaProvider
)
from .document_processor import DocumentProcessor

DEFAULT_SYSTEM_PROMPT = """You are a helpful AI assistant. Analyze all provided content and context to give clear, accurate, and concise responses."""

class ModelManager:
    @staticmethod
    def get_provider(model: str, api_key: Optional[str] = None):
        config = ModelConfig(
            name=model,
            temperature=0.7,
            supports_vision=model in ["gpt-4-vision-preview"],
            supports_audio=False
        )
        
        if model.startswith("ollama/"):
            return OllamaProvider(config)
        elif model.startswith("gpt-"):
            return OpenAIProvider(config, api_key)
        elif model == "claude-2":
            return AnthropicProvider(config, api_key)
        else:
            raise ValueError(f"Unsupported model: {model}")
    
    @staticmethod
    async def process_files(files: List[FileContent], api_key: str) -> List[str]:
        processor = DocumentProcessor(api_key)
        return await processor.process_files(files)

    @staticmethod
    def create_messages(question: str, context: Optional[List[str]] = None) -> list:
        messages = [SystemMessage(content=DEFAULT_SYSTEM_PROMPT)]
        
        if context:
            context_str = "\n\n".join(context)
            messages.append(SystemMessage(
                content=f"Context:\n{context_str}\n\nUse this context to help answer the question."
            ))
        
        messages.append(HumanMessage(content=question))
        return messages