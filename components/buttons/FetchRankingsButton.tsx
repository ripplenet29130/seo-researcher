'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function FetchRankingsButton({
    siteId,
    selectedKeywordIds
}: {
    siteId: string;
    selectedKeywordIds: string[];
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleFetch = async () => {
        if (selectedKeywordIds.length === 0) {
            toast({
                title: "選択エラー",
                description: (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>順位を取得するには、少なくとも1つのキーワードを選択してください</span>
                    </div>
                ),
                duration: 4000,
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/rankings/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    site_id: siteId,
                    keyword_ids: selectedKeywordIds
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to fetch rankings');
            }

            const data = await res.json();
            toast({
                title: "成功",
                description: (
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{data.total}個のキーワードの順位を取得しました</span>
                    </div>
                ),
                duration: 3000,
                variant: 'success',
            });
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "取得エラー",
                description: (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error.message || '順位の取得に失敗しました'}</span>
                    </div>
                ),
                duration: 4000,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleFetch}
            disabled={loading || selectedKeywordIds.length === 0}
            variant="default"
            size="sm"
            className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    取得中...
                </>
            ) : (
                <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    チェックしたキーワードの順位を取得 ({selectedKeywordIds.length})
                </>
            )}
        </Button>
    );
}
