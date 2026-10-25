// ac-test: S-001/AC91 — G9c of "After the glance audit": Waiting's quiet lines while a read is on its way or signed out, and
// a project's page's "Nothing waiting on you" row (AC91 (c), "Waiting's quiet lines while a read is on its way or signed out"
// and "a project's page's "Nothing waiting on you" row"; the owner's rulings of 2026-10-25, each "Ruling: A":
// decisions/questions/P-001-glance-waiting-pending.md, "Name it — a grey line "Still reading Service-Desk…" among Waiting's
// quiet lines until its first read answers; the lanes' 0 stays, since the other projects are read.";
// P-001-glance-waiting-signed-out.md, "Say it on Waiting too — the same "Signed out — reload to sign in" line at the top of
// Waiting's quiet lines, in place of one red line per project."; P-001-glance-page-checking.md, "The page's own project —
// the row says "checked <age> ago" from that project's own last read."; with the answers on their readings,
// P-001-glance-g9c-several.md, A, -g9c-alone.md, A, -g9c-signed-out-all.md, A, and -g9c-portfolio.md, B). AC80's quiet lines
// and AC83's row as G9c changes them; AC89 (a)'s one project shown and AC91 (f)'s lanes and strip, as noted there, kept.
// ac-test: S-001/AC80 ac-test: S-001/AC83 ac-test: S-001/AC89
//
// The pure cases are board.js's `boardView` (its `readLines` and `signedOutLine`, from `quietReadLines`) and projectpage.js's
// `pageCheckedWords`, each with its src/public/lib copy, fed each project's read from universe.js's own `readState` as the
// page feeds it (sandbox.js's `readOf`), and the portfolio's from portfolio.js's own `portfolioRead`. The screen cases are the
// sandbox's own code under the fake DOM, on tests/desk/glance-fixtures.mjs's states over `mix` and `quiet` (Service-Desk's
// records at 77bfeae, real, with made-up projects, failures and held reads: G9b's `failedHeldState`, G9c's
// `heldReadsState`, `cantShowHeldState` and `G9C_OPENS`), and AC79's asks-merge fixture (Service-Desk's records at ef8daf4,
// real, with made-up pull requests and job runs), each made-up part labelled NOT real in tests/desk/fixtures/README.md. The
// suite has no browser, so each look is the cascade of the page's own stylesheets over what it drew
// (tests/desk/css-cascade.mjs), in light and dark; the stage's pull request carries the Chromium captures (`g9c-`,
// tests/desk/tools/glance-shots.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC, CONFIG as BASE_CONFIG, fixture } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { repo } from './fake-desk.mjs';
import { NOTIFY_FIX } from './notify-helpers.mjs';
import { withPortfolio, addPortfolio, pfFiles } from './pf-fixtures.mjs';
import { POLL_MS, STALE_MS, REASON_WORDS } from '../../src/lib/scheduler.js';
import { readState } from '../../src/lib/universe.js';
import { boardView, noMarks, quietReadLines, READING_WORDS, ONE_WORDS, quietTroubleWords } from '../../src/lib/board.js';
import { boardView as publicBoardView, quietReadLines as publicReadLines, READING_WORDS as PUBLIC_READING } from '../../src/public/lib/board.js';
import { pageCheckedWords } from '../../src/lib/projectpage.js';
import { pageCheckedWords as publicPageChecked } from '../../src/public/lib/projectpage.js';
import { titleLine, briefingView } from '../../src/lib/home.js';
import { SIGNED_OUT_STATE } from '../../src/lib/page.js';
import { portfolioRead, PF_WORDS } from '../../src/lib/portfolio.js';
import { durationText } from '../../src/lib/timefmt.js';
import { BEING_RECORDED_WORDS } from '../../src/lib/model.js';
import { failedHeldState, heldReadsState, cantShowHeldState, G9C_OPENS, unreadState, signedOutState, signedOutMixedState, openingState, orderState,
  mixState, cantShowLastState, g8cStore, MIX_PROJECT, NOW, SD, POOM, CONFIG, SINCE_LATE } from './glance-fixtures.mjs';

const TZ = CONFIG.ownerTimeZone;
const NOT_READ = 'Not read in this opening';
const SIGNED_OUT = 'Signed out — reload to sign in';
const CHECKED = /^checked \d+ (s|min) ago$/;
const READING = (name) => `Still reading ${name}…`;
const PF_READING = 'Still reading the portfolio…';
const OPENING = (name) => `Can't read ${name} in this opening`;
const enc = encodeURIComponent;

// ---------------------------------------------------------------------------
// The pure cases: boardView's read lines, from readState as the page takes it (sandbox.js's readOf), and pageCheckedWords

const OPENED = Date.parse('2026-10-14T15:00:00Z');
const AT = OPENED + 90e3; // 90 s into the opening, inside AC5's 3 minutes
const DESK = { openedAt: OPENED, visibleSince: OPENED };
/** One project's read as sandbox.js's `readOf` hands it to boardView, from universe.js's `readState`: from G9c with `onWay`. */
function readOf(st, now = AT, { drawError = false } = {}) {
  const full = { lastSuccessAt: null, failure: null, checking: false, ...st };
  const r = readState(full, DESK, now);
  const succeeded = full.lastSuccessAt != null && full.lastSuccessAt >= OPENED;
  const cantShow = drawError && r.read !== 'cant-read';
  return { ok: r.read === 'ok' && !cantShow, cantRead: r.read === 'cant-read', cantShow, since: r.since, words: r.words,
    opening: r.read === 'cant-read' && !succeeded, onWay: r.read !== 'cant-read' && !cantShow && !succeeded };
}
const failure = (reason = 'network', since = OPENED + 10e3) => ({ reason, since, words: REASON_WORDS[reason] || SIGNED_OUT });
/** AC89 (a)'s states: 1, a first read on its way; 2, its first read failed; 3, read; 4, read and not fresh; 5, read and then failing. */
const onItsWay = () => readOf({});
const failedFirst = (reason = 'network') => readOf({ failure: failure(reason) });
const readAt = (ms) => readOf({ lastSuccessAt: ms });
const readThenFailing = (ms, reason = 'network') => readOf({ lastSuccessAt: ms, failure: failure(reason, ms + 5e3) });
const project = (name, read) => ({ project: { name, repo: `example/${name}` }, cards: [], agents: [], read, recording: [], asking: [], answerRecording: [], recordRows: [], seenRows: [] });
const A = 'Alpha';
const B = 'Bravo';
const C = 'Charlie';
/** boardView over [name, read] pairs in J7's order. */
const board = (list, { only = null, signedOut = false, portfolio = null, view = boardView } = {}) => view({ projects: list.map(([n, r]) => project(n, r)), marks: noMarks(), only,
  nowMs: AT, tz: TZ, signedOut, portfolio });
