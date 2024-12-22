import { ModelType, LLMResponse } from '../../types/model';
import { checkAPIHealth } from './health';
import { logger } from '../../utils/logger';
import { APIClient } from './client';
import { LLMError } from '../../utils/errors';
import { ModelManager } from '../model/modelManager';

export async function queryLLM(question: string, formData?: FormData): Promise<LLMResponse> {
  logger.info('Querying LLM', { question });

  const modelManager = ModelManager.getInstance();
  const model = formData?.get('model') as ModelType;
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
    if (formData) {
      formData.append('apiKey', apiKey);
    }
  }

  // Check API health
  const isAPIHealthy = await checkAPIHealth();
  if (!isAPIHealthy) {
    throw new LLMError('API service is not available. Please start the server.');
  }

  try {
    const client = APIClient.getInstance();
    
    // If no FormData provided, create minimal request
    if (!formData) {
      const minimalFormData = new FormData();
      minimalFormData.append('question', question);
      minimalFormData.append('model', model);
      formData = minimalFormData;
    }

    const response = await client.request<LLMResponse>({
      method: 'POST',
      endpoint: '/api/chat',
      data: formData,
      isFormData: true
    });

    logger.info('LLM query successful');
    return response;
  } catch (error) {
    logger.error('LLM query failed', error);
    throw error;
  }
}