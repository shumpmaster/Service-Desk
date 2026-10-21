// ac-test: S-001/AC82 — Home in the trial view (desk mockup v2, frames H1 to H5; stage 2): the briefing,
// "Since you last looked" with "Mark as seen", one full-width tile per project in frame H5's groups, a
// tile's tap opening the Status screen until stage 3, and "More detail" folded last at the foot. The page
// is the sandbox's own code under the fake DOM, from J11's fixture (Service-Desk at 3117150, real), AC52's
// one-of-each project and a v2.5 project (screen-text.mjs), M3A's fixtures for Work ahead (wa-fixtures.mjs),
// and made-up cases (NOT real records, tests/desk/fixtures/README.md). AC40's "Mark as seen" (changed by
// AC82) is checked here and in j24-since.test.mjs.
// ac-test: S-001/AC40
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CONFIG, SRC, fixture } from './helpers.mjs';
import { repo, pr } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { NOW, v3, v25, fullRepo, twoProjects } from './sandbox-fixtures.mjs';
import { textSetup } from './screen-text.mjs';
import { waSetup, WORKED, memStore } from './wa-fixtures.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { MARKS_KEY } from '../../src/lib/board.js';
import { MARKERS_OFF } from '../../src/lib/seen.js';
import { briefingView, settleWords, briefAge, HOME_WORDS } from '../../src/lib/home.js';

const TZ = CONFIG.ownerTimeZone;
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const brief = (app) => byClass(app.view, 'v2-brief')[0];
const iso = (ms) => new Date(ms).toISOString();
const looked = (ms, extra = {}) => memStore({ 'desk-seen-v1': JSON.stringify({ lastLooked: ms }), ...extra });
async function open(setup = textSetup(), { hash = '#/', store = null, now = NOW } = {}) {
  const app = await loadSandbox({ ...setup, hash, now, store });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}

// ---------------------------------------------------------------------------
// The briefing, every form (made up: a board's view as boardView gives it)

const card = (project, extra = {}) => ({ project, kind: 'pr', raisedAt: null, ...extra });
const question = (project, q, raisedAt) => card(project, { kind: 'question', raisedAt, flag: { question: { parsed: q } } });
function board({ wait = [], kick = [], agents = 0, pendingAny = false } = {}) {
  const counts = new Map();
  for (const c of [...wait, ...kick]) if (!counts.has(c.project)) counts.set(c.project, { waiting: 0, kicked: 0 });
  for (const c of wait) counts.get(c.project).waiting++;
  for (const c of kick) counts.get(c.project).kicked++;
  const lane = (key, rows) => ({ key, groups: [...new Set(rows.map((c) => c.project))].map((p) => ({ project: p, rows: rows.filter((c) => c.project === p) })) });
  return { badge: wait.length + kick.length, counts, lanes: [lane('wait', wait), lane('kick', kick), { key: 'done', groups: [] }],
    quiet: { agents: Array.from({ length: agents }, () => ({})) }, pendingAny };
}
const ok = (name, since = NOW - 60e3) => ({ name, read: { read: 'ok', since }, drawError: null });
const view = (bd, extra = {}) => briefingView({ bd, reads: [ok('Alpha'), ok('Beta')], flagged: bd.badge, signedOut: false, v3: (n) => n !== 'Old', lastReadMs: NOW - 60e3, nowMs: NOW, tz: TZ, ...extra });
const REV = { reversibility: 'reversible', default: 'C', timeout: '48' };
const IRR = { reversibility: 'irreversible' };

