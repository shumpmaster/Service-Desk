// ac-test: S-001/AC91 — G8d of "After the glance audit": "in this opening" beyond Home, and "can't be shown" for a project
// the desk can read but can't draw (AC91 (c); the owner's answers of 2026-10-25 to G8c's design review,
// docs/design/references/owner-answers-2026-10-25-g8c-review.md: 1, "Yes, everywhere (Recommended)" — "Waiting, the project
// page and the Pipeline view use the same words as Home, one small change after 8c"; 2, "Say "can't be shown"
// (Recommended)" — "the cap row, the versions row and the group head say "can't be shown" for such a project, matching the
// briefing and tile"; 3, "Keep it, as built (Recommended)": "Nothing new since <time>" stays, nothing built). With them, AC89
// (a)'s state 2 holding the cards a read in this opening gave where its tree was held and its blob phase failed (AC89 (a),
// C, the Definer's reading after G8c's review), locked on Waiting as G8c's fix round locked Home's corner.
// ac-test: S-001/AC89 ac-test: S-001/AC54 ac-test: S-001/AC80 ac-test: S-001/AC87
//
// The page is the sandbox's own code under the fake DOM, on the fixture states of tests/desk/glance-fixtures.mjs (G8c's
// `openingState`, `signedOutMixedState`, `orderState`, and G8d's `blobFailState`, `cantShowState` and `G8D_OPENS`) over
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
import { oneProjectView, quietCantWords, cantSince, IN_OPENING } from '../../src/lib/board.js';
import { boxStateText } from '../../src/lib/universe.js';
import { capEntry, capView, versionsView, CANT_SHOWN } from '../../src/lib/portfolio.js';
import { groupHeaderWords } from '../../src/lib/sandbox.js';
import { IN_OPENING as HOME_IN_OPENING } from '../../src/lib/home.js';
import { BAD_PR } from './fake-desk.mjs';
import { unreadState, signedOutState, signedOutMixedState, openingState, orderState, mixState, blobFailState, cantShowState, g8cStore,
  MIX_PROJECT, MIX_PROJECT2, NOW, SD, POOM, CONFIG, SINCE_LATE, G8D_OPENS } from './glance-fixtures.mjs';

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
