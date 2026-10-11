import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Canonical TRUVA Supabase project configuration
const CANONICAL_URL = 'https://mhvkzehfezojdlhliymu.supabase.co';
const CANONICAL_KEY = 'sb_publishable_FUpHr4Cfcju0b-e920G3VQ_O-bcUKHT';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || CANONICAL_URL).trim();
const SUPABASE_ANON_KEY = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  CANONICAL_KEY
).trim();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_ANON_KEY.length > 20
);

const EFFECTIVE_URL = SUPABASE_URL;
const EFFECTIVE_KEY = SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(EFFECTIVE_URL, EFFECTIVE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

export { SUPABASE_URL };
