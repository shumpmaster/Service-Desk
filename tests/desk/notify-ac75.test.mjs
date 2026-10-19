// ac-test: S-001/AC75 — turning notifications on: the manifest's fields and the page's two links; each
// state's words with a faked display-mode, permission and public key; permission asked only inside
// the tap's handler; the Declarative path where window.pushManager exists and the service-worker
// path where it does not; the value's form; and the service worker's push, tap and
// pushsubscriptionchange handlers, with a faked `self`.
// join-test: S-001/J19 — the key's decoding to 65 bytes starting 0x04; each path; the value's form,
// run through the same parser J17's first step uses; and the failure words.
// The keys and subscriptions here are throwaway ones made in the test (makeVapid, makeSubscription).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { SRC, CONFIG, fixture } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadApp, findAll } from './page-harness.mjs';
import { loadSandbox, byClass, findAll as sbFindAll } from './sandbox-helpers.mjs';
import { makeVapid, makeSubscription } from './notify-helpers.mjs';
import {
  decodeVapidKey, notifyState, NOTIFY_WORDS, turnOn, FAIL_LEAD, SW_FALLBACK, isStandalone, onTopLine, subscriptionValue, copySteps,
} from '../../src/lib/notifyview.js';
import { parseSubscription } from '../../src/notify/webpush.mjs';
import { validateConfig } from '../../src/lib/configcheck.js';

const PUBLIC = join(SRC, 'public');
const vapid = makeVapid();

function repos() {
  const sd = (p) => fixture(`service-desk/${p}`);
  return {
    'Service-Desk': repo({ 'governance/ROUTING.toml': sd('governance/ROUTING.toml'), 'status/P-001.toml': fixture('service-desk/status/P-001@7da0fd7.toml'),
      'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl') }, [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]),
  };
}

/** A browser's objects, faked: display-mode, Notification and push, recording every call. */
function browser({ standalone = true, permission = 'default', declarative = true, grant = 'granted', swFails = false, existing = null } = {}) {
  const sub = makeSubscription();
  const calls = { requestPermission: 0, subscribe: [], register: [], getSubscription: 0, inHandler: [] };
  let inTap = false;
  const subscription = { toJSON: () => JSON.parse(sub.value) };
  const pm = {
    subscribe: async (opts) => { calls.subscribe.push(opts); return subscription; },
    getSubscription: async () => { calls.getSubscription++; return existing; },
  };
  const Notification = {
    permission,
    requestPermission: async () => {
      calls.requestPermission++;
      calls.inHandler.push(inTap);
      Notification.permission = grant;
      return grant;
    },
  };
  const navigator = {
    clipboard: { writeText: async () => {} },
    serviceWorker: {
      register: async (url, o) => {
        calls.register.push([url, o]);
        if (swFails) throw new TypeError('the script answered with text/html');
        return { pushManager: pm };
      },
      getRegistration: async () => ({ pushManager: pm }),
    },
  };
  const win = { matchMedia: (q) => ({ matches: standalone && q === '(display-mode: standalone)' }) };
  if (declarative) win.pushManager = pm;
  return { win, Notification, navigator, calls, sub, tap: (fn) => { inTap = true; try { return fn(); } finally { inTap = false; } } };
}

// ---------------------------------------------------------------------------
// The Home Screen web app

