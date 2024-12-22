import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import { ModelType } from '../types/model';
import { useModelManager } from '../hooks/useModelManager';

interface ApiKeyInputProps {
  currentModel: ModelType;
  onKeyChange: (key: string) => void;
  disabled?: boolean;
}

export function ApiKeyInput({ currentModel, onKeyChange, disabled }: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [key, setKey] = useState('');
  const { requiresApiKey } = useModelManager();

  // Load saved key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('llm_api_key');
    if (savedKey) {
      setKey(savedKey);
      onKeyChange(savedKey);
    }
  }, [onKeyChange]);

  const handleKeyChange = (value: string) => {
    setKey(value);
    onKeyChange(value);
    localStorage.setItem('llm_api_key', value);
  };

  if (!requiresApiKey(currentModel)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Key size={16} className="text-gray-500" />
      <input
        type={showKey ? 'text' : 'password'}
        value={key}
        placeholder="Enter API Key"
        onChange={(e) => handleKeyChange(e.target.value)}
        disabled={disabled}
        className="bg-white border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={() => setShowKey(!showKey)}
        disabled={disabled}
        className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {showKey ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}