import { useState, useCallback } from 'react';
import { ModelType, LLMResponse } from '../types/model';
import { useNotification } from '../components/Notification';
import { logger } from '../utils/logger';
import { APIError, NetworkError } from '../utils/errors';
import { useModelSelection } from './useModelSelection';
import { APIClient } from '../services/api/client';

export function useLLM() {
  const { currentModel, switchModel } = useModelSelection();
  const { showNotification } = useNotification();
  const apiClient = APIClient.getInstance();

  const setApiKey = useCallback((key: string) => {
    logger.info('Setting API key');
    localStorage.setItem('llm_api_key', key);
  }, []);

  const handleQuery = useCallback(async (question: string, formData?: FormData): Promise<LLMResponse> => {
    try {
      logger.info('Starting LLM query', { model: currentModel });
      
      const data = formData || new FormData();
      if (!formData) {
        data.append('question', question);
        data.append('model', currentModel);
        const apiKey = localStorage.getItem('llm_api_key');
        if (apiKey) {
          data.append('apiKey', apiKey);
        }
      }

      const response = await apiClient.request<LLMResponse>({
        method: 'POST',
        endpoint: '/api/chat',
        data,
        isFormData: true
      });

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
  }, [currentModel, apiClient, showNotification]);

  return {
    currentModel,
    switchModel,
    setApiKey,
    queryLLM: handleQuery,
  };
}