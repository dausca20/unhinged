/* Phase 2: full onboarding E2E — welcome → basics (validation probes) →
 * preferences (match-style gate) → 14-question interview (all 5 answer types,
 * back-revert probe) → profile card (reveal, actions, toggles) → review → tabs. */
const fs = require('fs');
const path = require('path');
const { launch, goto, shot, Results, seen, tapText, tapLabel, ph, settle } = require('./lib.cjs');

async function sliderTrackRect(page) {
  return page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    for (const d of divs) {
      const s = getComputedStyle(d);
      if (
        s.position === 'absolute' &&
        Math.round(parseFloat(s.width)) === 24 &&
        Math.round(parseFloat(s.height)) === 24 &&
        s.borderWidth === '2px'
      ) {
        const p = d.parentElement.getBoundingClientRect();
        return { x: p.x, y: p.y, w: p.width, h: p.height };
      }
    }
    return null;
  });
}

async function pageText(page) {
  return page.evaluate(() => document.body.innerText);
}

(async () => {
  const r = new Results('phase2-onboarding');
  const { ctx, page, consoleBuf } = await launch({ fresh: true });
  await goto(page, '/');
  await page.getByText('Start my Delulu Read').first().waitFor({ state: 'visible', timeout: 90000 });
  await tapText(page, 'Start my Delulu Read');
  await settle(page, 900);

  // ---------------- BASICS ----------------
  r.check('nav-basics', 'basics screen reached', await seen(page, 'The basics', 8000));
  await tapText(page, 'Continue');
  await settle(page, 500);
  const e1 = await seen(page, 'Add your first name.', 3000);
  const e2 = await seen(page, 'Pick how you identify.', 1500);
  const e3 = await seen(page, 'Choose at least 3 photos.', 1500);
  const e4 = await seen(page, 'Pick exactly 3 prompts.', 1500);
  r.check('3.2.2a', 'empty submit blocked with specific errors', e1 && e2 && e3 && e4, `name=${e1} gender=${e2} photos=${e3} prompts=${e4}`);
  await shot(page, '02-basics-errors');

  await ph(page, 'Your name').fill('Cate');
  await ph(page, 'e.g. 1996-11-04').fill('banana'); // invalid-birthday probe
  await ph(page, 'City').fill('Austin');
  await ph(page, 'State/Region').fill('TX');
  await tapText(page, 'Woman', { exact: true });
  await tapText(page, 'Everyone', { exact: true });
  await tapText(page, 'Something serious', { exact: true });
  await tapText(page, '25 mi', { exact: true });
  await tapText(page, 'Golden hour');
  await tapText(page, 'The bit', { exact: true });
  await tapText(page, 'Candid');
  await tapText(page, 'My most harmless red flag is');
  await tapText(page, 'A normal thing I');
  await tapText(page, 'The fastest way to make me delulu is');
  await settle(page, 300);
  const tas = ph(page, 'Type your answer…');
  const promptCount = await tas.count();
  r.check('3.3.2a', '3 prompt answer inputs appear', promptCount === 3, `count=${promptCount}`);
  for (let i = 0; i < promptCount; i++) {
    await tas.nth(i).fill(`Honest answer number ${i + 1}, committed to the bit.`);
  }
  await ph(page, 'One or two lines. Be honest, be a little unwell.').fill('Chaotic but house-trained.');
  await shot(page, '03-basics-filled');
  await tapText(page, 'Continue');
  await settle(page, 1000);
  const advancedWithBanana = await seen(page, 'Monogamy', 3000);
  r.check(
    'BUG-birthday',
    'birthday "banana" rejected (FAIL means accepted → silent age=29)',
    !advancedWithBanana,
    `advancedToPreferences=${advancedWithBanana}`
  );

  if (advancedWithBanana) {
    // go back and verify persistence (3.2.3), then fix birthday
    await tapLabel(page, 'Go back');
    await settle(page, 800);
    const nameVal = await ph(page, 'Your name').inputValue();
    const bdayVal = await ph(page, 'e.g. 1996-11-04').inputValue();
    r.check('3.2.3', 'basics values persist across back-nav', nameVal === 'Cate' && bdayVal === 'banana', `name=${nameVal} bday=${bdayVal}`);
    await ph(page, 'e.g. 1996-11-04').fill('1996-11-04');
    await tapText(page, 'Continue');
    await settle(page, 1000);
  }

  // ---------------- PREFERENCES ----------------
  r.check('nav-prefs', 'preferences screen reached', await seen(page, 'Monogamy', 8000));
  // match-style required gate
  await tapText(page, 'Continue');
  await settle(page, 400);
  r.check('3.4.1a', 'match style required before continue', await seen(page, 'Pick a match style', 2500));
  await tapText(page, 'Monogamous', { exact: true });
  // stepper clamp probe: raise Min 20 times (min 25 → should clamp at max 40)
  const incMin = page.getByLabel('Increase Min age').filter({ visible: true }).first();
  for (let i = 0; i < 20; i++) await incMin.click();
  await settle(page, 300);
  const prefText1 = await pageText(page);
  const minClamped = !/\b4[1-9]\b/.test(prefText1.split('Max distance')[0] || '');
  r.check('pref-clamp', 'min-age stepper clamps at max age', minClamped);
  // restore a sane range (25–40) so drop generation has a real pool
  const decMin = page.getByLabel('Decrease Min age').filter({ visible: true }).first();
  for (let i = 0; i < 15; i++) await decMin.click();
  await settle(page, 300);
  await tapText(page, 'Rude to servers');
  await tapText(page, 'Different life intent');
  await tapText(page, 'More chaotic spark');
  await shot(page, '04-preferences');
  await tapText(page, 'Continue');
  await settle(page, 1200);

  // ---------------- INTERVIEW ----------------
  r.check('4.4a', 'progress indicator 1/14 shown', await seen(page, 'Mapping your delulu 1/14', 8000));
  
  // Q1 q_delayed_text
  await tapText(page, 'character-development arc');
  await settle(page, 250);
  await tapText(page, 'Next', { exact: true });
  await settle(page, 400);
  // Q2 q_first_date
  r.check('4.4b', 'progress advances to 2/14', await seen(page, 'Mapping your delulu 2/14', 4000));
  await tapText(page, 'mildly irresponsible but legal');
  await settle(page, 250);
  await tapText(page, 'Next', { exact: true });
  await settle(page, 400);
  // Q3 q_the_ick — then BACK-REVERT probe
  r.check('q3', 'Q3 the-ick shown', await seen(page, 'give you the ick', 4000));
  await tapText(page, 'refuse to commit to the bit');
  await settle(page, 250);
  await tapLabel(page, 'Go back'); // back to Q2
  await settle(page, 400);
  r.check('4.6a', 'back returns to Q2 with progress 2/14', await seen(page, 'Mapping your delulu 2/14', 3000));
  await tapText(page, 'Dive bar and a fake backstory'); // change Q2 answer
  await settle(page, 250);
  await tapText(page, 'Next', { exact: true });
  await settle(page, 400);
  r.check('4.6b', 'forward returns to Q3', await seen(page, 'give you the ick', 3000));
  await tapText(page, 'Next', { exact: true }); // Q3 answer retained → Next enabled
  await settle(page, 500);

  // Q4 q_lore_slider
  r.check('4.2-slider', 'slider question rendered (4/14)', await seen(page, 'Mapping your delulu 4/14', 4000));
  const rect = await sliderTrackRect(page);
  r.check('slider-found', 'slider track located', !!rect, JSON.stringify(rect));
  if (rect) {
    await page.mouse.click(rect.x + rect.w * 0.8, rect.y + rect.h / 2);
    await settle(page, 400);
  }
  await shot(page, '05-interview-slider');
  await tapText(page, 'Next', { exact: true });
  await settle(page, 500);

  // Q5 q_profile_reaction_1
  const sampleShown = (await seen(page, 'Sam, 29', 4000)) || (await seen(page, 'pigeon', 2000));
  r.check('4.2-reaction', 'profile_reaction renders sample card', sampleShown);
  await tapText(page, 'read the pigeon lore');
  await settle(page, 400);
  r.check('4.7', 'microcopy appears after answering', await seen(page, 'Interesting. Very interesting.', 3000));
  await shot(page, '06-interview-reaction');
  await tapText(page, 'Next', { exact: true });
  await settle(page, 400);

  // Q6 q_the_bit
  await tapText(page, 'Build a legal case');
  await tapText(page, 'Next', { exact: true });
  await settle(page, 400);
  // Q7 q_communication
  await tapText(page, 'full emotional weather event');
  await tapText(page, 'Next', { exact: true });
  await settle(page, 400);
  // Q8 q_green_flags_multi
  r.check('4.2-multi', 'multi_select rendered (8/14)', await seen(page, 'Mapping your delulu 8/14', 4000));
  await tapText(page, 'Commits to a bit for months');
  await tapText(page, 'Suggests the airport at 11pm');
  await settle(page, 250);
  await tapText(page, 'Next', { exact: true });
  await settle(page, 400);
  // Q9 q_repair
  await tapText(page, 'came out weird');
  await tapText(page, 'Next', { exact: true });
  await settle(page, 400);
  // Q10 q_adventure
  await tapText(page, 'Alive.', { exact: true });
  await tapText(page, 'Next', { exact: true });
  await settle(page, 400);
  // Q11 q_delulu_shortcut (short_text)
  r.check('4.2-shorttext', 'short_text rendered (11/14)', await seen(page, 'Mapping your delulu 11/14', 4000));
  await ph(page, 'Type your answer…').fill('eye contact and one niche compliment');
  await settle(page, 300);
  r.check('4.7b', 'short-text microcopy shows', await seen(page, 'Noted, and slightly concerning.', 3000));
  await tapText(page, 'Next', { exact: true });
  await settle(page, 400);
  // Q12 q_ambiguity
  await tapText(page, 'three-act fantasy');
  await tapText(page, 'Next', { exact: true });
  await settle(page, 400);
  // Q13 q_healthy_option
  await tapText(page, 'make it weirder');
  await tapText(page, 'Next', { exact: true });
  await settle(page, 400);
  // Q14 q_match_style
  r.check('4.4c', 'progress shows 14/14 and never exceeds total', await seen(page, 'Mapping your delulu 14/14', 4000));
  await tapText(page, 'group chat concerned but supportive');
  await settle(page, 250);
  await shot(page, '07-interview-last');
  await tapText(page, 'See my Delulu Profile');

  // ---------------- PROFILE CARD ----------------
  const revealStart = Date.now();
  const sawReveal = await seen(page, 'Reading the lore', 6000);
  // wait for the type headline (reveal ≤ ~3s per gate 6.3)
  let revealed = false;
  for (let i = 0; i < 24; i++) {
    const t = await pageText(page);
    if (/The (Lore|Soft|Chaos|Delusional|Main|Slow)|Delulu Type|Your delulu/i.test(t) && !/Reading the lore/.test(t)) {
      revealed = true;
      break;
    }
    await settle(page, 500);
  }
  const revealMs = Date.now() - revealStart;
  r.check('6.3', `reveal sequence plays and completes (${revealMs}ms)`, sawReveal && revealed && revealMs < 8000, `sawReveal=${sawReveal} ms=${revealMs}`);
  await settle(page, 800);
  await shot(page, '08-profile-card');
  const cardText = await pageText(page);
  fs.writeFileSync(path.join(__dirname, 'profile-card-text.txt'), cardText);
  const grabType = (t) => {
    const lines = t.split('\n').map((x) => x.trim());
    const i = lines.findIndex((l) => /^YOUR DELULU TYPE$/i.test(l));
    return i >= 0 ? lines[i + 1] : '';
  };
  const hasSections =
    /BEST MATCHED WITH/i.test(cardText) &&
    /DANGER ZONE/i.test(cardText) &&
    /GREEN FLAG/i.test(cardText) &&
    /SUGGESTED PROFILE LINE/i.test(cardText) &&
    grabType(cardText) !== '';
  r.check('6.1', 'profile shows type/signature/traits/matched-with/danger/green/profile-line', hasSections);
  r.check('18.4.2', 'disclaimer copy present', /not a diagnosis, and you control what appears publicly/.test(cardText));
  const numericLeak = /\b\d{1,3}\s*\/\s*100\b|\bscore[:\s]+\d{1,3}\b/i.test(cardText);
  r.check('6.2', 'no public numeric dimension scores', !numericLeak);
  const actions =
    (await seen(page, 'Looks right', 2000)) &&
    (await seen(page, 'Roast me again', 1500)) &&
    (await seen(page, 'Edit what', 1500));
  r.check('6.4a', 'Looks right / Roast me again / Edit what’s public all present', actions);

  // capture type, then Roast me again → determinism probe (same answers → same profile)
  const typeBefore = grabType(cardText);
  await tapText(page, 'Roast me again');
  await settle(page, 500);
  for (let i = 0; i < 20; i++) {
    const t = await pageText(page);
    if (!/Reading the lore|Cross-checking|Finding the delusion|We have something/.test(t) && /Roast me again/.test(t)) break;
    await settle(page, 500);
  }
  const cardText2 = await pageText(page);
  const typeAfter = grabType(cardText2);
  r.check('5.2-roast', `deterministic regenerate (before="${typeBefore}" after="${typeAfter}")`, typeBefore !== '' && typeBefore === typeAfter);

  // visibility controls (6.5) — appear after tapping Edit what's public
  await tapText(page, 'Edit what');
  await settle(page, 500);
  await shot(page, '09-profile-toggles');
  const togglesText = await pageText(page);
  const toggles =
    /Show my Delulu Type/i.test(togglesText) &&
    /Show top traits/i.test(togglesText) &&
    /Hide danger zone/i.test(togglesText) &&
    /Hide match-explanation details/i.test(togglesText) &&
    /Use suggested profile line/i.test(togglesText);
  r.check('6.5a', 'all five visibility controls present after Edit', toggles);
  const switches = page.getByRole('switch').filter({ visible: true });
  const swCount = await switches.count();
  r.check('6.5b', 'five toggle switches rendered', swCount === 5, `count=${swCount}`);
  if (swCount === 5) {
    await switches.nth(2).click(); // Hide danger zone → on
    await settle(page, 300);
    const dzState = await switches.nth(2).getAttribute('aria-checked');
    r.check('6.5c', 'Hide danger zone switch flips on', dzState === 'true', `aria-checked=${dzState}`);
  }
  await shot(page, '09b-profile-toggles-after');

  await tapText(page, 'Looks right', { nth: 0 });
  await settle(page, 900);

  // ---------------- REVIEW ----------------
  r.check('3.5.1a', 'review screen shows One last look', await seen(page, 'One last look', 6000));
  const reviewText = await pageText(page);
  fs.writeFileSync(path.join(__dirname, 'review-text.txt'), reviewText);
  r.check('3.5.1b', 'review summarizes name', /Cate/.test(reviewText));
  r.check('BUG-age29', 'review shows age 29 from "banana" birthday (FAIL = bug visible)', !/Cate, 29/.test(reviewText), 'review shows: ' + (reviewText.match(/Cate,\s*\d+/) || ['?'])[0]);
  // jump-back edit probe
  await tapText(page, 'Edit', { exact: true, nth: 0 });
  await settle(page, 800);
  const editShowsSave = await seen(page, 'Save changes', 4000);
  r.check('3.5.1c', 'Edit(Basics) jumps back with Save changes CTA', editShowsSave);
  if (editShowsSave) {
    const nameVal2 = await ph(page, 'Your name').inputValue();
    r.check('14.2a', 'basics edit pre-filled from store', nameVal2 === 'Cate', `name=${nameVal2}`);
    await tapText(page, 'Save changes');
    await settle(page, 800);
  }
  r.check('3.5.1d', 'save returns to review', await seen(page, 'One last look', 4000));
  await shot(page, '10-review');
  await tapText(page, 'build my drop');
  await settle(page, 1500);

  // ---------------- LANDED IN TABS ----------------
  const inTabs = await seen(page, "This week's drop", 10000);
  r.check('3.5.2', 'completing review routes to weekly drop', inTabs);
  await shot(page, '11-weekly-drop-first-open');

  // analytics console capture summary
  const analyticsLines = consoleBuf.filter((c) => /analytics|track/i.test(c.text));
  fs.writeFileSync(path.join(__dirname, 'phase2-analytics-console.json'), JSON.stringify(analyticsLines, null, 2));
  const errors = consoleBuf.filter((c) => c.type === 'pageerror');
  r.check('stability', 'no page errors during onboarding', errors.length === 0, JSON.stringify(errors.slice(0, 3)));

  r.save();
  await ctx.close();
})().catch((e) => {
  console.error('PHASE2 CRASH', e);
  process.exit(1);
});
