import { LLMResponse, ModelType } from '../../types/model';
import { APIClient } from './client';
import { checkAPIHealth } from './health';
import { logger } from '../../utils/logger';
import { LLMError } from '../../utils/errors';
import { ModelManager } from '../model/modelManager';
import { buildChatRequest } from './request/chatRequest';

export async function queryLLM(question: string, model: ModelType): Promise<LLMResponse> {
  logger.info('Querying LLM', { question, model });

  const modelManager = ModelManager.getInstance();
  const modelConfig = modelManager.getModelConfig(model);

  if (!modelConfig) {
    throw new LLMError('Invalid model selected');
  }

  // Check if API key is required and present
  const apiKey = !modelConfig.isLocal ? localStorage.getItem('llm_api_key') : undefined;
  if (!modelConfig.isLocal && !apiKey) {
    throw new LLMError('API key is required for cloud models');
  }

  // Check API health
  const isAPIHealthy = await checkAPIHealth();
  if (!isAPIHealthy) {
    throw new LLMError('API service is not available. Please start the server.');
  }

  try {
    const client = APIClient.getInstance();
    const formData = buildChatRequest(question, model, apiKey);

    const response = await client.request<LLMResponse>({
      method: 'POST',
      endpoint: '/api/chat',
      data: formData,
      isFormData: true
    });

    logger.info('LLM query successful', { model });
    return response;
  } catch (error) {
    logger.error('LLM query failed', { error, model });
    throw error;
  }
}