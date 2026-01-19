---
title: ダッシュボード 仕様書
---

# ダッシュボード 仕様書

**画面ID**: `dashboard`

**目的（概要）**: 管理者・担当者が重要指標や未対応タスク、最近の報告書などを俯瞰できるトップ画面。

---

## 1. 想定ユースケース
- 指標の確認（未処理件数、重要通知）
- クイック操作（報告書作成への遷移、顧問先確認）

---

## 2. 画面構成
- ウィジェット群: KPI カード、最近の報告書リスト、アクションボタン
- レスポンシブ: カードはブレークポイントに応じて並び替え

---

## 3. データ / API
- `GET /api/dashboard/summary` → KPI
- `GET /api/patrol_audits?recent=true` → 最近の報告書

---

## 4. 実装参照
- `frontend/src/common/dashboard/` に共通コンポーネントあり
# ダッシュボード

このフォルダはダッシュボード領域に関するドキュメントを格納します。

関連ソース:

- `frontend/src/common/dashboard/` (DashboardLayout, List など)
- `frontend/src/common/layout/PageSwitcher.tsx`

用途:
- ダッシュボードのワイヤー、共通コンポーネント仕様、アクセシビリティ等を配置してください。
