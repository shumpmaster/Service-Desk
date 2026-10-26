// ac-test: S-001/AC95 — QW2 of "After the questions request": every card waiting on the owner shows its place, "<k> of <N>
// waiting", counted within its project (specs/S-001.md, AC95, all but its blocker parts, which are QW3's with AC96; the owner's
// "Blockers first" and answer 1, "One order per project (Recommended)"; the readings (e), (k), (n) and (p), standing by
// "Approve; all readings stand (Recommended)", decisions/questions/P-001-m3g-readings.md, A), with the changed parts of AC80
// and AC91 (f) that QW2's row names.
// ac-test: S-001/AC80 ac-test: S-001/AC91 ac-test: S-001/AC85
//
// The pure cases are board.js's (src/lib/board.js, with its src/public/lib copy): placeOrder, placesOf, boardView's places,
// its section, lanes and strip in place order, and heldView. The screen cases are the sandbox's own code under the fake DOM,
// on tests/desk/qw2-fixtures.mjs's states (`qw2BusiestState`, QW1's busiest board with Alpha holding twelve cards, every kind
// with no raised time among them, and kicked-back cards from three groups; `stripState`), and on one made-up project
// (sandbox-fixtures.mjs's fullRepo, md-extremes/'s one card of each kind), each made-up part labelled NOT real in
// tests/desk/fixtures/README.md. The suite has no browser, so each look is the cascade of the page's own stylesheets over what
// it drew (tests/desk/css-cascade.mjs), in light and dark, at 360 and 414 px; the stage's pull request carries the Chromium
// captures (`qw2-`, tests/desk/tools/glance-shots.mjs), which measure each place line's lines. This file holds QW2's page
// loads, apart from ac88-dark.test.mjs (the suite's memory: each file runs in its own process).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC, CONFIG } from './helpers.mjs';
import { loadSandbox, byClass, findAll, El0 } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { v3, fullRepo } from './sandbox-fixtures.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { boardView, placeOrder, placesOf, heldView, heldBoard, noMarks, PLACE_WORDS, WORDS, HOLD_MS, KICK_BACK_MINUTES } from '../../src/lib/board.js';
import * as PUBLIC_BOARD from '../../src/public/lib/board.js';
import { PF_BOARD } from '../../src/lib/portfolio.js';
import { qw2BusiestState, stripState, qw2Open, ALPHA_TWELVE, STRIP_ORDER, pfId, MISSING_ID, NOW } from './qw2-fixtures.mjs';
import { CARD, MIX_PROJECT, MIX_PROJECT2 } from './glance-fixtures.mjs';
import { qid, HELD_PATH, QPATH, qFile } from './qw1-fixtures.mjs';

const H = 3600e3;
const MIN = 60e3;
const D = 24 * H;
const TZ = CONFIG.ownerTimeZone;
const enc = encodeURIComponent;
const THEMES = ['light', 'dark'];
const WIDTHS = [360, 414];
const INK = { light: { ink: '#18191c', ink2: '#5c5f66' }, dark: { ink: '#ecedef', ink2: '#a2a5ac' } };
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');
/** Each drawn element's cascaded look in a theme and at a width: el → { colour, size, family, decl(prop), raw(prop) }. */
function looks(app, theme, width = 360) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) {
    if (!n.el) continue;
    out.set(n.el, { colour: plain(n.style.get('color')).trim().toLowerCase(), size: plain(n.style.get('font-size')), family: plain(n.style.get('font-family')),
      decl: (p) => plain(n.declared.get(p)).trim(), raw: (p) => String(n.declared.get(p) || '') });
  }
  return out;
}
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const cardOf = (app, id) => findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === id && / v2-card /.test(` ${e.className} `) && !findAll(e, (x) => x !== e && x.attrs && x.attrs['data-card'] === id).length)[0] || null;
const placeEl = (c) => (c && c.children[0] && / v2-place /.test(` ${c.children[0].className} `) ? c.children[0] : null);
/** What a place line shows (its words less the `.sb-vh` words read around them). */
const shown = (pl) => pl.children.filter((x) => x.nodeType === 3).map((x) => x.text).join('');
/** A card's place as the screen shows it, "<k> of <N> waiting", or null. */
const placeAt = (app, id) => { const pl = placeEl(cardOf(app, id)); return pl ? shown(pl) : null; };
const allCards = (app) => findAll(app.view, (e) => e.attrs && e.attrs['data-card'] && / v2-card /.test(` ${e.className} `));
/** Every card on the screen with its place, in the screen's order: [[id, "<k> of <N> waiting" | null]]. */
const drawn = (app) => allCards(app).map((c) => [c.attrs['data-card'], placeEl(c) ? shown(placeEl(c)) : null]);
const sheet = (app) => byClass(app.view, 'v2-sheet')[0] || null;
const sheetHead = (app) => byClass(byClass(sheet(app), 'v2-shead')[0], 'v2-mono')[0].textContent;
const seen = (extra = {}) => memStore({ 'desk-seen-v1': JSON.stringify({ lastLooked: NOW + H }), ...extra });
const badge = (app) => { const b = byClass(app.view, 'v2-badge')[0]; return b ? Number(b.children[0].textContent) : 0; };
const lane = (app, k) => keyed(app, `lane:${k}`);
const laneIds = (app, k) => byClass(lane(app, k), 'v2-card').map((c) => c.attrs['data-card']);
const sectionIds = (app) => byClass(keyed(app, 'qsec'), 'v2-qcard').map((c) => c.attrs['data-card']);
const hist = (ms) => [{ commit: { committer: { date: new Date(ms).toISOString() } } }];
/** The fake DOM's boxes for a drag (as ac91-glance-waiting.test.mjs's): Done on the right, nowhere else measured. */
function layout() {
  const saved = Object.getOwnPropertyDescriptor(El0.prototype, 'getBoundingClientRect');
  const style = Object.getOwnPropertyDescriptor(El0.prototype, 'style');
  El0.prototype.getBoundingClientRect = function rect() {
    if (this.dataset && this.dataset.k === 'lane:done') return { left: 248, right: 360, top: 300, bottom: 900, width: 112, height: 600 };
    return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
  };
  Object.defineProperty(El0.prototype, 'style', { configurable: true, get() { if (!this._st) this._st = {}; return this._st; } });
  return () => {
    if (saved) Object.defineProperty(El0.prototype, 'getBoundingClientRect', saved); else delete El0.prototype.getBoundingClientRect;
    if (style) Object.defineProperty(El0.prototype, 'style', style); else delete El0.prototype.style;
  };
}

