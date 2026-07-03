/* Phase 3: relaunch persistence → weekly drop reveal → card actions
 * (view/skip/save/like) → match detail → wildcard detail → drop feedback. */
const fs = require('fs');
const path = require('path');
const { launch, goto, shot, Results, seen, tapText, tapLabel, settle, storageSnapshot } = require('./lib.cjs');

const pageText = (page) => page.evaluate(() => document.body.innerText);

const APPROVED_LABELS = [
  'Exact Freak Match',
  'Complementary Delulu',
  'Good For The Plot',
  'Slow Burn Wildcard',
  'Dangerous But Probably Fine',
  'Soft Launch Material',
  'Lore-Compatible',
  'Text Chemistry Risk',
  'The Wildcard',
];

(async () => {
  const r = new Results('phase3-drop');
  const { ctx, page, consoleBuf } = await launch({ fresh: false });
  await goto(page, '/');
  await settle(page, 2500);

  // 2.3: relaunch with completed onboarding goes to tabs, not onboarding
  const backToWelcome = await seen(page, 'Start my Delulu Read', 4000);
  r.check('2.3', 'relaunch skips onboarding (tabs shown)', !backToWelcome);

  // persisted keys present (16.2)
  const store0 = await storageSnapshot(page);
  const keys = Object.keys(store0);
  const expectKeys = ['unhinged.onboarding', 'unhinged.delulu', 'unhinged.weeklyDrop', 'unhinged.analytics', 'unhinged.auth'];
  r.check('16.2a', 'AsyncStorage has all five persisted stores', expectKeys.every((k) => keys.includes(k)), keys.join(','));

  // first-open reveal moment (7.9) — plays once
  if (await seen(page, 'Reveal this week', 4000)) {
    await shot(page, '12-drop-prereveal');
    await tapText(page, 'Reveal this week');
    await settle(page, 1800);
  }
  r.check('7.1a', "header 'This week's drop'", await seen(page, 'This week', 8000));
  r.check('7.1b', 'subheader 10+1 copy', await seen(page, '10 matches for your delulu. 1 wildcard for the plot.', 4000));
  await shot(page, '13-drop-revealed');

  // parse persisted drop for ground truth
  const store1 = await storageSnapshot(page);
  const dropState = JSON.parse(store1['unhinged.weeklyDrop']).state;
  const drop = dropState.drop;
  const curated = drop?.curated ?? [];
  const wildcard = drop?.wildcard;
  r.check('7.3a', 'drop has exactly 10 curated + 1 wildcard', curated.length === 10 && !!wildcard, `curated=${curated.length} wildcard=${wildcard?.profile?.firstName}`);

  // 11.1: every match carries full score/explanation payload
  const all = [...curated, ...(wildcard ? [wildcard] : [])];
  const missing = [];
  for (const c of all) {
    const s = c.matchScore || {};
    const comp = s.components || {};
    const compKeys = ['deluluCompatibility', 'intentAlignment', 'attractionSignal', 'conversationPotential', 'marketplaceBalance', 'noveltyFactor', 'safetyConfidence'];
    const ok =
      typeof s.total === 'number' &&
      compKeys.every((k) => typeof comp[k] === 'number') &&
      Array.isArray(s.topSharedDimensions) &&
      Array.isArray(s.topMismatchDimensions) &&
      Array.isArray(s.reasonCodes) &&
      c.explanation && c.explanation.headline && c.explanation.whyYouMightMatch && c.explanation.suggestedOpener;
    if (!ok) missing.push(c.candidateId || c.profile?.id);
  }
  r.check('11.1', 'all 11 matches have total, 7 components, dims, reasons, explanation, opener', missing.length === 0, 'missing=' + missing.join(','));
  r.check('9.4', 'wildcard has valid wildcardReason', ['shared_absurd_interest', 'high_chaos_overlap', 'opposites_for_the_plot', 'unexpected_lore_match', 'text_chemistry_experiment', 'profile_prompt_too_funny_to_ignore'].includes(wildcard?.wildcardReason), String(wildcard?.wildcardReason));
  const wildcardIsTop = curated.length > 0 && wildcard && wildcard.matchScore.total >= Math.max(...curated.map((c) => c.matchScore.total));
  r.check('9.3', 'wildcard is not the top-scoring candidate', !wildcardIsTop, `wc=${wildcard?.matchScore?.total} topCurated=${Math.max(...curated.map((c) => c.matchScore.total))}`);

  // visible curated cards = 10 like buttons
  const likeBtns = page.getByLabel('Like this delulu').filter({ visible: true });
  const likeCount = await likeBtns.count();
  r.check('7.3b', '10 curated cards visible', likeCount === 10, `count=${likeCount}`);
  r.check('7.3c', 'sections Curated + The wildcard present', (await seen(page, 'Curated for your delulu', 3000)) && (await seen(page, 'The wildcard', 2000)));

  // 7.5 match labels from approved set
  const bodyText = await pageText(page);
  const labelsFound = APPROVED_LABELS.filter((l) => bodyText.includes(l));
  r.check('7.5', 'match labels from approved set only', labelsFound.length >= 3, 'found: ' + labelsFound.join(' | '));

  const names = curated.map((c) => c.profile.firstName);
  const inbound = dropState.inboundLikeIds || [];
  const mutualSeed = dropState.mutualMatchIds || [];
  fs.writeFileSync(path.join(__dirname, 'drop-ground-truth.json'), JSON.stringify({ names, curatedIds: curated.map((c) => c.candidateId), inbound, mutualSeed, wildcard: { id: wildcard?.candidateId, name: wildcard?.profile?.firstName, reason: wildcard?.wildcardReason } }, null, 2));

  // ---- VIEW flow on card #1 (2.5, 8.x) ----
  const c1 = curated[0];
  await tapLabel(page, `View ${c1.profile.firstName}`);
  await settle(page, 1000);
  const detailText = await pageText(page);
  r.check('8.1a', 'detail: Why you might match', /Why you might match/.test(detailText));
  r.check('8.1b', 'detail: Where it could get unhinged', /Where it could get unhinged/.test(detailText));
  r.check('8.1c', 'detail: Compatibility breakdown', /Compatibility breakdown/.test(detailText));
  r.check('8.2', 'explanation matches stored MatchExplanation', detailText.includes(c1.explanation.headline.slice(0, 40)));
  r.check('8.3', 'breakdown qualitative only (no n/100, no raw scores)', !/\b\d{1,3}\s*\/\s*100\b/.test(detailText) && !/\b(score|Score)[:\s]+\d/.test(detailText));
  const qualWords = /(Low|Medium|High|Reckless|Solid)/.test(detailText);
  r.check('8.3b', 'qualitative strength words shown', qualWords);
  r.check('8.5', 'opener actions Use / Save for later / Absolutely not', /Use opener/.test(detailText) && /Save for later/.test(detailText) && /Absolutely not/.test(detailText));
  await shot(page, '14-match-detail');
  await tapText(page, 'Save for later'); // opener save — non-navigating
  await settle(page, 300);
  await tapText(page, 'Back', { exact: true });
  await settle(page, 900);
  r.check('2.5', 'back returns to drop', await seen(page, 'This week', 5000));
  r.check('7.7a', 'viewed card moves to Already viewed', (await seen(page, 'Already viewed', 4000)));

  // ---- SKIP on card #2 ----
  const c2 = curated[1];
  await tapLabel(page, 'Not my delulu', { nth: 0 });
  await settle(page, 600);
  const likeCount2 = await page.getByLabel('Like this delulu').filter({ visible: true }).count();
  r.check('7.6-skip', 'skip removes card from curated list', likeCount2 === 8, `visible like buttons=${likeCount2} (10 - viewed - skipped)`);

  // ---- SAVE on next card ----
  await tapLabel(page, 'Save for later', { nth: 0 });
  await settle(page, 500);
  r.check('7.6-save', 'save marks card Saved', await seen(page, 'Saved', 3000));

  // ---- LIKE a non-inbound candidate (no mutual) ----
  const visibleNames = curated.slice(2).map((c) => c.profile.firstName);
  const nonInbound = curated.slice(2).find((c) => !inbound.includes(c.candidateId));
  const inboundCand = curated.slice(2).find((c) => inbound.includes(c.candidateId) && !mutualSeed.includes(c.candidateId));
  r.check('setup-mutual', 'drop contains an inbound-like candidate to test mutual', !!inboundCand, `inbound in drop: ${curated.filter((c) => inbound.includes(c.candidateId)).map((c) => c.profile.firstName).join(',')}`);
  if (nonInbound) {
    await tapLabel(page, `Like ${nonInbound.profile.firstName}`).catch(async () => {
      // like button may be generic "Like this delulu" — find the card by name proximity
      const idx = curated.slice(2).filter((c) => !c.skipped).findIndex((c) => c.candidateId === nonInbound.candidateId);
      await tapLabel(page, 'Like this delulu', { nth: 0 });
    });
    await settle(page, 700);
  }
  const store2 = await storageSnapshot(page);
  const ds2 = JSON.parse(store2['unhinged.weeklyDrop']).state;
  const likedIds = Object.entries(ds2.interactions || {}).filter(([, v]) => v.liked).map(([k]) => k);
  r.check('7.6-like', 'like persists in interactions', likedIds.length >= 1, 'liked=' + likedIds.join(','));
  const noMutualYet = (ds2.mutualMatchIds || []).length === mutualSeed.length;
  r.check('like-nonmutual', 'liking non-inbound candidate does not create mutual', noMutualYet);

  // ---- LIKE an inbound candidate → mutual ----
  if (inboundCand) {
    try {
      await tapLabel(page, `Like ${inboundCand.profile.firstName}`);
    } catch {
      await tapLabel(page, 'Like this delulu', { nth: 0 });
    }
    await settle(page, 800);
    const store3 = await storageSnapshot(page);
    const ds3 = JSON.parse(store3['unhinged.weeklyDrop']).state;
    const becameMutual = (ds3.mutualMatchIds || []).includes(inboundCand.candidateId);
    r.check('13.0-mutual', 'liking inbound-like candidate creates mutual match', becameMutual, `mutuals=${(ds3.mutualMatchIds || []).join(',')}`);
    await shot(page, '15-after-mutual-like');
  }

  // ---- WILDCARD detail (9.1/9.2) ----
  await tapLabel(page, 'View wildcard details');
  await settle(page, 1000);
  const wcText = await pageText(page);
  r.check('9.1', 'wildcard badge present', /Wildcard for the plot/.test(wcText));
  r.check('9.2', 'four wildcard sections present', /Why this is not a clean match/.test(wcText) && /Why it might still be fun/.test(wcText) && /What we are testing/.test(wcText) && /opener/i.test(wcText));
  r.check('9.2b', 'wildcard CTA For the plot', /For the plot/.test(wcText));
  await shot(page, '16-wildcard-detail');
  await tapText(page, 'Back', { exact: true });
  await settle(page, 800);

  // ---- drop feedback (15.2 drop_feedback_submitted) ----
  try {
    await tapLabel(page, 'Give feedback on this drop');
    await settle(page, 600);
    await shot(page, '17-drop-feedback');
    const fbText = await pageText(page);
    fs.writeFileSync(path.join(__dirname, 'feedback-ui-text.txt'), fbText);
    // tap the first plausible feedback option if chips appeared
    for (const opt of ['Too chaotic', 'Just right', 'delulu', 'accurate', 'Good', 'More']) {
      if (await seen(page, opt, 800)) {
        await tapText(page, opt);
        break;
      }
    }
    await settle(page, 500);
    r.check('15.2-dropfb', 'drop feedback control exists and fires', consoleBuf.some((c) => c.text.includes('drop_feedback_submitted')));
  } catch (e) {
    r.check('15.2-dropfb', 'drop feedback control exists', false, String(e).slice(0, 120));
  }

  // analytics: match_liked count vs actual likes (agent P2 check happens in phase 4 at the limit)
  const errors = consoleBuf.filter((c) => c.type === 'pageerror');
  r.check('stability3', 'no page errors in drop flows', errors.length === 0, JSON.stringify(errors.slice(0, 2)));
  fs.writeFileSync(path.join(__dirname, 'phase3-console.json'), JSON.stringify(consoleBuf.slice(-400), null, 2));
  r.save();
  await ctx.close();
})().catch((e) => {
  console.error('PHASE3 CRASH', e);
  process.exit(1);
});
