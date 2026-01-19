import { useChatStore } from '@/features/chat/store/chatStore';
import { Flex, Stack, Text } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';

export function ChatHomeWindow() {
  const chats = useChatStore((s) => s.chats);

  // チャットルームが1件以上あるか判定
  const hasRooms = chats.length > 0;

  return (
    <Flex direction="column" gap="md" h="100%">
      {/* 上側：中央にメッセージを表示するエリア（見た目はほぼそのまま） */}
      <Flex flex={1} align="center" justify="center">
        <Stack align="center" gap="xs">
          <IconMessageCircle size={32} />
          <Text fw={600}>チャットを始めましょう</Text>
          {hasRooms ? (
            <Text c="dimmed" size="sm">
              左の「チャットルーム」からルームを選択すると、履歴が表示されます。
            </Text>
          ) : (
            <Text c="dimmed" size="sm">
              まだチャットルームがありません。
            </Text>
          )}
        </Stack>
      </Flex>

      {/* 下側：フッターに固定したい入力欄 */}
      {/* <Box px="lg">
        <MessageInput />
      </Box> */}
    </Flex>
  );
}
