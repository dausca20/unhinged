/* QA driver library for Unhinged app (Expo web + Playwright). */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = __dirname;
const SHOTS = path.join(ROOT, 'shots');
const PROFILE = path.join(ROOT, 'browser-profile');
const CONSOLE_LOG = path.join(ROOT, 'console.jsonl');
fs.mkdirSync(SHOTS, { recursive: true });

async function launch({ fresh = false, reducedMotion = null } = {}) {
  if (fresh) fs.rmSync(PROFILE, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: true,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: false,
    reducedMotion: reducedMotion || 'no-preference',
    serviceWorkers: 'block',
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  const consoleBuf = [];
  page.on('console', (msg) => {
    const entry = { t: Date.now(), type: msg.type(), text: msg.text() };
    consoleBuf.push(entry);
    fs.appendFileSync(CONSOLE_LOG, JSON.stringify(entry) + '\n');
  });
  page.on('pageerror', (err) => {
    const entry = { t: Date.now(), type: 'pageerror', text: String(err) };
    consoleBuf.push(entry);
    fs.appendFileSync(CONSOLE_LOG, JSON.stringify(entry) + '\n');
  });
  return { ctx, page, consoleBuf };
}

async function goto(page, route = '/') {
  await page.goto('http://localhost:8081' + route, { waitUntil: 'domcontentloaded', timeout: 120000 });
}

async function shot(page, name) {
  const p = path.join(SHOTS, name + '.png');
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

/* Results accumulator: each check is {id, desc, pass, detail} */
class Results {
  constructor(phase) {
    this.phase = phase;
    this.checks = [];
  }
  check(id, desc, pass, detail = '') {
    this.checks.push({ id, desc, pass: !!pass, detail: String(detail).slice(0, 500) });
    console.error(`[${pass ? 'PASS' : 'FAIL'}] ${id} ${desc}${detail ? ' :: ' + String(detail).slice(0, 200) : ''}`);
    // incremental save so crashes don't lose results
    fs.writeFileSync(path.join(ROOT, `results-${this.phase}.json`), JSON.stringify(this.checks, null, 2));
  }
  save() {
    const p = path.join(ROOT, `results-${this.phase}.json`);
    fs.writeFileSync(p, JSON.stringify(this.checks, null, 2));
    const fails = this.checks.filter((c) => !c.pass);
    console.error(`== ${this.phase}: ${this.checks.length - fails.length}/${this.checks.length} passed`);
    return fails.length;
  }
}

/* expo-router web keeps previous stack screens mounted but hidden — always
 * filter locators to visible elements. */
function visText(page, text, exact = false) {
  return page.getByText(text, { exact }).filter({ visible: true });
}

/* Wait for a text to be visible; returns true/false instead of throwing. */
async function seen(page, text, timeout = 8000, exact = false) {
  try {
    await visText(page, text, exact).first().waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/* Click the nth VISIBLE element matching text. */
async function tapText(page, text, { exact = false, timeout = 8000, nth = 0 } = {}) {
  const loc = visText(page, text, exact).nth(nth);
  await loc.waitFor({ state: 'visible', timeout });
  await loc.click();
}

/* Click a visible element by accessibility label. */
async function tapLabel(page, label, { timeout = 8000, nth = 0 } = {}) {
  const loc = page.getByLabel(label).filter({ visible: true }).nth(nth);
  await loc.waitFor({ state: 'visible', timeout });
  await loc.click();
}

/* Visible input by placeholder. */
function ph(page, placeholder) {
  return page.getByPlaceholder(placeholder).filter({ visible: true });
}

async function settle(page, ms = 600) {
  await page.waitForTimeout(ms);
}

/* Read AsyncStorage (localStorage on web) keys for persistence checks. */
async function storageSnapshot(page) {
  return page.evaluate(() => {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      out[k] = localStorage.getItem(k);
    }
    return out;
  });
}

module.exports = { launch, goto, shot, Results, seen, tapText, tapLabel, ph, visText, settle, storageSnapshot, SHOTS };
