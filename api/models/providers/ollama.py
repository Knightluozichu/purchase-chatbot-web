import httpx
from typing import Optional, List
from fastapi import HTTPException
from langchain_core.messages import BaseMessage
from .base import LLMProvider, ModelConfig, FileContent

class OllamaProvider(LLMProvider):
    OLLAMA_URL = "http://localhost:11434/api/generate"
    
    def __init__(self, config: ModelConfig):
        self.model_name = config.name.replace("ollama/", "")
    
    async def generate_response(
        self, 
        messages: list[BaseMessage],
        files: Optional[List[FileContent]] = None
    ) -> str:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.OLLAMA_URL,
                    json={
                        "model": self.model_name,
                        "prompt": messages[-1].content,
                        "stream": False
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Ollama request failed: {response.text}"
                    )
                    
                result = response.json()
                return result["response"]
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail="Failed to connect to Ollama service"
            )