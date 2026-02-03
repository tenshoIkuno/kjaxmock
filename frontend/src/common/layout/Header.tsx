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

  // Product tour modal state
  const [tourModalOpened, setTourModalOpened] = useState(false);
  const [tourLoading, setTourLoading] = useState(false);
  const [tourItems, setTourItems] = useState<any[] | null>(null);
  const [tourList, setTourList] = useState<Array<{
    name: string;
    items: any[];
  }> | null>(null);
  const [selectedTourIndex, setSelectedTourIndex] = useState<number>(0);
  const [tourErrors, setTourErrors] = useState<string[] | null>(null);
  const [nextStepTours, setNextStepTours] = useState<Array<{
    name: string;
  }> | null>(null);

  const findDuplicates = (items: any[]) => {
    const map = new Map<string, number>();
    for (const it of items) map.set(it.ID, (map.get(it.ID) ?? 0) + 1);
    return Array.from(map.entries())
      .filter(([, c]) => c > 1)
      .map(([id]) => id);
  };

  const handleOpenTourModal = async () => {
    setTourLoading(true);
    setTourErrors(null);
    setTourItems(null);
    setTourList(null);
    try {
      const res = await fetch('/product-tour.json', { cache: 'no-store' });
      if (!res.ok)
        throw new Error(`failed to fetch /product-tour.json (${res.status})`);
      const data = await res.json();
      if (!data) {
        setTourErrors([
          `ツアーデータが見つかりません（/product-tour.json が空または配列ではありません）`,
        ]);
        setTourModalOpened(true);
        return;
      }
      // support multiple formats:
      // 1) legacy: data is an array of steps -> wrap into one tour
      // 2) new: data is an array of { name, items } OR { name, steps }
      // 3) new object: { tours: [...] }

      let tours: Array<{ name: string; items: any[] }> = [];

      if (Array.isArray(data)) {
        // determine if elements look like steps (have ID) or tour entries (have name)
        const first = data[0];
        if (first && typeof first === 'object' && 'ID' in first) {
          tours = [{ name: 'デフォルトツアー', items: data }];
        } else if (
          first &&
          typeof first === 'object' &&
          ('name' in first || 'items' in first || 'steps' in first)
        ) {
          // array of tours
          tours = data.map((t: any, idx: number) => ({
            name: t.name ?? `ツアー ${idx + 1}`,
            items: t.items ?? t.steps ?? [],
          }));
        } else {
          // unknown array shape
          tours = [
            {
              name: 'デフォルトツアー',
              items: Array.isArray(data) ? data : [],
            },
          ];
        }
      } else if (typeof data === 'object' && data !== null) {
        if (Array.isArray((data as any).tours)) {
          tours = (data as any).tours.map((t: any, idx: number) => ({
            name: t.name ?? `ツアー ${idx + 1}`,
            items: t.items ?? t.steps ?? [],
          }));
        } else if (Array.isArray((data as any).items)) {
          tours = [
            {
              name: (data as any).name ?? 'デフォルトツアー',
              items: (data as any).items,
            },
          ];
        }
      }

      if (tours.length === 0) {
        setTourErrors([
          `ツアーデータの形式が不明です。/product-tour.json を確認してください。`,
        ]);
        setTourModalOpened(true);
        return;
      }

      // basic duplicate check per tour (only checks IDs inside each tour)
      const dupErrors: string[] = [];
      tours.forEach((t) => {
        const dups = findDuplicates(t.items ?? []);
        if (dups.length > 0) dupErrors.push(`${t.name}: ${dups.join(', ')}`);
      });
      if (dupErrors.length > 0) {
        setTourErrors([`JSON 内に重複する ID が見つかりました`, ...dupErrors]);
        setTourModalOpened(true);
        return;
      }

      // set tours and default selection
      setTourList(tours);
      setSelectedTourIndex(0);
      // also set tourItems preview for first tour
      setTourItems(tours[0].items ?? []);
      setTourModalOpened(true);
    } catch (err: any) {
      setTourErrors([
        `ツアーデータの読み込みに失敗しました: ${String(err.message ?? err)}`,
      ]);
      setTourModalOpened(true);
    } finally {
      setTourLoading(false);
    }
  };

  const handleStartTourFromModal = () => {
    const items = tourList
      ? (tourList[selectedTourIndex]?.items ?? [])
      : (tourItems ?? []);
    if (!items || items.length === 0) return;
    // dispatch the same event TourRunner listens to
    window.dispatchEvent(
      new CustomEvent('startTourFromJson', { detail: { items } }),
    );
    setTourModalOpened(false);
  };

  // load nextstepjs tours for the NextStep menu when requested
  const handleOpenNextStepMenu = async () => {
    if (nextStepTours) return; // already loaded
    try {
      const res = await fetch('/product-tour.json', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;
      let tours: Array<{ name: string }> = [];
      if (Array.isArray(data)) {
        const first = data[0];
        if (
          first &&
          typeof first === 'object' &&
          ('name' in first || 'items' in first || 'steps' in first)
        ) {
          tours = data.map((t: any) => ({ name: t.name ?? 'Unnamed Tour' }));
        } else if (first && typeof first === 'object' && 'ID' in first) {
          tours = [{ name: 'デフォルトツアー' }];
        }
      } else if (typeof data === 'object' && data !== null) {
        if (Array.isArray((data as any).tours)) {
          tours = (data as any).tours.map((t: any) => ({
            name: t.name ?? 'Unnamed Tour',
          }));
        } else if (Array.isArray((data as any).items)) {
          tours = [{ name: (data as any).name ?? 'デフォルトツアー' }];
        }
      }
      setNextStepTours(tours);
    } catch (e) {
      // ignore
    }
  };

  const handleStartNextStep = (name: string) => {
    window.dispatchEvent(
      new CustomEvent('startTourFromJson', { detail: { name } }),
    );
  };

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
          {/* ツアー起動ボタン */}
          <Button
            variant="subtle"
            onClick={handleOpenTourModal}
            id="header-open-tour"
          >
            ツアー
          </Button>
          {/* NextStep (nextstepjs) 用ツアー開始メニュー */}
          <Menu shadow="md" width={200} onOpen={handleOpenNextStepMenu}>
            <Menu.Target>
              <Button variant="subtle" id="header-open-nextstep-tour">
                NextStep ツアー
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {nextStepTours === null ? (
                <Menu.Label>ロード中...</Menu.Label>
              ) : nextStepTours.length === 0 ? (
                <Menu.Label>ツアーが見つかりません</Menu.Label>
              ) : (
                nextStepTours.map((t) => (
                  <Menu.Item
                    key={t.name}
                    onClick={() => handleStartNextStep(t.name)}
                  >
                    {t.name}
                  </Menu.Item>
                ))
              )}
            </Menu.Dropdown>
          </Menu>
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

      {/* Product Tour 確認モーダル */}
      <DashboardModal
        opened={tourModalOpened}
        onClose={() => setTourModalOpened(false)}
        title={
          tourErrors ? 'ツアーの確認（警告あり）' : 'プロダクトツアーの確認'
        }
      >
        {tourLoading ? (
          <Text>読み込み中…</Text>
        ) : (
          <div>
            {tourErrors && (
              <div>
                {tourErrors.map((e, i) => (
                  <Text key={i} c="red" style={{ whiteSpace: 'pre-wrap' }}>
                    {e}
                  </Text>
                ))}
                <Text size="sm" c="dimmed" mt="sm">
                  ※
                  上記は警告です。必要な画面に移動すると自動的に要素が検出されます。
                </Text>
              </div>
            )}

            {tourItems ? (
              <div>
                <Text size="sm" mb="sm">
                  以下のステップでツアーを開始します。
                </Text>
                {tourList && tourList.length > 1 && (
                  <div style={{ marginBottom: 12 }}>
                    <Text size="sm" mb={6}>
                      実行するツアーを選択してください
                    </Text>
                    <Select
                      data={tourList.map((t, i) => ({
                        value: String(i),
                        label: t.name,
                      }))}
                      value={String(selectedTourIndex)}
                      onChange={(v) => {
                        const idx = Number(v ?? 0);
                        setSelectedTourIndex(idx);
                        setTourItems(tourList[idx]?.items ?? []);
                      }}
                    />
                  </div>
                )}
                <Table fontSize="sm" verticalSpacing="xs">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>ID</th>
                      <th>テキスト</th>
                      <th>タイプ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tourItems.map((it: any, idx: number) => (
                      <tr key={it.ID + idx}>
                        <td>{idx + 1}</td>
                        <td>{it.ID}</td>
                        <td style={{ whiteSpace: 'pre-wrap' }}>
                          {it.テキスト}
                        </td>
                        <td>{it.タイプ ?? it.type ?? 'normal'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Group position="right" mt="md">
                  <Button
                    variant="default"
                    onClick={() => setTourModalOpened(false)}
                  >
                    キャンセル
                  </Button>
                  <Button onClick={handleStartTourFromModal}>開始</Button>
                </Group>
              </div>
            ) : (
              <div>
                <Text>ツアーデータがありません。</Text>
                <Group position="right" mt="md">
                  <Button onClick={() => setTourModalOpened(false)}>
                    閉じる
                  </Button>
                </Group>
              </div>
            )}
          </div>
        )}
      </DashboardModal>

      {/* ヘッダーのグローバル顧問先選択モーダルは削除済み */}
    </>
  );
}
