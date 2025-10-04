-- 朗読エクササイズ データベーススキーマ

-- texts テーブル（テキスト・作品）
CREATE TABLE IF NOT EXISTS texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  author VARCHAR(100),
  content TEXT NOT NULL,
  preview VARCHAR(200),
  is_custom BOOLEAN DEFAULT false,
  blob_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- texts テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_texts_created_at ON texts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_texts_is_custom ON texts(is_custom);

-- recordings テーブル（録音データ）
CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id UUID NOT NULL,
  audio_blob_url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_text FOREIGN KEY (text_id) REFERENCES texts(id) ON DELETE CASCADE
);

-- recordings テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_recordings_text_id ON recordings(text_id);
CREATE INDEX IF NOT EXISTS idx_recordings_recorded_at ON recordings(recorded_at DESC);
-- 1つのテキストに対して1つの録音のみ
CREATE UNIQUE INDEX IF NOT EXISTS idx_recordings_text_id_unique ON recordings(text_id);

-- updated_at 自動更新用のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- texts テーブルのトリガー
DROP TRIGGER IF EXISTS update_texts_updated_at ON texts;
CREATE TRIGGER update_texts_updated_at
  BEFORE UPDATE ON texts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- recordings テーブルのトリガー
DROP TRIGGER IF EXISTS update_recordings_updated_at ON recordings;
CREATE TRIGGER update_recordings_updated_at
  BEFORE UPDATE ON recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();