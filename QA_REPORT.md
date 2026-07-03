# Unhinged — Deep Functional QA Report (UX & Interaction Flows)

**Date:** 2026-07-03 · **Branch:** `claude/app-ux-qa-x5shqm` · **Build:** Expo SDK 57 / RN 0.86 / React 19.2.3, mock mode
**Method:** full static audit of the codebase against [`DEFINITION_OF_READY.md`](./DEFINITION_OF_READY.md) **plus** live end-to-end drives of every user flow (Expo web + Playwright/Chromium, 390×844 viewport, persisted profile across simulated app restarts). ~180 scripted checks across 10 phases; all scripts, raw results, and screenshots are committed under [`qa/`](./qa).

> **Verdict: NOT READY for UAT.** One P0 dead-end and six P1 defects fail `[BLOCKER]` gates (§7.3/§10, §15.2, §18.2.3, §18.5.2, §10.7, plus an unvalidated-age safety gap). Everything else is in strong shape — the core loop (onboarding → interview → profile → drop → detail → like/skip/save → mutual → chat) works end-to-end for mainstream personas, scoring is deterministic, analytics payloads are complete, persistence survives restarts, and the copy/design system discipline is genuinely good.

---

## 1. What was tested

**Live E2E (web harness):** cold boot & routing; full onboarding with validation probes (empty submit, invalid birthday, max-photo/prompt limits, back-nav persistence); all 14 interview questions across all five answer types incl. slider drag, back-and-change-answer, microcopy; profile reveal timing, "Roast me again" determinism, all five visibility toggles; weekly-drop reveal moment, 10+1 composition, section transitions, like/skip/save/view from cards **and** from detail; wildcard detail variant; free-tier likes teaser → paywall → dismiss; 5-like free limit and 6th-like block; simulated purchase via **Unlock** (tier flip + reveal); Messages inbox, chat open, collapsible context card, opener insertion, local sends; chat guard for non-matches and unknown ids; profile tab, public preview, §6.5⇄§14.3 toggle sync; settings + analytics debug panel; deep links cold-started into `match/[id]` and `chat/[id]`; pre-onboarding URL guards on every route; empty-`.env` boot; reduced-motion boot; app-restart persistence of all five stores; session-wide analytics event coverage (28/30 observed).

**Static audit:** scoring/matching engine math (weights, dimension classes, clamps, determinism, eligibility, marketplace, wildcard), stores/persistence partitioning, env handling, analytics emitters vs the §15.2 list, route tree, component inventory, token discipline, a11y props, approved/banned copy.

**Not covered (environment limits):** iOS/Android native boot (gate 1.1), real haptics, native keyboard behavior, OS-level reduce-motion toggle (emulated via `prefers-reduced-motion`), AsyncStorage async-timing races (web localStorage hydrates faster — one native-only risk flagged as U-23).

Persona used for the main pass: Woman → Everyone, serious, monogamous, 25–40, 25 mi, 2 dealbreakers, "More chaotic spark" → 14 deliberate answers → type **Romantic Conspiracy Theorist**. Additional personas for edge probing (narrow age band; Nonbinary-only 10 mi; Men-only 50 mi).

---

## 2. Findings index

