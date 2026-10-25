// ac-test: S-001/AC89 — after MD3, stage 6a (the amendment "After MD3", specs/S-001.md:2328): the audit's small points
// and the words and drawing of AC89 (k) — (d) no "Your merges?" on a v2.5 page; (e) the Working now sheet's unknowns in
// words; (f) Plan's bubble on one ground; (g) the Timeline's sprint marks level; and (k)'s lines (specs/S-001.md:7871-7882,
// :7924-7950; the test's list at :7976-7979 and :7989). The suite has no browser: the page is the desk's own code under the
// fake DOM, the fake desk function and the scheduler's fake clock, and the looks are AC88's cascade of the real stylesheets
// (css-cascade.mjs). Records: Service-Desk's J11 records at 3117150 and 77bfeae (real), AC52's one item of each kind and
// md-extremes (made up), the long-text fixture (long-fixtures.mjs) and the made-up records named in
// tests/desk/fixtures/README.md ("After MD3, stage 6a"), each NOT a real record.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG, SRC, fixture } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { NOW } from './sandbox-fixtures.mjs';
import { textSetup } from './screen-text.mjs';
import { SD3, sdRepo, openSD, ac61Answer } from './tv2-fixtures.mjs';
import { waSetup, WORKED, j77Files, memStore, viewOf, estLine, SD, POOM, shortRowsSetup, SHORT_NAMES } from './wa-fixtures.mjs';
import { cosLanes, LANES_NOW } from './lanes-fixtures.mjs';
import { longSetup, LONG_NOW } from './long-fixtures.mjs';
import { pfFiles, cardText, withPortfolio, addPortfolio } from './pf-fixtures.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { workingNow, COST_NOT_YET, COS_COST_NR } from '../../src/lib/sandbox.js';
import { nextLine, timelineWords } from '../../src/lib/home.js';
import { v25Rows } from '../../src/lib/projectpage.js';
import { ciRunOf } from '../../src/lib/records.js';
import { portfolioCards } from '../../src/lib/portfolio.js';

const TZ = CONFIG.ownerTimeZone;
const CSS = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(CSS, 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const WAYS = [
  { name: 'dark (data-theme)', env: { scheme: 'light', width: 360, reducedMotion: false }, attr: 'dark' },
  { name: 'dark (the phone)', env: { scheme: 'dark', width: 414, reducedMotion: false }, attr: null },
  { name: 'light', env: { scheme: 'light', width: 360, reducedMotion: false }, attr: null },
];
const marks = (text) => [...String(text).matchAll(/⟦([^|⟧]*)\|([^⟧]*)⟧/g)].map((m) => ({ name: m[1], value: m[2] }));
const plain = (text) => String(text).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');
/** A node's own ground, as the cascade resolves it: its background colour's first value, or null. */
const groundOf = (n) => { const v = n.declared.get('background-color') || n.declared.get('background'); const m = v ? marks(v)[0] : null; return m ? m.value.toLowerCase() : null; };
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const rule = (sel) => {
  const m = CSS.match(new RegExp(`(?:^|\\n)${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`));
  assert.ok(m, `a rule for ${sel}`);
  return m[1];
};
async function open(setup, hash, opts = {}) {
  const app = await loadSandbox({ ...setup, hash, now: opts.now || setup.now || NOW, store: opts.store || setup.store || null });
  await app.advance(1000);
  await app.advance(POLL_MS);
  return app;
}
/** The tree in one of AC88's ways, cascaded with the real stylesheets. */
function drawn(app, way, prep = () => {}) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (way.attr) attrs['data-theme'] = way.attr; else delete attrs['data-theme'];
  const tree = treeOf(app.view, { className: root.className, attrs });
  prep(tree);
  return cascade(tree, RULES, way.env);
}

// ---------------------------------------------------------------------------
// (d) "Your merges?" goes from a v2.5 project's page

