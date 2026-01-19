// サイドバーが閉じてるときのコンポーネント
import type { NavItem } from '@/common/layout/Navbar/Navbar';
import { ClientList } from '@/features/chat/components/LeftSidebar/ClientList';
import { ClientListSearch } from '@/features/chat/components/LeftSidebar/Search';
// import { MessageList } from '@/features/chat/components/MessageList';
// import { MessageListSerch } from '@/features/chat/components/MessageListSerch';
import {
  ActionIcon,
  Divider,
  Popover,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAddressBook,
  IconClipboardList,
  IconMessageCircle,
  IconSettings,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useCommonStore } from '@/common/store/commonStore';

type Props = {
  mainItems: NavItem[];
};

export function NavbarClose({ mainItems }: Props) {
  // 新規チャットアイコンのヒント表示
  const [mainHintOpened, { open: openMainHint, close: closeMainHint }] =
    useDisclosure(false);

  // チャットルームアイコンのヒント表示
  const [roomsHintOpened, { open: openRoomsHint, close: closeRoomsHint }] =
    useDisclosure(false);

  // チャットルームのポップアップ開閉状態（クリックで開いて、外側クリックで閉じる）
  const [roomsOpened, { close: closeRooms, toggle: toggleRooms }] =
    useDisclosure(false);
  // チャットルームの検索バーの入力値
  const [searchText, setSearchText] = useState('');

  // 画面のどこをクリックしたか監視してクリック箇所によってppoverを閉じる
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;

      // チャットルームのポップオーバー内をクリックしても閉じない
      if (target.closest('[data-rooms-popover-root]')) return;

      // 名前変更・削除メニュー操作では閉じない（ MessageList の Popover ）
      if (target.closest('[data-inner-popover]')) return;

      // 削除確認モーダル操作中もチャットルームポップオーバーは閉じない
      if (target.closest('[data-modal-root]')) return;

      // それ以外はPopoverを閉じる
      closeRooms();
    }
    // 画面全体のクリックを監視開始、画面のどこをクリックしてもhandleClick が呼ばれる
    document.addEventListener('click', handleClick);
    // コンポーネントが消えるときに監視停止（クリーンアップ）
    return () => document.removeEventListener('click', handleClick);
  }, [closeRooms]);

  const selectMenu = useCommonStore((s) => s.select);

  return (
    <Stack p="md" gap="xs" h="100%" align="center">
      {/* 新規チャットアイコン：クリックで新規チャット画面 */}
      <Tooltip
        label={
          <Text size="sm" fw={500}>
            新規チャット
          </Text>
        }
        opened={mainHintOpened && !roomsOpened}
        withArrow
        position="right"
        offset={8}
        withinPortal
        zIndex={600}
        px="sm"
        py={6}
      >
        <ActionIcon
          size="lg"
          variant="light"
          aria-label="新規チャット"
          onMouseEnter={openMainHint}
          onMouseLeave={closeMainHint}
          onClick={() => {
            closeMainHint();
            mainItems[0]?.onClick?.();
          }}
        >
          <IconMessageCircle size={16} />
        </ActionIcon>
      </Tooltip>

      {/* 巡回監査報告 */}
      <Tooltip
        label={
          <Text size="sm" fw={500}>
            巡回監査報告
          </Text>
        }
        withArrow
        position="right"
        offset={8}
        px="sm"
        py={6}
      >
        <ActionIcon
          size="lg"
          variant="light"
          aria-label="巡回監査報告"
          onClick={() => {
            // 変更前:
            // window.location.href = '/巡回監査報告書';

            // open patrolAudit main page
            selectMenu('patrolAudit');
          }}
        >
            <IconClipboardList size={16} />
        </ActionIcon>
      </Tooltip>

      {/* 顧問先一覧 のポップアップ */}
      <Popover
        opened={roomsOpened}
        withArrow
        withinPortal
        shadow="md"
        position="right-start"
        offset={8}
        trapFocus={false}
        closeOnClickOutside={false}
        zIndex={500}
      >
        <Popover.Target>
          <Tooltip
            label={
              <Text size="sm" fw={500}>
                顧問先一覧
              </Text>
            }
            opened={!roomsOpened && roomsHintOpened}
            withArrow
            position="right"
            offset={8}
            withinPortal
            zIndex={600}
            px="sm"
            py={6}
          >
            <ActionIcon
              size="lg"
              variant="light"
              aria-label="顧問先"
              onMouseEnter={() => {
                if (!roomsOpened) openRoomsHint();
              }}
              onMouseLeave={closeRoomsHint}
              onClick={(e) => {
                e.stopPropagation();
                closeRoomsHint();
                toggleRooms();
              }}
            >
              <IconAddressBook size={16} />
            </ActionIcon>
          </Tooltip>
        </Popover.Target>

        {/* 設定 */}
        <Tooltip
          label={
            <Text size="sm" fw={500}>
              設定
            </Text>
          }
          withArrow
          position="right"
          offset={8}
          px="sm"
          py={6}
        >
          <ActionIcon
            size="lg"
            variant="light"
            aria-label="設定"
            onClick={() => {
              selectMenu('settings');
            }}
          >
            <IconSettings size={16} />
          </ActionIcon>
        </Tooltip>

        <Popover.Dropdown
          p="xs"
          miw={rem(260)}
          maw={rem(320)}
          data-rooms-popover-root
        >
          <Text size="xs" fw={600} c="dimmed" px="xs" py={4}>
            顧問先
          </Text>
          <Divider my={6} />
          <Stack gap="xs">
            {/* チャットルーム検索バー、入力内容は chatsSearch に保持 */}
            <ClientListSearch
              searchText={searchText}
              setSearchText={setSearchText}
            />
            {/* <MessageListSerch value={chatsSearch} onChange={setChatsSearch} /> */}

            <ScrollArea.Autosize mah={rem(360)} type="auto" offsetScrollbars>
              {/* チャットルーム一覧、chatsSearch を渡してタイトルで絞り込み */}
              <ClientList searchText={searchText} onChatClick={closeRooms} />
              {/* <MessageList chatsSearch={chatsSearch} onChatClick={closeRooms} /> */}
            </ScrollArea.Autosize>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Stack>
  );
}
