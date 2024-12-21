export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: string[];
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
}