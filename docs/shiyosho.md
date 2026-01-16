# SEO順位監視ツール 仕様書

## 1. システム概要

### 1.1 システム名
**SEO Researcher** - クライアント管理型SEO順位監視ツール

### 1.2 システムの目的
複数のクライアントサイトのSEO順位を自動監視し、保守管理者の業務効率化と現状把握を支援する。

### 1.3 システム構成
- フロントエンド/バックエンド: Next.js 15 (App Router + API Routes)
- 言語: TypeScript
- データベース: Supabase (PostgreSQL)
- スタイリング: Tailwind CSS + Shadcn/ui
- 外部API: SerpApi (開発用) / DataForSEO (本番用)

---

## 2. 画面仕様

### 2.1 共通仕様

#### レイアウト構成
```
┌─────────────┬────────────────────────────────┐
│             │  Header (ロゴ・ユーザー情報)      │
│  Left Nav   ├────────────────────────────────┤
│             │                                │
│ - Dashboard │                                │
│ - サイト一覧│    Main Content Area           │
│ - 設定      │                                │
│             │                                │
└─────────────┴────────────────────────────────┘
```

#### カラーパレット
```css
/* Primary Colors */
--primary-blue: #3B82F6;
--primary-blue-hover: #2563EB;
--primary-blue-light: #DBEAFE;

/* Base Colors */
--base-white: #FFFFFF;
--base-gray-50: #F9FAFB;
--base-gray-100: #F3F4F6;
--base-gray-200: #E5E7EB;
--base-gray-600: #4B5563;
--base-gray-900: #111827;

/* Status Colors */
--success-green: #10B981;
--success-green-light: #D1FAE5;
--warning-red: #EF4444;
--warning-red-light: #FEE2E2;
```

#### タイポグラフィ
```css
font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;

/* Heading */
H1: 32px, font-weight: 700
H2: 24px, font-weight: 600
H3: 20px, font-weight: 600

/* Body */
Body: 16px, font-weight: 400
Small: 14px, font-weight: 400

/* Numbers (Ranking) */
Rank-Large: 48px, font-weight: 700
Rank-Medium: 24px, font-weight: 600
```

---

### 2.2 ダッシュボード（トップ画面）

#### 画面構成
```
┌─────────────────────────────────────────────┐
│  ダッシュボード                                │
├─────────────────────────────────────────────┤
│  [サマリーカード群]                            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │登録   │ │監視   │ │API   │ │要注意 │      │
│  │サイト │ │キーワ │ │使用  │ │キーワ │      │
│  │  12  │ │ード  │ │回数  │ │ード  │      │
│  │      │ │ 156  │ │ 234  │ │  3   │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
├─────────────────────────────────────────────┤
│  [全体推移グラフ - オプション]                  │
│   折れ線グラフ: 過去30日の平均順位推移         │
├─────────────────────────────────────────────┤
│  サイト別状況一覧                              │
│  ┌─────────────────────────────────────┐   │
│  │ 株式会社〇〇工務店                      │   │
│  │ 平均順位: 5.2  ↑ +1.3                │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ △△美容室                              │   │
│  │ 平均順位: 12.8  ↓ -2.1               │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### 構成要素

**1. サマリーカード（上部）**
| 項目 | 表示内容 | スタイル |
|------|---------|---------|
| 登録サイト数 | 数値 | 大きな数字（48px） |
| 監視キーワード総数 | 数値 | 大きな数字（48px） |
| 今月API使用回数 | 数値 | 大きな数字（48px） |
| 要注意キーワード | 数値 | **赤字・赤背景**で強調 |

**2. 全体推移グラフ（中部・オプション）**
- グラフタイプ: 折れ線グラフ
- データ: 全サイトの平均順位
- 期間: 過去30日
- ライブラリ: Chart.js / Recharts（推奨）

**3. サイト別状況リスト（下部）**
- レイアウト: カード形式
- 各カード表示項目:
  - サイト名（H3、太字）
  - 平均順位（大きめの数字）
  - 前日比（矢印 + 数値 + 色）
    - 上昇: ↑ 緑色
    - 下降: ↓ 赤色
- アクション: カードクリックでサイト詳細画面へ遷移

---

### 2.3 サイト詳細画面

#### 画面構成
```
┌─────────────────────────────────────────────┐
│  ← 戻る   株式会社〇〇工務店                   │
│  https://example.com                        │
│  地域: 岐阜県中津川市  デバイス: スマホ        │
├─────────────────────────────────────────────┤
│  [順位推移グラフ - メイン]                     │
│                                             │
│  期間: [過去7日▼] [過去30日] [過去90日]      │
│                                             │
│  □ 工務店 岐阜  (青線)                       │
│  □ 注文住宅 中津川  (緑線)                   │
│  □ リフォーム 岐阜  (橙線)                   │
│                                             │
│  [折れ線グラフエリア]                         │
│   ※複数キーワードを色分けして表示            │
│                                             │
├─────────────────────────────────────────────┤
│  キーワード詳細テーブル                        │
│  ┌──────────────────────────────────────┐  │
│  │キーワード│現在順位│前日比│週間変化│URL│  │
│  ├──────────────────────────────────────┤  │
│  │工務店    │   3   │ ↑+1 │  ↑+3  │..│  │
│  │注文住宅  │   8   │ ↓-2 │  ↓-1  │..│  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

