// ac-test: S-001/AC74 — the desk's side of the tap (the sender's side is notify-ac74.test.mjs). From
// 2026-10-19 (the owner's ruling "A. Go live now, switch later (Recommended)",
// decisions/questions/P-001-notify-which-view.md) a tap opens the sandbox view, the owner's page:
// - at `?sandbox&open=<key>` it opens that project and shows the item, in the sandbox's own design,
//   marked "Opened from a notification": a card's, a question's and a pull request's response sheet;
//   a deploy's row in the Queue's Deploys, with its run link; from stage 1a (AC80) the board, Waiting,
//   with that card's sheet open over it, whatever its kind, a deploy's with its run link;
// - a key that no longer waits says "That no longer waits on you" and shows the project; a project
//   that can't be read says so instead;
// - the tap is followed once its project is read, and only once;
// - `?sandbox&open=actions-usage` opens its More detail at the GitHub Actions line;
// - the accepted view, given `/?open=<key>`, replaces it with `/?sandbox&open=<key>`; plain `/`
//   stays the accepted view.
// (The wait for AC77's closed read, and a held question shown as held, are in
// notify-ac77-desk-reads.test.mjs.) The records are made up (tests/desk/fixtures/notify/made-up,
// labelled NOT real in the README).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fixture, CONFIG } from './helpers.mjs';
import { repo, pr } from './fake-desk.mjs';
import { loadApp, findAll } from './page-harness.mjs';
import { loadSandbox, byClass, findAll as sbFindAll } from './sandbox-helpers.mjs';
import { openTarget, sandboxAddress, OPENED_WORDS, GONE_WORDS } from '../../src/lib/notifyview.js';
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

/** The sandbox opened by a tap, `?sandbox&open=<key>`, read once. */
async function opened(key, extra = {}) {
  const app = await loadSandbox({ config: CONFIG, repos: extra.repos || repos(), hash: '', search: SB(key), now: NOW, ...extra });
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
  // The sandbox's address for an older one: `sandbox` added first, the rest kept.
  assert.equal(sandboxAddress('/', SEARCH('Service-Desk|pr|108'), '#/x'), `/${SB('Service-Desk|pr|108')}#/x`);
  assert.equal(sandboxAddress('/', '?sandbox&open=actions-usage', ''), '/?sandbox&open=actions-usage');
});

test('AC74 (2026-10-19) + AC80: the sandbox at ?sandbox&open=<a question\'s key> opens Waiting with its sheet, marked "Opened from a notification"; the address keeps ?sandbox only', async () => {
  const app = await opened('Service-Desk|question|questions/N-open.md');
  try {
    assert.equal(app.loc.hash, `#/waiting/card/${encodeURIComponent('Service-Desk|question|questions/N-open.md')}`);
    assert.equal(banner(app).textContent, OPENED_WORDS);
    assert.ok(sheet(app), 'its sheet');
    assert.ok(sheet(app).textContent.includes('A made-up open question'));
    assert.ok(findKeyedIn(sheet(app), 'tap-banner'), 'the line in the sheet');
    assert.ok(byClass(app.view, 'v2-lanes').length, 'over the board');
    assert.deepEqual(app.addresses, ['/?sandbox'], 'the ?open= dropped, so a reload doesn\'t follow it again');
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
  const app = await loadSandbox({ config: CONFIG, repos: r, hash: '', search: SB('Service-Desk|question|questions/N-open.md'), now: NOW });
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

test('AC74, AC78 (2026-10-19): ?sandbox&open=actions-usage opens the sandbox\'s More detail at the "GitHub Actions this month" line', async () => {
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

test('AC74 (2026-10-19): the accepted view given /?open=<key> replaces it with /?sandbox&open=<key>; plain / stays the accepted view', async () => {
  for (const key of ['Service-Desk|question|questions/N-open.md', 'Service-Desk|pr|108', 'actions-usage']) {
    const app = await loadApp({ repos: repos(), search: SEARCH(key), hash: '', now: NOW });
    try {
      await app.advance(1000);
      assert.deepEqual(app.replaced, [`/${SB(key)}`], key);
      assert.equal(app.calls().length, 0, 'the accepted view does not start: the sandbox does');
    } finally {
      app.restore();
    }
  }
  const app = await loadApp({ repos: repos(), search: '', hash: '#/', now: NOW });
  try {
    await app.advance(1000);
    assert.deepEqual(app.replaced, [], 'plain /: no forward');
    assert.ok(app.calls().some((c) => c.path === '/api/poll'), 'the accepted view reads as before');
    assert.ok(findAll(app.els.view, (e) => e.attrs && e.attrs.id === 'more-detail').length, 'its Home, unchanged');
  } finally {
    app.restore();
  }
});

test('AC74 (2026-10-19): an older service worker handing a tap to the accepted view sends it on to the sandbox', async () => {
  const nav = { listeners: [], replies: [] };
  nav.serviceWorker = { addEventListener: (t, fn) => { if (t === 'message') nav.listeners.push(fn); } };
  const app = await loadApp({ repos: repos(), search: '', hash: '#/', now: NOW, globals: { navigator: nav } });
  try {
    await app.advance(1000);
    for (const fn of nav.listeners) fn({ data: { kind: 'desk-open', navigate: `https://desk.example.invalid/${SEARCH('Service-Desk|pr|108')}` }, ports: [{ postMessage: (m) => nav.replies.push(m) }] });
    assert.deepEqual(app.replaced, [`/${SB('Service-Desk|pr|108')}#/`]);
    assert.deepEqual(nav.replies, [{ ok: true }]);
  } finally {
    app.restore();
  }
});

// Found in Chromium at 360×740 (2026-10-19): the accepted view's file must not strip `?open=` from the
// address when it loads, or the forward, and the sandbox it loads, would lose the tap.
test('AC74 (2026-10-19): with the browser\'s history, the forward still carries the tap; the address is not stripped first', async () => {
  const stripped = [];
  const history = { replaceState: (s0, t, u) => { stripped.push(u); } };
  const app = await loadApp({ repos: repos(), search: SEARCH('Service-Desk|pr|108'), hash: '', now: NOW, globals: { history } });
  try {
    await app.advance(1000);
    assert.deepEqual(app.replaced, [`/${SB('Service-Desk|pr|108')}`]);
    assert.deepEqual(stripped, [], 'nothing replaced the address before the forward');
  } finally {
    app.restore();
  }
});
