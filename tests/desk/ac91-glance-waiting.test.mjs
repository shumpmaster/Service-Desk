// ac-test: S-001/AC91 — G2 of "After the glance audit": Waiting, parts (f) and (g) (specs/S-001.md, AC91 (f) "Waiting: the
// Kicked back strip, two equal lanes, Done shaded" and (g) ""new" on Waiting"), with AC80's changed parts (AC80's note
// "After the glance audit": "two lanes, "Waiting on you" and "Done · last 24 h", of equal width, with Kicked back as a
// strip above them and Done shaded; "new" on cards raised since "last looked"") and AC92 (e)'s rule for a filled ground
// ("no box on Waiting beside the Done lane's ground").
// ac-test: S-001/AC80 ac-test: S-001/AC92
//
// The page is the sandbox's own code under the fake DOM, on the fixture states AC91's note names (`mix`, `quiet`, and
// `mix` with a second made-up project and Done marks kept on the device, tests/desk/glance-fixtures.mjs: Service-Desk's
// records at 77bfeae, real, with made-up projects, marks and "last looked" times, each labelled NOT real in
// tests/desk/fixtures/README.md). The suite has no browser, so each colour, size and ground is the cascade of the page's
// own stylesheets over what it drew (tests/desk/css-cascade.mjs, as AC88's and AC91 (a) to (e)'s tests read them), in
// light and in dark, at 360 and 414 px; the stage's pull request carries the Chromium captures, which measure the strip's
// sideways scroll and the page's (tests/desk/tools/glance-shots.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll, El0 } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { HOLD_MS, WORDS, stripEmptyWords, stripEmptyParts, isNewCard, oneProjectView, ONE_WORDS } from '../../src/lib/board.js';
import { mixState, quietState, signedOutState, twoMixState, deviceMarks, KICKED, CARD, MIX_PROJECT, MIX_PROJECT2, NOW } from './glance-fixtures.mjs';
import { stripState, STRIP_ORDER, STRIP_KICKS } from './qw2-fixtures.mjs';

const H = 3600e3;
const CSS = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(CSS, 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const INK = { light: { ink: '#18191c', ink2: '#5c5f66', bg2: '#f7f7f8', card: '#fbfbfb', line: '#e7e7ea' },
  dark: { ink: '#ecedef', ink2: '#a2a5ac', bg2: '#141517', card: '#17181b', line: '#26282c' } };
const THEMES = ['light', 'dark'];
const WIDTHS = [360, 414];
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');

/** Each drawn element's cascaded look in a theme and at a width: el → { node, colour, size, weight, family, decl(prop), raw(prop) }. */
function looks(app, theme, width = 360) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) {
    if (!n.el) continue;
    out.set(n.el, { node: n, colour: plain(n.style.get('color')), size: plain(n.style.get('font-size')), weight: plain(n.style.get('font-weight')),
      family: plain(n.style.get('font-family')), decl: (p) => plain(n.declared.get(p)), raw: (p) => String(n.declared.get(p) || '') });
  }
  return out;
}
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const lane = (app, k) => keyed(app, `lane:${k}`);
const strip = (app) => lane(app, 'kick');
const stripCards = (app) => byClass(strip(app), 'v2-card');
const waitCards = (app) => byClass(lane(app, 'wait'), 'v2-card');
const cardOf = (app, id) => findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === id)[0] || null;
const kindText = (c) => byClass(c, 'v2-kd')[0].textContent;
const newOf = (c) => byClass(byClass(c, 'v2-kd')[0], 'v2-new')[0] || null;
const isShownNew = (c) => { const n = newOf(c); return Boolean(n && !n.className.split(' ').includes('none') && n.textContent === ' new'); };
const badge = (app) => { const b = byClass(app.view, 'v2-badge')[0]; return b ? Number(b.children[0].textContent) : 0; };
const looked = (ms, extra = {}) => memStore({ ...(ms == null ? {} : { 'desk-seen-v1': JSON.stringify({ lastLooked: ms }) }), ...extra });
async function open(setup, { hash = '#/waiting', now = NOW, store = looked(now - 5 * H) } = {}) {
  const app = await loadSandbox({ ...setup, hash, now, store });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}
const kickedStore = (lookedAt = NOW - 5 * H) => looked(lookedAt, deviceMarks(KICKED));

/** A layout for a drag: the Done lane at x 248–360, y 300–900; the strip at x 0–360, y 100–280; anything else nowhere. */
function layout() {
  const saved = Object.getOwnPropertyDescriptor(El0.prototype, 'getBoundingClientRect');
  const style = Object.getOwnPropertyDescriptor(El0.prototype, 'style');
  El0.prototype.getBoundingClientRect = function rect() {
    if (this.dataset && this.dataset.k === 'lane:done') return { left: 248, right: 360, top: 300, bottom: 900, width: 112, height: 600 };
    if (this.dataset && this.dataset.k === 'lane:kick') return { left: 0, right: 360, top: 100, bottom: 280, width: 360, height: 180 };
    return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
  };
  Object.defineProperty(El0.prototype, 'style', { configurable: true, get() { if (!this._st) this._st = {}; return this._st; } });
  return () => {
    if (saved) Object.defineProperty(El0.prototype, 'getBoundingClientRect', saved); else delete El0.prototype.getBoundingClientRect;
    if (style) Object.defineProperty(El0.prototype, 'style', style); else delete El0.prototype.style;
  };
}
async function carry(app, id, [x0, y0], [x1, y1]) {
  const c = cardOf(app, id);
  c.dispatch('pointerdown', { target: byClass(c, 'v2-t')[0], clientX: x0, clientY: y0, pointerType: 'touch' });
  await app.flush();
  await app.advance(HOLD_MS);
  await app.docEvent('pointermove', { clientX: x1, clientY: y1 });
  await app.docEvent('pointerup', { clientX: x1, clientY: y1 });
  return c;
}

