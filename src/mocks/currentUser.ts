/**
 * The current user (spec §14, §15). Two shapes:
 *  - createEmptyUserProfile(): the blank starting point onboarding fills in.
 *  - SAMPLE_COMPLETED_USER: a fully onboarded user (with a Delulu Profile) used
 *    for the "I already have an account" stub, demos, and drop generation.
 */
import { generateDeluluProfile } from '@/services/delulu/deluluTypeService';
import type { DeluluScores, MatchPreferences, UserProfile } from '@/types';

export const CURRENT_USER_ID = 'current-user';

const DEFAULT_PREFERENCES: MatchPreferences = {
  interestedIn: [],
  ageRange: { min: 24, max: 40 },
  maxDistanceMiles: 40,
  relationshipIntent: 'unsure',
  monogamyStyle: 'unsure',
  dealbreakers: [],
  matchStyle: 'surprise_me',
  intentIsDealbreaker: false,
  allowWiderRadius: false,
};

export function createEmptyUserProfile(): UserProfile {
  return {
    id: CURRENT_USER_ID,
    firstName: '',
    age: 0,
    location: { city: '', region: '' },
    gender: '',
    interestedIn: [],
    relationshipIntent: 'unsure',
    photos: [],
    prompts: [],
    bio: '',
    preferences: { ...DEFAULT_PREFERENCES },
    subscriptionTier: 'free',
  };
}

const SAMPLE_SCORES: DeluluScores = {
  deluluIndex: 78,
  loreDependency: 82,
  bitCommitment: 72,
  ickVelocity: 48,
  textTemperature: 70,
  chaosAppetite: 58,
  mainCharacterEnergy: 66,
  softLaunchTemperature: 74,
  freakMatchSpecificity: 60,
  romanticRiskAppetite: 55,
  ghostTolerance: 42,
  repairReflex: 60,
  stabilityNeed: 46,
  deluluFlexibility: 65,
};

const SAMPLE_TS = '2026-07-01T00:00:00.000Z';

export const SAMPLE_COMPLETED_USER: UserProfile = {
  id: CURRENT_USER_ID,
  firstName: 'Cate',
  age: 29,
  birthday: '1996-11-04',
  location: { city: 'Brooklyn', region: 'NY' },
  gender: 'Woman',
  interestedIn: ['Everyone'],
  relationshipIntent: 'serious',
  photos: [
    { id: 'cu-photo-0', placeholderTint: 0, label: 'Main', isMain: true },
    { id: 'cu-photo-1', placeholderTint: 2, label: 'Out & about' },
    { id: 'cu-photo-2', placeholderTint: 4, label: 'The bit' },
  ],
  prompts: [
    { id: 'cu-prompt-0', prompt: 'My most harmless red flag is…', answer: 'I narrate my errands like a nature documentary.' },
    { id: 'cu-prompt-1', prompt: 'A normal thing I’ve made weird is…', answer: 'Grocery shopping is now a cinematic experience.' },
    { id: 'cu-prompt-2', prompt: 'The fastest way to make me delulu is…', answer: 'Remember a small thing I said three weeks ago.' },
  ],
  bio: 'High-lore, medium-chaos, will absolutely soft-launch you by date two.',
  deluluProfile: generateDeluluProfile(CURRENT_USER_ID, SAMPLE_SCORES, {
    now: SAMPLE_TS,
    createdAt: SAMPLE_TS,
  }),
  deluluScores: SAMPLE_SCORES,
  preferences: {
    interestedIn: ['Everyone'],
    ageRange: { min: 25, max: 40 },
    maxDistanceMiles: 50,
    relationshipIntent: 'serious',
    monogamyStyle: 'monogamous',
    dealbreakers: [],
    matchStyle: 'more_slow_burn',
    intentIsDealbreaker: false,
    allowWiderRadius: false,
  },
  subscriptionTier: 'free',
  // Velocity: getting views but few likes → exercises marketplace velocity signals.
  matchVelocity: {
    userId: CURRENT_USER_ID,
    weeklyDropViews: 6,
    weeklyLikesSent: 0,
    weeklyLikesReceived: 9,
    mutualMatches: 1,
    conversationsStarted: 1,
    repliesReceived: 1,
  },
};
