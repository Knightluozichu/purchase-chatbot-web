import { ModelType, LLMResponse } from '../../types/model';

export interface ModelQueryOptions {
  question: string;
  modelId: ModelType;
}

export interface ModelHealthCheck {
  isHealthy: boolean;
  message?: string;
}

export interface ModelServiceConfig {
  apiBaseUrl: string;
  ollamaBaseUrl: string;
}