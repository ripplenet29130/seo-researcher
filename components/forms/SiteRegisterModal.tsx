'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function SiteRegisterModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [siteName, setSiteName] = useState('');
    const [siteUrl, setSiteUrl] = useState('');
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('sites').insert([
                {
                    site_name: siteName,
                    site_url: siteUrl,
                },
            ]);

            if (error) throw error;

            toast({
                title: "成功",
                description: (
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>サイト「{siteName}」を追加しました</span>
                    </div>
                ),
                duration: 3000,
                variant: 'success',
            });

            setOpen(false);
            setSiteName('');
            setSiteUrl('');
            router.refresh(); // Refresh server components
        } catch (error) {
            console.error('Error adding site:', error);
            toast({
                title: "登録エラー",
                description: (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>サイトの追加に失敗しました</span>
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
                <Button className="transition-all duration-200 hover:scale-105 hover:shadow-lg">新しくサイトを追加する</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>新しくサイトを追加する</DialogTitle>
                    <DialogDescription>
                        現在のサイトの詳細を入力してください。
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                サイト名
                            </Label>
                            <Input
                                id="name"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                className="col-span-3"
                                placeholder="My Blog"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="url" className="text-right">
                                URL
                            </Label>
                            <Input
                                id="url"
                                value={siteUrl}
                                onChange={(e) => setSiteUrl(e.target.value)}
                                className="col-span-3"
                                placeholder="https://example.com"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            保存する
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