test('AC82: the briefing when something needs the owner — "<n> need you", then the parts that apply in order, each left out at zero: "<w> waiting, <k> kicked back", "oldest <age>" from the cards with a raised time, the settle times, "can\'t be undone"', () => {
  const raised = NOW - 4 * 3600e3;
  const full = view(board({
    wait: [card('Alpha', { raisedAt: raised }), card('Alpha', { raisedAt: NOW - 3600e3 }), card('Beta'), question('Alpha', REV, NOW - 3600e3), question('Beta', IRR, null), card('Beta'), card('Alpha')],
    kick: [card('Beta', { raisedAt: NOW - 9 * 86400e3 })] }));
  assert.equal(full.kind, 'you');
  assert.equal(full.head, '8 need you', 'n is Waiting\'s badge');
  assert.equal(full.parts, `7 waiting, 1 kicked back · oldest 4 h · one question settles itself ${settleWords(NOW - 3600e3 + 48 * 3600e3, NOW, TZ)} · one can't be undone`);
  assert.equal(settleWords(NOW - 3600e3 + 48 * 3600e3, NOW, TZ), 'Fri 09:00', 'within 7 days: weekday and time, in ownerTimeZone');
  // "oldest": "Waiting on you"'s cards only (not "Kicked back"), and only those with a raised time.
  assert.equal(view(board({ wait: [card('Alpha')], kick: [] })).parts, '1 waiting', 'no raised time: no "oldest"');
  assert.equal(view(board({ wait: [], kick: [card('Alpha', { raisedAt: raised })] })).parts, '1 kicked back', 'the waiting part left out at zero; a kicked-back card gives no "oldest"');
  assert.equal(view(board({ wait: [card('Alpha', { raisedAt: raised })] })).head, '1 needs you');
  // Two settling; two that can't be undone; a v2.5 project's question counts for neither (v3 owner questions only).
  const two = view(board({ wait: [question('Alpha', REV, NOW - 3600e3), question('Beta', { ...REV, timeout: '24' }, NOW - 3600e3), question('Alpha', IRR, NOW - 60e3), question('Beta', IRR, NOW - 60e3),
    { ...question('Old', REV, NOW - 3600e3), v25: true }] }));
  assert.equal(two.parts, `5 waiting · oldest 1 h · 2 questions settle themselves, the first ${settleWords(NOW + 23 * 3600e3, NOW, TZ)} · 2 can't be undone`);
  assert.equal(view(board({ wait: [question('Alpha', { reversibility: 'reversible', default: 'B' }, NOW)] })).parts, '1 waiting · oldest 0 s', 'no TIMEOUT: it does not settle itself');
  assert.deepEqual([briefAge(35 * 60e3), briefAge(4 * 3600e3 + 59 * 60e3), briefAge(2 * 86400e3 + 3600e3)], ['35 m', '4 h', '2 d'], 'the board\'s age form, brief');
});

test('AC82: the settle time is AC12\'s sum (its raised time plus TIMEOUT hours) in ownerTimeZone across the 1 Nov clock change; "21 Oct, 13:37" beyond the next 7 days', () => {
  const raised = Date.parse('2026-10-31T18:37:00Z'); // 13:37 CDT, a day before the clocks go back
  const at = raised + 48 * 3600e3;
  assert.equal(settleWords(at, Date.parse('2026-10-31T20:00:00Z'), TZ), 'Mon 12:37', '48 hours later is 12:37 CST: the hour the clocks went back');
  assert.equal(settleWords(raised + 240 * 3600e3, Date.parse('2026-10-31T20:00:00Z'), TZ), '10 Nov, 12:37', 'beyond 7 days: the date and time');
  assert.equal(settleWords(Date.parse('2026-10-21T18:37:00Z'), Date.parse('2026-10-31T20:00:00Z'), TZ), '21 Oct, 13:37', 'a time already past reads as a date');
  const v = view(board({ wait: [question('Alpha', REV, raised)] }), { nowMs: Date.parse('2026-10-31T20:00:00Z') });
  assert.match(v.parts, /one question settles itself Mon 12:37$/);
});

