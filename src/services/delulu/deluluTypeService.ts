/**
 * Delulu Type assignment + Delulu Profile generation (spec §11, §8.6; DoR §5.4, §6).
 *
 * Deterministic: identical scores always yield the same type, traits, and copy.
 * No raw numbers ever leak into public copy — traits are qualitative labels.
 */
import {
  DEFAULT_DELULU_VISIBILITY,
  DELULU_DIMENSIONS,
  DIMENSION_BASELINE,
} from '@/types';
import type {
  DeluluDimension,
  DeluluProfile,
  DeluluScores,
  DeluluTrait,
  DeluluVisibility,
} from '@/types';

type TraitCopy = { high: string; low: string; highBlurb: string; lowBlurb: string };

const TRAIT_COPY: Record<DeluluDimension, TraitCopy> = {
  deluluIndex: {
    high: 'High Delulu',
    low: 'Evidence-Based',
    highBlurb: 'One good voice note and the future dog has a name.',
    lowBlurb: 'You need consistency before you imagine anything.',
  },
  loreDependency: {
    high: 'High Lore',
    low: 'Present-Tense',
    highBlurb: 'Every parking spot is a sign and you have receipts.',
    lowBlurb: 'You stay in the moment instead of building a mythology.',
  },
  bitCommitment: {
    high: 'Bit Committed',
    low: 'Literal',
    highBlurb: 'You will roleplay a fake feud for three months, joyfully.',
    lowBlurb: 'You say what you mean and skip the elaborate premise.',
  },
  ickVelocity: {
    high: 'Ick-Sensitive',
    low: 'Ick-Proof',
    highBlurb: 'One bad emoji can end the whole bloodline.',
    lowBlurb: 'Small quirks read as cute, not disqualifying.',
  },
  textTemperature: {
    high: 'Text Mystic',
    low: 'Low-Frequency',
    highBlurb: 'Your punctuation has a weather system.',
    lowBlurb: 'Texting is practical; the connection lives offline.',
  },
  chaosAppetite: {
    high: 'Chaos-Forward',
    low: 'Steady',
    highBlurb: '"Let’s go to the airport and pick a city" is a real plan.',
    lowBlurb: 'You like a plan and the plan liking you back.',
  },
  mainCharacterEnergy: {
    high: 'Main Character',
    low: 'Quiet Observer',
    highBlurb: 'You narrate the plot and you know the lighting.',
    lowBlurb: 'You watch the scene instead of starring in it.',
  },
  softLaunchTemperature: {
    high: 'Soft Launcher',
    low: 'Private Until Serious',
    highBlurb: 'An elbow is in the story by date two.',
    lowBlurb: 'You keep it offline until it actually means something.',
  },
  freakMatchSpecificity: {
    high: 'Niche-Specific',
    low: 'Broadly Compatible',
    highBlurb: 'You need someone who gets why a haunted aquarium is romantic.',
    lowBlurb: 'Your attractions are wide and forgiving.',
  },
  romanticRiskAppetite: {
    high: 'Fast Escalator',
    low: 'Slow Burn',
    highBlurb: '"I know this is insane, but hear me out."',
    lowBlurb: 'You let it build slowly and on purpose.',
  },
  ghostTolerance: {
    high: 'Unbothered',
    low: 'Spiral-Prone',
    highBlurb: 'You assume everyone is trapped in a ravine until proven otherwise.',
    lowBlurb: 'Silence gets loud fast for you.',
  },
  repairReflex: {
    high: 'Repair-Ready',
    low: 'Tension-Avoidant',
    highBlurb: '"That got weird — want to restart?" comes easily.',
    lowBlurb: 'You would rather let awkwardness quietly pass.',
  },
  stabilityNeed: {
    high: 'Consistency Is A Love Language',
    low: 'Novelty-Driven',
    highBlurb: 'Predictability is how you feel safe enough to be interested.',
    lowBlurb: 'Routine dulls it; surprise keeps you in.',
  },
  deluluFlexibility: {
    high: 'Flexible Delulu',
    low: 'Narrow Pattern',
    highBlurb: 'You can enjoy several romantic operating systems.',
    lowBlurb: 'You match best inside a specific shape.',
  },
};

type TypeCopy = {
  signature: string;
  dangerZone: string;
  greenFlag: string;
  bestMatchedWith: string;
  suggestedProfileLine: string;
};

