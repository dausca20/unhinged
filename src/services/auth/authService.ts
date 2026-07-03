/**
 * Auth service (spec §16.1). Mock mode returns a mock current user and fakes
 * login/logout. Auth tokens are never persisted to AsyncStorage (DoR §16.3).
 * Later this is where Supabase Auth would be wired.
 */
import { isSupabaseConfigured } from '@/config/env';
import { SAMPLE_COMPLETED_USER } from '@/mocks/currentUser';
import type { UserProfile } from '@/types';

export function isBackendAuthAvailable(): boolean {
  return isSupabaseConfigured;
}

/** Fake sign-in: returns a mock, fully-onboarded user (the "already have an account" stub). */
export async function mockSignIn(): Promise<UserProfile> {
  return SAMPLE_COMPLETED_USER;
}

export async function mockSignOut(): Promise<void> {
  // No tokens to clear in mock mode.
}

export const authService = {
  isBackendAuthAvailable,
  mockSignIn,
  mockSignOut,
};
