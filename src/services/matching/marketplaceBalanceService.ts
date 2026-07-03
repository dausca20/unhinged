/**
 * Marketplace balance score (spec §12.4, DoR §10.5–§10.7). A SEPARATE function
 * that acts as a ranking MODIFIER — it never replaces compatibility, never
 * overrides safety/hard preferences, and treats gender only as invisible
 * liquidity data (no visible gender scoring).
 *
 * It does four things:
 *  1. Prevent starvation — widen via flexibility when the pool is thin.
 *  2. Penalize over-served candidates.
 *  3. Adapt to velocity signals (views/likes/replies).
 *  4. Use gender/preference cohorts as invisible liquidity only.
 */
import { clamp } from '@/utils/hash';
import type { MarketContext, UserProfile } from '@/types';

export type MarketplaceReasonCode =
  | 'pool_widened_by_flexibility'
  | 'over_served_candidate_penalty'
  | 'boost_variety_low_like_rate'
  | 'prioritize_conversation_viability'
  | 'no_impressions_widen'
  | 'cohort_liquidity_adjustment'
  | 'low_flexibility_tightened'
  | 'balanced_marketplace';

export type MarketplaceInput = {
  user: UserProfile;
  candidate: UserProfile;
  context: MarketContext;
  eligiblePoolSize: number;
};

export type MarketplaceResult = {
  score: number;
  reasonCodes: MarketplaceReasonCode[];
  widenApplied: boolean;
  allowLowerDeluluCompatibility: boolean;
};

const GENDER_TO_INTEREST_LABEL: Record<string, string> = {
  Woman: 'Women',
  Man: 'Men',
  Nonbinary: 'Nonbinary people',
};

export function scoreMarketplaceBalance(input: MarketplaceInput): MarketplaceResult {
  const { user, candidate, context, eligiblePoolSize } = input;
  const reasonCodes: MarketplaceReasonCode[] = [];
  let score = 60;
  let widenApplied = false;
  let allowLowerDeluluCompatibility = false;

  // 1. Prevent starvation — widen using Delulu Flexibility (spec §12.4.1).
  const flexibility = user.deluluScores?.deluluFlexibility ?? user.deluluProfile?.scores.deluluFlexibility ?? 50;
  if (eligiblePoolSize < 30 && flexibility > 60) {
    widenApplied = true;
    allowLowerDeluluCompatibility = true;
    score += 12;
    reasonCodes.push('pool_widened_by_flexibility');
  }

  // 2. Avoid over-serving scarce/over-exposed candidates (spec §12.4.2).
  if ((candidate.weeklyImpressions ?? 0) > context.cohortMedianImpressions) {
    score -= 8;
    reasonCodes.push('over_served_candidate_penalty');
  }

  // 3. Adapt to velocity signals (spec §12.4.3).
  const velocity = user.matchVelocity;
  if (velocity) {
    const gettingViewsNoLikes = velocity.weeklyDropViews > 0 && velocity.weeklyLikesSent === 0;
    const gettingLikesNoReplies =
      velocity.weeklyLikesSent > 0 && velocity.repliesReceived === 0 && velocity.mutualMatches === 0;
    const noImpressions = velocity.weeklyDropViews === 0;

    if (gettingViewsNoLikes && (candidate.wildcardPotential ?? 0) > 55) {
      score += 8;
      reasonCodes.push('boost_variety_low_like_rate');
    }
    if (gettingLikesNoReplies) {
      // Nudge toward candidates who can actually hold a conversation.
      const convoProxy = candidate.deluluScores?.repairReflex ?? 50;
      score += convoProxy > 60 ? 6 : 0;
      reasonCodes.push('prioritize_conversation_viability');
    }
    if (noImpressions) {
      score += 5;
      reasonCodes.push('no_impressions_widen');
    }
  }

  // 4. Gender/preference cohorts as INVISIBLE liquidity only (spec §12.4.4).
  // Scarcer cohorts (low supply vs demand) get a small, non-visible nudge so the
  // marketplace stays liquid. Never surfaced to the user, never a hard override.
  const candidateInterestLabel = GENDER_TO_INTEREST_LABEL[candidate.gender] ?? candidate.gender;
  const supply = context.weeklyMatchSupplyByCohort[candidateInterestLabel];
  const demand = context.weeklyMatchDemandByCohort[candidateInterestLabel];
  if (typeof supply === 'number' && typeof demand === 'number' && supply > 0) {
    const ratio = demand / supply; // >1 means demand outstrips supply
    if (ratio > 1.1 || ratio < 0.9) {
      score += clamp((ratio - 1) * 10, -6, 6);
      reasonCodes.push('cohort_liquidity_adjustment');
    }
  }

  // Flexibility also tightens the wild stuff for low-flexibility users (spec §12.5).
  if (flexibility < 40 && (candidate.wildcardPotential ?? 0) > 70) {
    score -= 10;
    reasonCodes.push('low_flexibility_tightened');
  }

  if (reasonCodes.length === 0) reasonCodes.push('balanced_marketplace');

  return {
    score: clamp(Math.round(score), 0, 100),
    reasonCodes,
    widenApplied,
    allowLowerDeluluCompatibility,
  };
}
