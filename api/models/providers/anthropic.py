from typing import Optional
from langchain_community.chat_models import ChatAnthropic
from langchain_core.messages import BaseMessage
from .base import LLMProvider, ModelConfig

class AnthropicProvider(LLMProvider):
    def __init__(self, config: ModelConfig, api_key: Optional[str]):
        self.llm = ChatAnthropic(
            model=config.name,
            temperature=config.temperature,
            anthropic_api_key=api_key,
            streaming=True
        )
    
    async def generate_response(self, messages: list[BaseMessage]) -> str:
        response = await self.llm.agenerate([messages])
        return response.generations[0][0].text