test('AC89 (d): a v2.5 project\'s page keeps "Your last action: …" with no "Your merges?" fold under it; a v3 project\'s line keeps AC55\'s reason one tap away', async () => {
  const s = textSetup();
  const app = await open(s, '#/p/Delta');
  try {
    const last = byClass(app.view, 'sb-last')[0];
    assert.ok(last, 'the v2.5 page\'s line');
    assert.match(last.textContent, /^Your last action: /);
    assert.equal(findAll(last, (e) => e.tag === 'details').length, 0, 'no fold under it');
    assert.doesNotMatch(app.view.textContent, /Your merges\?/);
    await app.go('#/p/Alpha');
    const v3 = byClass(app.view, 'sb-last')[0];
    const fold = findAll(v3, (e) => e.tag === 'details')[0];
    assert.ok(fold, 'a v3 page keeps it');
    assert.equal(findAll(fold, (e) => e.tag === 'summary')[0].textContent, 'Your merges?');
    assert.match(fold.textContent, /Not in this line: your merges aren't recorded in what the desk reads \(the desk reads only open pull requests\)\./);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// (e) The Working now sheet's unknowns in words

test('AC89 (e): the Working now sheet\'s lines Update, Next and Cost say an unknown in words, never "–" — "Cost: not known yet · from the usage record when it ends" under way; the Chief of Staff\'s "Cost: not recorded: the Chief of Staff can\'t read its own cost"; "not recorded" otherwise; the tiles keep "–" with its words', async () => {
  const P = { name: 'A', repo: 'shumpmaster/A', defaultBranch: 'main', model: 'v3', planning: false };
  const now = new Date(NOW);
  const model = { items: [{ id: 'P-003', state: 'dispatched', stage: '5 Produce', asOf: null, running: { role: 'builder', since: null } }], allEntries: [] };
  const wn = workingNow(P, model, {}, { workflow: null }, 'builder', {}, now, 'UTC');
  const line = Object.fromEntries(wn.lines.map((l) => [l.label, l]));
  assert.equal(COST_NOT_YET, 'not known yet · from the usage record when it ends');
  assert.deepEqual([line.Update.value, line.Next.value, line.Cost.value], ['not recorded', 'the Orchestrator routes its return', COST_NOT_YET]);
  assert.ok(wn.lines.every((l) => l.value !== '–'), 'no line shows "–"');
  assert.deepEqual(wn.tiles.map((t) => t.value), ['–', '–', '–', '–'], 'the tiles keep AC41\'s "–" where they have room for no more');
  assert.ok(wn.tiles.every((t) => t.why), '… each with its words under it');
  // Nothing under way: every line "not recorded", in words.
  const idle = workingNow(P, { items: [] }, {}, null, 'builder', {}, now, 'UTC');
  assert.deepEqual(idle.lines.map((l) => [l.label, l.value, l.why]), [['Update', 'not recorded', null], ['Next', 'not recorded', null], ['Cost', 'not recorded', null]]);
  const cosIdle = workingNow(P, { items: [] }, {}, null, 'chief-of-staff', {}, now, 'UTC');
  assert.equal(cosIdle.lines[2].value, 'not recorded: no piece of its work is under way');
  // On the page: the builder's sheet (AC52's made-up item of each kind), and the Chief of Staff's (stage 4's made-up logs).
  const app = await open(textSetup(), '#/p/Alpha/team/builder/now');
  try {
    const kv = byClass(app.view, 'sb-kv')[0];
    assert.ok(kv, 'the sheet\'s three lines');
    const items = findAll(kv, (e) => e.tag === 'li').map((li) => li.textContent);
    assert.equal(items[2], `Cost: ${COST_NOT_YET}`, 'word for word');
    assert.ok(items.every((t) => !/: –/.test(t)), items.join(' | '));
  } finally {
    app.restore();
  }
  const c = cosLanes();
  const cos = await open({ config: { ...CONFIG, projects: c.projects }, repos: c.repos }, '#/p/Lanes-four/team/chief-of-staff/now', { now: LANES_NOW });
  try {
    const items = findAll(byClass(cos.view, 'sb-kv')[0], (e) => e.tag === 'li').map((li) => li.textContent);
    assert.equal(items[2], `Cost: ${COS_COST_NR}`);
    assert.equal(COS_COST_NR, "not recorded: the Chief of Staff can't read its own cost");
    assert.ok(items.every((t) => !/: –/.test(t)), items.join(' | '));
  } finally {
    cos.restore();
  }
});

// ---------------------------------------------------------------------------
// (f) Plan's bubble on one ground, on the long-text fixture ((b) item 30, first part)

test('AC89 (f): on the long-text fixture (a bubble on every screen that has one), a bubble\'s top row and its note take the bubble\'s own ground — --bg on Plan and its sheets, on Home and on the project page — never --card over it, in light and dark (AC88\'s cascade)', async () => {
  const s = longSetup();
  const app = await open(s, '#/', { now: LONG_NOW });
  const where = [['#/', 'v2-home'], ['#/p/Service-Desk', 'v2-proj'], ['#/work', 'v2-plan'], ['#/work/ms/Service-Desk/MD3', 'v2-sheet']];
  let seen = 0;
  try {
    for (const [hash, scope] of where) {
      await app.go(hash);
      for (const way of WAYS) {
        // Each bubble opened in place, with its top row and its note (the page's own markup, sandbox.js: lineBox and summaryBox).
        const tree = drawn(app, way, (t) => {
          const mk = (tag, cls, parent) => { const n = { tag, cls: new Set(cls), attrs: {}, parent, kids: [], text: '', el: null }; parent.kids.push(n); return n; };
          for (const box of nodes(t).filter((n) => n.cls.has('sb-sumbox') || n.cls.has('sb-linebox'))) {
            const b = mk('div', ['sb-bubble', 'down', ...(box.cls.has('sb-linebox') ? ['sb-linebub'] : ['col-l'])], box);
            mk('p', ['sb-eyebrow'], mk('div', ['sb-bubble-top'], b)).text = 'Summary';
            mk('p', ['sb-bubble-t'], b).text = 'The whole text.';
            mk('p', ['sb-bubble-note'], b).text = 'This changed; close to see it.';
          }
        });
        const bubbles = nodes(tree).filter((n) => n.cls.has('sb-bubble') && (() => { for (let a = n; a; a = a.parent) if (a.cls.has(scope)) return true; return false; })());
        assert.ok(bubbles.length >= 1, `${hash} · ${way.name}: a bubble opens there (the long-text fixture)`);
        for (const b of bubbles) {
          const g = groundOf(b);
          const bg = marks(nodes(tree)[0].custom.get('--bg').value || '')[0];
          assert.ok(g, `${hash}: the bubble's own ground`);
          for (const part of b.kids.filter((k) => k.cls.has('sb-bubble-top') || k.cls.has('sb-bubble-note'))) {
            assert.equal(groundOf(part), g, `${hash} · ${way.name} · ${[...part.cls][0]}: on the bubble's ground (${plain(part.declared.get('background') || '')})`);
            seen++;
          }
          if (bg) assert.equal(g, bg.value.toLowerCase(), `${hash} · ${way.name}: the bubble on --bg`);
        }
      }
    }
  } finally {
    app.restore();
  }
  assert.ok(seen >= 24, `${seen} tops and notes checked`);
  assert.match(CSS, /\n\.v2-plan \.sb-bubble-top, \.v2-plan \.sb-bubble-note, \.v2-sheet \.sb-linebub \.sb-bubble-note, \.v2-home \.sb-bubble-note, \.v2-proj \.sb-bubble-note \{ background: var\(--bg\); \}/);
});

// ---------------------------------------------------------------------------
// (g) The Timeline's sprint marks level

test('AC89 (g): a sprint\'s marks ("✓ merged ✓ review ✕ checks"), a mark with a reason among them, sit on one line at one size, each as tall as the others, so centred their tops are level (Chromium measures them within 1 px: the pull request\'s captures)', async () => {
  const app = await open({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } }, '#/p/Service-Desk/timeline');
  try {
    for (let i = 0; i < 8; i++) {
      const fold = findAll(app.view, (e) => e.dataset && /^fold:sprints:/.test(e.dataset.k || '') && e.attrs['aria-expanded'] === 'false')[0];
      if (!fold) break;
      await app.tap(fold);
    }
    let rows = 0;
    let withWhy = 0;
    for (const way of WAYS) {
      const tree = drawn(app, way);
      for (const st of nodes(tree).filter((n) => n.cls.has('v2-stats'))) {
        rows++;
        assert.equal(plain(st.declared.get('align-items')), 'center', 'one line, each mark centred in it');
        assert.equal(plain(st.declared.get('display')), 'flex');
        const heights = st.kids.map((m) => {
          const box = m.tag === 'details' ? m.kids.find((k) => k.tag === 'summary') : m;
          if (m.tag === 'details') withWhy++;
          assert.equal(plain(box.declared.get('font') || ''), '400 11px/1.35 "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', 'one size');
          return plain(box.declared.get('min-height') || '');
        });
        assert.ok(heights.every((x) => x === '24px'), `${way.name}: every mark 24 px tall (${heights.join(', ')})`);
      }
    }
    assert.ok(rows >= 30, `${rows} sprints' marks`);
    assert.ok(withWhy >= 1, 'a mark with a reason among them');
  } finally {
    app.restore();
  }
  assert.match(rule('.v2-timeline .v2-stats span.sb-mkw'), /^ min-height: 24px; $/);
  assert.match(rule('.v2-stats .sb-why > summary'), /min-height: 24px;/);
});

// ---------------------------------------------------------------------------
// (k) Words and drawing on the screens

test('AC89 (k): a tile\'s "Next:" names its own code once — "<id> · rough finish not available: <AC24\'s reason, its own code left out>"; another project\'s milestone stays named; " · may be out of date" or " · a newer estimate line could not be read" where J14 says so of the estimate', () => {
  const row = (o) => ({ code: 'MD1', estimate: { kind: 'past' }, finish: { words: 'not available: MD1 is past its estimate', na: true, stop: { index: 0, code: 'MD1', why: 'is past its estimate', project: 'Service-Desk' } }, ...o });
  assert.equal(nextLine(SD, { row: row({}) }).words, 'MD1 · rough finish not available: past its estimate', 'the spec\'s own example');
  assert.equal(nextLine(SD, { row: row({ code: 'MD3', estimate: { kind: 'ok' }, finish: { words: 'not available: MD1 has no estimate yet', na: true, stop: { index: 0, code: 'MD1', why: 'has no estimate yet', project: 'Service-Desk' } } }) }).words,
    'MD3 · rough finish not available: MD1 has no estimate yet', 'another of its own milestones: named');
  assert.equal(nextLine(SD, { row: row({ estimate: { kind: 'ok' }, finish: { words: 'x', na: true, stop: { index: 0, code: 'MD1', why: 'has no estimate yet', project: 'Twin' } } }) }).words,
    'MD1 · rough finish not available: Twin\'s MD1 has no estimate yet', 'another project\'s: "<project>\'s <code>"');
  // A stale estimate, and a newer line that could not be read (J14).
  assert.equal(nextLine(SD, { row: { code: 'M3A', estimate: { kind: 'ok', stale: true }, finish: { words: '25 Oct – 2 Nov' } } }).words, 'M3A · rough finish 25 Oct – 2 Nov · may be out of date');
  assert.equal(nextLine(SD, { row: { code: 'M3A', estimate: { kind: 'ok', stale: true, newer: true }, finish: { words: '25 Oct – 2 Nov' } } }).words, 'M3A · rough finish 25 Oct – 2 Nov · a newer estimate line could not be read');
  assert.equal(nextLine(SD, { row: row({ estimate: { kind: 'past', newer: true } }) }).words, 'MD1 · rough finish not available: past its estimate · a newer estimate line could not be read');
  // From Work ahead's real view: an estimate made 9 days before (J14's 7 days) marks the tile too.
  const v = viewOf({ extra: { 'intake/estimates.jsonl': WORKED('2026-10-09T17:00:00Z') }, nowMs: Date.parse('2026-10-18T18:00:00Z') });
  const md3 = v.rows.find((r) => r.code === 'MD3');
  assert.equal(md3.estimate.stale, true);
  assert.match(nextLine(SD, { row: md3 }).words, /^MD3 · rough finish .+ · may be out of date$/);
});

test('AC89 (k): a tile\'s phases sentence names each phase once — a phase still ahead is said where it last appears, never "ahead" twice (the Design reviewer\'s N4, stage 2 round 1: "…Build and Launch ahead; the Build gate waits on you; Launch and Done ahead")', async () => {
  const app = await open(textSetup(), '#/');
  try {
    const words = keyed(app, 'ptl-words:Alpha').textContent;
    assert.equal(words, 'Phases: Design and Build run 1 gone back over; now Design run 2; the Build gate waits on you; Launch and Done ahead');
    for (const ph of ['Launch', 'Done']) assert.equal(words.split(ph).length - 1, 1, `${ph} named once`);
    assert.equal(words.split('ahead').length - 1, 1, '"ahead" once');
  } finally {
    app.restore();
  }
  // As drawn (AC82), unchanged: each phase ahead in the latest run only.
  const c = (phase, state, extra = {}) => ({ phase, state, ...extra });
  assert.equal(timelineWords([{ k: 1, cells: [c('Discovery', 'done'), c('Design', 'gone'), c('Build', 'gone'), null, null] }, { k: 2, cells: [null, c('Design', 'now'), c('Build', 'ahead'), c('Launch', 'ahead'), c('Done', 'ahead')] }]),
    'Phases: Discovery finished; Design and Build run 1 gone back over; now Design run 2; Build, Launch and Done ahead');
});

test('AC89 (k): Plan\'s "not available" reason names another project\'s milestone as "<project>\'s <code>", as the tile does; within the project, AC24\'s words (made-up project and estimates, NOT real records)', () => {
  const TWIN = { ...SD, name: 'Twin', repo: 'shumpmaster/Twin', planning: false };
  const t = '2026-10-18T17:00:00Z';
  const sdLines = ['MD1', 'MD2', 'MD3', 'M3A', 'M3B', 'M3C'].map((m) => estLine(m, 1, 2, t, '', 'Service-Desk'));
  const v = viewOf({ extra: { 'intake/estimates.jsonl': [...sdLines, ...['MD2', 'MD3'].map((m) => estLine(m, 1, 2, t, '', 'Twin'))].join('\n') + '\n' }, nowMs: Date.parse('2026-10-18T18:00:00Z'), projects: [TWIN, SD, POOM] });
  const sd = v.rows.filter((r) => r.project.name === 'Service-Desk');
  assert.ok(sd.every((r) => r.finish.words === 'not available: Twin\'s MD1 has no estimate yet'), sd.map((r) => r.finish.words).join(' | '));
  assert.equal(v.rows.find((r) => r.project.name === 'Twin' && r.code === 'MD2').finish.words, 'not available: MD1 has no estimate yet');
  assert.equal(nextLine(SD, { row: sd[0] }).words, 'MD1 · rough finish not available: Twin\'s MD1 has no estimate yet', 'the tile, alike');
});

test('AC89 (k): a gate card is never counted in a milestone row\'s "<n> waiting on you in your Queue"; its own row says it waits; a question naming the milestone still counts (made-up gate card line and question, NOT real records)', async () => {
  const GATE = 'Service-Desk|gate|queue/P-003-launch-1.md';
  const log = `${j77Files()['dispatch-log/2026-10.jsonl'].trimEnd()}\n${JSON.stringify({ item: 'P-003', action: 'card', card: 1, gate: 'launch', role: 'user-rep', route: 'launch-gate', stage: 6, gate_n: 1, time: '2026-10-18T15:00:00Z', trigger: 'x' })}\n`;
  // AC85's made-up Launch-gate card, given a `Milestone: MD3` line under its answer line (made up).
  const gate = fixture('ac85/queue/P-003-launch-1.md').replace(/(\nanswer: [^\n]*\n)/, '$1Milestone: MD3\n');
  assert.ok(gate.includes('Milestone: MD3'));
  const question = '# Ruling needed: A made-up question about MD3\n\nWHY: NOT a real record: made up for AC89 (k)\'s test.\nMilestone: M3A\nOPTIONS:\n  A. Yes.\n  B. No.\nRECOMMENDATION: A — made up.\nRISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: none\nDEFAULT: none   TIMEOUT: none\n';
  const setup = waSetup({ extra: { 'intake/estimates.jsonl': WORKED(), 'queue/P-003-launch-1.md': gate, 'dispatch-log/2026-10.jsonl': log, 'questions/P-001-m3a-made-up.md': question } });
  const app = await open(setup, '#/work', { now: Date.parse('2026-10-18T18:00:00Z'), store: memStore() });
  try {
    assert.ok(keyed(app, `wa-gate:${GATE}`), 'the gate\'s own row');
    assert.match(keyed(app, `wa-gate:${GATE}`).textContent, /waits on you/);
    const you = (code) => findAll(app.view, (e) => e.dataset && new RegExp(`^wa-you:row:.*\\b${code}$`).test(e.dataset.k || ''))[0] || null;
    assert.ok(findAll(app.view, (e) => e.dataset && /^wa-you:row:/.test(e.dataset.k || '')).length >= 1, 'a row counts what waits');
    assert.equal(you('MD3'), null, 'MD3: the gate card not counted on it');
    assert.ok(you('M3A'), 'M3A: the question counts');
    assert.equal(you('M3A').textContent, '1 waiting on you in your Queue');
  } finally {
    app.restore();
  }
});

test('AC89 (k): Plan\'s rule-3 row (work filed in a run still to come) takes AC86\'s half-filled icon, "work filed"; with no work filed, the dashed ring as before (a made-up sprint on M3A\'s line, NOT a real record)', () => {
  const doc = j77Files()['docs/PROJECT.md'].replace(/(\(M3A\)[^\n]*· phase: Build)/, '$1 · sprints: PR #99');
  assert.ok(doc.includes('sprints: PR #99'));
  const v = viewOf({ extra: { 'intake/estimates.jsonl': WORKED(), 'docs/PROJECT.md': doc }, nowMs: Date.parse('2026-10-18T18:00:00Z') });
  const r = (code) => v.rows.find((x) => x.code === code);
  assert.deepEqual([r('M3A').state.rule, r('M3A').state.icon, r('M3A').state.words], [3, 'half', 'Work filed: PR #99']);
  assert.deepEqual([r('M3B').state.rule, r('M3B').state.icon], [3, 'planned'], 'rule 3 with no work filed keeps its icon');
  assert.deepEqual([r('MD1').state.rule, r('MD1').state.icon], [6, 'half'], 'AC86\'s half-filled icon is rule 6\'s');
});

test('AC89 (k): the ordering view\'s rows have no empty space under them (specs/S-001.md:7936) — a row with nothing under it keeps its two move controls stacked beside the row only, filling the row\'s own height, never taller than its words, a one-line row too; a row with lines under it keeps the controls\' column spanning them', async () => {
  // Rewritten at stage 6a's design review, round 2 (B1): stacked at 32 px each with their 4 px gap (68 px), the controls
  // left 15.1 px under a row whose name takes one line (52.9 px tall, Chromium). They now fill the row's height, each at
  // least 24 px. What this case can catch: the declarations that make them fill, and, from the cascade's own figures, that
  // the controls' least height fits in the shortest row a bare row can be (one line of name and one of code). What it
  // can't: the browser's layout itself (text that wraps, font metrics, grid sizing); that is the pull request's Chromium
  // captures, 0 px under every row and every name as wide as at db1474e, at 360 and 414 px, light and dark.
  const ord = async (setup) => {
    const app = await open(setup, '#/work', { now: Date.parse('2026-10-18T18:00:00Z'), store: memStore() });
    try {
      await app.tap(findAll(app.view, (e) => e.tag === 'button' && e.attrs['aria-pressed'] != null)[0]);
      return nodes(drawn(app, WAYS[2])).filter((n) => n.cls.has('v2-plli') && n.cls.has('ord'));
    } finally {
      app.restore();
    }
  };
  const moveOf = (li) => li.kids.find((k) => k.cls.has('v2-plmove'));
  const under = (li) => li.kids.some((k) => k.cls.has('v2-plunder'));
  const px = (v) => { const m = /^([\d.]+)px$/.exec(plain(v || '').trim()); assert.ok(m, `a length in px: ${v}`); return Number(m[1]); };
  const pad = (v) => plain(v).trim().split(/\s+/).map((x) => (x === '0' ? 0 : px(x)));
  // Every milestone estimated (the worked example): no row has lines under it.
  const bare = await ord(waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } }));
  assert.ok(bare.length >= 5, `${bare.length} rows in the ordering`);
  // The same with MD1's and MD2's names short enough for one line (made up, NOT a real record: shortRowsSetup).
  const short = await ord(shortRowsSetup());
  const names = short.map((li) => nodes(li).find((n) => n.cls.has('v2-plname')).text.trim());
  assert.ok(names.includes(SHORT_NAMES.MD1) && names.includes(SHORT_NAMES.MD2), names.join(' | '));
  // No estimates: every row has its "not estimated" line under it.
  const lined = await ord(waSetup({}));
  assert.ok(lined.length >= 5 && lined.every(under), 'each row with a line under it');
  for (const li of [...bare, ...short]) {
    assert.equal(under(li), false);
    const m = moveOf(li);
    assert.equal(m.kids.length, 2);
    assert.equal(plain(m.declared.get('grid-row')), '1', 'beside the row only');
    assert.equal(plain(m.declared.get('padding')), '0', 'unpadded');
    assert.equal(m.declared.get('grid-auto-flow'), undefined, 'stacked, not side by side: the names keep their width');
    assert.equal(plain(m.declared.get('align-self')), 'stretch', 'as tall as the row, from its words');
    assert.equal(plain(m.declared.get('grid-auto-rows')), 'minmax(24px, 1fr)', 'the row\'s height shared, each at least 24 px');
    for (const b of m.kids) assert.equal(plain(b.declared.get('height')), 'auto', 'each control its share, not its own 32 px');
    // The outcome, from the cascade's figures: the controls' least height (two 24 px tracks and their gap) fits in the
    // shortest this row can be, one line of its name and one of its code with the row's padding and the gap between.
    const row = li.kids.find((k) => k.cls.has('v2-plrow'));
    const prt = row.kids.find((k) => k.cls.has('v2-prt'));
    const name = nodes(prt).find((n) => n.cls.has('v2-plname'));
    const code = nodes(prt).find((n) => n.cls.has('v2-plm'));
    const [pt, , pb = pt] = pad(row.declared.get('padding'));
    const oneLine = pt + pb + px(name.style.get('line-height')) + px(prt.declared.get('gap')) + px(code.style.get('line-height'));
    const least = 2 * 24 + px(m.declared.get('gap'));
    assert.ok(least <= oneLine, `controls at least ${least} px in a row of ${oneLine.toFixed(1)} px at one line`);
  }
  for (const li of lined) {
    const m = moveOf(li);
    assert.equal(plain(m.declared.get('grid-row')), '1 / span 2', 'beside the row and the lines under it');
    assert.equal(plain(m.declared.get('padding')), '6px 0');
    assert.equal(plain(m.declared.get('grid-auto-rows')), '32px');
  }
  const r = rule('.v2-plmove');
  assert.match(r, /grid-column: 2; grid-row: 1 \/ span 2; display: grid; grid-auto-rows: 32px; gap: 4px; align-content: start; padding: 6px 0;/);
  assert.match(rule('.v2-plmv'), /width: 36px; height: 32px;/, 'a row with lines under it: 36 × 32');
  assert.doesNotMatch(CSS, /grid-auto-flow: column; grid-auto-columns: 36px/, 'no longer side by side');
  assert.match(rule('.v2-plrow'), /padding: 9px 0; min-height: 40px;/);
});

