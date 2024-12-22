from typing import Optional, Protocol
from langchain.schema import BaseMessage

class LLMProvider(Protocol):
    async def generate_response(self, messages: list[BaseMessage]) -> str:
        pass

class ModelConfig:
    def __init__(self, name: str, temperature: float = 0.7):
        self.name = name
        self.temperature = temperature