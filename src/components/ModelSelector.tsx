import React, { useCallback } from 'react';
import { Settings } from 'lucide-react';
import { ModelType } from '../types/model';
import { availableModels } from '../config/models';
import { useModelManager } from '../hooks/useModelManager';

interface ModelSelectorProps {
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
  disabled?: boolean;
}

export function ModelSelector({ currentModel, onModelChange, disabled }: ModelSelectorProps) {
  const { requiresApiKey } = useModelManager();
  const selectedModel = availableModels.find(m => m.id === currentModel);

  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!disabled) {
      const newModel = e.target.value as ModelType;
      onModelChange(newModel);
    }
  }, [onModelChange, disabled]);

  const localModels = availableModels.filter(model => model.isLocal);
  const cloudModels = availableModels.filter(model => !model.isLocal);

  return (
    <div className="flex items-center gap-2">
      <Settings size={16} className="text-gray-500" />
      <div className="relative">
        <select
          value={currentModel}
          onChange={handleModelChange}
          disabled={disabled}
          className={`
            appearance-none bg-white border border-gray-300 rounded-md py-1 px-2 pr-8 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          `}
        >
          {localModels.length > 0 && (
            <optgroup label="Local Models">
              {localModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </optgroup>
          )}
          {cloudModels.length > 0 && (
            <optgroup label="Cloud Models">
              {cloudModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {selectedModel && (
        <span className="text-xs text-gray-500">{selectedModel.description}</span>
      )}
      {requiresApiKey(currentModel) && (
        <span className="text-xs text-yellow-600">Requires API key</span>
      )}
    </div>
  );
}