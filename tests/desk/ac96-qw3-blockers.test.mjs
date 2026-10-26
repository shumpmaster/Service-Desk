// ac-test: S-001/AC96 — QW3 of "After the questions request": a question other cards wait on comes first and says "Answer first
// · cards <k> and <j> wait on it"; each card it holds up says "Waits on question <k>" (specs/S-001.md, AC96 and AC95's blocker
// parts; the owner's "Blockers first", answer 2, "The question names them (Recommended)", and "After the blockers
// (Recommended)", decisions/questions/P-001-m3g-held-place.md, B; the readings (l), (m) and (n), standing by "Approve; all
// readings stand (Recommended)", decisions/questions/P-001-m3g-readings.md, A).
// ac-test: S-001/AC95 join-test: S-001/J2
//
// The pure cases are records.js's `Blocks:` read (J2, changed: blocksLine) and board.js's (blockTies, blockerOrder, placesOf
// with the blockers, boardView's lines and the section's order), each from made-up question texts labelled NOT real. The screen
// cases are the sandbox's own code under the fake DOM, on tests/desk/qw3-fixtures.mjs's `qw3BusiestState` (QW2's busiest board
// with made-up `Blocks:` lines, as the approved picture's frame 1 draws them), each made-up part labelled NOT real in
// tests/desk/fixtures/README.md. The suite has no browser, so each look is the cascade of the page's own stylesheets over what
// it drew (tests/desk/css-cascade.mjs), in light and dark, at 360 and 414 px; the stage's pull request carries the Chromium
// captures (`qw3-`, tests/desk/tools/glance-shots.mjs), which measure each new line. This file holds QW3's page loads, apart
// from ac88-dark.test.mjs (the suite's memory: each file runs in its own process).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC, CONFIG, fixture } from './helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { byClass, findAll, El0 } from './sandbox-helpers.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { blocksLine, blocksEntry } from '../../src/lib/records.js';
import * as PUBLIC_RECORDS from '../../src/public/lib/records.js';
import { askedInSession } from '../../src/lib/asking.js';
import { boardView, blockTies, blockerOrder, placesOf, noMarks, BLOCK_WORDS, PLACE_WORDS, SECTION_WORDS } from '../../src/lib/board.js';
import * as PUBLIC_BOARD from '../../src/public/lib/board.js';
import { qw3BusiestState, qw3Open, withBlocks, ALPHA_HELD, ALPHA_QW3, ALPHA_BLOCKS, NOW } from './qw3-fixtures.mjs';
import { Q_SECOND } from './qw2-fixtures.mjs';
import { qFile, qid, QPATH, HELD_PATH, SID, Q_ALPHA, Q_DELTA } from './qw1-fixtures.mjs';

const H = 3600e3;
const MIN = 60e3;
const TZ = CONFIG.ownerTimeZone;
const enc = encodeURIComponent;
const THEMES = ['light', 'dark'];
const WIDTHS = [360, 414];
const INK = { light: { ink: '#18191c', ink2: '#5c5f66' }, dark: { ink: '#ecedef', ink2: '#a2a5ac' } };
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');
/** Each drawn element's cascaded look in a theme and at a width: el → { colour, size, decl(prop), raw(prop) }. */
function looks(app, theme, width = 360) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) {
    if (!n.el) continue;
    out.set(n.el, { colour: plain(n.style.get('color')).trim().toLowerCase(), size: plain(n.style.get('font-size')), lh: plain(n.style.get('line-height')),
      decl: (p) => plain(n.declared.get(p)).trim(), raw: (p) => String(n.declared.get(p) || ''), style: (p) => plain(n.style.get(p)).trim() });
  }
  return out;
}
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const cardOf = (app, id) => findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === id && / v2-card /.test(` ${e.className} `) && !findAll(e, (x) => x !== e && x.attrs && x.attrs['data-card'] === id).length)[0] || null;
const placeEl = (c) => (c && c.children[0] && / v2-place /.test(` ${c.children[0].className} `) ? c.children[0] : null);
const shown = (pl) => pl.children.filter((x) => x.nodeType === 3).map((x) => x.text).join('');
const placeAt = (app, id) => { const pl = placeEl(cardOf(app, id)); return pl ? shown(pl) : null; };
const afirst = (c) => (c ? byClass(c, 'v2-afirst').map((x) => x.textContent) : null);
const waitsOf = (c) => (c ? byClass(c, 'v2-waits').map((x) => x.textContent) : null);
const waitLinks = (c) => byClass(c, 'v2-waits').flatMap((x) => x.children.filter((a) => a.tag === 'a'));
const sheet = (app) => byClass(app.view, 'v2-sheet')[0] || null;
const sheetHead = (app) => byClass(byClass(sheet(app), 'v2-shead')[0], 'v2-mono')[0].textContent;
const blocksBlock = (app) => findAll(sheet(app), (e) => e.dataset && e.dataset.k === 'blocks')[0] || null;
const sectionIds = (app) => byClass(keyed(app, 'qsec'), 'v2-qcard').map((c) => c.attrs['data-card']);
const seen = (extra = {}) => memStore({ 'desk-seen-v1': JSON.stringify({ lastLooked: NOW + H }), ...extra });
const hist = (ms) => [{ commit: { committer: { date: new Date(ms).toISOString() } } }];
const ALPHA = (name) => `Alpha|question|questions/${name}.md`;

// ---------------------------------------------------------------------------
// The pure cases: the `Blocks:` line (J2, changed; AC96, "The line"), from made-up question texts, NOT real.

const QT = (lines) => `${lines.join('\n')}\n`;
const TEMPLATE_BODY = ['WHY: made up, NOT a real question (QW3\'s cases).', 'OPTIONS:', '  A. Yes.', '  B. No.', 'RECOMMENDATION: A', 'RISK CLASS: R0',
  'REVERSIBILITY: reversible', 'BLAST RADIUS: none', 'DEFAULT: none', 'TIMEOUT: none', '', '## Context', '- made up (source: none)'];
const forms = (b) => (b ? b.entries.map((e) => [e.entry, e.kind, e.number ?? e.path ?? null]) : null);

test('AC96 + J2 (pure, the line): `Blocks: <entry>, <entry>` in column 0 — a pull request, a card and another question named, each in its form; entries split on ", " and trimmed; a text with no line names nothing; the real template has none; the page\'s copy is the same module', () => {
  const text = QT(['# Ruling needed: A made-up question, NOT real', '', 'Milestone: M3G', 'Blocks: #12, queue/P-001-stop-6.md, questions/Q-007-sources.md', '', ...TEMPLATE_BODY]);
  const b = blocksLine(text);
  assert.equal(b.line, 'Blocks: #12, queue/P-001-stop-6.md, questions/Q-007-sources.md');
  assert.deepEqual(forms(b), [['#12', 'pr', 12], ['queue/P-001-stop-6.md', 'card', 'queue/P-001-stop-6.md'], ['questions/Q-007-sources.md', 'question', 'questions/Q-007-sources.md']]);
  // Trimmed: spaces around an entry, and trailing white space on the line.
  assert.deepEqual(forms(blocksLine('Blocks:   #12 ,  queue/x-stop-1.md \t\nWHY: x\n')), [['#12', 'pr', 12], ['queue/x-stop-1.md', 'card', 'queue/x-stop-1.md']]);
  // No line: names nothing (AC96: "a question whose file names none is never taken for a blocker").
  assert.equal(blocksLine(QT(['# Ruling needed: none named', '', ...TEMPLATE_BODY])), null);
  assert.equal(blocksLine(null), null);
  assert.equal(blocksLine(fixture('service-desk/questions/_TEMPLATE.md')), null, 'the template');
  assert.equal(PUBLIC_RECORDS.blocksLine.toString(), blocksLine.toString());
  assert.equal(PUBLIC_RECORDS.blocksEntry.toString(), blocksEntry.toString());
});

