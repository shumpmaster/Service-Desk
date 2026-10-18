// The desk function's GitHub reader (spec S-001, J1). It makes conditional REST reads with the
// read token and hands the raw bodies back; the only body it parses is the branch's (and a
// blob's JSON form, when GitHub ignores the raw media type, and a compare answer, which it cuts
// down to its status before returning it). It never retries.

import { readUsage } from './usage.js';

export const API = 'https://api.github.com';
export const BLOB_BATCH = 25; // EXP-001 may lower it to 12, then 6.
export const MAX_PAGES = 3;
export const MAX_PARALLEL = 6;
// One check for every sha the desk takes from the page: blob shas, the poll's head and compare's
// base and head alike (review N4 on the M2 amendment): 40 lowercase hex digits.
export const SHA_RE = /^[0-9a-f]{40}$/;
// J6: owner questions and their rulings (J2), and from M2 the Orchestrator's hold cards (AC46).
export const HISTORY_PATH_RE = /^((decisions\/)?questions\/[^/]+\.md|queue\/ci-hold-[0-9a-f]{12}\.md)$/;
// J20 (2026-10-18): open pull requests' files, one page counting 1 of the blob call's budget.
export const FILES_PAGES = 3;
export const MAX_FILES_PRS = 25;
// AC77 (draft 6): one page of the closed pull requests, newest updated first, counting 1.
export const CLOSED_COST = 1;
// J21 (draft 4): the account's Actions use, 3 to 5 requests, counting 5.
export const USAGE_COST = 5;
// J1 3a and 3b: the workflow-run lists read for the head (AC29), push runs then dispatch runs.
export const RUN_EVENTS = ['push', 'workflow_dispatch'];

// J12 (2026-10-16, AC60, AC61, AC72): the one GraphQL query, its text fixed here; the page sends only
// its cursor. The default branch's pull requests, newest first by creation, 100 to a page, with the
// fields the Timeline and the Queue's deploy check use, and the check rollup of each one's last commit.
export const GRAPHQL_URL = `${'https://api.github.com'}/graphql`;
export const PULLS_PAGE = 100;
export const PULLS_COST = 5; // J12: the read counts 5 against the blob call's budget of 25 (C)
export const PULLS_CURSOR_RE = /^[A-Za-z0-9+/=_-]{1,200}$/;
export const PULLS_QUERY = `query($owner: String!, $name: String!, $base: String!, $after: String) {
  repository(owner: $owner, name: $name) {
    pullRequests(baseRefName: $base, first: ${PULLS_PAGE}, after: $after, orderBy: {field: CREATED_AT, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        number title body state createdAt mergedAt closedAt headRefName
        mergeCommit { oid message author { name } }
        commits(last: 1) { nodes { commit { statusCheckRollup { state } } } }
      }
    }
  }
}`;

/** J12's variables for a project (J7) and a cursor: the repository's owner and name, its default branch, and `after`. */
export function pullsVariables(project, after) {
  const [owner, name] = String(project.repo).split('/');
  return { owner, name, base: project.defaultBranch, after: after == null ? null : after };
}

const JSON_ACCEPT = 'application/vnd.github+json';
const RAW_ACCEPT = 'application/vnd.github.raw+json';

function encPath(p) {
  return p.split('/').map(encodeURIComponent).join('/');
}

/** The URLs J1 reads for a project. Page N>1 adds `&page=N`. */
export function urlsFor(project) {
  const base = `${API}/repos/${encPath(project.repo)}`;
  return {
    branch: `${base}/branches/${encPath(project.defaultBranch)}`,
    pulls: `${base}/pulls?state=open&per_page=100`,
    runs: (sha, event) => `${base}/actions/runs?head_sha=${sha}&event=${event}&exclude_pull_requests=true&per_page=100`,
    tree: (sha) => `${base}/git/trees/${sha}?recursive=1`,
    blob: (sha) => `${base}/git/blobs/${sha}`,
    compare: (b, h) => `${base}/compare/${b}...${h}?per_page=1`,
    history: (path) => `${base}/commits?path=${encodeURIComponent(path)}&sha=${encodeURIComponent(project.defaultBranch)}&per_page=100`,
    files: (n) => `${base}/pulls/${n}/files?per_page=100`,
    closed: `${base}/pulls?state=closed&sort=updated&direction=desc&per_page=100`,
  };
}

