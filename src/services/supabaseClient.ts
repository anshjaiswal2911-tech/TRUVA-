import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Canonical TRUVA Supabase project configuration
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_URL.startsWith('https://') &&
  (SUPABASE_ANON_KEY || (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '')).trim().length > 20
);

const EFFECTIVE_URL = (isSupabaseConfigured && SUPABASE_URL) ? SUPABASE_URL : 'https://placeholder.supabase.co';
const EFFECTIVE_KEY = isSupabaseConfigured
  ? (SUPABASE_ANON_KEY || (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '')).trim()
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_development_mode_only_replace_in_env';

export const supabase: SupabaseClient = createClient(EFFECTIVE_URL, EFFECTIVE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

export { SUPABASE_URL };
