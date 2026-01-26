'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export function ConnectGscButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const supabase = createClient();

            const currentPath = window.location.pathname;
            const callbackUrl = `${window.location.origin}/auth/callback?redirect_to=${encodeURIComponent(currentPath)}`;

            console.log('🔗 Google Search Console連携を開始...');
            console.log('📍 現在のURL:', window.location.href);
            console.log('🔙 コールバックURL:', callbackUrl);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    scopes: 'https://www.googleapis.com/auth/webmasters.readonly',
                    redirectTo: callbackUrl,
                },
            });

            if (error) {
                console.error('❌ OAuth認証エラー:', error);
                alert('Google認証に失敗しました。もう一度お試しください。');
            } else {
                console.log('✅ OAuth認証リクエスト成功');
                console.log('認証URL:', data.url);
                console.log('💡 Googleの承認画面で「確認済みサイトの Search Console データの表示」権限を許可してください');
            }
        } catch (error) {
            console.error('❌ 接続エラー:', error);
            alert('エラーが発生しました。もう一度お試しください。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full sm:w-auto"
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? '接続中...' : 'Google Search Consoleと連携'}
        </Button>
    );
}