// ---------------------------------------------------------------------------
// The pure cases

const P = { name: 'Alpha', repo: 'shumpmaster/Alpha', defaultBranch: 'main', model: 'v3' };
const P2 = { name: 'Beta', repo: 'shumpmaster/Beta', defaultBranch: 'main', model: 'v3' };
const PF = { name: PF_BOARD, label: 'Portfolio', portfolio: true, repo: 'shumpmaster/portfolio', defaultBranch: 'main', model: null };
const qc = (project, name, raisedAt) => ({ id: `${project}|question|questions/${name}.md`, key: `q:${name}`, project, kind: 'question', kindWord: 'Question', title: name, name, raisedAt, step: { id: 'answer' }, meta: [] });
const prc = (project, n, raisedAt) => ({ id: `${project}|pr|${n}`, key: `pr:${n}`, project, kind: 'pr', kindWord: 'Pull request', title: `#${n}`, number: n, raisedAt, step: { id: 'open' }, meta: [`#${n}`] });
const none = (project, kind, path) => ({ id: `${project}|${kind}|${path}`, key: `${kind}:${path}`, project, kind, kindWord: kind, title: path, raisedAt: null, step: { id: 'open' }, meta: [] });
const pfc = (file) => ({ id: pfId(file), key: `portfolio:queue/${file}`, project: PF_BOARD, kind: 'portfolio', kindWord: 'Decision', portfolio: true, title: file, raisedAt: null, step: { id: 'open' }, meta: [] });
const held = (name, raisedAt = NOW - H) => ({ name, path: `questions/${name}.md`, title: `${name}, held`, parsed: null, raisedAt: new Date(raisedAt), link: null, state: 'held' });
const entry = (project, cards, { asking = [], read = { ok: true }, agents = [], recording = [], answerRecording = [], recordRows = [] } = {}) =>
  ({ project, cards, agents, read, recording, asking, answerRecording, recordRows, seenRows: [] });
const mark = (id, { kicked = null, confirmedAt = null, at = NOW - 9 * MIN } = {}) => [id, { project: id.split('|')[0], step: id.includes('|pr|') ? 'open' : 'answer', head: null, at, title: id,
  kicked, prevKick: null, confirmedAt, number: null, kind: id.split('|')[1], name: null }];
const marksOf = (...ms) => ({ v: 1, marks: Object.fromEntries(ms) });
const kick = (id, at = NOW - 3 * MIN) => mark(id, { kicked: { at, reason: 'made up' } });
const placeList = (rows) => rows.map((c) => [c.id, c.place ? `${c.place.k}/${c.place.n}` : null]);

test('AC95 (pure, placeOrder): oldest first; every card with no raised time after every card with one, however long it waited; ties by the AC73 key, a portfolio card by its id, in code-unit order, never a locale\'s; total, so two reads of the same records agree', () => {
  const cards = [
    prc('Alpha', 9, NOW - 2 * H), prc('Alpha', 10, NOW - 2 * H), // a tie: "Alpha|pr|10" before "Alpha|pr|9" in code-unit order
    qc('Alpha', 'later', NOW - H), qc('Alpha', 'Zed', NOW - 5 * D), qc('Alpha', 'alpha', NOW - 5 * D), // "Z" (U+005A) before "a" (U+0061): code units, not a locale's order
    none('Alpha', 'merge', 'queue/P-002-merge-conflict.md'), none('Alpha', 'hold', 'queue/ci-hold-1.md'), none('Alpha', 'deploy', '1001'), none('Alpha', 'missing-card', 'status/P-009.toml'),
  ];
  const want = ['Alpha|question|questions/Zed.md', 'Alpha|question|questions/alpha.md', 'Alpha|pr|10', 'Alpha|pr|9', 'Alpha|question|questions/later.md',
    'Alpha|deploy|1001', 'Alpha|hold|queue/ci-hold-1.md', 'Alpha|merge|queue/P-002-merge-conflict.md', 'Alpha|missing-card|status/P-009.toml'];
  assert.deepEqual([...cards].sort(placeOrder).map((c) => c.id), want);
  assert.ok('Zed'.localeCompare('alpha') > 0, 'a locale would put "alpha" first: the rule does not');
  // Two reads of the same records, the cards in other orders: the same places.
  for (const shuffled of [[...cards].reverse(), [cards[4], cards[7], cards[0], cards[8], cards[2], cards[5], cards[1], cards[6], cards[3]]]) {
    assert.deepEqual([...placesOf(shuffled)], [...placesOf(cards)], 'the same from another read');
  }
  const places = placesOf(cards);
  assert.deepEqual(want.map((id) => places.get(id)), want.map((_, i) => ({ k: i + 1, n: 9 })), 'k from 1, N their count');
  // The portfolio's cards, which have no AC73 key and no raised time: by their ids.
  assert.deepEqual([...placesOf([pfc('PF-002-b.md'), pfc('PF-001-a.md')])].map(([id, p]) => [id, p.k, p.n]), [[pfId('PF-001-a.md'), 1, 2], [pfId('PF-002-b.md'), 2, 2]]);
  // The page's copy is the same module.
  assert.equal(PUBLIC_BOARD.placeOrder.toString(), placeOrder.toString());
  assert.equal(PUBLIC_BOARD.placesOf.toString(), placesOf.toString());
  assert.deepEqual([PLACE_WORDS.line(3, 12), PLACE_WORDS.held, `${PLACE_WORDS.before}${PLACE_WORDS.line(3, 12)}${PLACE_WORDS.after('Alpha')}`],
    ['3 of 12 waiting', 'Being asked in your session', 'Place 3 of 12 waiting on you in Alpha']);
});

