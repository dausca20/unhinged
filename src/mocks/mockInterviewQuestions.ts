/**
 * Delulu Interview question bank (spec §10, DoR §4). ≥20 questions in the bank;
 * the default onboarding flow presents 14 and covers all five answer types
 * (single_select, multi_select, slider, short_text, profile_reaction). Every
 * option / scorable answer maps to ≥1 DeluluDimension via DimensionScoreDelta.
 */
import type { DimensionScoreDelta, InterviewQuestion } from '@/types';

const d = (dimension: DimensionScoreDelta['dimension'], delta: number): DimensionScoreDelta => ({
  dimension,
  delta,
});

export const MOCK_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // Q1 — The delayed text
  {
    id: 'q_delayed_text',
    type: 'single_select',
    prompt:
      'You had one very good date. They haven’t replied for six hours. Your actual first thought is:',
    microcopy: 'No judgment. The algorithm has seen worse.',
    options: [
      { id: 'busy', label: 'They’re probably busy.', scoring: [d('ghostTolerance', 12), d('deluluIndex', -8)] },
      { id: 'hate', label: 'They hate me.', scoring: [d('ghostTolerance', -12), d('textTemperature', 10)] },
      { id: 'testing', label: 'They’re testing me.', scoring: [d('deluluIndex', 10), d('loreDependency', 8)] },
      {
        id: 'arc',
        label: 'This is now a character-development arc.',
        scoring: [d('deluluIndex', 12), d('mainCharacterEnergy', 12), d('textTemperature', 8)],
      },
      {
        id: 'freewill',
        label: 'I forgot I also have free will.',
        scoring: [d('ghostTolerance', 14), d('repairReflex', 8), d('stabilityNeed', -6)],
      },
    ],
  },
  // Q2 — The first date format
  {
    id: 'q_first_date',
    type: 'single_select',
    prompt: 'Pick the first date that feels most you.',
    options: [
      { id: 'coffee', label: 'Coffee, clean exit, no pressure.', scoring: [d('stabilityNeed', 12), d('chaosAppetite', -10)] },
      {
        id: 'walk',
        label: 'A long walk where we accidentally reveal too much.',
        scoring: [d('romanticRiskAppetite', 10), d('textTemperature', 6)],
      },
      { id: 'divebar', label: 'Dive bar and a fake backstory.', scoring: [d('bitCommitment', 14), d('chaosAppetite', 8)] },
      {
        id: 'errand',
        label: 'Errand date. Grocery store, hardware store, whatever.',
        scoring: [d('freakMatchSpecificity', 10), d('bitCommitment', 6), d('mainCharacterEnergy', 6)],
      },
      {
        id: 'irresponsible',
        label: 'Something mildly irresponsible but legal.',
        scoring: [d('chaosAppetite', 14), d('romanticRiskAppetite', 10), d('stabilityNeed', -8)],
      },
    ],
  },
  // Q3 — The ick
  {
    id: 'q_the_ick',
    type: 'single_select',
    prompt: 'Which is most likely to give you the ick?',
    options: [
      { id: 'rude', label: 'They’re rude to a server.', scoring: [d('ickVelocity', 6), d('repairReflex', 6)] },
      { id: 'haha', label: 'They text “haha” too much.', scoring: [d('ickVelocity', 14), d('textTemperature', 8)] },
      {
        id: 'snacks',
        label: 'They have no strong opinions about snacks.',
        scoring: [d('freakMatchSpecificity', 12), d('ickVelocity', 8)],
      },
      { id: 'serious', label: 'They make everything too serious.', scoring: [d('bitCommitment', 12), d('chaosAppetite', 6)] },
      {
        id: 'nobit',
        label: 'They refuse to commit to the bit.',
        scoring: [d('bitCommitment', 16), d('freakMatchSpecificity', 8)],
      },
    ],
  },
  // Q4 — The soft launch
  {
    id: 'q_soft_launch',
    type: 'single_select',
    prompt: 'Someone you like posts a photo where your elbow is clearly visible. You feel:',
    options: [
      { id: 'alarmed', label: 'Alarmed.', scoring: [d('softLaunchTemperature', -12), d('stabilityNeed', 8)] },
      { id: 'pleased', label: 'Secretly pleased.', scoring: [d('softLaunchTemperature', 10), d('deluluIndex', 6)] },
      {
        id: 'campaign',
        label: 'Like the campaign has begun.',
        scoring: [d('softLaunchTemperature', 16), d('mainCharacterEnergy', 12), d('deluluIndex', 8)],
      },
      { id: 'elbows', label: 'Nothing. Elbows aren’t legal evidence.', scoring: [d('deluluIndex', -10), d('ghostTolerance', 8)] },
      { id: 'private', label: 'I’d prefer a private life, actually.', scoring: [d('softLaunchTemperature', -16), d('mainCharacterEnergy', -8)] },
    ],
  },
  // Q5 — The bit
  {
    id: 'q_the_bit',
    type: 'single_select',
    prompt: 'Someone starts a fake argument about whether soup is a beverage. You:',
    options: [
      { id: 'normal', label: 'Answer normally.', scoring: [d('bitCommitment', -12), d('mainCharacterEnergy', -6)] },
      { id: 'laugh', label: 'Laugh, then move on.', scoring: [d('bitCommitment', -2)] },
      { id: 'case', label: 'Build a legal case.', scoring: [d('bitCommitment', 14), d('mainCharacterEnergy', 8)] },
      {
        id: 'later',
        label: 'Bring it up again two weeks later.',
        scoring: [d('bitCommitment', 16), d('loreDependency', 8)],
      },
      {
        id: 'profile',
        label: 'Change my profile to reflect my position.',
        scoring: [d('bitCommitment', 18), d('mainCharacterEnergy', 12), d('freakMatchSpecificity', 8)],
      },
    ],
  },
  // Q6 — The lore (slider)
  {
    id: 'q_lore_slider',
    type: 'slider',
    prompt: 'How much backstory do you create around someone you barely know?',
    slider: {
      min: 0,
      max: 100,
      step: 1,
      minLabel: 'None, I’m normal',
      maxLabel: 'I noticed their coffee order and built a theory',
      defaultValue: 50,
    },
    scoring: [d('loreDependency', 30), d('deluluIndex', 18)],
    microcopy: 'This is too accurate and you know it.',
  },
  // Q7 — The communication need
  {
    id: 'q_communication',
    type: 'single_select',
    prompt: 'A good romantic text exchange should feel like:',
    options: [
      { id: 'clear', label: 'Clear and practical.', scoring: [d('textTemperature', -14), d('stabilityNeed', 8)] },
      { id: 'warm', label: 'Warm but not constant.', scoring: [d('textTemperature', 2), d('stabilityNeed', 6)] },
      { id: 'flirty', label: 'A little flirty, a little confusing.', scoring: [d('textTemperature', 10), d('deluluIndex', 8)] },
      { id: 'weather', label: 'A full emotional weather event.', scoring: [d('textTemperature', 16), d('deluluIndex', 8)] },
      {
        id: 'writing',
        label: 'A collaborative writing project.',
        scoring: [d('textTemperature', 14), d('bitCommitment', 10), d('loreDependency', 8)],
      },
    ],
  },
  // Q8 — The healthy option
  {
    id: 'q_healthy_option',
    type: 'single_select',
    prompt: 'When someone is consistent and emotionally available, you usually feel:',
    options: [
      { id: 'relieved', label: 'Relieved.', scoring: [d('stabilityNeed', 14), d('repairReflex', 8)] },
      { id: 'suspicious', label: 'Suspicious.', scoring: [d('stabilityNeed', -10), d('romanticRiskAppetite', 8)] },
      {
        id: 'bored',
        label: 'Bored at first, then grateful.',
        scoring: [d('romanticRiskAppetite', 6), d('repairReflex', 8)],
      },
      { id: 'weirder', label: 'Like I should make it weirder.', scoring: [d('chaosAppetite', 12), d('romanticRiskAppetite', 10)] },
      { id: 'into', label: 'Fully into it.', scoring: [d('stabilityNeed', 12), d('repairReflex', 10)] },
    ],
  },
  // Q9 — The group chat moment
  {
    id: 'q_group_chat',
    type: 'single_select',
    prompt: 'What are you most likely to send the group chat?',
    options: [
      {
        id: 'screenshot',
        label: 'A screenshot asking “what does this mean?”',
        scoring: [d('loreDependency', 10), d('textTemperature', 10), d('deluluIndex', 8)],
      },
      { id: 'update', label: 'A normal update.', scoring: [d('mainCharacterEnergy', -6), d('deluluIndex', -6)] },
      {
        id: 'timeline',
        label: 'A full forensic timeline.',
        scoring: [d('loreDependency', 16), d('mainCharacterEnergy', 12), d('deluluIndex', 8)],
      },
      { id: 'normal', label: '“I’m being normal about this.”', scoring: [d('deluluIndex', 12), d('mainCharacterEnergy', 8)] },
      { id: 'nochat', label: 'I don’t involve the group chat.', scoring: [d('mainCharacterEnergy', -10), d('softLaunchTemperature', -8)] },
    ],
  },
  // Q10 — The repair
  {
    id: 'q_repair',
    type: 'single_select',
    prompt: 'A joke lands wrong on a date. What happens next?',
    options: [
      { id: 'pretend', label: 'I pretend it didn’t happen.', scoring: [d('repairReflex', -14), d('stabilityNeed', 6)] },
      { id: 'quiet', label: 'I get quiet.', scoring: [d('repairReflex', -10), d('textTemperature', 6)] },
      { id: 'cover', label: 'I make another joke to cover it.', scoring: [d('bitCommitment', 10), d('repairReflex', 4)] },
      {
        id: 'weird',
        label: '“Wait, that came out weird.”',
        scoring: [d('repairReflex', 14), d('bitCommitment', 6)],
      },
      { id: 'reset', label: 'I ask if we can reset.', scoring: [d('repairReflex', 18), d('stabilityNeed', 6)] },
    ],
  },
  // Q11 — The adventure threshold
  {
    id: 'q_adventure',
    type: 'single_select',
    prompt: 'Someone suggests changing plans last minute. You feel:',
    options: [
      { id: 'stressed', label: 'Stressed.', scoring: [d('chaosAppetite', -14), d('stabilityNeed', 12)] },
      { id: 'openplan', label: 'Open, if there’s a plan.', scoring: [d('chaosAppetite', -2), d('stabilityNeed', 8)] },
      { id: 'excited', label: 'Excited.', scoring: [d('chaosAppetite', 12), d('romanticRiskAppetite', 8)] },
      { id: 'alive', label: 'Alive.', scoring: [d('chaosAppetite', 16), d('romanticRiskAppetite', 12), d('stabilityNeed', -8)] },
      { id: 'disappear', label: 'Like this is how people disappear.', scoring: [d('chaosAppetite', -10), d('ghostTolerance', -8)] },
    ],
  },
  // Q12 — The attraction glitch
  {
    id: 'q_attraction_glitch',
    type: 'single_select',
    prompt: 'What weirdly makes someone more attractive?',
    options: [
      { id: 'competence', label: 'Competence.', scoring: [d('stabilityNeed', 8), d('ickVelocity', -6)] },
      { id: 'kindness', label: 'Kindness under pressure.', scoring: [d('repairReflex', 10), d('stabilityNeed', 6)] },
      {
        id: 'niche',
        label: 'Specific niche knowledge.',
        scoring: [d('freakMatchSpecificity', 16), d('loreDependency', 6)],
      },
      {
        id: 'funnyscary',
        label: 'Being funny in a way that scares me.',
        scoring: [d('bitCommitment', 12), d('chaosAppetite', 8), d('ickVelocity', -6)],
      },
      {
        id: 'vendetta',
        label: 'Having a personal vendetta against something harmless.',
        scoring: [d('freakMatchSpecificity', 14), d('bitCommitment', 10)],
      },
    ],
  },
  // Q13 — The ambiguity test
  {
    id: 'q_ambiguity',
    type: 'single_select',
    prompt: 'Someone says, “We should do this again sometime.” You hear:',
    options: [
      { id: 'literal', label: 'They want to do this again.', scoring: [d('deluluIndex', -10), d('ghostTolerance', 10)] },
      { id: 'polite', label: 'They’re being polite.', scoring: [d('deluluIndex', -6), d('stabilityNeed', 6)] },
      {
        id: 'analysis',
        label: 'I need dates, times, and tone analysis.',
        scoring: [d('textTemperature', 12), d('ghostTolerance', -12), d('deluluIndex', 8)],
      },
      {
        id: 'fantasy',
        label: 'This is enough for a three-act fantasy.',
        scoring: [d('deluluIndex', 16), d('loreDependency', 10), d('mainCharacterEnergy', 8)],
      },
      { id: 'refuse', label: 'I refuse to perceive this until they follow up.', scoring: [d('ghostTolerance', 14), d('stabilityNeed', 6)] },
    ],
  },
  // Q14 — The match style
  {
    id: 'q_match_style',
    type: 'single_select',
    prompt: 'For your next match, what are you secretly hoping for?',
    options: [
      { id: 'peaceful', label: 'Someone peaceful who gets me.', scoring: [d('stabilityNeed', 12), d('deluluFlexibility', 6)] },
      { id: 'weird', label: 'Someone weird in the same way.', scoring: [d('freakMatchSpecificity', 12), d('deluluFlexibility', 4)] },
      {
        id: 'hot',
        label: 'Someone hot enough to disrupt my routine.',
        scoring: [d('romanticRiskAppetite', 12), d('chaosAppetite', 8), d('deluluFlexibility', 8)],
      },
      {
        id: 'concerned',
        label: 'Someone who makes the group chat concerned but supportive.',
        scoring: [d('chaosAppetite', 12), d('mainCharacterEnergy', 8), d('deluluFlexibility', 10)],
      },
      {
        id: 'surprise',
        label: 'Someone I wouldn’t normally pick.',
        scoring: [d('deluluFlexibility', 18), d('romanticRiskAppetite', 8)],
      },
    ],
  },

  // ---- Additional bank questions (bring the bank to ≥20; cover all types) ----

  // Profile reaction #1
  {
    id: 'q_profile_reaction_1',
    type: 'profile_reaction',
    prompt: 'Gut reaction to this profile:',
    profileSample: {
      name: 'Sam',
      age: 29,
      blurb: 'Owns three plants named after failed situationships.',
      promptLabel: 'A normal thing I’ve made weird is…',
      promptAnswer: 'I keep a running lore document about my neighborhood’s pigeons.',
    },
    microcopy: 'Interesting. Very interesting.',
    options: [
      { id: 'obsessed', label: 'Instantly obsessed.', scoring: [d('deluluIndex', 12), d('freakMatchSpecificity', 10)] },
      { id: 'curious', label: 'Cautiously curious.', scoring: [d('deluluFlexibility', 8), d('stabilityNeed', 4)] },
      { id: 'ick', label: 'The ick, immediately.', scoring: [d('ickVelocity', 14)] },
      { id: 'lore', label: 'I need to read the pigeon lore.', scoring: [d('loreDependency', 14), d('bitCommitment', 8)] },
    ],
  },
  // Multi-select — green flags that sound like red flags
  {
    id: 'q_green_flags_multi',
    type: 'multi_select',
    prompt: 'Which of these do you consider green flags? (Pick all that apply)',
    helperText: 'Yes, some of them sound like red flags.',
    options: [
      { id: 'texts_back', label: 'Texts back like a functioning adult.', scoring: [d('stabilityNeed', 8), d('textTemperature', -4)] },
      { id: 'commits_bit', label: 'Commits to a bit for months.', scoring: [d('bitCommitment', 12)] },
      { id: 'names_feelings', label: 'Names the awkwardness out loud.', scoring: [d('repairReflex', 12)] },
      { id: 'spontaneous', label: 'Suggests the airport at 11pm.', scoring: [d('chaosAppetite', 12), d('romanticRiskAppetite', 6)] },
      { id: 'niche_obsession', label: 'Has one deranged niche obsession.', scoring: [d('freakMatchSpecificity', 12)] },
    ],
  },
  // Short text — the delulu shortcut
  {
    id: 'q_delulu_shortcut',
    type: 'short_text',
    prompt: 'Finish the thought: “The fastest way to make me delulu is…”',
    helperText: 'One line. Be honest, be unwell.',
    scoring: [d('deluluIndex', 10), d('romanticRiskAppetite', 6)],
    microcopy: 'Noted, and slightly concerning.',
  },
  // Slider — text temperature
  {
    id: 'q_text_temp_slider',
    type: 'slider',
    prompt: 'How emotionally loaded does your ideal texting get?',
    slider: {
      min: 0,
      max: 100,
      step: 1,
      minLabel: 'Logistics only',
      maxLabel: 'The punctuation has a weather system',
      defaultValue: 50,
    },
    scoring: [d('textTemperature', 30), d('deluluIndex', 10)],
  },
  // Multi-select — chaos menu
  {
    id: 'q_chaos_multi',
    type: 'multi_select',
    prompt: 'Which of these sound like a good time? (Pick all that apply)',
    options: [
      { id: 'roadtrip', label: 'Unplanned road trip.', scoring: [d('chaosAppetite', 10), d('romanticRiskAppetite', 6)] },
      { id: 'samecafe', label: 'Same café, same order, every week.', scoring: [d('stabilityNeed', 12), d('chaosAppetite', -6)] },
      { id: 'fakefeud', label: 'A months-long fake feud with a mascot.', scoring: [d('bitCommitment', 12), d('freakMatchSpecificity', 6)] },
      { id: 'ghosttour', label: 'A haunted aquarium at closing time.', scoring: [d('freakMatchSpecificity', 12), d('loreDependency', 6)] },
    ],
  },
  // Short text — lore shortcut
  {
    id: 'q_lore_shortcut',
    type: 'short_text',
    prompt: 'Describe the smallest thing you’ve ever turned into lore.',
    helperText: 'The stranger, the better.',
    scoring: [d('loreDependency', 12), d('mainCharacterEnergy', 6)],
  },
  // Profile reaction #2
  {
    id: 'q_profile_reaction_2',
    type: 'profile_reaction',
    prompt: 'React to this one:',
    profileSample: {
      name: 'Alex',
      age: 31,
      blurb: 'Emotionally stable. Occasionally feral. Always on time.',
      promptLabel: 'My green flag that sounds like a red flag is…',
      promptAnswer: 'I will absolutely talk about the relationship, out loud, like an adult.',
    },
    options: [
      { id: 'safe', label: 'Finally, a safe one.', scoring: [d('stabilityNeed', 12), d('repairReflex', 8)] },
      { id: 'suspicious', label: 'Suspiciously well-adjusted.', scoring: [d('romanticRiskAppetite', 8), d('stabilityNeed', -6)] },
      { id: 'intrigued', label: '“Occasionally feral” has my attention.', scoring: [d('chaosAppetite', 10), d('deluluFlexibility', 6)] },
      { id: 'boring', label: 'Might be too calm for me.', scoring: [d('chaosAppetite', 8), d('stabilityNeed', -8)] },
    ],
  },
  // Single select — main character scene
  {
    id: 'q_mce_scene',
    type: 'single_select',
    prompt: 'You walk into a party alone. In your head, this moment is:',
    options: [
      { id: 'nothing', label: 'Just walking in. It’s a door.', scoring: [d('mainCharacterEnergy', -12)] },
      { id: 'song', label: 'Scored to a specific song.', scoring: [d('mainCharacterEnergy', 12), d('deluluIndex', 6)] },
      { id: 'montage', label: 'The opening of a montage.', scoring: [d('mainCharacterEnergy', 16), d('loreDependency', 6)] },
      { id: 'exit', label: 'Already planning my exit line.', scoring: [d('ghostTolerance', 8), d('mainCharacterEnergy', 6)] },
    ],
  },
];

