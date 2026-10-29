// ac-test: S-001/AC91 — G3 of "After the glance audit": gate titles, part (h) (specs/S-001.md, AC91 (h) "One short title
// for every gate"), with AC80's, AC85's and AC86's changed parts (their notes "After the glance audit" / "Changed after the
// glance audit": "a gate card's short title"; "a gate's sheet is titled with its short title, "The <Phase> gate, case <n> ·
// <item>", from the card's own record, and opens with the whole first line of the card's section 1 in `--t-lead`"; "a gate
// row's title is the gate's short title, so two gates read apart") and AC89 (j)'s ("cut at two lines only where it doesn't
// fit; the three-line cut still applies to the board's other card titles").
// ac-test: S-001/AC80 ac-test: S-001/AC85 ac-test: S-001/AC86 ac-test: S-001/AC89
//
// The page is the sandbox's own code under the fake DOM, on G3's fixture state `gates` (tests/desk/glance-fixtures.mjs:
// `mix`, with two made-up Launch-gate cards in the made-up project, each labelled NOT real in tests/desk/fixtures/README.md;
// the made-up project's own Build-gate card has no case line). The suite has no browser, so each cut and type role is the
// cascade of the page's own stylesheets over what it drew (tests/desk/css-cascade.mjs), in light and in dark, at 360 and
// 414 px, and the browser's measure of a cut is given to the page as AC85's tests give it; the stage's pull request carries
// the Chromium captures (tests/desk/tools/glance-shots.mjs, `g3-`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { SHEET_WORDS, gateTitle, gateOpening } from '../../src/lib/sheets.js';
import { GATE_TITLE } from '../../src/lib/j11.js';
import { gatesState, deviceMarks, GATE4, GATE5, GATE_KEY, CARD, MIX_PROJECT, NOW } from './glance-fixtures.mjs';

const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const THEMES = ['light', 'dark'];
const WIDTHS = [360, 414];
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');

/** Each drawn element's cascaded look in a theme and at a width: el → { size, weight, decl(prop) }. */
function looks(app, theme, width = 360) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) {
    if (!n.el) continue;
    out.set(n.el, { size: plain(n.style.get('font-size')), weight: plain(n.style.get('font-weight')), decl: (p) => plain(n.declared.get(p)) });
  }
  return out;
}

const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const sheet = (app) => byClass(app.view, 'v2-sheet')[0] || null;
const route = (id) => `#/waiting/card/${encodeURIComponent(id)}`;
const A = (path) => GATE_KEY(MIX_PROJECT, path);
const G2 = CARD.gate(MIX_PROJECT); // the made-up project's own Build-gate card, P-002: no case line
const G4 = A(GATE4);
const G5 = A(GATE5);
const QN = CARD.question(MIX_PROJECT);
const planRow = (app, id) => findAll(app.view, (e) => e.attrs && e.attrs['data-gate'] === id)[0] || null;
const planName = (app, id) => byClass(planRow(app, id), 'v2-plname')[0];
const sheetTitle = (app) => byClass(sheet(app), 'v2-stitle')[0].textContent;
const FIRST = 'The Launch gate: the launch review passed. The case for going live and graduating the product, with its own monitoring and feedback confirmed running, is in the gate document. Proceed, hold, recycle or kill?';

async function open(opts = {}, hash = '#/waiting') {
  const app = await loadSandbox({ ...gatesState(opts), hash, now: NOW, store: memStore() });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}
/** The browser's measure of a clip (the fake DOM lays out no text): its content `lines` lines of `line` px, held to `max`. */
function measure(el, lines, line, max) {
  el.clientHeight = Math.round(Math.min(max, lines) * line);
  el.scrollHeight = Math.round(lines * line);
}

// ---------------------------------------------------------------------------
// (h) One short title for every gate

