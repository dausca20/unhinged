/**
 * Pill-shaped chip with an accent border and micro text (DESIGN_SYSTEM §9.4,
 * DoR §17.8). Used for Delulu labels, compatibility tags, and selectable options.
 * Selected = filled accent; interactive chips get hitSlop for a ≥44 tap target.
 */
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import { PressableScale } from './PressableScale';
import { tapHaptic } from '@/utils/haptics';

export type ChipTone = 'default' | 'delulu' | 'danger' | 'green' | 'gold' | 'purple';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: ChipTone;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const TONE_COLOR: Record<ChipTone, string> = {
  default: colors.textMuted,
  delulu: colors.delulu,
  danger: colors.dangerCrush,
  green: colors.greenFlag,
  gold: colors.dopamine,
  purple: colors.unhingedPurple,
};

export function Chip({
  label,
  selected = false,
  onPress,
  tone = 'default',
  icon,
  size = 'md',
  style,
  accessibilityLabel,
}: ChipProps) {
  const accent = TONE_COLOR[tone];
  // Selected gold/green need dark text for contrast (DoR §18.2.4).
  const selectedTextColor =
    tone === 'gold' || tone === 'green' ? colors.textPrimary : colors.textInverse;

  const container: ViewStyle = selected
    ? { backgroundColor: accent, borderColor: accent }
    : { backgroundColor: 'transparent', borderColor: accent };

  const body = (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        container,
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text variant="caption" color={selected ? selectedTextColor : accent}>
        {label}
      </Text>
    </View>
  );

  if (!onPress) return body;

  return (
    <PressableScale
      onPress={() => {
        tapHaptic();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
    >
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: spacing[8], paddingVertical: spacing[4], minHeight: 26 },
  md: { paddingHorizontal: spacing[12], paddingVertical: spacing[8], minHeight: 34 },
  icon: { marginRight: spacing[4] },
});

export default Chip;
