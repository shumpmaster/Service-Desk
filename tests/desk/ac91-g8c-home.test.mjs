// ac-test: S-001/AC91 — G8c of "After the glance audit": on Home, "in this opening" for a project never read in it, the
// briefing's lines in the tiles' order, and the grey "not shown" line (AC91 (c); the owner's rulings of 2026-10-25,
// decisions/questions/P-001-glance-opening-wording.md, B: ""In this opening" everywhere — the briefing and tile say "Can't
// read <project> in this opening" too"; P-001-glance-cant-read-order.md, B: "Tile order in both — the briefing's can't-read
// lines follow the tiles too"; P-001-glance-cant-show-line.md, B: "A line for it too — "<project> not shown, its lines may
// be missing", in the same grey, in tile order with the others"); AC89 (a)'s "HH:MM" rule on Home and AC89 (h)'s cap and
// versions rows with it; and the tile's line that stops short of the now arrow (AC92 (b); P-001-glance-arrow-on-line.md, B:
// "The line stops short — where a line leads into the now circle, it ends before the arrow, so the arrow stands on its
// own"). The red "Not read since" line stays as built (P-001-glance-since-red-line.md, A): G7b's case of it is kept, in
// tests/desk/ac91-g7b-since-missing.test.mjs.
// ac-test: S-001/AC82 ac-test: S-001/AC89 ac-test: S-001/AC92
//
// The page is the sandbox's own code under the fake DOM, on the fixture states G8c adds to tests/desk/glance-fixtures.mjs
// (`openingState`, `signedOutMixedState`, `orderState`, `sprintsState(1)`, `g8cStore`, `G8C_OPENS`) over `mix`, `quiet`,
// `unread`, signed-out and `nowShared`: Service-Desk's records at 77bfeae, real, with made-up projects, times, failures,
// groups folded and sprints, each labelled NOT real in tests/desk/fixtures/README.md. The suite has no browser, so each
// look is the cascade of the page's own stylesheets over what it drew (tests/desk/css-cascade.mjs), in light and dark, at
// 360 and 414 px; the stage's pull request carries the Chromium captures (`g8c-`, tests/desk/tools/glance-shots.mjs), the
// stopped line measured against the arrow there.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { briefingView, tileWaits, tileFoot, sinceMissingLines, sinceUnreadWords } from '../../src/lib/home.js';
import { capView, capEntry, versionsView } from '../../src/lib/portfolio.js';
import { BAD_PR } from './fake-desk.mjs';
import { withPortfolio, addPortfolio, pfFiles } from './pf-fixtures.mjs';
import { unreadState, orderState, nowShared, mixState, sprintsState, g8cStore, lookedAt, MIX_PROJECT, NOW, SD, POOM, CONFIG, SINCE_LATE, SINCE_FULL, G8C_OPENS } from './glance-fixtures.mjs';

const TZ = CONFIG.ownerTimeZone;
const SHEET = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(SHEET, 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const INK = { light: { ink2: '#5c5f66', bad: '#b3162a' }, dark: { ink2: '#a2a5ac', bad: '#ff6b78' } };
const THEMES = ['light', 'dark'];
const WIDTHS = [360, 414];
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1').trim();
const HHMM = /^\d\d:\d\d$/;
/** AC5's reason in words for the network cause the fixtures make up. */
const REASON = "network error: the desk's function could not be reached";

/** Each drawn element's cascaded look in a theme and width: el → { colour, size, weight, decl(prop), pseudo(which, prop) }. */
function looks(app, theme, width = 360) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) {
    if (!n.el) continue;
    out.set(n.el, { colour: plain(n.style.get('color')), size: plain(n.style.get('font-size')), weight: plain(n.style.get('font-weight')), decl: (p) => plain(n.declared.get(p)),
      pseudo: (which, p) => (n.pseudo[which] ? plain(n.pseudo[which].declared.get(p)) : '') });
  }
  return out;
}
const has = (e, c) => ` ${(e && e.className) || ''} `.includes(` ${c} `);
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const home = (app) => keyed(app, 'home');
const brief = (app) => byClass(app.view, 'v2-brief')[0];
const first = (app) => byClass(brief(app), 'v2-bt1')[0].textContent;
const under = (app) => byClass(brief(app), 'v2-bcant').map((l) => l.textContent);
const tile = (app, name) => keyed(app, `card:${name}`);
const corner = (app, name) => byClass(tile(app, name), 'v2-wt')[0];
const missBox = (app) => keyed(app, 'since-miss');
const missing = (app) => (missBox(app) ? missBox(app).children.filter((c) => c.tag === 'p').map((p) => p.textContent) : []);
const sinceKeys = (app) => {
  const kids = home(app).children.map((c) => c.dataset && c.dataset.k);
  return kids.slice(kids.indexOf('since-h'), kids.indexOf('hgroups'));
};
/** The drawn tiles, by project name, in their order on Home. */
const drawnTiles = (app) => findAll(app.view, (e) => e.dataset && /^card:/.test(e.dataset.k || '')).map((e) => e.dataset.k.slice(5));
const capLine = (app) => findAll(keyed(app, 'portfolio'), (e) => e.dataset && e.dataset.k === 'pf:cap')[0].textContent;
const versionsLine = (app) => findAll(keyed(app, 'portfolio'), (e) => e.dataset && e.dataset.k === 'pf:versions')[0].textContent;
const svgOf = (el) => findAll(el, (e) => e.tag === 'svg')[0] || null;
const OPENING = (name) => `Can't read ${name} in this opening`;
const MISS = (name, at) => `${name} not read ${at}, its lines may be missing`;
const SHOWN = (name) => `${name} not shown, its lines may be missing`;
const opened = (where) => G8C_OPENS.find(([w]) => w === where)[1]();

