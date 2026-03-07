import { createClient } from '@supabase/supabase-js';

// These should be set by the user in the extension's options page
// For this scaffolding, we fetch them from localStorage if in a browser context
// or from extension storage.
// We provide a function to initialize the client dynamically.

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
