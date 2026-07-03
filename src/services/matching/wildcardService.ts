/**
 * Wildcard selection (spec §12.6, DoR §9). The wildcard is deliberately NOT the
 * best match: it must pass safety + basic preference filters, must sit outside
 * the curated top-10, and is chosen for fun / unusual overlap. Deterministic.
 *
 * wildcardScore = 0.40·fun + 0.25·unusualOverlap + 0.15·conversationStarter
 *               + 0.10·novelty + 0.10·basicCompatibilityFloor
 */
import { average, clamp, seededRange } from '@/utils/hash';
import { getScores } from './compatibilityService';
import type { UserProfile, WildcardReason } from '@/types';

export type WildcardScoreBreakdown = {
  funScore: number;
  unusualOverlapScore: number;
  conversationStarterScore: number;
  noveltyScore: number;
  basicCompatibilityFloor: number;
};

export type WildcardCandidateInput = {
  candidate: UserProfile;
  deluluCompatibilityScore: number;
  noveltyScore: number;
};

export type WildcardComputation = {
  candidate: UserProfile;
  wildcardScore: number;
  breakdown: WildcardScoreBreakdown;
  reason: WildcardReason;
};

function determineReason(user: UserProfile, candidate: UserProfile): WildcardReason {
  const u = getScores(user);
  const c = getScores(candidate);
  if (candidate.absurdInterest) return 'shared_absurd_interest';
  if (u.chaosAppetite > 65 && c.chaosAppetite > 65) return 'high_chaos_overlap';
  if (Math.abs(u.stabilityNeed - c.stabilityNeed) > 40 || Math.abs(u.chaosAppetite - c.chaosAppetite) > 40)
    return 'opposites_for_the_plot';
  if (u.loreDependency > 60 && c.loreDependency > 60) return 'unexpected_lore_match';
  if (Math.abs(u.textTemperature - c.textTemperature) > 35) return 'text_chemistry_experiment';
  return 'profile_prompt_too_funny_to_ignore';
}

export function computeWildcardBreakdown(
  user: UserProfile,
  input: WildcardCandidateInput,
): WildcardScoreBreakdown {
  const { candidate, deluluCompatibilityScore, noveltyScore } = input;
  const u = getScores(user);
  const c = getScores(candidate);

  const funScore = candidate.wildcardPotential ?? Math.round(seededRange(`fun:${candidate.id}`, 40, 90));
  const freakOverlap = 100 - Math.abs(u.freakMatchSpecificity - c.freakMatchSpecificity);
  const chaosOverlap = 100 - Math.abs(u.chaosAppetite - c.chaosAppetite);
  const absurdBonus = candidate.absurdInterest ? 20 : 0;
  const unusualOverlapScore = clamp(average([freakOverlap, chaosOverlap]) * 0.85 + absurdBonus, 0, 100);
  const conversationStarterScore = clamp(average([funScore, c.textTemperature, c.bitCommitment]), 0, 100);

  return {
    funScore,
    unusualOverlapScore,
    conversationStarterScore,
    noveltyScore,
    basicCompatibilityFloor: deluluCompatibilityScore,
  };
}

export function wildcardScoreFromBreakdown(b: WildcardScoreBreakdown): number {
  return clamp(
    Math.round(
      0.4 * b.funScore +
        0.25 * b.unusualOverlapScore +
        0.15 * b.conversationStarterScore +
        0.1 * b.noveltyScore +
        0.1 * b.basicCompatibilityFloor,
    ),
    0,
    100,
  );
}

/**
 * Pick one wildcard from candidates NOT in the curated set. Returns null only if
 * there are no remaining candidates. Deterministic (max score, id tie-break).
 */
export function selectWildcard(
  user: UserProfile,
  candidates: WildcardCandidateInput[],
  excludeIds: Set<string>,
): WildcardComputation | null {
  const pool = candidates.filter((c) => !excludeIds.has(c.candidate.id));
  if (pool.length === 0) return null;

  const scored: WildcardComputation[] = pool.map((input) => {
    const breakdown = computeWildcardBreakdown(user, input);
    return {
      candidate: input.candidate,
      wildcardScore: wildcardScoreFromBreakdown(breakdown),
      breakdown,
      reason: determineReason(user, input.candidate),
    };
  });

  scored.sort(
    (a, b) => b.wildcardScore - a.wildcardScore || (a.candidate.id < b.candidate.id ? -1 : 1),
  );
  return scored[0];
}
