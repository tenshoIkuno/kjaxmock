---
title: 顧問先 画面仕様書
---

# 顧問先（Clients） 仕様書

**画面ID**: `clients` / `client-detail`

**目的（概要）**: 顧問先の一覧表示、検索、詳細表示、編集を行う。報告書作成時の顧問先選択や自動紐付けに使用される。

**主なユーザー**: 事務担当、監査担当

---

## 1. 想定ユースケース
- 顧問先の検索・選択（オートコンプリート）
- 顧問先情報の参照・編集
- 報告書作成時の顧問先選択・候補提示

---

## 2. 画面構成
- 一覧画面: 検索バー、フィルタ、ページング付きのテーブル
- 詳細画面: 会社情報、連絡先、登録メタ情報、関連案件一覧

---

## 3. API（想定）
- `GET /api/clients/search?q={query}` → 検索候補
- `GET /api/clients/:id` → 詳細
- `POST /api/clients` / `PUT /api/clients/:id` → 作成/更新

---

## 4. データモデル（抜粋）
```ts
interface Client {
  id: string;
  name: string;
  abbr?: string;
  address?: string;
  contacts?: { name: string; phone?: string }[];
}
```

---

## 5. バリデーション / 権限
- 登録・編集は権限が必要。入力チェックはサーバ/クライアント双方で行う。

---

**参照実装**:
- `frontend/src/features/client/` (hooks, store, components)
# 顧問先

このフォルダは「顧問先」画面に関するドキュメントを格納します。

関連ソース:

- `frontend/src/features/client/hooks/useClient.ts`
- `frontend/src/features/client/store/clientStore.ts`
- `frontend/src/features/client/ClientPage.tsx` (存在する場合)

用途:
- 画面仕様、API 仕様、データモデルなどをここに置いてください。
