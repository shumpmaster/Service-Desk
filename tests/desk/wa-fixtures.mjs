// Work ahead's fixtures (spec S-001, AC24; J4, J14, J15): Service-Desk's real records at 77bfeae
// (tests/desk/fixtures/j11-77bfeae/, as J11 reads them), and the made-up plans, estimates, later-work
// lists, asks, questions and answers each test adds (NOT real records: each is written for the test,
// in the forms J4, J14 and J15 give, and tests/desk/fixtures/README.md labels them so).
// Personal-Org-Operating-Model appears only in poom/'s placeholder form.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { FIX, CONFIG, fixture } from './helpers.mjs';
import { repo, gitSha } from './fake-desk.mjs';
import { recordKind, parseRecord } from '../../src/lib/model.js';

export const J77_DIR = join(FIX, 'j11-77bfeae');
export const TZ = 'America/Chicago';

/** Service-Desk as J7 holds it, the planning project (`"planning": true`). */
export const SD = { name: 'Service-Desk', repo: 'shumpmaster/Service-Desk', defaultBranch: 'main', model: 'v3', planning: true,
  webCommitsToDefault: true, contentPrefill: true, contentParam: 'value' };
/** Personal-Org-Operating-Model, a v2.5 project (J7), read from poom/'s placeholder form only. */
export const POOM = { name: 'Personal-Org-Operating-Model', repo: 'shumpmaster/Personal-Org-Operating-Model', defaultBranch: 'main', model: 'v2.5',
  planning: false, webCommitsToDefault: true, contentPrefill: true, contentParam: 'value' };

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) walk(f, out);
    else out.push(f);
  }
  return out;
}

/** The 77bfeae fixture's files: { path: text } (its README, tree.txt and trace-notes.txt left out). */
export function j77Files() {
  const out = {};
  for (const f of walk(J77_DIR)) {
    const rel = relative(J77_DIR, f);
    if (['README.md', 'tree.txt', 'trace-notes.txt'].includes(rel)) continue;
    out[rel] = readFileSync(f, 'utf8');
  }
  return out;
}
export const j77Tree = () => readFileSync(join(J77_DIR, 'tree.txt'), 'utf8').trim().split('\n');
export const j77Notes = () => readFileSync(join(J77_DIR, 'trace-notes.txt'), 'utf8').trim().split('\n').map((l) => l.replace(/^NOTE: /, ''));

/** A snapshot as the page's reader holds it: the files given, parsed as their kinds (for the pure tests). */
export function snapOf(files, model = 'v3', history = new Map()) {
  const tree = new Map(Object.entries(files).map(([p, t]) => [p, { sha: gitSha(t), size: t.length }]));
  const records = new Map();
  for (const [p, t] of Object.entries(files)) {
    const k = recordKind(p, model);
    if (k) records.set(p, parseRecord(k, t, p));
  }
  return { tree, records, history, head: 'f'.repeat(40), pullPages: [], checkPages: [] };
}

/** poom/'s placeholder ledger and one open sprint, as at 90f53e3 (J9; no file of that project copied). */
export const poomFiles = (sprints = { 'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md') }) => ({
  'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), ...sprints,
});

// ---------------------------------------------------------------------------
// Made-up records (NOT real records)

/** One J14 line (NOT a real record). */
export const estLine = (milestone, low, high, time = '2026-10-18T17:00:00Z', note = '', project = 'Service-Desk') =>
  JSON.stringify({ time, project, milestone, low_days: low, high_days: high, note, session: 'session_made_up_for_tests' });

/** The worked example's estimates (AC24, step 6; the mockup's figures, NOT a real record): every one timed 2026-10-18T17:00:00Z. */
export const WORKED = (time = '2026-10-18T17:00:00Z') => [
  estLine('MD1', 0, 0, time), estLine('MD2', 0, 0, time), estLine('MD3', 3, 5, time, 'the trial view\'s last screens, then your acceptance'),
  estLine('M3A', 4, 7, time), estLine('M3B', 2, 4, time), estLine('M3C', 2, 3, time)].join('\n') + '\n';

