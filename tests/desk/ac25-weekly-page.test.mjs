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
  saveLinks, landed, chi, MIN, H,
} from './vt3-fixtures.mjs';

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
