# The Maids of Virginia — Instagram Content Playbook

Working reference for building monthly content plans for @themaidsofvirginia.
Read this fully before drafting any new month. Last updated after the approved
August 2026 plan (v3, on this branch as
`The_Maids_of_Virginia_Instagram_Plan_August_2026_v3.pdf`).

## Account and goal

- Instagram: @themaidsofvirginia, under 100 followers as of Aug 2026.
- Goal: follower growth + engagement (reach, saves, shares, interaction). NOT sales.
  No booking CTAs. Every caption ends with a follow / save / share / comment prompt.
- Optimize everything for engagement stickers and shareability at small-account scale.

## Brand facts

- Residential cleaning franchise serving Alexandria, Arlington, D.C., and Prince William. 30+ years.
- Differentiators: trademarked 22-Step Healthy Touch Deep Cleaning System, HEPA filtration, four-person teams.
- Tagline: "Referred for a reason."
- Colors: Sapphire Blue `#165EB0`, Golden Yellow `#FFD800`, Blood Orange `#FF5301`, white.

## Voice

- Professional, authoritative, reassuring, efficient.
- The mess is NEVER the client's fault — it is the opponent the team beats
  (soap scum "loses," grease "thinks time is on its side," etc.).
- No shame language toward clients, ever.
- Chemical/science claims: accurate and specific, never exaggerated.

## Locked series names (use exactly)

- Cleaning tips series: **"Maid Simple"**
- Educational series: **"Suds and Science"** — intentionally broader than
  product-mixing safety; any accurate cleaning education fits.

## Weekly structure (WEEKDAYS ONLY)

No Saturday or Sunday posts or Stories of any kind — the business and the
social media manager do not work weekends. Suggested publish window
11:30 am–1:00 pm ET.

- **Monday** — Before/After transformation Reel: under 15 seconds, dirty shot
  first, hold the after shot a full 2 seconds, branded cover applied before posting.
- **Wednesday** — Maid Simple tip Reel: genuinely pro-level, non-obvious tips only
  (things a professional knows that homeowners don't). Basic tips like "vacuum
  before you mop" are below the bar. The client does NOT use a "two-towel rule" —
  never reference it.
- **Friday** — rotating slot: testimonials (saved to Reviews highlight) /
  Suds and Science / team spotlights (keep anniversaries, birthdays,
  day-in-the-life montages). August rotation ran S&S → testimonial → S&S → team.

### Stories rhythm (weekdays only)

Share every post to Stories the day it publishes with an interactive sticker
(poll, slider, Yes/No, or question box — those four only). Every story is saved
to one of four highlights: **Reviews, Our Team, Before/After, Service**.
No neighborhood/service-area stories.

- Mon: share the B/A Reel + poll or Yes/No → Before/After
- Tue: review graphic (sapphire bg, golden stars, white quote) + sticker → Reviews
- Wed: share the tip Reel + sticker → Service
- Thu: engagement day — question box, answer round, or team BTS → Service / Our Team
- Fri: share the Friday post + sticker → matches the slot (Reviews / Service / Our Team)

## Audio rules

- Employees never speak on camera, in any language. No talking heads, no spoken
  tips (no Spanish spoken tips either — a dropped legacy idea).
- Default: trending audio (chosen the week of posting) or ASMR cleaning sounds,
  with text overlay.
- Max **2 recorded voiceover Reels per month**, explicitly marked in the plan,
  with short calm/professional scripts included (narration recorded off-camera).

## Hook standards (the client's bar — this is what got the plan approved)

The test: **the hook must make sense at a glance with zero context.** If someone
who has never seen the account reads only the hook, they must instantly get what
they're about to watch and want to keep watching. Hooks that only make sense
after watching the reel are rejected.

Also rejected: describing a visual as the hook ("five stars animate in…").
The hook field is the literal on-screen text.

Patterns that were approved as "eye-catching, creates curiosity":

- Concrete promise + time compression: "Watch three years of soap scum lose in 12 seconds."
- Brand-system flex + imperative: "We clean every kitchen in 22 steps. Watch."
- Paradox that the reel resolves: "Maid Simple: pros don't clean rooms. They clean sections."
- Differentiation claim: "Some vacuums blow fine dust back into the room. Ours trap it."
- Surprising-fact reframe: "The film on your shower glass isn't soap. It's rock." /
  "Vinegar cleans a lot of things. It eats marble."
- Pattern-interrupt command with a payoff twist: "Stop scrubbing your shower.
  Pros spray it and walk away." ("Stop…" openers are good, but they need a
  compelling second beat — "stop wiping too soon" alone was too weak.)