test('AC95 (pure, boardView): one order per project — N each project\'s count of the cards the badge counts (the section\'s, the strip\'s and the lane\'s), the badge their sum; each project numbered on its own, the portfolio\'s group too; the section, the lanes and the strip in place order; a lane group\'s count smaller than its cards\' N; a kicked-back card placed by its own raised time; a held question with no place', () => {
  const alpha = [prc('Alpha', 7, NOW - 9 * H), qc('Alpha', 'a-late', NOW - H), qc('Alpha', 'a-early', NOW - 5 * H), qc('Alpha', 'a-kicked', NOW - 2 * H), prc('Alpha', 8, NOW - 30 * MIN),
    none('Alpha', 'hold', 'queue/ci-hold-1.md'), prc('Alpha', 6, NOW - 10 * H)];
  const beta = [qc('Beta', 'b-one', NOW - 3 * H), prc('Beta', 9, NOW - 20 * H), prc('Beta', 4, NOW - 40 * MIN)];
  const pf = [pfc('PF-002-b.md'), pfc('PF-001-a.md')];
  // Kicked back: Alpha's question (raised 2 h ago, kicked 3 min ago), Alpha's #8 (raised 30 min ago, kicked 9 min ago),
  // Beta's #9 (raised 20 h ago, kicked 1 min ago), the portfolio's PF-002 (kicked 2 min ago).
  const marks = marksOf(kick('Alpha|question|questions/a-kicked.md'), kick('Alpha|pr|8', NOW - 9 * MIN), kick('Beta|pr|9', NOW - MIN), kick(pfId('PF-002-b.md'), NOW - 2 * MIN));
  const v = boardView({ projects: [entry(P, alpha, { asking: [held('a-held')] }), entry(P2, beta), entry(PF, pf)], marks, only: null, nowMs: NOW, tz: TZ });
  // N: each project's count, the badge's sum (AC81, unchanged).
  assert.deepEqual([...v.counts].map(([k, c]) => [k, c.waiting + c.kicked]), [['Alpha', 7], ['Beta', 3], [PF_BOARD, 2]]);
  assert.equal(v.badge, 12);
  // Alpha's one order, by age: #6 (10 h), #7 (9 h), a-early (5 h), a-kicked (2 h, its own raised time, not its kick's), a-late (1 h), #8 (30 min), the hold card (none).
  const alphaWant = { 'Alpha|pr|6': 1, 'Alpha|pr|7': 2, 'Alpha|question|questions/a-early.md': 3, 'Alpha|question|questions/a-kicked.md': 4, 'Alpha|question|questions/a-late.md': 5,
    'Alpha|pr|8': 6, 'Alpha|hold|queue/ci-hold-1.md': 7 };
  for (const [id, k] of Object.entries(alphaWant)) assert.deepEqual([v.places.get(id).k, v.places.get(id).n, v.places.get(id).label], [k, 7, 'Alpha'], id);
  // Beta's own, from 1 again: numbers never mix projects.
  assert.deepEqual(['Beta|pr|9', 'Beta|question|questions/b-one.md', 'Beta|pr|4'].map((id) => `${v.places.get(id).k}/${v.places.get(id).n}`), ['1/3', '2/3', '3/3']);
  // The portfolio's group, numbered on its own, by its cards' ids (no raised time).
  assert.deepEqual([pfId('PF-001-a.md'), pfId('PF-002-b.md')].map((id) => [v.places.get(id).k, v.places.get(id).n, v.places.get(id).label]), [[1, 2, 'Portfolio'], [2, 2, 'Portfolio']]);
  // The section, in place order within each project's group; the held question at its group's head (until QW3), no place.
  const sec = v.questions.groups.find((g) => g.project === 'Alpha');
  assert.deepEqual(sec.held.map((c) => [c.name, c.place]), [['a-held', null]]);
  assert.deepEqual(placeList(sec.rows), [['Alpha|question|questions/a-early.md', '3/7'], ['Alpha|question|questions/a-kicked.md', '4/7'], ['Alpha|question|questions/a-late.md', '5/7']]);
  assert.deepEqual(v.questions.order.map((c) => c.name || c.id), ['a-held', 'a-early', 'a-kicked', 'a-late', 'b-one'], 'the section draws them so');
  // The lanes, in place order within each group; the group's count its own cards', smaller than N.
  const wait = v.lanes.find((l) => l.key === 'wait');
  assert.deepEqual(wait.groups.map((g) => [g.project, placeList(g.rows), g.rows.length]), [
    ['Alpha', [['Alpha|pr|6', '1/7'], ['Alpha|pr|7', '2/7'], ['Alpha|hold|queue/ci-hold-1.md', '7/7']], 3],
    ['Beta', [['Beta|pr|4', '3/3']], 1],
    [PF_BOARD, [[pfId('PF-001-a.md'), '1/2']], 1],
  ], 'a lane group\'s count (3) smaller than its cards\' N (7)');
  // The strip: by project in J7's order, the portfolio's last, then place — not the newest kick first (Beta's #9, the
  // portfolio's, Alpha's question, Alpha's #8), nor by age across projects (Beta's #9, 20 h, before Alpha's #8, 30 min).
  assert.deepEqual(v.strip.map((c) => [c.id, `${c.place.k}/${c.place.n}`, c.stripProject]), [['Alpha|pr|8', '6/7', 'Alpha'], ['Beta|pr|9', '1/3', 'Beta'], [pfId('PF-002-b.md'), '2/2', 'Portfolio']]);
  // A portfolio group passed before a project's still goes last in the strip.
  const swapped = boardView({ projects: [entry(PF, pf), entry(P, alpha), entry(P2, beta)], marks, only: null, nowMs: NOW, tz: TZ });
  assert.deepEqual(swapped.strip.map((c) => c.id), ['Alpha|pr|8', 'Beta|pr|9', pfId('PF-002-b.md')], 'the portfolio\'s last');
  // Home's, a project's page's and Plan's lists (`waits`) are as before: the kicked-back cards still newest first there.
  assert.deepEqual(v.waits.find((l) => l.key === 'kick').groups.find((g) => g.project === 'Alpha').rows.map((c) => c.id), ['Alpha|question|questions/a-kicked.md', 'Alpha|pr|8']);
});