test('AC91 (h): the short title is the gate card\'s own record — its section 1\'s second line without its full stop, " · ", its `item:` ("The Launch gate, case 1 · P-004"); a card without that line, "<the gate\'s title> · <item>" ("The Build gate · P-002"); the same words on the board, as its sheet\'s title and on Plan\'s gate row; never the frames\' "ready to go live?"', async () => {
  const want = new Map([[G2, 'The Build gate · P-002'], [G4, 'The Launch gate, case 1 · P-004'], [G5, 'The Launch gate, case 2 · P-005']]);
  const app = await open();
  try {
    for (const [id, title] of want) {
      assert.equal(keyed(app, `tt:${id}`).textContent, title, `${id}: on the board`);
      assert.equal(keyed(app, `cardlink:${id}`).attrs.href, route(id), `${id}: a tap opens its sheet`);
    }
    for (const [id, title] of want) {
      await app.go(route(id));
      assert.equal(sheetTitle(app), title, `${id}: its sheet's title`);
      assert.equal(sheet(app).attrs['aria-label'], title, `${id}: the sheet named by it`);
      // The head line keeps AC85's parts: the project, "gate", the item and the wait.
      assert.match(byClass(sheet(app), 'v2-mono')[0].textContent, new RegExp(`^${MIX_PROJECT} · gate · ${title.split(' · ')[1]} · waiting `), `${id}: its head`);
    }
    await app.go('#/work');
    for (const [id, title] of want) {
      assert.equal(planName(app, id).textContent, title, `${id}: Plan's gate row`);
      assert.equal(byClass(planRow(app, id), 'v2-plm')[0].textContent, `${/Build/.test(title) ? 'Build' : 'Launch'} gate · waits on you`, `${id}: its row's line, as built`);
    }
    for (const hash of ['#/waiting', '#/work', route(G4)]) {
      await app.go(hash);
      assert.ok(!app.text().includes('ready to go live?'), `${hash}: no word the record doesn't hold`);
    }
  } finally {
    app.restore();
  }
  // The rule itself, pure: the card's own words, never reworded.
  for (const [gate, own] of Object.entries(GATE_TITLE)) {
    assert.equal(gateTitle({ gate, item: 'P-009', parsed: { text: `item: P-009   kind: project\n\n## 1. The decision\nA question?\n${own}, case 3.\n` } }), `${own}, case 3 · P-009`, `${gate}: its case line`);
    assert.equal(gateTitle({ gate, item: 'P-009', parsed: { text: `item: P-009   kind: project\n\n## 1. The decision\nA question?\n` } }), `${own} · P-009`, `${gate}: no case line`);
  }
  assert.equal(gateTitle({ gate: 'launch', item: 'P-009', parsed: { text: 'item: P-009\n\n## 1. The decision\nA question?\nYou rule on the gate.\n' } }), 'The Launch gate · P-009',
    'a second line that names no gate and case is no case line');
  assert.equal(gateTitle({ gate: 'launch', item: 'P-009', parsed: { text: 'item: P-009\n\n## 1. The decision\nA question?\nThe Build gate, case 1.\n' } }), 'The Launch gate · P-009',
    'a line naming another gate is not this card\'s case line');
  assert.equal(gateTitle({ gate: 'launch', item: 'P-001', parsed: { text: 'item: P-009\n\n## 1. The decision\nA question?\n' } }), 'The Launch gate · P-009', 'the card\'s own `item:` over its path\'s');
});

test('AC91 (h): a card without its case line — the made-up Launch cards written without it read "The Launch gate · <item>" on the board, in the sheet and on Plan, told apart by their items; their sheets still open with section 1\'s whole first line', async () => {
  const app = await open({ caseLines: false });
  try {
    assert.equal(keyed(app, `tt:${G4}`).textContent, 'The Launch gate · P-004');
    assert.equal(keyed(app, `tt:${G5}`).textContent, 'The Launch gate · P-005');
    await app.go(route(G5));
    assert.equal(sheetTitle(app), 'The Launch gate · P-005');
    assert.equal(keyed(app, `clip:gopen:${G5}`).textContent, FIRST);
    await app.go('#/work');
    assert.deepEqual([G4, G5].map((id) => planName(app, id).textContent), ['The Launch gate · P-004', 'The Launch gate · P-005']);
  } finally {
    app.restore();
  }
});

test('AC91 (h): two gate cards at one gate are told apart on the board and on Plan, by their case or their item, though their first lines are the same word for word (M3D\'s follow-up, step 6a\'s Design reviewer, round 2, N1)', async () => {
  for (const caseLines of [true, false]) {
    const app = await open({ caseLines });
    try {
      const files = gatesState({ caseLines }).repos[MIX_PROJECT].files;
      const firsts = [GATE4, GATE5].map((p) => gateOpening({ gate: 'launch', parsed: { text: files[p] } }));
      assert.equal(firsts[0], firsts[1], 'their first lines are the same');
      const board = [G4, G5].map((id) => keyed(app, `tt:${id}`).textContent);
      assert.notEqual(board[0], board[1], `caseLines ${caseLines}: apart on the board`);
      await app.go('#/work');
      const plan = [G4, G5].map((id) => planName(app, id).textContent);
      assert.notEqual(plan[0], plan[1], `caseLines ${caseLines}: apart on Plan`);
      assert.deepEqual(plan, board, 'the same words in both places');
      for (const t of plan) assert.ok(!t.includes(firsts[0]), 'neither title is the first line');
    } finally {
      app.restore();
    }
  }
});

