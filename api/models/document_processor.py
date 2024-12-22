import mimetypes
from typing import List
import tempfile
import os
import logging
# from langchain_community.embeddings import OpenAIEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from .document_loaders import DocumentLoaderFactory
from .providers.base import FileContent
from langchain_community.document_loaders import UnstructuredPDFLoader, UnstructuredImageLoader, TextLoader, Docx2txtLoader

logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self, api_key: str):
        self.embeddings = OpenAIEmbeddings(openai_api_key=api_key)
        self.vector_store = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
    
    async def process_files(self, files: List[FileContent]) -> List[str]:
        documents = []
        for file in files:
            loader = self._get_loader(file)
            if loader:
                docs = await self._load_and_split(loader)
                documents.extend(docs)
        
        if documents:
            self.vector_store = FAISS.from_documents(documents, self.embeddings)
        
        return [doc.page_content for doc in documents]

    async def _load_and_split(self, loader):
        try:
            documents = await loader.load()
            return self.text_splitter.split_documents(documents)
        except Exception as e:
            logger.error(f"Error in load_and_split: {str(e)}")
            raise
    
    async def get_relevant_context(self, query: str, k: int = 3) -> List[str]:
        if not self.vector_store:
            return []
        docs = self.vector_store.similarity_search(query, k=k)
        return [doc.page_content for doc in docs]
    
    def _get_loader(self, file: FileContent):
        # logger.debug(f"_get_loader: {file}")
        mime_type, _ = mimetypes.guess_type(file.file_name)
        if not mime_type:
            # 如果 guess_type 返回 None，fallback 到 file.mime_type
            mime_type = file.mime_type
        if mime_type == "application/pdf":
            return UnstructuredPDFLoader(file.content)
        elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return Docx2txtLoader(file.content)
        elif mime_type and mime_type.startswith("text"):
            return TextLoader(file.content)
        elif mime_type and mime_type.startswith("image"):
            return UnstructuredImageLoader(file.content)
        return None