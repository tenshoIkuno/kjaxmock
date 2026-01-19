---
title: 音声入力（Speech） 仕様書
---

# 音声入力（Speech / STT）仕様書

**画面ID**: `speech`（機能モジュール）

**目的（概要）**: ブラウザもしくはサーバ側で音声をテキスト化し、チャット・報告書作成に連携する。

**主なユーザー**: 監査担当、現場担当

---

## 1. 想定ユースケース
- 現場でマイク入力を行い、音声を自動でテキスト化して報告書作成に利用する。
- ブラウザの Web Speech API を第一優先とし、必要に応じサーバ STT にフォールバックする。

---

## 2. 構成 / フロー
- フロントで録音 → (A) Web Speech API で変換 → テキスト反映
- (B) ブラウザ未対応 / 高精度が必要な場合は音声データを `POST /api/stt` にアップロードしサーバで変換

---

## 3. API（想定）
- `POST /api/stt` (multipart/form-data) -> `{ text: string }`

---

## 4. 非機能 / エッジ
- 録音失敗時は再試行を促す。
- ネットワーク不在時はローカルに一時保存（IndexedDB）して復帰時送信。

---

**参照実装**:
- `frontend/src/features/speech/components/SpeechForm.tsx`
- `frontend/src/features/speech/hooks/useSpeech.ts`
# 音声入力（スピーチ）

このフォルダは音声入力／スピーチ機能に関するドキュメントを格納します。

関連ソース:

- `frontend/src/features/speech/components/SpeechForm.tsx`
- `frontend/src/features/speech/hooks/useSpeech.ts`

用途:
- 音声入力のフロー、外部サービス（Azure など）連携手順、イベント仕様を記載してください。
