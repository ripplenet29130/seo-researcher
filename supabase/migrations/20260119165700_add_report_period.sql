-- Add report_period column to chatwork_site_settings
ALTER TABLE seo_researcher.chatwork_site_settings 
ADD COLUMN IF NOT EXISTS report_period INTEGER DEFAULT 7 CHECK (report_period IN (7, 30, 90));

COMMENT ON COLUMN seo_researcher.chatwork_site_settings.report_period IS 'Report period in days (7, 30, or 90)';
