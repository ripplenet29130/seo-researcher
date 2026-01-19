-- SEO Researcher - Full Schema Setup (Custom Schema)
-- This SQL script creates the seo_researcher schema and all necessary tables.

-- 1. Create Schema
CREATE SCHEMA IF NOT EXISTS seo_researcher;

-- 2. Create sites table
CREATE TABLE IF NOT EXISTS seo_researcher.sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL,
  site_url VARCHAR(255) NOT NULL,
  auto_fetch_enabled BOOLEAN DEFAULT FALSE,
  fetch_frequency TEXT DEFAULT 'weekly' CHECK (fetch_frequency IN ('daily', 'weekly', 'monthly')),
  fetch_time INTEGER DEFAULT 9,
  fetch_day_of_week INTEGER DEFAULT 1,
  fetch_day_of_month INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create keywords table
CREATE TABLE IF NOT EXISTS seo_researcher.keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES seo_researcher.sites(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL,
  location VARCHAR(100),
  device VARCHAR(20) CHECK (device IN ('desktop', 'mobile')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create rankings table
CREATE TABLE IF NOT EXISTS seo_researcher.rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_id UUID REFERENCES seo_researcher.keywords(id) ON DELETE CASCADE,
  rank INTEGER, -- 1-100, NULL if out of rank
  url TEXT,
  checked_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_keywords_site_id ON seo_researcher.keywords(site_id);
CREATE INDEX IF NOT EXISTS idx_rankings_keyword_id ON seo_researcher.rankings(keyword_id);
CREATE INDEX IF NOT EXISTS idx_rankings_checked_at ON seo_researcher.rankings(checked_at);

-- 6. RLS Policies (Allow all for development/simple access)
ALTER TABLE seo_researcher.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_researcher.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_researcher.rankings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to sites') THEN
        CREATE POLICY "Allow all access to sites" ON seo_researcher.sites FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to keywords') THEN
        CREATE POLICY "Allow all access to keywords" ON seo_researcher.keywords FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to rankings') THEN
        CREATE POLICY "Allow all access to rankings" ON seo_researcher.rankings FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
