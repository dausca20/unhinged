/**
 * AsyncStorage-backed persistence for Zustand (spec §17, DoR §16.2). Only small,
 * non-sensitive app state is persisted. Auth tokens, private secrets, and chat
 * messages are NEVER persisted (DoR §16.3) — those stores omit persist or
 * partialize sensitive fields out.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

export const zustandStorage = createJSONStorage(() => AsyncStorage);
