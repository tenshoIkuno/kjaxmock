import { DashboardModal } from '@/common/dashboard/Modal';
import {
  Badge,
  Button,
  Group,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import TooltipHelpButton from '@/common/components/TooltipHelpButton';
import {
  IconChevronDown,
  IconChevronRight,
  IconPlus,
} from '@tabler/icons-react';
import { useState } from 'react';

type Importance = '高' | '中' | '低';

type Issue = {
  id: number;
  importance: Importance;
  content: string;
  reason: string;
  impact: string;
  correctiveAction: string;
};

export const ThirdPanel = () => {
  const [modalOpened, setModalOpened] = useState(false);

  // フォーム用ステート
  const [importance, setImportance] = useState<Importance | null>(null);
  const [content, setContent] = useState('');
  const [reason, setReason] = useState('');
  const [impact, setImpact] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');

  // 登録済みの指摘事項リスト
  const [issues, setIssues] = useState<Issue[]>([]);
  // モーダル内で開いている項目
  const [openedIssueId, setOpenedIssueId] = useState<number | null>(null);

  const resetForm = () => {
    setImportance(null);
    setContent('');
    setReason('');
    setImpact('');
    setCorrectiveAction('');
  };

  const handleCreate = () => {
    if (!importance || !content.trim()) {
      alert('重要度と内容は必須です。');
      return;
    }

    const newIssue: Issue = {
      id: Date.now(),
      importance,
      content: content.trim(),
      reason: reason.trim(),
      impact: impact.trim(),
      correctiveAction: correctiveAction.trim(),
    };

    setIssues((prev) => [...prev, newIssue]);
    resetForm();
  };

  const importanceColor = (imp: Importance) => {
    switch (imp) {
      case '高':
        return 'red';
      case '中':
        return 'yellow';
      case '低':
      default:
        return 'green';
    }
  };

  return (
    <>
      {/* 指摘事項一覧モーダル */}
      <DashboardModal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
        }}
        title="指摘事項一覧"
      >
        <ScrollArea.Autosize mah={400}>
          <Stack gap="sm">
            {issues.length === 0 && (
              <Text size="sm" c="dimmed">
                まだ指摘事項が登録されていません。
              </Text>
            )}

            <Stack gap="xs" mt="xs">
              {issues.map((issue) => {
                const isOpened = openedIssueId === issue.id;

                return (
                  <Paper
                    key={issue.id}
                    p="sm"
                    withBorder
                    onClick={() =>
                      setOpenedIssueId((prev) =>
                        prev === issue.id ? null : issue.id,
                      )
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <Stack gap={4}>
                      <Group gap="xs" align="flex-start">
                        {/* ▶ / ▼ アイコン（ここに出ます） */}
                        {isOpened ? (
                          <IconChevronDown size={16} />
                        ) : (
                          <IconChevronRight size={16} />
                        )}

                        {/* 重要度（色付き） */}
                        <Badge color={importanceColor(issue.importance)}>
                          {issue.importance}
                        </Badge>

                        {/* 内容 */}
                        <Text size="sm">{issue.content || '-'}</Text>
                      </Group>

                      {/* クリックした行だけ詳細を展開 */}
                      {isOpened && (
                        <Stack gap={2} mt="xs">
                          {issue.reason && (
                            <Text size="xs" c="dimmed">
                              根拠：{issue.reason}
                            </Text>
                          )}
                          {issue.impact && (
                            <Text size="xs" c="dimmed">
                              影響：{issue.impact}
                            </Text>
                          )}
                          {issue.correctiveAction && (
                            <Text size="xs" c="dimmed">
                              是正案：{issue.correctiveAction}
                            </Text>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Stack>
        </ScrollArea.Autosize>
      </DashboardModal>

      {/* 指摘事項追加フォーム */}
      <Stack gap="sm" mt="md">
        {/* 入力欄だけスクロール */}
        <ScrollArea.Autosize mah={240}>
          <Stack gap="sm" pr="sm">
            <Select
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>重要度</span>
                  <TooltipHelpButton
                    tip="報告の重要度を選択してください（高/中/低）"
                    size={16}
                  />
                </div>
              }
              placeholder="選択してください"
              data={['高', '中', '低']}
              value={importance}
              onChange={(value) => setImportance(value as Importance | null)}
              withAsterisk
            />

            <Textarea
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>内容</span>
                  <TooltipHelpButton
                    tip="発見した指摘の具体的な内容を入力してください"
                    size={16}
                  />
                </div>
              }
              placeholder="内容を入力"
              minRows={2}
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              withAsterisk
            />

            <Textarea
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>根拠</span>
                  <TooltipHelpButton
                    tip="指摘の根拠や参照資料を簡潔に入力してください"
                    size={16}
                  />
                </div>
              }
              placeholder="根拠を入力"
              minRows={2}
              value={reason}
              onChange={(e) => setReason(e.currentTarget.value)}
            />

            <Textarea
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>影響</span>
                  <TooltipHelpButton
                    tip="発見事項が業務や財務に与える影響を記載してください"
                    size={16}
                  />
                </div>
              }
              placeholder="影響を入力"
              minRows={2}
              value={impact}
              onChange={(e) => setImpact(e.currentTarget.value)}
            />

            <Textarea
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>是正案</span>
                  <TooltipHelpButton
                    tip="想定される改善策や対応案を入力してください"
                    size={16}
                  />
                </div>
              }
              placeholder="是正案を入力"
              minRows={2}
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.currentTarget.value)}
            />
          </Stack>
        </ScrollArea.Autosize>

        {/* ボタンはスクロール外に出して常に下に表示 */}
        <Group justify="flex-end" mt="md">
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
            追加
          </Button>
          <Button variant="outline" onClick={() => setModalOpened(true)}>
            指摘事項一覧
          </Button>
        </Group>
      </Stack>
    </>
  );
};
