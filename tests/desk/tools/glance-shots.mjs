// Chromium captures of Home on the fixture states of "After the glance audit" (spec S-001, AC91's note; the stage
// table's "Chromium captures at 360 × 740 and 414 × 896, light and dark"), for a stage's pull request. Not a test: run by
// hand, `node tests/desk/tools/glance-shots.mjs <out dir> [name prefix]` (Playwright and its Chromium as installed in the
// session); a name prefix, such as `g2-`, takes only those captures.
//
// The page is the desk's own code (src/public/), served as it deploys, started with each state's config, its function
// calls answered by tests/desk/fake-desk.mjs from the state's in-memory repositories (tests/desk/glance-fixtures.mjs,
// whose made-up parts tests/desk/fixtures/README.md labels NOT real). The page's clock is Playwright's, set to the
// state's time; the fake desk's clock follows it. Each capture's file names its state, width and theme. Each line printed
// says whether the page scrolls sideways (it must not), and, where the Kicked back strip holds cards (G2, AC91 (f)), how
// far its row scrolls sideways inside itself, and, where gate titles are drawn (G3, AC91 (h)), how many lines each takes
// and whether any is cut at its two; and, on a Timeline (G4, AC91 (i)), where the Now line's top rests against a third of
// the viewport; and, on G5's waits rows (AC89 (c)), the row's words and whether its cut hides any; and, on G6's pages
// (AC92 (d)), each opened phase's heads and fold rows; and, on G7's (AC92 (a)), how many status marks are green and red;
// and, on G7b's (AC91 (c)), each of "Since you last looked"'s missing lines, how many lines it takes and whether any is cut;
// and, on G8's (AC92 (b)), each arrow, its drawing, its size and where it sits against what it points at; and, on G8b's
// (AC24's note), Plan's word "moved": how many are drawn, how far under the code line and how far from the name's left it
// sits, its lines, and the moved row's name, its lines and whether it is cut (it must not be); and, on G8c's (AC91 (c),
// AC92 (b)), the briefing's lines in order, the missing lines, and on each tile's now cell whether a line comes in and how
// far it ends before the arrow, the arrow's gap to the icon.
// G4's failed-load captures serve the page's own index.html and app.js with sandbox.js (and, for one,
// sandbox.css) answering 404, so the desk's code fails to load as it can in the browser; its Timeline captures are of
// the screen as it opens (the viewport), not the whole page.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fakeServer } from '../fake-desk.mjs';
import { mixState, unreadState, signedOutState, stallState, extState, quietState, twoMixState, gatesState, textState, standardState, ciState, mismatchState, nowShared, sprintsState, longNameState, PLAN_NOW,
  openingState, signedOutMixedState, orderState, deviceMarks, KICKED, CARD, GATE4, GATE5, GATE_KEY, MIX_PROJECT, NOW, STALL_NOW, SD, POOM, EXT_LONG } from '../glance-fixtures.mjs';
import { sdRepo, SD3 } from '../tv2-fixtures.mjs';
import { CONFIG } from '../helpers.mjs';
import { waSetup, WORKED } from '../wa-fixtures.mjs';
import { withPortfolio, addPortfolio, pfFiles } from '../pf-fixtures.mjs';
import { BAD_PR } from '../fake-desk.mjs';
import { pullsAnswer } from '../j12-fixture.mjs';

const PUBLIC = resolve(fileURLToPath(new URL('../../../src/public/', import.meta.url)));
const OUT = resolve(process.argv[2] || 'glance-shots');
const POLL = 60_000;
const H = 3600e3;
const LATE = Date.parse('2026-10-19T00:00:00Z'); // made up: a "last looked" after the records' last dates, so nothing is new

// The briefing's three lines (made up, NOT real records), as the AC91 test adds them to `mix`'s made-up project.
const Q = (title, rev, def, timeout) => `# Ruling needed: ${title}\n\nWHY: a test.\nOPTIONS:\n  A. Yes.\n  B. No.\nRECOMMENDATION: A — yes.\nRISK CLASS: R0\nREVERSIBILITY: ${rev}\nBLAST RADIUS: none\nDEFAULT: ${def}\nTIMEOUT: ${timeout}\n`;
const THREE = { extra: { 'questions/Alpha-past.md': Q('a made-up question past its time', 'reversible', 'A', '24'), 'questions/Alpha-final.md': Q('a made-up choice that can\'t be undone', 'irreversible', 'none', 'none') },
  raised: { 'questions/Alpha-past.md': Date.parse('2026-10-06T15:00:00Z'), 'questions/Alpha-final.md': NOW - 2 * H } };

/**
 * Each capture: its name, the state, its clock, "last looked", the screen (`hash`, Home by default), what the device keeps
 * besides (`seed`, made up: G2's Done marks), and what fails before the page opens or after its first reads.
 */
