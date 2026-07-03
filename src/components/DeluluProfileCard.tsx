/**
 * Delulu Profile reveal card (spec §8.6, DoR §6). Shows Delulu Type, signature,
 * top traits, best matched with, green flag, danger zone, and the suggested
 * profile line. NO public numeric dimension scores anywhere (DoR §6.2).
 *
 * `respectVisibility` renders the public view, honoring the user's visibility
 * controls; the owner's result screen passes false to see everything.
 */
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import { Chip } from './Chip';
import { Button } from './Button';
import type { DeluluProfile } from '@/types';

export type DeluluProfileCardProps = {
  profile: DeluluProfile;
  respectVisibility?: boolean;
  showActions?: boolean;
  onLooksRight?: () => void;
  onRoastAgain?: () => void;
  onEditPublic?: () => void;
};

function Section({
  icon,
  label,
  value,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={16} color={tone} />
        <Text variant="micro" color={tone}>
          {label}
        </Text>
      </View>
      <Text variant="body" color={colors.textPrimary}>
        {value}
      </Text>
    </View>
  );
}

export function DeluluProfileCard({
  profile,
  respectVisibility = false,
  showActions = false,
  onLooksRight,
  onRoastAgain,
  onEditPublic,
}: DeluluProfileCardProps) {
  const v = profile.visibility;
  const showType = !respectVisibility || v.showType;
  const showTraits = !respectVisibility || v.showTopTraits;
  const showDanger = !respectVisibility || !v.hideDangerZone;
  const showDetails = !respectVisibility || !v.hideMatchExplanationDetails;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[colors.delulu, colors.unhingedPurple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text variant="micro" color={colors.textInverse}>
          Your Delulu Type
        </Text>
        <Text variant="h1" color={colors.textInverse}>
          {showType ? profile.type : 'Delulu Type hidden'}
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        <Text variant="body" color={colors.textPrimary}>
          {profile.signature}
        </Text>

        {showTraits ? (
          <View style={styles.traits}>
            {profile.topTraits.map((trait) => (
              <Chip key={trait.dimension} label={trait.label} tone="delulu" />
            ))}
          </View>
        ) : null}

        <Section icon="heart" label="Best matched with" value={profile.bestMatchedWith} tone={colors.unhingedPurple} />
        <Section icon="leaf" label="Green flag" value={profile.greenFlag} tone={colors.greenFlag} />
        {showDanger ? (
          <Section icon="warning" label="Danger zone" value={profile.dangerZone} tone={colors.dangerCrush} />
        ) : null}
        {showDetails ? (
          <Section
            icon="sparkles"
            label="Suggested profile line"
            value={profile.suggestedProfileLine}
            tone={colors.dopamine}
          />
        ) : null}

        {showActions ? (
          <View style={styles.actions}>
            {onLooksRight ? <Button label="Looks right" onPress={onLooksRight} gradient /> : null}
            {onRoastAgain ? <Button label="Roast me again" onPress={onRoastAgain} variant="secondary" /> : null}
            {onEditPublic ? <Button label="Edit what’s public" onPress={onEditPublic} variant="ghost" /> : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.cardCream,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: { paddingHorizontal: spacing[20], paddingVertical: spacing[24], gap: spacing[4] },
  body: { padding: spacing[20], gap: spacing[16] },
  traits: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] },
  section: { gap: spacing[4] },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  actions: { gap: spacing[8], marginTop: spacing[4] },
});

export default DeluluProfileCard;
