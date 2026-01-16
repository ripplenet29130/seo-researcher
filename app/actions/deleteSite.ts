'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteSite(siteId: string) {
    const supabase = await createClient();

    try {
        // Note: Due to foreign key constraints (CASCADE), 
        // deleting the site should automatically delete related keywords and rankings.
        // Ensure your database schema supports ON DELETE CASCADE for these relationships.

        const { error } = await supabase
            .from('sites')
            .delete()
            .eq('id', siteId);

        if (error) {
            console.error('Error deleting site:', error);
            return { error: error.message };
        }

    } catch (error: any) {
        console.error('Unexpected error:', error);
        return { error: error.message || 'An unexpected error occurred' };
    }

    // Redirect needs to be outside the try-catch block in Server Actions
    revalidatePath('/');
    redirect('/');
}
