import { useState, useCallback } from 'react';
import { Chat, Message } from '../types';
import { generateChatId, generateChatName } from '../utils/chat';
import { logger } from '../utils/logger';

interface HandleMessageParams {
  content: string;
  files?: File[];
  chats: Chat[];
  currentChatId: string;
  isOffline: boolean;
  queryLLM: (content: string) => Promise<any>;
}

interface HandleMessageResult {
  updatedChats: Chat[];
  error?: string;
}

export function useChatMessages() {
  const [isTyping, setIsTyping] = useState(false);

  const handleMessage = useCallback(async ({
    content,
    files,
    chats,
    currentChatId,
    isOffline,
    queryLLM
  }: HandleMessageParams): Promise<HandleMessageResult> => {
    const userMessage: Message = {
      id: generateChatId(),
      content,
      role: 'user',
      timestamp: new Date(),
      files: files?.map(file => file.name),
    };

    let updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        const updatedMessages = [...chat.messages, userMessage];
        return {
          ...chat,
          messages: updatedMessages,
          name: chat.messages.length === 1 ? generateChatName([userMessage]) : chat.name
        };
      }
      return chat;
    });

    if (isOffline) {
      const offlineMessage: Message = {
        id: generateChatId(),
        content: "I'm currently in offline mode. Please start the API server to interact with me.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      updatedChats = updatedChats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, offlineMessage] }
          : chat
      );
      
      return { updatedChats };
    }

    setIsTyping(true);
    try {
      logger.info('Sending message to LLM');
      const response = await queryLLM(content);
      
      const botMessage: Message = {
        id: generateChatId(),
        content: response.text,
        role: 'assistant',
        timestamp: new Date(),
        sourceDocuments: response.sourceDocuments,
      };
      
      updatedChats = updatedChats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, botMessage] }
          : chat
      );

      return { updatedChats };
    } catch (error) {
      logger.error('Error in chat message handling', error);
      return {
        updatedChats,
        error: 'Failed to get response. Please ensure the API server is running.'
      };
    } finally {
      setIsTyping(false);
    }
  }, []);

  return {
    isTyping,
    handleMessage
  };
}