test('AC82: "Nothing needs you" only under Quiet\'s rule, with "Every project read <age> ago" and "with the agents: <n>" from 1; otherwise "Checking…", "Can\'t read <project> since HH:MM" (AC5), "Nothing waiting on you · confirming with GitHub" (a mark unconfirmed), or signed out', () => {
  const q = view(board({ agents: 2 }));
  assert.deepEqual([q.kind, q.head, q.sub], ['quiet', 'Nothing needs you', 'Every project read 1 min ago · with the agents: 2']);
  assert.equal(view(board()).sub, 'Every project read 1 min ago', 'no agents line at 0');
  const checking = view(board(), { reads: [ok('Alpha'), { name: 'Beta', read: { read: 'checking' } }] });
  assert.deepEqual([checking.kind, checking.head], ['checking', HOME_WORDS.checking], 'never quiet while a project is unread');
  const cant = view(board(), { reads: [ok('Alpha'), { name: 'Beta', read: { read: 'cant-read', since: Date.parse('2026-10-14T14:20:00Z'), words: 'x' } }] });
  assert.deepEqual([cant.kind, cant.head], ['cant', "Can't read Beta since 09:20"], 'AC5\'s words, never quiet');
  const two = view(board(), { reads: [{ name: 'Alpha', read: { read: 'cant-read', since: NOW - 3600e3 } }, { name: 'Beta', read: { read: 'cant-read', since: NOW - 7200e3 } }] });
  assert.deepEqual([two.head, ...two.cant], ["Can't read Alpha since 09:00", "Can't read Beta since 08:00"], 'one line per such project');
  const waits = view(board({ wait: [card('Alpha')] }), { reads: [ok('Alpha'), { name: 'Beta', read: { read: 'cant-read', since: NOW - 3600e3 } }] });
  assert.deepEqual([waits.kind, waits.cant], ['you', ["Can't read Beta since 09:00"]], 'what needs the owner first, and the project that can\'t be read under it');
  const conf = view(board({ pendingAny: true }), { flagged: 1 });
  assert.deepEqual([conf.kind, conf.head], ['confirming', 'Nothing waiting on you · confirming with GitHub'], 'Quiet still needs GitHub\'s word');
  assert.equal(view(board(), { signedOut: true }).head, 'Signed out — reload to sign in');
});

// ---------------------------------------------------------------------------
// On the page

test('AC82: Home, top to bottom (frame H1): the marker, the title, "checked <age> ago", the briefing (one tap from Waiting), "Since you last looked", the three groups, and "More detail" last, closed; no "Work ahead ›", no "⋯ More" pill, no "Latest"', async () => {
  const app = await loadSandbox({ ...textSetup(), hash: '#/', now: NOW, store: looked(NOW - 6 * 3600e3) });
  try {
    assert.equal(keyed(app, 'home-checked').textContent, 'Checking…', 'before every project has been read once in this opening');
    await app.advance(1000);
    await app.advance(61_000);
    const home = byClass(app.view, 'v2-home')[0];
    assert.ok(home.className.split(' ').includes('v2'), 'on mockup v2\'s tokens');
    const order = home.children.map((c) => (c.dataset.k || c.className.split(' ')[0]));
    assert.deepEqual(order.filter((k) => k !== 'notify:top' && k !== 'since-more'), ['sb-marker', 'v2-top', 'home-checked', 'brief', 'since-h', 'since', 'hgroups', 'home-more-detail'], '("<n> more" under the list when it runs past four)');
    assert.equal(byClass(home, 'v2-title')[0].textContent, 'Home');
    assert.match(keyed(app, 'home-checked').textContent, /^checked \d+ (s|min) ago$/, 'from the stalest project\'s last successful read');
    const b = brief(app);
    assert.equal(b.tag, 'a');
    assert.equal(b.attrs.href, '#/waiting', 'a tap anywhere on it opens Waiting');
    assert.equal(byClass(b, 'v2-go')[0].textContent, 'Waiting ›');
    const fold = keyed(app, 'home-more-detail');
    assert.equal(fold.tag, 'details');
    assert.ok(!('open' in fold.attrs), 'closed until opened');
    assert.equal(home.children[home.children.length - 1], fold, 'below everything else on Home (stage 6a\'s block not yet built)');
    assert.match(fold.textContent, /^More detail/);
    assert.ok(byClass(fold, 'sb-notify-line').length && byClass(fold, 'sb-actions-usage').length, 'the notifications switch and the usage bar (AC75, AC78)');
    assert.equal(keyed(app, 'work-ahead'), null, 'no "Work ahead ›" control (AC24\'s way in is the Plan tab)');
    assert.doesNotMatch(home.textContent, /Work ahead/);
    assert.equal(findAll(home, (e) => e.attrs && /^(More|Latest)$/.test(e.attrs['aria-label'] || '')).length, 0, 'no "⋯ More" pill and no "Latest" control');
    assert.equal(byClass(app.view, 'sb-latest').length + byClass(app.view, 'sb-pc').length + byClass(app.view, 'sb-top').length, 0, 'today\'s Home is gone');
  } finally {
    app.restore();
  }
});

