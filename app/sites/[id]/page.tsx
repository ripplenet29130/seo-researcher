import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { SiteDetailClient } from '@/components/site-detail/SiteDetailClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Site, KeywordWithRanking } from '@/lib/types';
import { SearchConsoleChart } from '@/components/SearchConsoleChart';
import { ConnectGscButton } from '@/components/ConnectGscButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function SiteDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Site Details
    const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('id', id)
        .single();

    if (siteError || !site) {
        notFound();
    }

    // Fetch Keywords with latest rankings
    const { data: keywords, error: keywordError } = await supabase
        .from('keywords')
        .select(`
            *,
            rankings (
                rank,
                checked_at
            )
        `)
        .eq('site_id', id)
        .order('created_at', { ascending: false });

    // Process keywords to include latest ranking
    const keywordsWithRankings = keywords?.map((kw: any) => {
        const latestRanking = kw.rankings?.sort((a: any, b: any) =>
            new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime()
        )[0];

        return {
            ...kw,
            latest_rank: latestRanking?.rank || null,
            latest_checked_at: latestRanking?.checked_at || null,
        };
    }) || [];

    const typedSite = site as Site;
    const typedKeywords = keywordsWithRankings as KeywordWithRanking[];

    // Get session to check for provider_token
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const hasGscAccess = !!session?.provider_token;

    return (
        <div className="max-w-7xl mx-auto py-10 px-8">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" />ダッシュボードに戻る
                    </Button>
                </Link>
            </div>

            <SiteDetailClient site={typedSite} keywords={typedKeywords} />

            {/* Google Search Console Section */}
            <div className="mt-8">
                {hasGscAccess ? (
                    <SearchConsoleChart siteUrl={typedSite.site_url} days={30} />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Google Search Console</CardTitle>
                            <CardDescription>
                                Search Consoleと連携して、検索パフォーマンスデータを表示します
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ConnectGscButton />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
