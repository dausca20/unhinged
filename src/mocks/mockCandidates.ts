/**
 * Mock candidate pool (spec §12, §15; DoR §16.7). ≥30 users with varied gender,
 * interestedIn, intent, scores, match velocities, exposure, and wildcard
 * potential — plus a couple of safety-excluded users to prove the safety filter.
 *
 * Candidates are expanded from compact seeds by a deterministic builder (no
 * Math.random) so scores stay varied but reproducible.
 */
import { generateDeluluProfile } from '@/services/delulu/deluluTypeService';
import { hashString } from '@/utils/hash';
import { DELULU_DIMENSIONS } from '@/types';
import type {
  DeluluScores,
  MatchStyle,
  MatchVelocity,
  MonogamyStyle,
  ProfilePhoto,
  ProfilePrompt,
  RelationshipIntent,
  UserProfile,
} from '@/types';

type Archetype =
  | 'highLoreDelulu'
  | 'bitGoblin'
  | 'textMystic'
  | 'chaosAgent'
  | 'stabilizer'
  | 'softLaunchRomantic'
  | 'nomad'
  | 'nicheFreak';

const BASE: Record<Archetype, Partial<DeluluScores>> = {
  highLoreDelulu: { deluluIndex: 82, loreDependency: 84, bitCommitment: 70, textTemperature: 72, mainCharacterEnergy: 68, softLaunchTemperature: 64, ghostTolerance: 40, stabilityNeed: 44 },
  bitGoblin: { bitCommitment: 88, freakMatchSpecificity: 80, chaosAppetite: 66, mainCharacterEnergy: 72, loreDependency: 60, repairReflex: 58 },
  textMystic: { textTemperature: 86, ghostTolerance: 30, deluluIndex: 72, loreDependency: 66, stabilityNeed: 48, repairReflex: 46 },
  chaosAgent: { chaosAppetite: 84, romanticRiskAppetite: 76, repairReflex: 70, stabilityNeed: 34, mainCharacterEnergy: 64 },
  stabilizer: { stabilityNeed: 82, repairReflex: 68, chaosAppetite: 30, deluluIndex: 36, romanticRiskAppetite: 34, textTemperature: 44 },
  softLaunchRomantic: { softLaunchTemperature: 80, loreDependency: 68, deluluIndex: 64, mainCharacterEnergy: 62, bitCommitment: 58 },
  nomad: { ghostTolerance: 80, stabilityNeed: 36, chaosAppetite: 58, romanticRiskAppetite: 52, deluluIndex: 44 },
  nicheFreak: { freakMatchSpecificity: 84, loreDependency: 62, bitCommitment: 66, ickVelocity: 66, mainCharacterEnergy: 58 },
};

function buildScores(id: string, archetype: Archetype, overrides: Partial<DeluluScores>): DeluluScores {
  const scores = {} as DeluluScores;
  const base = BASE[archetype];
  for (const dimension of DELULU_DIMENSIONS) {
    const seed = base[dimension] ?? 50;
    // Deterministic ±6 jitter keeps the pool varied without Math.random.
    const jitter = (hashString(`${id}:${dimension}`) % 13) - 6;
    scores[dimension] = Math.max(0, Math.min(100, seed + jitter));
  }
  return { ...scores, ...overrides } as DeluluScores;
}

const PLACEHOLDER_PHOTO_LABELS = ['Main', 'Out & about', 'The bit', 'Candid', 'For the plot'];

function buildPhotos(id: string): ProfilePhoto[] {
  const count = 3 + (hashString(`photos:${id}`) % 3); // 3–5 photos
  return Array.from({ length: count }, (_, i) => ({
    id: `${id}-photo-${i}`,
    placeholderTint: hashString(`${id}:tint:${i}`) % 6,
    label: PLACEHOLDER_PHOTO_LABELS[i % PLACEHOLDER_PHOTO_LABELS.length],
    isMain: i === 0,
  }));
}

