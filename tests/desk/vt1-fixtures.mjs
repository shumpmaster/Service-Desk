// VT1's fixtures (spec S-001, AC97 and J25; stage VT1 of "The desk's value targets shown: M3B"): Service-Desk's section 3
// and 6 lines as CS36 left them at 7b69b2b (tests/desk/fixtures/j11-7b69b2b/, real) over its other records at 77bfeae
// (j11-77bfeae/, real), and the made-up parts each test adds, every one NOT a real record and labelled so in
// tests/desk/fixtures/README.md: an M3C line with ` · reached:` (the approved picture's made-up launch day, Wed 2 Dec 2026,
// not a plan), J25 lines in every state and awkward case, dispatch-log cards inside and outside the 14 days (one open at the
// window's end, one answered after it), and other v3 projects with targets (one with no J25 line, one whose ids don't run
// in order, one with a long target line, one with no `V<n>:` line). Personal-Org-Operating-Model in poom/'s placeholder form.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIX, CONFIG } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { j77Files, poomFiles, memStore, SD, POOM, TZ } from './wa-fixtures.mjs';
import { fullRepo, v3 } from './sandbox-fixtures.mjs';
import { j11Files, loadSandbox, findAll as findAllEls } from './sandbox-helpers.mjs';

export { SD, POOM, TZ };
/** Service-Desk's docs/PROJECT.md at 7b69b2b, as CS36 left section 6 (real). */
export const J7B_DOC = readFileSync(join(FIX, 'j11-7b69b2b', 'docs', 'PROJECT.md'), 'utf8');
/** Section 6's `V<n>:` lines at 7b69b2b, word for word. */
export const J7B_LINES = J7B_DOC.split('\n').filter((l) => /^V\d+:/.test(l));

/** The approved picture's made-up launch day (NOT a plan; P-001-m3b-launch-date.md, A: launch has no date). */
export const LAUNCH = '2026-12-02';
/** M3C's line given ` · reached: <day>` (made up, NOT a real record). */
export const withLaunch = (doc, day = LAUNCH) => doc.replace(/^(- The desk live at the needs-you address \(M3C\) · done when .* · phase: Launch)$/m, `$1 · reached: ${day}`);
/** A time in Chicago's winter (UTC-6): `day` at `hh:mm` local, as a UTC time. */
export const chi = (day, hhmm = '12:00') => {
  const [h, m] = hhmm.split(':').map(Number);
  return Date.parse(`${day}T00:00:00Z`) + ((h + 6) * 60 + m) * 60e3;
};
export const isoZ = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');

const FIGURE = { V1: (v) => `${v} missed`, V2: (v) => `${v} false alarm${v === 1 ? '' : 's'}`, V3: (v) => `${v} minutes, your estimate`,
  V4: () => 'Operations-Hub archived at launch', V5: (v) => `${Math.floor(v / 60)}h ${String(v % 60).padStart(2, '0')}m median, 4 cards` };
/**
 * One J25 line (NOT a real record): its figure words made up from the value unless given; `session` and `source` made up.
 * `at` is the check's time (ms), by default the Monday after `to`, 09:00 in Chicago.
 */
export function vc({ target, from, to, value = null, state = 'on track', figure = null, at = null, project = 'Service-Desk', source = null, session = 'session_made_up_for_vt1', raw = null }) {
  const time = at != null ? (typeof at === 'string' ? at : isoZ(at)) : isoZ(chi(mondayAfter(to), '09:00'));
  const f = figure != null ? figure : value == null ? (target === 'V4' ? FIGURE.V4() : 'not measured this week') : (FIGURE[target] || ((v) => `${v}`))(value);
  const line = { time, project, target, from, to, figure: f, value, state, source: source || `metrics/service-desk/made-up-${from}.md`, session };
  return JSON.stringify(raw ? { ...line, ...raw } : line);
}
const mondayAfter = (day) => {
  const d = new Date(`${day}T00:00:00Z`);
  const wd = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() + (7 - wd) * 864e5).toISOString().slice(0, 10);
};
export const jsonl = (lines) => (lines.length ? `${lines.join('\n')}\n` : '');

// ---------------------------------------------------------------------------
// The approved picture's made-up checks (NOT real records), launch Wed 2 Dec: the 14 days are 3 to 16 Dec

