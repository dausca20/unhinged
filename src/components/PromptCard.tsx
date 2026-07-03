/**
 * Profile prompt card. Read-only for display, or editable (with a text input)
 * for onboarding. Cream surface, prompt in micro caps, answer in body.
 */
import { StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import { Card } from './Card';
import { PressableScale } from './PressableScale';

export type PromptCardProps = {
  prompt: string;
  answer?: string;
  editable?: boolean;
  onChangeAnswer?: (text: string) => void;
  onPress?: () => void;
  selected?: boolean;
  placeholder?: string;
};

export function PromptCard({
  prompt,
  answer,
  editable = false,
  onChangeAnswer,
  onPress,
  selected = false,
  placeholder = 'Type your answer…',
}: PromptCardProps) {
  const body = (
    <Card tone="cream" style={[styles.card, selected ? styles.selected : null]}>
      <Text variant="micro" color={colors.delulu}>
        {prompt}
      </Text>
      {editable ? (
        <TextInput
          value={answer}
          onChangeText={onChangeAnswer}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />
      ) : (
        <Text variant="body" color={colors.textPrimary} style={styles.answer}>
          {answer && answer.length > 0 ? answer : placeholder}
        </Text>
      )}
    </Card>
  );

  if (!onPress) return body;
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }}>
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[8] },
  selected: { borderColor: colors.delulu, borderWidth: 2 },
  answer: { marginTop: spacing[2] },
  input: {
    marginTop: spacing[4],
    minHeight: 44,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    borderRadius: radius.sm,
    textAlignVertical: 'top',
  },
});

export default PromptCard;
