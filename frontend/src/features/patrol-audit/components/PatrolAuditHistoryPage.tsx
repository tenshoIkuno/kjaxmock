import { SpeechForm } from '@/features/speech/components/SpeechForm';
import { Box, Button, Group, Paper, TextInput, Stack, Badge, Flex, Textarea, ScrollArea, Divider, Title, Text } from '@mantine/core';
import { useClientStore } from '@/features/client/store/clientStore';
import React, { useState } from 'react';

export const PatrolAuditHistoryPage: React.FC = () => {
  const selectedClientId = useClientStore((s) => s.selectedClientId);
  const clientName = useClientStore.getState().selectedClientName || '';

  const fields: { key: string; label: string; value?: string; type?: 'text' | 'textarea' }[] = [
    { key: '担当者', label: '顧客担当者', value: 'ｃｄ', type: 'text' },
    { key: '業務区分', label: '業務区分', type: 'text' },
    { key: '対応日', label: '対応日', type: 'text' },
    { key: '対応方法', label: '対応方法', type: 'text' },
    { key: '対応内容概要', label: '対応内容概要', type: 'textarea' },
    { key: '対応所要時間', label: '対応所要時間', type: 'text' },
    { key: '相談内容', label: '相談内容', type: 'textarea' },
    { key: '預かり資料', label: '預かり資料', type: 'text' },
    { key: '提出資料', label: '提出資料', type: 'text' },
    { key: '進捗', label: '進捗・ステータス', type: 'text' },
    { key: '次回対応予定', label: '次回対応予定', type: 'text' },
    { key: '未解決', label: '未解決事項・課題', type: 'textarea' },
    { key: '要望', label: '顧客要望・質問', type: 'textarea' },
    { key: '回答', label: '回答・提案内容', type: 'textarea' },
    { key: 'リスク', label: 'リスク・注意事項', type: 'textarea' },
  ];

  // local state to track current values so badges update live
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.value ?? ''])) as Record<string, string>
  );

  return (
    <Flex direction="column" h="100%">
      <Group justify="space-between" px="md" py="xs" align="flex-start">
        <Group direction="column" spacing={4} style={{ flex: 1 }}>
          <Title order={2}>監査履歴</Title>
          <Text c="dimmed">業務記録の作成・管理</Text>
        </Group>
        <Button color="blue">+ 保存</Button>
      </Group>

      <Divider />

      <Flex gap="md" style={{ height: '100%' }} px="md" py="md">
        {/* 左：プレビュー */}
        <Box w="32%" style={{ minWidth: 280, height: '100%', minHeight: 0 }}>
          <Paper withBorder shadow="xs" radius="md" p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: 8 }}>プレビュー</h3>
            <ScrollArea style={{ flex: 1 }} offsetScrollbars>
              <Stack spacing="sm">
                {fields.map((f) => {
                const current = values[f.key] ?? '';
                const filled = current.trim().length > 0;
                const badge = filled ? (
                  <Badge size="xs" style={{ backgroundColor: '#e6f7ff', color: '#007acc' }}>入力済み</Badge>
                ) : (
                  <Badge color="pink" variant="light" size="xs">未入力</Badge>
                );

                const Label = (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                    }}
                  >
                    <span>{f.label}</span>
                    <span style={{ marginLeft: 8 }}>{badge}</span>
                  </div>
                );

                return f.type === 'textarea' ? (
                  <Textarea
                    key={f.key}
                    label={Label}
                    placeholder=""
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValues((p) => ({ ...p, [f.key]: e?.currentTarget?.value ?? '' }))}
                    minRows={3}
                    styles={{ label: { display: 'flex', width: '100%' } }}
                  />
                ) : (
                  <TextInput
                    key={f.key}
                    label={Label}
                    placeholder=""
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValues((p) => ({ ...p, [f.key]: e?.currentTarget?.value ?? '' }))}
                    styles={{ label: { display: 'flex', width: '100%' } }}
                  />
                );
              })}
              </Stack>
            </ScrollArea>
          </Paper>
        </Box>

        {/* 右：音声入力領域 */}
        <Box w="68%" style={{ minWidth: 300, minHeight: 0 }}>
          <Paper withBorder shadow="xs" radius="md" p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <SpeechForm />
          </Paper>
        </Box>
      </Flex>
    </Flex>
  );
};

export default PatrolAuditHistoryPage;
