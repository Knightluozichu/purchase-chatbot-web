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
  content: "Hello! I'm your chat assistant. To get started, please make sure the API server is running by following these steps:\n\n1. Open a new terminal\n2. Navigate to the api directory\n3. Run `pip install -r requirements.txt`\n4. Start the server with `uvicorn main:app --reload`",
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

  useEffect(() => {
    if (isOffline) {
      showNotification({
        type: 'info',
        message: 'API server is not running. Please start it to enable chat functionality.'
      });
    }
  }, [isOffline, showNotification]);

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

    try {
      const userMessage: Message = {
        id: generateChatId(),
        content,
        role: 'user',
        timestamp: new Date(),
        files: files?.map(file => file.name),
      };

      // Update chats with user message
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          const updatedMessages = [...chat.messages, userMessage];
          return {
            ...chat,
            messages: updatedMessages,
            name: chat.messages.length === 1 ? generateChatName([userMessage]) : chat.name
          };
        }
        return chat;
      }));

      if (isOffline) {
        showNotification({
          type: 'warning',
          message: 'API server is offline. Please start it to enable chat functionality.'
        });
        return;
      }

      // Get response from LLM
      const response = await queryLLM(content);
      
      // Update chats with assistant response
      const assistantMessage: Message = {
        id: generateChatId(),
        content: response.text,
        role: 'assistant',
        timestamp: new Date(),
        sourceDocuments: response.sourceDocuments,
      };

      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      ));

    } catch (error) {
      logger.error('Error in chat message handling', error);
      showNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to get response'
      });
    }
  }, [currentChatId, isOffline, queryLLM, showNotification]);

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