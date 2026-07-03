/**
 * Suggested opener card (DESIGN_SYSTEM §9.6, DoR §8.5, §13.4). "Try this: …" with
 * Use / Save for later / Absolutely not. In chat, Use inserts into the composer.
 */
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import { Card } from './Card';
import { PressableScale } from './PressableScale';
import { tapHaptic } from '@/utils/haptics';

export type SuggestedOpenerProps = {
  opener: string;
  onUse: () => void;
  onSave?: () => void;
  onReject?: () => void;
};

export function SuggestedOpener({ opener, onUse, onSave, onReject }: SuggestedOpenerProps) {
  return (
    <Card tone="soft" style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={16} color={colors.unhingedPurple} />
        <Text variant="micro" color={colors.unhingedPurple}>
          Try this
        </Text>
      </View>
      <Text variant="bodyStrong" color={colors.textPrimary}>
        “{opener}”
      </Text>
      <View style={styles.actions}>
        <Action label="Use opener" tone={colors.delulu} onPress={onUse} primary />
        {onSave ? <Action label="Save for later" tone={colors.textPrimary} onPress={onSave} /> : null}
        {onReject ? <Action label="Absolutely not" tone={colors.dangerCrush} onPress={onReject} /> : null}
      </View>
    </Card>
  );
}

function Action({
  label,
  tone,
  onPress,
  primary = false,
}: {
  label: string;
  tone: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <PressableScale
      onPress={() => {
        tapHaptic();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      style={[styles.action, primary ? { backgroundColor: tone } : { borderColor: tone, borderWidth: 1.5 }]}
    >
      <Text variant="caption" color={primary ? colors.textInverse : tone} weight="600">
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[8] },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8], marginTop: spacing[4] },
  action: {
    minHeight: 40,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[16],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SuggestedOpener;
