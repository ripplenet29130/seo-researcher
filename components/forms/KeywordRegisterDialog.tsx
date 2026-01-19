'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function KeywordRegisterDialog({ siteId }: { siteId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [keywordsRaw, setKeywordsRaw] = useState('');
    const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'both'>('both');
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const keywords = keywordsRaw.split('\n').filter(k => k.trim());

            const res = await fetch('/api/keywords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    site_id: siteId,
                    keywords,
                    device: deviceType,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to register keywords');
            }

            const data = await res.json();
            toast({
                title: "成功",
                description: (
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{data.count}個のキーワードを登録しました</span>
                    </div>
                ),
                duration: 3000,
                variant: 'success',
            });
            setOpen(false);
            setKeywordsRaw('');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast({
                title: "登録エラー",
                description: (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>キーワードの登録に失敗しました</span>
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    <Plus className="mr-2 h-4 w-4" /> キーワードを追加
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>キーワードを追加する</DialogTitle>
                    <DialogDescription>
                        1行ずつキーワードを入力してください。
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="keywords">キーワード</Label>
                            <Textarea
                                id="keywords"
                                placeholder="キーワードは一行ずつ追加してください。複合キーワードはスペースで区切ってください。"
                                value={keywordsRaw}
                                onChange={(e) => setKeywordsRaw(e.target.value)}
                                className="h-32"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="device">デバイス</Label>
                            <Select value={deviceType} onValueChange={(value: any) => setDeviceType(value)}>
                                <SelectTrigger id="device">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="both">両方 (PC + モバイル)</SelectItem>
                                    <SelectItem value="desktop">PC のみ</SelectItem>
                                    <SelectItem value="mobile">モバイル のみ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            キーワードを保存
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