test('AC96 + J2 (pure, malformed lines): an entry in no form is kept as one ("#12,#13" with no space, "#0", "#12a", a word, a path under queue/ or questions/ not ending .md or in a folder, "Queue/…"); an empty line and empty entries name nothing; a line not in column 0, or not spelled `Blocks:`, is not the line', () => {
  const at = (line) => forms(blocksLine(`# Ruling needed: x\n\n${line}\nWHY: y\n`));
  assert.deepEqual(at('Blocks: #12,#13'), [['#12,#13', 'bad', null]], 'split on ", " only');
  for (const e of ['#0', '#012', '#12a', '# 12', 'card 7', 'queue/P-001-stop-6.txt', 'queue/merge/P-001-merge.md', 'questions/sub/Q-1.md', 'Queue/P-001-stop-6.md', 'P-001-stop-6.md', 'questions/', '12']) {
    assert.deepEqual(at(`Blocks: ${e}`), [[e, 'bad', null]], e);
  }
  assert.deepEqual(at('Blocks:'), [], 'an empty line: no entry');
  assert.deepEqual(at('Blocks: , #4, , #5'), [['#4', 'pr', 4], ['#5', 'pr', 5]], 'empty entries dropped');
  assert.deepEqual(at('Blocks: #4,'), [['#4,', 'bad', null]], 'a trailing comma with no space: one entry in no form');
  assert.deepEqual(at('Blocks:#4'), [['#4', 'pr', 4]], 'no space after the colon: still the line');
  assert.equal(blocksLine('# Ruling needed: x\n\n  Blocks: #4\nWHY: y\n'), null, 'not in column 0');
  assert.equal(blocksLine('# Ruling needed: x\n\nblocks: #4\nBlocked: #5\nWHY: y\n'), null, 'not `Blocks:`');
});

test('AC96 + J2 (pure, where the line is read): before and after its `Milestone:` and `Asked in session:` lines (the hold still read); a line after `WHY:` not read; a second line not read; a file with no `WHY:` line read before its `## Context` line or its end; a v2.5 question read the same way', () => {
  const v3 = (head) => QT(['# Ruling needed: x', '', ...head, '', ...TEMPLATE_BODY]);
  // Before the `Milestone:` line, and after the `Milestone:` and `Asked in session:` lines (the session lines' practice: the
  // `Asked in session:` line directly under `Milestone:`, AC77's askedInSession), the hold read as before.
  const before = v3(['Blocks: #4', 'Milestone: M3G', `Asked in session: ${SID}`]);
  const after = v3(['Milestone: M3G', `Asked in session: ${SID}`, 'Blocks: #4']);
  for (const t of [before, after]) {
    assert.deepEqual(forms(blocksLine(t)), [['#4', 'pr', 4]]);
    assert.equal(askedInSession(t, 'v3'), SID, 'the hold still read');
  }
  // After `WHY:`: not read.
  assert.equal(blocksLine(QT(['# Ruling needed: x', '', 'WHY: y', 'Blocks: #4', 'OPTIONS:', '  A. a'])), null);
  assert.equal(blocksLine(withBlocks(Q_ALPHA, 'Blocks: #4', 'why')), null, 'a made-up question with its line after WHY:');
  // A second line: not read (the first only).
  assert.deepEqual(forms(blocksLine(v3(['Blocks: #4', 'Blocks: #5']))), [['#4', 'pr', 4]]);
  // No `WHY:` line: read before its `## Context` line, not after it; with neither, anywhere.
  assert.deepEqual(forms(blocksLine(QT(['# Ruling needed: x', 'Blocks: #4', 'OPTIONS:', '  A. a', '## Context', '- y']))), [['#4', 'pr', 4]]);
  assert.equal(blocksLine(QT(['# Ruling needed: x', 'OPTIONS:', '  A. a', '## Context', 'Blocks: #4'])), null, 'after ## Context');
  assert.deepEqual(forms(blocksLine(QT(['# Ruling needed: x', 'OPTIONS:', '  A. a', 'Blocks: #4']))), [['#4', 'pr', 4]], 'no WHY:, no ## Context: to its end');
  // A `WHY` not in column 0 is not the file's `WHY:` line; nor is "WHY" without its colon.
  assert.deepEqual(forms(blocksLine(QT(['# Ruling needed: x', '  WHY: indented', 'WHYNOT', 'Blocks: #4', 'WHY: y']))), [['#4', 'pr', 4]]);
  // A v2.5 question (QW1's made-up Delta question), its line before `WHY:`: the same read.
  const d = withBlocks(Q_DELTA, 'Blocks: #3, questions/Delta-2.md');
  assert.deepEqual(forms(blocksLine(d)), [['#3', 'pr', 3], ['questions/Delta-2.md', 'question', 'questions/Delta-2.md']]);
  const d25 = withBlocks(qFile({ title: 'A made-up v2.5 question, NOT real', asked: SID, options: ['A. This.', 'B. That.'] }), 'Blocks: #3');
  assert.deepEqual(forms(blocksLine(d25)), [['#3', 'pr', 3]]);
  assert.equal(askedInSession(d25, 'v2.5'), SID, 'a v2.5 hold still read');
});

// ---------------------------------------------------------------------------
// The pure cases: the blockers (AC95's blocker parts; AC96's "What counts").