export function pageUrl(base, n) {
  return n === 1 ? base : `${base}&page=${n}`;
}

/** rel → page number from a Link header (`<…&page=3>; rel="last"`), or null. */
export function linkPage(link, rel) {
  if (!link) return null;
  for (const part of link.split(',')) {
    const m = /<([^>]*)>\s*;\s*rel="([^"]+)"/.exec(part);
    if (m && m[2].split(/\s+/).includes(rel)) {
      const p = /[?&]page=([0-9]+)/.exec(m[1]);
      return p ? Number(p[1]) : 1;
    }
  }
  return null;
}

/** Why a non-2xx, non-304 answer failed: { reason, retryAfter }. */
export function failureOf(res, nowMs) {
  const h = (k) => res.headers.get(k);
  const remaining = h('X-RateLimit-Remaining');
  const retry = h('Retry-After');
  if ((res.status === 403 || res.status === 429) && (remaining === '0' || retry != null || res.status === 429)) {
    let after = null;
    if (retry != null && /^[0-9]+$/.test(retry.trim())) after = Number(retry.trim());
    else if (h('X-RateLimit-Reset') && /^[0-9]+$/.test(h('X-RateLimit-Reset'))) {
      after = Math.max(0, Number(h('X-RateLimit-Reset')) - Math.floor(nowMs / 1000));
    }
    return { reason: 'rate-limit', retryAfter: after == null ? 60 : Math.max(after, 1) };
  }
  if (res.status === 401 || res.status === 403) return { reason: 'token', retryAfter: null };
  return { reason: 'github', retryAfter: null };
}

function makeGetter(token, fetchImpl, counter) {
  return async (url, { etag = null, accept = JSON_ACCEPT } = {}) => {
    counter.n++;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'service-desk',
    };
    if (etag) headers['If-None-Match'] = etag;
    try {
      return await fetchImpl(url, { method: 'GET', headers });
    } catch {
      return null; // network failure reaching GitHub
    }
  };
}

/** The one POST the function makes (J12): the fixed query to GitHub's GraphQL endpoint, with the read token. */
function makePoster(token, fetchImpl, counter) {
  return async (url, body) => {
    counter.n++;
    try {
      return await fetchImpl(url, { method: 'POST', headers: {
        Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'service-desk',
      }, body: JSON.stringify(body) });
    } catch {
      return null;
    }
  };
}

class Failure extends Error {
  constructor(reason, retryAfter = null, words = null, status = null) {
    super(reason);
    this.reason = reason;
    this.retryAfter = retryAfter;
    this.words = words;
    this.status = status; // GitHub's HTTP status, when GitHub answered
  }
}

function failFrom(res, nowMs) {
  if (res == null) return new Failure('github');
  const f = failureOf(res, nowMs);
  return new Failure(f.reason, f.retryAfter, null, res.status);
}

/**
 * Read every page of a list (J1 paging). Page N+1 is requested when page N's Link names a next
 * page, or, when page N answered 304 (which carries no Link), when the page sent an ETag for page
 * N+1. Returns { pages, urls, next, etags, all304, tooMany }.
 */
async function readList(get, base, etagsIn, nowMs) {
  const pages = [];
  const urls = [];
  const next = [];
  const etags = {};
  let all304 = true;
  let tooMany = false;
  for (let n = 1; n <= MAX_PAGES; n++) {
    const url = pageUrl(base, n);
    const etag = etagsIn[url] || null;
    const res = await get(url, { etag });
    if (res && res.status === 304) {
      urls.push(url);
      pages.push(null);
      next.push(null);
      etags[url] = res.headers.get('ETag') || etag;
      if (etagsIn[pageUrl(base, n + 1)] && n < MAX_PAGES) continue;
      break;
    }
    if (!res || !res.ok) throw failFrom(res, nowMs);
    all304 = false;
    urls.push(url);
    pages.push(await res.text());
    const tag = res.headers.get('ETag');
    if (tag) etags[url] = tag;
    const hasNext = linkPage(res.headers.get('Link'), 'next') != null;
    next.push(hasNext);
    if (!hasNext) break;
    if (n === MAX_PAGES) tooMany = true;
  }
  return { pages, urls, next, etags, all304, tooMany };
}

