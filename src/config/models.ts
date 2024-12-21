import { ModelConfig } from '../types/llm';

export const availableModels: ModelConfig[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most queries',
    provider: 'openai',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model for complex tasks',
    provider: 'openai',
  },
  {
    id: 'claude-2',
    name: 'Claude 2',
    description: 'Balanced performance with strong reasoning',
    provider: 'anthropic',
  },
  {
    id: 'ollama/llama2',
    name: 'Llama 2',
    description: 'Open source large language model',
    provider: 'ollama',
  },
  {
    id: 'ollama/mistral',
    name: 'Mistral',
    description: 'Efficient open source model',
    provider: 'ollama',
  },
  {
    id: 'ollama/codellama',
    name: 'CodeLlama',
    description: 'Specialized for code generation',
    provider: 'ollama',
  },
];