/** Day 5 (Mon 7 Dec), the first weekly check in, one target outside: V2 had 2 false alarms (the picture's day-5 sheet). */
export const DAY5 = [
  vc({ target: 'V1', from: '2026-12-03', to: '2026-12-06', value: 0, state: 'on track' }),
  vc({ target: 'V2', from: '2026-12-03', to: '2026-12-06', value: 2, state: 'missed' }),
  vc({ target: 'V3', from: '2026-12-03', to: '2026-12-06', value: 20, state: 'on track' }),
  vc({ target: 'V4', from: '2026-12-02', to: '2026-12-02', value: null, state: 'met' }),
  vc({ target: 'V5', from: '2026-12-03', to: '2026-12-06', value: 110, state: 'on track' }),
];
/** The three weeks' checks and the last (dated 21 Dec): V2 missed, the rest met (the picture's after-14-days sheet). */
export const FINAL = [
  ...DAY5,
  vc({ target: 'V1', from: '2026-12-07', to: '2026-12-13', value: 0, state: 'on track' }),
  vc({ target: 'V2', from: '2026-12-07', to: '2026-12-13', value: 1, state: 'missed' }),
  vc({ target: 'V3', from: '2026-12-07', to: '2026-12-13', value: 25, state: 'on track' }),
  vc({ target: 'V5', from: '2026-12-07', to: '2026-12-13', value: 125, state: 'on track' }),
  vc({ target: 'V1', from: '2026-12-14', to: '2026-12-16', value: 0, state: 'met', at: chi('2026-12-21', '09:00') }),
  vc({ target: 'V2', from: '2026-12-14', to: '2026-12-16', value: 0, state: 'missed', at: chi('2026-12-21', '09:00') }),
  vc({ target: 'V3', from: '2026-12-14', to: '2026-12-16', value: 15, state: 'met', at: chi('2026-12-21', '09:00') }),
  vc({ target: 'V5', from: '2026-12-03', to: '2026-12-16', value: 140, state: 'met', figure: '2h 20m median, 21 cards', at: chi('2026-12-21', '09:00') }),
];

// ---------------------------------------------------------------------------
// Cards in the dispatch log (NOT real records): item Q-901's failure cards, raised and answered at made-up times

/**
 * A month's dispatch-log lines for made-up cards: each { n, raised (ms), answered (ms) | null }, item Q-901, gate failure;
 * an answered card gets its decision line; an open one its card file in queue/ (the `files` returned).
 */
export function cardsLog(cards, item = 'Q-901') {
  const lines = [];
  const files = {};
  for (const c of cards) {
    lines.push({ action: 'card', card: c.n, gate: 'failure', item, reason: 'Made up for VT1 (NOT a real record).', role: 'researcher', route: 'attempts', stage: 2,
      time: isoZ(c.raised), trigger: 'x' });
    if (c.answered != null) {
      lines.push({ card: c.n, gate: 'failure', item, proxy: false, record: `decisions/${item}/failure-${c.n}.md`, result: 'closed/2/researcher', time: isoZ(c.answered), trigger: 'decision', word: 'drop' });
      files[`decisions/${item}/failure-${c.n}.md`] = 'Verdict: drop\n\nMade up for VT1 (NOT a real record).\n';
    } else files[`queue/${item}-failure-${c.n}.md`] = `# Research ${item} failed: retry, re-specify or drop?\n\nMade up for VT1 (NOT a real record).\n`;
  }
  lines.sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
  return { log: lines.map((o) => JSON.stringify(o)).join('\n') + (lines.length ? '\n' : ''), files };
}
const H = 3600e3;
/**
 * The window's made-up cards (3 to 16 Dec): 21 weekday cards, each raised at 09:00 Chicago and answered after its wait
 * within the counted hours; one raised on launch day (outside the window), one open at the window's end (raised 16 Dec
 * 10:00, never answered) and one answered after it (raised 16 Dec 09:00, answered 18 Dec 09:00).
 */
export function windowCards() {
  const days = ['2026-12-03', '2026-12-04', '2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10', '2026-12-11', '2026-12-14', '2026-12-15'];
  const waits = [1, 2, 2.5, 1.5, 3, 2, 2.25, 2.5, 1, 2.75, 2.25, 3.5, 1.75, 2.5, 2.25, 3, 2.25, 2, 2.5];
  const cards = [{ n: 1, raised: chi('2026-12-02', '09:00'), answered: chi('2026-12-02', '20:00') }];
  let n = 2;
  for (let i = 0; i < waits.length; i++) {
    const day = days[i % days.length];
    const raised = chi(day, i < days.length ? '09:00' : '13:00');
    cards.push({ n: n++, raised, answered: raised + waits[i] * H });
  }
  cards.push({ n: n++, raised: chi('2026-12-16', '09:00'), answered: chi('2026-12-18', '09:00') });
  cards.push({ n: n++, raised: chi('2026-12-16', '10:00'), answered: null });
  return cards;
}
/** Nine made-up weekday cards before launch (16 to 27 Nov), for AC21's figure before W1. */
export function novemberCards() {
  const days = ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-23', '2026-11-24', '2026-11-25', '2026-11-27'];
  const waits = [1, 1.2, 0.5, 2, 1.5, 0.8, 1.2, 3, 1.1];
  return days.map((d, i) => ({ n: 100 + i, raised: chi(d, '10:00'), answered: chi(d, '10:00') + waits[i] * H }));
}

// ---------------------------------------------------------------------------
// The other v3 projects (NOT real records)

