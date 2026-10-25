// ac-test: S-001/AC91 — G9b of "After the glance audit": the line under Home's and Waiting's titles while a first read has
// failed (AC91 (c), "the line under Home's and Waiting's titles"; the owner's ruling of 2026-10-25, "Ruling: A",
// decisions/questions/P-001-glance-checking-line.md: "Say what is known — while any project's first read has failed, Home's
// and Waiting's line under the title says "Not read in this opening" instead of "Checking…"; "Checking…" stays only while a
// first read is still on its way"). AC82's "Under the title" rule as G9b changes it; AC80's Waiting line, AC89 (a)'s one
// project shown alone and AC91 (f)'s lanes and strip, as noted there, kept.
// ac-test: S-001/AC82 ac-test: S-001/AC80 ac-test: S-001/AC89
//
// The pure cases are home.js's `titleLine` (src/lib/home.js, with its src/public/lib copy), fed each project's read from
// universe.js's own `readState`, as the page feeds it. The screen cases are the sandbox's own code under the fake DOM, on
// tests/desk/glance-fixtures.mjs's states over `mix` and `quiet` (Service-Desk's records at 77bfeae, real, with made-up
// projects and failures, and G9b's `failedHeldState` and `G9B_OPENS`), each made-up part labelled NOT real in
// tests/desk/fixtures/README.md. The suite has no browser, so each look is the cascade of the page's own stylesheets over what
// it drew (tests/desk/css-cascade.mjs), in light and dark; the stage's pull request carries the Chromium captures (`g9b-`,
// tests/desk/tools/glance-shots.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS, STALE_MS, REASON_WORDS } from '../../src/lib/scheduler.js';
import { readState } from '../../src/lib/universe.js';
import { titleLine, HOME_WORDS, WAITING_CHECKING } from '../../src/lib/home.js';
import { titleLine as publicTitleLine } from '../../src/public/lib/home.js';
import { ONE_WORDS, oneProjectView } from '../../src/lib/board.js';
import { failedHeldState, G9B_OPENS, unreadState, signedOutState, signedOutMixedState, openingState, orderState, mixState, blobFailState, g8cStore,
  MIX_PROJECT, NOW, SD, POOM, CONFIG, SINCE_LATE } from './glance-fixtures.mjs';

const TZ = CONFIG.ownerTimeZone;
const NOT_READ = 'Not read in this opening';
const CHECKED = /^checked \d+ (s|min) ago$/;
const enc = encodeURIComponent;

// ---------------------------------------------------------------------------
// The pure cases: titleLine, Home's form and Waiting's, from readState as the page takes it

const OPENED = Date.parse('2026-10-14T15:00:00Z');
const AT = OPENED + 90e3; // 90 s into the opening, inside AC5's 3 minutes
const DESK = { openedAt: OPENED, visibleSince: OPENED };
/** One project's read as the page hands it on: its read state (universe.js), whether a read succeeded in this opening, its last success. */
const proj = (st, now = AT, { drawError = null } = {}) => {
  const full = { lastSuccessAt: null, failure: null, checking: false, ...st };
  return { read: readState(full, DESK, now).read, succeeded: full.lastSuccessAt != null && full.lastSuccessAt >= OPENED, lastSuccessAt: full.lastSuccessAt, drawError };
};
const failure = (reason = 'network', since = OPENED + 10e3) => ({ reason, since, words: REASON_WORDS[reason] || 'Signed out — reload to sign in' });
/** AC89 (a)'s states: 1, a first read on its way; 2, its first read failed; 3, read; 5, read and then failing. */
const onItsWay = () => proj({});
const failedFirst = (reason = 'network') => proj({ failure: failure(reason) });
const readAt = (ms) => proj({ lastSuccessAt: ms });
const readThenFailing = (ms) => proj({ lastSuccessAt: ms, failure: failure('network', ms + 5e3) });
/** The line in both forms: [Home's, Waiting's]. */
const both = (reads, nowMs = AT) => [titleLine({ reads, nowMs }), titleLine({ reads, nowMs, waiting: true })];

