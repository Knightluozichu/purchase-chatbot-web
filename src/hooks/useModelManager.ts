import { ModelManager } from '../services/model/modelManager';
import { ModelType } from '../types/model';

export function useModelManager() {
  const modelManager = ModelManager.getInstance();

  return {
    requiresApiKey: (modelId: ModelType) => modelManager.requiresApiKey(modelId),
    getModelConfig: (modelId: ModelType) => modelManager.getModelConfig(modelId),
  };
}