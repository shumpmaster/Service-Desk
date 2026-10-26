// The fixture states of stage QW1 of "After the questions request" (spec S-001, AC94; the amendment's stage note: "The
// fixtures are the committed ones (j11-77bfeae for Service-Desk, md-extremes/, tests/desk/fake-desk.mjs's in-memory
// repositories, as AC80's and AC91's tests use them) and made-up additions, each labelled NOT real in
// tests/desk/fixtures/README.md: lettered, numbered, can't-split and v2.5 questions, with and without saved words; a
// question held as asked in a session …; long titles and choices"). Every question file below is made up, NOT a real
// record: no owner was asked any of them. Each is in questions/_TEMPLATE.md's form (J2), as a v3 or a v2.5 project files it.
//
// - `busiestState`: md-extremes/ (AC42's five connected projects, twelve waits; NOT real records), each project's own
//   question replaced by a made-up one of four to six choices (the stage note's "five questions of four to six choices"):
//   Alpha's lettered with a `Milestone:` line and "Can't be undone"; Beta's lettered with a clock, and a sixth question held
//   as being asked in a session (AC77; not counted, so still twelve waits); Gamma's numbered; Delta's v2.5 (copied for the
//   session, AC19); Epsilon's md-extremes/ long title with six long choices. With `kicked`, Beta's question marked done on
//   this device and kicked back (deviceMarks' form); `fail()` makes Delta's reads fail after its first read (AC89 (a)'s
//   state 5), so the section's grey line and the red quiet line both show.
// - `kindsState`: one v3 project ("Kinds") and one v2.5 project ("Ledger"), with a lettered question with and without a
//   `Milestone:` line, a numbered one, one that can't be split, one with no `OPTIONS:` block, a v2.5 one with letters and one
//   without, for AC94's link and copy cases.
// - `QW1_OPENS`: the screens QW1's cascade checks walk (below), opened as the owner opens them.
import { repo } from './fake-desk.mjs';
import { CONFIG, fixture } from './helpers.mjs';
import { extremes, v3, v25, NOW } from './sandbox-fixtures.mjs';
import { memStore } from './wa-fixtures.mjs';
import { loadSandbox, findAll } from './sandbox-helpers.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';

export { NOW };
const H = 3600e3;
const MIN = 60e3;
const hist = (ms) => [{ commit: { committer: { date: new Date(ms).toISOString() } } }];
export const SID = 'session_0QW1MadeUpNotARealSession01';

/** A made-up question file (NOT real), v3 or v2.5 form: its title, options, recommendation and the rest. */
export function qFile({ title, options = null, rec = null, milestone = null, asked = null, rev = 'reversible', def = 'none', timeout = 'none', why = 'made up, NOT a real question (QW1\'s fixtures).' }) {
  const head = [`# Ruling needed: ${title}`, ''];
  if (milestone) head.push(`Milestone: ${milestone}`);
  if (asked) head.push(`Asked in session: ${asked}`);
  const body = [`WHY: ${why}`];
  if (options) body.push('OPTIONS:', ...options.map((o) => `  ${o}`));
  if (rec) body.push(`RECOMMENDATION: ${rec}`);
  body.push('RISK CLASS: R0', `REVERSIBILITY: ${rev}`, 'BLAST RADIUS: this desk only', `DEFAULT: ${def}`, `TIMEOUT: ${timeout}`);
  return `${[...head, ...body].join('\n')}\n`;
}

// The busiest state's questions (made up, NOT real).
export const Q_ALPHA = qFile({ title: 'Should pull requests that only change records merge without you?', milestone: 'M3G', rev: 'irreversible',
  options: ['A. No, as now — you merge every one.', 'B. Yes, records only — the automatic job merges them once every check passes.', 'C. Yes, but tell me each time.',
    'D. Only answer records.', 'E. Ask me again after the launch.'], rec: 'B — records only.' });
export const Q_BETA = qFile({ title: 'How long should Done keep its cards?', def: 'A', timeout: '48',
  options: ['A. 24 hours, as now.', 'B. 48 hours.', 'C. Until I clear them.', 'D. One week.'], rec: 'A — as now.' });
export const Q_HELD = qFile({ title: 'Should Plan show estimates in days or in weeks?', milestone: 'M3B', asked: SID, def: 'A', timeout: '72',
  options: ['A. Days, as now.', 'B. Weeks, rounded up.', 'C. Both, days first.', 'D. Neither — hide the estimates until the launch.'], rec: 'A — as now.' });
