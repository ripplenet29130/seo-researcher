-- Add auto_fetch_enabled column to sites table
ALTER TABLE sites ADD COLUMN auto_fetch_enabled BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN sites.auto_fetch_enabled IS 'Whether to automatically fetch rankings for this site on a weekly schedule';
