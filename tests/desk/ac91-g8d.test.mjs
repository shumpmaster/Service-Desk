// ac-test: S-001/AC91 — G8d of "After the glance audit": "in this opening" beyond Home, and "can't be shown" for a project
// the desk can read but can't draw (AC91 (c); the owner's answers of 2026-10-25 to G8c's design review,
// docs/design/references/owner-answers-2026-10-25-g8c-review.md: 1, "Yes, everywhere (Recommended)" — "Waiting, the project
// page and the Pipeline view use the same words as Home, one small change after 8c"; 2, "Say "can't be shown"
// (Recommended)" — "the cap row, the versions row and the group head say "can't be shown" for such a project, matching the
// briefing and tile"; 3, "Keep it, as built (Recommended)": "Nothing new since <time>" stays, nothing built). With them, AC89
// (a)'s state 2 holding the cards a read in this opening gave where its tree was held and its blob phase failed (AC89 (a),
// C, the Definer's reading after G8c's review), locked on Waiting as G8c's fix round locked Home's corner. From G8d's round 2
// (the owner's answer of 2026-10-25 to G8d's design review, item 4, ""✕ Can't show Bravo" (Recommended)" — "a red line like
// the briefing's, in Waiting's quiet lines; with that project shown alone, the same line above the lanes, with no counts"):
// Waiting's "Can't show <project>" for a project the desk can read but can't draw, and the Reviewer's test gaps N1 to N5.
// ac-test: S-001/AC89 ac-test: S-001/AC54 ac-test: S-001/AC80 ac-test: S-001/AC87
//
// The page is the sandbox's own code under the fake DOM, on the fixture states of tests/desk/glance-fixtures.mjs (G8c's
// `openingState`, `signedOutMixedState`, `orderState`, and G8d's `blobFailState`, `cantShowState` and `G8D_OPENS`, and round
// 2's `blobFailNoCardState` and `cantShowAmongState`) over
// `mix`, `quiet` and `twoMix`: Service-Desk's records at 77bfeae, real, with made-up projects, failures and pull requests,
// each labelled NOT real in tests/desk/fixtures/README.md. The suite has no browser, so each look is the cascade of the
// page's own stylesheets over what it drew (tests/desk/css-cascade.mjs), in light and dark; the stage's pull request
// carries the Chromium captures (`g8d-`, tests/desk/tools/glance-shots.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS, REASON_WORDS } from '../../src/lib/scheduler.js';
import { oneProjectView, quietCantWords, cantSince, IN_OPENING, cantShowWords, quietTroubleWords, ONE_WORDS, boardView, noMarks, stripEmptyWords } from '../../src/lib/board.js';
import { boxStateText } from '../../src/lib/universe.js';
import { capEntry, capView, versionsView, CANT_SHOWN } from '../../src/lib/portfolio.js';
import { groupHeaderWords } from '../../src/lib/sandbox.js';
import { IN_OPENING as HOME_IN_OPENING } from '../../src/lib/home.js';
import { BAD_PR } from './fake-desk.mjs';
import { unreadState, signedOutState, signedOutMixedState, openingState, orderState, mixState, blobFailState, cantShowState, g8cStore,
  MIX_PROJECT, MIX_PROJECT2, NOW, SD, POOM, CONFIG, SINCE_LATE, G8D_OPENS, blobFailNoCardState, cantShowAmongState } from './glance-fixtures.mjs';

const TZ = CONFIG.ownerTimeZone;
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const BAD = { light: '#b3162a', dark: '#ff6b78' };
const THEMES = ['light', 'dark'];
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1').trim();
/** Each drawn element's cascaded colour in a theme, at 360 px: el → colour. */
function colours(app, theme) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width: 360, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) if (n.el) out.set(n.el, plain(n.style.get('color')));
  return out;
}
/** AC5's reason in words for the network cause the fixtures make up. */
const REASON = REASON_WORDS.network;
const has = (e, c) => ` ${(e && e.className) || ''} `.includes(` ${c} `);
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const svgOf = (el) => findAll(el, (e) => e.tag === 'svg')[0] || null;
const enc = encodeURIComponent;
const OPENING = (name) => `Can't read ${name} in this opening`;
const SINCE = (name) => new RegExp(`^Can't read ${name} since (\\d\\d:\\d\\d)$`);
/** Waiting's quiet can't-read lines, every project shown: [project, words], in the order drawn. */
const quietCant = (app) => findAll(app.view, (e) => e.dataset && /^ql:cant:/.test(e.dataset.k || '') && e.dataset.k !== 'ql:cant:portfolio')
  .map((e) => [e.dataset.k.slice(8), e.textContent]);
/** The line above the lanes with one project shown (AC89 (a), states 2 and 5), or null. */
const aboveLanes = (app) => (keyed(app, 'quiet-cant') ? keyed(app, 'quiet-cant').textContent : null);
const sub = (app) => byClass(app.view, 'v2-sub')[0].textContent;
const lane = (app, k) => keyed(app, `lane:${k}`);
const cardsIn = (app, k) => byClass(lane(app, k), 'v2-card');
const laneCount = (app, k) => (byClass(lane(app, k), 'v2-lc')[0] || { textContent: null }).textContent;
const emptyOf = (app, k) => (byClass(lane(app, k), 'v2-empty')[0] || { textContent: null }).textContent;
const pageWaits = (app) => keyed(app, 'page-waits');
const pipeLead = (app) => byClass(app.view, 'sb-lead')[0].textContent;
const corner = (app, name) => byClass(keyed(app, `card:${name}`), 'v2-wt')[0];
const capLine = (app) => keyed(app, 'pf:cap').textContent;
const versionsLine = (app) => keyed(app, 'pf:versions').textContent;
const groupBtn = (app, g) => keyed(app, `hgroup-btn:${g}`);
/** A group head's parts as drawn: its waiting count, each `.v2-hgb` count, its project count. */
const headParts = (app, g) => {
  const b = groupBtn(app, g);
  return { waiting: (byClass(b, 'v2-hgy')[0] || { textContent: null }).textContent, bad: byClass(b, 'v2-hgb').map((x) => x.textContent), count: byClass(b, 'v2-hgn')[0].textContent };
};

async function open(setup, hash, { later = false, polls = 1, after = 3 } = {}) {
  const app = await loadSandbox({ ...setup, hash, now: NOW, store: g8cStore(SINCE_LATE) });
  await app.advance(1000);
  await app.advance(polls * POLL_MS);
  if (later) {
    setup.fail();
    await app.advance(after * POLL_MS);
  }
  return app;
}
/** Each line in --bad with its ✕, in light and dark. */
function assertBad(app, el, where) {
  assert.ok(el, where);
  assert.ok(has(svgOf(el), 'vi-bad'), `${where}: its ✕`);
  for (const theme of THEMES) assert.equal(colours(app, theme).get(el), BAD[theme], `${where}, ${theme}: in --bad`);
}

// ---------------------------------------------------------------------------
// The pure functions, each with a never-read input; their read-earlier cases kept