test('AC91 (c), G9b (pure): "Not read in this opening" is board.js\'s ONE_WORDS.notRead, the words shown alone, and the as-built words are kept: "Checking…" on Home, "checking…" on Waiting', () => {
  assert.equal(ONE_WORDS.notRead, NOT_READ);
  assert.equal(titleLine({ reads: [failedFirst()], nowMs: AT }), ONE_WORDS.notRead, 'one constant, the line shown alone and this one');
  assert.equal(HOME_WORDS.checking, 'Checking…');
  assert.equal(WAITING_CHECKING, 'checking…');
  // The page's copy is the same module (src/public/lib/, kept in step by tools/build.mjs).
  for (const reads of [[onItsWay(), failedFirst()], [onItsWay()], [readAt(AT - 30e3)]]) {
    assert.deepEqual([publicTitleLine({ reads, nowMs: AT }), publicTitleLine({ reads, nowMs: AT, waiting: true })], both(reads), 'src/public/lib/home.js gives the same');
  }
});

test('AC91 (c), G9b (pure): every first read on its way, "Checking…" on Home and "checking…" on Waiting, as built; no project, as built', () => {
  assert.deepEqual(both([onItsWay(), onItsWay(), onItsWay()]), ['Checking…', 'checking…']);
  assert.deepEqual(both([]), ['Checking…', 'checking…'], 'no project read yet (none connected): as built');
  // A first read whose parts are still arriving (the scheduler's pending outcome: `checking`, no failure) is on its way too.
  assert.deepEqual(both([proj({ checking: true }), readAt(AT - 30e3)]), ['Checking…', 'checking…']);
});

test('AC91 (c), G9b (pure): one project in state 2 for a failed read beside one on its way, "Not read in this opening"; the same for the 3-minute cause; every project in state 2; one in state 2 and every other read, never "checked <age> ago"', () => {
  for (const reason of ['network', 'access', 'github', 'rate-limit', 'page']) {
    assert.deepEqual(both([failedFirst(reason), onItsWay(), readAt(AT - 30e3)]), [NOT_READ, NOT_READ], `${reason}: beside one on its way`);
  }
  // The 3-minute cause (C: AC89 (a)'s state 2): a first read unanswered for 3 minutes in view is "can't be read".
  const late = OPENED + STALE_MS + 1000;
  const hung = proj({}, late);
  assert.equal(hung.read, 'cant-read', 'readState: 3 minutes in view with no read answered');
  assert.deepEqual(both([hung, proj({}, late)], late), [NOT_READ, NOT_READ], 'every first read unanswered for 3 minutes');
  assert.deepEqual(both([hung, proj({ checking: true, lastSuccessAt: null }, OPENED + 60e3)], late), [NOT_READ, NOT_READ], 'one hung beside one on its way');
  const hungParts = proj({ checking: true }, late);
  assert.equal(hungParts.read, 'cant-read', 'parts still arriving for 3 minutes: can\'t be read');
  assert.deepEqual(both([hungParts, readAt(late - 30e3)], late), [NOT_READ, NOT_READ]);
  // Before the 3 minutes pass, the same read is still on its way.
  assert.deepEqual(both([proj({}, OPENED + STALE_MS - 1000), readAt(OPENED + 60e3)], OPENED + STALE_MS - 1000), ['Checking…', 'checking…'], 'inside the 3 minutes: on its way');
  assert.deepEqual(both([failedFirst(), failedFirst('access'), failedFirst()]), [NOT_READ, NOT_READ], 'every project in state 2');
  const oneFailed = both([failedFirst(), readAt(AT - 30e3), readAt(AT - 60e3)]);
  assert.deepEqual(oneFailed, [NOT_READ, NOT_READ], 'one in state 2, every other read');
  for (const w of oneFailed) assert.doesNotMatch(w, /checked|ago|\d/, 'no time and no count');
});

