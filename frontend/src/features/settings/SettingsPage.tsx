import { DashboardLayout } from '@/common/dashboard/Dashboard';
import { TabsList } from '@/features/settings/components/TabsList';
import { Button } from '@mantine/core';

export const SettingsPage = () => {
  return (
    <DashboardLayout
      title="設定"
      actionButton={<Button size="sm">パターン１</Button>}
    >
      <TabsList />
    </DashboardLayout>
  );
};
