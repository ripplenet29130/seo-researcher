'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Hash } from 'lucide-react';

interface SummaryCardsProps {
    sitesCount: number;
    keywordsCount: number;
}

export function SummaryCards({ sitesCount, keywordsCount }: SummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">登録サイト数</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{sitesCount}</div>
                    <p className="text-xs text-muted-foreground">
                        監視中のサイト
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">キーワード総数</CardTitle>
                    <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{keywordsCount}</div>
                    <p className="text-xs text-muted-foreground">
                        追跡中のキーワード
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
