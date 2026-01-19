import { apiFetch } from '@/common/api/client';
import type { SpeechTokenResponse } from '@/features/speech/types/speechTypes';

// 音声認識で利用する短期トークンを取得
// - apiFetch は VITE_API_BASE_URL + path に Cookie/CSRF 付きで GET する共通ラッパー
// - この関数が呼ばれた時バックエンドの /speeches/token へリクエストが飛ぶ
export const fetchSpeechToken = async (): Promise<SpeechTokenResponse> => {
  return apiFetch<SpeechTokenResponse>('/speeches/token');
};
