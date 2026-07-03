/**
 * Surface card. Cream is the primary content surface (keeps the app from feeling
 * hostile); dark is for the shell (DESIGN_SYSTEM §8). Radius/padding from tokens.
 */
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';

export type CardTone = 'cream' | 'soft' | 'dark' | 'plum';

export type CardProps = ViewProps & {
  tone?: CardTone;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

const TONE: Record<CardTone, ViewStyle> = {
  cream: { backgroundColor: colors.cardCream, borderColor: colors.borderLight },
  soft: { backgroundColor: colors.cardSoft, borderColor: colors.borderLight },
  dark: { backgroundColor: colors.charcoal, borderColor: colors.borderDark },
  plum: { backgroundColor: colors.deepPlum, borderColor: colors.borderDark },
};

export function Card({ tone = 'cream', padded = true, style, children, ...rest }: CardProps) {
  return (
    <View style={[styles.base, TONE[tone], padded ? styles.padded : null, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, borderWidth: 1 },
  padded: { padding: spacing[20] },
});

export default Card;
