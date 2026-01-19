import type { UserInfo } from '@/features/auth/types/type';
import { readTable, updateRecord } from '@/common/api/mockBackend';

// ユーザー名を更新
export const updateUserName = async (name: string): Promise<UserInfo> => {
  // users テーブルは public/mock-users.json の me オブジェクトを保持
  const users = (await readTable<Record<string, UserInfo>>('users', '/mock-users.json')) as Record<string, UserInfo>;
  const me = users.me;
  if (!me) throw new Error('user not found');
  const updated = { ...me, name };
  // write back into localStorage
  // reuse updateRecord for array-style tables isn't applicable; write directly
  const storageKey = `mockdb:users:v1`;
  localStorage.setItem(storageKey, JSON.stringify({ ...users, me: updated }));
  return updated;
};

// パスワードはモックなので成功を返す
export const updateUserPassword = async (
  current_password: string,
  new_password: string,
) => {
  return Promise.resolve({ success: true });
};
