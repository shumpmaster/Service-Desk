// AC79 on the page (spec S-001, 2026-10-19; the owner's ruling decisions/questions/P-001-answer-pr-on-desk.md,
// line 1: "pull requests the automatic job may merge itself show, while open and not yet left for the
// owner, as "Being recorded by the automatic job", not counted as waiting on the owner; one the job
// leaves for the owner counts again at once").
//
// What the page knows of the asks-merge job's candidates in one opening, and the staged reads that keep
// it current: the candidates' check runs, statuses and workflow runs and the project's latest asks-merge
// runs ride the poll call as conditional reads (J1, J6); a blob call of its own is made only in a poll
// where something changed (a list answered 200, a new head, the ledger's sha), carrying the head times,
// the ledger and the job's logs that a dry pass of J16's own judgment (src/lib/jobcand.js) says it needs;
// at most 3 such calls per candidate head per opening, failures included. Every doubt counts: a pending,
// failed or capped read, a list with a next page, a sixth candidate, a retried reason, a grant the job's
// own grant line has not confirmed. Nothing here is kept on the device. Pure but for the state object
// it is handed; no network, no DOM.

import { judgeCandidate, isJudgingRun } from './jobcand.js';
import { formGrant, LEDGER_REL, ASKS_MERGE_WORKFLOW } from './ledgergrant.js';
import { jobKindsByPath } from './prfiles.js';

// The words of a candidate counted again (AC79, "What the owner sees"); "Being recorded by the automatic
// job" itself is the model's (src/lib/model.js `BEING_RECORDED_WORDS`).
export const LEFT_WORDS = 'The automatic job left this for you';
export const NO_CHECK_WORDS = 'No checks have started on it for 30 minutes';
// AC79: at most 5 candidates a project are read; a sixth counts until one closes.
export const MAX_CANDIDATES = 5;
// AC79's one cap (the Orchestrator's call on the plan review's A, round 2): 3 AC79 blob calls per
// candidate head per opening, every one counted, failures and retries included.
export const CALLS_PER_HEAD = 3;
// The blob call's limits for AC79's reads (J6): 5 head times and 5 log forms a call.
export const LOGS_PER_CALL = 5;
export const TIMES_PER_CALL = 5;
// Rule (c)'s words wait 30 minutes from when the page first saw the head (the plan review's G on D4, round 2).
export const NO_CHECK_WORDS_AFTER_MS = 30 * 60e3;
const LISTS = ['checkRuns', 'statuses', 'workflowRuns'];
const LIST_KEY = { checkRuns: 'check_runs', statuses: null, workflowRuns: 'workflow_runs' };
const SHA_RE = /^[0-9a-f]{40}$/;
const GRANT_RE = /^NOTE: the asks-merge grant is (L-\d{4,}[a-z]?)\b/;
const NO_GRANT_RE = /^NOTE: no asks-merge grant stands/;
const PR_NUM_RE = /^PR #(\d+):/;
// The page cannot check that a dispatched run's commit is on the default branch (a tag can be named like
// it), so it takes no grant line from a `workflow_dispatch` run (security review round 1, C).
const DISPATCH = 'workflow_dispatch';

/** A fresh opening's state for one project. */
export function newJobsState() {
  return {
    runsEtag: null, runs: null, runsFailed: false,
    heads: new Map(), // sha → head state, for the opening
    active: new Set(), // the heads read now (at most 5)
    logs: new Map(), // run id (string) → { state: 'ok', ran, job, lines } | { state: 'failed' } | { state: 'too-large' }
    // The ledger's text is kept for the opening, so its form is checked again against each cycle's tree.
    ledger: { sha: null, form: undefined, failed: false, text: null },
    // The grant line's epoch: `since` the page time it saw the ledger (−∞ at the opening); a failed grant
    // read is not retried until the next opening or the next change of the ledger's sha.
    grant: { since: -Infinity, failed: false },
    changed: false, calls: 0, verdicts: new Map(),
  };
}

/** Whether the project can have job candidates at all: a v3 project whose tree holds asks-merge.yml and the ledger. */
export function jobsPossible(project, tree) {
  return Boolean(project && project.model === 'v3' && tree && tree.has(ASKS_MERGE_WORKFLOW) && tree.has(LEDGER_REL));
}

