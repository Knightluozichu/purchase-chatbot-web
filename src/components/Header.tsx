import React from 'react';
import { MessageSquare, Plus, History, LogOut, User, WifiOff } from 'lucide-react';
import { User as UserType } from '../types/auth';
import { ModelSelector } from './ModelSelector';
import { ApiKeyInput } from './ApiKeyInput';
import { ModelType } from '../types/model';

interface HeaderProps {
  onNewChat: () => void;
  onToggleHistory: () => void;
  showHistory: boolean;
  user: UserType | null;
  onAuthClick: () => void;
  onLogout: () => void;
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
  onApiKeyChange: (key: string) => void;
  isOffline?: boolean;
}

export function Header({ 
  onNewChat, 
  onToggleHistory, 
  showHistory, 
  user, 
  onAuthClick, 
  onLogout,
  currentModel,
  onModelChange,
  onApiKeyChange,
  isOffline = false,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-8 h-8 text-blue-500" />
        <h1 className="text-xl font-semibold text-gray-800">Chat Assistant</h1>
        {isOffline && (
          <div className="flex items-center gap-1 px-2 py-1 text-sm text-yellow-700 bg-yellow-50 rounded-full">
            <WifiOff size={14} />
            <span>API Offline</span>
          </div>
        )}
      </div>
      <nav className="flex items-center gap-4">
        <div className="flex items-center gap-4 border-r pr-4 mr-4">
          <ModelSelector 
            currentModel={currentModel} 
            onModelChange={onModelChange} 
            disabled={isOffline} 
          />
          <ApiKeyInput 
            onKeyChange={onApiKeyChange} 
            disabled={isOffline} 
          />
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <Plus size={16} />
          New Chat
        </button>
        <button
          onClick={onToggleHistory}
          className={`flex items-center gap-1 text-sm ${
            showHistory ? 'text-blue-500' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <History size={16} />
          History
        </button>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onAuthClick}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <User size={16} />
            Login
          </button>
        )}
      </nav>
    </header>
  );
}