// ---------------------------------------------------------------------------
// (f) Waiting: the Kicked back strip, two equal lanes, Done shaded

test('AC91 (f): two lanes, "Waiting on you" and "Done · last 24 h", side by side, of equal width (1 : 1) and 6 px apart, at 360 and 414 px, in both themes; an empty Done keeps its width and its words (not option D); no rule changes the lanes\' columns at any width', async () => {
  for (const [what, setup, store] of [['`quiet`', quietState(), looked(NOW - 5 * H)], ['`mix`, two projects, a Done card', twoMixState(), kickedStore()]]) {
    const app = await open(setup, { store });
    try {
      const lanes = byClass(byClass(app.view, 'v2-lanes')[0], 'v2-lane');
      assert.deepEqual(lanes.map((l) => l.dataset.lane), ['wait', 'done'], `${what}: two lanes, left to right`);
      assert.deepEqual(lanes.map((l) => byClass(l, 'v2-lh')[0].children[0].textContent), ['Waiting on you', 'Done · last 24 h']);
      for (const theme of THEMES) {
        for (const w of WIDTHS) {
          const L = looks(app, theme, w);
          const grid = L.get(byClass(app.view, 'v2-lanes')[0]);
          assert.deepEqual([grid.decl('display'), grid.decl('grid-template-columns'), grid.decl('gap')], ['grid', 'minmax(0, 1fr) minmax(0, 1fr)', '6px'], `${what}, ${theme}, ${w} px`);
          for (const l of lanes) assert.equal(L.get(l).decl('grid-column'), '', `${what}, ${theme}, ${w} px: no lane spans or shrinks`);
        }
      }
      if (what === '`quiet`') assert.equal(byClass(lane(app, 'done'), 'v2-empty')[0].textContent, WORDS.emptyDone, 'an empty Done keeps its words');
      else assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 1, 'Done holds a card');
    } finally {
      app.restore();
    }
  }
  const flat = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of flat.matchAll(/@media[^{]*\{([\s\S]*?)\}\s*\}/g)) assert.doesNotMatch(m[1], /v2-lanes|lane-done|lane-wait/, 'at every width');
  assert.doesNotMatch(flat, /lane-done[^{]*\{[^}]*(width|grid-column|flex)/, 'an empty Done never shrinks');
});

test('AC91 (f): with no kicked-back card, one quiet line in the ruling\'s words, "Kicked back · none" — "Kicked back" in --t-row --ink2 (from HD1, AC98; --t-label before), " · none" in --t-mono --ink2 — under the quiet lines and above the lanes, with no fold mark, no control, no hairline and no drop target', async () => {
  const app = await open(quietState());
  const undo = layout();
  try {
    const s = strip(app);
    assert.equal(s.textContent, 'Kicked back · none');
    assert.equal(s.attrs['aria-label'], 'Kicked back');
    const kids = byClass(app.view, 'v2-board')[0].children;
    const at = (cls) => kids.findIndex((c) => c.className.split(' ').includes(cls));
    assert.ok(at('v2-quiet') >= 0 && at('v2-quiet') < at('v2-kstrip') && at('v2-kstrip') === at('v2-lanes') - 1, 'under the quiet lines, directly above the lanes');
    assert.equal(findAll(s, (e) => ['button', 'a', 'svg', 'details', 'summary', 'ol', 'h2'].includes(e.tag)).length, 0, 'one line: no fold mark, no control, no row');
    const label = byClass(s, 'v2-kl')[0];
    const none = byClass(s, 'v2-kn')[0];
    assert.equal(none.textContent, ' · none');
    for (const theme of THEMES) {
      const L = looks(app, theme);
      const c = INK[theme];
      // Rewritten in HD1 (forced: AC98 puts the empty section's line, `.v2-kq`, on --t-row, 500 13 px, still --ink2, a step up
      // and quieter than a full head; tests/desk/ac91-glance-waiting.test.mjs:145).
      assert.deepEqual([L.get(label).size, L.get(label).weight, L.get(label).colour], ['13px', '500', c.ink2], `${theme}: "Kicked back" in --t-row --ink2 (AC98)`);
      assert.deepEqual([L.get(none).size, L.get(none).weight, L.get(none).colour], ['11px', '400', c.ink2], `${theme}: " · none" in --t-mono --ink2`);
      assert.match(L.get(none).family, /Plex Mono/);
      assert.match(L.get(none).raw('font'), /^400 11px\/1\.4 ⟦--mono\|/, `${theme}: the --t-mono role`);
      assert.equal(L.get(s).decl('border-bottom'), '', `${theme}: no hairline while it is one line`);
      assert.equal(L.get(s).decl('background'), '', `${theme}: no ground`);
    }
  } finally {
    undo();
    app.restore();
  }
  // Nothing to drop on: a card lifted from the lanes and let go over the strip is not marked.
  const mix = mixState();
  const undo2 = layout();
  const app2 = await open(mix, { store: looked(NOW - 5 * H) });
  try {
    assert.equal(strip(app2).textContent, 'Kicked back · none');
    await carry(app2, CARD.card(MIX_PROJECT), [60, 400], [180, 200]);
    assert.ok(waitCards(app2).some((c) => c.attrs['data-card'] === CARD.card(MIX_PROJECT)), 'let go over the strip: not marked, still waiting');
    assert.equal(strip(app2).textContent, 'Kicked back · none');
  } finally {
    undo2();
    app2.restore();
  }
});

