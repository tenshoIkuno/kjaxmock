export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
};

export type SendMessagePayload = {
  chatId: string;
  content: string;
};
