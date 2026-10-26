// The fixture states of stage QW2 of "After the questions request" (spec S-001, AC95, the places; the amendment's stage note:
// "from QW2, for two-digit places (each project numbered on its own, answer 1), one project with at least ten cards waiting,
// as CS31's picture has Service-Desk with twelve (settled from QW1's build, point 6; C)", with "cards with no raised time;
// and a portfolio card" among the made-up additions). Every pull request, question, card, status file, mark and portfolio
// card added below is made up, NOT a real record: no owner was asked any of them, no agent opened any of them. Each is
// labelled NOT real in tests/desk/fixtures/README.md.
//
// - `qw2BusiestState`: QW1's busiest state (md-extremes/, AC42's five projects, with QW1's five made-up questions, one held
//   and Beta's kicked back; tests/desk/qw1-fixtures.mjs), and to it: Alpha brought to twelve cards waiting (two-digit
//   places): three more made-up pull requests (#81, #82, #83, each opened at its own made-up time), a second made-up
//   question (`questions/Alpha-second.md`), a deploy waiting for its approval (Alpha's `deploysNeedOwner`, md-extremes/'s
//   own waiting `desk-deploy` run, no raised time) and a card that went missing (a made-up status file naming card
//   criteria-2, no card file; no raised time), beside its pull request #80, its question, its Build-gate card, its decision
//   card, its hold card and its merge card (md-extremes/'s); the portfolio with two made-up cards (no raised time, AC87);
//   and kicked back on this device, besides Beta's question (QW1's), Alpha's pull request #82, Gamma's merge card and the
//   portfolio's first card, so the strip mixes three groups.
// - `stripState`: AC91 (f)'s strip-order case, rewritten for QW2 (reading (p)): `twoMix` (Service-Desk at 77bfeae, real,
//   with the made-up Alpha and Bravo), Bravo's made-up pull request #80 opened two days before NOW (Alpha's at md-extremes/'s
//   2026-10-06), and the portfolio with one made-up card; kicked back on this device, Alpha's pull request and gate card,
//   Bravo's pull request and hold card, and the portfolio's card (and Bravo's question, which the section holds), each kicked at a made-up time chosen so the newest kick
//   first, the age order across projects and the strip's order (by project in J7's order, the portfolio's last, then
//   place) all differ: the projects' cards are out of age order with each other's (Alpha's pull request, Bravo's, then
//   Alpha's gate card by age).
// - `QW2_OPENS`: the screens QW2's cascade checks walk (tests/desk/ac88-dark.test.mjs), opened as the owner opens them.
import { pr } from './fake-desk.mjs';
import { CONFIG } from './helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { loadSandbox } from './sandbox-helpers.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { PF_BOARD } from '../../src/lib/portfolio.js';
import { busiestState, qFile, NOW } from './qw1-fixtures.mjs';
import { twoMixState, deviceMarks, CARD, MIX_PROJECT, MIX_PROJECT2 } from './glance-fixtures.mjs';
import { pfFiles, cardText, withPortfolio, addPortfolio } from './pf-fixtures.mjs';

export { NOW };
const H = 3600e3;
const MIN = 60e3;
const D = 24 * H;
const hist = (ms) => [{ commit: { committer: { date: new Date(ms).toISOString() } } }];
const iso = (ms) => new Date(ms).toISOString();

/** A made-up pull request on a made-up project (NOT real), opened at `at`, its head a builder's branch on the project. */
export const madePr = (project, n, title, at) => pr(n, `${title} (made up, NOT real)`, { head: `build/builder/qw2-${n}`, headRepo: `shumpmaster/${project}`, createdAt: iso(at) });

/** The portfolio's made-up cards (NOT real, pf-fixtures.mjs's card form), by file name. */
export const PF_CARDS = { 'PF-001-explore-1.md': cardText(1), 'PF-002-explore-1.md': cardText(1, 'Whether to park the made-up recipe app until spring') };
export const pfId = (file) => `${PF_BOARD}|portfolio|queue/${file}`;

