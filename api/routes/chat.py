from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List
import logging
from models import ModelManager, FileContent

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/chat")
async def chat(
    question: str = Form(...),
    model: str = Form(...),
    apiKey: Optional[str] = Form(None),
    files: List[UploadFile] = File([])
):
    logger.info(f"Received chat request, question={question}, model={model}")
    logger.debug(f"Uploaded files: {[f.filename for f in files]}")
    
    try:
        # Process uploaded files
        file_contents = []
        if files:
            for file in files:
                logger.debug(f"Reading file: {file.filename}, type: {file.content_type}")
                content = await file.read()
                
                # 关键修改：显式给 FileContent 的 file_name 字段赋值
                file_contents.append(FileContent(
                    file_name=file.filename,       # <- 赋值给 file_name
                    content=content,
                    mime_type=file.content_type,
                    metadata={}
                ))
        
        provider = ModelManager.get_provider(model, apiKey)
        
        # Process files and get context if files are present
        context = None
        if file_contents:
            context = await ModelManager.process_files(file_contents, apiKey)
        
        # Create messages with context
        messages = ModelManager.create_messages(question, context)
        
        # Generate response
        response_text = await provider.generate_response(messages, file_contents)

        return {
            "text": response_text,
            "sourceDocuments": [
                {"pageContent": ctx, "metadata": {}}
                for ctx in (context or [])
            ]
        }
        
    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Server error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))