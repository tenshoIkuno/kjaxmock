import React from 'react';
import { Tooltip, ActionIcon } from '@mantine/core';

type Props = {
  tip: React.ReactNode;
  size?: number; // ActionIcon size
  ariaLabel?: string;
};

export default function TooltipHelpButton({
  tip,
  size = 28,
  ariaLabel = 'ヘルプ',
}: Props) {
  return (
    <Tooltip label={tip} withArrow position="right">
      <ActionIcon
        variant="light"
        size={size}
        aria-label={ariaLabel}
        sx={(theme) => ({
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        })}
      >
        ?
      </ActionIcon>
    </Tooltip>
  );
}