test('AC91 (h): the sheet\'s opening is the card\'s section 1\'s whole first line, under the title, in --t-lead; three lines at most, faded at the cut, "Read it all" showing the whole in place, kept open through a refresh; three lines or fewer, shown whole with no control; "The case opens", "Their views" and the four choices follow as AC85 has them', async () => {
  const app = await open();
  try {
    await app.go(route(G4));
    const sh = sheet(app);
    const lead = keyed(app, `clip:gopen:${G4}`);
    assert.equal(lead.textContent, FIRST, 'the whole first line, word for word');
    assert.match(lead.className, /\bv2-lead\b/);
    const order = findAll(sh, (e) => e === byClass(sh, 'v2-stitle')[0] || e === lead || (e.className || '').split(' ').includes('v2-bh'));
    assert.deepEqual(order.map((e) => (e === lead ? 'opening' : e.textContent)), ['The Launch gate, case 1 · P-004', 'opening', 'The case opens', 'Their views'], 'under the title, then AC85\'s parts');
    assert.deepEqual(byClass(sh, 'v2-opt').map((o) => byClass(o, 'v2-ol')[0].textContent), ['Proceed', 'Hold', 'Recycle', 'Kill']);
    // Three lines or fewer: whole, no fade, no control.
    measure(lead, 3, 21.75, 3);
    await app.resize(360);
    assert.doesNotMatch(keyed(app, `clip:gopen:${G4}`).className, /\bover\b/);
    assert.equal(keyed(app, `clipbtn:gopen:${G4}`), null);
    // Past three: faded at the cut, "Read it all" opening the whole in place.
    measure(keyed(app, `clip:gopen:${G4}`), 5, 21.75, 3);
    await app.resize(360);
    assert.match(keyed(app, `clip:gopen:${G4}`).className, /\bover\b/, 'faded at the cut');
    const more = keyed(app, `clipbtn:gopen:${G4}`);
    assert.equal(more.textContent, SHEET_WORDS.readAll);
    await app.tap(more);
    assert.match(keyed(app, `clip:gopen:${G4}`).className, /\bopen\b/, 'the whole, in place');
    assert.equal(keyed(app, `clip:gopen:${G4}`).textContent, FIRST);
    await app.advance(POLL_MS);
    assert.match(keyed(app, `clip:gopen:${G4}`).className, /\bopen\b/, 'kept open through a refresh (AC56)');
    assert.equal(keyed(app, `clipbtn:gopen:${G4}`).textContent, SHEET_WORDS.readLess);
    // The card without a case line opens with its own first line too.
    await app.go(route(G2));
    assert.equal(keyed(app, `clip:gopen:${G2}`).textContent, 'The plan passed review. Pass the Build gate, hold, recycle or kill?');
  } finally {
    app.restore();
  }
  assert.equal(gateOpening({ gate: 'launch', parsed: { text: '## 1. The decision\n\n## 2. Why it\'s yours\n' } }), 'not recorded', 'a section 1 with no line: "not recorded"');
  assert.equal(gateOpening({ gate: 'launch', parsed: null }), null, 'a card not read yet: none');
});

