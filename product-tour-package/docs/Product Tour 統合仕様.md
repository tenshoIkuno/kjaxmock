## Product Tour 統合仕様

概要

- このドキュメントは `frontend/public/product-tour-loader.js` を使って「追加のみ」で導入する手順とフォーマットを説明します。

配置と読み込み

- ファイルを配置: `frontend/public/product-tour-loader.js` をプロジェクトの `public` 配下に置きます。
- 自動読み込み: HTML に次を追加します。
  - `<script src="/product-tour-loader.js"></script>`

ツアー定義 (JSON)

- 位置: `/product-tour.json` に配置します（fetch で `/product-tour.json` を取得します）。
- 形式の例:

```
[
  {
    "name": "顧問先登録ツアー",
    "items": [
      { "ID": "client-name", "title": "顧問先名", "テキスト": "ここに入力してください", "selector": "#client-name" , "url": "/clients/new"},
      { "ID": "save-button", "title": "保存", "テキスト": "保存ボタンを押してください", "requiredSelector": "#save-button", "type": "button" }
    ]
  }
]
```

主要フィールド

- `name`: ツアー名
- 各 step の想定フィールド:
  - `ID`: 任意の識別子（あると `#ID` を selector として使用）
  - `title`: ポップオーバーのタイトル
  - `content` / `テキスト` / `description`: 説明文（優先順は `テキスト` -> `content` -> `description`）
  - `selector`: 要素を特定する CSS セレクタ
  - `requiredSelector`: クリック必須の対象を明示する場合に使用
  - `type` / `タイプ`: `'button'` の場合は対象クリックを待つモード
  - `url`: そのステップが別ページにある場合は遷移先の URL を指定

挙動と注意点

- `url` が指定されたステップ:
  - ローダーは現在の `location.pathname` と比較し、異なれば `sessionStorage` に進捗を保存してからカスタムイベント `product-tour-navigate` を発火します。
  - SPA 側がこのイベントを受け取らなければフォールバックで `location.href = url` によるフルページ遷移を行います。
- SPA 復帰:
  - 進捗は `sessionStorage` のキー `product-tour-state` に `{ name, index }` で保存されます。
  - ページ読み込み時、`popstate` / `hashchange` / `product-tour-resume` イベントを監視して復帰を試みます。
- ボタンタイプ（`type: 'button'` または `requiredSelector` がある場合）:
  - ポップオーバー側には「対象をクリックしてください」と表示し、対象要素がクリックされるのを待って次へ進みます。
- 要素待ちと再試行:
- 要素待ちと再試行:
- 要素が見つからない場合、ポーリングで再試行します（間隔は約500ms、最大試行回数はデフォルトで120回に設定されており、約60秒の待ち時間を許容します）。所定回数で見つからなければツアーを中断します。
- 遷移先のレンダリングがより長くかかる環境では、ページ側から `product-tour-ready` イベントを発火してローダーに「準備完了」を通知できます（例: `window.dispatchEvent(new Event('product-tour-ready'))`）。

公開 API / カスタムイベント

- `window.startProductTour(name)`
  - ツアー名で開始します。
- `startTourFromJson` イベント
  - `window.dispatchEvent(new CustomEvent('startTourFromJson',{ detail: { name, items } }))` で一時的なツアーを開始できます。`items` は上記と同様の配列。
- 自動開始
  - URL クエリに `?tour=NAME` を付けると、自動で該当ツアーを開始します（読み込み後 500ms 後に実行）。

追加のカスタムイベント

- `product-tour-ready` : ページ側がデータ取得やレンダリングを終えたタイミングで `window.dispatchEvent(new Event('product-tour-ready'))` を呼ぶと、ローダーは即座に要素の再探索・復帰を試みます。これにより長時間のネット遅延があっても確実にツアーを再開できます（アダプタを導入した場合は `product-tour-ready` を使う運用を推奨します）。

SPA 統合例 (React Router)

- 推奨: SPA 側で `product-tour-navigate` を受け取りクライアントサイド遷移を行う。
- 既存の実装例: `frontend/src/product-tour/ProductTourReactRouterAdapter.tsx`
  - イベント `product-tour-navigate` を受け取り `navigate()` で遷移し、遷移完了後に `product-tour-resume` を発火します。
  - 同一オリジンであればクライアント遷移、それ以外はフォールバックで `window.location.href`。

補足: URL を書かない運用での継続について

- ページ側に `ID` を付与するだけで、ツアーを継続したい場合は SPA 側に一箇所だけアダプタ（`ProductTourReactRouterAdapter`）を追加してください。
- このアダプタはルート変更を検知して短い遅延の後に `product-tour-resume` を発火します。これにより、ステップ定義に `url` を書かなくても、ユーザーやアプリ側の操作でページ遷移した後にツアーを自動で再開できます。
- 実装手順（要点）:
  1. `ProductTourReactRouterAdapter` を `App` のルート近くに一度だけ配置する。
  2. ページの要素には `id` 属性だけを付ける（例: `<div id="company-list">`）。
  3. ユーザー操作やアプリの通常のナビゲーションで遷移させると、アダプタが復帰イベントを出すためツアーが続行されます。

注意: アダプタは短い遅延を入れて復帰通知を出しますが、遷移先のデータ取得や重いレンダリングで要素の準備にさらに時間がかかる場合は、遷移先で `window.dispatchEvent(new Event('product-tour-resume'))` を遅延タイミングで発火するか、ローダー側のタイムアウト延長を検討してください。

スタイルとDOM

- オーバーレイはドキュメントに動的挿入されます（`#product-tour-overlay` と4パネルで穴をあける方式）。
- ポップオーバーは `#product-tour-popover` に挿入され、ツノ（tail）を調整してターゲットに合わせて表示します。

デバッグと運用上の注意

- 非同期レンダリングが強いページでは、対象要素の selector/ID を確実に設定してください。
- 実運用前にブラウザで E2E の手動確認を強く推奨します。

変更履歴

- このドキュメントは `frontend/public/product-tour-loader.js` の仕様に合わせて作成・更新されました。

もし追加で Vue Router 等のアダプタが必要なら、同様に `product-tour-navigate` を受けて client-side navigate を呼ぶコンポーネントを用意してください。
