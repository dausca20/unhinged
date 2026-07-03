/**
 * Delulu Profile result (spec §8.6, §12; DoR §6). Plays a short reveal sequence
 * (≤ ~3s) then shows the generated profile with actions — Looks right, Roast me
 * again, Edit what's public — plus persisted public/private visibility controls.
 * No public numeric scores anywhere.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { colors, motion, spacing } from '@/theme';
import { Card, DeluluProfileCard, Screen, Text } from '@/components';
import { getDefaultInterviewFlow } from '@/mocks/mockInterviewQuestions';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { trackEvent } from '@/services/analytics/analyticsService';
import { useDeluluStore, useOnboardingStore } from '@/stores';
import type { DeluluVisibility } from '@/types';

const REVEAL_STEPS = [
  'Reading the lore…',
  'Cross-checking the group chat energy…',
  'Finding the delusion pattern…',
  'Oh. We have something.',
];

const VISIBILITY_ROWS: { key: keyof DeluluVisibility; label: string }[] = [
  { key: 'showType', label: 'Show my Delulu Type' },
  { key: 'showTopTraits', label: 'Show top traits' },
  { key: 'hideDangerZone', label: 'Hide danger zone' },
  { key: 'hideMatchExplanationDetails', label: 'Hide match-explanation details' },
  { key: 'useSuggestedProfileLine', label: 'Use suggested profile line' },
];

export default function ProfileCard() {
  const profile = useDeluluStore((s) => s.profile);
  const regenerate = useDeluluStore((s) => s.regenerate);
  const updateVisibility = useDeluluStore((s) => s.updateVisibility);
  const userId = useOnboardingStore((s) => s.user.id);
  const markStep = useOnboardingStore((s) => s.markStep);
  const reduced = useReducedMotion();

  const [stepIndex, setStepIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const orderedAnswers = useMemo(() => {
    const flow = getDefaultInterviewFlow();
    return flow.map((q) => useOnboardingStore.getState().interviewAnswers[q.id]).filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playReveal = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRevealed(false);
    setStepIndex(0);
    if (reduced) {
      timers.current.push(setTimeout(() => setRevealed(true), motion.standard));
      return;
    }
    const per = motion.reveal;
    REVEAL_STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStepIndex(i), i * per));
    });
    timers.current.push(setTimeout(() => setRevealed(true), REVEAL_STEPS.length * per));
  };

  useEffect(() => {
    trackEvent('onboarding_step_viewed', { step: 'profile-card' });
    playReveal();
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!profile) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.delulu} />
          <Text variant="caption" color={colors.textMuted}>
            No profile yet. Head back and finish the interview.
          </Text>
        </View>
      </Screen>
    );
  }

  if (!revealed) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.delulu} size="large" />
          <Text variant="h2" color={colors.textInverse} align="center">
            {REVEAL_STEPS[stepIndex]}
          </Text>
        </View>
      </Screen>
    );
  }

  const onLooksRight = () => {
    markStep(4);
    router.push('/onboarding/review');
  };
  const onRoastAgain = () => {
    regenerate(userId, orderedAnswers);
    playReveal();
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="micro" color={colors.dopamine}>
          Your delulu has arrived
        </Text>
      </View>
      <DeluluProfileCard
        profile={profile}
        showActions
        onLooksRight={onLooksRight}
        onRoastAgain={onRoastAgain}
        onEditPublic={() => setEditing((v) => !v)}
      />

      {editing ? (
        <Card tone="dark" style={styles.visibility}>
          <Text variant="h3" color={colors.textInverse}>
            Control what becomes lore
          </Text>
          <Text variant="caption" color={colors.textMuted}>
            Choose which parts of your Delulu Profile appear publicly.
          </Text>
          {VISIBILITY_ROWS.map((row) => (
            <View key={row.key} style={styles.toggleRow}>
              <Text variant="body" color={colors.textInverse} style={styles.toggleLabel}>
                {row.label}
              </Text>
              <Switch
                value={profile.visibility[row.key]}
                onValueChange={(value) => updateVisibility({ [row.key]: value })}
                trackColor={{ true: colors.delulu, false: colors.borderDark }}
                thumbColor={colors.textInverse}
              />
            </View>
          ))}
        </Card>
      ) : null}

      <Text variant="caption" color={colors.textMuted} style={styles.disclaimer}>
        Unhinged is for entertainment and dating compatibility. Your Delulu Profile is not a diagnosis, and you
        control what appears publicly.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[16], paddingHorizontal: spacing[24] },
  header: { alignItems: 'center', paddingVertical: spacing[12] },
  visibility: { gap: spacing[12], marginTop: spacing[16] },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  toggleLabel: { flex: 1, paddingRight: spacing[12] },
  disclaimer: { marginTop: spacing[24], marginBottom: spacing[24] },
});
