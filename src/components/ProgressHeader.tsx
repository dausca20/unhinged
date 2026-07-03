/**
 * Onboarding / interview progress header. Shows an optional back control and a
 * "Mapping your delulu 6/14"-style label above a token-colored progress bar.
 */
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import { PressableScale } from './PressableScale';

export type ProgressHeaderProps = {
  current: number;
  total: number;
  label?: string;
  onBack?: () => void;
  showBar?: boolean;
};

export function ProgressHeader({ current, total, label, onBack, showBar = true }: ProgressHeaderProps) {
  const clampedTotal = Math.max(total, 1);
  const fraction = Math.max(0, Math.min(1, current / clampedTotal));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {onBack ? (
          <PressableScale
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textInverse} />
          </PressableScale>
        ) : (
          <View style={styles.back} />
        )}
        {label ? (
          <Text variant="caption" color={colors.textMuted}>
            {label}
          </Text>
        ) : null}
        <View style={styles.back} />
      </View>
      {showBar ? (
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: clampedTotal, now: current }}
        >
          <View style={[styles.fill, { width: `${fraction * 100}%` }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing[12], gap: spacing[12] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.borderDark,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.delulu },
});

export default ProgressHeader;
