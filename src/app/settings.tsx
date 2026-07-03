/**
 * Settings (spec §8.13, §21; DoR §14, §15.5, §18.4.2). Simulated subscription tier
 * switch, the required entertainment disclaimer, safety copy, reset/sign-out, and
 * the Analytics Debug Panel — reachable ONLY when analytics debug is enabled.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '@/theme';
import { AnalyticsDebugPanel, Button, Card, Chip, Screen, Text } from '@/components';
import { SUBSCRIPTION_TIER_LABELS, SUBSCRIPTION_TIERS } from '@/types';
import { env } from '@/config/env';
import { mockSignOut } from '@/services/auth/authService';
import { useAuthStore, useDeluluStore, useOnboardingStore, useWeeklyDropStore } from '@/stores';

export default function Settings() {
  const tier = useAuthStore((s) => s.subscriptionTier);
  const setTier = useAuthStore((s) => s.setSubscriptionTier);
  const signOut = useAuthStore((s) => s.signOut);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const resetDelulu = useDeluluStore((s) => s.reset);
  const resetDrop = useWeeklyDropStore((s) => s.reset);
  const [showDebug, setShowDebug] = useState(false);

  const doReset = () => {
    resetOnboarding();
    resetDelulu();
    resetDrop();
    router.replace('/');
  };
  const doSignOut = async () => {
    await mockSignOut();
    signOut();
    router.replace('/onboarding/welcome');
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Chip label="Back" tone="delulu" onPress={() => router.back()} size="sm" />
        <Text variant="h1" color={colors.textInverse}>
          Settings
        </Text>
      </View>

      <Section title="Subscription">
        <Text variant="caption" color={colors.textMuted}>
          Simulated tier — no real purchase is made.
        </Text>
        <View style={styles.chips}>
          {SUBSCRIPTION_TIERS.map((t) => (
            <Chip key={t} label={SUBSCRIPTION_TIER_LABELS[t]} tone="delulu" selected={tier === t} onPress={() => setTier(t)} />
          ))}
        </View>
      </Section>

      <Section title="Safety & trust">
        <Card tone="dark" style={styles.card}>
          <Text variant="body" color={colors.textInverse}>
            Unhinged is for entertainment and dating compatibility. Your Delulu Profile is not a diagnosis, and you
            control what appears publicly.
          </Text>
        </Card>
        <Text variant="caption" color={colors.textMuted}>
          It’s a playful compatibility read, not a label machine. No public delulu scores. You choose what becomes
          lore.
        </Text>
      </Section>

      {env.enableAnalyticsDebug ? (
        <Section title="Developer">
          <Button
            label={showDebug ? 'Hide analytics debug' : 'Analytics debug panel'}
            onPress={() => setShowDebug((v) => !v)}
            variant="secondary"
            fullWidth={false}
          />
          {showDebug ? (
            <View style={styles.debug}>
              <AnalyticsDebugPanel onClose={() => setShowDebug(false)} />
            </View>
          ) : null}
        </Section>
      ) : null}

      <Section title="Account">
        <Button label="Reset onboarding" onPress={doReset} variant="ghost" fullWidth={false} />
        <Button label="Sign out" onPress={doSignOut} variant="ghost" fullWidth={false} />
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="h3" color={colors.textInverse}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing[8], paddingBottom: spacing[16] },
  section: { gap: spacing[12], marginBottom: spacing[24] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] },
  card: { marginBottom: spacing[4] },
  debug: { height: 420, marginTop: spacing[8] },
});
