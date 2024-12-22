import React from 'react';
import { Settings } from 'lucide-react';
import { ModelType } from '../types/model';
import { availableModels } from '../config/models';

interface ModelSelectorProps {
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
  disabled?: boolean;
}

export function ModelSelector({ currentModel, onModelChange, disabled }: ModelSelectorProps) {
  const selectedModel = availableModels.find(m => m.id === currentModel);

  return (
    <div className="flex items-center gap-2">
      <Settings size={16} className="text-gray-500" />
      <select
        value={currentModel}
        onChange={(e) => onModelChange(e.target.value as ModelType)}
        disabled={disabled}
        className="bg-white border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <optgroup label="Local Models">
          {availableModels
            .filter(model => model.isLocal)
            .map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
        </optgroup>
        <optgroup label="Cloud Models">
          {availableModels
            .filter(model => !model.isLocal)
            .map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
        </optgroup>
      </select>
      {selectedModel && (
        <span className="text-xs text-gray-500">{selectedModel.description}</span>
      )}
    </div>
  );
}