test('AC91 (h) with AC89 (j): the gate\'s short title is cut at two lines only where it doesn\'t fit — on its card (the board\'s other titles keep three; from QW1 a question\'s, in the section, three of --t-row), as its sheet\'s title in --t-sheet and on Plan\'s gate row, its item never split; the opening in --t-lead at three; in light and dark, at 360 and 414 px', async () => {
  const app = await open();
  try {
    // The board: the gate cards' titles at two lines, a question's at three.
    for (const theme of THEMES) {
      for (const w of WIDTHS) {
        const L = looks(app, theme, w);
        for (const id of [G2, G4, G5]) assert.equal(L.get(keyed(app, `tt:${id}`)).decl('max-height'), 'calc(2 * 1.33em)', `${theme}, ${w} px, ${id}`);
        // Rewritten in QW1 (AC94: a section question's title "in `--t-row`, cut at three lines with the fade"): the question is
        // in the "Questions for you" section, its title in --t-row (13 px / 1.35), so its three lines are three of that line height.
        assert.equal(L.get(keyed(app, `tt:${QN}`)).decl('max-height'), 'calc(3 * 1.35em)', `${theme}, ${w} px: a question's title keeps three`);
        assert.ok(findAll(keyed(app, 'qsec'), (e) => e.dataset && e.dataset.k === `tt:${QN}`).length, 'the question in the section');
        assert.equal(L.get(keyed(app, `tt:${G4}`)).decl('overflow'), 'clip');
        // The item ending the title an inline block, moving to the next line as one piece, so a wrap never splits "P-004"
        // at its hyphen (never `nowrap`, AC42); the words unchanged.
        const item = byClass(keyed(app, `tt:${G4}`), 'v2-gitem')[0];
        assert.equal(item.textContent, 'P-004');
        assert.equal(L.get(item).decl('display'), 'inline-block', `${theme}, ${w} px: the item unbroken`);
      }
    }
    // Two lines fit: no fade; past two, faded, the whole in its sheet.
    measure(keyed(app, `tt:${G4}`), 2, 16, 2);
    await app.resize(360);
    assert.doesNotMatch(keyed(app, `tt:${G4}`).className, /\bover\b/);
    measure(keyed(app, `tt:${G4}`), 3, 16, 2);
    await app.resize(360);
    assert.match(keyed(app, `tt:${G4}`).className, /\bover\b/);
    // The sheet: its title at two lines; its opening in --t-lead at three.
    // Rewritten in HD1 (forced: AC98 draws a sheet's title at 600 20 px, the owner's, no longer --t-sheet's 18 px; the two-line
    // clip, calc(2 * 1.3em), still holds two lines; tests/desk/ac91-glance-gates.test.mjs:224).
    await app.go(route(G4));
    for (const theme of THEMES) {
      for (const w of WIDTHS) {
        const L = looks(app, theme, w);
        const h2 = byClass(sheet(app), 'v2-stitle')[0];
        assert.deepEqual([L.get(h2).size, L.get(h2).weight], ['20px', '600'], `${theme}, ${w} px: the title 600 20 px (AC98)`);
        assert.equal(L.get(keyed(app, `clip:stitle:${G4}`)).decl('max-height'), 'calc(2 * 1.3em)', `${theme}, ${w} px: the title held to two lines`);
        const lead = L.get(keyed(app, `clip:gopen:${G4}`));
        assert.deepEqual([lead.size, lead.weight], ['15px', '400'], `${theme}, ${w} px: the opening in --t-lead`);
        assert.equal(lead.decl('max-height'), 'calc(3 * 1.45em)', `${theme}, ${w} px: three lines at most`);
        const item = byClass(keyed(app, `clip:stitle:${G4}`), 'v2-gitem')[0];
        assert.deepEqual([item.textContent, L.get(item).decl('display')], ['P-004', 'inline-block'], `${theme}, ${w} px: the sheet title's item unbroken`);
      }
    }
    // Plan: the gate row's title at two lines.
    await app.go('#/work');
    for (const theme of THEMES) {
      for (const w of WIDTHS) {
        const L = looks(app, theme, w);
        for (const id of [G2, G4, G5]) {
          assert.equal(L.get(planName(app, id)).decl('max-height'), 'calc(2 * 1.35em)', `${theme}, ${w} px, ${id}: Plan`);
          assert.equal(L.get(byClass(planName(app, id), 'v2-gitem')[0]).decl('display'), 'inline-block', `${theme}, ${w} px, ${id}: its item unbroken`);
        }
      }
    }
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// (h), from G4 (G3's reviews: the Reviewer's notes 2 and 3, the Design reviewer's N4)

test('AC91 (h), from G4: a gate card not read yet (its file listed, its read still to come) — its title "<the gate\'s title> · <item>" from its path\'s item on the board, as its sheet\'s title and on Plan; its sheet says "The card\'s file: not available" in --t-small --ink2 in place of the opening', async () => {
  // `gates`, with the made-up P-004 card's blob answering null (tests/desk/fake-desk.mjs's `blobNull`): listed, not read.
  const s = gatesState();
  s.repos[MIX_PROJECT].blobNull = [GATE4];
  const app = await loadSandbox({ ...s, hash: '#/waiting', now: NOW, store: memStore() });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    assert.equal(keyed(app, `tt:${G4}`).textContent, 'The Launch gate · P-004', 'on the board: no case it has not read');
    assert.equal(keyed(app, `tt:${G5}`).textContent, 'The Launch gate, case 2 · P-005', 'the card read beside it keeps its case');
    await app.go(route(G4));
    assert.equal(sheetTitle(app), 'The Launch gate · P-004', 'as its sheet\'s title');
    const unread = keyed(app, 'gopen-reading');
    assert.equal(unread.textContent, "The card's file: not available", 'an unknown said in words (part A item 5)');
    assert.equal(keyed(app, `clip:gopen:${G4}`), null, 'no opening drawn for a card not read');
    const parts = sheet(app).children.map((c) => c.attrs && c.attrs['data-k']);
    assert.ok(parts.indexOf('gopen-reading') > -1, 'in the opening\'s place');
    assert.ok(byClass(sheet(app), 'v2-stitle')[0].textContent === 'The Launch gate · P-004');
    for (const theme of THEMES) {
      const L = looks(app, theme).get(unread);
      assert.deepEqual([L.size, L.weight], ['12px', '400'], `${theme}: --t-small`);
      assert.equal(L.decl('color'), theme === 'light' ? '#5c5f66' : '#a2a5ac', `${theme}: --ink2`);
    }
    await app.go('#/work');
    assert.equal(planName(app, G4).textContent, 'The Launch gate · P-004', 'on Plan');
  } finally {
    app.restore();
  }
  // Once read, the case line comes back and the opening takes the line's place (G3, as built).
  const read = await open();
  try {
    await read.go(route(G4));
    assert.equal(sheetTitle(read), 'The Launch gate, case 1 · P-004');
    assert.equal(keyed(read, 'gopen-reading'), null);
    assert.equal(keyed(read, `clip:gopen:${G4}`).textContent, FIRST);
  } finally {
    read.restore();
  }
});

test('AC91 (h), from G4: a gate card\'s Done row keeps its item whole (`.v2-gitem`, an inline block) — on the card while it is confirmed with GitHub and on the confirmed row — its words and its link\'s name unchanged; another kind\'s row has none; in light and dark, at 360 and 414 px', async () => {
  // Done marks a device keeps (made up, NOT real): the made-up P-004 gate card marked a minute ago, still confirming; a
  // made-up P-009 gate card GitHub confirmed two hours ago; and the made-up project's pull request, confirming.
  const P9 = GATE_KEY(MIX_PROJECT, 'queue/P-009-launch-1.md');
  const seed = deviceMarks([
    { project: MIX_PROJECT, kind: 'gate', id: G4, at: NOW - 60e3 },
    { project: MIX_PROJECT, kind: 'gate', id: P9, title: 'The Launch gate, case 1 · P-009', at: NOW - 3 * 3600e3, confirmedAt: NOW - 2 * 3600e3 },
    { project: MIX_PROJECT, kind: 'pr', at: NOW - 60e3 },
  ]);
  const store = memStore();
  for (const [k, v] of Object.entries(seed)) store.setItem(k, v);
  const app = await loadSandbox({ ...gatesState(), hash: '#/waiting', now: NOW, store });
  try {
    await app.advance(1000);
    const conf = keyed(app, `donelink:${G4}`);
    assert.equal(conf.textContent, 'The Launch gate, case 1 · P-004', 'the confirming card: the short title, its words unchanged');
    assert.equal(conf.parent.className, 'v2-card conf');
    const row = keyed(app, `drowlink:${P9}#`);
    assert.equal(row.textContent, 'The Launch gate, case 1 · P-009', 'the confirmed row');
    assert.equal(row.parent.className, 'v2-drow');
    for (const [link, item] of [[conf, 'P-004'], [row, 'P-009']]) {
      const g = byClass(link, 'v2-gitem');
      assert.deepEqual(g.map((x) => x.textContent), [item], 'the item, after the title\'s last " · ", one piece');
      assert.equal(link.children[0].text || link.children[0].textContent, `${link.textContent.slice(0, -item.length)}`, 'the words before it as they were');
    }
    const pr = keyed(app, `donelink:${CARD.pr(MIX_PROJECT)}`);
    assert.equal(byClass(pr, 'v2-gitem').length, 0, 'a pull request\'s row: its title as it is');
    for (const theme of THEMES) {
      for (const w of WIDTHS) {
        const L = looks(app, theme, w);
        for (const link of [conf, row]) assert.equal(L.get(byClass(link, 'v2-gitem')[0]).decl('display'), 'inline-block', `${theme}, ${w} px: kept whole`);
      }
    }
  } finally {
    app.restore();
  }
});
