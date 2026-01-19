import { useCommonStore } from '@/common/store/commonStore';
import { ClientPage } from '@/features/client/ClientPage';
import { PatrolAuditPage } from '@/features/patrol-audit/PatrolAuditPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { ChatPage } from '@/pages/ChatPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

export const PageSwitcher = () => {
  // 表示中のページ
  const selected = useCommonStore((s) => s.selected);

  if (selected === 'chat') return <ChatPage />;
  if (selected === 'clients') return <ClientPage />;
  if (selected === 'patrolAudit') return <PatrolAuditPage />;
  if (selected === 'settings') return <SettingsPage />;

  if (selected === 'dashboard') return <DashboardPage />;

  return null;
};