test('AC89 (k): the Timeline\'s band reads "Run <k> began <date>" where the run\'s record gives its start, as the page\'s "from <date>" does', async () => {
  const app = await open({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } }, '#/p/Service-Desk');
  try {
    const page = keyed(app, 'again:Design-i2').textContent;
    const date = /from (\d{1,2} [A-Z][a-z]{2})/.exec(page)[1];
    await app.go('#/p/Service-Desk/timeline');
    const blk = findAll(app.view, (e) => e.attrs && e.attrs['data-run'] === 'Design-i2')[0];
    assert.equal(byClass(blk, 'sb-began')[0].textContent, `Run 2 began ${date} · why it went back: not recorded`, 'the page\'s date on the band');
    assert.equal(byClass(byClass(blk, 'sb-began')[0], 'sb-began-k')[0].textContent, `Run 2 began ${date}`);
  } finally {
    app.restore();
  }
});

test('AC89 (k): the v2.5 page\'s CI row gives its workflow and date where AC29\'s read gives them, and "workflow and date not read" otherwise (a made-up run, NOT a real record)', async () => {
  const P = { name: 'Delta', defaultBranch: 'main', model: 'v2.5' };
  const snap = { tree: new Map(), records: new Map() };
  const at = Date.parse('2026-10-14T09:12:00Z');
  assert.equal(v25Rows(P, { ci: 'passing', ciKnown: true, ciRun: { name: 'tests', at } }, snap, NOW, TZ).ci, 'CI on main: passing · tests · 14 Oct');
  assert.equal(v25Rows(P, { ci: 'passing', ciKnown: true, ciRun: { name: 'tests', at: null } }, snap, NOW, TZ).ci, 'CI on main: passing · tests · date not read');
  assert.equal(v25Rows(P, { ci: 'none', ciKnown: true, ciRun: null }, snap, NOW, TZ).ci, 'CI on main: none · workflow and date not read');
  assert.equal(v25Rows(P, { ci: 'not read yet', ciKnown: false, ciRun: null }, snap, NOW, TZ).ci, 'CI on main: not read yet', 'the state says it was not read');
  // The run the state comes from: the failing one, else a running one, else the latest.
  const r = (name, status, conclusion, t) => ({ name, path: `.github/workflows/${name}.yml`, status, conclusion, at: t });
  assert.deepEqual(ciRunOf([r('a', 'completed', 'success', 3), r('b', 'completed', 'failure', 1)]), { name: 'b', at: 1 });
  assert.deepEqual(ciRunOf([r('a', 'completed', 'success', 3), r('b', 'in_progress', null, 1)]), { name: 'b', at: 1 });
  assert.deepEqual(ciRunOf([r('a', 'completed', 'success', 3), r('b', 'completed', 'success', 5)]), { name: 'b', at: 5 });
  assert.equal(ciRunOf([]), null);
  // On the page, from the read itself (the fake desk's workflow runs, with GitHub's `updated_at`).
  const s = textSetup();
  s.repos.Delta.runs.push({ name: 'tests', path: '.github/workflows/tests.yml', status: 'completed', conclusion: 'success', updatedAt: '2026-10-14T09:12:00Z' });
  const app = await open(s, '#/p/Delta');
  try {
    assert.match(app.view.textContent, /CI on main: passing · tests · 14 Oct/);
  } finally {
    app.restore();
  }
});

