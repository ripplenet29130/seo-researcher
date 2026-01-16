-- Create sites table
CREATE TABLE sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL,
  site_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create keywords table
CREATE TABLE keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL,
  location VARCHAR(100),
  device VARCHAR(20) CHECK (device IN ('desktop', 'mobile')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rankings table
CREATE TABLE rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
  rank INTEGER, -- 1-100, NULL if out of rank
  url TEXT,
  checked_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_keywords_site_id ON keywords(site_id);
CREATE INDEX idx_rankings_keyword_id ON rankings(keyword_id);
CREATE INDEX idx_rankings_checked_at ON rankings(checked_at);

-- RLS Policies (Allow all for development)
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to sites" ON sites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to keywords" ON keywords FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to rankings" ON rankings FOR ALL USING (true) WITH CHECK (true);
