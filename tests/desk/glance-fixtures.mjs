// The fixture states of "After the glance audit" (spec S-001, AC91's note, "The fixtures"), built by the Builder on
// tests/desk/fake-desk.mjs's in-memory repositories from committed fixtures, in the stage that first needs each.
// G1 (Home at a glance) builds `text`, `mix`, `unread`, `stall`, signed-out and `ext`; G2 (Waiting) adds `quiet`, and
// for the Kicked back strip a second made-up project and the Done marks a device keeps; G3 (gate titles) adds `gates`, two
// made-up gate cards at one gate; G4 adds `gates`' `sameItem` (one item's two gate cards at one gate) and Done marks
// with `id`, `title` and `confirmedAt` (its failed load is app.js served with no sandbox.js, built in its own test and
// tools/glance-shots.mjs); G5 adds `mix`'s made-up later Launch run for F1 and F2 (`laterLaunch`); G6 adds `standard`, every
// standard line written in Service-Desk's section 3; G7 adds made-up workflow runs on a head (`ciState`) and the screens
// its palette's marks are drawn on, opened as the owner opens them (`G7_OPENS`); the later stages add theirs. Each
// made-up part is labelled NOT real here and in tests/desk/fixtures/README.md.
import { CONFIG, fixture } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { waSetup, WORKED, memStore, SD, POOM } from './wa-fixtures.mjs';
import { loadSandbox, findAll } from './sandbox-helpers.mjs';
import { sdRepo, SD3, pullNodes, answerOf } from './tv2-fixtures.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { fullRepo, v3, extremes, NOW } from './sandbox-fixtures.mjs';
import { pullsAnswer } from './j12-fixture.mjs';
import { STANDARD_MILESTONES } from '../../src/lib/timeline.js';

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
export function mixState({ extra = {}, raised = {}, laterLaunch = false } = {}) {
  const s = textState();
  if (laterLaunch) s.repos[SD.name].commit({ [LOG]: laterLaunchLog(s.repos[SD.name].files[LOG]) });
  const alpha = fullRepo(MIX_PROJECT);
  alpha.commit(extra);
  // A made-up file's raised time (J2: its first commit), as fullRepo gives its question's.
  for (const [path, at] of Object.entries(raised)) alpha.history[path] = [{ commit: { committer: { date: new Date(at).toISOString() } } }];
  s.config = { ...s.config, projects: [...s.config.projects, v3(MIX_PROJECT)] };
  s.repos[MIX_PROJECT] = alpha;
  return s;
}

/**
 * G5's F1 and F2 (AC92 (c); round 2's "Problems that were already there"; AC91's note, "The fixtures": "for F1 and F2, a
 * made-up later Launch run recording Launch-3 "not reached" and M3C planned in an earlier run"), on `mix` with
 * `laterLaunch: true`: Service-Desk's dispatch log at 77bfeae with five made-up lines after its own (NOT real records):
 * P-001 sent to stage 6 (the Launch phase's builder) on the morning of 2026-10-14, before the states' clock, with its
 * outcome, the owner's "revise" at its Launch gate, and stage 6 again with its outcome. The model's timeline then holds two Launch runs still to come (Design run 2
 * stays now): Launch run 2 holding M3C, planned, and Launch run 3 recording Launch-3 "not reached" (no handover package
 * in the tree). Before G5, Launch's line read "Yours: M3C · Standard: 0 of 5, not recorded yet" on these records: F1
 * (a recorded "not reached" read as not recorded) and F2 (M3C, an earlier run's, dropped from the line's sum).
 */
const LOG = 'dispatch-log/2026-10.jsonl';
export const LATER_LAUNCH_LINES = [
  { action: 'dispatch', gate: null, item: 'P-001', role: 'builder', route: 'launch-dispatch', spec: 'S-001', stage: 6, time: '2026-10-14T09:00:00Z', trigger: 'step' },
  { item: 'P-001', record: null, result: 'ok', role: 'builder', session: 'P-001:launch-dispatch:2026-10-14T09:00:00Z', time: '2026-10-14T10:00:00Z', trigger: 'outcome', verdict: null },
  { card: 9, gate: 'launch', item: 'P-001', proxy: false, record: 'decisions/P-001/launch-9.md', result: 'ready/6/builder', time: '2026-10-14T11:00:00Z', trigger: 'decision', word: 'revise' },
  { action: 'dispatch', gate: null, item: 'P-001', role: 'builder', route: 'launch-dispatch', spec: 'S-001', stage: 6, time: '2026-10-14T12:00:00Z', trigger: 'step' },
  { item: 'P-001', record: null, result: 'ok', role: 'builder', session: 'P-001:launch-dispatch:2026-10-14T12:00:00Z', time: '2026-10-14T13:00:00Z', trigger: 'outcome', verdict: null },
];
export const laterLaunchLog = (log) => `${log.trimEnd()}\n${LATER_LAUNCH_LINES.map((o) => JSON.stringify(o)).join('\n')}\n`;

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

