// ac-test: S-001/AC83 — a project's page (desk mockup v2, frames 5, 6, 6b and 8; stage 3): its top line, the
// one sentence, the phase strip, why a phase ran again and the last action, the two rows and their taps, the
// milestones by phase (the project's own and the model's standard ones together, one folded line per phase,
// read from the bottom up), the three states told apart, the why line once, no key, the rest's rows and
// counts, a v2.5 project's page and its "Not used" list, and AC36's views reachable from "Details".
//
// The page is the sandbox's own code under the fake DOM. Records: Service-Desk's at 77bfeae, real
// (tests/desk/fixtures/j11-77bfeae/, with its AGENTS.md and governance/OPERATING_MODEL_VERSION, J23);
// Personal-Org-Operating-Model in poom/'s placeholder form, its VERSION and AGENTS.md line made up (never its
// files); and made-up records, each NOT a real record and labelled so where it is written: all 24 standard
// lines with some skipped, a run 2 with a recorded reason, a project in its first run, and one that is Done.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC, CONFIG } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll, linksIn } from './sandbox-helpers.mjs';
import { j77Files, j77Tree, poomFiles, snapOf, SD, POOM, TZ } from './wa-fixtures.mjs';
import { STANDARD_MILESTONES, NOT_RECORDED_IDS } from '../../src/lib/timeline.js';
import { j11Records, timelineOf, phaseView } from '../../src/lib/sandbox.js';
import { runsContext } from '../../src/lib/feed.js';
import { pageSentence, firstPart, phaseStrip, phaseLine, ranAgainLines, milestonesByPhase, detailWords, v25Rows, PAGE_WORDS, STANDARD_TOTAL } from '../../src/lib/projectpage.js';
import { topLine } from '../../src/lib/versions.js';
import { mixState, MIX_PROJECT, NOW as GLANCE_NOW } from './glance-fixtures.mjs';

const NOW = Date.parse('2026-10-19T21:00:00Z');
const css = () => readFileSync(`${SRC}/public/sandbox.css`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (sel) => {
  const m = new RegExp(`(?:^|\\n)${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`).exec(css());
  assert.ok(m, `a rule for ${sel}`);
  return m[1];
};
const PUB = { ...POOM, publishesModel: true };
/** Personal-Org-Operating-Model's VERSION and AGENTS.md line in placeholder form (NOT real records: it is private). */
const POOM_PLACEHOLDER = { VERSION: '3.5.0\n', 'AGENTS.md': '# (placeholder, NOT a real record)\n\ntier: T1   # placeholder comment\n' };
/** The experiments/ paths 77bfeae's tree holds (tree.txt), each with placeholder text: the page counts and names them from the tree only. */
const EXPERIMENTS = Object.fromEntries(j77Tree().filter((p) => p.startsWith('experiments/')).map((p) => [p, '(placeholder: only the path is read)\n']));
const PROJECT_DOC = j77Files()['docs/PROJECT.md'];
/** All 24 standard lines written, Design-2 and Build-4 skipped (made up, NOT a real record), in section 3. */
const ALL_24 = PROJECT_DOC.replace(/^## 3\. The 25,000-foot plan\n/m, (h) => `${h}${STANDARD_MILESTONES.map(([id]) => `- ${id} (standard) · ${['Design-2', 'Build-4'].includes(id) ? 'skipped' : 'taken on'} · why: made up for the test, ${id}`).join('\n')}\n`);

async function openPage(hash, { extra = {}, poom = {}, projects = [SD, PUB], store = null } = {}) {
  const repos = { 'Service-Desk': repo({ ...j77Files(), ...EXPERIMENTS, ...extra }), 'Personal-Org-Operating-Model': repo({ ...poomFiles(), ...POOM_PLACEHOLDER, ...poom }) };
  const app = await loadSandbox({ config: { ...CONFIG, ownerTimeZone: TZ, projects }, repos, hash, now: NOW, store });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const line = (app, ph) => findAll(keyed(app, 'ms-lines'), (e) => e.attrs && e.attrs['data-phase'] === ph)[0];
const fold = (app, ph) => findAll(line(app, ph), (e) => e.tag === 'button')[0];
const rowsIn = (el) => findAll(el, (e) => / v2-sm /.test(` ${e.className} `));
const iconOf = (el) => findAll(el, (e) => e.tag === 'svg')[0].attrs.class.split(' ')[1];
/** The model's context for Service-Desk's records at 77bfeae (plus `extra`), as the page builds it. */
function ctxOf(extra = {}) {
  const snap = snapOf({ ...j77Files(), ...extra });
  const j = j11Records(SD, snap);
  const tl = timelineOf(j);
  const pv = phaseView(SD, tl, snap.tree, j);
  return { snap, ctx: runsContext(SD, snap, j, tl, pv, NOW, TZ) };
}

// ---------------------------------------------------------------------------
// The top (frame 5): the name, the top line, the switch

test('AC83: the top — the back control and the name as the title; in Plex Mono "<model> · model <version> · <tier>" (J23: Service-Desk\'s real files; the `tier:` line\'s comment stripped); " · publishes model <VERSION>" for the project J7 marks; then "Overview | Timeline", Overview shaded', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    const head = keyed(app, 'page-head');
    assert.equal(byClass(head, 'v2-title')[0].textContent, 'Service-Desk');
    assert.equal(keyed(app, 'top-line').textContent, 'v3 · model 3.5.0 · T1');
    assert.match(keyed(app, 'top-line').className, /\bv2-mono\b/);
    assert.equal(keyed(app, 'nav-back').attrs['aria-label'], 'Back');
    const seg = findAll(keyed(app, 'page-switch'), (e) => e.tag === 'a');
    assert.deepEqual(seg.map((a) => [a.textContent, a.attrs.href, a.attrs['aria-current'] || null]), [['Overview', '#/p/Service-Desk', 'page'], ['Timeline', '#/p/Service-Desk/timeline', null]]);
    assert.match(rule('.v2-sega[aria-current="page"]'), /background: var\(--bg\); color: var\(--ink\);/, 'the current one shaded');
    await app.go('#/p/Personal-Org-Operating-Model');
    assert.equal(keyed(app, 'top-line').textContent, 'v2.5 pipeline · model not recorded · T1 · publishes model 3.5.0', 'frame 8, in the criterion\'s form');
  } finally {
    app.restore();
  }
  // A `tier:` line with none (made up) and the publishesModel part on a v3 entry (J23, allowed).
  const files = { ...j77Files(), 'AGENTS.md': '# A charter with no tier line (made up, NOT a real record)\n' };
  assert.equal(topLine(SD, snapOf(files)), 'v3 · model 3.5.0 · tier not recorded');
  assert.equal(topLine({ ...SD, publishesModel: true }, snapOf({ ...j77Files(), VERSION: '3.6.0\n' })), 'v3 · model 3.5.0 · T1 · publishes model 3.6.0');
});

// ---------------------------------------------------------------------------
// The one sentence and the strip

test('AC83: the one sentence (--t-lead) — "<now phase>, <first time through | second time through | run <k>>. Next: <the next milestone to reach, by its name>."; "Next: not recorded"; "Done."; a v2.5 project\'s "Sprint <id> is open. Nothing waits on you."', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    assert.equal(keyed(app, 'sentence').textContent, 'Design, second time through. Next: The chosen design running on the real back end.', 'MD3, the next to reach at 77bfeae, by its name');
    assert.match(rule('.v2-lead'), /font: var\(--t-lead\);/);
    await app.go('#/p/Personal-Org-Operating-Model');
    assert.equal(keyed(app, 'sentence').textContent, 'Sprint m1.4 is open. Nothing waits on you.');
  } finally {
    app.restore();
  }
  const { ctx, snap } = ctxOf();
  assert.equal(pageSentence({ ...ctx, next: null }, { snap }), 'Design, second time through. Next: not recorded.');
  assert.equal(pageSentence({ ...ctx, pv: { ...ctx.pv, done: true } }, { snap }), 'Done.', 'Done (AC50): "Done" once the project is');
  // A project in its first run (made up, NOT a real record): the now run's column is 1.
  const k1 = new Map(ctx.cols.k);
  for (const r of ctx.cols.runs) k1.set(r, 1);
  assert.equal(pageSentence({ ...ctx, cols: { ...ctx.cols, k: k1 } }, { snap }), 'Design, first time through. Next: The chosen design running on the real back end.');
  const k3 = new Map(ctx.cols.k);
  k3.set(ctx.now, 3);
  assert.equal(pageSentence({ ...ctx, cols: { ...ctx.cols, k: k3 } }, { snap }), 'Design, run 3. Next: The chosen design running on the real back end.');
  // v2.5: what waits, as the board counts it; nothing said of it before the project is read (Part A item 5).
  const p = { ...ctx, project: PUB };
  const ps = snapOf({ ...poomFiles() }, 'v2.5');
  assert.equal(pageSentence(p, { snap: ps, waits: { n: 2, read: 'ok' } }), 'Sprint m1.4 is open. 2 wait on you.');
  assert.equal(pageSentence(p, { snap: ps, waits: { n: 1, read: 'ok' } }), 'Sprint m1.4 is open. 1 waits on you.');
  assert.equal(pageSentence(p, { snap: ps, waits: { n: 0, read: 'checking' } }), 'Sprint m1.4 is open.');
  assert.equal(pageSentence(p, { snap: snapOf({ 'docs/LEDGER.md': poomFiles()['docs/LEDGER.md'] }, 'v2.5'), waits: { n: 0, read: 'ok' } }), 'No open sprint. Nothing waits on you.');
  assert.equal(firstPart('Sprint m1.4 is open. Nothing waits on you.', 'v2.5'), 'Sprint m1.4 is open.');
});

