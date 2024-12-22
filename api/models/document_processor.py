from typing import List
import mimetypes
from langchain_community.document_loaders import (
    TextLoader,
    UnstructuredPDFLoader as PDFLoader,
    Docx2txtLoader,
    UnstructuredImageLoader,
    # 移除 UnstructuredAudioLoader
)
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from .providers.base import FileContent

class DocumentProcessor:
    def __init__(self, api_key: str):
        self.embeddings = OpenAIEmbeddings(openai_api_key=api_key)
        self.vector_store = None

    async def process_files(self, files: List[FileContent]) -> List[Document]:
        documents = []
        for file in files:
            loader = self._get_loader(file)
            if loader:
                docs = await self._load_and_split(loader)
                documents.extend(docs)
        
        if documents:
            self.vector_store = FAISS.from_documents(documents, self.embeddings)
        
        return documents

    def _get_loader(self, file: FileContent):
        mime_type = file.mime_type
        if mime_type.startswith('text/'):
            return TextLoader(file.content)
        elif mime_type == 'application/pdf':
            return PDFLoader(file.content)
        elif mime_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return Docx2txtLoader(file.content)
        elif mime_type.startswith('image/'):
            return UnstructuredImageLoader(file.content)
        # elif mime_type.startswith('audio/'):
        #     return UnstructuredAudioLoader(file.content)
        return None

    async def _load_and_split(self, loader) -> List[Document]:
        try:
            documents = loader.load()
            # Add basic text splitting if needed
            return documents
        except Exception as e:
            print(f"Error loading document: {str(e)}")
            return []

    async def get_relevant_context(self, query: str, k: int = 3) -> List[Document]:
        if not self.vector_store:
            return []
        return self.vector_store.similarity_search(query, k=k)