test('AC91 (c), G9b (pure): a project read and then failing (state 5) has no first read that failed — beside projects read, "checked <age> ago" from the stalest success; beside one on its way, "Checking…"', () => {
  assert.deepEqual(both([readThenFailing(AT - 80e3), readAt(AT - 20e3)]), ['checked 1 min ago', 'checked 1 min ago'], 'from the stalest success, the failing project\'s');
  assert.deepEqual(both([readThenFailing(AT - 30e3), readAt(AT - 10e3)]), ['checked 30 s ago', 'checked 30 s ago']);
  assert.deepEqual(both([readThenFailing(AT - 30e3), onItsWay()]), ['Checking…', 'checking…']);
  // And beside one in state 2, that one's failed first read says it.
  assert.deepEqual(both([readThenFailing(AT - 30e3), failedFirst()]), [NOT_READ, NOT_READ]);
});

test('AC91 (c), G9b (pure): the state-2 project then read — "checked <age> ago" with every project read, "Checking…" with another on its way, "Not read in this opening" with another in state 2; a failure giving way to a read still arriving, with no other in state 2, "Checking…"', () => {
  const nowRead = readAt(AT - 5e3);
  assert.deepEqual(both([nowRead, readAt(AT - 40e3), readAt(AT - 20e3)]), ['checked 40 s ago', 'checked 40 s ago'], 'every project now read');
  assert.deepEqual(both([nowRead, onItsWay(), readAt(AT - 20e3)]), ['Checking…', 'checking…'], 'another\'s first read still on its way');
  assert.deepEqual(both([nowRead, failedFirst(), readAt(AT - 20e3)]), [NOT_READ, NOT_READ], 'another still in state 2');
  // The scheduler's pending outcome clears the failure and sets `checking`: by AC89 (a) state 1 again, on its way.
  const arriving = proj({ checking: true, failure: null });
  assert.equal(arriving.read, 'checking');
  assert.deepEqual(both([arriving, readAt(AT - 20e3), readAt(AT - 30e3)]), ['Checking…', 'checking…'], 'no other in state 2');
  assert.deepEqual(both([arriving, failedFirst()]), [NOT_READ, NOT_READ], 'beside another in state 2');
});

test('AC91 (c), G9b (pure): a project the desk can\'t draw counts by its read alone — in state 2, "Not read in this opening"; its read pending, on its way; read, the line as built', () => {
  const bad = 'Can\'t show this project: x is not a function';
  assert.deepEqual(both([proj({ failure: failure() }, AT, { drawError: bad }), readAt(AT - 30e3)]), [NOT_READ, NOT_READ], 'can\'t be drawn, its first read failed');
  assert.deepEqual(both([proj({}, AT, { drawError: bad }), readAt(AT - 30e3)]), ['Checking…', 'checking…'], 'can\'t be drawn, its read pending');
  assert.deepEqual(both([proj({ lastSuccessAt: AT - 30e3 }, AT, { drawError: bad }), readAt(AT - 10e3)]), ['checked 30 s ago', 'checked 30 s ago'], 'can be read, can\'t be drawn: as built');
});

test('AC91 (c), G9b (pure): signed out — a project never read before the sign-out is in state 2, "Not read in this opening"; with every project read before it, "checked <age> ago" from the stalest', () => {
  const out = (last) => proj({ lastSuccessAt: last, failure: failure('signed-out') });
  assert.deepEqual(both([out(null), out(null), out(null)]), [NOT_READ, NOT_READ], 'no read before the sign-out');
  assert.deepEqual(both([out(null), out(AT - 30e3), out(AT - 40e3)]), [NOT_READ, NOT_READ], 'one never read before it');
  assert.deepEqual(both([out(AT - 50e3), out(AT - 30e3), out(AT - 40e3)]), ['checked 50 s ago', 'checked 50 s ago'], 'every project read before it');
});

test('AC89 (a), kept in G9b (pure): one project shown alone, its own line — state 1 "Checking…" whatever another\'s read, state 2 "Not read in this opening", state 5 "checked <age> ago"', () => {
  const one = (read, last) => oneProjectView({ name: SD.name, read, lastSuccessAt: last, tz: TZ }).under(AT);
  assert.equal(one({ read: 'checking', since: null }, null), 'Checking…', 'state 1 (another project in state 2 does not enter it)');
  assert.equal(one({ read: 'cant-read', since: OPENED, words: REASON_WORDS.network }, null), NOT_READ, 'state 2');
  assert.equal(one({ read: 'cant-read', since: AT - 10e3, words: REASON_WORDS.network }, AT - 60e3), 'checked 1 min ago', 'state 5');
});