test('AC83 (frame 5; P-001-redesign-conflicts.md, answer 4): the strip — Discovery, Design, Build and Launch left to right, each a thin bar in its phase\'s colour, solid where finished or now and dashed where to come, over its icon and name, its state in words; a v2.5 project\'s last four sprints, "closed" or "open"', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    const cells = findAll(keyed(app, 'strip'), (e) => e.tag === 'li');
    assert.deepEqual(cells.map((c) => [byClass(c, 'v2-pnm')[0].textContent, byClass(c, 'v2-ps')[0].textContent, iconOf(c), c.className.split(' ').find((x) => /^b-/.test(x)), c.className.split(' ').find((x) => /^ph-/.test(x))]), [
      ['Discovery', 'finished', 'st-check', 'b-solid', 'ph-disc'],
      ['Design', 'run 2 · now', 'st-half', 'b-solid', 'ph-des'],
      ['Build', 'run 1 gone back over · run 2 ahead', 'st-pastcheck', 'b-dashed', 'ph-build'],
      ['Launch', 'planned', 'st-planned', 'b-dashed', 'ph-launch'],
    ]);
    assert.ok(cells[1].className.split(' ').includes('now'), 'the now phase');
    assert.equal(cells.length, 4, 'Done is not a column');
    assert.match(rule('.v2-bar3'), /height: 3px; border-radius: 2px; background: var\(--phc\);/);
    assert.match(rule('.v2-ph.b-dashed .v2-bar3'), /background: repeating-linear-gradient\(90deg, var\(--phc\) 0 6px, transparent 6px 10px\);/);
    assert.match(rule('.v2-strip'), /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/, 'side by side');
    await app.go('#/p/Personal-Org-Operating-Model');
    assert.deepEqual(findAll(keyed(app, 'strip'), (e) => e.tag === 'li').map((c) => [byClass(c, 'v2-pnm')[0].textContent, byClass(c, 'v2-ps')[0].textContent]), [['m1.4', 'open']],
      'the placeholder\'s one sprint file, open');
  } finally {
    app.restore();
  }
  const { ctx, snap } = ctxOf();
  assert.deepEqual(phaseStrip({ ...ctx, pv: { ...ctx.pv, done: true } }, snap).cells.map((c) => c.words), ['finished', 'finished', 'finished', 'finished'], 'Done');
  assert.deepEqual(phaseStrip({ ...ctx, now: null }, snap).cells.map((c) => c.words), ['not recorded', 'not recorded', 'not recorded', 'not recorded'], 'no now run');
  const sprints = { 'docs/sprints/m1.1-foundation.md': 'x', 'docs/sprints/m1.2-enforcement-and-pilot.md': 'x', 'docs/sprints/m1.3-pilot-and-s004.md': 'x', 'docs/sprints/m1.4-v3-build.md': 'x', 'docs/sprints/m1.0-start.md': 'x' };
  const ps = snapOf({ ...poomFiles(sprints) }, 'v2.5');
  for (const p of Object.keys(sprints)) ps.records.set(p, { open: /m1\.4/.test(p), title: p });
  assert.deepEqual(phaseStrip({ ...ctx, project: PUB }, ps).cells.map((c) => [c.phase, c.words]), [['m1.1', 'closed'], ['m1.2', 'closed'], ['m1.3', 'closed'], ['m1.4', 'open']], 'at most the last four');
});

