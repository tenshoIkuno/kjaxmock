import { fetchMe, logoutRequest } from '@/features/auth/api/auth';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

// 認証済みユーザ情報を取得してauthStoreに保存するカスタムフック
export const useAuth = () => {
  // authStoreのsetUser関数を取得
  const { setUser } = useAuthStore();

  const query = useQuery({
    queryKey: ['auth', 'me'], // ユニークキー
    queryFn: async () => {
      // データを取得 GET '/users/me'
      return await fetchMe();
    },
    retry: false, // エラー時のリトライはしない
  });

  // データ取得成功後にauthStoreにユーザ情報をセット
  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
};

// ログアウト用カスタムフック
export const useLogout = () => {
  // authStoreからsetUserアクション取得
  const setUser = useAuthStore((s) => s.setUser);

  const logout = useCallback(() => {
    // storeにnullセット
    setUser(null);
    // logoutページへ遷移
    logoutRequest();
  }, [setUser]);

  return logout;
};
