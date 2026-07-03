/**
 * Weekly drop generator (spec §16.3, DoR §7, §10, §11). Orchestrates the full
 * pipeline: eligibility → compatibility → marketplace balance → rank → wildcard
 * → attach explanations. Produces exactly 10 curated + 1 wildcard from mock
 * candidates. Deterministic (DoR §10.8): no Math.random; timestamps come from
 * options with stable defaults.
 */
import { env } from '@/config/env';
import { SCORE_COMPONENT_WEIGHTS } from '@/types';
import { getScores, scoreCompatibility } from './compatibilityService';
import type { CandidateScoring } from './compatibilityService';
import { filterEligible } from './eligibilityService';
import { scoreMarketplaceBalance } from './marketplaceBalanceService';
import type { MarketplaceResult } from './marketplaceBalanceService';
import { selectWildcard } from './wildcardService';
import type { WildcardCandidateInput } from './wildcardService';
import {
  assignMatchLabel,
  buildExplanation,
  buildWildcardExplanation,
} from './matchExplanationService';
import type {
  MarketContext,
  MatchCandidate,
  MatchScore,
  MatchScoreComponents,
  UserProfile,
  WeeklyDrop,
} from '@/types';

export const CURATED_COUNT = 10;

export function computeTotalScore(components: MatchScoreComponents): number {
  const total =
    SCORE_COMPONENT_WEIGHTS.deluluCompatibilityScore * components.deluluCompatibilityScore +
    SCORE_COMPONENT_WEIGHTS.intentFitScore * components.intentFitScore +
    SCORE_COMPONENT_WEIGHTS.attractionProxyScore * components.attractionProxyScore +
    SCORE_COMPONENT_WEIGHTS.conversationViabilityScore * components.conversationViabilityScore +
    SCORE_COMPONENT_WEIGHTS.marketplaceBalanceScore * components.marketplaceBalanceScore +
    SCORE_COMPONENT_WEIGHTS.noveltyScore * components.noveltyScore +
    SCORE_COMPONENT_WEIGHTS.safetyConfidenceScore * components.safetyConfidenceScore;
  return Math.round(total * 10) / 10;
}

type ScoredCandidate = {
  candidate: UserProfile;
  scoring: CandidateScoring;
  marketplace: MarketplaceResult;
  components: MatchScoreComponents;
  total: number;
};

export type GenerateDropOptions = {
  weekOf?: string;
  generatedAt?: string;
  dropId?: string;
};

export function generateWeeklyDrop(
  user: UserProfile,
  candidates: UserProfile[],
  context: MarketContext,
  options: GenerateDropOptions = {},
): WeeklyDrop {
  const weekOf = options.weekOf ?? '2026-W27';
  const generatedAt = options.generatedAt ?? `${weekOf}-generated`;
  const dropId = options.dropId ?? `drop-${user.id}-${weekOf}`;
  const algorithmVersion = env.matchAlgorithmVersion;

  // --- Eligibility (with flexibility-driven widening to prevent starvation) ---
  const flexibility = getScores(user).deluluFlexibility;
  let eligibility = filterEligible(user, candidates);
  if (eligibility.eligible.length < 30 && flexibility > 60) {
    eligibility = filterEligible(user, candidates, { widenDistance: true });
  }
  const eligible = eligibility.eligible;
  const poolSize = eligible.length;

  // --- Score every eligible candidate ---
  const scored: ScoredCandidate[] = eligible.map((candidate) => {
    const scoring = scoreCompatibility(user, candidate);
    const marketplace = scoreMarketplaceBalance({
      user,
      candidate,
      context,
      eligiblePoolSize: poolSize,
    });
    const components: MatchScoreComponents = {
      ...scoring.components,
      marketplaceBalanceScore: marketplace.score,
    };
    return { candidate, scoring, marketplace, components, total: computeTotalScore(components) };
  });

  // --- Rank; curated = top 10 (id tie-break for determinism) ---
  scored.sort((a, b) => b.total - a.total || (a.candidate.id < b.candidate.id ? -1 : 1));
  const curatedScored = scored.slice(0, CURATED_COUNT);
  const curatedIds = new Set(curatedScored.map((s) => s.candidate.id));

  // --- Wildcard from candidates outside the curated set ---
  const wildcardInputs: WildcardCandidateInput[] = scored.map((s) => ({
    candidate: s.candidate,
    deluluCompatibilityScore: s.scoring.components.deluluCompatibilityScore,
    noveltyScore: s.scoring.components.noveltyScore,
  }));
  const wildcardPick = selectWildcard(user, wildcardInputs, curatedIds);
  if (!wildcardPick) {
    throw new Error('weeklyDropService: no eligible candidate available for the wildcard slot');
  }
  const wildcardScored = scored.find((s) => s.candidate.id === wildcardPick.candidate.id)!;

  // --- Build curated MatchCandidates with explanations (never bare, DoR §11.2) ---
  const curated: MatchCandidate[] = curatedScored.map((s, index) => {
    const label = assignMatchLabel(user, s.candidate, s.scoring);
    const explanation = buildExplanation(user, s.candidate, s.scoring, s.marketplace, label);
    const matchScore: MatchScore = {
      total: s.total,
      components: s.components,
      algorithmVersion,
      reasonCodes: s.scoring.reasonCodes,
      marketplaceReasonCodes: s.marketplace.reasonCodes,
    };
    return {
      id: `${dropId}-${s.candidate.id}`,
      profile: s.candidate,
      matchScore,
      matchLabel: label,
      explanation,
      compatibilityBreakdown: s.scoring.compatibilityBreakdown,
      isWildcard: false,
      rank: index + 1,
      dropId,
      topSharedDimensions: s.scoring.topShared,
      topMismatchDimensions: s.scoring.topMismatch,
    };
  });

  // --- Build the wildcard MatchCandidate ---
  const wildExplanation = buildWildcardExplanation(
    user,
    wildcardScored.candidate,
    wildcardScored.scoring,
    wildcardPick.reason,
  );
  const wildcard: MatchCandidate = {
    id: `${dropId}-wildcard-${wildcardScored.candidate.id}`,
    profile: wildcardScored.candidate,
    matchScore: {
      total: wildcardScored.total,
      components: wildcardScored.components,
      algorithmVersion,
      reasonCodes: wildcardScored.scoring.reasonCodes,
      marketplaceReasonCodes: wildcardScored.marketplace.reasonCodes,
    },
    matchLabel: 'The Wildcard',
    explanation: wildExplanation,
    compatibilityBreakdown: wildcardScored.scoring.compatibilityBreakdown,
    isWildcard: true,
    wildcardReason: wildcardPick.reason,
    rank: CURATED_COUNT + 1,
    dropId,
    topSharedDimensions: wildcardScored.scoring.topShared,
    topMismatchDimensions: wildcardScored.scoring.topMismatch,
  };

  return {
    id: dropId,
    userId: user.id,
    weekOf,
    curated,
    wildcard,
    generatedAt,
    algorithmVersion,
  };
}
