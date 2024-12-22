import { useState, useCallback, useEffect } from 'react';
import { ModelType } from '../types/model';
import { ModelManager } from '../services/model/modelManager';
import { ModelService } from '../services/model/modelService';
import { useNotification } from '../components/Notification';
import { logger } from '../utils/logger';

export function useModelSelection() {
  const [currentModel, setCurrentModel] = useState<ModelType>('gpt-3.5-turbo');
  const { showNotification } = useNotification();
  const modelManager = ModelManager.getInstance();
  const modelService = ModelService.getInstance();

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const { isHealthy, message } = await modelManager.checkModelAvailability(currentModel);
        
        if (!isHealthy && message) {
          showNotification({
            type: 'warning',
            message
          });
        }
      } catch (error) {
        logger.error('Failed to check model availability', error);
      }
    };

    checkAvailability();
  }, [currentModel, showNotification]);

  const switchModel = useCallback((modelId: ModelType) => {
    try {
      modelManager.validateModel(modelId);
      
      logger.info('Switching model', { from: currentModel, to: modelId });
      setCurrentModel(modelId);
      
      const model = modelManager.getModelConfig(modelId);
      if (model) {
        showNotification({
          type: 'info',
          message: `Switched to ${model.name}`
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Invalid model selection'
      });
    }
  }, [currentModel, showNotification]);

  const queryModel = useCallback(async (question: string): Promise<string> => {
    try {
      const response = await modelService.query(question, currentModel);
      return response.text;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to query model';
      logger.error('Model query failed', { error, model: currentModel });
      throw new Error(message);
    }
  }, [currentModel]);

  return {
    currentModel,
    switchModel,
    queryModel
  };
}