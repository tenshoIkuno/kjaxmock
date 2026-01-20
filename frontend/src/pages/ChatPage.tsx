import { ChatHomeWindow } from '@/features/chat/components/ChatHomeWindow';
import { ChatWindow } from '@/features/chat/components/ChatWindow/ChatWindow';
import { MessageInput } from '@/features/chat/components/MessageInput';
import { useChat } from '@/features/chat/hooks/useChat';
import { useChatStream } from '@/features/chat/hooks/useMessage';
import { useChatStore } from '@/features/chat/store/chatStore';
import { Box, Flex, Button, Group } from '@mantine/core';
import { openOnboarding } from '@/common/components/Onboarding/controller';
import { openProductTour } from '@/common/components/ProductTour/controller';

export function ChatPage() {
  // useChatStoreから、現在選択されているchatIdを取得
  const currentChatId = useChatStore((s) => s.currentChatId);
  // currentChatId に応じてサーバーからチャット情報を取得
  const { isLoading } = useChat(currentChatId);
  // useChatStoreから、現在選択されているchatIdに紐づくメッセージを取得
  const chat = useChatStore((s) =>
    s.chats.find((chat) => chat.id === s.currentChatId),
  );

  // ストリーミング中のメッセージ
  const streamingMessages = useChatStore((s) => s.streamingMessages);
  // 本番メッセージ + ストリーミング中メッセージをマージ
  const displayMessages = [
    ...(chat?.messages ?? []),
    ...(currentChatId
      ? Object.values(streamingMessages[currentChatId] ?? {}).sort(
          (a, b) => a.created_at.getTime() - b.created_at.getTime(),
        )
      : []),
  ];

  // 送信フック frontend/src/features/chat/hooks/useMessage.ts に定義
  const { sendMessage, isStreaming } = useChatStream();

  // 送信ボタンで実行される処理
  const handleSend = async (prompt: string) => {
    sendMessage(currentChatId, prompt);
  };

  return (
    <Flex direction="column" gap={0} style={{ flex: 1, minHeight: 0 }}>
      <div style={{ padding: 8 }}>
        <Group>
          <Button size="xs" onClick={() => openOnboarding('チャット')}>
            パターン１
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => openProductTour('チャット')}
          >
            パターン３
          </Button>
        </Group>
      </div>
      {currentChatId ? (
        <ChatWindow
          messages={displayMessages}
          isLoading={isLoading}
          isStreaming={isStreaming}
        />
      ) : (
        <ChatHomeWindow />
      )}

      {/* 入力欄は常に表示。新規チャットでも handleSend が内部で作成を担当 */}
      <Box component="footer" px="lg">
        <MessageInput onSend={handleSend} />
      </Box>
    </Flex>
  );
}