const P = { name: 'Alpha', repo: 'shumpmaster/Alpha', defaultBranch: 'main', model: 'v3' };
const P2 = { name: 'Beta', repo: 'shumpmaster/Beta', defaultBranch: 'main', model: 'v3' };
const qtext = (name, blocks) => QT([`# Ruling needed: ${name}`, '', ...(blocks ? [blocks] : []), ...TEMPLATE_BODY]);
/** A made-up question card (NOT real) of `project`, raised at `raisedAt`, its file's `Blocks:` line `blocks` (or none). */
const qc = (project, name, raisedAt, blocks = null) => {
  const path = `questions/${name}.md`;
  return { id: `${project}|question|${path}`, key: `q:${name}`, project, kind: 'question', kindWord: 'Question', title: name, name, raisedAt, step: { id: 'answer' }, meta: [],
    flag: { kind: 'question', key: `q:${name}`, question: { name, path, title: name, parsed: { text: qtext(name, blocks) } } } };
};
const prc = (project, n, raisedAt) => ({ id: `${project}|pr|${n}`, key: `pr:${n}`, project, kind: 'pr', kindWord: 'Pull request', title: `#${n}`, number: n, raisedAt, step: { id: 'open' }, meta: [`#${n}`] });
const kc = (project, kind, path, raisedAt = null) => ({ id: `${project}|${kind}|${path}`, key: `${kind}:${path}`, project, kind, kindWord: kind, title: path, raisedAt, step: { id: 'open' }, meta: [] });
/** A made-up question held as being asked in a session (NOT real; AC77's `askingRows` form), with its `Blocks:` line. */
const heldRow = (name, blocks = null, raisedAt = NOW - H) => ({ name, path: `questions/${name}.md`, title: name, parsed: { text: qtext(name, blocks) }, raisedAt: new Date(raisedAt), link: null, state: 'held' });
const entry = (project, cards, { asking = [] } = {}) => ({ project, cards, agents: [], read: { ok: true }, recording: [], asking, answerRecording: [], recordRows: [], seenRows: [] });
const view = (projects, { only = null, marks = noMarks() } = {}) => boardView({ projects, marks, only, nowMs: NOW, tz: TZ });
const order = (v, name) => [...v.places].filter(([, p]) => p.project === name).sort((a, b) => a[1].k - b[1].k).map(([id]) => id);
const marksOf = (...ms) => ({ v: 1, marks: Object.fromEntries(ms) });
const kick = (id) => [id, { project: id.split('|')[0], step: 'answer', head: null, at: NOW - 9 * MIN, title: id, kicked: { at: NOW - 3 * MIN, reason: 'made up' }, prevKick: null, confirmedAt: null,
  number: null, kind: id.split('|')[1], name: null }];

test('AC96 (pure, what counts): a pull request\'s, a card file\'s (a decision, a gate, a hold, a merge card) and a question\'s card with a place in the question\'s own project count, each once; a held question, an item not waiting now (any item with no place — merged, answered, with the agents or not found alike; here one marked done on this device and ones not found) and an entry in no form each in its words, none counted; the question itself dropped; a line naming only such entries, no blocker; no line, no entry in the map', () => {
  const cards = [
    qc('Alpha', 'Q', NOW - 9 * H, 'Blocks: #1, queue/D-stop-1.md, queue/G-criteria-1.md, queue/ci-hold-1.md, queue/G-merge-conflict.md, questions/R.md, #1, questions/Q.md, questions/H.md, #2, queue/gone-stop-1.md, questions/gone.md, card 7'),
    prc('Alpha', 1, NOW - H), kc('Alpha', 'card', 'queue/D-stop-1.md', NOW - H), kc('Alpha', 'gate', 'queue/G-criteria-1.md', NOW - H), kc('Alpha', 'hold', 'queue/ci-hold-1.md'),
    kc('Alpha', 'merge', 'queue/G-merge-conflict.md'), qc('Alpha', 'R', NOW - H), qc('Alpha', 'S', NOW - H, 'Blocks: #2, questions/H.md, nonsense, questions/S.md'), qc('Alpha', 'T', NOW - H),
  ];
  const held = [{ id: 'Alpha|question|questions/H.md', kind: 'question', held: true, flag: { question: { path: 'questions/H.md', parsed: { text: qtext('H', 'Blocks: #1') } } } }];
  const ties = blockTies({ project: 'Alpha', cards, held });
  assert.deepEqual(ties.get(ALPHA('Q')).holds, ['Alpha|pr|1', 'Alpha|card|queue/D-stop-1.md', 'Alpha|gate|queue/G-criteria-1.md', 'Alpha|hold|queue/ci-hold-1.md',
    'Alpha|merge|queue/G-merge-conflict.md', ALPHA('R')], 'each counted once, in the line\'s order; itself dropped');
  assert.deepEqual(ties.get(ALPHA('Q')).words.map((w) => w.words), ['questions/H.md: being asked in your session', '#2: not waiting on you now',
    'queue/gone-stop-1.md: not waiting on you now', 'questions/gone.md: not waiting on you now', 'can\'t read: card 7']);
  // S names only entries that do not count: no blocker; T names nothing: not in the map; the held question H: its own entry.
  assert.deepEqual(ties.get(ALPHA('S')), { holds: [], words: [{ entry: '#2', words: '#2: not waiting on you now' }, { entry: 'questions/H.md', words: 'questions/H.md: being asked in your session' },
    { entry: 'nonsense', words: 'can\'t read: nonsense' }], held: false });
  assert.equal(ties.has(ALPHA('T')), false);
  assert.deepEqual(ties.get('Alpha|question|questions/H.md'), { holds: ['Alpha|pr|1'], words: [], held: true });
  // On the board: S takes its place by age, never first; a card marked done here (the merge card) no longer counts.
  const v = view([entry(P, cards)], { marks: marksOf(['Alpha|merge|queue/G-merge-conflict.md', { project: 'Alpha', step: 'open', head: null, at: NOW - MIN, title: 'm', kicked: null, prevKick: null, confirmedAt: null, number: null, kind: 'merge', name: null }]) });
  assert.equal(v.places.get(ALPHA('Q')).k, 1, 'Q, a blocker, first');
  assert.equal(v.blocking.get(ALPHA('Q')).words.find((w) => w.entry === 'queue/G-merge-conflict.md').words, 'queue/G-merge-conflict.md: not waiting on you now', 'marked done here: not waiting now');
  assert.deepEqual(order(v, 'Alpha').slice(1), ['Alpha|card|queue/D-stop-1.md', 'Alpha|gate|queue/G-criteria-1.md', 'Alpha|pr|1', ALPHA('R'), ALPHA('S'), ALPHA('T'), 'Alpha|hold|queue/ci-hold-1.md'],
    'every other card by age, then by the AC73 key in code-unit order: S no blocker');
  assert.equal(v.questions.groups[0].rows.find((c) => c.id === ALPHA('S')).answerFirst, null, 'S says nothing of "Answer first"');
});

