/**
 * Wildcard card (spec §8.9, §19; DoR §9). Visually distinct: a red-purple-gold
 * gradient frame, a "Wildcard for the plot" gold badge, and a one-time shimmer on
 * first reveal (fades instead under reduce-motion — DoR §18.2.3). Emits a
 * separate wildcard analytics event on impression and on actions (DoR §15.4).
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, motion, radius, spacing } from '@/theme';
import { Text } from './Text';
import { Chip } from './Chip';
import { ProfilePhotoCard } from './ProfilePhotoCard';
import { PressableScale } from './PressableScale';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { successHaptic, tapHaptic } from '@/utils/haptics';
import { trackMatchEvent } from '@/services/analytics/analyticsService';
import type { MatchCandidate } from '@/types';
import type { InteractionState } from '@/stores/weeklyDropStore';

export type WildcardCardProps = {
  candidate: MatchCandidate;
  userId: string;
  onView: () => void;
  onLike: () => void;
  onSkip: () => void;
  interaction?: InteractionState;
  firstReveal?: boolean;
};

export function WildcardCard({
  candidate,
  userId,
  onView,
  onLike,
  onSkip,
  interaction,
  firstReveal = false,
}: WildcardCardProps) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(firstReveal ? 0 : 1)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    trackMatchEvent('wildcard_impression', userId, candidate);
    if (firstReveal) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: reduced ? motion.standard : motion.reveal,
        useNativeDriver: true,
      }).start();
      if (!reduced) {
        Animated.timing(shimmer, {
          toValue: 1,
          duration: motion.reveal,
          useNativeDriver: true,
        }).start();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate.id]);

  const { profile } = candidate;
  const mainPhoto = profile.photos[0];
  const shimmerTranslate = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-220, 260] });

  const handleView = () => {
    trackMatchEvent('wildcard_expanded', userId, candidate);
    onView();
  };
  const handleLike = () => {
    successHaptic();
    trackMatchEvent('wildcard_liked', userId, candidate);
    onLike();
  };
  const handleSkip = () => {
    tapHaptic();
    trackMatchEvent('wildcard_skipped', userId, candidate);
    onSkip();
  };

  return (
    <Animated.View style={{ opacity }}>
      <LinearGradient
        colors={[colors.dangerCrush, colors.delulu, colors.dopamine]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.frame}
      >
        <View style={styles.inner}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="flame" size={14} color={colors.textPrimary} />
              <Text variant="micro" color={colors.textPrimary}>
                Wildcard for the plot
              </Text>
            </View>
          </View>

          <PressableScale onPress={handleView} accessibilityRole="button" accessibilityLabel={`View wildcard ${profile.firstName}`}>
            {mainPhoto ? <ProfilePhotoCard photo={mainPhoto} height={200} showLabel={false} /> : null}
          </PressableScale>

          <Text variant="h2" color={colors.textPrimary}>
            {profile.firstName}, {profile.age}
          </Text>
          <Text variant="caption" color={colors.textMuted}>
            {profile.location.city}, {profile.location.region} · {profile.deluluProfile?.type ?? 'Delulu unknown'}
          </Text>
          <Text variant="body" color={colors.textPrimary}>
            This is not your best match. The algorithm knows. We are showing it anyway because something here is
            spiritually irresponsible.
          </Text>
          <Chip label="The Wildcard" tone="gold" selected />

          {interaction?.liked ? (
            <View style={styles.liked}>
              <Ionicons name="heart" size={16} color={colors.greenFlag} />
              <Text variant="caption" color={colors.greenFlag} weight="700">
                Sent, for the plot.
              </Text>
            </View>
          ) : (
            <View style={styles.actions}>
              <PressableScale onPress={handleLike} accessibilityRole="button" accessibilityLabel="Like the wildcard" style={[styles.action, styles.likeAction]}>
                <Ionicons name="flame" size={18} color={colors.textInverse} />
                <Text variant="caption" color={colors.textInverse} weight="700">
                  For the plot
                </Text>
              </PressableScale>
              <PressableScale onPress={handleView} accessibilityRole="button" accessibilityLabel="View wildcard details" style={[styles.action, styles.viewAction]}>
                <Ionicons name="eye-outline" size={18} color={colors.textPrimary} />
                <Text variant="caption" color={colors.textPrimary} weight="600">
                  View
                </Text>
              </PressableScale>
              <PressableScale onPress={handleSkip} accessibilityRole="button" accessibilityLabel="Skip wildcard" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.skip}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </PressableScale>
            </View>
          )}
        </View>

        {firstReveal && !reduced ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }, { rotate: '18deg' }] }]}
          />
        ) : null}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: radius.xl, padding: 2, overflow: 'hidden' },
  inner: {
    backgroundColor: colors.cardCream,
    borderRadius: radius.xl - 2,
    padding: spacing[16],
    gap: spacing[8],
  },
  badgeRow: { flexDirection: 'row' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    backgroundColor: colors.dopamine,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[4],
    borderRadius: radius.pill,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing[8], marginTop: spacing[4] },
  action: {
    minHeight: 48,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[8],
    paddingHorizontal: spacing[16],
  },
  likeAction: { backgroundColor: colors.dangerCrush, flex: 1 },
  viewAction: { borderWidth: 1.5, borderColor: colors.textPrimary },
  skip: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  liked: { flexDirection: 'row', alignItems: 'center', gap: spacing[8], minHeight: 48, justifyContent: 'center' },
  shimmer: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 80,
    backgroundColor: colors.shimmer,
  },
});

export default WildcardCard;