test('AC82: the briefing\'s counts equal the board\'s and the badge\'s, with a mark made on this device', async () => {
  const base = await open(textSetup());
  let before;
  try {
    await base.go('#/waiting');
    before = Number(byClass(byClass(base.view, 'v2-badge')[0], 'sb-vh')[0].textContent.trim().split(' ')[0]);
    await base.go('#/');
    assert.equal(brief(base).textContent.split(' need')[0], String(before), 'the briefing is the badge');
  } finally {
    base.restore();
  }
  const id = 'Alpha|question|questions/Alpha-pick.md';
  const marks = JSON.stringify({ v: 1, marks: { [id]: { project: 'Alpha', step: 'answer', head: null, at: NOW + 30e3, title: "Alpha's question", kind: 'question', name: 'Alpha-pick' } } });
  const app = await open(textSetup(), { store: memStore({ [MARKS_KEY]: marks }) });
  try {
    await app.go('#/waiting');
    const badge = Number(byClass(byClass(app.view, 'v2-badge')[0], 'sb-vh')[0].textContent.trim().split(' ')[0]);
    assert.equal(badge, before - 1, 'the mark leaves the badge');
    await app.go('#/');
    assert.match(brief(app).textContent, new RegExp(`^${badge} need you`), 'and the briefing');
    const tiles = byClass(app.view, 'v2-wt').map((w) => Number((/^(\d+) waits? on you$/.exec(w.textContent) || [0, 0])[1]));
    assert.equal(tiles.reduce((a, b) => a + b, 0), badge, 'and the tiles\' "wait on you", added up');
  } finally {
    app.restore();
  }
});

