# Unhinged Design System

> Reference for the Unhinged native mobile app (Expo / React Native).
> Machine-readable tokens live in [`theme/tokens.ts`](./theme/tokens.ts). This
> document is the human reference: the thesis, rules, screens, components, and
> copy that the tokens serve.

---

## 1. Thesis

Unhinged should feel like a **familiar premium dating app with a sharper, funnier
personality.**

Navigation is conventional. Users should instantly know where to find their
weekly matches, people who liked them, active conversations, their profile,
profile editing, and settings.

**The unhingedness comes from:** copy · color accents · small motion moments ·
playful labels · match explanations · reward moments after meaningful actions.

**It does _not_ come from:** confusing navigation · overly custom layouts ·
novelty interactions · chaotic animation · too many jokes per screen · visual
clutter.

> Hinge's structure, with a more playful, red-purple, "for the plot" emotional skin.

---

## 2. Product UX principle

**Familiar shell. Unhinged soul.**

The app behaves like users expect a dating app to behave. The more familiar the
structure, the more permission we have to make the copy and microinteractions
weird. Users should never have to learn how to use the product — they should
only discover that it has better taste than expected.

---

## 3. Navigation model

Traditional **bottom tab** structure.

### Primary tabs

| Tab | Purpose |
| --- | --- |
| **Drop** (Weekly Drop) | Main discovery surface. 10 curated matches + 1 wildcard. |
| **Likes** | Inbound likes; blurred/limited for free users. |
| **Messages** | Active matches and conversations. |
| **Profile** | Profile, Delulu Profile, settings, editing, subscription state. |

### Secondary routes

- **From Drop:** Match detail · Wildcard detail · Like confirmation · Skip feedback · Paywall prompt
- **From Likes:** Like detail · Match confirmation · Paywall prompt
- **From Messages:** Chat thread · Match context drawer · Safety/report menu
- **From Profile:** Edit profile · Edit photos · Edit prompts · Edit preferences · Edit Delulu Profile visibility · Settings · Subscription

---

## 4. Screen architecture

### 4.1 Weekly Drop — core home screen
Structure: Header · Weekly drop status · Curated match card stack/list · Wildcard
card · Viewed/skipped state · Empty state.

- **Header copy:** _"This week's drop — 10 matches for your delulu. 1 wildcard for the plot."_
- **Primary card actions:** View · Like this delulu · Not my delulu · Save for later.
- The layout must **not feel like a casino.** Avoid rapid-fire swipe mechanics.
  Make the drop feel curated and intentional.

### 4.2 Match Detail — the most important conversion screen
Structure: Photos · Basic info · Prompt answers · Delulu Type · Why you might
match · Where it could get unhinged · Compatibility chips · Suggested opener ·
Like / Skip.

> The match explanation is a **premium content object**, not a throwaway label.

### 4.3 Wildcard Detail
Same structure as Match Detail with a more distinct visual treatment.

> _"Wildcard for the plot — This is not your best match. The algorithm knows. We
> are showing it anyway because something here is spiritually irresponsible."_

Keep it playful; never make the user feel mocked.

### 4.4 Likes
- **Free state:** blurred cards · teaser copy · paywall CTA.
- **Paid state:** visible inbound likes · profile preview · liked prompt/photo indicator.
- **Copy:** _"They liked your delulu — Some people have taste. Concerning, but useful."_

### 4.5 Messages
Conventional inbox. Each row: photo · name · last message · shared Delulu label ·
unread state. The inbox should be **calm** — unhinged energy stays light here,
because messaging is where users are trying to connect.

### 4.6 Chat
Familiar chat UI plus one distinctive object: the **Shared Delulu Context Card.**

> You matched because: high bit commitment · similar lore dependency · risky but
> promising text chemistry.
> Suggested opener: _"What is the smallest thing you've ever turned into lore?"_

The card is **collapsible.** Do not keep pushing the gimmick once the user is
actually talking.

