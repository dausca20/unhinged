/**
 * Supabase client wrapper (spec §16.2, DoR §16.4). The client is created ONLY
 * when both URL and anon key are present; otherwise it is null and the app runs
 * fully on mock repositories. Nothing here blocks local mode, and only the
 * public anon key is ever read — no service-role or private secrets (DoR §1.5).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/config/env';

export { isSupabaseConfigured };

/**
 * Null in local/mock mode. When configured, session persistence is disabled so
 * we never write auth tokens to AsyncStorage in this prototype (DoR §16.3).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