test('AC75: the manifest\'s fields, its three icons at 180, 192 and 512 px, and the page\'s two links', () => {
  const m = JSON.parse(readFileSync(join(PUBLIC, 'manifest.webmanifest'), 'utf8'));
  assert.equal(m.name, 'Service Desk');
  assert.equal(m.short_name, 'Desk');
  // From 2026-10-19: the icon opens the owner's page, the sandbox, until MD3; `id` "/" keeps the app the same one.
  assert.equal(m.start_url, '/?sandbox');
  assert.equal(m.id, '/');
  assert.equal(m.scope, '/');
  assert.equal(m.display, 'standalone');
  assert.deepEqual(m.icons.map((i) => [i.src, i.sizes, i.type]), [
    ['/icons/desk-180.png', '180x180', 'image/png'], ['/icons/desk-192.png', '192x192', 'image/png'], ['/icons/desk-512.png', '512x512', 'image/png']]);
  for (const s of [180, 192, 512]) {
    const png = readFileSync(join(PUBLIC, 'icons', `desk-${s}.png`));
    assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG');
    assert.equal(png.readUInt32BE(16), s, 'width');
    assert.equal(png.readUInt32BE(20), s, 'height');
  }
  const html = readFileSync(join(PUBLIC, 'index.html'), 'utf8');
  assert.ok(html.includes('<link rel="manifest" href="/manifest.webmanifest" crossorigin="use-credentials">'));
  assert.ok(html.includes('<link rel="apple-touch-icon" href="/icons/desk-180.png">'));
  // No Content-Security-Policy source beyond 'self' (AC75's "No other change").
  const csp = /content="(default-src[^"]*)"/.exec(html)[1];
  assert.doesNotMatch(csp.replace(/'self'|'none'|data:/g, ''), /https?:|\*|'unsafe/);
});

// ---------------------------------------------------------------------------
// The control's states

test('AC75: each state\'s words, from display-mode, the public key and the permission', () => {
  const key = vapid.publicB64;
  assert.equal(notifyState({ standalone: false, key, permission: 'default' }), 'not-standalone');
  assert.equal(NOTIFY_WORDS['not-standalone'], 'To get notifications, add the desk to your Home Screen: Share, then Add to Home Screen, then open it from there');
  assert.equal(notifyState({ standalone: true, key: null, permission: 'default' }), 'no-key');
  assert.equal(NOTIFY_WORDS['no-key'], "Notifications aren't set up yet");
  assert.equal(notifyState({ standalone: true, key, permission: 'default', subscribed: false }), 'ask');
  assert.equal(NOTIFY_WORDS.ask, 'Turn on notifications');
  assert.equal(notifyState({ standalone: true, key, permission: 'denied' }), 'denied');
  assert.equal(NOTIFY_WORDS.denied, 'Notifications are off for the desk. Turn them on in Settings, Notifications, Service Desk');
  assert.equal(notifyState({ standalone: true, key, permission: 'granted', subscribed: true, copied: false }), 'copy');
  assert.equal(notifyState({ standalone: true, key, permission: 'granted', subscribed: true, copied: true }), 'on');
  assert.equal(NOTIFY_WORDS.on, 'On for this phone');
  assert.equal(notifyState({ standalone: true, key, permission: 'granted', subscribed: false }), 'ask', 'granted but no subscription: the tap subscribes');
  assert.ok(onTopLine('ask') && onTopLine('no-key') && !onTopLine('on'), 'Home\'s top line until notifications are on for this device');
  const b = browser();
  assert.equal(isStandalone(b.win, {}), true);
  assert.equal(isStandalone({ matchMedia: () => ({ matches: false }) }, { standalone: true }), true, 'iOS\'s navigator.standalone');
  assert.equal(isStandalone({}, {}), false);
  // The steps name both projects (J19: the same value in both).
  assert.ok(copySteps(CONFIG).some((x) => x.includes('Personal-Org-Operating-Model')));
  assert.ok(copySteps(CONFIG).some((x) => x.includes('DESK_PUSH_SUBSCRIPTION')));
});

