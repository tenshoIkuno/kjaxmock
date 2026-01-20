import type { inputPatrolAudit } from '@/features/patrol-audit/types/patrolAudit';
import { Stack, TextInput } from '@mantine/core';
import TooltipHelpButton from '@/common/components/TooltipHelpButton';

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
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>受領確認方法</span>
            <TooltipHelpButton
              tip="受領を確認する方法（例：メール、電話、対面）を入力してください"
              size={16}
            />
          </div>
        }
        placeholder="受領確認方法を入力"
        value={confirmMethod ?? ''}
        onChange={(e) => onChange({ confirmMethod: e.currentTarget.value })}
        withAsterisk
      />

      {/* 確認日時（他パネルに合わせて TextInput + type="date"） */}
      <TextInput
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>確認日時</span>
            <TooltipHelpButton
              tip="受領を確認した日時を入力してください"
              size={16}
            />
          </div>
        }
        placeholder="日付を選択"
        type="date"
        value={confirmDate ?? ''}
        onChange={(e) => onChange({ confirmDate: e.currentTarget.value })}
        withAsterisk
      />

      {/* 確認者 */}
      <TextInput
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>確認者</span>
            <TooltipHelpButton
              tip="受領を確認した担当者名を入力してください"
              size={16}
            />
          </div>
        }
        placeholder="確認者名を入力"
        value={confirmer}
        onChange={(event) => onChange({ confirmer: event.currentTarget.value })}
      />
    </Stack>
  );
};
