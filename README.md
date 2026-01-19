# 会計事務所向け AX ソリューション

プロジェクト名: `kj-ax`。

由来は kaikeijimusyo ax (会計事務所AX)。

## セットアップ

### 前提

- VSCode
- Docker インストール済み

### Docker

#### 起動

```bash
  docker compose up
```

#### 停止

`Ctrl + C` もしくは

```bash
  docker compose stop
```

#### コンテナ削除

ボリュームも削除するなら `-v` オプションを付ける

```bash
  docker compose down
```

### ローカルの場合

VSCode の機能的な支援を受けるため、ローカルでも依存関係をインストールすることを推奨

```bash
  cd frontend
  npm install
```

```bash
  cd backend
  uv sync
```

```bash
  cd mcp_server
  uv sync
```

## コーディング規約

### フロントエンド

フォーマッターには Prettier を使用。
[TypeScript DeepDive](https://typescript-jp.gitbook.io/deep-dive/styleguide)を参考にしている。
特記事項は以下。

- セミコロンあり
- シングルクォーテーション

### バックエンド

フォーマッターには Ruff を使用。
特記事項は以下。

- 特になし。Ruff のデフォルト設定。

## Git 運用ルール

本プロジェクトでは、**安定版（main）** と **開発版（develop）** を明確に分離し、
**機能単位（feature）** で開発を進めるブランチ運用ルールを採用。

### ブランチ構成

```bash
  main
  └── develop
            ├── feature/xxx
            ├── feature/yyy
            └── feature/zzz
```

| ブランチ名      | 用途                                   | 運用ルール                                                                         |
| --------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| **main**        | 運用中（リリース版）を管理するブランチ | ・本番リリース時のみ更新<br>・直接コミット禁止<br>・`develop` からのマージのみ許可 |
| **develop**     | 開発統合用ブランチ                     | ・開発時、作業する基点となるブランチ<br>・`feature/` ブランチをここにマージする    |
| **feature/xxx** | 機能開発用ブランチ                     | ・`develop` から派生<br>・機能単位で作成<br>・開発完了後、`develop` にマージし削除 |

### ブランチ運用フロー

#### ブランチ作成

develop ブランチがローカルに存在しない初回のみ

```bash
git checkout develop # mainを派生させ、ローカルにdevelopブランチを作成
```

通常

```bash
git pull origin develop # ローカルのdevelopブランチを最新に
git checkout -b feature/xxx # 最新のdevelopブランチから派生させ自分の作業するブランチを作成
```

#### コミットとプッシュ

```bash
git add . # ステージング
git commit -m "Add: 新機能 xxx を実装" # コミット
git push origin feature/xxx # プッシュ
```

#### 開発完了後のマージ

```bash
git checkout develop # developブランチに移動
git pull origin develop # developブランチを最新に
git merge --no-ff feature/xxx # マージ（コンフリクトが起こればマージエディタで解決）
git push origin develop # 新機能と統合したローカルdevelopブランチをリモートへプッシュ
```

#### 不要ブランチの削除

マージ後はローカル・リモート両方の feature ブランチを削除

```bash
git branch -d feature/xxx
git push origin --delete feature/xxx # リモートに関してはGitLabのUIで、マージ許可の際にブランチを削除するかを選択できる
```

#### リリースフロー（この部分は基本的にサービスがリリースされてからのものになるので開発時はやらない）

develop ブランチの動作確認完了後、
main にマージして運用環境へ反映。

```bash
git checkout develop # developブランチに移動
git pull origin develop # developブランチを最新に
git checkout main # mainブランチに移動
git pull origin main # mainを最新に
git merge --no-ff develop # 最新developを最新mainにマージ
git push origin main # リモートのmainへプッシュ
```
