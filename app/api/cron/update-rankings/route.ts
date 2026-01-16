import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
        // Vercel(UTC)環境でもJST(UTC+9)として日付・時刻を判定する
        const now = new Date(); // UTC
        const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000); // 9時間進める

        const dayOfWeek = jstDate.getUTCDay(); // 0 (Sunday) - 6 (Saturday)
        const dayOfMonth = jstDate.getUTCDate(); // 1-31
        const currentHour = jstDate.getUTCHours(); // 0-23 (JSTでの時刻)

        console.log(`Current Time (JST): ${jstDate.toISOString()}, Hour: ${currentHour}, Day: ${dayOfWeek}, Date: ${dayOfMonth}`);

        // 2. 各サイトのキーワードを取得して順位チェック
        for (const site of sites) {
            // 時間チェック: 設定された fetch_time と現在の時間が一致するか
            // 設定がない場合はデフォルト9時
            const targetHour = site.fetch_time ?? 9;

            if (targetHour !== currentHour) {
                // 開発環境デバッグ用: もしクエリパラメータ ?force=true があれば時間無視
                const force = request.nextUrl.searchParams.get('force') === 'true';
                if (!force) {
                    console.log(`  Skipping site ${site.site_name} (Time mismatch: Config ${targetHour}:00 vs Current ${currentHour}:00)`);
                    continue;
                }
            }

            // 頻度チェック: この日に実行すべきかどうか
            const frequency = site.fetch_frequency || 'weekly';
            let shouldFetch = false;

            if (frequency === 'daily') {
                shouldFetch = true;
            } else if (frequency === 'weekly') {
                // 設定された曜日のみ実行
                const targetDayOfWeek = site.fetch_day_of_week ?? 1; // デフォルト月曜
                shouldFetch = dayOfWeek === targetDayOfWeek;

                if (!shouldFetch && !request.nextUrl.searchParams.get('force')) {
                    console.log(`  Skipping site ${site.site_name} (Weekly: Config Day ${targetDayOfWeek} vs Current Day ${dayOfWeek})`);
                }
            } else if (frequency === 'monthly') {
                // 設定された日付のみ実行
                const targetDayOfMonth = site.fetch_day_of_month ?? 1; // デフォルト1日
                shouldFetch = dayOfMonth === targetDayOfMonth;

                if (!shouldFetch && !request.nextUrl.searchParams.get('force')) {
                    console.log(`  Skipping site ${site.site_name} (Monthly: Config Date ${targetDayOfMonth} vs Current Date ${dayOfMonth})`);
                }
            }

            if (!shouldFetch) {
                // forceパラメータがある場合は強制実行
                const force = request.nextUrl.searchParams.get('force') === 'true';
                if (!force) {
                    continue;
                }
                console.log(`  FORCE EXECUTION: ${site.site_name}`);
            }

            console.log(`Processing site: ${site.site_name} (${site.id}), frequency: ${frequency}, time: ${targetHour}:00`);

            try {
                // サイトのキーワード取得
                const { data: keywords, error: keywordsError } = await supabase
                    .from('keywords')
                    .select('id, keyword, device, location')
                    .eq('site_id', site.id);

                if (keywordsError) {
                    throw new Error(`Failed to fetch keywords for site ${site.id}: ${keywordsError.message}`);
                }

                if (!keywords || keywords.length === 0) {
                    console.log(`  No keywords found for site ${site.site_name}`);
                    continue;
                }

                console.log(`  Found ${keywords.length} keyword(s) for ${site.site_name}`);

                // 3. SerpApiで順位チェック（並列処理）
                const rankingPromises = keywords.map(async (keyword) => {
                    try {
                        console.log(`    Fetching rank for: ${keyword.keyword}`);

                        // SerpApi呼び出し
                        const serpApiKey = process.env.SERPAPI_API_KEY;
                        if (!serpApiKey) {
                            throw new Error('SERPAPI_API_KEY not configured');
                        }

                        const params = new URLSearchParams({
                            api_key: serpApiKey,
                            q: keyword.keyword,
                            device: keyword.device || 'desktop',
                            location: keyword.location || 'Japan',
                            gl: 'jp',
                            hl: 'ja',
                        });

                        const response = await fetch(`https://serpapi.com/search?${params.toString()}`);

                        if (!response.ok) {
                            throw new Error(`SerpApi request failed: ${response.status}`);
                        }

                        const data = await response.json();

                        // 順位を検索
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

                        // Rankingsテーブルに保存
                        const { error: insertError } = await supabase
                            .from('rankings')
                            .insert({
                                keyword_id: keyword.id,
                                rank: rank,
                                checked_at: new Date().toISOString(),
                            });

                        if (insertError) {
                            throw new Error(`Failed to save ranking: ${insertError.message}`);
                        }

                        console.log(`    ✅ Saved rank for ${keyword.keyword}: ${rank || '圏外'}`);
                        results.keywordsProcessed++;

                    } catch (error: any) {
                        const errorMsg = `Failed to process keyword ${keyword.keyword}: ${error.message}`;
                        console.error(`    ❌ ${errorMsg}`);
                        results.errors.push(errorMsg);
                    }
                });

                // 並列実行（タイムアウト対策）
                await Promise.all(rankingPromises);
                results.sitesProcessed++;

            } catch (error: any) {
                const errorMsg = `Failed to process site ${site.site_name}: ${error.message}`;
                console.error(`  ❌ ${errorMsg}`);
                results.errors.push(errorMsg);
            }
        }

        results.success = results.errors.length === 0;
        console.log('=== CRON JOB: Completed ===');
        console.log(`Sites processed: ${results.sitesProcessed}/${sites.length}`);
        console.log(`Keywords processed: ${results.keywordsProcessed}`);
        console.log(`Errors: ${results.errors.length}`);

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
