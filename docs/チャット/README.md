---
title: チャット 画面仕様書
---

# チャット（Chat）仕様書

**画面ID**: `chat`

**目的（概要）**: ユーザーと AI / 他ユーザー間のメッセージングを行う。SSE / WebSocket を想定したリアルタイム配信に対応する。

**主なユーザー**: 担当者、監査担当、管理者

---

## 1. 想定ユースケース
- メッセージの送受信（テキスト / 画像 / 添付）
- 過去メッセージの閲覧と検索
- リアルタイム更新（SSE / WebSocket）

---

## 2. 画面構成
- ヘッダー: チャット相手名、ステータス
- メッセージ領域: ScrollArea、送信者別のスタイル
- 入力領域: Textarea、添付、送信ボタン

---

## 3. リアルタイム仕様（案）
- メッセージ受信: SSE または WebSocket を利用し `messages` を append
- 送信: `POST /api/messages` → 成功時にサーバがブロードキャスト

---

## 4. API（想定）
- `GET /api/chats/:chatId/messages` → 履歴
- `POST /api/chats/:chatId/messages` → 送信
- `SSE /api/chats/:chatId/stream` → リアルタイム受信

---

## 5. 非機能 / エッジ
- 大量メッセージ時は遡りロード（infinite scroll）を実装
- 添付は事前に `POST /api/uploads` して URL を取得

---

**参照実装**:
- `frontend/src/pages/ChatPage.tsx`
- `frontend/src/features/chat/`
# チャット

このフォルダは「チャット」画面に関するドキュメントを格納します。

関連ソース:

- `frontend/src/pages/ChatPage.tsx`
- `frontend/src/features/chat/` (hooks, components, store)

用途:
- 画面仕様、SSE / メッセージ仕様、UI 挙動のドキュメントを配置してください。
