import { Env } from '@env';
import { createClient } from '@supabase/supabase-js';

import { SupabaseStorage } from './auth/secure-storage';

// Create a single supabase client for interacting with your database
export const supabase = createClient(Env.SUPABASE_URL, Env.SUPABASE_ANON_KEY, {
  auth: {
    storage: SupabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = Record<string, unknown>; // You can define your database types here

export default supabase;