test('AC91 (f), as Part A item 5: an unknown is said in words in the strip\'s line, never "none" — the words from the board\'s read state and, with one project shown, AC89 (a)\'s table', () => {
  assert.equal(stripEmptyWords({}), 'none');
  assert.equal(stripEmptyWords({ unread: 'pending' }), 'not read yet');
  assert.equal(stripEmptyWords({ unread: 'cant' }), "can't read");
  const one = (read, lastSuccessAt) => oneProjectView({ name: 'Alpha', read, lastSuccessAt, tz: 'America/Chicago' });
  assert.equal(stripEmptyWords({ one: one({ read: 'ok' }, NOW) }), 'none', 'state 3');
  assert.equal(stripEmptyWords({ one: one({ read: 'stale' }, NOW) }), 'none', 'state 4: its last read\'s, known');
  assert.equal(stripEmptyWords({ unread: 'pending', one: one({ read: 'stale' }, null) }), 'not read yet', 'state 1');
  assert.equal(stripEmptyWords({ unread: 'cant', one: one({ read: 'cant-read', since: NOW }, null) }), "can't read", 'state 2');
  assert.equal(stripEmptyWords({ one: one({ read: 'cant-read', since: NOW }, NOW) }), 'none when last read', 'state 5');
  assert.equal(ONE_WORDS.whenLast, 'Nothing here when last read');
});

// AC91 (f) as amended after G2's reviews (the Reviewer's note 2, the Design reviewer's N3 and Q2): "none" alone is in
// --t-mono, standing in the count's place; the words that are not a count are in --t-label --ink2, as "Kicked back" is.
test('AC91 (f), amended: the empty strip\'s parts each in their role — " · " and "none" in --t-mono --ink2; "when last read", "not read yet" and "can\'t read" in --t-label --ink2, as "Kicked back" — in each state, in both themes; the words unchanged', async () => {
  assert.deepEqual([stripEmptyParts({}), stripEmptyParts({ unread: 'pending' }), stripEmptyParts({ unread: 'cant' })],
    [{ count: ' · none', words: '' }, { count: ' · ', words: 'not read yet' }, { count: ' · ', words: "can't read" }]);
  const state5 = oneProjectView({ name: 'Alpha', read: { read: 'cant-read', since: NOW }, lastSuccessAt: NOW, tz: 'America/Chicago' });
  assert.deepEqual(stripEmptyParts({ one: state5 }), { count: ' · none', words: ' when last read' });
  const check = (app, what, want) => {
    const s = strip(app);
    assert.equal(s.textContent, `Kicked back${want.count}${want.words}`, `${what}: the words unchanged`);
    const kn = byClass(s, 'v2-kn')[0];
    const kw = byClass(s, 'v2-kw')[0] || null;
    assert.equal(kn.textContent, want.count, `${what}: the count's place`);
    assert.equal(kw ? kw.textContent : '', want.words, `${what}: the words that are not a count`);
    for (const theme of THEMES) {
      const L = looks(app, theme);
      const c = INK[theme];
      assert.match(L.get(kn).raw('font'), /^400 11px\/1\.4 ⟦--mono\|/, `${what}, ${theme}: " · " and "none" in --t-mono`);
      assert.equal(L.get(kn).colour, c.ink2);
      for (const el of [byClass(s, 'v2-kl')[0], kw].filter(Boolean)) {
        assert.deepEqual([L.get(el).size, L.get(el).weight, L.get(el).colour], ['11px', '500', c.ink2], `${what}, ${theme}: "${el.textContent}" in --t-label --ink2`);
        assert.doesNotMatch(L.get(el).family, /Mono/, `${what}, ${theme}: "${el.textContent}" not in mono`);
      }
    }
  };
  // Read, nothing kicked back: "none".
  let app = await open(quietState());
  try {
    check(app, 'read', { count: ' · none', words: '' });
  } finally {
    app.restore();
  }
  // Before the first read: "not read yet".
  app = await loadSandbox({ ...quietState(), hash: '#/waiting', now: NOW, store: looked(NOW - 5 * H) });
  try {
    check(app, 'before the first read', { count: ' · ', words: 'not read yet' });
  } finally {
    app.restore();
  }
  // No project can be read: "can't read".
  const so = signedOutState();
  so.fail();
  app = await open(so);
  try {
    check(app, 'none readable', { count: ' · ', words: "can't read" });
  } finally {
    app.restore();
  }
  // One project shown, read and then failing (AC89 (a)'s state 5): "none when last read".
  const m = mixState();
  app = await open(m, { hash: `#/waiting/${MIX_PROJECT}` });
  try {
    m.repos[MIX_PROJECT].fail = { kind: 'network' };
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    check(app, 'state 5', { count: ' · none', words: ' when last read' });
  } finally {
    app.restore();
  }
});

