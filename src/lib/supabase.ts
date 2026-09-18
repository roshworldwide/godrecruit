import { createClient } from '@supabase/supabase-js';

export type SupabaseSettings = {
    url: string;
    anonKey: string;
};

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const initSupabase = (settings: SupabaseSettings) => {
    supabaseInstance = createClient(settings.url, settings.anonKey);
    return supabaseInstance;
};

export const getSupabase = () => {
    if (!supabaseInstance) {
        console.warn("Supabase not initialized yet.");
    }
    return supabaseInstance;
};
