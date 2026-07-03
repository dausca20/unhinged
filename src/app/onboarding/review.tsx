/**
 * Review (spec §8.6 wrap-up; DoR §3.5). Summarizes basics, preferences, and the
 * Delulu Profile with jump-back-to-edit on each section. Completing sets
 * onboarding-complete, applies the match-style flexibility bias, attaches the
 * profile to the user, generates the first weekly drop, and routes to tabs.
 */
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '@/theme';
import { Button, Card, Chip, Screen, Text } from '@/components';
import {
  MATCH_STYLE_LABELS,
  MONOGAMY_LABELS,
  RELATIONSHIP_INTENT_LABELS,
} from '@/types';
import { applyMatchStyleToScores } from '@/services/delulu/deluluScoringService';
import { trackEvent } from '@/services/analytics/analyticsService';
import { useAuthStore, useDeluluStore, useOnboardingStore, useWeeklyDropStore } from '@/stores';

export default function Review() {
  const user = useOnboardingStore((s) => s.user);
  const setUser = useOnboardingStore((s) => s.setUser);
  const setCompleted = useOnboardingStore((s) => s.setCompleted);
  const profile = useDeluluStore((s) => s.profile);
  const setProfile = useDeluluStore((s) => s.setProfile);
  const generateDrop = useWeeklyDropStore((s) => s.generate);
  const signInMock = useAuthStore((s) => s.signInMock);
  const tier = useAuthStore((s) => s.subscriptionTier);

  const prefs = user.preferences;

  const complete = () => {
    if (!profile) {
      router.replace('/onboarding/interview');
      return;
    }
    // Match style biases Delulu Flexibility, which feeds matching (DoR §3.4.2).
    const biasedScores = applyMatchStyleToScores(profile.scores, prefs.matchStyle);
    const finalProfile = { ...profile, scores: biasedScores };
    setProfile(finalProfile);

    const finalUser = {
      ...user,
      deluluProfile: finalProfile,
      deluluScores: biasedScores,
      subscriptionTier: tier,
    };
    setUser(finalUser);
    generateDrop(finalUser);
    setCompleted(true);
    signInMock();
    trackEvent('onboarding_completed', { deluluType: finalProfile.type });
    router.replace('/tabs/weekly-drop');
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="h1" color={colors.textInverse}>
          One last look
        </Text>
        <Text variant="body" color={colors.textMuted}>
          Edit anything before we build your first drop.
        </Text>
      </View>

      <SummaryCard title="Basics" onEdit={() => router.push('/onboarding/basics?edit=1')}>
        <Line label="Name" value={`${user.firstName || '—'}, ${user.age || '—'}`} />
        <Line label="Location" value={`${user.location.city || '—'}, ${user.location.region || ''}`} />
        <Line label="Identifies as" value={user.gender || '—'} />
        <Line label="Wants to date" value={user.interestedIn.join(', ') || '—'} />
        <Line label="Looking for" value={RELATIONSHIP_INTENT_LABELS[user.relationshipIntent]} />
      </SummaryCard>

      <SummaryCard title="Preferences" onEdit={() => router.push('/onboarding/preferences?edit=1')}>
        <Line label="Monogamy" value={MONOGAMY_LABELS[prefs.monogamyStyle]} />
        <Line label="Age range" value={`${prefs.ageRange.min}–${prefs.ageRange.max}`} />
        <Line label="Distance" value={`${prefs.maxDistanceMiles} mi`} />
        <Line label="Dealbreakers" value={prefs.dealbreakers.join(', ') || 'None'} />
        <Line label="Match style" value={MATCH_STYLE_LABELS[prefs.matchStyle]} />
      </SummaryCard>

      <SummaryCard title="Delulu Profile" onEdit={() => router.push('/onboarding/profile-card')}>
        {profile ? (
          <>
            <Text variant="bodyStrong" color={colors.textPrimary}>
              {profile.type}
            </Text>
            <View style={styles.traits}>
              {profile.topTraits.map((t) => (
                <Chip key={t.dimension} label={t.label} tone="delulu" size="sm" />
              ))}
            </View>
          </>
        ) : (
          <Text variant="caption" color={colors.textMuted}>
            Not generated yet.
          </Text>
        )}
      </SummaryCard>

      <View style={styles.footer}>
        <Button label="Looks right — build my drop" onPress={complete} gradient />
      </View>
    </Screen>
  );
}

function SummaryCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card tone="cream" style={styles.card}>
      <View style={styles.cardHead}>
        <Text variant="h3" color={colors.textPrimary}>
          {title}
        </Text>
        <Chip label="Edit" tone="delulu" onPress={onEdit} size="sm" />
      </View>
      {children}
    </Card>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.line}>
      <Text variant="caption" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="body" color={colors.textPrimary} style={styles.lineValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing[4], paddingVertical: spacing[12] },
  card: { gap: spacing[8], marginBottom: spacing[16] },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing[12] },
  lineValue: { flex: 1, textAlign: 'right' },
  traits: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8], marginTop: spacing[4] },
  footer: { marginTop: spacing[8], marginBottom: spacing[24] },
});
