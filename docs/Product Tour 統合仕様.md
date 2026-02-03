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
**Product Tour — 追加だけで導入できる実装仕様**

- ファイル配置
  - `frontend/public/product-tour-loader.js` : 追加するだけで動くセルフコンテインドなツール。既存コードの変更は不要。
  - `frontend/public/product-tour.json` : ツアー定義（既に存在）。

**要点**

- 既存のアプリ本体のソースは一切変更せず、`product-tour-loader.js` を静的ホスティング配下に置くだけでプロダクトツアーを使えます。
- アプリに組み込むには単純に HTML に次のようにスクリプトを追加します（ただし質問の要件では "既存コードを変えずに" なので、運用側でサーバの静的ファイル配信に file を追加する運用で対応可能です）：

```html
<script src="/product-tour-loader.js"></script>
```

- またはブラウザの DevTools Console から以下で起動できます（CI や一時導入用）：

```js
// ツアー名で開始
window.startProductTour("顧問先登録ツアー");

// JSON からイベントで開始
window.dispatchEvent(
  new CustomEvent("startTourFromJson", {
    detail: { name: "顧問先登録ツアー" },
  }),
);
```

**product-tour.json の想定フォーマット**

- トップレベルは配列か { tours: [...] }
- 各ツアーは次のプロパティ
  - `name` / `title` : ツアー名
  - `steps` / `items` : ステップ配列
- ステップ（各要素）は次のプロパティを持てます（IDはページ要素側に付与されている想定）
  - `ID` : ページ内の要素 ID（あれば優先）
  - `ID` : ページ内の要素 ID（あれば優先）
  - `selector` : CSS セレクタ（任意、ID があれば自動で `#ID` を使う）
  - `url` : ステップが表示される想定の URL（省略可）。別ページにあるステップを自動で遷移して実行する際に使用します。
  - `requiredSelector` : クリック必須など、進行条件としてのセレクタ（クリックで次へ進む）
  - `type` / `タイプ` : `button` または `normal`。`button` は対象クリックで進行。
  - `content` / `description` / `テキスト` : ポップオーバー本文

サンプル（簡素）

```json
[
  {
    "name": "顧問先登録ツアー",
    "steps": [
      { "ID": "nav-clients", "content": "ここが顧問先メニューです" },
      {
        "ID": "client-register-button",
        "type": "button",
        "content": "新規登録ボタンをクリックしてください"
      }
    ]
  }
]
```

**動作仕様（要約）**

- ローダーは `/product-tour.json` をフェッチしてツアーを読み込みます。
- `ID` が指定されていれば `#ID` を内部 selector として使用するため、ページ側は要素に ID を割り振るだけで良いです。
- `type: "button"` または `requiredSelector` を設定したステップは「対象をクリックして進む」モードです（内部的に document キャプチャを用いて対象クリックを検知します）。
- `normal` ステップはポップオーバーに "次へ" / "完了" ボタンを表示します。
- オーバーレイは四分割パネルでハイライト領域（対象要素）を穴あきにし、穴の中は操作可能（pointer-events が届くように設計）です。
- 外部から開始するAPI
  - `window.startProductTour(name)` : name で指定したツアーを開始（true/false を返す）
  - カスタムイベント `startTourFromJson` を dispatch して JSON 内のツアーを開始可能
  - ツアー終了時に `product-tour-ended` イベントが発火
  - `url` を使った跨ぎ遷移と復帰
    - 各ステップに `url` を指定すると、ローダーはそのステップを開始する前に現在の URL と比較します。
    - URL が一致しなければ、現在のツアーとステップ番号を `sessionStorage` に保存して `location.href = step.url` で遷移します。
    - 遷移後（フルリロードまたは同一オリジンのナビゲーション）にローダーが再読み込みされると、保存された状態を読み出して該当ツアーを再開します。
    - また、簡易的な SPA 支援として `popstate` / `hashchange` を監視して復帰を試みます（フレームワークの router と完全統合する場合は追加の実装が必要）。
    - ステップのターゲット要素が非同期レンダリングされる場合、ローダーは一定時間ポーリングして要素を待ちます（デフォルトで約 10 秒程度でタイムアウトしてツアーを中断します）。

**導入手順（運用）**

