from typing import Protocol, List, Optional
from dataclasses import dataclass
from langchain_core.messages import BaseMessage
from pydantic import BaseModel

class FileContent(BaseModel):
    file_name: str            # 新增此字段
    content: bytes            # 已经存在
    mime_type: str            # 已经存在
    metadata: dict            # 已经存在

    class Config:
        arbitrary_types_allowed = True

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