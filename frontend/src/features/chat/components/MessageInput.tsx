import { ActionIcon, Button, Flex, Paper, Text, Textarea } from '@mantine/core';
import {
  IconFileDescription,
  IconMicrophone,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

type MessageInputProps = {
  onSend?: (message: string) => void;
  disabled?: boolean;
};

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [value, setValue] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSend = () => {
    if (disabled) return;

    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    onSend?.(trimmed);
    setValue('');
    setFile(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSend();
  };

  return (
    <form onSubmit={handleSubmit} aria-label="メッセージ送信フォーム">
      <Flex justify="center">
        <Paper radius="md" p="xs" withBorder shadow="xs" w="100%" maw={600}>
          {/* 縦に積んで、下の行の右端に送信ボタンを置く */}
          <Flex direction="column" gap={4}>
            <Textarea
              placeholder="メッセージを入力..."
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
              autosize
              minRows={1}
              maxRows={4}
              style={{ flex: 1 }}
              disabled={disabled}
              aria-label="メッセージ入力欄"
              onKeyDown={(event) => {
                // Shift + Enter で送信
                if (event.key === 'Enter' && event.ctrlKey) {
                  // 改行をキャンセル
                  event.preventDefault();
                  // 送信ボタンと同じ処理
                  handleSend();
                }
              }}
            />

            {/* ファイルが選択されているときだけ表示 */}
            {file && (
              <Flex
                align="center"
                justify="space-between"
                mt={4}
                px="xs"
                py={4}
                style={{
                  borderRadius: 6,
                  border: '1px solid var(--mantine-color-gray-3)',
                }}
              >
                {/* 左側：アイコン＋ファイル名 */}
                <Flex align="center" gap={6} flex={1} miw={0}>
                  <IconFileDescription size={16} />
                  <Text size="sm" truncate>
                    {file.name}
                  </Text>
                </Flex>

                <ActionIcon
                  size="xs"
                  variant="subtle"
                  aria-label="添付ファイルを削除"
                  onClick={() => setFile(null)}
                  style={{ flexShrink: 0 }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Flex>
            )}

            {/* 入力欄の「外側・下・右側」にボタンを配置 追加ボタンがいったん二のでコメントアウトその下の行と入れ替えて*/}
            {/* <Flex justify="space-between" align="center" gap="xs"> */}
            <Flex justify="flex-end" align="center" gap="xs">
              {/* 添付メニュー（＋アイコン） */}
              {/*
              <Menu withinPortal position="top-start" keepMounted>
                <Menu.Target>
                  <Flex direction="column" align="center" gap={2}>
                    <ActionIcon
                      variant="subtle"
                      aria-label="添付メニューを開く"
                    >
                      <IconPlus size={18} />
                    </ActionIcon>
                    <Text size="xs" c="dimmed">
                      追加
                    </Text>
                  </Flex>
                </Menu.Target>

                <Menu.Dropdown>
                  <FileButton
                    onChange={(file) => {
                      if (file) {
                        setFile(file);
                        console.log('ファイル', file);
                      }
                    }}
                  >
                    {(props) => <Menu.Item {...props}>ファイル追加</Menu.Item>}
                  </FileButton>
                </Menu.Dropdown>
              </Menu>
              */}

              {/* 右側：音声入力ボタン + 送信ボタン */}
              <Flex align="center" gap="xs">
                <Flex direction="column" align="center" gap={2}>
                  <ActionIcon
                    variant="subtle"
                    aria-label="音声入力"
                    disabled={disabled}
                    onClick={() => {
                      // 音声入力処理をここに実装
                      console.log('音声入力ボタンが押されました');
                    }}
                  >
                    <IconMicrophone size={18} />
                  </ActionIcon>
                  <Text size="xs" c="dimmed">
                    音声入力
                  </Text>
                </Flex>
                {/* 送信ボタン（位置は今まで通り右端） */}
                <Button
                  type="submit"
                  disabled={disabled || value.trim() === ''}
                >
                  送信
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Paper>
      </Flex>
    </form>
  );
}