/** The read lines as drawn, top to bottom: [key, words, red]. The signed-out line first, then the projects' and the portfolio's slot. */
const lines = (bd) => [...(bd.signedOutLine ? [bd.signedOutLine] : []), ...bd.readLines].map((l) => [l.key, l.words, l.bad]);
const reading = (name) => [`ql:reading:${name}`, READING(name), false];
const cant = (name, words = OPENING(name)) => [`ql:cant:${name}`, words, true];
const show = (name) => [`ql:show:${name}`, `Can't show ${name}`, true];
const OUT = ['ql:signed-out', SIGNED_OUT, true];
/** The portfolio's read state as portfolio.js's `portfolioRead` gives it, from the reader's snapshot (made up). */
const pf = (snap = {}) => {
  const r = portfolioRead({ repo: 'shumpmaster/portfolio', defaultBranch: 'main', tree: null, truncated: false, records: new Map(), lastSuccessAt: null, failure: null, readAt: null, ...snap }, AT, TZ);
  return { state: r.state, problem: r.problem };
};
const PF_TREE = () => new Map([['queue/PF-001-explore-1.md', { sha: 'a'.repeat(40), size: 100 }], ['README.md', { sha: 'b'.repeat(40), size: 10 }]]);

test('AC91 (c), G9c (pure): the words — "Still reading <project>…", "…" the one character "Checking…" ends with; "Still reading the portfolio…"; signed out, page.js\'s SIGNED_OUT_STATE.text, the one constant Home\'s briefing says; the page\'s copies the same', () => {
  assert.equal(READING_WORDS.project(SD.name), 'Still reading Service-Desk…');
  assert.equal(READING_WORDS.project(SD.name).slice(-1), ONE_WORDS.checking.slice(-1), 'the one character "Checking…" ends with');
  assert.equal(READING_WORDS.project(SD.name).slice(-1), '\u2026');
  assert.equal(READING_WORDS.portfolio, PF_READING);
  assert.equal(SIGNED_OUT_STATE.text, SIGNED_OUT);
  const out = board([[A, failedFirst('signed-out')]], { signedOut: true });
  assert.equal(out.signedOutLine.words, SIGNED_OUT_STATE.text);
  assert.equal(briefingView({ signedOut: true, reads: [] }).head, out.signedOutLine.words, 'Home\'s signed-out briefing, the same constant');
  // The page's copies are the same modules (src/public/lib/, kept in step by tools/build.mjs).
  assert.equal(PUBLIC_READING.project(A), READING_WORDS.project(A));
  for (const [list, opts] of [[[[A, onItsWay()], [B, failedFirst()], [C, readAt(AT - 30e3)]], {}], [[[A, onItsWay()], [B, readThenFailing(AT - 60e3)]], { signedOut: true, portfolio: pf() }]]) {
    assert.deepEqual(lines(board(list, { ...opts, view: publicBoardView })), lines(board(list, opts)), 'src/public/lib/board.js gives the same');
  }
  assert.deepEqual(publicReadLines({ reading: [A], portfolio: pf(), tz: TZ }), quietReadLines({ reading: [A], portfolio: pf(), tz: TZ }));
});

test('AC91 (c), G9c (pure): one project in AC89 (a)\'s state 1 beside projects read, its "Still reading <project>…" entry; two in state 1, one each in J7\'s order, after the can\'t-read and can\'t-show entries; every project in state 1 (the first paint), one each', () => {
  const one = board([[A, readAt(AT - 30e3)], [SD.name, onItsWay()], [B, readAt(AT - 20e3)]]);
  assert.deepEqual(lines(one), [reading(SD.name)]);
  assert.deepEqual(one.reading, [SD.name]);
  assert.deepEqual(one.nothingWaiting, [A, B], 'the projects read in "Nothing waiting", as AC80 has it');
  assert.equal(one.signedOutLine, null);
  // Two on their way, between a can't-read and a can't-show project: the trouble first, then the read lines in J7's order.
  const two = board([[C, onItsWay()], [A, failedFirst()], [SD.name, onItsWay()], [B, readOf({ lastSuccessAt: AT - 30e3 }, AT, { drawError: true })]]);
  assert.deepEqual(lines(two), [cant(A), show(B), reading(C), reading(SD.name)], 'J7\'s order within each kind, never one line naming several');
  const first = board([[SD.name, onItsWay()], [POOM.name, onItsWay()], [A, onItsWay()]]);
  assert.deepEqual(lines(first), [reading(SD.name), reading(POOM.name), reading(A)], 'the first paint: one each');
  // A first read whose parts are still arriving (the scheduler's pending outcome: `checking`, no failure) is on its way too.
  assert.deepEqual(lines(board([[A, readOf({ checking: true })], [B, readAt(AT - 10e3)]])), [reading(A)]);
});