// ---------------------------------------------------------------------------
// The screen cases: Home, and Waiting with every project shown

const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
/** The line under the title on the screen drawn: Home's (`home-checked`) or Waiting's. */
const line = (app) => {
  const el = keyed(app, 'home-checked') || byClass(byClass(app.view, 'v2-board')[0], 'v2-sub')[0];
  assert.ok(el, 'the line under the title');
  return el.textContent;
};
/** The line on Home and on Waiting with every project shown, each read where it is drawn, the screen left on Waiting. */
async function lines(app) {
  await app.go('#/');
  await redraw(app);
  const home = line(app);
  await app.go('#/waiting');
  await redraw(app);
  return [home, line(app)];
}
const briefHead = (app) => byClass(byClass(app.view, 'v2-brief')[0], 'v2-bt1')[0].textContent;
const corner = (app, name) => byClass(keyed(app, `card:${name}`), 'v2-wt')[0].textContent;
const laneEmpty = (app, k) => (byClass(keyed(app, `lane:${k}`), 'v2-empty')[0] || { textContent: null }).textContent;
const strip = (app) => keyed(app, 'lane:kick').textContent;
const lastSuccess = (app, name) => app.desk.states.get(name).lastSuccessAt;
/** A screen opened as G8d's are: "last looked" after the records' dates; `before` called before the page opens, `later` after its first reads. */
async function open(setup, hash = '#/', { before = null, later = null, polls = 1 } = {}) {
  if (before) before();
  const app = await loadSandbox({ ...setup, hash, now: NOW, store: g8cStore(SINCE_LATE) });
  await app.advance(1000);
  for (let i = 0; i < polls; i++) await app.advance(POLL_MS);
  if (later) {
    later();
    await app.advance(3 * POLL_MS);
  }
  return app;
}
/** A project's calls left unanswered while `on()` says so, as AC89 (a)'s "states 1 then 2" case holds them (ac89-after-md3.test.mjs's `hang`). */
function hang(app, name, on) {
  const real = app.server.call;
  app.server.call = (path, body) => (body && body.project === name && on() ? new Promise(() => {}) : real(path, body));
}
async function redraw(app) {
  app.module.refresh();
  await app.flush();
}

test('AC82 + AC80, kept in G9b: the first paint, every first read on its way — "Checking…" on Home, "checking…" on Waiting (as built; Home\'s first paint is also ac82-home.test.mjs\'s and ac87-portfolio.test.mjs\'s)', async () => {
  for (const [hash, want] of [['#/', 'Checking…'], ['#/waiting', 'checking…']]) {
    const app = await loadSandbox({ ...mixState(), hash, now: NOW, store: g8cStore(SINCE_LATE) });
    try {
      assert.equal(line(app), want, hash);
    } finally {
      app.restore();
    }
  }
});

