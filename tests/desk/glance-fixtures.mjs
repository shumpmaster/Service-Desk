// The fixture states of "After the glance audit" (spec S-001, AC91's note, "The fixtures"), built by the Builder on
// tests/desk/fake-desk.mjs's in-memory repositories from committed fixtures, in the stage that first needs each.
// G1 (Home at a glance) builds `text`, `mix`, `unread`, `stall`, signed-out and `ext`; G2 (Waiting) adds `quiet`, and
// for the Kicked back strip a second made-up project and the Done marks a device keeps; G3 (gate titles) adds `gates`, two
// made-up gate cards at one gate; G4 adds `gates`' `sameItem` (one item's two gate cards at one gate) and Done marks
// with `id`, `title` and `confirmedAt` (its failed load is app.js served with no sandbox.js, built in its own test and
// tools/glance-shots.mjs); the later stages add theirs (`mix`'s made-up later Launch run for F1 and F2 is G5's). Each
// made-up part is labelled NOT real here and in tests/desk/fixtures/README.md.
import { CONFIG, fixture } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { waSetup, SD, POOM } from './wa-fixtures.mjs';
import { fullRepo, v3, extremes, NOW } from './sandbox-fixtures.mjs';
import { pullsAnswer } from './j12-fixture.mjs';

/** The clock the states open at, as the suite's other trial-view tests (2026-10-14T15:00:00Z). */
export { NOW };

/**
 * `text`: Service-Desk's records at 77bfeae, real, as committed (tests/desk/fixtures/j11-77bfeae/, wa-fixtures.mjs's `SD`
 * and `j77Files`, as ac83-page.test.mjs uses them), and Personal-Org-Operating-Model in poom/'s placeholder form; nothing added.
 */
export function textState() {
  return waSetup();
}

/** The made-up project of `mix` (NOT real records): AC52's one-of-each fixture, one card of each kind, a gate card and its case (sandbox-fixtures.mjs's fullRepo). */
export const MIX_PROJECT = 'Alpha';

/**
 * `mix`: `text`'s records, with poom/ in its placeholder form and one made-up project holding one card of each kind
 * (NOT real records: md-extremes/'s gate card and its case, orchestrator-m2/'s hold and merge cards, a question, a pull
 * request, a deploy waiting, as AC52's fixture holds them). `extra` adds made-up files to that project.
 */
export function mixState({ extra = {}, raised = {} } = {}) {
  const s = textState();
  const alpha = fullRepo(MIX_PROJECT);
  alpha.commit(extra);
  // A made-up file's raised time (J2: its first commit), as fullRepo gives its question's.
  for (const [path, at] of Object.entries(raised)) alpha.history[path] = [{ commit: { committer: { date: new Date(at).toISOString() } } }];
  s.config = { ...s.config, projects: [...s.config.projects, v3(MIX_PROJECT)] };
  s.repos[MIX_PROJECT] = alpha;
  return s;
}

/**
 * `unread`: `mix` with one project's read failing (made up: the fake desk's function can't be reached for it, AC5's
 * network cause). `who` names the project: Service-Desk, which has nothing waiting on the owner, by default; the made-up
 * project, with its cards waiting, for the corner that keeps what waits. `fail()` makes its reads fail: called before
 * the page opens, no read of it succeeds in this opening; called later, after its first reads succeeded.
 */
export function unreadState({ who = SD.name, extra = {}, raised = {} } = {}) {
  const s = mixState({ extra, raised });
  s.fail = () => { s.repos[who].fail = { kind: 'network' }; };
  return s;
}

/** signed-out: every read refused as signed out (made up: the fake desk answers 403 for each project, J6). Call `fail()`. */
export function signedOutState() {
  const s = mixState();
  s.fail = () => { for (const r of Object.values(s.repos)) r.fail = { kind: 'signed-out' }; };
  return s;
}

/**
 * `stall`: `text` with no movement for 8 days (made-up times). Service-Desk's J12 answer is the built one
 * (tests/desk/fixtures/github/j12-pulls-built.json, from REST answers, NOT as GitHub sent it), whose latest movement is
 * PR #77's merge at 2026-10-16T11:18:28Z; nothing in the records at 77bfeae is later. The clock is made up: STALL_NOW,
 * 8 days and 41 minutes after it.
 */
