-- 1. Create app_settings table (Key-Value store for global settings)
CREATE TABLE IF NOT EXISTS seo_researcher.app_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create chatwork_site_settings table (Per-site settings)
CREATE TABLE IF NOT EXISTS seo_researcher.chatwork_site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES seo_researcher.sites(id) ON DELETE CASCADE,
  room_id VARCHAR(255) NOT NULL,
  report_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (report_frequency IN ('weekly', 'monthly')),
  report_time INTEGER DEFAULT 10 CHECK (report_time >= 0 AND report_time <= 23),
  report_day_of_week INTEGER DEFAULT 1 CHECK (report_day_of_week >= 0 AND report_day_of_week <= 6), -- 0=Sunday, 1=Monday...
  report_day_of_month INTEGER DEFAULT 1 CHECK (report_day_of_month >= 1 AND report_day_of_month <= 31),
  message_template TEXT DEFAULT '【SEO順位報告】\nサイト: {site_name}\n期間: {period}\n\n{rankings}',
  last_report_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(site_id)
);

-- 3. RLS Policies
ALTER TABLE seo_researcher.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_researcher.chatwork_site_settings ENABLE ROW LEVEL SECURITY;

-- Allow all access for now (assuming internal tool usage)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to app_settings') THEN
        CREATE POLICY "Allow all access to app_settings" ON seo_researcher.app_settings FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to chatwork_site_settings') THEN
        CREATE POLICY "Allow all access to chatwork_site_settings" ON seo_researcher.chatwork_site_settings FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 4. Grant Permissions
GRANT ALL ON seo_researcher.app_settings TO anon, authenticated, service_role;
GRANT ALL ON seo_researcher.chatwork_site_settings TO anon, authenticated, service_role;