test('AC91 (c), G9b: one project\'s first read failing while another\'s is held pending — "Not read in this opening" on Home and on Waiting; the held project\'s corner "Checking…", the briefing\'s "Can\'t read <project> in this opening", the lanes and the strip unchanged; the held read then answering, still "Not read in this opening"; the failed project then read, "checked <age> ago" on the first draw after it', async () => {
  const s = failedHeldState();
  const app = await open(s);
  try {
    assert.equal(line(app), NOT_READ, 'Home');
    assert.equal(corner(app, SD.name), 'Checking…', 'the held project\'s tile corner, unchanged');
    assert.equal(briefHead(app), `Can't read ${MIX_PROJECT} in this opening`, 'the briefing\'s can\'t-read line, unchanged');
    assert.ok(byClass(byClass(app.view, 'v2-brief')[0], 'v2-bi')[0].children.some((c) => c.tag === 'svg'), 'with its ✕');
    // The accepted views' screen state (AC4), unchanged: "Checking…" stays there for the read on its way.
    assert.equal(document.title, 'Service Desk — Not quiet: can\'t read 1 project · Checking…', 'the screen state, as built');
    await app.go('#/waiting');
    assert.equal(line(app), NOT_READ, 'Waiting, every project shown');
    assert.ok(keyed(app, `ql:cant:${MIX_PROJECT}`), 'Waiting\'s own "Can\'t read" line, unchanged');
    // The lanes and the strip as built (AC91 (f)): Personal-Org-Operating-Model is read here, so they know their emptiness.
    assert.deepEqual([laneEmpty(app, 'wait'), strip(app)], ['Nothing here', 'Kicked back · none'], 'the lanes and the strip, as built');
    // The held read answering: Service-Desk read, the made-up project still in state 2.
    s.release();
    await app.advance(2 * POLL_MS);
    assert.ok(lastSuccess(app, SD.name) != null, 'Service-Desk read');
    assert.equal(lastSuccess(app, MIX_PROJECT), null, 'the made-up project still never read');
    assert.deepEqual(await lines(app), [NOT_READ, NOT_READ], 'still "Not read in this opening"');
    // The failed project then read: at each draw the line says what is so, and leaves "Not read in this opening" on the
    // first draw after its read succeeds.
    s.mend();
    let steps = 0;
    while (lastSuccess(app, MIX_PROJECT) == null) {
      assert.equal(line(app), NOT_READ, 'still failing');
      await app.advance(1000);
      assert.ok(++steps < 3 * POLL_MS / 1000, 'the made-up project read');
    }
    assert.match(line(app), CHECKED, 'on the first draw after its read: Waiting');
    await app.go('#/');
    assert.match(line(app), CHECKED, 'and Home');
  } finally {
    s.release();
    app.restore();
  }
});

test('AC91 (f), kept in G9b: with one project\'s first read failed and the other\'s on its way, the lanes say "Not read yet" and the strip "Kicked back · not read yet" while the line says "Not read in this opening"', async () => {
  // failedHeldState with Personal-Org-Operating-Model's first read held too (made up, NOT how any read went), so no project is read.
  const s = failedHeldState();
  s.repos[POOM.name].hold = s.repos[SD.name].hold;
  const app = await open(s, '#/waiting');
  try {
    assert.equal(line(app), NOT_READ);
    assert.deepEqual([laneEmpty(app, 'wait'), strip(app)], ['Not read yet', 'Kicked back · not read yet'], 'each true of what it names');
  } finally {
    s.release();
    app.restore();
  }
});

test('AC91 (c), G9b: the line leaves "Not read in this opening" for "Checking…" where another\'s first read is still on its way, and keeps it where another is in state 2', async () => {
  // The made-up project read while Service-Desk's first read is still held.
  const s = failedHeldState();
  const app = await open(s);
  try {
    assert.equal(line(app), NOT_READ);
    // Inside Service-Desk's 3 minutes in view, so its held read is still on its way (after them it is in state 2, above).
    s.mend();
    while (lastSuccess(app, MIX_PROJECT) == null) {
      await app.advance(1000);
      assert.ok(app.now - NOW < STALE_MS - 10e3, 'the made-up project read inside Service-Desk\'s 3 minutes');
    }
    assert.deepEqual(await lines(app), ['Checking…', 'checking…'], 'Service-Desk\'s still on its way');
  } finally {
    s.release();
    app.restore();
  }
  // Every project failing, then one read: the others still in state 2.
  const o = orderState();
  const b = await open(o);
  try {
    assert.deepEqual(await lines(b), [NOT_READ, NOT_READ], 'every project failing');
    o.repos[MIX_PROJECT].fail = null; // made up: its reads work again (NOT how any read went)
    await b.advance(2 * POLL_MS);
    assert.ok(lastSuccess(b, MIX_PROJECT) != null, 'one read');
    assert.deepEqual(await lines(b), [NOT_READ, NOT_READ], 'another still in state 2');
  } finally {
    b.restore();
  }
});

