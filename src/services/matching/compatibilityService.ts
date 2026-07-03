/**
 * Delulu compatibility + the six non-marketplace score components (spec §12.2–§12.3,
 * DoR §10.2–§10.4). Pure and deterministic — no Math.random, no clock.
 *
 * Three dimension classes combine differently:
 *  - similarity     → close is better
 *  - complementary  → a moderate difference is ideal
 *  - risk_managed   → large mismatches sharply reduce the score
 *
 * Repair Reflex is an extra strong modifier: low average repair reflex combined
 * with high chaos/delulu/text applies a penalty (spec example: −18).
 */
import {
  DELULU_DIMENSIONS,
  DIMENSION_BASELINE,
  DIMENSION_COMPATIBILITY_CLASS,
  DIMENSION_LABELS,
} from '@/types';
import { average, clamp, seededRange } from '@/utils/hash';
import type {
  CompatibilityBreakdownItem,
  CompatibilityClass,
  CompatibilityStrength,
  DeluluDimension,
  DeluluScores,
  MatchScoreComponents,
  UserProfile,
} from '@/types';

function baselineScores(): DeluluScores {
  const scores = {} as DeluluScores;
  for (const dimension of DELULU_DIMENSIONS) scores[dimension] = DIMENSION_BASELINE;
  return scores;
}

export function getScores(profile: UserProfile): DeluluScores {
  return profile.deluluScores ?? profile.deluluProfile?.scores ?? baselineScores();
}

/** Per-dimension compatibility contribution in 0–100. */
export function contributionFor(kind: CompatibilityClass, a: number, b: number): number {
  const diff = Math.abs(a - b);
  switch (kind) {
    case 'similarity':
      return clamp(100 - diff, 0, 100);
    case 'complementary':
      // Peak around a 30-point difference; extreme gaps still fall off.
      return clamp(100 - Math.abs(diff - 30) - Math.max(0, diff - 60) * 0.5, 0, 100);
    case 'risk_managed':
      return clamp(100 - diff * 1.25, 0, 100);
    default:
      return clamp(100 - diff, 0, 100);
  }
}

export function strengthFor(kind: CompatibilityClass, contribution: number): CompatibilityStrength {
  if (kind === 'risk_managed') {
    if (contribution >= 75) return 'Solid';
    if (contribution >= 55) return 'Medium';
    if (contribution >= 35) return 'Low';
    return 'Reckless';
  }
  if (contribution >= 78) return 'High';
  if (contribution >= 58) return 'Medium';
  if (contribution >= 38) return 'Low';
  return 'Reckless';
}

export type DimensionComparison = {
  dimension: DeluluDimension;
  kind: CompatibilityClass;
  userScore: number;
  candidateScore: number;
  contribution: number;
  strength: CompatibilityStrength;
};

/** Dimensions that participate in the paired compatibility average. */
const PAIRED_DIMENSIONS: DeluluDimension[] = DELULU_DIMENSIONS.filter(
  (d) => d !== 'deluluFlexibility',
);

function compareDimensions(user: DeluluScores, candidate: DeluluScores): DimensionComparison[] {
  return DELULU_DIMENSIONS.map((dimension) => {
    const kind = DIMENSION_COMPATIBILITY_CLASS[dimension];
    const userScore = user[dimension];
    const candidateScore = candidate[dimension];
    const contribution = contributionFor(kind, userScore, candidateScore);
    return {
      dimension,
      kind,
      userScore,
      candidateScore,
      contribution,
      strength: strengthFor(kind, contribution),
    };
  });
}

/** Repair-reflex risk modifier (spec §12.3 example). */
export function repairRiskPenalty(user: DeluluScores, candidate: DeluluScores): number {
  const avgRepair = average([user.repairReflex, candidate.repairReflex]);
  const avgChaosTextDelulu = average([
    user.chaosAppetite,
    candidate.chaosAppetite,
    user.textTemperature,
    candidate.textTemperature,
    user.deluluIndex,
    candidate.deluluIndex,
  ]);
  return avgRepair < 45 && avgChaosTextDelulu > 65 ? -18 : 0;
}

export type CandidateScoring = {
  components: Omit<MatchScoreComponents, 'marketplaceBalanceScore'>;
  comparisons: DimensionComparison[];
  topShared: DeluluDimension[];
  topMismatch: DeluluDimension[];
  compatibilityBreakdown: CompatibilityBreakdownItem[];
  reasonCodes: string[];
  repairRiskApplied: boolean;
};

function deluluCompatibility(comparisons: DimensionComparison[], penalty: number): number {
  const paired = comparisons.filter((c) => PAIRED_DIMENSIONS.includes(c.dimension));
  const base = average(paired.map((c) => c.contribution));
  return clamp(base + penalty, 0, 100);
}

function intentFit(user: UserProfile, candidate: UserProfile): number {
  const a = user.relationshipIntent;
  const b = candidate.relationshipIntent;
  let base: number;
  if (a === b) base = 88;
  else if (a === 'unsure' || b === 'unsure' || a === 'open_to_seeing' || b === 'open_to_seeing')
    base = 72;
  else if ((a === 'serious' && b === 'casual') || (a === 'casual' && b === 'serious')) base = 45;
  else base = 66;

  const um = user.preferences.monogamyStyle;
  const cm = candidate.preferences.monogamyStyle;
  let mono = 0;
  if (um === cm) mono = 6;
  else if ((um === 'monogamous' && cm === 'open') || (um === 'open' && cm === 'monogamous')) mono = -10;
  return clamp(base + mono, 0, 100);
}