test('AC91 (c), G8d, the pure functions: "in this opening" in place of "since HH:MM" — oneProjectView\'s state 2 line above the lanes, Waiting\'s quiet line (quietCantWords), boxStateText\'s Pipeline line — for either cause and with no time held; state 5 and a project read earlier keep the time', () => {
  const at = Date.parse('2026-10-14T15:02:00Z'); // 10:02 in Chicago
  assert.equal(IN_OPENING, 'in this opening');
  assert.equal(HOME_IN_OPENING, IN_OPENING, 'Home\'s words and Waiting\'s are one');
  const one = (read, last) => oneProjectView({ name: 'Alpha', read, lastSuccessAt: last, tz: TZ });
  // State 2: no read succeeded in this opening.
  const s2 = one({ read: 'cant-read', since: at, words: REASON }, null);
  assert.deepEqual([s2.state, s2.cant, s2.under(at), s2.empty, s2.counts], [2, `${OPENING('Alpha')}: ${REASON}`, 'Not read in this opening', "Can't read", null]);
  assert.equal(s2.cards, true, 'its lanes hold the cards a read in this opening gave, if any (AC89 (a), C)');
  assert.equal(one({ read: 'cant-read', since: at, words: REASON_WORDS.stale }, null).cant, `${OPENING('Alpha')}: ${REASON_WORDS.stale}`, 'the 3-minute cause (the opening\'s start as "since")');
  assert.equal(one({ read: 'cant-read', since: null, words: REASON }, null).cant, `${OPENING('Alpha')}: ${REASON}`, 'no time held');
  assert.equal(one({ read: 'cant-read', since: at }, null).cant, OPENING('Alpha'), 'no reason held');
  // State 5: read earlier in this opening and then failing: its time kept.
  const s5 = one({ read: 'cant-read', since: at, words: REASON }, at - 60e3);
  assert.deepEqual([s5.state, s5.cant, s5.cards], [5, `Can't read Alpha since 10:02: ${REASON}`, true]);
  assert.equal(one({ read: 'cant-read', since: at, words: REASON_WORDS.stale }, at - 3 * 60e3).cant, `Can't read Alpha since 10:02: ${REASON_WORDS.stale}`, 'state 5, the 3-minute cause');
  // The other states say nothing above the lanes.
  for (const [read, last] of [[{ read: 'checking' }, null], [{ read: 'ok', since: at }, at], [{ read: 'checking' }, at]]) assert.equal(one(read, last).cant, null);
  // Waiting's quiet line, every project shown (boardView's `cantRead` entry).
  assert.equal(quietCantWords({ project: 'Alpha', since: at, opening: true }, TZ), OPENING('Alpha'));
  assert.equal(quietCantWords({ project: 'Alpha', since: null, opening: true }, TZ), OPENING('Alpha'), 'no time held');
  assert.equal(quietCantWords({ project: 'Alpha', since: at, opening: false }, TZ), "Can't read Alpha since 10:02");
  assert.equal(quietCantWords({ project: 'Alpha', since: at }, TZ), "Can't read Alpha since 10:02", 'with no `opening` given: as built');
  assert.equal(cantSince({ since: at, opening: true }, TZ), ' in this opening');
  assert.equal(cantSince({ since: at }, TZ), ' since 10:02');
  assert.equal(cantSince({ since: null }, TZ), '', 'no time held: nothing');
  // The v2.5 Pipeline view's state line.
  const box = (read, extra = {}) => ({ flaggedCount: 0, read, ...extra });
  assert.equal(boxStateText(box({ read: 'cant-read', since: at, words: REASON }), TZ, true), `Can't read in this opening: ${REASON}`);
  assert.equal(boxStateText(box({ read: 'cant-read', since: at, words: REASON_WORDS.stale }), TZ, true), `Can't read in this opening: ${REASON_WORDS.stale}`);
  assert.equal(boxStateText(box({ read: 'cant-read', since: at, words: REASON }), TZ, false), `Can't read since 10:02: ${REASON}`, 'read earlier: its time kept');
  assert.equal(boxStateText(box({ read: 'cant-read', since: at, words: REASON }), TZ), `Can't read since 10:02: ${REASON}`, 'as built');
  assert.equal(boxStateText(box({ read: 'cant-read', since: at, words: REASON }, { flaggedCount: 2 }), TZ, true), `2 waiting on you · Can't read in this opening: ${REASON}`);
  assert.equal(boxStateText(box({ read: 'ok', since: at }), TZ, true), 'quiet', 'a read that works: unchanged');
  assert.equal(boxStateText(box({ read: 'checking' }), TZ, true), 'Checking…');
});

test('AC91 (c), G8d, the pure functions: "can\'t be shown" — capEntry\'s why and the cap\'s row, versionsView\'s row (" · can\'t be shown" after a read version), groupHeaderWords counting it apart after the can\'t-read count; a project the desk can\'t draw whose read fails keeps its can\'t-read words and count', () => {
  assert.equal(CANT_SHOWN, "can't be shown");
  const p = (name) => ({ name, model: 'v3' });
  const shown = { state: 'cant-show', since: null, opening: false };
  const never = { state: 'cant-read', since: '10:02', opening: true };
  const earlier = { state: 'cant-read', since: '10:02', opening: false };
  // The cap's row and its entry, as the sheet takes them.
  assert.equal(capEntry({ project: p('A'), pv: null, error: true, read: shown }).why, CANT_SHOWN);
  assert.equal(capEntry({ project: p('A'), pv: null, error: true, read: earlier }).why, "can't be read since 10:02", 'can\'t be drawn and its read failing: the read\'s words');
  assert.equal(capEntry({ project: p('A'), pv: null, error: true, read: never }).why, "can't be read in this opening");
  assert.equal(capEntry({ project: p('A'), pv: null, error: true }).why, "can't be read", 'with no read given: as built');
  assert.deepEqual(capView([{ project: p('A'), pv: null, error: true, read: shown }, { project: p('B'), pv: null, error: false, read: never }]).parts.map((x) => x.text),
    ['In Build or Launch: none', "A's phase: can't be shown", "B's phase: can't be read in this opening", 'your cap: no record for this in the model yet']);
  assert.equal(capEntry({ project: { name: 'V', model: 'v2.5' }, pv: null, error: true, read: shown }).v3, false, 'a v2.5 project has no phase in the cap, as built');
  // The versions row: in place of "not available", and after a read version.
  const snapOf = (files) => ({ tree: new Map(Object.keys(files).map((f) => [f, { sha: f }])), records: new Map(Object.entries(files)) });
  const versioned = snapOf({ 'governance/OPERATING_MODEL_VERSION': { version: '3.5.0', compared: true } });
  assert.deepEqual(versionsView([{ project: p('A'), snap: null, read: shown }, { project: p('B'), snap: versioned, read: shown }, { project: p('C'), snap: snapOf({}), read: shown },
    { project: p('D'), snap: null, read: earlier }]).rows.map((x) => x.words),
  ["A: can't be shown", "B 3.5.0 · can't be shown", "C: not recorded · can't be shown", "D: can't be read since 10:02"]);
  // Home's group head.
  const g = (boxes) => groupHeaderWords(boxes);
  assert.equal(g([{ waiting: 0, cantRead: true }, { waiting: 0, cantShow: true }]).words, "2 projects · 1 can't be read · 1 can't be shown");
  assert.equal(g([{ waiting: 6 }, { waiting: 0, cantRead: true }, { waiting: 0, cantShow: true }]).words, "3 projects · 6 waiting on you · 1 can't be read · 1 can't be shown");
  assert.deepEqual([g([{ cantShow: true }]).shown, g([{ cantShow: true }]).cant, g([{ cantShow: true }]).words], ["1 can't be shown", null, "1 project · 1 can't be shown"]);
  assert.deepEqual([g([{ cantShow: true, cantRead: true }]).cant, g([{ cantShow: true, cantRead: true }]).shown], ["1 can't be read", null], 'both marked: counted once, can\'t be read');
  assert.equal(g([{ cantShow: true }, { cantShow: true }]).shown, "2 can't be shown");
  // AC54's cases as built.
  assert.equal(g([{ waiting: 1 }, { waiting: 0, cantRead: true }]).words, '2 projects · 1 waiting on you · 1 can\'t be read');
  assert.equal(g([]).shown, null);
});

// ---------------------------------------------------------------------------
// "In this opening" beyond Home

