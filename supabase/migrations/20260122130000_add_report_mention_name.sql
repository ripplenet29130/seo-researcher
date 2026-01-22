-- Add report_mention_name column to chatwork_site_settings
ALTER TABLE seo_researcher.chatwork_site_settings 
ADD COLUMN IF NOT EXISTS report_mention_name VARCHAR(255);

COMMENT ON COLUMN seo_researcher.chatwork_site_settings.report_mention_name IS 'Chatwork Account Name for personal mention (optional)';