export const STALL_LAST = Date.parse('2026-10-16T11:18:28Z');
export const STALL_NOW = Date.parse('2026-10-24T12:00:00Z');
export function stallState() {
  const s = textState();
  s.repos[SD.name].pullsAnswer = pullsAnswer();
  return s;
}

/** `ext`: md-extremes/ (NOT real records: long texts, a gate card and its case, five connected projects), as AC42's tests hold it. */
export function extState() {
  return extremes();
}

/**
 * `quiet` (G2): `mix` with nothing waiting and every project read: `text`'s records, with the made-up project holding no
 * card (NOT a real record: its README alone), so Waiting shows "Nothing waiting: …", empty lanes and "Kicked back · none".
 */
export function quietState() {
  const s = textState();
  s.config = { ...s.config, projects: [...s.config.projects, v3(MIX_PROJECT)] };
  s.repos[MIX_PROJECT] = repo({ 'README.md': `# ${MIX_PROJECT}\n\nNOT a real project: made up for the glance audit's \`quiet\` state.\n` });
  return s;
}

/** G2's second made-up project (NOT real records), as `mix`'s, so the Kicked back strip holds two projects' cards. */
export const MIX_PROJECT2 = 'Bravo';

/** `mix` with a second made-up project holding one card of each kind (NOT real records: fullRepo, as `mix`'s). */
export function twoMixState(opts = {}) {
  const s = mixState(opts);
  s.config = { ...s.config, projects: [...s.config.projects, v3(MIX_PROJECT2)] };
  s.repos[MIX_PROJECT2] = fullRepo(MIX_PROJECT2);
  return s;
}

/**
 * A card's AC73 key on the made-up projects (fullRepo's one of each): its pull request #80, its question, its gate card,
 * its decision card, its hold card and its merge card.
 */
export const CARD = {
  pr: (p) => `${p}|pr|80`,
  question: (p) => `${p}|question|questions/${p}-pick.md`,
  gate: (p) => `${p}|gate|queue/P-002-criteria-1.md`,
  card: (p) => `${p}|card|queue/Q-020-stop-1.md`,
  hold: (p) => `${p}|hold|queue/ci-hold-4a2448939173.md`,
  merge: (p) => `${p}|merge|queue/P-002-merge-conflict.md`,
};
const STEP = { pr: 'open', question: 'answer', gate: 'answer', card: 'answer', hold: 'open', merge: 'open' };
const TITLE = { pr: (p) => `${p}: a change to merge`, question: (p) => `${p}'s question` };

/**
 * Done marks a device keeps (made up, NOT real: no owner made them), as the board stores them under `desk-board-marks-v1`
 * (src/lib/board.js, readMarks): each { project, kind, at, kickedAt } marks that project's card of that kind at `at`;
 * with `kickedAt`, GitHub did not confirm it and it was kicked back then (its reason is worked out again at the first
 * read). From G4: `id` marks that card in place of the kind's own, `title` is the title kept with the mark, and
 * `confirmedAt` marks one GitHub confirmed then (a row with its ✓ in Done). Returns the store's entry, { key: JSON }.
 */
export function deviceMarks(list) {
  const marks = {};
  for (const m of list) {
    const id = m.id || CARD[m.kind](m.project);
    marks[id] = { project: m.project, step: STEP[m.kind], head: null, at: m.at, title: m.title != null ? m.title : TITLE[m.kind] ? TITLE[m.kind](m.project) : '',
      kicked: m.kickedAt != null ? { at: m.kickedAt, reason: '' } : null, prevKick: null, confirmedAt: m.confirmedAt != null ? m.confirmedAt : null,
      number: m.kind === 'pr' ? 80 : null, kind: m.kind, name: m.kind === 'question' ? `${m.project}-pick` : null };
  }
  return { 'desk-board-marks-v1': JSON.stringify({ v: 1, marks }) };
}

/**
 * The strip of G2's captures and tests (made up, NOT real): three cards kicked back on this device, across the two
 * made-up projects, the newest first: Alpha's pull request (1 minute ago), Bravo's question (3 minutes ago) and Alpha's
 * gate card (7 minutes ago), each marked 6 minutes before it was kicked back; and Bravo's pull request marked a minute ago,
 * still confirming, so Done holds a card.
 */
