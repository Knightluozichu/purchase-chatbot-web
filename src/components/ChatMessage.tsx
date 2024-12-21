import React from 'react';
import { FileText } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm md:text-base">{message.content}</p>
        {message.files && message.files.length > 0 && (
          <div className="mt-2 border-t border-opacity-20 pt-2">
            {message.files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <FileText size={16} />
                <span>{file}</span>
              </div>
            ))}
          </div>
        )}
        <span className="text-xs opacity-70 block mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
