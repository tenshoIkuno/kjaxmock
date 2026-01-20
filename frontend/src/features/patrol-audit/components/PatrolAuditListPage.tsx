import { DashboardLayout } from '@/common/dashboard/Dashboard';
import { List } from '@/common/dashboard/List';
import { Button, Group, ActionIcon } from '@mantine/core';
import { openOnboarding } from '@/common/components/Onboarding/controller';
import { openProductTour } from '@/common/components/ProductTour/controller';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import type { FC } from 'react';

export type PatrolAudit = {
  id: number;
  date: string;
  clientName: string;
  auditor: string;
  status: string;
};

const initialAudits: PatrolAudit[] = [
  {
    id: 1,
    date: '2025-11-01',
    clientName: 'サンプル顧問先A',
    auditor: '山田 太郎',
    status: '下書き',
  },
  {
    id: 2,
    date: '2025-11-10',
    clientName: 'サンプル顧問先B',
    auditor: '佐藤 花子',
    status: '提出済み',
  },
];

// columns はコンポーネント内で生成（親から渡された onClickCreate を使うため）

const ActionButtons: FC<{
  audit: PatrolAudit;
  onEdit?: (a: PatrolAudit) => void;
}> = ({ audit, onEdit }) => {
  const [editing, setEditing] = useState(false);

  const _onEdit = () => {
    // 編集は親コンポーネントへ委譲（親が作成画面を開く）
    if (onEdit) return onEdit(audit);
    // fallback: トグル表示
    setEditing((s) => !s);
  };

  const onDelete = () => {
    // PatrolAuditListPage 側で削除処理を行うため、カスタムイベントを発火させる
    const ev = new CustomEvent('patrolAudit:delete', {
      detail: { id: audit.id },
    });
    window.dispatchEvent(ev);
  };

  return (
    <Group spacing="xs" position="center">
      <ActionIcon aria-label="編集" onClick={_onEdit} title="編集">
        <IconEdit size={16} />
      </ActionIcon>
      <ActionIcon color="red" aria-label="削除" onClick={onDelete} title="削除">
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  );
};

type Props = {
  onClickCreate: (audit?: PatrolAudit) => void;
};

export const PatrolAuditListPage: FC<Props> = ({ onClickCreate }) => {
  const [audits, setAudits] = useState<PatrolAudit[]>(initialAudits);

  useEffect(() => {
    const handler = (e: any) => {
      const id = e.detail?.id as number;
      if (!id) return;
      setAudits((prev) => prev.filter((a) => a.id !== id));
    };
    window.addEventListener('patrolAudit:delete', handler as EventListener);
    return () =>
      window.removeEventListener(
        'patrolAudit:delete',
        handler as EventListener,
      );
  }, []);

  const columns = [
    { key: 'date', label: '巡回日' },
    { key: 'clientName', label: '顧問先' },
    { key: 'auditor', label: '担当者' },
    { key: 'status', label: 'ステータス' },
    {
      key: 'actions',
      label: '操作',
      render: (row: PatrolAudit) => (
        <ActionButtons audit={row} onEdit={onClickCreate} />
      ),
      align: 'center',
    },
  ] as const;

  return (
    <DashboardLayout
      title="巡回監査報告"
      label="巡回監査報告の一覧"
      actionButton={
        <Group>
          <Button leftSection={<IconPlus size={18} />} onClick={onClickCreate}>
            巡回監査報告作成
          </Button>
          <Button size="sm" onClick={() => openOnboarding('巡回監査')}>
            パターン１
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openProductTour('巡回監査')}
          >
            パターン３
          </Button>
        </Group>
      }
    >
      <List columns={columns} data={audits} />
    </DashboardLayout>
  );
};