// Rewritten in QW1 (AC91 (f)'s note "after the questions request": "from stage QW1 a kicked-back question shows in the
// "Questions for you" section with its reason, not in the strip"; AC94, reading (a)): Bravo's question is in the section,
// "Kicked back · Question" with its reason.
// Rewritten in QW2 (not forced: on QW1's fixture, Alpha's two cards, the newest kick first happened to be the place order,
// so the case passed and checked nothing of the new rule; the row names it): the strip-order case, on `stripState`
// (tests/desk/qw2-fixtures.mjs, made up, NOT real), cards kicked back from two projects and the portfolio, each project's
// out of age order with the other's (Alpha's pull request, Bravo's, Alpha's gate card by age), the kicks in another order
// again: the strip goes by project in J7's order, the portfolio's last, then place (AC95; reading (p)), each card naming its
// project and showing its place.
test('AC91 (f), rewritten in QW1 and in QW2 (AC95): with kicked-back cards, the strip\'s head "Kicked back" (600 12 px ink) with its count (--t-mono) over a hairline, then its cards in one row, by project in J7\'s order, the portfolio\'s last, then in place order — not the newest first, nor by age across projects — each 200 px wide, naming its project after " · ", with its place, its reason and its button; the row scrolls sideways inside the strip, snapping to a card; a kicked-back question in the "Questions for you" section instead', async () => {
  const st = stripState();
  const app = await open(st, { store: looked(NOW - 5 * H, st.seed) });
  try {
    const s = strip(app);
    const head = byClass(s, 'v2-kh')[0];
    assert.equal(head.tag, 'h2');
    assert.deepEqual(head.children.map((c) => c.textContent), ['Kicked back', '5']);
    const row = byClass(s, 'v2-krow')[0];
    assert.equal(row.tag, 'ol');
    assert.deepEqual(row.children.map((li) => li.className), Array(5).fill('v2-kslot'), 'one row of five places');
    assert.deepEqual(stripCards(app).map((c) => c.attrs['data-card']), STRIP_ORDER, 'by project in J7\'s order, the portfolio\'s last, then place');
    const newest = [...STRIP_KICKS].filter((k) => k.kind !== 'question').sort((a, b) => b.kickedAt - a.kickedAt).map((k) => k.id || CARD[k.kind](k.project));
    assert.notDeepEqual(STRIP_ORDER, newest, 'the fixture tells the order from the newest kick first');
    assert.notDeepEqual(STRIP_ORDER.slice(0, 3), [CARD.pr(MIX_PROJECT), CARD.pr(MIX_PROJECT2), CARD.gate(MIX_PROJECT)], 'and from age across projects');
    assert.deepEqual(stripCards(app).map((c) => byClass(c, 'v2-place')[0].textContent),
      ['Place 1 of 6 waiting on you in Alpha', 'Place 3 of 6 waiting on you in Alpha', 'Place 1 of 6 waiting on you in Bravo', 'Place 5 of 6 waiting on you in Bravo', 'Place 1 of 1 waiting on you in Portfolio'],
      'each its place in its own project, read with the project its kind line names');
    assert.deepEqual(stripCards(app).map(kindText), ['Kicked back · Alpha', 'Kicked back · Alpha', 'Kicked back · Bravo', 'Kicked back · Bravo', 'Kicked back · Portfolio'], 'each names its project: the strip has no groups');
    assert.equal(findAll(s, (e) => e.dataset && /^grp:/.test(e.dataset.k || '')).length, 0, 'no project groups in the strip');
    const [pr, gate] = stripCards(app);
    const q = cardOf(app, CARD.question(MIX_PROJECT2));
    assert.ok(findAll(keyed(app, 'qsec'), (e) => e === q).length, 'the kicked-back question in the section, not the strip');
    assert.equal(kindText(q), 'Kicked back · Question');
    assert.equal(byClass(pr, 'v2-why')[0].textContent, 'The pull request is still open as it was', 'its reason');
    assert.equal(byClass(gate, 'v2-why')[0].textContent, 'GitHub shows no answer file yet');
    assert.ok(byClass(q, 'v2-why')[0].textContent.length > 0);
    assert.deepEqual(byClass(pr, 'v2-step').map((b) => b.textContent), ['Open ↗'], 'its button');
    assert.deepEqual(byClass(q, 'v2-step').map((b) => b.textContent), ['More about it ›', 'Done ✓']);
    assert.deepEqual(byClass(gate, 'v2-step').map((b) => b.textContent), ['Proceed', 'Hold', 'Recycle', 'Kill']);
    for (const theme of THEMES) {
      const L = looks(app, theme);
      const c = INK[theme];
      assert.deepEqual([L.get(head).size, L.get(head).weight, L.get(head).colour], ['12px', '600', c.ink], `${theme}: the head, 600 12 px ink`);
      const n = head.children[1];
      assert.deepEqual([L.get(n).size, L.get(n).weight, L.get(n).colour], ['11px', '400', c.ink2], `${theme}: its count in --t-mono`);
      assert.match(L.get(n).raw('font'), /^400 11px\/1\.4 ⟦--mono\|/, 'the --t-mono role');
      assert.equal(L.get(head).decl('border-bottom'), `1px solid ${c.line}`, `${theme}: a hairline under it`);
      const r = L.get(row);
      assert.deepEqual([r.decl('display'), r.decl('overflow-x'), r.decl('overflow-y'), r.decl('scroll-snap-type'), r.decl('max-width')],
        ['flex', 'auto', 'hidden', 'x mandatory', '100%'], `${theme}: one row, scrolling sideways inside the strip, snapping`);
      for (const li of row.children) assert.deepEqual([L.get(li).decl('flex'), L.get(li).decl('scroll-snap-align')], ['0 0 200px', 'start'], `${theme}: 200 px a card`);
      for (const card of stripCards(app)) {
        const gate = card.className.split(' ').includes('gate');
        assert.match(L.get(card).raw('background'), gate ? /^⟦--bg\|/ : /^⟦--card\|/, `${theme}: a card keeps its ground as built (a gate card --bg, AC80)`);
      }
      assert.equal(L.get(s).decl('min-width'), '0', `${theme}: the strip never widens the page`);
    }
  } finally {
    app.restore();
  }
});

