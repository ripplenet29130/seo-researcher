import { NextResponse } from 'next/server';
import { getJson } from 'serpapi';

export async function POST(request: Request) {
    const json = await request.json();
    const { url, keywords, location = 'Japan', device = 'desktop' } = json;

    if (!url || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return NextResponse.json({ error: 'URL and at least one keyword are required' }, { status: 400 });
    }

    if (!process.env.SERPAPI_API_KEY) {
        return NextResponse.json({ error: 'SerpApi API Key is missing' }, { status: 500 });
    }

    try {
        const results = [];
        const siteUrlClean = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

        // To avoid timing out and for better UX, we could handle multiple keywords concurrently,
        // but for now, we'll keep it simple and process them sequentially to avoid rate limits
        // or we can use Promise.all if the array is small.

        const fetchPromises = keywords.map(async (keyword: string) => {
            try {
                const response = await getJson({
                    engine: 'google',
                    q: keyword,
                    location: location,
                    hl: 'ja',
                    gl: 'jp',
                    num: 100,
                    device: device,
                    api_key: process.env.SERPAPI_API_KEY,
                });

                let rank: number | null = null;
                let foundUrl: string | null = null;

                if (response.organic_results) {
                    for (let i = 0; i < response.organic_results.length; i++) {
                        const result = response.organic_results[i];
                        const resultDomain = result.link?.replace(/^https?:\/\//, '').split('/')[0];

                        if (resultDomain?.includes(siteUrlClean) || siteUrlClean?.includes(resultDomain)) {
                            rank = i + 1;
                            foundUrl = result.link;
                            break;
                        }
                    }
                }

                return {
                    keyword,
                    rank,
                    url: foundUrl,
                    success: true
                };
            } catch (error) {
                console.error(`Error fetching ranking for "${keyword}":`, error);
                return {
                    keyword,
                    rank: null,
                    url: null,
                    success: false,
                    error: 'Failed to fetch'
                };
            }
        });

        const settledResults = await Promise.all(fetchPromises);

        return NextResponse.json({
            success: true,
            results: settledResults,
        });
    } catch (error) {
        console.error('Error in quick-check API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
