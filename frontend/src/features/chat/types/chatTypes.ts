import type { ChatMessage } from '@/features/chat/types/messageTypes';

// useChatStore型定義
export type ChatState = {
  chats: Chat[];
  currentChatId: string | null;
  streamingMessages: Record<string, Record<string, ChatMessage>>;

  // chats操作アクション
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chat: UpdateChat) => void;

  // currentChatId操作アクション
  removeChat: (chatId: string) => void;
  selectChat: (chatId: string | null) => void;
  deselectChat: () => void;

  // messages操作アクション
  addMessage: (chatId: string, chat: ChatMessage) => void;
  updateMessage: (chatId: string, messageId: string, content: string) => void;

  // streamingMessages操作アクション
  addStreamingMessage: (chatId: string, message: ChatMessage) => void;
  updateStreamingMessage: (
    chatId: string,
    messageId: string,
    content: string,
  ) => void;
  commitStreamingMessage: (chatId: string, messageId: string) => void;
  clearStreamingMessage: (chatId: string, messageId: string) => void;
};

export type Chat = {
  id: string;
  title: string;
  messages: ChatMessage[];
  // sort_index: number;
  client_id: string | null;
  isNew?: boolean;
};

export type UpdateChat = {
  id?: string;
  title?: string;
  messages?: ChatMessage[];
  // sort_index?: number;
  client_id?: string | null;
  isNew?: boolean;
};

export type ChatUpdatePayload = Partial<{
  title: string;
  // sort_index: number;
}>;
