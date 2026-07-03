/**
 * Likes (spec §8.10; DoR §12). Free tier sees blurred/locked inbound likes with a
 * teaser and paywall CTA; a simulated paid tier reveals visible previews with a
 * liked-prompt/photo indicator. Approved copy; nothing predatory.
 */
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { Button, Card, Chip, EmptyState, ProfilePhotoCard, Screen, Text } from '@/components';
import { getMockCandidateById } from '@/mocks/mockCandidates';
import { hashString } from '@/utils/hash';
import { useAuthStore, useWeeklyDropStore } from '@/stores';
import type { UserProfile } from '@/types';

const LIKED_TARGETS = ['your opening prompt', 'your main photo', 'your green flag', 'your bio'];

export default function Likes() {
  const inboundLikeIds = useWeeklyDropStore((s) => s.inboundLikeIds);
  const tier = useAuthStore((s) => s.subscriptionTier);
  const paid = tier !== 'free';

  const inbound = inboundLikeIds
    .map((id) => getMockCandidateById(id))
    .filter((c): c is UserProfile => Boolean(c));

  if (inbound.length === 0) {
    return (
      <Screen>
        <Header />
        <EmptyState title="No likes yet" body="The plot is still loading." iconName="heart-outline" />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header />
      {!paid ? (
        <Card tone="cream" style={styles.teaser}>
          <Text variant="h3" color={colors.textPrimary}>
            They liked your delulu
          </Text>
          <Text variant="body" color={colors.textPrimary}>
            Some people have taste. Concerning, but useful. Unlock to see who.
          </Text>
          <Button label="See who likes your delulu" onPress={() => router.push('/paywall?context=inbound_likes')} gradient />
        </Card>
      ) : null}

      <View style={styles.grid}>
        {inbound.map((candidate) => (
          <View key={candidate.id} style={styles.cell}>
            <View style={styles.photoWrap}>
              <ProfilePhotoCard photo={candidate.photos[0]} height={150} showLabel={false} />
              {!paid ? (
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={22} color={colors.textInverse} />
                </View>
              ) : null}
            </View>
            {paid ? (
              <>
                <Text variant="bodyStrong" color={colors.textInverse}>
                  {candidate.firstName}, {candidate.age}
                </Text>
                <Chip label={candidate.deluluProfile?.type ?? 'Delulu'} tone="purple" size="sm" />
                <View style={styles.likedRow}>
                  <Ionicons name="heart" size={12} color={colors.delulu} />
                  <Text variant="micro" color={colors.textMuted}>
                    Liked {LIKED_TARGETS[hashString(candidate.id) % LIKED_TARGETS.length]}
                  </Text>
                </View>
              </>
            ) : (
              <Text variant="caption" color={colors.textMuted}>
                Someone with taste
              </Text>
            )}
          </View>
        ))}
      </View>
    </Screen>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Text variant="h1" color={colors.textInverse}>
        Likes
      </Text>
      <Text variant="body" color={colors.textMuted}>
        People who liked your delulu.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing[4], paddingTop: spacing[8], paddingBottom: spacing[16] },
  teaser: { gap: spacing[12], marginBottom: spacing[16] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[12] },
  cell: { width: '47%', gap: spacing[4] },
  photoWrap: { borderRadius: radius.lg, overflow: 'hidden' },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
});
