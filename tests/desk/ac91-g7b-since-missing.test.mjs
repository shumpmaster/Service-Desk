// ac-test: S-001/AC91 — G7b of "After the glance audit": AC91 (c)'s grey lines that end "Since you last looked" while a
// connected project can't be read (the owner's "Ruling: A", decisions/questions/P-001-glance-since-incomplete.md: "Say so
// in the list — one grey line under it, "<project> not read since HH:MM, its lines may be missing" (or "not read in this
// opening"), one line per unreadable project"), with AC92 (a)'s "Stays grey" (noted: they stay grey).
// ac-test: S-001/AC92
//
// The page is the sandbox's own code under the fake DOM, on the fixture states AC91's note names (`unread`, signed-out
// and `ext`, tests/desk/glance-fixtures.mjs: Service-Desk's records at 77bfeae, real, with made-up projects, times and
// failures, each labelled NOT real in tests/desk/fixtures/README.md). The suite has no browser, so each colour, size and
// weight is the cascade of the page's own stylesheets over what it drew (tests/desk/css-cascade.mjs, as AC88's and G1's
// tests read them), in light and in dark; the stage's pull request carries the Chromium captures (`g7b-`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { sinceMissingLines, sinceUnreadWords } from '../../src/lib/home.js';
import { unreadState, signedOutState, extState, MIX_PROJECT, NOW, SD, POOM, CONFIG, G7B_OPENS, EXT_LONG, SINCE_LATE, SINCE_FULL, lookedAt } from './glance-fixtures.mjs';

const TZ = CONFIG.ownerTimeZone;
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const INK = { light: { ink2: '#5c5f66', bad: '#b3162a' }, dark: { ink2: '#a2a5ac', bad: '#ff6b78' } };
const THEMES = ['light', 'dark'];
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');

