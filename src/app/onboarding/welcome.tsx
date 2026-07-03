/**
 * Welcome (spec §8.1, DoR §3.1). Establishes the premise. Primary CTA advances to
 * Basics; secondary "I already have an account" stubs a mock signed-in state.
 * Playful/premium/dating-native — no wellness or therapy framing.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors, radius, spacing } from '@/theme';
import { Button, Screen, Text } from '@/components';
import { SAMPLE_COMPLETED_USER } from '@/mocks/currentUser';
import { trackEvent } from '@/services/analytics/analyticsService';
import { mockSignIn } from '@/services/auth/authService';
import { useAuthStore, useDeluluStore, useOnboardingStore, useWeeklyDropStore } from '@/stores';

export default function Welcome() {
  const setUser = useOnboardingStore((s) => s.setUser);
  const setCompleted = useOnboardingStore((s) => s.setCompleted);
  const setProfile = useDeluluStore((s) => s.setProfile);
  const signInMock = useAuthStore((s) => s.signInMock);
  const generateDrop = useWeeklyDropStore((s) => s.generate);

  useEffect(() => {
    trackEvent('onboarding_started', {});
    trackEvent('onboarding_step_viewed', { step: 'welcome' });
  }, []);

  const startRead = () => {
    router.push('/onboarding/basics');
  };

  const alreadyHaveAccount = async () => {
    // Stub a mock signed-in, fully-onboarded state and jump to the tabs.
    const user = await mockSignIn();
    signInMock();
    setUser(user);
    if (user.deluluProfile) setProfile(user.deluluProfile);
    generateDrop(user);
    setCompleted(true);
    router.replace('/tabs/weekly-drop');
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.hero}>
          <LinearGradient
            colors={[colors.delulu, colors.unhingedPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text variant="display" color={colors.textInverse}>
              U
            </Text>
          </LinearGradient>
          <Text variant="micro" color={colors.textMuted}>
            Unhinged
          </Text>
        </View>

        <View style={styles.copy}>
          <Text variant="display" color={colors.textInverse}>
            Find someone whose delulu fits yours.
          </Text>
          <Text variant="body" color={colors.textMuted}>
            No endless swiping. No fake compatibility quiz energy. Unhinged learns your romantic operating system,
            then gives you 10 weekly matches plus one wildcard we probably should not be showing you.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button label="Start my Delulu Read" onPress={startRead} gradient />
          <Button label="I already have an account" onPress={alreadyHaveAccount} variant="ghost" />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingVertical: spacing[24] },
  hero: { alignItems: 'center', gap: spacing[8], marginTop: spacing[24] },
  logo: { width: 72, height: 72, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  copy: { gap: spacing[16] },
  actions: { gap: spacing[12] },
});