export const KICKED = [
  { project: MIX_PROJECT, kind: 'pr', at: NOW - 7 * 60e3, kickedAt: NOW - 60e3 },
  { project: MIX_PROJECT2, kind: 'question', at: NOW - 9 * 60e3, kickedAt: NOW - 3 * 60e3 },
  { project: MIX_PROJECT, kind: 'gate', at: NOW - 13 * 60e3, kickedAt: NOW - 7 * 60e3 },
  { project: MIX_PROJECT2, kind: 'pr', at: NOW - 60e3 },
];

/**
 * `gates` (G3): `mix` with two more gate cards in the made-up project, both at the Launch gate (NOT real records), so one
 * gate holds two cards whose first lines are the same: AC85's made-up Launch-gate card (tests/desk/fixtures/ac85/, in the
 * Orchestrator's form, its section 1's second line naming the gate and its case) as item P-004's card 1, "The Launch
 * gate, case 1.", and the same card as item P-005's card 2, "The Launch gate, case 2.", each with its status file, its
 * `card` line in the dispatch log (raised 60 and 30 minutes before NOW) and AC85's made-up case under its own path. The
 * made-up project's own Build-gate card (md-extremes/gate-card.md, P-002) has no case line. With `caseLines: false`, the
 * two Launch cards' case lines are left out too, as a card written before the Orchestrator named its case.
 */
export const GATE4 = 'queue/P-004-launch-1.md';
export const GATE5 = 'queue/P-005-launch-2.md';
/** G4's `sameItem` option: the second Launch card is item P-004's own card 2 (NOT a real record), in place of P-005's. */
export const GATE4B = 'queue/P-004-launch-2.md';
export const GATE_KEY = (p, path) => `${p}|gate|${path}`;
/**
 * With `sameItem: true` (G4, AC89 (c) after G3's review), the second Launch card is item P-004's card 2 ("The Launch
 * gate, case 2.", GATE4B), so one item has two gate cards waiting at one gate; P-005 and its files are not added.
 */
export function gatesState({ caseLines = true, sameItem = false } = {}) {
  const s = mixState();
  const alpha = s.repos[MIX_PROJECT];
  const base = fixture('ac85/queue/P-003-launch-1.md');
  const card = (item, n) => {
    let t = base.replace(/P-003/g, item).replace(/launch-1/g, `launch-${n}`).replace(/card: 1 /, `card: ${n} `).replace('The Launch gate, case 1.', `The Launch gate, case ${n}.`);
    if (!caseLines) t = t.replace(/^The Launch gate, case \d+\.\n/m, '');
    return t.replace("NOT a real record: made up for AC85's test.", "NOT a real record: made up for AC85's test, and copied for G3's two cards at one gate.");
  };
  const at = (min) => new Date(NOW - min * 60e3).toISOString().replace(/\.\d+Z$/, 'Z');
  const status = (n) => `kind = "project"\nstage = 6\nstate = "waiting-owner"\nrole = "user-rep"\ngate = "launch"\ncard = ${n}\ngate_n = ${n}\n`;
  const second = sameItem ? 'P-004' : 'P-005';
  const lines = [['P-004', 1, 60], [second, 2, 30]].map(([item, n, min]) => JSON.stringify({ item, action: 'card', card: n, gate: 'launch', role: 'user-rep',
    route: 'launch-gate', stage: 6, gate_n: n, time: at(min), trigger: 'x' }));
  alpha.commit({
    [GATE4]: card('P-004', 1), [sameItem ? GATE4B : GATE5]: card(second, 2),
    'status/P-004.toml': status(sameItem ? 2 : 1), ...(sameItem ? {} : { 'status/P-005.toml': status(2) }),
    'docs/gates/P-004/launch-gate-1-case.md': fixture('ac85/docs/gates/P-003/launch-gate-1-case.md'),
    [`docs/gates/${second}/launch-gate-2-case.md`]: fixture('ac85/docs/gates/P-003/launch-gate-1-case.md'),
    'dispatch-log/2026-10.jsonl': `${alpha.files['dispatch-log/2026-10.jsonl'].trimEnd()}\n${lines.join('\n')}\n`,
  });
  return s;
}

export { SD, POOM, CONFIG };
