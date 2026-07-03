# Unhinged — Definition of Ready (for UAT)

> The verifiable UX and functionality gates that determine whether the Unhinged
> prototype is **built to a state ready for User Acceptance Testing (UAT).**
>
> Sources of truth: [`Unhinged_App_Build_Spec`](./assets) (product spec) ·
> [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) · [`theme/tokens.ts`](./theme/tokens.ts).

---

## 0. How to use this document

This is a **Definition of Ready (DoR)**, not a design brief. It does **not** tell
the builder _how_ to build the app — the spec and design system do that. It tells
the builder **how to prove the app is finished enough to hand to acceptance
testers.**

**Rules of the gate:**

1. Every item below is a **binary, observable check.** It passes only if a tester
   can watch it happen on a device/simulator running the prototype, or read it
   directly in the code. No "mostly done."
2. An item marked **`[BLOCKER]`** must pass for UAT to begin. A failing blocker
   means _not ready_, full stop.
3. An item marked **`[POLISH]`** should pass, but a documented, ticketed
   exception may be accepted by the product owner without blocking UAT.
4. Each gate lists a **Verify** method: `RUN` (observe in the running app),
   `CODE` (inspect source/types), or `LOG` (observe console/analytics output).
5. The prototype is **local-first and mock-only.** No check in this document
   requires a live Supabase, live RevenueCat, real payments, or a real backend.
   Any check that appears to require them is wrong — flag it.

**Ready-for-UAT is declared only when every `[BLOCKER]` in §1–§18 is checked and
the §19 roll-up is signed off.**

---

## 1. Environment & build readiness

