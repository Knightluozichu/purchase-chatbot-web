import { ModelType, LLMResponse } from '../../../types/model';
import { ModelHealthCheck } from '../types';
import { logger } from '../../../utils/logger';

export class OllamaProvider {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async checkHealth(): Promise<ModelHealthCheck> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return {
        isHealthy: response.ok,
        message: response.ok ? undefined : 'Ollama service is not available'
      };
    } catch (error) {
      logger.warn('Ollama health check failed', error);
      return {
        isHealthy: false,
        message: 'Unable to connect to Ollama service'
      };
    }
  }

  getModelName(modelId: ModelType): string {
    return modelId.replace('ollama/', '');
  }
}