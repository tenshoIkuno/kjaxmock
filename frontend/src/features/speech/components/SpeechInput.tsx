import { useSpeech } from '@/features/speech/hooks/useSpeech';
import { Alert, Box, Button, Paper, Stack, Textarea } from '@mantine/core';
import {
  IconAlertCircle,
  IconMicrophone,
  IconPlayerStop,
} from '@tabler/icons-react';

export function SpeechInput() {
  const { showText, error, isAuthorizing, isListening, handleToggle } =
    useSpeech();

  const transcript = showText;

  return (
    <Box px="lg" pb="md">
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Textarea
            placeholder="AIに話した内容がこちらに表示されます"
            autosize
            minRows={4}
            maxRows={8}
            value={transcript}
            readOnly
          />
          <Button
            fullWidth
            leftSection={
              isListening ? (
                <IconPlayerStop size={16} />
              ) : (
                <IconMicrophone size={16} />
              )
            }
            onClick={handleToggle}
            color={isListening ? 'red' : undefined}
            variant={isListening ? 'light' : 'filled'}
            disabled={isAuthorizing}
          >
            {isAuthorizing
              ? 'トークン認証中...'
              : isListening
                ? '停止'
                : '音声入力開始'}
          </Button>

          {error && (
            <Alert
              color="red"
              icon={<IconAlertCircle size={16} />}
              title="エラー"
              variant="light"
            >
              {error}
            </Alert>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
