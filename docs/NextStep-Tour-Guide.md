# NextStep ツアー設定・カスタマイズガイド

このドキュメントは、本プロジェクトで導入した `nextstepjs` + `motion` ベースのプロダクトツアーの設定・カスタマイズ方法をまとめた簡易ガイドです。

**配置ファイル（重要）**

- ツアー定義: `frontend/public/product-tour.json`
- アダプター: `frontend/src/tour/NextStepAdapter.tsx` (JSON を `nextstepjs` の `NextStepReact` にマッピング)
- ヘッダーの起動ボタン: `frontend/src/common/layout/Header.tsx`

---

## product-tour.json のフォーマット

配列で複数ツアーを定義できます（例は既に `public/product-tour.json` にあります）。基本構造:

```json
[
  {
    "name": "ツアー名",
    "items": [
      {
        "ID": "element-id",
        "テキスト": "表示する日本語テキスト",
        "タイプ": "button" | "normal",
        "requiredSelector": "#submit-btn" // 任意
      }
    ]
  }
]
```

- `ID`: 対応する DOM 要素に付与されている `id`。アダプターは内部で `selector: `#${ID}` を使って要素を探します。
- `テキスト`: 吹き出しに表示する本文。
- `タイプ`: `button` の場合は「クリックして進む」想定。`normal` は通常進行（次へボタンなど）。
- `requiredSelector`: `タイプ=button` でも特定の子要素（モーダル内の登録ボタン等）を待ちたい場合に指定します。

注意: JSON 内で同一 `ID` が複数存在すると警告・ブロックされます。ユニークにしてください。

---

## NextStepAdapter の役割と重要設定

- `NextStepAdapter.tsx` が JSON を `nextstepjs` の `steps` 形式に変換します。
- 変換例（省略）では各ステップに `selector`, `title`, `content`, `showControls`, `requiredSelector` をセットしています。
- クリック待ち（click-gating）対応: `requiredSelector` があればアダプターがクリックを監視し、該当セレクタでクリックが検出されたら次のステップへ進めます。
- オーバーレイを貫通させる必要があるため、プロジェクトでは `NextStepReact` に `clickThroughOverlay={true}` を設定しています。

---

## ツアー起動方法

- ヘッダー UI の NextStep メニューから選択する方法（既に実装済み）。
- コンソール等からプログラム的に起動する方法:

```js
// デフォルト（最初のツアー）
window.dispatchEvent(new CustomEvent("startTourFromJson"));

// ツアー名を指定して開始
window.dispatchEvent(
  new CustomEvent("startTourFromJson", {
    detail: { name: "チーム作成ツアー" },
  }),
);

// 外部 URL から JSON を読み込んで開始
window.dispatchEvent(
  new CustomEvent("startTourFromJson", {
    detail: { url: "/product-tour.json" },
  }),
);
```

`NextStepAdapter` はこのイベントをリッスンしてツアーを開始します。

---

## カード（吹き出し）や見た目をカスタマイズする

`NextStepReact` は `cardComponent` プロパティでカスタムカードを受け取ります。

例: カスタムカードを作って渡す

```tsx
import CustomCard from "./tour/CustomCard";

<NextStepReact steps={tours} cardComponent={CustomCard} />;
```

- カード内のレイアウトやボタン、色、影、矢印などを自由に実装できます。
- アニメーションは `motion` ライブラリ（既に依存に含まれています）を利用して `cardComponent` 内で追加できます。

---

## ルーティング連携（他ページへ遷移してから次ステップ）

- `nextstepjs` はフレームワーク別の navigation adapter を持っています。Vite 環境では `NextStepAdapter` が `useWindowAdapter`（history API を使う）を使うので、`nextRoute` を使う場合は adapter を適宜差し替えしてください。
- 例: ステップに `nextRoute` を指定すると、アダプターが `router.push(route)` を呼び、目的の要素が DOM に現れたら次ステップへ進みます。

---

## デバッグとよくある問題

- 進まない（クリックしても次へ進まない）場合のチェックリスト:
  - 対象要素に正しい `id` が付与されているか確認（例: `team-create-button`, `team-submit-button`）
  - 実際にクリックイベントが `requiredSelector` にヒットしているかを DevTools Console で確認。アダプターに `console.debug('[NextStepAdapter] matched', ...)` のログを追加しているので、該当ログが出るか確認してください。
  - オーバーレイがクリックを遮っている場合は `clickThroughOverlay={true}` にする（本プロジェクトでは既に設定済み）。
  - Shadow DOM やポータル内の要素をターゲットにする場合は、`requiredSelector` を具体的に（たとえばモーダルの登録ボタン `#team-submit-button`）指定し、アダプターは `closest` と `composedPath()` の両方で検出しています。

- コンソールにエラーが出る場合はエラーメッセージと該当ステップの `selector` / `ID` を教えてください。

---

## カスタム要件の実装例

- 「ボタンタイプ」はモーダルを開いて内部の `#team-submit-button` をクリックするまで待つフロー:
  1. ツアーで `ID: "team-create-button"` を指し、`タイプ: "button"` とする。
  2. 次のステップで `ID: "team-create-area"`（モーダル）を指して `タイプ: "button"` とし、`requiredSelector: "#team-submit-button"` を指定する。
  3. アダプターが `#team-submit-button` のクリックを監視して検出時に次ステップへ進めます。

---

## 変更点をリポジトリに保存した場所

- 本ガイドを `docs/NextStep-Tour-Guide.md` に保存しました。

---

必要であれば下記の追加を行えます:

- サンプル `cardComponent`（Mantine スタイル）の実装例を追加
- `NextStepAdapter` のログをより詳細にして、ヒットした DOM のスクリーンショット的データを出す機能

どれを追加しますか？
