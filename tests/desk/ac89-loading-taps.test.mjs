// ac-test: S-001/AC89 — after MD3, stage 6b (the amendment "After MD3", specs/S-001.md:2329; the stage's tests, :15543): AC89 (m),
// loading and taps (specs/S-001.md:7963-7968; the test's list at :7995-7996) — the page while its code loads (index.html and
// app.js: the old header and footer not shown); a notification tap with an `?exp=001` window and a desk window open, and with only
// the experiment window (sw.js, under a faked `self`); and EXP-004's panel words. With them, the failed-load screen of AC89 (h)
// said once, on mockup v2's ground (AC89: "Every screen keeps AC81's tokens and AC88's dark theme", :7810-7811).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';

const PUBLIC = join(SRC, 'public');
const HTML = readFileSync(join(PUBLIC, 'index.html'), 'utf8');
const APP = readFileSync(join(PUBLIC, 'app.js'), 'utf8');
const STYLE = readFileSync(join(PUBLIC, 'style.css'), 'utf8');
const SANDBOX_CSS = readFileSync(join(PUBLIC, 'sandbox.css'), 'utf8');
const ORIGIN = 'https://desk.example.invalid';
const TAP = `${ORIGIN}/?open=Service-Desk%7Cpr%7C108`;

/** The service worker under a faked `self` (as notify-ac75.test.mjs runs it): its listeners, what it opened. */
function worker() {
  const listeners = {};
  const opened = [];
  const clientsList = [];
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (t, fn) => { listeners[t] = fn; },
    skipWaiting: () => {},
    registration: { showNotification: async () => {} },
    clients: { claim: async () => {}, matchAll: async () => clientsList, openWindow: async (url) => { opened.push(url); return { url }; } },
  };
  vm.runInNewContext(readFileSync(join(PUBLIC, 'sw.js'), 'utf8'), { self, URL, console, MessageChannel, setTimeout, clearTimeout });
  const tap = async () => {
    const waits = [];
    listeners.notificationclick({ notification: { data: { navigate: TAP }, close() {} }, waitUntil: (p) => waits.push(p) });
    await Promise.all(waits);
  };
  return { opened, clientsList, tap };
}
/** A window the worker can see: it records what is done to it, and takes a handed address when it is the desk. */
function win(url, did, name) {
  const w = { url, postMessage: (data, ports) => { did.push([name, 'message', data.navigate]); ports[0].postMessage({ ok: true }); },
    navigate: async () => { did.push([name, 'navigate']); return w; }, focus: async () => { did.push([name, 'focus']); } };
  return w;
}