test('AC75, J7: on the accepted page with J7 as committed (the owner\'s key, Setup N1, CS18), the desk offers "Turn on notifications" from the Home Screen, never asking on load; in Safari, how to add it', async () => {
  assert.ok(decodeVapidKey(CONFIG.push.vapidPublicKey), 'J7\'s push holds the owner\'s public key (Setup N1, CS18)');
  for (const [standalone, words] of [[true, NOTIFY_WORDS.ask], [false, NOTIFY_WORDS['not-standalone']]]) {
    const b = browser({ standalone });
    const app = await loadApp({ repos: repos(), win: b.win, globals: { Notification: b.Notification, navigator: b.navigator } });
    try {
      await app.advance(1000);
      const more = findAll(app.els.view, (e) => e.attrs && e.attrs.id === 'more-detail')[0];
      assert.ok(more, 'More detail on Home');
      assert.ok(more.textContent.includes('Notifications'));
      assert.ok(more.textContent.includes(words), words);
      assert.ok(!more.textContent.includes(NOTIFY_WORDS['no-key']), 'the key is set up: never "aren\'t set up yet"');
      const top = findAll(app.els.view, (e) => e.className === 'notify-top')[0];
      assert.ok(top && top.textContent.includes(words), 'and on Home\'s top line');
      assert.equal(b.calls.requestPermission, 0, 'never asked on load');
    } finally {
      app.restore();
    }
  }
});

test('AC75, J7: with no push (a fixture config: J7 without its push object), the desk says "Notifications aren\'t set up yet" from the Home Screen, in More detail and on Home\'s top line, with no button', async () => {
  const { push: _committed, ...noPush } = CONFIG;
  assert.equal(noPush.push, undefined, 'the fixture has no push object');
  assert.deepEqual(validateConfig(noPush), [], 'a missing push alone builds');
  const b = browser({ standalone: true });
  const app = await loadSandbox({ config: noPush, repos: repos(), hash: '#/p/Service-Desk', win: b.win,
    globals: { Notification: b.Notification, navigator: b.navigator } });
  try {
    await app.advance(1000);
    const line = byClass(app.view, 'sb-notify-line')[0];
    assert.ok(line, 'the Notifications line in More detail');
    assert.ok(line.textContent.includes(NOTIFY_WORDS['no-key']), line.textContent);
    assert.equal(sbFindAll(app.view, (e) => e.tag === 'button' && e.textContent === NOTIFY_WORDS.ask).length, 0, 'no "Turn on notifications" without a key');
    await app.go('#/');
    const top = byClass(app.view, 'sb-notify').find((n) => n.attrs['data-k'] === 'notify:top');
    assert.ok(top && top.textContent.includes(NOTIFY_WORDS['no-key']), 'and on Home\'s top line');
    assert.equal(b.calls.requestPermission, 0, 'never asked');
  } finally {
    app.restore();
  }
});

const keyConfig = () => ({ ...CONFIG, push: { vapidPublicKey: vapid.publicB64, deskUrl: 'https://desk.example.invalid' } });

test('AC75, J19: with a (made-up) key, the sandbox\'s control: "Turn on notifications"; permission asked only inside the tap; the Declarative path; the value, "Copy" and the steps; "I\'ve added it to GitHub"; then "On for this phone"', async () => {
  const b = browser({ declarative: true });
  const store = new Map();
  const local = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) };
  const app = await loadSandbox({ config: keyConfig(), repos: repos(), hash: '#/p/Service-Desk', store: local, win: b.win,
    globals: { Notification: b.Notification, navigator: b.navigator } });
  try {
    await app.advance(1000);
    await app.advance(60_000);
    assert.equal(b.calls.requestPermission, 0, 'not on load, not on a poll');
    const btn = sbFindAll(app.view, (e) => e.tag === 'button' && e.textContent === 'Turn on notifications')[0];
    assert.ok(btn, 'the button, in More detail');
    b.tap(() => btn.click());
    await app.flush();
    assert.equal(b.calls.requestPermission, 1);
    assert.deepEqual(b.calls.inHandler, [true], 'asked inside the tap\'s handler only');
    assert.equal(b.calls.subscribe.length, 1);
    assert.equal(b.calls.register.length, 0, 'no service worker on the Declarative path');
    const opts = b.calls.subscribe[0];
    assert.equal(opts.userVisibleOnly, true);
    assert.deepEqual(Buffer.from(opts.applicationServerKey), vapid.raw, 'J7\'s public key');
    const text = app.text();
    assert.ok(text.includes('Notifications are on for this phone. Copy this value into GitHub:'));
    const value = byClass(app.view, 'sb-value')[0].textContent;
    assert.deepEqual(JSON.parse(value), JSON.parse(b.sub.value), 'the subscription as JSON: its endpoint and keys');
    assert.ok(parseSubscription(value), 'J17\'s first step takes the value as the page shows it');
    assert.ok(text.includes('DESK_PUSH_SUBSCRIPTION'));
    const done = sbFindAll(app.view, (e) => e.tag === 'button' && e.textContent === "I've added it to GitHub")[0];
    done.click();
    await app.flush();
    assert.ok(app.text().includes('On for this phone'));
    assert.ok(app.text().includes('Send a test from GitHub'));
    assert.ok(!app.text().includes('Copy this value'), 'the steps hidden on this device');
    await app.go('#/');
    assert.ok(!byClass(app.view, 'sb-notify').some((n) => n.attrs['data-k'] === 'notify:top'), 'on: no longer on Home\'s top line');
  } finally {
    app.restore();
  }
});

