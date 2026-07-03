# QA package

Companion to [`../QA_REPORT.md`](../QA_REPORT.md) — deep functional QA of UX and interaction flows, run 2026-07-03 on branch `claude/app-ux-qa-x5shqm`.

- **`harness/`** — Playwright driver (`lib.cjs`) + 10 phase scripts that drive the real app on Expo web: boot, full onboarding (with validation probes), weekly drop interactions, match/wildcard detail, likes/paywall/free-like limit, tier switch, chat, settings/debug panel, persistence-across-restart, pre-onboarding route guards, the P0 crash repro, analytics coverage aggregation, and an empty-env boot. Run instructions are in the report §6. Scripts write `results-*.json`, `shots/*.png`, and `console.jsonl` next to themselves (gitignored).
- **`evidence/`** — curated screenshots referenced by findings (e.g. `32-P0-stuck-review.png` is the onboarding dead end).
- **`artifacts/`** — raw check results per phase, session analytics coverage (`analytics-coverage.json`, 28/30 required events), measured sub-44px tap targets, and the drop ground truth used for state assertions.

The harness needs no project dependencies beyond a dev server: global `playwright` + `npm i --no-save react-native-web react-dom @expo/metro-runtime` for the web target. It never touches `package.json`.
