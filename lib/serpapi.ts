import { getJson } from 'serpapi';

const API_KEY = process.env.SERPAPI_API_KEY;

export async function fetchRanking(
    keyword: string,
    targetUrl: string,
    location: string = 'Japan',
    device: 'desktop' | 'mobile' = 'desktop'
): Promise<{ rank: number | null; url: string | null }> {
    return new Promise((resolve, reject) => {
        if (!API_KEY) {
            reject(new Error('SerpApi API Key is missing'));
            return;
        }

        getJson(
            {
                engine: 'google',
                q: keyword,
                location: location,
                device: device,
                api_key: API_KEY,
                num: 100,
                hl: 'ja',
                gl: 'jp',
            },
            (json: any) => {
                if (!json || json.error) {
                    reject(new Error(json?.error || 'SerpApi error'));
                    return;
                }

                const organicResults = json.organic_results || [];
                let rank = null;
                let foundUrl = null;

                // Simple check: does the result URL include the target URL (hostname)?
                // The targetUrl passed here should ideally be the hostname or a unique part of the URL.
                for (const result of organicResults) {
                    if (result.link && result.link.includes(targetUrl)) {
                        rank = result.position;
                        foundUrl = result.link;
                        break;
                    }
                }

                resolve({ rank, url: foundUrl });
            }
        );
    });
}
