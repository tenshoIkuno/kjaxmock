import { API_BASE_URL, apiFetch } from '@/common/api/client';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { UserInfo } from '@/features/auth/types/type';

// 認証済みかの確認
// 認証済であればユーザ情報が返ってくる
// 未認証であれば401
export const fetchMe = async (): Promise<UserInfo> => {
  return apiFetch<UserInfo>('/users/me');
};

// ログイン
export const startLogin = async () => {
  try {
    // If frontend mock flag is present, or API base is empty (frontend-only deploy), perform an in-memory login
    if ((window as any).__FRONTEND_MOCK__ || !API_BASE_URL) {
      try {
        const res = await fetch('/mock-users.json');
        if (res && res.ok) {
          const data = await res.json();
          // support multiple shapes: array of users, { me, staff: [...] }, or single user object
          let user: any = null;
          if (Array.isArray(data) && data.length) user = data[0];
          else if (data && typeof data === 'object') {
            if (data.me) user = data.me;
            else if (Array.isArray(data.staff) && data.staff.length) user = data.staff[0];
            else {
              // if it's an object of users, pick first value
              const vals = Object.values(data).filter(v => v && typeof v === 'object');
              if (vals.length) user = vals[0];
            }
          }
          if (user) {
            useAuthStore.getState().setUser(user);
            return;
          }
        }
      } catch (e) {
        // ignore and fallthrough to redirect
      }
    }
  } catch (e) {
    // ignore
  }

  // fallback: redirect to backend login — construct safe absolute target
  try {
    const base = API_BASE_URL && API_BASE_URL !== 'undefined' ? API_BASE_URL.replace(/\/$/, '') : '';
    const target = base ? `${base}/auth/login` : '/auth/login';
    window.location.href = target;
  } catch (e) {
    window.location.href = '/auth/login';
  }
};

// ログアウト
export const logoutRequest = async () => {
  window.location.href = `${API_BASE_URL}/auth/logout`;
};
