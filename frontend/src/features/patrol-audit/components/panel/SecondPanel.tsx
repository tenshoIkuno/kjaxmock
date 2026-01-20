import type { inputPatrolAudit } from '@/features/patrol-audit/types/patrolAudit';
import { Box, Button, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import TooltipHelpButton from '@/common/components/TooltipHelpButton';
import { IconCheck } from '@tabler/icons-react';

const MAIN_OPTIONS = [
  { value: 'cash', label: '現貯金' },
  { value: 'sales', label: '売上' },
  { value: 'purchase', label: '仕入' },
  { value: 'expense', label: '経費' },
  { value: 'inventory', label: '棚卸' },
  { value: 'fixedAsset', label: '固定資産' },
  { value: 'financialIssue', label: '財務論点' },
  { value: 'payroll', label: '給与計算' },
  { value: 'socialInsurance', label: '社会保険' },
];

// 10マス目に「その他」を追加
const GRID_OPTIONS = [
  ...MAIN_OPTIONS,
  { value: 'other', label: 'その他' },
] as const;

type SecondPanelProps = {
  values: inputPatrolAudit;
  onChange: (values: Partial<inputPatrolAudit>) => void;
};

export const SecondPanel = ({ values, onChange }: SecondPanelProps) => {
  const { selected, otherSelected, otherText } = values;

  const toggleMain = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange({ selected: next });
  };

  const toggleOther = () => {
    onChange({ otherSelected: !otherSelected });
  };

  return (
    <Stack gap="md">
      <Box>
        <Text size="sm" mt={4}>
          巡回監査で確認した項目を選んでください
        </Text>
      </Box>

      {/* 横2・縦5 の 10マス */}
      <SimpleGrid cols={2} spacing="xs">
        {GRID_OPTIONS.map((option) => {
          const isOther = option.value === 'other';
          const isSelected = isOther
            ? otherSelected
            : selected.includes(option.value);

          const handleClick = () => {
            if (isOther) {
              toggleOther();
            } else {
              toggleMain(option.value);
            }
          };

          return (
            <Button
              key={option.value}
              fullWidth
              variant={isSelected ? 'filled' : 'outline'}
              color={isSelected ? 'blue' : 'gray'}
              styles={{
                root: {
                  position: 'relative',
                  paddingRight: isSelected ? 28 : undefined,
                },
                label: {
                  whiteSpace: 'normal',
                  lineHeight: 1.2,
                },
              }}
              onClick={handleClick}
            >
              <Text size="sm">{option.label}</Text>

              {isSelected && (
                <IconCheck
                  size={14}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              )}
            </Button>
          );
        })}
      </SimpleGrid>

      {/* その他の入力欄（「その他」マスが選択されたときだけ表示） */}
      {otherSelected && (
        <TextInput
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>その他の監査範囲</span>
              <TooltipHelpButton
                tip="選択肢にない項目を自由入力してください"
                size={16}
              />
            </div>
          }
          placeholder="例）助成金の申請状況　など"
          value={otherText}
          onChange={(event) =>
            onChange({ otherText: event.currentTarget.value })
          }
        />
      )}
    </Stack>
  );
};
