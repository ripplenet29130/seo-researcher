'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Globe, Smartphone, Monitor } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CheckResult {
    keyword: string;
    rank: number | null;
    url: string | null;
    success: boolean;
    error?: string;
}

export function QuickCheckForm() {
    const [url, setUrl] = useState('');
    const [keywordsText, setKeywordsText] = useState('');
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<CheckResult[] | null>(null);
    const { toast } = useToast();

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();

        const keywords = keywordsText
            .split('\n')
            .map(k => k.trim())
            .filter(k => k !== '');

        if (!url) {
            toast({
                title: 'エラー',
                description: 'URLを入力してください',
                variant: 'destructive',
            });
            return;
        }

        if (keywords.length === 0) {
            toast({
                title: 'エラー',
                description: '少なくとも1つのキーワードを入力してください',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        setResults(null);

        try {
            const res = await fetch('/api/quick-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    keywords,
                    device,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'チェックに失敗しました');
            }

            const data = await res.json();
            setResults(data.results);
            toast({
                title: '完了',
                description: '順位の取得が完了しました',
            });
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'エラー',
                description: error.message || '通信エラーが発生しました',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Search className="text-primary h-6 w-6" />
                        クイック順位チェック
                    </CardTitle>
                    <CardDescription>
                        サイトを登録せずに、現在のGoogle検索順位（1〜100位）を確認できます。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCheck} className="space-y-6">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="url">対象URL</Label>
                                <Input
                                    id="url"
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="bg-background/50"
                                />
                                <p className="text-xs text-muted-foreground">
                                    ※ドメイン名が含まれていれば一致判定されます（例: example.com）
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keywords">キーワード（1行に1つ）</Label>
                                <Textarea
                                    id="keywords"
                                    placeholder="SEO 対策&#10;キーワード ツール"
                                    value={keywordsText}
                                    onChange={(e) => setKeywordsText(e.target.value)}
                                    rows={5}
                                    className="bg-background/50 font-mono text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>デバイス</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={device === 'desktop' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setDevice('desktop')}
                                        className="flex-1 gap-2"
                                    >
                                        <Monitor className="h-4 w-4" />
                                        デスクトップ
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={device === 'mobile' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setDevice('mobile')}
                                        className="flex-1 gap-2"
                                    >
                                        <Smartphone className="h-4 w-4" />
                                        モバイル
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11 text-lg font-semibold" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    チェック中...
                                </>
                            ) : (
                                '順位をチェックする'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {results && (
                <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>チェック結果</span>
                            <Badge variant="outline" className="font-normal">
                                {results.length}件のキーワード
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-border/50 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[40%]">キーワード</TableHead>
                                        <TableHead className="text-center">順位</TableHead>
                                        <TableHead>検出URL</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((result, index) => (
                                        <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-medium">{result.keyword}</TableCell>
                                            <TableCell className="text-center">
                                                {result.success ? (
                                                    result.rank ? (
                                                        <span className={`text-xl font-bold ${result.rank <= 3 ? 'text-yellow-500' : result.rank <= 10 ? 'text-green-500' : ''}`}>
                                                            {result.rank}
                                                            <span className="text-xs font-normal text-muted-foreground ml-1">位</span>
                                                        </span>
                                                    ) : (
                                                        <Badge variant="secondary" className="opacity-60">圏外</Badge>
                                                    )
                                                ) : (
                                                    <span className="text-destructive text-sm">エラー</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                                                {result.url ? (
                                                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary">
                                                        {result.url}
                                                    </a>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