const PROMPT_BANK: { prompt: string; answers: string[] }[] = [
  {
    prompt: 'My most harmless red flag is…',
    answers: [
      'I narrate my own errands like a nature documentary.',
      'I will re-tell a story to make the timeline more dramatic.',
      'I have strong, unprompted opinions about everyone’s coffee order.',
    ],
  },
  {
    prompt: 'A normal thing I’ve made weird is…',
    answers: [
      'Grocery shopping. It’s a whole cinematic experience now.',
      'Assigning lore to the pigeons on my block.',
      'Texting back. I treat it like a screenplay.',
    ],
  },
  {
    prompt: 'The fastest way to make me delulu is…',
    answers: [
      'One well-timed voice note and I’ve planned the wedding.',
      'Remember a small thing I said three weeks ago.',
      'Commit to a bit with me, fully, no notes.',
    ],
  },
  {
    prompt: 'My green flag that sounds like a red flag is…',
    answers: [
      'I will talk about the relationship, out loud, like an adult.',
      'I reset the vibe the second it gets weird.',
      'I’m suspiciously calm and I actually mean it.',
    ],
  },
  {
    prompt: 'I will commit to the bit if…',
    answers: [
      'You start it and never break character first.',
      'It has escalating stakes and a fake backstory.',
      'It can be referenced two weeks later without context.',
    ],
  },
];

function buildPrompts(id: string): ProfilePrompt[] {
  const start = hashString(`prompts:${id}`) % PROMPT_BANK.length;
  return Array.from({ length: 3 }, (_, i) => {
    const entry = PROMPT_BANK[(start + i) % PROMPT_BANK.length];
    const answer = entry.answers[hashString(`${id}:ans:${i}`) % entry.answers.length];
    return { id: `${id}-prompt-${i}`, prompt: entry.prompt, answer };
  });
}

function buildVelocity(id: string, seed: Partial<MatchVelocity>): MatchVelocity {
  return {
    userId: id,
    weeklyDropViews: seed.weeklyDropViews ?? hashString(`v1:${id}`) % 12,
    weeklyLikesSent: seed.weeklyLikesSent ?? hashString(`v2:${id}`) % 8,
    weeklyLikesReceived: seed.weeklyLikesReceived ?? hashString(`v3:${id}`) % 20,
    mutualMatches: seed.mutualMatches ?? hashString(`v4:${id}`) % 4,
    conversationsStarted: seed.conversationsStarted ?? hashString(`v5:${id}`) % 5,
    repliesReceived: seed.repliesReceived ?? hashString(`v6:${id}`) % 5,
  };
}

type Seed = {
  id: string;
  firstName: string;
  age: number;
  gender: string;
  interestedIn: string[];
  city: string;
  region: string;
  intent: RelationshipIntent;
  monogamy: MonogamyStyle;
  matchStyle: MatchStyle;
  archetype: Archetype;
  flexibility: number;
  distanceMiles: number;
  weeklyImpressions: number;
  wildcardPotential: number;
  bio: string;
  overrides?: Partial<DeluluScores>;
  absurdInterest?: string;
  safetyExcluded?: boolean;
  blocked?: boolean;
  alreadyMatched?: boolean;
  recentlySkipped?: boolean;
};

