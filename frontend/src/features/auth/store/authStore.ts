import type { AuthState } from '@/features/auth/types/type';
import { create } from 'zustand';

// 認証情報を管理するグローバルストア
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