#### 構成要素

**1. ヘッダー情報**
```
表示項目:
- サイト名（H1）
- URL（リンク）
- 対象地域（例: Nakatsugawa, JP）
- デバイス（Desktop / Mobile）
```

**2. 順位推移グラフ（メイン）**

| 要素 | 仕様 |
|------|------|
| グラフタイプ | 折れ線グラフ |
| Y軸 | 順位（1〜100、逆順表示） |
| X軸 | 日付 |
| 期間選択 | プルダウン（7日/30日/90日） |
| キーワード選択 | チェックボックスで表示/非表示切り替え |
| 色分け | キーワードごとに異なる色 |
| ツールチップ | ホバー時に「日付・順位・キーワード」表示 |
| 競合表示 | オプションで競合他社の順位も重ねて表示可能 |

**3. キーワード詳細テーブル**

| カラム名 | 表示内容 | 幅 | スタイル |
|---------|---------|-----|---------|
| キーワード | キーワード文字列 | 30% | 左寄せ、太字 |
| 現在の順位 | 数値（1〜100+） | 15% | 中央、大きめ |
| 前日比 | ±数値 + 矢印 | 15% | 中央、色付き（緑/赤） |
| 週間変化 | ±数値 + 矢印 | 15% | 中央、色付き（緑/赤） |
| 対象URL | ランクインページ | 25% | 小さめ、省略表示 |

**テーブルの色ルール:**
```css
/* 順位上昇 */
color: var(--success-green);
background-color: var(--success-green-light);

/* 順位下降 */
color: var(--warning-red);
background-color: var(--warning-red-light);
```

---

### 2.4 登録・設定画面（モーダル）

#### モーダルウィンドウ仕様

```
┌───────────────────────────────────────┐
│  新規サイト登録                    ✕   │
├───────────────────────────────────────┤
│                                       │
│  サイト名 *                            │
│  [                              ]    │
│                                       │
│  サイトURL *                          │
│  [https://                      ]    │
│                                       │
│  キーワード登録（改行区切り） *        │
│  [                              ]    │
│  [                              ]    │
│  [                              ]    │
│                                       │
│  検索対象地域                          │
│  [Nakatsugawa, JP          ▼]       │
│                                       │
│  デバイス                              │
│  ( ) Desktop  ( ) Mobile             │
│                                       │
│             [キャンセル] [登録]        │
└───────────────────────────────────────┘
```

#### フォーム項目

| 項目名 | タイプ | 必須 | 説明 |
|--------|--------|------|------|
| サイト名 | テキスト | ◯ | クライアント名など |
| サイトURL | URL | ◯ | https://から入力 |
| キーワード | テキストエリア | ◯ | 改行区切りで複数入力可能 |
| 検索対象地域 | プルダウン | - | 例: Nakatsugawa, JP |
| デバイス | ラジオボタン | ◯ | Desktop / Mobile |

#### バリデーション
- サイト名: 1文字以上
- URL: 有効なURL形式
- キーワード: 最低1つ以上

#### アクション
- **登録ボタン**: データ保存 → モーダル閉じる → ダッシュボード更新
- **キャンセルボタン**: モーダル閉じる（データ破棄）

---

## 3. 機能要件

### 3.1 コア機能

#### F-001: サイト管理
- サイトの新規登録
- サイト情報の編集
- サイトの削除

#### F-002: キーワード管理
- キーワードの一括登録（改行区切り）
- キーワードの個別追加・削除
- 検索地域・デバイス設定

#### F-003: 順位取得（自動・手動）
- 外部API連携
- スケジュール実行（日次・週次）
- 手動での即時取得

#### F-004: データ可視化
- ダッシュボードのサマリー表示
- 順位推移グラフの生成
- テーブルでの詳細表示

#### F-005: データエクスポート（将来）
- CSV出力
- PDF レポート生成

---

## 4. 技術要件

### 4.1 フロントエンド

```typescript
技術スタック:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + Shadcn/ui
- Recharts (グラフライブラリ)
- Noto Sans JP (Google Fonts)
```