const SEEDS: Seed[] = [
  { id: 'c01', firstName: 'Maya', age: 28, gender: 'Woman', interestedIn: ['Men', 'Everyone'], city: 'Brooklyn', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_slow_burn', archetype: 'softLaunchRomantic', flexibility: 62, distanceMiles: 4, weeklyImpressions: 18, wildcardPotential: 40, bio: 'High-lore, low-key, will absolutely soft-launch you by date two.' },
  { id: 'c02', firstName: 'Devon', age: 31, gender: 'Man', interestedIn: ['Women'], city: 'Brooklyn', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_stabilizing', archetype: 'stabilizer', flexibility: 44, distanceMiles: 7, weeklyImpressions: 9, wildcardPotential: 25, bio: 'Emotionally stable, occasionally feral, always on time.' },
  { id: 'c03', firstName: 'Priya', age: 27, gender: 'Woman', interestedIn: ['Everyone'], city: 'Jersey City', region: 'NJ', intent: 'casual', monogamy: 'open', matchStyle: 'more_chaotic_spark', archetype: 'chaosAgent', flexibility: 78, distanceMiles: 12, weeklyImpressions: 22, wildcardPotential: 72, bio: 'Let’s go to the airport and pick a city. I’m serious. Mostly.' },
  { id: 'c04', firstName: 'Theo', age: 30, gender: 'Man', interestedIn: ['Women', 'Nonbinary people'], city: 'Queens', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_freak_match', archetype: 'bitGoblin', flexibility: 55, distanceMiles: 15, weeklyImpressions: 14, wildcardPotential: 68, bio: 'Currently in a months-long fake feud with a specific yogurt brand.', absurdInterest: 'competitive birdwatching lore' },
  { id: 'c05', firstName: 'Nadia', age: 29, gender: 'Woman', interestedIn: ['Men'], city: 'Hoboken', region: 'NJ', intent: 'open_to_seeing', monogamy: 'unsure', matchStyle: 'surprise_me', archetype: 'textMystic', flexibility: 70, distanceMiles: 9, weeklyImpressions: 30, wildcardPotential: 55, bio: 'My punctuation has a weather system. You’ve been warned.' },
  { id: 'c06', firstName: 'Iris', age: 26, gender: 'Woman', interestedIn: ['Everyone'], city: 'Brooklyn', region: 'NY', intent: 'casual', monogamy: 'open', matchStyle: 'more_chaotic_spark', archetype: 'nicheFreak', flexibility: 66, distanceMiles: 6, weeklyImpressions: 11, wildcardPotential: 80, bio: 'I need someone who understands why a haunted aquarium is romantic.', absurdInterest: 'haunted aquarium enthusiast' },
  { id: 'c07', firstName: 'Marcus', age: 33, gender: 'Man', interestedIn: ['Women'], city: 'Manhattan', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_slow_burn', archetype: 'nomad', flexibility: 50, distanceMiles: 10, weeklyImpressions: 7, wildcardPotential: 35, bio: 'Unbothered, low drama, allergic to a guilt trip.' },
  { id: 'c08', firstName: 'Simone', age: 32, gender: 'Woman', interestedIn: ['Men', 'Women'], city: 'Brooklyn', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_stabilizing', archetype: 'highLoreDelulu', flexibility: 58, distanceMiles: 3, weeklyImpressions: 25, wildcardPotential: 45, bio: 'Every parking spot is a sign and I have the receipts.' },
  { id: 'c09', firstName: 'Kai', age: 27, gender: 'Nonbinary', interestedIn: ['Everyone'], city: 'Queens', region: 'NY', intent: 'casual', monogamy: 'open', matchStyle: 'more_freak_match', archetype: 'bitGoblin', flexibility: 74, distanceMiles: 18, weeklyImpressions: 16, wildcardPotential: 77, bio: 'Will build a legal case about whether soup is a beverage.', absurdInterest: 'soup jurisprudence' },
  { id: 'c10', firstName: 'Elena', age: 30, gender: 'Woman', interestedIn: ['Men'], city: 'Manhattan', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_slow_burn', archetype: 'stabilizer', flexibility: 38, distanceMiles: 22, weeklyImpressions: 6, wildcardPotential: 20, bio: 'Consistency is my love language. Surprise me gently.' },
  { id: 'c11', firstName: 'Rafael', age: 34, gender: 'Man', interestedIn: ['Women', 'Nonbinary people'], city: 'Brooklyn', region: 'NY', intent: 'open_to_seeing', monogamy: 'unsure', matchStyle: 'surprise_me', archetype: 'chaosAgent', flexibility: 82, distanceMiles: 14, weeklyImpressions: 20, wildcardPotential: 70, bio: 'I’ll suggest something slightly irresponsible and then process it with you.' },
  { id: 'c12', firstName: 'Jun', age: 28, gender: 'Man', interestedIn: ['Women'], city: 'Jersey City', region: 'NJ', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_freak_match', archetype: 'nicheFreak', flexibility: 60, distanceMiles: 13, weeklyImpressions: 12, wildcardPotential: 66, bio: 'Ask me about my deranged spreadsheet of local dumplings.', absurdInterest: 'dumpling ranking spreadsheet' },
  { id: 'c13', firstName: 'Amara', age: 25, gender: 'Woman', interestedIn: ['Everyone'], city: 'Brooklyn', region: 'NY', intent: 'casual', monogamy: 'unsure', matchStyle: 'more_chaotic_spark', archetype: 'textMystic', flexibility: 68, distanceMiles: 8, weeklyImpressions: 28, wildcardPotential: 58, bio: 'I will send the group chat a full forensic timeline. It’s a service.' },
  { id: 'c14', firstName: 'Ben', age: 36, gender: 'Man', interestedIn: ['Women'], city: 'Manhattan', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_stabilizing', archetype: 'softLaunchRomantic', flexibility: 52, distanceMiles: 19, weeklyImpressions: 10, wildcardPotential: 33, bio: 'I romanticize errands. Every grocery run has cinematic potential.' },
  { id: 'c15', firstName: 'Wren', age: 29, gender: 'Nonbinary', interestedIn: ['Women', 'Nonbinary people'], city: 'Brooklyn', region: 'NY', intent: 'open_to_seeing', monogamy: 'open', matchStyle: 'surprise_me', archetype: 'nomad', flexibility: 76, distanceMiles: 5, weeklyImpressions: 15, wildcardPotential: 62, bio: 'I assume everyone is trapped in a ravine until proven otherwise.' },
  { id: 'c16', firstName: 'Lena', age: 31, gender: 'Woman', interestedIn: ['Men'], city: 'Queens', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_slow_burn', archetype: 'highLoreDelulu', flexibility: 48, distanceMiles: 24, weeklyImpressions: 21, wildcardPotential: 42, bio: 'Medium-chaos, high-bit-commitment, dangerously into a good “thinking of you.”' },
  { id: 'c17', firstName: 'Omar', age: 32, gender: 'Man', interestedIn: ['Women', 'Everyone'], city: 'Hoboken', region: 'NJ', intent: 'casual', monogamy: 'open', matchStyle: 'more_chaotic_spark', archetype: 'chaosAgent', flexibility: 80, distanceMiles: 11, weeklyImpressions: 17, wildcardPotential: 74, bio: 'Emotionally responsible chaos agent. Chaos with a seatbelt.' },
  { id: 'c18', firstName: 'Sofia', age: 26, gender: 'Woman', interestedIn: ['Everyone'], city: 'Brooklyn', region: 'NY', intent: 'open_to_seeing', monogamy: 'unsure', matchStyle: 'more_freak_match', archetype: 'bitGoblin', flexibility: 72, distanceMiles: 2, weeklyImpressions: 26, wildcardPotential: 79, bio: 'Three plants, all named after failed situationships.', absurdInterest: 'situationship-plant taxonomy' },
  { id: 'c19', firstName: 'Grant', age: 35, gender: 'Man', interestedIn: ['Women'], city: 'Manhattan', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_stabilizing', archetype: 'stabilizer', flexibility: 40, distanceMiles: 27, weeklyImpressions: 5, wildcardPotential: 22, bio: 'Steady on paper, one very specific unhinged door unlocked.' },
  { id: 'c20', firstName: 'Talia', age: 28, gender: 'Woman', interestedIn: ['Men', 'Nonbinary people'], city: 'Brooklyn', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_slow_burn', archetype: 'softLaunchRomantic', flexibility: 56, distanceMiles: 9, weeklyImpressions: 13, wildcardPotential: 47, bio: 'I make tiny moments feel mythological. It’s a gift and a warning.' },
  { id: 'c21', firstName: 'Noah', age: 29, gender: 'Man', interestedIn: ['Women', 'Everyone'], city: 'Queens', region: 'NY', intent: 'casual', monogamy: 'unsure', matchStyle: 'surprise_me', archetype: 'nomad', flexibility: 69, distanceMiles: 16, weeklyImpressions: 8, wildcardPotential: 60, bio: 'Low-frequency texter, high-warmth in person. Trust the process.' },
  { id: 'c22', firstName: 'Bianca', age: 33, gender: 'Woman', interestedIn: ['Men'], city: 'Jersey City', region: 'NJ', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_freak_match', archetype: 'nicheFreak', flexibility: 64, distanceMiles: 13, weeklyImpressions: 19, wildcardPotential: 71, bio: 'I have a personal vendetta against a harmless mascot. Ask nicely.', absurdInterest: 'mascot vendetta' },
  { id: 'c23', firstName: 'Cyrus', age: 30, gender: 'Man', interestedIn: ['Women', 'Women'], city: 'Brooklyn', region: 'NY', intent: 'open_to_seeing', monogamy: 'open', matchStyle: 'more_chaotic_spark', archetype: 'textMystic', flexibility: 73, distanceMiles: 7, weeklyImpressions: 24, wildcardPotential: 57, bio: 'I feel a two-hour reply in my spine. Working on it. Sort of.' },
  { id: 'c24', firstName: 'Hana', age: 27, gender: 'Woman', interestedIn: ['Everyone'], city: 'Manhattan', region: 'NY', intent: 'casual', monogamy: 'open', matchStyle: 'surprise_me', archetype: 'chaosAgent', flexibility: 84, distanceMiles: 20, weeklyImpressions: 23, wildcardPotential: 76, bio: 'Skydiver energy. The feelings are load-bearing, I promise.' },
  { id: 'c25', firstName: 'Leo', age: 31, gender: 'Man', interestedIn: ['Women'], city: 'Brooklyn', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_stabilizing', archetype: 'highLoreDelulu', flexibility: 54, distanceMiles: 4, weeklyImpressions: 12, wildcardPotential: 44, bio: 'I don’t believe in signs, I believe in a well-documented pattern of signs.' },
  { id: 'c26', firstName: 'Zoe', age: 24, gender: 'Woman', interestedIn: ['Everyone'], city: 'Brooklyn', region: 'NY', intent: 'casual', monogamy: 'unsure', matchStyle: 'more_chaotic_spark', archetype: 'bitGoblin', flexibility: 70, distanceMiles: 6, weeklyImpressions: 29, wildcardPotential: 82, bio: 'Main character in my own rom-com. Looking for a co-star, not an extra.' },
  { id: 'c27', firstName: 'Idris', age: 34, gender: 'Man', interestedIn: ['Women', 'Nonbinary people'], city: 'Hoboken', region: 'NJ', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_slow_burn', archetype: 'stabilizer', flexibility: 46, distanceMiles: 25, weeklyImpressions: 6, wildcardPotential: 28, bio: 'Consistent, kind under pressure, secretly fun to unravel.' },
  { id: 'c28', firstName: 'Priscilla', age: 29, gender: 'Woman', interestedIn: ['Men'], city: 'Queens', region: 'NY', intent: 'open_to_seeing', monogamy: 'unsure', matchStyle: 'surprise_me', archetype: 'nomad', flexibility: 67, distanceMiles: 17, weeklyImpressions: 14, wildcardPotential: 59, bio: 'Ambiguity is a hammock, not a threat. Usually.' },
  { id: 'c29', firstName: 'Felix', age: 28, gender: 'Man', interestedIn: ['Women', 'Everyone'], city: 'Brooklyn', region: 'NY', intent: 'casual', monogamy: 'open', matchStyle: 'more_freak_match', archetype: 'nicheFreak', flexibility: 71, distanceMiles: 8, weeklyImpressions: 18, wildcardPotential: 78, bio: 'Deranged niche obsession available on request. It’s pigeons.', absurdInterest: 'neighborhood pigeon lore' },
  { id: 'c30', firstName: 'Georgia', age: 32, gender: 'Woman', interestedIn: ['Men', 'Women'], city: 'Manhattan', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_stabilizing', archetype: 'softLaunchRomantic', flexibility: 53, distanceMiles: 12, weeklyImpressions: 11, wildcardPotential: 41, bio: 'I soft-launch, hard-commit, and text back like a functioning adult.' },
  { id: 'c31', firstName: 'Dmitri', age: 37, gender: 'Man', interestedIn: ['Women'], city: 'Brooklyn', region: 'NY', intent: 'serious', monogamy: 'monogamous', matchStyle: 'more_slow_burn', archetype: 'highLoreDelulu', flexibility: 49, distanceMiles: 21, weeklyImpressions: 9, wildcardPotential: 38, bio: 'Slow burn, high lore. I will remember the small thing you said.' },
  { id: 'c32', firstName: 'Remy', age: 26, gender: 'Nonbinary', interestedIn: ['Everyone'], city: 'Brooklyn', region: 'NY', intent: 'casual', monogamy: 'open', matchStyle: 'more_chaotic_spark', archetype: 'chaosAgent', flexibility: 79, distanceMiles: 5, weeklyImpressions: 27, wildcardPotential: 81, bio: 'Occasionally feral, always down for a haunted aquarium.', absurdInterest: 'haunted aquarium enthusiast' },
  // Safety-excluded candidates — must never appear in any drop (DoR §18.4.3).
  { id: 'c33', firstName: 'Blocked-Blake', age: 30, gender: 'Man', interestedIn: ['Women', 'Everyone'], city: 'Brooklyn', region: 'NY', intent: 'casual', monogamy: 'open', matchStyle: 'more_chaotic_spark', archetype: 'chaosAgent', flexibility: 60, distanceMiles: 6, weeklyImpressions: 30, wildcardPotential: 90, bio: 'Should be filtered out by the safety layer.', safetyExcluded: true },
  { id: 'c34', firstName: 'Excluded-Elle', age: 27, gender: 'Woman', interestedIn: ['Everyone'], city: 'Brooklyn', region: 'NY', intent: 'casual', monogamy: 'open', matchStyle: 'more_freak_match', archetype: 'nicheFreak', flexibility: 65, distanceMiles: 4, weeklyImpressions: 30, wildcardPotential: 88, bio: 'Also filtered out by the safety layer.', safetyExcluded: true },
];

const FIXED_TS = '2026-06-30T00:00:00.000Z';

function buildCandidate(seed: Seed): UserProfile {
  const scores = buildScores(seed.id, seed.archetype, {
    deluluFlexibility: seed.flexibility,
    ...seed.overrides,
  });
  const deluluProfile = generateDeluluProfile(seed.id, scores, {
    now: FIXED_TS,
    createdAt: FIXED_TS,
  });
  return {
    id: seed.id,
    firstName: seed.firstName,
    age: seed.age,
    location: { city: seed.city, region: seed.region },
    gender: seed.gender,
    interestedIn: seed.interestedIn,
    relationshipIntent: seed.intent,
    photos: buildPhotos(seed.id),
    prompts: buildPrompts(seed.id),
    bio: seed.bio,
    deluluProfile,
    deluluScores: scores,
    preferences: {
      interestedIn: seed.interestedIn,
      ageRange: { min: Math.max(21, seed.age - 8), max: seed.age + 8 },
      maxDistanceMiles: 40,
      relationshipIntent: seed.intent,
      monogamyStyle: seed.monogamy,
      dealbreakers: [],
      matchStyle: seed.matchStyle,
      intentIsDealbreaker: false,
      allowWiderRadius: false,
    },
    subscriptionTier: 'free',
    matchVelocity: buildVelocity(seed.id, {}),
    weeklyImpressions: seed.weeklyImpressions,
    wildcardPotential: seed.wildcardPotential,
    safetyExcluded: seed.safetyExcluded,
    blocked: seed.blocked,
    alreadyMatched: seed.alreadyMatched,
    recentlySkipped: seed.recentlySkipped,
    absurdInterest: seed.absurdInterest,
    distanceMiles: seed.distanceMiles,
  };
}

export const MOCK_CANDIDATES: UserProfile[] = SEEDS.map(buildCandidate);

export const MOCK_CANDIDATE_COUNT = MOCK_CANDIDATES.length;

const CANDIDATE_INDEX: Record<string, UserProfile> = Object.fromEntries(
  MOCK_CANDIDATES.map((c) => [c.id, c]),
);

export function getMockCandidateById(id: string): UserProfile | undefined {
  return CANDIDATE_INDEX[id];
}
