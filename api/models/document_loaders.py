from typing import Optional
from langchain_community.document_loaders import (
    TextLoader,
    UnstructuredPDFLoader,
    Docx2txtLoader,
    UnstructuredImageLoader,
)
import logging
import mimetypes
import os

logger = logging.getLogger(__name__)

class DocumentLoaderFactory:
    """Factory for creating document loaders based on file type"""
    
    @staticmethod
    def get_mime_type(filename: str) -> Optional[str]:
        """Get MIME type for a given filename"""
        mime_type, _ = mimetypes.guess_type(filename)
        if not mime_type:
            # Fallback to extension-based detection
            ext = os.path.splitext(filename)[1].lower()
            mime_map = {
                '.txt': 'text/plain',
                '.pdf': 'application/pdf',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.doc': 'application/msword',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png'
            }
            mime_type = mime_map.get(ext)
        return mime_type
    
    @staticmethod
    def create_loader(file_path: str) -> Optional[any]:
        """Create appropriate document loader based on file type"""
        try:
            mime_type = DocumentLoaderFactory.get_mime_type(file_path)
            logger.debug(f"Creating loader for MIME type: {mime_type}, file: {file_path}")

            if not mime_type:
                logger.warning(f"Unknown file type for: {file_path}")
                return None

            # Get file extension as fallback
            ext = os.path.splitext(file_path)[1].lower()

            if mime_type == "application/pdf" or ext == '.pdf':
                return UnstructuredPDFLoader(file_path)
            elif mime_type in [
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/msword"
            ] or ext in ['.docx', '.doc']:
                return Docx2txtLoader(file_path)
            elif mime_type.startswith("text") or ext in ['.txt', '.md']:
                return TextLoader(file_path)
            elif mime_type.startswith("image") or ext in ['.jpg', '.jpeg', '.png']:
                return UnstructuredImageLoader(file_path)
            else:
                logger.warning(f"No loader available for MIME type: {mime_type}, extension: {ext}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating loader: {str(e)}")
            raise