// AC95's five worked cases, raised 1st earliest (C, (l)): each a test, on blockerOrder and on the board.
const WORKED = [
  ['Y (1st) waits on X (3rd); Z (2nd) holds up only a pull request: Z, X, Y', { Y: ['#91'], Z: ['#92'], X: ['questions/Y.md'] }, ['Y', 'Z', 'X'], ['Z', 'X', 'Y']],
  ['A (1st) waits on C (3rd); B (2nd) waits on none: B, C, A', { A: ['#91'], B: ['#92'], C: ['questions/A.md'] }, ['A', 'B', 'C'], ['B', 'C', 'A']],
  ['A (1st) and B (2nd) wait on each other; C (3rd) waits on A: A, B, C', { A: ['questions/B.md', 'questions/C.md'], B: ['questions/A.md'], C: ['#91'] }, ['A', 'B', 'C'], ['A', 'B', 'C']],
  ['the same, with D (4th) waiting on none: D, A, B, C', { A: ['questions/B.md', 'questions/C.md'], B: ['questions/A.md'], C: ['#91'], D: ['#92'] }, ['A', 'B', 'C', 'D'], ['D', 'A', 'B', 'C']],
  ['W (1st) waits on V (2nd), V waits on U (3rd): U, V, W', { W: ['#91'], V: ['questions/W.md'], U: ['questions/V.md'] }, ['W', 'V', 'U'], ['U', 'V', 'W']],
];
for (const [name, lines, raised, want] of WORKED) {
  test(`AC95 (pure, the blocker order, worked case): ${name}`, () => {
    // Every named question holds up something (a made-up pull request or another), so each is a blocker.
    const qs = raised.map((n, i) => qc('Alpha', n, NOW - (10 - i) * H, `Blocks: ${lines[n].join(', ')}`));
    const prs = [prc('Alpha', 91, NOW - 30 * MIN), prc('Alpha', 92, NOW - 20 * MIN)];
    const holds = new Map([...blockTies({ project: 'Alpha', cards: [...qs, ...prs] })].map(([id, t]) => [id, t.holds]));
    assert.deepEqual(blockerOrder(qs, holds).map((c) => c.name), want, 'blockerOrder');
    // On the board: the same, first, in the section; then every other card by age.
    const v = view([entry(P, [...prs].reverse().concat([...qs].reverse()))]);
    assert.deepEqual(order(v, 'Alpha').slice(0, want.length), want.map(ALPHA), 'the places');
    assert.deepEqual(order(v, 'Alpha').slice(want.length), ['Alpha|pr|91', 'Alpha|pr|92']);
    assert.deepEqual(v.questions.order.map((c) => c.name), want, 'the section draws them so');
    assert.ok(v.questions.order.every((c) => c.blocker === true));
  });
}

test('AC95 (pure, the blocker order, loops): with none free, the earliest raised of those in a loop goes next, never an earlier one that only waits on the loop (which goes once it is free); a loop through three; a loop left after the free ones', () => {
  // X (1st) waits on A (2nd); A and B (3rd) wait on each other. None is free; X is earliest but in no loop, so A goes first;
  // then X and B are both free, and X, the earlier raised, goes before B: A, X, B.
  const run = (raised, lines) => {
    const qs = raised.map((n, i) => qc('Alpha', n, NOW - (10 - i) * H, `Blocks: ${lines[n].join(', ')}`));
    const holds = new Map([...blockTies({ project: 'Alpha', cards: [...qs, prc('Alpha', 91, NOW)] })].map(([id, t]) => [id, t.holds]));
    return blockerOrder(qs, holds).map((c) => c.name);
  };
  assert.deepEqual(run(['X', 'A', 'B'], { X: ['#91'], A: ['questions/X.md', 'questions/B.md'], B: ['questions/A.md'] }), ['A', 'X', 'B']);
  // P (1st) → Q (2nd) → R (3rd) → P: a loop through three, the earliest first, then each as it is freed.
  assert.deepEqual(run(['P', 'Q', 'R'], { P: ['questions/Q.md'], Q: ['questions/R.md'], R: ['questions/P.md'] }), ['P', 'Q', 'R']);
  // F (3rd) free goes before the loop A (1st) and B (2nd).
  assert.deepEqual(run(['A', 'B', 'F'], { A: ['questions/B.md'], B: ['questions/A.md'], F: ['#91'] }), ['F', 'A', 'B']);
});

test('AC95 (pure, the blocker order): a question that waits on a blocker but holds up nothing is no blocker and takes its place by age; a blocker with no raised time after every blocker with one, then by the tie rule; ties in code-unit order; one with no loop never jumps a free one', () => {
  // Y waits on X but holds up nothing: Z, X, then the rest by age (#5 raised before Y).
  const v = view([entry(P, [qc('Alpha', 'Y', NOW - 10 * H), qc('Alpha', 'Z', NOW - 9 * H, 'Blocks: #6'), qc('Alpha', 'X', NOW - 8 * H, 'Blocks: questions/Y.md'), prc('Alpha', 5, NOW - 20 * H), prc('Alpha', 6, NOW - H)])]);
  assert.deepEqual(order(v, 'Alpha'), [ALPHA('Z'), ALPHA('X'), 'Alpha|pr|5', ALPHA('Y'), 'Alpha|pr|6']);
  assert.equal(v.questions.order.find((c) => c.name === 'Y').blocker, false);
  // No raised time (a question whose history was not read): after the blockers with one, however long it has waited.
  const none = qc('Alpha', 'N', null, 'Blocks: #6');
  const w = view([entry(P, [none, qc('Alpha', 'b', NOW - H, 'Blocks: #6'), qc('Alpha', 'B', NOW - H, 'Blocks: #6'), prc('Alpha', 6, NOW - 20 * H)])]);
  assert.deepEqual(order(w, 'Alpha'), [ALPHA('B'), ALPHA('b'), ALPHA('N'), 'Alpha|pr|6'], 'B before b in code units (U+0042 before U+0062), N with no raised time last of the blockers');
  assert.deepEqual(w.questions.order.find((c) => c.name === 'N').answerFirst, [4]);
  // Two devices reading the same records: the same places, whatever order the cards come in.
  const cards = [qc('Alpha', 'A', NOW - 9 * H, 'Blocks: questions/B.md, questions/C.md'), qc('Alpha', 'B', NOW - 8 * H, 'Blocks: questions/A.md'), qc('Alpha', 'C', NOW - 7 * H, 'Blocks: #1'), prc('Alpha', 1, NOW - 99 * H)];
  const ties = blockTies({ project: 'Alpha', cards });
  assert.deepEqual([...placesOf([...cards].reverse(), ties)], [...placesOf(cards, ties)]);
  assert.equal(PUBLIC_BOARD.blockerOrder.toString(), blockerOrder.toString());
  assert.equal(PUBLIC_BOARD.blockTies.toString(), blockTies.toString());
  assert.equal(PUBLIC_BOARD.placesOf.toString(), placesOf.toString());
});

