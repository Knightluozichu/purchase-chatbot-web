import { useState, useCallback } from 'react';
import { ModelType, LLMResponse } from '../types/llm';
import { queryLLM, checkAPIHealth } from '../services/api';
import { useNotification } from '../components/Notification';
import { logger } from '../utils/logger';
import { APIError, NetworkError } from '../utils/errors';

export function useLLM() {
  const [currentModel, setCurrentModel] = useState<ModelType>('ollama/llama2');
  const { showNotification } = useNotification();

  const checkAPIAvailability = useCallback(async () => {
    try {
      return await checkAPIHealth();
    } catch (error) {
      logger.error('API health check failed', error);
      return false;
    }
  }, []);

  const switchModel = useCallback((model: ModelType) => {
    logger.info('Switching model', { from: currentModel, to: model });
    setCurrentModel(model);
  }, [currentModel]);

  const setApiKey = useCallback((key: string) => {
    logger.info('Setting API key');
    localStorage.setItem('llm_api_key', key);
  }, []);

  const handleQuery = useCallback(async (question: string): Promise<LLMResponse> => {
    try {
      logger.info('Starting LLM query', { model: currentModel });
      const response = await queryLLM(question, currentModel);
      logger.info('LLM query successful');
      return response;
    } catch (error) {
      let message = 'An unexpected error occurred';
      
      if (error instanceof APIError) {
        message = `API Error: ${error.message}`;
      } else if (error instanceof NetworkError) {
        message = 'Unable to connect to the server. Please check your connection.';
      }

      logger.error('LLM query failed', error);
      showNotification({
        type: 'error',
        message
      });
      throw error;
    }
  }, [currentModel, showNotification]);

  return {
    currentModel,
    switchModel,
    setApiKey,
    queryLLM: handleQuery,
    checkAPIAvailability,
  };
}