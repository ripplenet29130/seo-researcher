import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChatworkToken, sendChatworkMessage, formatRankingMessage } from '@/lib/chatwork';
import { ChatworkSiteSettings } from '@/types/chatwork';

export const maxDuration = 300; // 5 minutes for Vercel Pro

export async function GET(request: NextRequest) {
    console.log('=== CRON JOB: Weekly Ranking Update Started ===');

    // Security: Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // ローカル開発: CRON_SECRETが未設定ならスルー
    if (cronSecret) {
        if (authHeader !== `Bearer ${cronSecret}`) {
            console.error('Unauthorized: Invalid CRON_SECRET');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    } else {
        console.warn('⚠️ CRON_SECRET not set - skipping auth check (development mode)');
    }

    const supabase = await createClient();
    const results = {
        success: true,
        sitesProcessed: 0,
        keywordsProcessed: 0,
        chatworkMessagesSent: 0,
        errors: [] as string[],
        startTime: new Date().toISOString(),
    };

    try {
        // 1. auto_fetch_enabled = true のサイトを取得
        const { data: sites, error: sitesError } = await supabase
            .from('sites')
            .select('id, site_name, site_url, fetch_frequency, fetch_time, fetch_day_of_week, fetch_day_of_month')
            .eq('auto_fetch_enabled', true);

        if (sitesError) {
            throw new Error(`Failed to fetch sites: ${sitesError.message}`);
        }

        if (!sites || sites.length === 0) {
            console.log('No sites with auto_fetch_enabled found');
            return NextResponse.json({
                ...results,
                message: 'No sites configured for auto-fetch',
            });
        }

        console.log(`Found ${sites.length} site(s) with auto-fetch enabled`);

        // 現在の日付情報をJSTベースで取得
        const now = new Date(); // UTC
        const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000); // 9時間進める

        const dayOfWeek = jstDate.getUTCDay(); // 0 (Sunday) - 6 (Saturday)
        const dayOfMonth = jstDate.getUTCDate(); // 1-31
        const currentHour = jstDate.getUTCHours(); // 0-23 (JSTでの時刻)

        console.log(`Current Time (JST): ${jstDate.toISOString()}, Hour: ${currentHour}, Day: ${dayOfWeek}, Date: ${dayOfMonth}`);

        // Chatwork API Token (Fetch once)
        const chatworkToken = await getChatworkToken();

        // 2. 各サイトのキーワードを取得して順位チェック
        for (const site of sites) {
            // 時間チェック: 設定された fetch_time と現在の時間が一致するか
            const targetHour = site.fetch_time ?? 9;

            if (targetHour !== currentHour) {
                const force = request.nextUrl.searchParams.get('force') === 'true';
                if (!force) {
                    // console.log(`  Skipping site ${site.site_name} (Time mismatch)`);
                    continue;
                }
            }

            // 頻度チェック: この日に実行すべきかどうか
            const frequency = site.fetch_frequency || 'weekly';
            let shouldFetch = false;

            if (frequency === 'daily') {
                shouldFetch = true;
            } else if (frequency === 'weekly') {
                const targetDayOfWeek = site.fetch_day_of_week ?? 1;
                shouldFetch = dayOfWeek === targetDayOfWeek;
            } else if (frequency === 'monthly') {
                const targetDayOfMonth = site.fetch_day_of_month ?? 1;
                shouldFetch = dayOfMonth === targetDayOfMonth;
            }

            if (!shouldFetch) {
                const force = request.nextUrl.searchParams.get('force') === 'true';
                if (!force) continue;
                console.log(`  FORCE EXECUTION: ${site.site_name}`);
            }

            console.log(`Processing site: ${site.site_name} (${site.id})`);

            try {
                // サイトのキーワード取得
                const { data: keywords, error: keywordsError } = await supabase
                    .from('keywords')
                    .select('id, keyword, device, location')
                    .eq('site_id', site.id);

                if (keywordsError) throw new Error(keywordsError.message);

                if (!keywords || keywords.length === 0) {
                    console.log(`  No keywords found for site ${site.site_name}`);
                    continue;
                }

                // 3. SerpApiで順位チェック（並列処理）
                // 順位保存用バッファ
                const currentRankings: { keyword: string; rank: number | null }[] = [];

                const rankingPromises = keywords.map(async (keyword) => {
                    try {
                        const serpApiKey = process.env.SERPAPI_API_KEY;
                        if (!serpApiKey) throw new Error('SERPAPI_API_KEY not configured');

                        const params = new URLSearchParams({
                            api_key: serpApiKey,
                            q: keyword.keyword,
                            device: keyword.device || 'desktop',
                            location: keyword.location || 'Japan',
                            gl: 'jp',
                            hl: 'ja',
                        });

                        const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
                        if (!response.ok) throw new Error(`SerpApi request failed: ${response.status}`);

                        const data = await response.json();
                        let rank = null;
                        const organicResults = data.organic_results || [];

                        for (let i = 0; i < organicResults.length; i++) {
                            const result = organicResults[i];
                            const resultUrl = result.link || '';
                            if (resultUrl.includes(site.site_url.replace(/^https?:\/\//, ''))) {
                                rank = i + 1;
                                break;
                            }
                        }

                        // Save to DB
                        await supabase.from('rankings').insert({
                            keyword_id: keyword.id,
                            rank: rank,
                            checked_at: new Date().toISOString(),
                        });

                        // Buffer for Chatwork report
                        currentRankings.push({ keyword: keyword.keyword, rank });
                        results.keywordsProcessed++;

                    } catch (error: any) {
                        const errorMsg = `Failed to process keyword ${keyword.keyword}: ${error.message}`;
                        console.error(`    ❌ ${errorMsg}`);
                        results.errors.push(errorMsg);
                        currentRankings.push({ keyword: keyword.keyword, rank: null });
                    }
                });

                await Promise.all(rankingPromises);
                results.sitesProcessed++;

                // --- Chatwork Reporting Logic ---
                if (chatworkToken && currentRankings.length > 0) {
                    try {
                        // Fetch Chatwork settings for this site
                        const { data: cwSettings } = await supabase
                            .from('chatwork_site_settings')
                            .select('*')
                            .eq('site_id', site.id)
                            .single();

                        const settings = cwSettings as ChatworkSiteSettings | null;

                        if (settings && settings.room_id) {
                            // Check Timing
                            const force = request.nextUrl.searchParams.get('force') === 'true';
                            let shouldReport = false;

                            // Check time (Assuming cron runs hourly, match the hour)
                            // Using the same 'currentHour' (JST)
                            if (settings.report_time === currentHour || force) {
                                if (settings.report_frequency === 'weekly') {
                                    if (settings.report_day_of_week === dayOfWeek || force) shouldReport = true;
                                } else if (settings.report_frequency === 'monthly') {
                                    if (settings.report_day_of_month === dayOfMonth || force) shouldReport = true;
                                }
                            }

                            if (shouldReport) {
                                console.log(`  Sending Chatwork report for ${site.site_name} to Room ${settings.room_id}`);

                                const periodStr = settings.report_frequency === 'weekly' ? '週間レポート' : '月間レポート';
                                const messageBody = formatRankingMessage(
                                    settings.message_template,
                                    site.site_name,
                                    periodStr,
                                    currentRankings
                                );

                                const sent = await sendChatworkMessage(chatworkToken, settings.room_id, messageBody);
                                if (sent) {
                                    results.chatworkMessagesSent++;
                                    // Update last_report_at
                                    await supabase
                                        .from('chatwork_site_settings')
                                        .update({ last_report_at: new Date().toISOString() })
                                        .eq('id', settings.id);
                                }
                            }
                        }
                    } catch (cwError) {
                        console.error(`  Failed to process Chatwork reporting for ${site.site_name}:`, cwError);
                    }
                }
                // --- End Chatwork Logic ---

            } catch (error: any) {
                const errorMsg = `Failed to process site ${site.site_name}: ${error.message}`;
                console.error(`  ❌ ${errorMsg}`);
                results.errors.push(errorMsg);
            }
        }

        results.success = results.errors.length === 0;
        console.log('=== CRON JOB: Completed ===');
        return NextResponse.json({
            ...results,
            endTime: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('=== CRON JOB: Failed ===');
        console.error(error);
        return NextResponse.json({
            ...results,
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}
