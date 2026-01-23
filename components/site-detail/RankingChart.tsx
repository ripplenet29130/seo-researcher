'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KeywordWithRanking } from '@/lib/types';
import { getColorForKeyword } from '@/lib/utils';
import { exportExcelReport } from '@/lib/export-utils';
import { Download } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

export function RankingChart({
    keywords,
    allKeywords
}: {
    keywords: KeywordWithRanking[];
    allKeywords?: KeywordWithRanking[];
}) {
    if (!keywords || keywords.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>順位の推移</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                    ランキングデータがまだありません。キーワードを選択するか「順位を取得」をクリックして開始してください。
                </CardContent>
            </Card>
        );
    }

    // 1. Collect all unique dates and pivot data
    const dateMap = new Map<string, any>();

    keywords.forEach((kw) => {
        // Deduplicate daily rankings for each keyword first
        const dailyMap = new Map();
        (kw.rankings || []).forEach(r => {
            const dateKey = new Date(r.checked_at).toISOString().split('T')[0];
            const existing = dailyMap.get(dateKey);
            if (!existing || new Date(r.checked_at) > new Date(existing.checked_at)) {
                dailyMap.set(dateKey, r);
            }
        });

        // Merge into main date map
        dailyMap.forEach((r, dateKey) => {
            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, {
                    dateStr: dateKey, // YYYY-MM-DD
                    timestamp: new Date(dateKey).getTime(), // sortable
                });
            }
            const dataPoint = dateMap.get(dateKey);
            // If rank is null (out of rank), set to 100 for visualization at the bottom
            dataPoint[kw.id] = r.rank || 100;
        });
    });

    // 2. Sort by date
    const chartData = Array.from(dateMap.values())
        .sort((a, b) => a.timestamp - b.timestamp);

    const formatDate = (value: string) => {
        return new Date(value).toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
        });
    };

    // 3. Prepare data for the report table (Matrix view: Date x Keywrod)
    //    We reuse the dateMap logic but ensure it's fully populated
    const reportDates = chartData.sort((a, b) => b.timestamp - a.timestamp); // Sort DESC for table

    // Helper to get rank for a specific date and keyword
    const getRankForDate = (dateStr: string, kwId: string) => {
        // This `dataPoint` variable is not defined in this scope.
        // It seems like this helper function was intended for a different context or needs `dataPoint` passed in.
        // For now, returning null as it's not used in the current context.
        return null;
    };

    const handleExportExcel = async () => {
        try {
            const targetKeywords = allKeywords && allKeywords.length > 0 ? allKeywords : keywords;
            await exportExcelReport(
                targetKeywords.length > 0 ? targetKeywords[0].keyword + '...' : 'SEO Report',
                targetKeywords
            );
        } catch (e) {
            console.error('Excel Export failed', e);
            alert('Excelの出力に失敗しました。');
        }
    };


    return (
        <Card className="relative overflow-visible">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                    {keywords.length === 1
                        ? `順位の推移: ${keywords[0].keyword}`
                        : `順位の推移 (${keywords.length} キーワード)`}
                </CardTitle>
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Download className="h-4 w-4" />
                                レポート出力
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleExportExcel}>
                                Excel形式 (.xlsx)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div id="ranking-chart-container" className="h-[300px] w-full bg-white p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="dateStr"
                                tickFormatter={formatDate}
                                tick={{ fontSize: 12 }}
                                tickMargin={10}
                            />
                            <YAxis
                                reversed
                                domain={[1, 100]}
                                ticks={[1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                                tick={{ fontSize: 12 }}
                                label={{ value: '順位', angle: -90, position: 'insideLeft', offset: 10 }}
                            />
                            <Tooltip
                                cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }}
                                labelFormatter={formatDate}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-popover text-popover-foreground border rounded-lg shadow-md p-3">
                                                <p className="text-sm text-muted-foreground mb-2">{formatDate(label as string)}</p>
                                                <div className="space-y-1">
                                                    {payload.map((entry: any) => {
                                                        const kwId = entry.dataKey;
                                                        const kw = keywords.find(k => k.id === kwId);
                                                        if (!kw) return null;

                                                        const rankDisplay = entry.value === 100 ? '圏外' : `#${entry.value}`;
                                                        const deviceLabel = kw.device === 'mobile' ? ' (モバイル)' : ' (PC)';

                                                        return (
                                                            <p key={kwId} className="text-sm font-bold flex items-center gap-2">
                                                                <span
                                                                    className="w-3 h-3 rounded-full inline-block"
                                                                    style={{ backgroundColor: entry.color }}
                                                                />
                                                                <span className="font-normal">{kw.keyword}{deviceLabel}:</span> {rankDisplay}
                                                            </p>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={undefined}
                                wrapperStyle={{ paddingTop: '20px' }}
                            />
                            {keywords.map((kw) => {
                                const color = getColorForKeyword(kw.keyword);
                                const deviceLabel = kw.device === 'mobile' ? ' (モバイル)' : ' (PC)';
                                return (
                                    <Line
                                        key={kw.id}
                                        type="monotone"
                                        dataKey={kw.id}
                                        stroke={color}
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#ffffff', stroke: color, strokeWidth: 2 }}
                                        activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                                        name={`${kw.keyword}${deviceLabel}`}
                                        connectNulls
                                        animationDuration={1000}
                                    />
                                );
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