const SHOTS = [
  { name: 'g1-count-mix', state: () => mixState(THREE), now: NOW, looked: NOW - H },
  { name: 'g1-stall', state: stallState, now: STALL_NOW, looked: LATE },
  { name: 'g1-unread-nothing-waiting', state: () => unreadState(), now: NOW, looked: LATE, later: true },
  { name: 'g1-unread-cards-waiting', state: () => unreadState({ who: MIX_PROJECT }), now: NOW, looked: NOW - H, later: true },
  { name: 'g1-signed-out', state: signedOutState, now: NOW, looked: NOW - H, before: true },
  { name: 'g1-ext', state: extState, now: NOW, looked: NOW - 9 * 24 * H },
  // G2: Waiting (AC91 (f) and (g)). `mix` with "last looked" 5 hours back, so two cards are new; `quiet`, with nothing
  // waiting ("Kicked back · none", an empty Done shaded); two made-up projects with three cards kicked back on the device
  // and one confirming in Done, on the whole board and with one project shown; and `unread` on Waiting.
  { name: 'g2-waiting-mix', state: () => mixState(), now: NOW, looked: NOW - 5 * H, hash: '#/waiting' },
  { name: 'g2-waiting-quiet', state: quietState, now: NOW, looked: NOW - 5 * H, hash: '#/waiting' },
  { name: 'g2-waiting-kicked', state: () => twoMixState(), now: NOW, looked: NOW - 5 * H, hash: '#/waiting', seed: deviceMarks(KICKED) },
  { name: 'g2-waiting-kicked-one', state: () => twoMixState(), now: NOW, looked: NOW - 5 * H, hash: `#/waiting/${MIX_PROJECT}`, seed: deviceMarks(KICKED) },
  { name: 'g2-waiting-unread', state: () => unreadState({ who: MIX_PROJECT }), now: NOW, looked: NOW - 5 * H, later: true, hash: '#/waiting' },
  // G3: gate titles (AC91 (h)). `gates`: the made-up project's Build-gate card with no case line and two made-up Launch-gate
  // cards at one gate, cases 1 and 2, on Waiting, in each sheet (one with its case line, one without) and on Plan, a sheet
  // opened over Plan too; the two Launch cards written without their case lines, on Waiting and Plan; and `ext`'s long gate
  // card on Waiting.
  { name: 'g3-waiting-gates', state: () => gatesState(), now: NOW, looked: LATE, hash: '#/waiting' },
  { name: 'g3-sheet-gate-case', state: () => gatesState(), now: NOW, looked: LATE, hash: `#/waiting/card/${encodeURIComponent(GATE_KEY(MIX_PROJECT, GATE4))}` },
  { name: 'g3-sheet-gate-nocase', state: () => gatesState(), now: NOW, looked: LATE, hash: `#/waiting/card/${encodeURIComponent(CARD.gate(MIX_PROJECT))}` },
  { name: 'g3-plan-gates', state: () => gatesState(), now: NOW, looked: LATE, hash: '#/work' },
  { name: 'g3-plan-sheet', state: () => gatesState(), now: NOW, looked: LATE, hash: `#/work/card/${encodeURIComponent(GATE_KEY(MIX_PROJECT, GATE5))}` },
  { name: 'g3-waiting-nocase', state: () => gatesState({ caseLines: false }), now: NOW, looked: LATE, hash: '#/waiting' },
  { name: 'g3-plan-nocase', state: () => gatesState({ caseLines: false }), now: NOW, looked: LATE, hash: '#/work' },
  { name: 'g3-waiting-ext', state: extState, now: NOW, looked: LATE, hash: '#/waiting' },
  // G4: a project's page, the Timeline, a failed load and the one date form (AC91 (i) to (l)), and G3's follow-ups.
  // `quiet`: Service-Desk's page, "Nothing waiting on you" soft and "Your last action" from an earlier day, and a member's
  // page; `mix`: the made-up project's page, its two unrecorded runs said once; `gates`: the waits row's gate names, two
  // gate cards at one gate (for two items, and one item's two without case lines); the Timeline as it opens; Done's gate
  // rows (made-up marks); a gate card not read yet, its sheet; and the failed-load screen, with and without sandbox.css.
  { name: 'g4-page-quiet', state: quietState, now: NOW, looked: LATE, hash: `#/p/${SD.name}` },
  { name: 'g4-page-mix', state: () => mixState(), now: NOW, looked: LATE, hash: `#/p/${MIX_PROJECT}` },
  { name: 'g4-page-gates', state: () => gatesState(), now: NOW, looked: LATE, hash: `#/p/${MIX_PROJECT}` },
  { name: 'g4-page-gates-one-item', state: () => gatesState({ sameItem: true, caseLines: false }), now: NOW, looked: LATE, hash: `#/p/${MIX_PROJECT}` },
  { name: 'g4-timeline-opens', state: quietState, now: NOW, looked: LATE, hash: `#/p/${SD.name}`, then: `#/p/${SD.name}/timeline`, viewport: true },
  { name: 'g4-member-page', state: quietState, now: NOW, looked: LATE, hash: `#/p/${SD.name}/team/orchestrator` },
  { name: 'g4-done-gates', state: () => gatesState(), now: NOW, looked: LATE, hash: '#/waiting', seed: deviceMarks([
    { project: MIX_PROJECT, kind: 'gate', id: GATE_KEY(MIX_PROJECT, GATE4), at: NOW - 60e3 },
    { project: MIX_PROJECT, kind: 'gate', id: GATE_KEY(MIX_PROJECT, 'queue/P-009-launch-1.md'), title: 'The Launch gate, case 1 · P-009', at: NOW - 3 * H, confirmedAt: NOW - 2 * H },
  ]) },
  { name: 'g4-sheet-unread-gate', state: () => { const st = gatesState(); st.repos[MIX_PROJECT].blobNull = [GATE4]; return st; }, now: NOW, looked: LATE,
    hash: `#/waiting/card/${encodeURIComponent(GATE_KEY(MIX_PROJECT, GATE4))}` },
  { name: 'g4-failed-load', state: quietState, now: NOW, looked: LATE, missing: ['sandbox.js'] },
  { name: 'g4-failed-load-no-css', state: quietState, now: NOW, looked: LATE, missing: ['sandbox.js', 'sandbox.css'] },
  // G5: every milestone and sprint counted (AC92 (c)), and a gate's cards named once in the waits row (AC89 (c), ruling B).
  // `text`: Service-Desk's page as committed (its pull requests not read); `text` with J12's built answer, so they are
  // read: the page with Design opened (its rows' sprints), and the Timeline (each fold's words); `mix` with its made-up
  // later Launch run (F1 and F2), Launch opened; Details opened over made-up workflow runs; and `gates`: two items at one
  // gate, one item's two cases, its two cards without case lines, and a gate's cards split by a made-up kicked-back mark.
  { name: 'g5-page-text', state: textState, now: NOW, looked: LATE, hash: `#/p/${SD.name}` },
  { name: 'g5-page-pulls-design', state: withPulls, now: NOW, looked: LATE, hash: `#/p/${SD.name}`, click: ['[data-phase="Design"] > button'] },
  { name: 'g5-timeline-pulls', state: withPulls, now: NOW, looked: LATE, hash: `#/p/${SD.name}/timeline` },
  { name: 'g5-page-mix-launch', state: () => mixState({ laterLaunch: true }), now: NOW, looked: LATE, hash: `#/p/${SD.name}`, click: ['[data-phase="Launch"] > button'] },
  { name: 'g5-details-ci', state: withRuns, now: NOW, looked: LATE, hash: `#/p/${SD.name}`, click: ['[data-k="more-detail"]'] },
  { name: 'g5-page-gates-two', state: () => gatesState(), now: NOW, looked: LATE, hash: `#/p/${MIX_PROJECT}` },
  { name: 'g5-page-gates-cases', state: () => gatesState({ sameItem: true }), now: NOW, looked: LATE, hash: `#/p/${MIX_PROJECT}` },
  { name: 'g5-page-gates-nocase', state: () => gatesState({ sameItem: true, caseLines: false }), now: NOW, looked: LATE, hash: `#/p/${MIX_PROJECT}` },
  { name: 'g5-page-gates-kicked', state: () => gatesState(), now: NOW, looked: LATE, hash: `#/p/${MIX_PROJECT}`,
    seed: deviceMarks([{ project: MIX_PROJECT, kind: 'gate', id: GATE_KEY(MIX_PROJECT, GATE4), at: NOW - 13 * 60e3, kickedAt: NOW - 7 * 60e3 }]) },
  // G6: the standard checklist set apart (AC92 (d)). `text`: Service-Desk's page with Design opened (both runs' two heads,
  // the rule, each run's untracked rows folded into one), then with its now run's fold opened (the six listed in place);
  // Launch opened, as round 2's mock drew it; `standard` (every standard line written, made up) with Discovery and Design
  // opened, for the taken-on rows "not recorded by the model" (R3-b) and the skipped ones; `standard` with Build-4's line
  // alone, Build and its earlier run's fold opened (the three states together); and the Timeline (each standard
  // milestone's "· standard ·" and the gathered lines).
  { name: 'g6-page-design', state: textState, now: NOW, looked: LATE, hash: `#/p/${SD.name}`, click: ['[data-phase="Design"] > button'] },
  { name: 'g6-page-design-fold-open', state: textState, now: NOW, looked: LATE, hash: `#/p/${SD.name}`, click: ['[data-phase="Design"] > button', '[data-untracked="Design-i2"]'] },
  { name: 'g6-page-launch', state: textState, now: NOW, looked: LATE, hash: `#/p/${SD.name}`, click: ['[data-phase="Launch"] > button'] },
  { name: 'g6-page-standard', state: () => standardState(), now: NOW, looked: LATE, hash: `#/p/${SD.name}`, click: ['[data-phase="Discovery"] > button', '[data-phase="Design"] > button'] },
  { name: 'g6-page-three-states', state: () => standardState({ ids: ['Build-4'] }), now: NOW, looked: LATE, hash: `#/p/${SD.name}`,
    click: ['[data-phase="Build"] > button', '[data-untracked="Build-i1"]'] },
  { name: 'g6-timeline', state: textState, now: NOW, looked: LATE, hash: `#/p/${SD.name}/timeline` },
  // G7: the status palette (AC92 (a)), Plan's moved edge in --line2 and the briefing's ✕ (AC91 (c)). `mix` on Home (a tile's
  // green check beside the lighter grey ones); `text`'s page with Design and Discovery opened (green checks, a red cross,
  // the gone-back-over run grey) and its strip; J11's Timeline at 3117150 with its sprints and the status icons' key opened
  // (the sprints' ✓ green and #40's ✕ red); Plan with a row moved, the ordering closed and Reached opened; Details over a
  // made-up passing and failing CI line, a card's sheet over a failing one, and a v2.5 page's passing CI row; a made-up
  // deploy's mismatch; and the briefing with a can't-read line under its count, with "Can't show <project>", and with the
  // portfolio refused (all made up, NOT real).
  { name: 'g7-home-mix', state: () => mixState(), now: NOW, looked: LATE },
  { name: 'g7-page-phases', state: textState, now: NOW, looked: LATE, hash: `#/p/${SD.name}`, click: ['[data-phase="Design"] > button', '[data-phase="Discovery"] > button'] },
  { name: 'g7-timeline-sprints', state: () => ({ config: { ...CONFIG, projects: [SD3] }, repos: { [SD3.name]: sdRepo() } }), now: NOW, looked: LATE, hash: `#/p/${SD3.name}/timeline`,
    clickAll: '[data-sprints][aria-expanded="false"]', click: ['button.v2-fold:text-is("Status icons")'] },
  { name: 'g7-plan-moved', state: () => waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } }), now: Date.parse('2026-10-18T18:00:00Z'), looked: LATE, hash: '#/work',
    click: ['[data-k="plan-order"]', '[data-k^="wa-up:"]:not([aria-disabled="true"])', '[data-k="plan-order"]', 'button.v2-plfold:has-text("Reached")'] },
  { name: 'g7-details-passing', state: () => ciState('passing'), now: NOW, looked: LATE, hash: `#/p/${SD.name}`, click: ['[data-k="more-detail"]'] },
  { name: 'g7-details-failing', state: () => ciState('failing'), now: NOW, looked: LATE, hash: `#/p/${SD.name}`, click: ['[data-k="more-detail"]'] },
  { name: 'g7-sheet-failing', state: () => ciState('failing', { who: MIX_PROJECT }), now: NOW, looked: LATE, hash: `#/waiting/card/${encodeURIComponent(CARD.pr(MIX_PROJECT))}` },
  { name: 'g7-v25-passing', state: () => ciState('passing', { who: POOM.name }), now: NOW, looked: LATE, hash: `#/p/${POOM.name}` },
  { name: 'g7-deploy-mismatch', state: mismatchState, now: NOW, looked: LATE, hash: `#/waiting/${SD3.name}`, polls: 2, click: ['.v2-card a.v2-t[href*="%7Cdeploy%7C"]'] },
  { name: 'g7-brief-cant', state: () => unreadState(), now: NOW, looked: LATE, later: true },
  { name: 'g7-brief-cant-show', state: () => { const s = unreadState(); s.repos[MIX_PROJECT].pulls.push(BAD_PR); return s; }, now: NOW, looked: LATE, later: true },
  { name: 'g7-brief-portfolio', state: () => { const p = waSetup({}); p.config = withPortfolio(p.config); addPortfolio(p.repos, pfFiles({})).fail = { state: 'cant-read', reason: 'no-access' }; return p; },
    now: Date.parse('2026-10-22T18:00:00Z'), looked: LATE, polls: 7 },
  // G7b: "Since you last looked" ending in its grey missing lines (AC91 (c); P-001-glance-since-incomplete.md, A), each
  // failure made up (NOT how any read failed). `unread`: the list empty, Service-Desk not read since a time; the list
  // holding its four lines and "<n> more"; two projects, Service-Desk with no read in this opening and the made-up one
  // since a time, in their tiles' order; signed out from the start, a line for each project; and `ext`, two made-up
  // projects failing, the long name wrapping at 360 px.
  { name: 'g7b-unread', state: () => unreadState(), now: NOW, looked: LATE, later: true },
  { name: 'g7b-unread-more', state: () => unreadState(), now: NOW, looked: NOW - 10 * 24 * H, later: true },
  { name: 'g7b-unread-two', state: () => { const s = unreadState(); s.fail = () => { s.repos[MIX_PROJECT].fail = { kind: 'network' }; }; s.repos[SD.name].fail = { kind: 'network' }; return s; },
    now: NOW, looked: LATE, later: true },
  { name: 'g7b-signed-out', state: signedOutState, now: NOW, looked: LATE, before: true },
  { name: 'g7b-ext', state: () => { const s = extState(); s.fail = () => { s.repos.Beta.fail = { kind: 'network' }; s.repos[EXT_LONG].fail = { kind: 'network' }; }; return s; },
    now: NOW, looked: LATE, later: true },
  // G8: the arrow at "now" (AC92 (b)) on its five drawings: Home's tiles (`mix`: the made-up project with two "Build-i1"
  // runs; `nowShared`: its now run sharing its key with later runs, "Build-i1" and "Launch-i1"); a page's strip and an
  // opened now phase (`text`'s Design; `nowShared`'s Build and Launch, the now run an earlier run of its phase); a v2.5
  // page's strip, one sprint open and two (none); the Timeline as it opens; and Plan, grouped and in the ordering.
  { name: 'g8-home-mix', state: () => mixState(), now: NOW, looked: LATE },
  { name: 'g8-home-now-build', state: () => nowShared('build'), now: NOW, looked: LATE },
  { name: 'g8-home-now-launch', state: () => nowShared('launch'), now: NOW, looked: LATE },
  { name: 'g8-home-two-open', state: () => sprintsState(2), now: NOW, looked: LATE },
  { name: 'g8-page-design', state: textState, now: NOW, looked: LATE, hash: `#/p/${SD.name}`, click: ['[data-phase="Design"] > button'] },
  { name: 'g8-page-now-build', state: () => nowShared('build'), now: NOW, looked: LATE, hash: `#/p/${MIX_PROJECT}`, click: ['[data-phase="Build"] > button'] },
  { name: 'g8-page-now-launch', state: () => nowShared('launch'), now: NOW, looked: LATE, hash: `#/p/${MIX_PROJECT}`, click: ['[data-phase="Launch"] > button'] },
  { name: 'g8-page-v25', state: textState, now: NOW, looked: LATE, hash: `#/p/${POOM.name}` },
  { name: 'g8-page-v25-two-open', state: () => sprintsState(2), now: NOW, looked: LATE, hash: `#/p/${POOM.name}` },
  { name: 'g8-timeline', state: textState, now: NOW, looked: LATE, hash: `#/p/${SD.name}`, then: `#/p/${SD.name}/timeline`, viewport: true },
  { name: 'g8-timeline-now-launch', state: () => nowShared('launch'), now: NOW, looked: LATE, hash: `#/p/${MIX_PROJECT}`, then: `#/p/${MIX_PROJECT}/timeline`, viewport: true },
  { name: 'g8-plan-mix', state: () => mixState(), now: NOW, looked: LATE, hash: '#/work' },
  { name: 'g8-plan-now-launch', state: () => nowShared('launch'), now: NOW, looked: LATE, hash: '#/work' },
  { name: 'g8-plan-ordering', state: () => mixState(), now: NOW, looked: LATE, hash: '#/work', click: ['[data-k="plan-order"]'] },
  // G8b: Plan's moved row shows the word "moved" (AC24's note; P-001-glance-moved-word.md, B), each draft made up (NOT a real
  // device's): `text` with the worked estimates, M3A moved up; the long made-up name (NOT real) on M3B, moved up; and `gates`'
  // made-up project's MD3 moved up beside its gate cards' rows; each with the ordering closed again and open.
  ...[['plan', () => waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } }), PLAN_NOW, `${SD.name}|M3A`], ['plan-long', longNameState, PLAN_NOW, `${SD.name}|M3B`],
    ['plan-gates', () => gatesState(), NOW, `${MIX_PROJECT}|MD3`]].flatMap(([n, state, now, k]) => [
    { name: `g8b-${n}-moved`, state, now, looked: LATE, hash: '#/work', click: ['[data-k="plan-order"]', `[data-k="wa-up:${k}"]`, '[data-k="plan-order"]'] },
    { name: `g8b-${n}-moved-ordering`, state, now, looked: LATE, hash: '#/work', click: ['[data-k="plan-order"]', `[data-k="wa-up:${k}"]`] },
  ]),
  // G8c: on Home (AC91 (c); AC92 (b)), each failure made up (NOT how any read failed): Service-Desk never read in this
  // opening beside the made-up project read earlier; signed out from the start, and with Service-Desk never read before it;
  // three projects failing in an order the config doesn't give (the made-up project's tile first), with nothing waiting
  // and with cards waiting, the closed group folded (made up, a device's fold); two failing, in each of those orders; the
  // made-up project the desk can't draw (BAD_PR, NOT a real pull request), its read working, alone and beside two failing;
  // and a line into a tile's now circle, v3 (`nowShared('build')`) and v2.5 (`sprintsState(1)`).
  { name: 'g8c-opening-two', state: openingState, now: NOW, looked: LATE, later: true },
  { name: 'g8c-signed-out', state: signedOutState, now: NOW, looked: LATE, before: true },
  { name: 'g8c-signed-out-mixed', state: signedOutMixedState, now: NOW, looked: LATE, later: true },
  { name: 'g8c-order-three-quiet', state: () => orderState(), now: NOW, looked: LATE, seed: { 'desk-home-groups-v1': JSON.stringify({ closed: false }) } },
  { name: 'g8c-order-three-waiting', state: () => orderState({ waiting: true }), now: NOW, looked: LATE, later: true, seed: { 'desk-home-groups-v1': JSON.stringify({ closed: false }) } },
  { name: 'g8c-order-two-quiet', state: () => orderState({ only: [SD.name, MIX_PROJECT] }), now: NOW, looked: LATE },
  { name: 'g8c-order-two-waiting', state: () => { const s = orderState({ waiting: true }); s.repos[POOM.name].fail = null; return s; }, now: NOW, looked: LATE, later: true },
  { name: 'g8c-cant-show', state: () => { const s = mixState(); s.repos[MIX_PROJECT].pulls.push(BAD_PR); return s; }, now: NOW, looked: LATE },
  { name: 'g8c-cant-show-beside-two', state: () => orderState({ cantShow: true }), now: NOW, looked: LATE },
  { name: 'g8c-line-now-build', state: () => nowShared('build'), now: NOW, looked: LATE },
  { name: 'g8c-line-sprint-after', state: () => sprintsState(1), now: NOW, looked: LATE },
].filter((s) => !process.argv[3] || s.name.startsWith(process.argv[3]));
/** G5: `text` with J12's built answer (NOT as GitHub sent it), as `stall` has it. */
function withPulls() {
  const s = textState();
  s.repos[SD.name].pullsAnswer = pullsAnswer();
  return s;
}
/** G5: `text` with made-up workflow runs on Service-Desk's head (NOT real): two passing, one running, the deploy and the Orchestrator's set aside. */
function withRuns() {
  const s = textState();
  s.repos[SD.name].runs = [{ name: 'governance', status: 'completed', conclusion: 'success' }, { name: 'desk-tests', status: 'completed', conclusion: 'success' },
    { name: 'lint', status: 'in_progress', conclusion: null }, { name: 'desk-deploy', status: 'waiting', conclusion: null }, { name: 'orchestrator', status: 'completed', conclusion: 'skipped' }];
  return s;
}
const SIZES = [[360, 740], [414, 896]];
const THEMES = ['light', 'dark'];

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };
const SHELL = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Service Desk</title><link rel="stylesheet" href="style.css"></head><body>
<header id="top" hidden><a class="brand" href="#/">Service Desk</a><p id="screen-state" role="status">Checking…</p></header>
<main id="view"><p>Checking…</p></main><footer id="foot" hidden></footer>
<script type="module">
const config = await (await fetch('/__config')).json();
const call = async (path, body) => (await fetch('/__call', { method: 'POST', body: JSON.stringify({ path, body }) })).json();
const m = await import('/sandbox.js');
m.startSandbox({ config, call });
</script></body></html>`;

function serve(cur) {
  const srv = createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    // A failed load (G4): the page's own index.html and app.js, the files the shot names missing.
    if (cur.missing && cur.missing.includes(url.pathname.replace(/^\//, ''))) return res.writeHead(404).end();
    if (cur.missing && (url.pathname === '/' || url.pathname === '/index.html')) return res.writeHead(200, { 'content-type': 'text/html' }).end(readFileSync(join(PUBLIC, 'index.html')));
    if (url.pathname === '/' || url.pathname === '/index.html') return res.writeHead(200, { 'content-type': 'text/html' }).end(SHELL);
    if (url.pathname === '/__config') return res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(cur.setup.config));
    if (url.pathname === '/__call') {
      let raw = '';
      req.on('data', (c) => { raw += c; });
      req.on('end', async () => {
        const { path, body } = JSON.parse(raw);
        const r = await cur.server.call(path, body);
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(r));
      });
      return undefined;
    }
    const file = join(PUBLIC, decodeURIComponent(url.pathname));
    if (!file.startsWith(PUBLIC) || !existsSync(file) || !statSync(file).isFile()) return res.writeHead(404).end();
    return res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(readFileSync(file));
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

async function main() {
  // Playwright as installed for the session: a local install if there is one, else the global one beside node.
  const { chromium } = await import('playwright').catch(() => import(pathToFileURL(join(dirname(process.execPath), '..', 'lib', 'node_modules', 'playwright', 'index.mjs')).href));
  mkdirSync(OUT, { recursive: true });
  const cur = { setup: null, server: null, now: 0 };
  const srv = await serve(cur);
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  const made = [];
  try {
    for (const shot of SHOTS) {
      for (const [w, hgt] of SIZES) {
        for (const theme of THEMES) {
          const setup = shot.state();
          cur.setup = setup;
          cur.now = shot.now;
          cur.missing = shot.missing || null;
          cur.server = fakeServer(setup.repos, setup.config, { now: () => cur.now });
          if (shot.before) setup.fail();
          const ctx = await browser.newContext({ viewport: { width: w, height: hgt }, deviceScaleFactor: 2, colorScheme: theme });
          const page = await ctx.newPage();
          await page.clock.install({ time: shot.now });
          await page.addInitScript(([looked, seed]) => {
            try {
              localStorage.setItem('desk-seen-v1', JSON.stringify({ lastLooked: looked }));
              for (const [k, v] of Object.entries(seed || {})) localStorage.setItem(k, v);
            } catch { /* none */ }
          }, [shot.looked, shot.seed || null]);
          await page.goto(base + (shot.hash || ''));
          const run = async (ms) => {
            for (let t = 0; t < ms; t += 1000) {
              await page.clock.runFor(1000);
              cur.now += 1000;
              await page.waitForTimeout(25);
            }
          };
          await run(2000 + 60_000 * (shot.polls || 1));
          if (shot.later) {
            setup.fail();
            await run(3 * POLL);
          }
          // Opened from the screen before it, as the owner opens it (G4's Timeline: opening scrolls it to Now).
          if (shot.then) {
            await page.evaluate((h) => { location.hash = h; }, shot.then);
            await run(2000);
          }
          // G7: every fold of a kind opened, one tap each, until none is left closed.
          if (shot.clickAll) {
            for (let i = 0; i < 200 && (await page.locator(shot.clickAll).count()); i++) {
              await page.locator(shot.clickAll).first().click();
              await run(200);
            }
          }
          // G5: folds opened as the owner opens them, one tap each.
          for (const sel of shot.click || []) {
            await page.click(sel);
            await run(1000);
          }
          await page.waitForTimeout(300);
          const scroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          const strip = await page.evaluate(() => { const r = document.querySelector('.v2-krow'); return r ? r.scrollWidth - r.clientWidth : null; });
          const gates = await page.evaluate(() => [...document.querySelectorAll('.v2-card.gate .v2-tt, .v2-sheet .v2-stt, .v2-plli.gate .v2-plname')].map((e) => {
            const lh = parseFloat(getComputedStyle(e).lineHeight) || 1;
            return `${Math.round(e.getBoundingClientRect().height / lh)} line(s)${e.scrollHeight > e.clientHeight + 1 ? ', cut' : ''}`;
          }));
          const now = await page.evaluate(() => { const n = document.querySelector('[data-k="nowline"]'); return n ? Math.round(n.getBoundingClientRect().top) : null; });
          // G5 (AC89 (c)): the waits row's words and whether its two-line cut hides any of them.
          const waits = await page.evaluate(() => { const e = document.querySelector('[data-k="page-waits"] .v2-wn'); return e ? `${e.textContent}${e.scrollHeight > e.clientHeight + 1 ? ' [cut]' : ''}` : null; });
          // G6 (AC92 (d)): each opened phase's heads and fold rows, in order.
          const std = await page.evaluate(() => [...document.querySelectorAll('.v2-stdl .v2-subh, .v2-stdl .v2-untrw')].map((e) => e.textContent).join(' | '));
          // G7 (AC92 (a)): how many marks the page draws green and red, by their own colour.
          const marks = await page.evaluate(() => {
            const css = getComputedStyle(document.querySelector('.v2-page') || document.documentElement);
            const want = (v) => css.getPropertyValue(v).trim().toLowerCase();
            const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
            const [ok, bad] = [rgb(want('--ok')), rgb(want('--bad'))];
            let g = 0;
            let r = 0;
            for (const e of document.querySelectorAll('.v2-s.ok, .v2-s.bad, .v2-cim, .v2-okm, .v2-smk, .v2-safe.bad .v2-k, .v2-bcant > .v2-k')) {
              const c = getComputedStyle(e).color;
              if (c === ok) g++;
              else if (c === bad) r++;
            }
            return `${g} green, ${r} red`;
          });
          // G7b (AC91 (c)): each missing line, how many lines it takes, and whether it is cut (it must not be).
          const miss = await page.evaluate(() => [...document.querySelectorAll('.v2-smiss > p')].map((e) => {
            const lh = parseFloat(getComputedStyle(e).lineHeight) || 1;
            return `${Math.round(e.getBoundingClientRect().height / lh)} line(s)${e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1 ? ', cut' : ''}`;
          }));
          // G8 (AC92 (b)): each arrow, its drawing, its box and where it sits against what it points at.
          const arrows = await page.evaluate(() => [...document.querySelectorAll('.v2-here')].map((a) => {
            const b = a.getBoundingClientRect();
            const box = `${Math.round(b.width)}×${Math.round(b.height)}`;
            const mid = (r) => r.top + r.height / 2;
            const p = a.parentElement;
            const hidden = a.closest('[aria-hidden="true"]') ? 'hidden' : 'NOT hidden';
            if (p.classList.contains('v2-nowl')) {
              // The rail: the run's segment's line (`.v2-tseg::before`).
              const seg = p.closest('.v2-tblk') && p.closest('.v2-tblk').querySelector('.v2-tseg');
              const rr = seg ? getComputedStyle(seg, '::before') : null;
              const rx = seg ? seg.getBoundingClientRect().left + parseFloat(rr.left) + parseFloat(rr.width) / 2 : NaN;
              return `Timeline ${box}, centre x ${(b.left + b.width / 2 - rx).toFixed(1)} px off the rail's, ${hidden}`;
            }
            if (p.classList.contains('v2-ph')) {
              const bar = p.querySelector('.v2-bar3').getBoundingClientRect();
              return `strip ${box}, centre ${Math.round(b.left + b.width / 2 - (bar.left + bar.width / 2))} px off the bar's, ${Math.round(bar.top - b.bottom)} px above it, ${hidden}`;
            }
            if (p.classList.contains('v2-c')) {
              const i = p.querySelector('.v2-s').getBoundingClientRect();
              return `tile ${box}, ${Math.round(i.left - b.right)} px left of the icon, centre ${Math.round(mid(b) - mid(i))} px off its, ${hidden}`;
            }
            const i = p.querySelector('.v2-s').getBoundingClientRect();
            if (p.classList.contains('v2-plrow')) return `Plan ${box}, x ${Math.round(b.left)}–${Math.round(b.right)}, centre ${Math.round(mid(b) - mid(i))} px off the icon's, ${hidden}`;
            const line = p.closest('.v2-stdl');
            const lx = line ? line.getBoundingClientRect().left + parseFloat(getComputedStyle(line, '::before').left) + 0.5 : NaN;
            return `opened phase ${box}, centre x ${Math.round(b.left + b.width / 2 - lx)} px off the line's, centre ${Math.round(mid(b) - mid(i))} px off the icon's, ${hidden}`;
          }));
          // G8b (AC24's note): each "moved" word, where it sits against its row's code line and name, its lines, and the
          // moved row's name, its lines and whether anything cuts it.
          const moved = await page.evaluate(() => [...document.querySelectorAll('.v2-plmoved')].map((e) => {
            const lines = (x) => Math.round(x.getBoundingClientRect().height / (parseFloat(getComputedStyle(x).lineHeight) || 1));
            const cut = (x) => x.scrollHeight > x.clientHeight + 1 || x.scrollWidth > x.clientWidth + 1;
            const li = e.closest('li');
            const code = e.parentElement.querySelector('.v2-plm').getBoundingClientRect();
            const nm = e.parentElement.querySelector('.v2-plname');
            const b = e.getBoundingClientRect();
            const n = nm.getBoundingClientRect();
            return `${li.dataset.row}: "${e.textContent}" ${lines(e)} line(s), ${Math.round(b.top - code.bottom)} px under the code line, ${Math.round(b.left - n.left)} px from the name's left, ${Math.round(b.width)} px wide${cut(e) ? ', CUT' : ''}; the name ${lines(nm)} line(s), ${Math.round(n.width)} px wide${cut(nm) ? ', CUT' : ', whole'}${li.classList.contains('moved') ? '' : ', NOT on the moved row'}${e.getAttribute('aria-hidden') === 'true' ? '' : ', NOT hidden'}`;
          }));
          // G8c (AC91 (c); AC92 (b)): the briefing's lines in order, the missing lines, and each tile's now cell: whether a line
          // comes in (its ::before drawn), how far it ends before the arrow, and the arrow's gap to the icon.
          const g8c = await page.evaluate(() => {
            const brief = [...document.querySelectorAll('.v2-brief .v2-bt1, .v2-brief .v2-bcant')].map((e) => e.textContent);
            const missLines = [...document.querySelectorAll('.v2-smiss > p')].map((e) => e.textContent);
            const cells = [...document.querySelectorAll('.v2-c.here')].map((c) => {
              const r = c.getBoundingClientRect();
              const a = c.querySelector('.v2-here').getBoundingClientRect();
              const i = c.querySelector('.v2-s').getBoundingClientRect();
              const b = getComputedStyle(c, '::before');
              const name = c.closest('.v2-tile').querySelector('.v2-tnm').textContent;
              if (b.content === 'none' || b.content === 'normal') return `${name}: no line in, the arrow ${Math.round(i.left - a.right)} px left of the icon`;
              const end = r.left + parseFloat(b.left) + parseFloat(b.width);
              return `${name}: a line in, ${Math.round(parseFloat(b.width))} px in its ${Math.round(r.width)} px cell, ending ${(a.left - end).toFixed(1)} px before the arrow; the arrow ${Math.round(a.width)}×${Math.round(a.height)}, ${Math.round(i.left - a.right)} px left of the icon`;
            });
            return `briefing: ${brief.join(' | ')}; missing: ${missLines.join(' | ') || 'none'}; now cells: ${cells.join('; ') || 'none'}`;
          });
          const file = join(OUT, `${shot.name}-${w}x${hgt}-${theme}.png`);
          await page.screenshot({ path: file, fullPage: !shot.viewport });
          made.push(`${file}${scroll > 0 ? `  (scrolls sideways by ${scroll} px)` : ''}${strip != null ? `  (the strip's row scrolls ${strip} px inside itself)` : ''}${gates.length ? `  (gate titles: ${gates.join('; ')})` : ''}${shot.viewport && now != null ? `  (the Now line's top at ${now} px; a third of the screen is ${Math.round(hgt / 3)} px)` : ''}${waits && /^g5-page-gates/.test(shot.name) ? `  (waits row: ${waits})` : ''}${std && /^g6-page/.test(shot.name) ? `  (${std})` : ''}${/^g7-/.test(shot.name) ? `  (marks: ${marks})` : ''}${/^g7b-/.test(shot.name) ? `  (missing lines: ${miss.join('; ') || 'none'})` : ''}${/^g8-/.test(shot.name) ? `  (arrows: ${arrows.length ? arrows.join('; ') : 'none'})` : ''}${/^g8b-/.test(shot.name) ? `  (moved: ${moved.length ? moved.join('; ') : 'none'})` : ''}${/^g8c-/.test(shot.name) ? `  (${g8c})` : ''}`);
          await ctx.close();
        }
      }
    }
  } finally {
    await browser.close();
    srv.close();
  }
  console.log(made.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
