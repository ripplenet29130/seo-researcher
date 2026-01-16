# SEO Researcher - 実装計画（Next.js版）

## 概要

企画書・仕様書に基づき、**Next.js + TypeScript + Supabase**を使用した、フルスタックSEO順位監視ツールのMVPを実装します。

---

## 実装方針

### 技術スタック
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Charts**: Recharts
- **API**: SerpApi (開発) / DataForSEO (本番)
- **Fonts**: Noto Sans JP (Google Fonts)

### 開発アプローチ
1. **Next.jsプロジェクト**を`create-next-app`で初期化
2. **Supabase**でデータベースを構築
3. **API Routes**で外部API連携（アダプターパターン）
4. **App Router**でページ実装
5. **Shadcn/ui**でコンポーネント構築

---

## 提案する変更点

### プロジェクト構造（Next.js App Router）

```
seo-researcher/
├── docs/                           # ドキュメント
│   ├── kikakusho.md
│   ├── shiyosho.md
│   └── implementation_plan.md
├── app/                            # Next.js App Router
│   ├── layout.tsx                 # ルートレイアウト
│   ├── page.tsx                   # ダッシュボード（トップページ）
│   ├── sites/
│   │   └── [id]/
│   │       └── page.tsx           # サイト詳細ページ
│   ├── api/
│   │   ├── sites/
│   │   │   └── route.ts           # サイトCRUD API
│   │   ├── keywords/
│   │   │   └── route.ts           # キーワード管理API
│   │   └── rankings/
│   │       └── route.ts           # 順位取得API
│   └── globals.css                # Tailwind CSSグローバル設定
├── components/                     # Reactコンポーネント
│   ├── ui/                        # Shadcn/uiコンポーネント
│   ├── dashboard/
│   │   ├── SummaryCard.tsx
│   │   └── SiteList.tsx
│   ├── site-detail/
│   │   ├── RankingChart.tsx       # Recharts使用
│   │   └── KeywordTable.tsx
│   └── forms/
│       └── SiteRegisterModal.tsx
├── lib/
│   ├── supabase.ts                # Supabaseクライアント
│   ├── serpapi.ts                 # SerpApi連携（アダプター）
│   └── types.ts                   # TypeScript型定義
├── .env.local                      # 環境変数（Supabase、SerpApi）
└── package.json
```

### 実装する画面（Phase 1）

#### 1. 共通レイアウト
- ヘッダー（ロゴ、ユーザー情報）
- 左サイドナビゲーション
- メインコンテンツエリア

#### 2. ダッシュボード (`#dashboard`)
- サマリーカード（4枚）
  - 登録サイト数
  - 監視キーワード総数
  - API使用回数
  - 要注意キーワード
- サイト別状況リスト（カード形式）

#### 3. サイト詳細画面 (`#site-detail`)
- ヘッダー情報（サイト名、URL、設定）
- **順位推移グラフ**（Chart.js）
- キーワード詳細テーブル

#### 4. 登録モーダル (`#modal-register`)
- サイト登録フォーム
- キーワード一括登録
- バリデーション処理

---

## セットアップ手順

### 1. Next.jsプロジェクト初期化
```bash
npx create-next-app@latest seo-researcher \
  --typescript --tailwind --app --src-dir=false \
  --import-alias="@/*" --use-npm
```

### 2. 必要なパッケージのインストール
```bash
npm install @supabase/supabase-js
npm install recharts
npm install serpapi
npm install date-fns
npx shadcn@latest init
npx shadcn@latest add card table dialog button input
```

### 3. Supabase設定
- Supabaseプロジェクト作成
- `.env.local`に接続情報を設定
- テーブル作成SQL実行（後述）

---

## Supabaseテーブル作成SQL

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

---

## 実装順序

1. ✅ Next.jsプロジェクト作成 + パッケージインストール
2. ✅ Supabase接続設定 + テーブル作成
3. Supabaseクライアント実装 (`lib/supabase.ts`)
4. API Routes実装
   - サイトCRUD (`app/api/sites/route.ts`)
   - キーワード管理 (`app/api/keywords/route.ts`)
   - 順位取得 (`app/api/rankings/route.ts`) + SerpApi連携
5. UI実装（Shadcn/ui + Tailwind CSS）
   - 共通レイアウト
   - ダッシュボード
   - サイト詳細ページ
6. グラフ実装（Recharts）
7. テスト・動作確認

---

## 検証計画

### 動作確認
- データCRUD操作のテスト
- SerpApi連携テスト
- グラフ表示確認

### デザイン確認
- Tailwind CSSによる仕様書準拠のデザイン
- レスポンシブ対応確認

---

## 注意事項

> [!IMPORTANT]
> - Phase 1では**MVP機能のみ**を実装します
> - 認証機能は後のフェーズで追加
> - 本番ではDataForSEOに切り替え可能な設計（アダプターパターン）

> [!TIP]
> - Supabase Row Level Security (RLS)は後で設定
> - 環境変数は`.env.local`で管理（`.gitignore`に追加）
