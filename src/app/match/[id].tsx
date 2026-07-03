/**
 * Match Detail + Wildcard Detail (spec §8.8, §8.9; DoR §8, §9). Renders photos,
 * prompts, Delulu Type, why-you-might-match, where-it-could-get-unhinged, the
 * qualitative compatibility breakdown (no raw numbers), a suggested opener, and
 * Like/Skip. The wildcard variant is visually distinct with its four fields.
 */
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, radius, spacing } from '@/theme';
import {
  Button,
  Card,
  Chip,
  DeluluDimensionBar,
  ProfilePhotoCard,
  PromptCard,
  Screen,
  SuggestedOpener,
  Text,
} from '@/components';
import { FREE_LIKE_LIMIT } from '@/types';
import { trackEvent, trackMatchEvent } from '@/services/analytics/analyticsService';
import { successHaptic, lightHaptic } from '@/utils/haptics';
import {
  selectLikesUsed,
  useAuthStore,
  useOnboardingStore,
  useWeeklyDropStore,
} from '@/stores';
import type { MatchCandidate } from '@/types';

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useOnboardingStore((s) => s.user);
  const drop = useWeeklyDropStore((s) => s.drop);
  const like = useWeeklyDropStore((s) => s.like);
  const skip = useWeeklyDropStore((s) => s.skip);
  const save = useWeeklyDropStore((s) => s.save);
  const markViewed = useWeeklyDropStore((s) => s.markViewed);
  const tier = useAuthStore((s) => s.subscriptionTier);
  const [openerState, setOpenerState] = useState<'idle' | 'used' | 'saved' | 'rejected'>('idle');

  const candidate: MatchCandidate | undefined =
    drop?.wildcard.profile.id === id
      ? drop?.wildcard
      : drop?.curated.find((c) => c.profile.id === id);

  useEffect(() => {
    if (!candidate) return;
    markViewed(candidate.profile.id);
    trackMatchEvent('match_explanation_viewed', user.id, candidate);
    trackMatchEvent('compatibility_breakdown_viewed', user.id, candidate);
    trackEvent('suggested_opener_viewed', { candidateId: candidate.profile.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!candidate) {
    return (
      <Screen>
        <BackBar onBack={() => router.back()} />
        <View style={styles.center}>
          <Text variant="h3" color={colors.textInverse}>
            This match isn’t in your current drop.
          </Text>
          <Button label="Back to the drop" onPress={() => router.back()} variant="secondary" fullWidth={false} />
        </View>
      </Screen>
    );
  }

  const { profile, explanation, isWildcard } = candidate;

  const onLike = () => {
    const likesUsed = selectLikesUsed(useWeeklyDropStore.getState());
    if (tier === 'free' && likesUsed >= FREE_LIKE_LIMIT) {
      router.push('/paywall?context=like_limit');
      return;
    }
    successHaptic();
    trackMatchEvent(isWildcard ? 'wildcard_liked' : 'match_liked', user.id, candidate);
    like(profile.id);
    router.back();
  };
  const onSkip = () => {
    trackMatchEvent(isWildcard ? 'wildcard_skipped' : 'match_skipped', user.id, candidate);
    skip(profile.id);
    router.back();
  };

  const opener = (
    <SuggestedOpener
      opener={explanation.suggestedOpener}
      onUse={() => {
        lightHaptic();
        trackEvent('suggested_opener_used', { candidateId: profile.id });
        setOpenerState('used');
      }}
      onSave={() => {
        save(profile.id);
        setOpenerState('saved');
      }}
      onReject={() => setOpenerState('rejected')}
    />
  );

  const openerNote =
    openerState === 'used'
      ? 'Loaded. Try not to overthink the punctuation.'
      : openerState === 'saved'
        ? 'Saved for later chaos.'
        : openerState === 'rejected'
          ? 'Understood. We’ll pretend we never suggested it.'
          : undefined;

  return (
    <Screen scroll padded={false}>
      <View style={styles.padded}>
        <BackBar onBack={() => router.back()} wildcard={isWildcard} />
      </View>

      {isWildcard ? (
        <LinearGradient
          colors={[colors.dangerCrush, colors.delulu, colors.dopamine]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.wildcardBanner}
        >
          <View style={styles.wildBadge}>
            <Ionicons name="flame" size={14} color={colors.textPrimary} />
            <Text variant="micro" color={colors.textPrimary}>
              Wildcard for the plot
            </Text>
          </View>
          <Text variant="body" color={colors.textInverse}>
            This is not your best match. The algorithm knows that. We are showing it anyway because something about
            this is funny, high-variance, or spiritually irresponsible.
          </Text>
        </LinearGradient>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
        {profile.photos.map((photo) => (
          <ProfilePhotoCard key={photo.id} photo={photo} height={280} style={styles.photo} />
        ))}
      </ScrollView>

      <View style={styles.padded}>
        <View style={styles.nameRow}>
          <Text variant="h1" color={colors.textInverse}>
            {profile.firstName}, {profile.age}
          </Text>
          <Chip label={candidate.matchLabel} tone={isWildcard ? 'gold' : 'delulu'} selected />
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text variant="caption" color={colors.textMuted}>
            {profile.location.city}, {profile.location.region}
          </Text>
          <View style={styles.dot} />
          <Chip label={profile.deluluProfile?.type ?? 'Delulu'} tone="purple" size="sm" />
        </View>
        {profile.bio ? (
          <Text variant="body" color={colors.textInverse} style={styles.bio}>
            {profile.bio}
          </Text>
        ) : null}

        {profile.prompts.map((prompt) => (
          <View key={prompt.id} style={styles.promptWrap}>
            <PromptCard prompt={prompt.prompt} answer={prompt.answer} />
          </View>
        ))}

        {isWildcard ? (
          <>
            <ExplanationBlock icon="help-circle" tone={colors.dangerCrush} label="Why this is not a clean match" body={explanation.whyNotACleanMatch ?? explanation.whereItCouldGetUnhinged} />
            <ExplanationBlock icon="flame" tone={colors.dopamine} label="Why it might still be fun" body={explanation.whyItMightStillBeFun ?? explanation.whyYouMightMatch} />
            <ExplanationBlock icon="flask" tone={colors.unhingedPurple} label="What we are testing" body={explanation.whatWeAreTesting ?? 'Whether the plot is worth it.'} />
          </>
        ) : (
          <>
            <ExplanationBlock icon="heart" tone={colors.delulu} label="Why you might match" body={explanation.whyYouMightMatch} />
            <ExplanationBlock icon="warning" tone={colors.dangerCrush} label="Where it could get unhinged" body={explanation.whereItCouldGetUnhinged} />
          </>
        )}

        <Card tone="cream" style={styles.breakdown}>
          <Text variant="micro" color={colors.unhingedPurple}>
            Compatibility breakdown
          </Text>
          {candidate.compatibilityBreakdown.map((item) => (
            <DeluluDimensionBar key={item.dimension} label={item.label} strength={item.strength} />
          ))}
        </Card>

        {opener}
        {openerNote ? (
          <Text variant="caption" color={colors.dopamine} style={styles.openerNote}>
            {openerNote}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Button label={isWildcard ? 'For the plot' : 'Like this delulu'} onPress={onLike} gradient />
          <Button label="Not my delulu" onPress={onSkip} variant="ghost" />
        </View>
      </View>
    </Screen>
  );
}

function BackBar({ onBack, wildcard = false }: { onBack: () => void; wildcard?: boolean }) {
  return (
    <View style={styles.backBar}>
      <Chip label="Back" tone={wildcard ? 'gold' : 'delulu'} onPress={onBack} size="sm" />
    </View>
  );
}

function ExplanationBlock({
  icon,
  tone,
  label,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone: string;
  label: string;
  body: string;
}) {
  return (
    <Card tone="dark" style={styles.expl}>
      <View style={styles.explHead}>
        <Ionicons name={icon} size={16} color={tone} />
        <Text variant="micro" color={tone}>
          {label}
        </Text>
      </View>
      <Text variant="body" color={colors.textInverse}>
        {body}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  padded: { paddingHorizontal: spacing[20] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[16] },
  backBar: { paddingVertical: spacing[8] },
  wildcardBanner: { marginHorizontal: spacing[20], borderRadius: radius.lg, padding: spacing[16], gap: spacing[8], marginBottom: spacing[8] },
  wildBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    backgroundColor: colors.dopamine,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[4],
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  photos: { paddingHorizontal: spacing[20], gap: spacing[8], paddingVertical: spacing[8] },
  photo: { width: 220 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[8], marginTop: spacing[8] },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], flexWrap: 'wrap', marginTop: spacing[4] },
  dot: { width: 3, height: 3, borderRadius: radius.pill, backgroundColor: colors.textMuted, marginHorizontal: spacing[4] },
  bio: { marginTop: spacing[12] },
  promptWrap: { marginTop: spacing[12] },
  expl: { gap: spacing[8], marginTop: spacing[16] },
  explHead: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  breakdown: { gap: spacing[12], marginTop: spacing[16] },
  openerNote: { marginTop: spacing[8], fontStyle: 'italic' },
  actions: { gap: spacing[8], marginTop: spacing[24], marginBottom: spacing[32] },
});