/**
 * J16's job candidates by path (AC79's "Which pull requests"), from the flagged pull requests: open,
 * non-draft, into the default branch, from the project's own branches, with a 40-hex head, J20's files
 * read at that head, under the 300-file cap, every path one of the job's kinds. Sorted by number.
 * files: Map(number → { headSha, changes, capped }).
 */
export function pathCandidates(project, flaggedPulls, files) {
  const own = (r) => typeof r === 'string' && r.toLowerCase() === String(project.repo).toLowerCase();
  const out = [];
  for (const pr of flaggedPulls || []) {
    if (!pr || pr.draft || pr.base !== project.defaultBranch || !own(pr.headRepo) || !SHA_RE.test(pr.headSha || '')) continue;
    const f = files ? files.get(pr.number) : null;
    if (!f || f.headSha !== pr.headSha || f.capped || !jobKindsByPath(f.changes)) continue;
    out.push(pr);
  }
  return out.sort((a, b) => a.number - b.number);
}

function headState(js, pr, nowMs) {
  let h = js.heads.get(pr.headSha);
  if (!h) {
    // Kept for the opening even when the head stops being read, so its first sight, its calls and its
    // cap hold for the whole opening (AC79: "per candidate head per opening").
    h = { sha: pr.headSha, number: pr.number, etags: {}, lists: {}, failed: {}, more: {}, firstSeenMs: nowMs, calls: 0,
      headTime: undefined, capped: false, sticky: null };
    js.heads.set(pr.headSha, h);
    js.changed = true; // a new head
  }
  h.number = pr.number;
  h.createdAt = pr.createdAt;
  return h;
}

/**
 * Note the candidates read now (the first 5): their heads are the ones the poll asks about. A head no
 * longer read drops its lists and ETags (its first sight, calls and cap are kept). Returns the
 * candidates read, in order; any further candidate counts.
 */
export function trackCandidates(js, cands, nowMs) {
  const read = cands.slice(0, MAX_CANDIDATES);
  const keep = new Set(read.map((p) => p.headSha));
  for (const h of js.heads.values()) {
    if (keep.has(h.sha) || !js.active.has(h.sha)) continue;
    h.etags = {};
    h.lists = {};
    h.failed = {};
    h.more = {};
  }
  for (const pr of read) {
    const h = headState(js, pr, nowMs);
    if (!js.active.has(h.sha)) js.changed = true;
  }
  js.active = keep;
  return read;
}

/** The poll call's `jobs` part for these heads (J6), with the ETags held. */
export function pollPart(js) {
  const heads = [...js.heads.values()].filter((h) => js.active.has(h.sha)).map((h) => ({ sha: h.sha, etags: Object.fromEntries(LISTS.map((l) => [l, h.etags[l] || null])) }));
  return { runs: { etag: js.runsEtag }, heads };
}

function parseList(raw, list) {
  try {
    const v = JSON.parse(raw);
    const items = LIST_KEY[list] ? v && v[LIST_KEY[list]] : v;
    return Array.isArray(items) ? items : null;
  } catch {
    return null;
  }
}

/**
 * The poll response's `jobs` field (J6): a raw page (200), `null` (304: the page reuses what it holds
 * for that list, and a 304 for a list it never held counts), `false` (failed: that candidate counts this
 * poll). A `null` part, or no part when one was sent, fails every head this poll.
 */
export function applyPollAnswer(js, sent, answer) {
  if (!sent) return;
  if (!answer || typeof answer !== 'object') {
    js.runsFailed = true;
    for (const h of js.heads.values()) if (js.active.has(h.sha)) for (const l of LISTS) h.failed[l] = true;
    return;
  }
  const et = answer.etags && typeof answer.etags === 'object' ? answer.etags : {};
  // The asks-merge runs page.
  const r = answer.runs;
  if (typeof r === 'string') {
    const items = parseList(r, 'workflowRuns');
    js.runs = items ? { list: items } : null;
    js.runsFailed = !items;
    js.runsEtag = items ? (typeof et.runs === 'string' ? et.runs : null) : null;
    js.changed = true;
  } else if (r === null && js.runs) {
    js.runsFailed = false;
    if (typeof et.runs === 'string') js.runsEtag = et.runs;
  } else {
    js.runsFailed = true;
    js.runsEtag = r === null ? null : js.runsEtag; // a 304 for nothing held: read in full next time
  }
  const heads = answer.heads && typeof answer.heads === 'object' ? answer.heads : {};
  const next = answer.next && typeof answer.next === 'object' ? answer.next : {};
  const hEt = et.heads && typeof et.heads === 'object' ? et.heads : {};
  for (const h of js.heads.values()) {
    if (!sent.has(h.sha) || !js.active.has(h.sha)) continue;
    const a = heads[h.sha];
    const tags = hEt[h.sha] && typeof hEt[h.sha] === 'object' ? hEt[h.sha] : {};
    const more = Array.isArray(next[h.sha]) ? next[h.sha] : [];
    for (const l of LISTS) {
      const v = a && typeof a === 'object' ? a[l] : false;
      if (typeof v === 'string') {
        const items = parseList(v, l);
        h.lists[l] = items;
        h.failed[l] = !items;
        h.more[l] = more.includes(l);
        h.etags[l] = items && typeof tags[l] === 'string' ? tags[l] : null;
        js.changed = true;
      } else if (v === null && h.lists[l]) {
        h.failed[l] = false;
        if (typeof tags[l] === 'string') h.etags[l] = tags[l];
      } else {
        h.failed[l] = true;
        if (v === null) h.etags[l] = null; // a 304 for a list never held: read in full next time
      }
    }
  }
}

