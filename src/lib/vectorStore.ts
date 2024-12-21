import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Document } from 'langchain/document';

export class VectorStoreManager {
  private static instance: VectorStoreManager;
  private vectorStore: MemoryVectorStore | null = null;

  private constructor() {}

  static getInstance(): VectorStoreManager {
    if (!VectorStoreManager.instance) {
      VectorStoreManager.instance = new VectorStoreManager();
    }
    return VectorStoreManager.instance;
  }

  async initialize() {
    if (!this.vectorStore) {
      this.vectorStore = await MemoryVectorStore.fromTexts(
        [],
        [],
        new OpenAIEmbeddings()
      );
    }
  }

  async addDocuments(documents: Document[]) {
    if (!this.vectorStore) {
      await this.initialize();
    }
    await this.vectorStore?.addDocuments(documents);
  }

  async similaritySearch(query: string, k = 4) {
    if (!this.vectorStore) {
      await this.initialize();
    }
    return this.vectorStore?.similaritySearch(query, k);
  }
}