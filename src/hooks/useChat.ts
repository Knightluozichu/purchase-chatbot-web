import { useState } from 'react';
import { Chat, Message } from '../types';
import { generateChatId, generateChatName } from '../utils/chat';

const INITIAL_MESSAGE: Message = {
  id: '1',
  content: 'Hello! I\'m your procurement assistant. How can I help you today?',
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
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const handleNewChat = () => {
    const newChatId = generateChatId();
    setChats(prev => [...prev, {
      id: newChatId,
      name: 'New Chat',
      messages: [INITIAL_MESSAGE],
      createdAt: new Date()
    }]);
    setCurrentChatId(newChatId);
  };

  const handleSendMessage = async (content: string, files?: File[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      files: files?.map(file => file.name),
    };

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
    
    setIsTyping(true);
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand your procurement needs. ${
          files ? `I see you've uploaded: ${files.map(f => f.name).join(', ')}. ` : ''
        }Let me help you with that.`,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, botMessage] }
          : chat
      ));
      setIsTyping(false);
    }, 1000);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (chatId === currentChatId && chats.length > 1) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setCurrentChatId(remainingChats[remainingChats.length - 1].id);
    }
  };

  return {
    currentChatId,
    chats,
    messages,
    isTyping,
    showHistory,
    setCurrentChatId,
    setShowHistory,
    handleNewChat,
    handleSendMessage,
    handleDeleteChat,
  };
}