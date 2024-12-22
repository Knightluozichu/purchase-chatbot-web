import { LLMResponse, ModelType } from '../../types/model';
import { APIClient } from './client';
import { checkAPIHealth } from './health';
import { logger } from '../../utils/logger';
import { LLMError } from '../../utils/errors';
import { ModelManager } from '../model/modelManager';

export async function queryLLM(question: string, model: ModelType): Promise<LLMResponse> {
  logger.info('Querying LLM', { question, model });
  
  const modelManager = ModelManager.getInstance();
  const modelConfig = modelManager.getModelConfig(model);
  
  if (!modelConfig) {
    throw new LLMError('Invalid model selected');
  }

  // Check if API key is required and present
  if (!modelConfig.isLocal) {
    const apiKey = localStorage.getItem('llm_api_key');
    if (!apiKey) {
      throw new LLMError('API key is required for cloud models');
    }
  }

  // Check API health
  const isAPIHealthy = await checkAPIHealth();
  if (!isAPIHealthy) {
    throw new LLMError('API service is not available. Please start the server.');
  }

  // For local models, check Ollama health
  if (modelConfig.isLocal) {
    const isOllamaHealthy = await checkOllamaHealth();
    if (!isOllamaHealthy) {
      throw new LLMError('Ollama service is not available. Please ensure Ollama is running.');
    }
  }

  try {
    const client = APIClient.getInstance();
    const response = await client.request<LLMResponse>({
      method: 'POST',
      endpoint: '/api/chat',
      data: { 
        question, 
        model,
        apiKey: !modelConfig.isLocal ? localStorage.getItem('llm_api_key') : undefined
      },
    });

    logger.info('LLM query successful', { model });
    return response;
  } catch (error) {
    logger.error('LLM query failed', { error, model });
    throw error;
  }
}