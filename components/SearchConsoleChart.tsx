'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchGSCData } from '@/app/actions/fetchGSCData';
import { GSCDataRow } from '@/lib/types';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { AlertCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/actions/signOut';

interface SearchConsoleChartProps {
    siteUrl: string;
    days?: number;
}

export function SearchConsoleChart({ siteUrl, days = 30 }: SearchConsoleChartProps) {
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState<GSCDataRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await fetchGSCData(siteUrl, days);

                if (result.error) {
                    setError(result.error);
                    console.error('GSC Fetch Error:', result.error, 'for site:', siteUrl);
                } else if (result.rows) {
                    setData(result.rows);
                }
            } catch (err) {
                console.error('Chart Data Load failed:', err);
                setError('データの読み込みに失敗しました');
            }

            setLoading(false);
        };

        if (mounted) {
            loadData();
        }
    }, [siteUrl, days, mounted]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    if (!mounted) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>検索パフォーマンス</CardTitle>
                    <CardDescription>
                        過去{days}日間のクリック数と表示回数
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>検索パフォーマンス</CardTitle>
                <CardDescription>
                    過去{days}日間のクリック数と表示回数
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-[300px] w-full" />
                    </div>
                ) : error ? (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-destructive p-4 bg-destructive/10 rounded-md border border-destructive/20">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-2">
                                <p className="font-medium">{error}</p>
                                <details className="text-sm opacity-90">
                                    <summary className="cursor-pointer hover:opacity-100">
                                        トラブルシューティング
                                    </summary>
                                    <div className="mt-2 space-y-2 text-muted-foreground">
                                        {error.includes('権限がありません') && (
                                            <div className="pl-4 border-l-2 border-destructive/30">
                                                <p className="font-medium">考えられる原因:</p>
                                                <ul className="list-disc list-inside space-y-1 mt-1">
                                                    <li>Search Consoleでこのサイトの権限（オーナーまたは完全ユーザー）がない</li>
                                                    <li>Supabaseのスコープ設定が不足している</li>
                                                    <li>URLの形式が一致していない（末尾のスラッシュなど）</li>
                                                </ul>
                                            </div>
                                        )}
                                        {error.includes('見つかりませんでした') && (
                                            <div className="pl-4 border-l-2 border-destructive/30">
                                                <p className="font-medium">考えられる原因:</p>
                                                <ul className="list-disc list-inside space-y-1 mt-1">
                                                    <li>Search ConsoleにこのURLが登録されていない</li>
                                                    <li>URLの形式が一致していない（http/https、www有無など）</li>
                                                </ul>
                                            </div>
                                        )}
                                        <p className="mt-3">
                                            <a
                                                href="/docs/gsc-setup-guide.md"
                                                target="_blank"
                                                className="text-primary hover:underline inline-flex items-center gap-1"
                                            >
                                                📖 詳細なセットアップガイドを見る
                                            </a>
                                        </p>
                                    </div>
                                </details>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <form action={signOut}>
                                <Button
                                    variant="outline"
                                    type="submit"
                                    className="flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    ログアウトして再連携
                                </Button>
                            </form>
                            <Button
                                variant="secondary"
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2"
                            >
                                🔄 ページを再読み込み
                            </Button>
                        </div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>データがありません</p>
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 12 }}
                                    label={{ value: 'クリック数', angle: -90, position: 'insideLeft' }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 12 }}
                                    label={{ value: '表示回数', angle: 90, position: 'insideRight' }}
                                />
                                <Tooltip
                                    labelFormatter={(value) => `日付: ${value}`}
                                    formatter={(value: number | undefined, name: string | undefined) => {
                                        if (value === undefined || name === undefined) return ['0', ''];
                                        return [
                                            value.toLocaleString(),
                                            name === 'clicks' ? 'クリック数' : '表示回数'
                                        ];
                                    }}
                                />
                                <Legend
                                    formatter={(value) => value === 'clicks' ? 'クリック数' : '表示回数'}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="clicks"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                    name="clicks"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="impressions"
                                    stroke="#82ca9d"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                    name="impressions"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