test('AC89 (k): "<n> more ▸" counts the parts not shown at all — a part cut at the third line counts as shown, and with only that, "more"', async () => {
  const app = await openSD('#/p/Service-Desk/timeline', { repoOpts: { ac61: true, answer: ac61Answer() } });
  try {
    await app.tap(keyed(app, 'fold:sprints:Design-i2:untied:run2'));
    const cut = () => findAll(app.view, (e) => e.attrs && e.attrs['data-bt'] != null);
    const sp = () => findAll(app.view, (e) => e.attrs && e.attrs['data-sprint'] === 'PR #906')[0];
    for (const el of cut()) {
      el.clientHeight = 34;
      el.scrollHeight = 34;
    }
    // PR #906's Context (AC61's two facts) in a 50 px box: the browser's measure, as the fake DOM can't lay out text.
    const ctx = byClass(byClass(sp(), 'v2-bl')[1], 'v2-bt')[0];
    ctx.clientHeight = 50;
    ctx.scrollHeight = 120;
    ctx.getBoundingClientRect = () => ({ top: 0, bottom: 50, height: 50, left: 0, right: 260, width: 260 });
    const facts = ctx.children.filter((c) => c.tag);
    const place = (tops) => facts.forEach((f, i) => { f.getBoundingClientRect = () => ({ top: tops[i], bottom: tops[i] + 40, height: 40, left: 0, right: 260, width: 260 }); });
    // The second fact starts below the box's foot: not shown at all.
    place([0, 52]);
    await app.resize(360);
    await app.flush();
    assert.deepEqual(byClass(app.view, 'v2-inmore').map((m) => m.textContent), ['1 more'], 'one part not shown at all');
    // The second fact starts on the third line and is cut there: it counts as shown, so no count, only "more".
    place([0, 34]);
    await app.resize(414);
    await app.flush();
    assert.deepEqual(byClass(app.view, 'v2-inmore').map((m) => m.textContent), ['more'], 'a part cut at the third line counts as shown');
  } finally {
    app.restore();
  }
});