/**
 * AC79 (build review round 1, A): the ledger's form check against the tree as it stands now, every
 * cycle, so a decided_by record deleted with the ledger unchanged leaves no grant on the page (the
 * sender's find_grant finds none either), and the page counts.
 */
export function recheckForm(js, tree) {
  if (typeof js.ledger.text === 'string') js.ledger.form = formGrant(js.ledger.text, (p) => tree.has(p));
}

/** Note the ledger's sha in the tree: a change starts the grant line's epoch again (AC79). */
export function noteLedger(js, tree, nowMs) {
  const e = tree ? tree.get(LEDGER_REL) : null;
  const sha = e ? e.sha : null;
  if (sha === js.ledger.sha) return;
  const first = js.ledger.sha === null && js.ledger.form === undefined;
  js.ledger = { sha, form: sha ? undefined : null, failed: false, text: null };
  js.grant = { since: first ? -Infinity : nowMs, failed: false };
  js.changed = true;
}

const ms = (t) => (typeof t === 'string' ? Date.parse(t) : NaN);
const runDone = (r) => r && r.status === 'completed' && r.conclusion !== 'skipped' && r.conclusion !== 'cancelled';

/** The judging runs whose `merge` job may have run since the grant's epoch, newest first, dispatched ones included. */
function judgingRuns(js, project) {
  return ((js.runs && js.runs.list) || []).filter((r) => isJudgingRun(r, project.defaultBranch) && runDone(r)
    && ms(r.run_started_at) > js.grant.since)
    .sort((x, y) => ms(y.run_started_at) - ms(x.run_started_at) || y.id - x.id);
}

/** The runs a grant line may come from (J16 rule (b), AC79): judging runs, never a dispatched one. */
const grantRuns = (js, project) => judgingRuns(js, project).filter((r) => r.event !== DISPATCH);

/** The pull request numbers a kept log names in its `PR #n:` lines. */
const namedIn = (lines) => new Set((lines || []).map((l) => PR_NUM_RE.exec(l)).filter(Boolean).map((m) => Number(m[1])));

/**
 * Security review round 1, C: when the newest judging run is a `workflow_dispatch` run, every candidate
 * it names counts (the page cannot check its commit is the default branch's). { want: run id | null,
 * all: true (its log unread or failed: every candidate counts) | false, names: Set }, or null.
 */
function dispatchOnTop(js, project) {
  const top = judgingRuns(js, project)[0];
  if (!top || top.event !== DISPATCH) return null;
  const L = js.logs.get(String(top.id));
  if (!L) return { want: String(top.id), all: true, names: new Set() };
  if (L.state !== 'ok') return { want: null, all: true, names: new Set() };
  return { want: null, all: false, names: L.ran ? namedIn(L.lines) : new Set() };
}

/**
 * The grant on the page (AC79): the ledger's form check and the job's own grant line agree. Returns
 * { stands, noneByJob, want: run id | null (the grant read still to make), failed }.
 * - the job's word is the newest judging run read in this opening (since the ledger last changed) whose
 *   `merge` job ran: its `NOTE: the asks-merge grant is <id>` must name the ledger's id;
 * - `NOTE: no asks-merge grant stands` there is rule (d) by the job's own log (noneByJob);
 * - no such run read yet, a run with no grant line, another id, or a failed read: no grant (counts).
 */
