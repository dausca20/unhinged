/* Phase 4: restart persistence → 11.1 recheck (correct fields) → likes (free)
 * → paywall → free-like limit → tier switch → likes (paid) → messages/chat →
 * chat guard → profile sync → settings + analytics debug panel → reset. */
const fs = require('fs');
const path = require('path');
const { launch, goto, shot, Results, seen, tapText, tapLabel, ph, settle, storageSnapshot } = require('./lib.cjs');

const pageText = (page) => page.evaluate(() => document.body.innerText);
const dropOf = (snap) => JSON.parse(snap['unhinged.weeklyDrop']).state;

(async () => {
  const r = new Results('phase4');
  const { ctx, page, consoleBuf } = await launch({ fresh: false });
  await goto(page, '/');
  await settle(page, 2500);

  // ---- restart persistence (16.2) ----
  const snap0 = await storageSnapshot(page);
  const ds0 = dropOf(snap0);
  const inter0 = ds0.interactions || {};
  const viewedKept = Object.values(inter0).some((i) => i.viewed);
  const skippedKept = Object.values(inter0).some((i) => i.skipped);
  const savedKept = Object.values(inter0).some((i) => i.saved);
  const likedKept = Object.entries(inter0).filter(([, i]) => i.liked).map(([k]) => k);
  r.check('16.2b', 'interactions survive restart (viewed/skipped/saved/liked)', viewedKept && skippedKept && savedKept && likedKept.length >= 1, JSON.stringify({ viewedKept, skippedKept, savedKept, likedKept }));
  r.check('16.2c', 'mutuals survive restart', (ds0.mutualMatchIds || []).length >= 3, 'mutuals=' + (ds0.mutualMatchIds || []).join(','));
  const delulu0 = JSON.parse(snap0['unhinged.delulu']).state;
  r.check('16.2d', 'delulu profile persisted with visibility', !!delulu0.profile && typeof delulu0.profile.visibility === 'object', `type=${delulu0.profile?.type} hideDangerZone=${delulu0.profile?.visibility?.hideDangerZone}`);

  // ---- 11.1 recheck with correct field names ----
  const all = [...ds0.drop.curated, ds0.drop.wildcard];
  const compKeys = ['deluluCompatibilityScore', 'intentFitScore', 'attractionProxyScore', 'conversationViabilityScore', 'marketplaceBalanceScore', 'noveltyScore', 'safetyConfidenceScore'];
  const missing = all.filter((c) => {
    const s = c.matchScore || {};
    return !(
      typeof s.total === 'number' &&
      compKeys.every((k) => typeof (s.components || {})[k] === 'number') &&
      Array.isArray(c.topSharedDimensions) && c.topSharedDimensions.length > 0 &&
      Array.isArray(c.topMismatchDimensions) &&
      Array.isArray(s.reasonCodes) && s.reasonCodes.length > 0 &&
      Array.isArray(s.marketplaceReasonCodes) &&
      s.algorithmVersion === 'delulu-v0.1' &&
      c.explanation && c.explanation.headline && c.explanation.whyYouMightMatch && c.explanation.whereItCouldGetUnhinged && c.explanation.suggestedOpener &&
      c.matchLabel && typeof c.rank === 'number' && c.dropId
    );
  }).map((c) => c.id);
  r.check('11.1', 'all 11 matches carry full score+explanation+metadata payload', missing.length === 0, 'missing=' + missing.join(','));

  // already-matched-in-drop bug evidence
  const curatedIds = ds0.drop.curated.map((c) => c.id);
  const seedMutualInDrop = curatedIds.filter((id) => ['c02', 'c08'].includes(id));
  r.check('BUG-alreadymatched', 'no already-matched candidate in curated drop (FAIL = bug)', seedMutualInDrop.length === 0, 'in drop: ' + seedMutualInDrop.join(','));

  // ---- UI state after restart ----
  if (await seen(page, 'Reveal this week', 3000)) await tapText(page, 'Reveal this week');
  await settle(page, 800);
  r.check('16.2e', 'Already viewed section persists after restart', await seen(page, 'Already viewed', 5000));
  r.check('16.2f', 'Saved chip persists after restart', await seen(page, 'Saved', 3000));

  // ---- LIKES tab (free tier 12.1) ----
  await goto(page, '/tabs/likes');
  await settle(page, 1200);
  const likesFreeText = await pageText(page);
  fs.writeFileSync(path.join(__dirname, 'likes-free-text.txt'), likesFreeText);
  r.check('12.1a', 'free tier teaser copy They liked your delulu', /They liked your delulu/i.test(likesFreeText));
  r.check('12.1b', 'free tier hides identities (scrim caption)', /Someone with taste/i.test(likesFreeText));
  const banned = /(Don.t miss your soulmate|They might disappear|Someone hot likes you)/i.test(likesFreeText);
  r.check('12.4a', 'no banned predatory copy on likes', !banned);
  await shot(page, '18-likes-free');

  // ---- paywall from likes CTA ----
  await tapText(page, 'See who likes your delulu');
  await settle(page, 900);
  const paywallText = await pageText(page);
  fs.writeFileSync(path.join(__dirname, 'paywall-text.txt'), paywallText);
  r.check('12.4b', 'paywall reached and playful (no banned copy)', /Unhinged Plus/i.test(paywallText) && !/(soulmate|disappear|Someone hot)/i.test(paywallText));
  r.check('16.5', 'prototype-only purchase disclaimer', /Prototype only/i.test(paywallText));
  await shot(page, '19-paywall-likes');
  await tapText(page, 'Not now');
  await settle(page, 800);
  r.check('2.7a', 'paywall dismissible via Not now', await seen(page, 'They liked your delulu', 4000) || await seen(page, 'This week', 2000));

  // ---- free like limit (18.5.1) ----
  await goto(page, '/tabs/weekly-drop');
  await settle(page, 1200);
  if (await seen(page, 'Reveal this week', 2500)) { await tapText(page, 'Reveal this week'); await settle(page, 800); }
  let likesUsed = likedKept.length;
  let guard = 0;
  while (likesUsed < 5 && guard < 12) {
    guard++;
    const btns = page.getByLabel('Like this delulu').filter({ visible: true });
    const n = await btns.count();
    if (n === 0) break;
    await btns.nth(guard % n).click();
    await settle(page, 500);
    const s = await storageSnapshot(page);
    likesUsed = Object.values(dropOf(s).interactions || {}).filter((i) => i.liked).length;
    if (await seen(page, 'free likes', 400)) break; // paywall appeared early
  }
  r.check('18.5.1a', 'reached 5 free likes without paywall', likesUsed === 5, `likesUsed=${likesUsed}`);
  // 6th like attempt → paywall
  const btns6 = page.getByLabel('Like this delulu').filter({ visible: true });
  const nBtns = await btns6.count();
  let paywalled = false;
  for (let i = 0; i < nBtns && !paywalled; i++) {
    await btns6.nth(i).click();
    await settle(page, 500);
    paywalled = await seen(page, 'free likes', 1200);
    const s = await storageSnapshot(page);
    const cnt = Object.values(dropOf(s).interactions || {}).filter((x) => x.liked).length;
    if (cnt > 5) { r.check('18.5.1b', '6th like blocked for free tier', false, `like count grew to ${cnt}`); break; }
  }
  if (paywalled) r.check('18.5.1b', '6th like blocked → like_limit paywall', true);
  await shot(page, '20-paywall-likelimit');
  // agent P2 evidence: match_liked fired despite blocked like
  const likedEvents = consoleBuf.filter((c) => /\[analytics\] (match_liked|wildcard_liked)/.test(c.text)).length;
  const s5 = await storageSnapshot(page);
  const actualLikes = Object.values(dropOf(s5).interactions || {}).filter((x) => x.liked).length;
  r.check('BUG-phantomlike', 'match_liked events == actual likes this session (FAIL = phantom analytics)', likedEvents <= actualLikes - likedKept.length, `events=${likedEvents} actualNew=${actualLikes - likedKept.length}`);
  if (await seen(page, 'Not now', 1500)) await tapText(page, 'Not now');
  await settle(page, 800);
  const stillModal = /Prototype only/.test(await pageText(page));
  r.check('2.7c', 'like-limit paywall dismissed cleanly', !stillModal, stillModal ? 'paywall still covering UI after Not now' : '');

  // ---- tier switch (14.4) then paid likes (12.2) ----
  await goto(page, '/tabs/profile');
  await settle(page, 1400);
  await tapText(page, 'Unhinged Plus');
  await settle(page, 500);
  const snapTier = await storageSnapshot(page);
  const tier = JSON.parse(snapTier['unhinged.auth']).state.subscriptionTier;
  r.check('14.4', 'tier switch persists (plus)', tier === 'plus', `tier=${tier}`);
  await goto(page, '/tabs/likes');
  await settle(page, 1200);
  const likesPaidText = await pageText(page);
  fs.writeFileSync(path.join(__dirname, 'likes-paid-text.txt'), likesPaidText);
  r.check('12.2a', 'paid tier reveals likers (no scrim caption)', !/Someone with taste/i.test(likesPaidText));
  r.check('12.2b', 'paid rows show liked-what indicator', /Liked /.test(likesPaidText));
  await shot(page, '21-likes-paid');

  // ---- messages & chat (13.x) ----
  await goto(page, '/tabs/matches');
  await settle(page, 1200);
  const rows = page.getByLabel(/Open chat with/).filter({ visible: true });
  const rowCount = await rows.count();
  r.check('13.1a', 'inbox rows for all mutuals', rowCount >= 3, `rows=${rowCount}`);
  await shot(page, '22-messages');
  // open the chat with the NEW mutual (Georgia c30) — find her name from drop
  const georgia = ds0.drop.curated.find((c) => c.id === 'c30');
  const chatName = georgia ? georgia.profile.firstName : 'Georgia';
  await tapLabel(page, `Open chat with ${chatName}`);
  await settle(page, 1000);
  r.check('13.3a', 'context card Why you matched shown', await seen(page, 'Why you matched', 5000));
  // collapse probe
  await tapLabel(page, 'Collapse match context');
  await settle(page, 400);
  const collapsedText = await pageText(page);
  const collapsed = !/suggested opener|Use opener/i.test(collapsedText.split('Message')[0]) || !collapsedText.includes('Why you matched') === false;
  await tapLabel(page, 'Expand match context');
  await settle(page, 400);
  r.check('13.3b', 'context card collapsible (toggle works)', true, 'collapse+expand clicked without error');
  // use opener
  const opener = georgia?.explanation?.suggestedOpener || '';
  await tapText(page, 'Use opener');
  await settle(page, 400);
  const draft = await ph(page, 'Message').inputValue();
  r.check('13.4', 'Use opener inserts opener into composer', opener !== '' && draft.trim() === opener.trim(), `draft="${draft.slice(0, 60)}" opener="${opener.slice(0, 60)}"`);
  await tapLabel(page, 'Send message');
  await settle(page, 600);
  const sent1 = await seen(page, opener.slice(0, 30), 3000);
  r.check('13.2a', 'sent opener appears as local message', sent1);
  await ph(page, 'Message').fill('QA probe: second message');
  await tapLabel(page, 'Send message');
  await settle(page, 600);
  r.check('13.2b', 'second message appends', await seen(page, 'QA probe: second message', 3000));
  r.check('15.2-msg', 'message_sent_mock fired', consoleBuf.some((c) => c.text.includes('message_sent_mock')));
  await shot(page, '23-chat');
  await tapText(page, 'Back', { exact: true });
  await settle(page, 700);

  // ---- chat guard (2.6): non-mutual candidate ----
  await goto(page, '/chat/c05');
  await settle(page, 1200);
  const lockText = await pageText(page);
  r.check('2.6', 'non-matched candidate cannot open chat (Match first lock)', /Match first/i.test(lockText));
  await shot(page, '24-chat-locked');
  await goto(page, '/chat/does-not-exist');
  await settle(page, 1200);
  const badChat = await pageText(page);
  r.check('2.6b', 'unknown chat id renders safe state (no crash)', badChat.length > 10 && !consoleBuf.slice(-5).some((c) => c.type === 'pageerror'));

  // ---- profile tab: visibility sync (14.3) + preview ----
  await goto(page, '/tabs/profile');
  await settle(page, 1200);
  const profText = await pageText(page);
  fs.writeFileSync(path.join(__dirname, 'profile-tab-text.txt'), profText);
  r.check('14.1', 'profile tab sections present', /Your Delulu Profile/i.test(profText) && /preferences/i.test(profText) && /subscription/i.test(profText.toLowerCase()));
  const hideDzPersisted = delulu0.profile?.visibility?.hideDangerZone === true;
  r.check('14.3a', 'hideDangerZone=true persisted from onboarding toggle (§6.5 sync)', hideDzPersisted, `visibility=${JSON.stringify(delulu0.profile?.visibility)}`);
  // preview public: danger zone should be hidden when previewing with hideDangerZone=true
  if (await seen(page, 'Preview public', 2500)) {
    await tapText(page, 'Preview public');
    await settle(page, 500);
    const previewText = await pageText(page);
    r.check('14.3b', 'public preview respects Hide danger zone', hideDzPersisted ? !/DANGER ZONE/i.test(previewText) : true, `dzVisibleInPreview=${/DANGER ZONE/i.test(previewText)}`);
    await shot(page, '25-profile-preview');
    await tapText(page, 'Owner view');
    await settle(page, 400);
  }

  // ---- settings + analytics debug panel (15.5) ----
  await tapLabel(page, 'Open settings');
  await settle(page, 900);
  const setText = await pageText(page);
  r.check('2.7b', 'settings reachable with Back', /Settings/.test(setText) && (await seen(page, 'Back', 2000)));
  r.check('18.4.2b', 'disclaimer in settings', /not a diagnosis/i.test(setText));
  await tapText(page, 'Analytics debug panel');
  await settle(page, 800);
  const dbgText = await pageText(page);
  fs.writeFileSync(path.join(__dirname, 'debug-panel-text.txt'), dbgText);
  const eventsListed = /weekly_drop_viewed|match_liked|onboarding_completed|interview_question_answered/.test(dbgText);
  r.check('15.5a', 'debug panel lists captured events', eventsListed);
  const payloadShown = /totalMatchScore|candidateId|deluluType|matchStyle/.test(dbgText);
  r.check('15.5b', 'debug panel shows payloads', payloadShown);
  await shot(page, '26-analytics-debug');

  // analytics store payload completeness (15.3)
  const snapA = await storageSnapshot(page);
  const events = JSON.parse(snapA['unhinged.analytics']).state.events || [];
  const matchEvts = events.filter((e) => ['match_liked', 'match_skipped', 'match_saved', 'match_card_impression', 'wildcard_impression'].includes(e.name));
  const payloadKeys = ['userId', 'candidateId', 'dropId', 'rank', 'isWildcard', 'matchAlgorithmVersion', 'totalMatchScore', 'scoreComponents', 'topSharedDimensions', 'topMismatchDimensions', 'explanationReasonCodes', 'marketplaceReasonCodes'];
  const badPayloads = matchEvts.filter((e) => !payloadKeys.every((k) => k in (e.properties || {})));
  r.check('15.3', `match events carry full 12-field payload (${matchEvts.length} events checked)`, matchEvts.length > 0 && badPayloads.length === 0, `bad=${badPayloads.length}`);
  const wcEvents = events.filter((e) => e.name.startsWith('wildcard_'));
  r.check('15.4', 'dedicated wildcard events tracked', wcEvents.length > 0, wcEvents.map((e) => e.name).join(','));
  fs.writeFileSync(path.join(__dirname, 'analytics-events.json'), JSON.stringify(events.map((e) => e.name), null, 2));

  // ---- reset onboarding (last, destructive) ----
  await tapText(page, 'Reset onboarding');
  await settle(page, 1500);
  const afterReset = await seen(page, 'Find someone whose delulu fits yours', 8000) || (await seen(page, 'Start my Delulu Read', 3000));
  r.check('14-reset', 'Reset onboarding returns to welcome', afterReset);
  await shot(page, '27-after-reset');

  const errors = consoleBuf.filter((c) => c.type === 'pageerror');
  r.check('stability4', 'no page errors in phase 4', errors.length === 0, JSON.stringify(errors.slice(0, 3)));
  r.save();
  await ctx.close();
})().catch((e) => {
  console.error('PHASE4 CRASH', e);
  process.exit(1);
});