test('AC95 (pure): N in each state — a card marked done here and confirming leaves N and its place; a confirmed one too; "Undo" brings it back to its place; kicked back it takes its place again by its raised time; Done\'s rows and the quiet lines\' items have none; with one project shown, each card keeps its place', () => {
  const cards = [prc('Alpha', 1, NOW - 5 * H), prc('Alpha', 2, NOW - 4 * H), prc('Alpha', 3, NOW - 3 * H), qc('Alpha', 'q', NOW - 2 * H)];
  const at = (marks, opts = {}) => boardView({ projects: [entry(P, cards, opts), entry(P2, [prc('Beta', 5, NOW - 9 * H)])], marks, only: opts.only || null, nowMs: NOW, tz: TZ });
  const placesOfAlpha = (v) => cards.map((c) => (v.places.get(c.id) ? `${v.places.get(c.id).k}/${v.places.get(c.id).n}` : null));
  assert.deepEqual(placesOfAlpha(at(noMarks())), ['1/4', '2/4', '3/4', '4/4'], 'every card waiting');
  // #2 marked done here: confirming, in Done, with no place; the places after it close up.
  const pending = at(marksOf(mark('Alpha|pr|2')));
  assert.deepEqual(placesOfAlpha(pending), ['1/3', null, '2/3', '3/3']);
  const doneRow = pending.lanes.find((l) => l.key === 'done').groups[0].rows[0];
  assert.deepEqual([doneRow.id, doneRow.pending, doneRow.place], ['Alpha|pr|2', true, undefined], 'Done\'s row: no place');
  // Confirmed by GitHub (the card still read at the same step, until the next poll judges it): no place either.
  assert.deepEqual(placesOfAlpha(at(marksOf(mark('Alpha|pr|2', { confirmedAt: NOW - MIN })))), ['1/3', null, '2/3', '3/3']);
  // "Undo": no mark, so its place again.
  assert.deepEqual(placesOfAlpha(at(noMarks())), ['1/4', '2/4', '3/4', '4/4']);
  // Kicked back: counted again, its place by its raised time (4 h ago), not its kick's (now).
  const kicked = at(marksOf(kick('Alpha|pr|2', NOW - 10)));
  assert.deepEqual(placesOfAlpha(kicked), ['1/4', '2/4', '3/4', '4/4']);
  assert.deepEqual(kicked.strip.map((c) => [c.id, c.place.k]), [['Alpha|pr|2', 2]]);
  // The quiet lines' items: with the agents, being recorded, being asked (held), an answer being recorded: none placed.
  const quiet = at(noMarks(), { agents: [{ id: 'Alpha|pr|40', project: 'Alpha', number: 40, title: 'with the agents', link: null, waits: [] }], recording: [{ key: 'r', pr: { number: 41 } }],
    asking: [held('h')], answerRecording: [{ name: 'ans', title: 'ans', words: WORDS.answerRecording }] });
  assert.deepEqual([...quiet.places.keys()].filter((id) => id.startsWith('Alpha|')).sort(), cards.map((c) => c.id).sort(), 'only the cards the badge counts have a place');
  assert.equal(quiet.questions.groups[0].held[0].place, null, 'a held question: none');
  // With one project shown, its cards keep their places (C, (c)); the other project's are not shown.
  const one = at(noMarks(), { only: 'Alpha' });
  assert.deepEqual(one.lanes.find((l) => l.key === 'wait').groups.map((g) => placeList(g.rows)), [[['Alpha|pr|1', '1/4'], ['Alpha|pr|2', '2/4'], ['Alpha|pr|3', '3/4']]]);
  assert.deepEqual(placeList(one.questions.order), [['Alpha|question|questions/q.md', '4/4']]);
  assert.equal(one.of, 2, 'the chip\'s "1 of 2 projects" is still its own count');
});

test('AC95 (pure, heldView): while a card is held or a sheet is open, the view drawn before the hold, for the same screen; with none drawn before (opened at a sheet), the fresh one; with no hold, the fresh one', () => {
  const drawnBefore = { only: null, n: 'before' };
  const fresh = { only: null, n: 'fresh' };
  assert.equal(heldView({ fresh, drawn: drawnBefore, hold: true, only: null }), drawnBefore);
  assert.equal(heldView({ fresh, drawn: drawnBefore, hold: false, only: null }), fresh);
  assert.equal(heldView({ fresh, drawn: null, hold: true, only: null }), fresh);
  assert.equal(heldView({ fresh: { only: 'Alpha' }, drawn: drawnBefore, hold: true, only: 'Alpha' }).only, 'Alpha', 'another screen\'s view is never drawn');
});

