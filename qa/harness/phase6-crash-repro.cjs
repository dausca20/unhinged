/* Phase 6: P0 repro — Woman seeking Men only → eligible pool ≤ 10 →
 * review completion throws → user stuck. Captures the user-visible dead end. */
const { launch, goto, shot, Results, seen, tapText, ph, settle } = require('./lib.cjs');
const pageText = (page) => page.evaluate(() => document.body.innerText);

(async () => {
  const r = new Results('phase6-crash');
  const { ctx, page, consoleBuf } = await launch({ fresh: true });
  await goto(page, '/');
  await page.getByText('Start my Delulu Read').first().waitFor({ state: 'visible', timeout: 90000 });
  await tapText(page, 'Start my Delulu Read');
  await settle(page, 800);

  // Basics — Woman seeking Men only
  await ph(page, 'Your name').fill('Ana');
  await ph(page, 'e.g. 1996-11-04').fill('1994-05-01');
  await ph(page, 'City').fill('Austin');
  await tapText(page, 'Woman', { exact: true });
  await tapText(page, 'Nonbinary people', { exact: true });
  await tapText(page, 'Something serious', { exact: true });
  await tapText(page, '10 mi', { exact: true });
  await tapText(page, 'Golden hour');
  await tapText(page, 'Candid');
  await tapText(page, 'Main', { exact: true });
  await tapText(page, 'My most harmless red flag is');
  await tapText(page, 'A normal thing I');
  await tapText(page, 'The fastest way to make me delulu is');
  await settle(page, 300);
  const tas = ph(page, 'Type your answer…');
  for (let i = 0; i < (await tas.count()); i++) await tas.nth(i).fill('Answer.');
  await tapText(page, 'Continue');
  await settle(page, 1000);

  // Preferences — defaults + match style
  await tapText(page, 'More slow burn');
  await tapText(page, 'Continue');
  await settle(page, 1200);

  // Interview — answer all 14 quickly (first option / slider default nudge / text)
  for (let q = 1; q <= 14; q++) {
    await settle(page, 350);
    const txt = await pageText(page);
    if ((await ph(page, 'Type your answer…').count()) > 0) {
      await ph(page, 'Type your answer…').first().fill('Something honest.');
    } else if (/How much backstory/.test(txt)) {
      // slider: click center of track
      const rect = await page.evaluate(() => {
        const divs = Array.from(document.querySelectorAll('div'));
        for (const d of divs) {
          const s = getComputedStyle(d);
          if (s.position === 'absolute' && Math.round(parseFloat(s.width)) === 24 && Math.round(parseFloat(s.height)) === 24 && s.borderWidth === '2px') {
            const p = d.parentElement.getBoundingClientRect();
            return { x: p.x, y: p.y, w: p.width, h: p.height };
          }
        }
        return null;
      });
      if (rect) await page.mouse.click(rect.x + rect.w * 0.5, rect.y + rect.h / 2);
    } else {
      // tap the first visible option chip (buttons that are not Next/back)
      const chips = page.getByRole('button').filter({ visible: true });
      const n = await chips.count();
      for (let i = 0; i < n; i++) {
        const label = (await chips.nth(i).getAttribute('aria-label')) || (await chips.nth(i).innerText().catch(() => ''));
        if (label && !/Next|Go back|See my Delulu/i.test(label)) {
          await chips.nth(i).click();
          break;
        }
      }
    }
    await settle(page, 250);
    if (q < 14) await tapText(page, 'Next', { exact: true });
    else await tapText(page, 'See my Delulu Profile');
  }

  // profile card → review
  await settle(page, 3500);
  await tapText(page, 'Looks right', { timeout: 15000 });
  await settle(page, 900);
  r.check('repro-review', 'reached review', await seen(page, 'One last look', 6000));

  // THE CRASH: build my drop
  const errsBefore = consoleBuf.filter((c) => c.type === 'pageerror').length;
  await tapText(page, 'build my drop');
  await settle(page, 2500);
  const errsAfter = consoleBuf.filter((c) => c.type === 'pageerror');
  const wildcardErr = errsAfter.some((c) => /no eligible candidate available for the wildcard slot/.test(c.text));
  const stuckOnReview = await seen(page, 'One last look', 3000);
  const reachedTabs = await seen(page, 'This week', 2000) || (await seen(page, 'Reveal this week', 1500));
  r.check('P0-crash', 'Woman→Men-only: review completion throws wildcard error', wildcardErr, errsAfter.map((c) => c.text.slice(0, 90)).join(' || '));
  r.check('P0-deadend', 'user stuck on review (cannot finish onboarding)', stuckOnReview && !reachedTabs, `stuck=${stuckOnReview} tabs=${reachedTabs}`);
  await shot(page, '32-P0-stuck-review');

  // does retry help? (it should not)
  if (stuckOnReview) {
    await tapText(page, 'build my drop').catch(() => {});
    await settle(page, 1500);
    r.check('P0-retry', 'retry also fails (hard dead end)', !(await seen(page, 'This week', 2500)));
  }
  r.save();
  await ctx.close();
})().catch((e) => {
  console.error('PHASE6 CRASH', e);
  process.exit(1);
});
