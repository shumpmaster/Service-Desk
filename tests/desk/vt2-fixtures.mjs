// VT2's fixtures (spec S-001, AC25's first two parts as changed for M3B, and J5's storage; stage VT2 of "The desk's value
// targets shown: M3B"): every one made up, NOT a real record, and labelled so in tests/desk/fixtures/README.md. A v3 project
// holding one waiting item of each kind a sheet is drawn for (sandbox-fixtures.mjs's fullRepo: a card, a question, a hold
// card, a gate card and its case, a pull request, a merge card, and its deploy counted with `deploysNeedOwner`), a second
// whose card went missing, the made-up portfolio with one card in its queue (pf-fixtures.mjs), a held question (qw1's form,
// `Asked in session:`), and a pull request the automatic job records (ac79-desk.test.mjs's made-up case, its real ledger and
// grant record). The clock is sandbox-fixtures.mjs's made-up NOW (Wed 14 Oct 2026, 10:00 in Chicago).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG, fixture } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { fullRepo, v3, NOW } from './sandbox-fixtures.mjs';
import { pfFiles, addPortfolio, withPortfolio, cardText } from './pf-fixtures.mjs';
import { qFile } from './qw1-fixtures.mjs';
import { NOTIFY_FIX } from './notify-helpers.mjs';
import { vt1State, chi } from './vt1-fixtures.mjs';
import { METRICS_KEY } from '../../src/lib/metrics.js';

export { NOW, memStore, METRICS_KEY };
export const MIN = 60e3;
export const H = 3600e3;
export const TZ = 'America/Chicago';

/** Each kind's AC73 key in the made-up projects (Alpha's, Gamma's missing card, the portfolio's). */
export const KEYS = {
  question: 'Alpha|question|questions/Alpha-pick.md',
  card: 'Alpha|card|queue/Q-020-stop-1.md',
  hold: 'Alpha|hold|queue/ci-hold-4a2448939173.md',
  gate: 'Alpha|gate|queue/P-002-criteria-1.md',
  pr: 'Alpha|pr|80',
  merge: 'Alpha|merge|queue/P-002-merge-conflict.md',
  deploy: 'Alpha|deploy|1001',
  missing: 'Gamma|missing-card|status/P-001.toml',
  portfolio: ':portfolio|portfolio|queue/PF-001-explore-1.md',
};
/** A made-up project whose card went missing (its status file waits on stop-6, with no card file; NOT a real record). */
export const missingRepo = () => repo({ 'status/P-001.toml': 'kind = "project"\nstate = "waiting-owner"\ngate = "stop"\ncard = 6\n',
  'README.md': '# Gamma\n\nNOT a real project: made up for VT2\'s tests.\n' });

/**
 * Every kind (made up, NOT real): Alpha with one item of each kind, its deploy counted; Gamma's missing card; the portfolio's
 * one card. `portfolio: false` leaves the portfolio out. Returns { config, repos }.
 */
export function everyKind({ portfolio = true } = {}) {
  const repos = { Alpha: fullRepo('Alpha'), Gamma: missingRepo() };
  const base = { ...CONFIG, projects: [{ ...v3('Alpha'), deploysNeedOwner: true }, v3('Gamma')] };
  if (!portfolio) return { config: base, repos };
  addPortfolio(repos, pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1) } }));
  return { config: withPortfolio(base), repos };
}

/** A held question (qw1's form, made up, NOT real): Alpha asking it in a made-up session; `held()`'s file and its hold ended. */
export const HELD_PATH = 'questions/Alpha-plan-units.md';
export const HELD_KEY = `Alpha|question|${HELD_PATH}`;
export const HELD_SID = 'session_0VT2MadeUpNotARealSession1';
export const heldText = (asked = true) => qFile({ title: 'Should Plan show estimates in days or in weeks? (VT2, made up)', milestone: 'M3B', asked: asked ? HELD_SID : null,
  def: 'A', timeout: '72', why: 'made up, NOT a real question (VT2\'s fixtures).' });
export function withHeld(st) {
  st.repos.Alpha.commit({ [HELD_PATH]: heldText(true) });
  st.repos.Alpha.history[HELD_PATH] = [{ commit: { committer: { date: new Date(NOW - 2 * H).toISOString() } } }];
  return st;
}

// ---------------------------------------------------------------------------
// A pull request the automatic job records (ac79-desk.test.mjs's made-up case: PR #7, a filing, the job's run holding the
// asks-merge grant line; Service-Desk's real ledger and grant record at ef8daf4). Counted at the first read, then being recorded.

