-- AurusAI Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- trades
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_price DECIMAL NOT NULL,
  exit_price DECIMAL,
  direction TEXT CHECK (direction IN ('long','short')) NOT NULL,
  lot_size DECIMAL,
  rr_ratio DECIMAL,
  setup_description TEXT,
  session TEXT CHECK (session IN ('london','new_york','asian','overlap')),
  news_day BOOLEAN DEFAULT false,
  outcome TEXT CHECK (outcome IN ('win','loss','breakeven','open')),
  pnl_dollars DECIMAL,
  entry_time TIMESTAMPTZ,
  exit_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- levels
CREATE TABLE IF NOT EXISTS levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price DECIMAL NOT NULL,
  type TEXT CHECK (type IN ('support','resistance')),
  label TEXT,
  active BOOLEAN DEFAULT true,
  alert_threshold DECIMAL DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('level','news','calendar','report')),
  message TEXT,
  channel TEXT CHECK (channel IN ('whatsapp','telegram','both')),
  fired_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

-- reports (stores both daily briefs and weekly reports)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE,
  content JSONB,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- news_cache
CREATE TABLE IF NOT EXISTS news_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT,
  source TEXT,
  url TEXT,
  published_at TIMESTAMPTZ,
  impact_score INTEGER,
  impact_assessment TEXT,
  processed BOOLEAN DEFAULT false,
  alert_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- calendar_cache
CREATE TABLE IF NOT EXISTS calendar_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT,
  event_time TIMESTAMPTZ,
  impact_rating TEXT,
  explanation TEXT,
  historical_pattern TEXT,
  watch_for TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies: Run supabase/rls_policies.sql in Supabase SQL Editor after creating tables
