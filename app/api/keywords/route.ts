import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();
    const json = await request.json();
    const { site_id, keywords, location = 'Japan', device = 'desktop' } = json;

    if (!site_id || !keywords || !Array.isArray(keywords)) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Filter out empty lines
    const validKeywords = keywords
        .map((k: string) => k.trim())
        .filter((k: string) => k !== '');

    if (validKeywords.length === 0) {
        return NextResponse.json({ error: 'No valid keywords provided' }, { status: 400 });
    }

    // Create payload based on device type
    let payload: any[] = [];

    if (device === 'both') {
        // Create both desktop and mobile records for each keyword
        validKeywords.forEach((keyword: string) => {
            payload.push({
                site_id,
                keyword,
                location,
                device: 'desktop',
            });
            payload.push({
                site_id,
                keyword,
                location,
                device: 'mobile',
            });
        });
    } else {
        // Create single record per keyword with specified device
        payload = validKeywords.map((keyword: string) => ({
            site_id,
            keyword,
            location,
            device,
        }));
    }

    const { data, error } = await supabase
        .from('keywords')
        .insert(payload)
        .select();

    if (error) {
        console.error('Error inserting keywords:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count: data.length });
}
