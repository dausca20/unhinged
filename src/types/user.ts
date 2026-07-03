/**
 * User + candidate models. Candidates reuse UserProfile and add matching
 * metadata (velocity, exposure, safety, wildcard potential). See spec §14, §12.
 */
import type { DeluluProfile, DeluluScores } from './delulu';

/** Gender is free-form self-ID text per spec (§14). Constants are UI conveniences only. */
export const GENDER_OPTIONS = ['Woman', 'Man', 'Nonbinary', 'Other'] as const;
export const INTERESTED_IN_OPTIONS = ['Women', 'Men', 'Nonbinary people', 'Everyone'] as const;

export type RelationshipIntent = 'serious' | 'casual' | 'open_to_seeing' | 'unsure';

export const RELATIONSHIP_INTENT_LABELS: Record<RelationshipIntent, string> = {
  serious: 'Something serious',
  casual: 'Something casual',
  open_to_seeing: 'Open to seeing',
  unsure: 'Genuinely unsure',
};

export type MonogamyStyle = 'monogamous' | 'open' | 'unsure';

export const MONOGAMY_LABELS: Record<MonogamyStyle, string> = {
  monogamous: 'Monogamous',
  open: 'Open to non-monogamy',
  unsure: 'Unsure',
};

/** Onboarding "match style" preference — feeds Delulu Flexibility / matching (spec §8.4). */
export type MatchStyle =
  | 'more_freak_match'
  | 'more_stabilizing'
  | 'more_chaotic_spark'
  | 'more_slow_burn'
  | 'surprise_me';

export const MATCH_STYLE_LABELS: Record<MatchStyle, string> = {
  more_freak_match: 'More freak match',
  more_stabilizing: 'More stabilizing energy',
  more_chaotic_spark: 'More chaotic spark',
  more_slow_burn: 'More slow burn',
  surprise_me: 'Surprise me',
};

export type SubscriptionTier = 'free' | 'plus' | 'max';

export type Location = {
  city: string;
  region: string;
  latitude?: number;
  longitude?: number;
};

export type ProfilePhoto = {
  id: string;
  /** Mock photos have no uri; the UI renders a labelled gradient placeholder. */
  uri?: string;
  /** Deterministic placeholder tint index (0–5) so a card looks stable across renders. */
  placeholderTint: number;
  label: string;
  isMain?: boolean;
};

export type ProfilePrompt = {
  id: string;
  prompt: string;
  answer: string;
};

export type MatchPreferences = {
  interestedIn: string[];
  ageRange: { min: number; max: number };
  maxDistanceMiles: number;
  relationshipIntent: RelationshipIntent;
  monogamyStyle: MonogamyStyle;
  dealbreakers: string[];
  matchStyle: MatchStyle;
  /** When true, a relationship-intent mismatch becomes a hard eligibility filter (spec §12.1). */
  intentIsDealbreaker: boolean;
  /** User has opted into a wider search radius when the pool is thin. */
  allowWiderRadius: boolean;
};

/** Per-user weekly engagement signals used by the marketplace model (spec §12.4). */
export type MatchVelocity = {
  userId: string;
  weeklyDropViews: number;
  weeklyLikesSent: number;
  weeklyLikesReceived: number;
  mutualMatches: number;
  conversationsStarted: number;
  repliesReceived: number;
};

export type UserProfile = {
  id: string;
  firstName: string;
  age: number;
  birthday?: string;
  location: Location;
  gender: string;
  interestedIn: string[];
  relationshipIntent: RelationshipIntent;
  photos: ProfilePhoto[];
  prompts: ProfilePrompt[];
  bio?: string;
  deluluProfile?: DeluluProfile;
  preferences: MatchPreferences;
  subscriptionTier: SubscriptionTier;

  // ---- Candidate-side matching metadata (present on mock candidates) ----
  /** Raw dimension scores. Mirrors deluluProfile.scores; kept for candidates. */
  deluluScores?: DeluluScores;
  matchVelocity?: MatchVelocity;
  /** How many drops this candidate has appeared in this week (exposure penalty). */
  weeklyImpressions?: number;
  /** Hard safety exclusion — removed from all drops, curated and wildcard (spec §21). */
  safetyExcluded?: boolean;
  /** Already blocked by the current user. */
  blocked?: boolean;
  /** Already a mutual match with the current user. */
  alreadyMatched?: boolean;
  /** Skipped by the current user within the recent window. */
  recentlySkipped?: boolean;
  /** 0–100 seed for wildcard funScore. */
  wildcardPotential?: number;
  /** A shared absurd interest string, used to justify some wildcards. */
  absurdInterest?: string;
  /** Precomputed distance (miles) from the current user — deterministic mock value. */
  distanceMiles?: number;
};
