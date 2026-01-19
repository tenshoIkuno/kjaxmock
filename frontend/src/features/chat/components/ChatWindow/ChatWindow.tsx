import { AiTypingDots } from '@/features/chat/components/ChatWindow/AiTypingDots';
import { CopyButton } from '@/features/chat/components/ChatWindow/CopyButton';
import { ReactMarkdownComponent } from '@/features/chat/components/ChatWindow/ReactMarkdown';
import type { ChatMessage } from '@/features/chat/types/messageTypes';
import {
  Group,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';

type ChatWindowProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
};

export function ChatWindow({
  messages,
  isLoading,
  isStreaming,
}: ChatWindowProps) {
  // ホバー中のメッセージID
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  // 一番下にスクロール用の要素
  const bottomRef = useRef<HTMLDivElement | null>(null);
  // 前回のメッセージ数を保持（増えたときだけスクロールする）
  const prevLengthRef = useRef(messages.length);

  // メッセージ数が「増えたときだけ」一番下までスクロール
  useEffect(() => {
    const prevLength = prevLengthRef.current;

    // ref 更新だけして終了（初回や、変化なしの場合）
    if (!bottomRef.current) {
      prevLengthRef.current = messages.length;
      return;
    }

    // 前回よりメッセージが増えたときだけスクロール（＝送信/受信時）
    if (messages.length > prevLength) {
      bottomRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }

    // 次回用に現在の長さを保存
    prevLengthRef.current = messages.length;
  }, [messages.length]);
  return (
    <>
      <LoadingOverlay visible={isLoading} zIndex={1000} />
      <Stack
        h="100%"
        gap="md"
        style={{
          flex: 1,
          minHeight: 0,
        }}
      >
        <Group justify="space-between" align="flex-end">
          <Text fw={600}>チャット</Text>
          <Text size="xs" c="dimmed">
            {messages.length}件のメッセージ
          </Text>
        </Group>

        <ScrollArea
          offsetScrollbars
          style={{
            flex: 1,
            minHeight: 0,
          }}
        >
          <Stack gap="xs" pr="sm">
            {messages.map((message) => {
              // userかassistantかの判定のフラグ
              const isUser = message.role === 'user';
              // AI生成中かの判定フラグ
              const isAiTyping =
                message.role === 'assistant' &&
                isStreaming &&
                message.content === '';
              return (
                <Group
                  key={message.id}
                  justify={isUser ? 'flex-end' : 'flex-start'}
                  align="flex-start"
                  wrap="nowrap"
                  px="20%"
                >
                  <Stack
                    gap="xs"
                    align={isUser ? 'flex-end' : 'flex-start'}
                    onMouseEnter={() => setHoveredMessageId(message.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {/* メッセージ */}
                    <Paper
                      radius="lg"
                      px="md"
                      py="sm"
                      bg={isUser ? 'blue.6' : undefined}
                      c={isUser ? 'white' : undefined}
                      maw={isUser ? '75%' : undefined}
                    >
                      <Stack gap={4}>
                        {/* 本文 */}
                        {isAiTyping ? (
                          <AiTypingDots />
                        ) : isUser ? (
                          <Text size="sm">{message.content}</Text>
                        ) : (
                          <Text size="sm">
                            <ReactMarkdownComponent>
                              {message.content}
                            </ReactMarkdownComponent>
                          </Text>
                        )}
                        {/* タイムスタンプ */}
                        <Text size="xs" c={isUser ? 'white' : 'dimmed'}>
                          {message.created_at.toLocaleString()}
                        </Text>
                      </Stack>
                    </Paper>

                    {/* コピーアイコン CopyButton.tsx */}
                    <CopyButton
                      messageId={message.id}
                      hoveredMessageId={hoveredMessageId}
                      text={message.content}
                    />
                  </Stack>
                </Group>
              );
            })}
            {/* スクロール用の要素 */}
            <div ref={bottomRef} />
          </Stack>
        </ScrollArea>
      </Stack>
    </>
  );
}
