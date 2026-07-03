/**
 * Pressable with a subtle scale-to-0.98 press feedback (DESIGN_SYSTEM §11). The
 * animation is disabled under reduce-motion and never blocks the press action.
 */
import { useRef } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { motion } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type PressableScaleProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export function PressableScale({
  children,
  style,
  scaleTo = 0.98,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();

  const animate = (toValue: number) => {
    if (reduced) return;
    Animated.timing(scale, {
      toValue,
      duration: motion.instant,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={(e) => {
        animate(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animate(1);
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children as React.ReactNode}
      </Animated.View>
    </Pressable>
  );
}

export default PressableScale;