test('AC89 (k): the ✕ mark\'s spoken name on a failed source check reads "source check failed", its drawn word hidden from assistive technology; a failed check still "failed checks"', async () => {
  const JS = readFileSync(join(SRC, 'lib', 'feed.js'), 'utf8');
  assert.match(JS, /\{ mark: '✕', word: 'source-checked', why: null, spoken: 'source check failed' \}/);
  const said = (el) => {
    if (!el.tag) return el.textContent;
    if (el.attrs && el.attrs['aria-hidden'] === 'true') return '';
    return el.children.map(said).join('');
  };
  // Service-Desk's records at 3117150 with a made-up FAIL verdict on Q-013's source check (NOT a real record).
  const r = sdRepo();
  const path = 'dispatch-log/2026-10.jsonl';
  r.files[path] = r.files[path].replace('"role":"source-checker","session":"Q-013:research-to-source:2026-10-08T21:48:30Z","time":"2026-10-08T21:52:08Z","trigger":"outcome","verdict":"PASS"',
    '"role":"source-checker","session":"Q-013:research-to-source:2026-10-08T21:48:30Z","time":"2026-10-08T21:52:08Z","trigger":"outcome","verdict":"FAIL"');
  assert.ok(r.files[path].includes('"verdict":"FAIL"'));
  const app = await open({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': r } }, '#/p/Service-Desk/timeline');
  try {
    for (let i = 0; i < 8; i++) {
      const fold = findAll(app.view, (e) => e.dataset && /^fold:sprints:/.test(e.dataset.k || '') && e.attrs['aria-expanded'] === 'false')[0];
      if (!fold) break;
      await app.tap(fold);
    }
    const sp = findAll(app.view, (e) => e.attrs && e.attrs['data-sprint'] === 'Q-013')[0];
    assert.ok(sp, 'Q-013\'s sprint');
    const m = byClass(byClass(sp, 'v2-stats')[0], 'sb-mkw').map((x) => said(x).replace(/\s+/g, ' ').trim());
    assert.ok(m.includes('source check failed'), m.join(' | '));
    assert.ok(byClass(sp, 'v2-stats')[0].textContent.includes('source-checked'), 'the drawn word stays');
  } finally {
    app.restore();
  }
});

test('AC89 (k): an unparseable portfolio card names its file once, its "can\'t parse" note cut at three lines with the fade, the whole in its sheet (made-up portfolio, NOT real records)', async () => {
  const read = { cards: [{ path: 'queue/PF-003-broken.md', file: 'PF-003-broken.md', rec: { title: null }, state: 'read', cantParse: 'no title under "## 1. The decision"', link: 'x' },
    { path: 'queue/PF-001-explore-1.md', file: 'PF-001-explore-1.md', rec: { title: 'A made-up decision' }, state: 'read', cantParse: null, link: 'y' }] };
  const [broken, ok] = portfolioCards(read);
  assert.equal(broken.title, 'PF-003-broken.md');
  assert.deepEqual(broken.meta, [], 'its file named once: as its title');
  assert.deepEqual(ok.meta, ['PF-001-explore-1.md'], 'a card with a title keeps its file beside it');
  const p = waSetup({});
  p.config = withPortfolio(p.config);
  addPortfolio(p.repos, pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1), 'PF-003-broken.md': 'Not a card (made up, NOT a real record)\n' } }));
  const app = await open(p, '#/waiting', { now: Date.parse('2026-10-22T18:00:00Z'), store: memStore() });
  try {
    const id = ':portfolio|portfolio|queue/PF-003-broken.md';
    const card = findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === id)[0];
    assert.ok(card, 'its card');
    assert.equal(card.textContent.split('PF-003-broken.md').length - 1, 1, 'the file named once');
    const note = keyed(app, `wclip:${id}`);
    assert.ok(note && /^can't parse: /.test(note.textContent), 'its note');
    assert.equal(note.attrs['data-clip'], `note:${id}`, 'measured by the browser');
    note.clientHeight = 46;
    note.scrollHeight = 92;
    await app.resize(360);
    assert.match(keyed(app, `wclip:${id}`).className, /\bover\b/, 'cut: faded');
  } finally {
    app.restore();
  }
  assert.match(rule('.v2-why.v2-wclip'), /max-height: calc\(3 \* 1\.4em\); overflow: hidden; overflow: clip;/);
  assert.match(rule('.v2-why.v2-wclip.over'), /mask-image: linear-gradient\(#000 60%, transparent\);/);
  assert.doesNotMatch(rule('.v2-why.v2-wclip'), /ellipsis/);
});

