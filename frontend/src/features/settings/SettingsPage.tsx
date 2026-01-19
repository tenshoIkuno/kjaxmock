import { DashboardLayout } from '@/common/dashboard/Dashboard';
import { TabsList } from '@/features/settings/components/TabsList';

export const SettingsPage = () => {
  return (
    <DashboardLayout title="設定">
      <TabsList />
    </DashboardLayout>
  );
};
