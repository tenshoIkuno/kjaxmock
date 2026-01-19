// chat関連api（モック）
import type { Chat, ChatUpdatePayload } from '@/features/chat/types/chatTypes';
import { readTable, createRecord, updateRecord, deleteRecord } from '@/common/api/mockBackend';

// 一覧取得
export const getChats = async (): Promise<Chat[]> => {
  return readTable<Chat[]>('chats', '/mock-chats.json');
};

// 特定のチャットルーム取得
export const getChat = async (chatId: string): Promise<Chat> => {
  const list = await readTable<Chat[]>('chats', '/mock-chats.json');
  const c = list.find((x) => x.id === chatId);
  if (!c) throw new Error('not found');
  return c;
};

// 削除
export const deleteChat = async (id: string): Promise<Chat> => {
  return deleteRecord<Chat>('chats', '/mock-chats.json', id);
};

// 更新
export const updateChat = async ({
  chatId,
  payload,
}: {
  chatId: string;
  payload: ChatUpdatePayload;
}): Promise<Chat> => {
  return updateRecord<Chat>('chats', '/mock-chats.json', chatId, payload as any);
};
