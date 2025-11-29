# 次のステップ

システムの基本機能が実装完了しました。以下の手順でセットアップを進めてください。

## 1. Supabaseの設定

1. [Supabase](https://supabase.com) にアクセスしてアカウント作成
2. 新しいプロジェクトを作成
3. SQL Editorで [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) に記載されたSQLを実行
4. Settings → API からProject URLとanon keyを取得

## 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルにSupabaseの情報を設定:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## 3. アプリケーションの起動

```bash
npm run dev
```

http://localhost:5173 にアクセスして動作確認してください。

## 実装済み機能

### ✅ 報告機能
- テキスト入力
- 画像1枚添付
- 画像EXIF → GPS → 手動調整の位置情報取得
- OpenStreetMap上での位置調整
- 報告完了メッセージ表示

### ✅ 管理画面
- 報告のマップ表示
- 報告一覧テーブル
- 報告詳細モーダル
- CSVエクスポート

### ✅ その他
- スマホ・PC対応のレスポンシブデザイン
- 匿名報告
- 画像のSupabase Storageへの自動アップロード

## 今後の拡張案

将来的に検討できる機能:

1. **認証機能**
   - 管理画面へのログイン機能
   - Supabase Authを利用

2. **通知機能**
   - 新規報告時のメール/プッシュ通知
   - Supabase Edge Functionsを利用

3. **ステータス管理**
   - 未対応/対応中/完了のステータス
   - 対応履歴の記録

4. **カテゴリ分類**
   - 道路/建物/その他などの分類
   - カテゴリ別フィルタリング

5. **検索機能**
   - 日付範囲検索
   - キーワード検索
   - 地域検索

6. **複数画像対応**
   - 1報告あたり複数枚の画像添付

7. **報告の編集/削除**
   - 管理者による報告の修正・削除機能

## トラブルシューティング

### 地図が表示されない
- LeafletのCSSが正しく読み込まれているか確認
- コンソールエラーを確認

### 画像がアップロードできない
- Supabaseのストレージバケット `report-images` が作成されているか確認
- ストレージポリシーが正しく設定されているか確認

### 位置情報が取得できない
- ブラウザの位置情報許可を確認
- HTTPSでアクセスしているか確認（localhostは除く）

## デプロイ

### Vercel / Netlify
1. ビルドコマンド: `npm run build`
2. 出力ディレクトリ: `dist`
3. 環境変数に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定

### その他のホスティング
1. `npm run build` でビルド
2. `dist` ディレクトリをデプロイ
