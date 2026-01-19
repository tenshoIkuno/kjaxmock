import type { ClientState } from '@/features/client/types/clientTypes';
import { create } from 'zustand';

export const useClientStore = create<ClientState>((set) => ({
  // 選択中の顧問先
  currentClientId: null,
  // 選択中の顧問先名（IDが無い場合の表示用）
  currentClientName: null,
  // 顧問先をセットするアクション
  selectClient: (clientId: string | null) => set({ currentClientId: clientId, currentClientName: null }),
  // 顧問先名をセットするアクション（IDがない編集時の表示など）
  selectClientName: (name: string | null) => set({ currentClientName: name, currentClientId: null }),
}));
