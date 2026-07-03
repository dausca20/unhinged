/**
 * Custom bottom tab bar (DESIGN_SYSTEM §9.1, DoR §2.4, §17.7). Four tabs —
 * Drop · Likes · Messages · Profile. Active = Delulu-pink icon + underline +
 * subtle glow; inactive = muted lavender-gray. Simple labels, no aggressive
 * bounce. Tap targets ≥44 (DoR §18.2.1).
 *
 * Typed with a minimal structural props shape so it doesn't depend on the
 * (non-hoisted) @react-navigation/bottom-tabs package.
 */
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import { PressableScale } from './PressableScale';
import { tapHaptic } from '@/utils/haptics';

type TabRoute = { key: string; name: string };

export type BottomTabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
  };
};

const TAB_META: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  'weekly-drop': { label: 'Drop', icon: 'sparkles' },
  likes: { label: 'Likes', icon: 'heart' },
  matches: { label: 'Messages', icon: 'chatbubbles' },
  profile: { label: 'Profile', icon: 'person' },
};

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing[8]) }]}>
      {state.routes.map((route, index) => {
        const meta = TAB_META[route.name];
        if (!meta) return null;
        const focused = state.index === index;
        const tint = focused ? colors.delulu : colors.textMuted;

        const onPress = () => {
          tapHaptic();
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <PressableScale
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.label}
            style={styles.tab}
          >
            <View style={styles.tabInner}>
              <View style={focused ? styles.glow : undefined}>
                <Ionicons name={meta.icon} size={24} color={tint} />
              </View>
              <Text variant="micro" color={tint}>
                {meta.label}
              </Text>
              <View style={[styles.underline, focused ? styles.underlineActive : null]} />
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.charcoal,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingTop: spacing[8],
  },
  tab: { flex: 1, minHeight: 44 },
  tabInner: { alignItems: 'center', justifyContent: 'center', gap: spacing[2] },
  glow: {
    shadowColor: colors.delulu,
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  underline: { height: 3, width: 20, borderRadius: radius.pill, backgroundColor: 'transparent', marginTop: spacing[2] },
  underlineActive: { backgroundColor: colors.delulu },
});

export default BottomTabBar;
