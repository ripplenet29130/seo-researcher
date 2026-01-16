# SEO Researcher - Next.js 15 セットアップガイド

## 1. プロジェクト初期化コマンド

### Step 1: Next.jsプロジェクト作成

```bash
# プロジェクトディレクトリに移動
cd c:\Users\syste\OneDrive\デスクトップ\seo-researcher

# Next.js 15プロジェクト作成（App Router使用）
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias="@/*" --use-npm

# ※ 既存のdocsフォルダがあるため、上書き確認が出た場合は "n" を選択
```

### Step 2: Shadcn/ui セットアップ

```bash
# Shadcn/ui 初期化
npx shadcn@latest init

# 初期化時の質問への回答:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### Step 3: Shadcn/ui コンポーネントのインストール

```bash
# 必要なコンポーネントを一括インストール
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add badge
npx shadcn@latest add dropdown-menu
```

### Step 4: 追加パッケージのインストール

```bash
# Supabase クライアント
npm install @supabase/supabase-js

# グラフライブラリ
npm install recharts

# アイコンライブラリ
npm install lucide-react

# SerpApi クライアント
npm install serpapi

# 日付処理ライブラリ
npm install date-fns

# 開発用型定義
npm install -D @types/node
```

---

## 2. 環境変数の定義

プロジェクトルートに `.env.local` ファイルを作成し、以下の内容を記述してください。

```bash
# .env.local

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 外部API設定
SERPAPI_API_KEY=your_serpapi_api_key

# 将来的にDataForSEOを使う場合
# DATAFORSEO_LOGIN=your_dataforseo_login
# DATAFORSEO_PASSWORD=your_dataforseo_password

# 開発環境フラグ（開発中はSerpApiを使用）
NODE_ENV=development
```

### 環境変数の取得方法

#### Supabase
1. [Supabase Console](https://supabase.com) にログイン
2. 新規プロジェクトを作成
3. `Settings` → `API` から以下を取得:
   - `URL`: `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public`: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role`: `SUPABASE_SERVICE_ROLE_KEY`

#### SerpApi
1. [SerpApi](https://serpapi.com/) にサインアップ
2. ダッシュボードから `API Key` を取得
3. `SERPAPI_API_KEY` に設定

---

## 3. ディレクトリ構成ツリー

```
seo-researcher/
├── .env.local                      # 環境変数（Gitにコミットしない）
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── components.json                 # Shadcn/ui設定
│
├── docs/                           # ドキュメント（既存）
│   ├── kikakusho.md
│   ├── shiyosho.md
│   └── implementation_plan.md
│
├── app/                            # Next.js App Router
│   ├── layout.tsx                 # ルートレイアウト
│   ├── page.tsx                   # ダッシュボード（トップページ）
│   ├── globals.css                # Tailwind CSSグローバル設定
│   │
│   ├── sites/                     # サイト関連ページ
│   │   └── [id]/
│   │       └── page.tsx           # サイト詳細ページ
│   │
│   └── api/                       # API Routes
│       ├── sites/
│       │   ├── route.ts           # GET /api/sites, POST /api/sites
│       │   └── [id]/
│       │       └── route.ts       # GET/PUT/DELETE /api/sites/[id]
│       ├── keywords/
│       │   ├── route.ts           # GET /api/keywords, POST /api/keywords
│       │   └── [id]/
│       │       └── route.ts       # DELETE /api/keywords/[id]
│       └── rankings/
│           ├── route.ts           # GET /api/rankings
│           ├── fetch/
│           │   └── route.ts       # POST /api/rankings/fetch
│           └── stats/
│               └── route.ts       # GET /api/rankings/stats
│
├── components/                     # Reactコンポーネント
│   ├── ui/                        # Shadcn/uiコンポーネント（自動生成）
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   └── dropdown-menu.tsx
│   │
│   ├── layout/                    # レイアウトコンポーネント
│   │   ├── Sidebar.tsx           # 左サイドバーナビゲーション
│   │   ├── Header.tsx            # ヘッダー
│   │   └── MainLayout.tsx        # メインレイアウト
│   │
│   ├── dashboard/                 # ダッシュボード関連
│   │   ├── SummaryCard.tsx       # サマリーカード
│   │   └── SiteList.tsx          # サイト一覧リスト
│   │
│   ├── site-detail/               # サイト詳細関連
│   │   ├── RankingChart.tsx      # 順位推移グラフ（Recharts）
│   │   └── KeywordTable.tsx      # キーワード詳細テーブル
│   │
│   └── forms/                     # フォーム関連
│       ├── SiteRegisterModal.tsx # サイト登録モーダル
│       └── KeywordInput.tsx      # キーワード入力フィールド
│
├── lib/                            # ユーティリティ・設定
│   ├── supabase/
│   │   ├── client.ts             # Supabaseクライアント（ブラウザ用）
│   │   └── server.ts             # Supabaseクライアント（サーバー用）
│   │
│   ├── api/                       # 外部API連携
│   │   ├── seo-api-adapter.ts    # アダプターインターフェース
│   │   ├── serpapi-adapter.ts    # SerpApi実装
│   │   └── dataforseo-adapter.ts # DataForSEO実装（将来）
│   │
│   ├── types.ts                   # TypeScript型定義
│   └── utils.ts                   # ユーティリティ関数
│
└── public/                         # 静的ファイル
    └── logo.svg                   # ロゴ画像
```

---

## 4. 次のステップ

セットアップ完了後、以下の手順で開発を進めます：

### 4.1 Supabaseテーブル作成
Supabase Console の SQL Editorで以下を実行：

```sql
-- sitesテーブル
CREATE TABLE sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL,
  site_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- keywordsテーブル
CREATE TABLE keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL,
  location VARCHAR(100),
  device VARCHAR(20) CHECK (device IN ('desktop', 'mobile')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- rankingsテーブル
CREATE TABLE rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
  rank INTEGER,
  url TEXT,
  checked_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_keywords_site_id ON keywords(site_id);
CREATE INDEX idx_rankings_keyword_id ON rankings(keyword_id);
CREATE INDEX idx_rankings_checked_at ON rankings(checked_at);
```

### 4.2 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスして確認。

---

## 5. 注意事項

### Git管理
`.env.local` は `.gitignore` に含まれているため、Gitにコミットされません。

### TypeScript設定
`tsconfig.json` の `paths` 設定により、`@/` で絶対パスインポートが可能です。

```typescript
// 例: コンポーネントのインポート
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
```

### Tailwind CSS
`app/globals.css` にShadcn/uiのCSS変数が自動追加されます。

---

## 6. トラブルシューティング

### エラー: "Module not found"
```bash
npm install
```

### Shadcn/ui コンポーネントが見つからない
```bash
npx shadcn@latest add [component-name]
```

### Supabase接続エラー
`.env.local` の環境変数が正しく設定されているか確認してください。