export const Q_GAMMA = qFile({ title: 'Three questions on the launch checklist', milestone: 'M3C',
  options: ['1. Who signs off the launch checklist? A. You alone · B. You and the Critic · C. The Critic alone · D. The checks alone',
    '2. Where does the checklist live? A. In the spec · B. Its own file · C. On the desk\'s Plan · D. In the launch gate\'s card · E. Wherever the Orchestrator keeps it',
    '3. What happens to an unticked item at launch? A. The launch waits · B. It ships with a note · C. It moves to the next milestone · D. You decide each one'],
  rec: '1 B; 2 B; 3 A' });
export const Q_DELTA = qFile({ title: 'Which day should the weekly digest go out?',
  options: ['A. Monday.', 'B. Wednesday.', 'C. Friday — the quietest day, read with coffee.', 'D. Sunday.'], rec: 'C — Friday.' });
export const Q_EPSILON = qFile({
  title: 'should the desk keep a supercalifragilisticexpialidociousverylongunbrokenwordthatcouldoverflowanarrowphonescreen in its title and still wrap on a 360 pixel screen without sideways scrolling?',
  options: ['A. Keep it — titles wrap.', 'B. Shorten it — a made-up long choice whose words run on well past one line at 360 px, so its box grows and its button stays beside it.',
    'C. Supercalifragilisticexpialidociousverylongunbrokenchoicewordthatcouldoverflow.', 'D. Cut it at three lines.', 'E. Ask the Design reviewer.', 'F. Let the Chief of Staff pick.'],
  rec: 'A — titles wrap.' });

/** The path of each project's own question in md-extremes/ (fullRepo's `<tag>-pick`, Delta's `Delta-1`), and the held one's. */
export const EXT_LONG = 'Epsilon-with-a-very-long-project-name-that-wraps';
export const QPATH = { Alpha: 'questions/Alpha-pick.md', Beta: 'questions/Beta-pick.md', Gamma: 'questions/Gamma-pick.md', Delta: 'questions/Delta-1.md',
  [EXT_LONG]: `questions/${EXT_LONG}-pick.md` };
export const HELD_PATH = 'questions/Beta-plan-units.md';
export const qid = (project, path) => `${project}|question|${path}`;

/** The busiest state (see above). `kicked`: Beta's question kicked back on this device; returns { config, repos, store, fail }. */
export function busiestState({ kicked = true, held = true } = {}) {
  const s = extremes();
  const put = (name, text, at) => {
    const r = s.repos[name];
    r.commit({ [QPATH[name]]: text });
    r.history[QPATH[name]] = hist(at);
  };
  put('Alpha', Q_ALPHA, NOW - 30 * H);
  put('Beta', Q_BETA, NOW - 20 * H);
  put('Gamma', Q_GAMMA, NOW - 5 * H);
  put('Delta', Q_DELTA, NOW - 50 * H);
  put(EXT_LONG, Q_EPSILON, NOW - 10 * MIN);
  if (held) {
    s.repos.Beta.commit({ [HELD_PATH]: Q_HELD });
    s.repos.Beta.history[HELD_PATH] = hist(NOW - 2 * H);
  }
  const marks = {};
  if (kicked) {
    marks[qid('Beta', QPATH.Beta)] = { project: 'Beta', step: 'answer', head: null, at: NOW - 9 * MIN, title: 'How long should Done keep its cards?',
      kicked: { at: NOW - 3 * MIN, reason: '' }, prevKick: null, confirmedAt: null, number: null, kind: 'question', name: 'Beta-pick' };
  }
  s.seed = { 'desk-board-marks-v1': JSON.stringify({ v: 1, marks }) };
  s.store = (extra = {}) => memStore({ ...s.seed, ...extra });
  s.fail = () => { s.repos.Delta.fail = { kind: 'network' }; };
  return s;
}

