'use client';

import { useState } from 'react';
import { Site, KeywordWithRanking } from '@/lib/types';
import { KeywordRegisterDialog } from '@/components/forms/KeywordRegisterDialog';
import { KeywordTable } from '@/components/tables/KeywordTable';
import { FetchRankingsButton } from '@/components/buttons/FetchRankingsButton';
import { RankingChart } from '@/components/site-detail/RankingChart';
import { AutoFetchSettings } from '@/components/site-detail/AutoFetchSettings';

export function SiteDetailClient({
    site,
    keywords
}: {
    site: Site;
    keywords: KeywordWithRanking[];
}) {
    const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);
    const [selectedChartKeywordId, setSelectedChartKeywordId] = useState<string | null>(
        keywords.length > 0 ? keywords[0].id : null
    );

    // Determine which keywords to show in the chart
    // 1. If checkboxes are selected, show all selected keywords (Comparison Mode)
    // 2. If no checkboxes, show the currently clicked/focused keyword (Single Mode)
    const chartKeywords = selectedKeywordIds.length > 0
        ? keywords.filter(k => selectedKeywordIds.includes(k.id))
        : (selectedChartKeywordId
            ? [keywords.find(k => k.id === selectedChartKeywordId)].filter((k): k is KeywordWithRanking => !!k)
            : (keywords.length > 0 ? [keywords[0]] : []));

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{site.site_name}</h1>
                    <p className="text-muted-foreground text-lg">{site.site_url}</p>
                </div>
                <div className="flex gap-2">
                    <KeywordRegisterDialog siteId={site.id} />
                    <FetchRankingsButton
                        siteId={site.id}
                        selectedKeywordIds={selectedKeywordIds}
                    />
                </div>
            </div>

            <div className="grid gap-6">
                <section>
                    <AutoFetchSettings
                        siteId={site.id}
                        initialEnabled={site.auto_fetch_enabled || false}
                        initialFrequency={site.fetch_frequency || 'weekly'}
                        initialFetchTime={site.fetch_time}
                        initialFetchDayOfWeek={site.fetch_day_of_week}
                        initialFetchDayOfMonth={site.fetch_day_of_month}
                    />
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Rankings & Keywords</h2>
                    </div>
                    <KeywordTable
                        siteId={site.id}
                        keywords={keywords}
                        selectedKeywords={selectedKeywordIds}
                        onSelectionChange={setSelectedKeywordIds}
                        onKeywordClick={(kw) => setSelectedChartKeywordId(kw.id)}
                        onDeleteSuccess={() => setSelectedKeywordIds([])}
                    />
                </section>

                {chartKeywords.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Ranking Trend</h2>
                        </div>
                        <RankingChart keywords={chartKeywords} />
                    </section>
                )}
            </div>
        </>
    );
}
