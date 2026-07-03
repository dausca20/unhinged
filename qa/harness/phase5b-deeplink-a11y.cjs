/* Phase 5b (needs completed onboarding from phase2):
 * A) cold-start deep link to match detail → analytics drop probe
 * B) like/skip from detail (8.4), opener Use, paywall Unlock (simulated purchase)
 * C) tap-target sweep, reduced-motion reveal timing */
const fs = require('fs');
const path = require('path');
const { launch, goto, shot, Results, seen, tapText, tapLabel, ph, settle, storageSnapshot } = require('./lib.cjs');
const pageText = (page) => page.evaluate(() => document.body.innerText);
const dropOf = (snap) => JSON.parse(snap['unhinged.weeklyDrop']).state;

(async () => {
  const r = new Results('phase5b');

  // ---------- A) COLD-START DEEP LINK ----------
  let ctx1 = await launch({ fresh: false });
  {
    const { ctx, page, consoleBuf } = ctx1;
    // read drop ground truth first (about:blank → need one page load; use likes tab, then真 cold nav isn't possible in same session — so: read storage via a throwaway load, close, relaunch)
    await goto(page, '/tabs/likes');
    await settle(page, 2000);
    const snap = await storageSnapshot(page);
    const ds = dropOf(snap);
    const target = ds.drop.curated.find((c) => !(ds.interactions[c.profile.id] || {}).viewed) || ds.drop.curated[0];
    fs.writeFileSync(path.join(__dirname, 'deeplink-target.json'), JSON.stringify({ id: target.profile.id, name: target.profile.firstName }));
    await ctx.close();
  }
  const targetInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'deeplink-target.json'), 'utf8'));
  {
    const { ctx, page, consoleBuf } = await launch({ fresh: false });
    await goto(page, `/match/${targetInfo.id}`); // FIRST navigation = deep link (cold start)
    await settle(page, 3500);
    const t = await pageText(page);
    const rendered = t.includes(targetInfo.name) && /Why you might match/i.test(t);
    r.check('deeplink-render', `cold deep link to /match/${targetInfo.id} renders content`, rendered, t.slice(0, 120).replace(/\n/g, ' | '));
    const evFired = consoleBuf.some((c) => c.text.includes('match_explanation_viewed'));
    r.check('BUG-deeplink-analytics', 'match_explanation_viewed fires on cold deep link (FAIL = events dropped pre-hydration)', evFired, `fired=${evFired}`);
    const snap2 = await storageSnapshot(page);
    const viewed = (dropOf(snap2).interactions[targetInfo.id] || {}).viewed === true;
    r.check('BUG-deeplink-viewed', 'markViewed recorded on cold deep link (FAIL = viewed state dropped)', viewed, `viewed=${viewed}`);
    await shot(page, '33-cold-deeplink');
    await ctx.close();
  }

  // ---------- B) DETAIL ACTIONS + PURCHASE CTA ----------
  {
    const { ctx, page, consoleBuf } = await launch({ fresh: false });
    await goto(page, '/');
    await settle(page, 2200);
    if (await seen(page, 'Reveal this week', 3000)) {
      await tapText(page, 'Reveal this week');
      await settle(page, 1000);
    }
    const snap = await storageSnapshot(page);
    const ds = dropOf(snap);
    const fresh2 = ds.drop.curated.filter((c) => {
      const i = ds.interactions[c.profile.id] || {};
      return !i.viewed && !i.skipped && !i.liked;
    });
    // skip-from-detail
    const skipTarget = fresh2[0];
    await tapLabel(page, `View ${skipTarget.profile.firstName}`);
    await settle(page, 900);
    await tapText(page, 'Not my delulu');
    await settle(page, 1000);
    const backAtDrop = await seen(page, 'This week', 4000);
    const snapS = await storageSnapshot(page);
    const skippedOk = (dropOf(snapS).interactions[skipTarget.profile.id] || {}).skipped === true;
    r.check('8.4a', 'skip from detail routes back + records skipped', backAtDrop && skippedOk, `back=${backAtDrop} skipped=${skippedOk}`);

    // like-from-detail + opener Use
    const likeTarget = fresh2[1];
    await tapLabel(page, `View ${likeTarget.profile.firstName}`);
    await settle(page, 900);
    await tapText(page, 'Use opener');
    await settle(page, 500);
    const openerUsed = consoleBuf.some((c) => c.text.includes('suggested_opener_used'));
    r.check('8.5b', 'Use opener on detail fires suggested_opener_used', openerUsed);
    const afterUseText = await pageText(page);
    fs.writeFileSync(path.join(__dirname, 'opener-use-detail.txt'), afterUseText.slice(0, 600));
    await tapText(page, 'Like this delulu');
    await settle(page, 1000);
    const snapL = await storageSnapshot(page);
    const likedOk = (dropOf(snapL).interactions[likeTarget.profile.id] || {}).liked === true;
    r.check('8.4b', 'like from detail routes back + records liked', (await seen(page, 'This week', 4000)) && likedOk, `liked=${likedOk}`);

    // paywall Unlock (simulated purchase 16.5/18.5.2)
    await goto(page, '/tabs/likes');
    await settle(page, 1200);
    if (await seen(page, 'See who likes your delulu', 3000)) {
      await tapText(page, 'See who likes your delulu');
      await settle(page, 900);
      const ctaBefore = consoleBuf.filter((c) => c.text.includes('paywall_cta_tapped')).length;
      await tapText(page, 'Unlock');
      await settle(page, 1200);
      const ctaFired = consoleBuf.filter((c) => c.text.includes('paywall_cta_tapped')).length > ctaBefore;
      const snapU = await storageSnapshot(page);
      const tierNow = JSON.parse(snapU['unhinged.auth']).state.subscriptionTier;
      r.check('18.5.2a', 'Unlock fires paywall_cta_tapped + simulated tier upgrade', ctaFired && tierNow !== 'free', `ctaFired=${ctaFired} tier=${tierNow}`);
      await shot(page, '34-after-unlock');
    } else {
      r.check('18.5.2a', 'paywall CTA reachable from likes', false, 'CTA not found (already paid?)');
    }

    // ---------- C) tap-target sweep on drop ----------
    await goto(page, '/tabs/weekly-drop');
    await settle(page, 1500);
    const small = await page.evaluate(() => {
      const out = [];
      const els = document.querySelectorAll('[role="button"],[role="switch"],[role="tab"],button,input');
      for (const el of els) {
        const r0 = el.getBoundingClientRect();
        if (r0.width === 0 || r0.height === 0) continue; // hidden
        const style = getComputedStyle(el);
        if (style.visibility === 'hidden' || style.display === 'none') continue;
        if (r0.width < 44 || r0.height < 44) {
          const label = el.getAttribute('aria-label') || (el.innerText || '').slice(0, 30);
          out.push({ label: label.trim().slice(0, 40), w: Math.round(r0.width), h: Math.round(r0.height) });
        }
      }
      return out.slice(0, 40);
    });
    const distinct = [...new Map(small.map((s) => [s.label, s])).values()];
    r.check('18.2.1', 'tap targets ≥44px on drop screen (FAIL lists offenders; hitSlop not in DOM boxes)', distinct.length === 0, JSON.stringify(distinct.slice(0, 12)));
    fs.writeFileSync(path.join(__dirname, 'small-targets-drop.json'), JSON.stringify(small, null, 2));

    // chat screen sweep
    await goto(page, '/tabs/matches');
    await settle(page, 1200);
    const anyChat = page.getByLabel(/Open chat with/).filter({ visible: true }).first();
    await anyChat.click();
    await settle(page, 1000);
    const smallChat = await page.evaluate(() => {
      const out = [];
      const els = document.querySelectorAll('[role="button"],[role="switch"],button,input,textarea');
      for (const el of els) {
        const r0 = el.getBoundingClientRect();
        if (r0.width === 0 || r0.height === 0) continue;
        if (r0.width < 44 || r0.height < 44) {
          const label = el.getAttribute('aria-label') || (el.innerText || '').slice(0, 30);
          out.push({ label: label.trim().slice(0, 40), w: Math.round(r0.width), h: Math.round(r0.height) });
        }
      }
      return out.slice(0, 40);
    });
    fs.writeFileSync(path.join(__dirname, 'small-targets-chat.json'), JSON.stringify(smallChat, null, 2));
    r.check('18.2.1b', 'chat tap targets ≥44px (informational)', smallChat.length === 0, JSON.stringify(smallChat.slice(0, 8)));
    await ctx.close();
  }

  // ---------- reduced-motion reveal timing ----------
  {
    const { ctx, page } = await launch({ fresh: false, reducedMotion: 'reduce' });
    await goto(page, '/onboarding/profile-card');
    const t0 = Date.now();
    let ms = -1;
    for (let i = 0; i < 30; i++) {
      if (await seen(page, 'Roast me again', 400)) {
        ms = Date.now() - t0;
        break;
      }
    }
    r.check('18.2.3', `reduced motion: reveal short-circuits (took ${ms}ms, full reveal ≈2600ms)`, ms > 0 && ms < 2200, `ms=${ms}`);
    await shot(page, '35-reduced-motion-card');
    await ctx.close();
  }

  r.save();
})().catch((e) => {
  console.error('PHASE5B CRASH', e);
  process.exit(1);
});
