import { LLMResponse, ModelType } from '../../types/llm';
import { APIClient } from './client';
import { checkAPIHealth } from './health';
import { logger } from '../../utils/logger';
import { LLMError } from '../../utils/errors';

export async function queryLLM(question: string, model: ModelType): Promise<LLMResponse> {
  logger.info('Querying LLM', { question, model });
  
  const isHealthy = await checkAPIHealth();
  if (!isHealthy) {
    const error = new LLMError('API service is not available');
    logger.error('API is not available', error);
    throw error;
  }

  const client = APIClient.getInstance();
  return client.request<LLMResponse>({
    method: 'POST',
    endpoint: '/api/chat',
    data: { question, model },
  });
}