test('AC82: "Since you last looked" — its heading with the time, "Mark as seen" at its right, four lines then "<n> more since <time> ›" (a sheet); with no record on the device, or storage failing, AC40\'s words and no lines', async () => {
  const app = await open(twoProjects(), { store: looked(NOW - 10 * 3600e3) });
  try {
    const head = keyed(app, 'since-h');
    assert.equal(byClass(head, 'v2-shw')[0].textContent, 'Since you last looked · 00:00');
    assert.equal(keyed(app, 'mark-seen').textContent, 'Mark as seen');
    const lines = byClass(keyed(app, 'since'), 'v2-ev');
    assert.equal(lines.length, 4, 'four, then "more" (P-001-since-count.md, A)');
    for (const l of lines) {
      assert.match(byClass(l, 'v2-tm')[0].textContent, /^\d\d:\d\d$/, 'its time in Plex Mono, today');
      assert.equal(l.children[1].tag, 'svg', 'an icon for who or what');
      assert.match(byClass(l, 'v2-e2')[0].textContent, /^(Alpha|Beta) · /, '"<project> · <its codes>"');
    }
    const more = keyed(app, 'since-more');
    assert.match(more.textContent, /^4 more since 00:00$/);
    assert.equal(more.attrs.href, '#/since');
    await app.go('#/since');
    assert.equal(byClass(keyed(app, 'since-sheet'), 'v2-ev').length, 4, 'the rest, in a sheet');
    assert.equal(app.loc.hash, '#/since');
  } finally {
    app.restore();
  }
  for (const store of [null, memStore({ throws: true })]) {
    if (store) store.throws = true;
    const off = await open(twoProjects(), { store });
    try {
      assert.equal(byClass(keyed(off, 'since-h'), 'v2-shw')[0].textContent, 'Since you last looked');
      assert.equal(keyed(off, 'since-off').textContent, MARKERS_OFF);
      assert.equal(keyed(off, 'mark-seen'), null);
      assert.equal(keyed(off, 'since'), null, 'no lines');
      assert.doesNotMatch(off.text(), /Can't show/);
    } finally {
      off.restore();
    }
  }
});

test('AC82 (AC40\'s no-reorder rule): a new line arrives at the top only while the page is scrolled to its top; scrolled down, it waits behind "<n> newer ›", which a tap brings in', async () => {
  const setup = twoProjects();
  const app = await open(setup, { store: looked(NOW - 10 * 3600e3) });
  try {
    const words = () => byClass(keyed(app, 'since'), 'v2-e1').map((e) => e.textContent);
    const first = words();
    window.scrollY = 300;
    setup.repos.Alpha.pulls = [...setup.repos.Alpha.pulls, pr(91, 'A made-up new pull request', { head: 'cos/new', headRepo: 'shumpmaster/Alpha', createdAt: iso(app.now) })];
    await app.advance(POLL_MS);
    assert.deepEqual(words(), first, 'nothing moves under the owner\'s thumb');
    const newer = keyed(app, 'since-newer');
    assert.equal(newer.textContent, '1 newer');
    await app.tap(newer);
    assert.equal(words()[0], 'Opened: A made-up new pull request', 'at the top once asked for');
    assert.equal(keyed(app, 'since-newer'), null);
    window.scrollY = 0;
    setup.repos.Alpha.pulls = [...setup.repos.Alpha.pulls, pr(92, 'Another', { head: 'cos/b', headRepo: 'shumpmaster/Alpha', createdAt: iso(app.now) })];
    await app.advance(POLL_MS);
    assert.equal(words()[0], 'Opened: Another', 'at the top of the page: it arrives at once');
  } finally {
    app.restore();
  }
});

test('AC82 + AC40 (changed): "Mark as seen" sets "last looked" to now on this device at once and empties the list', async () => {
  const store = looked(NOW - 10 * 3600e3);
  const app = await open(twoProjects(), { store });
  try {
    assert.ok(byClass(keyed(app, 'since'), 'v2-ev').length);
    await app.tap(keyed(app, 'mark-seen'));
    assert.equal(JSON.parse(store.m.get('desk-seen-v1')).lastLooked, app.now);
    assert.equal(keyed(app, 'since'), null);
    assert.equal(keyed(app, 'since-none').textContent, 'Nothing new since 10:01');
  } finally {
    app.restore();
  }
});

test('AC82: each tile, top to bottom (frame H5) — Service-Desk (a second run, its reason not recorded), a project with a gate waiting, and a v2.5 project; no "Latest" bubble on any', async () => {
  const app = await open(textSetup());
  try {
    const lines = (name) => byClass(keyed(app, `card:${name}`), 'v2-ln').map((l) => l.textContent);
    const top = (name) => keyed(app, `card:${name}`).children[0];
    assert.deepEqual(top('Service-Desk').children.map((c) => c.textContent), ['Service-Desk', 'Nothing waiting']);
    assert.deepEqual(lines('Service-Desk'), ['Now: Design, run 2 · why it went back: not recorded', 'No agent run recorded since 8 Oct', 'Next: M1 · no estimate yet']);
    // Alpha (AC52's one-of-each, NOT real): a Build-gate card waiting, a builder dispatched.
    assert.match(top('Alpha').textContent, /^Alpha\d+ wait on you$/);
    assert.equal(lines('Alpha')[1], 'At work: Builder on P-003');
    assert.equal(lines('Alpha')[2], 'Next: the Build gate, after your ruling');
    const nextIcon = byClass(keyed(app, 'card:Alpha'), 'v2-ln')[2].children[0];
    assert.match(nextIcon.getAttribute('class'), /st-you/, 'the vermilion ◆ beside it');
    assert.match(keyed(app, 'ptl-words:Alpha').textContent, /the Build gate waits on you/, 'and in the timeline, said in words');
    assert.ok(findAll(keyed(app, 'card:Alpha'), (e) => / v2-c /.test(` ${e.className} `) && /\bph-build\b/.test(e.className) && e.children.some((x) => x.tag === 'svg' && /st-you/.test(x.getAttribute('class')))).length, 'the ◆ in the Build cell');
    assert.deepEqual(lines('Delta'), ['Now: sprint m1.4 · older pipeline: sprints, not phases', 'No dispatch log: not used here', 'Next: sprint m1.4 · no estimate filed']);
    for (const n of ['Service-Desk', 'Alpha', 'Delta']) {
      assert.equal(byClass(keyed(app, `card:${n}`), 'sb-bubble').length + findAll(keyed(app, `card:${n}`), (e) => e.attrs && e.attrs['aria-label'] === 'Latest').length, 0, `${n}: no "Latest"`);
      assert.equal(byClass(keyed(app, `card:${n}`), 'sb-sum').length, 1, `${n}: its README summary`);
    }
  } finally {
    app.restore();
  }
});

test('AC82: a tile\'s "Next:" is the first milestone not reached in the owner\'s order with AC24\'s rough finish, as Plan shows it; "no estimate yet" without one', async () => {
  // M3A's fixture day, 18 Oct (its estimates made that day).
  const app = await open(waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } }), { now: Date.parse('2026-10-18T18:00:00Z') });
  try {
    const next = byClass(keyed(app, 'card:Service-Desk'), 'v2-ln').map((l) => l.textContent).find((t) => /^Next:/.test(t));
    assert.match(next, /^Next: MD1 · rough finish /);
    await app.go('#/work');
    const words = app.text();
    const finish = /^Next: MD1 · rough finish (.+)$/.exec(next)[1];
    assert.ok(words.includes(finish), `Plan's rough finish for MD1, ${finish}`);
  } finally {
    app.restore();
  }
});

