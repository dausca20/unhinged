/**
 * Entry router (spec §7, DoR §2.2, §2.3). Waits for persisted onboarding state to
 * hydrate, then routes: incomplete onboarding → onboarding group; complete →
 * tabs group (skips onboarding on relaunch).
 */
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { colors } from '@/theme';
import { Screen, Text } from '@/components';
import { useOnboardingStore } from '@/stores';

export default function Index() {
  const hasHydrated = useOnboardingStore((s) => s.hasHydrated);
  const completedOnboarding = useOnboardingStore((s) => s.completedOnboarding);

  if (!hasHydrated) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.delulu} />
          <Text variant="caption" color={colors.textMuted}>
            Reading the lore…
          </Text>
        </View>
      </Screen>
    );
  }

  return <Redirect href={completedOnboarding ? '/tabs/weekly-drop' : '/onboarding/welcome'} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
