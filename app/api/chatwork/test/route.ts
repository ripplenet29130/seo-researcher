import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendChatworkMessage, formatRankingMessage } from '@/lib/chatwork';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, roomId, siteId, template, reportPeriod, mentionId, mentionName } = body;

        if (!token || !roomId) {
            return NextResponse.json(
                { error: 'Token and Room ID are required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        let siteName = 'テストサイト';
        let periodStr = 'テスト期間';
        let rankingsData: { keyword: string; rank: number | null; prevRank?: number | null; checkDate?: string; device?: string }[] = [];

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
                .select('id, keyword, device')
                .eq('site_id', siteId);

            if (keywords && keywords.length > 0) {
                for (const keyword of keywords) {
                    // Get latest ranking
                    const { data: latestRank } = await supabase
                        .from('rankings')
                        .select('rank, checked_at')
                        .eq('keyword_id', keyword.id)
                        .order('checked_at', { ascending: false })
                        .limit(1)
                        .single();

                    // Get comparison ranking based on reportPeriod
                    let prevRankVal = null;
                    if (latestRank && reportPeriod) {
                        const targetDate = new Date();
                        targetDate.setDate(targetDate.getDate() - reportPeriod);
                        // Find ranking closest to targetDate (e.g., 7 days ago)
                        // Simple logic: find first record checked <= targetDate (comparison point)
                        // Ideally we want the record CLOSEST to targetDate.
                        // Let's look for records created before the targetDate + 1 day
                        const targetEndDate = new Date(targetDate);
                        targetEndDate.setDate(targetEndDate.getDate() + 1);

                        const { data: pastRank } = await supabase
                            .from('rankings')
                            .select('rank')
                            .eq('keyword_id', keyword.id)
                            .lte('checked_at', targetEndDate.toISOString())
                            .order('checked_at', { ascending: false }) // Get the latest one ON or BEFORE target date
                            .limit(1)
                            .single();

                        if (pastRank) {
                            prevRankVal = pastRank.rank;
                        }
                    }

                    const checkDateStr = latestRank?.checked_at
                        ? (() => {
                            const d = new Date(latestRank.checked_at);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        })()
                        : undefined;

                    rankingsData.push({
                        keyword: keyword.keyword,
                        rank: latestRank ? latestRank.rank : null,
                        prevRank: prevRankVal,
                        checkDate: checkDateStr,
                        device: keyword.device || 'desktop'
                    });
                }
            } else {
                // If no keywords, add a dummy one to show format
                rankingsData.push({ keyword: 'サンプルキーワード', rank: 5, prevRank: 10, checkDate: '1/1', device: 'desktop' });
            }
        } else {
            // Fallback if no siteId (old behavior)
            rankingsData.push({ keyword: 'サンプルキーワード', rank: 1, prevRank: 2, checkDate: '1/1', device: 'mobile' });
        }



        // Create mention tag
        let mentionTag = mentionId ? `[To:${mentionId}]` : '[toall]';
        if (mentionId && mentionName) {
            mentionTag += ` ${mentionName}`;
        }

        let formattedMessage = formatRankingMessage(
            template.replace('{mention}', ''),
            siteName,
            periodStr,
            rankingsData,
            ''
        );

        // Remove any [info] or [title] tags that might be in the user's template
        formattedMessage = formattedMessage
            .replace(/\[info\]/g, '')
            .replace(/\[\/info\]/g, '')
            .replace(/\[title\]/g, '')
            .replace(/\[\/title\]/g, '');

        // Simple format without [info] box
        const message = `${mentionTag}\n※これはSEO Researcherからのテスト配信です。\n\n${formattedMessage.trim()}`;

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
