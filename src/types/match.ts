/**
 * Matching domain: scores, explanations, labels, candidates, the weekly drop,
 * and the market context the algorithm reads. See spec §12–§15.
 */
import type { DeluluDimension } from './delulu';
import type { UserProfile } from './user';

/** Approved match labels only (DoR §7.5). */
export type MatchLabel =
  | 'Exact Freak Match'
  | 'Complementary Delulu'
  | 'Good For The Plot'
  | 'Slow Burn Wildcard'
  | 'Dangerous But Probably Fine'
  | 'Soft Launch Material'
  | 'Lore-Compatible'
  | 'Text Chemistry Risk'
  | 'The Wildcard';

export const MATCH_LABELS: readonly MatchLabel[] = [
  'Exact Freak Match',
  'Complementary Delulu',
  'Good For The Plot',
  'Slow Burn Wildcard',
  'Dangerous But Probably Fine',
  'Soft Launch Material',
  'Lore-Compatible',
  'Text Chemistry Risk',
  'The Wildcard',
] as const;

/** The seven weighted components of total match score (spec §12.2). */
export type MatchScoreComponents = {
  deluluCompatibilityScore: number;
  intentFitScore: number;
  attractionProxyScore: number;
  conversationViabilityScore: number;
  marketplaceBalanceScore: number;
  noveltyScore: number;
  safetyConfidenceScore: number;
};

export const SCORE_COMPONENT_WEIGHTS: Record<keyof MatchScoreComponents, number> = {
  deluluCompatibilityScore: 0.36,
  intentFitScore: 0.18,
  attractionProxyScore: 0.14,
  conversationViabilityScore: 0.12,
  marketplaceBalanceScore: 0.12,
  noveltyScore: 0.05,
  safetyConfidenceScore: 0.03,
};

export type MatchScore = {
  total: number;
  components: MatchScoreComponents;
  algorithmVersion: string;
  /** Explanation reason codes (why-you-match rationale). */
  reasonCodes: string[];
  /** Marketplace-balancing reason codes (kept distinct for analytics §13.2). */
  marketplaceReasonCodes: string[];
};

export type WildcardReason =
  | 'shared_absurd_interest'
  | 'high_chaos_overlap'
  | 'opposites_for_the_plot'
  | 'unexpected_lore_match'
  | 'text_chemistry_experiment'
  | 'profile_prompt_too_funny_to_ignore';

export const WILDCARD_REASONS: readonly WildcardReason[] = [
  'shared_absurd_interest',
  'high_chaos_overlap',
  'opposites_for_the_plot',
  'unexpected_lore_match',
  'text_chemistry_experiment',
  'profile_prompt_too_funny_to_ignore',
] as const;

export type MatchExplanation = {
  headline: string;
  whyYouMightMatch: string;
  whereItCouldGetUnhinged: string;
  suggestedOpener: string;
  sharedDimensions: DeluluDimension[];
  mismatchDimensions: DeluluDimension[];
  marketplaceNote?: string;
  // ---- Wildcard-only fields (spec §8.9) ----
  whyNotACleanMatch?: string;
  whyItMightStillBeFun?: string;
  whatWeAreTesting?: string;
};

/** Qualitative compatibility strength — never a raw number publicly (DoR §8.3). */
export type CompatibilityStrength = 'Low' | 'Medium' | 'High' | 'Reckless' | 'Solid';

export type CompatibilityBreakdownItem = {
  dimension: DeluluDimension;
  label: string;
  strength: CompatibilityStrength;
  kind: 'similarity' | 'complementary' | 'risk_managed';
};

export type MatchCandidate = {
  id: string;
  profile: UserProfile;
  matchScore: MatchScore;
  matchLabel: MatchLabel;
  explanation: MatchExplanation;
  compatibilityBreakdown: CompatibilityBreakdownItem[];
  isWildcard: boolean;
  wildcardReason?: WildcardReason;
  /** 1-based rank within the drop (wildcard uses rank 11). */
  rank: number;
  dropId: string;
  /** Top shared / mismatch dimensions, precomputed for analytics + UI. */
  topSharedDimensions: DeluluDimension[];
  topMismatchDimensions: DeluluDimension[];
};

export type WeeklyDrop = {
  id: string;
  userId: string;
  weekOf: string;
  curated: MatchCandidate[];
  wildcard: MatchCandidate;
  generatedAt: string;
  algorithmVersion: string;
};

// ---------------------------------------------------------------------------
// Marketplace context (spec §12.4)
// ---------------------------------------------------------------------------

export type MarketContext = {
  marketId: string;
  totalActiveUsers: number;
  activeUsersByGender: Record<string, number>;
  activeUsersByPreferenceCohort: Record<string, number>;
  weeklyMatchSupplyByCohort: Record<string, number>;
  weeklyMatchDemandByCohort: Record<string, number>;
  averageLikesPerUserByCohort: Record<string, number>;
  averageMatchRateByCohort: Record<string, number>;
  averageReplyRateByCohort: Record<string, number>;
  /** Median weekly impressions across the pool — over-served candidates exceed it. */
  cohortMedianImpressions: number;
};
