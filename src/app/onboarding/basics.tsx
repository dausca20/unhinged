/**
 * Basics + profile setup (spec §8.2–§8.3; DoR §3.2, §3.3). Collects name,
 * birthday, location, gender, who they want to date, relationship intent, and
 * distance — plus 3–6 photos, 3 answered prompts, an optional bio, and a
 * voice-prompt placeholder. Validates before advancing; supports ?edit=1.
 */
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, radius, spacing } from '@/theme';
import {
  Button,
  Chip,
  PromptCard,
  ProfilePhotoCard,
  ProgressHeader,
  Screen,
  Text,
} from '@/components';
import {
  GENDER_OPTIONS,
  INTERESTED_IN_OPTIONS,
  RELATIONSHIP_INTENT_LABELS,
  type ProfilePhoto,
  type ProfilePrompt,
  type RelationshipIntent,
} from '@/types';
import { trackEvent } from '@/services/analytics/analyticsService';
import { useOnboardingStore } from '@/stores';

const PHOTO_POOL: ProfilePhoto[] = [
  'Golden hour',
  'The bit',
  'Candid',
  'Out & about',
  'Main',
  'For the plot',
  'Deep lore',
  'Soft launch',
].map((label, i) => ({ id: `pick-${i}`, placeholderTint: i % 6, label }));

const PROMPT_OPTIONS = [
  'My most harmless red flag is…',
  'A normal thing I’ve made weird is…',
  'The fastest way to make me delulu is…',
  'My green flag that sounds like a red flag is…',
  'I will commit to the bit if…',
];

const DISTANCE_OPTIONS = [10, 25, 50, 100];

function parseAge(birthday: string): number {
  const match = birthday.match(/\b(19|20)\d{2}\b/);
  if (match) {
    const year = Number(match[0]);
    const age = 2026 - year;
    if (age >= 18 && age <= 99) return age;
  }
  return 29;
}

