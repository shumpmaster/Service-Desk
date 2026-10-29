// ac-test: S-001/AC25 — the weekly offer on the desk (stage VT3 of "The desk's value targets shown: M3B"; AC25's third part
// as changed for M3B; AC82 changed): Home's line at its foot, between the portfolio's block and "More detail", a plain row in
// --t-body with a chevron, no soft box and no icon, never counted, never notified, never coral, at 360 and 414 px, only from
// Monday 00:00 in `ownerTimeZone`; its tap opening Service-Desk's page with the targets' sheet over it, scrolled to "Your
// weekly figures", the sheet's last block, after the stop rule; the weeks newest first, those before launch together under
// one "Before launch: a trial, not counted" line, each "Save the week of <its Monday> ↗" a link in J3's form to the
// portfolio repository with the week's file in J5's form (J5's own made-up example, character for character), AC17's Copy
// past `linkCap`; the offer gone once the portfolio's tree holds this device's files and back if one is deleted while the
// notes are kept; one file a device; and storage throwing: neither the line nor the block, nothing else broken.
// join-test: S-001/J5 — the weekly file from the page: its path, its body and its repository.
// The page is the sandbox's own code under the fake DOM, on Service-Desk's records (real) with made-up launch days, cards,
// notes and portfolio files (NOT real: tests/desk/vt3-fixtures.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { byClass, findAll, El0 } from './sandbox-helpers.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { PORTFOLIO_POLL_MS } from '../../src/lib/scheduler.js';
import { WEEKLY_WORDS } from '../../src/lib/weekly.js';
import {
  vt3State, vt3Open, storeWith, notesOf, J5_WEEK, J5_FILE, MON16, MONDAY, EIGHT, weeksOfWindows, memStore, keyed, weeklyLine, weeklyBlock, sheetOf,
  saveLinks, landed, chi, MIN, H, z,
} from './vt3-fixtures.mjs';
import { ALPHA_TARGETS } from './vt1-fixtures.mjs';
import { CONFIG } from './helpers.mjs';

const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const plain = (v) => String(v || '').replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');
const cascaded = (app, scheme = 'light', width = 360) => nodes(cascade(treeOf(app.view, { className: document.documentElement.className, attrs: {} }), RULES, { scheme, width, reducedMotion: false }));
const homeKeys = (app) => byClass(app.view, 'v2-home')[0].children.map((c) => c.dataset.k || c.className.split(' ')[0]);
const PF_POLL = typeof PORTFOLIO_POLL_MS === 'number' ? PORTFOLIO_POLL_MS : 5 * MIN;
const j5Store = () => storeWith(notesOf({ ...J5_WEEK }));

test('AC25 + J5 on the page: the week\'s file from its link, character for character J5\'s form (J5\'s own made-up example), at `metrics/service-desk/2026-W46-d3fa2.md` in the portfolio repository, J3\'s form against its default branch; its V5 line from the week\'s cards', async () => {
  const app = await vt3Open(vt3State(), { store: j5Store() });
  try {
    await app.go('#/p/Service-Desk/values/weekly');
    const [l, ...more] = saveLinks(app);
    assert.equal(more.length, 0, 'one week');
    assert.equal(l.text, 'Save the week of 9 Nov ↗');
    assert.equal(l.href, `https://github.com/shumpmaster/portfolio/new/main?filename=${encodeURIComponent('metrics/service-desk/2026-W46-d3fa2.md')}&value=${encodeURIComponent(J5_FILE)}`);
    assert.equal(l.content, J5_FILE);
    assert.equal(l.el.attrs.target, '_blank');
  } finally {
    app.restore();
  }
});

