/**
 * Chat stub (spec §8.12; DoR §13). Message list + composer with local (mock)
 * sends. A collapsible Shared Delulu Context Card shows why-you-matched and a
 * suggested opener that inserts into the composer. Chat is reachable only for a
 * mutual match (DoR §2.6). No real backend messaging.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, radius, spacing } from '@/theme';
import { Button, Card, ChatBubble, Chip, PressableScale, Screen, Text } from '@/components';
import { DIMENSION_LABELS } from '@/types';
import { getMockCandidateById } from '@/mocks/mockCandidates';
import { scoreCompatibility } from '@/services/matching/compatibilityService';
import { assignMatchLabel, buildExplanation } from '@/services/matching/matchExplanationService';
import { trackEvent } from '@/services/analytics/analyticsService';
import { tapHaptic } from '@/utils/haptics';
import { useChatStore, useOnboardingStore, useWeeklyDropStore } from '@/stores';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useOnboardingStore((s) => s.user);
  const mutualMatchIds = useWeeklyDropStore((s) => s.mutualMatchIds);
  const drop = useWeeklyDropStore((s) => s.drop);
  const threads = useChatStore((s) => s.threads);
  const ensureThread = useChatStore((s) => s.ensureThread);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const candidate = id ? getMockCandidateById(id) : undefined;
  const isMutual = Boolean(id && mutualMatchIds.includes(id));

  const [draft, setDraft] = useState('');
  const [contextOpen, setContextOpen] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const context = useMemo(() => {
    if (!candidate) return null;
    const dropCandidate =
      drop?.wildcard.profile.id === id ? drop?.wildcard : drop?.curated.find((c) => c.profile.id === id);
    if (dropCandidate) {
      return {
        shared: dropCandidate.topSharedDimensions,
        opener: dropCandidate.explanation.suggestedOpener,
        why: dropCandidate.explanation.whyYouMightMatch,
      };
    }
    const scoring = scoreCompatibility(user, candidate);
    const label = assignMatchLabel(user, candidate, scoring);
    const explanation = buildExplanation(
      user,
      candidate,
      scoring,
      { score: 60, reasonCodes: ['balanced_marketplace'], widenApplied: false, allowLowerDeluluCompatibility: false },
      label,
    );
    return { shared: scoring.topShared, opener: explanation.suggestedOpener, why: explanation.whyYouMightMatch };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!candidate || !isMutual) return;
    ensureThread(candidate.id);
    trackEvent('chat_opened', { matchId: candidate.id });
    trackEvent('suggested_opener_viewed', { matchId: candidate.id, surface: 'chat' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!candidate || !isMutual) {
    return (
      <Screen>
        <BackBar name={candidate?.firstName} onBack={() => router.back()} />
        <View style={styles.center}>
          <Ionicons name="lock-closed" size={28} color={colors.textMuted} />
          <Text variant="h3" color={colors.textInverse} align="center">
            Match first
          </Text>
          <Text variant="body" color={colors.textMuted} align="center">
            Chat opens once the delusion is mutual.
          </Text>
        </View>
      </Screen>
    );
  }

  const thread = threads[candidate.id] ?? [];

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(candidate.id, text);
    trackEvent('message_sent_mock', { matchId: candidate.id });
    setDraft('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const useOpener = () => {
    if (!context) return;
    tapHaptic();
    setDraft(context.opener);
    trackEvent('suggested_opener_used', { matchId: candidate.id, surface: 'chat' });
  };

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <View style={styles.padded}>
        <BackBar name={candidate.firstName} onBack={() => router.back()} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={spacing[12]}
      >
        <ScrollView ref={scrollRef} style={styles.flex} contentContainerStyle={styles.messages}>
          {context ? (
            <Card tone="soft" style={styles.context}>
              <PressableScale
                onPress={() => setContextOpen((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={contextOpen ? 'Collapse match context' : 'Expand match context'}
                style={styles.contextHead}
              >
                <Text variant="micro" color={colors.unhingedPurple}>
                  Why you matched
                </Text>
                <Ionicons name={contextOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textPrimary} />
              </PressableScale>
              {contextOpen ? (
                <>
                  <View style={styles.sharedChips}>
                    {context.shared.map((dim) => (
                      <Chip key={dim} label={DIMENSION_LABELS[dim]} tone="purple" size="sm" />
                    ))}
                  </View>
                  <Text variant="body" color={colors.textPrimary}>
                    {context.why}
                  </Text>
                  <View style={styles.openerRow}>
                    <Text variant="caption" color={colors.textMuted} style={styles.openerText}>
                      Opener: “{context.opener}”
                    </Text>
                    <Chip label="Use opener" tone="delulu" selected onPress={useOpener} size="sm" />
                  </View>
                </>
              ) : null}
            </Card>
          ) : null}

          {thread.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
          />
          <PressableScale onPress={send} accessibilityRole="button" accessibilityLabel="Send message" style={styles.send}>
            <Ionicons name="arrow-up" size={22} color={colors.textInverse} />
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function BackBar({ name, onBack }: { name?: string; onBack: () => void }) {
  return (
    <View style={styles.backBar}>
      <Chip label="Back" tone="delulu" onPress={onBack} size="sm" />
      {name ? (
        <Text variant="h3" color={colors.textInverse}>
          {name}
        </Text>
      ) : null}
      <View style={styles.backSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: spacing[20] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[12], paddingHorizontal: spacing[24] },
  backBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[8] },
  backSpacer: { width: 52 },
  messages: { paddingHorizontal: spacing[20], paddingBottom: spacing[16], gap: spacing[2] },
  context: { gap: spacing[8], marginBottom: spacing[16] },
  contextHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sharedChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] },
  openerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[8], flexWrap: 'wrap' },
  openerText: { flex: 1, fontStyle: 'italic' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[8],
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[12],
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    backgroundColor: colors.charcoal,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    color: colors.textInverse,
    fontSize: 16,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.delulu,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
