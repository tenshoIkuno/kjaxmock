import { useCommonStore } from '@/common/store/commonStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useChatStore } from '@/features/chat/store/chatStore';
import { useClientStore } from '@/features/client/store/clientStore';
import type { Client } from '@/features/client/types/clientTypes';
import {
  Avatar,
  Burger,
  Button,
  Group,
  Select,
  Menu,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
  Table,
  Badge,
  Indicator,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import DashboardModal from '@/common/dashboard/Modal';
import { useState, useEffect } from 'react';
import NotificationDrawer from '@/common/dashboard/NotificationDrawer';
import { IconBell } from '@tabler/icons-react';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useAlerts } from '@/features/alerts/hooks/useAlerts';
import {
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
} from '@tabler/icons-react';
import { UnstyledButton } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';

type HeaderProps = {
  opened: boolean;
  onToggle: () => void;
};

export function Header({ opened, onToggle }: HeaderProps) {
  // 設定モーダルを開くためのコンテキスト
  // const { open: openSettings } = useSettings();

  // ユーザ情報
  const user = useAuthStore((s) => s.user);

  // ログアウト確認モーダルの開閉状態
  const [logoutOpened, { open: openLogoutModal, close: closeLogoutModal }] =
    useDisclosure(false);
  // ログアウトフック
  const logout = useLogout();

  // 現在選択中のチャットルーム名（選択されているときだけ表示）
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const currentChatTitle =
    // currentChatId が null のときはタイトルは何も出さない
    currentChatId != null
      ? (chats.find((c) => c.id === currentChatId)?.title ?? null)
      : null;

  // 現在選択中の顧問先（選択されているときだけ表示）
  const currentClientId = useClientStore((s) => s.currentClientId);
  const currentClientName = useClientStore((s) => s.currentClientName);
  const queryClient = useQueryClient();
  const clients = queryClient.getQueryData<Client[]>(['clients']);
  const currentClient = clients?.find((c) => c.id === currentClientId);

  // ヘッダー内からもテーマのトグルを使えるようにする
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const handleToggleTheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  const handleSettingsClick = () => {
    // 各種選択解除&settingsページセット
    useClientStore.getState().selectClient(null);
    useChatStore.getState().deselectChat();
    useCommonStore.getState().select('settings');
  };

  // notifications drawer
  const [notifOpened, { open: openNotif, close: closeNotif }] =
    useDisclosure(false);
  const { data: notifs } = useNotifications();
  const { data: alerts } = useAlerts();
  const notifUnread = (notifs ?? []).filter(
    (n) => !n.read && n.severity === 'critical',
  ).length;
  const alertUnread = (alerts ?? []).filter((a) => !a.resolved).length;
  const unreadCount = notifUnread + alertUnread;

  const selectMenu = useCommonStore((s) => s.select);

  return (
    <>
      <Group justify="space-between" p="md">
        {/* 左側：ハンバーガーメニュー + タイトル */}
        <Group gap="sm" wrap="nowrap">
          <Burger
            opened={opened}
            onClick={onToggle}
            aria-label="サイドバー開閉"
          />
          <Group gap={8} wrap="nowrap">
            <Title order={3}>Home-Base</Title>
            {currentClient ? (
              <Text size="xs" c="dimmed" ml="xs">
                {'選択顧問先： '}
                {currentClient.name}
              </Text>
            ) : currentClientName ? (
              <Text size="xs" c="dimmed" ml="xs">
                {'選択顧問先： '}
                {currentClientName}
              </Text>
            ) : null}
            {currentChatTitle && (
              <Text size="xs" c="dimmed" ml="xs">
                {'/　'}
                {currentChatTitle}
              </Text>
            )}
          </Group>
        </Group>

        {/* 右側 */}
        <Group gap="sm" wrap="nowrap">
          {/* 通知（ベル） */}
          <Group>
            <Button
              variant="subtle"
              onClick={openNotif}
              aria-label={`通知を開く (${unreadCount} 件)`}
            >
              {unreadCount > 0 ? (
                <Indicator
                  size={14}
                  label={String(unreadCount)}
                  color="red"
                  offset={6}
                  position="top-end"
                  labelProps={{
                    style: {
                      fontSize: 10,
                      lineHeight: '12px',
                      padding: '0 4px',
                    },
                  }}
                >
                  <IconBell size={24} />
                </Indicator>
              ) : (
                <IconBell size={24} />
              )}
            </Button>
            <NotificationDrawer opened={notifOpened} onClose={closeNotif} />
          </Group>
          {/* ユーザー情報＆メニュー */}
          <Menu shadow="md" width={220}>
            <Menu.Target>
              <Group gap="xs" style={{ cursor: 'pointer' }}>
                {/* 仮のユーザーアイコン／イニシャル */}
                <Avatar color="blue" radius="xl" size="sm">
                  {user?.name[0]}
                </Avatar>
                {/* 仮のユーザー名：後で実際のユーザー情報に差し替え可 */}
                <Text size="sm">{user?.name}</Text>
              </Group>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>ロール切替</Menu.Label>
              <Menu.Item>
                <Table fontSize="sm" verticalSpacing="xs">
                  <tbody>
                    {['担当職員', '担当税理士', '上長', '管理者'].map((r) => {
                      const currentRole = user?.role ?? '担当職員';
                      const isSelected = currentRole === r;
                      return (
                        <tr key={r}>
                          <td style={{ padding: 0 }} colSpan={2}>
                            <UnstyledButton
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '6px 8px',
                                textAlign: 'left',
                                borderRadius: 6,
                                background: isSelected
                                  ? 'rgba(0,125,255,0.08)'
                                  : undefined,
                                transition: 'background-color 150ms ease',
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                const u = useAuthStore.getState().user;
                                if (u) {
                                  useAuthStore
                                    .getState()
                                    .setUser({ ...u, role: r as any });
                                }
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected)
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.background = 'rgba(0,0,0,0.03)';
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected)
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.background = undefined;
                              }}
                            >
                              <Group position="apart">
                                <Text>{r}</Text>
                                {isSelected ? (
                                  <Badge color="blue">選択中</Badge>
                                ) : null}
                              </Group>
                            </UnstyledButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Menu.Item>

              {/* メニューからのモード切替 */}
              <Menu.Item
                onClick={handleToggleTheme}
                leftSection={
                  computedColorScheme === 'dark' ? (
                    <IconSun size={16} />
                  ) : (
                    <IconMoon size={16} />
                  )
                }
              >
                {computedColorScheme === 'dark'
                  ? 'ライトモードに切り替え'
                  : 'ダークモードに切り替え'}
              </Menu.Item>

              {/* 設定：モーダルを開く */}
              <Menu.Item
                onClick={handleSettingsClick}
                leftSection={<IconSettings size={16} />}
              >
                設定
              </Menu.Item>

              {/* ログアウト：確認モーダルを開く */}
              <Menu.Item
                color="red"
                onClick={openLogoutModal}
                leftSection={<IconLogout size={16} />}
              >
                ログアウト
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {/* ログアウト確認モーダル（DashboardModal を利用して一貫化） */}
      <DashboardModal
        opened={logoutOpened}
        onClose={closeLogoutModal}
        title="ログアウトしますか？"
      >
        <Group justify="flex-end">
          <Button variant="default" onClick={closeLogoutModal}>
            いいえ
          </Button>
          <Button
            color="red"
            onClick={() => {
              logout();
              closeLogoutModal();
            }}
          >
            はい
          </Button>
        </Group>
      </DashboardModal>

      {/* ヘッダーのグローバル顧問先選択モーダルは削除済み */}
    </>
  );
}