test('AC95 (pure, what the cards say): a blocker\'s "Answer first" names the places of the cards it holds up, rising ("card 2", "cards 2 and 5", "cards 2, 3 and 5"); each card held up its blockers\' places, rising ("Waits on question 1", "questions 1 and 2"); the sheet\'s list each card by its place, kind and title; a kicked-back blocker keeps its place by its raised time and is still first', () => {
  const cards = [qc('Alpha', 'one', NOW - 9 * H, 'Blocks: #3, #2, queue/P-1-stop-1.md'), qc('Alpha', 'two', NOW - 8 * H, 'Blocks: #3'), prc('Alpha', 2, NOW - 7 * H), prc('Alpha', 3, NOW - 6 * H),
    kc('Alpha', 'card', 'queue/P-1-stop-1.md', NOW - 5 * H), prc('Alpha', 4, NOW - 99 * H)];
  const v = view([entry(P, cards)], { marks: marksOf(kick(ALPHA('two'))) });
  assert.deepEqual(order(v, 'Alpha'), [ALPHA('one'), ALPHA('two'), 'Alpha|pr|4', 'Alpha|pr|2', 'Alpha|pr|3', 'Alpha|card|queue/P-1-stop-1.md']);
  const q = (n) => v.questions.order.find((c) => c.name === n);
  assert.deepEqual([q('one').answerFirst, q('two').answerFirst, q('two').lane], [[4, 5, 6], [5], 'kick'], 'the kicked-back blocker, still first');
  assert.deepEqual([BLOCK_WORDS.answerFirst([2]), BLOCK_WORDS.answerFirst([2, 5]), BLOCK_WORDS.answerFirst([2, 3, 5])],
    ['Answer first · card 2 waits on it', 'Answer first · cards 2 and 5 wait on it', 'Answer first · cards 2, 3 and 5 wait on it']);
  const lane = v.lanes.find((l) => l.key === 'wait').groups[0].rows;
  const ws = (id) => lane.find((c) => c.id === id).waitsOn;
  assert.deepEqual(ws('Alpha|pr|3'), [{ id: ALPHA('one'), k: 1 }, { id: ALPHA('two'), k: 2 }]);
  assert.deepEqual(ws('Alpha|pr|2'), [{ id: ALPHA('one'), k: 1 }]);
  assert.equal(ws('Alpha|pr|4'), null);
  assert.deepEqual([BLOCK_WORDS.waitsOn([1]), BLOCK_WORDS.waitsOn([1, 2]), BLOCK_WORDS.waitsOn([1, 2, 3])], ['Waits on question 1', 'Waits on questions 1 and 2', 'Waits on questions 1, 2 and 3']);
  assert.deepEqual(v.blocking.get(ALPHA('one')).cards.map((c) => `${PLACE_WORDS.line(c.k, c.n)} · ${c.kindWord} · ${c.title}`),
    ['4 of 6 waiting · Pull request · #2', '5 of 6 waiting · Pull request · #3', '6 of 6 waiting · card · queue/P-1-stop-1.md']);
  // The word "unblocks" stays the milestone's alone (AC66's "Unblocks" line).
  assert.ok(Object.values(BLOCK_WORDS).every((w) => !/unblock/i.test(typeof w === 'function' ? w([1, 2]) : w)));
});

test('AC95 + AC96 (pure, a held blocker; the owner\'s answer 3 and "After the blockers"): a held question has no place and is never a blocker in the order; its line\'s cards say they wait on a question being asked in your session and take their places by age; it says "Answer first" too; it sits after its project\'s blockers and before its other questions, with no "Done ✓"; a card held up by both a numbered and a held question names the numbered first', () => {
  const cards = [qc('Alpha', 'blk', NOW - 2 * H, 'Blocks: #2'), qc('Alpha', 'other', NOW - 9 * H), prc('Alpha', 2, NOW - 8 * H), prc('Alpha', 3, NOW - 7 * H)];
  const v = view([entry(P, cards, { asking: [heldRow('held', 'Blocks: #3, #2, questions/held.md', NOW - 20 * H)] })]);
  assert.deepEqual(order(v, 'Alpha'), [ALPHA('blk'), ALPHA('other'), 'Alpha|pr|2', 'Alpha|pr|3'], 'the held question first raised, yet no place; its cards by age');
  const g = v.questions.groups[0];
  assert.deepEqual(g.cards.map((c) => c.name), ['blk', 'held', 'other'], 'after the blockers, before its other questions');
  assert.deepEqual(v.questions.order.map((c) => c.name), ['blk', 'held', 'other']);
  const h = g.held[0];
  assert.deepEqual([h.place, h.blocker, h.answerFirst], [null, false, [3, 4]]);
  const lane = v.lanes.find((l) => l.key === 'wait').groups[0].rows;
  assert.deepEqual(lane.find((c) => c.id === 'Alpha|pr|2').waitsOn, [{ id: ALPHA('blk'), k: 1 }, { id: ALPHA('held'), held: true }], 'the numbered first');
  assert.deepEqual(lane.find((c) => c.id === 'Alpha|pr|3').waitsOn, [{ id: ALPHA('held'), held: true }]);
  assert.equal(BLOCK_WORDS.waitsHeld, 'Waits on a question being asked in your session');
  assert.deepEqual(v.blocking.get(ALPHA('held')).cards.map((c) => c.id), ['Alpha|pr|2', 'Alpha|pr|3']);
  // A held question with no line: at its group's head when the group has no blocker (QW1's place kept there).
  const w = view([entry(P, [qc('Alpha', 'other', NOW - 9 * H)], { asking: [heldRow('plain')] })]);
  assert.deepEqual(w.questions.order.map((c) => c.name), ['plain', 'other']);
  // Named by another question's line: "being asked in your session", never counted.
  const x = view([entry(P, [qc('Alpha', 'q', NOW - 9 * H, 'Blocks: questions/plain.md')], { asking: [heldRow('plain')] })]);
  assert.deepEqual([x.places.get(ALPHA('q')).k, x.questions.order[0].name, x.blocking.get(ALPHA('q')).words[0].words], [1, 'plain', 'questions/plain.md: being asked in your session']);
});

test('AC96 (pure, across projects; answer 1, "One order per project"): a question counts only cards in its own project — its "#80" never Beta\'s #80 — and lists the rest in words; each project numbers its own blockers; with one project shown each card keeps its place and its lines', () => {
  const alpha = [qc('Alpha', 'a', NOW - H, 'Blocks: #80, #81'), prc('Alpha', 81, NOW - 9 * H)];
  const beta = [prc('Beta', 80, NOW - 9 * H), qc('Beta', 'b', NOW - H, 'Blocks: #80')];
  for (const only of [null, 'Alpha', 'Beta']) {
    const v = view([entry(P, alpha), entry(P2, beta)], { only });
    assert.deepEqual([order(v, 'Alpha'), order(v, 'Beta')], [[ALPHA('a'), 'Alpha|pr|81'], ['Beta|question|questions/b.md', 'Beta|pr|80']], `${only}: each project's own`);
    assert.deepEqual(v.blocking.get(ALPHA('a')).words, [{ entry: '#80', words: '#80: not waiting on you now' }], `${only}: Beta's #80 is not Alpha's`);
    if (only !== 'Beta') assert.deepEqual(v.questions.groups.find((g) => g.project === 'Alpha').rows[0].answerFirst, [2]);
    if (only !== 'Alpha') assert.deepEqual(v.lanes.find((l) => l.key === 'wait').groups.find((g) => g.project === 'Beta').rows[0].waitsOn, [{ id: 'Beta|question|questions/b.md', k: 1 }]);
  }
});

