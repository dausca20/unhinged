/**
 * Profile (spec §8.13; DoR §14). Profile preview, the Delulu Profile with public/
 * private toggles (synced with §6.5), match-preferences summary, a simulated
 * subscription tier switch, editing entries, and a settings entry.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import {
  Button,
  Card,
  Chip,
  DeluluProfileCard,
  ProfilePhotoCard,
  PromptCard,
  PressableScale,
  Screen,
  Text,
} from '@/components';
import {
  MATCH_STYLE_LABELS,
  RELATIONSHIP_INTENT_LABELS,
  SUBSCRIPTION_TIER_LABELS,
  SUBSCRIPTION_TIERS,
  type DeluluVisibility,
} from '@/types';
import { useAuthStore, useDeluluStore, useOnboardingStore } from '@/stores';

const VISIBILITY_ROWS: { key: keyof DeluluVisibility; label: string }[] = [
  { key: 'showType', label: 'Show my Delulu Type' },
  { key: 'showTopTraits', label: 'Show top traits' },
  { key: 'hideDangerZone', label: 'Hide danger zone' },
  { key: 'hideMatchExplanationDetails', label: 'Hide match-explanation details' },
  { key: 'useSuggestedProfileLine', label: 'Use suggested profile line' },
];

export default function Profile() {
  const user = useOnboardingStore((s) => s.user);
  const profile = useDeluluStore((s) => s.profile);
  const updateVisibility = useDeluluStore((s) => s.updateVisibility);
  const tier = useAuthStore((s) => s.subscriptionTier);
  const setTier = useAuthStore((s) => s.setSubscriptionTier);
  const [preview, setPreview] = useState(false);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="h1" color={colors.textInverse}>
          {user.firstName || 'Your profile'}
        </Text>
        <PressableScale
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.settingsBtn}
        >
          <Ionicons name="settings-outline" size={24} color={colors.textInverse} />
        </PressableScale>
      </View>

      {user.photos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
          {user.photos.map((photo) => (
            <ProfilePhotoCard key={photo.id} photo={photo} height={160} style={styles.photo} />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.metaRow}>
        <Text variant="bodyStrong" color={colors.textInverse}>
          {user.firstName}
          {user.age ? `, ${user.age}` : ''}
        </Text>
        {user.location.city ? (
          <Text variant="caption" color={colors.textMuted}>
            {user.location.city}, {user.location.region}
          </Text>
        ) : null}
      </View>

      {user.prompts.map((prompt) => (
        <View key={prompt.id} style={styles.promptWrap}>
          <PromptCard prompt={prompt.prompt} answer={prompt.answer} />
        </View>
      ))}

      <View style={styles.editRow}>
        <Button label="Edit profile & photos" onPress={() => router.push('/onboarding/basics?edit=1')} variant="secondary" fullWidth={false} />
        <Button label="Edit preferences" onPress={() => router.push('/onboarding/preferences?edit=1')} variant="ghost" fullWidth={false} />
      </View>

      {profile ? (
        <>
          <View style={styles.sectionHead}>
            <Text variant="h3" color={colors.textInverse}>
              Your Delulu Profile
            </Text>
            <Chip
              label={preview ? 'Owner view' : 'Preview public'}
              tone="purple"
              onPress={() => setPreview((v) => !v)}
              size="sm"
            />
          </View>
          <DeluluProfileCard profile={profile} respectVisibility={preview} />

          <Card tone="dark" style={styles.visibility}>
            <Text variant="micro" color={colors.textMuted}>
              Control what becomes lore
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
        </>
      ) : null}

      <View style={styles.sectionHead}>
        <Text variant="h3" color={colors.textInverse}>
          Match preferences
        </Text>
      </View>
      <Card tone="cream" style={styles.prefs}>
        <PrefLine label="Looking for" value={RELATIONSHIP_INTENT_LABELS[user.relationshipIntent]} />
        <PrefLine label="Age range" value={`${user.preferences.ageRange.min}–${user.preferences.ageRange.max}`} />
        <PrefLine label="Distance" value={`${user.preferences.maxDistanceMiles} mi`} />
        <PrefLine label="Match style" value={MATCH_STYLE_LABELS[user.preferences.matchStyle]} />
      </Card>

      <View style={styles.sectionHead}>
        <Text variant="h3" color={colors.textInverse}>
          Subscription
        </Text>
      </View>
      <Text variant="caption" color={colors.textMuted}>
        Simulated tier — no real purchase.
      </Text>
      <View style={styles.chips}>
        {SUBSCRIPTION_TIERS.map((t) => (
          <Chip key={t} label={SUBSCRIPTION_TIER_LABELS[t]} tone="delulu" selected={tier === t} onPress={() => setTier(t)} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button label="Settings" onPress={() => router.push('/settings')} variant="ghost" />
      </View>
    </Screen>
  );
}

function PrefLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.prefLine}>
      <Text variant="caption" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="body" color={colors.textPrimary}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing[8], paddingBottom: spacing[16] },
  settingsBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  photos: { gap: spacing[8], paddingVertical: spacing[4] },
  photo: { width: 130 },
  metaRow: { gap: spacing[2], marginTop: spacing[12] },
  promptWrap: { marginTop: spacing[12] },
  editRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8], marginTop: spacing[16], marginBottom: spacing[8] },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[24], marginBottom: spacing[12] },
  visibility: { gap: spacing[8], marginTop: spacing[16] },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  toggleLabel: { flex: 1, paddingRight: spacing[12] },
  prefs: { gap: spacing[8] },
  prefLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8], marginTop: spacing[8] },
  footer: { marginTop: spacing[24], marginBottom: spacing[32] },
});