async function open(setup, { looked = SINCE_LATE, store = null, later = null } = {}) {
  const app = await loadSandbox({ ...setup, hash: '#/', now: NOW, store: store || lookedAt(looked) });
  await app.advance(1000);
  await app.advance(POLL_MS);
  if (later) {
    later();
    await app.advance(3 * POLL_MS);
  }
  return app;
}

// ---------------------------------------------------------------------------
// The pure functions, each with a never-read input; their cases for a project read earlier kept as they were

test('AC91 (c), G8c, the pure functions: a project no read of which has succeeded in this opening says "in this opening" in place of "since HH:MM" — briefingView\'s line, tileWaits\' corner, tileFoot\'s red foot, capEntry\'s and versionsView\'s "can\'t be read in this opening" — for either cause and with no time held; a project read earlier keeps its time; "Can\'t show" kept for one the desk can\'t draw', () => {
  const t1 = Date.parse('2026-10-14T15:02:00Z'); // 10:02 in Chicago
  const cant = (since) => ({ read: 'cant-read', since });
  const bv = (reads, extra = {}) => briefingView({ bd: null, reads, flagged: 0, signedOut: false, v3: () => true, lastReadMs: null, nowMs: NOW, tz: TZ, ...extra });
  // The briefing's line, its first line where nothing waits.
  assert.equal(bv([{ name: 'A', read: cant(t1), opening: true }]).head, OPENING('A'), 'a failed read, never read in this opening');
  assert.equal(bv([{ name: 'A', read: cant(null), opening: true }]).head, OPENING('A'), 'no time held: "in this opening" too, never "Can\'t show" for want of a time');
  assert.equal(bv([{ name: 'A', read: cant(t1), opening: false }]).head, "Can't read A since 10:02", 'read earlier: its time kept');
  assert.equal(bv([{ name: 'A', read: cant(t1) }]).head, "Can't read A since 10:02", 'with no `opening` given: as built');
  assert.equal(bv([{ name: 'A', read: { read: 'ok', since: t1 }, drawError: "Can't show this project: x", opening: false }]).head, "Can't show A");
  assert.equal(bv([{ name: 'A', read: cant(t1), drawError: "Can't show this project: x", opening: true }]).head, OPENING('A'), 'can\'t be drawn and its read failing: the read\'s words');
  // In the order given (Home's tile order), the portfolio's own line after the projects'.
  const v = bv([{ name: 'Z', read: cant(t1), opening: true }, { name: 'B', read: { read: 'ok', since: t1 } }, { name: 'A', read: cant(t1), opening: false }],
    { portfolio: { fresh: false, quietWords: "Can't read your portfolio since 09:00" } });
  assert.deepEqual([v.kind, v.head, ...v.cant], ['cant', OPENING('Z'), "Can't read A since 10:02", "Can't read your portfolio since 09:00"]);
  // With something waiting: every line under "<n> need you", in the order given, the portfolio's last.
  const bd = { badge: 1, lanes: [], counts: new Map([['B', { waiting: 1, kicked: 0 }]]) };
  const you = bv([{ name: 'Z', read: cant(t1), opening: true }, { name: 'A', read: cant(t1), opening: false }], { bd, portfolio: { fresh: false, quietWords: "Can't read your portfolio since 09:00" } });
  assert.deepEqual([you.kind, you.head, ...you.cant], ['you', '1 needs you', OPENING('Z'), "Can't read A since 10:02", "Can't read your portfolio since 09:00"]);
  // Signed out: the briefing's own words, no can't-read line.
  const so = bv([{ name: 'Z', read: cant(t1), opening: true }], { signedOut: true });
  assert.deepEqual([so.head, so.cant], ['Signed out — reload to sign in', []]);
  // The tile's corner and foot.
  assert.deepEqual(tileWaits(0, 'cant-read', '10:02', true), { you: false, bad: true, words: "Can't read in this opening" });
  assert.deepEqual(tileWaits(0, 'cant-read', null, true), { you: false, bad: true, words: "Can't read in this opening" }, 'no time held');
  assert.deepEqual(tileWaits(0, 'cant-read', '10:02', false), { you: false, bad: true, words: "Can't read since 10:02" });
  assert.deepEqual(tileWaits(0, 'cant-read', '10:02'), { you: false, bad: true, words: "Can't read since 10:02" }, 'as built');
  assert.deepEqual(tileWaits(0, 'cant-read', null), { you: false, bad: true, words: "Can't read" }, 'as built');
  assert.deepEqual(tileWaits(2, 'cant-read', '10:02', true), { you: true, bad: false, words: '2 wait on you' }, 'with cards waiting the corner keeps what waits');
  assert.deepEqual(tileWaits(0, 'ok', null, true), { you: false, bad: false, words: 'Nothing waiting' });
  assert.deepEqual(tileFoot(2, 'cant-read', '10:02', 'network error', true), { bad: true, words: "Can't read in this opening: network error" });
  assert.deepEqual(tileFoot(2, 'cant-read', null, 'network error', true), { bad: true, words: "Can't read in this opening: network error" });
  assert.deepEqual(tileFoot(2, 'cant-read', '10:02', 'network error', false), { bad: true, words: "Can't read since 10:02: network error" });
  assert.deepEqual(tileFoot(0, 'cant-read', '10:02', 'network error', true), { bad: false, words: 'Reason: network error' }, 'beside a corner that says it can\'t read: "Reason:" as built');
  assert.equal(tileFoot(0, 'checking', null, 'x', true), null);
  // The cap and the versions row.
  const p = (name) => ({ name, model: 'v3' });
  const never = { state: 'cant-read', since: '10:02', opening: true };
  const earlier = { state: 'cant-read', since: '10:02', opening: false };
  const tracked = (phase) => ({ tracked: true, done: false, nowRun: { phase } });
  assert.equal(capEntry({ project: p('A'), pv: { tracked: false }, error: false, read: never }).why, "can't be read in this opening");
  assert.equal(capEntry({ project: p('A'), pv: { tracked: false }, error: false, read: { ...never, since: null } }).why, "can't be read in this opening", 'no time held');
  assert.equal(capEntry({ project: p('A'), pv: { tracked: false }, error: false, read: earlier }).why, "can't be read since 10:02");
  assert.deepEqual(capView([{ project: p('A'), pv: { tracked: false }, error: false, read: never }, { project: p('B'), pv: tracked('Build'), error: false, read: earlier }]).parts.map((x) => x.text),
    ['In Build or Launch: B · can\'t be read since 10:02', "A's phase: can't be read in this opening", 'your cap: no record for this in the model yet']);
  const snapOf = (files) => ({ tree: new Map(Object.keys(files).map((f) => [f, { sha: f }])), records: new Map(Object.entries(files)) });
  assert.deepEqual(versionsView([{ project: p('A'), snap: null, read: never }, { project: p('B'), snap: snapOf({}), read: never }, { project: p('C'), snap: null, read: earlier }]).rows.map((x) => x.words),
    ["A: can't be read in this opening", "B: not recorded · can't be read in this opening", "C: can't be read since 10:02"]);
});

