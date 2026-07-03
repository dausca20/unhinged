/**
 * Thin, safe wrappers around expo-haptics. Guarded so unsupported platforms
 * (e.g. web) never throw. Reward haptics fire only on meaningful actions
 * (DESIGN_SYSTEM §10, DoR §18.1.1).
 */
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

export function tapHaptic(): void {
  if (!enabled) return;
  Haptics.selectionAsync().catch(() => {});
}

export function successHaptic(): void {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function lightHaptic(): void {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
