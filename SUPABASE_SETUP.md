# Supabase セットアップ手順

## 1. Supabaseプロジェクト作成

1. https://supabase.com にアクセス
2. 新しいプロジェクトを作成
3. Project URLとanon keyをコピー

## 2. 環境変数設定

プロジェクトルートに `.env` ファイルを作成:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. データベーススキーマ作成

Supabase SQLエディタで以下のSQLを実行:

```sql
-- reportsテーブル作成
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  image_url TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) を有効化
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能
CREATE POLICY "Anyone can view reports" ON reports
  FOR SELECT USING (true);

-- 全員が挿入可能（匿名報告のため）
CREATE POLICY "Anyone can insert reports" ON reports
  FOR INSERT WITH CHECK (true);

-- インデックス作成（地図表示の高速化）
CREATE INDEX reports_location_idx ON reports (latitude, longitude);
CREATE INDEX reports_created_at_idx ON reports (created_at DESC);

-- ストレージバケット作成（画像保存用）
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true);

-- ストレージポリシー設定
CREATE POLICY "Anyone can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'report-images');

CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'report-images');
```

## 4. 完了

設定が完了したら、アプリケーションを起動できます:

```bash
npm run dev
```
