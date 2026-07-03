/**
 * Messages inbox (spec §8.11; DoR §13.1). Calm, conventional inbox of mutual
 * matches: photo, name, last message, shared Delulu label, unread badge. Taps
 * open the chat thread. Approved empty-state copy.
 */
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { colors, radius, spacing } from '@/theme';
import { Chip, EmptyState, ProfilePhotoCard, PressableScale, Screen, Text } from '@/components';
import { getMockCandidateById } from '@/mocks/mockCandidates';
import { useChatStore, useWeeklyDropStore } from '@/stores';
import type { UserProfile } from '@/types';

export default function Matches() {
  const mutualMatchIds = useWeeklyDropStore((s) => s.mutualMatchIds);
  const threads = useChatStore((s) => s.threads);

  const matches = mutualMatchIds
    .map((id) => getMockCandidateById(id))
    .filter((c): c is UserProfile => Boolean(c));

  if (matches.length === 0) {
    return (
      <Screen>
        <Header />
        <EmptyState
          title="No messages yet"
          body="Match with someone whose delulu feels survivable."
          iconName="chatbubbles-outline"
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header />
      <View style={styles.list}>
        {matches.map((candidate) => {
          const thread = threads[candidate.id] ?? [];
          const last = thread[thread.length - 1];
          const unread = last?.sender === 'them';
          return (
            <PressableScale
              key={candidate.id}
              onPress={() => router.push(`/chat/${candidate.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Open chat with ${candidate.firstName}`}
              style={styles.row}
            >
              <ProfilePhotoCard photo={candidate.photos[0]} height={56} rounded showLabel={false} style={styles.avatar} />
              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <Text variant="bodyStrong" color={colors.textInverse}>
                    {candidate.firstName}
                  </Text>
                  {unread ? <View style={styles.badge} /> : null}
                </View>
                <Text variant="caption" color={unread ? colors.textInverse : colors.textMuted} numberOfLines={1}>
                  {last ? last.text : 'Say something unhinged (kindly).'}
                </Text>
                <Chip label={candidate.deluluProfile?.type ?? 'Delulu'} tone="purple" size="sm" />
              </View>
            </PressableScale>
          );
        })}
      </View>
    </Screen>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Text variant="h1" color={colors.textInverse}>
        Messages
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing[8], paddingBottom: spacing[16] },
  list: { gap: spacing[8] },
  row: {
    flexDirection: 'row',
    gap: spacing[12],
    padding: spacing[12],
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  avatar: { width: 56, borderRadius: radius.pill },
  rowBody: { flex: 1, gap: spacing[4] },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.delulu },
});
