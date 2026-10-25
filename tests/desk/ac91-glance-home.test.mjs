// ac-test: S-001/AC91 — G1 of "After the glance audit": Home at a glance, parts (a) to (e) (specs/S-001.md:8431-8503),
// with AC71's and AC82's changed parts (AC71: "the line is in ink, 500 12 px, with a clock, directly under the tile's name
// row"; AC82: "the count in `--t-sheet` with its due and undo lines of their own; the stall line in ink under the name
// row; "✕ Can't read since HH:MM" in the corner, no red border, the signed-out ✕ and "Not read since"; "At work:"'s
// value in ink; "Since you last looked" at two lines an entry").
// ac-test: S-001/AC82 ac-test: S-001/AC71
//
// The page is the sandbox's own code under the fake DOM, on the fixture states AC91's note names (`mix`, `unread`,
// `stall`, signed-out and `ext`, tests/desk/glance-fixtures.mjs: Service-Desk's records at 77bfeae, real, with made-up
// projects, times and failures, each labelled NOT real in tests/desk/fixtures/README.md). The suite has no browser, so
// each colour, size and weight is the cascade of the page's own stylesheets over what it drew (tests/desk/css-cascade.mjs,
// as AC88's tests read them), in light and in dark; the stage's pull request carries the Chromium captures.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { BAD_PR } from './fake-desk.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { hhmm } from '../../src/lib/timefmt.js';
import { briefingView, settleWords, tileWaits, tileFoot, atWorkParts, sinceUnreadWords, HOME_WORDS } from '../../src/lib/home.js';
import { mixState, unreadState, signedOutState, stallState, extState, MIX_PROJECT, NOW, STALL_NOW, STALL_LAST, SD, CONFIG } from './glance-fixtures.mjs';

const TZ = CONFIG.ownerTimeZone;
const H = 3600e3;
const CSS = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(CSS, 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const INK = { light: { ink: '#18191c', ink2: '#5c5f66', bad: '#b3162a', you: '#c9380c' }, dark: { ink: '#ecedef', ink2: '#a2a5ac', bad: '#ff6b78', you: '#ff6a3d' } };
const THEMES = [['light', null], ['dark', 'dark']];
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');

/** Each drawn element's cascaded look in a theme: el → { colour, size, weight, line, display, decl(prop) }. */
function looks(app, theme) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width: 360, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) {
    if (!n.el) continue;
    out.set(n.el, { colour: plain(n.style.get('color')), size: plain(n.style.get('font-size')), weight: plain(n.style.get('font-weight')),
      line: plain(n.style.get('line-height')), decl: (p) => plain(n.declared.get(p)) });
  }
  return out;
}
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const tile = (app, name) => keyed(app, `card:${name}`);
const brief = (app) => byClass(app.view, 'v2-brief')[0];
const svgOf = (el) => (el.children || []).find((c) => c.tag === 'svg') || null;
const iconOf = (el) => { const s = svgOf(el); return s ? s.getAttribute('class') : ''; };
/** The briefing's due and undo lines drawn (a slot with no line is drawn as nothing, `v2-bdue none`). */
const shown = (b) => byClass(b, 'v2-bdue').filter((d) => !d.className.split(' ').includes('none'));
const looked = (ms) => memStore({ 'desk-seen-v1': JSON.stringify({ lastLooked: ms }) });
async function open(setup, { now = NOW, store = looked(now - H), before = null } = {}) {
  if (before) before();
  const app = await loadSandbox({ ...setup, hash: '#/', now, store });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}

// Made up (NOT real records), on `mix`'s made-up project: a question past its settle time (raised 6 Oct, 24 hours) and
// one that can't be undone, beside fullRepo's question that settles itself, so the briefing holds all three lines.
const PAST_Q = '# Ruling needed: a made-up question past its time\n\nWHY: a test.\nOPTIONS:\n  A. Yes.\n  B. No.\nRECOMMENDATION: A — yes.\nRISK CLASS: R0\nREVERSIBILITY: reversible\nBLAST RADIUS: none\nDEFAULT: A\nTIMEOUT: 24\n';
const FINAL_Q = '# Ruling needed: a made-up choice that can\'t be undone\n\nWHY: a test.\nOPTIONS:\n  A. Yes.\n  B. No.\nRECOMMENDATION: B — no.\nRISK CLASS: R2\nREVERSIBILITY: irreversible\nBLAST RADIUS: the project\nDEFAULT: none\nTIMEOUT: none\n';
const THREE = { extra: { 'questions/Alpha-past.md': PAST_Q, 'questions/Alpha-final.md': FINAL_Q },
  raised: { 'questions/Alpha-past.md': Date.parse('2026-10-06T15:00:00Z'), 'questions/Alpha-final.md': NOW - 2 * H } };

