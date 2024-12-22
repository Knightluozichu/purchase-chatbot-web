import { ModelType, ModelConfig } from '../../types/model';
import { availableModels } from '../../config/models';
import { ModelHealthCheck } from './types';
import { OllamaProvider } from './providers/ollama';
import { logger } from '../../utils/logger';

export class ModelManager {
  private static instance: ModelManager;
  private ollamaProvider: OllamaProvider;

  private constructor() {
    this.ollamaProvider = new OllamaProvider();
  }

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  getModelConfig(modelId: ModelType): ModelConfig | undefined {
    return availableModels.find(m => m.id === modelId);
  }

  async checkModelAvailability(modelId: ModelType): Promise<ModelHealthCheck> {
    const model = this.getModelConfig(modelId);
    if (!model) {
      return {
        isHealthy: false,
        message: `Invalid model: ${modelId}`
      };
    }

    if (model.isLocal) {
      return this.ollamaProvider.checkHealth();
    }

    // Cloud models are always considered available if API is up
    return { isHealthy: true };
  }

  validateModel(modelId: ModelType): void {
    const model = this.getModelConfig(modelId);
    if (!model) {
      throw new Error(`Invalid model: ${modelId}`);
    }
  }

  requiresApiKey(modelId: ModelType): boolean {
    const model = this.getModelConfig(modelId);
    return model?.provider === 'openai' || model?.provider === 'anthropic';
  }
}