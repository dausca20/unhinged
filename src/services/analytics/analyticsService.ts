/**
 * Local analytics service (spec §13, DoR §15). In mock mode it logs to console
 * AND appends to a local store (via a registered sink). Every match impression
 * and action carries the full, non-negotiable match payload (spec §13.2).
 */
import { env, useMocks } from '@/config/env';
import type {
  AnalyticsEvent,
  AnalyticsEventName,
  MatchAnalyticsPayload,
  MatchCandidate,
} from '@/types';

type AnalyticsSink = (event: AnalyticsEvent) => void;

let sink: AnalyticsSink | null = null;
let counter = 0;

/** The analytics store registers itself here so events land in local state. */
export function registerAnalyticsSink(next: AnalyticsSink): void {
  sink = next;
}

function nextId(): string {
  counter += 1;
  return `evt-${counter}-${Date.now()}`;
}

export function trackEvent(
  name: AnalyticsEventName | string,
  properties: Record<string, unknown> = {},
): AnalyticsEvent {
  const event: AnalyticsEvent = {
    id: nextId(),
    name,
    properties,
    timestamp: new Date().toISOString(),
  };
  if (useMocks || env.enableAnalyticsDebug) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${name}`, properties);
  }
  sink?.(event);
  return event;
}

/** Build the full match analytics payload from a candidate (spec §13.2, DoR §15.3). */
export function buildMatchAnalyticsPayload(
  userId: string,
  candidate: MatchCandidate,
): MatchAnalyticsPayload {
  return {
    userId,
    candidateId: candidate.profile.id,
    dropId: candidate.dropId,
    rank: candidate.rank,
    isWildcard: candidate.isWildcard,
    matchAlgorithmVersion: candidate.matchScore.algorithmVersion,
    totalMatchScore: candidate.matchScore.total,
    scoreComponents: candidate.matchScore.components,
    topSharedDimensions: candidate.topSharedDimensions,
    topMismatchDimensions: candidate.topMismatchDimensions,
    explanationReasonCodes: candidate.matchScore.reasonCodes,
    marketplaceReasonCodes: candidate.matchScore.marketplaceReasonCodes,
  };
}

/** Track a match-related event with the full payload merged in. */
export function trackMatchEvent(
  name: AnalyticsEventName,
  userId: string,
  candidate: MatchCandidate,
  extra: Record<string, unknown> = {},
): AnalyticsEvent {
  return trackEvent(name, { ...buildMatchAnalyticsPayload(userId, candidate), ...extra });
}

export const analyticsService = {
  trackEvent,
  trackMatchEvent,
  buildMatchAnalyticsPayload,
  registerAnalyticsSink,
};
