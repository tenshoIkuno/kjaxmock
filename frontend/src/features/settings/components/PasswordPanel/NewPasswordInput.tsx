import {
  Box,
  Flex,
  PasswordInput,
  Popover,
  PopoverTarget,
  Progress,
  Text,
  Tooltip,
} from '@mantine/core';
import TooltipHelpButton from '@/common/components/TooltipHelpButton';
import { IconCheck, IconHelp, IconX } from '@tabler/icons-react';
import { forwardRef, useState } from 'react';

type NewPasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  nextRef?: React.RefObject<HTMLInputElement | null>;
};

// 新しいパスワード入力欄コンポーネント
export const NewPasswordInput = forwardRef<
  HTMLInputElement,
  NewPasswordInputProps
>(({ value, onChange, error, nextRef }, ref) => {
  const [popoverOpened, setPopoverOpened] = useState(false);

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

  // 条件チェック
  const checks = passwordRequirements.map((req, index) => (
    <PasswordRequirement
      key={index}
      label={req.label}
      meets={req.check(value)}
    />
  ));

  // 進捗計算
  const getStrength = (password: string) => {
    const checksPassed = passwordRequirements.filter((r) =>
      r.check(password),
    ).length;
    const percent = (checksPassed / passwordRequirements.length) * 100;
    const color = checksPassed === passwordRequirements.length ? 'teal' : 'red';
    return { percent, color };
  };
  const { percent, color } = getStrength(value);

  return (
    <>
      <Popover
        opened={popoverOpened}
        position="bottom"
        width="target"
        transitionProps={{ transition: 'pop' }}
      >
        <PopoverTarget>
          <div
            onFocusCapture={() => setPopoverOpened(true)}
            onBlurCapture={() => setPopoverOpened(false)}
          >
            <PasswordInput
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>新しいパスワード</span>
                  <TooltipHelpButton
                    tip="8文字以上、文字種3種類以上を満たすパスワードを設定してください"
                    size={14}
                  />
                </div>
              }
              ref={ref}
              withAsterisk
              placeholder="新しいパスワード"
              value={value}
              onChange={(e) => onChange(e.currentTarget.value)}
              error={error}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (value.trim() !== '') {
                    nextRef?.current?.focus();
                  }
                }
              }}
            />
          </div>
        </PopoverTarget>
        <Popover.Dropdown>
          <Text size="xs" mb={5}>
            パスワード条件
          </Text>
          <Progress color={color} value={percent} size={5} mb="xs" />
          {checks}
        </Popover.Dropdown>
      </Popover>

      {/* 使用できる文字 ツールチップ */}
      <Tooltip
        label={`使用できる文字
                A-Z
                a-z
                0-9
                @ # $ % ^ & * - _ ! + = [ ] {} | \\ : ' , . ? / \` ~ " ( ) ; <>
                空白`}
        position="bottom-start"
        withArrow
      >
        <Flex align="center" gap={2} style={{ width: 'fit-content' }}>
          <IconHelp color="grey" size={14} />
          <Text c="dimmed" size="xs" style={{ cursor: 'default' }}>
            使用可能文字
          </Text>
        </Flex>
      </Tooltip>
    </>
  );
});
NewPasswordInput.displayName = 'NewPasswordInput';

// 条件表示コンポーネント
const PasswordRequirement = ({
  meets,
  label,
}: {
  meets: boolean;
  label: string;
}) => (
  <Text
    c={meets ? 'teal' : 'red'}
    style={{ display: 'flex', alignItems: 'center' }}
    mt={7}
    size="sm"
  >
    {meets ? <IconCheck size={14} /> : <IconX size={14} />}
    <Box ml={10}>{label}</Box>
  </Text>
);
