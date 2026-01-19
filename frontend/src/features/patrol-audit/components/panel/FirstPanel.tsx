import type { inputPatrolAudit } from '@/features/patrol-audit/types/patrolAudit';
import { Group, Input, InputWrapper, Stack, Text } from '@mantine/core';

type FirstPanelProps = {
  values: inputPatrolAudit;
  onChange: (values: Partial<inputPatrolAudit>) => void;
};

export const FirstPanel = ({ values, onChange }: FirstPanelProps) => {
  return (
    <Stack gap="md">
      {/* 対象期間：開始日・期限日 */}
      <InputWrapper label="対象期間" size="sm" withAsterisk>
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
      <InputWrapper label="訪問日" size="sm" withAsterisk>
        <Input
          type="date"
          value={values.visitDate ?? ''}
          onChange={(e) => onChange({ visitDate: e.currentTarget.value })}
        />
      </InputWrapper>

      {/* 訪問方法 */}
      <InputWrapper label="訪問方法" size="sm" withAsterisk>
        <Input
          type="text"
          placeholder="訪問方法を入力"
          value={values.visitMethod ?? ''}
          onChange={(e) => onChange({ visitMethod: e.currentTarget.value })}
        />
      </InputWrapper>

      {/* 次回予定日 */}
      <InputWrapper label="次回予定日" size="sm">
        <Input
          type="date"
          value={values.nextVisitDate ?? ''}
          onChange={(e) => onChange({ nextVisitDate: e.currentTarget.value })}
        />
      </InputWrapper>
    </Stack>
  );
};
