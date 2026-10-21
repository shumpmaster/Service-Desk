// The desk function's request handling (spec S-001, J6 request checks, J8, AC13).
// Order: the Access check (403, before anything else and before any GitHub call), then the
// method (405), the content type (415), the Origin (403), then the body (400). No CORS headers
// are ever sent, so no other origin can read a response.

import { checkAccess } from './access.js';
import { pollProject, readBlobs, BLOB_BATCH, SHA_RE, HISTORY_PATH_RE, PULLS_COST, PULLS_CURSOR_RE, USAGE_COST, CLOSED_COST, MAX_FILES_PRS, PR_COST, MAX_PRS,
  JOBS_MAX_HEADS, JOB_LISTS, OWNER_CHECK_MAX, COMMIT_TIME_COST, JOB_LOG_COST, MAX_COMMIT_TIMES, MAX_JOB_LOGS } from './github.js';
import CONFIG from './config.js';
import { usageEntry } from './usage.js';

// J6: the branch, up to 3 PR pages and up to 3 pages for each of J1's 3a and 3b: at most 10
// entries, under 3 KB.
export const MAX_ETAGS = 10;
export const MAX_ETAG_BYTES = 3072;
const MAX_BODY_BYTES = 16384;

function reply(status, body) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return new Response(text, {
    status,
    headers: {
      'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function bad(why) {
  return reply(400, { error: why });
}

function projectByName(name, config) {
  return config.projects.find((p) => p.name === name) || null;
}

function validatePoll(body, config) {
  const project = projectByName(body.project, config);
  if (!project) return { error: 'unknown project' };
  if (body.head !== null && body.head !== undefined && !SHA_RE.test(body.head)) return { error: 'bad head' };
  const etags = body.etags == null ? {} : body.etags;
  if (typeof etags !== 'object' || Array.isArray(etags)) return { error: 'bad etags' };
  const entries = Object.entries(etags);
  if (entries.length > MAX_ETAGS) return { error: 'too many etags' };
  if (entries.some(([k, v]) => typeof k !== 'string' || typeof v !== 'string')) return { error: 'bad etags' };
  if (new TextEncoder().encode(JSON.stringify(etags)).length > MAX_ETAG_BYTES) return { error: 'etags too large' };
  const req = { project, head: body.head || null, etags };
  // AC79 (J6): the optional `jobs` part, never refused: a malformed one is answered `null`.
  if (body.jobs !== undefined) req.jobs = jobsPart(body.jobs, project);
  // AC80, J22 (J6): the optional `ownerChecks` part, never refused: malformed, it reads nothing.
  if (body.ownerChecks !== undefined) req.ownerChecks = ownerChecksPart(body.ownerChecks, project);
  return { req };
}

const ETAG_OK = (v) => v == null || (typeof v === 'string' && v.length <= 200);
const plain = (v) => v != null && typeof v === 'object' && !Array.isArray(v);

/**
 * AC79's `jobs` part (J6): `{ "runs": { "etag" }, "heads": [{ "sha", "etags": { checkRuns, statuses,
 * workflowRuns } }] }`, both optional, for a v3 project. Returns { runs, heads (the first 5), extra (the
 * sixth and later shas, answered null) }, or null when malformed (answered null, never refused).
 */
export function jobsPart(jobs, project) {
  if (!plain(jobs) || project.model !== 'v3' || Object.keys(jobs).some((k) => k !== 'runs' && k !== 'heads')) return null;
  let runs = null;
  if (jobs.runs != null) {
    if (!plain(jobs.runs) || Object.keys(jobs.runs).some((k) => k !== 'etag') || !ETAG_OK(jobs.runs.etag)) return null;
    runs = { etag: jobs.runs.etag == null ? null : jobs.runs.etag };
  }
  const heads = [];
  const extra = [];
  if (jobs.heads != null) {
    if (!Array.isArray(jobs.heads)) return null;
    const seen = new Set();
    for (const hd of jobs.heads) {
      if (!plain(hd) || Object.keys(hd).some((k) => k !== 'sha' && k !== 'etags') || typeof hd.sha !== 'string' || !SHA_RE.test(hd.sha)) return null;
      const et = hd.etags == null ? {} : hd.etags;
      if (!plain(et) || Object.keys(et).some((k) => !JOB_LISTS.includes(k)) || !Object.values(et).every(ETAG_OK)) return null;
      if (seen.has(hd.sha)) continue;
      seen.add(hd.sha);
      if (heads.length < JOBS_MAX_HEADS) heads.push({ sha: hd.sha, etags: Object.fromEntries(JOB_LISTS.map((l) => [l, et[l] || null])) });
      else extra.push(hd.sha);
    }
  }
  return { runs, heads, extra };
}

/**
 * AC80's `ownerChecks` part (J6, J22): `[{ "sha", "etag" }]`, at most 3 heads of 40 hex characters,
 * for a v3 project. Returns null for a non-v3 project (the whole part answered `null`), else { heads
 * (the first 3, each { sha, etag }), extra (every other well-formed sha, answered `false`) }; a
 * malformed part reads nothing (its well-formed shas answered `false`), never refused.
 */
export function ownerChecksPart(part, project) {
  if (project.model !== 'v3') return null;
  const heads = [];
  const extra = [];
  if (!Array.isArray(part)) return { heads, extra };
  const ok = part.every((x) => plain(x) && Object.keys(x).every((k) => k === 'sha' || k === 'etag') && typeof x.sha === 'string'
    && SHA_RE.test(x.sha) && ETAG_OK(x.etag));
  const seen = new Set();
  for (const x of part) {
    if (!plain(x) || typeof x.sha !== 'string' || !SHA_RE.test(x.sha) || seen.has(x.sha)) continue;
    seen.add(x.sha);
    if (ok && heads.length < OWNER_CHECK_MAX) heads.push({ sha: x.sha, etag: x.etag == null ? null : x.etag });
    else extra.push(x.sha);
  }
  return { heads, extra };
}

const ISO_RE = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d{1,9})?Z$/;

function validateBlobs(body, config) {
  const project = projectByName(body.project, config);
  if (!project) return { error: 'unknown project' };
  const blobs = body.blobs == null ? [] : body.blobs;
  const history = body.history == null ? [] : body.history;
  const compare = body.compare == null ? [] : body.compare;
  if (!Array.isArray(blobs) || !Array.isArray(history) || !Array.isArray(compare)) return { error: 'bad lists' };
  if (blobs.some((s) => typeof s !== 'string' || !SHA_RE.test(s))) return { error: 'bad sha' };
  if (history.some((p) => typeof p !== 'string' || !HISTORY_PATH_RE.test(p))) return { error: 'bad history path' };
  // AC47: compare's base and head go through the same 40-lowercase-hex check as blob shas (N4).
  if (compare.some((c) => !c || typeof c !== 'object' || Array.isArray(c) || typeof c.base !== 'string'
    || typeof c.head !== 'string' || !SHA_RE.test(c.base) || !SHA_RE.test(c.head))) return { error: 'bad compare' };
  const pairs = [...new Map(compare.map((c) => [`${c.base}...${c.head}`, { base: c.base, head: c.head }])).values()];
  // J12 (2026-10-16): the optional `pulls` field, { after: null | "<cursor>" }; a v3 project's only.
  let pulls = null;
  if (body.pulls != null) {
    const pl = body.pulls;
    if (typeof pl !== 'object' || Array.isArray(pl) || Object.keys(pl).some((k) => k !== 'after')) return { error: 'bad pulls' };
    if (pl.after != null && (typeof pl.after !== 'string' || !PULLS_CURSOR_RE.test(pl.after))) return { error: 'bad pulls cursor' };
    if (project.model !== 'v3') return { error: 'pulls are read for v3 projects only' };
    pulls = { after: pl.after == null ? null : pl.after };
  }
  // J20 (2026-10-18): the optional `files` field, open pull requests' numbers, each one page of its
  // files counting 1 (a second or third page uses what the call's budget has left).
  let files = null;
  if (body.files != null) {
    if (!Array.isArray(body.files) || body.files.some((n) => !Number.isInteger(n) || n < 1 || n > 1e9)) return { error: 'bad files' };
    files = [...new Set(body.files)];
    if (files.length > MAX_FILES_PRS) return { error: 'too many files' };
  }
  // AC77 (draft 6; draft 7, Critic round 5, finding 5): the optional `closed` field, { since: <ISO
  // instant> }, the earliest held question's raised time: the closed pull requests, 1 to 3 pages,
  // counting 3 (its worst case).
  let closed = null;
  if (body.closed != null) {
    const c = body.closed;
    if (typeof c !== 'object' || Array.isArray(c) || Object.keys(c).some((k) => k !== 'since') || typeof c.since !== 'string'
      || !ISO_RE.test(c.since) || !Number.isFinite(Date.parse(c.since))) return { error: 'bad closed' };
    closed = { sinceMs: Date.parse(c.since) };
  }
  // AC77 (draft 7, finding 2b): the optional `prs` field, pull request numbers each read alone
  // (`GET pulls/<n>`), each counting 1: a recorded answer's pull request that left the open list.
  let prs = null;
  if (body.prs != null) {
    if (!Array.isArray(body.prs) || body.prs.some((n) => !Number.isInteger(n) || n < 1 || n > 1e9)) return { error: 'bad prs' };
    prs = [...new Set(body.prs)];
    if (prs.length > MAX_PRS) return { error: 'too many prs' };
  }
  // AC79 (J6): the optional `commitTime` (head commits' times, each 1) and `jobLog` (the log form for a
  // run id, each 3), at most 5 of each; a sixth, a commitTime entry that is not a sha and a jobLog entry
  // that is not digits are answered null, never refused.
  let commitTime = null;
  let commitTimeNull = [];
  // An entry that is not a string, or is over 100 characters, answers null under its own text, never a
  // refusal of the call (J6; security review round 1, G); a v2.5 project's jobLog entries all answer null.
  const entryKey = (x) => String(typeof x === 'string' ? x : JSON.stringify(x)).slice(0, 100);
  if (body.commitTime != null) {
    if (!Array.isArray(body.commitTime)) return { error: 'bad commitTime' };
    const ok = [...new Set(body.commitTime.filter((x) => typeof x === 'string' && x.length <= 100 && SHA_RE.test(x)))];
    commitTime = ok.slice(0, MAX_COMMIT_TIMES);
    commitTimeNull = [...new Set(body.commitTime.map(entryKey))].filter((k) => !commitTime.includes(k));
  }
  let jobLog = null;
  let jobLogNull = [];
  if (body.jobLog != null) {
    if (!Array.isArray(body.jobLog)) return { error: 'bad jobLog' };
    const ok = project.model === 'v3' ? [...new Set(body.jobLog.filter((x) => typeof x === 'string' && /^[0-9]{1,20}$/.test(x)))] : [];
    jobLog = ok.slice(0, MAX_JOB_LOGS);
    jobLogNull = [...new Set(body.jobLog.map(entryKey))].filter((k) => !jobLog.includes(k));
  }
  // J21 (2026-10-18, draft 4): the optional `usage` field, the account's Actions use, counting 5.
  if (body.usage != null && body.usage !== true) return { error: 'bad usage' };
  const usage = body.usage === true;
  const budget = new Set(blobs).size + 2 * new Set(history).size + pairs.length + (pulls ? PULLS_COST : 0)
    + (files ? files.length : 0) + (closed ? CLOSED_COST : 0) + (prs ? prs.length * PR_COST : 0) + (usage ? USAGE_COST : 0)
    + (commitTime ? commitTime.length * COMMIT_TIME_COST : 0) + (jobLog ? jobLog.length * JOB_LOG_COST : 0);
  if (budget > BLOB_BATCH) return { error: `budget ${budget} is over ${BLOB_BATCH}` };
  return { req: { project, blobs: [...new Set(blobs)], history: [...new Set(history)], compare: pairs, ...(pulls ? { pulls } : {}),
    ...(files ? { files } : {}), ...(closed ? { closed } : {}), ...(prs ? { prs } : {}), ...(usage ? { usage: { config: usageEntry(config) ? usageEntry(config).cfg : null } } : {}),
    ...(commitTime ? { commitTime, commitTimeNull } : {}), ...(jobLog ? { jobLog, jobLogNull } : {}),
    spare: BLOB_BATCH - budget } };
}

/**
 * Handle one Pages Function request. kind: 'poll' | 'blobs'.
 * deps (tests): { fetch, now, config }.
 */
export async function handle(context, kind, deps = {}) {
  const { request, env = {} } = context;
  const fetchImpl = deps.fetch || fetch;
  const now = deps.now || Date.now;
  const config = deps.config || CONFIG;

  const access = await checkAccess(request, env, { fetch: fetchImpl, now });
  if (!access.ok) return reply(403, 'Forbidden');

  if (request.method !== 'POST') return reply(405, 'Method Not Allowed');
  const type = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  if (type !== 'application/json') return reply(415, 'Unsupported Media Type');
  const origin = request.headers.get('Origin');
  if (origin !== null && origin !== new URL(request.url).origin) return reply(403, 'Forbidden');

  let body;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return bad('body too large');
    body = JSON.parse(text);
  } catch {
    return bad('body is not JSON');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return bad('body is not an object');

  const token = env.GITHUB_READ_TOKEN;
  const v = kind === 'poll' ? validatePoll(body, config) : validateBlobs(body, config);
  if (v.error) return bad(v.error);
  if (typeof token !== 'string' || token === '') {
    return reply(200, { project: v.req.project.name, readAt: new Date(now()).toISOString(), state: 'cant-read',
      reason: 'token', retryAfter: null, cost: { github: 0, bytes: 0 } });
  }
  // GITHUB_BILLING_TOKEN (Setup N12) is read only for J21's usage read, never sent back or logged.
  const ghDeps = { token, fetch: fetchImpl, now, billingToken: typeof env.GITHUB_BILLING_TOKEN === 'string' ? env.GITHUB_BILLING_TOKEN.trim() : '' };
  const out = kind === 'poll' ? await pollProject(v.req, ghDeps) : await readBlobs(v.req, ghDeps);
  const github = out.githubRequests;
  delete out.githubRequests;
  const bytes = new TextEncoder().encode(JSON.stringify(out)).length;
  out.cost = { github, bytes };
  return reply(200, out);
}
