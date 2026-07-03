/**
 * Market context + the runtime weekly-drop wrapper (spec §12.4, §16.3; DoR §7.2).
 * The drop is GENERATED from mock candidates by weeklyDropService — never a
 * hardcoded list — so the algorithm is exercised each time.
 */
import { generateWeeklyDrop } from '@/services/matching/weeklyDropService';
import { MOCK_CANDIDATES } from './mockCandidates';
import type { GenerateDropOptions } from '@/services/matching/weeklyDropService';
import type { MarketContext, UserProfile, WeeklyDrop } from '@/types';

/**
 * A deliberately imbalanced early-market context so marketplace logic has
 * something to react to (demand > supply in some cohorts, a real median for the
 * exposure penalty).
 */
export const MOCK_MARKET_CONTEXT: MarketContext = {
  marketId: 'nyc-metro',
  totalActiveUsers: 1840,
  activeUsersByGender: { Woman: 760, Man: 890, Nonbinary: 190 },
  activeUsersByPreferenceCohort: { Women: 980, Men: 640, 'Nonbinary people': 220 },
  weeklyMatchSupplyByCohort: { Women: 520, Men: 340, 'Nonbinary people': 120, Everyone: 300 },
  weeklyMatchDemandByCohort: { Women: 610, Men: 300, 'Nonbinary people': 160, Everyone: 300 },
  averageLikesPerUserByCohort: { Women: 12, Men: 5, 'Nonbinary people': 8, Everyone: 9 },
  averageMatchRateByCohort: { Women: 0.18, Men: 0.09, 'Nonbinary people': 0.14, Everyone: 0.13 },
  averageReplyRateByCohort: { Women: 0.42, Men: 0.3, 'Nonbinary people': 0.38, Everyone: 0.36 },
  cohortMedianImpressions: 15,
};

/** Generate this user's weekly drop from the mock candidate pool at runtime. */
export function getMockWeeklyDrop(user: UserProfile, options?: GenerateDropOptions): WeeklyDrop {
  return generateWeeklyDrop(user, MOCK_CANDIDATES, MOCK_MARKET_CONTEXT, options);
}
