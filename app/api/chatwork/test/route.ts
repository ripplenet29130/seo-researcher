import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendChatworkMessage, formatRankingMessage } from '@/lib/chatwork';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, roomId, siteId, template, reportPeriod, mentionId } = body;

        if (!token || !roomId) {
            return NextResponse.json(
                { error: 'Token and Room ID are required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        let siteName = 'テストサイト';
        let periodStr = 'テスト期間';
        let rankingsData: { keyword: string; rank: number | null; prevRank?: number | null }[] = [];

        if (siteId) {
            // Fetch validation and real data if siteId is provided
            const { data: site } = await supabase
                .from('sites')
                .select('site_name')
                .eq('id', siteId)
                .single();

            if (site) {
                siteName = site.site_name;
            }

            // Calculate Period String
            const now = new Date();
            const pastDate = new Date();
            pastDate.setDate(now.getDate() - (reportPeriod || 7));
            const formatDate = (d: Date) => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
            periodStr = `${formatDate(pastDate)} - ${formatDate(now)}`;

            // Fetch Keywords and Latest Rankings
            const { data: keywords } = await supabase
                .from('keywords')
                .select('id, keyword')
                .eq('site_id', siteId);

            if (keywords && keywords.length > 0) {
                for (const keyword of keywords) {
                    // Get latest ranking
                    const { data: latestRank } = await supabase
                        .from('rankings')
                        .select('rank')
                        .eq('keyword_id', keyword.id)
                        .order('checked_at', { ascending: false })
                        .limit(1)
                        .single();

                    // Optional: Get previous ranking (simplistic approach: just getting the latest one for now to ensure speed)
                    // Improvements could be made to fetch rank closest to 'pastDate'

                    rankingsData.push({
                        keyword: keyword.keyword,
                        rank: latestRank ? latestRank.rank : null
                    });
                }
            } else {
                // If no keywords, add a dummy one to show format
                rankingsData.push({ keyword: 'サンプルキーワード', rank: 5 });
            }
        } else {
            // Fallback if no siteId (old behavior)
            rankingsData.push({ keyword: 'サンプルキーワード', rank: 1 });
        }

        // Create mention tag separately to place it outside [info] for better rendering
        const mentionTag = mentionId ? `[to:${mentionId}]` : '[toall]';

        const formattedMessage = formatRankingMessage(
            template.replace('{mention}', ''), // Remove {mention} from template since we'll prepend it
            siteName,
            periodStr,
            rankingsData,
            '' // Pass empty string to avoid adding another mention via formatRankingMessage
        );

        const message = `${mentionTag}\n[info][title]テスト送信[/title]※これはSEO Researcherからのテスト配信です。\n\n${formattedMessage.trim()}[/info]`;

        const result = await sendChatworkMessage(token, roomId, message);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: result.error || 'Failed to send message to Chatwork' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in chatwork test:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
