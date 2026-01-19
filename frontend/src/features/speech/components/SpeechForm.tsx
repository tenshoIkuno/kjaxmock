import { SpeechInput } from '@/features/speech/components/SpeechInput';
import { Flex, Stack, Text } from '@mantine/core';
import { IconMicrophone } from '@tabler/icons-react';

/**
 * 音声文字起こし画面のUIコンポーネント
 * -showText: テキストエリアに表示する文字起こし結果
 * -isAuthorizing: 認可中かどうかの状態
 * -isListening: 音声認識中かどうかの状態
 * -handleToggle: 音声認識の開始/停止を切り替える関数
 * -error: エラーメッセージ
 */
export function SpeechForm() {
  return (
    <Flex direction="column" gap="md" h="100%" style={{ minHeight: 0, position: 'relative' }}>
      {/* 中央メッセージ*/}
      <Flex flex={1} align="center" justify="center" style={{ minHeight: 0, overflow: 'auto' }}>
        <Stack align="center" gap="xs">
          <IconMicrophone size={32} />
          <Text fw={600}>音声から報告の作成をお手伝いします</Text>
          <Text c="dimmed" size="sm">
            音声入力開始を押して話しかけると、報告が作成されていきます。
          </Text>
        </Stack>
      </Flex>
      {/* テキスト表示と開始・停止ボタン（下部に固定） */}
      <div style={{ position: 'sticky', bottom: 0, zIndex: 2, background: 'transparent', paddingTop: 8 }}>
        <SpeechInput />
      </div>
    </Flex>
  );
}
