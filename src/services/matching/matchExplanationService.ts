/**
 * Match labels, explanation copy, compatibility narrative, and suggested openers
 * (spec §7.5, §8.8, §8.9; DoR §8, §11). Every match gets a full MatchExplanation —
 * a match without one must fail generation (DoR §11.2), never render lorem.
 *
 * Deterministic: copy is chosen by data + a stable hash, never Math.random.
 */
import { DIMENSION_LABELS } from '@/types';
import { hashString } from '@/utils/hash';
import { getScores } from './compatibilityService';
import type { CandidateScoring } from './compatibilityService';
import type { MarketplaceResult } from './marketplaceBalanceService';
import type {
  DeluluDimension,
  MatchExplanation,
  MatchLabel,
  UserProfile,
  WildcardReason,
} from '@/types';

const SHARED_PHRASE: Partial<Record<DeluluDimension, string>> = {
  bitCommitment: 'you both commit to the bit',
  loreDependency: 'you both build lore out of nothing',
  freakMatchSpecificity: 'your niche interests line up suspiciously well',
  textTemperature: 'your texting runs at the same temperature',
  chaosAppetite: 'your appetite for controlled chaos matches',
  mainCharacterEnergy: 'you both narrate your own scenes',
  softLaunchTemperature: 'you soft-launch on the same timeline',
  stabilityNeed: 'you want the same amount of steadiness',
  romanticRiskAppetite: 'you escalate at a similar speed',
  deluluIndex: 'you build the fantasy from the same amount of evidence',
  ghostTolerance: 'you handle ambiguity the same way',
  repairReflex: 'you both know how to reset after it gets weird',
  ickVelocity: 'your ick thresholds are aligned',
};

const CLASH_PHRASE: Partial<Record<DeluluDimension, string>> = {
  textTemperature: 'one of you texts like a novel, the other like a receipt',
  chaosAppetite: 'one of you wants a plan, the other wants the airport',
  stabilityNeed: 'your need for predictability sits in different places',
  ghostTolerance: 'one of you spirals while the other assumes a ravine',
  repairReflex: 'when it gets awkward, only one of you reaches for the reset',
  ickVelocity: 'a small detail could end the bloodline faster for one of you',
  romanticRiskAppetite: 'one of you sprints while the other slow-burns',
  deluluIndex: 'one of you needs receipts, the other already named the dog',
  loreDependency: 'one sees signs everywhere; the other sees a parking spot',
  bitCommitment: 'one of you would drop the bit far too early',
  mainCharacterEnergy: 'two main characters can crowd a single scene',
  freakMatchSpecificity: 'your specific flavors of weird might not overlap',
};

const OPENERS: string[] = [
  'Be honest — what’s the smallest thing you’ve ever turned into lore?',
  'Settle a debate for me: is a hot dog a sandwich, or is it a lifestyle?',
  'What’s a normal thing you’ve made deeply weird lately?',
  'On a scale from “coffee” to “errand date,” how do we start?',
  'Tell me your most harmless red flag and I’ll raise you one.',
  'Quick: what’s the plot of our first date, genre included?',
];

function phraseFor(dimension: DeluluDimension, map: Partial<Record<DeluluDimension, string>>): string {
  return map[dimension] ?? `your ${DIMENSION_LABELS[dimension].toLowerCase()} lines up in an interesting way`;
}

export function assignMatchLabel(
  user: UserProfile,
  candidate: UserProfile,
  scoring: CandidateScoring,
): MatchLabel {
  const compat = scoring.components.deluluCompatibilityScore;
  const shared = scoring.topShared;
  const codes = scoring.reasonCodes;
  const u = getScores(user);
  const c = getScores(candidate);

  if (scoring.repairRiskApplied && compat >= 52) return 'Dangerous But Probably Fine';
  if (shared.includes('bitCommitment') && shared.includes('freakMatchSpecificity') && compat >= 72)
    return 'Exact Freak Match';
  if (codes.includes('text_temperature_gap')) return 'Text Chemistry Risk';
  if (codes.includes('shared_lore_dependency')) return 'Lore-Compatible';
  if (u.softLaunchTemperature > 60 && c.softLaunchTemperature > 60) return 'Soft Launch Material';
  if (codes.includes('complementary_chaos_stability')) return 'Complementary Delulu';
  if (u.romanticRiskAppetite < 45 && c.romanticRiskAppetite < 45 && (u.stabilityNeed + c.stabilityNeed) / 2 > 55)
    return 'Slow Burn Wildcard';
  if (scoring.components.noveltyScore > 70) return 'Good For The Plot';
  return 'Complementary Delulu';
}