// The kinds' questions (made up, NOT real).
export const K = {
  lettered: 'questions/Kinds-lettered.md',
  bare: 'questions/Kinds-bare.md',
  numbered: 'questions/Kinds-numbered.md',
  split: 'questions/Kinds-split.md',
  none: 'questions/Kinds-none.md',
  v25: 'questions/Ledger-pick.md',
  v25none: 'questions/Ledger-plain.md',
};
export const K_FILES = {
  [K.lettered]: qFile({ title: 'Which colour should a kicked-back card\'s icon take?', milestone: 'M3G', options: ['A. Vermilion, as now — it still waits on you.', 'B. Grey.'], rec: 'A — as now.' }),
  [K.bare]: qFile({ title: 'Should the strip scroll by card or by page?', options: ['A. By card.', 'B. By page.', 'C. Not at all.'], rec: 'B' }),
  [K.numbered]: qFile({ title: 'Two questions on the digest', milestone: 'M3C', options: ['1. Which day? A. Monday · B. Friday', '2. Which hour? A. 08:00 · B. 18:00'], rec: '1 B; 2 A' }),
  [K.split]: qFile({ title: 'A question whose options can\'t be split', options: ['A. Keep the old form.', '2. Move it to a sheet.', '- or ask me later'] }),
  [K.none]: qFile({ title: 'A question with no options block' }),
};
export const K25_FILES = {
  [K.v25]: qFile({ title: 'Which sprint takes the digest?', options: ['A. This sprint.', 'B. The next one — after the launch.'], rec: 'B — the next one.' }),
  [K.v25none]: qFile({ title: 'What should the digest be called?', options: ['- Weekly digest', '- Friday notes'] }),
};
export const KINDS = 'Kinds';
export const LEDGER = 'Ledger';

/** `kindsState`: "Kinds" (v3) and "Ledger" (v2.5) holding K's questions, each raised at its own made-up time. */
export function kindsState({ linkCap = CONFIG.linkCap, kinds = {}, ledger = {} } = {}) {
  const k = repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), 'questions/_TEMPLATE.md': fixture('service-desk/questions/_TEMPLATE.md'), ...K_FILES },
    [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  Object.keys(K_FILES).forEach((p, i) => { k.history[p] = hist(NOW - (10 - i) * H); });
  Object.assign(k, kinds);
  const l = repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), ...K25_FILES }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]);
  Object.keys(K25_FILES).forEach((p, i) => { l.history[p] = hist(NOW - (3 - i) * H); });
  Object.assign(l, ledger);
  return { config: { ...CONFIG, linkCap, projects: [v3(KINDS), v25(LEDGER)] }, repos: { [KINDS]: k, [LEDGER]: l } };
}

/** Every closed fold in the "Questions for you" section opened, one tap each, as the owner opens them ("Show choices ›", "Add your own words"). */
export async function openFolds(app) {
  const closedFold = () => findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['aria-expanded'] === 'false' && /^fold:q(choices|words):/.test((e.dataset && e.dataset.k) || ''))[0];
  for (let b = closedFold(), i = 0; b && i < 50; b = closedFold(), i++) await app.tap(b);
}
/** A screen opened as QW1's screens are: "last looked" late (nothing new), the first reads, then `later()` and three polls. */
async function qw1Open(setup, hash, { store = null, later = null, folds = false } = {}) {
  const app = await loadSandbox({ ...setup, hash, now: NOW, store: store || memStore({ 'desk-seen-v1': JSON.stringify({ lastLooked: NOW + H }) }) });
  await app.advance(1000);
  await app.advance(POLL_MS);
  if (later) {
    later();
    await app.advance(3 * POLL_MS);
  }
  if (folds) await openFolds(app);
  return app;
}
const seen = (extra = {}) => memStore({ 'desk-seen-v1': JSON.stringify({ lastLooked: NOW + H }), ...extra });
/**
 * QW1's screens (each made-up part NOT real), for the cascade checks (tests/desk/ac88-dark.test.mjs) and the section's own
 * look cases: the busiest case with every fold opened, Delta read and then failing (the grey line and the red quiet line),
 * Beta's question kicked back and a question held; Beta alone shown; the held question's sheet; and every kind of question
 * (`kindsState`) with every fold opened, saved words kept for the lettered one.
 */
export const QW1_OPENS = [
  ['Waiting, the busiest case, every fold opened, Delta read and then failing', () => { const s = busiestState(); return qw1Open(s, '#/waiting', { store: seen(s.seed), later: s.fail, folds: true }); }],
  ['Waiting, Beta alone shown, its held and kicked-back questions', () => { const s = busiestState(); return qw1Open(s, '#/waiting/Beta', { store: seen(s.seed) }); }],
  ['the held question\'s sheet over Waiting', () => { const s = busiestState(); return qw1Open(s, `#/waiting/card/${encodeURIComponent(qid('Beta', HELD_PATH))}`, { store: seen(s.seed) }); }],
  ['Waiting, every kind of question, every fold opened', () => qw1Open(kindsState(), '#/waiting', {
    store: seen({ 'desk-sheet-words-v1': JSON.stringify({ v: 1, words: { [`${qid(KINDS, K.lettered)}#1`]: { text: 'Made-up words, NOT real.', at: NOW - MIN } } }) }), folds: true })],
];