test('AC25 + AC82 (changed): Home\'s line between the portfolio\'s block and "More detail" — "Last week\'s desk figures are ready to save" with a chevron, a plain row (no soft box, no icon), --t-body --ink at 360 and 414 px, never --you; nothing counted, notified or called for it', async () => {
  const st = vt3State();
  const plainApp = await vt3Open(st);
  let without;
  try {
    assert.equal(weeklyLine(plainApp), null, 'no notes: no line');
    without = { keys: homeKeys(plainApp), brief: byClass(plainApp.view, 'v2-brief')[0].textContent, title: document.title, calls: plainApp.server.calls.length };
    await plainApp.go('#/waiting');
    without.badge = (byClass(plainApp.view, 'v2-badge')[0] || { textContent: '' }).textContent;
  } finally {
    plainApp.restore();
  }
  const app = await vt3Open(vt3State(), { store: j5Store() });
  try {
    const keys = homeKeys(app);
    assert.deepEqual(keys.slice(-4), ['hgroups', 'portfolio', 'home-weekly', 'home-more-detail'], 'between the portfolio\'s block and "More detail"');
    assert.deepEqual(keys.filter((k) => k !== 'home-weekly'), without.keys, 'nothing else on Home moves');
    const line = weeklyLine(app);
    assert.equal(line.tag, 'a');
    assert.equal(line.className, 'v2-wkline', 'a plain row: no soft box');
    assert.equal(line.textContent, "Last week's desk figures are ready to save");
    assert.equal(line.children.length, 2);
    assert.equal(line.children[1].tag, 'svg', 'its chevron');
    assert.match(line.children[1].attrs.class, /\bv2-k\b/);
    assert.equal(findAll(line, (e) => e.tag === 'svg').length, 1, 'no icon of its own');
    assert.equal(byClass(app.view, 'v2-brief')[0].textContent, without.brief, 'the briefing: nothing counted for it');
    assert.equal(document.title, without.title);
    assert.equal(app.server.calls.length, without.calls, 'no call added');
    for (const width of [360, 414]) {
      for (const scheme of ['light', 'dark']) {
        const n = cascaded(app, scheme, width).find((x) => x.el === line);
        assert.equal(plain(n.declared.get('font')), '400 13px/1.45 "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', '--t-body');
        assert.equal(plain(n.declared.get('color')), scheme === 'light' ? '#18191c' : '#ecedef', '--ink, never --you');
        assert.equal(n.declared.get('background') || null, null, 'no soft box');
        assert.equal(n.declared.get('white-space') || null, null, 'it wraps');
        assert.ok(parseFloat(plain(n.declared.get('min-height'))) >= 44, 'a row\'s height');
      }
    }
    await app.go('#/waiting');
    assert.equal((byClass(app.view, 'v2-badge')[0] || { textContent: '' }).textContent, without.badge, 'the badge: the line is never counted');
  } finally {
    app.restore();
  }
});

test('AC25: Home\'s line only from Monday 00:00 in Chicago (ownerTimeZone): at Sunday 23:59 the week is still running and nothing is offered; past midnight, the week just ended is', async () => {
  const sunday = MONDAY('2026-11-16') - 2 * MIN; // Sun 15 Nov, 23:58 in Chicago
  const app = await vt3Open(vt3State(), { store: j5Store(), now: sunday - 62_000 });
  try {
    assert.equal(weeklyLine(app), null, 'Sunday 23:58: the week of 9 Nov still running');
    await app.advance(61_000);
    assert.equal(weeklyLine(app), null, 'Sunday 23:59');
    await app.advance(2 * 61_000);
    assert.ok(app.now >= MONDAY('2026-11-16'));
    assert.equal(weeklyLine(app).textContent, "Last week's desk figures are ready to save", 'Monday 00:00: offered');
  } finally {
    app.restore();
  }
});

