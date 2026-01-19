// ヘッダーやナビゲーションバーを集約して全体のレイアウトを提供するコンポーネント
import { Header } from '@/common/layout/Header';
import { Navbar } from '@/common/layout/Navbar/Navbar';
import { PageSwitcher } from '@/common/layout/PageSwitcher';
import { AppShell } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';

export function Layout() {
  // サイドバー開閉状態、現在はローカルストレージに保存中
  const [opened, setOpened] = useLocalStorage<boolean>({
    key: 'sidebar-opened',
    defaultValue: true,
  });
  // ハンバーガーメニュークリックすると状態が反転（True⇔False）
  const toggle = () => setOpened((v) => !v);

  return (
    <AppShell
      // ヘッダー高さ
      header={{ height: 56 }}
      // サイドバーの幅
      navbar={{ width: opened ? 260 : 72, breakpoint: 0 }}
      // 空白
      padding={0}
    >
      {/* Header.tsxに開閉状態渡す箇所 */}
      <AppShell.Header>
        <Header opened={opened} onToggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar
        style={{
          height: 'calc(100vh - 56px)', // Header の高さ分を引いた高さ
        }}
      >
        <Navbar collapsed={!opened} />
      </AppShell.Navbar>

      {/* Main は高さを固定して（= フッターを画面下に張り付ける）、
          その内側でだけ padding を付ける */}
      <AppShell.Main
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 56px)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 16px 16px',
            boxSizing: 'border-box',
            minHeight: 0,
          }}
        >
          <PageSwitcher />
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
