/**
 * Hard eligibility filters (spec §12.1, DoR §10.1). Runs BEFORE scoring and
 * removes any candidate failing a hard filter. Pure + deterministic.
 */
import type { UserProfile } from '@/types';

export type EligibilityReason =
  | 'incompatible_age'
  | 'incompatible_gender_preference'
  | 'outside_distance'
  | 'blocked'
  | 'already_matched'
  | 'recently_skipped'
  | 'safety_excluded'
  | 'intent_hard_mismatch';

export type EligibilityRemoval = {
  candidate: UserProfile;
  reasons: EligibilityReason[];
};

export type EligibilityResult = {
  eligible: UserProfile[];
  removed: EligibilityRemoval[];
  widenedDistance: boolean;
};

const GENDER_TO_INTEREST_LABEL: Record<string, string> = {
  Woman: 'Women',
  Man: 'Men',
  Nonbinary: 'Nonbinary people',
};

/** Does `gender` satisfy an `interestedIn` list? "Everyone" matches all. */
export function genderMatchesPreference(gender: string, interestedIn: string[]): boolean {
  if (interestedIn.includes('Everyone')) return true;
  const label = GENDER_TO_INTEREST_LABEL[gender] ?? gender;
  return interestedIn.includes(label);
}

/** Two-sided gender compatibility: each side must want the other's gender. */
export function isGenderCompatible(user: UserProfile, candidate: UserProfile): boolean {
  return (
    genderMatchesPreference(candidate.gender, user.interestedIn) &&
    genderMatchesPreference(user.gender, candidate.interestedIn)
  );
}

/** Two-sided age compatibility against each side's preferred range. */
export function isAgeCompatible(user: UserProfile, candidate: UserProfile): boolean {
  const inUserRange =
    candidate.age >= user.preferences.ageRange.min && candidate.age <= user.preferences.ageRange.max;
  const inCandidateRange =
    user.age >= candidate.preferences.ageRange.min && user.age <= candidate.preferences.ageRange.max;
  return inUserRange && inCandidateRange;
}

/** Distance filter. Radius widens when the user opted in (marketplace starvation). */
export function isWithinDistance(user: UserProfile, candidate: UserProfile, widen: boolean): boolean {
  const distance = candidate.distanceMiles ?? 0;
  const base = user.preferences.maxDistanceMiles;
  const limit = widen ? base * 2 : base;
  return distance <= limit;
}

/** A hard intent conflict is serious-vs-casual; unsure/open never hard-conflict. */
function isIntentHardMismatch(user: UserProfile, candidate: UserProfile): boolean {
  if (!user.preferences.intentIsDealbreaker) return false;
  const a = user.relationshipIntent;
  const b = candidate.relationshipIntent;
  const conflict =
    (a === 'serious' && b === 'casual') || (a === 'casual' && b === 'serious');
  return conflict;
}

export type FilterOptions = { widenDistance?: boolean };

export function filterEligible(
  user: UserProfile,
  candidates: UserProfile[],
  options: FilterOptions = {},
): EligibilityResult {
  const widen = options.widenDistance ?? user.preferences.allowWiderRadius ?? false;
  const eligible: UserProfile[] = [];
  const removed: EligibilityRemoval[] = [];

  for (const candidate of candidates) {
    if (candidate.id === user.id) continue;
    const reasons: EligibilityReason[] = [];

    if (candidate.safetyExcluded) reasons.push('safety_excluded');
    if (candidate.blocked) reasons.push('blocked');
    if (candidate.alreadyMatched) reasons.push('already_matched');
    if (candidate.recentlySkipped) reasons.push('recently_skipped');
    if (!isGenderCompatible(user, candidate)) reasons.push('incompatible_gender_preference');
    if (!isAgeCompatible(user, candidate)) reasons.push('incompatible_age');
    if (!isWithinDistance(user, candidate, widen)) reasons.push('outside_distance');
    if (isIntentHardMismatch(user, candidate)) reasons.push('intent_hard_mismatch');

    if (reasons.length === 0) {
      eligible.push(candidate);
    } else {
      removed.push({ candidate, reasons });
    }
  }

  return { eligible, removed, widenedDistance: widen };
}
