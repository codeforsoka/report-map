# GitHub Pagesへのデプロイ手順

## 1. GitHubリポジトリの設定

### Pages設定を有効化

1. GitHubリポジトリ (https://github.com/codeforsoka/report-map) にアクセス
2. **Settings** タブをクリック
3. 左メニューから **Pages** を選択
4. **Source** セクションで **GitHub Actions** を選択

## 2. Secretsの設定

環境変数をGitHub Secretsに登録します：

1. GitHubリポジトリの **Settings** タブをクリック
2. 左メニューから **Secrets and variables** → **Actions** を選択
3. **New repository secret** をクリック
4. 以下の2つのSecretを追加：

### VITE_SUPABASE_URL
- Name: `VITE_SUPABASE_URL`
- Secret: あなたのSupabase Project URL（例: `https://xxxxx.supabase.co`）

### VITE_SUPABASE_ANON_KEY
- Name: `VITE_SUPABASE_ANON_KEY`
- Secret: あなたのSupabase anon key（例: `eyJhbGc...`）

## 3. デプロイ

設定完了後、`main` ブランチにpushすると自動的にデプロイされます：

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

## 4. デプロイ状況の確認

1. GitHubリポジトリの **Actions** タブで進行状況を確認
2. デプロイ完了後、以下のURLでアクセス可能：
   - https://codeforsoka.github.io/report-map/

## トラブルシューティング

### デプロイが失敗する場合

1. **Actions** タブでエラーログを確認
2. Secretsが正しく設定されているか確認
3. Pages設定が **GitHub Actions** になっているか確認

### 404エラーが表示される場合

1. `vite.config.js` の `base` 設定が `/report-map/` になっているか確認
2. デプロイが完了しているか **Actions** タブで確認

### 環境変数が読み込まれない場合

1. GitHub Secretsの名前が正確に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` になっているか確認
2. 先頭に `VITE_` が付いていることを確認（これがないとViteが読み込みません）

## 再デプロイ

コードを修正して再デプロイする場合：

```bash
git add .
git commit -m "Update features"
git push origin main
```

自動的に再ビルド・再デプロイされます。