export const REC_NOW = Date.parse('2026-10-18T12:00:00Z');
export const REC_KEY = 'Service-Desk|pr|7';
const sd = (p) => readFileSync(join(NOTIFY_FIX, 'sd-ef8daf4', p), 'utf8');
const HEAD = 'c'.repeat(40);
const running = (id) => ({ id, name: 'build', status: 'in_progress', conclusion: null, completed_at: null, check_suite: { id: 10 } });
const arun = (id, at) => ({ id, event: 'workflow_run', head_branch: 'main', status: 'completed', conclusion: 'success', run_started_at: at, updated_at: at });
const stamped = (...lines) => lines.map((l) => `2026-10-18T11:41:05.1234567Z ${l}`).join('\n') + '\n';
export function recordingState() {
  const pull = { number: 7, title: 'File a made-up question', html_url: 'https://github.com/shumpmaster/Service-Desk/pull/7', draft: false, base: { ref: 'main' },
    head: { ref: 'cos/made-up-7', sha: HEAD, repo: { full_name: 'shumpmaster/Service-Desk' } }, user: { login: 'shumpmaster' }, author_association: 'OWNER',
    created_at: '2026-10-18T11:00:00Z', state: 'open' };
  const r = repo({
    'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
    'docs/LEDGER.md': sd('docs/LEDGER.md'),
    'decisions/questions/P-001-asks-merge.md': sd('decisions/questions/P-001-asks-merge.md'),
    '.github/workflows/asks-merge.yml': sd('.github/workflows/asks-merge.yml'),
  }, [pull], [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  r.prFiles = { 7: [{ filename: 'questions/N-filed.md', status: 'added' }] };
  r.jobs = { asksRuns: [arun(1, '2026-10-18T11:30:00Z')], checks: { [HEAD]: { checkRuns: [running(1)], statuses: [], workflowRuns: [{ check_suite_id: 10, path: '.github/workflows/desk-build.yml' }] } },
    runJobs: { 1: [{ id: 101, name: 'merge', status: 'completed', conclusion: 'success' }] }, logs: { 101: stamped('NOTE: the asks-merge grant is L-0017') }, commits: {} };
  const repos = { 'Service-Desk': r, 'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]) };
  return { config: CONFIG, repos };
}

// ---------------------------------------------------------------------------
// Service-Desk's targets' sheet (vt1-fixtures.mjs's state before launch: its section 6 at 7b69b2b, real, with VT1's made-up
// November cards), for "Not noted on this device".

export const TARGETS_NOW = chi('2026-11-27', '15:00');
export const targetsState = () => vt1State({ launch: null });

// ---------------------------------------------------------------------------
// The page

/** The page opened on `st` at `now` with `store` (a memStore), read once. */
export async function vt2Open(st, { hash = '#/waiting', now = NOW, store = memStore() } = {}) {
  const app = await loadSandbox({ ...st, hash, now, store });
  await app.advance(1000);
  app.store = store;
  return app;
}
/** The notes as this device keeps them (the store's `desk-metrics-v1`), or null. */
export const notesIn = (store) => (store.m.has(METRICS_KEY) ? JSON.parse(store.m.get(METRICS_KEY)) : null);
export const sheetOf = (app) => byClass(app.view, 'v2-sheet')[0] || null;
/** The sheet's own parts, in order (after its grab handle). */
export const sheetParts = (app) => { const s = sheetOf(app); return s ? s.children.filter((c) => !/\bv2-grab\b/.test(c.className || '')) : []; };
/** The "Didn't need me" line on the open sheet, or null. */
export const dnmLine = (app) => byClass(sheetOf(app) || app.view, 'v2-dnm')[0] || null;
export const buttonText = (app, text) => findAll(app.view, (e) => e.tag === 'button' && e.textContent === text);
/** A card's sheet opened, at its address on Waiting. */
export const openSheet = (app, key) => app.go(`#/waiting/card/${encodeURIComponent(key)}`);

// ---------------------------------------------------------------------------
// VT2_OPENS: the screens VT2's cascade checks walk (tests/desk/ac88-dark.test.mjs), page loads kept few (the suite's
// memory: two), each [where, open() → app, [[hash, prepare(app)?]]]. Made up, NOT real.

const tapText = async (app, text) => { for (const b of buttonText(app, text)) await app.tap(b); };
export const VT2_OPENS = [
  ['every kind (made up): each kind\'s sheet with "Didn\'t need me", then marked', () => vt2Open(everyKind({ portfolio: false })),
    [[`#/waiting/card/${encodeURIComponent(KEYS.card)}`], [`#/waiting/card/${encodeURIComponent(KEYS.question)}`], [`#/waiting/card/${encodeURIComponent(KEYS.gate)}`],
      [`#/waiting/card/${encodeURIComponent(KEYS.card)}`, (app) => tapText(app, "Didn't need me")],
      [`#/waiting/card/${encodeURIComponent(KEYS.question)}`, (app) => tapText(app, "Didn't need me")]]],
  ['storage throwing (made up): Service-Desk\'s targets\' sheet, "Not noted on this device"', () => {
    const store = memStore();
    store.throws = true;
    return vt2Open(targetsState(), { hash: '#/p/Service-Desk/values', now: TARGETS_NOW, store });
  }, [['#/p/Service-Desk/values']]],
];
