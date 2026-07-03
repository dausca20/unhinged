/**
 * Centralized, client-safe environment access. Only EXPO_PUBLIC_-prefixed vars
 * are read here (DoR §1.5). Each is referenced directly so Expo can inline it at
 * build time. Sensible defaults keep the app running with an empty/absent .env
 * (DoR §1.2, §1.4, §1.8).
 */

function readBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

function readString(value: string | undefined, fallback: string): string {
  if (value === undefined || value === '') return fallback;
  return value;
}

export const env = {
  appEnv: readString(process.env.EXPO_PUBLIC_APP_ENV, 'local'),
  supabaseUrl: readString(process.env.EXPO_PUBLIC_SUPABASE_URL, ''),
  supabaseAnonKey: readString(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, ''),
  apiBaseUrl: readString(process.env.EXPO_PUBLIC_API_BASE_URL, ''),
  /** Sourced from env with the spec default — never hard-coded in a component (DoR §1.8). */
  matchAlgorithmVersion: readString(process.env.EXPO_PUBLIC_MATCH_ALGORITHM_VERSION, 'delulu-v0.1'),
  /** Default true so a clean checkout runs fully local with no backend. */
  enableMocks: readBool(process.env.EXPO_PUBLIC_ENABLE_MOCKS, true),
  enableAnalyticsDebug: readBool(process.env.EXPO_PUBLIC_ENABLE_ANALYTICS_DEBUG, true),
  revenueCatIosApiKey: readString(process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY, ''),
  revenueCatAndroidApiKey: readString(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY, ''),
} as const;

/** True only when both Supabase URL and anon key are present (spec §16.2). */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

/**
 * Mock mode is on when explicitly enabled OR whenever Supabase is not configured.
 * In this prototype it is effectively always on — no network calls are attempted.
 */
export const useMocks = env.enableMocks || !isSupabaseConfigured;

export const revenueCatConfigured = Boolean(
  env.revenueCatIosApiKey && env.revenueCatAndroidApiKey,
);
