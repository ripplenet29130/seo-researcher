import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getJson } from 'serpapi';

export async function POST(request: Request) {
    const supabase = await createClient();
    const json = await request.json();
    const { site_id, keyword_ids } = json;

    if (!site_id) {
        return NextResponse.json({ error: 'site_id is required' }, { status: 400 });
    }

    try {
        // Fetch site details
        const { data: site, error: siteError } = await supabase
            .from('sites')
            .select('site_url')
            .eq('id', site_id)
            .single();

        if (siteError || !site) {
            return NextResponse.json({ error: 'Site not found' }, { status: 404 });
        }

        // Fetch keywords - filter by IDs if provided
        let keywordsQuery = supabase
            .from('keywords')
            .select('*')
            .eq('site_id', site_id);

        if (keyword_ids && Array.isArray(keyword_ids) && keyword_ids.length > 0) {
            keywordsQuery = keywordsQuery.in('id', keyword_ids);
        }

        const { data: keywords, error: keywordsError } = await keywordsQuery;

        if (keywordsError || !keywords || keywords.length === 0) {
            return NextResponse.json({ error: 'No keywords found' }, { status: 404 });
        }

        const results = [];
        const today = new Date().toISOString().split('T')[0];

        // Loop through each keyword and fetch ranking
        for (const keyword of keywords) {
            try {
                const response = await getJson({
                    engine: 'google',
                    q: keyword.keyword,
                    location: keyword.location || 'Japan',
                    hl: 'ja',
                    gl: 'jp',
                    num: 100,
                    device: keyword.device || 'desktop',
                    api_key: process.env.SERPAPI_API_KEY,
                });

                // Find the rank for our site in organic results
                let rank: number | null = null;
                let resultUrl: string | null = null;

                if (response.organic_results) {
                    const siteUrlClean = site.site_url.replace(/^https?:\/\//, '').replace(/\/$/, '');

                    for (let i = 0; i < response.organic_results.length; i++) {
                        const result = response.organic_results[i];
                        const resultDomain = result.link?.replace(/^https?:\/\//, '').split('/')[0];

                        if (resultDomain?.includes(siteUrlClean) || siteUrlClean?.includes(resultDomain)) {
                            rank = i + 1;
                            resultUrl = result.link;
                            break;
                        }
                    }
                }

                // Save to database
                const { error: insertError } = await supabase.from('rankings').insert({
                    keyword_id: keyword.id,
                    rank,
                    url: resultUrl,
                    checked_at: today,
                });

                if (insertError) {
                    console.error('Error inserting ranking:', insertError);
                } else {
                    results.push({
                        keyword: keyword.keyword,
                        rank,
                        found: rank !== null,
                    });
                }
            } catch (error) {
                console.error(`Error fetching ranking for "${keyword.keyword}":`, error);
                results.push({
                    keyword: keyword.keyword,
                    rank: null,
                    found: false,
                    error: 'Failed to fetch',
                });
            }
        }

        return NextResponse.json({
            success: true,
            total: keywords.length,
            results,
            checked_at: today,
        });
    } catch (error) {
        console.error('Error in rankings fetch:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