// Rewritten in G4 of "After the glance audit" (AC83's note "Changed after the glance audit": "unrecorded ran-again lines
// said once"; AC91 (j); P-001-glance-ran-again.md, A): a single unrecorded line keeps this form, in the grey of a gap the
// agents fill; two or more become one, "<Phase> and <Phase> ran again · why: not recorded" (the made-up project of
// tests/desk/glance-fixtures.mjs, NOT real records, whose Design and Build both ran again with no reason recorded).
test('AC83 (AC70, AC55; AC91 (j), rewritten in G4): under the strip, in small text, "<phase> ran again from <date> · why it went back: not recorded" (77bfeae) or the reason quoted with its source (made up); two unrecorded said once; then "Your last action"', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    const under = keyed(app, 'under');
    assert.equal(under.children[0].textContent, 'Design ran again from 8 Oct · why it went back: not recorded', 'a single unrecorded line: AC83\'s form');
    assert.match(under.children[0].className, /\bv2-small\b/);
    assert.match(under.children[0].className, /\bgap\b/, 'in the grey of a gap the agents fill (AC69)');
    assert.match(under.children[1].textContent, /^Your last action: /);
  } finally {
    app.restore();
  }
  const mix = await loadSandbox({ ...mixState(), hash: `#/p/${MIX_PROJECT}`, now: GLANCE_NOW });
  try {
    await mix.advance(1000);
    await mix.advance(61_000);
    const under = findAll(mix.view, (e) => e.dataset && e.dataset.k === 'under')[0];
    assert.deepEqual(under.children.slice(0, -1).map((c) => [c.textContent, c.className]), [['Design and Build ran again · why: not recorded', 'v2-small gap']],
      'two unrecorded: one line, the phases in the strip\'s order, no dates');
  } finally {
    mix.restore();
  }
  // A run 2 with a recorded reason (made up, NOT a real record): a dor recycle line and its answer's Reason: line.
  const { ctx } = ctxOf({ 'decisions/P-001/dor-2.md': 'Decision: recycle\nReason: the design must start again from the owner\'s phone.\n' });
  const d2 = ctx.cols.runs.find((r) => r.label() === 'Design i2');
  const run = { ...d2, item: 'P-001', first: 100000 };
  const byItem = new Map(ctx.tl.byItem);
  byItem.set('P-001', [...(ctx.tl.byItem.get('P-001') || []), [99999, { item: 'P-001', trigger: 'decision', gate: 'dor', card: 2, word: 'recycle', record: 'decisions/P-001/dor-2.md', time: '2026-10-08T15:30:00Z' }]]);
  const k = new Map(ctx.cols.k);
  k.set(run, 2);
  const made = { ...ctx, tl: { ...ctx.tl, byItem }, cols: { ...ctx.cols, runs: ctx.cols.runs.map((r) => (r === d2 ? run : r)), k } };
  const [x] = ranAgainLines(made, TZ);
  assert.equal(x.words, 'Design ran again from 8 Oct · why it went back: “the design must start again from the owner\'s phone.”');
  assert.deepEqual(x.source, { words: 'your ruling · decisions/P-001/dor-2.md', href: 'https://github.com/shumpmaster/Service-Desk/blob/main/decisions/P-001/dor-2.md' });
});

// ---------------------------------------------------------------------------
// The two rows

// Rewritten in G4 of "After the glance audit" (AC83's note "Changed after the glance audit": ""Nothing waiting on you"
// soft"; AC91 (j)): the calm row's title takes the soft row (`.v2-prtt.soft`), the waiting row's does not.
test('AC83 (AC91 (j), rewritten in G4): the two rows, each a tap — "◆ <n> wait on you" with the waiting items\' short names joined by " · ", opening Waiting with only this project shown; "Nothing waiting on you", soft, with a ✓ and "checked <age> ago"; "Checking…" before a read; "At work now: …" with "with the agents: <n>", opening the Team screen', async () => {
  // Two questions waiting on the owner (made up, NOT real records).
  const q = (title) => `# Ruling needed: ${title}\n\nWHY: made up for the test.\nOPTIONS:\n  A. Yes.\n  B. No.\nRECOMMENDATION: A\nRISK CLASS: R0\nREVERSIBILITY: reversible\nBLAST RADIUS: none\nDEFAULT: A\nTIMEOUT: 48\n`;
  const app = await openPage('#/p/Service-Desk', { extra: { 'questions/P-001-made-up-one.md': q('the first made-up question'), 'questions/P-001-made-up-two.md': q('the second made-up question') } });
  try {
    const waits = keyed(app, 'page-waits');
    assert.equal(byClass(waits, 'v2-prtt')[0].textContent, '2 wait on you');
    assert.equal(byClass(waits, 'v2-prtt')[0].className, 'v2-prtt', 'what waits keeps the row\'s own weight (500 13 px --ink)');
    assert.equal(iconOf(waits), 'st-you', 'the ◆, in vermilion (AC81)');
    // Rewritten for AC89 (c) (specs/S-001.md:7863-7870; AC83's note, :7430): each item by its short name, "question <its
    // file's name>", the name in Plex Mono, never its title.
    assert.deepEqual(byClass(waits, 'v2-small')[0].textContent.split(' · ').sort(), ['question P-001-made-up-one', 'question P-001-made-up-two']);
    assert.deepEqual(byClass(byClass(waits, 'v2-small')[0], 'v2-mono').map((x) => x.textContent).sort(), ['P-001-made-up-one', 'P-001-made-up-two']);
    assert.equal(waits.attrs.href, '#/waiting/Service-Desk', 'Waiting with only this project shown (AC80, frame 2)');
    await app.tap(waits);
    await app.go(waits.attrs.href);
    assert.equal(byClass(app.view, 'v2-filter').length, 1, 'Waiting, filtered');
    await app.go('#/p/Service-Desk');
    const work = keyed(app, 'page-work');
    assert.equal(byClass(work, 'v2-prtt')[0].textContent, 'At work now: no agent run recorded since 8 Oct', 'as the tile says it (AC82)');
    assert.equal(byClass(work, 'v2-small')[0].textContent, 'with the agents: 0', 'AC80\'s quiet line, for this project');
    assert.equal(work.attrs.href, '#/p/Service-Desk/team', 'the Team screen (P-001-team-screen.md, A)');
    await app.go(work.attrs.href);
    assert.ok(byClass(app.view, 'v2-phl').length, 'the Team screen, opening with the phase line (AC84)');
    await app.go('#/p/Personal-Org-Operating-Model');
    const quiet = keyed(app, 'page-waits');
    assert.equal(byClass(quiet, 'v2-prtt')[0].textContent, 'Nothing waiting on you');
    assert.equal(byClass(quiet, 'v2-prtt')[0].className, 'v2-prtt soft', 'the soft row: calm looks calm (AC91 (j))');
    assert.match(rule('.v2-prtt.soft, .v2-prow.soft .v2-prtt'), /color: var\(--ink2\); font-weight: 400;/, '400 13 px --ink2');
    assert.equal(iconOf(quiet), 'st-check', 'with a ✓');
    assert.match(byClass(quiet, 'v2-small')[0].textContent, /^checked \d+ s ago$/, 'and "checked <age> ago" (frame 8)');
    assert.equal(keyed(app, 'page-work'), null, 'no "At work now" for a v2.5 project (frame 8)');
  } finally {
    app.restore();
  }
  // Before the first read: "Checking…", never a quiet "Nothing waiting".
  const repos = { 'Service-Desk': repo({ ...j77Files() }) };
  const cold = await loadSandbox({ config: { ...CONFIG, projects: [SD] }, repos, hash: '#/p/Service-Desk', now: NOW });
  try {
    assert.equal(byClass(findAll(cold.view, (e) => e.dataset && e.dataset.k === 'page-waits')[0], 'v2-prtt')[0].textContent, 'Checking…');
  } finally {
    cold.restore();
  }
});

