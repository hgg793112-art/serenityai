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
