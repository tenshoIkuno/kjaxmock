import React, { useState, useEffect } from 'react';
import { Drawer, Group, Title, Text, Stack, Badge, Skeleton, Paper, Button, Box } from '@mantine/core';
import DashboardModal from '@/common/dashboard/Modal';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useAlerts } from '@/features/alerts/hooks/useAlerts';
import type { NotificationItem } from '@/features/notifications/types';
import type { Alert } from '@/features/alerts/types';
import { IconCheck } from '@tabler/icons-react';

export const NotificationDrawer: React.FC<{ opened: boolean; onClose: () => void }> = ({ opened, onClose }) => {
  const { data: notifs, isLoading: notifsLoading, refetch } = useNotifications();
  const { data: alerts, isLoading: alertsLoading } = useAlerts();

  type DrawerItem = {
    id: string;
    kind: 'notification' | 'alert';
    type?: string;
    title?: string;
    summary?: string;
    detectedAt?: string;
    assignedTo?: string | null;
    read?: boolean;
    resolved?: boolean;
    evidence?: any;
  };

  const [items, setItems] = useState<DrawerItem[]>([]);
  const [selected, setSelected] = useState<DrawerItem | null>(null);

  useEffect(() => {
    // merge notifications and alerts into a common DrawerItem list
    const n = (notifs ?? []).map<DrawerItem>((it: NotificationItem) => ({
      id: it.id,
      kind: 'notification',
      type: it.title ?? '通知',
      title: it.title ?? it.type ?? '通知',
      summary: it.summary ?? '',
      detectedAt: it.detectedAt as any,
      assignedTo: it.assignedTo ?? null,
      read: !!it.read,
    }));

    const a = (alerts ?? []).map<DrawerItem>((it: Alert) => ({
      id: it.id,
      kind: 'alert',
      type: it.type,
      title: it.type,
      summary: it.description,
      detectedAt: it.createdAt,
      assignedTo: null,
      resolved: !!it.resolved,
    }));

    // show alerts first (recent first), then notifications
    const merged = [...a, ...n];
    setItems(merged);
  }, [notifs, alerts]);

  const isLoading = notifsLoading || alertsLoading;

  // simple mark-read / mark-resolved in local state (mock)
  const markRead = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, read: true, resolved: it.kind === 'alert' ? true : it.resolved } : it)));
  };

  const columns = [
    { key: 'detectedAt', label: '日時', render: (r: any) => new Date(r.detectedAt).toLocaleString(), width: '26%' },
    { key: 'clientId', label: '顧問先', render: (r: any) => r.clientId ?? '-', width: '24%' },
    { key: 'title', label: 'タイトル', render: (r: any) => r.title, width: '34%', ellipsis: true },
    { key: 'severity', label: '優先度', render: (r: any) => <Badge color={r.severity === 'critical' ? 'red' : r.severity === 'medium' ? 'orange' : 'gray'}>{r.severity}</Badge>, width: '16%' },
  ];

  return (
    <>
      <Drawer opened={opened} onClose={onClose} title={<Title order={4}>通知</Title>} size="lg" padding="md" position="right">
        {isLoading ? (
          <Stack>
            <Skeleton height={24} />
            <Skeleton height={24} />
            <Skeleton height={24} />
          </Stack>
        ) : (
          <Stack spacing="md">
            {items.map((it) => (
              <Paper key={it.id} withBorder radius="md" p="md" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Group position="apart" align="flex-start">
                  <Badge variant="light" color="yellow" sx={{ borderRadius: 20, padding: '6px 10px', fontWeight: 700 }}>
                    {it.type ?? '業務フロー逸脱・業務品質'}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {it.detectedAt ? (() => {
                      try {
                        const diff = Math.floor((Date.now() - new Date(it.detectedAt).getTime()) / 1000 / 60);
                        if (diff < 60) return `${diff} 分前`;
                        const hours = Math.floor(diff / 60);
                        if (hours < 24) return `${hours} 時間前`;
                        const days = Math.floor(hours / 24);
                        return `${days} 日前`;
                      } catch {
                        return new Date(it.detectedAt).toLocaleString();
                      }
                    })() : ''}
                  </Text>
                </Group>

                <Box>
                  <Text size="sm" style={{ marginBottom: 6 }}>{it.title}</Text>
                  <Text size="sm" c="dimmed" style={{ marginBottom: 8 }}>{it.summary}</Text>
                  <Text size="xs" c="dimmed">レポート作成者： {it.assignedTo ?? 'kanke'}</Text>
                </Box>

                <Group position="right">
                  <Button
                    size="sm"
                    color="green"
                    leftIcon={<IconCheck size={14} />}
                    onClick={() => {
                      markRead(it.id);
                    }}
                  >
                    解決済みにする
                  </Button>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Drawer>

      <DashboardModal opened={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? ''}>
        <div style={{ minWidth: 480 }}>
          {/* re-render details */}
          <Text size="sm" c="dimmed">検出日時: {selected?.detectedAt}</Text>
          <Text mt="md">{selected?.summary}</Text>
          {selected?.evidence?.transcript ? (
            <>
              <Title order={6} mt="md">検出根拠（文字起こし）</Title>
              <Text size="sm" c="dimmed">{selected?.evidence?.transcript}</Text>
            </>
          ) : null}
        </div>
      </DashboardModal>
    </>
  );
};

export default NotificationDrawer;
