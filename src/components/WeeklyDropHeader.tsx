/**
 * Weekly Drop header (spec §8.7, DoR §7.1). Exact approved copy: "This week's
 * drop" + "10 matches for your delulu. 1 wildcard for the plot."
 */
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { Text } from './Text';
import { PressableScale } from './PressableScale';

export type WeeklyDropHeaderProps = {
  weekLabel?: string;
  onFeedback?: () => void;
};

export function WeeklyDropHeader({ weekLabel, onFeedback }: WeeklyDropHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text variant="h1" color={colors.textInverse}>
          This week’s drop
        </Text>
        {onFeedback ? (
          <PressableScale
            onPress={onFeedback}
            accessibilityRole="button"
            accessibilityLabel="Give feedback on this drop"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.feedback}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.textMuted} />
          </PressableScale>
        ) : null}
      </View>
      <Text variant="body" color={colors.textMuted}>
        10 matches for your delulu. 1 wildcard for the plot.
      </Text>
      {weekLabel ? (
        <Text variant="micro" color={colors.textMuted}>
          {weekLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing[4], paddingTop: spacing[8], paddingBottom: spacing[16] },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  feedback: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});

export default WeeklyDropHeader;
