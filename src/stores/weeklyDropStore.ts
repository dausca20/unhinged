/**
 * Weekly drop + like/skip/save/view interactions + inbound likes + mutual
 * matches (spec §7, §8.10, §8.11; DoR §7, §12, §13). Persisted so interaction
 * state survives tab switches and restarts (DoR §7.7, §16.2).
 *
 * The drop itself is generated at runtime by weeklyDropService — never hardcoded.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMockWeeklyDrop } from '@/mocks/mockWeeklyDrop';
import { zustandStorage } from './storage';
import type { UserProfile, WeeklyDrop } from '@/types';

/** People who already liked the current user (for the Likes screen). */
export const SEED_INBOUND_LIKE_IDS = ['c05', 'c09', 'c18', 'c24', 'c26', 'c30'];
/** Pre-existing mutual matches so Messages/Chat have content on first run. */
export const SEED_MUTUAL_MATCH_IDS = ['c02', 'c08'];

export type InteractionState = {
  liked?: boolean;
  skipped?: boolean;
  saved?: boolean;
  viewed?: boolean;
};

type WeeklyDropState = {
  drop: WeeklyDrop | null;
  interactions: Record<string, InteractionState>;
  inboundLikeIds: string[];
  mutualMatchIds: string[];
  hasRevealed: boolean;
  hasHydrated: boolean;

  generate: (user: UserProfile) => WeeklyDrop;
  ensureDrop: (user: UserProfile) => WeeklyDrop;
  setRevealed: () => void;
  like: (candidateId: string) => { becameMutual: boolean };
  skip: (candidateId: string) => void;
  save: (candidateId: string) => void;
  markViewed: (candidateId: string) => void;
  reset: () => void;
  setHydrated: () => void;
};

function mutate(
  set: (fn: (s: WeeklyDropState) => Partial<WeeklyDropState>) => void,
  candidateId: string,
  patch: InteractionState,
) {
  set((s) => ({
    interactions: {
      ...s.interactions,
      [candidateId]: { ...s.interactions[candidateId], ...patch },
    },
  }));
}

export const useWeeklyDropStore = create<WeeklyDropState>()(
  persist(
    (set, get) => ({
      drop: null,
      interactions: {},
      inboundLikeIds: SEED_INBOUND_LIKE_IDS,
      mutualMatchIds: SEED_MUTUAL_MATCH_IDS,
      hasRevealed: false,
      hasHydrated: false,

      generate: (user) => {
        const drop = getMockWeeklyDrop(user);
        set({ drop });
        return drop;
      },
      ensureDrop: (user) => {
        const existing = get().drop;
        if (existing) return existing;
        return get().generate(user);
      },
      setRevealed: () => set({ hasRevealed: true }),

      like: (candidateId) => {
        mutate(set, candidateId, { liked: true, skipped: false });
        const { inboundLikeIds, mutualMatchIds } = get();
        const becameMutual =
          inboundLikeIds.includes(candidateId) && !mutualMatchIds.includes(candidateId);
        if (becameMutual) set({ mutualMatchIds: [...mutualMatchIds, candidateId] });
        return { becameMutual };
      },
      skip: (candidateId) => mutate(set, candidateId, { skipped: true, liked: false }),
      save: (candidateId) => mutate(set, candidateId, { saved: true }),
      markViewed: (candidateId) => mutate(set, candidateId, { viewed: true }),

      reset: () =>
        set({
          drop: null,
          interactions: {},
          inboundLikeIds: SEED_INBOUND_LIKE_IDS,
          mutualMatchIds: SEED_MUTUAL_MATCH_IDS,
          hasRevealed: false,
        }),
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'unhinged.weeklyDrop',
      storage: zustandStorage,
      partialize: (state) => ({
        drop: state.drop,
        interactions: state.interactions,
        inboundLikeIds: state.inboundLikeIds,
        mutualMatchIds: state.mutualMatchIds,
        hasRevealed: state.hasRevealed,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

export function selectLikesUsed(state: WeeklyDropState): number {
  return Object.values(state.interactions).filter((i) => i.liked).length;
}
