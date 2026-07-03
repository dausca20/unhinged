/* Phase 1: cold boot on fresh profile → should land on onboarding welcome. */
const { launch, goto, shot, Results, seen, settle } = require('./lib.cjs');

(async () => {
  const r = new Results('phase1-boot');
  const { ctx, page, consoleBuf } = await launch({ fresh: true });
  await goto(page, '/');
  // First load compiles the bundle — give it time.
  const gotWelcome = await seen(page, 'delulu', 90000);
  await settle(page, 1500);
  await shot(page, '01-cold-boot');
  r.check('2.2', 'fresh launch routes to onboarding welcome', gotWelcome);
  const h1 = await seen(page, 'Find someone whose delulu fits yours', 5000);
  r.check('3.1.1', 'welcome H1 exact copy present', h1);
  const cta = await seen(page, 'Start my Delulu Read', 3000);
  r.check('3.1.2a', 'primary CTA present', cta);
  const secondary = await seen(page, 'I already have an account', 3000);
  r.check('3.1.2b', 'secondary account CTA present', secondary);
  const errors = consoleBuf.filter((c) => c.type === 'pageerror' || c.type === 'error');
  r.check('1.7', 'no console errors on cold start', errors.length === 0, JSON.stringify(errors.slice(0, 3)));
  r.save();
  await ctx.close();
})().catch((e) => {
  console.error('PHASE1 CRASH', e);
  process.exit(1);
});
