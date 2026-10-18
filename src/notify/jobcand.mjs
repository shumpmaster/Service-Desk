// The asks-merge job's candidates (spec S-001, J16; the owner's ruling
// decisions/questions/P-001-notify-job-merges.md: "a pull request the automatic job will merge
// sends no notification; only what truly needs the owner does, including one the job leaves for
// the owner"). A job candidate waits on the owner from the first of rules (a) to (d); until then it
// is not in the set. Rule (d), the grant, is decided before this module is asked.

export const ORCH_WORKFLOW = '.github/workflows/orchestrator.yml';
export const EXEMPT_STATUS = 'owner-questions';
export const ASKS_MERGE_RUNS = '/actions/workflows/asks-merge.yml/runs?per_page=30';
export const JUDGING_EVENTS = ['workflow_run', 'schedule', 'workflow_dispatch'];
export const RETRY_LASTS_MS = 15 * 60e3; // a retried reason given again 15 minutes on (by run_started_at) leaves it
export const NO_CHECK_MS = 30 * 60e3; // rule (c)
export const MAX_LOGS = 5; // log reads per candidate per run (C)
const STAMP_RE = /^\d{4}-\d\d-\d\dT[0-9:.]+Z /;
const WAITS_RE = /^PR #(\d+): waits: (.+)$/;
const MERGED_RE = /^PR #(\d+): merged\b/;

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
 * Judge one job candidate (rules (a) to (c)). input: { number, checkRuns, workflowRuns, statuses,
 * asksRuns (the latest asks-merge runs), readJobs(runId) → jobs|null, readLog(jobId) → text|null,
 * headTime() → ms|null (asked only for rule (c)), seenMs (the first run of this sender that saw this
 * head), retriedMs (kept: the first judging run's run_started_at that gave a retried reason on this
 * head, or null), nowMs }. Returns { left: boolean, rule, retriedMs }.
 */
export async function judgeCandidate(input) {
  const checks = latestChecks(input.checkRuns, input.workflowRuns);
  // (a) a counted check concluded other than success, or a counted status failed.
  if (checks.some((r) => r.status === 'completed' && r.conclusion !== 'success')) return { left: true, rule: 'a', retriedMs: input.retriedMs };
  if (latestStatuses(input.statuses).some((s) => s.state === 'failure' || s.state === 'error')) return { left: true, rule: 'a', retriedMs: input.retriedMs };
  // (c) no counted check started on its head for 30 minutes.
  if (checks.length === 0) {
    const head = await input.headTime();
    const since = Math.max(Number.isFinite(head) ? head : -Infinity, Number.isFinite(input.seenMs) ? input.seenMs : -Infinity);
    if (Number.isFinite(since) && input.nowMs - since >= NO_CHECK_MS) return { left: true, rule: 'c', retriedMs: input.retriedMs };
    return { left: false, rule: null, retriedMs: input.retriedMs };
  }
  // (b) every counted check succeeded, and a judging run after the last of them has left it.
  if (!checks.every((r) => r.status === 'completed' && r.conclusion === 'success')) return { left: false, rule: null, retriedMs: input.retriedMs };
  const done = Math.max(...checks.map((r) => ms(r.completed_at)));
  if (!Number.isFinite(done)) return { left: false, rule: null, retriedMs: input.retriedMs };
  const runs = (input.asksRuns || []).filter((r) => r && JUDGING_EVENTS.includes(r.event) && ms(r.run_started_at) > done)
    .sort((x, y) => ms(y.run_started_at) - ms(x.run_started_at) || y.id - x.id);
  const verdicts = [];
  let logs = 0;
  for (const run of runs) {
    if (logs >= MAX_LOGS) break;
    const jobs = await input.readJobs(run.id);
    const job = (jobs || []).find((j) => j && j.name === 'merge');
    if (!job || job.status !== 'completed' || job.conclusion == null || ['skipped', 'cancelled'].includes(job.conclusion)) continue;
    logs++;
    const text = await input.readLog(job.id);
    if (text == null) continue;
    const v = logVerdict(text, input.number);
    if (!v) continue; // judged nothing, or not this pull request
    if (v.merged) break;
    verdicts.push({ at: ms(run.run_started_at), kind: reasonKind(v.waits) });
  }
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
