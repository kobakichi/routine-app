# Routine App (Next.js + Prisma + MySQL)

1日のルーティーン（習慣）をシンプルに管理するモダンなWebアプリの骨組みです。Next.js(App Router) + Tailwind CSS + Prisma(MySQL)構成で、おしゃれなグラデーションUIとダークモードを備えています。

## 前提

- Node.js 18 以上推奨
- パッケージマネージャは `npm` を想定（`pnpm`/`yarn` でも可）

## クイックスタート（Docker で MySQL を起動）

1. 依存関係をインストール

```bash
cd routine-app
npm i
```

2. 環境変数を設定

```bash
cp .env.example .env
# 既定は Docker の MySQL (localhost:3307)
# 例: mysql://root:password@localhost:3307/routine_app
```

3. DB を起動（Docker）

```bash
npm run db:up
# （任意）ログ監視: npm run db:logs
```

4. Prisma クライアント生成 & 初回マイグレーション

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

5. 開発サーバー起動

```bash
npm run dev
```

6. ブラウザで確認

- トップ: http://localhost:3000
- カレンダー: http://localhost:3000/calendar

## 既存の MySQL を使う場合（Docker 不使用）

1. `.env` の `DATABASE_URL` を実環境に合わせて修正（例: `mysql://USER:PASS@localhost:3306/DB`）
2. DB を起動（自身の MySQL サーバー）
3. Prisma 生成・マイグレーションを実行

```bash
cd routine-app
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

## トラブルシュート

- Docker に接続できない: Docker Desktop を起動し、`npm run db:up` を再実行
- ポート競合: `.env` と `docker-compose.yml` のポート（既定: 3307）を合わせる
- マイグレーション失敗: DB 起動を確認（`npm run db:logs`）し、再度 `npm run prisma:migrate`

## 機能（概要）

- ルーティーン一覧の取得/追加/削除
- 今日の完了トグル（オン/オフ）＋ 連続日数（streak）表示
- 履歴の可視化
- カード展開時: 直近4週間のチェーン（週頭=日曜）
- 専用ページ: 月カレンダー（/calendar）で日次の達成状況を表示
- テーマ: ライト/ダーク/システムに対応（各ページ右上トグル）

## 技術スタック

- フロント: Next.js 14(App Router), React 18, Tailwind CSS
- スタイリング: ガラスモーフィズム風カード、控えめなカラーアクセント
- データ: Prisma ORM + MySQL
- API: Next.js Route Handlers (`app/api/*`)

## データモデル(要約)

- `User` … 将来的な認証用（現在は未使用）
- `Routine` … 習慣(タイトル/色/ユーザー)
- `RoutineCheck` … その日付の完了記録（一意: routineId + date）

## 今後の拡張案

- 認証(NextAuth等)の導入 → 複数ユーザー本番運用
- 週/月ビューや連続達成日数の可視化
- 通知/リマインダー(ブラウザ通知, メール等)
- 並び替え、タグ、メモ機能
- PWA対応（ホーム画面追加/オフライン）

---