/**
 * The poll call (J1, J6). req: { project (J7 entry), head: sha|null, etags: {url: etag} }.
 * deps: { token, fetch, now }. Returns the J6 poll response (without `cost`, which the caller
 * adds) plus `githubRequests`.
 */
export async function pollProject(req, deps) {
  const { project } = req;
  const nowMs = deps.now();
  const counter = { n: 0 };
  const get = makeGetter(deps.token, deps.fetch, counter);
  const u = urlsFor(project);
  const etagsIn = req.etags || {};
  const out = {
    project: project.name, readAt: new Date(nowMs).toISOString(), state: 'ok', reason: null,
    retryAfter: null, head: null, etags: {}, pulls: [], pullUrls: [], pullNext: [],
    checks: [], checkUrls: [], checkNext: [], checksState: 'ok', tree: null,
  };
  const failWith = (f) => {
    out.state = 'cant-read';
    out.reason = f.reason;
    out.retryAfter = f.retryAfter;
    out.words = f.words;
    out.githubRequests = counter.n;
    return out;
  };
  try {
    // 1. The branch: the only body the function parses.
    const branchEtag = req.head ? etagsIn[u.branch] || null : null;
    const bres = await get(u.branch, { etag: branchEtag });
    let headSha;
    let treeSha = null;
    let branch304 = false;
    if (bres && bres.status === 304) {
      branch304 = true;
      headSha = req.head;
      out.etags[u.branch] = bres.headers.get('ETag') || branchEtag;
    } else if (bres && bres.ok) {
      const tag = bres.headers.get('ETag');
      if (tag) out.etags[u.branch] = tag;
      let body;
      try {
        body = await bres.json();
      } catch {
        throw new Failure('github');
      }
      const c = body && body.commit;
      headSha = c && c.sha;
      treeSha = c && c.commit && c.commit.tree && c.commit.tree.sha;
      if (!SHA_RE.test(headSha || '') || !SHA_RE.test(treeSha || '')) throw new Failure('github');
      out.head = { sha: headSha, treeSha, committedAt: (c.commit.committer && c.commit.committer.date) || null };
    } else if (bres && bres.status === 404) {
      throw new Failure('config', null, `default branch ${project.defaultBranch} not found`);
    } else {
      throw failFrom(bres, nowMs);
    }

    // 2. Open pull requests.
    const pl = await readList(get, u.pulls, etagsIn, nowMs);
    Object.assign(out.etags, pl.etags);
    out.pulls = pl.pages;
    out.pullUrls = pl.urls;
    out.pullNext = pl.next;

    // 3. Workflow runs on the head (AC29): 3a push runs, then 3b workflow_dispatch runs. Their
    // pages go back in `checks`, 3a's first, each named by its URL.
    const lists = [];
    for (const event of RUN_EVENTS) {
      let cl;
      try {
        cl = await readList(get, u.runs(headSha, event), etagsIn, nowMs);
      } catch (f) {
        // J1: a 403 (without rate-limit headers) on workflow runs only means the token lacks
        // Actions: read: CI can't be read, and the project stays readable. A 401 is the token
        // itself failing, as on every other request: the project can't be read, reason token.
        if (f instanceof Failure && f.reason === 'token' && f.status === 403) {
          lists.length = 0;
          out.checksState = 'cant-read';
          break;
        }
        throw f;
      }
      lists.push(cl);
    }
    for (const cl of lists) {
      Object.assign(out.etags, cl.etags);
      out.checks.push(...cl.pages);
      out.checkUrls.push(...cl.urls);
      out.checkNext.push(...cl.next);
    }
    const cl = lists.length ? { tooMany: lists.some((x) => x.tooMany), all304: lists.every((x) => x.all304) } : null;

    // 4. The tree, only when the head moved (or the page sent none).
    if (!branch304 && headSha !== req.head) {
      const tres = await get(u.tree(treeSha));
      if (!tres || !tres.ok) throw failFrom(tres, nowMs);
      out.tree = await tres.text();
    }

    if (pl.tooMany || (cl && cl.tooMany)) {
      out.state = 'partial';
      out.reason = 'too-many';
    } else if (branch304 && pl.all304 && (!cl || cl.all304)) {
      out.state = 'unchanged';
    }
  } catch (f) {
    if (f instanceof Failure) return failWith(f);
    return failWith(new Failure('github'));
  }
  out.githubRequests = counter.n;
  return out;
}

