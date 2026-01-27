# プロダクトツアー（JSON起動） 取扱説明書

作成日: 2026-01-27

このドキュメントでは、JSON 配列を一つのファイルに置くだけでプロダクトツアーを起動できる仕組みについて、フォーマット、設置方法、起動方法、そして新しい `タイプ`（button/normal）仕様の取り扱いを書きます。

## 概要

- ツアーは JSON 配列（ファイル）にステップを定義し、該当要素に `id` 属性を付与するだけで開始できます。アプリは既定のファイル `/product-tour.json`（静的配信領域、例: `frontend/public/product-tour.json` に置く）を自動的に読み取るか、明示的に URL を指定して読み込みます。
- JSON 配列は次のような形式です（`タイプ` フィールドを追加）：

```json
[
  {
    "ID": "step-1-button",
    "テキスト": "ここをクリックして開始します",
    "タイプ": "button"
  },
  {
    "ID": "step-2-div",
    "テキスト": "次にこの情報を確認してください",
    "タイプ": "normal"
  }
]
```

- `タイプ` は `button` または `normal` のいずれかを指定します。互換性のため過去の `nomal` も `normal` として受け付けます。
  - `button`: ターゲット要素内（またはその直下）にあるボタン/リンクがユーザーによって押されたときに次のステップへ進みます。ツアーの吹き出し内の「次へ」ボタンは無効化されます。
  - `normal`: 吹き出し右下の「次へ」ボタンを押したときに次へ進みます（既存の挙動）。

## 設置場所（推奨）

- 開発中は `frontend/public/product-tour.json` に配置してください。ビルド後は `dist/product-tour.json` として静的に配信され、実行環境で `/product-tour.json` で取得できます。
- または、任意の URL にホストしておき、起動時にその URL を指定して読み込めます（例: `window.dispatchEvent(new CustomEvent('startTourFromJson', { detail: { url: '/my-folder/tour.json' } }))`）。

## ツアー開始方法

- コンソールやアプリ内からカスタムイベントで開始できます。

1. JSON 配列を直接渡す場合:

```js
const items = [
  /* 上記フォーマットの配列 */
];
window.dispatchEvent(
  new CustomEvent("startTourFromJson", { detail: { items } }),
);
```

2. URL から読み込む場合:

```js
window.dispatchEvent(
  new CustomEvent("startTourFromJson", {
    detail: { url: "/product-tour.json" },
  }),
);
```

3. 何も指定せずにイベントを発行した場合、アプリは既定の `/product-tour.json` を自動で試しに取得します。

## 重複 ID の扱い（新仕様）

- ツアー開始時に JSON 配列内で同一 `ID` が複数存在する場合、ツアーは開始しません。アプリは重複している `ID` の一覧を表示するモーダルを出し、修正を促します（「閉じる」ボタンでモーダルを閉じ、ファイルを修正して再試行してください）。

## 実装ポイント（現行ファイル）

- `frontend/src/tour/TourRunner.tsx` — イベント受信、外部ファイル取得、重複チェック、ステップ組立、ポーリング、click待ちロジック
- `frontend/src/tour/TourProvider.tsx` — ツアーの状態管理（start/next/prev/complete）
- `frontend/src/tour/TourOverlay.tsx` / `TourStepPopover.tsx` — ハイライトと吹き出し UI。`TourStepPopover` は `タイプ=button` のとき吹き出し内の次へを無効化します。

## ID の付与方法（推奨パターン）

- React コンポーネントで要素に ID を付ける例（JSX）:

```tsx
// 明示的に付与
<button id="step-1-button">開始</button>;

// コンポーネント内の要素に付与
function MyPanel() {
  return (
    <div id="step-2-div">
      <h3>重要な情報</h3>
      <a id="step-2-link" href="#">
        詳細を見る
      </a>
    </div>
  );
}
```

- ID 命名の注意:
  - 英数字とハイフン、アンダースコアを使う（例: `client-edit-save-btn`）。
  - ページ内で一意にする。重複はモーダルで検出されるため必ず修正する。

## `タイプ=button` の検出ヒューリスティクス

- `button` タイプでは、ターゲット要素の内部（または直下）でクリックイベントが発生した場合に進みます。実装は以下の要素をクリックとして扱います:
  - `<a>`、`<button>`、`<input type="button">` / `submit`、`role="button"`、または `onclick` ハンドラが付与された要素。

## カスタムクリック検出（`requiredSelector`）

- 各ステップに `requiredSelector` を追加すると、デフォルトのヒューリスティクスではなくそのセレクタにマッチする要素のクリックで次へ進むようにできます。例えば要素内の特定リンクだけをトリガーにしたい場合に便利です。

```json
{
  "ID": "sample-custom",
  "テキスト": "このリンクをクリックしてください",
  "タイプ": "button",
  "requiredSelector": "#sample-custom a"
}
```

### ヒューリスティクス（デフォルト）

- `requiredSelector` 未設定かつ `タイプ=button` の場合、ターゲット要素内で発生したクリックを以下要素をクリックとみなして検出します:
  - `<a>`、`<button>`、`<input type="button">` / `submit`、`role="button"`、または `onclick` ハンドラが付与された要素。

## 既知の制約と注意点

- 非表示要素（display:none）や iframe 内の要素はポーリングで見つからない場合があります。
- `button` タイプのステップでは、ユーザーが意図したクリックを行う必要があり、吹き出しの「次へ」は無効化されています。
- ファイルの JSON フォーマットや ID の命名に誤りがあるとツアーは正常に動作しません。

## 運用上の提案

- 管理画面から JSON を編集・公開する UI を作り、URL を配信する運用にすると便利です。
- ユーザー単位での既読管理（localStorage / API）を追加すると、初回のみ表示等の制御が可能です。

---

以上。必要なら `frontend/public/product-tour.json` のサンプルファイルと、コンソールから起動するための小さなショートカットスクリプトを追加で作成します。