function pickOpener(user: UserProfile, candidate: UserProfile, shared: DeluluDimension[]): string {
  if (shared.includes('loreDependency') || shared.includes('bitCommitment')) return OPENERS[0];
  const idx = hashString(`opener:${user.id}:${candidate.id}`) % OPENERS.length;
  return OPENERS[idx];
}

export function buildExplanation(
  user: UserProfile,
  candidate: UserProfile,
  scoring: CandidateScoring,
  marketplace: MarketplaceResult,
  label: MatchLabel,
): MatchExplanation {
  const shared = scoring.topShared;
  const mismatch = scoring.topMismatch;
  const sharedPhrases = shared.slice(0, 2).map((d) => phraseFor(d, SHARED_PHRASE));
  const clashPhrase = mismatch[0] ? phraseFor(mismatch[0], CLASH_PHRASE) : 'you round each other out';

  const whyYouMightMatch =
    sharedPhrases.length > 0
      ? `${capitalize(sharedPhrases[0])}${sharedPhrases[1] ? `, and ${sharedPhrases[1]}` : ''}. The joke is unlikely to die early.`
      : `You round each other out in a way that could actually work.`;

  const whereItCouldGetUnhinged = `${capitalize(clashPhrase)}. This could become tension — or a group chat emergency.`;

  const marketplaceNote = marketplace.widenApplied
    ? 'We widened your radius a little to keep the plot moving.'
    : undefined;

  return {
    headline: label,
    whyYouMightMatch,
    whereItCouldGetUnhinged,
    suggestedOpener: pickOpener(user, candidate, shared),
    sharedDimensions: shared,
    mismatchDimensions: mismatch,
    marketplaceNote,
  };
}

export function buildWildcardExplanation(
  user: UserProfile,
  candidate: UserProfile,
  scoring: CandidateScoring,
  reason: WildcardReason,
): MatchExplanation {
  const shared = scoring.topShared;
  const mismatch = scoring.topMismatch;
  const clash = mismatch[0] ? phraseFor(mismatch[0], CLASH_PHRASE) : 'you are wired differently';
  const sharedPhrase = shared[0] ? phraseFor(shared[0], SHARED_PHRASE) : 'your chaos scores overlap';

  const REASON_COPY: Record<WildcardReason, { fun: string; testing: string }> = {
    shared_absurd_interest: {
      fun: `You share one gloriously specific interest that most people would never admit to.`,
      testing: 'Whether a single shared obsession can carry an entire first date.',
    },
    high_chaos_overlap: {
      fun: `Your shared chaos score is frankly obscene and that tends to be fun in person.`,
      testing: 'Whether two high-chaos people create sparks or a small controlled fire.',
    },
    opposites_for_the_plot: {
      fun: `You are opposites in the exact ways that make a good story later.`,
      testing: 'Whether opposites actually attract or just narrate very different weeks.',
    },
    unexpected_lore_match: {
      fun: `Your lore somehow rhymes even though nothing else about you does.`,
      testing: 'Whether a shared way of building meaning beats surface-level mismatch.',
    },
    text_chemistry_experiment: {
      fun: `Your texting temperatures are wildly different, which is either a disaster or great content.`,
      testing: 'Whether opposite text energies can find a rhythm.',
    },
    profile_prompt_too_funny_to_ignore: {
      fun: `One of their profile prompts was too funny to leave out of your week.`,
      testing: 'Whether a great sense of humor outruns a mediocre compatibility score.',
    },
  };

  const copy = REASON_COPY[reason];
  return {
    headline: 'The Wildcard',
    whyYouMightMatch: `Not the cleanest match — but ${sharedPhrase}.`,
    whereItCouldGetUnhinged: `${capitalize(clash)}.`,
    suggestedOpener: pickOpener(user, candidate, shared),
    sharedDimensions: shared,
    mismatchDimensions: mismatch,
    whyNotACleanMatch: `On paper the numbers don’t line up: ${clash}.`,
    whyItMightStillBeFun: copy.fun,
    whatWeAreTesting: copy.testing,
  };
}

function capitalize(text: string): string {
  return text.length ? text[0].toUpperCase() + text.slice(1) : text;
}
