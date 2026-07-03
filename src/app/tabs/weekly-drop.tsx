/**
 * Weekly Drop — the home screen (spec §8.7; DoR §7). Generated at runtime from
 * mock candidates (never hardcoded). Shows a first-of-week reveal moment, then
 * Curated · Wildcard · Already viewed sections, with working like/skip/save/view
 * actions that mutate persisted state. Free-tier likes are limited.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '@/theme';
import {
  Button,
  EmptyState,
  MatchCard,
  Screen,
  Text,
  WeeklyDropHeader,
  WildcardCard,
} from '@/components';
import { FREE_LIKE_LIMIT } from '@/types';
import { successHaptic } from '@/utils/haptics';
import { trackEvent } from '@/services/analytics/analyticsService';
import {
  selectLikesUsed,
  useAuthStore,
  useOnboardingStore,
  useWeeklyDropStore,
} from '@/stores';

export default function WeeklyDrop() {
  const user = useOnboardingStore((s) => s.user);
  const drop = useWeeklyDropStore((s) => s.drop);
  const interactions = useWeeklyDropStore((s) => s.interactions);
  const hasRevealed = useWeeklyDropStore((s) => s.hasRevealed);
  const ensureDrop = useWeeklyDropStore((s) => s.ensureDrop);
  const setRevealed = useWeeklyDropStore((s) => s.setRevealed);
  const like = useWeeklyDropStore((s) => s.like);
  const skip = useWeeklyDropStore((s) => s.skip);
  const save = useWeeklyDropStore((s) => s.save);
  const markViewed = useWeeklyDropStore((s) => s.markViewed);
  const tier = useAuthStore((s) => s.subscriptionTier);

  useEffect(() => {
    if (user.deluluScores || user.deluluProfile) ensureDrop(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const reveal = () => {
    successHaptic();
    setRevealed();
    trackEvent('weekly_drop_viewed', { dropId: drop?.id });
  };

  const goDetail = (profileId: string) => {
    markViewed(profileId);
    router.push(`/match/${profileId}`);
  };

  const onLike = (profileId: string) => {
    const likesUsed = selectLikesUsed(useWeeklyDropStore.getState());
    if (tier === 'free' && likesUsed >= FREE_LIKE_LIMIT) {
      router.push('/paywall?context=like_limit');
      return;
    }
    const { becameMutual } = like(profileId);
    if (becameMutual) successHaptic();
  };

  if (!drop) {
    return (
      <Screen>
        <WeeklyDropHeader />
        <EmptyState
          title="No drop yet"
          body="We are still assembling the delulu. Check back soon."
          iconName="sparkles-outline"
        />
      </Screen>
    );
  }

  if (!hasRevealed) {
    return (
      <Screen>
        <View style={styles.revealWrap}>
          <LinearGradient
            colors={[colors.delulu, colors.unhingedPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.revealCard}
          >
            <Text variant="micro" color={colors.textInverse}>
              This week
            </Text>
            <Text variant="h1" color={colors.textInverse}>
              Your weekly delulu is ready.
            </Text>
            <Text variant="body" color={colors.textInverse}>
              10 matches for your delulu. 1 wildcard for the plot. No infinite swiping.
            </Text>
          </LinearGradient>
          <Button label="Reveal this week’s drop" onPress={reveal} gradient />
        </View>
      </Screen>
    );
  }

  const activeCurated = drop.curated.filter(
    (c) => !interactions[c.profile.id]?.skipped && !interactions[c.profile.id]?.viewed,
  );
  const viewed = drop.curated.filter((c) => interactions[c.profile.id]?.viewed && !interactions[c.profile.id]?.skipped);
  const wildcardViewed = interactions[drop.wildcard.profile.id]?.viewed;

  return (
    <Screen scroll>
      <WeeklyDropHeader weekLabel={`Week of ${drop.weekOf}`} onFeedback={() => trackEvent('drop_feedback_submitted', { dropId: drop.id })} />

      <SectionLabel text="Curated for your delulu" />
      <View style={styles.list}>
        {activeCurated.length === 0 ? (
          <Text variant="caption" color={colors.textMuted}>
            You’ve been through the curated set. The wildcard is still waiting.
          </Text>
        ) : (
          activeCurated.map((candidate) => (
            <MatchCard
              key={candidate.id}
              candidate={candidate}
              userId={user.id}
              interaction={interactions[candidate.profile.id]}
              onView={() => goDetail(candidate.profile.id)}
              onLike={() => onLike(candidate.profile.id)}
              onSkip={() => skip(candidate.profile.id)}
              onSave={() => save(candidate.profile.id)}
            />
          ))
        )}
      </View>

      <SectionLabel text="The wildcard" />
      <View style={styles.list}>
        <WildcardCard
          candidate={drop.wildcard}
          userId={user.id}
          interaction={interactions[drop.wildcard.profile.id]}
          firstReveal={!wildcardViewed}
          onView={() => goDetail(drop.wildcard.profile.id)}
          onLike={() => onLike(drop.wildcard.profile.id)}
          onSkip={() => skip(drop.wildcard.profile.id)}
        />
      </View>

      {viewed.length > 0 ? (
        <>
          <SectionLabel text="Already viewed" />
          <View style={styles.list}>
            {viewed.map((candidate) => (
              <MatchCard
                key={candidate.id}
                candidate={candidate}
                userId={user.id}
                interaction={interactions[candidate.profile.id]}
                onView={() => goDetail(candidate.profile.id)}
                onLike={() => onLike(candidate.profile.id)}
                onSkip={() => skip(candidate.profile.id)}
                onSave={() => save(candidate.profile.id)}
              />
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text variant="micro" color={colors.textMuted} style={styles.sectionLabel}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  revealWrap: { flex: 1, justifyContent: 'center', gap: spacing[20] },
  revealCard: { borderRadius: radius.xl, padding: spacing[24], gap: spacing[8] },
  list: { gap: spacing[16], marginBottom: spacing[8] },
  sectionLabel: { marginTop: spacing[16], marginBottom: spacing[8] },
});
