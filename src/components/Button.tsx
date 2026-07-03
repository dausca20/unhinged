/**
 * Button primitive. Variants map to token color roles: primary = Delulu-pink,
 * danger = Danger Crush, secondary/ghost = outline/text. Min height ≥44 for tap
 * targets (DoR §18.2.1). Optional brand gradient for selected/hero CTAs only
 * (DoR §17.5).
 */
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import { PressableScale } from './PressableScale';
import { tapHaptic } from '@/utils/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  gradient?: boolean;
  fullWidth?: boolean;
  haptic?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
};

const BRAND_GRADIENT = [colors.delulu, colors.unhingedPurple] as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  gradient = false,
  fullWidth = true,
  haptic = true,
  icon,
  style,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? colors.textInverse
      : variant === 'ghost'
        ? colors.delulu
        : colors.textInverse;

  const containerVariant: ViewStyle =
    variant === 'primary'
      ? { backgroundColor: colors.delulu }
      : variant === 'danger'
        ? { backgroundColor: colors.dangerCrush }
        : variant === 'secondary'
          ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.delulu }
          : { backgroundColor: 'transparent' };

  const handlePress = () => {
    if (isDisabled) return;
    if (haptic) tapHaptic();
    onPress?.();
  };

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text variant="bodyStrong" color={textColor}>
            {label}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <PressableScale
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      testID={testID}
      style={[fullWidth ? styles.fullWidth : null, isDisabled ? styles.disabled : null, style]}
    >
      {gradient && variant === 'primary' ? (
        <LinearGradient
          colors={BRAND_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.base, containerVariant]}>{content}</View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[24],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: spacing[8] },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
});

export default Button;
