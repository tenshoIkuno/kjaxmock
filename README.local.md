# ローカル起動手順（Docker無し）

前提:
- Node.js (v18+) — フロントエンド用
- Python (3.12+) — バックエンド / mcp_server 用

1) リポジトリ直下でまとめて起動（別ウィンドウで起動）:

```powershell
cd C:\Users\tensho\Downloads\mock\kj-ax
.\start-all-local.ps1
```

2) 個別に起動する場合

- フロントエンド:
```powershell
cd C:\Users\tensho\Downloads\mock\kj-ax
.\start-frontend.ps1
```

- バックエンド:
```powershell
cd C:\Users\tensho\Downloads\mock\kj-ax
.\start-backend.ps1
```
スクリプトは仮想環境を `.venv_backend` に作成し、`pyproject.toml` を元に backend を editable install します。起動は `uvicorn app.main:app --reload` です。

- mcp_server:
```powershell
cd C:\Users\tensho\Downloads\mock\kj-ax
.\start-mcp_server.ps1
```

注意点:
- `start-backend.ps1` は `uvicorn` を自動でインストールしますが、環境によっては追加で PostgreSQL 等の接続が必要です。`.env` を `backend/.env` に配置してDB接続情報を設定してください。

問題が出たら、エラー出力を教えてください。こちらで対応を続けます。
