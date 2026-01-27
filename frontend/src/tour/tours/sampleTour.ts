import type { Tour } from '../tourTypes';

const sampleTour: Tour = {
  id: 'sample-client-tour',
  title: '顧問先管理の簡易ツアー',
  steps: [
    {
      id: 'list',
      title: '顧問先一覧',
      description: 'こちらで顧問先を検索・選択できます。',
      targetSelector: '.client-list',
      placement: 'right',
    },
    {
      id: 'create',
      title: '顧問先登録',
      description: '「顧問先登録」ボタンから新しい顧問先を作成します。',
      targetSelector: 'button:contains("顧問先登録")',
      placement: 'bottom',
    },
    {
      id: 'details',
      title: '編集画面',
      description: '編集画面では詳細情報を入力します。',
      targetSelector: null,
      placement: 'bottom',
    },
  ],
};

export default sampleTour;
