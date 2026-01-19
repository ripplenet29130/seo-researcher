'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { deleteKeywords } from '@/app/actions/deleteKeywords';
import { useToast } from '@/components/ui/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function DeleteKeywordsButton({
    siteId,
    selectedKeywordIds,
    onSuccess,
}: {
    siteId: string;
    selectedKeywordIds: string[];
    onSuccess?: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        console.log('=== STARTING DELETION ===');
        console.log('Selected keyword IDs:', selectedKeywordIds);
        console.log('Count:', selectedKeywordIds.length);

        setLoading(true);
        setOpen(false); // Close the dialog

        try {
            const result = await deleteKeywords(selectedKeywordIds, siteId);
            console.log('Delete result:', result);

            if (result.error) {
                console.error('Delete error:', result.error);
                toast({
                    title: "削除エラー",
                    description: (
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>{result.error}</span>
                        </div>
                    ),
                    duration: 4000,
                    variant: 'destructive',
                });
            } else {
                console.log('✅ Keywords deleted successfully');
                toast({
                    title: "削除しました",
                    description: (
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{selectedKeywordIds.length}個のキーワードを削除しました</span>
                        </div>
                    ),
                    duration: 3000,
                    variant: 'success',
                });
                onSuccess?.();
            }
        } catch (error) {
            console.error('Unexpected delete error:', error);
            toast({
                title: "予期せぬエラー",
                description: (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>予期しないエラーが発生しました。コンソールを確認してください。</span>
                    </div>
                ),
                duration: 4000,
                variant: 'destructive',
            });
        } finally {
            console.log('Delete operation finished');
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        console.log('Dialog open state changing:', newOpen);
        console.log('Selected keywords count:', selectedKeywordIds.length);

        if (newOpen && selectedKeywordIds.length === 0) {
            console.warn('⚠️ No keywords selected for deletion');
            toast({
                title: "選択エラー",
                description: (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>削除対象のキーワードが選択されていません</span>
                    </div>
                ),
                duration: 4000,
                variant: 'destructive',
            });
            return;
        }

        setOpen(newOpen);
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button
                    disabled={loading || selectedKeywordIds.length === 0}
                    variant="destructive"
                    size="sm"
                    title="Delete selected keywords"
                    className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    チェックしたキーワードを削除
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>キーワードを削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                        本当に <strong>{selectedKeywordIds.length}</strong> 個のキーワードを削除しますか？
                        <br />
                        <br />
                        この操作は取り消せません。削除されたキーワードとその順位履歴は完全に失われます。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        削除する
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
