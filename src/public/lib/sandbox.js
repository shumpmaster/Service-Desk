// The MD sandbox's view model (spec S-001, AC35–AC41, AC48–AC53; J11). Pure: from one project's
// read model (model.js), its records as last read (scheduler's desk.snapshot) and the clock, what
// each sandbox screen shows. No network, no DOM; the page (public/sandbox.js) only draws this.
//
// The one rule everywhere (AC41): a value no record gives shows its words ("not recorded", "not
// available") or "–" with the reason, never a value of the desk's own, a zero, or a bar sized by a
// fraction. Codes come after the plain words.

import { isOwnerRuling } from './model.js';
import { STATUS_RE, LOG_RE, MERGES_PATH, parseCardPath, questionAnswerName, parseWorkflowRuns, stageName, entryWords,
  OUTCOMES_PATH, ROUTING_PATH, entryShape, timeLimitMinutes, parseAnswerPath, firstMilestoneLine } from './records.js';
import { PROJECT_DOC_PATH, SURFACES_PATH, ORCH_WORKFLOW_PATH, SPEC_PATH_RE, REQUEST_PATH_RE, HANDOVER_PREFIX,
  HANDOVER_TEMPLATE, GATE_PHASE, GATE_WORDS, isGroundwork, nextCronRun, README_PATH } from './j11.js';
import { buildTimeline, DESK_PHASES, PHASE_OF_STAGE } from './timeline.js';
import { durationText, whenText, dayKey, hhmm } from './timefmt.js';
import { newFileUrl, cappedNewFileLink, tidyNote, HOLD_NO_ANSWER, mergeNoAnswer, V25_RULING_NOTE, webCommitsWarning } from './links.js';
import { STALE_MS } from './scheduler.js';
import { cosSessions, helperLines, latestEndAt, ENDED_UNRECORDED } from './cos.js';
import { runTimeText, costText } from './asked.js';

export const NOT_RECORDED = 'not recorded';
export const NOT_AVAILABLE = 'not available';
export const V25_NOT_RECORDED = "not recorded in this repository's records (operating model v2.5.1)";
export const SANDBOX_MARKER = 'Sandbox: candidate design';
export const JUST_FINISHED_MS = 30 * 60e3; // AC49: "Just finished" for 30 minutes (C, to tune in the lab)
export const OWNER_NEXT_LINES = 3; // AC49: the owner's tile shows the next 3 queue lines (C)

/**
 * AC50: "Done", never "Graduated", as a label on the screen. Applied to the model's milestone names
 * the desk draws from its table (Launch-5 is "Graduated" there); record text (log lines, cards,
 * questions, pull-request titles) is always drawn exactly as written.
 */
export const deskWords = (s) => String(s).replace(/\bGraduated\b/g, 'Done');

const enc = (s) => String(s).split('/').map(encodeURIComponent).join('/');
export const fileLink = (project, path) => `https://github.com/${project.repo}/blob/${enc(project.defaultBranch)}/${enc(path)}`;
export const pullLink = (project, n) => `https://github.com/${project.repo}/pull/${n}`;
export const commitLink = (project, sha) => `https://github.com/${project.repo}/commit/${sha}`;
/** A file link only when the tree holds the path (AC51's link rule, J11); otherwise null. */
export const treeLink = (project, tree, path) => (path && tree && tree.has(path) ? fileLink(project, path) : null);
const t = (ms) => (typeof ms === 'string' ? Date.parse(ms) : ms instanceof Date ? ms.getTime() : ms);

// ---------------------------------------------------------------------------
// J11's records, gathered from the snapshot

/**
 * The records the timeline and the screens read (J11), with `ready` false until every one the tree
 * holds has arrived (they are optional reads: until then only these views say "not available").
 */
export function j11Records(project, snap) {
  const tree = snap && snap.tree;
  const records = (snap && snap.records) || new Map();
  if (!tree || project.model !== 'v3') return { ready: false, tree: tree || new Map(), missing: ['the tree'] };
  const missing = [];
  const get = (path) => {
    if (!tree.has(path)) return null;
    const r = records.get(path);
    if (r === undefined) missing.push(path);
    return r === undefined ? null : r;
  };
  const projectDoc = get(PROJECT_DOC_PATH);
  const logRows = [];
  const logSource = []; // the month file of each row, for AC51's anomaly and retry links
  const logPaths = [...tree.keys()].filter((p) => LOG_RE.test(p)).sort();
  for (const p of logPaths) {
    const r = get(p);
    for (const row of (r && r.rows) || []) {
      logRows.push(row);
      logSource.push(p);
    }
  }
  const statuses = {};
  for (const p of [...tree.keys()].sort()) {
    const m = STATUS_RE.exec(p);
    if (!m || !/^[PQE]-[0-9]{3,}$/.test(m[1])) continue;
    const r = get(p);
    if (r) statuses[m[1]] = r.fields;
  }
  const mergesRec = get(MERGES_PATH);
  const specs = {};
  for (const p of [...tree.keys()].filter((x) => SPEC_PATH_RE.test(x) && !x.startsWith('specs/_')).sort()) {
    const r = get(p);
    if (r && r.id && !specs[r.id]) specs[r.id] = r;
  }
  const groundwork = [];
  for (const p of [...tree.keys()].filter((x) => REQUEST_PATH_RE.test(x)).sort()) {
    const r = get(p);
    if (r && isGroundwork(r)) groundwork.push(REQUEST_PATH_RE.exec(p)[1]);
  }
  const groundworkRulings = {};
  for (const p of tree.keys()) {
    if (!/^decisions\/questions\/P-[0-9]+-(groundwork|discovery)\.md$/.test(p)) continue;
    const r = get(p);
    if (r) groundworkRulings[p] = r.ruling != null;
  }
  const handoverFiles = [...tree.keys()].filter((p) => p.startsWith(HANDOVER_PREFIX) && p !== HANDOVER_TEMPLATE).sort();
  const surfaces = get(SURFACES_PATH);
  const routing = records.get(ROUTING_PATH) || null;
  const workflow = get(ORCH_WORKFLOW_PATH);
  return {
    ready: missing.length === 0, missing, tree, projectDoc, logRows, logSource, statuses, merges: mergesRec ? mergesRec.rows || [] : [],
    specs, groundwork, groundworkRulings, handoverFiles, surfaces, workflow, routing,
    projectDocAbsent: !tree.has(PROJECT_DOC_PATH),
  };
}

/** The model's timeline (J11) once its records are in, else null. */
export function timelineOf(j) {
  if (!j || !j.ready) return null;
  return buildTimeline({ project: j.projectDoc, logRows: j.logRows, statuses: j.statuses, merges: j.merges, specs: j.specs,
    groundwork: j.groundwork, handoverFiles: j.handoverFiles, groundworkRulings: j.groundworkRulings });
}

// ---------------------------------------------------------------------------
// AC50: phases, the now run, and milestones

const ITER_WORDS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];
export const iterText = (n) => (n > 1 ? ` i${n}` : '');

/** A standard milestone's state, in the model's own words (AC50): reached, not reached, not recorded, carried over, not needed. */
export function standardWord(state) {
  if (/^reached \(carried over from (.+)\)$/.test(state)) return 'carried over';
  return state;
}

/**
 * Whether a project milestone counts as one with work filed (AC50): a sprint listed or tied to it,
 * or, from 2026-10-17 (J11, model S-033 AC7), its line marked ` · reached:`, whether or not it lists
 * sprints, so a reached milestone never makes a run "now" and is never the next to reach.
 */
export function hasWorkFiled(run, m) {
  return Boolean(m.reached) || (run.sprints[m.id] || []).length > 0;
}

const MONTH_WORDS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * A reached part's date as the desk shows dates (AC50): "7 Oct", with the year when it is not this
 * year ("7 Oct 2025"). It is the line's calendar date as written, never moved by a time zone (C);
 * "this year" is the owner's, in ownerTimeZone.
 */
export function reachedDateWords(date, nowMs, tz) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date));
  if (!m) return NOT_RECORDED;
  const year = Number.isFinite(nowMs) ? dayKey(new Date(nowMs), tz || 'UTC').slice(0, 4) : null;
  return `${Number(m[3])} ${MONTH_WORDS[Number(m[2]) - 1]}${year === m[1] ? '' : ` ${m[1]}`}`;
}

/**
 * A project milestone's state (AC50): dropped, work filed, no work filed yet, or, from 2026-10-17,
 * "reached <date>" for a line that carries ` · reached:` (and only such a line); a line both reached
 * and dropped reads "dropped" (J11).
 */
export function projectMilestoneWord(run, m, nowMs, tz) {
  if (m.dropped) return 'dropped';
  if (m.reached) return `reached ${reachedDateWords(m.reached, nowMs, tz)}`;
  return (run.sprints[m.id] || []).length ? 'work filed' : 'no work filed yet';
}

function runLastPos(run, tl) {
  let pos = -1;
  for (const [p] of [...run.routed, ...run.decisions]) pos = Math.max(pos, p);
  for (const ids of Object.values(run.sprints)) {
    for (const s of ids) for (const [p] of tl.byItem.get(s) || []) pos = Math.max(pos, p);
  }
  return pos;
}

/**
 * AC50's now run (rule C, design-lab open question 3): the earliest run, in the timeline's order,
 * holding a project milestone that is not dropped and has no work filed; if every one has work
 * filed, the run holding the latest recorded step; if neither, null ("not recorded").
 */
export function nowRun(tl) {
  if (!tl) return null;
  const runs = tl.runs().filter((r) => DESK_PHASES.includes(r.phase));
  const open = runs.find((r) => r.project.some((m) => !m.dropped && !hasWorkFiled(r, m)));
  if (open) return open;
  let best = null;
  let bestPos = -1;
  for (const r of runs) {
    const p = runLastPos(r, tl);
    if (p > bestPos) {
      best = r;
      bestPos = p;
    }
  }
  return best;
}

/**
 * The runs of the branch drawing (AC57's Terms, C): the model's phase runs in its order; the first
 * starts run 1, and each later one whose phase is the same as, or comes before, the phase of the run
 * just before it starts a new run (the work went back). Returns { runs, k: Map(run → its run number), count }.
 */
export function columnsOf(tl) {
  const runs = tl ? tl.runs().filter((r) => DESK_PHASES.includes(r.phase)) : [];
  const k = new Map();
  let n = 0;
  let prev = null;
  for (const r of runs) {
    if (!prev || DESK_PHASES.indexOf(r.phase) <= DESK_PHASES.indexOf(prev.phase)) n++;
    k.set(r, n);
    prev = r;
  }
  return { runs, k, count: n };
}

/**
 * Which of AC50's two rules gave the now run: 'open' (the earliest run holding a project milestone
 * not dropped with no work filed: one milestone is then next to reach), 'latest' (every one has work
 * filed: the run holding the latest recorded step), or null (no now run).
 */
export function nowRule(tl) {
  if (!tl) return null;
  const runs = tl.runs().filter((r) => DESK_PHASES.includes(r.phase));
  if (runs.some((r) => r.project.some((m) => !m.dropped && !hasWorkFiled(r, m)))) return 'open';
  return nowRun(tl) ? 'latest' : null;
}

/**
 * A phase run's state against the now run (AC57's Terms): 'finished' (before it, its phase run no
 * more after it: finished and standing), 'gone back over' (before it, its phase run again later),
 * 'now', 'still to come' (after it), or 'not recorded' with no now run.
 */
export function runStateOf(r, runs, now) {
  if (!now) return 'not recorded';
  const i = runs.indexOf(r);
  const ni = runs.indexOf(now);
  if (i === ni) return 'now';
  if (i > ni) return 'still to come';
  return runs.slice(i + 1).some((x) => x.phase === r.phase) ? 'gone back over' : 'finished';
}

/**
 * The four phases, then Done (AC50). Returns { tracked, phases: [{ phase, word, now, iteration,
 * run, runs }], finished, done, nowRun, words }. Untracked (v2.5, or no timeline yet): tracked
 * false, with `why` in words. Each phase's word (trial-view notes 2, note 1) is the state of its
 * latest run in the model's timeline, the first rule that fits giving it: "Now" (with " · run <k>"
 * when the project has more than one run), "Finished", "Run <k> still to come", "Not started".
 */
