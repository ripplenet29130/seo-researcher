-- Add fetch_frequency column to sites table
ALTER TABLE sites ADD COLUMN fetch_frequency TEXT DEFAULT 'weekly' CHECK (fetch_frequency IN ('daily', 'weekly', 'monthly'));

-- Add comment for documentation
COMMENT ON COLUMN sites.fetch_frequency IS 'Frequency of automated ranking fetch: daily, weekly, or monthly';