test('AC95 (pure, heldBoard; "Settled from QW2\'s build", 3): with no hold, the fresh board, held next; held, the board held for this screen, kept; a page opened straight at a sheet, the first board drawn under the sheet on its item, held from then; before the sheet finds its item, nothing held', () => {
  const before = { only: null, n: 'before' };
  const fresh = { only: null, n: 'fresh' };
  assert.deepEqual(heldBoard({ fresh, drawn: before, hold: false }), { view: fresh, drawn: fresh }, 'no hold');
  assert.deepEqual(heldBoard({ fresh, drawn: before, hold: true }), { view: before, drawn: before }, 'a sheet opened over the board drawn before it');
  // Opened straight at a sheet: none held; the first drawing with the sheet on its item is drawn and held.
  const first = heldBoard({ fresh, drawn: null, hold: true, found: true });
  assert.deepEqual(first, { view: fresh, drawn: fresh });
  const next = { only: null, n: 'a later read' };
  assert.deepEqual(heldBoard({ fresh: next, drawn: first.drawn, hold: true, found: true }), { view: fresh, drawn: fresh }, 'a later read moves nothing');
  assert.deepEqual(heldBoard({ fresh, drawn: null, hold: true, found: false }), { view: fresh, drawn: null }, 'before its item is read: nothing held');
  assert.deepEqual(heldBoard({ fresh: { only: 'Alpha' }, drawn: before, hold: true, only: 'Alpha', found: true }).drawn.only, 'Alpha', 'another screen\'s board is never held over');
  assert.equal(PUBLIC_BOARD.heldBoard.toString(), heldBoard.toString());
});

// ---------------------------------------------------------------------------
// The screen cases

test('AC95 on the busiest board (qw2BusiestState, made up, NOT real): Alpha\'s twelve cards numbered 1 to 12 across the section, the strip and the lane, every kind with no raised time last (a deploy, a hold card, a merge card, a card gone missing), two-digit places; every other project from 1 again; the portfolio\'s group "1 of 2" and "2 of 2"; the held question "Being asked in your session"; the strip by project in J7\'s order, the portfolio\'s last; Done\'s rows and the quiet lines with none', async () => {
  const app = await qw2Open(qw2BusiestState(), '#/waiting');
  try {
    assert.deepEqual(ALPHA_TWELVE.map((id) => placeAt(app, id)), ALPHA_TWELVE.map((_, i) => `${i + 1} of 12 waiting`), 'Alpha\'s one order, two-digit places');
    assert.deepEqual(ALPHA_TWELVE.slice(-4).map((id) => byClass(cardOf(app, id), 'v2-kd')[0].textContent), ['Deploy', 'Hold', 'Merge card', 'Decision'], 'the kinds with no raised time, last');
    assert.equal(cardOf(app, MISSING_ID('Alpha')).textContent.includes('card file not found'), true, 'the last a card that went missing');
    // The section, then the lane, each in place order within Alpha's group; the strip holds #82 between.
    assert.deepEqual(sectionIds(app).filter((id) => id.startsWith('Alpha|')), ['Alpha|question|questions/Alpha-pick.md', 'Alpha|question|questions/Alpha-second.md']);
    assert.deepEqual(laneIds(app, 'wait').filter((id) => id.startsWith('Alpha|')), ALPHA_TWELVE.filter((id) => !/question|\|pr\|82$/.test(id)));
    assert.equal(byClass(keyed(app, 'grp:wait:Alpha'), 'v2-gc')[0].textContent, '9', 'its group in the lane counts its own nine, under N = 12');
    // Each other project from 1 again; Delta (v2.5) holds one.
    assert.equal(placeAt(app, CARD.pr('Beta')), '1 of 6 waiting');
    assert.equal(placeAt(app, qid('Beta', QPATH.Beta)), '2 of 6 waiting', 'Beta\'s kicked-back question, by its own raised time');
    assert.equal(placeAt(app, qid('Delta', QPATH.Delta)), '1 of 1 waiting');
    assert.deepEqual([pfId('PF-001-explore-1.md'), pfId('PF-002-explore-1.md')].map((id) => placeAt(app, id)), ['1 of 2 waiting', '2 of 2 waiting'], 'the portfolio\'s group');
    // The held question: its place line's words, no number.
    const heldCard = cardOf(app, qid('Beta', HELD_PATH));
    assert.deepEqual([placeEl(heldCard).className, placeEl(heldCard).textContent], ['v2-place v2-mono', PLACE_WORDS.held]);
    // The strip: Alpha, Gamma, then the portfolio, each with its place.
    const strip = byClass(keyed(app, 'lane:kick'), 'v2-card');
    assert.deepEqual(strip.map((c) => [c.attrs['data-card'], shown(placeEl(c))]), [['Alpha|pr|82', '8 of 12 waiting'], [CARD.merge('Gamma'), '6 of 6 waiting'], [pfId('PF-001-explore-1.md'), '1 of 2 waiting']]);
    // Every card the badge counts has its place, once; nothing else on Waiting has one.
    const placed = allCards(app).filter((c) => placeEl(c) && !/held/.test(c.attrs['data-question'] || ''));
    assert.equal(placed.length, badge(app), 'one place for each card the badge counts');
    assert.equal(new Set(placed.map((c) => c.attrs['data-card'])).size, placed.length);
    for (const g of byClass(lane(app, 'done'), 'v2-drow').concat(byClass(lane(app, 'done'), 'v2-card'))) assert.equal(byClass(g, 'v2-place').length, 0, 'Done: none');
    for (const q of byClass(app.view, 'v2-quiet')) assert.equal(byClass(q, 'v2-place').length, 0, 'the quiet lines: none');
  } finally {
    app.restore();
  }
});

test('AC95 with one project shown (C, (c)): each card keeps its place, and the chip\'s "1 of <n> projects" keeps its words, so the two counts are told apart', async () => {
  const app = await qw2Open(qw2BusiestState(), '#/waiting/Alpha');
  try {
    assert.deepEqual(ALPHA_TWELVE.map((id) => placeAt(app, id)), ALPHA_TWELVE.map((_, i) => `${i + 1} of 12 waiting`));
    assert.equal(allCards(app).filter((c) => !c.attrs['data-card'].startsWith('Alpha|')).length, 0, 'only Alpha\'s');
    assert.equal(byClass(byClass(app.view, 'v2-filter')[0], 'v2-small')[0].textContent, '1 of 5 projects');
  } finally {
    app.restore();
  }
});