test('AC82: the groups in frame H5\'s words and order, the first two open and Done closed; a tap folds and opens one and the tiles a row: one below 720 px, two from 720 px, Home\'s column at most 960 px', async () => {
  const app = await open(textSetup());
  try {
    const heads = byClass(app.view, 'v2-hg');
    assert.deepEqual(heads.map((h) => [byClass(h, 'v2-hgt')[0].textContent, h.attrs['aria-expanded']]),
      [['Your projects · active', 'true'], ['Closed or not run by the desk', 'true'], ['Done', 'false']]);
    heads[0].click();
    await app.flush();
    assert.equal(byClass(app.view, 'v2-hg')[0].attrs['aria-expanded'], 'false');
    assert.equal(byClass(app.view, 'v2-hgroup')[0].children.length, 1, 'folded to its header');
  } finally {
    app.restore();
  }
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  assert.match(css, /\n\.v2-tiles \{ display: grid; grid-template-columns: minmax\(0, 1fr\);/);
  const wide = /@media \(min-width: 720px\) \{([\s\S]*?)\n\}/.exec(css)[1];
  assert.match(wide, /html\.sb\.v2-page\.v2-home body \{ max-width: 960px; \}/);
  assert.match(wide, /\.v2-tiles \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
});

test('AC82: a tile\'s tap opens the project\'s Status screen in stage 2 (AC81, "Until stage 3"; stage 3 rewrites this case for the page)', async () => {
  const app = await open(textSetup());
  try {
    for (const n of ['Service-Desk', 'Alpha', 'Delta']) assert.equal(byClass(keyed(app, `card:${n}`), 'v2-ta')[0].attrs.href, `#/p/${n}`);
    await app.go(byClass(keyed(app, 'card:Service-Desk'), 'v2-ta')[0].attrs.href);
    assert.match(app.text(), /Current status/);
    assert.equal(byClass(app.view, 'v2-row').length, 1, 'stage 1a\'s form, its top row');
  } finally {
    app.restore();
  }
});

test('AC82 (part A, items 4 and 6): Home from H5\'s extremes and from a project that can\'t be read renders without error; never quiet while one can\'t be read', async () => {
  const { extremes } = await import('./sandbox-fixtures.mjs');
  const x = await open(extremes(), { store: looked(NOW - 9 * 86400e3) });
  try {
    assert.doesNotMatch(x.text(), /Can't show/);
    assert.equal(byClass(x.view, 'v2-shw')[0].textContent, 'Since you last looked · in the last 7 days');
  } finally {
    x.restore();
  }
  const setup = { config: { ...CONFIG, projects: [v3('Alpha'), v25('Delta')] }, repos: { Alpha: fullRepo('Alpha'), Delta: repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }) } };
  setup.repos.Delta.fail = { kind: 'network' };
  const app = await open(setup);
  try {
    await app.advance(4 * POLL_MS);
    assert.ok(brief(app).textContent.includes("Can't read Delta since"), brief(app).textContent);
    assert.equal(byClass(keyed(app, 'card:Delta'), 'v2-wt')[0].textContent, "Can't read");
    assert.doesNotMatch(app.text(), /Nothing needs you/);
  } finally {
    app.restore();
  }
});
