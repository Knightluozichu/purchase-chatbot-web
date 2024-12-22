import os
import logging
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

def get_file_info(filename: str) -> Tuple[str, Optional[str]]:
    """
    Get file extension and mime type for a given filename
    Returns: (extension, mime_type)
    """
    ext = os.path.splitext(filename)[1].lower()
    
    # Common MIME types mapping
    MIME_TYPES = {
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.csv': 'text/csv',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
    }
    
    mime_type = MIME_TYPES.get(ext)
    return ext, mime_type

def is_supported_file_type(filename: str) -> bool:
    """Check if the file type is supported"""
    _, mime_type = get_file_info(filename)
    if not mime_type:
        logger.warning(f"Unsupported file type: {filename}")
        return False
    return True