1. `frontend/public/product-tour-loader.js` を静的配信パスに追加する（例: Vite の public に置く）。
2. `frontend/public/product-tour.json` を編集してツアー定義を準備する（ID はページ側要素に割付済みであること）。
3. 運用方法
   - 自動でロードして欲しい場合はアプリの HTML（index.html 等）に `<script src="/product-tour-loader.js"></script>` を追加する（この時はアプリ HTML を変更するため要承認）。
   - - 既存コードを全く変えたくない場合は、配信サーバでこの JS を配信するだけで、コンソールから `window.startProductTour('ツアー名')` を叩くか、URL に `?tour=ツアー名` を付けて自動開始する方法で運用できます。
   - SPA（React Router 等）とよりシームレスに統合する場合は、以下の `ProductTourReactRouterAdapter` コンポーネントをアプリに追加してルート遷移を検知およびナビゲーションを傍受してください（アプリの `App.tsx` や `main.tsx` に一行追加するだけです）。

導入例（React + React Router）

```tsx
// src/product-tour/ProductTourReactRouterAdapter.tsx
import ProductTourReactRouterAdapter from "./product-tour/ProductTourReactRouterAdapter";

function App() {
  return (
    <BrowserRouter>
      <ProductTourReactRouterAdapter />
      {/* ...your routes... */}
    </BrowserRouter>
  );
}
```

説明:

- `ProductTourReactRouterAdapter` は loader が発火する `product-tour-navigate` イベントを受け取り、React Router の `navigate()` を使ってクライアント側遷移を行います。これによりフルリロードを防ぎ、ツアー継続が自然になります。
- ルートが変わるたびにコンポーネントが `product-tour-resume` イベントを発火させ、loader が `sessionStorage` の状態を読み直してツアーを再開します。

**注意点と制約**

- 非常に簡素化した実装です。複雑な SPA のルーティングでページ遷移を跨いでツアーを続行するには、追加の仕組み（ルート遷移検知や遷移後の要素復帰ロジック）が必要です。
- ライブラリ（NextStep 等）を使わずにゼロ依存で動かすことを優先しています。アニメーションや複雑なポジショニングが必要なら既存のライブラリを導入することを推奨します。
- 要素が非表示/遅延レンダリングされる場合は、ツアーが見つからずリトライタイミングが発生します。必要に応じて `product-tour-loader.js` を拡張してリトライや待機ロジックを強化してください。

**拡張案（今後のアップグレード）**

- SPA ナビゲーション跨ぎ対応（URL 変化を監視して継続する仕組み）
- ステップに対する自動セレクタ計算（テキストや近傍要素から推測）
- i18n 対応（多言語コンテンツ）
- アナリティクス用のフック（ステップ到達・完了イベントを送る）

---

保存場所:

- [frontend/public/product-tour-loader.js](frontend/public/product-tour-loader.js)
- [frontend/public/product-tour.json](frontend/public/product-tour.json) (既存)
- [docs/Product-Tour-Integration.md](docs/Product-Tour-Integration.md)

**運用ガイド：エラーになる条件 / ツアーの終了条件 / ツアーの開始条件**

以下は運用中に発生し得る主要な条件を分かりやすく整理した一覧です。

- **エラー（動作に影響あり）になり得る条件**
  - 指定した `ID`/`selector` がページに存在しないままタイムアウトした場合（デフォルトで約60秒待機し、それでも未検出なら中断）。
  - `product-tour.json` の JSON が不正（構文エラー）で読み込めない場合。
  - ブラウザの `sessionStorage` が利用不可（ストレージ制限やプライベートモード等）で進捗を保存/復帰できない場合、跨ぎ復帰ができない。
  - 同一オリジン検査により `url` の解析に失敗した場合（不正な URL）。

- **ツアーが自動的に終了（中断）する条件**
  - 現在のステップの対象要素が最大再試行回数（デフォルト120回）で見つからなかった場合。
  - 明示的に `endTour()` が呼ばれた場合（`product-tour-ended` イベントが発火）。
  - ツアー定義において現在のインデックスを超える操作が発生した場合（例: 最後のステップで `nextStep()` を呼んだ）。
  - スクリプトが例外でクラッシュした場合（コンソールエラーを要確認）。

- **ツアーが開始される条件（起動トリガ）**
  - `window.startProductTour(name)` を呼び出したとき（指定名で開始）。
  - `startTourFromJson` カスタムイベントで一時的なツアーを渡したとき（`detail.items` を含む）。
  - ページ URL に `?tour=NAME` クエリが付いている場合（読み込み後約500msで自動開始）。
  - `sessionStorage` に保存された進捗があり、`product-tour-resume` / `product-tour-ready` / `popstate` / `hashchange` などで復帰がトリガされたとき。

運用上の推奨対応

- 事前確認: 各ステップに割り当てた `ID` がページ側で確実に存在することを確認してください。非同期描画がある場合は `product-tour-ready` を活用してください。
- 障害対応: ツアーが中断した場合はブラウザコンソールのエラーと `sessionStorage.product-tour-state` の中身を確認すると原因の特定が早まります。
