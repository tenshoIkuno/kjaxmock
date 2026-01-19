export type AlertType =
  | '法令・期限管理'
  | '申告期限自動アラート'
  | '業務フロー逸脱・業務品質'
  | '顧問先リスク'
  | 'コンプライアンス'
  | '運営リスク'
  | string;

export type Alert = {
  id: string;
  reportId: string;
  type: AlertType;
  description: string;
  resolved: boolean;
  createdAt: string; // ISO
};
