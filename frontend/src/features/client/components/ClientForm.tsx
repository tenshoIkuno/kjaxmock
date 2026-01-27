// features/clients/ClientForm.tsx
import {
  useCreateClient,
  useUpdateClient,
} from '@/features/client/hooks/useClient';
import type { ClientFormProps } from '@/features/client/types/clientTypes';
import { Button, TextInput } from '@mantine/core';
import TooltipHelpButton from '@/common/components/TooltipHelpButton';
import { useForm } from '@mantine/form';

export const ClientForm = ({
  mode,
  defaultValues,
  onClose,
}: ClientFormProps) => {
  const initialName = defaultValues?.name ?? '';

  const form = useForm({
    initialValues: {
      name: defaultValues?.name ?? '',
    },
    validate: {
      name: (value) => {
        if (!value || value.trim().length === 0) {
          return '顧問先名は必須です';
        }
        if (value.trim().length > 50) {
          return '顧問先名は50文字以内で入力してください';
        }
        return null;
      },
    },
  });

  // クライアント作成・編集クエリ呼び出し
  // frontend/src/features/client/api/client.ts にて定義
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();

  // API実行中か
  const isPending = isCreating || isUpdating;
  // フォームの内容が変更しているか（編集時のみ）
  const isUnChanged =
    mode === 'edit'
      ? form.values.name.trim() === (initialName.trim() ?? '')
      : false;
  // 上記二つの条件+フォームの文字数からボタンの状態を管理
  const isButtonDisabled =
    isPending || isUnChanged || form.values.name.trim().length === 0;

  // 作成、保存ボタン押下後の処理
  const handleSubmit = form.onSubmit((values) => {
    if (mode === 'create') {
      // modeがcreateならcreateClient
      createClient(values, { onSuccess: onClose });
    } else {
      if (!defaultValues?.id) return;
      // modeがeditならupdateClient
      updateClient(
        { clientId: defaultValues?.id, payload: { name: values.name } },
        { onSuccess: onClose },
      );
    }
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div id="client-create-area">
        <TextInput
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>顧問先名</span>
              <TooltipHelpButton
                tip="顧問先の正式名称を入力してください（50文字以内）"
                size={20}
              />
            </div>
          }
          placeholder="顧問先名を入力"
          id="client-name-input"
          {...form.getInputProps('name')}
          required
        />
        <Button
          mt="md"
          id="client-submit-button"
          type="submit"
          loading={isPending}
          disabled={isButtonDisabled}
        >
          {mode === 'create' ? '登録' : '更新'}
        </Button>
      </div>
    </form>
  );
};