// ---------------------------------------------------------------------------
// Milestones by phase

test('AC83 (frames 5, 6; P-001-milestones-together.md, A): one line per phase, bottom up, the own and the standard together — its square, name, state word, fold mark and one line of detail ("Yours: …" with "reached" or "in progress", earlier runs\' reached ones after "run <k>:", "Standard: <k> of <n> <reached | recorded>" or "0 of <n>, not recorded yet"); headed "Milestones by phase · yours and the model\'s 24" with "↑ start at the foot"', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    const head = keyed(app, 'ms-h');
    assert.equal(byClass(head, 'v2-shw')[0].textContent, "Milestones by phase · yours and the model's 24");
    assert.equal(byClass(head, 'v2-mono')[0].textContent, '↑ start at the foot');
    assert.equal(STANDARD_TOTAL, 24);
    const got = ['Launch', 'Build', 'Design', 'Discovery'].map((ph) => [ph, byClass(fold(app, ph), 'v2-sv')[0].textContent, byClass(fold(app, ph), 'v2-sd')[0].textContent]);
    assert.deepEqual(got, [
      ['Launch', 'planned', 'Yours: M3C · Standard: 0 of 5, not recorded yet'],
      ['Build', 'run 2 ahead', 'Yours: M3A, M3B · run 1: M1, M2, M2B reached · Standard: 0 of 5 recorded'],
      ['Design', 'run 2 · now', 'Yours: MD1 in progress, MD2 in progress, MD3 · Standard: 0 of 6 recorded'],
      ['Discovery', 'finished', 'Standard: 4 of 8 reached'],
    ]);
    assert.equal(findAll(byClass(fold(app, 'Design'), 'v2-sd')[0], (e) => e.tag === 'b')[0].textContent, '0 of 6', 'the count in weight 600');
    for (const ph of ['Launch', 'Build', 'Design', 'Discovery']) {
      assert.equal(fold(app, ph).attrs['aria-describedby'], `phase-d-${ph}`, `${ph}: its detail describes it`);
      assert.equal(byClass(fold(app, ph), 'vi-chev').length, 1, `${ph}: its fold mark`);
    }
  } finally {
    app.restore();
  }
  // With every standard line written (made up): skipped and taken on counted, the line's own words where nothing has run.
  const lines = milestonesByPhase(ctxOf({ 'docs/PROJECT.md': ALL_24 }).ctx).lines;
  assert.deepEqual(lines.map((l) => detailWords(l.detail)), [
    'Yours: M3C · Standard: 0 of 5, 5 taken on',
    'Yours: M3A, M3B · run 1: M1, M2, M2B reached · Standard: 0 of 5 recorded, 1 skipped',
    'Yours: MD1 in progress, MD2 in progress, MD3 · Standard: 0 of 6 recorded, 1 skipped',
    'Standard: 4 of 8 reached',
  ]);
});

test('AC83 (frame 6; notes 2, 12, 15, 19): opened, a thin line with an arrow pointing up; the latest run first, "Run <k> · <its dates> · <how it ran>", then "Yours", the first at the foot, then "The model\'s standard <n>", <Phase>-1 at the foot; then each earlier run, smaller, its unrecorded ones gathered', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    await app.tap(fold(app, 'Design'));
    const open = keyed(app, 'stdl:Design');
    assert.equal(fold(app, 'Design').attrs['aria-controls'], 'phase-Design');
    assert.deepEqual(byClass(open, 'v2-runh').map((x) => x.textContent), ['Run 2 · 8 Oct – now', 'Run 1 · 5–8 Oct · gone back over']);
    assert.deepEqual(byClass(open, 'v2-subh').map((x) => x.textContent), ['Yours', "The model's standard six"]);
    assert.deepEqual(rowsIn(keyed(app, 'own:Design-i2')).map((r) => byClass(r, 'v2-id')[0].textContent), ['MD3', 'MD2', 'MD1'], 'yours, the first (MD1) at the foot');
    assert.deepEqual(rowsIn(keyed(app, 'std:Design-i2')).map((r) => byClass(r, 'v2-id')[0].textContent), ['Design-6', 'Design-5', 'Design-4', 'Design-3', 'Design-2', 'Design-1'], 'Design-1 at the foot');
    const old = keyed(app, 'old:Design-i1');
    assert.match(old.className, /\bold\b/, 'an earlier run, smaller and softer (note 2)');
    assert.deepEqual(rowsIn(old).map((r) => r.textContent), ['Design-6 A plan that passed reviewnot reached', 'Design-1 Done defined in real scenariosreached', 'Design-2 to Design-5 · not recorded, or no record in the model']);
    assert.match(rule('.v2-sm.old .v2-smn'), /font: var\(--t-small\); color: var\(--ink2\);/);
    // Each row: its icon in a plain circle, its id in Plex Mono, its name, its state in words under it.
    const md3 = rowsIn(keyed(app, 'own:Design-i2'))[0];
    assert.equal(iconOf(md3), 'st-next', 'the gold ring for next to reach');
    assert.equal(byClass(md3, 'v2-sms')[0].textContent, 'next to reach');
    assert.match(rule('.v2-id'), /font: var\(--t-mono\);/);
    // Folding or opening one line never moves another; a refresh keeps each as left (AC56).
    await app.tap(fold(app, 'Launch'));
    assert.equal(keyed(app, 'stdl:Design'), open, 'Design stays open, the same element');
    app.module.refresh();
    await app.flush();
    assert.equal(fold(app, 'Launch').attrs['aria-expanded'], 'true');
    assert.equal(keyed(app, 'stdl:Design'), open);
  } finally {
    app.restore();
  }
});

