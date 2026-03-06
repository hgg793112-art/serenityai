-- Serenity AI：在 Supabase 儀表板執行此 SQL（SQL Editor > New query）
-- 建立心情日誌與健康資料表

-- 心情日誌（與前端 MoodLogEntry 對應）
CREATE TABLE IF NOT EXISTS mood_logs (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN (
    'EXCITED','HAPPY','CALM','TIRED','SAD','ANXIOUS','STRESSED'
  )),
  note TEXT,
  stress_level INTEGER NOT NULL CHECK (stress_level >= 0 AND stress_level <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 健康指標（可選，與前端 HealthMetric 對應）
CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp BIGINT NOT NULL,
  heart_rate INTEGER NOT NULL,
  steps INTEGER NOT NULL,
  sleep_hours NUMERIC(4,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 啟用 Row Level Security（RLS），允許匿名讀寫（可依需求改為需登入）
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

-- 政策：允許所有人讀寫（適合單機/展示；正式環境建議改為 auth.uid()）
CREATE POLICY "Allow all for mood_logs" ON mood_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for health_metrics" ON health_metrics
  FOR ALL USING (true) WITH CHECK (true);

-- 建議索引（方便依時間查詢）
CREATE INDEX IF NOT EXISTS idx_mood_logs_timestamp ON mood_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_health_metrics_timestamp ON health_metrics (timestamp DESC);

-- ----- 對話記憶（類 Tolan，免費方案） -----
-- 對話記錄：近期 N 輪用於組裝上下文
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON chat_messages (user_id, created_at DESC);

-- 長期記憶片段（簡單事實，可選：後續可加 pgvector 向量表）
CREATE TABLE IF NOT EXISTS memory_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  fact_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_memory_facts_user ON memory_facts (user_id, created_at DESC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for memory_facts" ON memory_facts FOR ALL USING (true) WITH CHECK (true);

-- ----- AI Agent: 情緒記錄表 -----
CREATE TABLE IF NOT EXISTS emotion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  emotion TEXT NOT NULL CHECK (emotion IN (
    'happy','excited','calm','grateful',
    'sad','anxious','stressed','angry',
    'lonely','tired','confused','neutral'
  )),
  confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  intensity NUMERIC(3,2) NOT NULL CHECK (intensity >= 0 AND intensity <= 1),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_emotion_records_user ON emotion_records (user_id, created_at DESC);

ALTER TABLE emotion_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for emotion_records" ON emotion_records FOR ALL USING (true) WITH CHECK (true);
