import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.SUPABASE_URL;
const key = import.meta.env.SUPABASE_PUBLISHABLE_KEY;

/**
 * Build-time Supabase client. Read-only: the landing never writes.
 *
 * Created once and reused across every frontmatter import so a build issues a
 * single connection instead of one per component. Never imported from a client
 * script, which keeps @supabase/supabase-js out of the browser bundle.
 *
 * Null when the environment is not configured, so a missing .env degrades the
 * services section instead of taking the whole build down.
 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export const isSupabaseConfigured = supabase !== null;
