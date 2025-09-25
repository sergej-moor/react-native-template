import { Env } from '@env';
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const supabase = createClient(Env.SUPABASE_URL, Env.SUPABASE_ANON_KEY, {
  auth: {
    // Persist auth session in MMKV storage (handled by AuthProvider)
    storage: undefined,
    autoRefreshToken: true,
    persistSession: false, // We'll handle this manually with MMKV
    detectSessionInUrl: false, // Not needed for mobile
  },
});

export type Database = Record<string, unknown>; // You can define your database types here

export default supabase;
