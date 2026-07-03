/**
 * Profile photo. Mock photos have no uri, so we render a labelled gradient
 * placeholder tinted deterministically by `placeholderTint` (spec §8.3). Used
 * both for display and for selectable mock photos in onboarding.
 */
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import { PressableScale } from './PressableScale';
import type { ProfilePhoto } from '@/types';

const TINTS: [string, string][] = [
  [colors.delulu, colors.unhingedPurple],
  [colors.unhingedPurple, colors.deepPlum],
  [colors.dangerCrush, colors.delulu],
  [colors.dopamine, colors.delulu],
  [colors.greenFlag, colors.unhingedPurple],
  [colors.deepPlum, colors.charcoal],
];

export type ProfilePhotoCardProps = {
  photo: ProfilePhoto;
  height?: number;
  rounded?: boolean;
  selected?: boolean;
  onPress?: () => void;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ProfilePhotoCard({
  photo,
  height = 220,
  rounded = true,
  selected = false,
  onPress,
  showLabel = true,
  style,
}: ProfilePhotoCardProps) {
  const tint = TINTS[photo.placeholderTint % TINTS.length];

  const inner = (
    <View
      style={[
        styles.container,
        { height, borderRadius: rounded ? radius.lg : 0 },
        selected ? styles.selected : null,
        style,
      ]}
    >
      {photo.uri ? (
        <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="cover" />
      ) : (
        <LinearGradient colors={tint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.image}>
          <Ionicons name="person" size={Math.min(height * 0.28, 64)} color={colors.textInverse} style={styles.ghost} />
        </LinearGradient>
      )}
      {showLabel ? (
        <View style={styles.labelWrap}>
          <Text variant="micro" color={colors.textInverse}>
            {photo.label}
          </Text>
        </View>
      ) : null}
      {selected ? (
        <View style={styles.check}>
          <Ionicons name="checkmark-circle" size={26} color={colors.delulu} />
        </View>
      ) : null}
    </View>
  );

  if (!onPress) return inner;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${selected ? 'Selected' : 'Select'} photo ${photo.label}`}
    >
      {inner}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: colors.deepPlum },
  image: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ghost: { opacity: 0.55 },
  selected: { borderWidth: 2.5, borderColor: colors.delulu },
  labelWrap: {
    position: 'absolute',
    bottom: spacing[8],
    left: spacing[8],
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    borderRadius: radius.sm,
  },
  check: { position: 'absolute', top: spacing[8], right: spacing[8] },
});

export default ProfilePhotoCard;
