/**
 * Onboarding progress + the in-progress user (spec §8, §17; DoR §3, §16.2).
 * Persisted so onboarding survives a restart. Interview answers are stored with
 * their applied deltas so re-answering cleanly reverts (no double-counting).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEmptyUserProfile } from '@/mocks/currentUser';
import { buildAnswer } from '@/services/delulu/deluluScoringService';
import type { AnswerInput } from '@/services/delulu/deluluScoringService';
import { zustandStorage } from './storage';
import type {
  InterviewAnswer,
  InterviewQuestion,
  MatchPreferences,
  ProfilePhoto,
  ProfilePrompt,
  UserProfile,
} from '@/types';

type OnboardingState = {
  user: UserProfile;
  interviewAnswers: Record<string, InterviewAnswer>;
  completedOnboarding: boolean;
  furthestStepIndex: number;
  hasHydrated: boolean;

  setUser: (user: UserProfile) => void;
  updateBasics: (partial: Partial<UserProfile>) => void;
  updatePreferences: (partial: Partial<MatchPreferences>) => void;
  setPhotos: (photos: ProfilePhoto[]) => void;
  setPrompts: (prompts: ProfilePrompt[]) => void;
  setBio: (bio: string) => void;
  answerInterview: (question: InterviewQuestion, input: AnswerInput) => InterviewAnswer;
  clearInterviewAnswer: (questionId: string) => void;
  markStep: (index: number) => void;
  setCompleted: (value: boolean) => void;
  reset: () => void;
  setHydrated: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      user: createEmptyUserProfile(),
      interviewAnswers: {},
      completedOnboarding: false,
      furthestStepIndex: 0,
      hasHydrated: false,

      setUser: (user) => set({ user }),
      updateBasics: (partial) => set((s) => ({ user: { ...s.user, ...partial } })),
      updatePreferences: (partial) =>
        set((s) => ({ user: { ...s.user, preferences: { ...s.user.preferences, ...partial } } })),
      setPhotos: (photos) => set((s) => ({ user: { ...s.user, photos } })),
      setPrompts: (prompts) => set((s) => ({ user: { ...s.user, prompts } })),
      setBio: (bio) => set((s) => ({ user: { ...s.user, bio } })),

      answerInterview: (question, input) => {
        const answer = buildAnswer(question, input);
        set((s) => ({ interviewAnswers: { ...s.interviewAnswers, [question.id]: answer } }));
        return answer;
      },
      clearInterviewAnswer: (questionId) =>
        set((s) => {
          const next = { ...s.interviewAnswers };
          delete next[questionId];
          return { interviewAnswers: next };
        }),

      markStep: (index) =>
        set((s) => ({ furthestStepIndex: Math.max(s.furthestStepIndex, index) })),
      setCompleted: (value) => set({ completedOnboarding: value }),
      reset: () =>
        set({
          user: createEmptyUserProfile(),
          interviewAnswers: {},
          completedOnboarding: false,
          furthestStepIndex: 0,
        }),
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'unhinged.onboarding',
      storage: zustandStorage,
      partialize: (state) => ({
        user: state.user,
        interviewAnswers: state.interviewAnswers,
        completedOnboarding: state.completedOnboarding,
        furthestStepIndex: state.furthestStepIndex,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/** Ordered interview answers for scoring (stable by insertion into the flow). */
export function selectOrderedAnswers(state: OnboardingState, flowIds: string[]): InterviewAnswer[] {
  return flowIds
    .map((id) => state.interviewAnswers[id])
    .filter((a): a is InterviewAnswer => Boolean(a));
}
