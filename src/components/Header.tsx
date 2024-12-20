import React from 'react';
import { MessageSquare, Plus, History, LogOut, User } from 'lucide-react';
import { User as UserType } from '../types/auth';

interface HeaderProps {
  onNewChat: () => void;
  onToggleHistory: () => void;
  showHistory: boolean;
  user: UserType | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

export function Header({ 
  onNewChat, 
  onToggleHistory, 
  showHistory, 
  user, 
  onAuthClick, 
  onLogout 
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-8 h-8 text-blue-500" />
        <h1 className="text-xl font-semibold text-gray-800">Procurement Assistant</h1>
      </div>
      <nav className="flex items-center gap-4">
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