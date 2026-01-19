import { NextRequest, NextResponse } from 'next/server';
import { sendChatworkMessage } from '@/lib/chatwork';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, roomId } = body;

        if (!token || !roomId) {
            return NextResponse.json(
                { error: 'Token and Room ID are required' },
                { status: 400 }
            );
        }

        const message = `[info][title]テスト送信[/title]SEO Researcherからのテストメッセージです。\nこのメッセージが見えていれば連携成功です！[/info]`;
        const success = await sendChatworkMessage(token, roomId, message);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: 'Failed to send message to Chatwork' },
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