test('AC91 (f): the page scrolls sideways nowhere but the strip\'s row — on every Waiting state, at 360 and 414 px, in both themes, no element but `.v2-krow` scrolls sideways, and every place between the strip\'s row and the screen lets it shrink', async () => {
  for (const [what, setup, store, hash] of [['`quiet`', quietState(), looked(NOW - 5 * H), '#/waiting'], ['three kicked back', twoMixState(), kickedStore(), '#/waiting'],
    ['one project shown', twoMixState(), kickedStore(), `#/waiting/${MIX_PROJECT}`]]) {
    const app = await open(setup, { store, hash });
    try {
      for (const theme of THEMES) {
        for (const w of WIDTHS) {
          const L = looks(app, theme, w);
          for (const [el, l] of L) {
            const ox = l.decl('overflow-x') || (l.decl('overflow').split(' ')[0] || '');
            if (/auto|scroll/.test(ox)) assert.ok(String(el.className).split(' ').includes('v2-krow') || el.tag === 'pre', `${what}, ${theme}, ${w} px: ${el.tag}.${el.className} scrolls sideways`);
          }
          const row = byClass(app.view, 'v2-krow')[0];
          if (!row) continue;
          // From the row up to the board: each a block or grid item that shrinks to the screen (min-width 0, or a block).
          for (let n = row; n && !String(n.className).split(' ').includes('v2-board'); n = n.parent) {
            const l = L.get(n);
            if (n === row) continue;
            assert.ok(l.decl('min-width') === '0' || !['grid', 'flex', 'inline-flex'].includes(L.get(n.parent).decl('display')),
              `${what}, ${theme}, ${w} px: ${n.tag}.${n.className} lets the row shrink`);
          }
        }
      }
    } finally {
      app.restore();
    }
  }
});

test('AC91 (f), rewritten in QW2 (AC95): the strip opens by itself when a card is kicked back and closes to its line when none is left — a card marked on this device, kicked back at about 5 minutes, then confirmed by GitHub; its "Done ✓" in its sheet and its drag into Done; with one project shown, only that project\'s cards', async () => {
  const setup = mixState();
  const store = looked(NOW - 5 * H);
  const app = await open(setup, { store });
  const undo = layout();
  try {
    assert.equal(strip(app).textContent, 'Kicked back · none');
    // Two cards marked "Done ✓", a poll apart: each kicked back at its first successful poll after 5 minutes.
    for (const id of [CARD.pr(MIX_PROJECT), CARD.hold(MIX_PROJECT)]) {
      await app.go(`#/waiting/card/${encodeURIComponent(id)}`);
      assert.equal(keyed(app, 'sheet-done').textContent, 'Done ✓');
      await app.tap(keyed(app, 'sheet-done'));
      await app.go('#/waiting');
      await app.advance(POLL_MS);
    }
    for (let i = 0; i < 5; i++) await app.advance(POLL_MS);
    // Rewritten in QW2 (forced: it failed; AC95 and reading (p): the strip goes "within each project in place order", no
    // longer the newest first): the pull request, raised first, before the hold card, which has no raised time (C, (e)),
    // though the hold card was kicked back last.
    assert.deepEqual(stripCards(app).map((c) => c.attrs['data-card']), [CARD.pr(MIX_PROJECT), CARD.hold(MIX_PROJECT)], 'opened by itself, in place order');
    assert.equal(byClass(strip(app), 'v2-kh')[0].textContent, 'Kicked back2');
    // "Done ✓" in a strip card's sheet: out of the strip, into Done, a new 5 minutes.
    await app.go(`#/waiting/card/${encodeURIComponent(CARD.hold(MIX_PROJECT))}`);
    await app.tap(keyed(app, 'sheet-done'));
    await app.go('#/waiting');
    assert.deepEqual(stripCards(app).map((c) => c.attrs['data-card']), [CARD.pr(MIX_PROJECT)], 'one card');
    assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 1);
    // Its drag into Done (a press and hold, carried down out of the strip's row).
    await carry(app, CARD.pr(MIX_PROJECT), [60, 150], [300, 500]);
    assert.equal(strip(app).textContent, 'Kicked back · none', 'none left: closed to its line');
    assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 2);
    // Kicked back again; then GitHub shows the hold card gone: confirmed, and the strip holds only what is left.
    for (let i = 0; i < 6; i++) await app.advance(POLL_MS);
    assert.equal(stripCards(app).length, 2, 'open again');
    setup.repos[MIX_PROJECT].pulls = setup.repos[MIX_PROJECT].pulls.filter((p) => p.number !== 80);
    await app.advance(POLL_MS);
    assert.deepEqual(stripCards(app).map((c) => c.attrs['data-card']), [CARD.hold(MIX_PROJECT)], 'the merged pull request confirmed, out of the strip');
    assert.ok(byClass(lane(app, 'done'), 'v2-drow').some((r) => r.textContent.includes('Alpha: a change to merge')), 'into Done as ✓');
  } finally {
    undo();
    app.restore();
  }
  // One project shown: only its cards in the strip, the strip above the lanes, under the chip. Rewritten in QW1 (AC91 (f)'s
  // note: "from stage QW1 a kicked-back question shows in the "Questions for you" section … not in the strip"): Bravo's one
  // kicked-back card is its question, now in the section, so its strip is "none"; Alpha's two are in Alpha's.
  const bravo = await open(twoMixState(), { store: kickedStore(), hash: `#/waiting/${MIX_PROJECT2}` });
  try {
    assert.equal(strip(bravo).textContent, 'Kicked back · none');
    assert.equal(kindText(findAll(keyed(bravo, 'qsec'), (e) => e.attrs && e.attrs['data-card'] === CARD.question(MIX_PROJECT2))[0]), 'Kicked back · Question', 'in the section');
  } finally {
    bravo.restore();
  }
  const one = await open(twoMixState(), { store: kickedStore(), hash: `#/waiting/${MIX_PROJECT}` });
  try {
    assert.deepEqual(stripCards(one).map((c) => c.attrs['data-card']), [CARD.pr(MIX_PROJECT), CARD.gate(MIX_PROJECT)]);
    assert.equal(byClass(strip(one), 'v2-kh')[0].textContent, 'Kicked back2');
    const kids = byClass(one.view, 'v2-board')[0].children;
    const at = (cls) => kids.findIndex((c) => c.className.split(' ').includes(cls));
    assert.ok(at('v2-filter') < at('v2-kstrip') && at('v2-kstrip') === at('v2-lanes') - 1, 'under the chip, directly above the lanes');
  } finally {
    one.restore();
  }
});

