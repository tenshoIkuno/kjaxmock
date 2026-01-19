import { ActionIcon, Button, Popover, Stack } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { useState } from 'react';

export type ActionItem = {
  label: string; // 表示するラベル
  icon?: React.ReactNode; // アイコン（左側）
  color?: string; // 色
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void; // クリック時
  variant?: 'subtle' | 'filled' | 'outline' | 'light' | 'default'; // テーマ
  size?: 'xs' | 'sm' | 'md' | 'lg'; // サイズ
  'data-test-id'?: string; // テスト用識別子（任意）
};

export interface ActionButtonProps {
  actions: ActionItem[];
  iconSize?: number;
  actionIconSize?: 'xs' | 'sm' | 'md' | 'lg';
  /** aria-label for the trigger button */
  ariaLabel?: string;
  /** underlying element type for the trigger, set to 'div' when embedding inside a button to avoid nested buttons */
  triggerComponent?: 'button' | 'div' | 'span';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  actions,
  iconSize = 14,
  actionIconSize = 'sm',
  ariaLabel = 'actions',
  triggerComponent = 'button',
}) => {
  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <Popover
      opened={menuOpened}
      onChange={setMenuOpened}
      withArrow
      position="right"
      shadow="md"
      zIndex={9999}
      withinPortal
      trapFocus={false}
      closeOnEscape
    >
      <Popover.Target>
        <ActionIcon
          size={actionIconSize}
          variant="subtle"
          aria-label={ariaLabel}
          component={triggerComponent}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpened((prev) => !prev);
          }}
        >
          <IconDots size={iconSize} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown
        p="xs"
        onClick={(e) => e.stopPropagation()}
        data-inner-popover
        role="menu"
      >
        <Stack gap={2}>
          {actions.map((action, i) => (
            <Button
              key={i}
              fullWidth
              justify="flex-start"
              variant={action.variant ?? 'subtle'}
              size={action.size ?? 'xs'}
              color={action.color}
              leftSection={action.icon}
              data-test-id={action['data-test-id']}
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick && action.onClick(e as React.MouseEvent<HTMLButtonElement>);
                setMenuOpened(false);
              }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