// Stage 6a's Reviewer, round 1: B1 (a second waiting gate card disappearing from Plan) and B2 (AC24's count of a decision
// card naming a milestone).
const gateCard = (item, ms) => fixture('ac85/queue/P-003-launch-1.md').replace(/P-003/g, item).replace(/(\nanswer: [^\n]*\n)/, `$1Milestone: ${ms}\n`);
const gateLine = (item, time) => JSON.stringify({ item, action: 'card', card: 1, gate: 'launch', role: 'user-rep', route: 'launch-gate', stage: 6, gate_n: 1, time, trigger: 'x' });

test('AC86 with AC89 (k) (stage 6a\'s review, B1): two gate cards waiting on the owner in one project — each a row of its own at the top of its project\'s group, in the board\'s order, each opening its own card; neither counted on the milestone it names; Home\'s tile takes the first (made-up cards from AC85\'s, NOT real records)', async () => {
  const log = `${j77Files()['dispatch-log/2026-10.jsonl'].trimEnd()}\n${gateLine('P-003', '2026-10-18T15:00:00Z')}\n${gateLine('P-004', '2026-10-18T15:10:00Z')}\n`;
  const setup = waSetup({ extra: { 'intake/estimates.jsonl': WORKED(), 'queue/P-003-launch-1.md': gateCard('P-003', 'M3A'), 'queue/P-004-launch-1.md': gateCard('P-004', 'M3A'), 'dispatch-log/2026-10.jsonl': log } });
  const app = await open(setup, '#/waiting', { now: Date.parse('2026-10-18T18:00:00Z'), store: memStore() });
  try {
    const board = findAll(app.view, (e) => e.attrs && /\|gate\|/.test(e.attrs['data-card'] || '')).map((e) => e.attrs['data-card']);
    assert.equal(board.length, 2, 'both on the board');
    await app.go('#/work');
    const grp = keyed(app, 'wa-grp:Service-Desk');
    const list = byClass(grp, 'v2-rows')[0];
    const gates = list.children.filter((li) => li.attrs && li.attrs['data-gate'] != null);
    assert.deepEqual(gates.map((li) => li.attrs['data-gate']), board, 'a row each, in the board\'s order');
    assert.deepEqual(list.children.slice(0, 2), gates, 'at the top of the group');
    for (const id of board) {
      const a = keyed(app, `wa-gate:${id}`);
      assert.equal(a.attrs.href, `#/work/card/${encodeURIComponent(id)}`, `${id}: opens its own card`);
      assert.match(a.textContent, /Launch gate · waits on you/);
    }
    assert.equal(findAll(app.view, (e) => e.dataset && /^wa-you:row:/.test(e.dataset.k || '')).length, 0, 'no milestone row counts either gate card');
    // Each opens its own sheet over Plan.
    await app.go(`#/work/card/${encodeURIComponent(board[1])}`);
    assert.match(byClass(app.view, 'v2-sheet')[0].textContent, /P-004/, 'the second card\'s own sheet');
    // Home's tile: the first gate card, as Plan's first gate row (one rule, gateCardOf).
    await app.go('#/');
    const tile = keyed(app, 'card:Service-Desk');
    assert.match(tile.textContent, /Next: the launch gate, after your ruling/i);
  } finally {
    app.restore();
  }
});

