import { useAuthStore } from '@/features/auth/store/authStore';
import {
  updateUserName,
  updateUserPassword,
} from '@/features/settings/api/users';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';

// ユーザー名更新フック
export const useUpdateUserName = () => {
  const setUser = useAuthStore((s) => s.setUser); // ユーザー情報更新関数

  return useMutation({
    mutationFn: (name: string) => updateUserName(name),
    onSuccess: (data) => {
      // ユーザー情報をstoreに反映
      setUser(data);
      notifications.show({
        title: '更新成功',
        message: `ユーザ名を「${data.name}」に変更しました。`,
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: '更新失敗',
        message: 'ユーザー名の更新に失敗しました。',
        color: 'red',
      });
    },
  });
};

// パスワード更新フック
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: ({
      current_password,
      new_password,
    }: {
      current_password: string;
      new_password: string;
    }) => updateUserPassword(current_password, new_password),

    onSuccess: () => {
      notifications.show({
        title: 'パスワード変更成功',
        message: '新しいパスワードが設定されました。',
        color: 'green',
      });
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.detail?.message ||
        error.message ||
        'パスワードの変更に失敗しました。';
      notifications.show({
        title: 'パスワード変更失敗',
        message,
        color: 'red',
      });
    },
  });
};
