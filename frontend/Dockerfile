# # 1. ビルド用ステージ
# FROM node:22-slim AS builder
# WORKDIR /app
# # 依存関係のインストール
# COPY package.json package-lock.json ./
# RUN npm ci
# # プロジェクトのコピー
# COPY . .
# # ビルド
# RUN npm run build

# # 2. 軽量なWebサーバーで公開
# FROM nginx:alpine
# # 実行環境に必要なものをコピー
# COPY --from=builder /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/templates/default.conf.template
# # ポート公開
# EXPOSE 8080
# # 起動
# CMD ["nginx", "-g", "daemon off;"]

# 1. ビルド用ステージ
FROM node:22-slim AS builder
WORKDIR /app
# 依存関係のインストール
COPY package.json package-lock.json ./
RUN npm ci
# プロジェクトのコピー
COPY . .
# ビルド
RUN npm run build

FROM nginx:1.22.1
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]