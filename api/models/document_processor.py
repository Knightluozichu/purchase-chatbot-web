from typing import List
import mimetypes
from langchain_community.document_loaders import (
    TextLoader,
    UnstructuredPDFLoader,
    Docx2txtLoader,
    UnstructuredImageLoader,
)
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from .providers.base import FileContent

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

    async def get_relevant_context(self, query: str, k: int = 3) -> List[str]:
        if not self.vector_store:
            return []
        docs = self.vector_store.similarity_search(query, k=k)
        return [doc.page_content for doc in docs]