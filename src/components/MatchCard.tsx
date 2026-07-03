/**
 * Match card (spec §8.7, §19; DoR §7.4, §7.6). Cream surface on the dark shell.
 * Shows photo, name/age, location, Delulu Type, match label, short reason,
 * compatibility chips, and actions. Emits an analytics event on IMPRESSION and
 * on every ACTION (spec §19), each with the full match payload.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import { Chip, type ChipTone } from './Chip';
import { MatchScorePill } from './MatchScorePill';
import { ProfilePhotoCard } from './ProfilePhotoCard';
import { PressableScale } from './PressableScale';
import { successHaptic, tapHaptic } from '@/utils/haptics';
import { trackMatchEvent } from '@/services/analytics/analyticsService';
import type { CompatibilityStrength, MatchCandidate } from '@/types';
import type { InteractionState } from '@/stores/weeklyDropStore';

export type MatchCardProps = {
  candidate: MatchCandidate;
  userId: string;
  onView: () => void;
  onLike: () => void;
  onSkip: () => void;
  onSave: () => void;
  interaction?: InteractionState;
};

function strengthTone(strength: CompatibilityStrength): ChipTone {
  switch (strength) {
    case 'High':
      return 'delulu';
    case 'Solid':
      return 'green';
    case 'Reckless':
      return 'danger';
    case 'Medium':
      return 'purple';
    default:
      return 'default';
  }
}

export function MatchCard({ candidate, userId, onView, onLike, onSkip, onSave, interaction }: MatchCardProps) {
  useEffect(() => {
    trackMatchEvent('match_card_impression', userId, candidate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate.id]);

  const { profile } = candidate;
  const mainPhoto = profile.photos[0];
  const deluluType = profile.deluluProfile?.type ?? 'Delulu in progress';

  const handleView = () => {
    trackMatchEvent('match_card_expanded', userId, candidate);
    onView();
  };
  const handleLike = () => {
    successHaptic();
    trackMatchEvent('match_liked', userId, candidate);
    onLike();
  };
  const handleSkip = () => {
    tapHaptic();
    trackMatchEvent('match_skipped', userId, candidate);
    onSkip();
  };
  const handleSave = () => {
    tapHaptic();
    trackMatchEvent('match_saved', userId, candidate);
    onSave();
  };

  return (
    <View style={styles.card}>
      <PressableScale onPress={handleView} accessibilityRole="button" accessibilityLabel={`View ${profile.firstName}'s profile`}>
        {mainPhoto ? <ProfilePhotoCard photo={mainPhoto} height={260} showLabel={false} /> : null}
      </PressableScale>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text variant="h2" color={colors.textPrimary}>
            {profile.firstName}, {profile.age}
          </Text>
          <MatchScorePill label={candidate.matchLabel} />
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text variant="caption" color={colors.textMuted}>
            {profile.location.city}, {profile.location.region}
          </Text>
          <View style={styles.dot} />
          <Chip label={deluluType} tone="purple" size="sm" />
        </View>

        <Text variant="body" color={colors.textPrimary}>
          {candidate.explanation.whyYouMightMatch}
        </Text>

        <View style={styles.chips}>
          {candidate.compatibilityBreakdown.slice(0, 3).map((item) => (
            <Chip
              key={item.dimension}
              label={`${item.label}: ${item.strength}`}
              tone={strengthTone(item.strength)}
              size="sm"
            />
          ))}
        </View>

        {interaction?.liked ? (
          <View style={[styles.status, styles.statusLiked]}>
            <Ionicons name="heart" size={16} color={colors.greenFlag} />
            <Text variant="caption" color={colors.greenFlag} weight="700">
              Delulu sent.
            </Text>
          </View>
        ) : (
          <View style={styles.actions}>
            <ActionButton icon="heart" label="Like this delulu" tone={colors.delulu} primary onPress={handleLike} />
            <ActionButton icon="eye-outline" label="View" tone={colors.textPrimary} onPress={handleView} />
          </View>
        )}
        <View style={styles.secondaryActions}>
          <SecondaryAction
            icon="close"
            label="Not my delulu"
            tone={colors.textMuted}
            onPress={handleSkip}
            disabled={interaction?.skipped}
          />
          <SecondaryAction
            icon={interaction?.saved ? 'bookmark' : 'bookmark-outline'}
            label={interaction?.saved ? 'Saved' : 'Save for later'}
            tone={interaction?.saved ? colors.dopamine : colors.textMuted}
            onPress={handleSave}
          />
        </View>
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  tone,
  onPress,
  primary = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.action, primary ? { backgroundColor: tone } : { borderColor: tone, borderWidth: 1.5 }]}
    >
      <Ionicons name={icon} size={18} color={primary ? colors.textInverse : tone} />
      <Text variant="caption" color={primary ? colors.textInverse : tone} weight="600">
        {label}
      </Text>
    </PressableScale>
  );
}

function SecondaryAction({
  icon,
  label,
  tone,
  onPress,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[styles.secondary, disabled ? styles.secondaryDisabled : null]}
    >
      <Ionicons name={icon} size={16} color={tone} />
      <Text variant="caption" color={tone}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardCream,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  body: { padding: spacing[16], gap: spacing[12] },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[8] },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], flexWrap: 'wrap' },
  dot: { width: 3, height: 3, borderRadius: radius.pill, backgroundColor: colors.textMuted, marginHorizontal: spacing[4] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] },
  actions: { flexDirection: 'row', gap: spacing[8] },
  action: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[8],
  },
  secondaryActions: { flexDirection: 'row', justifyContent: 'space-between' },
  secondary: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], minHeight: 44, paddingHorizontal: spacing[8] },
  secondaryDisabled: { opacity: 0.4 },
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing[8], minHeight: 48, justifyContent: 'center' },
  statusLiked: {
    backgroundColor: colors.successWash,
    borderRadius: radius.pill,
  },
});

export default MatchCard;