test('AC91 (c), G8d: Waiting with every project shown — Service-Desk never read in this opening and the made-up project read earlier and then failing, each quiet line by its own ("✕ Can\'t read Service-Desk in this opening", "✕ Can\'t read Alpha since HH:MM"), in the board\'s order, in --bad with its ✕; Home beside it, G8c\'s places unchanged', async () => {
  const app = await open(openingState(), '#/', { later: true });
  try {
    // Home, as G8c built it.
    const under = byClass(byClass(app.view, 'v2-brief')[0], 'v2-bcant').map((l) => l.textContent);
    assert.ok(under.includes(OPENING(SD.name)), JSON.stringify(under));
    const at = /Can't read Alpha since (\d\d:\d\d)/.exec(under.join(' | '));
    assert.ok(at, JSON.stringify(under));
    assert.equal(corner(app, SD.name).textContent, "Can't read in this opening");
    await app.go('#/waiting');
    const ql = quietCant(app);
    assert.deepEqual(ql, [[SD.name, OPENING(SD.name)], [MIX_PROJECT, `Can't read ${MIX_PROJECT} since ${at[1]}`]], 'each by its own, in the board\'s (the config\'s) order');
    for (const [name] of ql) assertBad(app, keyed(app, `ql:cant:${name}`), `${name}'s quiet line`);
    assert.doesNotMatch(keyed(app, `ql:cant:${SD.name}`).textContent, /since|\d\d:\d\d/, 'never its opening\'s time');
    // The count and place unchanged: one line each, in the quiet lines' box, before the lanes.
    assert.equal(findAll(app.view, (e) => e.dataset && e.dataset.k === `ql:cant:${SD.name}`).length, 1);
    assert.ok(has(keyed(app, `ql:cant:${SD.name}`).parent, 'v2-quiet'));
  } finally {
    app.restore();
  }
});

test('AC91 (c), G8d: Waiting with one project shown, AC89 (a)\'s state 2 — "Not read in this opening" under the title kept, the line above the lanes "✕ Can\'t read <project> in this opening: <reason>" in --bad, for a failed read and for the 3-minute cause; state 5, a project read earlier and then failing, keeps "since HH:MM"', async () => {
  // A failed read from the start (the network cause, made up).
  let app = await open(openingState(), `#/waiting/${enc(SD.name)}`);
  try {
    assert.equal(sub(app), 'Not read in this opening');
    assert.equal(aboveLanes(app), `${OPENING(SD.name)}: ${REASON}`);
    assertBad(app, keyed(app, `ql:cant:${SD.name}`), 'above the lanes');
    assert.equal(emptyOf(app, 'wait'), "Can't read", 'an empty lane as state 2 has it');
    assert.equal(lane(app, 'kick').textContent, "Kicked back · can't read");
  } finally {
    app.restore();
  }
  // The 3-minute cause: its first read never answered (made up).
  const h = unreadState();
  h.repos[SD.name].hold = new Promise(() => {});
  app = await open(h, `#/waiting/${enc(SD.name)}`, { polls: 4 });
  try {
    assert.equal(sub(app), 'Not read in this opening');
    assert.equal(aboveLanes(app), `${OPENING(SD.name)}: ${REASON_WORDS.stale}`);
  } finally {
    app.restore();
  }
  // State 5: the made-up project read, then failing: its time kept, with its cards.
  const s = openingState();
  app = await open(s, `#/waiting/${MIX_PROJECT}`, { later: true });
  try {
    assert.match(sub(app), /^checked \d+ min ago$/);
    assert.match(aboveLanes(app), new RegExp(`^Can't read ${MIX_PROJECT} since \\d\\d:\\d\\d: ${REASON}$`));
    assert.ok(cardsIn(app, 'wait').length > 0);
  } finally {
    app.restore();
  }
  // State 5, the 3-minute cause: read, then left unanswered (made up).
  const r = unreadState();
  app = await open(r, `#/waiting/${enc(SD.name)}`);
  try {
    r.repos[SD.name].hold = new Promise(() => {});
    await app.advance(5 * POLL_MS);
    assert.match(aboveLanes(app), new RegExp(`^Can't read ${SD.name} since \\d\\d:\\d\\d: ${REASON_WORDS.stale}$`));
  } finally {
    app.restore();
  }
});

