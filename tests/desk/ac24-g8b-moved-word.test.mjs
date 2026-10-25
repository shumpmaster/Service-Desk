// ac-test: S-001/AC24 — G8b of "After the glance audit": Plan's moved row shows the word "moved" (AC24's note, changed by
// the owner's "Ruling: B", decisions/questions/P-001-glance-moved-word.md: "Show the word — a small grey 'moved' on the
// row, in the secondary text colour, beside the light-grey edge; gold keeps its one meaning; built in a small change after
// G7 lands"), with AC92 (a)'s rule (noted: the word in --ink2, and no third colour). ac-test: S-001/AC92
//
// AC24's note, as amended: the one word "moved", in --t-small and --ink2, never --gold and never --you, with no icon, no
// fill and no border, the edge still --line2; in the row's link (a.v2-plrow), in its text column (.v2-prt), on a line of
// its own directly under the code line (.v2-plm), left-aligned with the name; it takes no width from the name, which wraps
// as before and is never cut at 360 px, in the ordering and out of it, the rough finish and the move controls in their
// places; on the moved row only, gone with the edge at the next move or when the draft is set aside, never on a row not
// moved, a gate card's row or a milestone's sheet; hidden from assistive technology, the place's words keeping ", moved"
// ("3rd of 6, moved"), so it is said once. AC24's own moved-row cases (tests/desk/ac24-work-ahead.test.mjs) and G7's Plan
// case (tests/desk/ac92-glance-palette.test.mjs) are extended with it; AC88's cascade want-list and the stage-8 guard's
// G8B_ONCE are in tests/desk/ac88-dark.test.mjs.
//
// The records: Service-Desk's at 77bfeae, real, with the worked estimates (made up, wa-fixtures.mjs's WORKED); the made-up
// parts tests/desk/glance-fixtures.mjs builds (`longNameState`'s long name, `gates`' made-up project and gate cards, the
// made-up plan written below), each NOT real (tests/desk/fixtures/README.md). The suite has no browser, so each look is
// the cascade of the page's own stylesheets over what it drew (tests/desk/css-cascade.mjs) at 360 px, in light and dark;
// the pull request carries the Chromium captures at 360 × 740 and 414 × 896 (tests/desk/tools/glance-shots.mjs, g8b-),
// each word's line, place and the name's lines measured in the browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { findAll, byClass } from './sandbox-helpers.mjs';
import { textRuns } from './screen-text.mjs';
import { planText } from './wa-fixtures.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { G8B_OPENS, G8B_LONG, MIX_PROJECT, SD } from './glance-fixtures.mjs';

