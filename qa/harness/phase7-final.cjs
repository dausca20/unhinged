/* Phase 7: Unlock CTA via role=button; delulu_profile_edited probe;
 * aggregate analytics event coverage vs the DoR §15.2 required list. */
const fs = require('fs');
const path = require('path');
const { launch, goto, shot, Results, seen, tapText, settle, storageSnapshot } = require('./lib.cjs');

const REQUIRED_EVENTS = [
  'onboarding_started', 'onboarding_step_viewed', 'profile_basics_completed', 'preference_selected',
  'interview_question_viewed', 'interview_question_answered', 'delulu_profile_generated', 'delulu_profile_edited',
  'onboarding_completed', 'weekly_drop_viewed', 'match_card_impression', 'match_card_expanded',
  'match_explanation_viewed', 'compatibility_breakdown_viewed', 'match_liked', 'match_skipped', 'match_saved',
  'wildcard_impression', 'wildcard_expanded', 'wildcard_liked', 'wildcard_skipped',
  'suggested_opener_viewed', 'suggested_opener_used', 'message_sent_mock', 'chat_opened',
  'paywall_viewed', 'paywall_cta_tapped', 'paywall_dismissed',
  'match_feedback_submitted', 'drop_feedback_submitted',
];

(async () => {
  const r = new Results('phase7');
  const { ctx, page, consoleBuf } = await launch({ fresh: false });
  await goto(page, '/');
  await settle(page, 2200);
  if (await seen(page, 'Reveal this week', 2500)) { await tapText(page, 'Reveal this week'); await settle(page, 800); }

  // delulu_profile_edited probe: flip a visibility toggle on profile tab
  await goto(page, '/tabs/profile');
  await settle(page, 1400);
  const sw = page.getByRole('switch').filter({ visible: true });
  if ((await sw.count()) > 0) {
    await sw.nth(1).click();
    await settle(page, 500);
  }

  // wildcard skip (wildcard_skipped coverage) — only if wildcard still fresh
  await goto(page, '/tabs/weekly-drop');
  await settle(page, 1200);
  try {
    await page.getByLabel('Skip wildcard').filter({ visible: true }).first().click({ timeout: 3000 });
    await settle(page, 500);
  } catch {}

  // Unlock via role=button
  await goto(page, '/tabs/likes');
  await settle(page, 1200);
  if (await seen(page, 'See who likes your delulu', 3000)) {
    await tapText(page, 'See who likes your delulu');
    await settle(page, 900);
    await page.getByRole('button', { name: 'Unlock', exact: true }).filter({ visible: true }).first().click();
    await settle(page, 1200);
    const snapU = await storageSnapshot(page);
    const tierNow = JSON.parse(snapU['unhinged.auth']).state.subscriptionTier;
    const ctaFired = consoleBuf.some((c) => c.text.includes('paywall_cta_tapped'));
    r.check('18.5.2a', 'Unlock (role=button) → paywall_cta_tapped + simulated tier=plus + dismiss', ctaFired && tierNow === 'plus', `ctaFired=${ctaFired} tier=${tierNow}`);
  } else {
    r.check('18.5.2a', 'paywall unlock probe', false, 'CTA not found — tier may already be paid');
  }

  // aggregate event names: persisted analytics store + full console history
  const snap = await storageSnapshot(page);
  const events = JSON.parse(snap['unhinged.analytics']).state.events || [];
  const namesFromStore = new Set(events.map((e) => e.name));
  const consoleAll = fs.readFileSync(path.join(__dirname, 'console.jsonl'), 'utf8')
    .split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  for (const c of consoleAll) {
    const m = c.text.match(/\[analytics\] ([a-z_]+)/);
    if (m) namesFromStore.add(m[1]);
  }
  const missing = REQUIRED_EVENTS.filter((e) => !namesFromStore.has(e));
  const extra = [...namesFromStore].filter((e) => !REQUIRED_EVENTS.includes(e));
  fs.writeFileSync(path.join(__dirname, 'analytics-coverage.json'), JSON.stringify({ seen: [...namesFromStore].sort(), missing, extra }, null, 2));
  r.check('15.2', `all 30 required events observed across full QA session (missing: ${missing.join(', ') || 'none'})`, missing.length === 0, `seen=${namesFromStore.size} missing=${missing.length}`);

  r.save();
  await ctx.close();
})().catch((e) => {
  console.error('PHASE7 CRASH', e);
  process.exit(1);
});
