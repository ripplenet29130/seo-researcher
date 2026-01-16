'use client';

import { Site } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SiteList({ sites }: { sites: Site[] }) {
    const router = useRouter();
    const supabase = createClient();

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this site?')) return;

        try {
            const { error } = await supabase.from('sites').delete().eq('id', id);
            if (error) throw error;
            router.refresh();
        } catch (error) {
            console.error('Error deleting site:', error);
            alert('Failed to delete site');
        }
    };

    if (sites.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                まだサイトが登録されていません。「新しくサイトを追加する」をクリックして始めてください。
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
                <Card
                    key={site.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/sites/${site.id}`)}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {site.site_name}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(site.id);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate" title={site.site_url}>
                            {site.site_url.replace(/^https?:\/\//, '')}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Added: {new Date(site.created_at).toLocaleDateString()}
                        </p>
                        <Button
                            variant="link"
                            className="px-0 mt-2 h-auto"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(site.site_url, '_blank');
                            }}
                        >
                            Visit Site <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
