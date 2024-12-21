export function generateChatName(messages: { content: string }[]): string {
  const firstMessage = messages.find(m => m.content.trim().length > 0);
  if (!firstMessage) return 'New Chat';
  
  const name = firstMessage.content.slice(0, 30);
  return name.length < firstMessage.content.length ? `${name}...` : name;
}

export function generateChatId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
