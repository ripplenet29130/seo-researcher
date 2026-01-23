import { createClient } from '@/lib/supabase/server';
import { ChatworkSiteSettings, DEFAULT_MESSAGE_TEMPLATE } from '@/types/chatwork';

const CHATWORK_API_TOKEN_KEY = 'chatwork_api_token';

export async function getChatworkToken(): Promise<string | null> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', CHATWORK_API_TOKEN_KEY)
        .single();

    return data?.value || null;
}

export async function setChatworkToken(token: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
        .from('app_settings')
        .upsert({
            key: CHATWORK_API_TOKEN_KEY,
            value: token,
            description: 'Chatwork API Token'
        });

    if (error) throw error;
}

export async function sendChatworkMessage(token: string, roomId: string, body: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`https://api.chatwork.com/v2/rooms/${roomId}/messages`, {
            method: 'POST',
            headers: {
                'X-ChatWorkToken': token,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ body }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Chatwork API Error: ${response.status} ${response.statusText}`, errorText);

            // Try to parse JSON error response from Chatwork
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.errors && errorJson.errors.length > 0) {
                    return { success: false, error: errorJson.errors.join(', ') };
                }
            } catch (e) {
                // Ignore JSON parse error
            }

            return { success: false, error: `API Error: ${response.status} ${response.statusText}` };
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to send Chatwork message:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
}

export function formatRankingMessage(
    template: string,
    siteName: string,
    period: string,
    rankings: { keyword: string; rank: number | null; prevRank?: number | null; checkDate?: string; device?: string }[],
    mentionId?: string | null
): string {
    let message = template || DEFAULT_MESSAGE_TEMPLATE;

    const rankingLines = rankings.map(r => {
        const datePrefix = r.checkDate ? `${r.checkDate} ` : '- ';
        // Determine device icon: 'mobile' -> 📱, otherwise (desktop) -> 💻
        const deviceIcon = r.device === 'mobile' ? '📱' : '💻';

        const rankText = r.rank ? `${r.rank}位` : '圏外';
        const prevText = r.prevRank ? ` (前: ${r.prevRank}位)` : '';
        return `${datePrefix}${deviceIcon} "${r.keyword}": ${rankText}${prevText}`;
    }).join('\n');

    // Handle Mention
    const mentionTag = mentionId ? `[To:${mentionId}]` : '[toall]';

    message = message.replace('{mention}', mentionTag);
    message = message.replace('{site_name}', siteName);
    message = message.replace('{period}', period);
    message = message.replace('{rankings}', rankingLines);

    return message;
}