const CSS = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(CSS, 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1').trim();
/** AC81's values (desk mockup v2, sandbox.css's v2 block), in each theme. */
const T = {
  light: { ink: '#18191c', ink2: '#5c5f66', gold: '#8a6a10', you: '#c9380c', line2: '#d6d6db' },
  dark: { ink: '#ecedef', ink2: '#a2a5ac', gold: '#c9b04f', you: '#ff6a3d', line2: '#34363c' },
};
const THEMES = ['light', 'dark'];

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
const cls = (e) => ` ${(e && e.className) || ''} `;
const has = (e, c) => cls(e).includes(` ${c} `);
const kids = (e) => e.children.filter((c) => c.tag);
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const up = (e, pred) => { for (let x = e.parent; x; x = x.parent) if (pred(x)) return x; return null; };
/** The visible word: every `.v2-plmoved` on the page. */
const words = (root) => byClass(root, 'v2-plmoved');
/** Plan's milestone rows (AC86), and the rows drawn moved (AC24: the edge). */
const rows = (app) => findAll(app.view, (e) => e.tag === 'li' && has(e, 'v2-plli') && e.attrs['data-row'] != null);
const movedRows = (app) => rows(app).filter((r) => has(r, 'moved'));
const linkOf = (li) => kids(li).find((c) => c.tag === 'a' && has(c, 'v2-plrow'));
/** What assistive technology reads in an element: its text, less what is aria-hidden. */
const read = (e) => textRuns(e, (x) => x.attrs && x.attrs['aria-hidden'] === 'true').join(' ');
/** What is shown in an element: its text, less the visually hidden words (`.sb-vh`). */
const shown = (e) => textRuns(e, (x) => has(x, 'sb-vh')).join(' ');
const count = (s, re) => (s.match(re) || []).length;
const opened = (name) => { const o = G8B_OPENS.find(([n]) => n === name); assert.ok(o, name); return o[1](); };
/** The row each of G8b's opens moves (glance-fixtures.mjs): its project, its id and its full name. */
const WANT = {
  M3A: { project: SD.name, id: 'M3A', name: 'Work ahead planned and scheduled from the desk' },
  long: { project: SD.name, id: 'M3B', name: G8B_LONG },
  gate: { project: MIX_PROJECT, id: 'MD3', name: null },
};
const wantOf = (where) => (/long made-up name/.test(where) ? WANT.long : /gate card/.test(where) ? WANT.gate : WANT.M3A);
const groupOf = (li) => up(li, (e) => e.tag === 'section' && has(e, 'v2-plgrp'));

// ---------------------------------------------------------------------------
// Where it sits, and said once

test('AC24 (G8b): on Plan\'s moved row, in the ordering and out of it, the one word "moved" — a span in the row\'s link, in its text column directly under the code line, on a line of its own, the last shown line, with no icon; on the row with the edge and no other; hidden from assistive technology, the place\'s words "<n>th of <m>, moved", so "moved" is read once and shown once', async () => {
  for (const [where, open] of G8B_OPENS) {
    const app = await open();
    try {
      const want = wantOf(where);
      const moved = movedRows(app);
      assert.equal(moved.length, 1, `${where}: one row moved`);
      const li = moved[0];
      assert.equal(li.attrs['data-row'], want.id, `${where}: ${want.id} moved`);
      if (!/the ordering open/.test(where)) assert.equal(keyed(app, `wa-grp:${want.project}`), groupOf(li), `${where}: in ${want.project}'s group`);
      // One word on the page, and it is the moved row's.
      const all = words(app.view);
      assert.equal(all.length, 1, `${where}: one word on the page`);
      const w = all[0];
      assert.equal(w.tag, 'span', where);
      assert.equal(w.textContent, 'moved', `${where}: the one word`);
      assert.equal(kids(w).length, 0, `${where}: no icon or mark in it`);
      assert.equal(w.attrs['aria-hidden'], 'true', `${where}: hidden from assistive technology`);
      const link = linkOf(li);
      assert.ok(link, `${where}: the row's link`);
      const col = w.parent;
      assert.ok(col.tag === 'span' && has(col, 'v2-prt') && col.parent === link, `${where}: in the link's text column (a.v2-plrow > .v2-prt)`);
      // Directly under the code line: the column holds the name, the code line, the word and the hidden state words, in order.
      const inCol = kids(col);
      assert.deepEqual(inCol.map((c) => c.className), ['v2-prtt v2-plname', 'v2-mono v2-plm', 'v2-plmoved', 'sb-vh'], `${where}: name, code line, the word, then the words only read`);
      assert.match(inCol[1].textContent, new RegExp(`^${want.id} · `), `${where}: the code line above it is the row's`);
      if (want.name) assert.equal(inCol[0].textContent, want.name, `${where}: the name whole, nothing taken from it`);
      // Said once: the place's words keep ", moved", the word itself is not read; shown once: the word, not the place's words.
      const place = kids(link).find((c) => has(c, 'v2-plord'));
      const vh = kids(place).find((c) => has(c, 'sb-vh'));
      assert.match(vh.textContent, /^\d+(st|nd|rd|th) of \d+, moved$/, `${where}: the place's words`);
      assert.equal(count(read(link), /\bmoved\b/g), 1, `${where}: "moved" read once: ${read(link)}`);
      assert.equal(count(shown(link), /\bmoved\b/g), 1, `${where}: "moved" shown once: ${shown(link)}`);
      assert.equal(count(read(li), /\bmoved\b/g), 1, `${where}: and once in the whole row`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// Its look

test('AC24 + AC92 (a) (G8b): the word\'s look from the cascade, in light and dark — --t-small (400 12px) in --ink2 (#5c5f66, #a2a5ac), never --gold or --you; no fill, border, shadow or icon; the moved edge still --line2, and the name and code line as on any other row', async () => {
  for (const [where, open] of G8B_OPENS) {
    const app = await open();
    try {
      const w = words(app.view)[0];
      const li = movedRows(app)[0];
      const other = rows(app).find((r) => !has(r, 'moved'));
      for (const theme of THEMES) {
        const L = looks(app, theme);
        const c = T[theme];
        const x = L.get(w);
        assert.deepEqual([x.size, x.weight, x.colour], ['12px', '400', c.ink2], `${where}, ${theme}: --t-small in --ink2`);
        for (const not of [c.gold, c.you, c.ink]) assert.notEqual(x.colour, not, `${where}, ${theme}: not ${not}`);
        assert.equal(x.decl('color'), c.ink2, `${where}, ${theme}: its own colour, --ink2`);
        for (const p of ['background', 'background-color', 'border', 'border-left', 'border-color', 'box-shadow', 'outline', 'text-decoration', 'mask-image']) {
          assert.equal(x.decl(p), '', `${where}, ${theme}: no ${p}`);
        }
        assert.equal(L.get(li).decl('box-shadow'), `inset 2px 0 0 ${c.line2}`, `${where}, ${theme}: the edge still --line2`);
        // The name and the code line look as on a row not moved.
        for (const k of ['v2-plname', 'v2-plm']) {
          const a = L.get(byClass(li, k)[0]);
          const b = L.get(byClass(other, k)[0]);
          assert.deepEqual([a.size, a.weight, a.colour], [b.size, b.weight, b.colour], `${where}, ${theme}: ${k} as on another row`);
        }
      }
    } finally {
      app.restore();
    }
  }
  // The rule: the word's own, in --t-small and --ink2 only, never --gold or --you; no rule draws an icon for it.
  const rules = [...CSS.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2].trim() }));
  assert.deepEqual(rules.filter((r) => /v2-plmoved/.test(r.sel)).map((r) => [r.sel, r.body]), [['.v2-plmoved', 'font: var(--t-small); color: var(--ink2);']]);
  assert.deepEqual(rules.filter((r) => /moved/.test(r.sel) && /--gold|--you/.test(r.body)).map((r) => r.sel), [], 'no moved rule in gold or vermilion');
});

// ---------------------------------------------------------------------------
// At 360 px: its own line, the name never cut

test('AC24 (G8b): at 360 px, in the ordering and out of it, the word is a line of its own in the text column and takes no width from the name — the column one track, the row\'s columns as on a row not moved; nothing clips, cuts or holds to one line the name, the code line or the word; the long made-up name (NOT real) whole; the rough finish and the move controls in their places', async () => {
  const NONE = { 'white-space': ['', 'normal'], 'text-overflow': [''], 'max-height': [''], 'max-width': [''], width: [''], overflow: ['', 'visible'], '-webkit-line-clamp': [''], position: [''], float: [''] };
  for (const [where, open] of G8B_OPENS) {
    const app = await open();
    try {
      const ordering = /the ordering open/.test(where);
      const li = movedRows(app)[0];
      const link = linkOf(li);
      const w = words(app.view)[0];
      const col = w.parent;
      const name = byClass(li, 'v2-plname')[0];
      const other = rows(app).find((r) => !has(r, 'moved') && Boolean(byClass(r, 'v2-plv')[0].textContent) === Boolean(byClass(li, 'v2-plv')[0].textContent));
      assert.ok(other, `${where}: a row not moved to compare`);
      if (wantOf(where).name) assert.equal(name.textContent, wantOf(where).name, `${where}: the name whole`);
      for (const theme of THEMES) {
        const L = looks(app, theme);
        // A line of its own: the column is a one-track grid, so each of its children is its own row, the word under the code line.
        assert.equal(L.get(col).decl('display'), 'grid', `${where}, ${theme}: the text column a grid`);
        assert.equal(L.get(col).decl('grid-template-columns'), '', `${where}, ${theme}: one track, so the word sits under the code line, not beside it`);
        assert.equal(L.get(col).decl('min-width'), '0', `${where}, ${theme}: the column may shrink, so nothing pushes the row wider`);
        assert.ok(['', 'block'].includes(L.get(w).decl('display')), `${where}, ${theme}: the word a grid item, not drawn beside or over the name`);
        // No width taken from the name: the row's columns are those of a row not moved, and the word adds none.
        assert.equal(L.get(link).decl('grid-template-columns'), L.get(linkOf(other)).decl('grid-template-columns'), `${where}, ${theme}: the row's columns unchanged`);
        assert.equal(L.get(li).decl('grid-template-columns'), L.get(other).decl('grid-template-columns'), `${where}, ${theme}: the row's outer columns unchanged`);
        // Never cut: nothing clips, cuts or holds to one line the name, the code line, the word, or the boxes they are in.
        for (const [what, e] of [['the name', name], ['the code line', byClass(li, 'v2-plm')[0]], ['the word', w], ['the column', col], ['the link', link], ['the row', li]]) {
          for (const [p, ok] of Object.entries(NONE)) {
            if (['position', 'width'].includes(p) && e !== w) continue; // the row's own place (relative for G8's arrow) and the link's width are G8's and AC86's
            assert.ok(ok.includes(L.get(e).decl(p)), `${where}, ${theme}: ${what}'s ${p} ${L.get(e).decl(p)}`);
          }
        }
        assert.equal(L.get(name).decl('overflow-wrap'), 'break-word', `${where}, ${theme}: the name wraps, a long word broken rather than cut`);
      }
      // The rough finish and the move controls in their places: the row holds what a row not moved holds, in the same order.
      const part = (c) => `${c.tag}.${String(c.className || '').split(' ')[0]}`;
      const shape = (r) => [kids(r).map(part), kids(linkOf(r)).map(part)];
      const [outer, inner] = shape(li);
      const [outer2, inner2] = shape(other);
      assert.deepEqual(outer.filter((x) => !/v2-plunder/.test(x)), outer2.filter((x) => !/v2-plunder/.test(x)), `${where}: the row's parts as another row's`);
      assert.deepEqual(inner.filter((x) => !/v2-here/.test(x)), inner2.filter((x) => !/v2-here/.test(x)), `${where}: the link's parts as another row's, the rough finish last`);
      assert.ok(has(kids(link).filter((c) => !has(c, 'v2-here')).at(-1), 'v2-plv'), `${where}: the rough finish at the right, after the text column`);
      const move = kids(li).find((c) => has(c, 'v2-plmove'));
      if (ordering) assert.equal(move && kids(move).filter((b) => b.tag === 'button').length, 2, `${where}: its two move controls beside it`);
      else assert.equal(move, undefined, `${where}: no move controls out of the ordering`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// Where it never is, and when it goes

test('AC24 (G8b): the word only on the moved row — never on a row not moved, a gate card\'s row or the moved milestone\'s sheet; gone from the earlier row at the next move, and from the page when a newer plan lands and the draft is set aside', async () => {
  for (const [where, open] of G8B_OPENS) {
    const app = await open();
    try {
      for (const r of rows(app).filter((x) => !has(x, 'moved'))) assert.equal(words(r).length, 0, `${where}: none on ${r.attrs['data-row']}, not moved`);
      const gates = findAll(app.view, (e) => e.tag === 'li' && has(e, 'gate'));
      if (/gate card, .* the ordering closed/.test(where)) assert.ok(gates.length > 0, `${where}: gate rows drawn`);
      for (const g of gates) assert.equal(words(g).length, 0, `${where}: none on a gate card's row`);
      // The moved milestone's sheet (AC86): AC24's whole row, with no word.
      const { project, id } = wantOf(where);
      await app.go(`#/work/ms/${encodeURIComponent(project)}/${encodeURIComponent(id)}`);
      const sheet = byClass(app.view, 'v2-sheet')[0];
      assert.ok(sheet && byClass(sheet, 'v2-plest').length, `${where}: ${id}'s sheet open`);
      assert.equal(words(sheet).length, 0, `${where}: none in the sheet`);
      assert.doesNotMatch(shown(sheet), /\bmoved\b/, `${where}: the sheet doesn't show "moved"`);
      await app.go('#/work');
      assert.equal(words(app.view).length, 1, `${where}: the sheet closed, the word still on its row`);
      // The next move: the earlier row's word goes with its edge; the newly moved row has both.
      if (!/the ordering open/.test(where)) await app.tap(keyed(app, 'plan-order'));
      const next = findAll(app.view, (e) => e.tag === 'button' && /^wa-down:/.test(e.dataset.k || '') && e.attrs['aria-disabled'] !== 'true'
        && !e.dataset.k.endsWith(`:${project}|${id}`))[0];
      const nextKey = next.dataset.k.slice('wa-down:'.length);
      await app.tap(next);
      // The rows by identity (their move controls' keys, "<project>|<id>"), not by the id two projects may share.
      const rowBy = (k) => up(keyed(app, `wa-down:${k}`), (e) => e.tag === 'li');
      const earlier = rowBy(`${project}|${id}`);
      assert.ok(earlier && !has(earlier, 'moved'), `${where}: the earlier row's edge gone`);
      assert.equal(words(earlier).length, 0, `${where}: and its word with it`);
      const moved = movedRows(app);
      assert.equal(moved.length, 1, `${where}: one row moved after the next move`);
      assert.equal(moved[0], rowBy(nextKey), `${where}: the row moved last, ${nextKey}`);
      assert.equal(words(app.view).length, 1, `${where}: one word after the next move`);
      assert.equal(words(app.view)[0].parent.parent, linkOf(moved[0]), `${where}: on the newly moved row`);
    } finally {
      app.restore();
    }
  }
  // Set aside: a newer plan lands (recorded from elsewhere, made up, NOT a real record) while a draft holds a move.
  const [, open] = G8B_OPENS.find(([n]) => n === 'Plan, M3A moved, the ordering closed');
  const app = await open();
  try {
    assert.equal(words(app.view).length, 1, 'moved: the word drawn');
    const name = '2026-10-18T1805Z-01';
    app.repos[SD.name].commit({ [`docs/planning/${name}.md`]: planText(name, ['M3C', 'MD1', 'MD2', 'MD3', 'M3A', 'M3B']) });
    await app.advance(61_000);
    assert.match(app.text(), /A newer plan was recorded; your draft was set aside/);
    assert.equal(movedRows(app).length, 0, 'set aside: no edge');
    assert.equal(words(app.view).length, 0, 'set aside: no word');
  } finally {
    app.restore();
  }
});