/** Named types with hand-written copy. Rules below are evaluated in order. */
const TYPE_RULES: { type: string; when: (s: DeluluScores) => boolean; copy: TypeCopy }[] = [
  {
    type: 'Romantic Conspiracy Theorist',
    when: (s) => s.loreDependency > 75 && s.deluluIndex > 70 && s.bitCommitment > 60,
    copy: {
      signature:
        'You are high-lore, high-delulu, and you have a corkboard with red string for a text that said "haha same".',
      dangerZone: 'You may confuse a coincidence with a plot point.',
      greenFlag: 'You make ordinary days feel like they have a narrator.',
      bestMatchedWith: 'Someone who enjoys the theory but occasionally checks the facts.',
      suggestedProfileLine:
        'I don’t believe in signs, I believe in a well-documented pattern of signs.',
    },
  },
  {
    type: 'Commitment To The Bit Goblin',
    when: (s) => s.bitCommitment > 80 && s.freakMatchSpecificity > 70,
    copy: {
      signature:
        'You will commit to a fake premise longer than most people commit to a lease, and it is genuinely attractive.',
      dangerZone: 'You may forget to break character when it is time to be sincere.',
      greenFlag: 'You turn a boring dinner into a three-act saga with an inside joke.',
      bestMatchedWith: 'Someone who says "yes, and" instead of "please stop".',
      suggestedProfileLine: 'I am legally committed to a fake feud with a specific brand of yogurt.',
    },
  },
  {
    type: 'High-Context Text Mystic',
    when: (s) => s.textTemperature > 75 && s.ghostTolerance < 40,
    copy: {
      signature:
        'You read tone like tarot and you feel a two-hour reply in your spine.',
      dangerZone: 'You may write a full essay about a period at the end of a sentence.',
      greenFlag: 'You make texting feel like a warm, ongoing story.',
      bestMatchedWith: 'Someone who texts back with intention (and reasonable speed).',
      suggestedProfileLine: 'My love language is a well-timed voice note and yours should be too.',
    },
  },
  {
    type: 'Emotionally Responsible Chaos Agent',
    when: (s) => s.chaosAppetite > 75 && s.repairReflex > 65,
    copy: {
      signature:
        'You crave spontaneity but you clean up after it — chaos with a seatbelt.',
      dangerZone: 'You might mistake someone’s calm for a challenge to escalate.',
      greenFlag: 'You can start something reckless and still name the feelings after.',
      bestMatchedWith: 'Someone who can keep up but also knows where the brakes are.',
      suggestedProfileLine: 'I’ll suggest something slightly irresponsible and then process it with you.',
    },
  },
  {
    type: 'Soft Launch Romantic With Lore Dependency',
    when: (s) => s.softLaunchTemperature > 68 && s.loreDependency > 60,
    copy: {
      signature:
        'You are high-lore, medium-chaos, high-bit-commitment, and dangerously vulnerable to a well-timed "thinking of you".',
      dangerZone: 'You may confuse inconsistency with mystery.',
      greenFlag: 'You make tiny moments feel mythological.',
      bestMatchedWith: 'Someone who can be sincere without becoming boring.',
      suggestedProfileLine:
        'I’m not saying I romanticize errands, but every grocery run has cinematic potential.',
    },
  },
  {
    type: 'Stabilizing Force With A Secret Wild Side',
    when: (s) => s.stabilityNeed > 68 && s.repairReflex > 58,
    copy: {
      signature:
        'You are the steady one on paper, but you keep one very specific unhinged door unlocked.',
      dangerZone: 'You may under-sell the wild side until someone earns it.',
      greenFlag: 'You are safe to fall for and secretly fun to unravel.',
      bestMatchedWith: 'Someone who values consistency but likes the plot twist.',
      suggestedProfileLine: 'Emotionally stable, occasionally feral, always on time.',
    },
  },
  {
    type: 'Emotional Skydiver',
    when: (s) => s.romanticRiskAppetite > 72 && s.chaosAppetite > 62,
    copy: {
      signature:
        'You escalate fast and you would rather feel everything than nothing.',
      dangerZone: 'You may pack a parachute after you’ve already jumped.',
      greenFlag: 'You make people feel chosen, quickly and completely.',
      bestMatchedWith: 'Someone brave enough to jump but grounded enough to land.',
      suggestedProfileLine: 'I move fast, but I promise the feelings are load-bearing.',
    },
  },
  {
    type: 'Main Character In Their Own Rom-Com',
    when: (s) => s.mainCharacterEnergy > 74,
    copy: {
      signature: 'Every date is a scene, and you already know which song plays over it.',
      dangerZone: 'You may cast a stranger as the love interest before the meet-cute ends.',
      greenFlag: 'You bring color, momentum, and an excellent story later.',
      bestMatchedWith: 'Someone happy to be a co-star, not an extra.',
      suggestedProfileLine: 'Looking for a co-star, not an audience.',
    },
  },
  {
    type: 'Unbothered Romantic Nomad',
    when: (s) => s.ghostTolerance > 68 && s.stabilityNeed < 46,
    copy: {
      signature: 'You hold ambiguity like a hammock and you rarely spiral.',
      dangerZone: 'You may read as aloof when you’re actually just relaxed.',
      greenFlag: 'You give people room to breathe and still show up.',
      bestMatchedWith: 'Someone secure enough to enjoy the low-pressure energy.',
      suggestedProfileLine: 'Low drama, high warmth, allergic to a guilt trip.',
    },
  },
  {
    type: 'Niche Interest Romantic',
    when: (s) => s.freakMatchSpecificity > 70,
    copy: {
      signature: 'Your attractions are gloriously specific and you refuse to apologize.',
      dangerZone: 'You may hold out for a very particular brand of weird.',
      greenFlag: 'When it clicks, it clicks on a frequency no one else can hear.',
      bestMatchedWith: 'Someone whose niche overlaps yours in one perfect spot.',
      suggestedProfileLine: 'I need someone who understands why a haunted aquarium is romantic.',
    },
  },
  {
    type: 'High-Standards Ick Sommelier',
    when: (s) => s.ickVelocity > 70,
    copy: {
      signature: 'You have a refined, fast-acting palate for the ick and excellent taste otherwise.',
      dangerZone: 'You may end a saga over a single questionable sandwich order.',
      greenFlag: 'You know exactly what you like and you don’t waste anyone’s time.',
      bestMatchedWith: 'Someone confident enough to survive the tasting menu.',
      suggestedProfileLine: 'Picky in a way that will eventually feel like a compliment.',
    },
  },
];