| # | Gate | Verify | |
|---|------|--------|--|
| 1.1 | `[BLOCKER]` App installs and launches on iOS simulator **and** Android emulator (or Expo Go) from a clean checkout via `npx expo start`. | RUN | ☐ |
| 1.2 | `[BLOCKER]` App runs with an **empty `.env`** (no Supabase / RevenueCat values) and does not crash, hang, or show a fatal error. | RUN | ☐ |
| 1.3 | `[BLOCKER]` `.env.example` exists and contains exactly: `EXPO_PUBLIC_APP_ENV`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_MATCH_ALGORITHM_VERSION`, `EXPO_PUBLIC_ENABLE_MOCKS`, `EXPO_PUBLIC_ENABLE_ANALYTICS_DEBUG`, `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`. | CODE | ☐ |
| 1.4 | `[BLOCKER]` `EXPO_PUBLIC_ENABLE_MOCKS=true` forces mock mode: all data comes from `src/mocks/`, no network calls are attempted. | RUN/CODE | ☐ |
| 1.5 | `[BLOCKER]` No server secrets (service-role keys, model API keys, private secrets) appear anywhere in the client bundle or repo. Only `EXPO_PUBLIC_`-prefixed vars are read in app code. | CODE | ☐ |
| 1.6 | `[BLOCKER]` `tsc --noEmit` (or `expo` typecheck) passes with **zero** type errors. | CODE | ☐ |
| 1.7 | `[POLISH]` Project builds with no console errors or red-box warnings on cold start. | RUN | ☐ |
| 1.8 | `[BLOCKER]` `matchAlgorithmVersion` used in analytics is sourced from `EXPO_PUBLIC_MATCH_ALGORITHM_VERSION` (default `delulu-v0.1`), not hard-coded in a component. | CODE | ☐ |

---

## 2. Navigation & routing readiness

Uses Expo Router file-based navigation.

| # | Gate | Verify | |
|---|------|--------|--|
| 2.1 | `[BLOCKER]` Route tree matches the spec: `app/_layout`, `app/index`, `app/onboarding/{welcome,basics,preferences,interview,profile-card,review}`, `app/tabs/{weekly-drop,likes,matches,profile}`, `app/match/[id]`, `app/chat/[id]`, `app/paywall`, `app/settings`. | CODE | ☐ |
| 2.2 | `[BLOCKER]` On first launch (onboarding **not** complete), `index` routes into the onboarding group. | RUN | ☐ |
| 2.3 | `[BLOCKER]` On relaunch after onboarding is complete, `index` routes into the tabs group (skips onboarding). | RUN | ☐ |
| 2.4 | `[BLOCKER]` Bottom tab bar shows exactly four tabs — **Drop · Likes · Messages · Profile** — and each navigates to its screen. | RUN | ☐ |
| 2.5 | `[BLOCKER]` Match detail is reachable via push from Weekly Drop; back returns to the drop with prior scroll/state intact. | RUN | ☐ |
| 2.6 | `[BLOCKER]` Chat opens from a mutual match (matched state may be stubbed); a non-matched candidate cannot open chat. | RUN | ☐ |
| 2.7 | `[BLOCKER]` Paywall and Settings are reachable and dismissible without dead-ends or unrecoverable states. | RUN | ☐ |
| 2.8 | `[BLOCKER]` No route in the tree is a placeholder/blank screen — every route renders its intended content. | RUN | ☐ |

---

## 3. Onboarding flow readiness

### 3.1 Welcome (`onboarding/welcome`)
| # | Gate | Verify | |
|---|------|--------|--|
| 3.1.1 | `[BLOCKER]` Shows H1 "Find someone whose delulu fits yours." and the premise body copy. | RUN | ☐ |
| 3.1.2 | `[BLOCKER]` Primary CTA "Start my Delulu Read" advances to Basics; secondary "I already have an account" is present (may stub to a mock signed-in state). | RUN | ☐ |
| 3.1.3 | `[POLISH]` Reads playful/premium/dating-native; no mental-health framing. | RUN | ☐ |

### 3.2 Basics (`onboarding/basics`)
| # | Gate | Verify | |
|---|------|--------|--|
| 3.2.1 | `[BLOCKER]` Collects first name, birthday, location, gender, who they want to date, relationship intent, distance preference (form state only). | RUN | ☐ |
| 3.2.2 | `[BLOCKER]` Cannot advance until required fields are valid; errors are specific and readable. | RUN | ☐ |
| 3.2.3 | `[BLOCKER]` Entered values persist into the current-user model and survive navigating back/forward within onboarding. | RUN | ☐ |

### 3.3 Profile setup (photos/prompts/bio)
| # | Gate | Verify | |
|---|------|--------|--|
| 3.3.1 | `[BLOCKER]` User can select **3–6** placeholder/mock photos; enforces the min/max. | RUN | ☐ |
| 3.3.2 | `[BLOCKER]` User picks **3** profile prompts from the spec's example bank and enters answers; optional short bio and voice-prompt **placeholder** present. | RUN | ☐ |

### 3.4 Preferences (`onboarding/preferences`)
| # | Gate | Verify | |
|---|------|--------|--|
| 3.4.1 | `[BLOCKER]` Collects dating intent, monogamy/open/unsure, age range, distance, dealbreakers, and **match style** (More freak match · More stabilizing energy · More chaotic spark · More slow burn · Surprise me). | RUN | ☐ |
| 3.4.2 | `[BLOCKER]` Match-style selection is stored on the user and feeds Delulu Flexibility / matching (traceable in code). | CODE | ☐ |

### 3.5 Review (`onboarding/review`)
| # | Gate | Verify | |
|---|------|--------|--|
| 3.5.1 | `[BLOCKER]` Summarizes basics/preferences/profile before completing onboarding; user can jump back to edit any section. | RUN | ☐ |
| 3.5.2 | `[BLOCKER]` Completing review sets onboarding-complete state and routes to the Delulu Profile result, then to tabs. | RUN | ☐ |

---

## 4. Delulu Interview readiness (`onboarding/interview`)

| # | Gate | Verify | |
|---|------|--------|--|
| 4.1 | `[BLOCKER]` A question bank of **≥ 20** questions exists in `src/mocks/mockInterviewQuestions.ts`; the default flow presents **14**. | CODE/RUN | ☐ |
| 4.2 | `[BLOCKER]` All five answer types render and are answerable: `single_select`, `multi_select`, `slider`, `short_text`, `profile_reaction`. | RUN | ☐ |
| 4.3 | `[BLOCKER]` Each question conforms to the `InterviewQuestion` type (`id`, `type`, `prompt`, `options?`, `scoring?`), and every scorable answer maps to ≥1 `DeluluDimension` via `DimensionScoreDelta`. | CODE | ☐ |
| 4.4 | `[BLOCKER]` Progress indicator is shown (e.g. "Mapping your delulu 6/14"); it advances correctly and never exceeds the total. | RUN | ☐ |
| 4.5 | `[BLOCKER]` Answering updates dimension scores live in state (observable in the analytics debug panel or via logged deltas). | LOG | ☐ |
| 4.6 | `[BLOCKER]` User can go back and change an answer; the previous delta is reverted (no double-counting). | RUN/LOG | ☐ |
| 4.7 | `[POLISH]` UI reads as a chat with Unhinged (bubble + answer chips), not a clinical assessment; "this is too accurate" microcopy appears after at least one answer. | RUN | ☐ |
| 4.8 | `[BLOCKER]` Completing the interview triggers Delulu Profile generation and advances to the result screen. | RUN | ☐ |

---

## 5. Delulu dimensions & scoring engine readiness

| # | Gate | Verify | |
|---|------|--------|--|
| 5.1 | `[BLOCKER]` All **14** dimensions exist as a `DeluluDimension` union and `DeluluScores = Record<DeluluDimension, number>`: `deluluIndex, loreDependency, bitCommitment, ickVelocity, textTemperature, chaosAppetite, mainCharacterEnergy, softLaunchTemperature, freakMatchSpecificity, romanticRiskAppetite, ghostTolerance, repairReflex, stabilityNeed, deluluFlexibility`. | CODE | ☐ |
| 5.2 | `[BLOCKER]` Scoring is **deterministic**: same answers → identical scores every run (no `Math.random` in scoring path). | CODE/RUN | ☐ |
| 5.3 | `[BLOCKER]` All dimensions initialize at **50**; final scores are **clamped 0–100**. | CODE | ☐ |
| 5.4 | `[BLOCKER]` Delulu Type is assigned from top dimensions using explicit rule thresholds (per spec §11 examples); the same scores always yield the same type. | CODE | ☐ |
| 5.5 | `[BLOCKER]` The scoring service lives under `src/services/delulu/` (`deluluScoringService.ts`, `deluluTypeService.ts`) and is unit-callable independent of UI. | CODE | ☐ |

---

## 6. Delulu Profile readiness (`onboarding/profile-card`)

| # | Gate | Verify | |
|---|------|--------|--|
| 6.1 | `[BLOCKER]` Generated profile conforms to `DeluluProfile` type and shows: Delulu Type, Signature, Top 3 traits, Best matched with, Danger zone, Green flag, Suggested profile line. | RUN/CODE | ☐ |
| 6.2 | `[BLOCKER]` **No public numerical dimension scores** are displayed anywhere on the profile (scores stay internal). | RUN | ☐ |
| 6.3 | `[BLOCKER]` Reveal sequence plays ("Reading the lore…" → … → reveal) in ≤ ~3s, then shows the type. | RUN | ☐ |
| 6.4 | `[BLOCKER]` Actions present and functional: **Looks right** (accept), **Roast me again** (regenerate/re-run), **Edit what's public**. | RUN | ☐ |
| 6.5 | `[BLOCKER]` Public/private visibility controls exist (Show Delulu Type · Show top traits · Hide danger zone · Hide match-explanation details · Use suggested profile line) and persist their state. | RUN | ☐ |

---

## 7. Weekly Drop readiness (`tabs/weekly-drop`)

| # | Gate | Verify | |
|---|------|--------|--|
| 7.1 | `[BLOCKER]` Header "This week's drop" + subheader "10 matches for your delulu. 1 wildcard for the plot." | RUN | ☐ |
| 7.2 | `[BLOCKER]` The drop is **generated at runtime** from mock candidates by `weeklyDropService.generateWeeklyDrop(...)`, **not** a hardcoded list. | CODE | ☐ |
| 7.3 | `[BLOCKER]` Exactly **10 curated matches + 1 wildcard** are shown; sections for Curated · Wildcard · Already viewed exist. | RUN | ☐ |
| 7.4 | `[BLOCKER]` Each card shows photo, first name, age, location, Delulu Type, match label, short match reason, compatibility chips, and action buttons. | RUN | ☐ |
| 7.5 | `[BLOCKER]` Match labels come from the approved set (Exact Freak Match, Complementary Delulu, Good For The Plot, Slow Burn Wildcard, Dangerous But Probably Fine, Soft Launch Material, Lore-Compatible, Text Chemistry Risk, The Wildcard). | RUN | ☐ |
| 7.6 | `[BLOCKER]` Card actions all work and mutate state: **View** (→ detail), **Like this delulu**, **Not my delulu** (skip), **Save for later**. | RUN | ☐ |
| 7.7 | `[BLOCKER]` Liked/skipped/saved cards move to the correct state (e.g. skipped leaves curated set; already-viewed reflects views); state survives tab switches. | RUN | ☐ |
| 7.8 | `[BLOCKER]` Empty state renders when no drop exists, using the approved copy ("No drop yet — We are still assembling the delulu…"). | RUN | ☐ |
| 7.9 | `[POLISH]` Layout is a curated list/stack — **not** rapid-fire swipe/casino mechanics. First-of-week reveal moment plays once. | RUN | ☐ |

---

## 8. Match Detail readiness (`match/[id]`)

| # | Gate | Verify | |
|---|------|--------|--|
| 8.1 | `[BLOCKER]` Renders photos, prompts, Delulu Type, **Why you might match**, **Where it could get unhinged**, compatibility breakdown, suggested opener, and Like/Skip actions. | RUN | ☐ |
| 8.2 | `[BLOCKER]` The match explanation text comes from the candidate's `MatchExplanation` object (headline, whyYouMightMatch, whereItCouldGetUnhinged, suggestedOpener), not placeholder lorem. | CODE/RUN | ☐ |
| 8.3 | `[BLOCKER]` Compatibility breakdown shows **qualitative** strengths only (Low · Medium · High · Reckless / Solid) — **no raw numeric scores** shown publicly. | RUN | ☐ |
| 8.4 | `[BLOCKER]` Like/Skip from detail update the same state as the drop and route back sensibly. | RUN | ☐ |
| 8.5 | `[BLOCKER]` Suggested opener card offers Use / Save for later / Absolutely not. | RUN | ☐ |

---

## 9. Wildcard readiness (`match/[id]` wildcard variant)

| # | Gate | Verify | |
|---|------|--------|--|
| 9.1 | `[BLOCKER]` Wildcard detail is **visually distinct** from a normal match (wildcard accent/gradient, "for the plot" treatment). | RUN | ☐ |
| 9.2 | `[BLOCKER]` Shows the four wildcard explanation fields: Why this is not a clean match · Why it might still be fun · What we are testing · Suggested opener. | RUN | ☐ |
| 9.3 | `[BLOCKER]` Wildcard is chosen by `wildcardService` using the wildcard score formula; it is **not** the top-scoring curated match and passes safety + basic preference filters. | CODE | ☐ |
| 9.4 | `[BLOCKER]` Wildcard carries a valid `wildcardReason` code (e.g. `shared_absurd_interest`, `high_chaos_overlap`, `opposites_for_the_plot`, `unexpected_lore_match`, `text_chemistry_experiment`, `profile_prompt_too_funny_to_ignore`). | CODE | ☐ |
| 9.5 | `[POLISH]` Copy is playful, never mocking; one-time shimmer/reveal only. | RUN | ☐ |

---

## 10. Matching algorithm readiness

Services under `src/services/matching/`.

| # | Gate | Verify | |
|---|------|--------|--|
| 10.1 | `[BLOCKER]` Eligibility filters remove candidates failing hard filters: incompatible age, incompatible gender preference, outside distance (unless widened), blocked, already matched, recently skipped, `safetyExcluded=true`, hard intent mismatch when a dealbreaker. | CODE | ☐ |
| 10.2 | `[BLOCKER]` `totalMatchScore` uses the weighted model: `0.36·delulu + 0.18·intent + 0.14·attraction + 0.12·conversation + 0.12·marketplace + 0.05·novelty + 0.03·safety`. | CODE | ☐ |
| 10.3 | `[BLOCKER]` Delulu compatibility handles the three dimension classes correctly: **similarity** (close is better), **complementary** (difference can be good within range), **risk-managed** (large mismatch reduces score). | CODE | ☐ |
| 10.4 | `[BLOCKER]` Repair Reflex acts as a strong modifier: low average repair reflex + high chaos/delulu/text applies the penalty (e.g. −18). | CODE | ☐ |
| 10.5 | `[BLOCKER]` `marketplaceBalanceService` is a **separate function** accounting for market volume, match velocity, gender/preference cohorts, candidate exposure, and Delulu Flexibility; it acts as a ranking modifier, not a replacement for compatibility. | CODE | ☐ |
| 10.6 | `[BLOCKER]` Marketplace logic does the four required things: prevents starvation (widen via flexibility when pool < 30 & flexibility > 60), penalizes over-served candidates, adapts to velocity signals, and uses gender **only** as invisible liquidity data (no visible gender scoring, never overrides safety/hard prefs). | CODE | ☐ |
| 10.7 | `[BLOCKER]` Delulu Flexibility measurably changes output: high-flexibility users get wider/wilder candidates; low-flexibility users get tighter, safer matches. | CODE/RUN | ☐ |
| 10.8 | `[BLOCKER]` Output is deterministic from mock data (same user + candidates + context → same 10 + wildcard). | CODE/RUN | ☐ |

---

## 11. Match data & explanation completeness

| # | Gate | Verify | |
|---|------|--------|--|
| 11.1 | `[BLOCKER]` **Every** curated match and the wildcard include ALL of: total match score, score components (all 7), top shared dimensions, top mismatch dimensions, reason codes, explanation copy, suggested opener, analytics metadata. | CODE | ☐ |
| 11.2 | `[BLOCKER]` No match is rendered without an explanation — a match missing `MatchExplanation` fails generation rather than showing a bare card. | CODE/RUN | ☐ |
| 11.3 | `[BLOCKER]` Types exist and are used: `UserProfile`, `DeluluProfile`, `MatchCandidate`, `MatchScore`, `MatchExplanation` in `src/types/`. | CODE | ☐ |

---

## 12. Likes readiness (`tabs/likes`)

| # | Gate | Verify | |
|---|------|--------|--|
| 12.1 | `[BLOCKER]` Free tier shows **blurred** inbound likes + teaser + paywall CTA using approved copy ("They liked your delulu…"). | RUN | ☐ |
| 12.2 | `[BLOCKER]` Simulated paid tier reveals visible inbound likes with profile preview and liked prompt/photo indicator. | RUN | ☐ |
| 12.3 | `[BLOCKER]` Empty state uses approved copy ("No likes yet — The plot is still loading."). | RUN | ☐ |
| 12.4 | `[BLOCKER]` Paywall copy is playful, not predatory — none of the banned lines ("Don't miss your soulmate", "They might disappear", "Someone hot likes you"). | RUN | ☐ |

---

## 13. Messages & Chat readiness (`tabs/matches`, `chat/[id]`)

| # | Gate | Verify | |
|---|------|--------|--|
| 13.1 | `[BLOCKER]` Matches inbox rows show photo, name, last message, shared Delulu label, unread badge; inbox reads calm (light on jokes). | RUN | ☐ |
| 13.2 | `[BLOCKER]` Chat renders message list + composer; sending appends a local (mock) message — no real backend messaging. | RUN | ☐ |
| 13.3 | `[BLOCKER]` Shared Delulu Context Card is present, shows why-you-matched + suggested opener, and is **collapsible**. | RUN | ☐ |
| 13.4 | `[BLOCKER]` Suggested opener button inserts the opener text into the composer. | RUN | ☐ |
| 13.5 | `[BLOCKER]` Empty state uses approved copy ("No messages yet — Match with someone whose delulu feels survivable."). | RUN | ☐ |

---

## 14. Profile & Settings readiness (`tabs/profile`, `settings`)

| # | Gate | Verify | |
|---|------|--------|--|
| 14.1 | `[BLOCKER]` Profile shows: profile preview, Delulu Profile, public/private toggles, match preferences, subscription placeholder, settings entry. | RUN | ☐ |
| 14.2 | `[BLOCKER]` Editing (photos/prompts/basics/preferences/Delulu visibility) is reachable and low-drama; changes persist. | RUN | ☐ |
| 14.3 | `[BLOCKER]` Public/private Delulu toggles here match and stay in sync with §6.5. | RUN | ☐ |
| 14.4 | `[BLOCKER]` Subscription state is a simulated tier switch (`free`/`plus`/`max`) with no real purchase attempted. | RUN | ☐ |

---

## 15. Analytics readiness

| # | Gate | Verify | |
|---|------|--------|--|
| 15.1 | `[BLOCKER]` `analyticsService.trackEvent(name, properties)` exists; in mock mode it logs to console **and** appends to a local analytics store. | LOG/CODE | ☐ |
| 15.2 | `[BLOCKER]` All required events fire at the right moments — onboarding (`onboarding_started`, `onboarding_step_viewed`, `profile_basics_completed`, `preference_selected`, `interview_question_viewed`, `interview_question_answered`, `delulu_profile_generated`, `delulu_profile_edited`, `onboarding_completed`), weekly drop (`weekly_drop_viewed`, `match_card_impression`, `match_card_expanded`, `match_explanation_viewed`, `compatibility_breakdown_viewed`, `match_liked`, `match_skipped`, `match_saved`, `wildcard_impression`, `wildcard_expanded`, `wildcard_liked`, `wildcard_skipped`), chat (`suggested_opener_viewed`, `suggested_opener_used`, `message_sent_mock`, `chat_opened`), paywall (`paywall_viewed`, `paywall_cta_tapped`, `paywall_dismissed`), feedback (`match_feedback_submitted`, `drop_feedback_submitted`). | LOG | ☐ |
| 15.3 | `[BLOCKER]` **Every** match impression and action logs the full match payload: `userId, candidateId, dropId, rank, isWildcard, matchAlgorithmVersion, totalMatchScore, scoreComponents{all 7}, topSharedDimensions, topMismatchDimensions, explanationReasonCodes, marketplaceReasonCodes`. | LOG | ☐ |
| 15.4 | `[BLOCKER]` Wildcard events are tracked **separately** (distinguishable by `isWildcard` and dedicated wildcard events). | LOG | ☐ |
| 15.5 | `[BLOCKER]` Analytics Debug Panel is reachable **only** when `EXPO_PUBLIC_ENABLE_ANALYTICS_DEBUG=true`; it lists captured events with their payloads. | RUN | ☐ |

---

## 16. State, persistence & backend seams

| # | Gate | Verify | |
|---|------|--------|--|
| 16.1 | `[BLOCKER]` Zustand stores exist: `authStore, onboardingStore, deluluStore, weeklyDropStore, analyticsStore, chatStore`. | CODE | ☐ |
| 16.2 | `[BLOCKER]` Persisted to AsyncStorage: onboarding progress, current user, generated Delulu Profile, weekly drop, analytics debug events — and they survive an app restart. | RUN | ☐ |
| 16.3 | `[BLOCKER]` **Not** persisted: auth tokens, private secrets, production chat messages. | CODE | ☐ |
| 16.4 | `[BLOCKER]` `supabaseClient.ts` exists with `isSupabaseConfigured = Boolean(url && anonKey)`; when unconfigured, mock repositories are used and nothing blocks local mode. | CODE/RUN | ☐ |
| 16.5 | `[BLOCKER]` RevenueCat config **placeholders** exist; no real purchase flow is wired. | CODE | ☐ |
| 16.6 | `[BLOCKER]` Folder structure matches the spec (`src/app`, `src/components`, `src/services`, `src/stores`, `src/types`, `src/mocks`) and is clean/ready for backend wiring. | CODE | ☐ |
| 16.7 | `[BLOCKER]` Mock candidate pool has **≥ 30** users with varied gender, `interestedIn`, intent, scores, match velocities, and wildcard potential. | CODE | ☐ |

---

## 17. Design-system conformance

Traceable to [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) and [`theme/tokens.ts`](./theme/tokens.ts).

| # | Gate | Verify | |
|---|------|--------|--|
| 17.1 | `[BLOCKER]` Components import color/radius/spacing/typography/motion from `theme/tokens.ts`. **No hard-coded hex, radii, spacing, or durations** in components. | CODE | ☐ |
| 17.2 | `[BLOCKER]` Full component set exists: `Screen, Text, Button, Chip, ProgressHeader, BottomTabBar, ProfilePhotoCard, PromptCard, MatchCard, MatchScorePill, DeluluDimensionBar, DeluluProfileCard, WeeklyDropHeader, WildcardCard, ChatBubble, SuggestedOpener, PaywallCard, EmptyState, AnalyticsDebugPanel`. | CODE | ☐ |
| 17.3 | `[BLOCKER]` Color roles respected: Delulu-pink for primary CTAs/active/selected; Danger Crush used sparingly (wildcard/warnings/destructive); Gold reserved for reward moments; Green Flag only for positive/success/safety. | RUN | ☐ |
| 17.4 | `[BLOCKER]` Backgrounds use ink/charcoal shell with cream card surfaces per spec; app does not read as neon-cheap, therapy-coded, or children's-app. | RUN | ☐ |
| 17.5 | `[POLISH]` Gradients appear **only** at approved moments (onboarding hero, Delulu reveal, wildcard, selected CTA, rare celebration) — not everywhere. | RUN | ☐ |
| 17.6 | `[POLISH]` Type scale + fonts follow the system: system/Inter sans for core UI; accent font (Space Grotesk/Sora) only on hero/label/reveal headlines. | RUN | ☐ |
| 17.7 | `[BLOCKER]` Bottom tab bar: active = Delulu-pink icon + subtle glow/underline; inactive = muted lavender-gray; simple labels; no aggressive bounce. | RUN | ☐ |
| 17.8 | `[POLISH]` Delulu chips are pill-shaped with accent border and micro text; compatibility bars show qualitative strength only. | RUN | ☐ |

---

## 18. Motion, accessibility, copy & safety

### 18.1 Motion & dopamine
| # | Gate | Verify | |
|---|------|--------|--|
| 18.1.1 | `[POLISH]` Reward moments fire **only** on meaningful actions (onboarding complete, Delulu Profile reveal, first weekly-drop open, strong like, wildcard reveal, mutual match, opener used) — **not** every tap/scroll/tab change. | RUN | ☐ |
| 18.1.2 | `[POLISH]` Timings/easing follow tokens (`instant 80 · fast 140 · standard 220 · slow 360 · reveal 520`); no chaotic animation during messaging. | RUN | ☐ |

### 18.2 Accessibility (not optional)
| # | Gate | Verify | |
|---|------|--------|--|
| 18.2.1 | `[BLOCKER]` Interactive tap targets are **≥ 44×44**. | RUN | ☐ |
| 18.2.2 | `[BLOCKER]` No critical information is conveyed by **color alone** (labels/icons/text back up every color signal). | RUN | ☐ |
| 18.2.3 | `[BLOCKER]` **Reduced-motion** setting is respected: shimmer → fade, spring reveal → standard fade/slide, no pulsing CTA; animation never blocks a core action. | RUN | ☐ |
| 18.2.4 | `[POLISH]` Text contrast meets WCAG AA where possible; form errors are readable and specific; chat supports dynamic text sizing where feasible. | RUN | ☐ |

### 18.3 Copy & tone
| # | Gate | Verify | |
|---|------|--------|--|
| 18.3.1 | `[BLOCKER]` Delulu/unhinged vocabulary is used; clinical/pathology language (neuroticism, attachment diagnosis, disorder, "clinical compatibility", etc.) appears **nowhere**. | RUN | ☐ |
| 18.3.2 | `[POLISH]` No more than a light density of jokes per screen; messaging surfaces stay calm; no "AI-powered" framing. | RUN | ☐ |
| 18.3.3 | `[BLOCKER]` Empty/error states use the approved copy from DESIGN_SYSTEM §15–§16. | RUN | ☐ |

### 18.4 Safety & trust
| # | Gate | Verify | |
|---|------|--------|--|
| 18.4.1 | `[BLOCKER]` **None** of the forbidden features exist: clinical claims, mental-health labels, "craziest user" leaderboards, public numerical delulu scores, trauma-based compatibility, diagnosis prompts, or any encouragement of stalking/coercion/jealousy. | RUN/CODE | ☐ |
| 18.4.2 | `[BLOCKER]` The disclaimer copy is present: "Unhinged is for entertainment and dating compatibility. Your Delulu Profile is not a diagnosis, and you control what appears publicly." | RUN | ☐ |
| 18.4.3 | `[BLOCKER]` Safety filter removes mock candidates with `safetyExcluded=true` from all drops (curated **and** wildcard). | CODE | ☐ |

### 18.5 Freemium
| # | Gate | Verify | |
|---|------|--------|--|
| 18.5.1 | `[BLOCKER]` Free tier can: complete onboarding, see the weekly drop, view basic match explanations, like a **limited** number of matches, chat after a mutual match. | RUN | ☐ |
| 18.5.2 | `[BLOCKER]` Paid placeholders are gated behind the simulated tier (inbound likes, advanced breakdown, extra tuning, second look, match-style control) with no real purchase. | RUN | ☐ |

---

## 19. UAT readiness roll-up (final gate)

The prototype is **Ready for UAT** only when a reviewer can, in one uninterrupted
session on device/simulator, demonstrate the full spec acceptance list — each
tied to its gate above:

- [ ] App runs locally with no backend configuration. *(§1)*
- [ ] User completes onboarding end to end. *(§3)*
- [ ] User answers the Delulu Interview. *(§4)*
- [ ] App generates a Delulu Profile. *(§5–§6)*
- [ ] User reviews the Delulu Profile. *(§6)*
- [ ] App generates **10** weekly matches from mock candidates. *(§7, §10)*
- [ ] App generates **1** wildcard. *(§9, §10)*
- [ ] Each match has an explanation. *(§8, §11)*
- [ ] Each match has score metadata. *(§11, §15)*
- [ ] User can like, skip, save, and view match details. *(§7, §8)*
- [ ] User can open a stub chat. *(§13)*
- [ ] Suggested opener appears in chat and inserts into the composer. *(§13)*
- [ ] Analytics events are logged locally with full payloads. *(§15)*
- [ ] Supabase client wrapper exists and does not block local mode. *(§16)*
- [ ] Env variable placeholders exist. *(§1)*
- [ ] Folder structure is clean and ready for backend wiring. *(§16)*
- [ ] No forbidden safety/clinical content anywhere. *(§18.4)*
- [ ] Design-system conformance holds (tokens, components, color roles, a11y). *(§17–§18)*

**Sign-off**

| Role | Name | Date | Ready? (Y/N) |
|------|------|------|--------------|
| Builder (self-check) | | | |
| Product owner | | | |
| Design reviewer | | | |

> When every `[BLOCKER]` is checked and all three sign-offs read **Y**, the
> prototype is **Ready** and UAT may begin. Any unchecked blocker means **Not
> Ready** — return it to the builder with the failing gate numbers.
