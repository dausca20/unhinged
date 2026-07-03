/**
 * Match label pill. Renders the approved qualitative match label — NEVER a raw
 * numeric score (DoR §6.2, §8.3, §18.4). Tone is derived from the label.
 */
import { Chip, type ChipTone } from './Chip';
import type { MatchLabel } from '@/types';

export type MatchScorePillProps = {
  label: MatchLabel;
  onPress?: () => void;
};

function toneForLabel(label: MatchLabel): ChipTone {
  switch (label) {
    case 'Exact Freak Match':
    case 'Soft Launch Material':
      return 'delulu';
    case 'The Wildcard':
    case 'Good For The Plot':
      return 'gold';
    case 'Dangerous But Probably Fine':
    case 'Text Chemistry Risk':
      return 'danger';
    case 'Lore-Compatible':
    case 'Complementary Delulu':
    case 'Slow Burn Wildcard':
    default:
      return 'purple';
  }
}

export function MatchScorePill({ label, onPress }: MatchScorePillProps) {
  return <Chip label={label} tone={toneForLabel(label)} selected onPress={onPress} />;
}

export default MatchScorePill;
