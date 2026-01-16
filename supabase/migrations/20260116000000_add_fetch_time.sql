-- Add fetch_time column to sites table with default value 9 (09:00)
ALTER TABLE sites ADD COLUMN fetch_time INTEGER DEFAULT 9;