| ID | Sev | Area | Finding | DoR gate |
|----|-----|------|---------|----------|
| U-01 | **P0** | Drop generation | Thin candidate pool (≤10 eligible) throws → onboarding dead-ends on "build my drop"; retry fails | 7.3, 10.x, 11.2, 19 |
| U-02 | **P1** | Onboarding | Birthday never validated: any string accepted → silent age 29; no 18+ gate; year math hardcodes 2026 | 3.2.1/3.2.2, 18.4 |
| U-03 | **P1** | Matching | Already-matched people reappear in the weekly drop (live `mutualMatchIds` never consulted) | 10.1 |
| U-04 | **P1** | Analytics | `match_feedback_submitted` has no emitter anywhere (28/30 events observed live) | 15.2 `[BLOCKER]` |
| U-05 | **P1** | Freemium | 4 of 5 paid placeholders unenforced — free tier gets full breakdown, match-style tuning, etc. | 18.5.2 `[BLOCKER]` |
| U-06 | **P1** | A11y/Motion | Reduce-motion users still get the full 2.6 s profile reveal (async flag race) — measured 2410 ms under `reduce` | 18.2.3 `[BLOCKER]` |
| U-07 | **P1** | Matching | Delulu Flexibility "wider/wilder" half is dead code; distance-widen adds nobody with shipped mocks | 10.6/10.7 |
| U-08 | P2 | Analytics | Phantom `match_liked` when the free-like limit blocks the like (5 events vs 4 likes, live) | 15.3 |
| U-09 | P2 | Analytics | `interview_question_answered` fires per keystroke / per multi-select toggle | 15.2 |
| U-10 | P2 | Analytics | `match_card_impression` double-fires when a card moves Curated → Already viewed | 15.3 |
| U-11 | P2 | Analytics | `weekly_drop_viewed` fires once ever (persisted flag) — relaunches/views never counted | 15.2 |
| U-12 | P2 | Analytics | `onboarding_step_viewed` emitted on only 2 of 6 steps | 15.2 |
| U-13 | P2 | Env seams | `EXPO_PUBLIC_ENABLE_MOCKS` doesn't drive the mock/real seam (only console logging) | 1.4 |
| U-14 | P2 | Env | Analytics debug panel reachable with an **empty** env (flag defaults true) — verified live | 15.5 |
| U-15 | P2 | Onboarding | Step edits are committed only on Continue — back-nav silently discards typed input | 3.2.3 |
| U-16 | P2 | Forms | No `KeyboardAvoidingView` on basics/interview text entry (chat has one) | 18.2.4 |
| U-17 | P2 | Matching | Intent dealbreaker filtered one-sided (candidate's own dealbreaker ignored) | 10.1 |
| U-18 | P2 | Copy/trust | `shared_absurd_interest` wildcard copy claims a shared interest that is never actually compared | 9.4/9.5 |
| U-19 | P2 | A11y | Sub-44 px tap targets measured: tab items 33×49, chat Back 47×28, "Use opener" 85×28, context-collapse row 20 px | 18.2.1 `[BLOCKER]` |
| U-20 | P2 | State | Delulu profile duplicated in two stores; visibility edits update only one | 16.x latent |
| U-21 | P2 | Robustness | Unguarded `candidate.photos[0]` in Likes/Messages rows | — |
| U-22 | P2 | Navigation | Review ⇄ profile-card pushes stack copies and replays the reveal on every edit round-trip | 3.5.1 |
| U-23 | P2 | Analytics (native) | `[id]`-keyed effects can drop required events on cold deep links **on native** (did *not* reproduce on web — hydration won the race) | 15.2 latent |
| U-24 | P3 | Guards | Pre-onboarding URLs expose seeded likes/conversations (no crashes anywhere — good) | — |
| U-25 | P3 | Visual | Tab-bar labels visually cramped at 390 px (`DROP LIKES MESSAGES PROFILE` nearly touching) | 17.7 polish |
| U-26 | P3 | UX copy | "Roast me again" always returns the identical profile (deterministic by design; label over-promises) | 6.4 note |
| U-27 | P3 | Mocks | `blocked`/`recentlySkipped`/`alreadyMatched` never true in mocks; no `unsure`-intent candidate → filters unexercised | 16.7 |
| U-28 | P3 | Tokens | 3 literal values that equal their token (`gap:12`, `paddingHorizontal:4`, `padding:2`) + `fontSize:16` on inputs | 17.1/17.6 |
| U-29 | P3 | Data hygiene | `DeluluTrait.score` (raw number) rides inside UI-bound profile objects — a leak foot-gun (nothing renders it today) | 6.2 latent |

---

## 3. Detailed findings

### U-01 · P0 — Narrow-but-valid preferences make onboarding uncompletable

**Repro (100%, reproduced live twice):** Onboard as Woman → interested in "Nonbinary people" → 10 mi (any other answers) → finish interview → profile card → **Looks right — build my drop** → nothing happens. Console: `Error: weeklyDropService: no eligible candidate available for the wildcard slot`. The user stays on Review; tapping again fails identically. Also triggered by a 40–40 age band; *not* triggered by Woman→Men @ 50 mi (pool > 10). Evidence: `qa/evidence/32-P0-stuck-review.png`, `qa/artifacts/results-phase6-crash.json`.

**Mechanics:** curated takes the top 10 of *all* eligible (`weeklyDropService.ts:97`), then the wildcard must come from what's left (`wildcardService.ts:93-94`); with ≤ 10 eligible the leftover set is empty → `generateWeeklyDrop` throws (`weeklyDropService.ts:106-109`). Nothing catches it: not `review.tsx:49` (`complete()` — so `setCompleted(true)` never runs), not `weeklyDropStore.ts:68-77`, not `weekly-drop.tsx:44-47` (`ensureDrop`), and there's no error boundary in `src/app/_layout.tsx`. The mock pool (32 usable) thins fast for single-gender preferences (3 candidates accept a man seeking men; 3 Nonbinary candidates total), so this is a mainstream path, not a corner case. The distance-widen rescue is inert (see U-07). The approved §7.8 empty state already exists and would be the right degradation.

**Fix direction:** reserve the wildcard before slicing the top 10 (or allow fewer-than-10 curated / a no-wildcard drop), and wrap `generate` so failure lands on the §7.8 empty state instead of a dead button.

### U-02 · P1 — Birthday accepts anything; no age gate; 2026 hardcoded

`basics.tsx:111` validates only non-empty. `parseAge` (`basics.tsx:52-60`) regex-hunts a year, computes `2026 - year`, and **silently returns 29** for anything else — including `"banana"` (accepted live; profile advanced) and any under-18 year (2010 → 16 → rejected by the 18–99 range → silently 29, so a minor is onboarded as 29 rather than blocked). Age is also calendar-year math (1996-11-04 shows 30 on 2026-07-03; real age 29) and will be wrong for every user after 2026. For a dating app this is a safety-adjacent blocker: there is effectively no age verification.

**Fix direction:** parse a real date, reject invalid input with the existing error pattern, hard-stop under-18, compute age from the full date and current date.

### U-03 · P1 — You can be served (and re-like) someone you already matched with

Eligibility checks only the static seed flag `candidate.alreadyMatched` (`eligibilityService.ts:92-94`, false for every mock); `weeklyDropStore.generate` never passes the store's live `mutualMatchIds`/`likes` as exclusions. Live evidence: seeded mutual **c08 (Simone)** — who has an active conversation in Messages — was curated match #4 in my drop and fully likeable (`qa/artifacts/drop-ground-truth.json`, phase-3/4 results). Skipped-this-week candidates would similarly reappear next generation.

### U-04 · P1 — `match_feedback_submitted` can never fire

Defined in `types/analytics.ts:44`; zero emitters in `src/` and no feedback control on match cards or `match/[id]`. Only `drop_feedback_submitted` is wired (`weekly-drop.tsx:117`). Confirmed live: after exercising every screen, session coverage is 28/30 required events (`qa/artifacts/analytics-coverage.json`) — this one is structurally missing (`wildcard_liked` was simply not exercised in the final pass; its emitter exists and its impression/expanded/skipped siblings all fired).

### U-05 · P1 — Paid features aren't actually gated

Only inbound likes checks the tier (`likes.tsx:21`). The other paid placeholders exist as types and paywall copy (`paywall.tsx:20-35`, `types/monetization.ts:22-42`) but nothing triggers them: free users see the **full** compatibility breakdown (`match/[id].tsx:190-197`) and can retune **match style** freely (`profile.tsx:92`); `second_look`/`profile_tuning` surfaces don't exist. The like-limit and inbound-likes gates work correctly (verified live, including the simulated **Unlock** upgrade path).

### U-06 · P1 — Reduce-motion still plays the full reveal

`useReducedMotion` starts `false` and resolves async (`hooks/useReducedMotion.ts:9-15`); `profile-card.tsx` schedules the whole 4-step × 520 ms reveal in a mount effect with `[]` deps (`:57-66`, `:68-73`), so the flag lands too late — every reveal plays in full for reduce-motion users. Measured live under `prefers-reduced-motion: reduce`: **2410 ms** to reveal vs the ~220 ms reduced path the code intends. (Components that read `reduced` during render — `PressableScale`, `WildcardCard` shimmer — self-correct on re-render; the one-shot timer path does not.) Gate 18.2.3 is a blocker: "animation never blocks a core action."

### U-07 · P1 — Delulu Flexibility's "wider/wilder" promise is dead code

`allowLowerDeluluCompatibility` is computed and returned (`marketplaceBalanceService.ts:51,57,118`) but never consumed anywhere (the only other occurrence is a hardcoded literal in `chat/[id].tsx:54`). The pool-widen branch's remaining effects: a flat +12 applied identically to every candidate (no reordering) and eligibility distance-doubling (`eligibilityService.ts:59-64`) that adds **nobody** because every mock lives ≤ 27 mi while base radii are 40–50 (`mockCandidates.ts`). Net: high-flex users don't get wider/wilder candidates; only the low-flex penalty (−10) does anything. Gate 10.7 holds in one direction only — and this same inertness is why U-01 can't self-rescue.

### U-08–U-12 · P2 — Analytics correctness cluster

- **U-08 Phantom likes:** `MatchCard.tsx:60-64` / `WildcardCard.tsx:72-76` track `*_liked` *before* the parent handler bails at the limit (`weekly-drop.tsx:60-68`). Live: 5 `match_liked` events, 4 real likes. The detail-screen path checks first (`match/[id].tsx:76-86`) — the two paths disagree.
- **U-09:** `record()` fires `interview_question_answered` on every `onChangeText`/chip toggle (`interview.tsx:51-57,167-169,197-201`) — typing a 20-char answer emits ~20 events; flood visible in the debug panel.
- **U-10:** impression effect keyed `[candidate.id]` (`MatchCard.tsx:47-50`) refires when the card remounts into "Already viewed" (`weekly-drop.tsx:109-112` vs `:154-169`).
- **U-11:** the only `weekly_drop_viewed` emitter lives inside the one-time reveal (`weekly-drop.tsx:49-53`); `hasRevealed` is persisted → never fires again across relaunches.
- **U-12:** `onboarding_step_viewed` only on welcome + profile-card (`welcome.tsx:26`, `profile-card.tsx:69`).

### U-13/U-14 · P2 — Environment seams

`useMocks` only toggles console logging (`env.ts:39`, `analyticsService.ts:39`); repository/auth selection keys off `isSupabaseConfigured` (`supabaseProfileRepository.ts:54-55`) — works today only because Supabase is unconfigured (gate 1.4's "forces mock mode" is not literally true). And with a fully **empty** env the analytics debug panel is still reachable (default `true`; verified live on a no-`.env` boot, `qa/artifacts/results-phase8-noenv.json`) — inverted default vs gate 15.5.

### U-15–U-24 — remaining P2/P3 (compact)

- **U-15:** basics/preferences write to the store only in `onContinue` — the header back button discards typed input without warning.
- **U-16:** no keyboard avoidance on basics/interview inputs (device risk; chat does it right at `chat/[id].tsx:110`).
- **U-17:** `eligibilityService.ts:67-74` honors only the *user's* intent dealbreaker, unlike two-sided gender/age.
- **U-18:** `wildcardService.ts:37` picks `shared_absurd_interest` whenever the candidate has *any* absurd interest; `matchExplanationService.ts:141-144` then tells the user "you share one gloriously specific interest" — never compared to the user (my live wildcard carried exactly this claim).
- **U-19:** measured DOM boxes (`qa/artifacts/small-targets-*.json`): tab items 33×49, chat "Back" 47×28, "Use opener" 85×28, context-collapse header 20 px tall, `sm` chips 26 px (+16 hitSlop ⇒ ~42 effective, `Chip.tsx:80,95`). hitSlop helps on native but several controls still land under 44.
- **U-20:** `review.tsx:42-48` stores the profile in both `onboardingStore.user.deluluProfile` and `deluluStore.profile`; `updateVisibility` mutates only the latter.
- **U-21:** `likes.tsx:55` / `matches.tsx:51` dereference `photos[0]` unguarded (safe with current mocks).
- **U-22:** each Review→Edit(Delulu)→"Looks right" round-trip pushes new stack entries and replays the ~2 s reveal.
- **U-23:** `match/[id].tsx:51-58` & `chat/[id].tsx:61-67` early-return before hydration with `[id]`-only deps — on web the events fired (hydration won), but with native AsyncStorage timing these BLOCKER events can be silently dropped on deep links.
- **U-24:** direct URLs pre-onboarding never crash (good), but seeded likes/messages are browsable before any profile exists.
- **U-25–U-29:** see index; all cosmetic/latent.

---

## 4. DoR gate scorecard (summary)

| Section | Status | Notes |
|---------|--------|-------|
| §1 Environment & build | **PASS** (1.1 untestable here) | Empty-env boot clean; `.env.example` exact; `tsc --noEmit` zero errors; version from env (`weeklyDropService.ts:68`); mock-seam nit U-13 |
| §2 Navigation & routing | **PASS** | Full route tree; hydration-gated entry redirect; 4 tabs; chat guard verified incl. hostile ids; no blank routes; paywall/settings dismissible |
| §3 Onboarding | **PARTIAL** | All fields/validation/persistence verified live — but U-02 (birthday) and U-15 (back-nav discard) |
| §4 Interview | **PASS** | 22-question bank / 14-flow; all five types driven live; back-revert clean (recompute-from-scratch, no double-count); progress correct; microcopy shown. Analytics nit U-09 |
| §5 Scoring engine | **PASS** | 14 dimensions exact; deterministic (verified live via identical "Roast me again"); init-50/clamp-once; explicit type rules |
| §6 Delulu Profile | **PASS** | All 7 fields; no numeric leak (checked rendered text); reveal 2.5 s; actions work; 5 visibility toggles persist & drive the public preview correctly — but U-06 (reduced motion) |
| §7 Weekly Drop | **FAIL (U-01)** | 10+1 verified for healthy pools; sections/actions/state-survival all pass; approved empty state exists & renders pre-onboarding; reveal-once moment works |
| §8 Match Detail | **PASS** | All blocks render from real `MatchExplanation`; qualitative-only breakdown; opener trio works; like/skip from detail update shared state & route back |
| §9 Wildcard | **PASS** (U-18 copy nit) | Distinct gradient treatment; 4 wildcard sections; valid reason code; not the top-scoring candidate (72.5 vs 81.8 live) |
| §10 Matching algorithm | **PARTIAL** | Weights/classes/repair-penalty/marketplace verified exact; deterministic; but U-03, U-07, U-17 |
| §11 Match data completeness | **PASS** | All 11 live candidates carried every required field (checked in persisted state, field-by-field) |
| §12 Likes | **PASS** | Free scrim + teaser + approved copy; paid reveal with liked-target indicators (verified live); no banned lines |
| §13 Messages & Chat | **PASS** | Inbox rows complete; context card collapsible; opener inserts verbatim; local sends append; approved empty copy in code |
| §14 Profile & Settings | **PASS** | Edit round-trips persist; §6.5 toggles are the same store (sync verified); tier switch simulated (chips + Unlock both verified) |
| §15 Analytics | **FAIL (U-04)** + U-08…U-12, U-14 | 28/30 events live; full 12-field payloads on 50 match events checked; wildcard events distinct |
| §16 State & seams | **PASS** | 5 persisted stores survive restart (verified); chat unpersisted; no tokens stored; supabase seam correct; 34-candidate pool |
| §17 Design system | **PASS** | Zero hex literals in components; full 19-component set; tab bar per spec (U-25 polish) |
| §18 Motion/a11y/copy/safety | **PARTIAL** | Disclaimer present (2 places); no clinical language; no banned copy; safety-excluded filtered (single choke point); but U-06, U-19 |

### §19 UAT roll-up
Passing today: runs with no backend ✓ · onboarding E2E ✓ (mainstream personas) · interview ✓ · profile generate/review ✓ · 10 matches + wildcard ✓ (healthy pools) · explanations ✓ · score metadata ✓ · like/skip/save/view ✓ · stub chat ✓ · opener→composer ✓ · env placeholders ✓ · supabase wrapper ✓ · folder structure ✓ · no forbidden content ✓.
**Blocking:** U-01 (uncompletable onboarding for thin-pool personas), U-04 (§15 list), U-05 (§18.5.2), U-06 (§18.2.3), U-02 (age integrity).

---

## 5. What's working well (verified, not vibes)

- **Determinism is real.** Same 14 answers → byte-identical type/scores across regeneration and restarts. No `Math.random` in any scoring path; drop output is stable and tie-broken.
- **The interaction core is solid.** Every card action mutates persisted state correctly and survives tab switches *and* full restarts; detail and card paths converge on the same store; mutual-match creation via liking an inbound liker works and immediately populates Messages.
- **Payload discipline.** All 50 checked match-event payloads carried the full 12-field schema; wildcard events are separately identifiable.
- **Copy & safety discipline.** Approved empty states, the exact disclaimer (twice), zero banned paywall lines, zero clinical vocabulary, no numeric score ever rendered (checked page text at every screen).
- **Robust routing.** Ten hostile/pre-state deep links produced zero crashes — every one landed on a sensible guard state.

## 6. Re-running this QA

```bash
npm install && npm i --no-save react-native-web@~0.21.0 react-dom@19.2.3 @expo/metro-runtime@~57.0.3
cp .env.example .env && EXPO_OFFLINE=1 CI=1 npx expo start --web --port 8081 &
cd qa/harness && for p in phase1-boot phase2-onboarding phase3-drop phase4-monetization-chat \
  phase5a-guards phase5b-deeplink-a11y phase6-crash-repro phase7-final; do
  NODE_PATH=$(npm root -g) node $p.cjs; done   # phase8-noenv.cjs: restart the server without .env first
```
Phases are order-dependent (2 → 3 → 4 build on one persisted browser profile; 5a/6/8 reset it). Raw pass/fail JSON lands next to the scripts; screenshots in `shots/`. Requires a global `playwright` (any 1.5x) with its Chromium.

## 7. Suggested fix order

1. **U-01** (unblocks UAT outright) → then re-run `phase6-crash-repro.cjs` which should land on the §7.8 empty state or a degraded drop.
2. **U-02** age validation (small, safety-critical).
3. **U-06** reduced-motion race (respect the flag before scheduling timers, or re-plan when it resolves).
4. **U-04** add a match-feedback control (or descope the event from the DoR).
5. **U-05** wire the four missing paywall contexts.
6. **U-03/U-07/U-17** matching-loop correctness batch.
7. Analytics cluster U-08…U-12 in one sweep.
