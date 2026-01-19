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
import { Loader2, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Site } from '@/lib/types';

interface EditSiteDialogProps {
    site: Site;
}

export function EditSiteDialog({ site }: EditSiteDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [siteName, setSiteName] = useState(site.site_name);
    const [siteUrl, setSiteUrl] = useState(site.site_url);
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('sites')
                .update({
                    site_name: siteName,
                    site_url: siteUrl,
                })
                .eq('id', site.id);

            if (error) throw error;

            toast({
                title: "更新完了",
                description: (
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>サイト情報を更新しました</span>
                    </div>
                ),
                duration: 3000,
                variant: 'success',
            });

            setOpen(false);
            router.refresh(); // Refresh server components
        } catch (error) {
            console.error('Error updating site:', error);
            toast({
                title: "更新エラー",
                description: (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>サイト情報の更新に失敗しました</span>
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
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Reset form state when reopening
                        if (!open) {
                            setSiteName(site.site_name);
                            setSiteUrl(site.site_url);
                        }
                    }}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[425px]"
                onClick={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle>サイト情報を編集</DialogTitle>
                    <DialogDescription>
                        サイトの名前とURLを編集します。
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                                サイト名
                            </Label>
                            <Input
                                id="edit-name"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                className="col-span-3"
                                placeholder="My Blog"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-url" className="text-right">
                                URL
                            </Label>
                            <Input
                                id="edit-url"
                                value={siteUrl}
                                onChange={(e) => setSiteUrl(e.target.value)}
                                className="col-span-3"
                                placeholder="https://example.com"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="transition-all duration-200">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            更新する
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
