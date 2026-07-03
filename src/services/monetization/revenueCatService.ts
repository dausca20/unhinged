/**
 * RevenueCat placeholder (spec §20, DoR §16.5). Config placeholders only — no
 * real purchase flow is wired, and no real API key is ever hard-coded. Tier
 * changes in the prototype are simulated locally (see authStore/profile).
 */
import { env, revenueCatConfigured } from '@/config/env';
import type { RevenueCatConfig } from '@/types';

export const revenueCatConfig: RevenueCatConfig = {
  iosApiKey: env.revenueCatIosApiKey,
  androidApiKey: env.revenueCatAndroidApiKey,
  configured: revenueCatConfigured,
};

export function isRevenueCatConfigured(): boolean {
  return revenueCatConfigured;
}

/** Placeholder — a real build would call RevenueCat here. Intentionally a no-op. */
export async function restorePurchasesPlaceholder(): Promise<void> {
  // No real purchases in the prototype.
}

/** Placeholder — a real build would present RevenueCat's paywall / purchase sheet. */
export async function purchasePlaceholder(): Promise<{ simulated: true }> {
  return { simulated: true };
}