// ---------------------------------------------------------------------------
// (a) Home's count and what falls due

const card = (project, extra = {}) => ({ project, kind: 'pr', raisedAt: null, ...extra });
const question = (q, raisedAt, project = 'Alpha') => card(project, { kind: 'question', raisedAt, flag: { question: { parsed: q } } });
function board(wait = [], kick = []) {
  const counts = new Map();
  for (const c of [...wait, ...kick]) if (!counts.has(c.project)) counts.set(c.project, { waiting: 0, kicked: 0 });
  for (const c of wait) counts.get(c.project).waiting++;
  for (const c of kick) counts.get(c.project).kicked++;
  const lane = (key, rows) => ({ key, groups: [...new Set(rows.map((c) => c.project))].map((p) => ({ project: p, rows: rows.filter((c) => c.project === p) })) });
  return { badge: wait.length + kick.length, counts, lanes: [lane('wait', wait), lane('kick', kick), { key: 'done', groups: [] }], quiet: { agents: [] }, pendingAny: false };
}
const viewOf = (bd) => briefingView({ bd, reads: [{ name: 'Alpha', read: { read: 'ok', since: NOW }, drawError: null }], flagged: bd.badge, signedOut: false, v3: () => true, lastReadMs: NOW, nowMs: NOW, tz: TZ });
const REV = (timeout) => ({ reversibility: 'reversible', default: 'A', timeout: String(timeout) });
const IRR = { reversibility: 'irreversible' };

test('AC91 (a): the due and undo lines leave the parts line, each a line of its own in the order past, coming, undo, AC82\'s and AC89 (j)\'s words but for the capital, with the clock or the lock; one, two and three together; none', () => {
  const past = question(REV(24), NOW - 48 * H);
  const past2 = question(REV(24), NOW - 30 * H);
  const coming = question(REV(48), NOW - H);
  const coming2 = question(REV(24), NOW - H);
  const irr = question(IRR, NOW - H);
  const all = viewOf(board([card('Alpha', { raisedAt: NOW - 4 * H }), past, coming, irr], [card('Alpha')]));
  assert.equal(all.head, '5 need you');
  assert.equal(all.parts, '4 waiting, 1 kicked back · oldest 2 d', 'the parts line keeps "<w> waiting", ", <k> kicked back" and "oldest <age>", in its order, and nothing else');
  assert.deepEqual(all.due, [
    { key: 'past', icon: 'clock', words: `One question was due to settle itself ${'13 Oct, 10:00'}` },
    { key: 'coming', icon: 'clock', words: `One question settles itself ${settleWords(NOW + 47 * H, NOW, TZ)}` },
    { key: 'undo', icon: 'lock', words: "One can't be undone" }], 'three together: past, coming, undo');
  const plural = viewOf(board([past, past2, coming, coming2, irr, question(IRR, null)]));
  assert.deepEqual(plural.due.map((d) => d.words), [`2 questions were due to settle themselves, the first ${'13 Oct, 10:00'}`,
    `2 questions settle themselves, the first ${settleWords(NOW + 23 * H, NOW, TZ)}`, "2 can't be undone"], 'the sums and their first <when>');
  assert.deepEqual(viewOf(board([coming, irr])).due.map((d) => d.key), ['coming', 'undo'], 'two together');
  assert.deepEqual(viewOf(board([past, irr])).due.map((d) => d.key), ['past', 'undo']);
  const none = viewOf(board([card('Alpha')]));
  assert.deepEqual([none.parts, none.due], ['1 waiting', []], 'none: no line, and the parts line as it was');
  assert.deepEqual(viewOf(board([question(IRR, null)])).due, [{ key: 'undo', icon: 'lock', words: "One can't be undone" }], 'the parts line may hold only its count');
});

