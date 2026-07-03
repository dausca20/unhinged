/**
 * Analytics seed (spec §15). The local analytics store starts empty and fills up
 * as the user moves through the app; the debug panel shows real captured events.
 */
import type { AnalyticsEvent } from '@/types';

export const SEED_ANALYTICS_EVENTS: AnalyticsEvent[] = [];
