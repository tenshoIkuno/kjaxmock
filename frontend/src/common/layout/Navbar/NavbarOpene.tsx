// サイドバーが開いてるときのコンポーネント
import type { NavItem } from '@/common/layout/Navbar/Navbar';
import { ClientList } from '@/features/chat/components/LeftSidebar/ClientList';
import { ClientListSearch } from '@/features/chat/components/LeftSidebar/Search';
// import { MessageList } from '@/features/chat/components/MessageList';
import {
  ActionIcon,
  Collapse,
  Divider,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useState } from 'react';

type Props = {
  mainItems: NavItem[];
  mainOpen: boolean;
  toggleMain: () => void;
  roomsOpen: boolean;
  toggleRooms: () => void;
};

export function NavbarOpene({
  mainItems,
  mainOpen,
  toggleMain,
  roomsOpen,
  toggleRooms,
}: Props) {
  // フィルター状態
  const [searchText, setSearchText] = useState('');

  const ICON_SIZE = 16;

  return (
    <Stack p="md" gap="sm" h="100%" style={{ overflow: 'hidden' }}>
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          機能
        </Text>
        <ActionIcon
          variant="subtle"
          onClick={toggleMain}
          aria-label={mainOpen ? '閉じる: 機能' : '開く: 機能'}
        >
          <IconChevronDown size={ICON_SIZE} style={{ transform: `rotate(${mainOpen ? 0 : -90}deg)` }} />
        </ActionIcon>
      </Group>

      <Collapse in={mainOpen}>
        <Stack gap="xs">
          {mainItems.map(({ label, icon: Icon, href, active, onClick }) =>
            href ? (
              <NavLink
                key={label}
                label={label}
                leftSection={<Icon size={ICON_SIZE} />}
                component="a"
                href={href}
                active={!!active}
                aria-label={`nav-${label}`}
              />
            ) : (
              <NavLink
                key={label}
                label={label}
                leftSection={<Icon size={ICON_SIZE} />}
                component="button"
                onClick={onClick}
                active={!!active}
                aria-label={`nav-${label}`}
              />
            ),
          )}
        </Stack>
      </Collapse>

      <Divider my="xs" />

      <Group justify="space-between">
        {/* <Group gap={6}> */}
        <Text size="sm" fw={500}>
          顧問先
        </Text>
        {/* </Group> */}
        <ActionIcon
          variant="subtle"
          onClick={toggleRooms}
          aria-label={
            roomsOpen ? 'チャットルームをたたむ' : 'チャットルームを開く'
          }
        >
          <IconChevronDown
            style={{ transform: `rotate(${roomsOpen ? 0 : -90}deg)` }}
          />
        </ActionIcon>
      </Group>
      {/* 顧問先検索バー、入力内容は searchText に保持 */}
      <ClientListSearch searchText={searchText} setSearchText={setSearchText} />
      <Collapse in={roomsOpen} style={{ flex: 1, minHeight: 0 }}>
        <ScrollArea type="auto" style={{ height: '100%' }} offsetScrollbars>
          {/* 顧問先一覧、searchText を渡してタイトルで絞り込み */}
          <ClientList searchText={searchText} />
        </ScrollArea>
      </Collapse>
    </Stack>
  );
}
