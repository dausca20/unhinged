/**
 * Local analytics event store (spec §13, DoR §15). Registers itself as the sink
 * for analyticsService.trackEvent so every tracked event is appended here and
 * shown in the Analytics Debug Panel. Persisted (DoR §16.2), capped to keep it
 * bounded.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { registerAnalyticsSink } from '@/services/analytics/analyticsService';
import { SEED_ANALYTICS_EVENTS } from '@/mocks/mockAnalytics';
import { zustandStorage } from './storage';
import type { AnalyticsEvent } from '@/types';

const MAX_EVENTS = 500;

type AnalyticsState = {
  events: AnalyticsEvent[];
  hasHydrated: boolean;
  addEvent: (event: AnalyticsEvent) => void;
  clear: () => void;
  setHydrated: () => void;
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      events: SEED_ANALYTICS_EVENTS,
      hasHydrated: false,
      addEvent: (event) =>
        set((state) => ({ events: [event, ...state.events].slice(0, MAX_EVENTS) })),
      clear: () => set({ events: [] }),
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'unhinged.analytics',
      storage: zustandStorage,
      partialize: (state) => ({ events: state.events }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

// Wire the analytics service to append into this store.
registerAnalyticsSink((event) => useAnalyticsStore.getState().addEvent(event));
