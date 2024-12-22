from typing import Protocol, List, Optional
from dataclasses import dataclass
from langchain_core.messages import BaseMessage
from pydantic import BaseModel

class FileContent(BaseModel):
    content: bytes  # Changed from str to bytes
    mime_type: str
    metadata: dict

    class Config:
        arbitrary_types_allowed = True  # Allow bytes type

@dataclass
class ModelConfig:
    name: str
    temperature: float = 0.7
    supports_vision: bool = False
    supports_audio: bool = False

class LLMProvider(Protocol):
    async def generate_response(
        self, 
        messages: list[BaseMessage], 
        files: Optional[List[FileContent]] = None
    ) -> str:
        pass