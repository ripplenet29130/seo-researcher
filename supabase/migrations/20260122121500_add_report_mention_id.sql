-- Add report_mention_id column to chatwork_site_settings
ALTER TABLE seo_researcher.chatwork_site_settings 
ADD COLUMN IF NOT EXISTS report_mention_id VARCHAR(255);

COMMENT ON COLUMN seo_researcher.chatwork_site_settings.report_mention_id IS 'Chatwork Account ID for personal mention (optional)';