/**
 * Default onboarding flow — 14 questions, covering all five answer types:
 * single_select, slider, profile_reaction, multi_select, short_text.
 */
export const DEFAULT_INTERVIEW_FLOW_IDS: string[] = [
  'q_delayed_text', // single_select
  'q_first_date', // single_select
  'q_the_ick', // single_select
  'q_lore_slider', // slider
  'q_profile_reaction_1', // profile_reaction
  'q_the_bit', // single_select
  'q_communication', // single_select
  'q_green_flags_multi', // multi_select
  'q_repair', // single_select
  'q_adventure', // single_select
  'q_delulu_shortcut', // short_text
  'q_ambiguity', // single_select
  'q_healthy_option', // single_select
  'q_match_style', // single_select
];

export function getQuestionById(id: string): InterviewQuestion | undefined {
  return MOCK_INTERVIEW_QUESTIONS.find((q) => q.id === id);
}

export function getDefaultInterviewFlow(): InterviewQuestion[] {
  return DEFAULT_INTERVIEW_FLOW_IDS.map((id) => {
    const question = getQuestionById(id);
    if (!question) throw new Error(`Interview flow references unknown question: ${id}`);
    return question;
  });
}

export const DEFAULT_INTERVIEW_LENGTH = DEFAULT_INTERVIEW_FLOW_IDS.length;