/** Each drawn element's cascaded look in a theme, at 360 px: el → { colour, size, weight, decl(prop) }. */
function looks(app, theme) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width: 360, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) {
    if (!n.el) continue;
    out.set(n.el, { colour: plain(n.style.get('color')), size: plain(n.style.get('font-size')), weight: plain(n.style.get('font-weight')), decl: (p) => plain(n.declared.get(p)) });
  }
  return out;
}
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const home = (app) => keyed(app, 'home');
/** The missing lines' box, and its lines' words. */
const box = (app) => keyed(app, 'since-miss');
const lines = (app) => (box(app) ? box(app).children.filter((c) => c.tag === 'p') : []);
const words = (app) => lines(app).map((p) => p.textContent);
/** Home's children from the list's head down to the groups: the keys in order, so where the lines sit is read off. */
const sinceKeys = (app) => {
  const kids = home(app).children.map((c) => c.dataset && c.dataset.k);
  return kids.slice(kids.indexOf('since-h'), kids.indexOf('hgroups'));
};
/** The tiles' order on Home, by project name, as drawn. */
const tileOrder = (app) => findAll(app.view, (e) => e.dataset && /^card:/.test(e.dataset.k || '')).map((e) => e.dataset.k.slice(5));
/** The briefing's "Can't read <project> since HH:MM" lines, by project: the time each gives. */
const briefTimes = (app) => {
  const b = byClass(app.view, 'v2-brief')[0];
  const out = new Map();
  for (const m of b.textContent.matchAll(/Can't read (.+?) since (\d\d:\d\d)/g)) out.set(m[1], m[2]);
  return out;
};
const MISS = (name, at) => `${name} not read ${at}, its lines may be missing`;
async function open(setup, { looked = SINCE_LATE, before = null } = {}) {
  if (before) before();
  const app = await loadSandbox({ ...setup, hash: '#/', now: NOW, store: lookedAt(looked) });
  await app.advance(1000);
  await app.advance(POLL_MS);
  return app;
}
const opened = (where) => G7B_OPENS.find(([w]) => w === where)[1]();

/** Each line's look (AC91 (c): "`--t-small` `--ink2`, grey, with no icon, no ✕ and no `--bad` … not a link … wrapped at 360 px, never cut"). */
function assertGrey(app, where) {
  const b = box(app);
  assert.ok(b, `${where}: the lines drawn`);
  assert.equal(b.tag, 'div');
  assert.equal(b.className, 'v2-smiss');
  for (const p of lines(app)) {
    assert.equal(p.className, 'v2-small', `${where}: ${p.textContent}`);
    assert.equal(findAll(p, (e) => e.tag === 'svg').length, 0, `${where}: no icon, no ✕`);
    assert.equal(findAll(p, (e) => e.tag === 'a' || e.tag === 'button').length, 0, `${where}: not a link`);
    for (let a = p; a; a = a.parent) assert.ok(a.tag !== 'a' && a.tag !== 'ol' && a.tag !== 'li', `${where}: not inside a link or the list's lines`);
    for (const theme of THEMES) {
      const L = looks(app, theme).get(p);
      assert.deepEqual([L.size, L.weight, L.colour], ['12px', '400', INK[theme].ink2], `${where}, ${theme}: --t-small in --ink2`);
      assert.notEqual(L.colour, INK[theme].bad, `${where}, ${theme}: never --bad`);
      // Wrapped, never cut: it may break inside a long name, and nothing clips it or holds it to one line.
      assert.equal(L.decl('overflow-wrap'), 'anywhere', `${where}, ${theme}: wraps at a long name`);
      for (const [prop, none] of [['white-space', ['', 'normal']], ['text-overflow', ['']], ['max-height', ['']], ['overflow', ['', 'visible']], ['-webkit-line-clamp', ['']]]) {
        assert.ok(none.includes(L.decl(prop)), `${where}, ${theme}: ${prop} ${L.decl(prop)}`);
      }
      const B = looks(app, theme).get(b);
      for (const prop of ['max-height', 'overflow', 'white-space']) assert.ok(['', 'visible', 'normal'].includes(B.decl(prop)), `${where}, ${theme}: the box's ${prop}`);
    }
  }
}

test('AC91 (c), G7b, the words: one line per project that can\'t be read, in the order given, "<project> not read since HH:MM, its lines may be missing" with that project\'s own time, "… not read in this opening …" where no read of it succeeded in this opening or no time is held; none for a project read or still "Checking…"', () => {
  const cant = (since, succeeded = true) => ({ read: { read: 'cant-read', since }, succeeded });
  const t1 = Date.parse('2026-10-14T15:02:00Z');
  const t2 = Date.parse('2026-10-14T14:58:00Z');
  assert.deepEqual(sinceMissingLines([], TZ), []);
  assert.deepEqual(sinceMissingLines([{ name: 'A', read: { read: 'ok', since: NOW }, succeeded: true }, { name: 'B', read: { read: 'checking', since: null }, succeeded: false }], TZ), [], 'read, and still Checking…: none');
  assert.deepEqual(sinceMissingLines([{ name: 'A', ...cant(t1) }], TZ), [{ name: 'A', words: MISS('A', 'since 10:02') }], 'its own time, in the owner\'s zone');
  assert.deepEqual(sinceMissingLines([{ name: 'A', ...cant(t1, false) }], TZ), [{ name: 'A', words: MISS('A', 'in this opening') }], 'no read succeeded in this opening');
  assert.deepEqual(sinceMissingLines([{ name: 'A', ...cant(null) }], TZ), [{ name: 'A', words: MISS('A', 'in this opening') }], 'no time held');
  // Two, each with its own time (not the earliest, as "Not read since" takes), in the order given (the tiles').
  assert.deepEqual(sinceMissingLines([{ name: 'Z', ...cant(t1) }, { name: 'A', read: { read: 'ok' }, succeeded: true }, { name: 'B', ...cant(t2) }], TZ).map((l) => l.words),
    [MISS('Z', 'since 10:02'), MISS('B', 'since 09:58')]);
  // A project the desk can't draw is given no read (as "Not read since" has it): no line.
  assert.deepEqual(sinceMissingLines([{ name: 'A', read: null, succeeded: true }], TZ), []);
  // The same reads as "Not read since": a line exactly when that line reads.
  for (const reads of [[{ name: 'A', ...cant(t1) }], [{ name: 'A', read: { read: 'ok' }, succeeded: true }]]) {
    assert.equal(sinceMissingLines(reads, TZ).length > 0, sinceUnreadWords(reads, TZ) != null);
  }
});

test('AC91 (c), G7b: one project that can\'t be read since a time, the list holding lines — one grey line under its last line, "Service-Desk not read since HH:MM, its lines may be missing", its time the briefing\'s; not one of the list\'s lines; --t-small --ink2, no icon, not a link, never cut', async () => {
  // "last looked" 18 Oct 00:00 (made up): the list holds two of Service-Desk's lines and no "<n> more".
  const s = unreadState();
  const app = await open(s, { looked: Date.parse('2026-10-18T00:00:00Z') });
  try {
    assert.equal(box(app), null, 'every project read: no line');
    const before = byClass(keyed(app, 'since'), 'v2-ev').length;
    assert.equal(before, 2);
    s.fail();
    await app.advance(3 * POLL_MS);
    const at = briefTimes(app).get(SD.name);
    assert.match(at, /^\d\d:\d\d$/);
    assert.deepEqual(words(app), [MISS(SD.name, `since ${at}`)]);
    assert.deepEqual(sinceKeys(app), ['since-h', 'since', 'since-miss'], 'under the list\'s last line');
    assert.equal(byClass(keyed(app, 'since'), 'v2-ev').length, before, 'the list\'s lines as they were');
    assert.equal(keyed(app, 'since-none'), null);
    assertGrey(app, 'one since a time');
  } finally {
    app.restore();
  }
});

test('AC91 (c), G7b: a project with no read in this opening — "Service-Desk not read in this opening, its lines may be missing"', async () => {
  const s = unreadState();
  const app = await open(s, { looked: Date.parse('2026-10-18T00:00:00Z'), before: s.fail });
  try {
    await app.advance(3 * POLL_MS);
    assert.deepEqual(words(app), [MISS(SD.name, 'in this opening')]);
    assert.equal(keyed(app, 'since-none').textContent, 'Not read in this opening', 'nothing read of it: the list as G1 has it');
    assert.deepEqual(sinceKeys(app), ['since-h', 'since-none', 'since-miss']);
    assertGrey(app, 'in this opening');
  } finally {
    app.restore();
  }
});

test('AC91 (c), G7b: two projects that can\'t be read — two lines, in the order of their tiles on Home (not the config\'s or the briefing\'s), each with its own words: one since its own time, one not read in this opening', async () => {
  const app = await opened('Home, two projects, one not read in this opening');
  try {
    const order = tileOrder(app);
    const cant = order.filter((n) => n === SD.name || n === MIX_PROJECT);
    assert.deepEqual(cant, [MIX_PROJECT, SD.name], 'the made-up project\'s tile, with cards waiting, first');
    const t = briefTimes(app);
    assert.deepEqual([...t.keys()], [SD.name, MIX_PROJECT], 'the briefing names them in the config\'s order, so the order here is the tiles\'');
    assert.deepEqual(words(app), [MISS(MIX_PROJECT, `since ${t.get(MIX_PROJECT)}`), MISS(SD.name, 'in this opening')]);
    assert.deepEqual(lines(app).map((p) => p.dataset.k), [`since-miss:${MIX_PROJECT}`, `since-miss:${SD.name}`], 'each keyed by its project');
    assert.deepEqual(sinceKeys(app), ['since-h', 'since-none', 'since-miss']);
    assertGrey(app, 'two');
  } finally {
    app.restore();
  }
});

test('AC91 (c), G7b: signed out — a line for every connected project, in its tiles\' order, "not read in this opening" from the start and "not read since HH:MM" after reads that succeeded; the red "Not read in this opening" kept above them', async () => {
  const app = await opened('Home, signed out');
  try {
    const order = tileOrder(app);
    assert.deepEqual(new Set(order), new Set([SD.name, POOM.name, MIX_PROJECT]));
    assert.deepEqual(words(app), order.map((n) => MISS(n, 'in this opening')));
    const none = keyed(app, 'since-none');
    assert.deepEqual([none.textContent, none.className], ['Not read in this opening', 'v2-ql bad'], 'G1\'s red line kept');
    assert.deepEqual(sinceKeys(app), ['since-h', 'since-none', 'since-miss']);
    assertGrey(app, 'signed out');
  } finally {
    app.restore();
  }
  const s = signedOutState();
  const later = await open(s);
  try {
    s.fail();
    await later.advance(3 * POLL_MS);
    assert.equal(byClass(later.view, 'v2-brief')[0].className, 'v2-brief k-signed-out');
    const ws = words(later);
    assert.deepEqual(ws.map((w) => w.split(' not read ')[0]), tileOrder(later));
    for (const w of ws) assert.match(w, /^.+ not read since \d\d:\d\d, its lines may be missing$/);
    assertGrey(later, 'signed out after reads');
  } finally {
    later.restore();
  }
});

test('AC91 (c), G7b: the list empty — its red "Not read since HH:MM" line kept, then the grey line under it', async () => {
  const app = await opened('Home, the list empty, one project not read since a time');
  try {
    const at = briefTimes(app).get(SD.name);
    const none = keyed(app, 'since-none');
    assert.deepEqual([none.textContent, none.className], [`Not read since ${at}`, 'v2-ql bad']);
    for (const theme of THEMES) assert.equal(looks(app, theme).get(none).colour, INK[theme].bad, `${theme}: still red`);
    assert.deepEqual(sinceKeys(app), ['since-h', 'since-none', 'since-miss']);
    assert.deepEqual(words(app), [MISS(SD.name, `since ${at}`)]);
    assertGrey(app, 'empty list');
  } finally {
    app.restore();
  }
});

test('AC91 (c), G7b: with "<n> more" shown — the line under it, outside the four lines and not counted in "<n> more", nor in its sheet', async () => {
  const s = unreadState();
  const app = await open(s, { looked: SINCE_FULL });
  try {
    const n = (more) => Number(/^(\d+) more /.exec(more.textContent)[1]);
    const before = n(keyed(app, 'since-more'));
    s.fail();
    await app.advance(3 * POLL_MS);
    assert.equal(byClass(keyed(app, 'since'), 'v2-ev').length, 4, 'four lines');
    const more = keyed(app, 'since-more');
    assert.equal(n(more), before, 'the count as it was');
    assert.deepEqual(sinceKeys(app), ['since-h', 'since', 'since-more', 'since-miss'], 'under "<n> more"');
    assert.deepEqual(words(app), [MISS(SD.name, `since ${briefTimes(app).get(SD.name)}`)]);
    assertGrey(app, 'with more');
    await app.go('#/since');
    const sheet = findAll(app.view, (e) => e.dataset && e.dataset.k === 'since-all')[0];
    assert.equal(byClass(sheet, 'v2-ev').length, n(more), 'the sheet holds the <n>, and nothing else');
    assert.doesNotMatch(sheet.textContent, /its lines may be missing/);
  } finally {
    app.restore();
  }
});

test('AC91 (c), G7b: a project still "Checking…" (its first read pending, none failed) has no line, beside one that can\'t be read; and none on the first paint, every project checking', async () => {
  const s = unreadState({ who: MIX_PROJECT });
  let release;
  s.repos[SD.name].hold = new Promise((r) => { release = r; });
  s.fail();
  const app = await loadSandbox({ ...s, hash: '#/', now: NOW, store: lookedAt(SINCE_LATE) });
  try {
    assert.equal(box(app), null, 'first paint: every project checking, no line');
    await app.advance(1000);
    await app.advance(POLL_MS);
    const corner = byClass(keyed(app, `card:${SD.name}`), 'v2-wt')[0];
    assert.equal(corner.textContent, 'Checking…', 'Service-Desk\'s read still pending');
    assert.deepEqual(words(app), [MISS(MIX_PROJECT, 'in this opening')], 'the failed one only');
    assertGrey(app, 'beside Checking…');
  } finally {
    release();
    app.restore();
  }
});

test('AC91 (c), G7b: a read that then succeeds — its line goes on the first draw after it, the other project\'s line stays; the last gone, no box is drawn', async () => {
  const s = unreadState();
  const app = await open(s, { before: s.fail });
  try {
    s.repos[MIX_PROJECT].fail = { kind: 'network' };
    await app.advance(3 * POLL_MS);
    assert.deepEqual(words(app).map((w) => w.split(' not read ')[0]), [MIX_PROJECT, SD.name]);
    // Alpha reads again: at each draw, its line is there exactly while the briefing still can't read it.
    s.repos[MIX_PROJECT].fail = null;
    let steps = 0;
    while (briefTimes(app).has(MIX_PROJECT)) {
      assert.ok(words(app).some((w) => w.startsWith(`${MIX_PROJECT} not read`)), 'still failing: its line');
      await app.advance(1000);
      assert.ok(++steps < 3 * POLL_MS / 1000, 'Alpha read again');
    }
    assert.deepEqual(words(app), [MISS(SD.name, 'in this opening')], 'on the first draw after Alpha\'s read: Alpha\'s line gone, Service-Desk\'s kept');
    s.repos[SD.name].fail = null;
    while (briefTimes(app).has(SD.name) || /Can't read/.test(byClass(app.view, 'v2-brief')[0].textContent)) {
      await app.advance(1000);
      assert.ok(++steps < 6 * POLL_MS / 1000, 'Service-Desk read again');
    }
    assert.equal(box(app), null, 'every project read: no line and no box');
    assert.match(keyed(app, 'since-none').textContent, /^Nothing new since /, 'the list as built');
  } finally {
    app.restore();
  }
});

test('AC91 (c), G7b: `ext`, two made-up projects that can\'t be read, the long name among them — their lines in their tiles\' order, the long name whole in its line, which may wrap and is never cut', async () => {
  const app = await opened('Home, ext, two projects not read since a time');
  try {
    const t = briefTimes(app);
    const want = tileOrder(app).filter((n) => t.has(n));
    assert.deepEqual(new Set(want), new Set(['Beta', EXT_LONG]));
    assert.deepEqual(words(app), want.map((n) => MISS(n, `since ${t.get(n)}`)));
    assertGrey(app, 'ext');
  } finally {
    app.restore();
  }
  // The markers off (no "last looked" can be kept on this device, AC40): no list, so no line under one.
  const s = extState();
  const off = await loadSandbox({ ...s, hash: '#/', now: NOW, store: null });
  try {
    await off.advance(1000);
    await off.advance(POLL_MS);
    s.repos.Beta.fail = { kind: 'network' };
    await off.advance(3 * POLL_MS);
    assert.ok(keyed(off, 'since-off'), 'markers off');
    assert.equal(box(off), null);
  } finally {
    off.restore();
  }
});
