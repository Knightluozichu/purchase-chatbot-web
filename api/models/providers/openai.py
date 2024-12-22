from typing import Optional, List
from langchain_community.chat_models import ChatOpenAI
from langchain_core.messages import BaseMessage
from .base import LLMProvider, ModelConfig, FileContent

class OpenAIProvider(LLMProvider):
    def __init__(self, config: ModelConfig, api_key: Optional[str]):
        self.llm = ChatOpenAI(
            model_name=config.name,
            temperature=config.temperature,
            openai_api_key=api_key,
            streaming=True
        )
    
    async def generate_response(
        self, 
        messages: list[BaseMessage],
        files: Optional[List[FileContent]] = None
    ) -> str:
        # TODO: Handle files if needed for vision models
        response = await self.llm.agenerate([messages])
        return response.generations[0][0].text