test('AC83 (the README, inventory §4; part B, item 30): the three states told apart — "skipped" with its why (made up), a dashed circle with "?" and "not recorded yet", a slashed circle with "no record for this in the model yet" for the ids the model\'s trace never reads; each with its words; and "taken on · why: …", never shown as missing', async () => {
  const app = await openPage('#/p/Service-Desk', { extra: { 'docs/PROJECT.md': ALL_24 } });
  try {
    await app.tap(fold(app, 'Design'));
    await app.tap(fold(app, 'Build'));
    const row = (id) => rowsIn(keyed(app, `std:${id.startsWith('Build') ? 'Build-i2' : 'Design-i2'}`)).find((r) => byClass(r, 'v2-id')[0].textContent === id);
    assert.deepEqual([iconOf(row('Design-2')), byClass(row('Design-2'), 'v2-sms')[0].textContent], ['st-skip', 'skipped · why: made up for the test, Design-2']);
    assert.match(row('Design-2').className, /\bsoft\b/, 'in softer text');
    assert.deepEqual([iconOf(row('Design-4')), byClass(row('Design-4'), 'v2-sms')[0].textContent], ['st-planned', 'taken on · why: made up for the test, Design-4']);
    assert.deepEqual([iconOf(row('Design-5')), byClass(row('Design-5'), 'v2-sms')[0].textContent], ['st-planned', 'taken on · why: made up for the test, Design-5'], 'taken on by its line: never "no record"');
    assert.deepEqual([iconOf(row('Build-4')), byClass(row('Build-4'), 'v2-sms')[0].textContent], ['st-skip', 'skipped · why: made up for the test, Build-4']);
  } finally {
    app.restore();
  }
  const plain = await openPage('#/p/Service-Desk');
  try {
    await plain.tap(fold(plain, 'Design'));
    const row = (id) => rowsIn(keyed(plain, 'std:Design-i2')).find((r) => byClass(r, 'v2-id')[0].textContent === id);
    assert.deepEqual([iconOf(row('Design-4')), byClass(row('Design-4'), 'v2-sms')[0].textContent], ['st-unrec', 'not recorded yet'], 'a dashed circle with "?"');
    assert.deepEqual([iconOf(row('Design-5')), byClass(row('Design-5'), 'v2-sms')[0].textContent], ['st-nomodel', 'no record for this in the model yet'], 'a slashed circle');
    assert.ok(NOT_RECORDED_IDS.has('Design-5') && !NOT_RECORDED_IDS.has('Design-4'));
  } finally {
    plain.restore();
  }
  const js = readFileSync(`${SRC}/public/sandbox.js`, 'utf8');
  assert.match(js, /nomodel: \{ ring: 'solid', d: \['M3\.7 12\.3l8\.6-8\.6'\]/, 'the slashed circle, as desk-v2.html draws it');
  assert.match(js, /unrec: \{ ring: 'dash',/, 'the dashed circle with "?"');
});

test('AC83 (P-001-why-line.md, A): the why line once — in an opened phase with a standard milestone whose why isn\'t written, one line at the foot of its list, in the agents\' grey, with "(your ruling, P-001-standard-milestones)" where the ruling is in the tree; never "why: not recorded" on a row; none with every why written', async () => {
  const ruling = readFileSync(join(SRC, '..', 'decisions', 'questions', 'P-001-standard-milestones.md'), 'utf8');
  const app = await openPage('#/p/Service-Desk', { extra: { 'decisions/questions/P-001-standard-milestones.md': ruling } });
  try {
    for (const ph of ['Launch', 'Build', 'Design', 'Discovery']) await app.tap(fold(app, ph));
    for (const ph of ['Launch', 'Build', 'Design', 'Discovery']) {
      const w = byClass(keyed(app, `stdl:${ph}`), 'v2-callout');
      assert.equal(w.length, 1, `${ph}: once`);
      assert.equal(w[0].textContent, "Why each is taken on or skipped: not written yet. Service-Desk's Chief of Staff writes its lines (your ruling, P-001-standard-milestones).");
      assert.match(w[0].className, /\bgap\b/);
      assert.equal(keyed(app, `stdl:${ph}`).children.at(-1), w[0], 'at the foot of its list');
    }
    assert.doesNotMatch(keyed(app, 'ms-lines').textContent, /why: not recorded/);
  } finally {
    app.restore();
  }
  const all = await openPage('#/p/Service-Desk', { extra: { 'docs/PROJECT.md': ALL_24 } });
  try {
    for (const ph of ['Launch', 'Build', 'Design', 'Discovery']) await all.tap(fold(all, ph));
    assert.equal(byClass(keyed(all, 'ms-lines'), 'v2-callout').length, 0, 'every why written: no such line');
  } finally {
    all.restore();
  }
  // Without the ruling in the tree, the line names no ruling (C).
  const lines = milestonesByPhase(ctxOf().ctx).lines;
  assert.equal(lines[0].whyOnce, "Why each is taken on or skipped: not written yet. Service-Desk's Chief of Staff writes its lines.");
});

test('AC83 (conflict 2, settled as drawn; part B, item 35): no key — no "Status icons" or runs key on the page; every icon carries its word', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    assert.equal(byClass(app.view, 'sb-skey').length + byClass(app.view, 'v2-fkeys').length, 0);
    assert.doesNotMatch(app.text(), /Status icons|now: holds the next milestone to reach/);
    await app.tap(fold(app, 'Design'));
    for (const r of rowsIn(keyed(app, 'stdl:Design'))) assert.ok(byClass(r, 'v2-sms')[0] || byClass(r, 'v2-smn')[0].textContent, 'each row its words');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The rest, a v2.5 project's page, and "Details"

test('AC83 (frame 5): the rest — "Value targets V1 to V5", "5 targets · measured on the desk once that is built", its sheet quoting each line word for word; "Experiments", "<n> registered" from the tree\'s experiments/EXP-*.md, its sheet naming them; "Details"', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    const v = keyed(app, 'rest:values');
    assert.equal(byClass(v, 'v2-prtt')[0].textContent, 'Value targets V1 to V5');
    assert.equal(byClass(v, 'v2-small')[0].textContent, '5 targets · measured on the desk once that is built');
    await app.tap(v);
    await app.go(v.attrs.href);
    const sheet = byClass(app.view, 'v2-sheet')[0];
    const quoted = byClass(sheet, 'v2-quote').map((x) => x.textContent);
    assert.deepEqual(quoted, PROJECT_DOC.split('\n').filter((l) => /^V\d+:/.test(l)), 'each line word for word');
    await app.key('Escape');
    const e = keyed(app, 'rest:experiments');
    assert.equal(byClass(e, 'v2-small')[0].textContent, '5 registered', 'EXP-001 to EXP-005; experiments/_REGISTRATION.md is not one');
    await app.go(e.attrs.href);
    assert.deepEqual(findAll(byClass(app.view, 'v2-sheet')[0], (x) => x.tag === 'li').map((x) => x.textContent),
      ['EXP-001-o3-cpu-walltime', 'EXP-002-o5-needs-you-deploy-method', 'EXP-003-o6-session-usage-fields', 'EXP-004-prefilled-link-per-repo', 'EXP-005-md-glance-test']);
    await app.key('Escape');
    assert.equal(byClass(keyed(app, 'more-detail'), 'v2-small')[0].textContent, 'Agents and usage · time asked of you · CI · record notes');
  } finally {
    app.restore();
  }
  // No section 6 targets (made up): no row.
  const none = await openPage('#/p/Service-Desk', { extra: { 'docs/PROJECT.md': PROJECT_DOC.replace(/^V(\d+):/gm, 'Target $1:') } });
  try {
    assert.equal(keyed(none, 'rest:values'), null);
    assert.ok(keyed(none, 'rest:experiments'));
  } finally {
    none.restore();
  }
});

test('AC83 (frame 8): a v2.5 project\'s page — the top, the sprint strip, the waits row, "CI on <branch>: <state>", "Latest in the ledger" with its id, date and title, "Records: <n> ledger entries · <n> specs", and "Not used by this project", "older pipeline", in the frame\'s words', async () => {
  const app = await openPage('#/p/Personal-Org-Operating-Model');
  try {
    const rows = findAll(keyed(app, 'page-rows'), (e) => / v2-prow /.test(` ${e.className} `));
    // Rewritten at stage 6a of "After MD3" (AC89 (k), specs/S-001.md:7940-7941): the CI row's workflow and date, or "workflow and date not read".
    assert.deepEqual(rows.map((r) => byClass(r, 'v2-prtt')[0].textContent), ['Nothing waiting on you', 'CI on main: none · workflow and date not read', 'Latest in the ledger', 'Records']);
    assert.equal(byClass(rows[2], 'v2-mono')[0].textContent, "L-0124 · 5 Oct · Continue Service-Desk under the full process, with a checkpoint; S-017's supersession covers two more token pins");
    assert.equal(byClass(rows[3], 'v2-mono')[0].textContent, '2 ledger entries · 0 specs', 'the placeholder ledger\'s two entries; no specs/ in its tree');
    assert.equal(keyed(app, 'page-switch'), null, 'no Overview | Timeline for the older pipeline (frame 8)');
    assert.equal(keyed(app, 'ms-lines'), null, 'no milestones by phase');
    const h = keyed(app, 'notused-h');
    assert.deepEqual([byClass(h, 'v2-shw')[0].textContent, byClass(h, 'v2-mono')[0].textContent], ['Not used by this project', 'older pipeline']);
    assert.deepEqual(findAll(keyed(app, 'notused'), (e) => e.tag === 'li').map((li) => [byClass(li, 'v2-nt')[0].textContent, byClass(li, 'v2-nw')[0].textContent, iconOf(li)]), [
      ['Phases, gates and standard milestones', "They come with the v3 pipeline. This project runs the older pipeline's sprints and ledger.", 'st-skip'],
      ['The Timeline', 'Also v3. Its sprints are the strip above.', 'st-skip'],
      ['Questions and cards', 'No questions or queue folder: it asks you through pull requests.', 'st-skip'],
      ['Agent runs', 'No dispatch log.', 'st-skip'],
    ]);
  } finally {
    app.restore();
  }
  // Each of the last two only while its tree holds none (made up: a questions folder and a dispatch log).
  const more = await openPage('#/p/Personal-Org-Operating-Model', { poom: { 'questions/a.md': '# x\n', 'dispatch-log/2026-10.jsonl': '' } });
  try {
    assert.deepEqual(findAll(keyed(more, 'notused'), (e) => e.tag === 'li').map((li) => byClass(li, 'v2-nt')[0].textContent), ['Phases, gates and standard milestones', 'The Timeline']);
  } finally {
    more.restore();
  }
});

test('AC83 + AC36: "Details" opens AC55\'s views as built, so every M1 and M2 view stays reachable — Time asked, Agents, Record notes, About the phases (v3), the reduced view (v2.5) — with CI and the desk\'s own lines (AC75, AC78)', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    const d = keyed(app, 'more-detail-fold');
    assert.equal(d.tag, 'details');
    const hrefs = linksIn(d).map((l) => l.href);
    for (const h of ['#/p/Service-Desk/asked', '#/p/Service-Desk/agents', '#/p/Service-Desk/info']) assert.ok(hrefs.includes(h), h);
    assert.ok(hrefs.some((h) => h === '#/p/Service-Desk/notes') || !keyed(app, 'more:notes'), 'Record notes when there are any');
    assert.ok(!hrefs.includes('#/p/Service-Desk/pipeline'), 'no Pipeline view for v3 (AC68)');
    assert.match(d.textContent, /CI on main: /);
    assert.ok(byClass(d, 'sb-notify-line').length && byClass(d, 'sb-actions-usage').length, 'Notifications and the Actions line');
    for (const h of ['#/p/Service-Desk/asked', '#/p/Service-Desk/agents']) {
      await app.go(h);
      assert.ok(byClass(app.view, 'sb-detail').length, `${h}: the view as built`);
    }
    await app.go('#/p/Personal-Org-Operating-Model');
    assert.ok(linksIn(keyed(app, 'more-detail-fold')).some((l) => l.href === '#/p/Personal-Org-Operating-Model/pipeline' && l.text === 'Reduced view and waits'));
  } finally {
    app.restore();
  }
});