function attractionProxy(user: UserProfile, candidate: UserProfile): number {
  const base = seededRange(`attraction:${user.id}:${candidate.id}`, 55, 92);
  const ageBonus = Math.max(0, 10 - Math.abs(user.age - candidate.age));
  return clamp(base + ageBonus, 0, 100);
}

function conversationViability(user: DeluluScores, candidate: DeluluScores): number {
  const textCompat = 100 - Math.abs(user.textTemperature - candidate.textTemperature);
  const repairAvg = average([user.repairReflex, candidate.repairReflex]);
  const ghostAvg = average([user.ghostTolerance, candidate.ghostTolerance]);
  return clamp(0.4 * textCompat + 0.35 * repairAvg + 0.25 * ghostAvg, 0, 100);
}

function novelty(user: DeluluScores, candidate: UserProfile, candidateScores: DeluluScores): number {
  const avgDiff = average(PAIRED_DIMENSIONS.map((d) => Math.abs(user[d] - candidateScores[d])));
  return clamp(0.6 * avgDiff + 0.4 * (candidate.wildcardPotential ?? 50), 0, 100);
}

function safetyConfidence(candidate: UserProfile): number {
  if (candidate.safetyExcluded) return 0;
  return Math.round(seededRange(`safety:${candidate.id}`, 82, 97));
}

function buildReasonCodes(
  comparisons: DimensionComparison[],
  user: DeluluScores,
  candidate: DeluluScores,
  repairRiskApplied: boolean,
): string[] {
  const codes: string[] = [];
  const by = (d: DeluluDimension) => comparisons.find((c) => c.dimension === d)!;

  if (by('bitCommitment').contribution >= 75 && user.bitCommitment > 60 && candidate.bitCommitment > 60)
    codes.push('high_bit_commitment_overlap');
  if (by('loreDependency').contribution >= 70 && user.loreDependency > 60 && candidate.loreDependency > 60)
    codes.push('shared_lore_dependency');
  if (by('freakMatchSpecificity').contribution >= 72)
    codes.push('shared_niche_specificity');
  if (by('chaosAppetite').kind === 'complementary' && by('chaosAppetite').contribution >= 70)
    codes.push('complementary_chaos_stability');
  if (by('textTemperature').contribution < 45) codes.push('text_temperature_gap');
  if (by('ickVelocity').contribution < 45) codes.push('ick_velocity_risk');
  if (repairRiskApplied) codes.push('repair_reflex_risk');
  if (codes.length === 0) codes.push('baseline_compatibility');
  return codes;
}

export function scoreCompatibility(user: UserProfile, candidate: UserProfile): CandidateScoring {
  const userScores = getScores(user);
  const candidateScores = getScores(candidate);
  const comparisons = compareDimensions(userScores, candidateScores);
  const penalty = repairRiskPenalty(userScores, candidateScores);
  const repairRiskApplied = penalty !== 0;

  const components: Omit<MatchScoreComponents, 'marketplaceBalanceScore'> = {
    deluluCompatibilityScore: deluluCompatibility(comparisons, penalty),
    intentFitScore: intentFit(user, candidate),
    attractionProxyScore: attractionProxy(user, candidate),
    conversationViabilityScore: conversationViability(userScores, candidateScores),
    noveltyScore: novelty(userScores, candidate, candidateScores),
    safetyConfidenceScore: safetyConfidence(candidate),
  };

  // Rank by contribution for shared (highest) and mismatch (lowest), tie-broken
  // by fixed dimension order for determinism.
  const orderIndex = (d: DeluluDimension) => DELULU_DIMENSIONS.indexOf(d);
  const paired = comparisons.filter((c) => PAIRED_DIMENSIONS.includes(c.dimension));
  const bySharedDesc = [...paired].sort(
    (x, y) => y.contribution - x.contribution || orderIndex(x.dimension) - orderIndex(y.dimension),
  );
  const byMismatchAsc = [...paired].sort(
    (x, y) => x.contribution - y.contribution || orderIndex(x.dimension) - orderIndex(y.dimension),
  );
  const topShared = bySharedDesc.slice(0, 3).map((c) => c.dimension);
  const topMismatch = byMismatchAsc
    .filter((c) => !topShared.includes(c.dimension))
    .slice(0, 3)
    .map((c) => c.dimension);

  const breakdownDims = [...topShared, ...topMismatch];
  const compatibilityBreakdown: CompatibilityBreakdownItem[] = breakdownDims.map((dimension) => {
    const c = comparisons.find((cmp) => cmp.dimension === dimension)!;
    return { dimension, label: DIMENSION_LABELS[dimension], strength: c.strength, kind: c.kind };
  });

  return {
    components,
    comparisons,
    topShared,
    topMismatch,
    compatibilityBreakdown,
    reasonCodes: buildReasonCodes(comparisons, userScores, candidateScores, repairRiskApplied),
    repairRiskApplied,
  };
}
