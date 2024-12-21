import React from 'react';
import { Settings } from 'lucide-react';
import { ModelType } from '../types/llm';
import { availableModels } from '../config/models';

interface ModelSelectorProps {
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

export function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Settings size={16} className="text-gray-500" />
      <select
        value={currentModel}
        onChange={(e) => onModelChange(e.target.value as ModelType)}
        className="bg-white border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {availableModels.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}