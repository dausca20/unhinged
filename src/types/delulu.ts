/**
 * Delulu dimensions, scoring primitives, interview shapes, and the generated
 * Delulu Profile. See spec §9–§11 and §14.
 *
 * IMPORTANT: raw dimension scores are internal-only. They never render as public
 * numbers (DoR §6.2, §8.3, §18.4). Public surfaces use qualitative labels.
 */

/** The 14 Delulu dimensions. Order is stable and used for deterministic iteration. */
export type DeluluDimension =
  | 'deluluIndex'
  | 'loreDependency'
  | 'bitCommitment'
  | 'ickVelocity'
  | 'textTemperature'
  | 'chaosAppetite'
  | 'mainCharacterEnergy'
  | 'softLaunchTemperature'
  | 'freakMatchSpecificity'
  | 'romanticRiskAppetite'
  | 'ghostTolerance'
  | 'repairReflex'
  | 'stabilityNeed'
  | 'deluluFlexibility';

export const DELULU_DIMENSIONS: readonly DeluluDimension[] = [
  'deluluIndex',
  'loreDependency',
  'bitCommitment',
  'ickVelocity',
  'textTemperature',
  'chaosAppetite',
  'mainCharacterEnergy',
  'softLaunchTemperature',
  'freakMatchSpecificity',
  'romanticRiskAppetite',
  'ghostTolerance',
  'repairReflex',
  'stabilityNeed',
  'deluluFlexibility',
] as const;

/** Every dimension initializes here before deltas are applied (spec §11). */
export const DIMENSION_BASELINE = 50;
export const DIMENSION_MIN = 0;
export const DIMENSION_MAX = 100;

/** Human-facing labels for a dimension (used in qualitative compatibility copy). */
export const DIMENSION_LABELS: Record<DeluluDimension, string> = {
  deluluIndex: 'Delulu Index',
  loreDependency: 'Lore Dependency',
  bitCommitment: 'Bit Commitment',
  ickVelocity: 'Ick Velocity',
  textTemperature: 'Text Temperature',
  chaosAppetite: 'Chaos Appetite',
  mainCharacterEnergy: 'Main Character Energy',
  softLaunchTemperature: 'Soft Launch Temperature',
  freakMatchSpecificity: 'Freak Match Specificity',
  romanticRiskAppetite: 'Romantic Risk Appetite',
  ghostTolerance: 'Ghost Tolerance',
  repairReflex: 'Repair Reflex',
  stabilityNeed: 'Stability Need',
  deluluFlexibility: 'Delulu Flexibility',
};

/** How dimensions combine across two people (spec §12.3). */
export type CompatibilityClass = 'similarity' | 'complementary' | 'risk_managed';

export const DIMENSION_COMPATIBILITY_CLASS: Record<DeluluDimension, CompatibilityClass> = {
  // Similarity — close is better.
  bitCommitment: 'similarity',
  freakMatchSpecificity: 'similarity',
  loreDependency: 'similarity',
  textTemperature: 'similarity',
  // Complementary — difference can be good within a healthy range.
  chaosAppetite: 'complementary',
  stabilityNeed: 'complementary',
  romanticRiskAppetite: 'complementary',
  mainCharacterEnergy: 'complementary',
  // Risk-managed — large mismatches reduce the score.
  ickVelocity: 'risk_managed',
  ghostTolerance: 'risk_managed',
  repairReflex: 'risk_managed',
  deluluIndex: 'risk_managed',
  // Flexibility & soft-launch are used as modifiers rather than paired compat,
  // but classify them so every dimension has a class.
  deluluFlexibility: 'complementary',
  softLaunchTemperature: 'similarity',
};

export type DeluluScores = Record<DeluluDimension, number>;

/** A single weighted nudge to one dimension. */
export type DimensionScoreDelta = {
  dimension: DeluluDimension;
  delta: number;
};

// ---------------------------------------------------------------------------
// Delulu Interview
// ---------------------------------------------------------------------------

export type InterviewAnswerType =
  | 'single_select'
  | 'multi_select'
  | 'slider'
  | 'short_text'
  | 'profile_reaction';

export type InterviewOption = {
  id: string;
  label: string;
  /** Deltas applied when this option is chosen. Every option is scorable. */
  scoring: DimensionScoreDelta[];
};

/** For `slider` questions: value 50 = no change, 100 = +delta, 0 = -delta. */
export type SliderConfig = {
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  defaultValue: number;
};

/** For `profile_reaction`: a tiny sample profile the user reacts to. */
export type ProfileSample = {
  name: string;
  age: number;
  blurb: string;
  promptLabel: string;
  promptAnswer: string;
};

export type InterviewQuestion = {
  id: string;
  type: InterviewAnswerType;
  prompt: string;
  helperText?: string;
  options?: InterviewOption[];
  slider?: SliderConfig;
  /**
   * Question-level scoring. Used by `slider` (scaled by value) and `short_text`
   * (applied flat once answered). Guarantees every answer maps to ≥1 dimension.
   */
  scoring?: DimensionScoreDelta[];
  profileSample?: ProfileSample;
  /** Playful "this is too accurate" line surfaced after answering (DoR §4.7). */
  microcopy?: string;
};

/** A user's recorded answer, enough to re-derive (and revert) its deltas. */
export type InterviewAnswer = {
  questionId: string;
  type: InterviewAnswerType;
  /** Chosen option id(s) for select/reaction questions. */
  optionIds?: string[];
  /** Slider value for slider questions. */
  sliderValue?: number;
  /** Free text for short_text questions. */
  text?: string;
  /** The exact deltas that were applied — stored so we can revert on re-answer. */
  appliedDeltas: DimensionScoreDelta[];
};

// ---------------------------------------------------------------------------
// Delulu Profile
// ---------------------------------------------------------------------------

export type DeluluTrait = {
  dimension: DeluluDimension;
  /** Pill label, e.g. "High Lore" / "Bit Committed". Never a number. */
  label: string;
  /** Internal score (0–100). Not rendered publicly. */
  score: number;
  blurb: string;
};

/** Public/private visibility controls (DoR §6.5, DESIGN_SYSTEM §17). */
export type DeluluVisibility = {
  showType: boolean;
  showTopTraits: boolean;
  hideDangerZone: boolean;
  hideMatchExplanationDetails: boolean;
  useSuggestedProfileLine: boolean;
};

export const DEFAULT_DELULU_VISIBILITY: DeluluVisibility = {
  showType: true,
  showTopTraits: true,
  hideDangerZone: false,
  hideMatchExplanationDetails: false,
  useSuggestedProfileLine: true,
};

export type DeluluProfile = {
  userId: string;
  type: string;
  signature: string;
  scores: DeluluScores;
  topTraits: DeluluTrait[];
  dangerZone: string;
  greenFlag: string;
  bestMatchedWith: string;
  suggestedProfileLine: string;
  publicSummary: string;
  privateNotes: string[];
  confidence: number;
  visibility: DeluluVisibility;
  createdAt: string;
  updatedAt: string;
};