test('AC91 (c), G9c (pure): no "Still reading" entry for a project in state 3, 4 or 5, nor in state 2 for any cause — a failed read, the 3-minute cause, the sign-out\'s refusal — whose can\'t-read entry is as built', () => {
  const four = readOf({ lastSuccessAt: OPENED + 5e3, checking: true }, OPENED + 4 * 60e3);
  assert.equal(readState({ lastSuccessAt: OPENED + 5e3, checking: true, failure: null }, DESK, OPENED + 60e3).read, 'checking', 'state 4\'s read is "checking" too');
  assert.deepEqual(lines(board([[A, readAt(AT - 10e3)], [B, readOf({ lastSuccessAt: AT - 30e3, checking: true })]])), [], 'state 3, and state 4 (read, re-reading)');
  assert.equal(four.onWay, false, 'a re-read is not a first read');
  for (const reason of ['network', 'access', 'github', 'rate-limit', 'page']) {
    const bd = board([[A, failedFirst(reason)], [B, readAt(AT - 10e3)]]);
    assert.deepEqual(lines(bd), [cant(A)], `${reason}: its can't-read entry, as built`);
    assert.deepEqual(bd.readLines.filter((l) => l.bad).map((l) => l.words), bd.cantLines.map((c) => quietTroubleWords(c, TZ)), `${reason}: as cantLines gives it`);
  }
  // The 3-minute cause: a first read unanswered for 3 minutes in view is can't be read (AC89 (a)'s state 2).
  const late = OPENED + STALE_MS + 1000;
  const hung = readOf({}, late);
  assert.equal(hung.cantRead, true);
  assert.deepEqual(lines(board([[A, hung], [B, readOf({ checking: true }, late)]])).map(([k]) => k), ['ql:cant:Alpha', 'ql:cant:Bravo'], 'both hung');
  assert.deepEqual(lines(board([[A, readOf({}, OPENED + STALE_MS - 1000)]])), [reading(A)], 'inside the 3 minutes: on its way');
  // The sign-out's refusal, not signed out on the desk (another project's read still answering): its can't-read entry.
  assert.deepEqual(lines(board([[A, failedFirst('signed-out')], [B, readAt(AT - 10e3)]])), [cant(A)]);
  // State 5: read in this opening and then failing, "since HH:MM", no "Still reading" entry.
  const five = board([[A, readThenFailing(AT - 60e3)]]);
  assert.equal(five.readLines.length, 1);
  assert.match(five.readLines[0].words, /^Can't read Alpha since \d\d:\d\d$/);
  assert.equal(five.reading.length, 0);
});

test('AC91 (c), G9c (pure): a failure giving way to a read still arriving (the scheduler\'s pending outcome) is state 1 again, its "Still reading" entry again; a project the desk can\'t draw with its read pending, its can\'t-show entry only', () => {
  assert.deepEqual(lines(board([[A, failedFirst()], [B, readAt(AT - 10e3)]])), [cant(A)], 'failing');
  assert.deepEqual(lines(board([[A, readOf({ checking: true, failure: null })], [B, readAt(AT - 10e3)]])), [reading(A)], 'its read arriving again');
  // The desk can't draw what it holds: one line per project, never two (C; AC91 (f) counts its pending read as can't be drawn).
  const held = readOf({ checking: true }, AT, { drawError: true });
  assert.equal(held.cantShow, true);
  const bd = board([[A, held], [B, readAt(AT - 10e3)]]);
  assert.deepEqual(lines(bd), [show(A)]);
  assert.deepEqual(bd.reading, []);
});

test('AC91 (c), G9c (pure): the portfolio\'s read — pending (no tree, no failure) "Still reading the portfolio…", last of the "Still reading" entries, in its slot; its tree held with its queue files still arriving, none; failing, access refused or its tree too large, its red entry in that slot as built and no "Still reading" entry; unanswered when the next 5-minute read falls due (`pfAbandon`), its red entry; no portfolio in J7, none; one project shown, none', () => {
  const PF_SLOT_READING = ['ql:reading:portfolio', PF_READING, false];
  assert.deepEqual(pf(), { state: 'pending', problem: PF_WORDS.checking }, 'portfolioRead: no tree, no failure');
  const list = [[A, failedFirst()], [SD.name, onItsWay()], [B, readAt(AT - 10e3)]];
  assert.deepEqual(lines(board(list, { portfolio: pf() })), [cant(A), reading(SD.name), PF_SLOT_READING], 'after the projects\' lines');
  assert.deepEqual(lines(board([[B, readAt(AT - 10e3)]], { portfolio: pf() })), [PF_SLOT_READING], 'with every project read');
  // Its tree held: its cards known, one to a queue file, even while their files are still arriving.
  const held = pf({ tree: PF_TREE(), lastSuccessAt: null });
  assert.equal(held.state, 'ok');
  assert.deepEqual(lines(board([[B, readAt(AT - 10e3)]], { portfolio: held })), []);
  assert.deepEqual(lines(board([[B, readAt(AT - 10e3)]], { portfolio: pf({ tree: PF_TREE(), lastSuccessAt: AT - 10e3 }) })), [], 'read');
  // Its read failing: its red line, J23's words, never "in this opening"; the two never together.
  const since = Date.parse('2026-10-14T15:00:30Z'); // 10:00 in Chicago
  const cases = [
    ['failing', pf({ failure: { kind: 'other', since } }), "Can't read your portfolio since 10:00"],
    ['failing with no time', pf({ failure: { kind: 'other', since: null } }), "Can't read your portfolio"],
    ['access refused', pf({ failure: { kind: 'access', since } }), "Can't read your portfolio: the desk's read access doesn't include it (Setup P1)"],
    ['its tree too large', pf({ truncated: true, tree: PF_TREE() }), "not read: the portfolio's tree was too large"],
    ['unanswered when the next read fell due (pfAbandon)', pf({ failure: { kind: 'other', reason: 'pending', since } }), "Can't read your portfolio since 10:00"],
  ];
  for (const [what, p, words] of cases) {
    const got = lines(board(list, { portfolio: p }));
    assert.deepEqual(got, [cant(A), reading(SD.name), ['ql:cant:portfolio', words, true]], what);
    assert.ok(!got.some(([k]) => k === 'ql:reading:portfolio'), `${what}: no "Still reading" line`);
    assert.doesNotMatch(words, /in this opening/);
  }
  assert.deepEqual(lines(board(list, { portfolio: null })), [cant(A), reading(SD.name)], 'no portfolio in J7');
  // One project shown: no read line at all, the portfolio's among them (AC89 (a); P-001-glance-g9c-alone.md, A).
  for (const p of [pf(), pf({ failure: { kind: 'other', since } })]) {
    for (const name of [A, SD.name, B]) {
      const bd = board(list, { only: name, portfolio: p });
      assert.deepEqual(lines(bd), [], `${name} alone shown`);
      assert.deepEqual(bd.reading, []);
    }
  }
  assert.deepEqual(lines(board([[SD.name, onItsWay()]], { only: SD.name, signedOut: true })), [], 'one project shown, signed out: no line of its own');
});

test('AC91 (c), G9c (pure): signed out — the one signed-out entry first, and no can\'t-read or can\'t-show entry, with no project read before the sign-out, every project read before it, one read and one not, and a project failing for another cause among them; no portfolio red line', () => {
  const refused = () => failedFirst('signed-out');
  const before = (ms) => readThenFailing(ms, 'signed-out');
  const cases = [
    ['no project read before the sign-out', [[SD.name, refused()], [POOM.name, refused()], [A, refused()]]],
    ['every project read before it', [[SD.name, before(AT - 60e3)], [POOM.name, before(AT - 50e3)], [A, before(AT - 40e3)]]],
    ['one read before it and one not', [[SD.name, refused()], [POOM.name, before(AT - 50e3)]]],
    ['a project failing for another cause among them', [[SD.name, failedFirst('network')], [POOM.name, before(AT - 50e3)], [A, refused()]]],
    ['a project the desk can\'t draw among them, read and refused', [[SD.name, refused()], [A, readOf({ lastSuccessAt: AT - 60e3, failure: failure('signed-out', AT - 30e3) }, AT, { drawError: true })]]],
    ['a project the desk can\'t draw whose read still works', [[SD.name, refused()], [A, readOf({ lastSuccessAt: AT - 10e3 }, AT, { drawError: true })]]],
  ];
  for (const [what, list] of cases) {
    const bd = board(list, { signedOut: true });
    assert.ok(bd.cantLines.length >= 1, `${what}: cantLines as built`);
    assert.deepEqual(lines(bd), [OUT], what);
    for (const p of [pf({ failure: { kind: 'other', since: AT - 60e3 } }), pf({ failure: { kind: 'access', since: AT - 60e3 } }), pf({ truncated: true, tree: PF_TREE() })]) {
      assert.deepEqual(lines(board(list, { signedOut: true, portfolio: p })), [OUT], `${what}: no portfolio red line`);
    }
  }
});

test('AC91 (c), G9c (pure): signed out with a read not yet refused, a project\'s or the portfolio\'s, its "Still reading" entry kept under the signed-out one, and once refused, none; not signed out, as built', () => {
  const list = [[SD.name, failedFirst('signed-out')], [A, onItsWay()], [B, readThenFailing(AT - 60e3, 'signed-out')]];
  assert.deepEqual(lines(board(list, { signedOut: true, portfolio: pf() })), [OUT, reading(A), ['ql:reading:portfolio', PF_READING, false]], 'both still on their way');
  const refused = [[SD.name, failedFirst('signed-out')], [A, failedFirst('signed-out')], [B, readThenFailing(AT - 60e3, 'signed-out')]];
  assert.deepEqual(lines(board(refused, { signedOut: true, portfolio: pf({ failure: { kind: 'other', since: AT - 5e3 } }) })), [OUT], 'once refused: no entry');
  // Not signed out: the red entries as built, from cantLines, in the board's order.
  const bd = board(list, { signedOut: false, portfolio: pf() });
  assert.equal(bd.signedOutLine, null);
  assert.deepEqual(lines(bd).map(([k]) => k), ['ql:cant:Service-Desk', 'ql:cant:Bravo', 'ql:reading:Alpha', 'ql:reading:portfolio']);
  assert.deepEqual(bd.readLines.filter((l) => l.bad).map((l) => l.words), bd.cantLines.map((c) => quietTroubleWords(c, TZ)));
});

test('AC91 (c), AC83, G9c (pure): the page\'s row — "checked <age> ago" from its own project\'s `lastSuccessAt`, beside another in state 2, beside one in state 1 and beside one read longer ago (its own age, never the stalest); "checking…" with no success held; the page\'s copy the same', () => {
  const own = AT - 20e3;
  assert.equal(pageCheckedWords({ lastSuccessAt: own, nowMs: AT }), 'checked 20 s ago');
  // The whole desk's line (G9b's titleLine) beside each: what the row said before G9c, and what it says now.
  const ownRead = { read: 'ok', succeeded: true, lastSuccessAt: own };
  const beside = [
    ['another in state 2', { read: 'cant-read', succeeded: false, lastSuccessAt: null }, NOT_READ],
    ['another in state 1', { read: 'checking', succeeded: false, lastSuccessAt: null }, 'checking…'],
    ['another read longer ago', { read: 'ok', succeeded: true, lastSuccessAt: AT - 150e3 }, 'checked 2 min ago'],
  ];
  for (const [what, other, desk] of beside) {
    assert.equal(titleLine({ reads: [ownRead, other], nowMs: AT, waiting: true }), desk, `${what}: the whole desk's line`);
    assert.equal(pageCheckedWords({ lastSuccessAt: own, nowMs: AT }), 'checked 20 s ago', `${what}: its own age`);
  }
  assert.equal(pageCheckedWords({ lastSuccessAt: AT - 150e3, nowMs: AT }), 'checked 2 min ago', 'the older project\'s own row, its own age');
  assert.equal(pageCheckedWords({ lastSuccessAt: own, nowMs: AT + 60e3 }), 'checked 1 min ago', 'the live line advancing from its own read');
  assert.equal(pageCheckedWords({ lastSuccessAt: AT + 5e3, nowMs: AT }), 'checked 0 s ago', 'never a negative age');
  assert.equal(pageCheckedWords({ lastSuccessAt: null, nowMs: AT }), 'checking…', 'no success held: the words as built, so the function is total');
  assert.equal(pageCheckedWords({ nowMs: AT }), 'checking…');
  for (const x of [own, AT - 150e3, null]) assert.equal(publicPageChecked({ lastSuccessAt: x, nowMs: AT }), pageCheckedWords({ lastSuccessAt: x, nowMs: AT }), 'src/public/lib/projectpage.js gives the same');
});

// ---------------------------------------------------------------------------
// The screen cases: Waiting with every project shown, and a project's page

const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const quiet = (app) => keyed(app, 'quiet');
/** Waiting's quiet lines with every project shown, top to bottom, as [key, words]. */
const qlines = (app) => {
  const box = quiet(app);
  return box ? box.children.filter((e) => e.dataset && e.dataset.k).map((e) => [e.dataset.k, e.textContent]) : [];
};
const sub = (app) => byClass(byClass(app.view, 'v2-board')[0], 'v2-sub')[0].textContent;
const laneEmpty = (app, k) => (byClass(keyed(app, `lane:${k}`), 'v2-empty')[0] || { textContent: null }).textContent;
const laneCount = (app, k) => (byClass(keyed(app, `lane:${k}`), 'v2-lc')[0] || { textContent: null }).textContent;
const strip = (app) => keyed(app, 'lane:kick').textContent;
const lastSuccess = (app, name) => app.desk.states.get(name).lastSuccessAt;
const NOTHING = (...names) => ['ql:nothing', `Nothing waiting: ${names.join(', ')}`];
const R = (name) => [`ql:reading:${name}`, READING(name)];
const RP = ['ql:reading:portfolio', PF_READING];
const X = (name, words = OPENING(name)) => [`ql:cant:${name}`, words];
const SO = ['ql:signed-out', SIGNED_OUT];
/** A screen opened as G9b's are: "last looked" after the records' dates; `before` called before the page opens, `later` after its first reads. */
async function open(setup, hash = '#/waiting', { before = null, later = null, polls = 1 } = {}) {
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

test('AC91 (c), AC80, G9c: `failedHeldState` (made up) — Waiting with every project shown says "Nothing waiting: Personal-Org-Operating-Model", "✕ Can\'t read Alpha in this opening" and "Still reading Service-Desk…", in that order, beside "Not read in this opening" under the title and the lanes\' "Nothing here", their count and "Kicked back · none", unchanged; the held read answering, its line gone on the first draw after, Service-Desk then in "Nothing waiting"', async () => {
  const s = failedHeldState();
  const app = await open(s);
  try {
    assert.deepEqual(qlines(app), [NOTHING(POOM.name), X(MIX_PROJECT), R(SD.name)], 'the quiet lines, whole');
    assert.equal(sub(app), NOT_READ, 'the line under the title, G9b\'s');
    assert.deepEqual([laneEmpty(app, 'wait'), laneCount(app, 'wait'), strip(app)], ['Nothing here', '0', 'Kicked back · none'], 'the lanes\' count and words stay (AC91 (f))');
    assert.equal(findAll(keyed(app, `ql:reading:${SD.name}`), (e) => e.tag === 'svg').length, 0, 'no icon');
    s.release();
    let steps = 0;
    while (lastSuccess(app, SD.name) == null) {
      assert.deepEqual(qlines(app).slice(-1), [R(SD.name)], 'until its read answers');
      await app.advance(1000);
      assert.ok(++steps < 3 * POLL_MS / 1000, 'Service-Desk read');
    }
    assert.deepEqual(qlines(app), [NOTHING(SD.name, POOM.name), X(MIX_PROJECT)], 'on the first draw after its read: gone, Service-Desk in "Nothing waiting"');
  } finally {
    s.release();
    app.restore();
  }
});

test('AC91 (c), AC91 (f), G9c: `failedHeldState` with Personal-Org-Operating-Model\'s read held too (made up) — "Still reading" for both in J7\'s order, beside "Not read yet" and "Kicked back · not read yet", unchanged; each going as its read answers', async () => {
  const s = failedHeldState({ poomHeld: true });
  const app = await open(s);
  try {
    assert.deepEqual(qlines(app), [X(MIX_PROJECT), R(SD.name), R(POOM.name)]);
    assert.equal(sub(app), NOT_READ);
    assert.deepEqual([laneEmpty(app, 'wait'), strip(app)], ['Not read yet', 'Kicked back · not read yet'], 'unchanged');
    s.release();
    await app.advance(2 * POLL_MS);
    assert.deepEqual(qlines(app), [NOTHING(SD.name, POOM.name), X(MIX_PROJECT)], 'both answered: both gone');
  } finally {
    s.release();
    app.restore();
  }
  // Two held, each released on its own (`heldReadsState`, made up): each line goes as its own read answers.
  const t = heldReadsState({ held: [SD.name, MIX_PROJECT] });
  const two = await open(t);
  try {
    assert.deepEqual(qlines(two), [NOTHING(POOM.name), R(SD.name), R(MIX_PROJECT)], 'one line each, in J7\'s order');
    t.release(MIX_PROJECT);
    await two.advance(2 * POLL_MS);
    assert.ok(lastSuccess(two, MIX_PROJECT) != null);
    assert.deepEqual(qlines(two).filter(([k]) => /^ql:reading:/.test(k)), [R(SD.name)], 'the made-up project\'s gone, Service-Desk\'s kept');
    assert.ok(laneCount(two, 'wait') > 0, 'the made-up project\'s cards in the lanes');
  } finally {
    t.release();
    two.restore();
  }
});

test('AC91 (c), G9c: the held read failing instead, its red line in the line\'s place; a first read unanswered for 3 minutes in view (`hang`), "Still reading" then, on the next draw after the 3 minutes, its red line', async () => {
  const s = failedHeldState();
  const app = await open(s);
  try {
    assert.deepEqual(qlines(app), [NOTHING(POOM.name), X(MIX_PROJECT), R(SD.name)]);
    s.repos[SD.name].fail = { kind: 'network' }; // made up (NOT how any read failed)
    s.release();
    await app.advance(2 * POLL_MS);
    assert.deepEqual(qlines(app), [NOTHING(POOM.name), X(SD.name), X(MIX_PROJECT)], 'its red line in its place, in the board\'s order');
  } finally {
    s.release();
    app.restore();
  }
  const h = await loadSandbox({ ...mixState(), hash: '#/waiting', now: NOW, store: g8cStore(SINCE_LATE) });
  hang(h, SD.name, () => true);
  try {
    await h.advance(1000);
    await h.advance(POLL_MS);
    await redraw(h);
    assert.deepEqual(qlines(h).filter(([k]) => /^ql:(reading|cant):/.test(k)), [R(SD.name)], 'state 1, on its way');
    await h.advance(STALE_MS - POLL_MS);
    await redraw(h);
    assert.deepEqual(qlines(h).filter(([k]) => /^ql:(reading|cant):/.test(k)), [X(SD.name)], 'after 3 minutes in view: its red line');
  } finally {
    h.restore();
  }
});

test('AC91 (c), G9c: the first paint, every first read on its way — one "Still reading" line per project in J7\'s order, beside "checking…" and "Not read yet"; with a portfolio in J7 (made up), every project\'s line then the portfolio\'s', async () => {
  const app = await loadSandbox({ ...mixState(), hash: '#/waiting', now: NOW, store: g8cStore(SINCE_LATE) });
  try {
    assert.deepEqual(qlines(app), [R(SD.name), R(POOM.name), R(MIX_PROJECT)]);
    assert.equal(sub(app), 'checking…');
    assert.deepEqual([laneEmpty(app, 'wait'), strip(app)], ['Not read yet', 'Kicked back · not read yet']);
  } finally {
    app.restore();
  }
  const p = await loadSandbox({ ...heldReadsState({ portfolio: true }), hash: '#/waiting', now: NOW, store: g8cStore(SINCE_LATE) });
  try {
    assert.deepEqual(qlines(p), [R(SD.name), R(POOM.name), R(MIX_PROJECT), RP], 'the portfolio\'s last');
  } finally {
    p.restore();
  }
});

test('AC91 (c), G9c: the can\'t-draw project (`BAD_PR`, NOT real) with its parts still arriving (`cantShowHeldState`) — its "✕ Can\'t show" line and no "Still reading" line', async () => {
  const s = cantShowHeldState();
  const app = await open(s);
  try {
    assert.equal(lastSuccess(app, MIX_PROJECT) ?? null, null, 'no read of it succeeded');
    assert.equal(app.desk.states.get(MIX_PROJECT).failure ?? null, null, 'none failed');
    assert.deepEqual(qlines(app), [NOTHING(SD.name, POOM.name), [`ql:show:${MIX_PROJECT}`, `Can't show ${MIX_PROJECT}`]]);
    assert.equal(keyed(app, `ql:reading:${MIX_PROJECT}`), null);
  } finally {
    s.release();
    app.restore();
  }
});

/** AC79's asks-merge fixture (ac79-desk.test.mjs): Service-Desk's records at ef8daf4 (real), one made-up pull request the job is recording, made-up job runs (NOT real). */
const T79 = Date.parse('2026-10-18T12:00:00Z');
const HEAD79 = 'c'.repeat(40);
function recordingState() {
  const sd = (p) => readFileSync(join(NOTIFY_FIX, 'sd-ef8daf4', p), 'utf8');
  const stamped = (...ls) => ls.map((l) => `2026-10-18T11:41:05.1234567Z ${l}`).join('\n') + '\n';
  const own = (n, title) => ({ number: n, title, html_url: `https://github.com/shumpmaster/Service-Desk/pull/${n}`, draft: false, base: { ref: 'main' },
    head: { ref: `cos/made-up-${n}`, sha: HEAD79, repo: { full_name: 'shumpmaster/Service-Desk' } }, user: { login: 'shumpmaster' }, author_association: 'OWNER',
    created_at: '2026-10-18T11:00:00Z', state: 'open' });
  const r = repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), 'docs/LEDGER.md': sd('docs/LEDGER.md'),
    'decisions/questions/P-001-asks-merge.md': sd('decisions/questions/P-001-asks-merge.md'), '.github/workflows/asks-merge.yml': sd('.github/workflows/asks-merge.yml') },
  [own(7, 'File a made-up question')], [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  r.prFiles = { 7: [{ filename: 'questions/N-filed.md', status: 'added' }] };
  r.jobs = { asksRuns: [{ id: 1, event: 'workflow_run', head_branch: 'main', status: 'completed', conclusion: 'success', run_started_at: '2026-10-18T11:30:00Z', updated_at: '2026-10-18T11:30:00Z' }],
    checks: { [HEAD79]: { checkRuns: [{ id: 1, name: 'build', status: 'in_progress', conclusion: null, completed_at: null, check_suite: { id: 10 } }], statuses: [], workflowRuns: [{ check_suite_id: 10, path: '.github/workflows/desk-build.yml' }] } },
    runJobs: { 1: [{ id: 101, name: 'merge', status: 'completed', conclusion: 'success' }] }, logs: { 101: stamped('NOTE: the asks-merge grant is L-0017') }, commits: {} };
  const repos = { 'Service-Desk': r, 'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]) };
  const pfRepo = addPortfolio(repos, pfFiles());
  let free = null;
  pfRepo.hold = new Promise((ok) => { free = ok; }); // made up (NOT real)
  return { config: withPortfolio(BASE_CONFIG), repos, release: () => { pfRepo.hold = null; free(); }, pfRepo };
}

test('AC91 (c), G9c: the portfolio\'s read held (made up) — "Still reading the portfolio…" last of the "Still reading" lines and before "Being recorded by the automatic job", in the same grey look; its read answering, gone; its read failing instead, "✕ Can\'t read your portfolio since HH:MM" in its place, as built', async () => {
  // Beside Service-Desk's held first read, on `mix` with a made-up portfolio.
  const s = heldReadsState({ held: [SD.name], portfolio: true, portfolioHeld: true });
  const app = await open(s);
  try {
    assert.deepEqual(qlines(app), [NOTHING(POOM.name), R(SD.name), RP], 'the portfolio\'s last of the "Still reading" lines');
    assert.equal(keyed(app, 'ql:reading:portfolio').className, keyed(app, `ql:reading:${SD.name}`).className, 'the same look');
    // The portfolio's read waits its turn after the projects' polls (J23), so it is asked once Service-Desk's answers.
    s.release();
    await app.advance(2 * POLL_MS);
    assert.ok(app.desk.portfolio().tree, 'the portfolio read');
    assert.deepEqual(qlines(app).filter(([k]) => /^ql:(reading|cant):/.test(k)), [], 'its read answered: gone, with Service-Desk\'s');
  } finally {
    s.release();
    app.restore();
  }
  const f = heldReadsState({ portfolio: true, portfolioHeld: true });
  const failing = await open(f);
  try {
    assert.deepEqual(qlines(failing).slice(-1), [RP]);
    f.failPortfolio();
    await failing.advance(2 * POLL_MS);
    const last = qlines(failing).slice(-1)[0];
    assert.equal(last[0], 'ql:cant:portfolio');
    assert.match(last[1], /^Can't read your portfolio since \d\d:\d\d$/, 'J23\'s words, as built');
    assert.equal(keyed(failing, 'ql:reading:portfolio'), null, 'the two never together');
  } finally {
    f.release();
    failing.restore();
  }
  // Beside AC79's "Being recorded by the automatic job" (Service-Desk's records at ef8daf4, real; its pull request and job made up).
  const r = recordingState();
  const rec = await loadSandbox({ config: r.config, repos: r.repos, hash: '#/waiting', now: T79 });
  try {
    for (let i = 0; i < 4; i++) await rec.advance(60_000);
    const keys = qlines(rec).map(([k]) => k);
    assert.ok(keys.includes('ql:recording'), JSON.stringify(qlines(rec)));
    assert.equal(keyed(rec, 'ql:recording').textContent, `${BEING_RECORDED_WORDS}: 1`);
    assert.equal(keys.indexOf('ql:reading:portfolio') + 1, keys.indexOf('ql:recording'), 'the portfolio\'s line just before it');
  } finally {
    r.release();
    rec.restore();
  }
});

test('AC89 (a), G9c: one project shown alone in state 1, no "Still reading" line, AC89 (a)\'s state 1 as built (G9B_OPENS\' last state: Service-Desk alone shown beside a failed one); no portfolio line alone shown', async () => {
  const s = failedHeldState();
  const app = await open(s, `#/waiting/${enc(SD.name)}`);
  try {
    assert.equal(sub(app), 'Checking…', 'its own line, as built');
    assert.equal(findAll(app.view, (e) => e.dataset && /^ql:(reading|signed-out|cant)/.test(e.dataset.k || '')).length, 0, 'no line of G9c\'s');
    assert.deepEqual([laneEmpty(app, 'wait'), strip(app)], ['Not read yet', 'Kicked back · not read yet'], 'state 1, as built');
  } finally {
    s.release();
    app.restore();
  }
  const p = heldReadsState({ held: [SD.name], portfolio: true, portfolioHeld: true });
  const one = await open(p, `#/waiting/${enc(SD.name)}`);
  try {
    assert.equal(findAll(one.view, (e) => e.dataset && /^ql:(reading|cant):/.test(e.dataset.k || '')).length, 0, 'none, the portfolio\'s among them');
  } finally {
    p.release();
    one.restore();
  }
});

test('AC91 (c), AC80, G9c: signed out — `signedOutState` (no read before the sign-out), `signedOutState` read before it and `signedOutMixedState`: one "✕ Signed out — reload to sign in" line, keyed once, first among the quiet lines, and no `ql:cant:` or `ql:show:` line and no portfolio red line; the line under the title as G9b gives it; the lanes\' "Can\'t read" and "Kicked back · can\'t read"; Home\'s signed-out briefing unchanged', async () => {
  const cases = [
    ['no read before the sign-out', () => { const s = signedOutState(); return open(s, '#/waiting', { before: s.fail }); }, NOT_READ],
    ['every project read before it', () => { const s = signedOutState(); return open(s, '#/waiting', { later: s.fail }); }, CHECKED],
    ['one read before it, one not', () => { const s = signedOutMixedState(); return open(s, '#/waiting', { later: s.fail }); }, NOT_READ],
  ];
  for (const [what, opened, under] of cases) {
    const app = await opened();
    try {
      const all = qlines(app);
      assert.deepEqual(all[0], SO, `${what}: first among the quiet lines`);
      assert.equal(all.filter(([k]) => k === 'ql:signed-out').length, 1, `${what}: keyed once`);
      assert.equal(findAll(app.view, (e) => e.dataset && /^ql:(cant|show):/.test(e.dataset.k || '')).length, 0, `${what}: no project's red line, and no portfolio's`);
      assert.ok(has(keyed(app, 'ql:signed-out'), 'bad') && findAll(keyed(app, 'ql:signed-out'), (e) => e.tag === 'svg').length === 1, `${what}: in its red look with its ✕`);
      if (under instanceof RegExp) assert.match(sub(app), under, what); else assert.equal(sub(app), under, what);
      // The lanes and the strip as AC91 (f) gives them: read before the sign-out, the made-up project's cards stay in the lane.
      assert.equal(strip(app), "Kicked back · can't read", `${what}: the strip, unchanged`);
      if (under === NOT_READ && what === 'no read before the sign-out') assert.equal(laneEmpty(app, 'wait'), "Can't read", `${what}: the lane, unchanged`);
      else assert.ok(byClass(keyed(app, 'lane:wait'), 'v2-card').length > 0, `${what}: the cards of the last read kept, as built`);
      await app.go('#/');
      assert.equal(byClass(byClass(app.view, 'v2-brief')[0], 'v2-bt1')[0].textContent, SIGNED_OUT, `${what}: Home's briefing, unchanged`);
    } finally {
      app.restore();
    }
  }
});

const has = (e, c) => ` ${(e && e.className) || ''} `.includes(` ${c} `);

test('AC91 (c), G9c: signed out, a held read not yet refused keeps its "Still reading" line under the signed-out one until refused — a project\'s and the portfolio\'s (made up); the other quiet lines as built under it; with one project shown, G8d\'s line above the lanes ending "Signed out — reload to sign in", kept', async () => {
  const s = heldReadsState({ held: [SD.name], portfolio: true, portfolioHeld: true });
  const app = await open(s);
  try {
    assert.deepEqual(qlines(app), [NOTHING(POOM.name), R(SD.name), RP]);
    for (const r of Object.values(s.repos)) r.fail = { kind: 'signed-out' }; // made up (J6)
    await app.advance(2 * POLL_MS);
    assert.ok(app.desk.signedOut, 'signed out');
    assert.deepEqual(qlines(app), [SO, R(SD.name), RP], 'both held reads not yet refused: under the signed-out line');
    s.release(SD.name);
    await app.advance(2 * POLL_MS);
    assert.deepEqual(qlines(app), [SO, RP], 'Service-Desk\'s refused: gone, no red line');
    s.release('portfolio');
    await app.advance(2 * POLL_MS);
    assert.deepEqual(qlines(app), [SO], 'the portfolio\'s refused: gone, no red line');
    await app.go(`#/waiting/${enc(POOM.name)}`);
    assert.match(keyed(app, 'quiet-cant').textContent, /^Can't read Personal-Org-Operating-Model since \d\d:\d\d: Signed out — reload to sign in$/, 'one project shown: G8d\'s line, kept');
    assert.equal(keyed(app, 'ql:signed-out'), null, 'no signed-out line of its own');
  } finally {
    s.release();
    app.restore();
  }
});

test('AC91 (c), G9c: the can\'t-draw project signed out (`cantShowLastState({ signedOut: true })`, made up) — no red line of its own, the one signed-out line; not signed out, every project failed, one red line each, so the two differ', async () => {
  const s = cantShowLastState({ signedOut: true });
  const app = await open(s, '#/waiting', { later: s.fail });
  try {
    assert.deepEqual(qlines(app), [SO]);
  } finally {
    app.restore();
  }
  const o = await open(orderState());
  try {
    assert.deepEqual(qlines(o), [X(SD.name), X(POOM.name), X(MIX_PROJECT)], 'not signed out: as built');
  } finally {
    o.restore();
  }
});

/** A project's page's "Nothing waiting on you" row, its title and small line. */
const pageRow = (app) => {
  const row = keyed(app, 'page-waits');
  return [byClass(row, 'v2-prtt')[0].textContent, (byClass(row, 'v2-small')[0] || { textContent: null }).textContent];
};
const own = (app, name) => `checked ${durationText(Math.max(0, app.now - lastSuccess(app, name)))} ago`;

test('AC83, AC91 (c), G9c: Service-Desk\'s page, read, beside the made-up project failing (G9b\'s design review, N2), "Nothing waiting on you" and "checked <age> ago" from Service-Desk\'s own read, never "checking…"; beside a project still on its way, its own age; beside a project read longer ago, its own younger age; the row\'s live line advancing from its own read', async () => {
  const s = unreadState({ who: MIX_PROJECT });
  const app = await open(s, `#/p/${enc(SD.name)}`, { before: s.fail });
  try {
    assert.equal(lastSuccess(app, MIX_PROJECT), null);
    await redraw(app);
    assert.deepEqual(pageRow(app), ['Nothing waiting on you', own(app, SD.name)]);
    assert.notEqual(pageRow(app)[1], 'checking…');
  } finally {
    app.restore();
  }
  const h = heldReadsState({ held: [MIX_PROJECT] });
  const way = await open(h, `#/p/${enc(SD.name)}`);
  try {
    assert.equal(lastSuccess(way, MIX_PROJECT) ?? null, null, 'the made-up project still on its way');
    await redraw(way);
    assert.deepEqual(pageRow(way), ['Nothing waiting on you', own(way, SD.name)]);
  } finally {
    h.release();
    way.restore();
  }
  // The made-up project read first, then its re-reads held (made up), so its last read grows older than Service-Desk's.
  const l = heldReadsState();
  const older = await open(l, `#/p/${enc(SD.name)}`);
  try {
    l.repos[MIX_PROJECT].hold = new Promise(() => {}); // made up (NOT real)
    await older.advance(2 * POLL_MS);
    await redraw(older);
    assert.ok(lastSuccess(older, MIX_PROJECT) < lastSuccess(older, SD.name) - 60e3, 'the made-up project read longer ago');
    const stalest = `checked ${durationText(older.now - lastSuccess(older, MIX_PROJECT))} ago`;
    assert.deepEqual(pageRow(older), ['Nothing waiting on you', own(older, SD.name)], 'its own, younger age');
    assert.notEqual(pageRow(older)[1], stalest, 'never the stalest');
    // The live line: from its own read at each tick.
    for (let i = 0; i < 3; i++) {
      await older.advance(7000);
      await redraw(older);
      assert.equal(pageRow(older)[1], own(older, SD.name), `tick ${i}`);
    }
  } finally {
    older.restore();
  }
});

test('AC83, AC89 (a), G9c: the page of a project in states 1, 2 and 5 and signed out, its row as built — "Checking…", "✕ Can\'t read in this opening", "✕ Can\'t read since HH:MM", the sign-out\'s reason', async () => {
  const s = failedHeldState();
  const app = await open(s, `#/p/${enc(SD.name)}`);
  try {
    assert.deepEqual(pageRow(app), ['Checking…', null], 'state 1');
    await app.go(`#/p/${MIX_PROJECT}`);
    assert.equal(pageRow(app)[0], "Can't read in this opening", 'state 2');
    assert.ok(has(keyed(app, 'page-waits'), 'bad'));
  } finally {
    s.release();
    app.restore();
  }
  // Service-Desk, with nothing waiting, read and then failing (`unread`, made up).
  const o = unreadState();
  const five = await open(o, `#/p/${enc(SD.name)}`, { later: o.fail });
  try {
    assert.match(pageRow(five)[0], /^Can't read since \d\d:\d\d$/, 'state 5');
  } finally {
    five.restore();
  }
  const m = signedOutMixedState();
  const out = await open(m, `#/p/${enc(POOM.name)}`, { later: m.fail });
  try {
    assert.match(pageRow(out)[0], /^Can't read since \d\d:\d\d$/);
    assert.equal(pageRow(out)[1], SIGNED_OUT, 'the sign-out\'s reason under it');
  } finally {
    out.restore();
  }
});

test('AC4, AC32, AC82, G9c: unchanged beside them — Home\'s briefing, tiles and line under the title, the screen state and the tab title, on `failedHeldState` and signed out', async () => {
  const s = failedHeldState();
  const app = await open(s, '#/');
  try {
    assert.equal(keyed(app, 'home-checked').textContent, NOT_READ);
    assert.equal(byClass(byClass(app.view, 'v2-brief')[0], 'v2-bt1')[0].textContent, `Can't read ${MIX_PROJECT} in this opening`);
    assert.equal(byClass(keyed(app, `card:${SD.name}`), 'v2-wt')[0].textContent, 'Checking…');
    assert.equal(document.title, 'Service Desk — Not quiet: can\'t read 1 project · Checking…');
    assert.equal(findAll(app.view, (e) => e.dataset && /^ql:(reading|signed-out)/.test(e.dataset.k || '')).length, 0, 'no G9c line on Home');
    await app.go('#/waiting');
    assert.equal(document.title, 'Service Desk — Not quiet: can\'t read 1 project · Checking…', 'the tab title on Waiting, unchanged');
  } finally {
    s.release();
    app.restore();
  }
  const o = signedOutState();
  const out = await open(o, '#/', { before: o.fail });
  try {
    assert.equal(byClass(byClass(out.view, 'v2-brief')[0], 'v2-bt1')[0].textContent, SIGNED_OUT);
    assert.equal(out.els['screen-state'].textContent, SIGNED_OUT);
    assert.equal(document.title, `Service Desk — ${SIGNED_OUT}`);
  } finally {
    out.restore();
  }
});

// ---------------------------------------------------------------------------
// G9C_OPENS, in light and dark: the words on each, and the lines' looks (no CSS changed)

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
function cascaded(app, theme) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width: 360, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) if (n.el) out.set(n.el, n);
  return out;
}
const T_SMALL = /--t-small:\s*([^;]+?)\s*var\(--font\);/.exec(SANDBOX_CSS)[1];
assert.match(SANDBOX_CSS, /\.v2-ql \{ display: inline-flex; align-items: center; gap: 4px; min-height: 28px; font: var\(--t-small\); color: var\(--ink2\); \}/, 'the quiet line\'s rule, unchanged in G9c');
assert.match(SANDBOX_CSS, /\.v2-ql\.bad \{ color: var\(--bad\); \}/, 'the red quiet line\'s rule, unchanged in G9c');
/** What each of G9C_OPENS draws: its read lines and signed-out line on Waiting, or its page's row. */
const G9C_WANT = new Map([
  ['Waiting, every project shown, one first read failed and one on its way', [X(MIX_PROJECT), R(SD.name)]],
  ['Waiting, every project shown, one first read failed and two on their way', [X(MIX_PROJECT), R(SD.name), R(POOM.name)]],
  ['Waiting, every project shown, the first paint, every first read on its way, the portfolio\'s among them', [R(SD.name), R(POOM.name), R(MIX_PROJECT), RP]],
  ['Waiting, every project shown, the portfolio\'s read on its way beside Service-Desk\'s', [R(SD.name), RP]],
  ['Waiting, every project shown, a project the desk can\'t draw, its parts still arriving', [[`ql:show:${MIX_PROJECT}`, `Can't show ${MIX_PROJECT}`]]],
  ['Waiting, every project shown, signed out, one project never read before it and the others read', [SO]],
  ['Waiting, every project shown, signed out from the start', [SO]],
  ['Waiting, every project shown, every first read failed, not signed out', [X(SD.name), X(POOM.name), X(MIX_PROJECT)]],
  ['Service-Desk\'s page, read, beside the made-up project failing from the start', null],
]);

test('AC91 (c), AC88, G9c, on G9C_OPENS (made up, NOT real), in light and dark: each screen\'s lines in their words and order; the "Still reading" line `p.v2-ql` in --t-small --ink2, no icon, no ✕, never --bad or --you; the signed-out line `p.v2-ql.bad` in --bad with its ✕; the page\'s row\'s look unchanged', async () => {
  assert.deepEqual(G9C_OPENS.map(([w]) => w), [...G9C_WANT.keys()]);
  for (const [where, openIt] of G9C_OPENS) {
    const app = await openIt();
    try {
      const want = G9C_WANT.get(where);
      if (want) {
        assert.deepEqual(qlines(app).filter(([k]) => /^ql:(reading|cant|show|signed-out):/.test(`${k}:`)), want, `${where}: its lines`);
      } else {
        await redraw(app);
        assert.deepEqual(pageRow(app), ['Nothing waiting on you', own(app, SD.name)], `${where}: its row`);
      }
      for (const theme of ['light', 'dark']) {
        const c = cascaded(app, theme);
        for (const el of findAll(app.view, (e) => e.dataset && /^ql:reading:/.test(e.dataset.k || ''))) {
          const n = c.get(el);
          assert.equal(el.tag, 'p');
          assert.ok(has(el, 'v2-ql') && !has(el, 'bad'), `${where}: \`p.v2-ql\`, never \`.bad\``);
          assert.equal(findAll(el, (e) => e.tag === 'svg').length, 0, `${where}: no icon, no ✕`);
          assert.equal(plain(n.style.get('color')).toLowerCase(), INK2[theme], `${where}, ${theme}: --ink2`);
          assert.ok(marksIn(n.declared.get('color')).includes('--ink2'), `${where}, ${theme}: by the token`);
          assert.equal(plain(n.declared.get('font')).split(' "IBM')[0], T_SMALL, `${where}, ${theme}: --t-small`);
          assert.ok(!marksIn(n.style.get('color')).some((m) => m === '--bad' || m === '--you'), `${where}, ${theme}: never --bad or --you`);
          const span = el.children[0];
          assert.equal(plain(c.get(span).style.get('color')).toLowerCase(), INK2[theme], `${where}, ${theme}: its words --ink2`);
        }
        const so = keyed(app, 'ql:signed-out');
        if (so) {
          assert.ok(has(so, 'v2-ql') && has(so, 'bad'));
          assert.equal(plain(c.get(so).style.get('color')).toLowerCase(), BAD[theme], `${where}, ${theme}: --bad`);
          const svg = findAll(so, (e) => e.tag === 'svg');
          assert.equal(svg.length, 1, 'its ✕');
          assert.equal(so.children[0], svg[0], 'the ✕ before the words');
        }
        const row = keyed(app, 'page-waits');
        if (row) {
          const small = byClass(row, 'v2-small')[0];
          assert.equal(plain(c.get(small).style.get('color')).toLowerCase(), INK2[theme], `${where}, ${theme}: the row's small line --ink2, as built`);
          assert.ok(has(byClass(row, 'v2-prtt')[0], 'soft'), 'the soft row, as built (AC91 (j))');
        }
      }
    } finally {
      app.restore();
    }
  }
});
