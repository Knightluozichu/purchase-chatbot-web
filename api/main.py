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
    files: Optional[List[UploadFile]] = None

class SourceDocument(BaseModel):
    pageContent: str
    metadata: dict

class ChatResponse(BaseModel):
    text: str
    sourceDocuments: Optional[List[SourceDocument]] = None

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    apiKey: str = Form(...)
):
    try:
        file_contents = []
        for file in files:
            content = await file.read()
            file_contents.append(FileContent(
                content=content,
                mime_type=file.content_type,
                metadata={"filename": file.filename}
            ))
        
        context = await ModelManager.process_files(file_contents, apiKey)
        return {"message": "Files processed successfully", "context": context}
    except Exception as e:
        logger.error(f"Error processing files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    question: str = Form(...),
    model: str = Form(...),
    apiKey: Optional[str] = Form(None),
    files: List[UploadFile] = File([])
):
    logger.debug(f"Received chat request with files: {[f.filename for f in files]}")
    
    try:
        # 处理上传的文件
        file_contents = []
        if files:
            for file in files:
                content = await file.read()
                file_contents.append(FileContent(
                    content=content,
                    mime_type=file.content_type,
                    metadata={"filename": file.filename}
                ))
        
        provider = ModelManager.get_provider(model, apiKey)
        
        # 处理文件并获取相关上下文
        context = None
        if file_contents:
            context = await ModelManager.process_files(file_contents, apiKey)
        
        # 创建带有上下文的消息
        messages = ModelManager.create_messages(question, context)
        
        # 生成响应
        response_text = await provider.generate_response(messages, file_contents)

        return ChatResponse(
            text=response_text,
            sourceDocuments=[SourceDocument(pageContent=ctx, metadata={}) for ctx in (context or [])]
        )
        
    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))