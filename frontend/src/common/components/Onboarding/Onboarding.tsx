import React from 'react';
import { Modal, Text, Title, Button, Group } from '@mantine/core';

type OnboardingContent = {
  title: string;
  pages: Array<{ heading: string; body: string }>;
};

const CONTENT_MAP: Record<string, OnboardingContent> = {
  ダッシュボード: {
    title: 'ダッシュボードの使い方',
    pages: [
      {
        heading: '概要',
        body: 'ダッシュボードでは担当中の案件や重要なKPIを確認できます。',
      },
      {
        heading: '操作',
        body: 'カードをクリックして詳細を確認し、フィルタで絞り込みます。',
      },
      {
        heading: 'ヒント',
        body: 'ステータスや期間を変更して表示内容を調整してください。',
      },
    ],
  },
  設定: {
    title: '設定画面の使い方',
    pages: [
      { heading: '概要', body: 'ユーザーやシステム設定を管理します。' },
      {
        heading: '操作',
        body: 'タブを切り替えて各種設定を行い、保存してください。',
      },
      { heading: 'ヒント', body: '権限に応じて表示される項目が異なります。' },
    ],
  },
  顧問先: {
    title: '顧問先管理の使い方',
    pages: [
      { heading: '概要', body: '顧問先の登録・編集・削除を行う画面です。' },
      {
        heading: '登録',
        body: '「顧問先登録」ボタンから新しい顧問先を作成します。',
      },
      {
        heading: '編集',
        body: '一覧の編集を選択すると詳細編集画面が開きます。',
      },
    ],
  },
  巡回監査: {
    title: '巡回監査報告の使い方',
    pages: [
      { heading: '概要', body: '巡回監査の一覧・作成を行います。' },
      {
        heading: '作成',
        body: '巡回監査報告作成ボタンから新規作成ができます。',
      },
      { heading: '管理', body: '各報告の編集・削除は一覧の操作から行います。' },
    ],
  },
  チャット: {
    title: 'チャットの使い方',
    pages: [
      { heading: '概要', body: '顧問先ごとのチャットでやりとりできます。' },
      { heading: '送信', body: '下部の入力欄からメッセージを送信します。' },
      {
        heading: '履歴',
        body: '左側の顧問先リストで過去のチャットにアクセス可能です。',
      },
    ],
  },
  default: {
    title: 'はじめに',
    pages: [
      { heading: '概要', body: 'このアプリの使い方をガイドします。' },
      { heading: '操作', body: '画面ごとの説明を確認してください。' },
      {
        heading: '次へ',
        body: '必要に応じて各画面で詳細ガイドを参照してください。',
      },
    ],
  },
};

export default function OnboardingModal() {
  const [opened, setOpened] = React.useState(false);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [key, setKey] = React.useState('default');

  React.useEffect(() => {
    const handler = (e: any) => {
      const p = e?.detail?.page || 'default';
      setKey(p in CONTENT_MAP ? p : 'default');
      setPageIndex(0);
      setOpened(true);
    };
    window.addEventListener('openOnboarding', handler as EventListener);
    return () =>
      window.removeEventListener('openOnboarding', handler as EventListener);
  }, []);

  const content = CONTENT_MAP[key] ?? CONTENT_MAP.default;

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      centered
      size="lg"
      title={<Title order={4}>{content.title}</Title>}
    >
      <div style={{ minHeight: 240 }}>
        <Title order={5} style={{ marginBottom: 8 }}>
          {content.pages[pageIndex].heading}
        </Title>
        <Text style={{ whiteSpace: 'pre-wrap' }}>
          {content.pages[pageIndex].body}
        </Text>
      </div>
      <Group position="right" mt="lg">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
            disabled={pageIndex === 0}
            style={{ marginRight: 8 }}
          >
            前へ
          </Button>
          {pageIndex < content.pages.length - 1 ? (
            <Button size="sm" onClick={() => setPageIndex((i) => i + 1)}>
              次へ
            </Button>
          ) : (
            <Button size="sm" onClick={() => setOpened(false)}>
              終了
            </Button>
          )}
        </div>
      </Group>
    </Modal>
  );
}
