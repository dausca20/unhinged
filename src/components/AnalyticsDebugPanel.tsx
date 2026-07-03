/**
 * Analytics Debug Panel (spec §13, DoR §15.5). Reachable ONLY when
 * EXPO_PUBLIC_ENABLE_ANALYTICS_DEBUG=true (the caller gates this). Lists captured
 * events with their full payloads, newest first.
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';
import { useAnalyticsStore } from '@/stores/analyticsStore';

export type AnalyticsDebugPanelProps = {
  onClose?: () => void;
};

export function AnalyticsDebugPanel({ onClose }: AnalyticsDebugPanelProps) {
  const events = useAnalyticsStore((s) => s.events);
  const clear = useAnalyticsStore((s) => s.clear);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="h3" color={colors.textInverse}>
          Analytics Debug
        </Text>
        <Text variant="caption" color={colors.textMuted}>
          {events.length} event{events.length === 1 ? '' : 's'} captured locally
        </Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {events.length === 0 ? (
          <Text variant="body" color={colors.textMuted}>
            No events yet. Move through the app and they’ll appear here.
          </Text>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.event}>
              <View style={styles.eventHead}>
                <Text variant="bodyStrong" color={colors.delulu}>
                  {event.name}
                </Text>
                <Text variant="micro" color={colors.textMuted}>
                  {event.timestamp.slice(11, 19)}
                </Text>
              </View>
              <Text variant="caption" color={colors.textMuted} style={styles.payload}>
                {JSON.stringify(event.properties, null, 2)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Clear events" onPress={clear} variant="secondary" fullWidth={false} />
        {onClose ? <Button label="Close" onPress={onClose} variant="ghost" fullWidth={false} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing[12] },
  header: { gap: spacing[2] },
  list: { flex: 1 },
  listContent: { gap: spacing[8], paddingBottom: spacing[16] },
  event: {
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    padding: spacing[12],
    gap: spacing[4],
  },
  eventHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payload: { fontFamily: 'monospace' },
  footer: { flexDirection: 'row', gap: spacing[8], justifyContent: 'flex-start' },
});

export default AnalyticsDebugPanel;
