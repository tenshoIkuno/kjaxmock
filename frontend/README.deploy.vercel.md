# Vercel へのデプロイ手順（Frontend）

このプロジェクトの `frontend` は Vite ベースの SPA です。ローカルモック（`public/mock-interceptor.js`）を使ってフロント完結で動かす場合、Vercel に配置する際は環境変数 `VITE_API_BASE_URL` を空文字にして相対パスで API を呼び出す必要があります。既に `vercel.json` にて `VITE_API_BASE_URL` を空に設定しています。

手順（CLI）:

1. Vercel CLI をインストール（未インストール時）

```powershell
npm i -g vercel
```

2. `frontend` ディレクトリに移動してログイン

```powershell
cd frontend
vercel login
```

3. 本番デプロイ

```powershell
vercel --prod
```

備考:
- `vercel.json` をプロジェクトに含めてあるため、ビルドコマンドは `npm run build`（`package.json` の設定）になり、出力ディレクトリは `dist` です。
- `VITE_API_BASE_URL` が空の場合、クライアントは相対パス（例 `/chats`）で API を呼びます。`public/mock-interceptor.js` は `public` 配下にあるため、静的ホスティング上でもコピーされ、ブラウザ側で fetch をインターセプトしフロント完結のモックが動作します。
- もし Vercel プロジェクト設定で環境変数を上書きしたい場合は、Vercel のダッシュボードで `VITE_API_BASE_URL` を空文字に設定してください。

トラブルシューティング:
- ビルドで Node のバージョンが要求される場合、Vercel のプロジェクト設定で `NODE_VERSION` を `20.x` などに設定できます。
- Mock が読み込まれているかはブラウザのコンソールで `Frontend mock-interceptor loaded (no DB writes).` を確認してください。