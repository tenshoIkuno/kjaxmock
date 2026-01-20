import { DashboardLayout } from '@/common/dashboard/Dashboard';
import { TabsList } from '@/features/settings/components/TabsList';
import { Button, Group } from '@mantine/core';
import { openOnboarding } from '@/common/components/Onboarding/controller';
import { openProductTour } from '@/common/components/ProductTour/controller';

export const SettingsPage = () => {
  return (
    <DashboardLayout
      title="設定"
      actionButton={
        <Group style={{ justifyContent: 'flex-start' }}>
          <Button size="sm" onClick={() => openOnboarding('設定')}>
            パターン１
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openProductTour('設定')}
          >
            パターン３
          </Button>
        </Group>
      }
    >
      <TabsList />
    </DashboardLayout>
  );
};