test('AC89 (m): while the desk loads, the old header and footer are not shown — index.html holds both hidden, the desk never shows them, and no stylesheet gives them a display that would override `hidden`', () => {
  assert.match(HTML, /<header id="top" hidden>/, 'the header hidden from the first paint');
  assert.match(HTML, /<footer id="foot" hidden>/, 'the footer too');
  assert.match(HTML, /<main id="view"><p>Checking…<\/p><\/main>/, 'the view says "Checking…" while the code loads');
  // Nothing in style.css or sandbox.css sets the header's or footer's display, which would draw them in spite of `hidden`.
  for (const [name, css] of [['style.css', STYLE], ['sandbox.css', SANDBOX_CSS]]) {
    for (const m of css.matchAll(/([^{}]*(?:header#top|footer#foot|#top|#foot)[^{}]*)\{([^}]*)\}/g)) {
      assert.ok(!/display:(?!\s*none)/.test(m[2]), `${name}: ${m[1].trim()} gives no display but none`);
    }
  }
  assert.match(SANDBOX_CSS, /html\.sb header#top, html\.sb footer#foot \{ display: none; \}/, 'once the desk has started, still not shown');
  // The page's entry: only an experiment panel shows the header, where it titles itself; the desk's path never does.
  const desk = APP.slice(APP.indexOf("const exp = params.get('exp');"));
  assert.ok(desk.length > 0);
  assert.equal((APP.match(/showHeader\(\);/g) || []).length, 2, 'EXP-001\'s and EXP-004\'s panels, and nothing else');
  assert.ok(APP.indexOf('function startExp004() {\n  showHeader();') >= 0 && APP.indexOf('function startExp001() {\n  showHeader();') >= 0);
  assert.doesNotMatch(desk, /\.hidden = false/, 'the desk\'s path never unhides them');
  assert.match(desk, /foot\.hidden = true;/, 'the footer\'s "reading…" never shown, the load failed or not');
});

// Rewritten in G4 of "After the glance audit" (AC89 (h)'s note "After the glance audit": "it says "The desk couldn't load."
// in `--t-lead`, with the ✕ in `--bad` and a "Reload" button (AC91 (k))"): the screen is no longer the render-error
// screen's 12 px line (p.sb-stale) but the failed-load screen app.js draws (section.sb-screen.v2-loadfail), still said once,
// in the view, on mockup v2's ground and tokens. AC91 (k)'s own case (tests/desk/ac91-glance-load.test.mjs) draws it.
test('AC89 (m) with (h) (rewritten in G4): the desk\'s code failing to load says "The desk couldn\'t load." once, in the view, on mockup v2\'s ground and tokens, as the failed-load screen with its ✕ and Reload button (section.sb-screen.v2-loadfail), not style.css\'s bold amber state line', () => {
  const fn = APP.slice(APP.indexOf("startDesk(() => import('./sandbox.js')"));
  assert.match(fn, /document\.documentElement\.classList\.add\('sb', 'v2-page'\);/, 'mockup v2\'s ground and tokens (AC88)');
  assert.match(fn, /document\.head\.append\(h\('link', \{ rel: 'stylesheet', href: 'sandbox\.css' \}\)\)/, 'sandbox.css, as the desk itself adds it');
  assert.match(fn, /view\.replaceChildren\(loadFailedScreen\(words\)\);/);
  assert.match(APP, /return h\('section', \{ class: 'sb-screen v2-loadfail' \},/, 'one screen in the view, as the desk\'s own screens are');
  // The render-error screen's own form stays the desk's, for a drawing that throws (sandbox.js's guardRender call).
  assert.match(readFileSync(join(PUBLIC, 'sandbox.js'), 'utf8'), /show\(h\('section', \{ class: 'sb-screen' \}, h\('p', \{ class: 'sb-stale' \}, state\.text\)/);
  // Said once: the state line that also holds them sits in the hidden header.
  assert.match(HTML, /<header id="top" hidden>\s*<a class="brand" href="#\/">Service Desk<\/a>\s*<p id="screen-state"/);
  assert.match(SANDBOX_CSS, /\n\.sb-stale \{ color: var\(--block\); font: var\(--t-meta\); margin: 0; \}/);
});

test('AC89 (m): a notification tap with an `?exp=001` window and a desk window open is handed to the desk window only; the experiment tab is never focused, messaged or navigated', async () => {
  for (const expUrl of [`${ORIGIN}/?exp=001`, `${ORIGIN}/?exp=004#/`, `${ORIGIN}/?sandbox&exp=001`]) {
    const w = worker();
    const did = [];
    // The experiment window first: the one `desks[0]` took before.
    w.clientsList.push(win(expUrl, did, 'exp'), win(`${ORIGIN}/#/waiting`, did, 'desk'));
    await w.tap();
    assert.deepEqual(did, [['desk', 'focus'], ['desk', 'message', TAP]], expUrl);
    assert.equal(w.opened.length, 0, 'no new window: the desk took it');
  }
});

test('AC89 (m): with only the experiment window open, the tap opens the desk as AC74 says, in a window of its own; the experiment tab untouched', async () => {
  for (const expUrl of [`${ORIGIN}/?exp=001`, `${ORIGIN}/?exp=004`]) {
    const w = worker();
    const did = [];
    w.clientsList.push(win(expUrl, did, 'exp'));
    await w.tap();
    assert.deepEqual(did, [], `${expUrl}: never focused, messaged or navigated`);
    assert.deepEqual(w.opened, [TAP], 'the desk opened at the tap\'s address');
  }
  // A desk window at an address with `exp` only in its route, not its query, is still the desk.
  const w = worker();
  const did = [];
  w.clientsList.push(win(`${ORIGIN}/#/p/exp`, did, 'desk'));
  await w.tap();
  assert.deepEqual(did, [['desk', 'focus'], ['desk', 'message', TAP]]);
});

test('AC89 (m): EXP-004\'s panel names where CI shows now — each project\'s page, "Details" — never the gone Universe screen', () => {
  const panel = APP.slice(APP.indexOf('function startExp004()'), APP.indexOf('// EXP-001'));
  assert.ok(panel.includes('Q4: on each project’s page, open “Details” and record its CI line.'), 'Q4, in the page\'s own words ("Details")');
  assert.doesNotMatch(panel, /Universe/, 'no gone screen named');
  assert.doesNotMatch(APP, /Universe screen/);
  // "Details" is the page's own control's word (projectpage.js's PAGE_WORDS), whose sheet holds the CI line.
  assert.match(readFileSync(join(SRC, 'lib', 'projectpage.js'), 'utf8'), /details: 'Details',/);
  assert.match(readFileSync(join(PUBLIC, 'sandbox.js'), 'utf8'), /`CI on \$\{project\.defaultBranch\}: \$\{model \? model\.ci : NOT_AVAILABLE\}`/);
});
