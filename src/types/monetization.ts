/**
 * Freemium simulation types (spec §20). No real purchases are wired; a tier is
 * simulated locally and gates paid placeholders.
 */
import type { SubscriptionTier } from './user';

export type { SubscriptionTier };

export const SUBSCRIPTION_TIERS: readonly SubscriptionTier[] = ['free', 'plus', 'max'] as const;

export const SUBSCRIPTION_TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  plus: 'Unhinged Plus',
  max: 'Unhinged Max',
};

/** Free-tier like ceiling (spec §20 "like a limited number of matches"). */
export const FREE_LIKE_LIMIT = 5;

/** What surface triggered the paywall (for analytics + copy). */
export type PaywallContext =
  | 'inbound_likes'
  | 'advanced_breakdown'
  | 'second_look'
  | 'match_style'
  | 'profile_tuning'
  | 'like_limit';

/** Entitlements unlocked by a paid tier. */
export type EntitlementKey =
  | 'inbound_likes'
  | 'advanced_breakdown'
  | 'extra_second_look'
  | 'match_style_control'
  | 'profile_tuning';

export const PAID_ENTITLEMENTS: readonly EntitlementKey[] = [
  'inbound_likes',
  'advanced_breakdown',
  'extra_second_look',
  'match_style_control',
  'profile_tuning',
] as const;

/** RevenueCat config placeholders — never a real key in the client (DoR §16.5). */
export type RevenueCatConfig = {
  iosApiKey: string;
  androidApiKey: string;
  configured: boolean;
};
