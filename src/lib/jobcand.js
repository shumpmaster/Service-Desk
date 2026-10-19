// The asks-merge job's candidates (spec S-001, J16; the owner's ruling
// decisions/questions/P-001-notify-job-merges.md: "a pull request the automatic job will merge
// sends no notification; only what truly needs the owner does, including one the job leaves for
// the owner"). A job candidate waits on the owner from the first of rules (a) to (d); until then it
// is not in the set. Rule (d), the grant, is decided before this module is asked.
//
// From 2026-10-19 (AC79) this module lives in src/lib/ and is shared: the sender (src/notify/collect.mjs)
// and the page (src/lib/jobwatch.js) both judge with it, so the desk's "Being recorded by the automatic
// job" is the sender's own rule. It imports nothing, and stays pure. It is an R3 path (Setup CS23): the
// sender runs it with the notification secrets. A judging run is one on the project's default branch only
// (`defaultBranch`, AC79, J16: a `workflow_dispatch` of a changed job on a branch counts for nothing).

export const ORCH_WORKFLOW = '.github/workflows/orchestrator.yml';
export const EXEMPT_STATUS = 'owner-questions';
export const ASKS_MERGE_RUNS = '/actions/workflows/asks-merge.yml/runs?per_page=30';
export const JUDGING_EVENTS = ['workflow_run', 'schedule', 'workflow_dispatch'];
export const RETRY_LASTS_MS = 15 * 60e3; // a retried reason given again 15 minutes on (by run_started_at) leaves it
export const NO_CHECK_MS = 30 * 60e3; // rule (c)
export const MAX_LOGS = 5; // log reads per candidate per run (C)
// A head commit time more than this after the reader's clock is no head time (security review round 1,
// D): the committer date is the author's to set, and a future one would hold rule (c) off for ever.
export const FUTURE_HEAD_MS = 10 * 60e3;
// A candidate whose counted checks have all completed and that no judging run has judged within this long
// after the last of them waits on the owner (security build review round 2, R2; J16 draft 6): a job that
// never reaches it (stopped, broken or disabled) never leaves it unseen.
export const UNJUDGED_MS = 45 * 60e3;
const STAMP_RE = /^\d{4}-\d\d-\d\dT[0-9:.]+Z /;
const WAITS_RE = /^PR #(\d+): waits: (.+)$/;
const MERGED_RE = /^PR #(\d+): merged\b/;
const PR_LINE_RE = /^PR #(\d+):/;

/** Each line of a job log with its leading timestamp and one space taken off (J16, "The log's form"). */
export function logLines(text) {
  return String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(STAMP_RE, ''));
}

/** What a job log says of pull request `n`: { waits: reason } | { merged: true } | null (no line for it). */
export function logVerdict(text, n) {
  let out = null;
  for (const l of logLines(text)) {
    const w = WAITS_RE.exec(l);
    if (w && Number(w[1]) === n) out = { waits: w[2] };
    const m = MERGED_RE.exec(l);
    if (m && Number(m[1]) === n) out = { merged: true };
  }
  return out;
}

/**
 * Whether a job log is the job's own words (security review round 1, A): the job prints one `PR #n:`
 * line per open pull request, in ascending number order, so a log whose `PR #n:` lines repeat a number
 * or go out of order holds a forged line (a pushed file name with a line break in it, which the job
 * prints into its own reasons). Such a log is no one's words.
 */
export function logWellFormed(text) {
  let last = -1;
  for (const l of logLines(text)) {
    const m = PR_LINE_RE.exec(l);
    if (!m) continue;
    const n = Number(m[1]);
    if (!(n > last)) return false;
    last = n;
  }
  return true;
}

/** Whether a job log has a `PR #n:` line for pull request `n`. */
export function logNames(text, n) {
  return logLines(text).some((l) => {
    const m = PR_LINE_RE.exec(l);
    return m && Number(m[1]) === n;
  });
}