test('AC91 (a): on Home (`mix`), "<n> need you" takes --t-sheet (600 18 px) in ink, the ◆ sized to it, the largest text under the screen\'s title; each due and undo line under the parts, in 500 12 px ink with its clock or lock in ink, in order', async () => {
  const app = await open(mixState(THREE));
  try {
    const b = brief(app);
    assert.equal(b.className, 'v2-brief k-you');
    const head = byClass(b, 'v2-bt1')[0];
    assert.match(head.textContent, /^\d+ need you$/);
    const parts = byClass(b, 'v2-bt2')[0];
    assert.match(parts.textContent, /^\d+ waiting · oldest \d+ [smhd]$/, 'the parts line without the due and undo parts');
    const due = shown(b);
    assert.deepEqual(due.map((d) => d.textContent), ['One question was due to settle itself 7 Oct, 10:00', 'One question settles itself Thu 03:20', "One can't be undone"]);
    assert.deepEqual(due.map((d) => /vi-(clock|lock)/.exec(iconOf(d))[1]), ['clock', 'clock', 'lock'], 'the clock, the clock, the lock, each before its words');
    assert.ok(b.children.indexOf(due[0]) === b.children.indexOf(parts) + 1, 'directly under the parts line');
    const diamond = svgOf(byClass(b, 'v2-bi')[0]);
    assert.match(diamond.getAttribute('class'), /st-you/, 'the vermilion ◆');
    for (const [theme] of THEMES) {
      const L = looks(app, theme);
      const c = INK[theme];
      assert.deepEqual([L.get(head).size, L.get(head).weight, L.get(head).colour], ['18px', '600', c.ink], `${theme}: the count in the sheet-title role, ink`);
      assert.deepEqual([L.get(diamond).decl('width'), L.get(diamond).decl('height')], ['18px', '18px'], `${theme}: the ◆ sized to the count`);
      for (const d of due) {
        assert.deepEqual([L.get(d).size, L.get(d).weight, L.get(d).colour], ['12px', '500', c.ink], `${theme}: ${d.textContent}`);
        assert.equal(L.get(svgOf(d)).colour, c.ink, `${theme}: its icon in ink`);
      }
      // The largest text under the title: the title (--t-title) is larger, every other text on Home smaller.
      const title = byClass(app.view, 'v2-title')[0];
      assert.equal(L.get(title).size, '24px');
      const home = byClass(app.view, 'v2-home')[0];
      const texts = findAll(home, (e) => e.tag && (e.children || []).some((x) => x.nodeType === 3 && String(x.text || x.textContent || '').trim()));
      assert.ok(texts.length > 20, 'Home\'s texts');
      for (const e of texts) {
        if (e === title || e === head) continue;
        assert.ok(parseFloat(L.get(e).size) < 18, `${theme}: "${e.textContent.slice(0, 40)}" at ${L.get(e).size}, under the count's 18px`);
      }
    }
  } finally {
    app.restore();
  }
});

test('AC91 (a): "Nothing needs you" and the briefing\'s other forms keep AC82\'s look (C: the ruling names the count only); and `ext`\'s four questions that settle themselves on a line of their own', async () => {
  const quiet = await open(stallState(), { now: STALL_NOW });
  try {
    const b = brief(quiet);
    assert.equal(b.className, 'v2-brief k-quiet');
    const L = looks(quiet, 'light');
    assert.deepEqual([L.get(byClass(b, 'v2-bt1')[0]).size, L.get(byClass(b, 'v2-bt1')[0]).weight], ['15px', '500'], 'as built');
    assert.equal(shown(b).length, 0);
  } finally {
    quiet.restore();
  }
  const ext = await open(extState());
  try {
    const due = shown(brief(ext));
    assert.equal(due.length, 1, 'one line for all four');
    assert.match(due[0].textContent, /^4 questions settle themselves, the first [A-Z][a-z]{2} \d\d:\d\d$/);
    assert.doesNotMatch(byClass(brief(ext), 'v2-bt2')[0].textContent, /settle|undone/);
  } finally {
    ext.restore();
  }
});

