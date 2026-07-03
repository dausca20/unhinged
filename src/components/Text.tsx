/**
 * Typed text primitive. Maps a `variant` to a typography token and a `color` to
 * a token value. Core UI uses the system sans; there is no separate accent font
 * file in this prototype (DoR §17.6 is POLISH) — hero/label weight is expressed
 * through the token weights instead.
 */
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { colors, typography } from '@/theme';

type Variant = keyof typeof typography;

export type AppTextProps = RNTextProps & {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
};

export function Text({
  variant = 'body',
  color = colors.textInverse,
  align,
  weight,
  style,
  ...rest
}: AppTextProps) {
  return (
    <RNText
      style={[
        typography[variant] as TextStyle,
        { color, textAlign: align },
        weight ? { fontWeight: weight } : null,
        style,
      ]}
      {...rest}
    />
  );
}

export default Text;