export function grantOnPage(js, project) {
  const g = grantFrom(js, project);
  g.dispatch = js.ledger.form ? dispatchOnTop(js, project) : null;
  return g;
}

function grantFrom(js, project) {
  const form = js.ledger.form;
  if (form === null || js.ledger.failed) return { stands: false, noneByJob: false, want: null, failed: js.ledger.failed };
  // A failed grant read: every pull request counts until the next opening or ledger change (AC79).
  if (js.grant.failed) return { stands: false, noneByJob: false, want: null, failed: true };
  const runs = grantRuns(js, project);
  let newest = null;
  for (const r of runs) {
    const L = js.logs.get(String(r.id));
    if (L && L.state === 'ok' && L.ran) {
      newest = L;
      break;
    }
  }
  if (!newest) {
    const want = runs.find((r) => !js.logs.has(String(r.id)));
    return { stands: false, noneByJob: false, want: want ? String(want.id) : null, failed: false };
  }
  let id = null;
  let none = false;
  for (const l of newest.lines || []) {
    const g = GRANT_RE.exec(l);
    if (g) {
      id = g[1];
      break;
    }
    if (NO_GRANT_RE.test(l)) {
      none = true;
      break;
    }
  }
  return { stands: Boolean(form && id && form.id === id), noneByJob: none, want: null, failed: false };
}

/** A run of the asks-merge runs page, by id. */
const runById = (js, id) => ((js.runs && js.runs.list) || []).find((r) => r && String(r.id) === String(id)) || null;

/**
 * One pass of J16's judgment on what the page holds (AC79's dry pass and its real one are the same
 * pass): { v (judgeCandidate's answer), needs: { headTime, runs: [id] }, failed } — a need is a read not
 * yet made in this opening; failed, a read that failed or was too large.
 */
async function pass(js, project, h, nowMs) {
  const needs = { headTime: false, runs: [] };
  let failed = false;
  let naming = null; // the newest run whose log names this pull request
  const lines = (L) => (L.lines || []).join('\n');
  const v = await judgeCandidate({
    number: h.number, checkRuns: h.lists.checkRuns, workflowRuns: h.lists.workflowRuns, statuses: h.lists.statuses,
    asksRuns: (js.runs && js.runs.list) || [], defaultBranch: project.defaultBranch,
    // The runs page answers a skipped, cancelled or unfinished run with no read: no merge job ran.
    readJobs: async (id) => {
      const run = runById(js, id);
      if (!runDone(run)) return [];
      const L = js.logs.get(String(id));
      if (!L) {
        needs.runs.push(String(id));
        return [{ id, name: 'merge', status: 'completed', conclusion: 'success' }];
      }
      if (L.state !== 'ok') return [{ id, name: 'merge', status: 'completed', conclusion: 'success' }];
      if (!L.job) return [];
      return [{ id, name: 'merge', status: L.ran ? 'completed' : L.job.status, conclusion: L.ran ? L.job.conclusion : (L.job.conclusion || null) }];
    },
    readLog: async (id) => {
      const L = js.logs.get(String(id));
      if (!L) return null; // a need, listed above
      if (L.state !== 'ok') {
        failed = true;
        return null;
      }
      if (naming == null && namedIn(L.lines).has(h.number)) naming = String(id);
      return lines(L);
    },
    headTime: async () => {
      if (h.headTime === undefined) {
        needs.headTime = true;
        return null;
      }
      return h.headTime;
    },
    seenMs: ms(h.createdAt), retriedMs: null, nowMs,
  });
  const run = naming == null ? null : runById(js, naming);
  return { v, needs, failed, dispatched: Boolean(run && run.event === DISPATCH) };
}

const listsReady = (js, h) => Boolean(js.runs) && !js.runsFailed && LISTS.every((l) => Array.isArray(h.lists[l]) && !h.failed[l] && !h.more[l]);

/**
 * The reads one AC79 blob call carries now (only in a poll where something changed), from a dry pass:
 * { blobs: [ledger sha], commitTime: [sha], jobLog: [run id], charged: [head sha], grantRun } — or null
 * when there is nothing to ask. A head that has had its 3 calls and still needs a read is capped: it
 * counts until its head changes.
 */
export async function planReads(js, project, nowMs) {
  const plan = { blobs: [], commitTime: [], jobLog: [], charged: [], grantRun: null };
  if (js.ledger.sha && js.ledger.form === undefined && !js.ledger.failed) plan.blobs.push(js.ledger.sha);
  const form = js.ledger.form;
  if (form) {
    const g = grantOnPage(js, project);
    if (g.want) {
      plan.jobLog.push(g.want);
      plan.grantRun = g.want;
    }
    if (g.dispatch && g.dispatch.want && !plan.jobLog.includes(g.dispatch.want)) plan.jobLog.push(g.dispatch.want);
    for (const h of js.heads.values()) {
      if (!js.active.has(h.sha) || h.sticky || h.capped || !listsReady(js, h)) continue;
      const p = await pass(js, project, h, nowMs);
      const runs = p.needs.runs.filter((id) => !plan.jobLog.includes(id));
      const mine = [...(p.needs.headTime ? [h.sha] : []), ...p.needs.runs];
      if (!mine.length) continue;
      if (h.calls >= CALLS_PER_HEAD) {
        h.capped = true;
        continue;
      }
      let added = false;
      if (p.needs.headTime && plan.commitTime.length < TIMES_PER_CALL) {
        plan.commitTime.push(h.sha);
        added = true;
      }
      for (const id of runs) {
        if (plan.jobLog.length >= LOGS_PER_CALL) break;
        plan.jobLog.push(id);
        added = true;
      }
      if (added || p.needs.runs.some((id) => plan.jobLog.includes(id))) plan.charged.push(h.sha);
    }
  }
  if (!plan.blobs.length && !plan.commitTime.length && !plan.jobLog.length) return null;
  return plan;
}

/**
 * Apply an AC79 blob call's answer (null: the call failed, so every read it asked for failed). A failed
 * or too-large log is kept for its run for the opening and not asked again; a failed head time is asked
 * again only within the cap; a failed ledger or grant read waits for the next opening or ledger change.
 */
export function applyReads(js, plan, answer, has) {
  for (const sha of plan.charged) {
    const h = js.heads.get(sha);
    if (h) h.calls++;
  }
  js.calls++;
  const a = answer && typeof answer === 'object' ? answer : {};
  if (plan.blobs.length) {
    const text = a.blobs ? a.blobs[plan.blobs[0]] : null;
    if (typeof text === 'string') {
      js.ledger.text = text;
      js.ledger.form = formGrant(text, has);
    }
    else js.ledger.failed = true;
  }
  for (const sha of plan.commitTime) {
    const h = js.heads.get(sha);
    if (!h) continue;
    const d = a.commitTime ? a.commitTime[sha] : null;
    const t = typeof d === 'string' ? Date.parse(d) : NaN;
    if (Number.isFinite(t)) h.headTime = t;
    else h.headTimeFailed = true; // asked again only within the cap, in a poll where something changed
  }
  for (const id of plan.jobLog) {
    const L = a.jobLog ? a.jobLog[id] : null;
    let kept;
    if (!L || typeof L !== 'object') kept = { state: 'failed' };
    else if (L.tooLarge === true) kept = { state: 'too-large' };
    else if (L.ran === true && Array.isArray(L.lines) && L.lines.every((x) => typeof x === 'string')) kept = { state: 'ok', ran: true, job: L.job || null, lines: L.lines };
    else if (L.ran === false) kept = { state: 'ok', ran: false, job: L.job && typeof L.job === 'object' ? L.job : null, lines: [] };
    else kept = { state: 'failed' };
    js.logs.set(String(id), kept);
    // A grant run whose merge job did not run is no failure: the next judging run whose job ran is read
    // instead, at the next poll where something changed (build review round 1, C).
    if (id === plan.grantRun && kept.state !== 'ok') js.grant.failed = true;
  }
}

/**
 * The page's verdict on each candidate now (AC79's "When the page counts it anyway" and "What the
 * owner sees"): Map(number → { head, state: 'recording' | 'count', words: null | LEFT_WORDS |
 * NO_CHECK_WORDS, rule, why }). Candidates past the fifth count, with no words.
 */