export function phaseView(project, tl, tree, j) {
  if (project.model !== 'v3') return { tracked: false, why: 'Phases not tracked', detail: V25_NOT_RECORDED, phases: [], finished: null, done: false };
  if (!tl) {
    return { tracked: false, why: j && !j.ready ? 'Phases: reading…' : 'Phases not tracked', detail: NOT_AVAILABLE,
      phases: [], finished: null, done: false };
  }
  const runs = tl.runs().filter((r) => DESK_PHASES.includes(r.phase));
  const now = nowRun(tl);
  const gradPath = tl.first ? `decisions/questions/${tl.first}-graduation.md` : null;
  const done = Boolean(tl.graduated || (gradPath && tree && tree.has(gradPath)));
  if (!runs.length || !now) {
    return { tracked: true, nowRun: null, done, finished: null, phases: DESK_PHASES.map((phase) => ({ phase, word: NOT_RECORDED, now: false, runs: runs.filter((r) => r.phase === phase), run: null })) };
  }
  const cols = columnsOf(tl);
  const nowIdx = runs.indexOf(now);
  const phases = DESK_PHASES.map((phase) => {
    const all = runs.filter((r) => r.phase === phase);
    const latest = all.length ? all[all.length - 1] : null;
    let word;
    if (phase === now.phase) word = `Now${cols.count > 1 ? ` · run ${cols.k.get(now)}` : ''}`;
    else if (latest && runs.indexOf(latest) < nowIdx) word = 'Finished';
    else if (latest && all.some((r) => runs.indexOf(r) < nowIdx)) word = `Run ${cols.k.get(latest)} still to come`;
    else word = 'Not started';
    return { phase, word, now: phase === now.phase, iteration: phase === now.phase ? now.iteration : latest ? latest.iteration : null, run: latest, runs: all };
  });
  return { tracked: true, nowRun: now, done, phases, finished: phases.filter((p) => p.word === 'Finished').length };
}

/** A sprint's link (AC51's link rule): its pull request, or its item's latest outcome `record` when the tree holds it. */
export function sprintLink(project, tree, tl, s) {
  const pr = /^PR #(\d+)$/.exec(s);
  if (pr) return pullLink(project, pr[1]);
  let record = null;
  for (const [, o] of (tl && tl.byItem.get(s)) || []) if (o.trigger === 'outcome' && typeof o.record === 'string') record = o.record;
  return treeLink(project, tree, record);
}

// ---------------------------------------------------------------------------
// AC37: where it's heading

/**
 * The "where it's heading" line (AC37): for v3 the now run and its milestones with no work filed
 * (docs/PROJECT.md section 3), then the next run's; for v2.5 the ledger's latest title and its
 * `licenses_next:` (J9). Returns { sentence, parts: [{ label, text, source }] }.
 */
export function whereLine(project, model, tl, pv) {
  if (project.model !== 'v3') {
    const h = model && model.headline;
    const latest = h && h.text && h.text !== 'loading…' ? h.text : NOT_RECORDED;
    const next = h && h.next ? h.next : NOT_RECORDED;
    return { sentence: `Latest: ${latest}. Next: ${next}.`, parts: [
      { label: 'Latest', text: latest, source: 'docs/LEDGER.md, the latest entry' },
      { label: 'Next', text: next, source: 'docs/LEDGER.md, its licenses_next:' },
      { label: 'Phase', text: V25_NOT_RECORDED, source: null }] };
  }
  if (!tl || !pv.tracked) return { sentence: `Where it's heading: ${NOT_AVAILABLE} until the project's records are read.`, parts: [] };
  const now = pv.nowRun;
  if (!now) return { sentence: `Phase: ${NOT_RECORDED}.`, parts: [{ label: 'Phase', text: NOT_RECORDED, source: null }] };
  // A milestone marked reached (J11) is never upcoming work (AC37, AC50; 2026-10-17).
  const upcoming = now.project.filter((m) => !m.dropped && !hasWorkFiled(now, m)).map((m) => m.name);
  const runs = tl.runs().filter((r) => DESK_PHASES.includes(r.phase));
  const next = runs[runs.indexOf(now) + 1] || null;
  const nextNames = next ? next.project.filter((m) => !m.dropped).map((m) => m.name) : [];
  const phaseText = `${now.phase}${now.iteration > 1 ? ` (${ITER_WORDS[now.iteration] || `i${now.iteration}`} time through, ${now.label()})` : ''}`;
  const parts = [
    { label: 'Now', text: phaseText, source: "the model's timeline (J11)" },
    { label: 'Upcoming', text: upcoming.length ? upcoming.join('; ') : NOT_RECORDED, source: 'docs/PROJECT.md section 3' },
    { label: 'Then', text: next ? `${next.phase}${nextNames.length ? `: ${nextNames.join('; ')}` : ''}` : NOT_RECORDED, source: 'docs/PROJECT.md section 3' },
  ];
  let sentence = `In ${phaseText}.`;
  if (upcoming.length) sentence += ` Next up: ${upcoming.join('; ')}.`;
  if (next && nextNames.length) sentence += ` Then ${next.phase}: ${nextNames.join('; ')}.`;
  return { sentence, parts };
}

// ---------------------------------------------------------------------------
// AC54: Home's brief summary, the "Latest" bubble and the three groups

export const NO_SUMMARY = "no summary in this project's README";
export const SUMMARY_NOT_AVAILABLE = 'summary not available';

/**
 * The card's brief summary (AC54 (a)): README.md's first paragraph, whole; "no summary in this
 * project's README" when the file, its title or a paragraph is missing; "summary not available",
 * with the reason one tap away, before the read arrives or when it fails. Never a summary of the
 * desk's own (AC41). Returns { text, why, ok }.
 */
export function summaryView(project, box, snap) {
  const tree = snap && snap.tree;
  if (!tree) {
    const why = box && box.read && box.read.read === 'cant-read' ? `the project can't be read: ${box.read.words}` : "the project's files haven't been read yet";
    return { ok: false, text: SUMMARY_NOT_AVAILABLE, why };
  }
  if (!tree.has(README_PATH)) return { ok: false, text: NO_SUMMARY, why: 'there is no README.md at the root of its default branch' };
  const rec = snap.records ? snap.records.get(README_PATH) : undefined;
  if (rec === undefined || rec === null) {
    return { ok: false, text: SUMMARY_NOT_AVAILABLE, why: 'README.md has not been read yet, or its read failed; the desk tries again on its next read' };
  }
  if (!rec.summary) return { ok: false, text: NO_SUMMARY, why: 'README.md has no title, or no plain paragraph after it before the next heading' };
  return { ok: true, text: rec.summary, why: null };
}

/**
 * The "Latest" bubble's text (AC54 (b)): for a v3 project AC37's where-it's-heading line, for a
 * v2.5 project its latest ledger entry's title (AC10's headline), character for character.
 */
export function latestText(project, model, where) {
  if (project.model !== 'v3') {
    const t = model && model.headline ? model.headline.text : null;
    return t || NOT_RECORDED;
  }
  return where.sentence;
}

export const HOME_GROUPS = [
  { key: 'active', title: 'Active', open: true },
  { key: 'done', title: 'Done', open: false },
  { key: 'closed', title: 'Closed or not applicable', open: false },
];
export const HOME_GROUPS_KEY = 'desk-home-groups-v1';

/**
 * Which of Home's groups a project sits in (AC54 (d)), checked in order: a v2.5 project is Closed
 * or not applicable (not run through its phases); a v3 project Done by AC50's rule is Done; a v3
 * project whose every project item is closed with an outcome other than `re-scope` is Closed;
 * every other project is Active, including one whose records haven't been read or can't be, and
 * one closed with `re-scope` (the Definer's reading, C; design-lab open question 11).
 * Returns { group, why }.
 */
export function homeGroupOf(project, snap, pv) {
  if (project.model !== 'v3') return { group: 'closed', why: 'not run through its phases (operating model v2.5.1)' };
  if (pv && pv.done) return { group: 'done', why: 'Done by the model\'s timeline or its graduation ruling' };
  const tree = snap && snap.tree;
  if (!tree) return { group: 'active', why: 'not read yet' };
  const items = [];
  for (const path of [...tree.keys()].sort()) {
    const m = STATUS_RE.exec(path);
    if (!m) continue;
    const r = snap.records ? snap.records.get(path) : null;
    if (!r || !r.ok) return { group: 'active', why: `status/${m[1]}.toml not read yet` };
    if (r.fields.kind === 'project') items.push({ id: m[1], state: r.fields.state, outcome: r.fields.outcome });
  }
  if (!items.length) return { group: 'active', why: 'no project item' };
  if (items.every((i) => i.state === 'closed' && i.outcome !== 're-scope')) {
    return { group: 'closed', why: `closed: ${items.map((i) => `${i.id} ${i.outcome || NOT_RECORDED}`).join(', ')}` };
  }
  const rescoped = items.filter((i) => i.state === 'closed' && i.outcome === 're-scope').map((i) => i.id);
  return { group: 'active', why: rescoped.length ? `${rescoped.join(', ')} closed with re-scope: Active until you rule (question 11)` : 'a project item is open' };
}

const projectsWord = (n) => `${n} project${n === 1 ? '' : 's'}`;

/** A group's header words (AC54 (d)): its count, what waits on the owner and what can't be read, open or closed. */
export function groupHeaderWords(boxes) {
  const waiting = boxes.reduce((n, b) => n + (b.waiting || 0), 0);
  const cant = boxes.filter((b) => b.cantRead).length;
  const parts = [projectsWord(boxes.length)];
  if (waiting) parts.push(`${waiting} waiting on you`);
  if (cant) parts.push(`${cant} can't be read`);
  return { count: projectsWord(boxes.length), waiting: waiting ? `${waiting} waiting on you` : null, cant: cant ? `${cant} can't be read` : null, words: parts.join(' · ') };
}

// ---------------------------------------------------------------------------
// AC52: the queue

export const GROUPS = [
  { key: 'decisions', title: 'Decisions', edge: 'you', shape: '◆' },
  { key: 'gates', title: 'Gate rulings', edge: 'gold', shape: '▲' },
  { key: 'verdicts', title: 'Verdicts to write', edge: 'pass', shape: '✎' },
  { key: 'merges', title: 'Merges', edge: 'merge', shape: '⇄' },
  { key: 'deploys', title: 'Deploys', edge: 'block', shape: '⏵' },
];

/** The group a flagged item sits in (AC52): every item that needs the owner sits in exactly one. */
export function groupOf(f) {
  if (f.kind === 'card') return GATE_WORDS.includes(f.card.gate) ? 'gates' : 'decisions';
  if (f.kind === 'pr' || f.kind === 'merge') return 'merges';
  if (f.kind === 'deploy') return 'deploys'; // counted in a deploysNeedOwner project (AC52, 2026-10-18)
  return 'decisions'; // question, hold (C), status-card
}

