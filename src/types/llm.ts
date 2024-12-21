export type ModelType = 
  | 'gpt-3.5-turbo' 
  | 'gpt-4' 
  | 'claude-2'
  | 'ollama/llama2'
  | 'ollama/mistral'
  | 'ollama/codellama';

export interface ModelConfig {
  id: ModelType;
  name: string;
  description: string;
  provider: 'openai' | 'anthropic' | 'ollama';
}

export interface LLMResponse {
  text: string;
  sourceDocuments?: Array<{
    pageContent: string;
    metadata: Record<string, any>;
  }>;
}