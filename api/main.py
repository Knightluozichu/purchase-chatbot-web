from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import httpx
from dotenv import load_dotenv
import os
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

load_dotenv()
load_dotenv(".env.local")
logger.info("key:"+os.getenv("OPENAI_API_KEY"))

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

class ChatRequest(BaseModel):
    question: str
    model: str
    apiKey: Optional[str] = None

class SourceDocument(BaseModel):
    pageContent: str
    metadata: dict

class ChatResponse(BaseModel):
    text: str
    sourceDocuments: Optional[List[SourceDocument]] = None

OLLAMA_URL = "http://localhost:11434/api/generate"
OPENAI_URL = "https://api.openai.com/v1/chat/completions"
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

async def check_ollama_health() -> bool:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OLLAMA_URL}/health")
            return response.status_code == 200
    except:
        return False

async def query_ollama(model: str, prompt: str) -> str:
    logger.info(f"Querying Ollama model: {model}")
    
    if not await check_ollama_health():
        raise HTTPException(
            status_code=503,
            detail="Ollama service is not available"
        )
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": model.replace("ollama/", ""),
                    "prompt": prompt,
                    "stream": False
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Ollama request failed: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to query Ollama: {response.text}"
                )
                
            result = response.json()
            logger.info("Ollama query successful")
            return result["response"]
            
    except httpx.RequestError as e:
        logger.error(f"Network error querying Ollama: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Failed to connect to Ollama service"
        )

async def query_openai(model: str, prompt: str, api_key: Optional[str] = None) -> str:
    # Use provided API key or fallback to environment variable
    logger.info(api_key)
    # load_dotenv('.env.local')
    key = api_key if api_key else os.getenv("OPENAI_API_KEY")
    # print("open ai key:",key)
    logger.info("open ai key:"+key)
    
    if not key:
        raise HTTPException(
            status_code=400,
            detail="OpenAI API key not provided"
        )
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OPENAI_URL,
                headers={"Authorization": f"Bearer {key}"},
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"OpenAI request failed: {response.text}"
                )
                
            result = response.json()
            return result["choices"][0]["message"]["content"]
            
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail="Failed to connect to OpenAI service"
        )

async def query_anthropic(prompt: str, api_key: Optional[str] = None) -> str:
    # Use provided API key or fallback to environment variable
    key = api_key or os.getenv("ANTHROPIC_API_KEY")
    if not key:
        raise HTTPException(
            status_code=400,
            detail="Anthropic API key not provided"
        )
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                ANTHROPIC_URL,
                headers={"x-api-key": key},
                json={
                    "model": "claude-2",
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Anthropic request failed: {response.text}"
                )
                
            result = response.json()
            return result["content"][0]["text"]
            
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail="Failed to connect to Anthropic service"
        )

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    logger.info(f"Received chat request for model: {request.model}")
    try:
        if request.model.startswith("ollama/"):
            response_text = await query_ollama(request.model, request.question)
        elif request.model.startswith("gpt-"):
            response_text = await query_openai(request.model, request.question, request.apiKey)
        elif request.model == "claude-2":
            response_text = await query_anthropic(request.question, request.apiKey)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Model not supported: {request.model}"
            )

        return ChatResponse(
            text=response_text,
            sourceDocuments=[]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )