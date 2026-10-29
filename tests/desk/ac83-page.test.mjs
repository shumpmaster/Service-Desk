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
import { pageSentence, firstPart, phaseStrip, phaseLine, ranAgainLines, milestonesByPhase, detailLines, v25Rows, PAGE_WORDS, STANDARD_TOTAL } from '../../src/lib/projectpage.js';
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

// Rewritten in G9 (AC92 (e); AC83, changed: "the sentence and its tally in a soft box"): the sentence now stands first in the
// page's soft box (`div.v2-anchor`, the briefing's own look), with the one-line tally under it on a v3 page; on a v2.5 page
// the box holds the sentence alone. Every assertion of the case before G9 is kept.
test('AC83 (AC92 (e), rewritten in G9): the one sentence (--t-lead), first in the page\'s soft box, with the one-line tally under it — "<now phase>, <first time through | second time through | run <k>>. Next: <the next milestone to reach, by its name>."; "Next: not recorded"; "Done."; a v2.5 project\'s "Sprint <id> is open. Nothing waits on you.", alone in its box', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    assert.equal(keyed(app, 'sentence').textContent, 'Design, second time through. Next: The chosen design running on the real back end.', 'MD3, the next to reach at 77bfeae, by its name');
    assert.match(rule('.v2-lead'), /font: var\(--t-lead\);/);
    // G9: in the box, the sentence first and the tally under it, nothing else; the box between the switch and the strip.
    const box = keyed(app, 'anchor');
    assert.ok(box && box.tag === 'div' && box.className === 'v2-anchor', 'the page\'s soft box');
    assert.deepEqual(box.children.map((c) => c.dataset.k), ['sentence', 'tally'], 'the sentence, then the tally, and nothing else');
    assert.equal(keyed(app, 'tally').className, 'v2-small v2-tally');
    assert.equal(keyed(app, 'tally').textContent, '8 of 15 milestones reached · 17 sprints · 9 merged, 8 not read', 'summed over the page (77bfeae, its pull requests not read)');
    assert.equal(findAll(keyed(app, 'tally'), (e) => e.tag === 'b').map((b) => b.textContent).join(), '8 of 15', 'R and T the bold part');
    const page = box.parent;
    const at = page.children.indexOf(box);
    assert.equal(page.children[at - 1].dataset.k, 'page-switch', 'under Overview | Timeline');
    assert.match(page.children[at + 1].className, /\bv2-strip\b/, 'over the strip');
    await app.go('#/p/Personal-Org-Operating-Model');
    assert.equal(keyed(app, 'sentence').textContent, 'Sprint m1.4 is open. Nothing waits on you.');
    assert.deepEqual(keyed(app, 'anchor').children.map((c) => c.dataset.k), ['sentence'], 'a v2.5 page: the sentence alone in its box, no milestones to tally');
    assert.equal(keyed(app, 'tally'), null);
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
    // Rewritten in G8 (AC92 (b): "the project page's strip: a 10 × 6 px triangle pointing down, centred 9 px above the now
    // phase's bar"): the now cell alone holds the arrow, last in it (placed above the bar by the cascade, checked in
    // tests/desk/ac92-glance-arrow.test.mjs), hidden.
    assert.deepEqual(cells.map((c) => byClass(c, 'v2-here').map((a) => [a.tag, a.className, a.attrs['aria-hidden']])), [[], [['span', 'v2-here d', 'true']], [], []]);
    assert.ok(cells[1].className.split(' ').includes('here'));
    // Rewritten in G7 (AC92 (a): "the reached check … on the project page's strip" in --ok, on the mark only): the finished
    // phase's check is a status mark (`.ok`, --ok); the now, gone-back-over and planned ones are not; the names stay ink.
    assert.deepEqual(cells.map((c) => / ok /.test(` ${findAll(c, (e) => e.tag === 'svg')[0].attrs.class} `)), [true, false, false, false], 'only the finished phase\'s check is green');
    assert.match(rule('.v2-s.st-check.ok'), /^ color: var\(--ok\); $/);
    assert.match(rule('.v2-pn'), /color: var\(--ink\);/, 'the phase names in ink');
    assert.equal(cells.length, 4, 'Done is not a column');
    assert.match(rule('.v2-bar3'), /height: 3px; border-radius: 2px; background: var\(--phc\);/);
    assert.match(rule('.v2-ph.b-dashed .v2-bar3'), /background: repeating-linear-gradient\(90deg, var\(--phc\) 0 6px, transparent 6px 10px\);/);
    assert.match(rule('.v2-strip'), /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/, 'side by side');
    await app.go('#/p/Personal-Org-Operating-Model');
    assert.deepEqual(findAll(keyed(app, 'strip'), (e) => e.tag === 'li').map((c) => [byClass(c, 'v2-pnm')[0].textContent, byClass(c, 'v2-ps')[0].textContent]), [['m1.4', 'open']],
      'the placeholder\'s one sprint file, open');
    assert.equal(byClass(keyed(app, 'strip'), 'v2-here').length, 1, 'G8: the arrow on the one open sprint');
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

// Rewritten in G5 of "After the glance audit" (AC83, changed by AC92 (c): "every milestone and sprint counted, in place
// of "Yours: … · Standard: <k> of <n>" and the head's "yours and the model's <n>""): each phase's folded line takes two lines
// of detail, "<R> of <T> reached · <sprints>" over "Standard checklist: …", and the head sums R and T. Before G5 the line
// read "Yours: M3C · Standard: 0 of 5, not recorded yet" (Launch) and the head "Milestones by phase · yours and the
// model's 24". The square, name, state word, fold mark and the head's "↑ start at the foot" are as they were; AC92 (c)'s
// own test (tests/desk/ac92-glance-counts.test.mjs) holds every count's case.
test('AC83 (frames 5, 6; P-001-milestones-together.md, A; rewritten in G5 for AC92 (c)): one line per phase, bottom up, the own and the standard together — its square, name, state word, fold mark and two lines of detail ("<R> of <T> reached · <sprints>", R and T in 500 --ink, over "Standard checklist: …"); headed "Milestones by phase · <R> of <T> reached" with "↑ start at the foot"', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    const head = keyed(app, 'ms-h');
    assert.equal(byClass(head, 'v2-shw')[0].textContent, 'Milestones by phase · 8 of 15 reached', 'R and T summed over the phases: 0 + 3 + 1 + 4 of 1 + 5 + 5 + 4');
    assert.equal(byClass(head, 'v2-mono')[0].textContent, '↑ start at the foot');
    assert.equal(STANDARD_TOTAL, 24);
    const lines = (ph) => byClass(byClass(fold(app, ph), 'v2-sd')[0], 'v2-sdl').map((x) => x.textContent);
    const got = ['Launch', 'Build', 'Design', 'Discovery'].map((ph) => [ph, byClass(fold(app, ph), 'v2-sv')[0].textContent, ...lines(ph)]);
    // Service-Desk's records at 77bfeae, with J12's pull requests not given here (so "not read") and the pipeline items'
    // merges in the dispatch log.
    assert.deepEqual(got, [
      ['Launch', 'planned', '0 of 1 reached · no sprints filed yet', 'Standard checklist: none tracked (5)'],
      ['Build', 'run 2 ahead', '3 of 5 reached · 4 sprints · 4 not read', 'Standard checklist: none tracked (5)'],
      ['Design', 'run 2 · now', '1 of 5 reached · 6 sprints · 2 merged, 4 not read', 'Standard checklist: 2 tracked · 4 not tracked'],
      ['Discovery', 'finished', '4 of 4 reached · 7 sprints · 7 merged', 'Standard checklist: 4 tracked · 4 not tracked'],
    ]);
    assert.equal(findAll(byClass(fold(app, 'Design'), 'v2-sd')[0], (e) => e.tag === 'b')[0].textContent, '1 of 5', 'R and T the bold part');
    assert.match(rule('.v2-sd b'), /font-weight: 500; color: var\(--ink\);/, 'R and T in 500 --ink');
    assert.match(rule('.v2-sd'), /font: var\(--t-small\); color: var\(--ink2\);/, 'the rest --t-small --ink2');
    assert.match(rule('.v2-sdl'), /^\s*display: block;\s*$/, 'two lines');
    for (const ph of ['Launch', 'Build', 'Design', 'Discovery']) {
      assert.equal(fold(app, ph).attrs['aria-describedby'], `phase-d-${ph}`, `${ph}: its detail describes it`);
      assert.equal(byClass(fold(app, ph), 'vi-chev').length, 1, `${ph}: its fold mark`);
      assert.doesNotMatch(fold(app, ph).textContent, /Yours: |Standard: |0 of \d+ (recorded|,)/, `${ph}: never "Yours: …" or "0 of <n>"`);
    }
  } finally {
    app.restore();
  }
  // With every standard line written (made up): skipped ones said in words, taken-on ones the model can record tracked
  // in a phase with a run now or still to come, and those it can't record "taken on, not recorded by the model".
  const lines = milestonesByPhase(ctxOf({ 'docs/PROJECT.md': ALL_24 }).ctx).lines;
  assert.deepEqual(lines.map((l) => detailLines(l.detail)[1]), [
    'Standard checklist: 1 tracked · 4 taken on, not recorded by the model',
    'Standard checklist: 3 tracked · 1 taken on, not recorded by the model · 1 skipped',
    'Standard checklist: 3 tracked · 2 taken on, not recorded by the model · 1 skipped',
    'Standard checklist: 4 tracked · 4 taken on, not recorded by the model',
  ]);
  assert.deepEqual(lines.map((l) => detailLines(l.detail)[0].replace(/ · .*$/, '')), ['0 of 2 reached', '3 of 8 reached', '1 of 6 reached', '4 of 4 reached'],
    'Launch-3, Build-1 to Build-3 and Design-4 and Design-6, taken on in phases with a run now or still to come, are tracked; Discovery, finished, still "4 of 4"');
});

// Rewritten in G6 of "After the glance audit" (AC83, changed by AC92 (d): "the standard checklist set apart"): the heads
// were "Yours" and "The model's standard six" on the latest run only, its six standard rows listed, and the earlier run's
// unrecorded ones gathered ("Design-2 to Design-5 · not recorded, or no record in the model"). Now every run has two
// heads, "Your milestones · <n>" and "Standard checklist · <n> · <h> tracked", and the rows not tracked in a run fold into
// one row; opened, they are listed in place, Design-1 still at the foot. The bottom-up order, the earlier run smaller and
// softer, each row's parts and AC56's folds are as before.
// Rewritten again in G8 (AC83, changed by AC92 (b): "the reading arrow goes", and "an opened phase: the same 6 × 8 px
// triangle on the phase's thin line beside its next-to-reach row, in the now phase only"): the thin line has no arrow pointing
// up now; MD3's row, the next to reach in the now run, holds the arrow, and no other row does.
test('AC83 (frame 6; notes 2, 12, 15, 19; AC92 (d), rewritten in G6; AC92 (b), rewritten in G8): opened, a thin line, its arrow pointing up gone, the arrow pointing right beside the now run\'s next-to-reach row; the latest run first, "Run <k> · <its dates> · <how it ran>", then "Your milestones · <n>", the first at the foot, then "Standard checklist · <n> · <h> tracked", <Phase>-1 at the foot, its untracked rows folded into one; then each earlier run, smaller, under the same two heads', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    await app.tap(fold(app, 'Design'));
    const open = keyed(app, 'stdl:Design');
    assert.equal(fold(app, 'Design').attrs['aria-controls'], 'phase-Design');
    assert.deepEqual(byClass(open, 'v2-runh').map((x) => x.textContent), ['Run 2 · 8 Oct – now', 'Run 1 · 5–8 Oct · gone back over']);
    assert.deepEqual(byClass(open, 'v2-subh').map((x) => x.textContent), ['Your milestones · 3', 'Standard checklist · 6 · none tracked this run', 'Your milestones · 0', 'Standard checklist · 6 · 2 tracked']);
    assert.deepEqual(rowsIn(keyed(app, 'own:Design-i2')).map((r) => byClass(r, 'v2-id')[0].textContent), ['MD3', 'MD2', 'MD1'], 'yours, the first (MD1) at the foot');
    const untr = findAll(keyed(app, 'std:Design-i2'), (e) => e.tag === 'button')[0];
    assert.equal(untr.textContent, '6 not tracked this run: 4 not recorded yet, 2 no record in the model', 'the six folded into one row');
    await app.tap(untr);
    assert.deepEqual(rowsIn(keyed(app, 'std:Design-i2')).map((r) => byClass(r, 'v2-id')[0].textContent), ['Design-6', 'Design-5', 'Design-4', 'Design-3', 'Design-2', 'Design-1'], 'opened: Design-1 at the foot');
    const old = keyed(app, 'old:Design-i1:run1');
    assert.match(old.className, /\bv2-oldrun\b/, 'an earlier run, under its own heads');
    assert.ok(rowsIn(old).every((r) => /\bold\b/.test(r.className)), 'smaller and softer (note 2)');
    assert.deepEqual(rowsIn(old).map((r) => r.textContent), ['Design-6 A plan that passed reviewnot reached', 'Design-1 Done defined in real scenariosreached']);
    // Rewritten in G7 (AC92 (a)): the not-reached cross is red (`.bad`, --bad) in any run; a reached mark in a run gone back
    // over is the lighter check, grey, and no status mark.
    assert.deepEqual(rowsIn(old).map((r) => findAll(r, (e) => e.tag === 'svg')[0].attrs.class), ['v2-s st-cross bad', 'v2-s st-pastcheck soft']);
    assert.match(rule('.v2-s.st-cross.bad'), /^ color: var\(--bad\); $/);
    assert.equal(findAll(old, (e) => e.tag === 'button')[0].textContent, '4 not tracked this run: 2 not recorded yet, 2 no record in the model', 'in place of "Design-2 to Design-5 · not recorded, or no record in the model"');
    assert.match(rule('.v2-sm.old .v2-smn'), /font: var\(--t-small\); color: var\(--ink2\);/);
    // Each row: its icon in a plain circle, its id in Plex Mono, its name, its state in words under it.
    const md3 = rowsIn(keyed(app, 'own:Design-i2'))[0];
    assert.equal(iconOf(md3), 'st-next', 'the gold ring for next to reach');
    assert.equal(byClass(md3, 'v2-sms')[0].textContent, 'next to reach');
    // G8 (AC92 (b)): the arrow beside MD3 on the thin line, last in its row, hidden; on no other row; no arrow pointing up.
    assert.deepEqual(findAll(open, (e) => / v2-here /.test(` ${e.className} `)).map((a) => [a.parent, a.className, a.attrs['aria-hidden']]), [[md3, 'v2-here r', 'true']]);
    assert.equal(md3.children[md3.children.length - 1].className, 'v2-here r');
    assert.equal(findAll(open, (e) => / (v2-arrow|vi-up) /.test(` ${e.className || (e.getAttribute && e.getAttribute('class')) || ''} `)).length, 0, 'no arrow pointing up');
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

// Rewritten in G6 of "After the glance audit" (AC83, changed by AC92 (d)): a taken-on line the model can't record
// (Design-5, of NOT_RECORDED_IDS) reads "taken on · not recorded by the model · why: …", outside its run's h, where it read
// "taken on · why: …"; and the rows not tracked in a run are folded into one, so the plain records' Design-4 and Design-5
// are read after the fold's tap: the three states kept after it.
test('AC83 (the README, inventory §4; part B, item 30; AC92 (d), rewritten in G6): the three states told apart — "skipped" with its why (made up), a dashed circle with "?" and "not recorded yet", a slashed circle with "no record for this in the model yet" for the ids the model\'s trace never reads, each kept after the fold\'s tap; each with its words; "taken on · why: …", and "taken on · not recorded by the model · why: …" for one the model can\'t record, never shown as missing', async () => {
  const app = await openPage('#/p/Service-Desk', { extra: { 'docs/PROJECT.md': ALL_24 } });
  try {
    await app.tap(fold(app, 'Design'));
    await app.tap(fold(app, 'Build'));
    const row = (id) => rowsIn(keyed(app, `std:${id.startsWith('Build') ? 'Build-i2' : 'Design-i2'}`)).find((r) => byClass(r, 'v2-id')[0].textContent === id);
    assert.deepEqual([iconOf(row('Design-2')), byClass(row('Design-2'), 'v2-sms')[0].textContent], ['st-skip', 'skipped · why: made up for the test, Design-2']);
    assert.match(row('Design-2').className, /\bsoft\b/, 'in softer text');
    assert.deepEqual([iconOf(row('Design-4')), byClass(row('Design-4'), 'v2-sms')[0].textContent], ['st-planned', 'taken on · why: made up for the test, Design-4']);
    assert.deepEqual([iconOf(row('Design-5')), byClass(row('Design-5'), 'v2-sms')[0].textContent], ['st-planned', 'taken on · not recorded by the model · why: made up for the test, Design-5'], 'taken on by its line: never "no record"; the model can\'t record it (AC92 (d))');
    assert.deepEqual([iconOf(row('Build-4')), byClass(row('Build-4'), 'v2-sms')[0].textContent], ['st-skip', 'skipped · why: made up for the test, Build-4']);
  } finally {
    app.restore();
  }
  const plain = await openPage('#/p/Service-Desk');
  try {
    await plain.tap(fold(plain, 'Design'));
    await plain.tap(findAll(keyed(plain, 'std:Design-i2'), (e) => e.tag === 'button')[0]); // the untracked ones, folded (AC92 (d))
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

// Rewritten in G9 (AC92 (e): "the why-not-written box becomes a plain line … loses its filled ground and reads as a
// `--t-small` line in the grey of a gap the agents fill, with its eye icon (AC69)"): the line keeps its words, its place and
// its once, and is now a plain line, its rule with no ground, padding or radius. Every assertion of the case before G9 is kept.
test('AC83 (P-001-why-line.md, A; AC92 (e), rewritten in G9): the why line once, a plain line — in an opened phase with a standard milestone whose why isn\'t written, one line at the foot of its list, its eye icon first, in the agents\' grey (--t-small, --ink2) with no filled ground, with "(your ruling, P-001-standard-milestones)" where the ruling is in the tree; never "why: not recorded" on a row; none with every why written', async () => {
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
      // G9: a plain line — a paragraph whose first child is the eye icon and whose words are the agents' gap.
      assert.equal(w[0].tag, 'p', `${ph}: a line`);
      assert.match(w[0].children[0].getAttribute('class'), /\bvi-eye\b/, `${ph}: its eye icon first (AC69)`);
      assert.match(w[0].children[1].className, /\bgap\b/, `${ph}: its words the agents' gap`);
    }
    // G9: its rule draws no filled ground — no background, no padding, no radius — in --t-small and --ink2, the icon in the
    // rows' 16 px column (as `.v2-sm`), and no other rule gives it one.
    const r = rule('.v2-callout');
    assert.match(r, /font: var\(--t-small\);/);
    assert.match(r, /color: var\(--ink2\);/);
    assert.match(r, /grid-template-columns: 16px minmax\(0, 1fr\);/);
    assert.doesNotMatch(r, /background|padding|border-radius|border:|box-shadow/, 'no filled ground');
    for (const m of css().matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      if (/\.v2-callout\b/.test(m[1])) assert.doesNotMatch(m[2], /background|box-shadow|border(-radius)?:/, `${m[1].trim()} gives it no ground`);
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

// Rewritten in VT1 of M3B (forced: it failed once the row and the sheet became AC97's; AC83's "Changed for M3B",
// specs/S-001.md:8761-8766): the row keeps its title, its place and its sheet; its small line and icon are AC97's (on these
// records, before launch: no reached date on M3C's line, so the fixed words and the planned ring), and the sheet holds each
// target's measure first, its line quoted whole one tap away ("The whole target"), each still checked word for word.
test('AC83 (frame 5; changed for M3B): the rest — "Value targets V1 to V5", its small line and icon AC97\'s ("Measured from launch · V4, replacing the old page, at launch" before launch, five marks), its sheet each target\'s measure with its line quoted whole word for word one tap away; "Experiments", "<n> registered" from the tree\'s experiments/EXP-*.md, its sheet naming them; "Details"', async () => {
  const app = await openPage('#/p/Service-Desk');
  try {
    const v = keyed(app, 'rest:values');
    assert.equal(byClass(v, 'v2-prtt')[0].textContent, 'Value targets V1 to V5');
    assert.equal(byClass(v, 'v2-small')[0].textContent, 'Measured from launch · V4, replacing the old page, at launch');
    assert.deepEqual(byClass(v, 'v2-vmk').map((m) => byClass(m, 'v2-mono')[0].textContent), ['V1', 'V2', 'V3', 'V4', 'V5']);
    assert.equal(iconOf(v), 'st-planned', 'the planned ring before launch');
    await app.tap(v);
    await app.go(v.attrs.href);
    const sheet = () => byClass(app.view, 'v2-sheet')[0];
    // Each target's line, one tap away and then whole.
    for (const b of byClass(sheet(), 'v2-tgt')) await app.tap(findAll(b, (e) => e.tag === 'button' && e.textContent === 'The whole target')[0]);
    const quoted = byClass(sheet(), 'v2-tgt').flatMap((b) => byClass(b, 'v2-quote')).map((x) => x.textContent);
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
  // Rewritten in HD1 (vacuous: `.v2-runh`'s first rule still takes --t-label, but AC98's later rule draws a run's head at its
  // pair, 600 13 px; tests/desk/ac83-page.test.mjs:559): `.v2-runh` leaves the token list for its pair, the font that wins.
  for (const sel of ['.v2-sn', '.v2-sd', '.v2-sv', '.v2-smn', '.v2-sms', '.v2-prtt', '.v2-callout']) assert.match(rule(sel), /font: var\(--t-(row|small|body|label)\);/, sel);
  const won = (sel) => [...css().matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].split(',').map((x) => x.trim()).includes(sel))
    .map((m) => (/(?:^|;)\s*font:\s*([^;]+)/.exec(m[2]) || [])[1]).filter(Boolean).at(-1);
  assert.equal(won('.v2-runh').trim(), '600 13px/1.3 var(--font)', 'a run\'s head 600 13 px (AC98)');
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
  // Rewritten in G5 (AC92 (c)): the head's words, summed, and the head alone with nothing tracked (it was "Milestones by
  // phase · yours and the model's 24").
  assert.equal(PAGE_WORDS.milestonesHead({ R: 8, T: 16 }), 'Milestones by phase · 8 of 16 reached');
  assert.equal(PAGE_WORDS.milestonesHead(null), 'Milestones by phase');
});

// Added after G5's review, round 1 (the Reviewer's note beside B1; it predates G5): an opened phase's run heads take each
// run's own band from the Timeline, found by the run itself, its key ("<Phase>-i<n>") only where no block is the run's.
// `mix`'s made-up project (tests/desk/glance-fixtures.mjs, NOT real records) has a "Build-i1" gone back over and a later
// "Build-i1" still to come; by key alone, run 1 took the later run's band and read "Run 1 · planned".
test('AC83 (frame 6; G5\'s review): an opened phase\'s run heads each take their own run\'s band — two runs sharing a key ("Build-i1") read apart, run 1 "gone back over", never the later run\'s "planned"', async () => {
  const app = await loadSandbox({ ...mixState(), hash: `#/p/${MIX_PROJECT}`, now: GLANCE_NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    await app.tap(fold(app, 'Build'));
    assert.deepEqual(byClass(keyed(app, 'stdl:Build'), 'v2-runh').map((x) => x.textContent), ['Run 3 · planned', 'Run 2 · planned', 'Run 1 · dates not recorded · gone back over']);
  } finally {
    app.restore();
  }
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
      assert.equal(under.length, ranAgainLines(ctx, TZ, () => null).length, `${label}: the lines ranAgainLines gives, two or more unrecorded said once (AC91 (j))`);
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
  // Rewritten in G5 of "After the glance audit" (AC92 (c): Details' CI line adds " · <y> of <x> workflows passed" after
  // AC29's state): the branch's words pinned as before, the counted workflows' part (ciPassed) drawn after them in the same
  // line, and none with no model (its cases in tests/desk/ac92-glance-counts.test.mjs). Before G5 the line ended at the state.
  // Rewritten in G7 (AC92 (a): "a ✓ before the words of a CI line that reads passing", a ✕ before one that reads failing):
  // the line keyed `details-ci` and its mark (ciMark, which draws none for a missing model) before the same words; the
  // branch's words pinned as before (the mark's cases in tests/desk/ac92-glance-palette.test.mjs).
  assert.match(body, /h\('p', \{ class: 'v2-small', key: 'details-ci' \}, ciMark\(model && model\.ci\), `CI on \$\{project\.defaultBranch\}: \$\{model \? model\.ci : NOT_AVAILABLE\}`, ciPassed\(model\)\)/, 'no model: "not available"');
  assert.match(page, /\nconst ciMark = \(ci\) => \(ci === 'passing' \? [^\n]* : ci === 'failing' \? [^\n]* : null\);/, 'no mark for a missing model (null), as for any state but passing and failing');
  const { ciPassed } = await import('../../src/lib/projectpage.js');
  assert.equal(ciPassed(null), '', 'no model: nothing after "not available"');
  assert.doesNotMatch(body, /CI on [^`]*NOT_RECORDED/, 'never "not recorded"');
  const from = /import \{([^}]*)\} from '\.\/lib\/([a-z]+)\.js';/g;
  const lib = [...page.matchAll(from)].find((m) => /\bNOT_AVAILABLE\b/.test(m[1]));
  assert.ok(lib, 'NOT_AVAILABLE imported from the lib');
  assert.equal((await import(`../../src/lib/${lib[2]}.js`)).NOT_AVAILABLE, 'not available');
});
