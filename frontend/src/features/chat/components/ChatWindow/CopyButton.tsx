// コピーボタンコンポーネント
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import { useState } from 'react';

export function CopyButton({
  messageId,
  hoveredMessageId,
  text,
}: {
  messageId: string;
  hoveredMessageId: string | null;
  text: string;
}) {
  // コピーボタンツールチップの状態
  const [tooltip, setTooltip] = useState('コピーする');
  // コピーボタンが押されたらコピー&ツールチップ状態更新
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);

    setTooltip('コピーしました');
    setTimeout(() => setTooltip('コピーする'), 1000);
  };
  return (
    <Tooltip label={tooltip} position="bottom">
      <ActionIcon
        size="sm"
        variant="subtle"
        onClick={() => handleCopy(text)}
        style={{
          opacity: hoveredMessageId === messageId ? 1 : 0,
          pointerEvents: hoveredMessageId === messageId ? 'auto' : 'none',
          transition: 'opacity 120ms ease',
        }}
      >
        <IconCopy />
      </ActionIcon>
    </Tooltip>
  );
}
