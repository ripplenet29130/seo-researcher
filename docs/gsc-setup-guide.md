# Google Search Console 連携セットアップガイド

このガイドでは、Google Search Console（GSC）との連携に必要な設定手順を説明します。

## 前提条件

- Supabaseプロジェクトが作成済みであること
- Google Cloud Consoleへのアクセス権があること
- 対象サイトのSearch Consoleへのアクセス権（オーナーまたは完全ユーザー）があること

## 1. Google Cloud Consoleの設定

### 1.1 プロジェクトの作成または選択

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 既存のプロジェクトを選択、または新規プロジェクトを作成

### 1.2 Search Console APIの有効化

1. 左メニューから **APIとサービス > ライブラリ** を選択
2. 「Search Console API」を検索
3. **Google Search Console API** をクリック
4. **有効にする** ボタンをクリック

### 1.3 OAuth 2.0 クライアントIDの作成

1. **APIとサービス > 認証情報** を選択
2. **認証情報を作成 > OAuth クライアント ID** をクリック
3. **同意画面を構成** が表示されたら、以下の手順で設定：

#### OAuth同意画面の設定

1. **User Type**: 外部 を選択して **作成**
2. **アプリ情報**:
   - アプリ名: `SEO Researcher`（任意）
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先情報: あなたのメールアドレス
3. **スコープ**:
   - **スコープを追加または削除** をクリック
   - フィルタで `Search Console` を検索
   - **Google Search Console API** の `.../auth/webmasters.readonly` にチェック
   - **更新** をクリック
4. **保存して次へ** → **保存して次へ** → **ダッシュボードに戻る**

#### OAuth クライアントIDの作成

1. 再度 **認証情報を作成 > OAuth クライアント ID** をクリック
2. **アプリケーションの種類**: ウェブアプリケーション
3. **名前**: `SEO Researcher Web Client`（任意）
4. **承認済みのリダイレクト URI**:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   ※ `<your-project-ref>` は Supabase Dashboard の Project URL から確認
5. **作成** をクリック
6. **クライアントID** と **クライアントシークレット** をコピーして保存

## 2. Supabaseの設定

### 2.1 Google Providerの有効化

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. プロジェクトを選択
3. 左メニューから **Authentication > Providers** を選択
4. **Google** を探してクリック
5. 以下を設定：
   - **Enable Sign in with Google**: ON
   - **Client ID**: Google Cloud ConsoleでコピーしたクライアントID
   - **Client Secret**: Google Cloud Consoleでコピーしたクライアントシークレット
   - **Authorized Client IDs**: 空欄でOK
   - **Skip nonce check**: OFF（デフォルト）
   - **Additional Scopes**: 
     ```
     https://www.googleapis.com/auth/webmasters.readonly
     ```
     ※ **重要**: このスコープを必ず追加してください

6. **Save** をクリック

### 2.2 リダイレクトURLの確認

1. **Authentication > URL Configuration** で以下を確認：
   - **Site URL**: あなたのアプリケーションのURL（例: `https://your-app.vercel.app`）
   - **Redirect URLs**: Site URLが含まれていること

## 3. トラブルシューティング

### provider_tokenが取得できない場合

#### 症状
- 認証は成功するが「連携が必要です」とエラーが出る
- コンソールログに `hasProviderToken: false` と表示される

#### 対処法

1. **Supabaseのスコープ設定を確認**:
   - Authentication > Providers > Google の **Additional Scopes** に
   - `https://www.googleapis.com/auth/webmasters.readonly` が入っているか確認

2. **一度完全にログアウト**:
   - アプリからログアウト
   - Googleアカウントからもアプリの接続を解除
     - [Googleアカウントの接続済みアプリ](https://myaccount.google.com/permissions) にアクセス
     - 該当アプリを削除
   - 再度ログインして連携

3. **Supabase設定の反映を待つ**:
   - 設定変更後、数分待ってから再試行

### 403エラー「権限がありません」が出る場合

#### 症状
- OAuth認証は成功
- provider_tokenも取得できている
- APIリクエスト時に403エラー

#### 対処法

1. **Search Consoleプロパティの形式を確認**:
   - [Search Console](https://search.google.com/search-console) にアクセス
   - 左上のプロパティセレクターを開く
   - プロパティのURL形式を確認（例: `https://www.rip-ple.com/`）

2. **データベースのsite_urlを修正**:
   - site_urlがSearch Consoleのプロパティと完全一致しているか確認
   - 末尾のスラッシュ `/` の有無も重要

3. **アカウントの権限を確認**:
   - Search Consoleで該当プロパティの「オーナー」または「完全ユーザー」権限があるか確認
   - 「制限付きユーザー」ではAPIアクセスができない場合があります

### 404エラー「サイトが見つかりません」が出る場合

#### 原因
- Search ConsoleにプロパティとしてWEBサイトが未登録
- URL形式の不一致（http/https、www有無、末尾スラッシュ）

#### 対処法

1. **Search Consoleにプロパティを追加**:
   - [Search Console](https://search.google.com/search-console) にアクセス
   - **プロパティを追加** をクリック
   - URLプレフィックス方式で登録

2. **URL形式を完全一致させる**:
   ```
   データベース: https://www.rip-ple.com/
   Search Console: https://www.rip-ple.com/
   ✅ 完全一致
   
   データベース: https://www.rip-ple.com
   Search Console: https://www.rip-ple.com/
   ❌ 末尾スラッシュが不一致
   ```

## 4. 確認手順

すべての設定が完了したら、以下の手順で動作確認を行います：

1. **ログアウト**: アプリケーションから一度ログアウト
2. **再ログイン**: Googleアカウントで再ログイン
3. **GSC連携**: サイト詳細ページで「Google Search Consoleと連携」をクリック
4. **権限承認**: Google承認画面で「確認済みサイトの Search Console データの表示」を確認して **許可**
5. **データ確認**: リダイレクト後、グラフが表示されることを確認

## 5. デバッグ方法

問題が解決しない場合は、ブラウザの開発者ツールとサーバーログを確認してください：

### ブラウザコンソール（F12 > Console）

連携ボタンをクリック後、以下のログを確認：
- `🔗 Google Search Console連携を開始...`
- `📍 現在のURL`
- `🔙 コールバックURL`

### サーバーログ

ターミナルまたはVercelのログで以下を確認：
- `📋 セッション情報` - hasProviderTokenがtrueであること
- `✅ provider_token取得成功` - トークンの一部が表示される
- `❌ GSC API エラー発生` - エラーがある場合、詳細が表示される

## サポート

問題が解決しない場合は、以下の情報を添えてお問い合わせください：

- ブラウザコンソールのログ（スクリーンショット）
- サーバーログ（エラー部分）
- Supabase Google Provider設定のスクリーンショット（センシティブ情報は隠す）
- Search Consoleプロパティのスクリーンショット
