import React, { useState } from 'react';
import { Key } from 'lucide-react';

interface ApiKeyInputProps {
  onKeyChange: (key: string) => void;
}

export function ApiKeyInput({ onKeyChange }: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Key size={16} className="text-gray-500" />
      <input
        type={showKey ? 'text' : 'password'}
        placeholder="Enter API Key"
        onChange={(e) => onKeyChange(e.target.value)}
        className="bg-white border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={() => setShowKey(!showKey)}
        className="text-xs text-gray-500 hover:text-gray-700"
      >
        {showKey ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}