test('J19: the service-worker path where window.pushManager is absent: /sw.js registered at scope /, then its pushManager subscribes', async () => {
  const b = browser({ declarative: false });
  const r = await b.tap(() => turnOn({ win: b.win, nav: b.navigator, Notif: b.Notification, key: vapid.publicB64 }));
  assert.equal(r.ok, true);
  assert.equal(r.path, 'service-worker');
  assert.deepEqual(b.calls.register, [['/sw.js', { scope: '/' }]]);
  assert.equal(b.calls.subscribe.length, 1);
  assert.equal(b.calls.subscribe[0].userVisibleOnly, true);
  assert.equal(subscriptionValue({ toJSON: () => ({ endpoint: 'https://x.invalid/e', expirationTime: null, keys: { p256dh: 'p', auth: 'a' } }) }),
    '{"endpoint":"https://x.invalid/e","expirationTime":null,"keys":{"p256dh":"p","auth":"a"}}');
  assert.ok(parseSubscription(r.value));
});

test('J19: the failure words; a service worker script that doesn\'t load names EXP-006\'s fallback; refused permission shows the Settings words', async () => {
  let b = browser({ declarative: false, swFails: true });
  let r = await turnOn({ win: b.win, nav: b.navigator, Notif: b.Notification, key: vapid.publicB64 });
  assert.equal(r.ok, false);
  assert.equal(r.words, `${FAIL_LEAD}the script answered with text/html${SW_FALLBACK}`);
  assert.match(r.words, /^The desk couldn't turn notifications on: /);
  assert.match(r.words, /EXP-006's fallback is Setup N10's Access exception/);
  b = browser({ grant: 'denied' });
  r = await turnOn({ win: b.win, nav: b.navigator, Notif: b.Notification, key: vapid.publicB64 });
  assert.equal(r.state, 'denied');
  assert.equal(b.calls.subscribe.length, 0);
  b = browser();
  b.win.pushManager.subscribe = async () => { throw new DOMException('The operation is not supported', 'NotSupportedError'); };
  r = await turnOn({ win: b.win, nav: b.navigator, Notif: b.Notification, key: vapid.publicB64 });
  assert.equal(r.words, "The desk couldn't turn notifications on: The operation is not supported");
  r = await turnOn({ win: b.win, nav: b.navigator, Notif: undefined, key: vapid.publicB64 });
  assert.equal(r.words, "The desk couldn't turn notifications on: this browser offers no notifications");
  r = await turnOn({ win: b.win, nav: b.navigator, Notif: b.Notification, key: null });
  assert.equal(r.state, 'no-key');
});

test('J19, J7: the public key decodes to 65 bytes starting 0x04, 87 characters; the build refuses one that doesn\'t, and a push with a bad address', () => {
  assert.deepEqual(Buffer.from(decodeVapidKey(vapid.publicB64)), vapid.raw);
  assert.equal(vapid.publicB64.length, 87);
  const bad = [vapid.publicB64.slice(1), `${vapid.publicB64}A`, vapid.publicB64.replace(/^./, 'C'), `${vapid.publicB64.slice(0, 86)}=`, 'x'.repeat(87), 87, null];
  for (const k of bad) assert.equal(decodeVapidKey(k), null, String(k));
  const ok = { ...CONFIG, push: { vapidPublicKey: vapid.publicB64, deskUrl: 'https://service-desk-preview.pages.dev' } };
  assert.deepEqual(validateConfig(ok), []);
  assert.deepEqual(validateConfig(CONFIG), [], 'the committed key passes the build\'s check');
  const { push: _committed, ...noPush } = CONFIG;
  assert.deepEqual(validateConfig(noPush), [], 'a missing push alone builds');
  for (const k of bad.slice(0, 5)) assert.ok(validateConfig({ ...ok, push: { ...ok.push, vapidPublicKey: k } }).some((e) => e.includes('push.vapidPublicKey')));
  for (const u of ['http://service-desk-preview.pages.dev', 'https://x.pages.dev/path', 'https://x.pages.dev/?a=1', 'not a url', 7]) {
    assert.ok(validateConfig({ ...ok, push: { ...ok.push, deskUrl: u } }).some((e) => e.includes('push.deskUrl')), String(u));
  }
  assert.ok(validateConfig({ ...ok, push: 'yes' }).some((e) => e.startsWith('push must be')));
});

// ---------------------------------------------------------------------------
// The service worker, with a faked `self`

function loadWorker(origin = 'https://desk.example.invalid', ctx = {}) {
  const listeners = {};
  const shown = [];
  const opened = [];
  const clientsList = [];
  const self = {
    location: { origin },
    addEventListener: (t, fn) => { listeners[t] = fn; },
    skipWaiting: () => {},
    registration: { showNotification: async (title, options) => { shown.push({ title, options }); } },
    clients: {
      claim: async () => {},
      matchAll: async () => clientsList,
      openWindow: async (url) => { opened.push(url); return { url }; },
    },
  };
  vm.runInNewContext(readFileSync(join(PUBLIC, 'sw.js'), 'utf8'), { self, URL, console, ...ctx });
  const fire = async (type, ev) => {
    const waits = [];
    listeners[type]({ ...ev, waitUntil: (p) => waits.push(p) });
    await Promise.all(waits);
  };
  return { listeners, shown, opened, clientsList, fire };
}

test('AC75: the service worker shows the payload\'s notification with its tag; a payload it can\'t read still shows one', async () => {
  const w = loadWorker();
  const payload = { web_push: 8030, notification: { title: 'Service-Desk', body: 'Waits on you: a question: x', navigate: 'https://desk.example.invalid/?open=Service-Desk%7Cquestion%7Cquestions%2Fx.md', tag: 'TAGTAGTAG' } };
  await w.fire('push', { data: { json: () => payload } });
  assert.deepEqual(JSON.parse(JSON.stringify(w.shown[0])), { title: 'Service-Desk', options: { body: 'Waits on you: a question: x', tag: 'TAGTAGTAG', data: { navigate: payload.notification.navigate } } });
  await w.fire('push', { data: { json: () => { throw new SyntaxError('not JSON'); } } });
  assert.equal(w.shown[1].title, 'Service Desk');
  assert.equal(w.shown[1].options.body, 'Something waits on you: open the desk', 'every push shows a notification (W8)');
  await w.fire('push', { data: null });
  assert.equal(w.shown.length, 3);
});

test('AC75: a tap opens the desk at the navigate address on its own origin, at its root for another origin, and focuses an open desk window', async () => {
  const w = loadWorker();
  const tap = (navigate) => w.fire('notificationclick', { notification: { data: { navigate }, close() {} } });
  await tap('https://desk.example.invalid/?sandbox&open=Service-Desk%7Cpr%7C108');
  assert.deepEqual(w.opened, ['https://desk.example.invalid/?sandbox&open=Service-Desk%7Cpr%7C108']);
  await tap('https://evil.example.invalid/phish');
  assert.equal(w.opened[1], 'https://desk.example.invalid/', 'another origin: the desk\'s root');
  await tap('javascript:alert(1)');
  assert.equal(w.opened[2], 'https://desk.example.invalid/');
  await tap(undefined);
  assert.equal(w.opened[3], 'https://desk.example.invalid/');
  // An open desk window that can't be handed the address (no MessageChannel here): focused, then
  // navigated and focused, not a second one opened.
  const focused = [];
  const client = { url: 'https://desk.example.invalid/#/', navigate: async (u) => { focused.push(['navigate', u]); return client; }, focus: async () => { focused.push(['focus']); } };
  w.clientsList.push({ url: 'https://elsewhere.example.invalid/', navigate: async () => { throw new Error('never'); } }, client);
  await tap('https://desk.example.invalid/?open=actions-usage');
  assert.deepEqual(focused, [['focus'], ['navigate', 'https://desk.example.invalid/?open=actions-usage'], ['focus']]);
  assert.equal(w.opened.length, 4);
});

test('AC74, AC75 (draft 8; 2026-10-19): an open sandbox window is focused and handed the address, staying loaded; one that doesn\'t take it within a second is navigated', async () => {
  for (const takes of [true, false]) {
    const w = loadWorker('https://desk.example.invalid', { MessageChannel, setTimeout, clearTimeout });
    const did = [];
    const client = { url: 'https://desk.example.invalid/?sandbox#/p/Service-Desk',
      postMessage: (data, ports) => {
        did.push(['message', data]);
        if (takes) ports[0].postMessage({ ok: true });
        else ports[0].close();
      },
      navigate: async (u) => { did.push(['navigate', u]); return client; }, focus: async () => { did.push(['focus']); } };
    w.clientsList.push(client);
    const t0 = Date.now();
    await w.fire('notificationclick', { notification: { data: { navigate: 'https://desk.example.invalid/?sandbox&open=Service-Desk%7Cpr%7C108' }, close() {} } });
    const msg = ['message', { kind: 'desk-open', navigate: 'https://desk.example.invalid/?sandbox&open=Service-Desk%7Cpr%7C108' }];
    if (takes) assert.deepEqual(JSON.parse(JSON.stringify(did)), [['focus'], msg], 'taken: no navigation, the page stays loaded');
    else {
      assert.deepEqual(JSON.parse(JSON.stringify(did)), [['focus'], msg, ['navigate', 'https://desk.example.invalid/?sandbox&open=Service-Desk%7Cpr%7C108'], ['focus']]);
      assert.ok(Date.now() - t0 >= 900, 'after about a second');
    }
    assert.equal(w.opened.length, 0);
  }
});

test('AC75: pushsubscriptionchange shows "Desk notifications need turning on again: open the desk"', async () => {
  const w = loadWorker();
  await w.fire('pushsubscriptionchange', {});
  assert.equal(w.shown[0].title, 'Service Desk');
  assert.equal(w.shown[0].options.body, 'Desk notifications need turning on again: open the desk');
  assert.equal(w.shown[0].options.data.navigate, 'https://desk.example.invalid/');
});

// Draft 8 (the owner's ruling "A. Keep the fold (Recommended)", decisions/questions/P-001-notify-more-detail.md):
// on the accepted page, a "More detail" fold at the bottom of Home, closed until tapped, holding the
// Notifications line and the Actions line and nothing else; a `?open=actions-usage` tap opens it at that line.
test('AC75 (draft 8): the accepted Home\'s "More detail" fold: at the bottom, closed at load, the two lines only; opened by ?open=actions-usage', async () => {
  let app = await loadApp({ repos: repos() });
  try {
    await app.advance(1000);
    const folds = findAll(app.els.view, (e) => e.attrs && e.attrs.id === 'more-detail');
    assert.equal(folds.length, 1);
    const more = folds[0];
    assert.equal(more.tag, 'details');
    assert.equal(more.attrs.open == null, true, 'closed at load');
    const home = app.els.view.children[app.els.view.children.length - 1];
    assert.ok(home === more || findAll(home, (e) => e === more).length === 1, 'at the bottom of Home');
    const kids = more.children.filter((c) => c.tag);
    assert.deepEqual(kids.map((c) => c.tag), ['summary', 'section', 'section'], 'its summary and two lines, nothing else');
    assert.equal(kids[0].textContent, 'More detail');
    assert.equal(kids[1].className, 'notify-line');
    assert.ok(kids[1].textContent.startsWith('Notifications'));
    assert.equal(kids[2].attrs.id, 'actions-usage');
    assert.ok(kids[2].textContent.startsWith('GitHub Actions this month'));
  } finally {
    app.restore();
  }
  // From 2026-10-19 the tap opens the sandbox: the accepted view sends `?open=actions-usage` on to
  // `?sandbox&open=actions-usage`, where More detail opens at the line.
  app = await loadApp({ repos: repos(), search: '?open=actions-usage' });
  try {
    await app.advance(1000);
    assert.deepEqual(app.replaced, ['/?sandbox&open=actions-usage'], 'sent on to the sandbox');
  } finally {
    app.restore();
  }
  const sb = await loadSandbox({ config: CONFIG, repos: repos(), hash: '', search: '?sandbox&open=actions-usage' });
  try {
    await sb.advance(1000);
    const more = byClass(sb.view, 'sb-more')[0];
    assert.ok(more && 'open' in more.attrs, 'opened by the tap');
    assert.ok(sbFindAll(more, (e) => e.attrs && e.attrs.id === 'actions-usage').length, 'at the Actions line');
  } finally {
    sb.restore();
  }
});

// From 2026-10-19: the tap is handed only to a window already showing the sandbox; an open accepted-view
// window is navigated to the address instead (it stays as it is at plain "/" otherwise).
test('AC74, AC75 (2026-10-19): an accepted-view window is navigated, never handed the tap; with a sandbox window open too, the sandbox one is handed it', async () => {
  const TAP = 'https://desk.example.invalid/?sandbox&open=Service-Desk%7Cpr%7C108';
  const tap = (w) => w.fire('notificationclick', { notification: { data: { navigate: TAP }, close() {} } });
  // The accepted view alone: focused and navigated, no message.
  let w = loadWorker('https://desk.example.invalid', { MessageChannel, setTimeout, clearTimeout });
  let did = [];
  const accepted = { url: 'https://desk.example.invalid/#/p/Service-Desk', postMessage: () => did.push(['message']),
    navigate: async (u) => { did.push(['navigate', u]); return accepted; }, focus: async () => { did.push(['focus']); } };
  w.clientsList.push(accepted);
  await tap(w);
  assert.deepEqual(did, [['focus'], ['navigate', TAP], ['focus']]);
  assert.equal(w.opened.length, 0);
  // Both open: the sandbox window takes it; the accepted one is left alone.
  w = loadWorker('https://desk.example.invalid', { MessageChannel, setTimeout, clearTimeout });
  did = [];
  const sandbox = { url: 'https://desk.example.invalid/?sandbox#/', postMessage: (data, ports) => { did.push(['sandbox message', data.navigate]); ports[0].postMessage({ ok: true }); },
    navigate: async () => { did.push(['sandbox navigate']); return sandbox; }, focus: async () => { did.push(['sandbox focus']); } };
  w.clientsList.push(accepted, sandbox);
  await tap(w);
  assert.deepEqual(did, [['sandbox focus'], ['sandbox message', TAP]]);
});
