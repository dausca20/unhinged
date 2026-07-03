/**
 * Deterministic Delulu scoring engine (spec §11, DoR §5).
 *
 * Rules:
 *  - Every dimension initializes at 50.
 *  - Answers contribute weighted deltas; final scores are clamped 0–100.
 *  - Scoring is a pure function of the answers — no Math.random, no clock, no I/O.
 *    Same answers → identical scores every run (DoR §5.2).
 *  - Scores are recomputed from baseline over the full answer set, so changing an
 *    answer cleanly reverts its old contribution with no double-counting (DoR §4.6).
 *
 * This module is UI-independent and unit-callable (DoR §5.5).
 */
import {
  DELULU_DIMENSIONS,
  DIMENSION_BASELINE,
  DIMENSION_MAX,
  DIMENSION_MIN,
} from '@/types';
import type {
  DeluluDimension,
  DeluluScores,
  DimensionScoreDelta,
  InterviewAnswer,
  InterviewQuestion,
} from '@/types';

export type AnswerInput = {
  optionIds?: string[];
  sliderValue?: number;
  text?: string;
};

export function createBaselineScores(): DeluluScores {
  const scores = {} as DeluluScores;
  for (const dimension of DELULU_DIMENSIONS) {
    scores[dimension] = DIMENSION_BASELINE;
  }
  return scores;
}

export function clampScore(value: number): number {
  return Math.max(DIMENSION_MIN, Math.min(DIMENSION_MAX, Math.round(value)));
}

/**
 * Deltas an answer applies to dimensions. Deterministic given (question, input).
 */
export function computeAnswerDeltas(
  question: InterviewQuestion,
  input: AnswerInput,
): DimensionScoreDelta[] {
  switch (question.type) {
    case 'single_select':
    case 'profile_reaction': {
      const chosenId = input.optionIds?.[0];
      const option = question.options?.find((o) => o.id === chosenId);
      return option ? [...option.scoring] : [];
    }
    case 'multi_select': {
      const ids = input.optionIds ?? [];
      const deltas: DimensionScoreDelta[] = [];
      for (const id of ids) {
        const option = question.options?.find((o) => o.id === id);
        if (option) deltas.push(...option.scoring);
      }
      return deltas;
    }
    case 'slider': {
      const value = input.sliderValue ?? question.slider?.defaultValue ?? DIMENSION_BASELINE;
      // 50 → no change, 100 → full +delta, 0 → full -delta.
      return (question.scoring ?? []).map((d) => ({
        dimension: d.dimension,
        delta: Math.round((d.delta * (value - DIMENSION_BASELINE)) / DIMENSION_BASELINE),
      }));
    }
    case 'short_text': {
      const text = (input.text ?? '').trim();
      // A non-empty reflection applies the question's flat nudge; empty = no score.
      return text.length > 0 ? (question.scoring ?? []).map((d) => ({ ...d })) : [];
    }
    default:
      return [];
  }
}

/** Build a revertible answer record with its exact applied deltas. */
export function buildAnswer(question: InterviewQuestion, input: AnswerInput): InterviewAnswer {
  return {
    questionId: question.id,
    type: question.type,
    optionIds: input.optionIds,
    sliderValue: input.sliderValue,
    text: input.text,
    appliedDeltas: computeAnswerDeltas(question, input),
  };
}

/**
 * Full deterministic score from an answer set. Accumulates raw deltas from a
 * baseline of 50 and clamps once at the end (spec §11). Order-independent.
 */
export function scoreInterview(answers: InterviewAnswer[]): DeluluScores {
  const raw = createBaselineScores();
  for (const answer of answers) {
    for (const delta of answer.appliedDeltas) {
      raw[delta.dimension] += delta.delta;
    }
  }
  const clamped = {} as DeluluScores;
  for (const dimension of DELULU_DIMENSIONS) {
    clamped[dimension] = clampScore(raw[dimension]);
  }
  return clamped;
}

/**
 * Live preview: net deltas per dimension for a single answer, for the analytics
 * debug panel / logged deltas (DoR §4.5). Sums duplicate dimensions.
 */
export function summarizeDeltas(deltas: DimensionScoreDelta[]): Partial<Record<DeluluDimension, number>> {
  const summary: Partial<Record<DeluluDimension, number>> = {};
  for (const d of deltas) {
    summary[d.dimension] = (summary[d.dimension] ?? 0) + d.delta;
  }
  return summary;
}

/**
 * Onboarding "match style" biases Delulu Flexibility, which feeds matching /
 * marketplace widening (spec §8.4, DoR §3.4.2). Applied when finalizing the user.
 */
export function matchStyleFlexibilityBias(
  style:
    | 'more_freak_match'
    | 'more_stabilizing'
    | 'more_chaotic_spark'
    | 'more_slow_burn'
    | 'surprise_me',
): number {
  switch (style) {
    case 'surprise_me':
      return 15;
    case 'more_chaotic_spark':
      return 12;
    case 'more_freak_match':
      return 10;
    case 'more_slow_burn':
      return -8;
    case 'more_stabilizing':
      return -12;
    default:
      return 0;
  }
}

/** Apply the match-style flexibility bias to a score set (clamped). */
export function applyMatchStyleToScores(
  scores: DeluluScores,
  style: Parameters<typeof matchStyleFlexibilityBias>[0],
): DeluluScores {
  return {
    ...scores,
    deluluFlexibility: clampScore(scores.deluluFlexibility + matchStyleFlexibilityBias(style)),
  };
}
