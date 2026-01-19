// 親コンポーネント、NavbarCloseとNavbarOpeneのどちらを使うか決める司令塔
import { NavbarClose } from '@/common/layout/Navbar/NavbarClose';
import { NavbarOpene } from '@/common/layout/Navbar/NavbarOpene';
import { useCommonStore } from '@/common/store/commonStore';
import { useChatStore } from '@/features/chat/store/chatStore';
import { useClientStore } from '@/features/client/store/clientStore';
import { useDisclosure } from '@mantine/hooks';
import type { Icon as TablerIcon } from '@tabler/icons-react';
import {
  IconAddressBook,
  IconClipboardList,
  IconMessageCircle,
  IconSettings,
} from '@tabler/icons-react';
import { IconGauge } from '@tabler/icons-react';

// ナビゲーションの1項目を表す型
export type NavItem = {
  label: string; // 表示ラベル
  icon: TablerIcon; // 表示アイコン（Tabler Icons のコンポーネント）
  href?: string; // リンク先URL（外部 or ページ遷移用）
  onClick?: () => void; // クリック時のハンドラ（hrefがない場合など）
  active?: boolean; // アクティブ状態のフラグ（スタイル切り替え用）
  // optional nested children (rendered under parent in expanded navbar)
  children?: NavItem[];
};
// Navbar コンポーネントに渡される props、サイドバーが閉じてるかどうか
type Props = { collapsed: boolean };

export function Navbar({ collapsed }: Props) {
  // useCommonStoreからメニュー選択関数を取得
  const selectMenu = useCommonStore((s) => s.select);
  const selected = useCommonStore((s) => s.selected);
  // useClientStoreから顧問先セット関数を取得
  const selectclient = useClientStore((s) => s.selectClient);
  // チャットストアから「選択中チャットを解除する関数」を取得
  const deselectChat = useChatStore((s) => s.deselectChat);
  // 「新規チャット」に戻る処理をラップした関数
  const goChatHome = () => {
    selectclient(null);
    deselectChat();
    selectMenu('chat');
  };
  // サイドバー上部「機能」セクションの項目一覧
  const mainItems: NavItem[] = [
    {
      label: 'ダッシュボード',
      icon: IconGauge,
      onClick: () => {
        selectclient(null);
        deselectChat();
        selectMenu('dashboard');
      },
      active: selected === 'dashboard',
    },
    {
      label: '新規チャット', // Tooltip やラベルに使う名前
      icon: IconMessageCircle, // アイコン（タブラーアイコン）
      onClick: () => goChatHome(), // クリックしたらチャットホームに戻る
      active: selected === 'chat',
    },
    {
      label: '顧問先',
      icon: IconAddressBook,
      onClick: () => {
        selectclient(null);
        deselectChat();
        selectMenu('clients');
      },
      active: selected === 'clients',
    },
    {
      label: '巡回監査報告書作成',
      icon: IconClipboardList,
      onClick: () => {
        selectMenu('patrolAudit');
      },
      active: selected === 'patrolAudit',
    },
    {
      label: '監査履歴',
      icon: IconClipboardList,
      onClick: () => {
        // Open the header tenant-select modal and navigate to patrolAudit page.
        // The header modal forces the user to choose a client before showing history.
        useCommonStore.getState().setPatrolAuditModalMode('history');
        selectMenu('patrolAudit');
      },
      active: false,
    },
    {
      label: '業務処理簿作成',
      icon: IconClipboardList,
      onClick: () => {
        // Navigate to patrolAudit page and request it open in 'create' mode.
        useCommonStore.getState().setPatrolAuditRequested('create', null);
        selectMenu('patrolAudit');
      },
      active: false,
    },
    {
      label: '設定',
      icon: IconSettings,
      onClick: () => {
        selectclient(null);
        deselectChat();
        selectMenu('settings');
      },
      active: selected === 'settings',
    },
  ];
  // 「機能」セクション（NavbarOpene 側）の開閉状態
  const [mainOpen, { toggle: toggleMain }] = useDisclosure(true);
  // 「チャットルーム」セクション（NavbarOpene 側）の開閉状態
  const [roomsOpen, { toggle: toggleRooms }] = useDisclosure(true);

  // collapsed = true のときはNavbarClose を表示
  if (collapsed) {
    return <NavbarClose mainItems={mainItems} />;
  }
  // collapsed = false のときはNavbarOpene を表示
  return (
    <NavbarOpene
      mainItems={mainItems}
      mainOpen={mainOpen}
      toggleMain={toggleMain}
      roomsOpen={roomsOpen}
      toggleRooms={toggleRooms}
    />
  );
}
