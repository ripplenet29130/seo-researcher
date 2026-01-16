import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keywordId = searchParams.get('keyword_id');

    if (!keywordId) {
        return NextResponse.json({ error: 'Missing keyword_id' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('keyword_id', keywordId)
        .order('checked_at', { ascending: true }); // Chronological order for charts

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
