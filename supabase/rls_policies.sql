-- RLS policies for AurusAI (personal app)
-- Run this in Supabase SQL Editor to fix 500 errors on inserts
-- Fixes: "new row violates row-level security policy"

-- trades
DROP POLICY IF EXISTS "Allow all trades" ON trades;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all trades" ON trades FOR ALL USING (true) WITH CHECK (true);

-- levels
DROP POLICY IF EXISTS "Allow all levels" ON levels;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all levels" ON levels FOR ALL USING (true) WITH CHECK (true);

-- alerts
DROP POLICY IF EXISTS "Allow all alerts" ON alerts;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all alerts" ON alerts FOR ALL USING (true) WITH CHECK (true);

-- reports
DROP POLICY IF EXISTS "Allow all reports" ON reports;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all reports" ON reports FOR ALL USING (true) WITH CHECK (true);

-- news_cache
DROP POLICY IF EXISTS "Allow all news_cache" ON news_cache;
ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all news_cache" ON news_cache FOR ALL USING (true) WITH CHECK (true);

-- calendar_cache
DROP POLICY IF EXISTS "Allow all calendar_cache" ON calendar_cache;
ALTER TABLE calendar_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all calendar_cache" ON calendar_cache FOR ALL USING (true) WITH CHECK (true);