export async function judgeAll(js, project, cands, nowMs) {
  const out = new Map();
  const g = grantOnPage(js, project);
  const count = (pr, why, words = null, rule = null) => out.set(pr.number, { head: pr.headSha, state: 'count', words, rule, why });
  cands.forEach((pr, i) => {
    if (i >= MAX_CANDIDATES) count(pr, 'sixth');
  });
  for (const pr of cands.slice(0, MAX_CANDIDATES)) {
    const h = js.heads.get(pr.headSha);
    if (!h) {
      count(pr, 'unread');
      continue;
    }
    if (g.noneByJob && !h.sticky) h.sticky = 'd'; // the job's own log: no grant stands (rule (d))
    if (h.sticky) {
      count(pr, 'left', LEFT_WORDS, h.sticky);
      continue;
    }
    // A head that would need a fourth AC79 blob call counts until its head changes, even if later reads
    // would let it be judged (the spec's words; build review round 1, B).
    if (h.capped) {
      count(pr, 'capped');
      continue;
    }
    // The newest judging run is a dispatched one: every candidate it names counts (security C).
    if (g.dispatch && (g.dispatch.all || g.dispatch.names.has(pr.number))) {
      count(pr, 'dispatch');
      continue;
    }
    if (!listsReady(js, h)) {
      count(pr, js.runsFailed || LISTS.some((l) => h.failed[l]) ? 'failed' : LISTS.some((l) => h.more[l]) ? 'next-page' : 'unread');
      continue;
    }
    let p;
    try {
      p = await pass(js, project, h, nowMs);
    } catch {
      count(pr, 'page');
      continue;
    }
    // A verdict from a dispatched run, or a forged log naming it, counts with no words and is not held
    // as left: a later well-formed run on the default branch judges it again (security A and C).
    if (p.dispatched) {
      count(pr, 'dispatch');
      continue;
    }
    if (p.v.forged) {
      count(pr, 'forged');
      continue;
    }
    // Not judged within 45 minutes of its checks completing: counted, with no words of its own (R2).
    if (p.v.unjudged) {
      count(pr, 'unjudged');
      continue;
    }
    if (p.v.left) {
      if (p.v.rule === 'b') h.sticky = 'b';
      const words = p.v.rule === 'c' ? (nowMs - h.firstSeenMs >= NO_CHECK_WORDS_AFTER_MS ? NO_CHECK_WORDS : null) : LEFT_WORDS;
      count(pr, 'left', words, p.v.rule);
      continue;
    }
    if (p.failed) count(pr, 'failed');
    else if (p.needs.headTime || p.needs.runs.length) count(pr, h.capped ? 'capped' : 'pending');
    else if (p.v.retriedMs != null) count(pr, 'retried');
    else if (!g.stands) count(pr, g.failed ? 'grant-failed' : 'grant');
    else out.set(pr.number, { head: pr.headSha, state: 'recording', words: null, rule: null, why: 'recording' });
  }
  return out;
}

/** Whether a poll carries the `jobs` part now: a project that can have candidates, a grant in form, heads to read. */
export function partDue(js, project, tree) {
  return Boolean(tree && jobsPossible(project, tree) && js.ledger.form && js.active.size);
}

/**
 * One cycle's AC79 work after the project's own reads (the scheduler's, and the tests'): the candidates
 * now; in a poll where something changed, at most one blob call of its own (`blobCall(body)` → the
 * call's answer, or null when it failed) for what the dry pass says is needed; then the verdicts.
 * ctx: { project, tree, flaggedPulls, files, nowMs, blobCall }. Returns the verdicts (also js.verdicts).
 */
export async function runPhase(js, ctx) {
  const { project, tree } = ctx;
  try {
    if (!jobsPossible(project, tree)) {
      js.active = new Set();
      js.verdicts = new Map();
      return js.verdicts;
    }
    noteLedger(js, tree, ctx.nowMs);
    recheckForm(js, tree);
    const cands = pathCandidates(project, ctx.flaggedPulls, ctx.files);
    if (!cands.length) {
      js.active = new Set();
      js.verdicts = new Map();
      return js.verdicts;
    }
    trackCandidates(js, cands, ctx.nowMs);
    if (js.changed) {
      const plan = await planReads(js, project, ctx.nowMs);
      if (plan) {
        const body = { blobs: plan.blobs };
        if (plan.commitTime.length) body.commitTime = plan.commitTime;
        if (plan.jobLog.length) body.jobLog = plan.jobLog;
        let answer = null;
        try {
          answer = await ctx.blobCall(body, plan);
        } catch {
          answer = null;
        }
        applyReads(js, plan, answer, (p) => tree.has(p));
      }
    }
    js.verdicts = await judgeAll(js, project, cands, ctx.nowMs);
  } catch {
    // Any error here leaves every candidate counted; the project's own read is untouched.
    js.verdicts = new Map();
  } finally {
    js.changed = false;
  }
  return js.verdicts;
}