/** The made-up status file of a card that went missing (no card file; model.js's `status-card`, AC80's "missing"). */
export const MISSING_STATUS = 'status/P-009.toml';
const MISSING = 'kind = "project"\nstage = 4\nstate = "waiting-owner"\nrole = "critic"\ngate = "criteria"\ncard = 2\n';
export const MISSING_ID = (project) => `${project}|missing-card|status/P-009.toml`;
export const Q_SECOND = 'questions/Alpha-second.md';

/** Alpha's twelve cards' ids in their places (AC95's age order: raised first, then no raised time by the AC73 key). */
export const ALPHA_TWELVE = [
  'Alpha|pr|83', // opened 9 days before NOW
  'Alpha|pr|80', // md-extremes/'s, 2026-10-06T12:00Z
  'Alpha|pr|81', // 3 days before NOW
  'Alpha|question|questions/Alpha-pick.md', // QW1's, 30 hours before NOW
  'Alpha|question|questions/Alpha-second.md', // 6 hours before NOW
  'Alpha|gate|queue/P-002-criteria-1.md', // md-extremes/'s dispatch log, 270 minutes before NOW
  'Alpha|card|queue/Q-020-stop-1.md', // 200 minutes before NOW
  'Alpha|pr|82', // 2 hours before NOW (kicked back here)
  // No raised time (C, (e)), by the AC73 key in code-unit order:
  'Alpha|deploy|1001', // md-extremes/'s waiting desk-deploy run
  'Alpha|hold|queue/ci-hold-4a2448939173.md',
  'Alpha|merge|queue/P-002-merge-conflict.md',
  'Alpha|missing-card|status/P-009.toml',
];

/**
 * QW2's busiest state (see above). `kicked`: the kicked-back marks; `held`: QW1's held question. Returns QW1's state
 * ({ config, repos, seed, store, fail }) with the additions.
 */
export function qw2BusiestState({ kicked = true, held = true } = {}) {
  const s = busiestState({ kicked, held });
  const a = s.repos.Alpha;
  a.pulls.push(madePr('Alpha', 81, 'Alpha: tidy the digest', NOW - 3 * D), madePr('Alpha', 82, 'Alpha: fix the badge after the phone wakes', NOW - 2 * H),
    madePr('Alpha', 83, 'Alpha: name the November sprint', NOW - 9 * D));
  a.commit({ [Q_SECOND]: qFile({ title: 'Which day should the weekly review run?', options: ['A. Monday.', 'B. Friday.'], rec: 'B — Friday.' }), [MISSING_STATUS]: MISSING });
  a.history[Q_SECOND] = hist(NOW - 6 * H);
  s.config = withPortfolio({ ...s.config, projects: s.config.projects.map((p) => (p.name === 'Alpha' ? { ...p, deploysNeedOwner: true } : p)) });
  addPortfolio(s.repos, pfFiles({ queue: PF_CARDS }));
  const marks = JSON.parse(s.seed['desk-board-marks-v1']).marks;
  if (kicked) {
    const extra = JSON.parse(deviceMarks([
      { project: 'Alpha', kind: 'pr', id: 'Alpha|pr|82', at: NOW - 20 * MIN, kickedAt: NOW - 12 * MIN, title: 'Alpha: fix the badge after the phone wakes (made up, NOT real)' },
      { project: 'Gamma', kind: 'merge', at: NOW - 30 * MIN, kickedAt: NOW - 20 * MIN },
      { project: PF_BOARD, kind: 'card', id: pfId('PF-001-explore-1.md'), at: NOW - 40 * MIN, kickedAt: NOW - 30 * MIN, title: 'Whether to explore the made-up reading-list app as a project' },
    ])['desk-board-marks-v1']).marks;
    for (const [id, m] of Object.entries(extra)) {
      // deviceMarks numbers a pull request #80; #82 is its own.
      marks[id] = id === 'Alpha|pr|82' ? { ...m, number: 82 } : id.startsWith(`${PF_BOARD}|`) ? { ...m, kind: 'portfolio', step: 'open' } : m;
    }
  }
  s.seed = { 'desk-board-marks-v1': JSON.stringify({ v: 1, marks }) };
  s.store = (extra = {}) => memStore({ ...s.seed, ...extra });
  return s;
}

