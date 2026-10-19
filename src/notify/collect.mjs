// J16 (spec S-001): a project's records → its sender's waiting set, AC73's kinds exactly, built
// with the desk's own readers in src/lib/ (J2's, J9's, J13's and J20's) from the workflow's
// checkout of the default branch and the workflow token's REST reads. A read that fails makes the
// project "not read" this run, so J18 keeps its last set (AC76).

import { neededReads, buildModel, recordKind, parseRecord } from '../lib/model.js';
import { SESSION_PATH_RE, parseSessionFile } from '../lib/cos.js';
import { waitingSet, outsideAuthor } from '../lib/waiting.js';
import { questionHold } from '../lib/asking.js';
import { parseFilePages, splitChanges, recordedAnswers, jobKindsByPath, FILES_MAX_PAGES, CLOSED_MAX_PAGES, closedNeedsNext, closedCanEnd } from '../lib/prfiles.js';
import { ReadFailed } from './gh.mjs';
import { findGrant, ASKS_MERGE_WORKFLOW } from './grant.mjs';
// J16's pure judgment, shared with the page's AC79 (src/lib/ from 2026-10-19; R3, Setup CS23).
import { judgeCandidate, ASKS_MERGE_RUNS } from '../lib/jobcand.js';
import { keyHash, recordedEntry, readRecorded } from './state.mjs';

export const DEPLOY_POLL_MS = 15e3;
export const DEPLOY_WAIT_MS = 120e3;
// J16's awkward cases (draft 7, Critic round 5, note 12): a job candidate's check runs, statuses and
// workflow runs are read to 10 pages of 100, the asks-merge job's own `PAGES = 10` (asks_merge.py:79,
// past which its `get_pages`, :448-460, reads nothing, so the job does not merge it either).
export const CANDIDATE_MAX_PAGES = 10;
const sameRepo = (a, b) => typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();

/** Read every record the desk's readers need from the checkout, as the page would through J6. */
export function readRecords(project, checkout, nowDate) {
  const tree = checkout.tree;
  const records = new Map();
  const history = new Map();
  const compare = new Map();
  for (let pass = 0; pass < 4; pass++) {
    const need = neededReads(project, tree, records, nowDate, { head: checkout.head, history, compare });
    const blobs = need.blobs.filter((b) => !records.has(b.path));
    const hist = need.history.filter((p) => !history.has(p));
    const cmp = need.compare.filter((c) => !compare.has(c.base));
    if (!blobs.length && !hist.length && !cmp.length) break;
    const texts = checkout.blobs(blobs.map((b) => b.path));
    for (const b of blobs) {
      const text = texts.get(b.path);
      // A blob that is not UTF-8 is read as the page reads any text it cannot parse: an empty record.
      records.set(b.path, parseRecord(b.kind, text == null ? '' : text, b.path));
    }
    for (const p of hist) history.set(p, { oldest: checkout.oldestAdd(p), newest: null });
    for (const c of cmp) {
      const a = checkout.isAncestor(c.base, checkout.head);
      compare.set(c.base, a === true ? 'merged' : a === false ? 'not-merged' : 'failed');
    }
  }
  return { tree, records, history, compare };
}

async function listPages(gh, path, what, key = null) {
  const r = await gh.list(path, { maxPages: 3, key });
  if (!r.ok) throw new ReadFailed(what, r.status);
  if (r.more) throw new ReadFailed(`${what} (over 3 pages)`, 200);
  return r;
}

/** Wait for a requested deploy run to turn `waiting`: every 15 seconds for up to 2 minutes (J16). */
export async function waitForDeploy({ gh, repo, runId, sleep, now }) {
  const until = now() + DEPLOY_WAIT_MS;
  for (;;) {
    const r = await gh.get(`/repos/${repo}/actions/runs/${runId}`);
    if (r.status === 200 && r.json && (r.json.status === 'waiting' || r.json.status === 'completed')) return r.json.status;
    if (now() + DEPLOY_POLL_MS > until) return r.status === 200 && r.json ? r.json.status : null;
    await sleep(DEPLOY_POLL_MS);
  }
}

/**
 * Build the project's set. input: { project, config, checkout, gh, nowMs, stateKey, cand (J18's
 * job-candidate part of the last state), recorded (its questions whose answer's pull request was
 * seen) }. Returns { read: true, set, cand, recorded, counts } or { read: false, why }.
 */
