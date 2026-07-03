/**
 * Paywall card (DESIGN_SYSTEM §9.8, DoR §12.4). Playful, never predatory —
 * avoids the pushy soulmate / scarcity / hotness lines called out as off-limits
 * in the design system. No real purchase is triggered.
 */
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';

export type PaywallCardProps = {
  headline?: string;
  body?: string;
  bullets?: string[];
  ctaLabel?: string;
  onUnlock: () => void;
  onDismiss: () => void;
};

const DEFAULT_BULLETS = [
  'See who liked your delulu',
  'Deeper match reads and compatibility breakdowns',
  'A second look at the ones you skipped too fast',
];

export function PaywallCard({
  headline = 'See who likes your delulu',
  body = 'Unlock your inbound likes, deeper match reads, and second looks. Some people have taste. Concerning, but useful.',
  bullets = DEFAULT_BULLETS,
  ctaLabel = 'Unlock',
  onUnlock,
  onDismiss,
}: PaywallCardProps) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[colors.delulu, colors.unhingedPurple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Ionicons name="lock-open" size={22} color={colors.textInverse} />
        <Text variant="h2" color={colors.textInverse}>
          {headline}
        </Text>
      </LinearGradient>
      <View style={styles.bodyWrap}>
        <Text variant="body" color={colors.textPrimary}>
          {body}
        </Text>
        <View style={styles.bullets}>
          {bullets.map((b) => (
            <View key={b} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenFlag} />
              <Text variant="caption" color={colors.textPrimary} style={styles.bulletText}>
                {b}
              </Text>
            </View>
          ))}
        </View>
        <Button label={ctaLabel} onPress={onUnlock} gradient />
        <Button label="Not now" onPress={onDismiss} variant="ghost" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.cardCream,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[24],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
  },
  bodyWrap: { padding: spacing[20], gap: spacing[12] },
  bullets: { gap: spacing[8] },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[8] },
  bulletText: { flex: 1 },
});

export default PaywallCard;
