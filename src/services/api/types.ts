import { LLMResponse, ModelType } from '../../types/llm';

export interface APIConfig {
  baseUrl: string;
  retryConfig: RetryConfig;
}

export interface RetryConfig {
  maxRetries: number;
  delayMs: number;
}

export interface APIRequestOptions {
  method: string;
  endpoint: string;
  data?: any;
  retries?: number;
}