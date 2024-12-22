import { ModelConfig } from '../types/model';

export const availableModels: ModelConfig[] = [
  {
    id: 'ollama/llama2',
    name: 'Llama 2 (Local)',
    description: 'Open source large language model',
    provider: 'ollama',
    isLocal: true
  },
  {
    id: 'ollama/mistral',
    name: 'Mistral (Local)',
    description: 'Efficient open source model',
    provider: 'ollama',
    isLocal: true
  },
  {
    id: 'ollama/codellama',
    name: 'CodeLlama (Local)',
    description: 'Specialized for code generation',
    provider: 'ollama',
    isLocal: true
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most queries',
    provider: 'openai',
    isLocal: false
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model for complex tasks',
    provider: 'openai',
    isLocal: false
  },
  {
    id: 'claude-2',
    name: 'Claude 2',
    description: 'Balanced performance with strong reasoning',
    provider: 'anthropic',
    isLocal: false
  }
];