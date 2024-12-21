import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatAnthropic } from 'langchain/chat_models/anthropic';
import { VectorStoreManager } from './vectorStore';
import { ModelType, LLMResponse } from '../types/llm';

export class LLMService {
  private static instance: LLMService;
  private currentModel: ModelType = 'gpt-3.5-turbo';
  private apiKey: string = '';
  private vectorStore: VectorStoreManager;

  private constructor() {
    this.vectorStore = VectorStoreManager.getInstance();
  }

  static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  setModel(model: ModelType) {
    this.currentModel = model;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  private getModelInstance() {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    switch (this.currentModel) {
      case 'claude-2':
        return new ChatAnthropic({
          modelName: 'claude-2',
          temperature: 0.7,
          anthropicApiKey: this.apiKey,
        });
      case 'gpt-4':
        return new ChatOpenAI({
          modelName: 'gpt-4',
          temperature: 0.7,
          openAIApiKey: this.apiKey,
        });
      default:
        return new ChatOpenAI({
          modelName: 'gpt-3.5-turbo',
          temperature: 0.7,
          openAIApiKey: this.apiKey,
        });
    }
  }

  async query(question: string): Promise<LLMResponse> {
    const model = this.getModelInstance();
    const relevantDocs = await this.vectorStore.similaritySearch(question);
    
    const context = relevantDocs
      .map(doc => doc.pageContent)
      .join('\n\n');

    const response = await model.predict(
      `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`
    );

    return {
      text: response,
      sourceDocuments: relevantDocs,
    };
  }
}