import { useState, useCallback } from 'react';
import { ModelType, LLMResponse } from '../types/model';
import { useNotification } from '../components/Notification';
import { logger } from '../utils/logger';
import { APIError, NetworkError } from '../utils/errors';
import { useModelSelection } from './useModelSelection';

export function useLLM() {
  const { currentModel, switchModel, queryModel } = useModelSelection();
  const { showNotification } = useNotification();

  const setApiKey = useCallback((key: string) => {
    logger.info('Setting API key');
    localStorage.setItem('llm_api_key', key);
  }, []);

  const handleQuery = useCallback(async (question: string): Promise<LLMResponse> => {
    try {
      logger.info('Starting LLM query', { model: currentModel });
      const response = await queryModel(question);
      logger.info('LLM query successful');
      return { text: response, sourceDocuments: [] };
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
  }, [currentModel, queryModel, showNotification]);

  return {
    currentModel,
    switchModel,
    setApiKey,
    queryLLM: handleQuery,
  };
}