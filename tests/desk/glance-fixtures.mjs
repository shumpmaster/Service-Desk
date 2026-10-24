// The fixture states of "After the glance audit" (spec S-001, AC91's note, "The fixtures"), built by the Builder on
// tests/desk/fake-desk.mjs's in-memory repositories from committed fixtures, in the stage that first needs each.
// G1 (Home at a glance) builds `text`, `mix`, `unread`, `stall`, signed-out and `ext`; G2 (Waiting) adds `quiet`, and
// for the Kicked back strip a second made-up project and the Done marks a device keeps; the later stages add theirs
// (`mix`'s made-up later Launch run for F1 and F2 is G5's; failed-load is G4's). Each made-up part is labelled NOT real
// here and in tests/desk/fixtures/README.md.
import { CONFIG } from './helpers.mjs';
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
 * read). Returns the store's entry, { key: JSON }.
 */
export function deviceMarks(list) {
  const marks = {};
  for (const m of list) {
    const id = CARD[m.kind](m.project);
    marks[id] = { project: m.project, step: STEP[m.kind], head: null, at: m.at, title: TITLE[m.kind] ? TITLE[m.kind](m.project) : '',
      kicked: m.kickedAt != null ? { at: m.kickedAt, reason: '' } : null, prevKick: null, confirmedAt: null,
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

export { SD, POOM, CONFIG };
