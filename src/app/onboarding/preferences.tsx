/**
 * Preferences (spec §8.4, DoR §3.4). Collects dating intent, monogamy stance, age
 * range, distance, dealbreakers, and MATCH STYLE. Match style is stored on the
 * user and biases Delulu Flexibility (applied at finalize; see review.tsx and
 * applyMatchStyleToScores) — traceable per DoR §3.4.2. Supports ?edit=1.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { Button, Chip, Screen, Text, ProgressHeader, PressableScale } from '@/components';
import {
  MATCH_STYLE_LABELS,
  MONOGAMY_LABELS,
  RELATIONSHIP_INTENT_LABELS,
  type MatchStyle,
  type MonogamyStyle,
  type RelationshipIntent,
} from '@/types';
import { trackEvent } from '@/services/analytics/analyticsService';
import { useOnboardingStore } from '@/stores';

const DEALBREAKERS = [
  'Rude to servers',
  'No opinions on snacks',
  'Won’t commit to a bit',
  'Different life intent',
  'Chronic dry texter',
];

export default function Preferences() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEdit = edit === '1';
  const store = useOnboardingStore();
  const prefs = store.user.preferences;

  const [intent, setIntent] = useState<RelationshipIntent>(store.user.relationshipIntent);
  const [monogamy, setMonogamy] = useState<MonogamyStyle>(prefs.monogamyStyle);
  const [minAge, setMinAge] = useState(prefs.ageRange.min || 25);
  const [maxAge, setMaxAge] = useState(prefs.ageRange.max || 40);
  const [distance, setDistance] = useState(prefs.maxDistanceMiles || 50);
  const [dealbreakers, setDealbreakers] = useState<string[]>(prefs.dealbreakers);
  const [matchStyle, setMatchStyle] = useState<MatchStyle | ''>(
    store.furthestStepIndex >= 2 ? prefs.matchStyle : '',
  );
  const [error, setError] = useState<string | undefined>();

  const toggleDealbreaker = (value: string) =>
    setDealbreakers((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const onContinue = () => {
    if (!matchStyle) {
      setError('Pick a match style — it shapes your whole drop.');
      return;
    }
    store.updateBasics({ relationshipIntent: intent });
    store.updatePreferences({
      relationshipIntent: intent,
      monogamyStyle: monogamy,
      ageRange: { min: minAge, max: Math.max(minAge, maxAge) },
      maxDistanceMiles: distance,
      dealbreakers,
      matchStyle,
      intentIsDealbreaker: dealbreakers.includes('Different life intent'),
    });
    store.markStep(2);
    trackEvent('preference_selected', { matchStyle, monogamy, dealbreakers });
    if (isEdit) router.back();
    else router.push('/onboarding/interview');
  };

  return (
    <Screen scroll>
      <ProgressHeader current={2} total={5} label="Preferences" onBack={() => router.back()} />

      <Group label="Dating intent">
        <ChipRow
          options={Object.entries(RELATIONSHIP_INTENT_LABELS).map(([value, label]) => ({ value, label }))}
          selected={[intent]}
          onSelect={(v) => setIntent(v as RelationshipIntent)}
        />
      </Group>

      <Group label="Monogamy">
        <ChipRow
          options={Object.entries(MONOGAMY_LABELS).map(([value, label]) => ({ value, label }))}
          selected={[monogamy]}
          onSelect={(v) => setMonogamy(v as MonogamyStyle)}
        />
      </Group>

      <Group label="Age range">
        <View style={styles.stepperRow}>
          <Stepper label="Min" value={minAge} onChange={(v) => setMinAge(Math.min(v, maxAge))} min={18} max={80} />
          <Stepper label="Max" value={maxAge} onChange={(v) => setMaxAge(Math.max(v, minAge))} min={18} max={80} />
        </View>
      </Group>

      <Group label="Max distance">
        <ChipRow
          options={[10, 25, 50, 100].map((d) => ({ value: String(d), label: `${d} mi` }))}
          selected={[String(distance)]}
          onSelect={(v) => setDistance(Number(v))}
        />
      </Group>

      <Group label="Dealbreakers (pick any)">
        <ChipRow
          multi
          options={DEALBREAKERS.map((d) => ({ value: d, label: d }))}
          selected={dealbreakers}
          onSelect={toggleDealbreaker}
          tone="danger"
        />
      </Group>

      <Group label="Match style" hint="This becomes part of your match flexibility." error={error}>
        <ChipRow
          options={Object.entries(MATCH_STYLE_LABELS).map(([value, label]) => ({ value, label }))}
          selected={[matchStyle]}
          onSelect={(v) => {
            setMatchStyle(v as MatchStyle);
            setError(undefined);
          }}
        />
      </Group>

      <View style={styles.footer}>
        <Button label={isEdit ? 'Save changes' : 'Continue'} onPress={onContinue} gradient />
      </View>
    </Screen>
  );
}

function Group({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text variant="h3" color={colors.textInverse}>
        {label}
      </Text>
      {hint ? (
        <Text variant="caption" color={colors.textMuted}>
          {hint}
        </Text>
      ) : null}
      {children}
      {error ? (
        <Text variant="caption" color={colors.dangerCrush}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function ChipRow({
  options,
  selected,
  onSelect,
  multi = false,
  tone = 'delulu',
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onSelect: (value: string) => void;
  multi?: boolean;
  tone?: 'delulu' | 'danger';
}) {
  return (
    <View style={styles.chips}>
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          tone={tone}
          selected={selected.includes(o.value)}
          onPress={() => onSelect(o.value)}
        />
      ))}
    </View>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <View style={styles.stepper}>
      <Text variant="micro" color={colors.textMuted}>
        {label}
      </Text>
      <View style={styles.stepperControls}>
        <PressableScale
          onPress={() => onChange(Math.max(min, value - 1))}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label} age`}
          style={styles.stepBtn}
        >
          <Ionicons name="remove" size={20} color={colors.textInverse} />
        </PressableScale>
        <Text variant="h3" color={colors.textInverse}>
          {value}
        </Text>
        <PressableScale
          onPress={() => onChange(Math.min(max, value + 1))}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label} age`}
          style={styles.stepBtn}
        >
          <Ionicons name="add" size={20} color={colors.textInverse} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing[8], marginBottom: spacing[20] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] },
  stepperRow: { flexDirection: 'row', gap: spacing[16] },
  stepper: { flex: 1, gap: spacing[4] },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
  },
  stepBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  footer: { marginTop: spacing[8], marginBottom: spacing[24] },
});