// Rewritten in QW1 (AC94: "It is counted exactly as before … the badge counts the section, the strip and the lane, as now,
// so it is their sum"): the lane and the strip count what they hold, and each project's questions waiting and kicked back
// are in the "Questions for you" section; added back, the counts are the same 8 waiting and 3 kicked back.
test('AC91 (f), rewritten in QW1: the counts are unchanged — the badge and Home\'s briefing still count "Waiting on you" plus "Kicked back", the section\'s questions among them', async () => {
  const app = await open(twoMixState(), { store: kickedStore() });
  try {
    const inSection = (kind) => findAll(keyed(app, 'qsec'), (e) => e.attrs && e.attrs['data-question'] === kind).length;
    const w = Number(byClass(lane(app, 'wait'), 'v2-lc')[0].textContent) + inSection('counted');
    const k = Number(byClass(byClass(strip(app), 'v2-kh')[0], 'v2-lc')[0].textContent) + inSection('kicked');
    assert.deepEqual([inSection('counted'), inSection('kicked')], [1, 1], 'Alpha\'s question waiting, Bravo\'s kicked back');
    assert.deepEqual([w, k], [8, 3]);
    assert.equal(badge(app), w + k, 'the badge');
    await app.go('#/');
    const b = byClass(app.view, 'v2-brief')[0];
    assert.equal(byClass(b, 'v2-bt1')[0].textContent, `${w + k} need you`, 'the briefing');
    assert.match(byClass(b, 'v2-bt2')[0].textContent, new RegExp(`^${w} waiting, ${k} kicked back · oldest `));
  } finally {
    app.restore();
  }
});

test('AC91 (f), item 4c: Done\'s ground is --bg2, 12 px round, the full height of the lanes (stretched to the taller), 8 px inside its sides and 10 px at its foot, its head 6 px from its top; its cards keep --card; "Waiting on you" has no ground — in both themes, empty and with cards', async () => {
  for (const [what, setup, store] of [['empty', quietState(), looked(NOW - 5 * H)], ['with cards', twoMixState(), kickedStore()]]) {
    const app = await open(setup, { store });
    try {
      const done = lane(app, 'done');
      const wait = lane(app, 'wait');
      for (const theme of THEMES) {
        const L = looks(app, theme);
        const c = INK[theme];
        const d = L.get(done);
        assert.match(d.raw('background'), /^⟦--bg2\|/, `${what}, ${theme}: the briefing's --bg2`);
        assert.equal(d.decl('background'), c.bg2);
        assert.deepEqual([d.decl('border-radius'), d.decl('padding'), d.decl('align-self'), d.decl('height'), d.decl('max-height')], ['12px', '0 8px 10px', 'stretch', '', ''], `${what}, ${theme}`);
        assert.equal(L.get(byClass(app.view, 'v2-lanes')[0]).decl('display'), 'grid', 'a grid row: a stretched lane is as tall as the taller');
        assert.equal(L.get(byClass(done, 'v2-lh')[0]).decl('padding-top'), '6px', `${what}, ${theme}: its head 6 px from its top`);
        assert.equal(L.get(wait).decl('background'), '', `${what}, ${theme}: "Waiting on you" has no ground`);
        for (const card of byClass(done, 'v2-card')) assert.equal(L.get(card).decl('background'), c.card, `${what}, ${theme}: a Done card keeps --card`);
        for (const t of findAll(done, (e) => (e.children || []).some((x) => x.nodeType === 3 && String(x.text || '').trim()))) {
          assert.ok([c.ink, c.ink2].includes(L.get(t).colour), `${what}, ${theme}: "${t.textContent.slice(0, 30)}" in ink on the ground`);
        }
      }
    } finally {
      app.restore();
    }
  }
});

