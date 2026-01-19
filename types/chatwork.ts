export type ReportFrequency = 'weekly' | 'monthly';

export interface ChatworkSiteSettings {
    id: string;
    site_id: string;
    room_id: string;
    report_frequency: ReportFrequency;
    report_time: number; // 0-23
    report_day_of_week: number; // 0-6 (0 is Sunday)
    report_day_of_month: number; // 1-31
    report_period: number; // 7, 30, or 90 days
    message_template: string;
    last_report_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface AppSettings {
    key: string;
    value: string;
    description: string | null;
    updated_at: string;
}

export const DEFAULT_MESSAGE_TEMPLATE = `【SEO順位報告】
サイト: {site_name}
期間: {period}

{rankings}`;