### 4.7 Profile
Structure: profile preview · edit profile · Delulu Profile · match preferences ·
visibility controls · subscription · settings. Editing is practical and
low-drama — not the place for too much copy.

---

## 5. Visual identity

**Should feel:** premium · sharp · romantic · slightly chaotic · internet-native ·
adult enough to trust.

**Avoid:** neon nightclub · therapy app · Gen Z parody · meme-board chaos ·
children's app colors · overly gothic darkness.

---

## 6. Color system

Palette centers on **red-purple against black / dark charcoal** backgrounds, with
warm off-white card surfaces.

| Token | Hex | Role |
| --- | --- | --- |
| `ink` | `#0E0B10` | Deepest background |
| `charcoal` | `#17131B` | Primary shell / dark cards / tabs |
| `deepPlum` | `#241526` | Elevated dark surface |
| `cardCream` | `#FFF3E6` | Primary card & content surface |
| `cardSoft` | `#F7E6D8` | Secondary card surface |
| `textPrimary` | `#171217` | Text on cream |
| `textInverse` | `#FFF3E6` | Text on dark |
| `textMuted` | `#AFA3B5` | Muted / inactive text |
| `delulu` | `#E83F8F` | **Primary accent** — CTAs, active states, selected chips |
| `unhingedPurple` | `#8B3DFF` | Secondary accent — gradients, match tags, highlights |
| `dangerCrush` | `#FF304F` | Sparingly — wildcard, warnings, destructive |
| `dopamine` | `#FFB000` | Reward moments, rare badges, "for the plot" |
| `greenFlag` | `#41D88A` | Positive compatibility, success, safety-confirming |
| `borderDark` | `#332638` | Border on dark surfaces |
| `borderLight` | `#E8D2C1` | Border on cream surfaces |
| `overlay` | `rgba(14,11,16,0.72)` | Scrim / modal overlay |

### Color roles (rules)
- **Ink / Charcoal** — primary backgrounds: app shell, tabs, onboarding.
- **Card Cream** — primary profile/content surface. Keeps the app from feeling too dark or hostile.
- **Delulu Pink** — primary brand accent. Active states, CTAs, selected chips, high-value moments.
- **Unhinged Purple** — secondary accent. Gradients, match tags, compatibility highlights, special states.
- **Danger Crush** — sparingly. Wildcard energy, warnings, destructive states, intense mismatch copy.
- **Dopamine Gold** — reward moments, rare badges, "for the plot." Do not overuse.
- **Green Flag** — only positive compatibility, successful actions, safety-confirming moments.

### Gradients — use rarely
```
Primary brand:  linear-gradient(135deg, #E83F8F 0%, #8B3DFF 100%)
Wildcard:       linear-gradient(135deg, #FF304F 0%, #E83F8F 45%, #FFB000 100%)
```
Only for: onboarding hero · Delulu Profile reveal · wildcard card · selected CTA
states · rare celebratory moments. **Not everywhere.**

---

## 7. Typography

Clean, modern sans-serif for core UI. The main interface font is **not** a quirky
font.

- **Primary UI:** Inter, SF Pro, or system sans.
- **Accent:** Space Grotesk or Sora — only for hero headlines, Delulu Type labels,
  match labels, wildcard headers, and major reveal moments.

### Type scale
| Style | Size / Line | Weight | Notes |
| --- | --- | --- | --- |
| `display` | 36 / 40 | 800 | |
| `h1` | 28 / 34 | 800 | |
| `h2` | 22 / 28 | 700 | |
| `h3` | 18 / 24 | 700 | |
| `body` | 16 / 22 | 400 | |
| `bodyStrong` | 16 / 22 | 600 | |
| `caption` | 13 / 18 | 500 | |
| `micro` | 11 / 14 | 700 | uppercase, letter-spacing 0.4 |

---

## 8. Shape & spacing

Soft, large-radius cards. Dating apps are card-native — lean into it.

- **Radius:** `xs 8 · sm 12 · md 18 · lg 24 · xl 32 · pill 999`
- **Spacing scale:** `2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48`

