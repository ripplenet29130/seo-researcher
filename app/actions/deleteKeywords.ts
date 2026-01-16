'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteKeywords(keywordIds: string[], siteId: string) {
    if (!keywordIds || keywordIds.length === 0) {
        return { error: 'No keywords selected' };
    }

    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('keywords')
            .delete()
            .in('id', keywordIds);

        if (error) {
            console.error('Error deleting keywords:', error);
            return { error: error.message };
        }

        revalidatePath(`/sites/${siteId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return { error: error.message || 'An unexpected error occurred' };
    }
}
