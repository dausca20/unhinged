/**
 * Analytics event names and payloads. Every required event from spec §13.1 is
 * enumerated here so call sites are type-checked against the approved set.
 */
import type { MatchScoreComponents } from './match';

export type OnboardingEventName =
  | 'onboarding_started'
  | 'onboarding_step_viewed'
  | 'profile_basics_completed'
  | 'preference_selected'
  | 'interview_question_viewed'
  | 'interview_question_answered'
  | 'delulu_profile_generated'
  | 'delulu_profile_edited'
  | 'onboarding_completed';

export type WeeklyDropEventName =
  | 'weekly_drop_viewed'
  | 'match_card_impression'
  | 'match_card_expanded'
  | 'match_explanation_viewed'
  | 'compatibility_breakdown_viewed'
  | 'match_liked'
  | 'match_skipped'
  | 'match_saved'
  | 'wildcard_impression'
  | 'wildcard_expanded'
  | 'wildcard_liked'
  | 'wildcard_skipped';

export type ChatEventName =
  | 'suggested_opener_viewed'
  | 'suggested_opener_used'
  | 'message_sent_mock'
  | 'chat_opened';

export type PaywallEventName =
  | 'paywall_viewed'
  | 'paywall_cta_tapped'
  | 'paywall_dismissed';

export type FeedbackEventName =
  | 'match_feedback_submitted'
  | 'drop_feedback_submitted';

export type AnalyticsEventName =
  | OnboardingEventName
  | WeeklyDropEventName
  | ChatEventName
  | PaywallEventName
  | FeedbackEventName;

/**
 * Non-negotiable match payload (spec §13.2). Every match impression and action
 * must carry all of these fields.
 */
export type MatchAnalyticsPayload = {
  userId: string;
  candidateId: string;
  dropId: string;
  rank: number;
  isWildcard: boolean;
  matchAlgorithmVersion: string;
  totalMatchScore: number;
  scoreComponents: MatchScoreComponents;
  topSharedDimensions: string[];
  topMismatchDimensions: string[];
  explanationReasonCodes: string[];
  marketplaceReasonCodes: string[];
};

export type AnalyticsEvent = {
  id: string;
  name: string;
  properties: Record<string, unknown>;
  timestamp: string;
};
