import { useState, useCallback, useEffect } from 'react';
import { Chat, Message } from '../types';
import { generateChatId, generateChatName } from '../utils/chat';
import { useLLM } from './useLLM';
import { logger } from '../utils/logger';
import { useNotification } from '../components/Notification';
import { useChatMessages } from './useChatMessages';
import { useAPIStatus } from './useAPIStatus';

const INITIAL_MESSAGE: Message = {
  id: '1',
  content: "Hello! I'm your procurement assistant. Please note that I'm currently in offline mode since the API server isn't running. To use the full features, please start the API server.",
  role: 'assistant',
  timestamp: new Date(),
};

export function useChat() {
  const [currentChatId, setCurrentChatId] = useState(generateChatId());
  const [chats, setChats] = useState<Chat[]>([{
    id: currentChatId,
    name: 'New Chat',
    messages: [INITIAL_MESSAGE],
    createdAt: new Date()
  }]);
  const [showHistory, setShowHistory] = useState(false);
  
  const { isTyping, handleMessage } = useChatMessages();
  const { isOffline } = useAPIStatus();
  const { currentModel, switchModel, queryLLM } = useLLM();
  const { showNotification } = useNotification();

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const handleNewChat = useCallback(() => {
    const newChatId = generateChatId();
    setChats(prev => [...prev, {
      id: newChatId,
      name: 'New Chat',
      messages: [INITIAL_MESSAGE],
      createdAt: new Date()
    }]);
    setCurrentChatId(newChatId);
  }, []);

  const handleSendMessage = useCallback(async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;

    const { updatedChats, error } = await handleMessage({
      content,
      files,
      chats,
      currentChatId,
      isOffline,
      queryLLM
    });

    if (error) {
      showNotification({
        type: 'error',
        message: error
      });
    }

    setChats(updatedChats);
  }, [currentChatId, handleMessage, chats, isOffline, queryLLM, showNotification]);

  const handleDeleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (chatId === currentChatId && chats.length > 1) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setCurrentChatId(remainingChats[remainingChats.length - 1].id);
    }
  }, [chats, currentChatId]);

  return {
    currentChatId,
    currentModel,
    chats,
    messages,
    isTyping,
    showHistory,
    isOffline,
    setCurrentChatId,
    setShowHistory,
    switchModel,
    handleNewChat,
    handleSendMessage,
    handleDeleteChat,
  };
}