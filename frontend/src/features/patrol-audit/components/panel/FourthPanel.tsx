import { DashboardModal } from '@/common/dashboard/Modal';
import {
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

type Plan = {
  id: number;
  description: string; // 対応内容
  dueDate: string; // 期限 (YYYY-MM-DD)
  assignee: string; // 担当
};

export const FourthPanel = () => {
  const [modalOpened, setModalOpened] = useState(false);

  // フォーム用ステート
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');

  // 是正計画のリスト
  const [plans, setPlans] = useState<Plan[]>([]);

  const resetForm = () => {
    setDescription('');
    setDueDate('');
    setAssignee('');
  };

  const handleCreate = () => {
    // 必須チェック
    if (!description.trim() || !dueDate) {
      alert('対応内容と期限は必須です。');
      return;
    }

    const newPlan: Plan = {
      id: Date.now(),
      description: description.trim(),
      dueDate,
      assignee: assignee.trim(),
    };

    setPlans((prev) => [...prev, newPlan]);
    resetForm();
  };

  return (
    <>
      {/* 是正計画一覧モーダル（中身スクロール） */}
      <DashboardModal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
        }}
        title="是正計画一覧"
      >
        {/* モーダル内コンテンツを 60vh までにしてスクロール可能にする */}
        <ScrollArea.Autosize mah={400} scrollbarSize={8}>
          <Stack gap="sm">
            {plans.length === 0 && (
              <Text size="sm" c="dimmed">
                まだ是正計画が登録されていません。
              </Text>
            )}

            <Stack gap="xs" mt="xs">
              {plans.map((plan) => (
                <Paper key={plan.id} p="sm" withBorder>
                  <Text fw={500} size="sm" mb={4}>
                    対応内容
                  </Text>
                  <Text size="sm" mb="xs">
                    {plan.description || '-'}
                  </Text>

                  <Group gap="md" align="flex-start">
                    <Stack gap={2} style={{ minWidth: 140 }}>
                      <Text fw={500} size="xs">
                        期限
                      </Text>
                      <Text size="sm">{plan.dueDate || '-'}</Text>
                    </Stack>

                    <Stack gap={2}>
                      <Text fw={500} size="xs">
                        担当
                      </Text>
                      <Text size="sm">{plan.assignee || '-'}</Text>
                    </Stack>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </ScrollArea.Autosize>
      </DashboardModal>

      {/* 是正計画追加フォーム（入力欄もスクロール） */}
      <Stack gap="sm" mt="md">
        {/* 入力欄部分を固定高さにしてスクロール可能に */}
        <ScrollArea h={240} scrollbarSize={8}>
          <Stack gap="sm" pr="sm">
            <Textarea
              label="対応内容"
              placeholder="対応内容を入力"
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              withAsterisk
            />

            <TextInput
              label="期限"
              placeholder="期限を選択"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.currentTarget.value)}
              withAsterisk
            />

            <TextInput
              label="担当"
              placeholder="担当者名などを入力"
              value={assignee}
              onChange={(e) => setAssignee(e.currentTarget.value)}
            />
          </Stack>
        </ScrollArea>

        {/* 下部ボタン */}
        <Group justify="flex-end" mt="md">
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
            追加
          </Button>
          <Button variant="outline" onClick={() => setModalOpened(true)}>
            是正計画一覧
          </Button>
        </Group>
      </Stack>
    </>
  );
};
