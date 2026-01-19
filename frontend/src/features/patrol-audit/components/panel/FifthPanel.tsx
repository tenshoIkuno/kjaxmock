import type { inputPatrolAudit } from '@/features/patrol-audit/types/patrolAudit';
import { Stack, TextInput } from '@mantine/core';

type FifthPanelProps = {
  values: inputPatrolAudit;
  onChange: (values: Partial<inputPatrolAudit>) => void;
};

export const FifthPanel = ({ values, onChange }: FifthPanelProps) => {
  const { confirmMethod, confirmDate, confirmer } = values;

  return (
    <Stack gap="md">
      {/* 受領確認方法 */}
      <TextInput
        label="受領確認方法"
        placeholder="受領確認方法を入力"
        value={confirmMethod ?? ''}
        onChange={(e) => onChange({ confirmMethod: e.currentTarget.value })}
        withAsterisk
      />

      {/* 確認日時（他パネルに合わせて TextInput + type="date"） */}
      <TextInput
        label="確認日時"
        placeholder="日付を選択"
        type="date"
        value={confirmDate ?? ''}
        onChange={(e) => onChange({ confirmDate: e.currentTarget.value })}
        withAsterisk
      />

      {/* 確認者 */}
      <TextInput
        label="確認者"
        placeholder="確認者名を入力"
        value={confirmer}
        onChange={(event) => onChange({ confirmer: event.currentTarget.value })}
      />
    </Stack>
  );
};
