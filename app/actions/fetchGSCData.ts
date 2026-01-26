'use server';

import { createClient } from '@/lib/supabase/server';
import { GSCDataResponse } from '@/lib/types';

export async function fetchGSCData(
    siteUrl: string,
    days: number = 30
): Promise<GSCDataResponse> {
    try {
        const supabase = await createClient();

        // Get the current session
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return { error: '認証されていません。再度ログインしてください。' };
        }

        // Debug: Log session structure (without sensitive data)
        console.log('📋 セッション情報:', {
            hasSession: !!session,
            hasProviderToken: !!session.provider_token,
            hasProviderRefreshToken: !!session.provider_refresh_token,
            provider: session.user?.app_metadata?.provider,
            userId: session.user?.id,
        });

        // Check if provider_token exists
        const providerToken = session.provider_token;
        if (!providerToken) {
            console.error('❌ provider_token が見つかりません。OAuth連携が不完全です。');
            console.log('💡 対処法: 一度ログアウトして、再度Google連携を行ってください。');
            return {
                error: 'Google Search Consoleとの連携が必要です。連携ボタンをクリックしてください。',
            };
        }

        // Debug: Show partial token (first 20 chars only for security)
        console.log('✅ provider_token取得成功:', providerToken.substring(0, 20) + '...');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const formatDate = (date: Date) => {
            return date.toISOString().split('T')[0];
        };

        // Normalize siteUrl: GSC API is very picky. URL-prefix properties often need a trailing slash.
        // If it doesn't start with 'sc-domain:', try adding a trailing slash if it doesn't have one.
        let normalizedSiteUrl = siteUrl;
        if (!normalizedSiteUrl.startsWith('sc-domain:') && !normalizedSiteUrl.endsWith('/')) {
            normalizedSiteUrl = `${normalizedSiteUrl}/`;
        }

        console.log("🔍 検証用: DBのURL =", siteUrl);
        console.log("🔍 検証用: エンコード後のURL =", encodeURIComponent(siteUrl));
        console.log('Fetching GSC data for:', normalizedSiteUrl);

        // Call Google Search Console API
        const fetchData = async (url: string) => {
            return await fetch(
                `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
                    url
                )}/searchAnalytics/query`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${providerToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        startDate: formatDate(startDate),
                        endDate: formatDate(endDate),
                        dimensions: ['date'],
                    }),
                }
            );
        };

        let response = await fetchData(normalizedSiteUrl);

        // If 404 or 403, try without the trailing slash as a fallback
        if ((response.status === 404 || response.status === 403) && normalizedSiteUrl.endsWith('/')) {
            const fallbackUrl = normalizedSiteUrl.slice(0, -1);
            console.log('Retrying GSC data fetch with fallback URL:', fallbackUrl);
            const fallbackResponse = await fetchData(fallbackUrl);
            if (fallbackResponse.ok) {
                response = fallbackResponse;
            }
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ GSC API エラー発生');
            console.error('ステータスコード:', response.status);
            console.error('エラー詳細:', errorText);
            console.error('リクエストURL:', normalizedSiteUrl);

            if (response.status === 401) {
                return {
                    error: 'アクセストークンの有効期限が切れています。再度連携してください。',
                };
            } else if (response.status === 403) {
                return {
                    error: `Search Consoleへのアクセス権限がありません。Googleアカウントが ${normalizedSiteUrl} の所有権を持っているか確認してください。`,
                };
            } else if (response.status === 404) {
                return {
                    error: `サイト ${normalizedSiteUrl} がSearch Consoleで見つかりませんでした。`,
                };
            } else {
                return { error: `APIエラー: ${response.status}` };
            }
        }

        const data = await response.json();

        // Transform API response to our format
        const rows = data.rows?.map((row: any) => ({
            date: row.keys[0],
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
        })) || [];

        return { rows };
    } catch (error) {
        console.error('fetchGSCData error:', error);
        return {
            error: 'データの取得中にエラーが発生しました。もう一度お試しください。',
        };
    }
}