test('AC83 + AC81: the page\'s type is the tokens\' or desk-v2.html\'s pairs; the page renders from each fixture without error, and from a project that can\'t be read', async () => {
  for (const sel of ['.v2-sn', '.v2-sd', '.v2-sv', '.v2-smn', '.v2-sms', '.v2-runh', '.v2-prtt', '.v2-callout']) assert.match(rule(sel), /font: var\(--t-(row|small|body|label)\);/, sel);
  assert.match(rule('.v2-ph.now .v2-pn'), /font: 600 12px\/1\.3 var\(--font\);/, 'the now phase\'s name, desk-v2.html:282');
  const app = await openPage('#/p/Service-Desk');
  try {
    assert.doesNotMatch(app.text(), /Can't show/);
  } finally {
    app.restore();
  }
  const repos = { 'Service-Desk': repo({ ...j77Files() }) };
  repos['Service-Desk'].fail = { kind: 'network' };
  const down = await loadSandbox({ config: { ...CONFIG, projects: [SD] }, repos, hash: '#/p/Service-Desk', now: NOW });
  try {
    await down.advance(1000);
    await down.advance(61_000);
    assert.doesNotMatch(down.view.textContent, /Can't show this project/);
    assert.equal(byClass(findAll(down.view, (e) => e.dataset && e.dataset.k === 'page-waits')[0], 'v2-prtt')[0].textContent.startsWith("Can't read"), true, 'AC5\'s words in the waits row');
  } finally {
    down.restore();
  }
  assert.equal(PAGE_WORDS.milestonesHead(24), "Milestones by phase · yours and the model's 24");
});

// ---------------------------------------------------------------------------
// Stage 3, review round 1

test('AC83 (specs/S-001.md:6755-6771, :6845-6855; the Reviewer\'s N3, stage 3 round 1): a project in its first run and one that is Done, on the page as rendered — the sentence, the strip\'s words, the lines under it, and the Timeline\'s phase line, each as the page\'s own functions give them for the same records', async () => {
  // Made up, NOT real records: 77bfeae's with no Build milestone worked (no sprints, none reached), so Design is in its first run;
  // and 77bfeae's with a graduation ruling, so the project is Done (AC50).
  const FIRST = { 'docs/PROJECT.md': PROJECT_DOC.split('\n').map((l) => (/ · phase: Build/.test(l) ? l.replace(/ · sprints: [^·]*/, '').replace(/ · reached: [0-9-]+/, '') : l)).join('\n') };
  const DONE = { 'decisions/questions/P-001-graduation.md': 'Ruling: proceed\n(made up for the test, NOT a real record)\n' };
  const cases = [
    ['first run', FIRST, 'Design, first time through. Next: The chosen design running on the real back end.', ['finished', 'run 1 · now', 'planned', 'planned']],
    ['Done', DONE, 'Done.', ['finished', 'finished', 'finished', 'finished']],
  ];
  for (const [label, extra, sentence, strip] of cases) {
    const { ctx, snap } = ctxOf({ ...EXPERIMENTS, ...extra });
    assert.equal(pageSentence(ctx, { snap }), sentence, `${label}: the sentence, from the records`);
    const app = await openPage('#/p/Service-Desk', { extra });
    try {
      assert.equal(keyed(app, 'sentence').textContent, sentence, `${label}: the sentence, on the page`);
      const cells = findAll(keyed(app, 'strip'), (e) => e.tag === 'li');
      assert.deepEqual(cells.map((c) => byClass(c, 'v2-ps')[0].textContent), strip, `${label}: the strip's words`);
      assert.deepEqual(cells.map((c) => byClass(c, 'v2-ps')[0].textContent), phaseStrip(ctx, snap).cells.map((c) => c.words));
      assert.deepEqual(cells.map((c) => byClass(c, 'v2-pnm')[0].textContent), ['Discovery', 'Design', 'Build', 'Launch'], 'Done is not a column (:6766)');
      const under = byClass(keyed(app, 'under'), 'v2-small').map((x) => x.textContent).filter((t) => /ran again/.test(t));
      assert.equal(under.length, ranAgainLines(ctx, TZ, () => null).length, `${label}: one line for each phase that ran again`);
      if (label === 'first run') assert.deepEqual(under, [], 'a first run: no "ran again" line, there being none to say (:6768-6770)');
      if (label === 'Done') assert.deepEqual(under, ['Design ran again from 8 Oct · why it went back: not recorded'], 'Done: the history stays');
      if (label === 'Done') assert.equal(cells.filter((c) => / now\b/.test(c.className)).length, 0, 'Done: no cell is now');
      await app.go('#/p/Service-Desk/timeline');
      const phl = byClass(app.view, 'v2-phl')[0];
      assert.ok(phl, `${label}: the Timeline's phase line`);
      assert.equal(byClass(phl, 'v2-phlw')[0].textContent, firstPart(sentence, 'v3'), `${label}: the first part of the sentence (AC84)`);
    } finally {
      app.restore();
    }
  }
});

test('AC83 (specs/S-001.md:6773-6777; the Design reviewer\'s B2, stage 3 round 1): a project the desk can\'t read and has never read shows its unknowns in words, as Home\'s tile does — "At work now: not available", "with the agents: not available", "Experiments · not available", a v2.5 project\'s CI, ledger and records "not available" — never a zero or "no agent run recorded"', async () => {
  const down = (name) => {
    const r = name === 'Service-Desk' ? repo({ ...j77Files(), ...EXPERIMENTS }) : repo({ ...poomFiles(), ...POOM_PLACEHOLDER });
    r.fail = { kind: 'network' };
    return r;
  };
  const repos = { 'Service-Desk': down('Service-Desk'), 'Personal-Org-Operating-Model': down('Personal-Org-Operating-Model') };
  const app = await loadSandbox({ config: { ...CONFIG, ownerTimeZone: TZ, projects: [SD, PUB] }, repos, hash: '#/p/Service-Desk', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    assert.match(byClass(keyed(app, 'page-waits'), 'v2-prtt')[0].textContent, /^Can't read/, 'AC5\'s words in the waits row');
    const work = keyed(app, 'page-work');
    assert.equal(byClass(work, 'v2-prtt')[0].textContent, 'At work now: not available');
    assert.equal(byClass(work, 'v2-small')[0].textContent, 'with the agents: not available');
    const e = keyed(app, 'rest:experiments');
    assert.equal(byClass(e, 'v2-small')[0].textContent, 'not available', 'never "0 registered"');
    await app.go(e.attrs.href);
    const sheet = byClass(app.view, 'v2-sheet')[0];
    assert.doesNotMatch(sheet.textContent, /No experiment is registered|0 registered/, 'the sheet says nothing it can\'t know');
    await app.key('Escape');
    assert.match(keyed(app, 'more-detail-fold').textContent, /CI on main: not read yet/, 'AC29\'s words for a state not read');
    await app.go('#/');
    assert.ok(app.text().includes('At work: not available'), 'Home\'s tile, in the same words');
    await app.go('#/p/Personal-Org-Operating-Model');
    const rows = findAll(keyed(app, 'page-rows'), (x) => / v2-prow /.test(` ${x.className} `));
    assert.deepEqual(rows.slice(1).map((r) => [byClass(r, 'v2-prtt')[0].textContent, (byClass(r, 'v2-mono')[0] || { textContent: null }).textContent]),
      [['CI on main: not read yet', null], ['Latest in the ledger', 'not available'], ['Records', 'not available']]);
    assert.deepEqual(findAll(keyed(app, 'notused'), (x) => x.tag === 'li').map((li) => byClass(li, 'v2-nt')[0].textContent), ['Phases, gates and standard milestones', 'The Timeline'],
      'no "No questions or queue folder" or "No dispatch log" for a tree not read');
    const text = byClass(app.view, 'v2-proj')[0].textContent;
    assert.doesNotMatch(text, /\b0 specs|ledger entries|not recorded · 0/, 'no count from an empty tree');
  } finally {
    app.restore();
  }
});

test('AC83 (specs/S-001.md:6830-6831; the Design reviewer\'s B1, stage 3 round 1): "Details" is a block like the rows above it, never .sb-more\'s inline-flex, so opened its summary keeps the full width and its views sit under it', () => {
  const all = css();
  const at = (re) => { const m = re.exec(all); assert.ok(m, String(re)); return m.index; };
  assert.match(rule('.v2-pdetail'), /^ display: block; min-height: 0; color: var\(--ink\); $/);
  // .sb-more and .v2-pdetail weigh the same (one class): the later rule wins, and nothing after sets the details' display again.
  // From stage 8 (AC44, step 4) `.sb-fold` and `.sb-pname`, which nothing drew once the desk became `/`, left that rule's
  // selector list; `.sb-more`'s inline-flex rule stands, and the criterion is the same (:6830-6831).
  assert.ok(at(/\n\.v2-pdetail \{/) > at(/\n\.sb-more \{[^}]*display: inline-flex/), '.v2-pdetail\'s rule after .sb-more\'s');
  assert.doesNotMatch(all, /\.sb-fold\b|\.sb-pname\b/, 'the dead selectors went');
  const after = all.slice(all.indexOf('}', at(/\n\.v2-pdetail \{/)) + 1);
  for (const m of after.matchAll(/(?:^|\n)([^{}\n]+)\{([^}]*)\}/g)) {
    if (/display:/.test(m[2]) && /(?:^|[\s,])(?:details)?\.(?:v2-pdetail|sb-more)(?:\s*(?:,|$|\{))/.test(m[1].trim())) assert.fail(`${m[1].trim()} sets display again`);
  }
});

test('AC83 (specs/S-001.md:5969-5970, the rulebook\'s part A item 11, WCAG 2.5.8; the Design reviewer\'s B3, stage 3 round 1): the Experiments sheet\'s links, each alone on its row, are 32 px tall targets with no gap between them', async () => {
  const app = await openPage('#/p/Service-Desk/experiments');
  try {
    const sheet = byClass(app.view, 'v2-sheet')[0];
    const items = findAll(sheet, (e) => e.tag === 'li');
    assert.equal(items.length, 5);
    for (const li of items) {
      const a = findAll(li, (e) => e.tag === 'a');
      assert.equal(a.length, 1, 'one link');
      assert.equal(a[0].textContent, li.textContent, 'alone on its row, not inside a sentence');
      assert.match(a[0].className, /\bv2-exl\b/);
    }
    assert.match(byClass(sheet, 'v2-qlist')[0].className, /\bv2-explist\b/);
  } finally {
    app.restore();
  }
  const r = rule('.v2-exl');
  assert.match(r, /display: flex;/);
  const h = Number(/min-height: (\d+)px;/.exec(r)[1]);
  assert.ok(h >= 24, `${h} px, at least 24`);
  assert.match(rule('.v2-sheet .v2-explist'), /gap: 0;/);
});

test('J9 + AC83 (specs/S-001.md:6834-6835; the Reviewer\'s N2, stage 3 round 1): "Records: <n> ledger entries" counts only the ledger\'s `## L-<n> — ` entries, never another `## ` heading (a made-up one added)', async () => {
  const ledger = poomFiles()['docs/LEDGER.md'];
  const app = await openPage('#/p/Personal-Org-Operating-Model', { poom: { 'docs/LEDGER.md': `${ledger.replace(/\n*$/, '\n')}\n## How to read this ledger (made up, NOT a real record)\n\nA note.\n` } });
  try {
    const rows = findAll(keyed(app, 'page-rows'), (e) => / v2-prow /.test(` ${e.className} `));
    assert.equal(byClass(rows[3], 'v2-mono')[0].textContent, '2 ledger entries · 0 specs', 'still the two entries');
  } finally {
    app.restore();
  }
});

test('AC83 + AC84 (specs/S-001.md:6755-6759, :6885-6889; the Reviewer\'s NB2, stage 3 round 2): a v2.5 project not read yet says where it is heading is not available — on its page and in the phase line atop its Timeline and Team screen — never "No open sprint."; once read with no sprint files, "No open sprint." stands', async () => {
  const UNREAD = "Where it's heading: not available until the project's records are read.";
  const p = { ...ctxOf().ctx, project: PUB };
  assert.equal(pageSentence(p, { snap: null, waits: { n: 0, read: 'cant-read' } }), UNREAD, 'no tree: nothing known of its sprints');
  assert.equal(phaseLine(p, { snap: null }).words, UNREAD);
  assert.equal(pageSentence(p, { snap: snapOf({ 'docs/LEDGER.md': poomFiles()['docs/LEDGER.md'] }, 'v2.5'), waits: { n: 0, read: 'ok' } }), 'No open sprint. Nothing waits on you.', 'read, with no sprint files');
  const r = repo({ ...poomFiles(), ...POOM_PLACEHOLDER });
  r.fail = { kind: 'network' };
  const app = await loadSandbox({ config: { ...CONFIG, ownerTimeZone: TZ, projects: [PUB] }, repos: { 'Personal-Org-Operating-Model': r }, hash: '#/p/Personal-Org-Operating-Model', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    assert.equal(keyed(app, 'sentence').textContent, UNREAD, 'the page');
    for (const screen of ['timeline', 'team']) {
      await app.go(`#/p/Personal-Org-Operating-Model/${screen}`);
      const phl = byClass(app.view, 'v2-phl')[0];
      assert.ok(phl, `the ${screen} screen's phase line`);
      assert.equal(byClass(phl, 'v2-phlw')[0].textContent, UNREAD, `the ${screen} screen's phase line`);
    }
    await app.go('#/');
    assert.ok(app.text().includes('Now: not available'), 'Home\'s tile, in the same words');
    assert.doesNotMatch(app.text(), /No open sprint/);
  } finally {
    app.restore();
  }
});

test('AC83 (specs/S-001.md:6832-6833; the Reviewer\'s N-d, stage 3 round 2): a v2.5 project\'s CI row with no model — "not available" before its tree is read, "not recorded" once it is', () => {
  assert.equal(v25Rows(PUB, null, null, NOW, TZ).ci, 'CI on main: not available');
  assert.equal(v25Rows(PUB, null, snapOf({ ...poomFiles() }, 'v2.5'), NOW, TZ).ci, 'CI on main: not recorded');
  assert.equal(v25Rows(PUB, { ci: 'passing' }, null, NOW, TZ).ci, 'CI on main: passing', 'the model\'s state when it has one');
});

test('AC83 + AC29 (after MD3, stage 8; (b) item 37, stage 3 review round 3, R2): Details\' CI line with no model reads "not available", never "not recorded" — the branch pinned in the page\'s source, since today a missing model never reaches it (a draw error is shown instead)', async () => {
  // The Reviewer's mutation Nd2 (that line back to NOT_RECORDED) passed every test: the branch can't be drawn today. A
  // box is made only from a built model (src/lib/universe.js, makeBox reads model.name), so a null model is a draw
  // error, "Can't show this project: …", and the page shows that in place of its rows and Details.
  const { safeBox } = await import('../../src/lib/universe.js');
  const box = safeBox('Personal-Org-Operating-Model', () => null, undefined, { signedOut: false }, NOW);
  assert.equal(box.model, null);
  assert.match(box.drawError, /^Can't show this project: /, 'a null model is a draw error, not a page with Details');
  // So the branch's words are pinned where the page draws them.
  const page = readFileSync(join(SRC, 'public', 'sandbox.js'), 'utf8');
  const at = page.indexOf('\nfunction detailsNode(p) {');
  assert.ok(at > 0, 'Details is drawn by detailsNode');
  const body = page.slice(at, page.indexOf('\n}\n', at));
  assert.match(body, /const \{ project, model \} = p;/);
  assert.match(body, /h\('p', \{ class: 'v2-small' \}, `CI on \$\{project\.defaultBranch\}: \$\{model \? model\.ci : NOT_AVAILABLE\}`\)/, 'no model: "not available"');
  assert.doesNotMatch(body, /CI on [^`]*NOT_RECORDED/, 'never "not recorded"');
  const from = /import \{([^}]*)\} from '\.\/lib\/([a-z]+)\.js';/g;
  const lib = [...page.matchAll(from)].find((m) => /\bNOT_AVAILABLE\b/.test(m[1]));
  assert.ok(lib, 'NOT_AVAILABLE imported from the lib');
  assert.equal((await import(`../../src/lib/${lib[2]}.js`)).NOT_AVAILABLE, 'not available');
});
