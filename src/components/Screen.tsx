/**
 * Screen wrapper: safe-area aware, dark shell background (ink/charcoal), with an
 * optional scroll container. Keeps every screen consistent (DESIGN_SYSTEM §19).
 */
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

export type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  background?: 'ink' | 'charcoal';
  padded?: boolean;
  edges?: readonly Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scroll = false,
  background = 'ink',
  padded = true,
  edges = ['top', 'left', 'right'],
  contentContainerStyle,
  style,
}: ScreenProps) {
  const backgroundColor = background === 'charcoal' ? colors.charcoal : colors.ink;
  const paddingStyle = padded ? styles.padded : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }, style]} edges={edges}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, paddingStyle, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, paddingStyle, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  padded: { paddingHorizontal: spacing[20] },
  scrollContent: { paddingBottom: spacing[40] },
});

export default Screen;