test('AC91 (c), G8c, sinceMissingLines: a project the desk can\'t draw whose read works gets "<project> not shown, its lines may be missing", in the order given with the "not read" lines; one that can\'t be drawn and whose read fails keeps its "not read" line alone; "Not read since" reads only the reads', () => {
  const t1 = Date.parse('2026-10-14T15:02:00Z');
  const err = "Can't show this project: x";
  const reads = [{ name: 'Z', read: { read: 'cant-read', since: t1 }, succeeded: true }, { name: 'B', read: null, succeeded: true, drawError: err },
    { name: 'C', read: { read: 'ok', since: t1 }, succeeded: true }, { name: 'D', read: { read: 'cant-read', since: t1 }, succeeded: false, drawError: err }];
  assert.deepEqual(sinceMissingLines(reads, TZ), [{ name: 'Z', words: MISS('Z', 'since 10:02') }, { name: 'B', words: SHOWN('B') }, { name: 'D', words: MISS('D', 'in this opening') }]);
  // A "Checking…" read can't be drawn: its lines are missing because it can't be drawn, so it is named.
  assert.deepEqual(sinceMissingLines([{ name: 'B', read: { read: 'checking', since: null }, succeeded: false, drawError: err }], TZ), [{ name: 'B', words: SHOWN('B') }]);
  // The "not shown" line is not a read's: the empty line stays "Nothing new since <time>" (no "Not read since").
  assert.equal(sinceUnreadWords([{ name: 'B', read: null, succeeded: true, drawError: err }], TZ), null);
  assert.deepEqual(sinceMissingLines([{ name: 'B', read: null, succeeded: true }], TZ), [], 'no drawError given: as G7b built it');
});

// ---------------------------------------------------------------------------
// "In this opening" in each of Home's places

