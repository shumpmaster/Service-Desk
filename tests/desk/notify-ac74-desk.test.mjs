// ac-test: S-001/AC74 — the desk's side of the tap (the sender's side is notify-ac74.test.mjs). From
// 2026-10-19 (the owner's ruling "A. Go live now, switch later (Recommended)",
// decisions/questions/P-001-notify-which-view.md) a tap opened the trial view at `?sandbox&open=<key>`; from
// stage 8 (AC44, step 4; the notification view amendment, specs/S-001.md:1139-1142) the trial view is the desk,
// a tap's address is `/?open=<key>`, and a `?sandbox` address from an old icon or an old notification opens
// `/` with its other parameters kept, so nothing on the phone breaks:
// - at `/?open=<key>` the desk opens that project and shows the item, in its own design, marked "Opened from
//   a notification": from stage 1a (AC80) the board, Waiting, with that card's sheet open over it, whatever
//   its kind, a deploy's with its run link;
// - a key that no longer waits says "That no longer waits on you" and shows the project; a project
//   that can't be read says so instead;
// - the tap is followed once its project is read, and only once;
// - `/?open=actions-usage` opens its More detail at the GitHub Actions line;
// - an old `/?sandbox&open=<key>` or `/?sandbox` address: the address put right in place, `sandbox` dropped,
//   the rest kept, and the tap followed; plain `/` is the desk's Home.
// (The wait for AC77's closed read, and a held question shown as held, are in
// notify-ac77-desk-reads.test.mjs.) The records are made up (tests/desk/fixtures/notify/made-up,
// labelled NOT real in the README).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fixture, CONFIG } from './helpers.mjs';
import { repo, pr } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll as sbFindAll } from './sandbox-helpers.mjs';
import { openTarget, deskAddress, OPENED_WORDS, GONE_WORDS } from '../../src/lib/notifyview.js';
import { NOTIFY_FIX } from './notify-helpers.mjs';

const made = (p) => readFileSync(join(NOTIFY_FIX, 'made-up', p), 'utf8');
const SEARCH = (key) => `?open=${encodeURIComponent(key)}`;
const SB = (key) => `?sandbox&open=${encodeURIComponent(key)}`;
const NOW = Date.parse('2026-10-18T15:00:00Z');

function repos() {
  return {
    'Service-Desk': repo({
      'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
      'questions/N-open.md': made('questions/N-open.md'),
      'queue/P-951-stop-1.md': made('queue/P-951-stop-1.md'),
    }, [pr(108, 'A made-up pull request to merge')], [
      { name: 'governance', status: 'completed', conclusion: 'success' },
      { path: '.github/workflows/desk-deploy.yml', name: 'desk-deploy', status: 'waiting', conclusion: null, id: 7001, run_number: 40 },
    ]),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]),
  };
}

/** The desk opened by a tap, `/?open=<key>` from stage 8 (the notification view amendment), read once. */
async function opened(key, extra = {}) {
  const app = await loadSandbox({ config: CONFIG, repos: extra.repos || repos(), hash: '', search: SEARCH(key), now: NOW, ...extra });
  await app.advance(1000);
  return app;
}
/** The tap's line: on the screen it opened, or (AC80) in the sheet it opened. */
const banner = (app) => sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'tap-banner')[0] || null;
const sheet = (app) => byClass(app.view, 'v2-sheet')[0] || null;
const findKeyedIn = (el, k) => sbFindAll(el, (e) => e.dataset && e.dataset.k === k)[0] || null;

test('AC74: the tap\'s address is read as AC73\'s key, the cost tap as actions-usage; anything else opens Home', () => {
  assert.deepEqual(openTarget(SEARCH('Service-Desk|question|questions/N-open.md')),
    { kind: 'item', key: 'Service-Desk|question|questions/N-open.md', project: 'Service-Desk', itemKind: 'question', id: 'questions/N-open.md' });
  assert.deepEqual(openTarget(SB('Service-Desk|question|questions/N-open.md')),
    { kind: 'item', key: 'Service-Desk|question|questions/N-open.md', project: 'Service-Desk', itemKind: 'question', id: 'questions/N-open.md' }, 'with `sandbox` first');
  assert.deepEqual(openTarget('?open=actions-usage'), { kind: 'usage' });
  assert.deepEqual(openTarget('?sandbox&open=actions-usage'), { kind: 'usage' });
  assert.equal(openTarget(''), null);
  assert.equal(openTarget('?sandbox'), null);
  assert.equal(openTarget('?open=Service-Desk%7Cnot-a-kind%7Cx').kind, 'bad');
  // From stage 8 (the notification view amendment, specs/S-001.md:1139-1142: "a `?sandbox` address ... opens `/` with
  // its other parameters kept"): the desk's address for an older one, `sandbox` dropped, the rest and the route kept.
  assert.equal(deskAddress('/', SB('Service-Desk|pr|108'), '#/x'), `/${SEARCH('Service-Desk|pr|108')}#/x`);
  assert.equal(deskAddress('/', '?sandbox&open=actions-usage', ''), '/?open=actions-usage');
  assert.equal(deskAddress('/', '?sandbox', '#/waiting'), '/#/waiting');
  assert.equal(deskAddress('/', '?exp=1&sandbox=&open=x', ''), '/?exp=1&open=x', 'the others in their order');
  assert.equal(deskAddress('/', SEARCH('Service-Desk|pr|108'), ''), `/${SEARCH('Service-Desk|pr|108')}`, 'none to drop: unchanged');
});

