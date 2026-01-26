import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    console.log('🔄 OAuth コールバック処理を開始');
    console.log('📍 リクエストURL:', requestUrl.href);
    console.log('🔑 認証コード:', code ? '取得成功' : 'なし');

    if (code) {
        const supabase = await createClient();

        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        console.log('🔄 セッション交換結果:', {
            success: !error,
            hasSession: !!data.session,
            hasProviderToken: !!data.session?.provider_token,
            hasProviderRefreshToken: !!data.session?.provider_refresh_token,
        });

        if (error) {
            console.error('❌ コード交換エラー:', error);
            return NextResponse.redirect(`${origin}?error=auth_failed`);
        }

        if (data.session?.provider_token) {
            console.log('✅ provider_token 取得成功');
            console.log('🔄 セッションを更新してリダイレクト');
        } else {
            console.warn('⚠️ provider_token が取得できませんでした');
        }
    }

    // Redirect to the original page
    const redirectTo = requestUrl.searchParams.get('redirect_to') || '/';
    console.log('🔙 リダイレクト先:', redirectTo);

    return NextResponse.redirect(`${origin}${redirectTo}`);
}