```ts
// Default card
{ backgroundColor: colors.cardCream, borderRadius: radius.lg, padding: 20 }

// Dark card
{ backgroundColor: colors.charcoal, borderColor: colors.borderDark,
  borderWidth: 1, borderRadius: radius.lg, padding: 20 }
```

---

## 9. Components

| # | Component | Notes |
| --- | --- | --- |
| 9.1 | **Bottom Tab Bar** | Tabs: Drop · Likes · Messages · Profile. Active = Delulu-pink icon + small glow/underline (no bouncing unless extremely subtle). Inactive = muted lavender-gray. Simple labels. |
| 9.2 | **Match Card** | Large photo · name/age · location · Delulu Type chip · match label · short explanation · primary CTA · secondary skip/save. Cream surface on dark background. |
| 9.3 | **Wildcard Card** | May break the system slightly: red-purple-gold accent · dramatic shadow · "for the plot" badge · shimmer on first reveal only. Not every interaction loud. |
| 9.4 | **Delulu Chip** | Labels like High Lore · Bit Committed · Text Mystic · Soft Launch Risk · Good For The Plot. Pill shape · accent border · cream/dark fill · micro text. |
| 9.5 | **Compatibility Bar** | Detail views only. **No raw numerical scores publicly.** Qualitative strength: Low · Medium · High · Reckless. e.g. _Bit Commitment: High · Text Chemistry: Reckless · Repair Reflex: Solid._ |
| 9.6 | **Suggested Opener** | Small content card in match detail & chat. _"Try this: …"_ Actions: Use opener · Save for later · Absolutely not. |
| 9.7 | **Delulu Profile Card** | Reveal card: Delulu Type · signature · top traits · green flag · danger zone. Gradient border or accent header. |
| 9.8 | **Paywall Card** | Playful, not predatory. _"See who likes your delulu — Unlock your inbound likes, deeper match reads, and second looks."_ CTA: Unlock · Not now. **Avoid** "Don't miss your soulmate" / "They might disappear" / "Someone hot likes you." |

---

## 10. Interaction system

Small dopamine hits — **only after meaningful actions.**

- **Good reward moments:** completing onboarding · generating Delulu Profile ·
  opening the weekly drop for the first time · liking a strong match · revealing
  wildcard · mutual match · using a suggested opener.
- **Bad reward moments:** every tap · every scroll · every tab change · every
  message · every skip.

> The product should feel alive, not exhausting.

---

## 11. Motion system

Use motion to **clarify state, not decorate.**

- **Fast for feedback** — button taps, chips, tab changes.
- **Smooth for transitions** — screen changes, card expansion, match detail reveal.
- **Playful for rare rewards** — Delulu Profile reveal, wildcard reveal, mutual match.
- **Never chaotic during messaging.**

**Timing:** `instant 80 · fast 140 · standard 220 · slow 360 · reveal 520` (ms)

**Easing:** standard ease-out for UI · spring for card reveals · gentle scale for
confirmation · no aggressive bounce.

### Interaction examples
- **Button press** — scale to 0.98 for 80ms, then return.
- **Chip selected** — fill Delulu Pink, text → cream, tiny 1.02 scale pulse.
- **Match card expand** — card lifts, image crossfades, detail slides up.
- **Like** — heart/spark fills → _"Delulu sent."_
- **Skip** — minimal feedback → _"Not your delulu."_ (never punish skipping)
- **Save** — bookmark fills → _"Saved for later chaos."_
- **Wildcard reveal** — one-time shimmer, badge → _"For the plot."_

---

## 12. Dopamine moments (use sparingly)

1. **Delulu Profile reveal** (after onboarding, ≤3s): _"Reading the lore…" →
   "Cross-checking the group chat energy…" → "Finding the delusion pattern…" →
   "Oh. We have something."_ Then reveal Delulu Type.
2. **Weekly Drop reveal** (first time each week): cards face-down/blurred → tap
   _"Reveal this week's drop"_ → animate in. _"Your weekly delulu has arrived."_
