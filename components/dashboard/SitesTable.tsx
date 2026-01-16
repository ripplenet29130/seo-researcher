'use client';

import Link from 'next/link';
import { Site } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye } from 'lucide-react';

interface SitesTableProps {
    sites: (Site & { keywords_count?: number })[];
}

export function SitesTable({ sites }: SitesTableProps) {
    if (sites.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <p>登録されているサイトがありません。</p>
                <p className="text-sm mt-2">サイドバーから新しいサイトを登録してください。</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>サイト名</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-center">自動更新</TableHead>
                        <TableHead className="text-center">キーワード数</TableHead>
                        <TableHead className="text-right">アクション</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sites.map((site) => (
                        <TableRow key={site.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">{site.site_name}</TableCell>
                            <TableCell>
                                <a
                                    href={site.site_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {site.site_url}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </TableCell>
                            <TableCell className="text-center">
                                {site.auto_fetch_enabled ? (
                                    <Badge variant="default" className="text-xs">
                                        ON
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-xs">
                                        OFF
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-center">
                                {site.keywords_count || 0}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/sites/${site.id}`}>
                                    <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4 mr-2" />
                                        詳細
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
