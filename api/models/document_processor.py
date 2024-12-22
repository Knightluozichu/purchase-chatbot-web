from typing import List
import tempfile
import os
import logging
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from .document_loaders import DocumentLoaderFactory
from .providers.base import FileContent

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
        errors = []
        
        for file in files:
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                try:
                    # Write file content
                    temp_file.write(file.content)
                    temp_file.flush()
                    
                    # Create loader
                    loader = DocumentLoaderFactory.create_loader(temp_file.name)
                    if loader:
                        try:
                            docs = await self._load_and_split(loader)
                            documents.extend(docs)
                        except Exception as e:
                            error_msg = f"Error processing file {file.metadata.get('filename')}: {str(e)}"
                            logger.error(error_msg)
                            errors.append(error_msg)
                    else:
                        logger.warning(f"No suitable loader found for file: {file.metadata.get('filename')}")
                
                except Exception as e:
                    error_msg = f"Error handling file {file.metadata.get('filename')}: {str(e)}"
                    logger.error(error_msg)
                    errors.append(error_msg)
                
                finally:
                    # Clean up
                    try:
                        os.unlink(temp_file.name)
                    except Exception as e:
                        logger.error(f"Error cleaning up temporary file: {str(e)}")

        if errors:
            logger.error("Document processing completed with errors:", errors)
        
        if documents:
            try:
                self.vector_store = FAISS.from_documents(documents, self.embeddings)
            except Exception as e:
                logger.error(f"Error creating vector store: {str(e)}")
                raise
        
        return [doc.page_content for doc in documents]

    async def _load_and_split(self, loader):
        try:
            documents = await loader.load()
            return self.text_splitter.split_documents(documents)
        except Exception as e:
            logger.error(f"Error in load_and_split: {str(e)}")
            raise