export type Site = {
  id: string;
  site_name: string;
  site_url: string;
  auto_fetch_enabled?: boolean;
  fetch_frequency?: 'daily' | 'weekly' | 'monthly';
  fetch_time?: number; // 0-23 (JST)
  fetch_day_of_week?: number; // 0-6 (Sun-Sat)
  fetch_day_of_month?: number; // 1-31
  created_at: string;
  updated_at: string;
};

export type Keyword = {
  id: string;
  site_id: string;
  keyword: string;
  location: string | null;
  device: 'desktop' | 'mobile' | null;
  created_at: string;
};

export type Ranking = {
  id: string;
  keyword_id: string;
  rank: number | null;
  url: string | null;
  checked_at: string;
  created_at: string;
};

export type KeywordWithRanking = Keyword & {
  latest_rank: number | null;
  latest_checked_at: string | null;
  rankings?: Ranking[];
};

export type GSCDataRow = {
  date: string;
  clicks: number;
  impressions: number;
};

export type GSCDataResponse = {
  rows?: GSCDataRow[];
  error?: string;
};