test('AC95 (pure, a blocker answered): once it leaves, its cards lose their "Waits on" line and go back to their places by age; the other blockers close up', () => {
  const blk = qc('Alpha', 'blk', NOW - H, 'Blocks: #2, #3');
  const rest = [qc('Alpha', 'blk2', NOW - 30 * MIN, 'Blocks: #3'), prc('Alpha', 2, NOW - 2 * H), prc('Alpha', 3, NOW - 9 * H), prc('Alpha', 4, NOW - 5 * H)];
  const before = view([entry(P, [blk, ...rest])]);
  assert.deepEqual(order(before, 'Alpha'), [ALPHA('blk'), ALPHA('blk2'), 'Alpha|pr|3', 'Alpha|pr|4', 'Alpha|pr|2']);
  const after = view([entry(P, rest)]);
  assert.deepEqual(order(after, 'Alpha'), [ALPHA('blk2'), 'Alpha|pr|3', 'Alpha|pr|4', 'Alpha|pr|2']);
  const lane = after.lanes.find((l) => l.key === 'wait').groups[0].rows;
  assert.deepEqual(lane.map((c) => [c.id, c.waitsOn && c.waitsOn.map((x) => x.k)]), [['Alpha|pr|3', [1]], ['Alpha|pr|4', null], ['Alpha|pr|2', null]]);
  // And the last: no blocker, every card by age, as QW2 placed them.
  const none = view([entry(P, rest.slice(1))]);
  assert.deepEqual(order(none, 'Alpha'), ['Alpha|pr|3', 'Alpha|pr|4', 'Alpha|pr|2']);
  assert.ok(none.lanes.find((l) => l.key === 'wait').groups[0].rows.every((c) => c.waitsOn === null));
});

// ---------------------------------------------------------------------------
// The screen cases, on qw3BusiestState (made up, NOT real).

test('AC95 + AC96 on the busiest board (qw3BusiestState, made up, NOT real; the picture\'s frame 1): Alpha\'s blockers first, "1 of 12" and "2 of 12", the held blocker after them saying "Answer first · cards 4 and 10 wait on it"; Beta\'s kicked-back blocker with its held question after it; every "Answer first" and "Waits on" line as the lines name them, on lane, strip and section cards', async () => {
  const app = await qw3Open(qw3BusiestState(), '#/waiting');
  try {
    assert.deepEqual(ALPHA_QW3.map((id) => placeAt(app, id)), ALPHA_QW3.map((_, i) => `${i + 1} of 12 waiting`));
    // The section: Alpha's blockers, its held blocker, then Beta's blocker and its held question (no line), then the rest.
    assert.deepEqual(sectionIds(app).slice(0, 6), [ALPHA('Alpha-pick'), ALPHA('Alpha-second'), qid('Alpha', ALPHA_HELD), qid('Beta', QPATH.Beta), qid('Beta', HELD_PATH), qid('Gamma', QPATH.Gamma)]);
    const says = (id) => [afirst(cardOf(app, id)), waitsOf(cardOf(app, id))];
    assert.deepEqual(says(ALPHA('Alpha-pick')), [['Answer first · cards 5 and 7 wait on it'], []]);
    assert.deepEqual(says(ALPHA('Alpha-second')), [['Answer first · cards 7 and 8 wait on it'], []]);
    assert.deepEqual(says(qid('Alpha', ALPHA_HELD)), [['Answer first · cards 4 and 10 wait on it'], []], 'the picture\'s held blocker');
    assert.deepEqual(says(qid('Beta', QPATH.Beta)), [['Answer first · card 2 waits on it'], []]);
    assert.deepEqual(says(qid('Beta', HELD_PATH)), [[], []], 'a held question with no line');
    assert.deepEqual(says(qid('Gamma', QPATH.Gamma)), [['Answer first · card 6 waits on it'], []]);
    assert.deepEqual(says('Alpha|card|queue/Q-020-stop-1.md'), [[], ['Waits on questions 1 and 2']]);
    assert.deepEqual(says('Alpha|pr|81'), [[], ['Waits on question 1']]);
    assert.deepEqual(says('Alpha|pr|82'), [[], ['Waits on question 2']], 'a strip card');
    assert.deepEqual(says('Alpha|pr|80'), [[], ['Waits on a question being asked in your session']]);
    assert.deepEqual(says('Alpha|hold|queue/ci-hold-4a2448939173.md'), [[], ['Waits on a question being asked in your session']]);
    assert.deepEqual(says('Beta|pr|80'), [[], ['Waits on question 1']]);
    assert.deepEqual(says('Gamma|merge|queue/P-002-merge-conflict.md'), [[], ['Waits on question 1']], 'a strip card in another project');
    assert.deepEqual(says('Alpha|pr|83'), [[], []]);
    // The held blocker: no place, "Being asked in your session", and no "Done ✓".
    const hc = cardOf(app, qid('Alpha', ALPHA_HELD));
    assert.equal(hc.attrs['data-question'], 'held');
    assert.equal(placeEl(hc).textContent, PLACE_WORDS.held);
    assert.equal(keyed(app, `qdone:${qid('Alpha', ALPHA_HELD)}`), null, 'no "Done ✓"');
    assert.ok(keyed(app, `qdone:${ALPHA('Alpha-pick')}`), 'a counted blocker has one');
    // The head: six counted questions (Alpha's two, Beta's, Gamma's, Delta's, Epsilon's) and two held.
    assert.equal(byClass(keyed(app, 'qhead'), 'v2-lc')[0].textContent, '6');
    assert.match(keyed(app, 'qhead').textContent, /· 2 being asked in your session$/);
  } finally {
    app.restore();
  }
});

test('AC95 ("What a blocker says"; AC94\'s "Each question shows"): "Answer first" under the question\'s lock or clock line, before its choices; "Waits on" under the meta line, on lane, gate-less, strip and section cards; each in --t-body --ink, the picture\'s size (AC96\'s "Settled from QW3\'s build", 3); the Waits line at least 24 px tall, above the full-card link, its links underlined under their own text — in light and dark, at 360 and 414 px', async () => {
  const app = await qw3Open(qw3BusiestState(), '#/waiting');
  try {
    const pick = cardOf(app, ALPHA('Alpha-pick'));
    const kids = pick.children.map((c) => (c.className || '').split(' ')[0] || c.tag);
    assert.deepEqual(kids, ['v2-place', 'v2-kd', 'v2-t', 'v2-m', 'v2-mk', 'v2-afirst', 'v2-qbody'], 'place, kind, title, meta, lock, "Answer first", then its choices');
    const held = cardOf(app, qid('Alpha', ALPHA_HELD));
    assert.deepEqual(held.children.map((c) => (c.className || '').split(' ')[0]), ['v2-place', 'v2-kd', 'v2-t', 'v2-body', 'v2-m', 'v2-mk', 'v2-afirst', 'v2-qbody'],
      'the held one: "Also asked in your session…" under its title, its clock, then "Answer first"');
    const card = cardOf(app, 'Alpha|card|queue/Q-020-stop-1.md');
    const m = byClass(card, 'v2-m')[0];
    assert.equal(card.children[card.children.indexOf(m) + 1].className, 'v2-waits', 'under its meta line');
    const strip = cardOf(app, 'Alpha|pr|82');
    assert.equal(strip.children[strip.children.indexOf(byClass(strip, 'v2-m')[0]) + 1].className, 'v2-waits');
    for (const theme of THEMES) {
      for (const w of WIDTHS) {
        const L = looks(app, theme, w);
        const at = `${theme}, ${w} px`;
        for (const el of byClass(app.view, 'v2-afirst')) {
          const l = L.get(el);
          assert.match(l.raw('font'), /^400 13px\/1\.45 ⟦--font\|/, `${at}: "Answer first" --t-body, the picture's size`);
          assert.equal(l.colour, INK[theme].ink, `${at}: --ink`);
        }
        const lines = byClass(app.view, 'v2-waits');
        assert.equal(lines.length, 7, 'Q-020, #81, #82, #80, the hold card, Beta\'s #80, Gamma\'s merge card');
        for (const el of lines) {
          const l = L.get(el);
          assert.match(l.raw('font'), /^400 13px\/1\.45 ⟦--font\|/, `${at}: "Waits on" --t-body, the picture's size`);
          assert.equal(l.colour, INK[theme].ink, `${at}: --ink`);
          assert.deepEqual([l.decl('position'), l.decl('z-index'), l.decl('display'), l.decl('min-height'), l.decl('padding')], ['relative', '1', 'block', '24px', '4px 0'],
            `${at}: above the full-card link, at least 24 px (13 × 1.45 + 8 = 26.85 px)`);
          for (const a of el.children) {
            assert.equal(a.tag, 'a');
            const la = L.get(a);
            assert.deepEqual([la.decl('text-decoration'), la.decl('padding'), la.colour], ['underline', '5px 0', INK[theme].ink], `${at}: underlined under its own text, its target the line's height`);
          }
        }
        // AC69: no vermilion, --ok or --bad in either line (none declares a colour of its own).
        for (const el of [...byClass(app.view, 'v2-afirst'), ...byClass(app.view, 'v2-waits')]) assert.equal(L.get(el).decl('background'), '', `${at}: no ground`);
      }
    }
  } finally {
    app.restore();
  }
});

