import React from 'react';
import { Paper, Text, Title, Button, Stack, CloseButton } from '@mantine/core';
import styles from './Onboarding.module.css';

type OnboardingProps = {
  page?: string;
  steps?: string[];
};

const STORAGE_PREFIX = 'kjax:onboarding:';

export default function Onboarding({
  page = 'default',
  steps,
}: OnboardingProps) {
  const key = `${STORAGE_PREFIX}${page}`;
  const [visible, setVisible] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem(key) !== 'hidden';
    } catch {
      return true;
    }
  });

  const defaultSteps = [
    'この画面の簡単な使い方を表示します。',
    '必要に応じて操作を行ってください。',
    '「表示しない」を選ぶとこの画面では再度表示されません。',
  ];

  const handleHide = () => {
    try {
      localStorage.setItem(key, 'hidden');
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Paper withBorder radius="md" p="sm" className={styles.root}>
      <div className={styles.titleRow}>
        <Title order={4}>はじめに — 使い方</Title>
        <CloseButton onClick={handleHide} aria-label="閉じる" />
      </div>
      <Text size="sm" c="dimmed" mt="6">
        この画面: {page}
      </Text>
      <Stack spacing={6} className={styles.steps}>
        {(steps ?? defaultSteps).map((s, i) => (
          <Text key={i} className={styles.step} size="sm">
            {i + 1}. {s}
          </Text>
        ))}
      </Stack>
      <div className={styles.actions}>
        <Button
          size="xs"
          variant="outline"
          onClick={() => {
            try {
              localStorage.removeItem(key);
              setVisible(true);
            } catch {}
          }}
        >
          再表示
        </Button>
        <Button size="xs" color="gray" variant="light" onClick={handleHide}>
          表示しない
        </Button>
      </div>
    </Paper>
  );
}
