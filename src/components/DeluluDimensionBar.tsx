/**
 * Qualitative compatibility bar (DESIGN_SYSTEM §9.5, DoR §8.3, §17.8). Shows a
 * strength WORD (Low/Medium/High/Reckless/Solid) plus a proportional bar — never
 * a raw number, and never color alone (the word backs up the color, DoR §18.2.2).
 */
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import type { CompatibilityStrength } from '@/types';

export type DeluluDimensionBarProps = {
  label: string;
  strength: CompatibilityStrength;
};

const STRENGTH_META: Record<CompatibilityStrength, { fraction: number; color: string }> = {
  Low: { fraction: 0.28, color: colors.textMuted },
  Medium: { fraction: 0.55, color: colors.unhingedPurple },
  High: { fraction: 0.85, color: colors.delulu },
  Solid: { fraction: 0.8, color: colors.greenFlag },
  Reckless: { fraction: 0.92, color: colors.dangerCrush },
};

export function DeluluDimensionBar({ label, strength }: DeluluDimensionBarProps) {
  const meta = STRENGTH_META[strength];
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text variant="caption" color={colors.textPrimary}>
          {label}
        </Text>
        <Text variant="caption" color={meta.color} weight="700">
          {strength}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${meta.fraction * 100}%`, backgroundColor: meta.color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing[4] },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
});

export default DeluluDimensionBar;