test('AC95 (the taps): "Waits on question <k>" opens that question\'s sheet, each number its own link ("Waits on questions 1", " and 2"); "Waits on a question being asked in your session" brings that question\'s card in the section into view and moves the focus to it (AC96\'s "Settled from QW3\'s build"); with one project shown, the same', async () => {
  const s = qw3BusiestState();
  const rowOf = (id) => `row-q-${id.replace(/[^A-Za-z0-9_-]/g, '-')}`;
  const saved = Object.getOwnPropertyDescriptor(El0.prototype, 'getBoundingClientRect');
  El0.prototype.getBoundingClientRect = function rect() {
    const top = this.attrs && this.attrs.id === rowOf(qid('Alpha', ALPHA_HELD)) ? 1200 : 0;
    return { left: 0, right: 0, top, bottom: top, width: 0, height: 0 };
  };
  const app = await qw3Open(s, '#/waiting', { store: seen(s.seed) });
  try {
    const links = waitLinks(cardOf(app, 'Alpha|card|queue/Q-020-stop-1.md'));
    assert.deepEqual(links.map((a) => [a.textContent, a.attrs.href, a.attrs['aria-label'] || null]), [
      ['Waits on questions 1', `#/waiting/card/${enc(ALPHA('Alpha-pick'))}`, null],
      [' and 2', `#/waiting/card/${enc(ALPHA('Alpha-second'))}`, 'Waits on question 2']]);
    await app.tap(links[1]);
    await app.go(links[1].attrs.href);
    assert.equal(byClass(byClass(sheet(app), 'v2-shead')[0], 'v2-stitle')[0].textContent, 'Which day should the weekly review run?', 'its sheet');
    await app.go('#/waiting');
    const heldLink = waitLinks(cardOf(app, 'Alpha|pr|80'))[0];
    assert.equal(heldLink.attrs.href, '#/waiting');
    const before = app.scrolls.length;
    await app.tap(heldLink);
    assert.equal(app.loc.hash, '#/waiting', 'it stays on Waiting');
    assert.ok(app.scrolls.slice(before).some(([x, y]) => x === 0 && y === 1192), `its card brought into view: ${JSON.stringify(app.scrolls.slice(before))}`);
    // AC96's "Settled from QW3's build" (the one change): the focus moves to that card too, as a link within the page moves it;
    // the card takes it with tabindex -1, outside the tab order; a counted question's card has none.
    const heldCardEl = cardOf(app, qid('Alpha', ALPHA_HELD));
    assert.equal(document.activeElement, heldCardEl, 'the focus on the held question\'s card');
    assert.equal(heldCardEl.attrs.tabindex, '-1');
    assert.equal(cardOf(app, ALPHA('Alpha-pick')).attrs.tabindex, undefined, 'a counted question\'s card: no tabindex');
    // A later drawing leaves the focus where the owner put it (no second scroll or focus).
    const scrolled = app.scrolls.length;
    document.activeElement.blur();
    await app.advance(POLL_MS);
    assert.equal(app.scrolls.length, scrolled, 'brought into view once');
    assert.notEqual(document.activeElement, heldCardEl, 'focused once');
    // One project shown: the links keep to that address.
    await app.go('#/waiting/Alpha');
    assert.equal(placeAt(app, 'Alpha|pr|81'), '5 of 12 waiting', 'each card keeps its place');
    assert.equal(waitLinks(cardOf(app, 'Alpha|pr|81'))[0].attrs.href, `#/waiting/Alpha/card/${enc(ALPHA('Alpha-pick'))}`);
    const heldOne = waitLinks(cardOf(app, 'Alpha|hold|queue/ci-hold-4a2448939173.md'))[0];
    assert.equal(heldOne.attrs.href, '#/waiting/Alpha');
    await app.tap(heldOne);
    assert.equal(app.loc.hash, '#/waiting/Alpha', 'one project shown: it stays there');
    assert.equal(document.activeElement, cardOf(app, qid('Alpha', ALPHA_HELD)), 'and the focus on the held question\'s card');
    assert.deepEqual(afirst(cardOf(app, qid('Alpha', ALPHA_HELD))), ['Answer first · cards 4 and 10 wait on it']);
    assert.deepEqual(sectionIds(app), [ALPHA('Alpha-pick'), ALPHA('Alpha-second'), qid('Alpha', ALPHA_HELD)], 'Alpha\'s section alone, in its order');
  } finally {
    if (saved) Object.defineProperty(El0.prototype, 'getBoundingClientRect', saved); else delete El0.prototype.getBoundingClientRect;
    app.restore();
  }
});