test('AC74 + AC80 (from stage 8): the desk at /?open=<a question\'s key> opens Waiting with its sheet, marked "Opened from a notification"; the address left at /', async () => {
  const app = await opened('Service-Desk|question|questions/N-open.md');
  try {
    assert.equal(app.loc.hash, `#/waiting/card/${encodeURIComponent('Service-Desk|question|questions/N-open.md')}`);
    assert.equal(banner(app).textContent, OPENED_WORDS);
    assert.ok(sheet(app), 'its sheet');
    assert.ok(sheet(app).textContent.includes('A made-up open question'));
    assert.ok(findKeyedIn(sheet(app), 'tap-banner'), 'the line in the sheet');
    assert.ok(byClass(app.view, 'v2-lanes').length, 'over the board');
    // From stage 8 (the notification view amendment, specs/S-001.md:1139-1142): the address left is the desk's own, `/`.
    assert.deepEqual(app.addresses, ['/'], 'the ?open= dropped, so a reload doesn\'t follow it again');
  } finally {
    app.restore();
  }
});

test('AC74 (2026-10-19) + AC80: a card\'s, a pull request\'s and a deploy\'s keys open Waiting with that card\'s sheet, a deploy\'s with its run link', async () => {
  let app = await opened('Service-Desk|card|queue/P-951-stop-1.md');
  try {
    assert.match(app.loc.hash, /^#\/waiting\/card\//);
    assert.equal(banner(app).textContent, OPENED_WORDS);
    assert.ok(sheet(app) && sheet(app).textContent.includes('A made-up decision for the sender\'s tests'));
  } finally {
    app.restore();
  }
  app = await opened('Service-Desk|pr|108');
  try {
    assert.match(app.loc.hash, /^#\/waiting\/card\//);
    assert.equal(banner(app).textContent, OPENED_WORDS);
    const t = byClass(sheet(app), 'v2-stitle')[0];
    assert.ok(t && t.textContent.includes('A made-up pull request to merge'), 'the pull request\'s sheet');
    assert.ok(sbFindAll(sheet(app), (e) => e.tag === 'a' && e.attrs.href === 'https://github.com/shumpmaster/Service-Desk/pull/108').length, 'its link to GitHub');
  } finally {
    app.restore();
  }
  app = await opened('Service-Desk|deploy|7001');
  try {
    assert.match(app.loc.hash, /^#\/waiting\/card\//);
    assert.equal(banner(app).textContent, OPENED_WORDS);
    assert.ok(sheet(app), 'the deploy\'s sheet');
    assert.ok(sheet(app).textContent.includes('waiting for approval'), sheet(app).textContent);
    assert.ok(sbFindAll(sheet(app), (e) => e.tag === 'a' && /\/actions\/runs\//.test(e.attrs.href)).length, 'its run link');
  } finally {
    app.restore();
  }
});

test('AC74 (2026-10-19): a key that no longer waits says "That no longer waits on you" and shows the project; an unknown project shows Home', async () => {
  let app = await opened('Service-Desk|question|questions/N-answered-already.md');
  try {
    assert.equal(app.loc.hash, '#/p/Service-Desk');
    assert.equal(banner(app).textContent, GONE_WORDS);
    assert.ok(!app.text().includes(OPENED_WORDS));
    assert.ok(byClass(app.view, 'sb-more').length, 'the project\'s view');
  } finally {
    app.restore();
  }
  app = await opened('Somewhere-Else|pr|1');
  try {
    assert.equal(app.loc.hash, '#/');
    assert.equal(banner(app).textContent, GONE_WORDS);
  } finally {
    app.restore();
  }
});

test('AC74 (2026-10-19): the tap is followed once the project is read, not before; a project that can\'t be read says so; and only once', async () => {
  const r = repos();
  r['Service-Desk'].fail = { kind: 'network' };
  const app = await loadSandbox({ config: CONFIG, repos: r, hash: '', search: SEARCH('Service-Desk|question|questions/N-open.md'), now: NOW });
  try {
    await app.advance(1000);
    // Can't read: it opens the project and says so, rather than claiming the item no longer waits.
    await app.advance(4 * 60_000);
    assert.equal(app.loc.hash, '#/p/Service-Desk');
    assert.ok(!app.text().includes(GONE_WORDS));
    assert.equal(banner(app).textContent, `${OPENED_WORDS}: the desk can't read this project just now`);
    delete r['Service-Desk'].fail;
    await app.go('#/');
    await app.advance(60_000);
    assert.equal(app.loc.hash, '#/', 'followed once only');
    assert.equal(banner(app), null, 'its line stays with the screen it opened');
  } finally {
    app.restore();
  }
});

test('AC74, AC78 (from stage 8): /?open=actions-usage opens the desk\'s More detail at the "GitHub Actions this month" line', async () => {
  const app = await opened('actions-usage');
  try {
    assert.equal(app.loc.hash, '#/p/Service-Desk', 'the project whose entry holds actionsUsage (J7)');
    const more = byClass(app.view, 'sb-more')[0];
    assert.ok(more, 'More detail');
    assert.ok('open' in more.attrs, 'opened');
    const line = sbFindAll(more, (e) => e.attrs && e.attrs.id === 'actions-usage')[0];
    assert.ok(line && line.textContent.startsWith('GitHub Actions this month'));
  } finally {
    app.restore();
  }
});

// From stage 8 (AC44, step 4, specs/S-001.md:2918-2921; the notification view amendment, :1139-1142: "a `?sandbox`
// address, from an old icon or an old notification, opens `/` with its other parameters kept, so nothing on the phone
// breaks"): the accepted view's forward to the trial view is gone with both; the page's own entry (app.js) now puts
// an old `?sandbox` address right in place and draws the desk, and plain `/` is the desk's Home.
// The counterpart of the accepted view's forward and of its "the address is not stripped first" (2026-10-19, found in
// Chromium): the old address is put right with its `?open=` kept, and only then is the tap followed and dropped.
test('AC74 (from stage 8): an old /?sandbox&open=<key> address is put right in place, sandbox dropped and the rest kept (the tap not stripped first), and its tap followed; /?sandbox opens the same screen at /', async () => {
  for (const [key, landed] of [['Service-Desk|question|questions/N-open.md', /^#\/waiting\/card\//], ['Service-Desk|pr|108', /^#\/waiting\/card\//], ['actions-usage', /^#\/p\/Service-Desk$/]]) {
    const app = await loadSandbox({ config: CONFIG, repos: repos(), hash: '', search: SB(key), now: NOW, entry: true });
    try {
      await app.advance(1000);
      assert.equal(app.addresses[0], `/${SEARCH(key)}`, `${key}: sandbox dropped, the tap kept, in place (no second load)`);
      assert.match(app.loc.hash, landed, `${key}: the tap followed`);
      assert.equal(app.addresses[app.addresses.length - 1], '/', 'then the ?open= dropped, as for any tap');
      assert.ok(app.server.calls.some((c) => c.path === '/api/poll'), 'the desk reads');
    } finally {
      app.restore();
    }
  }
  let app = await loadSandbox({ config: CONFIG, repos: repos(), hash: '#/waiting', search: '?sandbox', now: NOW, entry: true });
  try {
    await app.advance(1000);
    assert.deepEqual(app.addresses, ['/#/waiting'], 'the same screen at /');
    assert.equal(app.loc.hash, '#/waiting');
    assert.ok(byClass(app.view, 'v2-board').length, 'Waiting, drawn');
  } finally {
    app.restore();
  }
});

test('AC74 (from stage 8): plain / is the desk\'s Home, with nothing to put right; the accepted view\'s Home is gone (AC44, step 4)', async () => {
  const app = await loadSandbox({ config: CONFIG, repos: repos(), hash: '', search: '', now: NOW, entry: true });
  try {
    await app.advance(1000);
    assert.deepEqual(app.addresses, [], 'plain /: nothing to put right');
    assert.ok(app.server.calls.some((c) => c.path === '/api/poll'), 'the desk reads');
    assert.ok(byClass(app.view, 'v2-home').length, 'the desk\'s Home');
    assert.equal(sbFindAll(app.view, (e) => e.attrs && e.attrs.id === 'more-detail').length, 0, 'none of the accepted view\'s Home');
  } finally {
    app.restore();
  }
});

// From stage 8 (the notification view amendment, specs/S-001.md:1139-1142): every open desk window takes a tap the
// service worker hands it (sw.js), whatever address the tap carries, an old `?sandbox` one among them.
test('AC74 (from stage 8): a tap handed to an open desk, at /?open=<key> or at an old /?sandbox&open=<key>, is taken and followed', async () => {
  for (const search of [SEARCH('Service-Desk|pr|108'), SB('Service-Desk|pr|108')]) {
    const nav = { listeners: [], replies: [] };
    nav.serviceWorker = { addEventListener: (t, fn) => { if (t === 'message') nav.listeners.push(fn); } };
    const app = await loadSandbox({ config: CONFIG, repos: repos(), hash: '#/', search: '', now: NOW, globals: { navigator: nav } });
    try {
      await app.advance(1000);
      for (const fn of nav.listeners) fn({ data: { kind: 'desk-open', navigate: `https://desk.example.invalid/${search}` }, ports: [{ postMessage: (m) => nav.replies.push(m) }] });
      await app.advance(1000);
      assert.deepEqual(nav.replies, [{ ok: true }], search);
      assert.match(app.loc.hash, /^#\/waiting\/card\//, `${search}: the pull request's sheet`);
      assert.equal(banner(app).textContent, OPENED_WORDS);
    } finally {
      app.restore();
    }
  }
});