test('AC24 (stage 6a\'s review, B2): a decision card — not a gate — whose `Milestone:` line names a milestone counts "1 waiting on you in your Queue" on that row (Service-Desk\'s real stop card, given a made-up `Milestone: MD3` line, NOT a real record)', async () => {
  const card = fixture('service-desk/queue/P-001-stop-6.md').replace(/(\nanswer: [^\n]*\n)/, '$1Milestone: MD3\n');
  assert.ok(card.includes('\nMilestone: MD3\n'));
  const line = JSON.stringify({ item: 'P-001', action: 'card', card: 6, gate: 'stop', role: 'critic-triage', route: 'triage-return', stage: 3, time: '2026-10-18T15:00:00Z', trigger: 'x' });
  const log = `${j77Files()['dispatch-log/2026-10.jsonl'].trimEnd()}\n${line}\n`;
  const setup = waSetup({ extra: { 'intake/estimates.jsonl': WORKED(), 'queue/P-001-stop-6.md': card, 'dispatch-log/2026-10.jsonl': log } });
  const app = await open(setup, '#/waiting', { now: Date.parse('2026-10-18T18:00:00Z'), store: memStore() });
  try {
    assert.ok(findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === 'Service-Desk|card|queue/P-001-stop-6.md').length, 'the decision card waits');
    await app.go('#/work');
    const you = findAll(app.view, (e) => e.dataset && /^wa-you:row:.*\bMD3$/.test(e.dataset.k || ''))[0];
    assert.ok(you, 'MD3 counts it');
    assert.equal(you.textContent, '1 waiting on you in your Queue');
    assert.equal(findAll(app.view, (e) => e.dataset && /^wa-you:row:/.test(e.dataset.k || '')).length, 1, 'on MD3 only');
  } finally {
    app.restore();
  }
});
