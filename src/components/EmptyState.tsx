/**
 * Empty-state block. Copy is passed in by the caller and must use the approved
 * lines from DESIGN_SYSTEM §15–§16 (DoR §18.3.3).
 */
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';

export type EmptyStateProps = {
  title: string;
  body: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, body, iconName = 'sparkles-outline', actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={40} color={colors.textMuted} />
      <Text variant="h3" color={colors.textInverse} align="center">
        {title}
      </Text>
      <Text variant="body" color={colors.textMuted} align="center">
        {body}
      </Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} variant="secondary" fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[12],
    paddingHorizontal: spacing[24],
    paddingVertical: spacing[40],
  },
  action: { marginTop: spacing[8] },
});

export default EmptyState;