test('AC95 + AC96 (the sheet): a blocker\'s sheet lists "Cards waiting on it" under AC66\'s Unblocks line, each card by its place, kind and title, a tap opening its sheet; then each entry that does not count in its words; the held blocker\'s too; a question with no line lists nothing; the list\'s links at least 24 px tall, underlined, --t-small --ink in light and dark', async () => {
  const s = qw3BusiestState();
  const app = await qw3Open(s, '#/waiting', { store: seen(s.seed) });
  try {
    await app.go(`#/waiting/card/${enc(qid('Alpha', ALPHA_HELD))}`);
    assert.match(sheetHead(app), / · being asked in your session$/);
    const b = blocksBlock(app);
    assert.equal(byClass(b, 'v2-bh')[0].textContent, 'Cards waiting on it');
    const rows = findAll(b, (e) => e.tag === 'a');
    assert.deepEqual(rows.map((a) => [a.textContent, a.attrs.href]), [
      ['4 of 12 waiting · Pull request · Alpha: a change to merge', `#/waiting/card/${enc('Alpha|pr|80')}`],
      ['10 of 12 waiting · Hold · The default branch\'s governance run is not green', `#/waiting/card/${enc('Alpha|hold|queue/ci-hold-4a2448939173.md')}`]]);
    assert.deepEqual(byClass(b, 'v2-small').map((p) => p.textContent), ['questions/Beta-plan-units.md: not waiting on you now', '#999: not waiting on you now',
      'queue/P-404-stop-1.md: not waiting on you now', 'can\'t read: card 7'], 'itself dropped; another project\'s held question is not this project\'s');
    // Under the Unblocks line, in the sheet's foot.
    const foot = findAll(sheet(app), (e) => e.dataset && e.dataset.k === 'sheet-foot')[0];
    const unb = foot.children.findIndex((c) => (c.className || '').includes('v2-blk') && /Unblocks/.test(c.textContent));
    assert.ok(unb >= 0 && foot.children[unb + 1] === b, 'right under the Unblocks block');
    for (const theme of THEMES) {
      const L = looks(app, theme, 360);
      for (const a of rows) {
        const l = L.get(a);
        assert.deepEqual([l.decl('display'), l.decl('min-height'), l.decl('text-decoration'), l.colour], ['block', '24px', 'underline', INK[theme].ink], `${theme}: a row`);
        assert.match(l.raw('font'), /^400 12px\/1\.4 ⟦--font\|/);
      }
    }
    await app.tap(rows[0]);
    await app.go(rows[0].attrs.href);
    assert.match(sheetHead(app), /^Alpha · pull request · #80 · .* · 4 of 12 waiting$/, 'the card\'s sheet');
    // A counted blocker's sheet: its cards; a question with no line (Delta's): no list.
    await app.go(`#/waiting/card/${enc(ALPHA('Alpha-second'))}`);
    assert.deepEqual(findAll(blocksBlock(app), (e) => e.tag === 'a').map((a) => a.textContent), ['7 of 12 waiting · Decision · ' + cardOf(app, 'Alpha|card|queue/Q-020-stop-1.md').children[2].textContent,
      '8 of 12 waiting · Pull request · Alpha: fix the badge after the phone wakes (made up, NOT real)']);
    await app.go(`#/waiting/card/${enc(qid('Delta', QPATH.Delta))}`);
    assert.equal(blocksBlock(app), null);
  } finally {
    app.restore();
  }
});

test('AC95 + AC96 ("When the order changes"; the line after an edit): a blocker answered — its cards lose their lines and go back to their places by age; an edited `Blocks:` line read at the next poll; while a sheet is open nothing on Waiting moves, then the new lines when it closes', async () => {
  const s = qw3BusiestState();
  const app = await qw3Open(s, '#/waiting', { store: seen(s.seed) });
  const a = s.repos.Alpha;
  try {
    // An edit to Alpha-second's line, merged (made up, NOT real): now it holds up #83 only. Read with a sheet open: held.
    await app.go(`#/waiting/card/${enc('Alpha|pr|81')}`);
    assert.match(sheetHead(app), / · 5 of 12 waiting$/);
    a.commit({ [Q_SECOND]: withBlocks(qFile({ title: 'Which day should the weekly review run?', options: ['A. Monday.', 'B. Friday.'], rec: 'B — Friday.' }), 'Blocks: #83', 'top') });
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.deepEqual(waitsOf(cardOf(app, 'Alpha|card|queue/Q-020-stop-1.md')), ['Waits on questions 1 and 2'], 'nothing moved under the sheet');
    assert.match(sheetHead(app), / · 5 of 12 waiting$/);
    await app.go('#/waiting');
    assert.deepEqual([waitsOf(cardOf(app, 'Alpha|card|queue/Q-020-stop-1.md')), waitsOf(cardOf(app, 'Alpha|pr|82')), waitsOf(cardOf(app, 'Alpha|pr|83'))],
      [['Waits on question 1'], [], ['Waits on question 2']], 'closed: the edited line');
    assert.deepEqual(afirst(cardOf(app, ALPHA('Alpha-second'))), ['Answer first · card 3 waits on it']);
    // Alpha-pick answered (its answer file on the default branch, made up): it leaves; #81 back in its place by age, no line.
    a.commit({ 'decisions/questions/Alpha-pick.md': 'Ruling: A (made up, NOT real)\n' });
    await app.advance(POLL_MS);
    assert.equal(cardOf(app, ALPHA('Alpha-pick')), null, 'answered: gone');
    assert.equal(placeAt(app, ALPHA('Alpha-second')), '1 of 11 waiting');
    assert.deepEqual(['Alpha|pr|83', 'Alpha|pr|80', 'Alpha|pr|81', 'Alpha|gate|queue/P-002-criteria-1.md', 'Alpha|card|queue/Q-020-stop-1.md', 'Alpha|pr|82'].map((id) => placeAt(app, id)),
      [2, 3, 4, 5, 6, 7].map((k) => `${k} of 11 waiting`), 'by age');
    assert.deepEqual([waitsOf(cardOf(app, 'Alpha|pr|81')), waitsOf(cardOf(app, 'Alpha|card|queue/Q-020-stop-1.md'))], [[], []]);
    assert.deepEqual(waitsOf(cardOf(app, 'Alpha|pr|83')), ['Waits on question 1']);
  } finally {
    app.restore();
  }
});

test('AC95 + AC77 (a blocker held in this session): its hold ended on this device by its answer tap, it is a card and takes its place by the rule, first among the blockers by its raised time; its cards now say "Waits on question <k>"', async () => {
  const s = qw3BusiestState();
  const app = await qw3Open(s, '#/waiting', { store: seen(s.seed) });
  try {
    const id = qid('Alpha', ALPHA_HELD);
    assert.equal(cardOf(app, id).attrs['data-question'], 'held');
    const btn = byClass(cardOf(app, id), 'v2-abtn').find((b) => b.tag === 'a');
    btn.dispatch('click', { preventDefault() {} });
    await app.flush();
    await app.advance(POLL_MS);
    const c = cardOf(app, id);
    assert.equal(c.attrs['data-question'], 'counted', 'its hold ended here');
    // Raised 3 hours before NOW, after Alpha-pick (30 h) and Alpha-second (6 h): the third blocker, 3 of 13.
    assert.equal(placeAt(app, id), '3 of 13 waiting');
    assert.deepEqual(afirst(c), ['Answer first · cards 5 and 11 wait on it']);
    assert.deepEqual([waitsOf(cardOf(app, 'Alpha|pr|80')), waitsOf(cardOf(app, 'Alpha|hold|queue/ci-hold-4a2448939173.md'))], [['Waits on question 3'], ['Waits on question 3']]);
    assert.deepEqual(sectionIds(app).slice(0, 3), [ALPHA('Alpha-pick'), ALPHA('Alpha-second'), id]);
    assert.ok(keyed(app, `qdone:${id}`), 'counted: "Done ✓"');
  } finally {
    app.restore();
  }
});