/** An item's plain words and code (AC52: what it is, in plain words, with its code after). */
export function rowWords(f) {
  if (f.kind === 'card') {
    const title = f.card.parsed && f.card.parsed.title ? f.card.parsed.title : `card ${f.card.gate}-${f.card.n}`;
    return { text: title, code: `${f.card.item} ${f.card.gate}-${f.card.n}` };
  }
  if (f.kind === 'question') return { text: f.question.title, code: f.question.name };
  if (f.kind === 'pr') return { text: f.pr.title, code: `PR #${f.pr.number}` };
  if (f.kind === 'hold') return { text: "The default branch's governance run is not green", code: f.hold.path.replace(/^queue\//, '') };
  if (f.kind === 'merge') {
    return { text: f.merge.step === 'conflict' ? `Merge ${f.merge.item}: a merge conflict` : `Merge ${f.merge.item} by hand`, code: f.merge.path.replace(/^queue\//, '') };
  }
  return { text: f.title, code: null };
}

export function waitWords(raisedAt, nowMs) {
  const r = t(raisedAt);
  return Number.isFinite(r) ? `waiting ${durationText(Math.max(0, nowMs - r))}` : 'wait not recorded';
}

/** Workflow runs on the head waiting for an environment approval (AC52's Deploys; shown, not counted). */
export function waitingDeploys(checkPages) {
  if (!checkPages) return [];
  const { runs } = parseWorkflowRuns(checkPages);
  return runs.filter((r) => r.status === 'waiting').map((r) => ({ key: `deploy:${r.path}:${r.runNumber}`, kind: 'deploy', group: 'deploys',
    text: `${r.name}: waiting for approval`, code: `run ${r.runNumber}`, link: r.url, raisedAt: null, approver: NOT_RECORDED }));
}

/**
 * The project's queue (AC52): { groups: [{ key, title, items, count, line }], waiting (the count
 * Terms counts), deploys, rows (in order, for AC49's owner tile) }.
 */
export function queueView(project, model, snap, nowMs) {
  const rows = [];
  const counted = project.deploysNeedOwner === true;
  for (const f of (model && model.flagged) || []) {
    if (f.kind === 'deploy') continue; // the Deploys group's own rows, below
    const w = rowWords(f);
    rows.push({ key: f.key, kind: f.kind, group: groupOf(f), text: w.text, code: w.code, raisedAt: f.raisedAt ? t(f.raisedAt) : null,
      wait: waitWords(f.raisedAt, nowMs), flag: f });
  }
  const order = (a, b) => {
    const ar = a.raisedAt;
    const br = b.raisedAt;
    if (ar == null && br == null) return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    if (ar == null) return 1;
    if (br == null) return -1;
    return ar - br || (a.key < b.key ? -1 : 1);
  };
  // AC52: in a project J7 marks `deploysNeedOwner`, a waiting deploy is one of the model's flagged
  // items and counts (the group, the pill, Home's top line, Quiet); elsewhere it is shown, not counted.
  const deploys = counted
    ? ((model && model.flagged) || []).filter((f) => f.kind === 'deploy').map((f) => ({ key: f.key, kind: 'deploy', group: 'deploys',
      text: `${f.deploy.name}: waiting for approval`, code: `run ${f.deploy.runNumber}`, link: f.link, raisedAt: null, approver: NOT_RECORDED, flag: f }))
    : waitingDeploys(snap && snap.checkPages);
  const groups = GROUPS.map((g) => {
    let items = rows.filter((r) => r.group === g.key).sort(order);
    let line = null;
    if (g.key === 'verdicts') {
      items = [];
      line = `${NOT_RECORDED}: no record the desk reads names the verdicts a pull request needs. Your own verdict opens from each pull request in Merges.`;
    }
    if (g.key === 'deploys') items = deploys;
    return { ...g, items, count: g.key === 'verdicts' ? null : items.length, line };
  });
  const ordered = groups.filter((g) => g.key !== 'deploys').flatMap((g) => g.items);
  return { groups, waiting: rows.length + (counted ? deploys.length : 0), rows: ordered, deploys, deploysCounted: counted,
    // AC77: questions asked in a session, or whose answer is on its way: shown, not counted.
    asking: (model && model.asking) || [] };
}

/** The pill on a Home card (AC48). */
export function pillView(box, q, nowMs) {
  const read = box.read || {};
  if (box.drawError) return { kind: 'bad', text: box.drawError };
  if (read.read === 'cant-read') return { kind: 'bad', text: `Can't read: ${read.words}` };
  if (q.waiting > 0) {
    const parts = [];
    const n = (k) => q.groups.find((g) => g.key === k).count;
    const dec = n('decisions');
    const gate = n('gates');
    const mer = n('merges');
    if (dec) parts.push(`${dec} decision${dec === 1 ? '' : 's'}`);
    if (gate) parts.push(`${gate} gate ruling${gate === 1 ? '' : 's'}`);
    if (mer) parts.push(`${mer} to merge`);
    const dep = q.deploysCounted ? n('deploys') : 0;
    if (dep) parts.push(`${dep} deploy${dep === 1 ? '' : 's'} to approve`);
    return { kind: 'you', text: parts.join(' · ') };
  }
  if (read.read === 'checking') return { kind: 'idle', text: 'Checking…' };
  // "All clear" only when nothing waits AND the project was read successfully within 3 minutes.
  if (read.read === 'ok' && read.since != null && nowMs - read.since <= STALE_MS) return { kind: 'ok', text: 'All clear' };
  return { kind: 'idle', text: 'Checking…' };
}

// ---------------------------------------------------------------------------
// AC49: who has the ball

/** Runs on the head with status queued or in_progress (AC49's "Checks running"). */
export function runningChecks(checkPages) {
  if (!checkPages) return [];
  return parseWorkflowRuns(checkPages).runs.filter((r) => r.status === 'queued' || r.status === 'in_progress');
}

/** The Orchestrator's next run by its schedule (J11), or null. */
export function nextOrchestratorRun(j, now) {
  const cron = j && j.workflow ? j.workflow.cron : null;
  return cron ? nextCronRun(cron, now) : null;
}

/** AC49's first line, from the oldest item's raised time (AC20's rule); time-dependent (AC56's tick). */
export const youWaitText = (oldest, nowMs) => `Waiting on you, ${oldest != null ? `the oldest for ${durationText(nowMs - oldest)}` : 'wait not recorded'}`;

/**
 * Who has the ball (AC49), each line that holds, in order: waiting on you; an agent working; checks
 * running; queued for the next Orchestrator run; else "Nothing under way". Returns [{ who, text, lit }].
 */
export function ballLines(project, model, snap, j, q, now, tz) {
  if (project.model !== 'v3') return [{ who: 'none', text: V25_NOT_RECORDED, lit: false }];
  const nowMs = now.getTime();
  const out = [];
  if (q.waiting > 0) {
    const raised = q.rows.map((r) => r.raisedAt).filter((x) => x != null);
    const oldest = raised.length ? Math.min(...raised) : null;
    out.push({ who: 'you', text: youWaitText(oldest, nowMs), oldest, lit: false });
  }
  for (const i of (model && model.items) || []) {
    if (i.state === 'dispatched') out.push({ who: 'agent', text: `${i.running ? i.running.role : NOT_RECORDED} working on ${i.id}`, lit: true, item: i.id });
  }
  // The Chief of Staff working (from 2026-10-17, J13): a piece of work of one of its sessions under way, once however many.
  if (cosSessions(snap, nowMs).pieces.some((x) => x.state === 'working')) out.push({ who: 'cos', text: 'Chief of Staff working', lit: true });
  if (runningChecks(snap && snap.checkPages).length) out.push({ who: 'checks', text: 'Checks running', lit: false });
  if (((model && model.items) || []).some((i) => i.state === 'ready' || i.state === 'returned')) {
    const due = nextOrchestratorRun(j, now);
    out.push({ who: 'orchestrator', text: `Next Orchestrator run, ${due ? `due ${hhmm(due, tz)} by its schedule` : 'due time not available'}`, lit: false });
  }
  if (!out.length) out.push({ who: 'none', text: 'Nothing under way', lit: false });
  return out;
}

// ---------------------------------------------------------------------------
// AC53: the prefilled text boxes, their rule lines and their links

export const VERDICT_START = 'Verdict: PASS\n\nAny suggestions to commit along with the verdict:\n\n';
export const GATE_STANDARD_WORDS = ['proceed', 'hold', 'recycle', 'kill'];

/** The box's starting text for a card's chosen word (AC53, J3). */
export function cardBoxText(word, gateCard) {
  let text = `Decision: ${word}\n\n`;
  if (gateCard && word === 'recycle') text += 'Into: \n';
  if (gateCard && (word === 'hold' || word === 'recycle')) text += 'Reason: \n';
  return text;
}
/**
 * A question's answer box (AC53, J3's sandbox part): `Ruling: <letter>`, an empty line and the
 * `Question:` line, then, from 2026-10-17, the question's `Milestone:` line when it has one (J2),
 * copied as the question has it with trailing spaces dropped, as decisions/README.md:43 asks of an
 * answer to a filed question (model S-033). The accepted views' answer link (links.js) is unchanged.
 */
export const questionBoxText = (letter, name, milestone = null) => `Ruling: ${letter}\n\nQuestion: questions/${name}.md\n${milestone ? `${milestone}\n` : ''}`;

/**
 * The rule line's words on an answer's `Milestone:` line (AC53, from 2026-10-17): null when the
 * question has none, or the answer's first `Milestone:` line in column 0 after line 1 holds the
 * same value; otherwise the sentence naming the line it should hold.
 */
export function milestoneRuleWords(text, questionLine) {
  if (!questionLine) return null;
  const want = questionLine.replace(/^Milestone:/, '').trim();
  const got = firstMilestoneLine(text, true);
  if (got != null && got.replace(/^Milestone:/, '').trim() === want) return null;
  return `The answer's Milestone line should read \`${questionLine}\`, as the question's does.`;
}

const andOr = (xs) => (xs.length < 2 ? String(xs[0]) : `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}`);

/**
 * The rule line (AC53): what is wrong with the box's text for its form, or that it is in form. It
 * covers these forms only (verdict, card, question); the Orchestrator applies the rest.
 * Returns { ok, words }.
 */
export function ruleLine(form, text, opts = {}) {
  const lines = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
  if (form === 'verdict') {
    const idx = lines.findIndex((l) => l.startsWith('Verdict:'));
    const mid = lines.some((l) => !l.startsWith('Verdict:') && l.includes('Verdict:'));
    if (mid) return { ok: false, words: '"Verdict:" may only start a line: one appears mid-line. Only the first line starting "Verdict:" decides.' };
    if (idx < 0) return { ok: false, words: 'No line starts "Verdict:": the first line starting "Verdict:" decides the verdict.' };
    if (lines[idx] !== 'Verdict: PASS' && lines[idx] !== 'Verdict: FAIL') {
      return { ok: false, words: `The first "Verdict:" line must read exactly "Verdict: PASS" or "Verdict: FAIL"; it reads "${lines[idx]}".` };
    }
    return { ok: true, words: `In form: the first "Verdict:" line decides (${lines[idx]}).` };
  }
  if (form === 'card') {
    const m = /^Decision: (.*)$/.exec(lines[0] || '');
    const words = opts.words || [];
    if (!m) return { ok: false, words: 'Line 1 must be "Decision: <word>".' };
    const word = m[1].trim();
    if (!word) return { ok: false, words: `Pick one of the card's words above: ${(opts.words || []).join(', ')}.` };
    if (!words.includes(word)) return { ok: false, words: `"${word}" is not one of this card's words: ${words.join(', ')}.` };
    if (opts.gateCard) {
      const later = lines.slice(2);
      const reason = later.find((l) => l.startsWith('Reason:'));
      const into = later.find((l) => l.startsWith('Into:'));
      if ((word === 'hold' || word === 'recycle') && !(reason && reason.slice(7).trim())) {
        return { ok: false, words: `"${word}" needs a "Reason:" line with text.` };
      }
      if (word === 'recycle' && !(into && into.slice(5).trim())) return { ok: false, words: '"recycle" needs an "Into:" line naming a phase.' };
    }
    return { ok: true, words: `In form: line 1 is "Decision: ${word}".` };
  }
  if (form === 'question') {
    const m = /^Ruling: (.+)$/.exec(lines[0] || '');
    const ms = milestoneRuleWords(text, opts.milestone);
    if (!m) return { ok: false, words: `${opts.letters && opts.letters.length ? `Line 1 must be "Ruling: <letter>": pick ${andOr(opts.letters)} above.` : 'Line 1 must be "Ruling: <letter>".'}${ms ? ` ${ms}` : ''}` };
    if (ms) return { ok: false, words: `Line 1 is "Ruling: ${m[1]}". ${ms}` };
    return { ok: true, words: `In form: line 1 is "Ruling: ${m[1]}"${opts.milestone ? `, and the Milestone line is the question's` : ''}.` };
  }
  return { ok: true, words: '' };
}

/**
 * GitHub's new-file page at a branch (J3, from MD): the branch's own `/` kept unencoded, each segment
 * percent-encoded (review R2-N2), the file name and the content as query parameters.
 */
export function newFileAtBranch(project, branch, path, content) {
  let url = `https://github.com/${project.repo}/new/${enc(branch)}?filename=${encodeURIComponent(path)}`;
  if (content != null && project.contentPrefill !== false) url += `&${encodeURIComponent(project.contentParam || 'value')}=${encodeURIComponent(content)}`;
  return url;
}

/**
 * The button's plan for a box (AC53). target: { form: 'card' | 'question' | 'verdict', path,
 * branch?, fork? }. Returns { offer: 'link' | 'copy' | 'none', url, copy, words, warning, branch, path }.
 */
export function boxPlan(project, linkCap, target, text) {
  const content = String(text == null ? '' : text);
  if (target.form === 'verdict') {
    if (target.fork || !target.branch) {
      return { offer: 'copy', copy: content, url: null, branch: target.branch || NOT_RECORDED, path: target.path,
        words: "This pull request's branch is not in this repository (a fork, or deleted), so no link is made: copy the text." };
    }
    const full = newFileAtBranch(project, target.branch, target.path, content);
    if (project.contentPrefill !== false && full.length <= linkCap) return { offer: 'link', url: full, copy: null, branch: target.branch, path: target.path, words: null, warning: null };
    return { offer: 'link', url: newFileAtBranch(project, target.branch, target.path, null), copy: content, branch: target.branch, path: target.path,
      words: 'Too long to prefill, or this repository takes no prefilled content: the button copies the text and opens the page with only the file name.', warning: null };
  }
  if (target.form === 'question' && project.model !== 'v3') {
    return { offer: 'copy', copy: content, url: null, branch: null, path: null, words: V25_RULING_NOTE };
  }
  const link = cappedNewFileLink(project, target.path, content, linkCap);
  return { offer: 'link', url: link.url, copy: link.copy, branch: project.defaultBranch, path: target.path,
    words: link.copy ? 'Too long to prefill, or this repository takes no prefilled content: the button copies the text and opens the page with only the file name.' : null,
    warning: project.webCommitsToDefault === false ? webCommitsWarning(project.defaultBranch, target.form === 'card' ? 'card' : 'question') : null };
}

// ---------------------------------------------------------------------------
// AC53, extended by trial-view note 15: one question and its own answer box per question asked,
// and the ruling file they prefill.

export const CANT_SPLIT = "This question file couldn't be split into questions";
export const NO_RECOMMENDATION = 'no recommendation given';

/**
 * A question file's OPTIONS: block (questions/_TEMPLATE.md): the lines after `OPTIONS:` that start
 * with two spaces, up to the first that doesn't. Returns { found, lines } (the block's lines exactly).
 */
export function optionsBlock(text) {
  const all = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
  const i = all.findIndex((l) => /^OPTIONS:/.test(l));
  if (i < 0) return { found: false, lines: [] };
  const out = [];
  for (let k = i + 1; k < all.length && /^ {2}/.test(all[k]); k++) out.push(all[k]);
  return { found: true, lines: out };
}

/** The `RECOMMENDATION:` line's text, after the label, or null. */
function recommendationLine(text) {
  const l = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n').find((x) => /^RECOMMENDATION:/.test(x));
  return l ? l.replace(/^RECOMMENDATION:\s*/, '').trim() : null;
}

/**
 * A number's recommendation (AC53): the words `RECOMMENDATION: ` removed, the rest split at `; `,
 * the part that starts with that number and a space ("1 " never matches "10 "), without its number,
 * with a final full stop dropped. Null when there is none.
 */
export function numberRecommendation(recLine, n) {
  if (!recLine) return null;
  const part = recLine.split('; ').find((x) => x.startsWith(`${n} `));
  if (!part) return null;
  return part.slice(String(n).length + 1).replace(/\.$/, '').trim() || null;
}

/**
 * The questions an owner question file puts (AC53): lettered (one question, its letters as
 * choices), numbered (one question per number, no choices), or, when it can't be split, one box
 * with the file shown whole. Returns { form: 'lettered' | 'numbered' | 'fallback', why, title,
 * block, questions: [{ n, text, choices: [{ value, text }], recommendation }] }.
 */
export function questionQuestions(text, title) {
  const { found, lines } = optionsBlock(text);
  const fallback = (why) => ({ form: 'fallback', why, title, block: lines, questions: [] });
  if (!found) return fallback('it has no OPTIONS: line');
  // Each item line starts with exactly two spaces; a line indented further continues the one above (C).
  const items = [];
  for (const l of lines) {
    if (/^ {3,}\S/.test(l)) {
      if (!items.length) return fallback('its OPTIONS: block starts with a continuation line');
      items[items.length - 1].text += ` ${l.trim()}`;
    } else if (/^ {2}\S/.test(l)) items.push({ line: l, text: l.slice(2) });
  }
  if (!items.length) return fallback('its OPTIONS: block is empty');
  const lettered = items.map((x) => /^([A-Z])\. ([\s\S]*)$/.exec(x.text));
  const numbered = items.map((x) => /^([0-9]+)\. ([\s\S]*)$/.exec(x.text));
  const rec = recommendationLine(text);
  if (lettered.every(Boolean)) {
    const letter = rec ? (/^([A-Z])\b/.exec(rec) || [null, null])[1] : null;
    return { form: 'lettered', why: null, title, block: lines, recLetter: letter,
      questions: [{ n: 1, text: title, choices: lettered.map((m) => ({ value: m[1], text: m[2].trim() })), recommendation: rec ? rec : null }] };
  }
  if (numbered.every(Boolean)) {
    const ns = numbered.map((m) => Number(m[1]));
    if (ns.some((n, i) => n !== i + 1)) return fallback('its numbers are repeated, missing or out of order');
    return { form: 'numbered', why: null, title, block: lines,
      questions: numbered.map((m, i) => ({ n: ns[i], text: m[2].trim(), choices: [], recommendation: numberRecommendation(rec, ns[i]) })) };
  }
  return fallback(lettered.some(Boolean) && numbered.some(Boolean) ? 'its lettered and numbered lines are mixed' : 'its lines are neither lettered nor numbered');
}

/**
 * One numbered answer made into one line (AC53, C): each line break, with the spaces around it,
 * becomes one space; then each `; ` becomes `, `, so `; ` only ever separates numbers. Returns
 * { text, joined } (joined: the answer held a line break or `; `).
 */
export function oneLine(words) {
  const raw = String(words == null ? '' : words).replace(/\r\n?/g, '\n');
  const a = raw.replace(/[ \t]*\n[ \t]*/g, ' ').trim();
  const b = a.replace(/; /g, ', ');
  return { text: b, joined: /\n/.test(raw.trim()) || a !== b };
}

/**
 * A gate card's Reason: made into one line (AC53, build review N2): each line break, with the
 * spaces around it, becomes one space, and nothing else changes; "; " stays as the owner wrote it
 * (the "; " to ", " rule is for numbered rulings only).
 */
export function reasonLine(words) {
  return String(words == null ? '' : words).replace(/\r\n?/g, '\n').replace(/[ \t]*\n[ \t]*/g, ' ').trim();
}

const tidyWords = (w) => String(w == null ? '' : w).replace(/\r\n?/g, '\n').replace(/\s+$/, '').replace(/^\s*\n/, '');

/**
 * The ruling file's text from the answers (AC53, note 15), in the form decisions/README.md
 * requires. answers: { [n]: { choice, words } }. ctx: { kind: 'card', gateCard } or { kind:
 * 'question', name, qs } (questionQuestions' result). Returns { text, joined: [n] }.
 */
export function composeAnswer(ctx, answers = {}) {
  const a1 = answers[1] || {};
  if (ctx.kind === 'card') {
    const word = a1.choice || '';
    let text = `Decision: ${word}\n\n`;
    const words = tidyWords(a1.words);
    if (ctx.gateCard && word === 'recycle') text += 'Into: \n';
    if (ctx.gateCard && (word === 'hold' || word === 'recycle')) text += `Reason: ${reasonLine(words)}\n`;
    else if (words) {
      // On a phase-gate card each line of the note is indented by two spaces, so no note line can be read as a field (N5).
      text += `${ctx.gateCard ? words.split('\n').map((l) => `  ${l}`).join('\n') : words}\n`;
    }
    return { text, joined: [] };
  }
  const { qs, name } = ctx;
  // From 2026-10-17 the question's `Milestone:` line follows the `Question:` line (AC53, J2).
  const q = `Question: questions/${name}.md\n${ctx.milestone ? `${ctx.milestone}\n` : ''}`;
  if (qs.form === 'lettered') {
    const words = tidyWords(a1.words);
    return { text: `Ruling: ${a1.choice || ''}\n\n${q}\nQuestion, as put: ${qs.title}\nOptions, as put:\n${qs.block.join('\n')}\n${words ? `\n${words}\n` : ''}`, joined: [] };
  }
  if (qs.form === 'numbered') {
    const parts = [];
    const joined = [];
    for (const x of qs.questions) {
      const one = oneLine((answers[x.n] || {}).words);
      if (!one.text) continue;
      parts.push(`${x.n} ${one.text}`);
      if (one.joined) joined.push(x.n);
    }
    return { text: `Ruling: ${parts.join('; ')}\n\n${q}\nQuestions, as put:\n${qs.block.join('\n')}\n`, joined };
  }
  const words = tidyWords(a1.words);
  return { text: `Ruling: \n\n${q}${words ? `\n${words}\n` : ''}`, joined: [] };
}

const andList = (ns) => (ns.length < 2 ? String(ns[0]) : `${ns.slice(0, -1).join(', ')} and ${ns[ns.length - 1]}`);

/**
 * The rule line for a numbered ruling (AC53, note 15): line 1 starts `Ruling: `; it names any
 * number with no answer yet, and says which answers were joined into one line. The button stays.
 */
export function numberedRuleLine(text, qs, joined = [], milestone = null) {
  const first = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n')[0];
  const ms = milestoneRuleWords(text, milestone);
  if (!/^Ruling: /.test(first)) return { ok: false, words: `Line 1 must start "Ruling: ", then each answered number and its answer, joined by "; ".${ms ? ` ${ms}` : ''}` };
  const got = new Set(first.slice(8).split('; ').map((x) => (/^([0-9]+) \S/.exec(x) || [])[1]).filter(Boolean).map(Number));
  const missing = qs.questions.map((x) => x.n).filter((n) => !got.has(n));
  const bits = [];
  if (!got.size) bits.push('No answer yet: line 1 names no number.');
  else bits.push(`In form: line 1 is "Ruling: " with ${got.size} answer${got.size === 1 ? '' : 's'}.`);
  if (missing.length && got.size) bits.push(`No answer yet for ${andList(missing)}.`);
  for (const n of joined) bits.push(`Answer ${n} joined into one line (line breaks became spaces, "; " became ", ").`);
  if (ms) bits.push(ms);
  return { ok: got.size > 0 && !ms, words: bits.join(' ') };
}

// ---------------------------------------------------------------------------
// AC52: the response sheet

function cardSection(text, n) {
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
  const i = lines.findIndex((l) => new RegExp(`^## ${n}\\. `).test(l));
  if (i < 0) return null;
  const out = [];
  for (let k = i + 1; k < lines.length; k++) {
    if (/^## /.test(lines[k])) break;
    out.push(lines[k]);
  }
  const s = out.join('\n').trim();
  return s || null;
}

/**
 * The tracker (AC52): three steps, each ticked only from its record. Returns [{ step, done, words }].
 */
export function trackerSteps(project, row, snap, entries) {
  const tree = (snap && snap.tree) || new Map();
  const f = row.flag;
  const step = (n, done, words) => ({ step: n, done, words });
  if (f.kind === 'card') {
    const ans = f.card.answerPath;
    const di = entries.findIndex((e) => e.shape === 'decision' && e.record === ans);
    const decision = di >= 0 ? entries[di] : null;
    const after = di >= 0 ? entries.slice(di + 1).find((e) => e.item === f.card.item && (e.shape === 'dispatch' || e.shape === 'done')) : null;
    return [
      step(1, tree.has(ans), tree.has(ans) ? `answer recorded: ${ans} is on ${project.defaultBranch}` : `answer recorded: not yet (${ans} is not on ${project.defaultBranch})`),
      step(2, Boolean(decision), decision ? `picked up: the Orchestrator logged your ${decision.word} (dispatch log)` : 'picked up: not yet (no decision entry in the dispatch log)'),
      step(3, Boolean(after), after ? `handed on: ${after.shape === 'done' ? `${after.item} done` : `${after.role} started`} (dispatch log)` : 'handed on: not yet'),
    ];
  }
  if (f.kind === 'question') {
    const ans = `decisions/questions/${f.question.name}.md`;
    const gone = !tree.has(f.question.path);
    if (project.model !== 'v3') {
      return [step(1, false, `answer recorded: ${NOT_RECORDED} (this repository records rulings in its ledger)`),
        step(2, gone, gone ? 'picked up: the question file has gone' : 'picked up: not yet (the question file is still there)'),
        step(3, false, `handed on: ${NOT_RECORDED}`)];
    }
    return [
      step(1, tree.has(ans), tree.has(ans) ? `answer recorded: ${ans} is on ${project.defaultBranch}` : 'answer recorded: not yet'),
      step(2, gone, gone ? 'picked up: the question file has gone' : 'picked up: not yet (the question file is still there)'),
      step(3, false, `handed on: ${NOT_RECORDED}`),
    ];
  }
  if (f.kind === 'pr') {
    const open = row.stillOpen !== false;
    return [step(1, !open, open ? 'answer recorded: the pull request is still open' : 'answer recorded: no longer open (the desk can\'t tell merged from closed)'),
      step(2, false, `picked up: ${NOT_RECORDED}`), step(3, false, `handed on: ${NOT_RECORDED}`)];
  }
  return [step(1, false, `answer recorded: ${NOT_RECORDED}`), step(2, false, `picked up: ${NOT_RECORDED}`), step(3, false, `handed on: ${NOT_RECORDED}`)];
}

/**
 * What the response sheet holds for one row (AC52, AC53). Returns { kind, title, code, what, why,
 * checked, gate?, options: [{ value, text, then }], recommendation, box?, verdictBox?, reviewerBox?,
 * noAnswer?, links: [{ text, href }], answered? }.
 */
export function sheetView(project, model, snap, j, row) {
  const tree = (snap && snap.tree) || new Map();
  const f = row.flag;
  const ci = model ? model.ci : NOT_RECORDED;
  const base = { key: row.key, kind: f.kind, title: row.text, code: row.code, wait: row.wait, checked: `CI on ${project.defaultBranch}'s head: ${ci}`, links: [] };
  if (f.kind === 'card') {
    const c = f.card;
    const p = c.parsed;
    const gateCard = GATE_WORDS.includes(c.gate);
    const listed = p ? p.options.map((o) => ({ value: o.word, then: o.text.replace(/^`[^`]+`\s*(—\s*)?/, '') || NOT_RECORDED })) : [];
    let options = listed;
    if (gateCard) {
      const std = GATE_STANDARD_WORDS.map((w) => listed.find((o) => o.value === w) || { value: w, then: 'per decisions/README.md (the card does not list it)' });
      options = [...std, ...listed.filter((o) => !GATE_STANDARD_WORDS.includes(o.value))];
    }
    const out = { ...base, what: p && p.title ? p.title : `card ${c.gate}-${c.n}`, why: cardSection(p && p.text, 2) || NOT_RECORDED,
      question: cardSection(p && p.text, 1) || (p && p.title) || NOT_RECORDED,
      options, recommendation: cardSection(p && p.text, 5), gateCard, loading: !p,
      box: { form: 'card', path: c.answerPath, words: options.map((o) => o.value), gateCard },
      fullText: p ? p.text : null };
    out.links.push({ text: 'The card on GitHub', href: treeLink(project, tree, c.path) });
    if (gateCard) {
      const phase = GATE_PHASE[c.gate];
      const casePath = `docs/gates/${c.item}/${phase}-gate-${c.n}-case.md`;
      const criticPath = `reviews/${c.item}/_${phase}-gate-${c.n}-critic.md`;
      const caseRec = snap && snap.records ? snap.records.get(casePath) : null;
      const doc = j && j.projectDoc;
      out.gate = {
        opening: tree.has(casePath) ? (caseRec ? caseRec.opening || NOT_RECORDED : 'reading…') : `${NOT_RECORDED}: no case file`,
        caseLink: treeLink(project, tree, casePath), criticLink: treeLink(project, tree, criticPath),
        userRep: doc ? (doc.ownerIsUser ? 'not needed: the owner is the user (docs/PROJECT.md section 9)' : NOT_RECORDED) : NOT_AVAILABLE,
      };
    }
    return out;
  }
  if (f.kind === 'question') {
    const q = f.question;
    const p = q.parsed;
    return { ...base, what: p ? p.title : q.title, why: p && p.why ? p.why : 'not given',
      qs: p ? questionQuestions(p.text, p.title) : null,
      options: p ? p.options.map((o) => ({ value: o.letter, text: o.text, then: o.text })) : [], loading: !p,
      recommendation: p && p.recommendation ? p.recommendation : null,
      reversibility: p ? p.reversibility || 'not given' : null,
      // milestone: the question's own `Milestone:` line (J2), which the answer box carries (AC53, from 2026-10-17).
      box: { form: 'question', path: `decisions/questions/${q.name}.md`, name: q.name, milestone: p ? firstMilestoneLine(p.text) : null },
      fullText: p ? p.text : null,
      links: [{ text: 'The question on GitHub', href: treeLink(project, tree, q.path) }] };
  }
  if (f.kind === 'pr') {
    const pr = f.pr;
    const fork = !(typeof pr.headRepo === 'string' && pr.headRepo.toLowerCase() === String(project.repo).toLowerCase());
    return { ...base, what: pr.title, why: `${pr.who}; ${pr.why}`, options: [], recommendation: null,
      openLink: pr.url,
      verdictBox: { form: 'verdict', path: `reviews/${pr.number}/owner.md`, branch: pr.head || null, fork, exists: NOT_RECORDED },
      reviewerBox: { path: `reviews/${pr.number}/reviewer.md`, words: `${NOT_RECORDED}: no record the desk reads holds the Reviewer's statement before it is committed, so there is nothing to prefill and no link.` },
      links: [{ text: 'Open the pull request in GitHub', href: pr.url }] };
  }
  if (f.kind === 'hold') {
    const runs = snap && snap.checkPages ? parseWorkflowRuns(snap.checkPages).runs.filter((r) => r.path === '.github/workflows/governance.yml') : [];
    const latest = runs.reduce((a, b) => (!a || b.runNumber > a.runNumber ? b : a), null);
    return { ...base, what: "The default branch's governance run is not green", why: f.words, options: [], recommendation: null,
      noAnswer: HOLD_NO_ANSWER, links: [{ text: 'The hold card on GitHub', href: treeLink(project, tree, f.hold.path) },
        { text: 'The governance run that is not green', href: latest && latest.url ? latest.url : f.hold.actionsLink }] };
  }
  if (f.kind === 'merge') {
    return { ...base, what: row.text, why: f.words, options: [], recommendation: null, noAnswer: mergeNoAnswer(f.merge.item),
      links: [{ text: 'The merge card on GitHub', href: treeLink(project, tree, f.merge.path) }, { text: `item/${f.merge.item} on GitHub`, href: f.merge.branchLink }] };
  }
  return { ...base, what: row.text, why: f.words || NOT_RECORDED, options: [], recommendation: null, links: [{ text: 'Its status file', href: f.link }] };
}

// ---------------------------------------------------------------------------
// AC55 and AC52: the owner's recorded actions

const NO_TIME = '\u0000';
/** J9's decision words with no time ("P-001: you answered dor-4 with build", " (proxy)" kept). */
export const decisionWords = (e) => entryWords({ ...e, shape: 'decision' }, NO_TIME).replace(`, ${NO_TIME}`, '');

/** A ruling's words (AC52, AC55): its first line without the leading `Ruling:` (or `Decision:`), whole. */
export function rulingWords(rec) {
  return String(rec.line1).replace(/^(Ruling|Decision):\s*/, '');
}

/** The decision entries the desk reads (J2): every month once J11's reads are in, else J9's two. */
function decisionEntries(model, j) {
  const rows = j && j.ready ? j.logRows.map((o) => ({ ...o, shape: entryShape(o) })) : (model && model.allEntries) || [];
  return rows.filter((e) => e.shape === 'decision' && typeof e.time === 'string' && Number.isFinite(Date.parse(e.time)));
}

/**
 * The owner's recorded actions in a project (AC52, AC55): card answers (the dispatch log's decision
 * entries) and rulings (decisions/questions/<name>.md whose line 1 is the owner's), each with its
 * time, words, code and link. `pending` lists what has not arrived yet (a ruling's commit time, or
 * the line 1 of one that may be the latest). Every other file there is ignored, never shown.
 */
export function ownerActions(project, model, snap, j) {
  const tree = (snap && snap.tree) || new Map();
  const records = (snap && snap.records) || new Map();
  const history = (snap && snap.history) || new Map();
  const out = [];
  for (const e of decisionEntries(model, j)) {
    const rec = typeof e.record === 'string' ? e.record : `decisions/${e.item}/${e.gate}-${e.card}.md`;
    const card = /^decisions\/([A-Z]+-[0-9]+)\/(.+)\.md$/.exec(rec);
    out.push({ kind: 'card', at: Date.parse(e.time), words: decisionWords(e), code: card ? `${card[1]} ${card[2]}` : rec,
      link: treeLink(project, tree, rec), proxy: e.proxy === true, path: rec });
  }
  const pending = [];
  const rulings = [];
  for (const path of tree.keys()) {
    const name = questionAnswerName(path);
    if (!name) continue;
    const h = history.get(path);
    if (!h) {
      pending.push(path);
      continue;
    }
    if (!h.oldest) continue;
    rulings.push({ path, name, at: Date.parse(h.oldest) });
  }
  for (const r of rulings) {
    const rec = records.get(r.path);
    if (!rec || rec.line1 === undefined) {
      r.unread = true;
      continue;
    }
    if (!isOwnerRuling(r.path, rec)) continue;
    // `clip`: a ruling's line 1 (not a profile approval's `Decision:`) is clipped to three lines on
    // display when longer (AC52, AC55; the owner's follow-up ruling, answer 2). The record is never edited.
    out.push({ kind: 'ruling', at: r.at, words: rulingWords(rec), code: r.name, link: treeLink(project, tree, r.path), proxy: rec.line2Proxy === true, path: r.path,
      clip: /^Ruling:/.test(String(rec.line1)) });
  }
  out.sort((a, b) => b.at - a.at);
  // A ruling not read yet that is newer than the newest known action may be the latest.
  const newest = out.length ? out[0].at : -Infinity;
  for (const r of rulings) if (r.unread && r.at >= newest) pending.push(r.path);
  return { actions: out, pending };
}

export const MERGES_WHY = "your merges aren't recorded in what the desk reads";

/**
 * "Your last action" (AC55): the latest of the owner's recorded actions, as "<words> · <time>",
 * then its code; "not recorded" with none; "not available yet" until every ruling's time (and the
 * line 1 of any that could be the latest) has arrived; a v2.5 project's own words.
 */
export function lastAction(project, model, snap, j, now, tz) {
  if (project.model !== 'v3') return { state: 'v25', text: 'Your last action: not recorded (operating model v2.5.1 records rulings in the ledger)', merges: MERGES_WHY };
  if (!snap || !snap.tree) return { state: 'pending', text: 'Your last action: not available yet', merges: MERGES_WHY };
  const { actions, pending } = ownerActions(project, model, snap, j);
  if (pending.length) return { state: 'pending', text: 'Your last action: not available yet', why: `${pending.length} ruling record${pending.length === 1 ? '' : 's'} still being read`, merges: MERGES_WHY };
  if (!actions.length) return { state: 'none', text: `Your last action: ${NOT_RECORDED}`, merges: MERGES_WHY };
  const a = actions[0];
  return { state: 'ok', action: a, words: `${a.words}${a.kind === 'ruling' && a.proxy ? ' (proxy)' : ''}`, when: whenText(new Date(a.at), now, tz),
    text: `Your last action: ${a.words}${a.kind === 'ruling' && a.proxy ? ' (proxy)' : ''} · ${whenText(new Date(a.at), now, tz)}`, code: a.code, link: a.link, merges: MERGES_WHY };
}

/**
 * "Done today" (AC52): the owner's actions answered today (in ownerTimeZone), newest first, each
 * saying what was ruled, in words, with its code after (note 10): a card by its decision entry's
 * time and J9's decision words; a ruling by its answer file's oldest commit and its line 1
 * without `Ruling:` (or a profile approval's `Decision:`). Only the owner's rulings count.
 */
export function doneToday(project, model, snap, now, tz, j = null) {
  const today = dayKey(now, tz);
  const { actions } = ownerActions(project, model, snap, j);
  return actions.filter((a) => dayKey(new Date(a.at), tz) === today).map((a) => ({
    kind: a.kind, text: `${a.words}${a.kind === 'ruling' && a.proxy ? ' (proxy)' : ''}`, code: a.code, link: a.link, at: a.at, clip: a.clip === true,
    line: a.words, proxy: a.kind === 'ruling' && a.proxy === true,
    words: `at ${hhmm(new Date(a.at), tz)}`,
  }));
}

export { stageName, entryWords, PHASE_OF_STAGE, OUTCOMES_PATH, ROUTING_PATH, whenText, durationText, tidyNote, newFileUrl, parseCardPath };

// ---------------------------------------------------------------------------
// AC51's Timeline is rebuilt by AC59 and AC60 (trial-view notes 2): its model is lib/feed.js's
// feedView. What stays of AC51 is its link rule (treeLink above) and AC22's own timeline in the
// Agents view.

/** A log row's shape (J9), or its own action words for a routed row of another kind. */
function shapeOf(o) {
  return entryShape(o) || (o && typeof o.action === 'string' ? o.action : null);
}

// ---------------------------------------------------------------------------
// AC49: the Team screen, each member's page, the summary sheet and the Working now sheet

/** Log rows with their shape and position: J11's every month once read, else the two J9 months. */
function shapedRows(model, j) {
  if (j && j.ready) {
    return j.logRows.map((o, i) => ({ ...o, shape: shapeOf(o), pos: i, month: j.logSource[i] }))
      .filter((e) => e.shape && typeof e.time === 'string');
  }
  return ((model && model.allEntries) || []).map((e, i) => ({ ...e, pos: i, month: e.label }));
}

const MEMBER_LABEL = { 'chief-of-staff': 'Chief of Staff', orchestrator: 'Orchestrator' };
const label = (id) => (Object.prototype.hasOwnProperty.call(MEMBER_LABEL, id) ? MEMBER_LABEL[id] : id.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()));

// ---------------------------------------------------------------------------
// J13: the Chief of Staff's session lines on the Team screen (AC49, AC67; from 2026-10-17)

/** A day in the owner's zone, "8 Oct" (AC67's dates), as feed.js's dayWords writes it. */
function dayWordsOf(ms, tz) {
  const k = dayKey(new Date(ms), tz).split('-');
  return `${Number(k[2])} ${MONTH_WORDS[Number(k[1]) - 1]}`;
}
const fig = (v, unit) => (typeof v === 'number' ? `${v.toLocaleString('en-US')} ${unit}` : `${unit} ${NOT_RECORDED}`);
const runTime = (v) => (typeof v === 'number' ? runTimeText(v) : `run time ${NOT_RECORDED}`);

/** A helper line's words (AC49): "<role> helper · <started> to <ended> · <tokens> tokens · <tool_uses> tool uses · <run time>", each null figure "not recorded". */
export function helperWords(l, now, tz) {
  const r = l.reported || {};
  return `${l.role} helper · ${whenText(new Date(l.startedAt), now, tz)} to ${whenText(new Date(l.at), now, tz)} · ${fig(r.tokens, 'tokens')} · ${fig(r.tool_uses, 'tool uses')} · ${runTime(r.duration_ms)}`;
}
/** An end line's words (AC49): "Handed back · <its usage's run time>". */
export const endWords = (l) => `Handed back · ${runTime(l.usage && l.usage.duration_ms)}`;
export const HELPER_FOR_COS = 'a helper session for the Chief of Staff';

/**
 * The Chief of Staff's state from its session lines (AC49, J13): { cs, status, last (AC49's words,
 * with a time), card (AC67's "last:", with a date), piece (the piece the tile names), working }.
 */
export function cosView(snap, now, tz) {
  const nowMs = now.getTime();
  const cs = cosSessions(snap, nowMs);
  if (cs.state === 'none') return { cs, status: 'No session recorded yet', last: NOT_RECORDED, card: `last: ${NOT_RECORDED}`, piece: null, working: [] };
  if (cs.state === 'reading') {
    const why = `${NOT_AVAILABLE}: its session files are still being read`;
    return { cs, status: NOT_AVAILABLE, last: why, card: `last: ${why}`, piece: null, working: [] };
  }
  const working = cs.pieces.filter((x) => x.state === 'working');
  // The latest recorded work: each piece at its end (or its start), each end line with no open piece at its time.
  const events = [...cs.pieces.map((x) => ({ at: x.end ? x.end.at : x.start.at, piece: x })), ...cs.orphans.map((o) => ({ at: o.line.at, orphan: o }))]
    .filter((e) => Number.isFinite(e.at)).sort((a, b) => a.at - b.at);
  const latest = working.length ? { piece: [...working].sort((a, b) => a.start.at - b.start.at).pop() } : events[events.length - 1] || null;
  let last = NOT_RECORDED;
  let card = `last: ${NOT_RECORDED}`;
  if (latest && latest.piece) {
    const x = latest.piece;
    if (x.state === 'ended') {
      last = `${x.start.doing}, ${whenText(new Date(x.end.at), now, tz)}`;
      card = `last: ${x.start.doing}, ${dayWordsOf(x.end.at, tz)}`;
    } else if (x.state === 'unrecorded') {
      last = `${x.start.doing}, ${ENDED_UNRECORDED}`;
      card = `last: ${x.start.doing}, ${dayWordsOf(x.start.at, tz)}, ${ENDED_UNRECORDED}`;
    } else {
      last = `${x.start.doing}, since ${whenText(new Date(x.start.at), now, tz)}`;
      card = `last: ${x.start.doing}, ${dayWordsOf(x.start.at, tz)}`;
    }
  } else if (latest && latest.orphan) {
    last = `Handed back (no recorded start), ${whenText(new Date(latest.orphan.line.at), now, tz)}`;
    card = `last: handed back (no recorded start), ${dayWordsOf(latest.orphan.line.at, tz)}`;
  }
  const endAt = latestEndAt(cs);
  let status = 'Idle';
  if (working.length) status = 'Working';
  else if (endAt != null && nowMs - endAt >= 0 && nowMs - endAt < JUST_FINISHED_MS) status = 'Just finished';
  return { cs, status, last, card, piece: latest && latest.piece ? latest.piece : null, working };
}

/** A roster member's latest helper line (J13; AC49, AC67), or null: `role` is its id. */
function memberHelper(cs, id) {
  const mine = helperLines(cs).filter((h) => h.line.role === id && Number.isFinite(h.line.at)).sort((a, b) => a.line.at - b.line.at);
  return mine.length ? mine[mine.length - 1] : null;
}

/** The Team screen (AC49). */
export function teamView(project, model, snap, j, q, ball, now, tz) {
  const nowMs = now.getTime();
  const rows = shapedRows(model, j);
  const owner = {
    waiting: q.waiting > 0,
    status: q.waiting ? `Waiting on you: ${q.waiting} in your queue` : 'Idle: nothing in your queue',
    next: q.rows.slice(0, OWNER_NEXT_LINES).map((r) => ({ text: r.text, code: r.code, wait: r.wait, raisedAt: r.raisedAt })),
  };
  if (project.model !== 'v3') {
    // A v2.5 project: J13 does not apply (v3 only); its Team screen keeps what it showed.
    return { owner, members: [{ id: 'chief-of-staff', label: 'Chief of Staff', status: "Its sessions aren't recorded", last: NOT_RECORDED, lit: false, glow: false }],
      note: `Agents: ${V25_NOT_RECORDED}`, rows };
  }
  let roster = [];
  let note = null;
  if (j && j.surfaces && j.surfaces.ok) roster = j.surfaces.members.map((m) => m.id);
  else {
    note = j && j.surfaces ? `${j.surfaces.note}: the members are those the dispatch log names` : (j && j.tree && j.tree.has(SURFACES_PATH) ? 'Reading the roster…' : 'No roster: the members are those the dispatch log names');
    roster = [...new Set(rows.filter((e) => e.role).map((e) => e.role))];
  }
  const ids = ['chief-of-staff', 'orchestrator', ...roster.filter((r) => r !== 'chief-of-staff' && r !== 'orchestrator')];
  const items = (model && model.items) || [];
  const cv = cosView(snap, now, tz);
  const members = ids.map((id) => {
    if (id === 'chief-of-staff') {
      return { id, label: label(id), status: cv.status, last: cv.last, card: cv.card, lit: cv.status === 'Working' || cv.status === 'Just finished', glow: false, cos: cv };
    }
    if (id === 'orchestrator') {
      const last = [...rows].reverse().find((e) => Object.prototype.hasOwnProperty.call(e, 'route') || e.shape === 'decision');
      return { id, label: label(id), status: 'Idle', last: last ? `last: ${entryWords(last, whenText(new Date(last.time), now, tz))}` : `not recorded in what the desk reads`, lit: false, glow: false };
    }
    const working = items.find((i) => i.state === 'dispatched' && i.running && i.running.role === id);
    if (working) return { id, label: label(id), status: 'Working', last: `on ${working.id}`, lit: true, glow: true, item: working.id };
    const lastOut = [...rows].reverse().find((e) => e.shape === 'outcome' && e.role === id);
    const lastAny = [...rows].reverse().find((e) => e.role === id && (e.shape === 'outcome' || e.shape === 'dispatch'));
    // A helper line naming this member is its recorded work (J13, AC49): it is the member's latest when
    // later than its latest outcome entry, and gives "Just finished", never "Working".
    const hl = cv.cs.state === 'ok' ? memberHelper(cv.cs, id) : null;
    const helperLatest = hl && (!lastOut || hl.line.at > Date.parse(lastOut.time)) ? hl : null;
    const helper = helperLatest ? { at: hl.line.at, line: hl.line, path: hl.path } : null;
    const helperText = helperLatest ? `${HELPER_FOR_COS}, ${whenText(new Date(hl.line.at), now, tz)}` : null;
    if (lastOut && nowMs - Date.parse(lastOut.time) >= 0 && nowMs - Date.parse(lastOut.time) < JUST_FINISHED_MS && !helperLatest) {
      return { id, label: label(id), status: 'Just finished', last: entryWords(lastOut, whenText(new Date(lastOut.time), now, tz)), lit: true, glow: false };
    }
    if (helperLatest && nowMs - hl.line.at >= 0 && nowMs - hl.line.at < JUST_FINISHED_MS) return { id, label: label(id), status: 'Just finished', last: helperText, lit: true, glow: false, helper };
    if (helperLatest) return { id, label: label(id), status: 'Idle', last: `last: ${helperText}`, lit: false, glow: false, helper };
    return { id, label: label(id), status: 'Idle', last: lastAny ? `last: ${entryWords(lastAny, whenText(new Date(lastAny.time), now, tz))}` : 'not recorded in what the desk reads', lit: false, glow: false };
  });
  return { owner, members, note, rows };
}

const newest = (list) => [...list].reverse();

/**
 * The owner's Rulings group (AC49): the latest is the ruling whose answer file's oldest commit
 * (J2's history read, as AC20) is newest; with no such read, "not recorded" with the reason.
 */
function rulingsGroup(paths, snap, link, now, tz) {
  const history = (snap && snap.history) || new Map();
  const timed = paths.map((p) => ({ p, at: history.get(p) && history.get(p).oldest ? Date.parse(history.get(p).oldest) : null }));
  const known = timed.filter((x) => Number.isFinite(x.at)).sort((a, b) => b.at - a.at);
  const latest = known.length ? `latest: ${known[0].p}, ${whenText(new Date(known[0].at), now, tz)}` : null;
  return { title: 'Rulings', count: paths.length, latest, latestWhy: 'latest: not recorded (no commit time read for the ruling files yet)',
    items: [...known.map((x) => x.p), ...timed.filter((x) => !Number.isFinite(x.at)).map((x) => x.p).sort().reverse()].map((p) => ({ text: p, link: link(p) })), why: null };
}

/** A member's page (AC49): status, what they are responsible for, and the running log. */
export function memberPage(project, model, snap, j, q, tv, id, now, tz) {
  const tree = (snap && snap.tree) || new Map();
  const rows = tv.rows;
  const at = (e) => whenText(new Date(e.time), now, tz);
  const link = (path) => treeLink(project, tree, path);
  let page;
  if (id === 'owner') {
    const decisionFiles = [...tree.keys()].filter((p) => parseAnswerPath(p)).sort();
    const rulingFiles = [...tree.keys()].filter((p) => questionAnswerName(p)).sort();
    const decisions = newest(rows.filter((e) => e.shape === 'decision'));
    page = { id, label: 'You', status: tv.owner.status, groups: [
      { title: 'Decisions', count: decisionFiles.length, latest: decisions[0] ? `latest: ${entryWords(decisions[0], at(decisions[0]))}` : null,
        latestWhy: 'latest: not recorded (no decision entry in the dispatch log the desk reads)',
        items: decisionFiles.slice().reverse().map((p) => ({ text: p, link: link(p) })), why: null },
      rulingsGroup(rulingFiles, snap, link, now, tz),
      { title: 'Verdicts', count: null, latest: null, items: [], why: `${NOT_RECORDED}: verdict files land on pull-request branches, and the desk reads only ${project.defaultBranch}` },
      { title: 'Merges', count: null, latest: null, items: [], why: `${NOT_RECORDED}: the desk reads only open pull requests, and status/merges.jsonl holds the Orchestrator's merges, not yours` },
    ], logEntries: rows.filter((e) => e.shape === 'decision' || e.shape === 'card') };
  } else if (id === 'chief-of-staff' && project.model === 'v3') {
    return cosPage(project, snap, tv, now, tz);
  } else if (id === 'chief-of-staff') {
    // A v2.5 project (J13 is v3 only): as before.
    const nr = `${NOT_RECORDED}: its sessions aren't logged yet (a model change)`;
    page = { id, label: 'Chief of Staff', status: "Its sessions aren't recorded", groups: [
      { title: 'Sessions', count: null, items: [], why: nr }, { title: 'Questions put to you', count: null, items: [], why: nr },
      { title: 'Notes and records', count: null, items: [], why: nr }], logEntries: [] };
  } else if (id === 'orchestrator') {
    const dispatches = rows.filter((e) => e.shape === 'dispatch');
    const cards = rows.filter((e) => e.shape === 'card');
    const anomalies = rows.filter((e) => e.shape === 'anomaly');
    const merges = j && j.merges ? j.merges : [];
    const tile = tv.members.find((m) => m.id === id);
    page = { id, label: 'Orchestrator', status: tile ? tile.status : 'Idle', groups: [
      { title: 'Dispatches', count: dispatches.length, latest: dispatches.length ? entryWords(dispatches[dispatches.length - 1], at(dispatches[dispatches.length - 1])) : null,
        items: newest(dispatches).map((e) => ({ text: entryWords(e, at(e)), link: link(e.month) })) },
      { title: 'Cards raised', count: cards.length, latest: cards.length ? entryWords(cards[cards.length - 1], at(cards[cards.length - 1])) : null,
        items: newest(cards).map((e) => ({ text: entryWords(e, at(e)), link: link(`queue/${e.item}-${e.gate}-${e.card}.md`) })) },
      { title: 'Merges by the merge gate', count: j && j.ready ? merges.length : null, latest: merges.length ? `latest: ${merges[merges.length - 1].item}` : null,
        items: newest(merges).map((m) => ({ text: `${m.item} merged`, link: m.merge ? commitLink(project, m.merge) : null })), why: j && j.ready ? null : NOT_AVAILABLE },
      { title: 'Anomalies', count: anomalies.length, latest: anomalies.length ? entryWords(anomalies[anomalies.length - 1], at(anomalies[anomalies.length - 1])) : null,
        items: newest(anomalies).map((e) => ({ text: `${entryWords(e, at(e))}: ${e.error}`, link: link(e.month) })) },
    ], logEntries: rows.filter((e) => e.shape === 'dispatch' || e.shape === 'card' || e.shape === 'done' || e.shape === 'anomaly') };
  } else {
    const tile = tv.members.find((m) => m.id === id);
    if (!tile) return null;
    const sessions = rows.filter((e) => e.shape === 'dispatch' && e.role === id);
    const returns = rows.filter((e) => e.shape === 'outcome' && e.role === id);
    const recs = [...new Set(returns.map((e) => e.record).filter((r) => typeof r === 'string'))];
    const none = 'not recorded in what the desk reads';
    page = { id, label: tile.label, status: tile.status, groups: [
      { title: 'Sessions', count: sessions.length, latest: sessions.length ? entryWords(sessions[sessions.length - 1], at(sessions[sessions.length - 1])) : null,
        items: newest(sessions).map((e) => ({ text: entryWords(e, at(e)), link: link(`status/${e.item}.toml`) })), why: sessions.length ? null : none },
      { title: 'Returns', count: returns.length, latest: returns.length ? entryWords(returns[returns.length - 1], at(returns[returns.length - 1])) : null,
        items: newest(returns).map((e) => ({ text: entryWords(e, at(e)), link: link(e.record) })), why: returns.length ? null : none },
      { title: 'Records written', count: recs.length, latest: recs.length ? recs[recs.length - 1] : null,
        items: recs.slice().reverse().map((r) => ({ text: r, link: link(r) })), why: recs.length ? null : none },
    ], logEntries: rows.filter((e) => e.role === id && (e.shape === 'dispatch' || e.shape === 'outcome')) };
  }
  // The running log, newest at the top, a lane per item (the main line is the project).
  const entries = newest(page.logEntries).slice(0, 60);
  const merged = new Set(((j && j.merges) || []).map((m) => m.item));
  const items = (model && model.items) || [];
  const working = items.find((i) => i.state === 'dispatched' && i.running && i.running.role === id) || null;
  const log = entries.map((e) => {
    const isNow = Boolean(working && e.shape === 'dispatch' && e.item === working.id && working.running && working.running.since
      && Date.parse(e.time) === working.running.since.getTime());
    return { text: entryWords(e, at(e)), lane: e.item || null, entry: e, now: isNow };
  });
  // J13 (from 2026-10-17): each helper line naming this member, a row of its own on the main line at its `ended`, with the Chief of Staff's words.
  if (id !== 'owner' && id !== 'orchestrator') {
    const cs = cosSessions(snap, now.getTime());
    const mine = cs.state === 'ok' ? helperLines(cs).filter((x) => x.line.role === id && Number.isFinite(x.line.at)).sort((a, b) => b.line.at - a.line.at) : [];
    for (const x of mine) {
      const row = { text: helperWords(x.line, now, tz), lane: null, entry: { shape: 'cos-helper', time: x.line.ended, line: x.line, path: x.path }, now: false };
      const i = log.findIndex((r) => Date.parse(r.entry.time) < x.line.at);
      log.splice(i < 0 ? log.length : i, 0, row);
    }
  }
  const layout = branchLayout(log, (lane, rows) => {
    // Filed: its line in status/merges.jsonl, or its newest row a record of the work filed (AC49): an
    // outcome with its `record`; for the owner's lanes, a decision with its answer file (`record`);
    // for the Orchestrator's, the item's `done` line.
    const topRow = log[rows[0]].entry;
    return merged.has(lane) || ((topRow.shape === 'outcome' || topRow.shape === 'decision') && typeof topRow.record === 'string') || topRow.shape === 'done';
  });
  const lanes = layout.lanes.map((l) => l.id);
  const upNext = [];
  if (working) {
    const it = items.find((x) => x.id === working.id);
    upNext.push('Next: the Orchestrator routes its return (what the model does next, not a record)');
    if (it && it.next) upNext.push(it.next);
  }
  return { ...page, log, lanes, layout, working: Boolean(working), workingItem: working ? working.id : null, upNext,
    logWords: id === 'chief-of-staff' ? "Its sessions aren't recorded, so there is no running log." : 'not recorded in what the desk reads' };
}

/**
 * The Chief of Staff's page (AC49, J13; from 2026-10-17): its status; "Pieces of work" and "Helpers"
 * counted from its session lines, with the groups no record fills "not recorded"; and its running
 * log, each piece of work a lane that leaves the main line at its start line's row and joins back at
 * its end line's row (a piece under way ends in the dashed stub, its latest row ringed "now"; one
 * ended unrecorded ends in the dashed stub with "ended, time not recorded" on its last row); an end
 * line with no open piece, and a helper with none, on the main line. No "Up next".
 */
function cosPage(project, snap, tv, now, tz) {
  const tree = (snap && snap.tree) || new Map();
  const tile = tv.members.find((m) => m.id === 'chief-of-staff');
  const cv = tile && tile.cos ? tile.cos : cosView(snap, now, tz);
  const cs = cv.cs;
  const t = (ms) => whenText(new Date(ms), now, tz);
  const link = (path) => treeLink(project, tree, path);
  const na = cs.state === 'reading' ? `${NOT_AVAILABLE}: its session files are still being read` : null;
  const none = cs.state === 'none' ? `${NOT_RECORDED}: no session file on ${project.defaultBranch} yet` : null;
  const helpers = helperLines(cs).filter((x) => Number.isFinite(x.line.at)).sort((a, b) => a.line.at - b.line.at);
  const pieces = cs.pieces;
  const pieceWords = (x) => `${x.start.doing} · ${x.state === 'ended' ? `handed back ${t(x.end.at)}` : x.state === 'unrecorded' ? ENDED_UNRECORDED : 'under way'}`;
  const noRecord = `${NOT_RECORDED}: no record the desk reads ties these to the Chief of Staff`;
  const files = cs.paths.filter((x) => !cs.missing.includes(x));
  const groups = [
    { title: 'Sessions', count: na || none ? null : files.length, latest: files.length ? `latest: ${files[files.length - 1]}` : null,
      items: [...files].reverse().map((x) => ({ text: x, link: link(x) })), why: na || none || (files.length ? null : 'none yet') },
    { title: 'Pieces of work', count: na || none ? null : pieces.length, latest: pieces.length ? `latest: ${pieceWords(pieces[pieces.length - 1])}` : null,
      items: [...pieces].reverse().map((x) => ({ text: pieceWords(x), link: link(x.path) })), why: na || none || (pieces.length ? null : 'none yet') },
    { title: 'Helpers', count: na || none ? null : helpers.length, latest: helpers.length ? `latest: ${helperWords(helpers[helpers.length - 1].line, now, tz)}` : null,
      items: [...helpers].reverse().map((x) => ({ text: helperWords(x.line, now, tz), link: link(x.path) })), why: na || none || (helpers.length ? null : 'none yet') },
    { title: 'Questions put to you', count: null, items: [], why: noRecord },
    { title: 'Notes and records', count: null, items: [], why: noRecord },
  ];
  // The rows, each at its line's time; newest at the top.
  const rows = [];
  const byLane = new Map();
  for (const x of pieces) {
    const lane = `${x.session} line ${x.start.n}`; // the piece by its start line: its file and line
    byLane.set(lane, x);
    rows.push({ at: x.start.at, text: `Started: ${x.start.doing} · ${t(x.start.at)}`, lane, entry: { shape: 'cos-start', line: x.start, path: x.path, time: x.start.time } });
    for (const hl of x.helpers) rows.push({ at: hl.at, text: helperWords(hl, now, tz), lane, entry: { shape: 'cos-helper', line: hl, path: x.path, time: hl.ended } });
    if (x.end) rows.push({ at: x.end.at, text: `${endWords(x.end)} · ${t(x.end.at)}`, lane, entry: { shape: 'cos-end', line: x.end, path: x.path, time: x.end.time } });
  }
  for (const o of cs.orphans) {
    rows.push({ at: o.line.at, text: `Handed back (no recorded start) · ${runTime(o.line.usage && o.line.usage.duration_ms)} · ${t(o.line.at)}`, lane: null,
      entry: { shape: 'cos-end', line: o.line, path: o.path, time: o.line.time } });
  }
  for (const hl of cs.looseHelpers) {
    rows.push({ at: hl.line.at, text: `${helperWords(hl.line, now, tz)} · a helper with no recorded piece of work`, lane: null,
      entry: { shape: 'cos-helper', line: hl.line, path: hl.path, time: hl.line.ended } });
  }
  const sorted = rows.map((r, i) => [r, i]).sort((a, b) => b[0].at - a[0].at || b[1] - a[1]).map(([r]) => r).slice(0, 60);
  // A lane's last (newest) row: "now" while under way; "ended, time not recorded" when it ended unrecorded.
  const seen = new Set();
  const log = sorted.map((r) => {
    const x = r.lane ? byLane.get(r.lane) : null;
    const first = r.lane && !seen.has(r.lane);
    if (r.lane) seen.add(r.lane);
    const now0 = Boolean(first && x && x.state === 'working');
    const text = first && x && x.state === 'unrecorded' ? `${r.text} · ${ENDED_UNRECORDED}` : r.text;
    return { text, lane: r.lane, entry: r.entry, now: now0 };
  });
  const layout = branchLayout(log, (lane) => Boolean(byLane.get(lane) && byLane.get(lane).state === 'ended'));
  return { id: 'chief-of-staff', label: 'Chief of Staff', status: cv.status, groups, logEntries: [], log, lanes: layout.lanes.map((l) => l.id), layout,
    working: cv.working.length > 0, workingItem: null, upNext: [], cos: cv, sessionLines: true,
    logWords: na || (none ? `No session recorded yet: ${none}.` : 'No session line recorded yet.') };
}

/**
 * The running log's branch drawing (AC49, note 11), as the agreed screen 3 draws it: one drawing
 * behind every row; the main line and each lane straight and vertical at one place across; a lane
 * leaves the main line with one curve at its oldest row and joins back with one curve at the row
 * where its work is filed, or ends in a short dashed stub; a lane already open at the oldest row
 * shown runs in straight from the edge; lanes open at the same time sit at different places; each
 * row's dot on its own lane's line. Rows are newest first: row 0 is the top.
 * filed(lane, rowIndexes newest first) says whether the lane's work is filed.
 * Returns { rows: n, slots, lanes: [{ id, slot, shade, top, bottom, fork, join, stub, edge }],
 * dots: [{ row, slot (0 is the main line), now }] }.
 */
export function branchLayout(log, filed) {
  const n = log.length;
  const byLane = new Map();
  log.forEach((r, i) => {
    if (!r.lane) return;
    if (!byLane.has(r.lane)) byLane.set(r.lane, []);
    byLane.get(r.lane).push(i);
  });
  const lanes = [...byLane.entries()].map(([id, rows]) => ({ id, rows, top: rows[0], bottom: rows[rows.length - 1] }));
  // Places across, like a git graph: from the oldest row up, a lane takes the lowest free place when
  // it opens and frees it above its top row, so lanes open at the same time never share one.
  const used = new Map(); // slot → lane
  for (const l of [...lanes].sort((a, b) => b.bottom - a.bottom || a.top - b.top)) {
    let slot = 1;
    for (;;) {
      const other = used.get(slot);
      // a row's gap between two lanes in one place, so a join and the next fork never meet
      if (!other || !other.some((o) => !(o.top > l.bottom + 1 || o.bottom < l.top - 1))) break;
      slot++;
    }
    l.slot = slot;
    if (!used.has(slot)) used.set(slot, []);
    used.get(slot).push(l);
  }
  let shade = 0;
  for (const l of [...lanes].sort((a, b) => b.bottom - a.bottom)) l.shade = shade++ % 4;
  for (const l of lanes) {
    l.edge = l.bottom === n - 1; // already open at the oldest row shown: runs in from the edge, no fork
    l.fork = !l.edge;
    const isFiled = Boolean(filed && filed(l.id, l.rows));
    l.join = isFiled ? l.top : null;
    l.stub = !isFiled;
    delete l.rows;
  }
  const slotOf = new Map(lanes.map((l) => [l.id, l.slot]));
  const dots = log.map((r, i) => ({ row: i, slot: r.lane ? slotOf.get(r.lane) : 0, now: Boolean(r.now) }));
  return { rows: n, slots: Math.max(0, ...lanes.map((l) => l.slot)), lanes, dots };
}

/** The Working now sheet (AC49): one line, four tiles and three short lines, each from a record or "–" with the reason. */
export function workingNow(project, model, snap, j, id, page, now, tz) {
  const items = (model && model.items) || [];
  const it = items.find((i) => i.state === 'dispatched' && i.running && i.running.role === id);
  const dash = (why) => ({ value: '–', why });
  if (id === 'chief-of-staff') {
    const cv = page && page.cos ? page.cos : cosView(snap, now, tz);
    if (cv.piece) return cosWorkingNow(cv.cs, cv.piece, now, tz);
  }
  if (id === 'chief-of-staff' || !it) {
    const nr = id === 'chief-of-staff' ? `${NOT_RECORDED}: no piece of its work is under way` : NOT_RECORDED;
    return { doing: `${label(id)}: not working now`,
      tiles: [{ label: 'Started', ...dash(nr) }, { label: 'Time so far', ...dash(nr) }, { label: 'Last check-in', ...dash(NOT_RECORDED) }, { label: 'Next check-in', ...dash(NOT_RECORDED) }],
      lines: [{ label: 'Update', value: '–', why: NOT_RECORDED }, { label: 'Next', value: '–', why: NOT_RECORDED }, { label: 'Cost', value: '–', why: nr }] };
  }
  const since = it.running.since;
  const due = nextOrchestratorRun(j, now);
  const rows = ((model && model.allEntries) || []).filter((e) => e.item === it.id);
  const lastE = rows[rows.length - 1];
  return {
    doing: `${it.running.role} on ${it.id}, ${String(it.stage).replace(/^[0-9]+ /, '')}`,
    tiles: [
      { label: 'Started', ...(since ? { value: whenText(since, now, tz), why: null } : dash(`${NOT_RECORDED}: no dispatched_at in status/${it.id}.toml`)) },
      { label: 'Time so far', ...(!since ? dash(NOT_RECORDED) : now - since < 0 ? dash("not available: the start is later than this device's clock")
        : { value: durationText(now - since), why: 'counted from the start', since: since.getTime() }) },
      { label: 'Last check-in', ...(it.asOf ? { value: whenText(it.asOf, now, tz), why: 'the latest dispatch-log entry naming it' } : dash(NOT_RECORDED)) },
      { label: 'Next check-in', ...(due ? { value: hhmm(due, tz), why: "the Orchestrator's next run by its schedule" } : dash('schedule not readable')) },
    ],
    lines: [
      { label: 'Update', value: lastE ? entryWords(lastE, whenText(new Date(lastE.time), now, tz)) : '–', why: lastE ? null : NOT_RECORDED },
      { label: 'Next', value: 'the Orchestrator routes its return', why: 'a fixed statement of what the model does next, not a record' },
      { label: 'Cost', value: '–', why: 'from the usage record when it ends' },
    ],
  };
}

export const COS_COST_NR = "not recorded: the Chief of Staff can't read its own cost";

/**
 * The Working now sheet for a piece of the Chief of Staff's work (AC49, J13), from its lines:
 * Doing, Started, Time so far, Last check-in, Next check-in, Update, Next and Cost.
 */
export function cosWorkingNow(cs, piece, now, tz) {
  const dash = (why) => ({ value: '–', why });
  const nowMs = now.getTime();
  const file = cs.pieces.filter((x) => x.path === piece.path);
  const times = [...file.flatMap((x) => [x.start.at, ...x.helpers.map((hl) => hl.at), ...(x.end ? [x.end.at] : [])]),
    ...cs.orphans.filter((o) => o.path === piece.path).map((o) => o.line.at), ...cs.looseHelpers.filter((o) => o.path === piece.path).map((o) => o.line.at)].filter(Number.isFinite);
  const lastAt = times.length ? Math.max(...times) : null;
  const helper = [...piece.helpers].filter((hl) => Number.isFinite(hl.at)).sort((a, b) => a.at - b.at).pop() || null;
  const since = piece.start.at;
  const cost = piece.end && piece.end.usage && typeof piece.end.usage.cost_usd_estimate === 'number'
    ? { value: costText(piece.end.usage.cost_usd_estimate), why: "from its end line's usage" } : dash(COS_COST_NR);
  return {
    doing: `Chief of Staff: ${piece.start.doing}`,
    tiles: [
      { label: 'Started', value: whenText(new Date(since), now, tz), why: null },
      { label: 'Time so far', ...(nowMs - since < 0 ? dash("not available: the start is later than this device's clock") : { value: durationText(nowMs - since), why: 'counted from the start', since }) },
      { label: 'Last check-in', ...(lastAt != null ? { value: whenText(new Date(lastAt), now, tz), why: "the latest time among the session's lines" } : dash(NOT_RECORDED)) },
      { label: 'Next check-in', ...dash('the Chief of Staff runs on no schedule') },
    ],
    lines: [
      { label: 'Update', value: helper ? helperWords(helper, now, tz) : '–', why: helper ? null : 'no helper recorded yet' },
      { label: 'Next', value: 'hands the work back to you', why: "a fixed statement of the model's rule (S-033 AC6: an end line when it hands the work back), not a record" },
      { label: 'Cost', ...cost },
    ],
  };
}

/** An end line's usage figures for its summary sheet (AC49, J13): each as AC23 shows it, `null` "not recorded". */
export function cosUsageLines(u) {
  const f = (k) => (u && typeof u[k] === 'number' ? u[k].toLocaleString('en-US') : NOT_RECORDED);
  return [
    `Tokens: input ${f('input_tokens')}, output ${f('output_tokens')}, cache read ${f('cache_read_input_tokens')}, cache write ${f('cache_creation_input_tokens')} · turns ${f('num_turns')}`,
    `Run time: ${runTime(u && u.duration_ms)}`,
    `Context peak: ${f('context_peak')}; window ${f('context_window')}; compaction threshold ${f('autocompact_threshold')}`,
    `Would have stopped: ${u && typeof u.would_have_stopped === 'boolean' ? (u.would_have_stopped ? 'yes' : 'no') : NOT_RECORDED}`,
    `Compactions: ${f('compactions')}`,
    `Cost: ${u && typeof u.cost_usd_estimate === 'number' ? costText(u.cost_usd_estimate) : NOT_RECORDED}`,
  ];
}

/** The summary sheet behind a log row (AC49): What happened, Why, For you; the standard summary only. */
export function summarySheet(project, snap, row, q) {
  const tree = (snap && snap.tree) || new Map();
  const e = row.entry;
  const shape = e.shape;
  // A session line's row (J13): its words and the line as written, linked to its file; Why and For you not recorded.
  if (/^cos-/.test(shape)) {
    const why = 'not recorded in the session line';
    return { what: row.text, quote: e.line.raw, link: treeLink(project, tree, e.path), why, forYou: why,
      figures: shape === 'cos-end' ? cosUsageLines(e.line.usage) : null };
  }
  const quote = (() => {
    const o = { ...e };
    for (const k of ['shape', 'pos', 'month', 'line', 'label', 'retry', 'prev']) delete o[k];
    return JSON.stringify(o);
  })();
  let link = null;
  if (shape === 'outcome') link = treeLink(project, tree, e.record);
  else if (shape === 'card') link = treeLink(project, tree, `queue/${e.item}-${e.gate}-${e.card}.md`);
  else if (shape === 'decision') link = treeLink(project, tree, e.record);
  if (!link) link = treeLink(project, tree, e.month);
  let why = NOT_RECORDED;
  if (Number.isInteger(e.stage) || typeof e.route === 'string') why = `${Number.isInteger(e.stage) ? `stage ${stageName(e.stage)}` : 'stage not recorded'}${e.route ? `, route ${e.route}` : ''}`;
  else if (shape === 'outcome' && typeof e.session === 'string') {
    const parts = e.session.split(':');
    why = `the session dispatched by route ${parts[1] || NOT_RECORDED}`;
  }
  const raised = q.rows.find((r) => r.flag && r.flag.kind === 'card' && r.flag.card.item === e.item);
  return { what: entryWords(e, e.time ? e.time.slice(0, 10) : NOT_RECORDED).replace(/, \d{4}-\d{2}-\d{2}$/, ''), quote, link, why,
    forYou: raised ? `${raised.text} (${raised.code}), in your queue` : 'Nothing for you' };
}
