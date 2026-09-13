import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Canonical TRUVA Supabase project configuration
const SUPABASE_URL = (
  import.meta.env.VITE_SUPABASE_URL ||
  'https://omtnsykgzsujkemhhasg.supabase.co'
).trim();

const SUPABASE_ANON_KEY = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 10
);

// Fallback dummy key to permit initialization in development if env variable is being configured
const EFFECTIVE_KEY = isSupabaseConfigured
  ? SUPABASE_ANON_KEY
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_development_mode_only_replace_in_env';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, EFFECTIVE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

export { SUPABASE_URL };
