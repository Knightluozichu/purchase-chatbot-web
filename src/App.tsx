import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import { HistoryList } from './components/HistoryList';
import { AuthModal } from './components/AuthModal';
import { useChat } from './hooks/useChat';
import { useAuth } from './hooks/useAuth';
import { useLLM } from './hooks/useLLM';

export default function App() {
  const {
    currentChatId,
    chats,
    messages,
    isTyping,
    showHistory,
    isOffline,
    setCurrentChatId,
    setShowHistory,
    handleNewChat,
    handleSendMessage,
    handleDeleteChat,
  } = useChat();

  const {
    user,
    loading,
    error,
    login,
    register,
    logout,
  } = useAuth();

  const { currentModel, switchModel, setApiKey } = useLLM();

  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header 
        onNewChat={handleNewChat}
        onToggleHistory={() => setShowHistory(!showHistory)}
        showHistory={showHistory}
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={logout}
        currentModel={currentModel}
        onModelChange={switchModel}
        onApiKeyChange={setApiKey}
        isOffline={isOffline}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <ChatContainer messages={messages} isTyping={isTyping} />

        {showHistory && (
          <HistoryList
            chats={chats}
            selectedChatId={currentChatId}
            onSelectChat={setCurrentChatId}
            onDeleteChat={handleDeleteChat}
          />
        )}
      </div>

      <div className="max-w-3xl mx-auto w-full">
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
        onRegister={register}
        error={error}
        loading={loading}
      />
    </div>
  );
}