/** J15's list as Setup CS20 gives its first lines (NOT a real record). */
export const LATER = `# Later work, not milestones yet
- Ask or jot box (W1) · one box on the desk to ask, instruct or note an idea · from: decisions/questions/P-001-trial-view-notes-2.md:164
- Upkeep fixes (W2) · read-access warning, M3B's criteria, more than five projects · from: decisions/questions/P-001-trial-view-notes-2.md:168
`;

/** A J4 plan's body, as the page writes it (NOT a real record). */
export const planText = (name, ids, supersedes = 'none', project = 'Service-Desk') =>
  `Plan: ${name}\nSupersedes: ${supersedes}\n\n| Order | Project | Milestone |\n|---|---|---|\n${ids.map((id, i) => `| ${i + 1} | ${project} | ${id} |`).join('\n')}\n`;

/** A local storage in memory, as the browser's (its `throws` makes every call fail, as a blocked one does). */
export function memStore(init = {}) {
  const m = new Map(Object.entries(init));
  const s = {
    throws: false, m,
    getItem(k) { if (s.throws) throw new Error('blocked'); return m.has(k) ? m.get(k) : null; },
    setItem(k, v) { if (s.throws) throw new Error('blocked'); m.set(k, String(v)); },
    removeItem(k) { if (s.throws) throw new Error('blocked'); m.delete(k); },
  };
  return s;
}

/** The sandbox's setup: Service-Desk at 77bfeae plus `extra` files, and Personal-Org-Operating-Model in poom/'s form. */
export function waSetup({ extra = {}, sd = SD, poom = poomFiles(), projects = null } = {}) {
  const files = { ...j77Files(), ...extra };
  const repos = { 'Service-Desk': repo(files), 'Personal-Org-Operating-Model': repo(poom) };
  return { config: { ...CONFIG, ownerTimeZone: TZ, projects: projects || [sd, POOM] }, repos };
}

// ---------------------------------------------------------------------------
// Work ahead's view (src/lib/workview.js), built as the sandbox builds it, without the page.

import { j11Records, timelineOf, phaseView } from '../../src/lib/sandbox.js';
import { runsContext } from '../../src/lib/feed.js';
import { buildModel } from '../../src/lib/model.js';
import { workAheadView } from '../../src/lib/workview.js';

/**
 * The view for Service-Desk's 77bfeae records plus `extra` (made-up planning records), with
 * Personal-Org-Operating-Model from poom/'s placeholder form; `history`: path → { oldest } for
 * Service-Desk; `rows`: the Queue's rows for Service-Desk; `omit`: paths left unread (a failed read).
 */
export function viewOf({ extra = {}, nowMs, draft = null, projects = [SD, POOM], poom = poomFiles(), rows = [], history = new Map(), omit = [], linkCap = 6000 }) {
  const config = { ...CONFIG, ownerTimeZone: TZ, linkCap, projects };
  const snaps = new Map();
  const entries = projects.map((project) => {
    if (project.model !== 'v3') {
      const s = snapOf(poom, 'v2.5');
      snaps.set(project.name, s);
      const model = buildModel({ project, config, now: new Date(nowMs), tree: s.tree, records: s.records, history: s.history, pullPages: [], checkPages: [],
        checksState: 'ok', withdrawn: [] });
      return { project, j: null, ctx: null, rows: [], model };
    }
    const s = snapOf({ ...j77Files(), ...extra }, 'v3', history);
    for (const p of omit) s.records.delete(p);
    snaps.set(project.name, s);
    const j = j11Records(project, s);
    const tl = timelineOf(j);
    const pv = phaseView(project, tl, s.tree, j);
    const ctx = runsContext(project, s, j, tl, pv, nowMs, TZ);
    return { project, j, ctx, rows, model: null };
  });
  return workAheadView({ config, entries, snaps, nowMs, tz: TZ, draft });
}
/** Each row's code and rough finish's words, in the order shown. */
export const finishes = (v) => v.rows.map((r) => [r.code, r.finish ? r.finish.words : null]);
