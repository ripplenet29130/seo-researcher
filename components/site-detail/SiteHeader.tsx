'use client';

import Link from 'next/link';
import { Site } from '@/lib/types';
import { ExternalLink, Trash2, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
import { deleteSite } from '@/app/actions/deleteSite';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface SiteHeaderProps {
    site: Site;
}

export function SiteHeader({ site }: SiteHeaderProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteSite(site.id);
            if (result && result.error) {
                toast({
                    title: "削除エラー",
                    description: (
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>{result.error}</span>
                        </div>
                    ),
                    duration: 4000,
                    variant: "destructive"
                });
                setIsDeleting(false);
            } else {
                // Success redirect is handled in the server action
                toast({
                    title: "サイトを削除しました",
                    description: (
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>ダッシュボードに戻ります...</span>
                        </div>
                    ),
                    duration: 3000,
                    variant: 'success',
                });
            }
        } catch (error) {
            setIsDeleting(false);
            toast({
                title: "予期せぬエラー",
                description: (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>削除中にエラーが発生しました</span>
                    </div>
                ),
                duration: 4000,
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/" className="flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            Dashboard
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbPage>{site.site_name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header Content */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{site.site_name}</h1>
                    <a
                        href={site.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                        {site.site_url}
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </div>

                <div className="flex items-center gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={isDeleting}>
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                サイトを削除
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                                <AlertDialogDescription>
                                    この操作は取り消せません。<br />
                                    サイト「<strong>{site.site_name}</strong>」および関連するすべてのキーワードと順位データが永久に削除されます。
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
                </div>
            </div>
        </div>
    );
}