const DEFAULT_TYPE_COPY: TypeCopy = {
  signature: 'You are a specific flavor of delulu and the algorithm respects it.',
  dangerZone: 'You may over-trust a vibe before the evidence shows up.',
  greenFlag: 'You bring genuine warmth and an unusual point of view.',
  bestMatchedWith: 'Someone whose delulu meets yours in the middle.',
  suggestedProfileLine: 'Emotionally fluent, occasionally delulu, worth the group chat’s attention.',
};

/** Deterministic top dimensions by deviation from baseline, tie-broken by fixed order. */
function rankByDeviation(scores: DeluluScores): DeluluDimension[] {
  return [...DELULU_DIMENSIONS].sort((a, b) => {
    const devA = Math.abs(scores[a] - DIMENSION_BASELINE);
    const devB = Math.abs(scores[b] - DIMENSION_BASELINE);
    if (devB !== devA) return devB - devA;
    return DELULU_DIMENSIONS.indexOf(a) - DELULU_DIMENSIONS.indexOf(b);
  });
}

export function assignDeluluType(scores: DeluluScores): string {
  for (const rule of TYPE_RULES) {
    if (rule.when(scores)) return rule.type;
  }
  // Fallback: name from the single most-defining dimension.
  const top = rankByDeviation(scores)[0];
  const copy = TRAIT_COPY[top];
  const above = scores[top] >= DIMENSION_BASELINE;
  return `${above ? copy.high : copy.low} Romantic`;
}

function copyForType(type: string, scores: DeluluScores): TypeCopy {
  const rule = TYPE_RULES.find((r) => r.type === type);
  if (rule) return rule.copy;
  const top = rankByDeviation(scores)[0];
  const label = scores[top] >= DIMENSION_BASELINE ? TRAIT_COPY[top].high : TRAIT_COPY[top].low;
  return {
    ...DEFAULT_TYPE_COPY,
    signature: `Your defining trait is ${label.toLowerCase()}. ${DEFAULT_TYPE_COPY.signature}`,
  };
}

export function buildTopTraits(scores: DeluluScores, count = 3): DeluluTrait[] {
  const ranked = rankByDeviation(scores).filter((d) => d !== 'deluluFlexibility');
  return ranked.slice(0, count).map((dimension) => {
    const score = scores[dimension];
    const above = score >= DIMENSION_BASELINE;
    const copy = TRAIT_COPY[dimension];
    return {
      dimension,
      label: above ? copy.high : copy.low,
      score,
      blurb: above ? copy.highBlurb : copy.lowBlurb,
    };
  });
}

/** Deterministic 55–98 confidence from how sharply-defined the top traits are. */
function computeConfidence(scores: DeluluScores): number {
  const ranked = rankByDeviation(scores).slice(0, 3);
  const avgDeviation =
    ranked.reduce((sum, d) => sum + Math.abs(scores[d] - DIMENSION_BASELINE), 0) / ranked.length;
  // avgDeviation ranges 0..50 → confidence 55..98.
  return Math.round(55 + (avgDeviation / DIMENSION_BASELINE) * 43);
}

export type GenerateProfileOptions = {
  visibility?: DeluluVisibility;
  now?: string;
  createdAt?: string;
};

export function generateDeluluProfile(
  userId: string,
  scores: DeluluScores,
  options: GenerateProfileOptions = {},
): DeluluProfile {
  const type = assignDeluluType(scores);
  const copy = copyForType(type, scores);
  const topTraits = buildTopTraits(scores);
  const now = options.now ?? new Date().toISOString();
  const traitList = topTraits.map((t) => t.label.toLowerCase()).join(', ');

  return {
    userId,
    type,
    signature: copy.signature,
    scores,
    topTraits,
    dangerZone: copy.dangerZone,
    greenFlag: copy.greenFlag,
    bestMatchedWith: copy.bestMatchedWith,
    suggestedProfileLine: copy.suggestedProfileLine,
    publicSummary: `${type} — ${traitList}.`,
    privateNotes: [
      'Scores are internal and never shown as public numbers.',
      'This is a compatibility read for entertainment, not a diagnosis.',
    ],
    confidence: computeConfidence(scores),
    visibility: options.visibility ?? { ...DEFAULT_DELULU_VISIBILITY },
    createdAt: options.createdAt ?? now,
    updatedAt: now,
  };
}