test('AC91 (c), G8d: a project\'s page\'s waits row — "✕ Can\'t read in this opening" with its reason under it for a project never read in this opening, by either cause; "Can\'t read since HH:MM" for one read earlier; a page whose project can\'t be drawn keeps "Can\'t show this project: <the error>"', async () => {
  let app = await open(openingState(), `#/p/${enc(SD.name)}`);
  try {
    const row = pageWaits(app);
    assert.equal(byClass(row, 'v2-prtt')[0].textContent, "Can't read in this opening");
    assert.equal(byClass(row, 'v2-small')[0].textContent, REASON, 'its reason under it, as built');
    assert.ok(has(row, 'bad'), 'the row as built');
    assert.ok(has(svgOf(row), 'vi-bad'), 'its ✕');
    for (const theme of THEMES) assert.equal(colours(app, theme).get(byClass(row, 'v2-prtt')[0]), BAD[theme], `${theme}: its title in --bad, as built`);
  } finally {
    app.restore();
  }
  const h = unreadState();
  h.repos[SD.name].hold = new Promise(() => {});
  app = await open(h, `#/p/${enc(SD.name)}`, { polls: 4 });
  try {
    assert.equal(byClass(pageWaits(app), 'v2-prtt')[0].textContent, "Can't read in this opening", 'the 3-minute cause');
    assert.equal(byClass(pageWaits(app), 'v2-small')[0].textContent, REASON_WORDS.stale);
  } finally {
    app.restore();
  }
  // Read earlier in this opening and then failing (made up): its time kept.
  const s = unreadState();
  app = await open(s, `#/p/${enc(SD.name)}`, { later: true });
  try {
    assert.match(byClass(pageWaits(app), 'v2-prtt')[0].textContent, /^Can't read since \d\d:\d\d$/);
  } finally {
    app.restore();
  }
  // A project the desk can't draw (fake-desk.mjs's BAD_PR, NOT real): its page's words as built.
  const c = mixState();
  c.repos[MIX_PROJECT].pulls.push(BAD_PR);
  app = await open(c, `#/p/${MIX_PROJECT}`);
  try {
    assert.match(app.text(), /Can't show this project: /);
    assert.doesNotMatch(app.text(), /in this opening|can't be shown/);
  } finally {
    app.restore();
  }
});

test('AC91 (c), G8d: the v2.5 Pipeline view\'s state line — "Can\'t read in this opening: <reason>" for Personal-Org-Operating-Model never read in this opening, by either cause; "Can\'t read since HH:MM: <reason>" for it read earlier', async () => {
  let app = await open(orderState({ waiting: true }), `#/p/${enc(POOM.name)}/pipeline`);
  try {
    assert.equal(pipeLead(app), `Can't read in this opening: ${REASON}`);
  } finally {
    app.restore();
  }
  const h = mixState();
  h.repos[POOM.name].hold = new Promise(() => {});
  app = await open(h, `#/p/${enc(POOM.name)}/pipeline`, { polls: 4 });
  try {
    assert.equal(pipeLead(app), `Can't read in this opening: ${REASON_WORDS.stale}`, 'the 3-minute cause');
  } finally {
    app.restore();
  }
  const s = mixState();
  s.fail = () => { s.repos[POOM.name].fail = { kind: 'network' }; };
  app = await open(s, `#/p/${enc(POOM.name)}/pipeline`, { later: true });
  try {
    assert.match(pipeLead(app), new RegExp(`^Can't read since \\d\\d:\\d\\d: ${REASON}$`), 'read earlier: its time kept');
  } finally {
    app.restore();
  }
});

test('AC91 (c), G8d, signed out: each project by its own — Service-Desk, never read before the sign-out, "in this opening" in its quiet line, above the lanes and on its page; the others, read before it, "since HH:MM" in their quiet lines and the Pipeline view; signed out from the start, every quiet line "in this opening"', async () => {
  const s = signedOutMixedState();
  const app = await open(s, '#/waiting', { later: true });
  try {
    const ql = new Map(quietCant(app));
    assert.equal(ql.get(SD.name), OPENING(SD.name));
    assert.match(ql.get(POOM.name), SINCE(POOM.name));
    assert.match(ql.get(MIX_PROJECT), SINCE(MIX_PROJECT));
    await app.go(`#/waiting/${enc(SD.name)}`);
    assert.match(aboveLanes(app), new RegExp(`^${OPENING(SD.name)}: `));
    await app.go(`#/waiting/${MIX_PROJECT}`);
    assert.match(aboveLanes(app), new RegExp(`^Can't read ${MIX_PROJECT} since \\d\\d:\\d\\d: `), 'read before the sign-out: state 5');
    await app.go(`#/p/${enc(SD.name)}`);
    assert.equal(byClass(pageWaits(app), 'v2-prtt')[0].textContent, "Can't read in this opening");
    await app.go(`#/p/${enc(POOM.name)}/pipeline`);
    assert.match(pipeLead(app), /^Can't read since \d\d:\d\d: /);
  } finally {
    app.restore();
  }
  const o = signedOutState();
  o.fail();
  const all = await open(o, '#/waiting');
  try {
    const ql = quietCant(all);
    assert.deepEqual(ql.map(([n]) => n), CONFIG.projects.map((p) => p.name).concat(MIX_PROJECT).filter((n) => ql.some(([m]) => m === n)));
    assert.ok(ql.length >= 2, JSON.stringify(ql));
    for (const [n, w] of ql) assert.equal(w, OPENING(n), n);
    await all.go(`#/p/${enc(POOM.name)}/pipeline`);
    assert.match(pipeLead(all), /^Can't read in this opening: /);
  } finally {
    all.restore();
  }
});

// ---------------------------------------------------------------------------
// State 2's cards (AC89 (a), C)

test('AC89 (a), G8d (C, after G8c\'s review): Waiting with the made-up project alone shown, its first read holding the tree but failing in its blob phase (fake-desk.mjs\'s blobFail, NOT real), every file\'s blobs and then one file\'s — no read succeeded, its cards in the lanes, their count as Home\'s corner gives it, "Not read in this opening", its line above the lanes "in this opening", the strip "Kicked back · can\'t read", no counts under the lanes; a first read that fails with no tree held has no cards', async () => {
  for (const which of ['every file', 'one file']) {
    const where = `blobs failing, ${which}`;
    const app = await open(blobFailState(which), `#/waiting/${MIX_PROJECT}`, { polls: 2 });
    try {
      assert.equal(app.desk.states.get(MIX_PROJECT).lastSuccessAt ?? null, null, `${where}: no read of it succeeded in this opening`);
      const reason = app.desk.states.get(MIX_PROJECT).failure.words;
      assert.ok(reason, `${where}: AC5's reason held`);
      assert.equal(sub(app), 'Not read in this opening', `${where}: under the title`);
      assert.equal(aboveLanes(app), `${OPENING(MIX_PROJECT)}: ${reason}`, `${where}: above the lanes`);
      assertBad(app, keyed(app, `ql:cant:${MIX_PROJECT}`), `${where}: above the lanes`);
      const n = cardsIn(app, 'wait').length;
      assert.ok(n > 0, `${where}: its cards in the lanes`);
      assert.equal(laneCount(app, 'wait'), String(n), `${where}: the lane counts them`);
      assert.equal(lane(app, 'kick').textContent, "Kicked back · can't read", `${where}: the strip in state 2's words`);
      assert.equal(byClass(app.view, 'v2-qsmall').length, 0, `${where}: no counts under the lanes, as state 2 has them`);
      assert.doesNotMatch(keyed(app, 'board').textContent, /checking…|Checking…/, `${where}: never "checking…"`);
      // Home's corner counts the same cards.
      await app.go('#/');
      assert.equal(corner(app, MIX_PROJECT).textContent, `${n} wait on you`, `${where}: Home's corner`);
    } finally {
      app.restore();
    }
  }
  // No tree held: a first read that fails outright (the network cause, made up) has no cards, as before.
  const u = unreadState({ who: MIX_PROJECT });
  u.fail();
  const app = await open(u, `#/waiting/${MIX_PROJECT}`);
  try {
    assert.equal(sub(app), 'Not read in this opening');
    assert.equal(aboveLanes(app), `${OPENING(MIX_PROJECT)}: ${REASON}`);
    assert.equal(cardsIn(app, 'wait').length, 0, 'no cards');
    assert.equal(emptyOf(app, 'wait'), "Can't read");
    assert.equal(laneCount(app, 'wait'), null, 'no count for an unknown');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// "Can't be shown"

test('AC91 (c), G8d, "can\'t be shown": a made-up project the desk can\'t draw (BAD_PR, NOT real) whose read works — the cap\'s row "Alpha\'s phase: can\'t be shown", its sheet "Phase: can\'t be shown · not counted", the versions row "Alpha: can\'t be shown", its group head "1 can\'t be shown" in --bad; none "can\'t be read" nor a time; the briefing, tile and grey line as built; gone on the first draw after it draws again', async () => {
  const s = mixState();
  s.repos[MIX_PROJECT].pulls.push(BAD_PR);
  const app = await open(s, '#/');
  try {
    assert.match(keyed(app, `card:${MIX_PROJECT}`).textContent, /Can't show this project: /, 'its tile as built');
    assert.match(capLine(app), new RegExp(`${MIX_PROJECT}'s phase: can't be shown( ·|$)`));
    assert.match(versionsLine(app), new RegExp(`${MIX_PROJECT}: can't be shown( ·|$)`));
    assert.doesNotMatch(capLine(app) + versionsLine(app), new RegExp(`${MIX_PROJECT}[^·]*can't be read`), 'never "can\'t be read" for it');
    assert.doesNotMatch(capLine(app) + versionsLine(app), /\d\d:\d\d/, 'no time');
    const head = headParts(app, 'active');
    assert.deepEqual(head.bad, ["1 can't be shown"]);
    for (const theme of THEMES) for (const el of byClass(groupBtn(app, 'active'), 'v2-hgb')) assert.equal(colours(app, theme).get(el), BAD[theme], `${theme}: in --bad`);
    // As built: the briefing's "Can't show Alpha", the grey "not shown" line, "Nothing new since <time>" above it.
    assert.match(byClass(app.view, 'v2-brief')[0].textContent, /Can't show Alpha/);
    assert.deepEqual(keyed(app, 'since-miss').children.map((p) => p.textContent), [`${MIX_PROJECT} not shown, its lines may be missing`]);
    assert.match(keyed(app, 'since-none').textContent, /^Nothing new since /, 'the "Nothing new" line kept (answer 3)');
    await app.go('#/pf/cap');
    assert.equal(byClass(keyed(app, `pfs:${MIX_PROJECT}`), 'v2-small')[0].textContent, "Phase: can't be shown · not counted");
    await app.go('#/pf/versions');
    assert.match(keyed(app, `pfs:${MIX_PROJECT}`).textContent, new RegExp(`^${MIX_PROJECT}: can't be shown`));
    await app.go('#/');
    // Drawn again (the made-up pull request gone): the words go on the first draw after it.
    s.repos[MIX_PROJECT].pulls = s.repos[MIX_PROJECT].pulls.filter((x) => x !== BAD_PR);
    let steps = 0;
    while (/Can't show this project: /.test(keyed(app, `card:${MIX_PROJECT}`).textContent)) {
      assert.match(capLine(app), /can't be shown/, 'still not drawn: its words');
      await app.advance(1000);
      assert.ok(++steps < 3 * POLL_MS / 1000, 'drawn again');
    }
    assert.doesNotMatch(capLine(app) + versionsLine(app), /can't be shown/);
    assert.deepEqual(headParts(app, 'active').bad, []);
  } finally {
    app.restore();
  }
});

test('AC54, AC91 (c), G8d: both kinds on one Home, one group — the head\'s count words exactly "2 projects · 1 can\'t be read · 1 can\'t be shown", and with cards waiting "3 projects · 6 waiting on you · 1 can\'t be read · 1 can\'t be shown", on an open head and a closed one, each count part in `.v2-hgb` --bad; the cap and the versions row naming each by its own', async () => {
  for (const [where, setup, shown, want] of [
    ['nothing waiting', () => cantShowState(), MIX_PROJECT, { waiting: null, bad: ["1 can't be read", "1 can't be shown"], count: '2 projects' }],
    ['cards waiting', () => cantShowState({ waiting: true }), MIX_PROJECT2, { waiting: '6 waiting on you', bad: ["1 can't be read", "1 can't be shown"], count: '3 projects' }],
  ]) {
    const app = await open(setup(), '#/');
    try {
      assert.deepEqual(headParts(app, 'active'), want, `${where}: open`);
      for (const theme of THEMES) for (const el of byClass(groupBtn(app, 'active'), 'v2-hgb')) assert.equal(colours(app, theme).get(el), BAD[theme], `${where}, ${theme}: ${el.textContent}`);
      assert.match(capLine(app), new RegExp(`${SD.name}'s phase: can't be read in this opening`));
      assert.match(capLine(app), new RegExp(`${shown}'s phase: can't be shown`));
      assert.match(versionsLine(app), new RegExp(`${SD.name}: can't be read in this opening`));
      assert.match(versionsLine(app), new RegExp(`${shown}: can't be shown`));
      await app.tap(groupBtn(app, 'active'));
      assert.equal(groupBtn(app, 'active').attrs['aria-expanded'], 'false', `${where}: closed`);
      assert.deepEqual(headParts(app, 'active'), want, `${where}: closed, the same words`);
    } finally {
      app.restore();
    }
  }
});

test('AC91 (c), G8d: a project the desk can\'t draw whose read fails keeps its can\'t-read words — "can\'t be read since HH:MM" in the cap and the versions row, counted "1 can\'t be read" at the head, the briefing "Can\'t read Alpha since HH:MM"; signed out, counted "can\'t be read" too', async () => {
  const s = mixState();
  s.repos[MIX_PROJECT].pulls.push(BAD_PR);
  s.fail = () => { s.repos[MIX_PROJECT].fail = { kind: 'network' }; };
  const app = await open(s, '#/', { later: true });
  try {
    assert.match(keyed(app, `card:${MIX_PROJECT}`).textContent, /Can't show this project: /);
    assert.match(capLine(app), new RegExp(`${MIX_PROJECT}'s phase: can't be read since \\d\\d:\\d\\d`));
    assert.match(versionsLine(app), new RegExp(`${MIX_PROJECT}: can't be read since \\d\\d:\\d\\d`));
    assert.doesNotMatch(capLine(app) + versionsLine(app), /can't be shown/);
    assert.deepEqual(headParts(app, 'active').bad, ["1 can't be read"]);
    assert.match(byClass(app.view, 'v2-brief')[0].textContent, /Can't read Alpha since \d\d:\d\d/);
  } finally {
    app.restore();
  }
  const o = signedOutState();
  o.repos[MIX_PROJECT].pulls.push(BAD_PR);
  const so = await open(o, '#/', { later: true });
  try {
    assert.match(keyed(so, `card:${MIX_PROJECT}`).textContent, /Can't show this project: /);
    assert.doesNotMatch(capLine(so) + versionsLine(so), /can't be shown/, 'signed out: its read failed');
    assert.deepEqual(headParts(so, 'active').bad, [`${headParts(so, 'active').count.split(' ')[0]} can't be read`], 'every project counted can\'t be read');
  } finally {
    so.restore();
  }
});

// ---------------------------------------------------------------------------
// "Nothing new since <time>" kept (answer 3, "Keep it, as built (Recommended)"): G8c's case, unchanged

test('AC91 (c), G8d ("Keep it, as built (Recommended)"): G8c\'s case of "Nothing new since <time>" above the "not shown" line is kept as it was', () => {
  const g8c = readFileSync(join(SRC, '..', 'tests', 'desk', 'ac91-g8c-home.test.mjs'), 'utf8');
  assert.match(g8c, /test\('AC91 \(c\), G8c, the "not shown" line: a made-up project the desk can\\'t draw/);
  assert.match(g8c, /assert\.match\(none\.textContent, \/\^Nothing new since \/, 'every read working: the empty line as built, never "Not read since"'\);/);
  assert.match(g8c, /assert\.deepEqual\(sinceKeys\(app\), \['since-h', 'since-none', 'since-miss'\]\);/);
});

// Each of G8D_OPENS draws what it is named for, so the stage-8 guard's walk and the captures open what G8d changes.
test('G8d\'s screens (tests/desk/glance-fixtures.mjs\'s G8D_OPENS) each draw what they are named for', async () => {
  for (const [where, open2] of G8D_OPENS) {
    const app = await open2();
    try {
      const t = app.text();
      if (/never read|blobs failing/.test(where)) assert.match(t, /in this opening/, where);
      if (/blobs failing/.test(where)) assert.ok(cardsIn(app, 'wait').length > 0, `${where}: its cards`);
      if (/signed out/.test(where)) assert.match(t, /Can't read Service-Desk in this opening/, where);
      if (/can't draw/.test(where)) assert.equal(byClass(groupBtn(app, 'active'), 'v2-hgb').map((x) => x.textContent).join(' · '), "1 can't be read · 1 can't be shown", where);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// G8d's round 2: "Can't show <project>" on Waiting (the owner's answer of 2026-10-25 to G8d's design review, item 4, ""✕
// Can't show Bravo" (Recommended)" — "a red line like the briefing's, in Waiting's quiet lines; with that project shown alone,
// the same line above the lanes, with no counts"; AC80, AC89 (a), AC91 (c)), and the Reviewer's test gaps N1 to N5.

const SHOW = (name) => `Can't show ${name}`;
/** Waiting's red quiet lines, every project shown, as [kind ('cant' | 'show'), project, words], in the order drawn. */
const troubleLines = (app) => findAll(app.view, (e) => e.dataset && /^ql:(cant|show):/.test(e.dataset.k || '') && e.dataset.k !== 'ql:cant:portfolio')
  .map((e) => { const [, kind, ...rest] = e.dataset.k.split(':'); return [kind, rest.join(':'), e.textContent]; });
const nothingLine = (app) => (keyed(app, 'ql:nothing') ? keyed(app, 'ql:nothing').textContent : null);

test('AC80, AC89 (a), AC91 (c), G8d round 2, the pure functions: "Can\'t show <project>" — boardView puts a project the desk can read but can\'t draw in `cantShow` and `cantLines` (among the can\'t-read entries, in the board\'s order), never in `nothingWaiting`; oneProjectView\'s can\'t-show view has the line, no counts, "Can\'t show" for an empty lane and the strip, its own "checked <age> ago"; a failing read keeps its can\'t-read words', () => {
  const at = Date.parse('2026-10-14T15:02:00Z'); // 10:02 in Chicago
  assert.equal(cantShowWords('Bravo'), "Can't show Bravo");
  assert.equal(ONE_WORDS.cantShow, "Can't show");
  assert.equal(quietTroubleWords({ project: 'Bravo', show: true }, TZ), "Can't show Bravo");
  assert.equal(quietTroubleWords({ project: 'Bravo', show: false, since: at, opening: true }, TZ), OPENING('Bravo'), 'a can\'t-read entry: its words');
  assert.equal(quietTroubleWords({ project: 'Bravo', show: false, since: at, opening: false }, TZ), "Can't read Bravo since 10:02");
  // boardView: three projects quiet by their cards, one read and drawn, one read but not drawn, one failing, and a fourth
  // failing after the one not drawn.
  const proj = (name, read) => ({ project: { name }, cards: [], agents: [], read });
  const bd = boardView({ projects: [
    proj('A', { ok: true, cantRead: false, cantShow: false }),
    proj('B', { ok: false, cantRead: true, since: at, words: REASON, opening: true }),
    proj('C', { ok: false, cantRead: false, cantShow: true }),
    proj('D', { ok: false, cantRead: true, since: at, words: REASON, opening: false }),
    proj('E', { ok: true, cantRead: false, cantShow: true }), // `ok` as a caller might leave it: can't show still wins
  ], marks: noMarks(), only: null, nowMs: at, tz: TZ });
  assert.deepEqual(bd.nothingWaiting, ['A'], 'a project not drawn is in no "Nothing waiting" line');
  assert.deepEqual(bd.cantShow, ['C', 'E']);
  assert.deepEqual(bd.cantRead.map((c) => c.project), ['B', 'D'], 'the can\'t-read entries as built');
  assert.deepEqual(bd.cantLines.map((c) => [c.project, c.show, quietTroubleWords(c, TZ)]),
    [['B', false, OPENING('B')], ['C', true, SHOW('C')], ['D', false, "Can't read D since 10:02"], ['E', true, SHOW('E')]], 'in the board\'s order');
  // Can't be drawn and its read failing: its can't-read words, never "Can't show".
  const both = boardView({ projects: [proj('F', { ok: false, cantRead: true, cantShow: false, since: at, words: REASON, opening: true })], marks: noMarks(), only: null, nowMs: at, tz: TZ });
  assert.deepEqual([both.cantShow, both.cantLines.map((c) => c.show)], [[], [false]]);
  // With one project shown, only its own line.
  assert.deepEqual(boardView({ projects: [proj('A', { ok: true }), proj('C', { cantShow: true })], marks: noMarks(), only: 'A', nowMs: at, tz: TZ }).cantLines, []);
  // oneProjectView: read and fresh but not drawn.
  const one = (read, last, cantShow) => oneProjectView({ name: 'Bravo', read, lastSuccessAt: last, tz: TZ, cantShow });
  const v = one({ read: 'ok', since: at }, at - 60e3, true);
  assert.deepEqual([v.cantShow, v.cant, v.counts, v.unknown, v.empty, v.under(at)], [true, SHOW('Bravo'), null, true, "Can't show", 'checked 1 min ago']);
  assert.equal(stripEmptyWords({ one: v }), "can't show", 'the strip: "Kicked back · can\'t show"');
  assert.notEqual(v.empty, 'Nothing here');
  const c4 = one({ read: 'checking' }, at - 60e3, true);
  assert.deepEqual([c4.cant, c4.counts, c4.empty], [SHOW('Bravo'), null, "Can't show"], 're-checking after a read: still not drawn');
  // Its read failing: state 2 or 5, its can't-read words kept.
  const f2 = one({ read: 'cant-read', since: at, words: REASON }, null, true);
  assert.deepEqual([f2.state, f2.cant, f2.empty, Boolean(f2.cantShow)], [2, `${OPENING('Bravo')}: ${REASON}`, "Can't read", false]);
  const f5 = one({ read: 'cant-read', since: at, words: REASON }, at - 60e3, true);
  assert.deepEqual([f5.state, f5.cant, Boolean(f5.cantShow)], [5, `Can't read Bravo since 10:02: ${REASON}`, false]);
  // Without `cantShow`: as built.
  assert.deepEqual([one({ read: 'ok', since: at }, at - 60e3).state, one({ read: 'ok', since: at }, at - 60e3).cant, Boolean(one({ read: 'ok', since: at }, at - 60e3).cantShow)], [3, null, false]);
});

test('AC80, AC91 (c), G8d round 2: Waiting with every project shown and a made-up project the desk can read but can\'t draw (BAD_PR, NOT real) — "✕ Can\'t show Alpha" in the quiet lines, in --bad with its ✕ as the can\'t-read line, among the can\'t-read lines in the board\'s order; Alpha in no "Nothing waiting" line, that line kept for the other quiet projects; Home unchanged', async () => {
  let app = await open(cantShowState(), '#/waiting');
  try {
    assert.deepEqual(troubleLines(app), [['cant', SD.name, OPENING(SD.name)], ['show', MIX_PROJECT, SHOW(MIX_PROJECT)]]);
    const line = keyed(app, `ql:show:${MIX_PROJECT}`);
    assertBad(app, line, 'the can\'t-show line');
    assert.ok(has(line, 'v2-ql') && has(line, 'still') && has(line, 'bad'), 'the can\'t-read line\'s look: p.v2-ql.still.bad');
    assert.equal(line.tag, 'p', 'a line, not a control');
    assert.ok(has(line.parent, 'v2-quiet'), 'in the quiet lines\' box');
    assert.equal(nothingLine(app), `Nothing waiting: ${POOM.name}`, 'the "Nothing waiting" line kept for the other quiet project');
    assert.doesNotMatch(nothingLine(app), new RegExp(MIX_PROJECT), 'never "Nothing waiting: Alpha"');
    assert.equal(findAll(app.view, (e) => e.dataset && e.dataset.k === `ql:show:${MIX_PROJECT}`).length, 1, 'once');
    assert.doesNotMatch(line.textContent, /since|\d\d:\d\d|can't be read/, 'no time and no can\'t-read words: its read works');
    // Home beside it: the briefing, the cap, the versions row and the group head as G8d's round 1 built them.
    await app.go('#/');
    assert.match(byClass(app.view, 'v2-brief')[0].textContent, /Can't show Alpha/);
    assert.match(capLine(app), new RegExp(`${MIX_PROJECT}'s phase: can't be shown`));
    assert.match(versionsLine(app), new RegExp(`${MIX_PROJECT}: can't be shown`));
    assert.deepEqual(headParts(app, 'active').bad, ["1 can't be read", "1 can't be shown"]);
  } finally {
    app.restore();
  }
  // Among the can't-read lines: Alpha (not drawn) between Service-Desk and Bravo (failing from the start), in the config's order.
  app = await open(cantShowAmongState(), '#/waiting');
  try {
    assert.deepEqual(troubleLines(app), [['cant', SD.name, OPENING(SD.name)], ['show', MIX_PROJECT, SHOW(MIX_PROJECT)], ['cant', MIX_PROJECT2, OPENING(MIX_PROJECT2)]]);
    for (const [kind, name] of troubleLines(app)) assertBad(app, keyed(app, `ql:${kind}:${name}`), `${name}'s line`);
    assert.doesNotMatch(nothingLine(app) || '', new RegExp(MIX_PROJECT));
  } finally {
    app.restore();
  }
  // Cards waiting from another project: the line the same, those cards in the lanes.
  app = await open(cantShowState({ waiting: true }), '#/waiting');
  try {
    assert.deepEqual(troubleLines(app), [['cant', SD.name, OPENING(SD.name)], ['show', MIX_PROJECT2, SHOW(MIX_PROJECT2)]]);
    assert.ok(cardsIn(app, 'wait').length > 0, 'Alpha\'s cards in the lanes');
    assert.doesNotMatch(nothingLine(app) || '', new RegExp(MIX_PROJECT2));
  } finally {
    app.restore();
  }
});

test('AC89 (a), AC91 (c), G8d round 2: Waiting with the made-up project the desk can read but can\'t draw (BAD_PR, NOT real) alone shown — "✕ Can\'t show Alpha" above the lanes in --bad, with no counts: no small line, no count on the lane, the empty lane "Can\'t show", the strip "Kicked back · can\'t show", never "Nothing here", "none" or a 0; "checked <age> ago" under the title', async () => {
  const app = await open(cantShowState(), `#/waiting/${MIX_PROJECT}`);
  try {
    assert.match(sub(app), /^checked \d+ (s|min) ago$/, 'its read works: its own "checked <age> ago"');
    assert.equal(aboveLanes(app), SHOW(MIX_PROJECT));
    const line = keyed(app, `ql:show:${MIX_PROJECT}`);
    assertBad(app, line, 'above the lanes');
    assert.ok(has(line, 'v2-ql') && has(line, 'still') && has(line, 'bad'));
    assert.equal(keyed(app, `ql:cant:${MIX_PROJECT}`), null, 'no can\'t-read line');
    assert.equal(byClass(app.view, 'v2-qsmall').length, 0, 'no small line of counts');
    assert.equal(keyed(app, 'quiet'), null, 'no quiet lines under the lanes');
    assert.equal(laneCount(app, 'wait'), null, 'no count on the lane');
    assert.equal(emptyOf(app, 'wait'), "Can't show");
    assert.ok(has(byClass(lane(app, 'wait'), 'v2-empty')[0], 'unknown'), 'an unknown, in its look');
    assert.equal(lane(app, 'kick').textContent, "Kicked back · can't show");
    assert.equal(emptyOf(app, 'done'), 'Hold a card and drag it here', 'Done as built');
    const board = keyed(app, 'board').textContent;
    assert.doesNotMatch(board, /Nothing here|\bnone\b|: 0\b|Nothing waiting/, board);
    assert.equal(findAll(keyed(app, 'board'), (e) => e.textContent === '0' && (!e.children || !e.children.length)).length, 0, 'no 0 drawn');
    assert.match(app.text(), /1 of 3 projects/, 'the chip as built');
  } finally {
    app.restore();
  }
});

test('AC80, AC89 (a), AC91 (c), G8d round 2: a project the desk can\'t draw whose read fails keeps its can\'t-read words on Waiting, every project shown and alone shown, never "Can\'t show" — never read in this opening (its blobs failing, made up), read earlier and then failing, and signed out', async () => {
  // Never read in this opening: the first read holds the tree (and the made-up BAD_PR) but fails in its blob phase (NOT real).
  const n = blobFailState('every file');
  n.repos[MIX_PROJECT].pulls.push(BAD_PR);
  let app = await open(n, '#/waiting', { polls: 2 });
  try {
    assert.equal(app.desk.states.get(MIX_PROJECT).lastSuccessAt ?? null, null, 'no read of it succeeded in this opening');
    await app.go('#/');
    assert.match(keyed(app, `card:${MIX_PROJECT}`).textContent, /Can't show this project: /, 'the desk can\'t draw it');
    await app.go('#/waiting');
    assert.deepEqual(troubleLines(app).filter(([, p]) => p === MIX_PROJECT), [['cant', MIX_PROJECT, OPENING(MIX_PROJECT)]]);
    await app.go(`#/waiting/${MIX_PROJECT}`);
    const reason = app.desk.states.get(MIX_PROJECT).failure.words;
    assert.equal(aboveLanes(app), `${OPENING(MIX_PROJECT)}: ${reason}`);
    assert.equal(emptyOf(app, 'wait'), "Can't read");
    assert.equal(lane(app, 'kick').textContent, "Kicked back · can't read");
    assert.doesNotMatch(keyed(app, 'board').textContent, /Can't show/);
  } finally {
    app.restore();
  }
  // Read earlier in this opening, then failing (made up).
  const e = mixState();
  e.repos[MIX_PROJECT].pulls.push(BAD_PR);
  e.fail = () => { e.repos[MIX_PROJECT].fail = { kind: 'network' }; };
  app = await open(e, '#/waiting', { later: true });
  try {
    const mine = troubleLines(app).filter(([, p]) => p === MIX_PROJECT);
    assert.equal(mine.length, 1);
    assert.equal(mine[0][0], 'cant');
    assert.match(mine[0][2], SINCE(MIX_PROJECT));
    await app.go(`#/waiting/${MIX_PROJECT}`);
    assert.match(aboveLanes(app), new RegExp(`^Can't read ${MIX_PROJECT} since \\d\\d:\\d\\d: ${REASON}$`));
    assert.doesNotMatch(keyed(app, 'board').textContent, /Can't show/);
  } finally {
    app.restore();
  }
  // Signed out: its read refused with the others' (made up, J6), after its first reads: its can't-read words.
  const o = signedOutState();
  o.repos[MIX_PROJECT].pulls.push(BAD_PR);
  app = await open(o, '#/waiting', { later: true });
  try {
    const mine = troubleLines(app).filter(([, p]) => p === MIX_PROJECT);
    assert.deepEqual(mine.map(([k]) => k), ['cant']);
    assert.match(mine[0][2], SINCE(MIX_PROJECT));
    assert.equal(troubleLines(app).filter(([k]) => k === 'show').length, 0, 'signed out: no "Can\'t show" line');
    await app.go(`#/waiting/${MIX_PROJECT}`);
    assert.match(aboveLanes(app), new RegExp(`^Can't read ${MIX_PROJECT} since \\d\\d:\\d\\d: `));
  } finally {
    app.restore();
  }
});

test('AC80, AC89 (a), G8d round 2: "Can\'t show <project>" goes on the first draw after the project draws again — every project shown, the line or "Nothing waiting: Alpha", never both nor neither; alone shown, the lanes\' counts and "Nothing here" back', async () => {
  for (const hash of ['#/waiting', `#/waiting/${MIX_PROJECT}`]) {
    const s = cantShowState();
    const app = await open(s, hash);
    try {
      assert.ok(keyed(app, `ql:show:${MIX_PROJECT}`), `${hash}: drawn first`);
      s.repos[MIX_PROJECT].pulls = s.repos[MIX_PROJECT].pulls.filter((x) => x !== BAD_PR);
      let steps = 0;
      for (;;) {
        const shown = Boolean(keyed(app, `ql:show:${MIX_PROJECT}`));
        if (hash === '#/waiting') assert.notEqual(shown, new RegExp(`\\b${MIX_PROJECT}\\b`).test(nothingLine(app) || ''), `${hash}: the line or "Nothing waiting", in one draw`);
        else assert.equal(shown, emptyOf(app, 'wait') === "Can't show", `${hash}: the line and the lane's words, in one draw`);
        if (!shown) break;
        await app.advance(1000);
        assert.ok(++steps < 3 * POLL_MS / 1000, `${hash}: drawn again`);
      }
      if (hash === '#/waiting') assert.match(nothingLine(app), new RegExp(`${MIX_PROJECT}$`));
      else {
        assert.equal(aboveLanes(app), null);
        assert.equal(emptyOf(app, 'wait'), 'Nothing here');
        assert.equal(laneCount(app, 'wait'), '0');
        assert.equal(lane(app, 'kick').textContent, 'Kicked back · none');
      }
    } finally {
      app.restore();
    }
  }
});

test('AC91 (c), G8d round 2, the Reviewer\'s N1: Waiting with every project shown, the 3-minute cause — Service-Desk\'s first read never answered (made up): its quiet line "✕ Can\'t read Service-Desk in this opening" in --bad, never its opening\'s time', async () => {
  const h = unreadState();
  h.repos[SD.name].hold = new Promise(() => {});
  const app = await open(h, '#/waiting', { polls: 4 });
  try {
    assert.equal(app.desk.states.get(SD.name).lastSuccessAt ?? null, null);
    const mine = troubleLines(app).filter(([, p]) => p === SD.name);
    assert.deepEqual(mine, [['cant', SD.name, OPENING(SD.name)]]);
    assertBad(app, keyed(app, `ql:cant:${SD.name}`), 'the 3-minute cause\'s quiet line');
    assert.doesNotMatch(keyed(app, `ql:cant:${SD.name}`).textContent, /since|\d\d:\d\d/);
  } finally {
    app.restore();
  }
});

test('AC91 (c), G8d round 2, the Reviewer\'s N2: a project\'s page for a project read before the sign-out — Service-Desk\'s waits row "✕ Can\'t read since HH:MM", with the sign-out\'s reason under it; signed out with Service-Desk never read before it, "Can\'t read in this opening"', async () => {
  let app = await open(signedOutState(), `#/p/${enc(SD.name)}`, { later: true });
  try {
    assert.ok(app.desk.states.get(SD.name).lastSuccessAt != null, 'read before the sign-out');
    const row = pageWaits(app);
    assert.match(byClass(row, 'v2-prtt')[0].textContent, /^Can't read since \d\d:\d\d$/);
    assert.equal(byClass(row, 'v2-small')[0].textContent, app.desk.states.get(SD.name).failure.words, 'the sign-out\'s reason under it');
    assert.match(byClass(row, 'v2-small')[0].textContent, /^Signed out/);
    assert.ok(has(row, 'bad') && has(svgOf(row), 'vi-bad'));
    for (const theme of THEMES) assert.equal(colours(app, theme).get(byClass(row, 'v2-prtt')[0]), BAD[theme], `${theme}: in --bad`);
  } finally {
    app.restore();
  }
  app = await open(signedOutMixedState(), `#/p/${enc(SD.name)}`, { later: true });
  try {
    assert.equal(byClass(pageWaits(app), 'v2-prtt')[0].textContent, "Can't read in this opening", 'never read before the sign-out');
  } finally {
    app.restore();
  }
});

test('AC89 (a), G8d round 2, the Reviewer\'s N3: an empty lane\'s "Can\'t read" on the blob-failure path — a made-up project (NOT real) whose held tree gives no card, its first read failing in its blob phase: its Waiting lane "Can\'t read" with no count, as on the no-tree path; "Not read in this opening", its line above the lanes, the strip "Kicked back · can\'t read"', async () => {
  const s = blobFailNoCardState();
  const app = await open(s, `#/waiting/${MIX_PROJECT}`, { polls: 2 });
  try {
    const alpha = s.repos[MIX_PROJECT];
    assert.ok((alpha.blobCalls || []).some((c) => c.some((x) => alpha.blobFail.includes(x))), 'its read reached the blob phase: the tree was held');
    assert.equal(app.desk.states.get(MIX_PROJECT).lastSuccessAt ?? null, null, 'no read of it succeeded in this opening');
    const reason = app.desk.states.get(MIX_PROJECT).failure.words;
    assert.equal(sub(app), 'Not read in this opening');
    assert.equal(aboveLanes(app), `${OPENING(MIX_PROJECT)}: ${reason}`);
    assert.equal(cardsIn(app, 'wait').length, 0, 'the held tree gives no card');
    assert.equal(emptyOf(app, 'wait'), "Can't read");
    assert.equal(laneCount(app, 'wait'), null, 'no count for an unknown');
    assert.ok(has(byClass(lane(app, 'wait'), 'v2-empty')[0], 'unknown'));
    assert.equal(lane(app, 'kick').textContent, "Kicked back · can't read");
    assert.equal(emptyOf(app, 'done'), 'Hold a card and drag it here', 'Done always says so');
    assert.equal(byClass(app.view, 'v2-qsmall').length, 0);
  } finally {
    app.restore();
  }
});

test('AC87, AC54, AC91 (c), G8d round 2, the Reviewer\'s N4: a made-up project the desk can\'t draw (BAD_PR, NOT real), never read in this opening, its read failing (its blobs, made up) — in the DOM, the cap\'s row "Alpha\'s phase: can\'t be read in this opening", the versions row "Alpha: can\'t be read in this opening", the head\'s "1 can\'t be read"; no "can\'t be shown"', async () => {
  const s = blobFailState('every file');
  s.repos[MIX_PROJECT].pulls.push(BAD_PR);
  const app = await open(s, '#/', { polls: 2 });
  try {
    assert.equal(app.desk.states.get(MIX_PROJECT).lastSuccessAt ?? null, null, 'never read in this opening');
    assert.match(keyed(app, `card:${MIX_PROJECT}`).textContent, /Can't show this project: /, 'the desk can\'t draw it');
    assert.match(capLine(app), new RegExp(`${MIX_PROJECT}'s phase: can't be read in this opening`));
    assert.match(versionsLine(app), new RegExp(`${MIX_PROJECT}: can't be read in this opening`));
    assert.deepEqual(headParts(app, 'active').bad, ["1 can't be read"]);
    assert.doesNotMatch(capLine(app) + versionsLine(app) + groupBtn(app, 'active').textContent, /can't be shown/);
    assert.doesNotMatch(capLine(app) + versionsLine(app), /\d\d:\d\d/, 'no time');
    await app.go('#/pf/cap');
    assert.equal(byClass(keyed(app, `pfs:${MIX_PROJECT}`), 'v2-small')[0].textContent, "Phase: can't be read in this opening · not counted");
  } finally {
    app.restore();
  }
});

test('AC91 (c), G8d round 2, the Reviewer\'s N5: boxStateText takes its words from IN_OPENING — its line holds the constant, and its source (and its src/public/lib copy) imports it from board.js, with no words of its own', () => {
  const box = { flaggedCount: 0, read: { read: 'cant-read', since: Date.parse('2026-10-14T15:02:00Z'), words: REASON } };
  const line = boxStateText(box, TZ, true);
  assert.ok(line.includes(IN_OPENING), line);
  assert.equal(line, `Can't read ${IN_OPENING}: ${REASON}`);
  for (const f of [join(SRC, 'lib', 'universe.js'), join(SRC, 'public', 'lib', 'universe.js')]) {
    const code = readFileSync(f, 'utf8');
    assert.match(code, /^import \{ IN_OPENING \} from '\.\/board\.js';$/m, f);
    const body = code.slice(code.indexOf('export function boxStateText'), code.indexOf('export function screenState'));
    assert.match(body, /\$\{opening \? IN_OPENING : /, f);
    assert.doesNotMatch(body.replace(/^\s*(\/\/|\*).*$/gm, ''), /in this opening/, `${f}: no words of its own`);
  }
});

// G8d's round 2's screens in G8D_OPENS draw what they are named for.
test('G8d round 2: G8D_OPENS\'s Waiting screens with a project that can\'t be shown each draw "Can\'t show <project>"', async () => {
  const mine = G8D_OPENS.filter(([where]) => /can't be shown/.test(where));
  assert.equal(mine.length, 3);
  for (const [where, open2] of mine) {
    const app = await open2();
    try {
      assert.equal(findAll(app.view, (e) => e.dataset && /^ql:show:/.test(e.dataset.k || '')).length, 1, where);
      assert.match(app.text(), /Can't show (Alpha|Bravo)/, where);
      if (/alone shown/.test(where)) assert.equal(emptyOf(app, 'wait'), "Can't show", where);
    } finally {
      app.restore();
    }
  }
});