test('AC95 ("Where the place shows"; AC80\'s card, changed): the place on a line of its own at the card\'s top, above the kind line, "<k> of <N> waiting" in --t-mono --ink (a held question\'s words --ink2), the kind line, its icon and its "new" unchanged; at 360 px a lane card\'s line fits one line ("12 of 12 waiting"); its accessible text "Place <k> of <N> waiting on you in <project>" read first — in light and dark, at 360 and 414 px', async () => {
  const app = await qw2Open(qw2BusiestState(), '#/waiting', { store: memStore({ 'desk-seen-v1': JSON.stringify({ lastLooked: NOW - 4 * H }), ...qw2BusiestState().seed }) });
  try {
    const twelve = cardOf(app, ALPHA_TWELVE[11]);
    const pl = placeEl(twelve);
    assert.equal(pl.tag, 'span');
    assert.equal(shown(pl), '12 of 12 waiting');
    assert.equal(pl.textContent, 'Place 12 of 12 waiting on you in Alpha', 'its accessible text');
    assert.deepEqual(pl.children.filter((x) => x.nodeType !== 3).map((x) => [x.className, x.textContent]), [['sb-vh', 'Place '], ['sb-vh', ' on you in Alpha']], 'the words around it for a screen reader only');
    assert.ok(twelve.textContent.startsWith('Place 12 of 12 waiting on you in Alpha'), 'read first');
    // A card raised since "last looked" (4 hours before NOW): its "new" stays on its kind line, under the place.
    const newCard = cardOf(app, CARD.card('Alpha')); // the decision card, raised 200 minutes before NOW
    assert.equal(byClass(newCard, 'v2-kd')[0].textContent, 'Decision new', 'its "new" on its kind line, as before');
    assert.equal(byClass(cardOf(app, CARD.gate('Alpha')), 'v2-kd')[0].textContent, 'Gate · Build', 'and none on one raised before it');
    assert.equal(newCard.children[1], byClass(newCard, 'v2-kd')[0], 'the kind line second, under the place');
    for (const theme of THEMES) {
      for (const w of WIDTHS) {
        const L = looks(app, theme, w);
        const at = `${theme}, ${w} px`;
        for (const c of allCards(app)) {
          const p = placeEl(c);
          if (!p) continue;
          const l = L.get(p);
          assert.match(l.raw('font'), /^400 11px\/1\.4 ⟦--mono\|/, `${at}: ${c.attrs['data-card']}: --t-mono`);
          assert.equal(l.colour, c.attrs['data-question'] === 'held' ? INK[theme].ink2 : INK[theme].ink, `${at}: ${c.attrs['data-card']}: ${c.attrs['data-question'] === 'held' ? '--ink2' : '--ink'}`);
          // The kind line as before: its own role and colour, its icon first.
          const kd = byClass(c, 'v2-kd')[0];
          assert.equal(c.children.indexOf(kd), 1, `${at}: the kind line under the place`);
          assert.match(L.get(kd).raw('font'), /^500 11px\/1\.35 ⟦--font\|/, 'the kind line\'s --t-label');
          assert.equal(L.get(kd).colour, INK[theme].ink2);
          assert.equal(kd.children[0].tag, 'svg', 'its icon first');
          for (const v of p.children.filter((x) => x.nodeType !== 3)) assert.equal(L.get(v).decl('position'), 'absolute', 'the screen reader\'s words take no room');
        }
        // One line at 360 px in a lane card: the page's 16 px gutters, the lanes' 6 px gap, the card's 1 px edges and 7 px
        // padding leave each lane card (360 − 32 − 6) / 2 − 2 − 14 = 145 px for "12 of 12 waiting", sixteen characters of
        // Plex Mono at 11 px, 0.6 em each: 105.6 px. The captures measure it in Chromium (`qw2-`).
        const lc = L.get(twelve);
        assert.deepEqual([lc.decl('padding'), lc.decl('border')], ['6px 7px 7px', `1px solid ${theme === 'light' ? '#e7e7ea' : '#26282c'}`]);
        assert.equal(L.get(byClass(app.view, 'v2-lanes')[0]).decl('gap'), '6px');
        const room = (w - 32 - 6) / 2 - 2 - 14;
        assert.ok(shown(pl).length * 0.6 * 11 <= room, `${at}: "${shown(pl)}" fits ${room} px`);
      }
    }
  } finally {
    app.restore();
  }
});