function decodeBase64Utf8(b64) {
  const bin = atob(String(b64).replace(/\s+/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function blobText(res) {
  const type = (res.headers.get('Content-Type') || '').toLowerCase();
  const text = await res.text();
  if (type.startsWith('application/json')) {
    try {
      const v = JSON.parse(text);
      if (v && typeof v.content === 'string' && v.encoding === 'base64') return decodeBase64Utf8(v.content);
    } catch {
      // not the JSON blob form; fall through to the text as it came
    }
  }
  return text;
}

/**
 * A compare answer, cut down to what the page reads (reviews N1 and N4 on the amendment): GitHub's
 * body carries `files` with their patch text and a `commits` list, which can run to megabytes. The
 * top-level `status`, `ahead_by`, `behind_by` and `total_commits` come before `commits` and
 * `files`, so only the head of the text is scanned (at most COMPARE_SCAN_CHARS characters, cut at
 * the top-level `"commits":`); the body is never parsed whole. The answer is
 * `{"status", "ahead_by", "behind_by", "total_commits"}` as JSON, or null when no status is found
 * there (a failed read: the merge card stays flagged).
 */
export const COMPARE_SCAN_CHARS = 65536;
const COMPARE_STATUS_RE = /"status"\s*:\s*"(ahead|behind|identical|diverged)"/;
const COMPARE_COUNTS = ['ahead_by', 'behind_by', 'total_commits'];

export function compareBody(text) {
  let head = String(text == null ? '' : text).slice(0, COMPARE_SCAN_CHARS);
  const cut = head.indexOf('"commits"');
  if (cut >= 0) head = head.slice(0, cut);
  const st = COMPARE_STATUS_RE.exec(head);
  if (!st) return null;
  const keep = { status: st[1] };
  for (const k of COMPARE_COUNTS) {
    const m = new RegExp(`"${k}"\\s*:\\s*([0-9]+)`).exec(head);
    if (m) keep[k] = Number(m[1]);
  }
  return JSON.stringify(keep);
}

/** Read only as much of a compare response as compareBody needs, then stop the download. */
async function compareFromResponse(res) {
  if (!res.body || typeof res.body.getReader !== 'function') return compareBody(await res.text());
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let text = '';
  try {
    while (text.length < COMPARE_SCAN_CHARS) {
      const { done, value } = await reader.read();
      if (done) break;
      text += dec.decode(value, { stream: true });
      if (text.includes('"commits"')) break;
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // already closed
    }
  }
  return compareBody(text);
}

async function pool(tasks, limit) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (i < tasks.length) {
      const task = tasks[i++];
      await task();
    }
  });
  await Promise.all(workers);
}

/**
 * The blob call (J1, J6). req: { project, blobs: [sha], history: [path], compare: [{ base, head }],
 * pulls?: { after } } (already validated).
 * At most six requests wait at once. A failure stops new requests; nothing is retried.
 * J12's `pulls` (2026-10-16): the fixed GraphQL query, answered raw as `pulls` (the page judges the
 * answer, its errors included); `null` when GitHub could not be reached or the call stopped first. A
 * 401 (the token failing) stops the call as for every read; GraphQL's own rate limit is J12's alone,
 * so its answer goes back to the page like any other, and the REST reads are not stopped for it (C).
 */
