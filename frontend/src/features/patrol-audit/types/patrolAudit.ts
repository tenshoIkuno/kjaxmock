export type inputPatrolAudit = {
  // FirstPanel（基本情報）
  periodStart: string | null; // 開始日（YYYY-MM-DD）
  periodEnd: string | null; // 期限日（YYYY-MM-DD）
  visitDate: string | null; // 訪問日（YYYY-MM-DD）
  visitMethod: string; // 訪問方法
  nextVisitDate: string | null; // 次回予定日（YYYY-MM-DD）

  // SecondPanel（監査範囲）
  selected: string[]; // 選択された監査範囲（value の配列）
  otherSelected: boolean; // 「その他」ボタンが ON か
  otherText: string; // その他入力欄の文字列

  // FifthPanel（受領確認）
  confirmMethod: string; // 受領確認方法
  confirmDate: string | null; // 確認日（YYYY-MM-DD）
  confirmer: string; // 確認者
};