/**
 * A waits reason's kind (J16): 'transient' (the job clears it by itself: no counted check run yet,
 * or a check run or status not yet completed), 'retried' (the job skips it until its next run: a
 * reason holding "cannot be read", one starting "it could not be judged" or "GitHub refused the
 * merge") or 'final' (the job will not clear it by itself, so the pull request is left at once).
 */
export function reasonKind(reason) {
  const r = String(reason);
  if (r.includes('cannot be read') || r.startsWith('it could not be judged') || r.startsWith('GitHub refused the merge')) return 'retried';
  if (r === 'no counted check run on the head yet') return 'transient';
  const run = /^check run .* is ([^/]+)\/.*$/.exec(r);
  if (run && run[1] !== 'completed') return 'transient';
  if (/^status .* is pending$/.test(r)) return 'transient';
  return 'final';
}

/**
 * The latest counted check run per key at a head, as `check_state` keeps them (asks_merge.py:226-247):
 * check suites mapped to workflows through the head's workflow runs, runs of orchestrator.yml not
 * counted. Returns [run].
 */
export function latestChecks(checkRuns, workflowRuns) {
  const suites = new Map();
  for (const w of workflowRuns || []) {
    if (w && Number.isInteger(w.check_suite_id) && typeof w.path === 'string') suites.set(w.check_suite_id, w.path.split('@')[0]);
  }
  const latest = new Map();
  for (const r of checkRuns || []) {
    if (!r || !Number.isInteger(r.id)) continue;
    const suite = r.check_suite && r.check_suite.id;
    const path = suites.has(suite) ? suites.get(suite) : null;
    if (path === ORCH_WORKFLOW) continue;
    const key = path != null ? `workflow\0${path}\0${r.name}` : `app\0${r.app && r.app.slug}\0${r.name}`;
    const cur = latest.get(key);
    if (!cur || r.id > cur.id) latest.set(key, r);
  }
  return [...latest.values()];
}

/** The latest status per counted context (by id), `owner-questions` not counted. */
export function latestStatuses(statuses) {
  const last = new Map();
  for (const s of statuses || []) {
    if (!s || !Number.isInteger(s.id) || typeof s.context !== 'string' || s.context === EXEMPT_STATUS) continue;
    const cur = last.get(s.context);
    if (!cur || s.id > cur.id) last.set(s.context, s);
  }
  return [...last.values()];
}

const ms = (t) => (typeof t === 'string' ? Date.parse(t) : NaN);

/**
 * A judging asks-merge run (J16 rule (b), AC79): started by `workflow_run`, `schedule` or
 * `workflow_dispatch`, on the project's default branch. A run on any other branch, or with no
 * `head_branch`, judges nothing.
 */
export function isJudgingRun(run, defaultBranch) {
  return Boolean(run) && JUDGING_EVENTS.includes(run.event) && typeof defaultBranch === 'string' && defaultBranch !== ''
    && run.head_branch === defaultBranch;
}

/**
 * Judge one job candidate (rules (a) to (c)). input: { number, checkRuns, workflowRuns, statuses,
 * asksRuns (the latest asks-merge runs), readJobs(runId) → jobs|null, readLog(jobId) → text|null,
 * headTime() → ms|null (asked only for rule (c)), seenMs (the first run of this sender that saw this
 * head), retriedMs (kept: the first judging run's run_started_at that gave a retried reason on this
 * head, or null), nowMs, defaultBranch (the project's, J7: only runs whose `head_branch` is it judge) }.
 * Returns { left: boolean, rule, retriedMs }.
 */