export default function Basics() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEdit = edit === '1';
  const store = useOnboardingStore();
  const user = store.user;

  const [firstName, setFirstName] = useState(user.firstName);
  const [birthday, setBirthday] = useState(user.birthday ?? '');
  const [city, setCity] = useState(user.location.city);
  const [region, setRegion] = useState(user.location.region);
  const [gender, setGender] = useState(user.gender);
  const [interestedIn, setInterestedIn] = useState<string[]>(user.interestedIn);
  const [intent, setIntent] = useState<RelationshipIntent | ''>(
    user.relationshipIntent === 'unsure' && !user.firstName ? '' : user.relationshipIntent,
  );
  const [distance, setDistance] = useState(user.preferences.maxDistanceMiles || 50);
  const [photoIds, setPhotoIds] = useState<string[]>(user.photos.map((p) => p.id));
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>(
    Object.fromEntries(user.prompts.map((p) => [p.prompt, p.answer])),
  );
  const [bio, setBio] = useState(user.bio ?? '');
  const [showErrors, setShowErrors] = useState(false);

  const selectedPrompts = Object.keys(promptAnswers);

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const togglePhoto = (id: string) =>
    setPhotoIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 6) return prev; // enforce max 6
      return [...prev, id];
    });

  const togglePrompt = (prompt: string) =>
    setPromptAnswers((prev) => {
      if (prompt in prev) {
        const next = { ...prev };
        delete next[prompt];
        return next;
      }
      if (Object.keys(prev).length >= 3) return prev; // enforce max 3
      return { ...prev, [prompt]: '' };
    });

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'Add your first name.';
    if (!birthday.trim()) e.birthday = 'Add your birthday (include a year).';
    if (!city.trim()) e.city = 'Add your city.';
    if (!gender) e.gender = 'Pick how you identify.';
    if (interestedIn.length === 0) e.interestedIn = 'Pick who you want to date.';
    if (!intent) e.intent = 'Pick what you’re looking for.';
    if (photoIds.length < 3) e.photos = 'Choose at least 3 photos.';
    if (photoIds.length > 6) e.photos = 'Choose no more than 6 photos.';
    if (selectedPrompts.length !== 3) e.prompts = 'Pick exactly 3 prompts.';
    else if (selectedPrompts.some((p) => !promptAnswers[p].trim()))
      e.prompts = 'Answer all 3 prompts.';
    return e;
  }, [firstName, birthday, city, gender, interestedIn, intent, photoIds, selectedPrompts, promptAnswers]);

  const onContinue = () => {
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    const photos: ProfilePhoto[] = photoIds
      .map((id) => PHOTO_POOL.find((p) => p.id === id))
      .filter((p): p is ProfilePhoto => Boolean(p))
      .map((p, i) => ({ ...p, isMain: i === 0 }));
    const prompts: ProfilePrompt[] = selectedPrompts.map((prompt, i) => ({
      id: `prompt-${i}`,
      prompt,
      answer: promptAnswers[prompt].trim(),
    }));

    store.updateBasics({
      firstName: firstName.trim(),
      age: parseAge(birthday),
      birthday: birthday.trim(),
      location: { city: city.trim(), region: region.trim() || 'Nearby' },
      gender,
      interestedIn,
      relationshipIntent: intent as RelationshipIntent,
      bio: bio.trim(),
    });
    store.updatePreferences({ interestedIn, relationshipIntent: intent as RelationshipIntent, maxDistanceMiles: distance });
    store.setPhotos(photos);
    store.setPrompts(prompts);
    store.markStep(1);
    trackEvent('profile_basics_completed', { firstName: firstName.trim(), photoCount: photos.length });

    if (isEdit) router.back();
    else router.push('/onboarding/preferences');
  };

  return (
    <Screen scroll>
      <ProgressHeader current={1} total={5} label="The basics" onBack={() => router.back()} />

      <View style={styles.section}>
        <Field label="First name" error={showErrors ? errors.firstName : undefined}>
          <TextInput value={firstName} onChangeText={setFirstName} placeholder="Your name" placeholderTextColor={colors.textMuted} style={styles.input} />
        </Field>
        <Field label="Birthday" error={showErrors ? errors.birthday : undefined}>
          <TextInput value={birthday} onChangeText={setBirthday} placeholder="e.g. 1996-11-04" placeholderTextColor={colors.textMuted} style={styles.input} />
        </Field>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Field label="City" error={showErrors ? errors.city : undefined}>
              <TextInput value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={colors.textMuted} style={styles.input} />
            </Field>
          </View>
          <View style={styles.rowItem}>
            <Field label="Region">
              <TextInput value={region} onChangeText={setRegion} placeholder="State/Region" placeholderTextColor={colors.textMuted} style={styles.input} />
            </Field>
          </View>
        </View>
      </View>

      <ChipGroup
        label="How you identify"
        error={showErrors ? errors.gender : undefined}
        options={GENDER_OPTIONS.map((g) => ({ value: g, label: g }))}
        selected={[gender]}
        onToggle={(v) => setGender(v)}
      />
      <ChipGroup
        label="Who you want to date"
        error={showErrors ? errors.interestedIn : undefined}
        multi
        options={INTERESTED_IN_OPTIONS.map((g) => ({ value: g, label: g }))}
        selected={interestedIn}
        onToggle={(v) => setInterestedIn((prev) => toggle(prev, v))}
      />
      <ChipGroup
        label="What you’re looking for"
        error={showErrors ? errors.intent : undefined}
        options={Object.entries(RELATIONSHIP_INTENT_LABELS).map(([value, label]) => ({ value, label }))}
        selected={[intent]}
        onToggle={(v) => setIntent(v as RelationshipIntent)}
      />
      <ChipGroup
        label="Max distance"
        options={DISTANCE_OPTIONS.map((d) => ({ value: String(d), label: `${d} mi` }))}
        selected={[String(distance)]}
        onToggle={(v) => setDistance(Number(v))}
      />

      <SectionTitle title="Your photos" subtitle="Choose 3–6. These are placeholders for the prototype." error={showErrors ? errors.photos : undefined} />
      <View style={styles.photoGrid}>
        {PHOTO_POOL.map((photo) => (
          <View key={photo.id} style={styles.photoCell}>
            <ProfilePhotoCard
              photo={photo}
              height={110}
              selected={photoIds.includes(photo.id)}
              onPress={() => togglePhoto(photo.id)}
            />
          </View>
        ))}
      </View>

      <SectionTitle title="Your prompts" subtitle="Pick exactly 3 and answer them." error={showErrors ? errors.prompts : undefined} />
      <View style={styles.section}>
        {PROMPT_OPTIONS.map((prompt) => {
          const selected = prompt in promptAnswers;
          return (
            <View key={prompt} style={styles.promptWrap}>
              <Chip label={prompt} tone="delulu" selected={selected} onPress={() => togglePrompt(prompt)} />
              {selected ? (
                <PromptCard
                  prompt={prompt}
                  answer={promptAnswers[prompt]}
                  editable
                  onChangeAnswer={(t) => setPromptAnswers((prev) => ({ ...prev, [prompt]: t }))}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <SectionTitle title="Short bio (optional)" />
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="One or two lines. Be honest, be a little unwell."
        placeholderTextColor={colors.textMuted}
        style={[styles.input, styles.bio]}
        multiline
      />
      <View style={styles.voice}>
        <Text variant="caption" color={colors.textMuted}>
          🎙️ Voice prompt — coming soon
        </Text>
      </View>

      <View style={styles.footer}>
        <Button label={isEdit ? 'Save changes' : 'Continue'} onPress={onContinue} gradient />
      </View>
    </Screen>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text variant="micro" color={colors.textMuted}>
        {label}
      </Text>
      {children}
      {error ? (
        <Text variant="caption" color={colors.dangerCrush}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function SectionTitle({ title, subtitle, error }: { title: string; subtitle?: string; error?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text variant="h3" color={colors.textInverse}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="caption" color={colors.textMuted}>
          {subtitle}
        </Text>
      ) : null}
      {error ? (
        <Text variant="caption" color={colors.dangerCrush}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
  multi = false,
  error,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
  error?: string;
}) {
  return (
    <View style={styles.chipGroup}>
      <Text variant="micro" color={colors.textMuted}>
        {label}
        {multi ? ' · pick any' : ''}
      </Text>
      <View style={styles.chips}>
        {options.map((o) => (
          <Chip
            key={o.value}
            label={o.label}
            tone="delulu"
            selected={selected.includes(o.value)}
            onPress={() => onToggle(o.value)}
          />
        ))}
      </View>
      {error ? (
        <Text variant="caption" color={colors.dangerCrush}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing[12], marginBottom: spacing[16] },
  field: { gap: spacing[4] },
  row: { flexDirection: 'row', gap: spacing[12] },
  rowItem: { flex: 1 },
  input: {
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    color: colors.textInverse,
    fontSize: 16,
    minHeight: 48,
  },
  bio: { minHeight: 72, textAlignVertical: 'top' },
  chipGroup: { gap: spacing[8], marginBottom: spacing[16] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] },
  sectionTitle: { gap: spacing[2], marginBottom: spacing[12] },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8], marginBottom: spacing[16] },
  photoCell: { width: '31%' },
  promptWrap: { gap: spacing[8] },
  voice: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing[16],
    alignItems: 'center',
    marginTop: spacing[8],
    marginBottom: spacing[16],
  },
  footer: { marginTop: spacing[8] },
});
