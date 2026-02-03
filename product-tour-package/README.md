Product Tour - 配布パッケージ

このフォルダには `product-tour` を既存プロジェクトへ追加するために必要な最小ファイルが入っています。

含まれるファイル

- product-tour-loader.js : ローダー本体（public に設置）
- product-tour.template.jsonc : サンプル / テンプレート
- ProductTourReactRouterAdapter.tsx : React Router 用アダプタ（任意）
- docs/Product Tour 統合仕様.md : 統合仕様ドキュメント

導入手順（要約）

1. `product-tour-loader.js` をアプリの静的配信ディレクトリ（例: `frontend/public`）に置く。
2. `/product-tour.json` を作成してツアー定義を配置する（テンプレート参照）。
3. 必要であれば `ProductTourReactRouterAdapter.tsx` を React Router のルート付近に追加して SPA 連携を有効化する。
4. ブラウザのコンソールから `window.startProductTour('ツアー名')` で手動テスト可能。

ライセンス: プロジェクトに合わせて適用してください。
