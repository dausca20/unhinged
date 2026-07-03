/**
 * Profile repository seam (spec §16). A clean interface with a mock implementation
 * for local mode and a Supabase-backed stub for later wiring. When Supabase is
 * unconfigured the mock repository is used automatically (DoR §16.4) — the app
 * never blocks on backend setup.
 */
import { MOCK_CANDIDATES } from '@/mocks/mockCandidates';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { UserProfile } from '@/types';

export interface ProfileRepository {
  /** Candidate pool for matching. */
  getCandidates(): Promise<UserProfile[]>;
  /** Current user is owned by local state in this prototype; returns null here. */
  getCurrentUser(): Promise<UserProfile | null>;
  /** Persist the current user (no-op in mock mode; local stores own persistence). */
  saveProfile(user: UserProfile): Promise<void>;
}

class MockProfileRepository implements ProfileRepository {
  async getCandidates(): Promise<UserProfile[]> {
    return MOCK_CANDIDATES;
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    return null;
  }

  async saveProfile(): Promise<void> {
    // Local persistence is handled by the Zustand stores; nothing to do in mock mode.
  }
}

/**
 * Placeholder for the future Supabase-backed repository. Not exercised in the
 * prototype (Supabase is never configured), but present to document the seam.
 */
class SupabaseProfileRepository implements ProfileRepository {
  async getCandidates(): Promise<UserProfile[]> {
    // Future: select from a `profiles` table via `supabase`. Falls back to mocks.
    if (!supabase) return MOCK_CANDIDATES;
    return MOCK_CANDIDATES;
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    return null;
  }

  async saveProfile(): Promise<void> {
    // Future: upsert into `profiles`.
  }
}

export const profileRepository: ProfileRepository =
  isSupabaseConfigured && supabase ? new SupabaseProfileRepository() : new MockProfileRepository();