// Rewritten after the Definer's notes (not forced: it passed, its "no place" now saying nothing true; AC95's "Settled from
// QW2's build", 5): the held question's sheet's small line adds " · being asked in your session", its card's words.
test('AC95 (AC85\'s head, changed): a card\'s sheet\'s small line adds " · <k> of <N> waiting" — a pull request, a question, a gate card, a card with no raised time, the portfolio\'s — and the held question\'s " · being asked in your session", no number', async () => {
  const s = qw2BusiestState();
  const app = await qw2Open(s, '#/waiting');
  try {
    const heads = [
      ['Alpha|pr|81', /^Alpha · pull request · #81 · waiting 3 d \d+ h · 3 of 12 waiting$/],
      [qid('Alpha', QPATH.Alpha), / · 4 of 12 waiting$/],
      [CARD.gate('Alpha'), /^Alpha · gate · P-002 · waiting .* · 6 of 12 waiting$/],
      [CARD.merge('Alpha'), /^Alpha · merge card · P-002 · wait not recorded · 11 of 12 waiting$/],
      [pfId('PF-002-explore-1.md'), /^portfolio · decision · PF-002-explore-1\.md · PM1 · wait not recorded · 2 of 2 waiting$/],
      [qid('Beta', QPATH.Beta), / · 2 of 6 waiting$/],
    ];
    for (const [id, want] of heads) {
      await app.go(`#/waiting/card/${enc(id)}`);
      assert.match(sheetHead(app), want, id);
      await app.go('#/waiting');
    }
    await app.go(`#/waiting/card/${enc(qid('Beta', HELD_PATH))}`);
    assert.match(sheetHead(app), /^Beta · question · Beta-plan-units · M3B · waiting 2 h \d+ m · being asked in your session$/, 'the held question: its card\'s words, no number');
    assert.equal(byClass(cardOf(app, qid('Beta', HELD_PATH)), 'v2-place')[0].textContent.toLowerCase(), 'being asked in your session', 'the words its card\'s place line has');
  } finally {
    app.restore();
  }
});

// One made-up project (md-extremes/'s one card of each kind, NOT real), opened on Waiting.
function one() {
  const r = fullRepo('Alpha');
  return { config: { ...CONFIG, projects: [v3('Alpha')] }, repos: { Alpha: r }, r };
}
const ONE_ORDER = [CARD.pr('Alpha'), CARD.question('Alpha'), CARD.gate('Alpha'), CARD.card('Alpha'), CARD.hold('Alpha'), CARD.merge('Alpha')];
const places = (app, ids) => ids.map((id) => placeAt(app, id));

test('AC95 ("When the order changes"): the places after a card arrives (an earlier one at its place, the rest moved down), is answered (gone, the rest closed up), is marked Done (into Done with no place), is undone (its place again), is kicked back (its place by its raised time) and goes (its pull request closed)', async () => {
  const s = one();
  const app = await qw2Open(s, '#/waiting', { store: seen() });
  try {
    assert.deepEqual(places(app, ONE_ORDER), ['1 of 6 waiting', '2 of 6 waiting', '3 of 6 waiting', '4 of 6 waiting', '5 of 6 waiting', '6 of 6 waiting']);
    // Arrives: a made-up question raised 2 days before NOW (NOT real), between the pull request (8 days) and the question (400 minutes).
    const NEW = 'questions/Alpha-arrived.md';
    s.r.commit({ [NEW]: qFile({ title: 'A made-up question that arrives, NOT real', options: ['A. Yes.', 'B. No.'], rec: 'A' }) });
    s.r.history[NEW] = hist(NOW - 2 * D);
    await app.advance(POLL_MS);
    const arrived = `Alpha|question|${NEW}`;
    assert.deepEqual(places(app, [ONE_ORDER[0], arrived, ...ONE_ORDER.slice(1)]), [1, 2, 3, 4, 5, 6, 7].map((k) => `${k} of 7 waiting`), 'a card arrives: its place by the rule');
    // Answered: its answer file on the default branch; it leaves, the places after it close up.
    s.r.commit({ 'decisions/questions/Alpha-arrived.md': 'Ruling: A (made up, NOT real)\n' });
    await app.advance(POLL_MS);
    assert.equal(cardOf(app, arrived), null, 'answered: gone');
    assert.deepEqual(places(app, ONE_ORDER), [1, 2, 3, 4, 5, 6].map((k) => `${k} of 6 waiting`), 'the places closed up');
    // Marked Done: into Done, confirming, with no place; the places after it close up.
    await app.go(`#/waiting/card/${enc(CARD.gate('Alpha'))}`);
    await app.tap(keyed(app, 'sheet-done'));
    await app.go('#/waiting');
    const conf = byClass(lane(app, 'done'), 'v2-card conf');
    assert.deepEqual(conf.map((c) => byClass(c, 'v2-t')[0].textContent), ['The Build gate · P-002'], 'in Done, confirming');
    assert.equal(byClass(conf[0], 'v2-place').length, 0, 'in Done: no place');
    assert.equal(cardOf(app, CARD.gate('Alpha')), null, 'no longer a card waiting');
    assert.deepEqual(places(app, ONE_ORDER.filter((id) => id !== CARD.gate('Alpha'))), [1, 2, 3, 4, 5].map((k) => `${k} of 5 waiting`));
    // Undone: its place again.
    await app.tap(keyed(app, `undo:${CARD.gate('Alpha')}`));
    assert.deepEqual(places(app, ONE_ORDER), [1, 2, 3, 4, 5, 6].map((k) => `${k} of 6 waiting`), 'undone: back in its place');
    // Marked again, then kicked back at the first successful poll after 5 minutes: its place by its raised time, in the strip.
    await app.go(`#/waiting/card/${enc(CARD.gate('Alpha'))}`);
    await app.tap(keyed(app, 'sheet-done'));
    await app.go('#/waiting');
    for (let i = 0; i <= KICK_BACK_MINUTES; i++) await app.advance(POLL_MS);
    const kicked = cardOf(app, CARD.gate('Alpha'));
    assert.ok(byClass(keyed(app, 'lane:kick'), 'v2-card').includes(kicked), 'kicked back: in the strip');
    assert.equal(shown(placeEl(kicked)), '3 of 6 waiting', 'its place by its own raised time, not its kick\'s');
    // Goes: its pull request closed; the rest close up.
    s.r.pulls = [];
    await app.advance(POLL_MS);
    assert.equal(cardOf(app, CARD.pr('Alpha')), null);
    assert.deepEqual(places(app, ONE_ORDER.slice(1)), [1, 2, 3, 4, 5].map((k) => `${k} of 5 waiting`), 'gone: the places closed up');
  } finally {
    app.restore();
  }
});

test('AC95 + AC40 ("nothing reorders under the owner\'s thumb"): while a sheet is open, a card arriving moves nothing on Waiting, the sheet\'s own place included; closed, the new places; while a card is held for a drag, the same; let go, the new places', async () => {
  const s = one();
  const app = await qw2Open(s, '#/waiting', { store: seen() });
  const undo = layout();
  try {
    const before = drawn(app);
    assert.deepEqual(before.map(([, p]) => p), ['2 of 6 waiting', '1 of 6 waiting', '3 of 6 waiting', '4 of 6 waiting', '5 of 6 waiting', '6 of 6 waiting'], 'the section, then the lane');
    // A sheet open over Waiting; a card arrives at the next poll, raised before every other.
    await app.go(`#/waiting/card/${enc(CARD.card('Alpha'))}`);
    assert.match(sheetHead(app), / · 4 of 6 waiting$/);
    const NEW = 'questions/Alpha-early.md';
    s.r.commit({ [NEW]: qFile({ title: 'A made-up question raised first, NOT real', options: ['A. Yes.', 'B. No.'], rec: 'A' }) });
    s.r.history[NEW] = hist(NOW - 20 * D);
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.deepEqual(drawn(app).filter(([id]) => !findAll(sheet(app), (e) => e.attrs && e.attrs['data-card'] === id).length), before, 'nothing on Waiting moved');
    assert.match(sheetHead(app), / · 4 of 6 waiting$/, 'nor the sheet\'s place');
    // Closed: the new places, the new card first.
    await app.go('#/waiting');
    assert.equal(placeAt(app, `Alpha|question|${NEW}`), '1 of 7 waiting');
    assert.equal(placeAt(app, CARD.card('Alpha')), '5 of 7 waiting');
    const settled = drawn(app);
    // A card held for a drag (a finger's press and hold); a card goes at the next poll: nothing moves until it is let go.
    const c = cardOf(app, CARD.hold('Alpha'));
    c.dispatch('pointerdown', { target: byClass(c, 'v2-t')[0], clientX: 60, clientY: 150, pointerType: 'touch' });
    await app.flush();
    await app.advance(HOLD_MS);
    assert.ok(c.className.split(' ').includes('lifted'), 'held');
    s.r.pulls = [];
    await app.advance(POLL_MS);
    assert.deepEqual(drawn(app), settled, 'nothing moved while it was held');
    await app.docEvent('pointerup', { clientX: 60, clientY: 150 });
    await app.flush();
    assert.equal(cardOf(app, CARD.pr('Alpha')), null, 'let go: the new board');
    assert.equal(placeAt(app, CARD.hold('Alpha')), '5 of 6 waiting', 'and the new places');
  } finally {
    undo();
    app.restore();
  }
});

// AC95's "Settled from QW2's build", 3: a page opened straight at a sheet (a notification's tap, an address kept) holds the
// first board drawn under the sheet on its item, the sheet's own place with it, until it closes; the bar's badge stays live.
test('AC95 ("Settled from QW2\'s build", 3): a page opened straight at a sheet holds the first board drawn under it — a read that changes the order moves neither the board nor the sheet\'s " · <k> of <N> waiting"; the badge counts the new card meanwhile; closed, the new places', async () => {
  const s = one();
  const app = await loadSandbox({ ...s, hash: `#/waiting/card/${enc(CARD.card('Alpha'))}`, now: NOW, store: seen() });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.match(sheetHead(app), / · 4 of 6 waiting$/, 'the sheet on its item, its place');
    const first = drawn(app);
    assert.deepEqual(first.map(([, p]) => p), ['2 of 6 waiting', '1 of 6 waiting', '3 of 6 waiting', '4 of 6 waiting', '5 of 6 waiting', '6 of 6 waiting'], 'the first board drawn under it');
    assert.equal(badge(app), 6);
    // A made-up question raised before every other (NOT real) arrives at the next reads.
    const NEW = 'questions/Alpha-first.md';
    s.r.commit({ [NEW]: qFile({ title: 'A made-up question raised first, NOT real', options: ['A. Yes.', 'B. No.'], rec: 'A' }) });
    s.r.history[NEW] = hist(NOW - 20 * D);
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.deepEqual(drawn(app), first, 'the board under the sheet: nothing moved');
    assert.match(sheetHead(app), / · 4 of 6 waiting$/, 'nor the sheet\'s place');
    assert.equal(badge(app), 7, 'the badge live: a count, not a place');
    // Closed: the new places.
    await app.go('#/waiting');
    assert.equal(placeAt(app, `Alpha|question|${NEW}`), '1 of 7 waiting');
    assert.equal(placeAt(app, CARD.card('Alpha')), '5 of 7 waiting');
    await app.go(`#/waiting/card/${enc(CARD.card('Alpha'))}`);
    assert.match(sheetHead(app), / · 5 of 7 waiting$/, 'opened again: its new place');
  } finally {
    app.restore();
  }
});