- A real 5-star review quote works as its own hook on testimonial posts.

Rejected examples and why (do not repeat these mistakes):

- "The grout was white the whole time." / "That couch was gray. It is actually
  purple." / "The inside of the oven counts too." / "Step 14 of 22: appliance
  exteriors" — none make sense standalone before watching.
- For the sectioning tip: don't say "we always start at the ceiling" — speak to
  sectioning itself (finish one section completely, top to bottom, left to
  right, before the next).

## Content preferences

- The client strongly prefers science/education woven into content over generic
  concepts. Monday B/A Reels can carry an education angle in hook + caption
  (e.g., HEPA told through an upholstery transformation; hard water told
  through a shower-glass transformation) while keeping the strict B/A format.
- Keep the stainless-steel microfiber tip style as the caliber reference.
- Series visual system for Suds and Science: labeled bottle(s) + big red X +
  one key line ("acid + calcium carbonate = etching"), consistent across parts.

## Standard hashtag block

Defined once per plan, pasted as the FIRST COMMENT on every feed post (never in
the caption), within one minute of publishing:

```
#TheMaidsOfVirginia #ReferredForAReason #maidservice #cleaningservice #housecleaning
#residentialcleaning #deepcleaning #professionalcleaners #cleaningtips #cleaninghacks #cleantok
#satisfyingcleaning #asmrcleaning #beforeandafter #cleaningmotivation #alexandriava #arlingtonva
#washingtondc #princewilliamcounty #manassas #northernva
```

## Deliverable format (PDF)

The plan PDF is **SMM-facing only**. Do NOT include operating-rules or
"what changed" sections in the document — those constraints live here in the
playbook instead. Structure:

1. Branded title header + goal chips
2. Month calendar grid (Mon–Sun, weekends marked "rest"), color-coded:
   sapphire = Monday B/A, yellow = Wednesday Maid Simple, orange = Friday slot,
   gray = Tue/Thu story-only. Legend + VO note under the grid.
3. Standard hashtag block
4. Weekly story rhythm table
5. Post-by-post blocks in date order (story-only days included as compact
   blocks). Fields per post: Format / Audio / On-screen hook / Concept-shot
   plan / Caption (paste-ready) / First comment / Story action (+ highlight).
6. Suds and Science topic bank for the following month

Production: generated with reportlab via `build_august_2026_plan.py` in this
directory (copy + adapt per month). In the cloud container, weasyprint and
pdfplumber/pypdf break on a bad cffi/cryptography install — use reportlab to
write and pypdfium2 to read/render. No emoji glyphs in PDF text (Helvetica).

## August 2026 inventory (don't repeat next month)

- B/A Reels: grout/tile/tub ("Grout Comeback"), kitchen 22-step, upholstery +
  HEPA, hard water vs. shower glass, whole-home September Reset.
- Maid Simple: #1 stainless steel microfiber, #2 clean in sections,
  #3 why microfiber lifts instead of smears, #4 dwell time (VO).
- Suds and Science: #1 bleach + vinegar → chlorine gas (VO), #2 vinegar vs.
  natural stone (etching).
- Testimonial: Jeff E. ("Like always, they exceed every expectation.").
- Voiceover slots used: Aug 7 and Aug 26.
- Historical note: the old "Yohanna vs. hardwater" shower footage was never
  used — don't reference it.

## Topic bank + September seeds

Remaining Suds and Science bank: bleach + ammonia glass cleaner → chloramine
fumes (natural "part 3"); baking soda + vinegar mostly neutralize (myth-bust);
why dish soap cuts grease (surfactants); why hot water cleans faster.

September planning inputs to collect from August: answers to the Aug 26
"What should Maid Simple cover next?" question sticker, the Aug 6/13 Q+A round,
and Friday story poll results. Also confirm with the client whether Labor Day
(Mon Sep 7, 2026) gets a post or a rest day before building September.