/**
 * AC91 (f)'s strip-order state, rewritten for QW2 (see above). Kicked, newest first: the portfolio's card (1 minute before
 * NOW), Bravo's hold card (2), Alpha's gate card (3), Bravo's pull request (4), Alpha's pull request (5).
 */
export const STRIP_KICKS = [
  { project: PF_BOARD, kind: 'card', id: pfId('PF-001-explore-1.md'), at: NOW - 8 * MIN, kickedAt: NOW - 1 * MIN, title: 'Whether to explore the made-up reading-list app as a project' },
  { project: MIX_PROJECT2, kind: 'hold', at: NOW - 9 * MIN, kickedAt: NOW - 2 * MIN },
  { project: MIX_PROJECT, kind: 'gate', at: NOW - 10 * MIN, kickedAt: NOW - 3 * MIN },
  { project: MIX_PROJECT2, kind: 'pr', at: NOW - 11 * MIN, kickedAt: NOW - 4 * MIN },
  { project: MIX_PROJECT, kind: 'pr', at: NOW - 12 * MIN, kickedAt: NOW - 5 * MIN },
  // A kicked-back question goes to the "Questions for you" section, never the strip (AC94, reading (a)).
  { project: MIX_PROJECT2, kind: 'question', at: NOW - 13 * MIN, kickedAt: NOW - 6 * MIN },
];
export function stripState() {
  const s = twoMixState();
  const b = s.repos[MIX_PROJECT2];
  b.pulls = b.pulls.map((p) => (p.number === 80 ? { ...p, created_at: iso(NOW - 2 * D) } : p));
  s.config = withPortfolio(s.config);
  addPortfolio(s.repos, pfFiles({ queue: { 'PF-001-explore-1.md': PF_CARDS['PF-001-explore-1.md'] } }));
  const raw = JSON.parse(deviceMarks(STRIP_KICKS)['desk-board-marks-v1']);
  const pf = pfId('PF-001-explore-1.md');
  raw.marks[pf] = { ...raw.marks[pf], kind: 'portfolio', step: 'open' };
  s.seed = { 'desk-board-marks-v1': JSON.stringify(raw) };
  return s;
}
/** The strip's order in `stripState`: by project in J7's order (Alpha, Bravo), the portfolio's last, then place. */
export const STRIP_ORDER = [CARD.pr(MIX_PROJECT), CARD.gate(MIX_PROJECT), CARD.pr(MIX_PROJECT2), CARD.hold(MIX_PROJECT2), pfId('PF-001-explore-1.md')];

/** A screen opened as QW1's are: "last looked" late (nothing new), the first reads, then three polls. */
export async function qw2Open(setup, hash, { store = null } = {}) {
  const app = await loadSandbox({ ...setup, hash, now: NOW, store: store || memStore({ 'desk-seen-v1': JSON.stringify({ lastLooked: NOW + H }), ...(setup.seed || {}) }) });
  await app.advance(1000);
  await app.advance(POLL_MS);
  await app.advance(POLL_MS);
  return app;
}

/**
 * QW2's screens (each made-up part NOT real), for the cascade checks (tests/desk/ac88-dark.test.mjs): the busiest board, its
 * place lines on every kind of card (two-digit places in Alpha, the held question's line, the strip's three groups, the
 * portfolio's), and a card's sheet with its place in its small line.
 */
export const QW2_OPENS = [
  ['Waiting, the busiest case with two-digit places', () => qw2Open(qw2BusiestState(), '#/waiting')],
  ['a pull request\'s sheet over Waiting, its place in its small line', () => qw2Open(qw2BusiestState(), `#/waiting/card/${encodeURIComponent('Alpha|pr|81')}`)],
];
export { CONFIG };