test('AC91 (c), G8c: on one Home, Service-Desk never read in this opening and the made-up project read earlier and then failing, each by its own — the briefing\'s line with its ✕, the tile\'s corner, the cap\'s row and sheet and the versions row say "in this opening" for the first and "since HH:MM" for the second; G7b\'s grey lines and G1\'s red line unchanged; colours, icons, places and counts as built', async () => {
  const app = await opened('Home, one project never read in this opening, one read earlier');
  try {
    const text = home(app).textContent;
    // Service-Desk: no read of it succeeded in this opening.
    assert.ok(under(app).includes(OPENING(SD.name)), JSON.stringify(under(app)));
    assert.equal(corner(app, SD.name).textContent, "Can't read in this opening");
    assert.ok(has(corner(app, SD.name), 'bad'), 'the corner in --bad, as built');
    assert.ok(svgOf(corner(app, SD.name)), 'with its ✕');
    assert.equal(byClass(tile(app, SD.name), 'v2-tfoot')[0].textContent, `Reason: ${REASON}`, 'beside a corner that says it can\'t read: "Reason:" as built');
    assert.match(capLine(app), new RegExp(`${SD.name}'s phase: can't be read in this opening`));
    assert.match(versionsLine(app), new RegExp(`${SD.name}: can't be read in this opening`));
    assert.doesNotMatch(text, new RegExp(`(Can't read ${SD.name} since|${SD.name}'s phase: can't be read since|${SD.name}: can't be read since)`), 'never its opening\'s time');
    // The made-up project: read in this opening, then failing, its cards waiting: its time kept.
    const at = /Can't read Alpha since (\d\d:\d\d)/.exec(under(app).join(' | '));
    assert.ok(at, JSON.stringify(under(app)));
    assert.match(corner(app, MIX_PROJECT).textContent, /^\d+ wait on you$/, 'what waits, as built');
    const foot = byClass(tile(app, MIX_PROJECT), 'v2-ln').filter((l) => has(l, 'bad')).map((l) => l.textContent);
    assert.deepEqual(foot, [`Can't read since ${at[1]}: ${REASON}`], 'its red foot keeps the time');
    assert.match(capLine(app), new RegExp(`${MIX_PROJECT} · can't be read since ${at[1]}`));
    assert.match(versionsLine(app), new RegExp(`${MIX_PROJECT}: .* · can't be read since ${at[1]}`));
    // The list's lines as G1 and G7b built them.
    assert.deepEqual(missing(app), [MISS(MIX_PROJECT, `since ${at[1]}`), MISS(SD.name, 'in this opening')]);
    assert.equal(keyed(app, 'since-none').textContent, 'Not read in this opening');
    // Each line's look as built: the briefing's lines and the corner in --bad with the ✕.
    for (const theme of THEMES) {
      const L = looks(app, theme);
      for (const l of byClass(brief(app), 'v2-bcant')) {
        assert.equal(L.get(l).colour, INK[theme].bad, `${theme}: ${l.textContent}`);
        assert.ok(has(svgOf(l), 'vi-bad'), `${l.textContent}: its ✕`);
      }
      assert.equal(L.get(corner(app, SD.name)).colour, INK[theme].bad, `${theme}: the corner`);
    }
    // The group head's can't-read count says no time, unchanged.
    assert.doesNotMatch(byClass(app.view, 'v2-hgb')[0].textContent, /since|opening/);
    // The cap's sheet, the same words in its row.
    await app.go('#/pf/cap');
    const row = findAll(app.view, (e) => e.dataset && e.dataset.k === `pfs:${SD.name}`)[0];
    assert.equal(byClass(row, 'v2-small')[0].textContent, "Phase: can't be read in this opening · not counted");
    const alpha = findAll(app.view, (e) => e.dataset && e.dataset.k === `pfs:${MIX_PROJECT}`)[0];
    assert.match(byClass(alpha, 'v2-small')[0].textContent, new RegExp(`· can't be read since ${at[1]} · not counted$`));
    await app.go('#/pf/versions');
    const vrow = findAll(app.view, (e) => e.dataset && e.dataset.k === `pfs:${SD.name}`)[0];
    assert.match(vrow.textContent, /^Service-Desk: can't be read in this opening/);
  } finally {
    app.restore();
  }
});

test('AC91 (c), G8c: the briefing\'s line under "<n> need you", and its first line where it is the can\'t-read line, with its ✕ and its accessible name; a project never read holds no cards, so its corner says it can\'t read', async () => {
  // Service-Desk alone failing from the start, nothing waiting on it, but the made-up project's cards: so its line is under "<n> need you".
  const s = unreadState();
  s.fail();
  let app = await open(s);
  try {
    assert.ok(under(app).includes(OPENING(SD.name)), 'under the count');
  } finally {
    app.restore();
  }
  // Nothing waits anywhere (`quiet`), Service-Desk failing from the start: its line is the first.
  const q = orderState({ only: [SD.name] });
  app = await open(q);
  try {
    assert.equal(first(app), OPENING(SD.name));
    assert.equal(brief(app).attrs['aria-label'], `${OPENING(SD.name)}: open Waiting`);
    assert.ok(has(svgOf(byClass(brief(app), 'v2-bi')[0]), 'vi-bad'), 'its mark the ✕, as built');
    assert.deepEqual(under(app), []);
  } finally {
    app.restore();
  }
  // The made-up project failing from the start: no read of it, so no cards held and its corner says it can't read (the red
  // foot beside a corner that says what waits needs cards from a read in this opening, so it keeps "since HH:MM" on the
  // page: tileFoot's never-read case is the pure function's, above).
  const u = unreadState({ who: MIX_PROJECT });
  u.fail();
  app = await open(u);
  try {
    assert.equal(corner(app, MIX_PROJECT).textContent, "Can't read in this opening");
  } finally {
    app.restore();
  }
});

test('AC91 (c), G8c: the 3-minute cause (the opening\'s start as "since"): a project whose first read never comes back says "in this opening" in the briefing, its corner, the cap and the versions row; one read and then left unanswered for 3 minutes keeps "since HH:MM"', async () => {
  const s = unreadState();
  s.repos[SD.name].hold = new Promise(() => {}); // made up: its reads never answered
  const app = await loadSandbox({ ...s, hash: '#/', now: NOW, store: lookedAt(SINCE_LATE) });
  try {
    await app.advance(1000);
    await app.advance(4 * POLL_MS);
    assert.equal(corner(app, SD.name).textContent, "Can't read in this opening");
    assert.ok(under(app).includes(OPENING(SD.name)), JSON.stringify(under(app)));
    assert.match(capLine(app), new RegExp(`${SD.name}'s phase: can't be read in this opening`));
    assert.match(versionsLine(app), new RegExp(`${SD.name}: can't be read in this opening`));
    assert.deepEqual(missing(app), [MISS(SD.name, 'in this opening')]);
  } finally {
    app.restore();
  }
  const r = unreadState();
  const later = await open(r);
  try {
    r.repos[SD.name].hold = new Promise(() => {});
    await later.advance(5 * POLL_MS);
    assert.match(corner(later, SD.name).textContent, /^Can't read since \d\d:\d\d$/, 'read earlier: the last success\'s time');
    assert.ok(under(later).some((w) => new RegExp(`^Can't read ${SD.name} since \\d\\d:\\d\\d$`).test(w)), JSON.stringify(under(later)));
  } finally {
    later.restore();
  }
});

test('AC91 (c), G8c, signed out: each project by its own — "in this opening" on the tile, the cap and the versions row where no read of it succeeded before the sign-out, "since HH:MM" where one did; the briefing "Signed out — reload to sign in" with no can\'t-read line', async () => {
  let app = await opened('Home, signed out from the start');
  try {
    assert.equal(first(app), 'Signed out — reload to sign in');
    assert.deepEqual(under(app), []);
    for (const name of drawnTiles(app)) assert.equal(corner(app, name).textContent, "Can't read in this opening", name);
    assert.match(capLine(app), new RegExp(`${SD.name}'s phase: can't be read in this opening`));
    assert.match(versionsLine(app), new RegExp(`${SD.name}: can't be read in this opening`));
    assert.doesNotMatch(home(app).textContent, /can't be read since|Can't read since/);
  } finally {
    app.restore();
  }
  app = await opened('Home, signed out, one project never read before it and the others read');
  try {
    assert.equal(first(app), 'Signed out — reload to sign in');
    assert.deepEqual(under(app), []);
    assert.equal(corner(app, SD.name).textContent, "Can't read in this opening", 'never read before the sign-out');
    assert.match(corner(app, POOM.name).textContent, /^Can't read since \d\d:\d\d$/, 'read before it');
    assert.match(capLine(app), new RegExp(`${SD.name}'s phase: can't be read in this opening`));
    assert.match(capLine(app), new RegExp(`${MIX_PROJECT} · can't be read since \\d\\d:\\d\\d`));
    assert.match(versionsLine(app), new RegExp(`${SD.name}: can't be read in this opening`));
    assert.match(versionsLine(app), new RegExp(`${POOM.name}: .*can't be read since \\d\\d:\\d\\d`));
  } finally {
    app.restore();
  }
});

test('AC91 (c), G8c, not on Home, kept as built: the same never-read project on Waiting (its quiet line, and with it alone shown its line above the lanes), its page\'s waits row and the v2.5 Pipeline view\'s state line still say "since HH:MM"', async () => {
  // Service-Desk and Personal-Org-Operating-Model (v2.5) failing from the start (made up).
  const s = orderState({ waiting: true });
  const app = await open(s);
  try {
    assert.equal(corner(app, SD.name).textContent, "Can't read in this opening", 'Home says "in this opening"');
    assert.equal(corner(app, POOM.name).textContent, "Can't read in this opening");
    await app.go('#/waiting');
    assert.match(keyed(app, `ql:cant:${SD.name}`).textContent, new RegExp(`^Can't read ${SD.name} since \\d\\d:\\d\\d$`), 'Waiting\'s quiet line');
    await app.go(`#/waiting/${encodeURIComponent(SD.name)}`);
    assert.match(keyed(app, 'quiet-cant').textContent, new RegExp(`^Can't read ${SD.name} since \\d\\d:\\d\\d: ${REASON}$`), 'its line above the lanes, one project shown');
    await app.go(`#/p/${encodeURIComponent(SD.name)}`);
    assert.match(keyed(app, 'page-waits').textContent, /Can't read since \d\d:\d\d/, 'its page\'s waits row');
    assert.doesNotMatch(keyed(app, 'page-waits').textContent, /in this opening/);
    await app.go(`#/p/${encodeURIComponent(POOM.name)}/pipeline`);
    assert.match(app.text(), /Can't read since \d\d:\d\d: network error/, 'the v2.5 Pipeline view\'s state line');
    assert.doesNotMatch(app.text(), /in this opening/);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The briefing's lines in Home's tile order

/** Home's tile order by groups, folded ones included: each open group's drawn tiles, a folded group's members from the state. */
function assertOrder(app, want, where) {
  const named = (ws) => ws.map((w) => (/^Can't (?:read|show) (.+?)(?: since \d\d:\d\d| in this opening)?$/.exec(w) || [])[1] || w);
  assert.deepEqual(named([first(app), ...under(app)].filter((w) => /^Can't (read|show) /.test(w) && !/your portfolio/.test(w))), want, `${where}: the briefing's lines`);
  assert.deepEqual(missing(app).map((w) => w.split(/ not (?:read|shown)/)[0]), want, `${where}: the same order as G7b's grey lines`);
}

test('AC91 (c), G8c, the briefing\'s order, nothing waiting: two and three projects failing, the config\'s order (Service-Desk, Personal-Org-Operating-Model, Alpha) not the tiles\', the closed group folded — the first line (`.v2-bt1`) names the first in tile order, its aria-label with it, the lines under it (`.v2-bcant`) the rest in tile order, as G7b\'s grey lines', async () => {
  for (const [where, only, want] of [
    ['two', [SD.name, MIX_PROJECT], [MIX_PROJECT, SD.name]],
    ['three, one in the folded group', null, [MIX_PROJECT, SD.name, POOM.name]],
  ]) {
    const s = orderState({ only });
    assert.deepEqual(s.config.projects.map((p) => p.name), [SD.name, POOM.name, MIX_PROJECT], 'the config\'s order');
    const app = await open(s, { store: g8cStore(SINCE_LATE, { closed: false }) });
    try {
      const closed = findAll(app.view, (e) => e.dataset && e.dataset.k === 'hgroup-btn:closed')[0];
      assert.equal(closed.attrs['aria-expanded'], 'false', `${where}: the closed group folded`);
      assert.deepEqual(drawnTiles(app), [MIX_PROJECT, SD.name], `${where}: the active group's tiles drawn, the folded one's not`);
      assert.equal(brief(app).className, 'v2-brief k-cant');
      assert.equal(first(app), OPENING(want[0]), `${where}: the first in tile order`);
      assert.equal(brief(app).attrs['aria-label'], `${OPENING(want[0])}: open Waiting`, `${where}: the accessible name with it`);
      assert.deepEqual(under(app), want.slice(1).map(OPENING), `${where}: the rest in tile order`);
      assertOrder(app, want, where);
      // Waiting's quiet lines keep the board's order (the config's), as before.
      await app.go('#/waiting');
      const ql = findAll(app.view, (e) => e.dataset && /^ql:cant:/.test(e.dataset.k || '')).map((e) => e.dataset.k.slice(8));
      assert.deepEqual(ql, s.config.projects.map((p) => p.name).filter((n) => want.includes(n)), `${where}: Waiting's quiet lines in their order as before`);
    } finally {
      app.restore();
    }
  }
});

test('AC91 (c), G8c, the briefing\'s order with a card waiting: every line under "<n> need you" in tile order — the made-up project (its cards waiting) first, then Service-Desk, then Personal-Org-Operating-Model in the folded closed group — and J23\'s portfolio line still last', async () => {
  const s = orderState({ waiting: true });
  const app = await open(s, { store: g8cStore(SINCE_LATE, { closed: false }), later: s.fail });
  try {
    assert.equal(brief(app).className, 'v2-brief k-you');
    assert.match(first(app), /^\d+ needs? you$/);
    const at = /^Can't read Alpha since (\d\d:\d\d)$/.exec(under(app)[0] || '');
    assert.ok(at, JSON.stringify(under(app)));
    assert.deepEqual(under(app), [`Can't read ${MIX_PROJECT} since ${at[1]}`, OPENING(SD.name), OPENING(POOM.name)]);
    assertOrder(app, [MIX_PROJECT, SD.name, POOM.name], 'cards waiting');
  } finally {
    app.restore();
  }
  // J23's "Can't read your portfolio" (made up: the portfolio refused, NOT a real record): no project, so after them.
  const p = orderState({ only: [SD.name, MIX_PROJECT] });
  p.config = withPortfolio(p.config);
  addPortfolio(p.repos, pfFiles({})).fail = { state: 'cant-read', reason: 'no-access' };
  const pf = await loadSandbox({ ...p, hash: '#/', now: Date.parse('2026-10-22T18:00:00Z'), store: g8cStore(SINCE_LATE, null) });
  try {
    await pf.advance(1000);
    for (let i = 0; i < 7; i++) await pf.advance(POLL_MS);
    const all = [first(pf), ...under(pf)];
    assert.deepEqual(all.slice(0, 2), [OPENING(MIX_PROJECT), OPENING(SD.name)], 'the projects in tile order');
    assert.equal(all.length, 3, JSON.stringify(all));
    assert.doesNotMatch(all[2], /^Can't read (Alpha|Service-Desk)/, 'the portfolio\'s line last');
    assert.match(all[2], /portfolio/);
  } finally {
    pf.restore();
  }
});

// ---------------------------------------------------------------------------
// The "not shown" line

/** The grey line's look, as G7b's lines (`--t-small` `--ink2`, no icon, not a link, never cut), in light and dark at 360 px. */
function assertGrey(app, where) {
  const b = missBox(app);
  assert.ok(b, where);
  assert.equal(b.className, 'v2-smiss');
  for (const p of b.children.filter((c) => c.tag === 'p')) {
    assert.equal(p.className, 'v2-small', `${where}: ${p.textContent}`);
    assert.equal(findAll(p, (e) => e.tag === 'svg').length, 0, `${where}: no icon, no ✕`);
    for (let a = p; a; a = a.parent) assert.ok(a.tag !== 'a' && a.tag !== 'ol' && a.tag !== 'li', `${where}: not a link, not one of the list's lines`);
    for (const theme of THEMES) {
      const L = looks(app, theme).get(p);
      assert.deepEqual([L.size, L.weight, L.colour], ['12px', '400', INK[theme].ink2], `${where}, ${theme}`);
      assert.equal(L.decl('overflow-wrap'), 'anywhere', `${where}, ${theme}: wraps`);
      for (const prop of ['white-space', 'text-overflow', 'max-height', '-webkit-line-clamp']) assert.ok(['', 'normal'].includes(L.decl(prop)), `${where}, ${theme}: ${prop}`);
    }
  }
}

test('AC91 (c), G8c, the "not shown" line: a made-up project the desk can\'t draw (fake-desk.mjs\'s BAD_PR, NOT real) whose read works — "Since you last looked" ends with "Alpha not shown, its lines may be missing", grey, not one of the four lines; the empty line "Nothing new since <time>" kept above it; once only; gone on the first draw after the project draws again', async () => {
  const s = mixState();
  s.repos[MIX_PROJECT].pulls.push(BAD_PR);
  const app = await open(s);
  try {
    assert.match(tile(app, MIX_PROJECT).textContent, /Can't show this project: /, 'it can\'t be drawn');
    assert.equal(byClass(tile(app, MIX_PROJECT), 'v2-tnm')[0].textContent, MIX_PROJECT, 'named as its tile names it');
    assert.deepEqual(missing(app), [SHOWN(MIX_PROJECT)]);
    assert.deepEqual(missBox(app).children.map((p) => p.dataset.k), [`since-miss:${MIX_PROJECT}`], 'keyed by its project, once');
    const none = keyed(app, 'since-none');
    assert.match(none.textContent, /^Nothing new since /, 'every read working: the empty line as built, never "Not read since"');
    assert.equal(none.className, 'v2-small');
    assert.deepEqual(sinceKeys(app), ['since-h', 'since-none', 'since-miss']);
    assert.ok(under(app).includes(`Can't show ${MIX_PROJECT}`) || first(app) === `Can't show ${MIX_PROJECT}`, 'the briefing\'s "Can\'t show" as built');
    assertGrey(app, 'not shown');
    // The project drawn again (the made-up pull request gone): its line is there exactly while its tile can't be drawn.
    s.repos[MIX_PROJECT].pulls = s.repos[MIX_PROJECT].pulls.filter((x) => x !== BAD_PR);
    let steps = 0;
    while (/Can't show this project: /.test(tile(app, MIX_PROJECT).textContent)) {
      assert.deepEqual(missing(app), [SHOWN(MIX_PROJECT)], 'still not drawn: its line');
      await app.advance(1000);
      assert.ok(++steps < 3 * POLL_MS / 1000, 'drawn again');
    }
    assert.equal(missBox(app), null, 'on the first draw after it draws again: the line gone, no box');
    assert.match(keyed(app, 'since-none').textContent, /^Nothing new since /);
  } finally {
    app.restore();
  }
});

test('AC91 (c), G8c, the "not shown" line in tile order among the "not read" lines (two projects failing beside it, the config\'s order not the tiles\'), one line per project; with "<n> more", under it and not in its sheet; none with the markers off', async () => {
  const app = await opened('Home, a project the desk can\'t draw beside two failing, nothing waiting');
  try {
    assert.deepEqual(missing(app), [SHOWN(MIX_PROJECT), MISS(SD.name, 'in this opening'), MISS(POOM.name, 'in this opening')]);
    assert.equal(first(app), `Can't show ${MIX_PROJECT}`, 'the briefing in the same order');
    assert.deepEqual(under(app), [OPENING(SD.name), OPENING(POOM.name)]);
    assertGrey(app, 'beside two');
    for (const n of [MIX_PROJECT, SD.name, POOM.name]) assert.equal(missing(app).filter((w) => w.startsWith(`${n} not `)).length, 1, `${n}: one line`);
  } finally {
    app.restore();
  }
  // With "<n> more" (a "last looked" ten days back, made up): the line under it, not counted, not in the sheet.
  const s = mixState();
  s.repos[MIX_PROJECT].pulls.push(BAD_PR);
  const more = await open(s, { looked: SINCE_FULL });
  try {
    assert.equal(byClass(keyed(more, 'since'), 'v2-ev').length, 4, 'four lines');
    assert.deepEqual(sinceKeys(more), ['since-h', 'since', 'since-more', 'since-miss']);
    assert.deepEqual(missing(more), [SHOWN(MIX_PROJECT)]);
    await more.go('#/since');
    const sheet = keyed(more, 'since-all');
    assert.ok(sheet);
    assert.doesNotMatch(sheet.textContent, /its lines may be missing/, 'none in the "<n> more" sheet');
  } finally {
    more.restore();
  }
  // The markers off (no "last looked" can be kept on this device, AC40): no list, so no line.
  const o = mixState();
  o.repos[MIX_PROJECT].pulls.push(BAD_PR);
  const off = await loadSandbox({ ...o, hash: '#/', now: NOW, store: null });
  try {
    await off.advance(1000);
    await off.advance(POLL_MS);
    assert.ok(keyed(off, 'since-off'), 'markers off');
    assert.equal(missBox(off), null);
    assert.doesNotMatch(off.text(), /not shown, its lines may be missing/);
  } finally {
    off.restore();
  }
});

// ---------------------------------------------------------------------------
// The line that stops short of the arrow (AC92 (b))

/** The cascaded now cell, its ::before and ::after, and its arrow, in a theme and width. */
function nowCell(app, name, theme, width) {
  const t = tile(app, name);
  const here = findAll(t, (e) => has(e, 'v2-here'));
  assert.equal(here.length, 1, `${name}: one arrow`);
  const cell = here[0].parent;
  const L = looks(app, theme, width);
  return { cell, arrow: here[0], c: L.get(cell), a: L.get(here[0]), all: findAll(t, (e) => has(e, 'v2-c')).map((e) => ({ el: e, d: L.get(e) })) };
}
/** "calc(50% + 19px)", "50%", "0" or "calc(50% + 10px)" at a cell width `w`, in px. */
function px(v, w) {
  const s = v.replace(/\s+/g, ' ').trim();
  let m;
  if ((m = /^calc\((\d+)% \+ (\d+)px\)$/.exec(s))) return w * Number(m[1]) / 100 + Number(m[2]);
  if ((m = /^(\d+)%$/.exec(s))) return w * Number(m[1]) / 100;
  if ((m = /^(-?\d+)(px)?$/.exec(s))) return Number(m[1]);
  throw new Error(`can't read ${v}`);
}

test('AC92 (b), G8c, the line stops short: on a Home tile whose now circle has a line coming in from the left (`nowShared`\'s Build and Launch, NOT real; a v2.5 tile with its open sprint after a closed one, `sprintsState(1)`, NOT real), the now cell\'s ::before ends 19 px left of its centre (`right: calc(50% + 19px)`), 3 px clear of the arrow, which is unchanged; at 360 and 414 px, light and dark', async () => {
  const cases = [
    ['nowShared build', () => nowShared('build'), MIX_PROJECT],
    ['nowShared launch', () => nowShared('launch'), MIX_PROJECT],
    ['v2.5, its open sprint after a closed one', () => sprintsState(1), POOM.name],
  ];
  for (const [label, state, name] of cases) {
    const app = await open(state());
    try {
      for (const width of WIDTHS) {
        for (const theme of THEMES) {
          const where = `${label}, ${theme}, ${width} px`;
          const { cell, c, a, all } = nowCell(app, name, theme, width);
          assert.ok(has(cell, 'here') && has(cell, 'l') && has(cell, 's-now'), `${where}: the now cell, a line coming in`);
          assert.equal(c.pseudo('before', 'content'), '""', `${where}: the incoming line drawn`);
          assert.deepEqual([c.pseudo('before', 'left'), c.pseudo('before', 'right')], ['0', 'calc(50% + 19px)'], `${where}: it stops 19 px left of the centre`);
          assert.deepEqual(['top', 'height', 'margin-top'].map((p) => c.pseudo('before', p)), ['50%', '2px', '-1px'], `${where}: its line's place and weight as every cell's`);
          // The arrow as G8 put it: 6 × 8 px, its right edge 10 px left of the centre (3 px left of the 14 px icon).
          assert.deepEqual([a.decl('position'), a.decl('right'), a.decl('width'), a.decl('height'), a.decl('top'), a.decl('margin-top')],
            ['absolute', 'calc(50% + 10px)', '6px', '8px', '50%', '-4px'], `${where}: the arrow unchanged`);
          // For any cell width, the line ends 3 px before the arrow's left edge: no part of it under the arrow or between it and the icon.
          for (const w of [38, 54, 64, 80, 120]) {
            // At 360 px with five phases a cell is about 54 px wide: about 8 px of the line stays in the now cell.
            if (w === 54) assert.equal(w - px(c.pseudo('before', 'right'), w), 8, `${where}: 8 px of the line in a 54 px cell`);
            const lineEnd = w - px(c.pseudo('before', 'right'), w);
            const arrowLeft = w - px(a.decl('right'), w) - 6;
            const iconLeft = w / 2 - 7;
            assert.equal(arrowLeft - lineEnd, 3, `${where}, a ${w} px cell: 3 px clear of the arrow`);
            assert.equal(iconLeft - (arrowLeft + 6), 3, `${where}, a ${w} px cell: the arrow 3 px left of the icon`);
            assert.ok(lineEnd >= 0, `${where}, a ${w} px cell`);
          }
          // The line leaving the now circle, unchanged.
          if (has(cell, 'r')) assert.deepEqual([c.pseudo('after', 'left'), c.pseudo('after', 'right')], ['50%', '0'], `${where}: the line leaving it unchanged`);
          // Every other cell's lines unchanged.
          for (const x of all.filter((y) => y.el !== cell)) {
            if (has(x.el, 'l')) assert.equal(x.d.pseudo('before', 'right'), '50%', `${where}: another cell's incoming line`);
            if (has(x.el, 'r')) assert.equal(x.d.pseudo('after', 'left'), '50%', `${where}: another cell's outgoing line`);
            assert.ok(!has(x.el, 'here'), `${where}: no other cell is the now cell`);
          }
        }
      }
    } finally {
      app.restore();
    }
  }
});

test('AC92 (b), G8c: on a tile whose now circle starts its row (`mix`\'s made-up project and Service-Desk, run 2\'s Design; Personal-Org-Operating-Model\'s one sprint), nothing changed — no incoming line, the line leaving it unchanged; a too-narrow cell keeps none; the stylesheet adds one declaration, on the now cell\'s ::before only', async () => {
  const app = await open(mixState());
  try {
    for (const name of [MIX_PROJECT, SD.name, POOM.name]) {
      for (const width of WIDTHS) {
        for (const theme of THEMES) {
          const where = `${name}, ${theme}, ${width} px`;
          const { cell, c, a } = nowCell(app, name, theme, width);
          assert.ok(has(cell, 'here') && !has(cell, 'l'), `${where}: the now circle starts its row`);
          assert.equal(c.pseudo('before', 'content'), '', `${where}: no incoming line`);
          assert.equal(c.pseudo('before', 'right'), '', `${where}: nothing declared`);
          if (has(cell, 'r')) assert.deepEqual([c.pseudo('after', 'left'), c.pseudo('after', 'right')], ['50%', '0'], `${where}: the line leaving it`);
          assert.equal(a.decl('right'), 'calc(50% + 10px)', `${where}: the arrow unchanged`);
        }
      }
    }
  } finally {
    app.restore();
  }
  // A cell narrower than 38 px keeps no line: its ::before, from 0 to 19 px left of the centre, has no width there.
  for (const w of [20, 30, 37]) assert.ok(w - px('calc(50% + 19px)', w) < 0, `a ${w} px cell: nothing drawn there`);
  // The stylesheet: exactly one rule for the stopped line, one declaration, on `.v2-c.here.l::before`; the old line kept.
  const sheet = SHEET.replace(/\/\*[\s\S]*?\*\//g, '');
  const hereRules = [...sheet.matchAll(/(^|\n)([^{}\n]*\.v2-c[^{}\n]*\.here[^{}\n]*)\{([^}]*)\}/g)].map((m) => [m[2].trim(), m[3].trim()]);
  assert.deepEqual(hereRules, [['.v2-c.here.l::before', 'right: calc(50% + 19px);']]);
  assert.match(sheet, /\n\.v2-c\.l::before \{ left: 0; right: 50%; \}/, 'every other incoming line as built');
  assert.match(sheet, /\n\.v2-c\.r::after \{ left: 50%; right: 0; \}/, 'every outgoing line as built');
  assert.match(sheet, /\n\.v2-c > \.v2-here \{ position: absolute; top: 50%; right: calc\(50% \+ 10px\); width: 6px; height: 8px; margin-top: -4px; \}/, 'the arrow as G8 put it');
});

// ---------------------------------------------------------------------------
// The red line kept (P-001-glance-since-red-line.md, A): G7b's case, unchanged, in ac91-g7b-since-missing.test.mjs.

test('AC91 (c), G8c (P-001-glance-since-red-line.md, A, as built): G7b\'s case of the red "Not read since" line above the grey lines with the list empty is kept as it was', () => {
  const g7b = readFileSync(join(SRC, '..', 'tests', 'desk', 'ac91-g7b-since-missing.test.mjs'), 'utf8');
  assert.match(g7b, /test\('AC91 \(c\), G7b: the list empty — its red "Not read since HH:MM" line kept, then the grey line under it'/);
  assert.match(g7b, /assert\.deepEqual\(\[none\.textContent, none\.className\], \[`Not read since \$\{at\}`, 'v2-ql bad'\]\);/);
});

// Each of G8C_OPENS draws what it is named for, so the stage-8 guard's walk and the captures open what G8c changes.
test('G8c\'s screens (tests/desk/glance-fixtures.mjs\'s G8C_OPENS) each draw what they are named for', async () => {
  for (const [where, open2] of G8C_OPENS) {
    const app = await open2();
    try {
      const t = home(app).textContent;
      if (/never read|signed out|failing|beside two/.test(where)) assert.match(t, /in this opening/, where);
      if (/can't draw/.test(where)) assert.match(t, /not shown, its lines may be missing/, where);
      if (/now circle|open sprint after/.test(where)) assert.ok(findAll(app.view, (e) => has(e, 'v2-c') && has(e, 'here') && has(e, 'l')).length >= 1, `${where}: a line into the now circle`);
    } finally {
      app.restore();
    }
  }
});