### 4.2 バックエンド

```typescript
技術スタック:
- Next.js API Routes
- API: RESTful API設計
- 認証: Supabase Auth (将来実装)
```

### 4.3 データベース

```sql
データベース:
- Supabase (PostgreSQL)

主要テーブル:
- sites（サイト情報）
- keywords（キーワード情報）
- rankings（順位履歴）
- users（ユーザー情報 - Phase 2で実装）
```

### 4.4 外部API
- **SerpApi** (開発フェーズ)
- **DataForSEO** (本番フェーズ)
- アダプターパターンで切り替え可能な設計

---

## 5. データ構造

### 5.1 データベーススキーマ（案）

#### sites テーブル
```sql
CREATE TABLE sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL,
  site_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### keywords テーブル
```sql
CREATE TABLE keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL,
  location VARCHAR(100),  -- 例: "Nakatsugawa, JP"
  device VARCHAR(20) CHECK (device IN ('desktop', 'mobile')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### rankings テーブル
```sql
CREATE TABLE rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
  rank INTEGER,           -- 順位（1〜100+、圏外は NULL または 999）
  url TEXT,               -- ランクインしたページURL
  checked_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_keywords_site_id ON keywords(site_id);
CREATE INDEX idx_rankings_keyword_id ON rankings(keyword_id);
CREATE INDEX idx_rankings_checked_at ON rankings(checked_at);
```

#### users テーブル（Phase 2で実装）
```sql
-- Supabase Authを使用するため、カスタムテーブルは不要
-- 必要に応じてプロファイル情報用のテーブルを追加
```

---

## 6. API仕様（案）

### 6.1 サイト関連

```
GET    /api/sites          - サイト一覧取得
POST   /api/sites          - サイト新規登録
GET    /api/sites/[id]     - サイト詳細取得
PUT    /api/sites/[id]     - サイト情報更新
DELETE /api/sites/[id]     - サイト削除
```

**実装ファイル**: `app/api/sites/route.ts`, `app/api/sites/[id]/route.ts`

### 6.2 キーワード関連

```
GET    /api/keywords?site_id=[id]    - キーワード一覧取得
POST   /api/keywords                 - キーワード一括登録
DELETE /api/keywords/[id]            - キーワード削除
```

**実装ファイル**: `app/api/keywords/route.ts`, `app/api/keywords/[id]/route.ts`

### 6.3 順位データ関連

```
GET    /api/rankings?keyword_id=[id] - 順位データ取得
POST   /api/rankings/fetch           - 順位取得実行（SerpApi/DataForSEO連携）
GET    /api/rankings/stats           - ダッシュボード用統計データ
```

**実装ファイル**: `app/api/rankings/route.ts`, `app/api/rankings/fetch/route.ts`, `app/api/rankings/stats/route.ts`

---

## 7. 非機能要件

### 7.1 パフォーマンス
- ページ読み込み: 2秒以内
- API応答時間: 500ms以内

### 7.2 セキュリティ
- 認証・認可の実装
- HTTPS通信
- SQLインジェクション対策
- XSS対策

### 7.3 ユーザビリティ
- レスポンシブデザイン（PC/タブレット対応）
- エラーメッセージの明確化
- ローディング状態の表示

### 7.4 保守性
- コードのモジュール化
- コメント・ドキュメント整備
- テストコードの作成

---

## 8. 開発フェーズ

### Phase 1: MVP（最小viable製品）
- [ ] ダッシュボード基本機能
- [ ] サイト詳細画面
- [ ] サイト・キーワード登録機能
- [ ] 順位取得（手動）
- [ ] 基本的なグラフ表示

### Phase 2: 機能拡張
- [ ] 自動順位取得（スケジューラー）
- [ ] アラート通知機能
- [ ] データエクスポート（CSV）
- [ ] レスポンシブ対応

### Phase 3: 高度な機能
- [ ] 競合分析機能
- [ ] AIによる改善提案
- [ ] PDFレポート自動生成
- [ ] チーム共有機能

---

## 9. 付録

### 9.1 用語集

| 用語 | 説明 |
|------|------|
| サイト | 監視対象のWebサイト（クライアント） |
| キーワード | SEO順位を追跡する検索語 |
| 順位 | Google検索結果での表示位置（1〜100+） |
| 前日比 | 前日からの順位変動 |
| 要注意キーワード | 大幅に順位が下落したキーワード |

### 9.2 参考資料
- Google Search Console
- Vercel Dashboard デザイン
- Tailwind UI / Shadcn UI 管理画面テンプレート
- Chart.js 公式ドキュメント

---

## 10. 改訂履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|---------|--------|
| 1.0 | 2026-01-14 | 初版作成 | - |