test('AC91 (c), G9b: every project failing, and one failing with every other read — "Not read in this opening" on Home and Waiting, never "checked <age> ago"', async () => {
  const every = await open(orderState());
  try {
    assert.deepEqual(await lines(every), [NOT_READ, NOT_READ], 'every project failing from the start');
  } finally {
    every.restore();
  }
  const s = unreadState({ who: MIX_PROJECT });
  const app = await open(s, '#/', { before: s.fail });
  try {
    assert.ok(lastSuccess(app, SD.name) != null && lastSuccess(app, POOM.name) != null, 'every other project read');
    const got = await lines(app);
    assert.deepEqual(got, [NOT_READ, NOT_READ]);
    for (const w of got) assert.doesNotMatch(w, /checked/);
  } finally {
    app.restore();
  }
});

test('AC91 (c), G9b: a first read unanswered for 3 minutes in view (AC89 (a)\'s states 1 then 2, as its case holds it) — "Checking…" ("checking…" on Waiting), then "Not read in this opening"', async () => {
  for (const [hash, checking] of [['#/', 'Checking…'], ['#/waiting', 'checking…']]) {
    const app = await loadSandbox({ ...mixState(), hash, now: NOW, store: g8cStore(SINCE_LATE) });
    hang(app, SD.name, () => true);
    try {
      await app.advance(1000);
      await app.advance(POLL_MS);
      await redraw(app);
      assert.equal(line(app), checking, `${hash}: state 1, on its way`);
      await app.advance(STALE_MS - POLL_MS);
      await redraw(app);
      assert.equal(line(app), NOT_READ, `${hash}: after 3 minutes in view`);
    } finally {
      app.restore();
    }
  }
});

test('AC91 (c), G9b: the blob-failure path (`blobFail`, NOT real), a first read holding the tree and failing with no `lastSuccessAt` — "Not read in this opening" on Home and Waiting', async () => {
  const app = await open(blobFailState('every file'), '#/', { polls: 2 });
  try {
    assert.equal(lastSuccess(app, MIX_PROJECT), null, 'no read succeeded');
    assert.deepEqual(await lines(app), [NOT_READ, NOT_READ]);
  } finally {
    app.restore();
  }
});

test('AC91 (c), G9b: signed out — `signedOutState` (no read before the sign-out) and `signedOutMixedState` (one read before it, one not), "Not read in this opening"; every project read before it, "checked <age> ago"; the briefing\'s "Signed out — reload to sign in" unchanged', async () => {
  const cases = [
    ['no read before the sign-out', () => { const s = signedOutState(); return open(s, '#/', { before: s.fail }); }, NOT_READ],
    ['one read before it, one not', () => { const s = signedOutMixedState(); return open(s, '#/', { later: s.fail }); }, NOT_READ],
    ['every project read before it', () => { const s = signedOutState(); return open(s, '#/', { later: s.fail }); }, CHECKED],
  ];
  for (const [what, opened, want] of cases) {
    const app = await opened();
    try {
      assert.equal(briefHead(app), 'Signed out — reload to sign in', `${what}: the briefing unchanged`);
      for (const w of await lines(app)) {
        if (want instanceof RegExp) assert.match(w, want, what);
        else assert.equal(w, want, what);
      }
    } finally {
      app.restore();
    }
  }
});

test('AC89 (a), kept in G9b: one project shown alone, its own line beside another\'s failed first read — state 1 "Checking…", state 2 "Not read in this opening", state 5 "checked <age> ago"', async () => {
  const s = failedHeldState();
  const app = await open(s, `#/waiting/${enc(SD.name)}`);
  try {
    assert.equal(line(app), 'Checking…', 'Service-Desk alone, its own first read on its way, beside the made-up project\'s failed one (C)');
    await app.go(`#/waiting/${MIX_PROJECT}`);
    assert.equal(line(app), NOT_READ, 'the made-up project alone, state 2');
  } finally {
    s.release();
    app.restore();
  }
  // State 5 beside a project in state 2: openingState's Service-Desk failing from the start, the made-up project read and then failing.
  const o = openingState();
  const five = await open(o, `#/waiting/${MIX_PROJECT}`, { later: o.fail });
  try {
    assert.equal(lastSuccess(five, SD.name), null, 'Service-Desk in state 2');
    assert.match(line(five), CHECKED, 'the made-up project alone, state 5');
  } finally {
    five.restore();
  }
});