/**
 * `standard` (G6, AC92 (d)): `text` with every one of the model's 24 standard milestones given a line in Service-Desk's
 * docs/PROJECT.md section 3 (made up, NOT real records: Service-Desk's own section 3 at 77bfeae holds none), each "taken
 * on" with a made-up why, but STANDARD_SKIPPED's, "skipped", as ac83-page.test.mjs's `ALL_24` writes them. So an opened
 * phase shows each kind of row its standard group lists: tracked ones with a state recorded, taken-on ones the model can
 * record in a run now (in h), taken-on ones it can't (Design-3 and Design-5, of NOT_RECORDED_IDS) and recordable ones in
 * a finished phase or an earlier run gone back over (R3-b: "taken on · not recorded by the model"), skipped ones, and none
 * left to fold where every line is written. With `ids`, only those standard milestones get their line (the rest none, as
 * at 77bfeae), so one phase shows the three states together: a skipped one listed, the untracked ones folded.
 */
export const STANDARD_SKIPPED = ['Design-2', 'Build-4'];
export function standardLines(doc, ids = null) {
  return doc.replace(/^## 3\. The 25,000-foot plan\n/m, (head) => `${head}${STANDARD_MILESTONES.filter(([id]) => !ids || ids.includes(id)).map(([id]) => `- ${id} (standard) · ${STANDARD_SKIPPED.includes(id) ? 'skipped' : 'taken on'} · why: made up for the test, ${id}`).join('\n')}\n`);
}
export function standardState({ ids = null } = {}) {
  const s = textState();
  s.repos[SD.name].commit({ 'docs/PROJECT.md': standardLines(s.repos[SD.name].files['docs/PROJECT.md'], ids) });
  return s;
}

/**
 * G7 (AC92 (a)): made-up workflow runs on a project's head (NOT how GitHub answered any read), so its CI reads `passing`
 * (one run, success) or `failing` (one run, failure), AC29's states: on `text`, Service-Desk's (in place of none), or
 * with `who` the made-up project of `mix` (beside its deploy waiting), or Personal-Org-Operating-Model's (v2.5).
 */
export const G7_RUN = { passing: { name: 'desk-tests', status: 'completed', conclusion: 'success' }, failing: { name: 'desk-tests', status: 'completed', conclusion: 'failure' } };
export function ciState(ci, { who = SD.name } = {}) {
  const s = who === MIX_PROJECT ? mixState() : textState();
  s.repos[who].runs.push({ ...G7_RUN[ci] });
  return s;
}

/**
 * G7 (AC92 (a)): a waiting deploy whose commit is no passed pull request's merge, so its sheet's mark is the mismatch's
 * ✕ (AC72), as AC72's test makes it: Service-Desk at 3117150 with J12's built answer, PR #77's merge commit made the
 * fake repository's head and a made-up PASS verdict for it (NOT real records, NOT as GitHub sent it), a push run of
 * desk-deploy waiting (a match) and a hand-started one at another commit (made up: no merge has it).
 */
export function mismatchState() {
  const r = sdRepo({ extra: { 'reviews/77/reviewer.md': 'Verdict: PASS\n\nMade up for the test (NOT a real record).\n' } });
  const head = r.head();
  r.pullsAnswer = answerOf(pullNodes().map((n) => (n.number === 77 ? { ...n, mergeCommit: { oid: head } } : n)));
  r.runs.push({ name: 'desk-deploy', path: '.github/workflows/desk-deploy.yml', status: 'waiting', conclusion: null, event: 'workflow_dispatch', run_number: 7,
    headSha: 'd'.repeat(40), title: `deploy ${'d'.repeat(40)} — production` });
  return { config: { ...CONFIG, projects: [{ ...SD3, deploysNeedOwner: true }] }, repos: { 'Service-Desk': r } };
}

const tapAll = async (app, pick) => {
  for (let i = 0; i < 200; i++) {
    const b = findAll(app.view, pick)[0];
    if (!b) return;
    await app.tap(b);
  }
};
const closed = (attr) => (e) => e.tag === 'button' && e.attrs && e.attrs[attr] != null && e.attrs['aria-expanded'] === 'false';
const byKey = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
async function g7Open(setup, hash, { now = NOW, store = memStore(), polls = 1 } = {}) {
  const app = await loadSandbox({ ...setup, hash, now, store });
  await app.advance(1000);
  for (let i = 0; i < polls; i++) await app.advance(POLL_MS);
  return app;
}
/**
 * G7 (AC92 (a)): the screens the palette's marks are drawn on that AC88's walk doesn't open, each opened as the owner
 * opens it, as [name, open() → the open page]: a project's page with every phase opened; the Timeline with every
 * sprint fold and the status icons' key opened (J11's 3117150, its #40's checks failed); Plan with a row moved in its
 * ordering, the ordering closed again, and Reached opened; Details opened over a passing and a failing CI line, a v2.5 page's CI row passing, and
 * a card's sheets over a failing one; a deploy's mismatch; the Done lane's confirmed row; a page that can't be read with
 * nothing waiting (its waits row's can't-read line); and the briefing holding a can't-read line under its count.
 */
export const G7_OPENS = [
  ['page, every phase opened', async () => {
    const app = await g7Open(textState(), `#/p/${SD.name}`);
    for (const ph of ['Launch', 'Build', 'Design', 'Discovery']) await app.tap(findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['aria-label'] === ph)[0]);
    return app;
  }],
  ['Timeline, every sprint opened', async () => {
    const app = await g7Open({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } }, '#/p/Service-Desk/timeline', { polls: 2 });
    await tapAll(app, closed('data-sprints'));
    await app.tap(findAll(app.view, (e) => e.tag === 'button' && e.textContent === 'Status icons')[0]);
    return app;
  }],
  ['Plan, a row moved and Reached opened', async () => {
    const app = await g7Open(waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } }), '#/work', { now: Date.parse('2026-10-18T18:00:00Z') });
    await app.tap(byKey(app, 'plan-order'));
    await app.tap(findAll(app.view, (e) => e.tag === 'button' && /^wa-up:/.test((e.dataset && e.dataset.k) || '') && e.attrs['aria-disabled'] !== 'true')[0]);
    await app.tap(byKey(app, 'plan-order')); // the ordering closed again: the moved row keeps its edge until the next move
    await app.tap(findAll(app.view, (e) => e.tag === 'button' && / v2-plfold /.test(` ${e.className} `) && /^Reached/.test(e.textContent))[0]);
    return app;
  }],
  ...['passing', 'failing'].map((ci) => [`Details, CI ${ci}`, async () => {
    const app = await g7Open(ciState(ci), `#/p/${SD.name}`);
    await app.tap(byKey(app, 'more-detail'));
    return app;
  }]),
  ['a v2.5 page, CI passing', async () => g7Open(ciState('passing', { who: POOM.name }), `#/p/${POOM.name}`)],
  ...['question', 'pr'].map((kind) => [`a ${kind}'s sheet, CI failing`, async () => g7Open(ciState('failing', { who: MIX_PROJECT }), `#/waiting/card/${encodeURIComponent(CARD[kind](MIX_PROJECT))}`)]),
  ['a deploy\'s mismatch', async () => {
    const app = await g7Open(mismatchState(), '#/waiting/Service-Desk', { polls: 2 });
    const sheet = findAll(app.view, (e) => e.tag === 'a' && /\/card\/[^/]*%7Cdeploy%7C/.test(e.attrs.href || ''))[0];
    await app.go(sheet.attrs.href);
    return app;
  }],
  ['the Done lane, a confirmed row', async () => g7Open(gatesState(), '#/waiting', { store: memStore(deviceMarks([
    { project: MIX_PROJECT, kind: 'gate', id: GATE_KEY(MIX_PROJECT, 'queue/P-009-launch-1.md'), title: 'The Launch gate, case 1 · P-009', at: NOW - 3 * 3600e3, confirmedAt: NOW - 2 * 3600e3 }])), polls: 0 })],
  ['a page that can\'t be read, nothing waiting', async () => {
    const s = unreadState({ who: SD.name });
    const app = await g7Open(s, `#/p/${SD.name}`);
    s.fail();
    await app.advance(3 * POLL_MS);
    return app;
  }],
  ['the briefing, a can\'t-read line under its count', async () => {
    const s = unreadState({ who: SD.name });
    const app = await g7Open(s, '#/');
    s.fail();
    await app.advance(3 * POLL_MS);
    return app;
  }],
];

export { SD, POOM, CONFIG };
