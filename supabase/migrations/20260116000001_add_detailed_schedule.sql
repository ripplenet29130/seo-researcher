-- Add fetch_day_of_week and fetch_day_of_month columns to sites table
ALTER TABLE sites ADD COLUMN fetch_day_of_week INTEGER DEFAULT 1; -- 0 (Sun) - 6 (Sat), default Monday
ALTER TABLE sites ADD COLUMN fetch_day_of_month INTEGER DEFAULT 1; -- 1 - 31, default 1st