export async function collect(input) {
  const { project, config, checkout, gh, nowMs, stateKey } = input;
  const repo = project.repo;
  if (checkout.shallow) return { read: false, why: 'checkout' };
  const now = new Date(nowMs);
  let read;
  try {
    read = readRecords(project, checkout, now);
  } catch {
    return { read: false, why: 'checkout' }; // git could not read the checkout
  }
  const { tree, records, history, compare } = read;
  const isV3 = project.model === 'v3';
  try {
    // Open pull requests (J1's list).
    const pl = await listPages(gh, `/repos/${repo}/pulls?state=open&per_page=100`, 'pull requests');
    const extra = new Map();
    for (const p of pl.items) {
      if (!p || !Number.isInteger(p.number)) continue;
      extra.set(p.number, { headSha: p.head && typeof p.head.sha === 'string' ? p.head.sha : null,
        association: typeof p.author_association === 'string' ? p.author_association : null });
    }
    // The default branch's head runs, for a hold card (J2's rule), only when one is in the tree.
    let checkPages = [];
    if ([...tree.keys()].some((p) => recordKind(p, project.model) === 'hold')) {
      for (const event of ['push', 'workflow_dispatch']) {
        const r = await listPages(gh, `/repos/${repo}/actions/runs?head_sha=${checkout.head}&event=${event}&exclude_pull_requests=true&per_page=100`, 'workflow runs', 'workflow_runs');
        checkPages.push(...r.pages);
      }
    }
    const model = buildModel({ project, config, tree, records, history, pullPages: pl.pages, checkPages,
      checksState: 'ok', compare, now, withdrawn: [] });

    // J20: each open, non-draft pull request into the default branch from the project's own branches.
    const files = new Map();
    for (const pr of model.pulls) {
      if (pr.draft || pr.base !== project.defaultBranch || !sameRepo(pr.headRepo, repo)) continue;
      const r = await gh.list(`/repos/${repo}/pulls/${pr.number}/files?per_page=100`, { maxPages: FILES_MAX_PAGES });
      if (!r.ok) throw new ReadFailed('pull request files', r.status);
      const parsed = parseFilePages(r.pages);
      if (!parsed.ok) throw new ReadFailed('pull request files', 200);
      files.set(pr.number, { changes: splitChanges(parsed.files), capped: parsed.capped || r.more });
    }

    // AC77: questions being recorded or held. Each recording question → the open pull request recording it.
    const recordingBy = new Map();
    for (const [num, f] of files) for (const n of recordedAnswers(f.changes, project.model)) if (!recordingBy.has(n)) recordingBy.set(n, num);
    const openNumbers = new Set(model.pulls.map((p) => p.number));
    // A recorded answer's pull request that has left the open list, read by number (draft 9, the
    // Orchestrator's ruling on build review round 1, Sec 1): 'open', 'merged' or 'closed' (unmerged).
    const singles = new Map();
    const single = async (n) => {
      if (!singles.has(n)) {
        const r = await gh.get(`/repos/${repo}/pulls/${n}`);
        if (r.status !== 200 || !r.json || r.json.number !== n || typeof r.json.state !== 'string') throw new ReadFailed('a recorded pull request', r.status);
        singles.set(n, r.json.state === 'open' ? 'open' : r.json.merged_at != null ? 'merged' : 'closed');
      }
      return singles.get(n);
    };

    const held = new Set();
    let heldCount = 0;
    let recordingCount = 0;
    const sessionFiles = new Map();
    // A question whose answer's pull request was seen open: its hold ended then (AC77), kept by keyed
    // hash (J18), with that pull request's number (sealed, in recordedPr) while it can still decide:
    // closed unmerged, the question waits again; merged, it is answered, and never notified.
    const recorded = {};
    const holds = [];
    for (const q of model.questions) {
      const rec = records.get(q.path);
      const h = history.get(q.path);
      const raisedMs = h && h.oldest ? Date.parse(h.oldest) : null;
      let sessionFile = null;
      const text = rec && typeof rec.text === 'string' ? rec.text : '';
      const qh = keyHash(stateKey, `${project.name}|question|${q.path}`);
      const raw = (input.recorded || {})[qh];
      const before = raw ? readRecorded(stateKey, raw) : null;
      const seenIso = before && before.seen ? before.seen : now.toISOString();
      const rn = recordingBy.get(q.name);
      let recordingNow = rn != null;
      let over = false;
      if (rn != null) recorded[qh] = recordedEntry(stateKey, seenIso, rn);
      else if (before) {
        const n = before.number;
        if (Number.isInteger(n) && !openNumbers.has(n)) {
          // Never inferred from its absence: it may have merged after this run's checkout.
          const s = await single(n);
          if (s === 'closed') {
            over = true; // open again; the end kept, with no number left to read
            recorded[qh] = seenIso;
          } else {
            recordingNow = true; // merged (answered: the next checkout holds the answer) or still open
            recorded[qh] = recordedEntry(stateKey, seenIso, n);
          }
        } else {
          // Still open but no longer recording it (a draft now, or a new head), or an end the closed
          // read found: the hold is over, so it waits.
          over = true;
          recorded[qh] = recordedEntry(stateKey, seenIso, n);
        }
      }
      const hold0 = questionHold({ model: project.model, text, raisedMs, nowMs, recording: recordingNow, recordedBefore: over, sessionFile: null });
      if (hold0.state === 'held' && isV3) {
        const path = `sessions/chief-of-staff/${hold0.session}.jsonl`;
        if (SESSION_PATH_RE.test(path) && tree.has(path)) {
          if (!sessionFiles.has(path)) {
            const t = checkout.blobs([path]).get(path);
            sessionFiles.set(path, t == null ? null : parseSessionFile(t, path));
          }
          sessionFile = sessionFiles.get(path);
        }
      }
      const hold = sessionFile ? questionHold({ model: project.model, text, raisedMs, nowMs, recording: false, recordedBefore: false, sessionFile }) : hold0;
      holds.push({ q, qh, raisedMs, hold });
    }
    // The Orchestrator's ruling (draft 6; draft 7, Critic round 5, findings 5 and 6): for a project
    // with a question still held, its closed pull requests, newest updated first, 100 to a page; the
    // next page only while a full page's last one was updated after the earliest raised time, up to 3
    // pages, a fourth needed a failed read. An own-branch, non-draft one into the default branch, closed
    // unmerged after that question's raised time, whose files record its answer (J20), ends the hold:
    // the question waits again and notifies. A failed read makes the project "not read" (AC76).
    const stillHeld = holds.filter((x) => x.hold.state === 'held' && Number.isFinite(x.raisedMs));
    if (stillHeld.length) {
      const since = Math.min(...stillHeld.map((x) => x.raisedMs));
      const closedUrl = `/repos/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100`;
      const closedList = [];
      for (let page = 1; ; page++) {
        if (page > CLOSED_MAX_PAGES) throw new ReadFailed('closed pull requests (over 3 pages)', 200);
        const cl = await gh.get(page === 1 ? closedUrl : `${closedUrl}&page=${page}`);
        if (cl.status !== 200 || !Array.isArray(cl.json)) throw new ReadFailed('closed pull requests', cl.status);
        closedList.push(...cl.json);
        if (!closedNeedsNext(cl.json, /rel="next"/.test(cl.link || ''), since)) break;
      }
      const ended = new Map(); // question name → the latest close that records its answer
      const readNumbers = new Set();
      for (const p of closedList) {
        if (!closedCanEnd(p, project, since) || readNumbers.has(p.number)) continue;
        readNumbers.add(p.number);
        const closedMs = Date.parse(p.closed_at);
        const r = await gh.list(`/repos/${repo}/pulls/${p.number}/files?per_page=100`, { maxPages: FILES_MAX_PAGES });
        if (!r.ok) throw new ReadFailed('closed pull request files', r.status);
        const parsed = parseFilePages(r.pages);
        if (!parsed.ok) throw new ReadFailed('closed pull request files', 200);
        for (const n of recordedAnswers(splitChanges(parsed.files), project.model)) ended.set(n, Math.max(ended.get(n) || 0, closedMs));
      }
      for (const x of stillHeld) {
        const at = ended.get(x.q.name);
        if (at && at > x.raisedMs) {
          x.hold = { state: 'open', session: x.hold.session };
          recorded[x.qh] = recorded[x.qh] || now.toISOString();
        }
      }
    }
    for (const { q, hold } of holds) {
      if (hold.state === 'recording') recordingCount++;
      if (hold.state === 'held') heldCount++;
      if (hold.state !== 'open') held.add(q.name);
    }

    // J16: the asks-merge job's candidates, in a project with the workflow and a standing grant.
    const jobs = new Set();
    const cand = {};
    if (isV3 && tree.has(ASKS_MERGE_WORKFLOW)) {
      const { grant } = findGrant(checkout);
      const flaggedPulls = model.flagged.filter((f) => f.kind === 'pr').map((f) => f.pr);
      const candidates = grant ? flaggedPulls.filter((pr) => {
        const f = files.get(pr.number);
        const e = extra.get(pr.number);
        return f && !f.capped && e && /^[0-9a-f]{40}$/.test(e.headSha || '') && jobKindsByPath(f.changes);
      }) : [];
      if (candidates.length) {
        const ar = await gh.get(`/repos/${repo}${ASKS_MERGE_RUNS}`);
        if (ar.status !== 200 || !ar.json || !Array.isArray(ar.json.workflow_runs)) throw new ReadFailed('asks-merge runs', ar.status);
        // A dispatched judging run's commit must be on the default branch (security review round 1, C; desk
        // review round 2, R1): a `workflow_dispatch` run whose head_sha is not the checkout's HEAD or an
        // ancestor of it (a dispatch on a tag named like the default branch) judges nothing. `workflow_run`
        // and `schedule` runs, which a tag cannot start, are taken as before, so a real run on a commit
        // newer than this checkout still counts. Checked in the full-history checkout.
        const onDefault = new Map();
        const asksRuns = ar.json.workflow_runs.filter((r) => {
          if (!r || r.event !== 'workflow_dispatch') return true;
          const sha = r.head_sha;
          if (!onDefault.has(sha)) onDefault.set(sha, checkout.isAncestor(sha, checkout.head) === true);
          return onDefault.get(sha);
        });
        const jobsCache = new Map();
        const logCache = new Map();
        const readJobs = async (id) => {
          if (!jobsCache.has(id)) {
            const r = await gh.get(`/repos/${repo}/actions/runs/${id}/jobs?per_page=30`);
            jobsCache.set(id, r.status === 200 && r.json && Array.isArray(r.json.jobs) ? r.json.jobs : null);
          }
          return jobsCache.get(id);
        };
        const readLog = async (id) => {
          if (!logCache.has(id)) {
            const d = await gh.download(`/repos/${repo}/actions/jobs/${id}/logs`, 4 * 1024 * 1024);
            logCache.set(id, d.status === 200 && d.buf ? d.buf.toString('utf8') : null);
          }
          return logCache.get(id);
        };
        for (const pr of candidates) {
          const sha = extra.get(pr.number).headSha;
          const ck = await gh.list(`/repos/${repo}/commits/${sha}/check-runs?per_page=100`, { key: 'check_runs', maxPages: CANDIDATE_MAX_PAGES });
          const wr = await gh.list(`/repos/${repo}/actions/runs?head_sha=${sha}&per_page=100`, { key: 'workflow_runs', maxPages: CANDIDATE_MAX_PAGES });
          const st = await gh.list(`/repos/${repo}/commits/${sha}/statuses?per_page=100`, { maxPages: CANDIDATE_MAX_PAGES });
          if (!ck.ok || !wr.ok || !st.ok) throw new ReadFailed('job candidate checks', [ck, wr, st].find((x) => !x.ok).status);
          if (ck.more || wr.more || st.more) continue; // too many to judge whole: it waits as any pull request
          const hk = keyHash(stateKey, `${project.name}|pr|${pr.number}|${sha}`);
          const prev = (input.cand || {})[hk];
          const seenIso = prev ? prev.seen : now.toISOString();
          const v = await judgeCandidate({ number: pr.number, checkRuns: ck.items, workflowRuns: wr.items, statuses: st.items,
            asksRuns, readJobs, readLog,
            headTime: async () => {
              const c = await gh.get(`/repos/${repo}/commits/${sha}`);
              const d = c.status === 200 && c.json && c.json.commit && c.json.commit.committer && c.json.commit.committer.date;
              return typeof d === 'string' ? Date.parse(d) : null;
            },
            seenMs: Date.parse(seenIso), retriedMs: prev && prev.retried ? Date.parse(prev.retried) : null, nowMs,
            // AC79 (2026-10-19): only runs on the default branch judge (a branch's dispatch counts for nothing).
            defaultBranch: project.defaultBranch });
          cand[hk] = { seen: seenIso, retried: Number.isFinite(v.retriedMs) ? new Date(v.retriedMs).toISOString() : null };
          if (!v.left) jobs.add(pr.number);
        }
      }
    }

    // Deploys (AC52, Terms): every run whose status is waiting, in a project marked deploysNeedOwner.
    const deploys = [];
    if (project.deploysNeedOwner === true) {
      const r = await gh.get(`/repos/${repo}/actions/runs?status=waiting&per_page=100`);
      if (r.status !== 200 || !r.json || !Array.isArray(r.json.workflow_runs)) throw new ReadFailed('waiting runs', r.status);
      for (const run of r.json.workflow_runs) {
        if (run && Number.isInteger(run.id) && run.status === 'waiting') {
          // Its title only when the run is this repository's own (draft 9, build review round 1, Sec 8): a
          // fork's run never puts its author's words on the lock screen.
          const own = sameRepo(run.head_repository && run.head_repository.full_name, repo);
          deploys.push({ id: run.id, title: own && typeof run.display_title === 'string' ? run.display_title : null });
        }
      }
    }

    const outside = new Set();
    for (const [n, e] of extra) if (outsideAuthor(e.association)) outside.add(n);
    const set = waitingSet({ project, model, deploys, jobCandidates: jobs, held, outside });
    return { read: true, set, cand, recorded, model, counts: { waiting: set.length, held: heldCount, recording: recordingCount, jobCandidates: jobs.size } };
  } catch (e) {
    if (e instanceof ReadFailed) return { read: false, why: e.what };
    throw e;
  }
}

