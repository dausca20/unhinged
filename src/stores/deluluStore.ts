/**
 * Generated Delulu Profile + visibility controls (spec §8.6, §11; DoR §5, §6).
 * Persisted (DoR §16.2). Generation is deterministic: same answers → same
 * profile. "Roast me again" re-runs the same deterministic generation.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { scoreInterview } from '@/services/delulu/deluluScoringService';
import { generateDeluluProfile } from '@/services/delulu/deluluTypeService';
import { trackEvent } from '@/services/analytics/analyticsService';
import { zustandStorage } from './storage';
import type { DeluluProfile, DeluluVisibility, InterviewAnswer } from '@/types';

type DeluluState = {
  profile: DeluluProfile | null;
  hasHydrated: boolean;
  generate: (userId: string, answers: InterviewAnswer[]) => DeluluProfile;
  regenerate: (userId: string, answers: InterviewAnswer[]) => DeluluProfile;
  updateVisibility: (partial: Partial<DeluluVisibility>) => void;
  setProfile: (profile: DeluluProfile | null) => void;
  reset: () => void;
  setHydrated: () => void;
};

export const useDeluluStore = create<DeluluState>()(
  persist(
    (set, get) => ({
      profile: null,
      hasHydrated: false,

      generate: (userId, answers) => {
        // Preserve prior visibility choices across regeneration if present.
        const previousVisibility = get().profile?.visibility;
        const scores = scoreInterview(answers);
        const profile = generateDeluluProfile(userId, scores, {
          visibility: previousVisibility ? { ...previousVisibility } : undefined,
        });
        set({ profile });
        trackEvent('delulu_profile_generated', { userId, type: profile.type });
        return profile;
      },

      regenerate: (userId, answers) => get().generate(userId, answers),

      updateVisibility: (partial) =>
        set((s) => {
          if (!s.profile) return s;
          const profile = { ...s.profile, visibility: { ...s.profile.visibility, ...partial } };
          trackEvent('delulu_profile_edited', { userId: profile.userId, visibility: profile.visibility });
          return { profile };
        }),

      setProfile: (profile) => set({ profile }),
      reset: () => set({ profile: null }),
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'unhinged.delulu',
      storage: zustandStorage,
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
