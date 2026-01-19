'use client';

import { useState } from 'react';
import { KeywordWithRanking } from '@/lib/types';
import { getColorForKeyword } from '@/lib/utils';
import { DeleteKeywordsButton } from '@/components/buttons/DeleteKeywordsButton';
import { FetchRankingsButton } from '@/components/buttons/FetchRankingsButton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export function KeywordTable({
    siteId,
    keywords,
    selectedKeywords,
    onSelectionChange,
    onKeywordClick,
    onDeleteSuccess
}: {
    siteId: string;
    keywords: KeywordWithRanking[];
    selectedKeywords: string[];
    onSelectionChange: (ids: string[]) => void;
    onKeywordClick?: (keyword: KeywordWithRanking) => void;
    onDeleteSuccess?: () => void;
}) {
    if (keywords.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    キーワードがまだ登録されていません。
                </CardContent>
            </Card>
        );
    }

    const toggleAll = () => {
        if (selectedKeywords.length === keywords.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(keywords.map(k => k.id));
        }
    };

    const toggleKeyword = (id: string) => {
        if (selectedKeywords.includes(id)) {
            onSelectionChange(selectedKeywords.filter(k => k !== id));
        } else {
            onSelectionChange([...selectedKeywords, id]);
        }
    };

    const allSelected = keywords.length > 0 && selectedKeywords.length === keywords.length;
    const someSelected = selectedKeywords.length > 0 && selectedKeywords.length < keywords.length;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-bold">Keywords ({keywords.length})</CardTitle>
                <DeleteKeywordsButton
                    siteId={siteId}
                    selectedKeywordIds={selectedKeywords}
                    onSuccess={onDeleteSuccess}
                />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={toggleAll}
                                    aria-label="Select all"
                                    className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                                />
                            </TableHead>
                            <TableHead>キーワード</TableHead>
                            <TableHead>現在の順位</TableHead>
                            <TableHead>デバイス</TableHead>
                            <TableHead>場所</TableHead>
                            <TableHead>最終更新日</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {keywords.map((kw) => (
                            <TableRow
                                key={kw.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onKeywordClick?.(kw)}
                            >
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedKeywords.includes(kw.id)}
                                        onCheckedChange={() => toggleKeyword(kw.id)}
                                        aria-label={`Select ${kw.keyword}`}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{kw.keyword}</TableCell>
                                <TableCell>
                                    {kw.latest_rank ? (
                                        <Badge
                                            className="text-white border-0"
                                            style={{
                                                backgroundColor: getColorForKeyword(kw.keyword)
                                            }}
                                        >
                                            #{kw.latest_rank}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell>{kw.device || '-'}</TableCell>
                                <TableCell>{kw.location || '-'}</TableCell>
                                <TableCell>
                                    {kw.latest_checked_at
                                        ? new Date(kw.latest_checked_at).toLocaleDateString()
                                        : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex justify-end pt-4 border-t">
                <FetchRankingsButton
                    siteId={siteId}
                    selectedKeywordIds={selectedKeywords}
                />
            </CardFooter>
        </Card>
    );
}