export async function readBlobs(req, deps) {
  const { project } = req;
  const nowMs = deps.now();
  const counter = { n: 0 };
  const get = makeGetter(deps.token, deps.fetch, counter);
  const post = makePoster(deps.token, deps.fetch, counter);
  const u = urlsFor(project);
  const out = {
    project: project.name, readAt: new Date(nowMs).toISOString(), state: 'ok', reason: null,
    retryAfter: null, blobs: {}, history: {}, compare: {},
  };
  let failure = null;
  const fail = (f) => {
    if (!failure || f.reason === 'rate-limit') failure = f;
  };
  const tasks = [];
  if (req.pulls) {
    out.pulls = null;
    tasks.push(async () => {
      if (failure) return;
      const res = await post(GRAPHQL_URL, { query: PULLS_QUERY, variables: pullsVariables(project, req.pulls.after) });
      if (!res) return;
      if (res.status === 401) return fail(failFrom(res, nowMs));
      out.pulls = await res.text();
    });
  }
  for (const sha of req.blobs) {
    out.blobs[sha] = null;
    tasks.push(async () => {
      if (failure) return;
      const res = await get(u.blob(sha), { accept: RAW_ACCEPT });
      if (!res || !res.ok) return fail(failFrom(res, nowMs));
      out.blobs[sha] = await blobText(res);
    });
  }
  for (const path of req.history) {
    out.history[path] = null;
    tasks.push(async () => {
      if (failure) return;
      const base = u.history(path);
      const res = await get(base);
      if (!res || !res.ok) return fail(failFrom(res, nowMs));
      const first = await res.text();
      const last = linkPage(res.headers.get('Link'), 'last');
      if (last && last > 1) {
        if (failure) return;
        const lres = await get(pageUrl(base, last));
        if (!lres || !lres.ok) return fail(failFrom(lres, nowMs));
        out.history[path] = [first, await lres.text()];
      } else {
        out.history[path] = [first];
      }
    });
  }
  for (const { base, head } of req.compare || []) {
    const key = `${base}...${head}`;
    out.compare[key] = null;
    tasks.push(async () => {
      if (failure) return;
      const res = await get(u.compare(base, head));
      if (!res || !res.ok) {
        // J6: a failed compare is a null answer and the merge card stays flagged. Only a rate limit
        // or the token failing stops the call, as for every other read.
        const f = failFrom(res, nowMs);
        if (f.reason === 'rate-limit' || (f.reason === 'token' && f.status === 401)) fail(f);
        return;
      }
      out.compare[key] = await compareFromResponse(res);
    });
  }
  // J20: each pull request's files, raw pages; a second or third page only while the budget lasts.
  // A failed read is a null answer (the question stays ordinary); only a rate limit or a 401 stops the call.
  let spare = Number.isInteger(req.spare) ? req.spare : 0;
  const optionalFail = (res) => {
    const f = failFrom(res, nowMs);
    if (f.reason === 'rate-limit' || (f.reason === 'token' && f.status === 401)) fail(f);
  };
  for (const n of req.files || []) {
    out.files = out.files || {};
    out.files[n] = null;
    tasks.push(async () => {
      if (failure) return;
      const pages = [];
      for (let page = 1; page <= FILES_PAGES; page++) {
        if (page > 1) {
          if (spare < 1) return; // the budget is spent: no answer, read again later
          spare--;
        }
        const res = await get(pageUrl(u.files(n), page));
        if (!res || !res.ok) return optionalFail(res);
        pages.push(await res.text());
        if (linkPage(res.headers.get('Link'), 'next') == null) break;
      }
      out.files[n] = pages;
    });
  }
  if (req.closed) {
    out.closed = null;
    tasks.push(async () => {
      if (failure) return;
      const res = await get(u.closed);
      if (!res || !res.ok) return optionalFail(res);
      out.closed = await res.text();
    });
  }
  if (req.usage) {
    out.usage = null;
    tasks.push(async () => {
      if (failure) return;
      const cfg = req.usage.config;
      const counted = (url, init) => {
        counter.n++;
        return deps.fetch(url, init);
      };
      const r = cfg ? await readUsage({ account: cfg.account, token: deps.billingToken || '', fetch: counted, nowMs, reported: cfg.reported })
        : { state: 'not-configured', asOf: new Date(nowMs).toISOString(), period: null, summary: { ok: false, items: [] }, usage: { ok: false, items: [] }, publicRepos: null };
      // The kept fields only (J21): never the token, and no status codes.
      out.usage = { state: r.state, asOf: r.asOf, period: r.period, summary: r.summary, usage: r.usage, publicRepos: r.publicRepos };
    });
  }
  await pool(tasks, MAX_PARALLEL);
  if (failure) {
    out.state = 'cant-read';
    out.reason = failure.reason;
    out.retryAfter = failure.retryAfter;
  }
  out.githubRequests = counter.n;
  return out;
}
