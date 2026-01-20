import type { inputPatrolAudit } from '@/features/patrol-audit/types/patrolAudit';
import { Group, Input, InputWrapper, Stack, Text } from '@mantine/core';
import TooltipHelpButton from '@/common/components/TooltipHelpButton';

type FirstPanelProps = {
  values: inputPatrolAudit;
  onChange: (values: Partial<inputPatrolAudit>) => void;
};

export const FirstPanel = ({ values, onChange }: FirstPanelProps) => {
  return (
    <Stack gap="md">
      {/* 対象期間：開始日・期限日 */}
      <InputWrapper
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>対象期間</span>
            <TooltipHelpButton
              tip="監査対象の開始日と終了日を指定してください"
              size={14}
            />
          </div>
        }
        size="sm"
        withAsterisk
      >
        <Group gap="sm" grow>
          <Stack gap={4}>
            <Text size="xs">開始日</Text>
            <Input
              type="date"
              placeholder="開始日"
              value={values.periodStart ?? ''}
              onChange={(e) => onChange({ periodStart: e.currentTarget.value })}
            />
          </Stack>
          <Stack gap={4}>
            <Text size="xs">期限日</Text>
            <Input
              type="date"
              placeholder="期限日"
              value={values.periodEnd ?? ''}
              onChange={(e) => onChange({ periodEnd: e.currentTarget.value })}
            />
          </Stack>
        </Group>
      </InputWrapper>

      {/* 訪問日 */}
      <InputWrapper
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>訪問日</span>
            <TooltipHelpButton
              tip="実際に訪問した日を入力してください"
              size={14}
            />
          </div>
        }
        size="sm"
        withAsterisk
      >
        <Input
          type="date"
          value={values.visitDate ?? ''}
          onChange={(e) => onChange({ visitDate: e.currentTarget.value })}
        />
      </InputWrapper>

      {/* 訪問方法 */}
      <InputWrapper
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>訪問方法</span>
            <TooltipHelpButton
              tip="訪問が対面か電話か等、方法を入力してください"
              size={14}
            />
          </div>
        }
        size="sm"
        withAsterisk
      >
        <Input
          type="text"
          placeholder="訪問方法を入力"
          value={values.visitMethod ?? ''}
          onChange={(e) => onChange({ visitMethod: e.currentTarget.value })}
        />
      </InputWrapper>

      {/* 次回予定日 */}
      <InputWrapper
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>次回予定日</span>
            <TooltipHelpButton
              tip="次回の予定訪問日が決まっている場合に入力してください"
              size={14}
            />
          </div>
        }
        size="sm"
      >
        <Input
          type="date"
          value={values.nextVisitDate ?? ''}
          onChange={(e) => onChange({ nextVisitDate: e.currentTarget.value })}
        />
      </InputWrapper>
    </Stack>
  );
};
