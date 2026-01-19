import type {
  SpeechState,
  SpeechStatus,
} from '@/features/speech/types/speechTypes';
import { create } from 'zustand';

// 音声認識の状態を管理
export const useSpeechStore = create<SpeechState>((set) => ({
  // 現在の状態: idle / authorizing / listening
  status: 'idle',
  // 認識結果テキスト
  showText: '',
  // エラー内容
  error: null,
  // 状態をセット
  setStatus: (status: SpeechStatus) => set({ status }),
  // テキストを末尾に追加
  appendshowText: (text: string) =>
    set((state) => ({
      showText: state.showText ? `${state.showText}\n${text}` : text,
    })),
  // エラーをセット
  setError: (error: string | null) => set({ error }),
  // テキストをリセット
  resetText: () => set({ showText: '' }),
  // 状態を初期化
  reset: () =>
    set({
      status: 'idle',
      showText: '',
      error: null,
    }),
}));
