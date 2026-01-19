import { getCsrfToken } from '@/common/utils/getCsrfToken';

/**
 * 共通の API リクエスト関数
 *
 * - API_BASE_URL + path を結合してリクエスト送信
 * - Cookie を自動送信（認証セッション対応）
 * - Cookie に保存された CSRF トークンを X-CSRF-Token ヘッダとして付与
 * - JSON 形式のレスポンスを自動でパース
 * - エラー時は例外をスロー
 */
const _rawApiBase = (import.meta.env as any).VITE_API_BASE_URL;
// guard against literal string 'undefined' or actual undefined
export const API_BASE_URL = typeof _rawApiBase === 'string' && _rawApiBase !== 'undefined' ? _rawApiBase.replace(/\/$/, '') : '';

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  // CookieからCSRFトークンを取得
  const csrfToken = getCsrfToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    // Cookie送信
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    // 認証切れ → ログインページにリダイレクト
    if (res.status === 401) {
      // If we're running frontend-only mock, avoid redirecting to backend auth URL.
      // The frontend mock sets `window.__FRONTEND_MOCK__ = true` in `public/mock-interceptor.js`.
      try {
        if (!(window as any).__FRONTEND_MOCK__) {
          const base = API_BASE_URL && (API_BASE_URL as string) !== 'undefined' ? (API_BASE_URL as string).replace(/\/$/, '') : '';
          const target = base ? `${base}/auth/login` : '/auth/login';
          window.location.href = target;
        }
      } catch (e) {
        // ignore
      }
      throw new Error('認証されていません');
    }
    // それ以外のエラー
    const message = await res.text();
    throw new Error(message || `HTTP error status: ${res.status}`);
  }

  return res.json() as Promise<T>;
};
