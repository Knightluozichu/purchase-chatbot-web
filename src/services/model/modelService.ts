import { ModelType, LLMResponse } from '../../types/model';
import { availableModels } from '../../config/models';
import { APIClient } from '../api/client';
import { logger } from '../../utils/logger';
import { checkAPIHealth } from '../api/health';

export class ModelService {
  private static instance: ModelService;
  private apiClient: APIClient;

  private constructor() {
    this.apiClient = APIClient.getInstance();
  }

  static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  isLocalModel(modelId: ModelType): boolean {
    const model = availableModels.find(m => m.id === modelId);
    return model?.isLocal ?? false;
  }

  async checkOllamaHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:11434/api/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async query(question: string, modelId: ModelType): Promise<LLMResponse> {
    // First check API health
    const isApiHealthy = await checkAPIHealth();
    if (!isApiHealthy) {
      throw new Error('API server is not available. Please start the server.');
    }

    const isLocal = this.isLocalModel(modelId);
    logger.info(`Querying ${isLocal ? 'local' : 'cloud'} model: ${modelId}`);

    // For local models, check Ollama health
    if (isLocal) {
      const isOllamaHealthy = await this.checkOllamaHealth();
      if (!isOllamaHealthy) {
        throw new Error('Local model unavailable. Please ensure Ollama is running.');
      }
    }

    try {
      const formData = new FormData();
      formData.append('question', question);
      formData.append('model', modelId);
      
      // Add API key for cloud models
      if (!isLocal) {
        const apiKey = localStorage.getItem('llm_api_key');
        if (apiKey) {
          formData.append('apiKey', apiKey);
        }
      }

      const response = await this.apiClient.request<LLMResponse>({
        method: 'POST',
        endpoint: '/api/chat',
        data: formData,
        isFormData: true
      });

      return response;
    } catch (error) {
      logger.error('Model query failed', { error, modelId });
      throw error;
    }
  }
}