test('AC83 + AC80, unchanged in G9b: a project\'s page\'s "Nothing waiting on you" row beside a project in state 2 keeps `checkedWords`\' words, as built', async () => {
  const s = unreadState({ who: MIX_PROJECT });
  const app = await open(s, `#/p/${enc(SD.name)}`, { before: s.fail });
  try {
    const row = keyed(app, 'page-waits');
    assert.equal(byClass(row, 'v2-prtt')[0].textContent, 'Nothing waiting on you');
    assert.equal(byClass(row, 'v2-small')[0].textContent, 'checking…', 'as built: the stalest project has no read');
    assert.doesNotMatch(row.textContent, /Not read in this opening/);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// G9B_OPENS, in light and dark: the words on each, and the line's look (no CSS changed)

const SANDBOX_CSS = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(SANDBOX_CSS, 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const INK2 = { light: '#5c5f66', dark: '#a2a5ac' };
const BAD = { light: '#b3162a', dark: '#ff6b78' };
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1').trim();
const marksIn = (v) => [...String(v || '').matchAll(/⟦([^|⟧]*)\|/g)].map((m) => m[1]);
/** The cascaded node for each drawn element, in a theme, at 360 px: el → node. */
function cascaded(app, theme) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width: 360, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) if (n.el) out.set(n.el, n);
  return out;
}
// AC81's --t-small, as sandbox.css defines it (`--t-small: 400 12px/1.4 var(--font)`), and the line's own rule taking it.
const T_SMALL = /--t-small:\s*([^;]+?)\s*var\(--font\);/.exec(SANDBOX_CSS)[1];
assert.match(SANDBOX_CSS, /\.v2-sub \{ font: var\(--t-small\); color: var\(--ink2\);/, 'the line\'s rule, unchanged in G9b');
const WANT = new Map(G9B_OPENS.map(([where]) => [where, /alone shown/.test(where) ? 'Checking…' : NOT_READ]));

test('AC91 (c), G9b, on G9B_OPENS (made up, NOT real), in light and dark: each screen\'s line under the title in its words, its own element `p.v2-sub` in --t-small --ink2, no ✕, never --bad; on Home the list\'s red "Not read in this opening" kept --bad', async () => {
  assert.equal(G9B_OPENS.length, 7);
  for (const [where, openIt] of G9B_OPENS) {
    const app = await openIt();
    try {
      const el = keyed(app, 'home-checked') || byClass(byClass(app.view, 'v2-board')[0], 'v2-sub')[0];
      assert.equal(el.textContent, WANT.get(where), `${where}: its words`);
      assert.equal(el.tag, 'p');
      assert.ok(/\bv2-sub\b/.test(el.className) && !/\bbad\b/.test(el.className), `${where}: its own element, never \`.bad\``);
      assert.equal(findAll(el, (e) => e.tag === 'svg').length, 0, `${where}: no ✕`);
      for (const theme of ['light', 'dark']) {
        const c = cascaded(app, theme);
        const n = c.get(el);
        assert.equal(plain(n.style.get('color')).toLowerCase(), INK2[theme], `${where}, ${theme}: --ink2`);
        assert.ok(marksIn(n.declared.get('color')).includes('--ink2'), `${where}, ${theme}: by the token`);
        assert.equal(plain(n.declared.get('font')).split(' "IBM')[0], T_SMALL, `${where}, ${theme}: --t-small (${T_SMALL} var(--font))`);
        assert.equal(plain(n.style.get('font-size')), '12px', `${where}, ${theme}: 12 px`);
        assert.notEqual(plain(n.style.get('color')).toLowerCase(), BAD[theme], `${where}, ${theme}: never --bad`);
        // Home with "Since you last looked" empty: the list's own red line under it, kept (G1's line).
        if (/^Home/.test(where)) {
          const red = keyed(app, 'since-none');
          assert.equal(red.textContent, NOT_READ, `${where}: the list's line`);
          assert.equal(plain(c.get(red).style.get('color')).toLowerCase(), BAD[theme], `${where}, ${theme}: the list's line kept --bad`);
        }
      }
    } finally {
      app.restore();
    }
  }
});