test('AC25: a tap on Home\'s line opens Service-Desk\'s page with the targets\' sheet over it, scrolled to "Your weekly figures", the sheet\'s last block, after the stop rule; closed, Service-Desk\'s page', async () => {
  const app = await vt3Open(vt3State(), { store: j5Store() });
  const real = El0.prototype.getBoundingClientRect;
  // The fake DOM lays nothing out: the block 900 px down the sheet.
  El0.prototype.getBoundingClientRect = function rect() { return { top: this.dataset && this.dataset.k === 'vt-weekly' ? 900 : 100, height: 10 }; };
  // The close takes the focus without scrolling the sheet back (a browser scrolls a focused control into view).
  const realFocus = El0.prototype.focus;
  const focused = [];
  El0.prototype.focus = function focus(opt) { focused.push([this.dataset && this.dataset.k, opt || null]); return realFocus.call(this, opt); };
  try {
    const line = weeklyLine(app);
    assert.equal(line.attrs.href, '#/p/Service-Desk/values/weekly');
    await app.tap(line);
    await app.go(line.attrs.href);
    assert.ok(byClass(app.view, 'v2-proj')[0], 'Service-Desk\'s page');
    assert.match(byClass(app.view, 'v2-proj')[0].textContent, /Service-Desk/);
    const sh = sheetOf(app);
    assert.ok(sh, 'the targets\' sheet over it');
    const parts = sh.children.filter((c) => !/\bv2-grab\b/.test(c.className || ''));
    const blk = weeklyBlock(app);
    assert.equal(parts.at(-1), blk, 'the sheet\'s last block');
    assert.match(parts.at(-2).className, /\bv2-vstop\b/, 'after the stop rule');
    assert.equal(blk.children[0].textContent, 'Your weekly figures');
    assert.equal(blk.children.at(-1).textContent, 'Notes are kept on this device for 8 weeks, then dropped.');
    assert.equal(sh.scrollTop, 900 - 100 - 12, 'scrolled so the block is at the sheet\'s top');
    assert.deepEqual(focused.filter(([k]) => k === 'sheet-close').at(-1), ['sheet-close', { preventScroll: true }], 'its close focused without scrolling');
    // Closed: Service-Desk's page.
    await app.key('Escape');
    assert.equal(app.loc.hash, '#/p/Service-Desk');
    assert.equal(sheetOf(app), null);
    // Its sheet opened from the page's own row shows the block too, unscrolled.
    await app.go('#/p/Service-Desk/values');
    assert.ok(weeklyBlock(app));
    assert.equal(sheetOf(app).scrollTop, 0);
  } finally {
    El0.prototype.getBoundingClientRect = real;
    El0.prototype.focus = realFocus;
    app.restore();
  }
});