/** A made-up section 6 put in place of the 3117150 doc's own, in a made-up project's docs/PROJECT.md. */
export function docWithTargets(lines) {
  const base = j11Files()['docs/PROJECT.md'];
  const i = base.indexOf('\n## 6.');
  const j = base.indexOf('\n## 7.', i + 1);
  return `${base.slice(0, i)}\n## 6. Value and stop rule\n*Made up for VT1 (NOT a real record).*\n\n${lines.join('\n')}\n${base.slice(j)}`;
}
export const ALPHA_TARGETS = ['V1: Signups: members who sign up from the page, 20 in the first month (made up)',
  'V2: Bounce: share of first issues that bounce, under 2% (made up)', 'V3: Upkeep: under 1 hour a week (made up)'];

/**
 * VT1's state for the page: Service-Desk (7b69b2b's section 3 and 6 over 77bfeae's records) launched on `launch` (or not,
 * with null), with the J25 `lines` (null: no file), the dispatch log's December and November `cards`, and `alpha`, a
 * made-up v3 project's section 6 lines (null: no such project).
 */
export function vt1State({ launch = LAUNCH, lines = null, cards = [], nov = [], alpha = null, extra = {}, alphaExtra = {} } = {}) {
  const files = { ...j77Files(), 'docs/PROJECT.md': launch ? withLaunch(J7B_DOC, launch) : J7B_DOC };
  if (lines) files['intake/value-checks.jsonl'] = jsonl(lines);
  const dec = cardsLog(cards);
  const nv = cardsLog(nov);
  if (cards.length) Object.assign(files, { 'dispatch-log/2026-12.jsonl': dec.log }, dec.files);
  if (nov.length) Object.assign(files, { 'dispatch-log/2026-11.jsonl': nv.log }, nv.files);
  Object.assign(files, extra);
  const repos = { 'Service-Desk': repo(files), 'Personal-Org-Operating-Model': repo(poomFiles()) };
  const projects = [SD, POOM];
  if (alpha) {
    const a = fullRepo('Alpha');
    a.commit({ 'docs/PROJECT.md': docWithTargets(alpha), ...alphaExtra });
    repos.Alpha = a;
    projects.push(v3('Alpha'));
  }
  return { config: { ...CONFIG, ownerTimeZone: TZ, projects }, repos };
}

// ---------------------------------------------------------------------------
// VT1_OPENS: the screens VT1's cascade checks walk (tests/desk/ac88-dark.test.mjs), each a page load (the suite's memory:
// three), with the screens in it to read: [where, open() → app, [[hash, prepare(app)?]]]. Made up, NOT real.

async function vt1Open(st, now, hash) {
  const app = await loadSandbox({ ...st, hash, now, store: memStore() });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}
const keyedEl = (app, k) => findAllEls(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const tapText = async (app, text) => { for (const b of findAllEls(app.view, (e) => e.tag === 'button' && e.textContent === text)) await app.tap(b); };
/** The stop rule's quote measured past three lines (the fake DOM lays out no text) and opened with "Read it all". */
async function stopOpened(app) {
  const c = keyedEl(app, 'clip:vt-stop:Service-Desk');
  if (!c) return;
  c.clientHeight = 57;
  c.scrollHeight = 95;
  await app.resize(360);
  const more = keyedEl(app, 'clipbtn:vt-stop:Service-Desk');
  if (more) await app.tap(more);
}
export const VT1_OPENS = [
  ['before launch (made up: no reached date): the row and the sheet, V5 grey', () => vt1Open(vt1State({ launch: null, nov: novemberCards() }), chi('2026-11-27', '15:00'), '#/p/Service-Desk'),
    [['#/p/Service-Desk'], ['#/p/Service-Desk/values']]],
  ['day 5 (made up): one target outside, the whole targets opened, the stop rule cut and opened', () => vt1Open(vt1State({ lines: DAY5, cards: windowCards() }), chi('2026-12-07', '15:00'), '#/p/Service-Desk'),
    [['#/p/Service-Desk'], ['#/p/Service-Desk/values', async (app) => { await tapText(app, 'The whole target'); }], ['#/p/Service-Desk/values', stopOpened]]],
  ['after the 14 days (made up): one missed, the earlier checks opened; Alpha, another v3 project, with a check', () => vt1Open(vt1State({ lines: [...FINAL,
    vc({ target: 'V1', project: 'Alpha', from: '2026-11-30', to: '2026-12-06', value: 14, figure: '14 signups', state: 'missed' })], cards: windowCards(), alpha: ALPHA_TARGETS }),
  chi('2026-12-24', '15:00'), '#/p/Service-Desk'),
  [['#/p/Service-Desk'], ['#/p/Service-Desk/values', async (app) => { await tapText(app, '2 earlier checks'); }], ['#/p/Alpha'], ['#/p/Alpha/values']]],
];
