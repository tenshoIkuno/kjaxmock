import { NewPasswordInput } from '@/features/settings/components/PasswordPanel/NewPasswordInput';
import { useUpdatePassword } from '@/features/settings/hooks/useUsers';
import { Button, PasswordInput, Stack, Text } from '@mantine/core';
import TooltipHelpButton from '@/common/components/TooltipHelpButton';
import { useForm } from '@mantine/form';
import { useRef } from 'react';

export const PasswordPanel = () => {
  const { mutate: UpdatePassword, isPending } = useUpdatePassword();

  // enter時、次のinputに進むためのref
  const currentRef = useRef<HTMLInputElement>(null);
  const newRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  // 使用可能文字列
  const allowedChars = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~ ]*$/;
  // フォーム設定
  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    // バリデーション設定
    validate: {
      currentPassword: (v) =>
        v.trim().length === 0 ? '現在のパスワードは必須です' : null,
      newPassword: (v) => {
        if (v.trim().length < 8) return '8文字以上が必要です';
        if (!allowedChars.test(v)) return '使用できない文字が含まれています';
        const types = [
          /[0-9]/,
          /[a-z]/,
          /[A-Z]/,
          /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~ ]/,
        ];
        const passedTypes = types.filter((re) => re.test(v)).length;
        if (passedTypes < 3)
          return '数字・大文字・小文字・記号のうち3種類以上を含めてください';
        return null;
      },
      confirmPassword: (v, values) =>
        v !== values.newPassword ? 'パスワードが一致しません' : null,
    },
  });

  // 更新ボタン押下後処理
  const handleSubmit = form.onSubmit((values) => {
    // パスワード更新フック
    UpdatePassword(
      {
        current_password: values.currentPassword,
        new_password: values.newPassword,
      },
      {
        // 成功時、formリセット
        onSuccess: () => {
          form.reset();
        },
      },
    );
  });

  // 更新ボタンが押せるかの判定
  // isValidForSubmit 下部に定義
  const canSubmit = isValidForSubmit(
    form.values.currentPassword,
    form.values.newPassword,
    form.values.confirmPassword,
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack mt="xs" gap="xs">
        <Text fw={600}>パスワード変更</Text>

        {/* 現在のパスワード欄 */}
        <PasswordInput
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>現在のパスワード</span>
              <TooltipHelpButton
                tip="現在のパスワードを入力してください"
                size={14}
              />
            </div>
          }
          ref={currentRef}
          withAsterisk
          placeholder="現在のパスワード"
          {...form.getInputProps('currentPassword')}
          // enterで次のinputへ
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (form.values.currentPassword.trim() !== '') {
                newRef.current?.focus();
              }
            }
          }}
        />

        {/* 新しいパスワード欄 
        frontend/src/features/settings/components/PasswordPanel/NewPasswordInput.tsx に定義*/}
        <NewPasswordInput
          ref={newRef}
          value={form.values.newPassword}
          // 変更時はformを更新
          onChange={(val) => form.setFieldValue('newPassword', val)}
          error={form.errors.newPassword as string | undefined}
          // enter時に次のinputに進めるようにrefを渡す
          nextRef={confirmRef}
        />

        {/* 新しいパスワード（確認用）欄 */}
        <PasswordInput
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>新しいパスワード（確認）</span>
              <TooltipHelpButton
                tip="もう一度新しいパスワードを入力してください"
                size={14}
              />
            </div>
          }
          ref={confirmRef}
          withAsterisk
          placeholder="もう一度入力"
          {...form.getInputProps('confirmPassword')}
          // 変更を検知しバリデーション
          onChange={(e) => {
            form.setFieldValue('confirmPassword', e.currentTarget.value);
            form.validateField('confirmPassword');
          }}
        />

        {/* 更新ボタン */}
        <Button mt="md" type="submit" loading={isPending} disabled={!canSubmit}>
          更新
        </Button>
      </Stack>
    </form>
  );
};

// パスワード条件
const passwordRequirements = [
  {
    label: '8文字以上',
    check: (password: string) => password.length >= 8,
  },
  {
    label: '文字種が3種類以上（小文字・大文字・数字・記号）',
    check: (password: string) => {
      const types = [
        /[0-9]/,
        /[a-z]/,
        /[A-Z]/,
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~ ]/,
      ];
      const passedTypes = types.filter((re) => re.test(password)).length;
      return passedTypes >= 3;
    },
  },
];

// ボタン制御
const isValidForSubmit = (
  current: string,
  newPass: string,
  confirm: string,
) => {
  const checksPassed = passwordRequirements.every((r) => r.check(newPass));
  return current.trim() !== '' && checksPassed && newPass === confirm;
};