test('AC25: the weeks newest first, those after launch first, then those before launch together under one "Before launch: a trial, not counted" line; "<k> weeks of …"; each its own file; AC17\'s Copy past `linkCap`, the file to copy character for character', async () => {
  const st = vt3State({ launch: '2026-11-04', linkCap: 200 });
  const app = await vt3Open(st, { store: storeWith(notesOf({ from: '2026-09-21', windows: weeksOfWindows(EIGHT) })) });
  try {
    assert.equal(weeklyLine(app).textContent, '8 weeks of desk figures are ready to save');
    await app.tap(weeklyLine(app));
    await app.go(weeklyLine(app) ? weeklyLine(app).attrs.href : '#/p/Service-Desk/values/weekly');
    const blk = weeklyBlock(app);
    const runs = blk.children.map((c) => (c.tag === 'ul' ? `[${findAll(c, (e) => e.tag === 'a').map((a) => a.textContent.replace('Save the week of ', '').replace(' ↗', '')).join(', ')}]` : c.textContent));
    assert.deepEqual(runs, ['Your weekly figures', '[9 Nov, 2 Nov]', 'Before launch: a trial, not counted', '[26 Oct, 19 Oct, 12 Oct, 5 Oct, 28 Sep, 21 Sep]',
      'Notes are kept on this device for 8 weeks, then dropped.'], 'one trial line, the weeks newest first');
    const links = saveLinks(app);
    assert.equal(new Set(links.map((l) => l.file)).size, 8, 'each week its own file');
    assert.deepEqual(links.map((l) => l.file.slice(-17)), ['2026-W46-d3fa2.md', '2026-W45-d3fa2.md', '2026-W44-d3fa2.md', '2026-W43-d3fa2.md', '2026-W42-d3fa2.md',
      '2026-W41-d3fa2.md', '2026-W40-d3fa2.md', '2026-W39-d3fa2.md']);
    // Past `linkCap` (200 here): the file name only, and the week's file under it to copy, with the cause.
    for (const l of links) {
      assert.equal(l.content, null, 'the file name only');
      const li = l.el.parent;
      const pre = byClass(li, 'v2-pre')[0];
      assert.match(pre.textContent, /^Week: 2026-W\d\d \(the week of /);
      assert.equal(byClass(li, 'v2-small')[0].textContent, WEEKLY_WORDS.copyLength);
      assert.deepEqual(findAll(li, (e) => e.tag === 'button').map((b) => b.textContent), ['Copy the week']);
    }
    assert.match(byClass(links[2].el.parent, 'v2-pre')[0].textContent, /^Week: 2026-W44 \(the week of 26 Oct\)   Device: d3fa2\nBefore launch: a trial, not counted\n/);
    assert.doesNotMatch(byClass(links[0].el.parent, 'v2-pre')[0].textContent, /Before launch/);
  } finally {
    app.restore();
  }
  // Before launch (no reached date): every week under the trial line.
  const before = await vt3Open(vt3State({ launch: null }), { store: j5Store() });
  try {
    await before.go('#/p/Service-Desk/values/weekly');
    assert.deepEqual(weeklyBlock(before).children.map((c) => c.tag === 'ul' ? 'weeks' : c.textContent),
      ['Your weekly figures', 'Before launch: a trial, not counted', 'weeks', 'Notes are kept on this device for 8 weeks, then dropped.']);
    assert.match(saveLinks(before)[0].content, /^Week: 2026-W46 \(the week of 9 Nov\)   Device: d3fa2\nBefore launch: a trial, not counted\n/);
  } finally {
    before.restore();
  }
});

test('AC25: the offer by its one condition on the page — gone once the portfolio\'s tree holds this device\'s file for every offered week; back while the notes are kept when one is deleted ("A week of …" with last week saved and an older week deleted); another device\'s files end nothing here', async () => {
  const mondays = ['2026-11-02', '2026-11-09'];
  const files = { ...landed('metrics/service-desk/2026-W45-d3fa2.md'), ...landed('metrics/service-desk/2026-W46-d3fa2.md') };
  const st = vt3State({ pfMore: { ...landed('metrics/service-desk/2026-W45-d0001.md'), ...landed('metrics/service-desk/2026-W46-d0001.md') } });
  const app = await vt3Open(st, { store: storeWith(notesOf({ from: '2026-11-01', windows: weeksOfWindows(mondays) })) });
  try {
    assert.equal(weeklyLine(app).textContent, '2 weeks of desk figures are ready to save', 'another device\'s files end nothing here');
    st.pf.commit(files);
    await app.advance(PF_POLL + 61_000);
    assert.equal(weeklyLine(app), null, 'gone once the tree holds both');
    await app.go('#/p/Service-Desk/values');
    assert.equal(weeklyBlock(app), null, 'and the block');
    await app.go('#/');
    st.pf.commit({ 'metrics/service-desk/2026-W45-d3fa2.md': null });
    await app.advance(PF_POLL + 61_000);
    assert.equal(weeklyLine(app).textContent, 'A week of desk figures is ready to save', 'last week saved, the older week deleted: back');
    await app.go('#/p/Service-Desk/values/weekly');
    assert.deepEqual(saveLinks(app).map((l) => l.text), ['Save the week of 2 Nov ↗']);
    await app.go('#/');
    st.pf.commit({ 'metrics/service-desk/2026-W46-d3fa2.md': null, ...landed('metrics/service-desk/2026-W45-d3fa2.md') });
    await app.advance(PF_POLL + 61_000);
    assert.equal(weeklyLine(app).textContent, "Last week's desk figures are ready to save");
  } finally {
    app.restore();
  }
  // Past the notes' 8 weeks a deleted file is not offered again: the week's notes are gone (made up: 8 Jan 2027).
  const late = await vt3Open(vt3State(), { store: storeWith(notesOf({ from: '2026-11-01', windows: weeksOfWindows(mondays) })), now: chi('2027-01-11', '10:00') });
  try {
    assert.equal(weeklyLine(late), null, 'the weeks of 2 and 9 Nov dropped from the device after 8 weeks from their end');
  } finally {
    late.restore();
  }
});

test('AC25 + J5: storage throwing — neither Home\'s line nor the sheet\'s block, and nothing else broken; no `portfolio` in J7, nothing offered', async () => {
  const store = j5Store();
  store.throws = true;
  const app = await vt3Open(vt3State(), { store });
  try {
    assert.equal(weeklyLine(app), null);
    assert.deepEqual(homeKeys(app).slice(-3), ['hgroups', 'portfolio', 'home-more-detail'], 'Home as before');
    await app.go('#/p/Service-Desk/values/weekly');
    assert.ok(sheetOf(app), 'the targets\' sheet');
    assert.equal(weeklyBlock(app), null, 'no block');
    assert.ok(sheetOf(app).textContent.includes('Not noted on this device'));
    assert.ok(byClass(sheetOf(app), 'v2-vstop')[0], 'the sheet as before, its stop rule last');
  } finally {
    app.restore();
  }
  const none = await vt3Open(vt3State({ portfolio: false }), { store: j5Store() });
  try {
    assert.equal(weeklyLine(none), null, 'no portfolio repository: nowhere to save');
  } finally {
    none.restore();
  }
});

// ---------------------------------------------------------------------------
// VT3's round 2 (the Design reviewer's B1 and N1; the Reviewer's N2, N3 and N4, and the bugs B3, B8, B26 and B27 his plants
// left standing)

/**
 * The fake DOM lays nothing out: here the sheet's top is at 100 and the block `at` px down its content, moved up by the
 * sheet's own scroll, as a browser has it; `shift` px more once the stop rule's "Read it all" row is laid out late.
 */
function layout(lay) {
  const real = El0.prototype.getBoundingClientRect;
  El0.prototype.getBoundingClientRect = function rect() {
    if (this.dataset && this.dataset.k === 'vt-weekly') return { top: 100 + lay.at + lay.shift - ((this.parent && this.parent.scrollTop) || 0), height: 120 };
    return { top: 100, height: 600 };
  };
  return () => { El0.prototype.getBoundingClientRect = real; };
}

test('AC25 (VT3\'s design review, B1): the landing at "Your weekly figures" holds through what is laid out after it — the stop rule\'s row added at the next drawing, and layout that comes with no drawing (looked at again at 50, 250 and 1000 ms) — so the whole block shows, its last line included, at 360 and at 414 px; once the owner scrolls, it lets go', async () => {
  for (const width of [360, 414]) {
    const lay = { at: 900, shift: 0 };
    const restoreLayout = layout(lay);
    const app = await vt3Open(vt3State(), { store: j5Store() });
    try {
      await app.resize(width);
      await app.go(weeklyLine(app).attrs.href);
      const sh = sheetOf(app);
      assert.equal(sh.scrollTop, 900 - 12, `${width}: landed with the block at the sheet's top`);
      // The stop rule's "Read it all" row is laid out at the next drawing, 34 px over the block.
      lay.shift = 34;
      await app.advance(10);
      await app.visibility('visible'); // a drawing (the desk's onChange), the stop rule's row in it
      assert.equal(sheetOf(app).scrollTop, 934 - 12, `${width}: landed again under the row added late`);
      // Late layout with no drawing (a font): the looks at 50, 250 and 1000 ms land it again.
      lay.shift = 50;
      await app.advance(300);
      assert.equal(sheetOf(app).scrollTop, 950 - 12, `${width}: landed again at a later look`);
      // The owner scrolls: the landing lets go, at a look and at a drawing alike.
      sheetOf(app).scrollTop = 500;
      lay.shift = 80;
      await app.advance(1000);
      await app.visibility('visible');
      assert.equal(sheetOf(app).scrollTop, 500, `${width}: the owner's own scroll kept`);
    } finally {
      restoreLayout();
      app.restore();
    }
  }
});

test('AC25 (VT3\'s review, round 2, N6): the owner\'s own tap inside the sheet ends the landing\'s hold — "Read it all" on the stop rule opens the rule where it is, the sheet never re-landed under it, at a drawing or at a later look, a key\'s press of it too (round 3, N9); a tap outside the sheet is no such tap', async () => {
  const lay = { at: 900, shift: 0 };
  const restoreLayout = layout(lay);
  const app = await vt3Open(vt3State(), { store: j5Store() });
  try {
    await app.go(weeklyLine(app).attrs.href);
    assert.equal(sheetOf(app).scrollTop, 888, 'landed');
    // The stop rule measured past three lines (the fake DOM lays out no text): its "Read it all" drawn, the landing held.
    const clip = keyed(app, 'clip:vt-stop:Service-Desk');
    clip.clientHeight = 57;
    clip.scrollHeight = 95;
    await app.resize(360);
    assert.equal(sheetOf(app).scrollTop, 888, 'still landed');
    // "Read it all" on the stop rule: the rule opens, 120 px taller, pushing the block down; the sheet stays where it was.
    const more = keyed(app, 'clipbtn:vt-stop:Service-Desk');
    assert.ok(more, 'the stop rule\'s "Read it all"');
    lay.shift = 120;
    await app.tap(more);
    await app.visibility('visible'); // a drawing
    await app.advance(1200); // and the later looks
    assert.equal(sheetOf(app).scrollTop, 888, 'never re-landed after the owner\'s own tap');
  } finally {
    restoreLayout();
    app.restore();
  }
  // VT3's review, round 3, N9: a key's press of "Read it all" (Enter or Space: a click with no press before it) ends the hold
  // too, before the button's own handler redraws.
  const lay3 = { at: 900, shift: 0 };
  const restore3 = layout(lay3);
  const k = await vt3Open(vt3State(), { store: j5Store() });
  try {
    await k.go(weeklyLine(k).attrs.href);
    const clip = keyed(k, 'clip:vt-stop:Service-Desk');
    clip.clientHeight = 57;
    clip.scrollHeight = 95;
    await k.resize(360);
    assert.equal(sheetOf(k).scrollTop, 888, 'landed');
    lay3.shift = 120;
    await k.press(keyed(k, 'clipbtn:vt-stop:Service-Desk'));
    assert.equal(sheetOf(k).scrollTop, 888, 'the button\'s own drawing: never re-landed');
    await k.visibility('visible');
    await k.advance(1200);
    assert.equal(sheetOf(k).scrollTop, 888, 'nor at a later drawing or look');
  } finally {
    restore3();
    k.restore();
  }
  // A tap on Home's own screen under the sheet (outside it) leaves the hold: the late row still re-lands it.
  const lay2 = { at: 900, shift: 0 };
  const restore2 = layout(lay2);
  const b = await vt3Open(vt3State(), { store: j5Store() });
  try {
    await b.go(weeklyLine(b).attrs.href);
    await b.tapOutside(byClass(b.view, 'v2-proj')[0]);
    lay2.shift = 34;
    await b.visibility('visible');
    assert.equal(sheetOf(b).scrollTop, 922, 'still held');
  } finally {
    restore2();
    b.restore();
  }
});

test('AC25 (VT3\'s design review, N1): Home\'s line\'s chevron in --ink2, as "More detail"\'s and the portfolio rows\' are, its words --ink', async () => {
  const app = await vt3Open(vt3State(), { store: j5Store() });
  try {
    const line = weeklyLine(app);
    for (const scheme of ['light', 'dark']) {
      const n = cascaded(app, scheme);
      const chev = n.find((x) => x.el === line.children[1]);
      assert.equal(plain(chev.style.get('color') || chev.declared.get('color')), scheme === 'light' ? '#5c5f66' : '#a2a5ac');
      assert.equal(plain(n.find((x) => x.el === line).declared.get('color')), scheme === 'light' ? '#18191c' : '#ecedef');
    }
  } finally {
    app.restore();
  }
});

test('AC25 (VT3\'s review, N2): nothing offered — neither Home\'s line nor the block — until every v3 project\'s records the V5 line needs are read, the dispatch log included; then offered, its V5 line a figure', async () => {
  // A v3 project not read (Alpha, made up, its every read failing).
  const st = vt3State({ alpha: ALPHA_TARGETS });
  st.repos.Alpha.fail = { kind: 'network' };
  const app = await vt3Open(st, { store: j5Store() });
  try {
    assert.equal(weeklyLine(app), null, 'Alpha not read: no line');
    await app.go('#/p/Service-Desk/values/weekly');
    assert.ok(sheetOf(app));
    assert.equal(weeklyBlock(app), null, 'and no block');
    await app.go('#/');
    st.repos.Alpha.fail = null;
    await app.advance(3 * 61_000);
    assert.equal(weeklyLine(app).textContent, "Last week's desk figures are ready to save", 'read: offered');
    await app.go('#/p/Service-Desk/values/weekly');
    assert.match(saveLinks(app)[0].content, /\nV5 median \(weekday cards\): 2h 10m over 7 cards\n/);
  } finally {
    app.restore();
  }
  // The dispatch log not loaded while the project's read stands (the log's blob still to come in a later blob call, which
  // the fake desk never splits: the model the desk builds is given `logLoaded: false` here).
  const b = await vt3Open(vt3State(), { store: j5Store() });
  try {
    assert.equal(weeklyLine(b).textContent, "Last week's desk figures are ready to save");
    const real = b.desk.model;
    b.desk.model = (name) => (name === 'Service-Desk' ? { ...real(name), logLoaded: false } : real(name));
    await b.visibility('visible'); // a drawing
    assert.equal(weeklyLine(b), null, 'the dispatch log not loaded: no line');
    await b.go('#/p/Service-Desk/values/weekly');
    assert.equal(weeklyBlock(b), null, 'and no block');
    b.desk.model = real;
    await b.go('#/');
    assert.equal(weeklyLine(b).textContent, "Last week's desk figures are ready to save", 'the log loaded: offered');
  } finally {
    b.restore();
  }
});

test('AC25 (VT3\'s review, N3): a truncated portfolio tree is unread, as the portfolio\'s block takes it — nothing offered; once whole, offered', async () => {
  const st = vt3State();
  st.pf.truncated = true;
  const app = await vt3Open(st, { store: j5Store() });
  try {
    assert.equal(weeklyLine(app), null, 'a truncated tree: no line');
    await app.go('#/p/Service-Desk/values/weekly');
    assert.equal(weeklyBlock(app), null, 'and no block');
    await app.go('#/');
    st.pf.truncated = false;
    st.pf.commit({ 'README.md': 'A made-up change (NOT real).\n' });
    await app.advance(PF_POLL + 61_000);
    assert.equal(weeklyLine(app).textContent, "Last week's desk figures are ready to save", 'whole: offered');
  } finally {
    app.restore();
  }
});

test('AC18 + AC17 on the page (VT3\'s review, N4, B3): with `webCommitsToDefault: false`, AC18\'s words in the block, above the weeks; with `contentPrefill: false`, each week\'s link the file name only, its file to copy and the cause\'s words (J7\'s check refuses both keys on `portfolio`, so the function\'s own J7 here leaves them out)', async () => {
  const st = vt3State({ pfConf: { webCommitsToDefault: false, contentPrefill: false } });
  const serverConfig = { ...st.config, portfolio: { repo: st.config.portfolio.repo, defaultBranch: st.config.portfolio.defaultBranch } };
  const app = await vt3Open(st, { store: j5Store(), serverConfig });
  try {
    await app.go('#/p/Service-Desk/values/weekly');
    const blk = weeklyBlock(app);
    assert.equal(blk.children[1].textContent, "This repository doesn't take commits to main from the web. On GitHub, choose 'Create a new branch' and then open the pull request GitHub offers; the week stays offered until that pull request is merged.", 'AC18\'s words, before the link is opened');
    const [l] = saveLinks(app);
    assert.equal(l.href, `https://github.com/shumpmaster/portfolio/new/main?filename=${encodeURIComponent('metrics/service-desk/2026-W46-d3fa2.md')}`, 'the file name only');
    const li = l.el.parent;
    assert.equal(byClass(li, 'v2-pre')[0].textContent, J5_FILE, 'the file to copy, character for character');
    assert.equal(byClass(li, 'v2-small')[0].textContent, WEEKLY_WORDS.copyPrefill);
  } finally {
    app.restore();
  }
});

test('AC17 on the page (VT3\'s review, B26, and round 2\'s N7): a tap on a week whose link holds the file name only copies the week\'s file, as a tap on its "Copy the week" does; one whose link holds it all copies nothing', async () => {
  const copied = [];
  const navigator = { clipboard: { writeText: async (t) => { copied.push(t); } } };
  const app = await vt3Open(vt3State({ linkCap: 200 }), { store: j5Store(), globals: { navigator } });
  try {
    await app.go('#/p/Service-Desk/values/weekly');
    await app.tap(saveLinks(app)[0].el);
    assert.deepEqual(copied, [J5_FILE]);
    // VT3's review, round 2, N7: a tap on "Copy the week" puts the week's file on the clipboard too, and says so.
    copied.length = 0;
    const btn = findAll(weeklyBlock(app), (e) => e.tag === 'button' && e.textContent === 'Copy the week')[0];
    assert.ok(btn, '"Copy the week"');
    await app.tap(btn);
    assert.deepEqual(copied, [J5_FILE], 'the file, character for character');
    assert.ok(findAll(weeklyBlock(app), (e) => e.tag === 'button' && e.textContent === 'Copied').length, '"Copied"');
  } finally {
    app.restore();
  }
  copied.length = 0;
  const whole = await vt3Open(vt3State(), { store: j5Store(), globals: { navigator } });
  try {
    await whole.go('#/p/Service-Desk/values/weekly');
    await whole.tap(saveLinks(whole)[0].el);
    assert.deepEqual(copied, [], 'the link holds the file: nothing copied');
  } finally {
    whole.restore();
  }
});

test('J5 on the page (VT3\'s review, N4, B8): a card answered after the week is counted to the week\'s end, never to its answer', async () => {
  // Raised Fri 13 Nov 21:00 in Chicago, answered Mon 16 Nov 09:00 (made up): 1h to the week's end (22:00 Friday), 3h to its answer.
  const card = { n: 300, raised: chi('2026-11-13', '21:00'), answered: chi('2026-11-16', '09:00') };
  const app = await vt3Open(vt3State({ cards: [card] }), { store: j5Store() });
  try {
    await app.go('#/p/Service-Desk/values/weekly');
    assert.match(saveLinks(app)[0].content, /\nV5 median \(weekday cards\): 1h 00m over 1 card\n/);
  } finally {
    app.restore();
  }
});

test('AC25 (VT3\'s review, B27): "Your weekly figures" on the planning project\'s targets\' sheet alone, never another project\'s', async () => {
  const app = await vt3Open(vt3State({ alpha: ALPHA_TARGETS }), { store: j5Store() });
  try {
    await app.go('#/p/Alpha/values');
    assert.ok(sheetOf(app), 'Alpha\'s targets\' sheet');
    assert.ok(byClass(sheetOf(app), 'v2-tgt').length >= 1);
    assert.equal(weeklyBlock(app), null, 'no block on Alpha\'s');
    await app.go('#/p/Service-Desk/values');
    assert.ok(weeklyBlock(app), 'Service-Desk\'s (the planning project\'s) has it');
  } finally {
    app.restore();
  }
});
