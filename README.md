# 朗読エクササイズ

認知症予防のための古典文学朗読アプリケーション

## 概要

朗読エクササイズは、古典文学の朗読練習を通じて認知機能の維持・向上を支援するPWA（Progressive Web App）です。スマートフォンやタブレットから手軽に朗読を録音・管理できます。

### 主な機能

- 📚 **古典文学テキスト**: 竹取物語、平家物語、源氏物語など11作品を収録
- 🎙️ **音声録音**: ブラウザで直接録音が可能
- 💾 **録音管理**: 録音の保存、再生、削除
- 📊 **進捗管理**: 録音済み作品数の可視化
- ✏️ **カスタムテキスト**: オリジナルテキストの追加・編集
- 📱 **PWA対応**: スマートフォンにインストール可能
- 🔒 **セキュア**: HTTPS対応、マイク権限管理

## 技術スタック

### フロントエンド
- **Next.js 15.5.4** (App Router)
- **React 19.1.0**
- **TypeScript 5**
- **Tailwind CSS 3.4**

### バックエンド
- **Vercel Postgres** (Neon) - データベース
- **Vercel Blob Storage** - 音声ファイル保存
- **Next.js API Routes**

### PWA
- **next-pwa 5.6.0**
- Service Worker対応

## セットアップ

### 前提条件

- Node.js 20以上
- npm または yarn
- Vercelアカウント（デプロイ用）

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd recitation-app

# 依存関係のインストール
npm install
```

### 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定：

```env
# Vercel Postgres
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

#### 環境変数の取得方法

1. **Vercel Postgres**
   - Vercelダッシュボード → Storage → Create Database → Postgres
   - 接続文字列をコピー

2. **Vercel Blob Storage**
   - Vercelダッシュボード → Storage → Create Store → Blob
   - Read-Write Tokenをコピー

### データベースのセットアップ

```bash
# データベーステーブルの作成
npm run seed
```

`prisma/seed.ts` が以下を実行します：
- `texts` テーブル作成
- `recordings` テーブル作成
- 古典文学11作品のデータ投入

## 開発

### 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリにアクセスできます。

### ビルド

```bash
npm run build
npm start
```

## デプロイ

### Vercelへのデプロイ

```bash
# Vercel CLIのインストール（初回のみ）
npm i -g vercel

# ログイン
vercel login

# デプロイ
vercel --prod
```

または、GitHubにプッシュすることで自動デプロイ：

```bash
git push origin main
```

### デプロイ後の確認事項

- [ ] 環境変数が正しく設定されているか
- [ ] データベース接続が機能しているか
- [ ] 録音機能が動作するか（HTTPS必須）
- [ ] PWAとしてインストール可能か

## プロジェクト構造

```
recitation-app/
├── app/                      # Next.js App Router
│   ├── api/                  # APIルート
│   │   ├── recordings/       # 録音API
│   │   │   ├── [id]/         # 録音詳細・削除
│   │   │   └── by-text/      # テキスト別録音取得
│   │   └── texts/            # テキストAPI
│   ├── texts/                # テキスト関連ページ
│   │   ├── [id]/             # テキスト詳細
│   │   ├── new/              # 新規作成
│   │   └── [id]/edit/        # 編集
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # ホーム（一覧）
│   └── globals.css           # グローバルCSS
├── src/
│   ├── components/           # Reactコンポーネント
│   │   ├── ui/               # 汎用UIコンポーネント
│   │   ├── AudioPlayer.tsx   # 音声プレーヤー
│   │   ├── RecordingControls.tsx  # 録音コントロール
│   │   └── TextDetailClient.tsx   # テキスト詳細
│   ├── hooks/                # カスタムフック
│   │   ├── useRecorder.ts    # 録音機能
│   │   ├── useRecording.ts   # 録音データ管理
│   │   └── useTexts.ts       # テキスト一覧管理
│   ├── lib/                  # ユーティリティ
│   │   ├── api-helpers.ts    # API共通処理
│   │   ├── blob.ts           # Blob Storage操作
│   │   └── utils.ts          # 汎用関数
│   └── types/                # TypeScript型定義
├── public/                   # 静的ファイル
│   ├── manifest.json         # PWAマニフェスト
│   └── icons/                # アプリアイコン
├── prisma/
│   └── seed.ts               # データベース初期化
└── next.config.mjs           # Next.js設定
```

## トラブルシューティング

### 録音機能が動作しない

**症状**: 「このブラウザは録音機能に対応していません」エラー

**原因と対処**:
- HTTPでアクセスしている → HTTPSまたはlocalhostを使用
- マイク権限が拒否されている → ブラウザの設定で許可
- 非対応ブラウザ → Chrome、Safari、Edge最新版を使用

### 録音が一覧に反映されない

**症状**: 録音保存後、一覧画面で「未録音」のまま

**原因と対処**:
- キャッシュの問題 → Ctrl+Shift+R でハードリロード
- Service Workerのキャッシュ → F12 → Application → Service Workers → Unregister

### データベース接続エラー

**症状**: API呼び出しが500エラー

**原因と対処**:
- 環境変数の設定漏れ → `.env.local` を確認
- データベース未作成 → `npm run seed` を実行
- 接続文字列の誤り → Vercelダッシュボードから再取得

### CSSが適用されない

**症状**: スタイルが反映されず、テキストのみ表示

**原因と対処**:
- Tailwindディレクティブの欠落 → `globals.css` に以下を追加：
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- ビルドキャッシュの問題 → `.next` フォルダを削除して再ビルド

## パフォーマンス最適化

### 実装済みの最適化

- 動的インポート（Code Splitting）
- 画像最適化（AVIF/WebP対応）
- メモリキャッシュ（5分間）
- Service Workerによるオフライン対応
- 音声ファイルの長期キャッシュ（30日）

### キャッシュ戦略

- **APIレスポンス**: キャッシュなし（常に最新データ）
- **音声ファイル**: CacheFirst（30日間）
- **静的ファイル**: 1年間の長期キャッシュ
- **HTMLページ**: NetworkFirst（1日間）

## セキュリティ

### 実装済みのセキュリティ対策

- HTTPS必須（録音機能）
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- マイク権限の適切な管理
- SQL Injection対策（パラメータ化クエリ）

## ライセンス

このプロジェクトは私的利用を目的としています。

## 開発者向けメモ

### 既知の制限事項

- **レプリケーション遅延**: Vercel Postgresでは書き込み直後の読み取りで最新データが取得できない場合があります（現在3秒の待機時間で対応）
- **ブラウザ互換性**: 録音機能はMediaStream Recording APIに依存します
- **ファイルサイズ**: 長時間の録音は大きなファイルになります

### 今後の改善案

- [ ] 録音時間の制限設定
- [ ] 音声の圧縮・最適化
- [ ] 複数録音の比較機能
- [ ] 録音の共有機能
- [ ] ダークモード対応