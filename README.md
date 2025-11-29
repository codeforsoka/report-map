# 草加市 報告システム

草加市内で発生した建物や道路の異常、災害の様子などを、テキスト・画像・位置情報とともに報告できるシステムです。

## 機能

### 報告機能（一般市民向け）
- テキストによる説明入力
- 画像1枚の添付
- 位置情報の自動取得（画像EXIF → GPS → 手動調整）
- 報告完了の確認メッセージ表示
- スマートフォン・PC対応

### 管理画面（市職員向け）
- OpenStreetMapでの報告マップ表示
- 報告一覧の閲覧
- 報告詳細の確認
- CSVエクスポート機能

## 技術スタック

- フロントエンド: React + Vite
- バックエンド/データベース: Supabase
- 地図: OpenStreetMap (React Leaflet)
- EXIF読み取り: exifreader

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの設定

[SUPABASE_SETUP.md](./SUPABASE_SETUP.md) を参照してSupabaseプロジェクトを作成し、データベーススキーマを設定してください。

### 3. 環境変数の設定

`.env.example` を `.env` にコピーして、Supabaseの接続情報を設定:

```bash
cp .env.example .env
```

`.env` ファイルを編集:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 にアクセスしてください。

## 使い方

### 報告する

1. 「報告する」タブを選択
2. 説明文を入力
3. 画像を選択（オプション、EXIFから位置情報を自動取得）
4. 必要に応じて「現在地を取得」ボタンで位置情報を取得
5. 地図上でクリックして位置を調整
6. 「報告を送信」ボタンをクリック

### 管理画面

1. 「管理画面」タブを選択
2. 地図上のマーカーをクリックして報告詳細を確認
3. テーブルから報告を選択
4. 「CSVエクスポート」ボタンで全報告をダウンロード

## ビルド

本番用ビルド:

```bash
npm run build
```

ビルド結果のプレビュー:

```bash
npm run preview
```

## ライセンス

MIT License
