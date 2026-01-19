import React from 'react';
import { Stack, Title, Text, Divider, Badge, Group, Button } from '@mantine/core';
import type { NotificationItem } from './types';

export const NotificationDetail: React.FC<{ item: NotificationItem | null; onAssign?: (id: string) => void }> = ({ item, onAssign }) => {
  if (!item) return null;

  return (
    <Stack>
      <Group position="apart">
        <Title order={4}>{item.title}</Title>
        <Badge color={item.severity === 'critical' ? 'red' : item.severity === 'medium' ? 'orange' : 'gray'}>
          {item.severity ?? 'low'}
        </Badge>
      </Group>
      <Text size="sm" c="dimmed">検出日時: {item.detectedAt ?? '-'}</Text>
      <Divider />
      <Text>{item.summary}</Text>
      {item.evidence?.transcript ? (
        <>
          <Divider />
          <Title order={6}>検出根拠（文字起こし）</Title>
          <Text size="sm" c="dimmed">{item.evidence.transcript}</Text>
        </>
      ) : null}

      <Group position="right">
        <Button variant="default" onClick={() => onAssign && item.id && onAssign(item.id)}>担当を割り当てる</Button>
        <Button color="red">エスカレーション</Button>
      </Group>
    </Stack>
  );
};

export default NotificationDetail;
