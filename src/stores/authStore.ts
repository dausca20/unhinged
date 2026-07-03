/**
 * Auth + simulated subscription tier (spec §16.1, §20; DoR §14.4). The tier is a
 * local simulation — no real purchase is attempted. Auth tokens are never stored
 * (DoR §16.3); only a boolean sign-in flag and the simulated tier persist.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';
import type { SubscriptionTier } from '@/types';

type AuthState = {
  isSignedIn: boolean;
  subscriptionTier: SubscriptionTier;
  hasHydrated: boolean;
  signInMock: () => void;
  signOut: () => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setHydrated: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isSignedIn: false,
      subscriptionTier: 'free',
      hasHydrated: false,
      signInMock: () => set({ isSignedIn: true }),
      signOut: () => set({ isSignedIn: false }),
      setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'unhinged.auth',
      storage: zustandStorage,
      partialize: (state) => ({
        isSignedIn: state.isSignedIn,
        subscriptionTier: state.subscriptionTier,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
