import { PasswordPanel } from '@/features/settings/components/PasswordPanel/PasswordPanel';
import { ProfilePanel } from '@/features/settings/components/ProfilePanel';
import { SystemPanel } from '@/features/settings/components/SystemPanel';
import { TenatPanel } from '@/features/settings/components/TenantPanel';
import { TeamPanel } from '@/features/settings/components/TeamPanel';
import { Tabs } from '@mantine/core';
import {
  IconBuilding,
  IconKey,
  IconSettings,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';

export const TabsList = () => {
  return (
    <Tabs defaultValue="profile">
      <Tabs.List defaultValue="profile">
        <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
          プロフィール
        </Tabs.Tab>
        <Tabs.Tab
          value="teams"
          id="settings-tab-teams"
          leftSection={<IconUsers size={16} />}
        >
          チーム
        </Tabs.Tab>
        <Tabs.Tab value="tenant" leftSection={<IconBuilding size={16} />}>
          テナント
        </Tabs.Tab>
        <Tabs.Tab value="password" leftSection={<IconKey size={16} />}>
          パスワード変更
        </Tabs.Tab>
        <Tabs.Tab value="system" leftSection={<IconSettings size={16} />}>
          システム設定
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="profile">
        <ProfilePanel />
      </Tabs.Panel>

      <Tabs.Panel value="teams">
        <TeamPanel />
      </Tabs.Panel>

      <Tabs.Panel value="tenant">
        <TenatPanel />
      </Tabs.Panel>

      <Tabs.Panel value="password">
        <PasswordPanel />
      </Tabs.Panel>

      <Tabs.Panel value="system">
        <SystemPanel />
      </Tabs.Panel>
    </Tabs>
  );
};
