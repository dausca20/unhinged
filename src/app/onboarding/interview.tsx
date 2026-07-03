/**
 * Delulu Interview (spec §8.5, §10; DoR §4). A chat-with-Unhinged flow over the
 * 14-question default set, rendering all five answer types. Answering updates
 * dimension scores in state (recomputed from the full answer set, so going back
 * and changing an answer cleanly reverts — no double counting). On completion it
 * generates the Delulu Profile and advances to the result screen.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  TextInput,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { router } from 'expo-router';
import { colors, radius, spacing } from '@/theme';
import {
  Button,
  Card,
  Chip,
  ProgressHeader,
  Screen,
  Text,
} from '@/components';
import { getDefaultInterviewFlow } from '@/mocks/mockInterviewQuestions';
import { computeAnswerDeltas, summarizeDeltas } from '@/services/delulu/deluluScoringService';
import type { AnswerInput } from '@/services/delulu/deluluScoringService';
import { trackEvent } from '@/services/analytics/analyticsService';
import { useDeluluStore, useOnboardingStore } from '@/stores';
import type { InterviewQuestion, SliderConfig } from '@/types';

export default function Interview() {
  const flow = useMemo(() => getDefaultInterviewFlow(), []);
  const total = flow.length;
  const [index, setIndex] = useState(0);
  const question = flow[index];

  const answers = useOnboardingStore((s) => s.interviewAnswers);
  const answerInterview = useOnboardingStore((s) => s.answerInterview);
  const userId = useOnboardingStore((s) => s.user.id);
  const markStep = useOnboardingStore((s) => s.markStep);
  const generate = useDeluluStore((s) => s.generate);

  const existing = answers[question.id];

  useEffect(() => {
    trackEvent('interview_question_viewed', { questionId: question.id, index: index + 1, total });
  }, [question.id, index, total]);

  const record = (input: AnswerInput) => {
    const answer = answerInterview(question, input);
    trackEvent('interview_question_answered', {
      questionId: question.id,
      deltas: summarizeDeltas(answer.appliedDeltas),
    });
  };

  const hasAnswer = Boolean(existing) && (existing.type !== 'short_text' || Boolean(existing.text?.trim()));

  const goNext = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      return;
    }
    // Finalize: generate the Delulu Profile from the ordered answers.
    const ordered = flow.map((q) => useOnboardingStore.getState().interviewAnswers[q.id]).filter(Boolean);
    generate(userId, ordered);
    markStep(3);
    router.replace('/onboarding/profile-card');
  };

  const goBack = () => {
    if (index > 0) setIndex((i) => i - 1);
    else router.back();
  };

  return (
    <Screen scroll>
      <ProgressHeader
        current={index + 1}
        total={total}
        label={`Mapping your delulu ${index + 1}/${total}`}
        onBack={goBack}
      />

      <Card tone="dark" style={styles.bubble}>
        <Text variant="micro" color={colors.delulu}>
          Unhinged
        </Text>
        <Text variant="h3" color={colors.textInverse}>
          {question.prompt}
        </Text>
        {question.helperText ? (
          <Text variant="caption" color={colors.textMuted}>
            {question.helperText}
          </Text>
        ) : null}
      </Card>

      {question.type === 'profile_reaction' && question.profileSample ? (
        <Card tone="cream" style={styles.sample}>
          <Text variant="bodyStrong" color={colors.textPrimary}>
            {question.profileSample.name}, {question.profileSample.age}
          </Text>
          <Text variant="caption" color={colors.textMuted}>
            {question.profileSample.blurb}
          </Text>
          <Text variant="micro" color={colors.delulu}>
            {question.profileSample.promptLabel}
          </Text>
          <Text variant="body" color={colors.textPrimary}>
            {question.profileSample.promptAnswer}
          </Text>
        </Card>
      ) : null}

      <AnswerArea question={question} existing={existing} onRecord={record} />

      {hasAnswer && question.microcopy ? (
        <Text variant="caption" color={colors.dopamine} style={styles.microcopy}>
          {question.microcopy}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Button
          label={index < total - 1 ? 'Next' : 'See my Delulu Profile'}
          onPress={goNext}
          gradient
          disabled={!hasAnswer}
        />
      </View>
    </Screen>
  );
}

function AnswerArea({
  question,
  existing,
  onRecord,
}: {
  question: InterviewQuestion;
  existing: ReturnType<typeof useOnboardingStore.getState>['interviewAnswers'][string] | undefined;
  onRecord: (input: AnswerInput) => void;
}) {
  if (question.type === 'single_select' || question.type === 'profile_reaction') {
    const selected = existing?.optionIds?.[0];
    return (
      <View style={styles.options}>
        {question.options?.map((opt) => (
          <Chip
            key={opt.id}
            label={opt.label}
            tone="delulu"
            selected={selected === opt.id}
            onPress={() => onRecord({ optionIds: [opt.id] })}
          />
        ))}
      </View>
    );
  }

  if (question.type === 'multi_select') {
    const selectedIds = existing?.optionIds ?? [];
    const toggle = (id: string) => {
      const next = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
      onRecord({ optionIds: next });
    };
    return (
      <View style={styles.options}>
        {question.options?.map((opt) => (
          <Chip
            key={opt.id}
            label={opt.label}
            tone="delulu"
            selected={selectedIds.includes(opt.id)}
            onPress={() => toggle(opt.id)}
          />
        ))}
      </View>
    );
  }

  if (question.type === 'slider' && question.slider) {
    return (
      <InterviewSlider
        config={question.slider}
        value={existing?.sliderValue ?? question.slider.defaultValue}
        onChange={(v) => onRecord({ sliderValue: v })}
      />
    );
  }

  if (question.type === 'short_text') {
    return (
      <TextInput
        value={existing?.text ?? ''}
        onChangeText={(t) => onRecord({ text: t })}
        placeholder="Type your answer…"
        placeholderTextColor={colors.textMuted}
        style={styles.textInput}
        multiline
      />
    );
  }

  return null;
}

function InterviewSlider({
  config,
  value,
  onChange,
}: {
  config: SliderConfig;
  value: number;
  onChange: (v: number) => void;
}) {
  const [local, setLocal] = useState(value);
  const widthRef = useRef(1);

  const valueFromX = (x: number): number => {
    const fraction = Math.max(0, Math.min(1, x / widthRef.current));
    return Math.round(config.min + fraction * (config.max - config.min));
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => setLocal(valueFromX(e.nativeEvent.locationX)),
      onPanResponderMove: (e) => setLocal(valueFromX(e.nativeEvent.locationX)),
      onPanResponderRelease: (e) => {
        const v = valueFromX(e.nativeEvent.locationX);
        setLocal(v);
        onChange(v);
      },
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width || 1;
  };

  const fraction = (local - config.min) / (config.max - config.min);

  return (
    <View style={styles.sliderWrap}>
      <View style={styles.sliderTrack} onLayout={onLayout} {...responder.panHandlers}>
        <View style={[styles.sliderFill, { width: `${fraction * 100}%` }]} />
        <View style={[styles.sliderThumb, { left: `${fraction * 100}%` }]} />
      </View>
      <View style={styles.sliderLabels}>
        <Text variant="caption" color={colors.textMuted} style={styles.sliderLabelLeft}>
          {config.minLabel}
        </Text>
        <Text variant="caption" color={colors.textMuted} style={styles.sliderLabelRight}>
          {config.maxLabel}
        </Text>
      </View>
      <View style={styles.sliderValue}>
        <Chip label={String(local)} tone="delulu" selected />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { gap: spacing[8], marginBottom: spacing[16] },
  sample: { gap: spacing[4], marginBottom: spacing[16] },
  options: { gap: spacing[8] },
  microcopy: { marginTop: spacing[12], fontStyle: 'italic' },
  footer: { marginTop: spacing[24], marginBottom: spacing[24] },
  textInput: {
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    padding: spacing[16],
    color: colors.textInverse,
    fontSize: 16,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  sliderWrap: { gap: spacing[12], paddingVertical: spacing[8] },
  sliderTrack: {
    height: 40,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: 4,
  },
  sliderFill: {
    position: 'absolute',
    left: 4,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.delulu,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.textInverse,
    borderWidth: 2,
    borderColor: colors.delulu,
    marginLeft: -12,
  },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabelLeft: { flex: 1 },
  sliderLabelRight: { flex: 1, textAlign: 'right' },
  sliderValue: { alignItems: 'center' },
});