export async function judgeCandidate(input) {
  // Without the default branch no run could judge, so nothing would ever be left: refuse loudly instead.
  if (typeof input.defaultBranch !== 'string' || input.defaultBranch === '') throw new TypeError('judgeCandidate needs the project\'s defaultBranch');
  const checks = latestChecks(input.checkRuns, input.workflowRuns);
  // (a) a counted check concluded other than success, or a counted status failed.
  if (checks.some((r) => r.status === 'completed' && r.conclusion !== 'success')) return { left: true, rule: 'a', retriedMs: input.retriedMs };
  if (latestStatuses(input.statuses).some((s) => s.state === 'failure' || s.state === 'error')) return { left: true, rule: 'a', retriedMs: input.retriedMs };
  // (c) no counted check started on its head for 30 minutes.
  if (checks.length === 0) {
    const head0 = await input.headTime();
    // A head time from the future counts as none, so rule (c) runs from the first sight (security D).
    const head = Number.isFinite(head0) && head0 <= input.nowMs + FUTURE_HEAD_MS ? head0 : NaN;
    const since = Math.max(Number.isFinite(head) ? head : -Infinity, Number.isFinite(input.seenMs) ? input.seenMs : -Infinity);
    if (Number.isFinite(since) && input.nowMs - since >= NO_CHECK_MS) return { left: true, rule: 'c', retriedMs: input.retriedMs };
    return { left: false, rule: null, retriedMs: input.retriedMs };
  }
  // (b) every counted check succeeded, and a judging run after the last of them has left it.
  if (!checks.every((r) => r.status === 'completed' && r.conclusion === 'success')) return { left: false, rule: null, retriedMs: input.retriedMs };
  const done = Math.max(...checks.map((r) => ms(r.completed_at)));
  if (!Number.isFinite(done)) return { left: false, rule: null, retriedMs: input.retriedMs };
  const runs = (input.asksRuns || []).filter((r) => isJudgingRun(r, input.defaultBranch) && ms(r.run_started_at) > done)
    .sort((x, y) => ms(y.run_started_at) - ms(x.run_started_at) || y.id - x.id);
  const verdicts = [];
  let judged = false; // a successful, well-formed run gave a verdict for it (a merged line included)
  let logs = 0;
  for (const run of runs) {
    if (logs >= MAX_LOGS) break;
    const jobs = await input.readJobs(run.id);
    const job = (jobs || []).find((j) => j && j.name === 'merge');
    if (!job || job.status !== 'completed' || job.conclusion == null || ['skipped', 'cancelled'].includes(job.conclusion)) continue;
    logs++;
    const text = await input.readLog(job.id);
    if (text == null) continue;
    // A forged log is no one's words: it judges nothing, and a candidate it names that no newer
    // well-formed, successful run has judged waits on the owner (security review round 1, A). A merge
    // job that completed but not with `success` (failure, timed_out, …) is the same case: it may have
    // stopped right after a forged line, before the named pull request's own (security round 2, R1).
    if (job.conclusion !== 'success' || !logWellFormed(text)) {
      if (!verdicts.length && logNames(text, input.number)) return { left: true, rule: 'b', retriedMs: input.retriedMs, forged: true };
      continue;
    }
    const v = logVerdict(text, input.number);
    if (!v) continue; // judged nothing, or not this pull request
    judged = true;
    if (v.merged) break;
    verdicts.push({ at: ms(run.run_started_at), kind: reasonKind(v.waits) });
  }
  // (e) never judged within 45 minutes of its checks completing: it waits (security round 2, R2; J16 (e)).
  if (!judged && input.nowMs - done >= UNJUDGED_MS) return { left: true, rule: 'e', retriedMs: input.retriedMs, unjudged: true };
  if (!verdicts.length) return { left: false, rule: null, retriedMs: input.retriedMs };
  const newest = verdicts[0];
  if (newest.kind === 'final') return { left: true, rule: 'b', retriedMs: input.retriedMs };
  if (newest.kind !== 'retried') return { left: false, rule: null, retriedMs: input.retriedMs };
  const firsts = verdicts.filter((v) => v.kind === 'retried').map((v) => v.at);
  if (Number.isFinite(input.retriedMs)) firsts.push(input.retriedMs);
  const first = Math.min(...firsts);
  if (newest.at - first >= RETRY_LASTS_MS) return { left: true, rule: 'b', retriedMs: first };
  return { left: false, rule: null, retriedMs: first };
}