test('AC95 + AC91 (f), the strip across projects (stripState, made up, NOT real): by project in J7\'s order, the portfolio\'s last, then place, so the strip reads "Alpha · 1 of 6", "Alpha · 3 of 6", "Bravo · 1 of 6", "Bravo · 5 of 6", "Portfolio · 1 of 1"', async () => {
  const st = stripState();
  const app = await qw2Open(st, '#/waiting');
  try {
    const strip = byClass(keyed(app, 'lane:kick'), 'v2-card');
    assert.deepEqual(strip.map((c) => c.attrs['data-card']), STRIP_ORDER);
    assert.deepEqual(strip.map((c) => `${byClass(c, 'v2-kp')[0].textContent.replace(/^ · /, '')} · ${shown(placeEl(c)).replace(/ waiting$/, '')}`),
      ['Alpha · 1 of 6', 'Alpha · 3 of 6', 'Bravo · 1 of 6', 'Bravo · 5 of 6', 'Portfolio · 1 of 1']);
    // Bravo's kicked-back question in the section, its place in Bravo's order.
    assert.equal(placeAt(app, CARD.question(MIX_PROJECT2)), '2 of 6 waiting');
    assert.equal(placeAt(app, CARD.question(MIX_PROJECT)), '2 of 6 waiting', 'numbers never mix projects');
  } finally {
    app.restore();
  }
});
