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

class SourceDocument(BaseModel):
    pageContent: str
    metadata: dict

class ChatResponse(BaseModel):
    text: str
    sourceDocuments: Optional[List[SourceDocument]] = None

OLLAMA_URL = "http://localhost:11434/api/generate"

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

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    logger.info(f"Received chat request for model: {request.model}")
    try:
        if request.model.startswith("ollama/"):
            response_text = await query_ollama(request.model, request.question)
        else:
            logger.error(f"Unsupported model: {request.model}")
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