// The Reviewer's note 2 (G1, round 1): the due lines follow the clock on the 15-second tick, as the single parts line did
// before G1, with no redraw between: a time to come that passes leaves "settles itself" and joins "was due to settle".
test('AC91 (a) with AC82\'s tick: past a coming settle time, on the 15-second tick alone, the "coming" line goes and the "past" line appears, with its clock, in its place in the order', async () => {
  const app = await open(mixState({ extra: { 'questions/Alpha-final.md': FINAL_Q }, raised: { 'questions/Alpha-final.md': NOW - 2 * H } }));
  const harnessNow = Date.now;
  try {
    const b = brief(app);
    assert.deepEqual(shown(b).map((d) => d.textContent), ['One question settles itself Thu 03:20', "One can't be undone"]);
    // fullRepo's question, raised NOW - 400 minutes with a 24-hour TIMEOUT, settles at 08:20Z on 15 Oct (03:20 in
    // ownerTimeZone). The clock moves a minute past it, and only the tick runs: no poll, no redraw.
    const due = NOW - 400 * 60e3 + 24 * H;
    Date.now = () => due + 60e3;
    await app.tick();
    assert.equal(brief(app), b, 'the same briefing, not redrawn');
    assert.deepEqual(shown(b).map((d) => d.textContent), ['One question was due to settle itself 15 Oct, 03:20', "One can't be undone"], 'past, then undo');
    assert.deepEqual(shown(b).map((d) => /vi-(clock|lock)/.exec(iconOf(d))[1]), ['clock', 'lock']);
    assert.ok(!byClass(b, 'v2-bdue').some((d) => !d.className.split(' ').includes('none') && /settles itself/.test(d.textContent)), 'the coming line gone');
    for (const d of byClass(b, 'v2-bdue')) assert.equal(d.className.split(' ').includes('none'), d.textContent === '', 'a line with no words is drawn as nothing');
  } finally {
    Date.now = harnessNow;
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// (b) A stopped project, in ink

test('AC91 (b) with AC71 (changed), from `stall`: "No movement for 8 days · last: PR #77 merged, 16 Oct" directly under the tile\'s name row, above the summary, in 500 12 px ink with the clock in ink before it, never vermilion or --bad; none at 71 hours', async () => {
  const app = await open(stallState(), { now: STALL_NOW });
  try {
    const t = tile(app, SD.name);
    const line = keyed(app, `stall:${SD.name}`);
    assert.equal(line.textContent, 'No movement for 8 days · last: PR #77 merged, 16 Oct');
    assert.equal(t.children[0].className, 'v2-thd');
    assert.equal(t.children[1], line, 'directly under the name row');
    assert.equal(t.children[2].className, 'sb-sumbox', 'above the summary');
    assert.equal(line.className, 'v2-ln v2-stall');
    assert.match(iconOf(line), /\bvi-clock\b/);
    assert.equal(line.children[0].tag, 'svg', 'the clock before the words');
    for (const [theme] of THEMES) {
      const L = looks(app, theme);
      const c = INK[theme];
      assert.deepEqual([L.get(line).size, L.get(line).weight, L.get(line).colour], ['12px', '500', c.ink], theme);
      assert.equal(L.get(svgOf(line)).colour, c.ink, `${theme}: the clock in ink`);
      assert.ok(![c.you, c.bad].includes(L.get(line).colour));
      assert.notEqual(L.get(line).decl('display'), 'none');
    }
  } finally {
    app.restore();
  }
  // Its absence where AC71 has none: 71 hours after the last movement, and on a tile with something waiting.
  const early = await open(stallState(), { now: STALL_LAST + 71 * H });
  try {
    const line = keyed(early, `stall:${SD.name}`);
    assert.equal(line.textContent, '');
    assert.equal(line.className, 'v2-stall', 'drawn as nothing');
    assert.equal(looks(early, 'light').get(line).decl('display'), 'none');
    assert.equal(byClass(tile(early, SD.name), 'v2-ln').filter((l) => /No movement/.test(l.textContent)).length, 0);
  } finally {
    early.restore();
  }
  const mix = await open(mixState());
  try {
    assert.equal(keyed(mix, `stall:${MIX_PROJECT}`).textContent, '', 'something waits: no line');
  } finally {
    mix.restore();
  }
});

// ---------------------------------------------------------------------------
// (c) A project the desk can't read, one way everywhere

test('AC91 (c), the words: the corner "Can\'t read since HH:MM", "Can\'t read" with no time held, what waits when something does, "Checking…" as now; the foot saying the time once', () => {
  assert.deepEqual(tileWaits(0, 'cant-read', '10:02'), { you: false, bad: true, words: "Can't read since 10:02" });
  assert.deepEqual(tileWaits(0, 'cant-read', null), { you: false, bad: true, words: "Can't read" });
  assert.deepEqual(tileWaits(3, 'cant-read', '10:02'), { you: true, bad: false, words: '3 wait on you' }, 'counted from the last read\'s cards');
  assert.deepEqual(tileWaits(0, 'checking'), { you: false, bad: false, words: HOME_WORDS.checking });
  assert.equal(tileFoot(0, 'cant-read', '10:02', 'GitHub error').words, 'Reason: GitHub error');
  assert.equal(tileFoot(0, 'cant-read', null, 'GitHub error').words, 'Reason: GitHub error', 'beside "Can\'t read" too');
  assert.equal(tileFoot(0, 'cant-read', '10:02', 'x').bad, false, 'grey');
  assert.deepEqual(tileFoot(2, 'cant-read', '10:02', 'GitHub error'), { bad: true, words: "Can't read since 10:02: GitHub error" });
  assert.deepEqual(tileFoot(2, 'cant-read', null, 'GitHub error'), { bad: true, words: "Can't read: GitHub error" });
  assert.equal(tileFoot(0, 'ok', null, null), null);
  assert.equal(tileFoot(0, 'checking', null, null), null);
});

test('AC91 (c), from `unread`: nothing waiting and its read failing — the corner "✕ Can\'t read since HH:MM", the ✕ and the words in --bad, 500 12 px; the foot "Reason: …" in --t-small grey; the time said once', async () => {
  const s = unreadState();
  const app = await open(s);
  try {
    const at = app.now;
    s.fail();
    await app.advance(3 * POLL_MS);
    const t = tile(app, SD.name);
    const corner = byClass(t, 'v2-wt')[0];
    const since = hhmm(new Date(at), TZ);
    assert.match(corner.textContent, /^Can't read since \d\d:\d\d$/);
    assert.ok(Date.parse(`2026-10-14T${corner.textContent.slice(-5)}:00-05:00`) >= Date.parse(`2026-10-14T${since}:00-05:00`), 'the first failure since the last success');
    assert.equal(corner.className, 'v2-wt bad');
    assert.match(iconOf(corner), /\bvi-bad\b/, 'the ✕');
    const foot = byClass(t, 'v2-tfoot')[0];
    assert.equal(foot.textContent, `Reason: ${"network error: the desk's function could not be reached"}`);
    assert.equal(byClass(t, 'v2-ln').filter((l) => / bad /.test(` ${l.className} `)).length, 0, 'no red line at the foot');
    assert.equal(t.textContent.split("Can't read").length - 1, 1, 'the failure said once on the tile');
    assert.equal(t.textContent.split(corner.textContent.slice(-5)).length - 1, 1, 'and its time once');
    for (const [theme] of THEMES) {
      const L = looks(app, theme);
      const c = INK[theme];
      assert.deepEqual([L.get(corner).size, L.get(corner).weight, L.get(corner).colour], ['12px', '500', c.bad], theme);
      assert.equal(L.get(svgOf(corner)).colour, c.bad, `${theme}: the ✕ in --bad`);
      assert.deepEqual([L.get(foot).size, L.get(foot).weight, L.get(foot).colour], ['12px', '400', c.ink2], `${theme}: the foot in --t-small --ink2`);
    }
  } finally {
    app.restore();
  }
});

test('AC91 (c), from `unread`: cards waiting and the read failing — the corner keeps "◆ <n> wait on you" from the last read\'s cards; the foot keeps its red "✕ Can\'t read since HH:MM: <reason>"; "Checking…" in the corner as now; and, from G7, the briefing\'s can\'t-read line under its count carries the ✕ before its words, both in --bad', async () => {
  const s = unreadState({ who: MIX_PROJECT });
  const app = await loadSandbox({ ...s, hash: '#/', now: NOW, store: looked(NOW - H) });
  try {
    assert.equal(byClass(tile(app, MIX_PROJECT), 'v2-wt')[0].textContent, 'Checking…', 'first paint');
    assert.equal(byClass(tile(app, MIX_PROJECT), 'v2-wt')[0].className, 'v2-wt');
    await app.advance(1000);
    await app.advance(61_000);
    const before = byClass(tile(app, MIX_PROJECT), 'v2-wt')[0].textContent;
    assert.match(before, /^\d+ wait on you$/);
    s.fail();
    await app.advance(3 * POLL_MS);
    const t = tile(app, MIX_PROJECT);
    const corner = byClass(t, 'v2-wt')[0];
    assert.equal(corner.textContent, before, 'what waits, from the last read');
    assert.equal(corner.className, 'v2-wt you');
    const red = byClass(t, 'v2-ln').filter((l) => / bad /.test(` ${l.className} `));
    assert.equal(red.length, 1);
    assert.match(red[0].textContent, /^Can't read since \d\d:\d\d: network error/);
    assert.match(iconOf(red[0]), /\bvi-bad\b/);
    assert.equal(byClass(t, 'v2-tfoot').length, 0);
    for (const [theme] of THEMES) assert.equal(looks(app, theme).get(red[0]).colour, INK[theme].bad, theme);
    // Extended in G7 (AC91 (c): "each carries the ✕ icon in --bad before it, as Waiting's line does … G1 built these lines
    // without it; the ✕ is built in G7"): the briefing says what needs the owner first, and the project it can't read
    // under it, its ✕ before its words.
    const b = brief(app);
    assert.equal(b.className, 'v2-brief k-you');
    const cant = byClass(b, 'v2-bt3').filter((x) => / bad /.test(` ${x.className} `));
    assert.equal(cant.length, 1);
    assert.match(cant[0].textContent, new RegExp(`^Can't read ${MIX_PROJECT} since \\d\\d:\\d\\d$`));
    assert.equal(cant[0].children[0], svgOf(cant[0]), 'the ✕ before its words');
    assert.match(iconOf(cant[0]), /\bvi-bad\b/);
    for (const [theme] of THEMES) {
      const L = looks(app, theme);
      assert.deepEqual([L.get(svgOf(cant[0])).colour, L.get(cant[0]).colour], [INK[theme].bad, INK[theme].bad], `${theme}: the ✕ and the words in --bad`);
    }
  } finally {
    app.restore();
  }
});

test('AC91 (c): a tile the desk can\'t draw — its red border gone, the usual tile edge; "✕ Can\'t show this project: <the error>", the ✕ and the words in --bad; no rule draws a tile\'s border in --bad', async () => {
  const s = mixState();
  s.repos[MIX_PROJECT].pulls.push(BAD_PR);
  const app = await open(s);
  try {
    const t = tile(app, MIX_PROJECT);
    assert.equal(t.className, 'v2-tile', 'the usual tile');
    const line = byClass(t, 'v2-ln')[0];
    assert.match(line.textContent, /^Can't show this project: /);
    assert.match(iconOf(line), /\bvi-bad\b/);
    for (const [theme] of THEMES) {
      const L = looks(app, theme);
      assert.equal(L.get(line).colour, INK[theme].bad, theme);
      assert.equal(L.get(t).decl('border'), L.get(tile(app, SD.name)).decl('border'), `${theme}: the edge every tile has`);
      assert.doesNotMatch(L.get(t).decl('border-color') || '', new RegExp(INK[theme].bad));
    }
  } finally {
    app.restore();
  }
  const rules = [...CSS.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }));
  assert.deepEqual(rules.filter((r) => /v2-tile/.test(r.sel) && /border[^;]*var\(--bad\)/.test(r.body)).map((r) => r.sel), [], 'no tile with a --bad border');
});

test('AC91 (c), signed-out: the briefing keeps "Signed out — reload to sign in" with the ✕ in --bad in place of the clock; "Since you last looked" reads "Not read in this opening", the ✕ and the words in --bad', async () => {
  const s = signedOutState();
  const app = await open(s, { before: s.fail });
  try {
    const b = brief(app);
    assert.equal(b.className, 'v2-brief k-signed-out');
    assert.equal(byClass(b, 'v2-bt1')[0].textContent, 'Signed out — reload to sign in');
    const mark = svgOf(byClass(b, 'v2-bi')[0]);
    assert.match(mark.getAttribute('class'), /\bvi-bad\b/);
    assert.equal(findAll(b, (e) => e.tag === 'svg' && /vi-clock/.test(e.getAttribute('class'))).length, 0, 'no clock');
    const none = keyed(app, 'since-none');
    assert.equal(none.textContent, 'Not read in this opening');
    assert.equal(none.className, 'v2-ql bad');
    assert.match(iconOf(none), /\bvi-bad\b/);
    assert.doesNotMatch(app.text(), /Nothing new since/);
    for (const [theme] of THEMES) {
      const L = looks(app, theme);
      assert.equal(L.get(mark).colour, INK[theme].bad, `${theme}: the briefing's ✕`);
      assert.equal(L.get(none).colour, INK[theme].bad, `${theme}: "Not read in this opening"`);
      assert.equal(L.get(svgOf(none)).colour, INK[theme].bad);
    }
  } finally {
    app.restore();
  }
});

test('AC91 (c), "Since you last looked" while a project can\'t be read: "Not read since HH:MM" with one and with two projects unreadable (the earliest "since"), "Not read in this opening" with one never read here, never "Nothing new since"; lines from a project that was read still shown', async () => {
  // Nothing new since "last looked" (made up: held on this device as 19 Oct, after the last of the records' dates, J24's
  // "Reached" lines of 18 Oct among them), every project read once, then Service-Desk failing.
  const LATE = Date.parse('2026-10-19T00:00:00Z');
  const s = unreadState();
  const app = await open(s, { store: looked(LATE) });
  try {
    assert.match(keyed(app, 'since-none').textContent, /^Nothing new since /, 'every project read: as built');
    s.fail();
    await app.advance(3 * POLL_MS);
    const sdSince = byClass(tile(app, SD.name), 'v2-wt')[0].textContent.slice(-5);
    const one = keyed(app, 'since-none');
    assert.equal(one.textContent, `Not read since ${sdSince}`, 'one: its "since"');
    assert.equal(one.className, 'v2-ql bad');
    // Two: the made-up project failing later too; the earlier "since" is Service-Desk's.
    await app.advance(2 * POLL_MS);
    s.repos[MIX_PROJECT].fail = { kind: 'network' };
    await app.advance(3 * POLL_MS);
    const alphaFoot = byClass(tile(app, MIX_PROJECT), 'v2-ln').find((l) => / bad /.test(` ${l.className} `)).textContent;
    const alphaSince = /since (\d\d:\d\d)/.exec(alphaFoot)[1];
    assert.ok(alphaSince > sdSince, `${alphaSince} after ${sdSince}`);
    assert.equal(keyed(app, 'since-none').textContent, `Not read since ${sdSince}`, 'two: the earliest');
  } finally {
    app.restore();
  }
  // A project never read in this opening: "Not read in this opening".
  const never = unreadState();
  const app2 = await open(never, { store: looked(LATE), before: never.fail });
  try {
    assert.equal(keyed(app2, 'since-none').textContent, 'Not read in this opening');
  } finally {
    app2.restore();
  }
  // Lines from the projects that were read show as AC82 has them, and then no "Not read" line stands in for them.
  const lines = unreadState();
  const app3 = await open(lines, { store: looked(NOW - 10 * 24 * H) });
  try {
    lines.fail();
    await app3.advance(3 * POLL_MS);
    assert.ok(byClass(keyed(app3, 'since'), 'v2-ev').length > 0, 'the read projects\' lines');
    assert.equal(keyed(app3, 'since-none'), null);
  } finally {
    app3.restore();
  }
  // The words, pure.
  const r = (since, succeeded = true) => ({ read: { read: 'cant-read', since }, succeeded });
  assert.equal(sinceUnreadWords([{ read: { read: 'ok', since: NOW }, succeeded: true }], TZ), null, 'every project read: the list as built');
  assert.equal(sinceUnreadWords([r(Date.parse('2026-10-14T15:02:00Z')), r(Date.parse('2026-10-14T14:58:00Z'))], TZ), 'Not read since 09:58');
  assert.equal(sinceUnreadWords([r(Date.parse('2026-10-14T15:02:00Z')), r(Date.parse('2026-10-14T15:00:00Z'), false)], TZ), 'Not read in this opening');
});

// ---------------------------------------------------------------------------
// (d) Who is at work, in dark ink

test('AC91 (d): "At work:" stays --ink2 and its value is in --ink, as the Next line\'s, for one and for two working members; "No agent run recorded since <date>", "not available" and "No dispatch log: not used here" stay wholly grey', async () => {
  assert.deepEqual(atWorkParts('At work: Builder on P-003'), { label: 'At work:', value: 'Builder on P-003' });
  assert.deepEqual(atWorkParts('At work: Builder on P-003, Reviewer on P-004'), { label: 'At work:', value: 'Builder on P-003, Reviewer on P-004' });
  for (const grey of ['No agent run recorded since 8 Oct', 'No agent run recorded', 'At work: not available', HOME_WORDS.noDispatchLog]) assert.equal(atWorkParts(grey), null, grey);
  // Two working on the made-up project: a reviewer dispatched beside its builder (made up, NOT a real record).
  const two = mixState({ extra: { 'status/P-004.toml': `kind = "project"\nstage = 6\nstate = "dispatched"\nrole = "reviewer"\ndispatched_at = "${new Date(NOW - 10 * 60e3).toISOString()}"\n` } });
  for (const [setup, want] of [[mixState(), 'Builder on P-003'], [two, 'Builder on P-003, Reviewer on P-004']]) {
    const app = await open(setup);
    try {
      const line = byClass(tile(app, MIX_PROJECT), 'v2-ln').find((l) => /^At work:/.test(l.textContent));
      assert.equal(line.textContent, `At work: ${want}`);
      const words = line.children[1];
      const label = words.children[0];
      assert.equal(label.textContent, 'At work:');
      const next = byClass(tile(app, MIX_PROJECT), 'v2-ln').find((l) => /^Next:/.test(l.textContent)).children[1];
      for (const [theme] of THEMES) {
        const L = looks(app, theme);
        assert.equal(L.get(label).colour, INK[theme].ink2, `${theme}: the label grey`);
        assert.equal(L.get(words).colour, INK[theme].ink, `${theme}: the value in ink`);
        assert.equal(L.get(words).colour, L.get(next).colour, `${theme}: as the Next line's value`);
      }
      const sd = byClass(tile(app, SD.name), 'v2-ln').find((l) => /^No agent run recorded since /.test(l.textContent));
      const poom = byClass(app.view, 'v2-ln').find((l) => l.textContent === HOME_WORDS.noDispatchLog);
      for (const grey of [sd, poom]) {
        const span = grey.children[1];
        assert.equal(span.className, 'v2-g');
        for (const [theme] of THEMES) assert.equal(looks(app, theme).get(span).colour, INK[theme].ink2, `${theme}: ${grey.textContent}`);
      }
    } finally {
      app.restore();
    }
  }
  const s = signedOutState();
  const out = await open(s, { before: s.fail });
  try {
    const na = byClass(tile(out, MIX_PROJECT), 'v2-ln').find((l) => /^At work:/.test(l.textContent));
    assert.equal(na.textContent, 'At work: not available');
    assert.equal(na.children[1].className, 'v2-g', 'wholly grey');
  } finally {
    out.restore();
  }
});

// ---------------------------------------------------------------------------
// (e) "Since you last looked" at two lines an entry

test('AC91 (e): each "Since you last looked" entry is cut at two lines, not three, with the fade at the cut, from `ext`\'s long records; its tap still opens where it happened, where the whole entry is', async () => {
  const app = await open(extState(), { store: looked(NOW - 9 * 24 * H) });
  try {
    const e1s = () => byClass(keyed(app, 'since'), 'v2-e1');
    assert.ok(e1s().length >= 2);
    const [a, b] = e1s();
    const whole = a.textContent;
    // The fake DOM can't lay out text: the first entry runs to 5 lines in its 2-line box, the second fits in two.
    a.clientHeight = 38; a.scrollHeight = 95;
    b.clientHeight = 38; b.scrollHeight = 38;
    await app.resize(360);
    await app.flush();
    const [a2, b2] = e1s();
    assert.ok(a2.className.split(' ').includes('over'), 'cut: faded');
    assert.ok(!b2.className.split(' ').includes('over'), 'two lines fit: no fade');
    assert.equal(a2.textContent, whole, 'the whole entry is held; only its box is cut');
    for (const ev of byClass(keyed(app, 'since'), 'v2-ev')) assert.ok(ev.tag === 'a' && ev.attrs.href, 'each entry a tap to where it happened');
    const L = looks(app, 'light');
    assert.equal(L.get(a2).decl('max-height'), 'calc(2 * 1.45em)', 'two lines of --t-body');
  } finally {
    app.restore();
  }
  assert.match(CSS, /\n\.v2-e1 \{ position: relative; font: var\(--t-body\); overflow-wrap: anywhere; max-height: calc\(2 \* 1\.45em\); overflow: hidden; overflow: clip; \}/);
  assert.match(CSS, /\n\.v2-e1\.over::after \{ content: ""; position: absolute; right: 0; bottom: 0; width: 5em; max-width: 100%; height: 1\.45em;/, 'the fade on the second line\'s end');
  // P-001-tile-summary-clip.md's three lines still govern a tile's summary.
  assert.match(CSS, /\n\.v2-tile \.sb-sumclip \{ font: var\(--t-small\); height: auto; max-height: calc\(3 \* 1\.4em\); \}/);
});