3. **Wildcard reveal:** locked → _"Open the one we probably should not
   recommend."_ → _"For the plot."_
4. **Mutual match** (standard celebratory pattern, Unhinged copy): _"The delusion
   is mutual." / "This may become lore." / "You both chose chaos." / "The group
   chat will hear about this."_
5. **Suggested opener used:** _"Loaded. Try not to overthink the punctuation."_

---

## 13. Copy system

Funny, concise, a little too accurate.

- **Use:** short sentences · dry humor · dating-native phrasing · confident labels ·
  specific observations.
- **Avoid:** therapy language · corporate product language · excessive slang ·
  trying too hard · three jokes per screen · "AI-powered" framing.

**Good:** _"Find someone whose delulu fits yours." · "10 matches. 1 wildcard. No
infinite swiping." · "Not your delulu." · "Saved for later chaos." · "The delusion
is mutual." · "This could become lore." · "High bit commitment. Medium danger.
Strong opener potential."_

**Bad:** _"Leverage psychographic compatibility to optimize romantic outcomes." ·
"Your personality matrix has been analyzed." · "You are clinically compatible." ·
"Swipe through unlimited singles now." · "Prepare for maximum chaos."_

---

## 14. Accessibility (not optional)

- Text contrast meets **WCAG AA** where possible.
- Tap targets **≥ 44×44**.
- No critical information conveyed by **color alone**.
- Respect **reduced motion** settings; animation never blocks core actions.
- Form errors are readable and specific.
- Chat supports dynamic text sizing where feasible.

**Reduced-motion alternatives:** card shimmer → fade · spring reveal →
standard fade/slide · no pulsing CTA.

---

## 15. Empty states

| Screen | Copy |
| --- | --- |
| Weekly Drop | **No drop yet** — We are still assembling the delulu. Check back soon. |
| Likes | **No likes yet** — The plot is still loading. _(safer than the "marketplace liquidity" line)_ |
| Messages | **No messages yet** — Match with someone whose delulu feels survivable. |
| Saved | **Nothing saved** — No chaos has been bookmarked. |

---

## 16. Error states

| Case | Copy |
| --- | --- |
| Generic | **Something went sideways** — Try again in a second. |
| Network / backend | **The delulu servers are not available** — Local mode is still working. |
| No candidates | **The pool is shallow right now** — We'll widen the search before we start making terrible decisions. |

---

## 17. Profile editing

Stay conventional. Sections: photos · prompts · basics · preferences · Delulu
Profile visibility. Do not over-style — users need control and clarity.

**Delulu visibility controls:** Show my Delulu Type · Show top traits · Hide
danger zone · Hide match explanation details · Use suggested profile line.

> _"Control what becomes lore. Choose which parts of your Delulu Profile appear
> publicly."_

---

## 18. Design tokens

Canonical values live in [`theme/tokens.ts`](./theme/tokens.ts) as a single
`theme` object (`colors`, `radius`, `spacing`, `typography`, `motion`). Import
from there — never hard-code hex, radii, spacing, or durations in components.

---

## 19. Component build order

1. Theme tokens → 2. Screen wrapper → 3. Text → 4. Button → 5. Chip →
6. Bottom tab bar → 7. Profile photo card → 8. Match card → 9. Wildcard card →
10. Delulu Profile card → 11. Suggested opener card → 12. Compatibility
breakdown → 13. Paywall card → 14. Empty states → 15. Motion utilities.

**Full component set to build:** `Screen` · `Text` · `Button` · `Chip` ·
`BottomTabBar` · `ProfilePhotoCard` · `PromptCard` · `MatchCard` · `WildcardCard` ·
`DeluluProfileCard` · `DeluluDimensionBar` · `SuggestedOpener` · `PaywallCard` ·
`EmptyState` · `AnalyticsDebugPanel`.

---

## 20. North star

> The final result should look and feel like a **polished dating app first, and
> an unhinged dating app second.**
