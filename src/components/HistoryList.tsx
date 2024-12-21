import React from 'react';
import { Trash2 } from 'lucide-react';
import { Chat } from '../types';

interface HistoryListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function HistoryList({ chats, selectedChatId, onSelectChat, onDeleteChat }: HistoryListProps) {
  return (
    <div className="w-64 bg-white border-l">
      <h2 className="px-4 py-3 text-lg font-semibold border-b">History</h2>
      <div className="overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 ${
              selectedChatId === chat.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <span className="truncate flex-1">{chat.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
