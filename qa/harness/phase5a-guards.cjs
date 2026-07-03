/* Phase 5a: FRESH profile — pre-onboarding deep-link guard probes.
 * What happens if a user hits tab/detail/chat routes before onboarding? */
const { launch, goto, shot, Results, seen, settle } = require('./lib.cjs');
const pageText = (page) => page.evaluate(() => document.body.innerText);

(async () => {
  const r = new Results('phase5a-guards');
  const { ctx, page, consoleBuf } = await launch({ fresh: true });

  // 7.8: weekly drop with no drop → approved empty state, no crash
  await goto(page, '/tabs/weekly-drop');
  await settle(page, 2500);
  const t1 = await pageText(page);
  const empty78 = /No drop yet/i.test(t1) && /still assembling the delulu/i.test(t1);
  r.check('7.8', 'pre-onboarding drop shows approved empty state', empty78, t1.slice(0, 150).replace(/\n/g, ' | '));
  r.check('guard-drop', 'no crash on pre-onboarding drop', !consoleBuf.some((c) => c.type === 'pageerror'), JSON.stringify(consoleBuf.filter((c) => c.type === 'pageerror').slice(0, 2)));
  await shot(page, '28-preonboarding-drop');

  // likes pre-onboarding: seeded inbound → what shows?
  await goto(page, '/tabs/likes');
  await settle(page, 1500);
  const t2 = await pageText(page);
  r.check('guard-likes', 'likes route pre-onboarding renders (observe)', t2.length > 10, /No likes yet/.test(t2) ? 'empty state' : /They liked/.test(t2) ? 'SEEDED likes visible pre-onboarding' : t2.slice(0, 80));

  // messages pre-onboarding
  await goto(page, '/tabs/matches');
  await settle(page, 1500);
  const t3 = await pageText(page);
  r.check('guard-matches', 'messages route pre-onboarding renders (observe)', t3.length > 10, /No messages yet/.test(t3) ? 'empty state' : /Open chat|Simone|Winnie/.test(t3) ? 'SEEDED conversations visible pre-onboarding' : t3.slice(0, 80));
  await shot(page, '29-preonboarding-messages');

  // match detail with no drop
  await goto(page, '/match/c05');
  await settle(page, 1500);
  const t4 = await pageText(page);
  r.check('guard-detail', 'match detail with unknown id renders safe state', t4.length > 10 && !consoleBuf.some((c) => c.type === 'pageerror'), t4.slice(0, 100).replace(/\n/g, ' | '));

  // chat pre-onboarding with seeded mutual id
  await goto(page, '/chat/c02');
  await settle(page, 1500);
  const t5 = await pageText(page);
  r.check('guard-chat', 'chat route pre-onboarding (observe: locked or open?)', t5.length > 10, /Match first/.test(t5) ? 'locked' : /Message/.test(t5) ? 'OPEN chat pre-onboarding (seeded mutual)' : t5.slice(0, 80));
  await shot(page, '30-preonboarding-chat');

  // profile tab pre-onboarding
  await goto(page, '/tabs/profile');
  await settle(page, 1500);
  const t6 = await pageText(page);
  r.check('guard-profile', 'profile tab pre-onboarding safe', !consoleBuf.some((c) => c.type === 'pageerror'), t6.slice(0, 100).replace(/\n/g, ' | '));
  await shot(page, '31-preonboarding-profile');

  r.save();
  await ctx.close();
})().catch((e) => {
  console.error('PHASE5A CRASH', e);
  process.exit(1);
});
