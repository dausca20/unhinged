/**
 * Paywall (spec §8.10, §20; DoR §12.4, §18.5.2). Simulated only — "Unlock" flips
 * the local tier; no real purchase. Playful copy, none of the banned lines.
 * Dismissible without dead-ends.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, radius, spacing } from '@/theme';
import { PaywallCard, Screen, Text } from '@/components';
import { trackEvent } from '@/services/analytics/analyticsService';
import { successHaptic } from '@/utils/haptics';
import { useAuthStore } from '@/stores';

const CONTEXT_COPY: Record<string, { headline: string; body: string }> = {
  inbound_likes: {
    headline: 'See who likes your delulu',
    body: 'Unlock your inbound likes, deeper match reads, and second looks. Some people have taste. Concerning, but useful.',
  },
  advanced_breakdown: {
    headline: 'Go deeper on every match',
    body: 'Unlock the full compatibility read — every dimension, not just the highlights.',
  },
  second_look: {
    headline: 'Get a second look',
    body: 'Change your mind about someone you skipped a little too fast. It happens.',
  },
  match_style: {
    headline: 'Tune your match style',
    body: 'Dial your weekly drop toward freak match, slow burn, or full chaos whenever you want.',
  },
  like_limit: {
    headline: 'That’s your free likes for now',
    body: 'Your free likes are spent for this week. Unlock more and keep the plot moving at your own pace.',
  },
};

export default function Paywall() {
  const { context } = useLocalSearchParams<{ context?: string }>();
  const setSubscriptionTier = useAuthStore((s) => s.setSubscriptionTier);
  const copy = (context && CONTEXT_COPY[context]) || CONTEXT_COPY.inbound_likes;

  useEffect(() => {
    trackEvent('paywall_viewed', { context: context ?? 'inbound_likes' });
  }, [context]);

  const unlock = () => {
    trackEvent('paywall_cta_tapped', { context: context ?? 'inbound_likes' });
    successHaptic();
    setSubscriptionTier('plus'); // simulated unlock — no real purchase
    router.back();
  };
  const dismiss = () => {
    trackEvent('paywall_dismissed', { context: context ?? 'inbound_likes' });
    router.back();
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.grabber} />
        <Text variant="micro" color={colors.textMuted}>
          Unhinged Plus
        </Text>
        <PaywallCard headline={copy.headline} body={copy.body} onUnlock={unlock} onDismiss={dismiss} />
        <Text variant="caption" color={colors.textMuted} align="center">
          Prototype only — no real purchase is made.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: spacing[16] },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderDark,
    alignSelf: 'center',
    marginBottom: spacing[8],
  },
});
