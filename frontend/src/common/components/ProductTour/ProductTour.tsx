import React from 'react';
import { Modal, Text, Title, Button, Group } from '@mantine/core';

type TourContent = {
  title: string;
  steps: Array<{ heading: string; body: string }>;
};

const CONTENT_MAP: Record<string, TourContent> = {
  ダッシュボード: {
    title: 'ダッシュボード プロダクトツアー',
    steps: [
      {
        heading: '概要',
        body: 'ダッシュボードで重要な指標と最近の案件を確認できます。',
      },
      {
        heading: 'カード操作',
        body: 'カードをクリックすると詳細へ移動します。',
      },
      { heading: 'フィルタ', body: 'フィルタで表示内容を絞り込みできます。' },
    ],
  },
  設定: {
    title: '設定 プロダクトツアー',
    steps: [
      {
        heading: 'ユーザー設定',
        body: 'ユーザー情報の編集と権限管理を行います。',
      },
      {
        heading: 'システム設定',
        body: 'システム全体の設定を確認してください。',
      },
    ],
  },
  顧問先: {
    title: '顧問先管理 プロダクトツアー',
    steps: [
      { heading: '一覧', body: '顧問先の検索と一覧表示を行います。' },
      {
        heading: '登録・編集',
        body: '顧問先登録ボタンから新しい顧問先を追加できます。',
      },
    ],
  },
  巡回監査: {
    title: '巡回監査 プロダクトツアー',
    steps: [
      { heading: '一覧', body: '巡回監査報告を一覧で確認します。' },
      { heading: '作成', body: '作成ボタンから新しい報告を作成します。' },
    ],
  },
  チャット: {
    title: 'チャット プロダクトツアー',
    steps: [
      {
        heading: 'チャットの開始',
        body: 'チャットルームを選択してメッセージを送信します。',
      },
      {
        heading: '履歴',
        body: '左側のリストから過去メッセージにアクセスできます。',
      },
    ],
  },
  default: {
    title: 'プロダクトツアー',
    steps: [
      { heading: 'はじめに', body: '主要な画面の使い方を順に案内します。' },
    ],
  },
};

export default function ProductTourModal() {
  const [opened, setOpened] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [key, setKey] = React.useState('default');

  React.useEffect(() => {
    const handler = (e: any) => {
      const p = e?.detail?.page || 'default';
      setKey(p in CONTENT_MAP ? p : 'default');
      setStepIndex(0);
      setOpened(true);
    };
    window.addEventListener('openProductTour', handler as EventListener);
    return () =>
      window.removeEventListener('openProductTour', handler as EventListener);
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
      <div style={{ minHeight: 220 }}>
        <Title order={5} style={{ marginBottom: 8 }}>
          {content.steps[stepIndex].heading}
        </Title>
        <Text style={{ whiteSpace: 'pre-wrap' }}>
          {content.steps[stepIndex].body}
        </Text>
      </div>
      <Group position="right" mt="lg">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            style={{ marginRight: 8 }}
          >
            前へ
          </Button>
          {stepIndex < content.steps.length - 1 ? (
            <Button size="sm" onClick={() => setStepIndex((i) => i + 1)}>
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
