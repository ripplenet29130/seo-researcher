import { createClient } from '@/lib/supabase/server';
import { SiteRegisterModal } from '@/components/forms/SiteRegisterModal';
import { SiteList } from '@/components/dashboard/SiteList';
import { Site } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function SitesPage() {
    const supabase = await createClient();
    const { data: sites } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-7xl mx-auto py-10 px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
                    <p className="text-muted-foreground">
                        All registered websites for SEO tracking.
                    </p>
                </div>
                <SiteRegisterModal />
            </div>

            <SiteList sites={(sites as Site[]) || []} />
        </div>
    );
}
