/**
 * Chat message bubble (spec §8.12). Calm styling — messaging stays low on jokes
 * and never uses chaotic animation (DoR §13.1, §18.1.2).
 */
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import type { ChatMessage } from '@/types';

export type ChatBubbleProps = {
  message: ChatMessage;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const mine = message.sender === 'me';
  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        <Text variant="body" color={colors.textInverse}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', marginVertical: spacing[4] },
  rowMine: { alignItems: 'flex-end' },
  rowTheirs: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    borderRadius: radius.lg,
  },
  mine: { backgroundColor: colors.delulu, borderBottomRightRadius: radius.xs },
  theirs: {
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderBottomLeftRadius: radius.xs,
  },
});

export default ChatBubble;