test('AC92 (e)\'s rule for a filled ground: on Waiting, in each state and theme, the Done lane is the only filled ground outside the cards and sheets — no soft box, no briefing, nothing else on --bg2', async () => {
  for (const [what, setup, store, hash] of [['`quiet`', quietState(), looked(NOW - 5 * H), '#/waiting'], ['`mix`', mixState(), looked(NOW - 5 * H), '#/waiting'],
    ['three kicked back', twoMixState(), kickedStore(), '#/waiting'], ['one project shown', twoMixState(), kickedStore(), `#/waiting/${MIX_PROJECT}`]]) {
    const app = await open(setup, { store, hash });
    try {
      assert.equal(byClass(app.view, 'v2-brief').length, 0, `${what}: no briefing box on Waiting`);
      for (const theme of THEMES) {
        const L = looks(app, theme);
        const grounds = [...L].filter(([, l]) => /⟦--bg2\|/.test(l.raw('background') + l.raw('background-color'))).map(([el]) => el);
        assert.deepEqual(grounds.map((el) => `${el.tag}.${el.className}`), ['section.v2-lane lane-done'], `${what}, ${theme}: only the Done lane's ground`);
      }
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// (g) "new" on Waiting

// Rewritten in QW1 (AC94: "`isNewCard` … gives it in the section too"): the question is in the "Questions for you" section,
// where it carries "new" by the same rule; raised before "last looked", none there either.
test('AC91 (g), rewritten in QW1: "new" on a card in "Waiting on you" raised after "last looked", in --t-label --ink beside its kind label, part of the kind line\'s text, with no colour and no box; none before it, none without a raised time; the question, in the section, by the same rule', async () => {
  // `mix`'s made-up project: its pull request raised 8 days ago, its question 6 h 41 m, its gate card 4 h 31 m and its
  // decision card 3 h 21 m before the clock; its hold and merge cards have no raised time. "Last looked" 5 hours ago.
  const app = await open(mixState(), { store: looked(NOW - 5 * H) });
  try {
    const got = Object.fromEntries(waitCards(app).map((c) => [c.attrs['data-card'], [kindText(c), isShownNew(c)]]));
    assert.deepEqual(got, {
      [CARD.pr(MIX_PROJECT)]: ['Pull request', false],
      [CARD.gate(MIX_PROJECT)]: ['Gate · Build new', true],
      [CARD.card(MIX_PROJECT)]: ['Decision new', true],
      [CARD.hold(MIX_PROJECT)]: ['Hold', false],
      [CARD.merge(MIX_PROJECT)]: ['Merge card', false],
    }, 'raised after "last looked": "new", part of the kind line\'s text; before it, or with no raised time, none');
    const q = cardOf(app, CARD.question(MIX_PROJECT));
    assert.ok(findAll(keyed(app, 'qsec'), (e) => e === q).length, 'the question in the section');
    assert.deepEqual([kindText(q), isShownNew(q)], ['Question', false], 'raised before "last looked": none in the section');
    const fresh = newOf(cardOf(app, CARD.card(MIX_PROJECT)));
    assert.equal(fresh.parent, byClass(cardOf(app, CARD.card(MIX_PROJECT)), 'v2-kd')[0], 'in the kind line, beside the kind label');
    assert.equal(fresh.parent.children.indexOf(fresh), 2, 'after the icon and the label');
    for (const theme of THEMES) {
      const L = looks(app, theme);
      const l = L.get(fresh);
      assert.deepEqual([l.size, l.weight, l.colour], ['11px', '500', INK[theme].ink], `${theme}: --t-label in --ink`);
      assert.match(l.raw('font'), /^500 11px\/1\.35 ⟦--font\|/, 'the --t-label role');
      assert.match(l.raw('color'), /^⟦--ink\|/, `${theme}: dark ink, no colour`);
      for (const p of ['background', 'background-color', 'border', 'border-color', 'border-radius', 'padding', 'box-shadow']) assert.equal(l.decl(p), '', `${theme}: no box (${p})`);
      const hidden = newOf(cardOf(app, CARD.pr(MIX_PROJECT)));
      assert.equal(L.get(hidden).decl('display'), 'none', `${theme}: drawn as nothing on a card that isn't new`);
    }
  } finally {
    app.restore();
  }
});

// Rewritten in QW1 (AC94; QW1's row: "`isNewCard`'s lane rule … and its cases, "new" now also in the section"): the lane
// holds three new cards, its question being in the "Questions for you" section, where it is new too; the kicked-back
// question there, as the strip's cards, is not; and `isNewCard` gives it for the section ('section').
test('AC91 (g), rewritten in QW1: none in the Kicked back strip or in Done, even raised after "last looked"; none while the device holds no "last looked" (AC40\'s markers off); and gone after Home\'s "Mark as seen"; in the "Questions for you" section by the lane\'s rule, never on a kicked-back question', async () => {
  // "Last looked" 30 days back: every card with a raised time is raised after it.
  const app = await open(twoMixState(), { store: kickedStore(NOW - 30 * 24 * H) });
  try {
    assert.ok(waitCards(app).filter(isShownNew).length >= 3, 'in "Waiting on you": new');
    const inSection = (id) => findAll(keyed(app, 'qsec'), (e) => e.attrs && e.attrs['data-card'] === id)[0];
    assert.equal(isShownNew(inSection(CARD.question(MIX_PROJECT))), true, 'in the section: new');
    assert.equal(newOf(inSection(CARD.question(MIX_PROJECT2))), null, 'a kicked-back question in the section: none, as in the strip');
    for (const c of stripCards(app)) assert.equal(newOf(c), null, `${c.attrs['data-card']}: none in the strip`);
    for (const c of byClass(lane(app, 'done'), 'v2-card')) assert.equal(newOf(c), null, 'none in Done');
    assert.doesNotMatch(strip(app).textContent + lane(app, 'done').textContent, /\bnew\b/);
    // "Mark as seen" on Home moves "last looked" to now: none is new.
    await app.go('#/');
    await app.tap(keyed(app, 'mark-seen'));
    await app.go('#/waiting');
    assert.deepEqual(waitCards(app).filter(isShownNew), [], 'gone after "Mark as seen"');
    assert.equal(isShownNew(inSection(CARD.question(MIX_PROJECT))), false, 'in the section too');
  } finally {
    app.restore();
  }
  const off = await open(mixState(), { store: looked(null) });
  try {
    assert.deepEqual(waitCards(off).filter(isShownNew), [], 'no "last looked" on the device: none');
  } finally {
    off.restore();
  }
  // The rule, on the module.
  const card = { raisedAt: NOW - H };
  assert.deepEqual([isNewCard(card, 'wait', NOW - 2 * H), isNewCard(card, 'wait', NOW - H), isNewCard(card, 'kick', NOW - 2 * H), isNewCard(card, 'done', NOW - 2 * H),
    isNewCard({ raisedAt: null }, 'wait', NOW - 2 * H), isNewCard(card, 'wait', null)], [true, false, false, false, false, false]);
  assert.deepEqual([isNewCard(card, 'section', NOW - 2 * H), isNewCard(card, 'section', NOW - H), isNewCard({ raisedAt: null }, 'section', NOW - 2 * H), isNewCard(card, 'section', null)],
    [true, false, false, false], 'QW1: in the section, by the same rule');
});

// The Reviewer's lesson from G1 (note 2): what shows a state that moves must follow it on the 15-second tick, not only
// at the next redraw. "New" is worked out from "last looked" each tick (its text and its class are `live`), so the tick
// alone puts right a drawing out of step with it, either way; and when "last looked" moves (the page hidden after a window
// of 10 s or more, then back in view), the same card loses "new" in place.
test('AC91 (g) with AC56\'s tick: "new" is worked out again from "last looked" on the 15-second tick alone, either way, in place; after "last looked" moves, the same card has no "new"', async () => {
  const app = await open(mixState(), { store: looked(NOW - 5 * H) });
  try {
    const c = cardOf(app, CARD.card(MIX_PROJECT));
    const kd = byClass(c, 'v2-kd')[0];
    const fresh = newOf(c);
    const old = newOf(cardOf(app, CARD.question(MIX_PROJECT)));
    assert.ok(isShownNew(c));
    assert.equal(typeof fresh._live, 'function', 'its words follow the tick');
    assert.equal(typeof fresh._liveClass, 'function', 'and its class');
    // A drawing out of step with "last looked" (as if it had moved since): only the tick runs, and puts each right.
    fresh.setAttribute('class', 'v2-new none');
    fresh.textContent = '';
    old.setAttribute('class', 'v2-new');
    old.textContent = ' new';
    await app.tick();
    assert.deepEqual([fresh.className, fresh.textContent, kd.textContent], ['v2-new', ' new', 'Decision new'], 'raised after "last looked": new again on the tick');
    assert.deepEqual([old.className, old.textContent], ['v2-new none', ''], 'raised before it: none on the tick');
    // "Last looked" moves past every card: the same card, its "new" gone in place.
    await app.advance(20_000);
    await app.visibility('hidden');
    await app.visibility('visible');
    await app.tick();
    assert.equal(cardOf(app, CARD.card(MIX_PROJECT)), c, 'the same card');
    assert.equal(newOf(c), fresh, 'the same "new" place, changed in place');
    assert.deepEqual([fresh.className, fresh.textContent, kd.textContent], ['v2-new none', '', 'Decision'], 'not new');
  } finally {
    app.restore();
  }
});

// The Design reviewer's N1 and N2 (G2, round 1): a card carried from the strip stays lifted, under the finger and out of
// the strip's clip, from the moment it is lifted to the moment it lands, whatever redraws the board in between.
// Rewritten in QW1 (AC94: a kicked-back question is in the "Questions for you" section, "not dragged from the section"):
// the card carried is the strip's other card, Alpha's gate card, in place of Bravo's question.
test('AC91 (f) with AC80\'s drag, rewritten in QW1: a card lifted from a scrolled strip is moved back by the row\'s scroll at once, before the finger moves (N2); a redraw mid-carry, by hand or at a poll, keeps the card lifted where the finger has it and its row `carrying` (N1); it still lands in Done', async () => {
  const app = await open(twoMixState(), { store: kickedStore() });
  const undo = layout();
  try {
    const id = CARD.gate(MIX_PROJECT);
    const row = byClass(strip(app), 'v2-krow')[0];
    row.scrollLeft = 288; // the row scrolled to its end before the press
    const c = cardOf(app, id);
    c.dispatch('pointerdown', { target: byClass(c, 'v2-t')[0], clientX: 60, clientY: 150, pointerType: 'touch' });
    await app.flush();
    await app.advance(HOLD_MS);
    assert.ok(c.className.split(' ').includes('lifted'));
    assert.equal(row.className, 'v2-krow carrying');
    assert.equal(c.style.transform, 'translate(-288px, 0px)', 'N2: under the finger at once, the row\'s 288 px of scroll made up');
    await app.docEvent('pointermove', { clientX: 200, clientY: 420 });
    const there = 'translate(-148px, 270px)';
    assert.equal(c.style.transform, there);
    // A redraw by hand, then the board's own at its next poll: the carry is kept through each.
    app.module.refresh();
    await app.flush();
    assert.equal(cardOf(app, id), c, 'the same card');
    assert.deepEqual([c.className.split(' ').includes('lifted'), row.className, c.style.transform], [true, 'v2-krow carrying', there], 'N1: kept through a redraw');
    await app.advance(POLL_MS);
    assert.deepEqual([c.className.split(' ').includes('lifted'), row.className, c.style.transform], [true, 'v2-krow carrying', there], 'N1: kept through a poll\'s redraw');
    assert.deepEqual(Object.keys(c.style), ['transform'], 'its move, its only inline style (AC50 + AC41)');
    await app.docEvent('pointerup', { clientX: 300, clientY: 420 });
    assert.ok(!stripCards(app).some((x) => x.attrs['data-card'] === id), 'it lands: out of the strip');
    assert.ok(byClass(lane(app, 'done'), 'v2-card conf').some((x) => x.textContent.includes('The Build gate · P-002')), 'into Done');
    assert.equal(row.className, 'v2-krow', 'its row scrolls again');
    // A redraw after the drag puts nothing back.
    app.module.refresh();
    await app.flush();
    assert.equal(byClass(app.view, 'lifted').length + byClass(app.view, 'carrying').length, 0);
  } finally {
    undo();
    app.restore();
  }
});
