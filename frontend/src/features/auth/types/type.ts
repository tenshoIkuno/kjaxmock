// '/users/me'からのユーザ情報レスポンス
export type UserInfo = {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  role?: '担当職員' | '担当税理士' | '上長' | '管理者';
  created_at: string;
};

// useAuthStore型定義
export type AuthState = {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
};
