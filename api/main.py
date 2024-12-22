from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import logging
import sys
from dotenv import load_dotenv
from models.manager import ModelManager
from models.providers.base import FileContent

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
load_dotenv(".env.local")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    question: str = Form(...),
    model: str = Form(...),
    apiKey: Optional[str] = Form(None),
    files: List[UploadFile] = File(None)
):
    logger.debug(f"Received request: {question}")
    logger.info(f"Received chat request for model: {model}")
    
    try:
        provider = ModelManager.get_provider(model, apiKey)
        
        # Process files if provided
        context = []
        if files:
            file_contents = []
            for file in files:
                content = await file.read()
                file_contents.append(FileContent(
                    content=content,
                    mime_type=file.content_type or "application/octet-stream",
                    metadata={"filename": file.filename}
                ))
            
            if apiKey:
                context = await ModelManager.process_files(file_contents, apiKey)
        
        # Create messages with context
        messages = ModelManager.create_messages(question, context)
        
        # Generate response
        response_text = await provider.generate_response(messages)

        return ChatResponse(
            text=response_text,
            sourceDocuments=[SourceDocument(pageContent=ctx, metadata={}) for ctx in context]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )