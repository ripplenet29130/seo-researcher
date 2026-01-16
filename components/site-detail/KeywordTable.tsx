import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Keyword } from "@/lib/types";

// Extended type for display
interface KeywordWithStats extends Keyword {
    currentRank?: number | null;
    change?: number;
    lastCheckUrl?: string | null;
}

export function KeywordTable({ keywords }: { keywords: KeywordWithStats[] }) {
    if (keywords.length === 0) {
        return <div className="text-center p-8 text-muted-foreground">No keywords registered.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30%]">Keyword</TableHead>
                        <TableHead className="text-center">Location / Device</TableHead>
                        <TableHead className="text-center">Current Rank</TableHead>
                        <TableHead className="text-center">Change</TableHead>
                        <TableHead className="text-right">URL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {keywords.map((kw) => (
                        <TableRow key={kw.id}>
                            <TableCell className="font-medium">
                                {kw.keyword}
                            </TableCell>
                            <TableCell className="text-center text-xs text-muted-foreground">
                                <div className="flex flex-col items-center gap-1">
                                    <span>{kw.location || 'JP'}</span>
                                    <Badge variant="outline" className="text-[10px] h-5">{kw.device || 'Desktop'}</Badge>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className={`text-lg font-bold ${kw.currentRank && kw.currentRank <= 10 ? 'text-primary' : ''}`}>
                                    {kw.currentRank || '-'}
                                </span>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="text-muted-foreground text-sm">-</span>
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground max-w-[150px] truncate">
                                {kw.lastCheckUrl || '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
