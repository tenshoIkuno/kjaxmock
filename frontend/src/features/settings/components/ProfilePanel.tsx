import { useAuthStore } from '@/features/auth/store/authStore';
import { useTenant } from '@/features/settings/hooks/useTenants';
import { useUpdateUserName } from '@/features/settings/hooks/useUsers';
import {
  Button,
  Input,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import TooltipHelpButton from '@/common/components/TooltipHelpButton';
import { useForm } from '@mantine/form';

export const ProfilePanel = () => {
  // storeからuser情報取得
  const user = useAuthStore((s) => s.user);

  const tenantId = user?.tenant_id;
  // テナント情報取得
  const { data: tenant, isLoading, isError } = useTenant(tenantId!);
  // ユーザリネームフック
  const { mutate: updateUserName, isPending } = useUpdateUserName();

  const form = useForm({
    initialValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      created_at: user?.created_at
        ? new Date(user.created_at).toLocaleDateString()
        : '',
    },
    validate: {
      name: (value) => {
        if (!value || value.trim().length === 0) {
          return '名前は必須です';
        }
        if (value.trim().length > 50) {
          return '名前は50文字以内で入力してください';
        }
        return null;
      },
      email: (value) => {
        if (!value || value.trim().length === 0) {
          return 'メールアドレスは必須です';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'メールアドレスの形式が正しくありません';
        }
        return null;
      },
    },
  });

  if (!user) return null;

  // 作成、保存ボタン押下後の処理
  const handleSubmit = form.onSubmit((values) => {
    updateUserName(values.name);
  });

  // フォームが初期状態と同じか判定
  const isUnChanged = form.values.name.trim() === (user.name?.trim() ?? '');
  // 上記条件からボタンの状態を管理
  const isButtonDisabled =
    isPending || isUnChanged || form.values.name.trim().length === 0;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack mt="xs" gap="xs">
        <Text fw={600}>プロフィール情報</Text>

        {isLoading ? (
          <LoadingOverlay visible={isLoading} zIndex={1000} />
        ) : isError ? (
          <Text>テナント情報の取得に失敗しました</Text>
        ) : (
          <Input.Wrapper label="所属テナント">
            <Text size="sm">{tenant?.name}</Text>
          </Input.Wrapper>
        )}

        <TextInput
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>名前</span>
              <TooltipHelpButton
                tip="ユーザー表示名を入力してください（50文字以内推奨）"
                size={18}
              />
            </div>
          }
          placeholder="名前を入力"
          {...form.getInputProps('name')}
        />

        <Input.Wrapper
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>メール</span>
              <TooltipHelpButton
                tip="ログイン用のメールアドレス（変更不可項目）"
                size={16}
              />
            </div>
          }
        >
          <Text size="sm">{form.values.email}</Text>
        </Input.Wrapper>

        <Input.Wrapper
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>アカウント作成日時</span>
              <TooltipHelpButton
                tip="アカウントが作成された日時（表示のみ）"
                size={16}
              />
            </div>
          }
        >
          <Text size="sm">{form.values.created_at}</Text>
        </Input.Wrapper>

        <Button
          mt="md"
          type="submit"
          loading={isPending}
          disabled={isButtonDisabled}
        >
          更新
        </Button>
      </Stack>
    </form>
  );
};
