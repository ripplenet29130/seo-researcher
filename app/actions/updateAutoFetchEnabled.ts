'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateAutoFetchSettings(
    siteId: string,
    enabled: boolean,
    frequency: 'daily' | 'weekly' | 'monthly',
    fetchTime: number,
    fetchDayOfWeek: number,
    fetchDayOfMonth: number
) {
    console.log(`Updating auto-fetch settings for site ${siteId}:`, { enabled, frequency, fetchTime, fetchDayOfWeek, fetchDayOfMonth });

    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('sites')
            .update({
                auto_fetch_enabled: enabled,
                fetch_frequency: frequency,
                fetch_time: fetchTime,
                fetch_day_of_week: fetchDayOfWeek,
                fetch_day_of_month: fetchDayOfMonth,
            })
            .eq('id', siteId);

        if (error) {
            console.error('Error updating auto-fetch settings:', error);
            return { error: error.message };
        }

        revalidatePath(`/sites/${siteId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return { error: error.message || 'An unexpected error occurred' };
    }
}
