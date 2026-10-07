// The desk function's GitHub reader (spec S-001, J1). It makes conditional REST reads with the
// read token and hands the raw bodies back; the only body it parses is the branch's (and a
// blob's JSON form, when GitHub ignores the raw media type). It never retries.

export const API = 'https://api.github.com';
export const BLOB_BATCH = 25; // EXP-001 may lower it to 12, then 6.
export const MAX_PAGES = 3;
export const MAX_PARALLEL = 6;
export const SHA_RE = /^[0-9a-f]{40}$/;
export const HISTORY_PATH_RE = /^(decisions\/)?questions\/[^/]+\.md$/;

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
    checks: (sha) => `${base}/commits/${sha}/check-runs?per_page=100`,
    tree: (sha) => `${base}/git/trees/${sha}?recursive=1`,
    blob: (sha) => `${base}/git/blobs/${sha}`,
    history: (path) => `${base}/commits?path=${encodeURIComponent(path)}&sha=${encodeURIComponent(project.defaultBranch)}&per_page=100`,
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

class Failure extends Error {
  constructor(reason, retryAfter = null, words = null) {
    super(reason);
    this.reason = reason;
    this.retryAfter = retryAfter;
    this.words = words;
  }
}

function failFrom(res, nowMs) {
  if (res == null) return new Failure('github');
  const f = failureOf(res, nowMs);
  return new Failure(f.reason, f.retryAfter);
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

    // 3. Check runs on the head.
    let cl;
    try {
      cl = await readList(get, u.checks(headSha), etagsIn, nowMs);
    } catch (f) {
      if (f instanceof Failure && f.reason === 'token') {
        cl = null; // 403 on check-runs only: CI can't be read; the project stays readable.
      } else throw f;
    }
    if (cl) {
      Object.assign(out.etags, cl.etags);
      out.checks = cl.pages;
      out.checkUrls = cl.urls;
      out.checkNext = cl.next;
    } else {
      out.checksState = 'cant-read';
    }

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
 * The blob call (J1, J6). req: { project, blobs: [sha], history: [path] } (already validated).
 * At most six requests wait at once. A failure stops new requests; nothing is retried.
 */
export async function readBlobs(req, deps) {
  const { project } = req;
  const nowMs = deps.now();
  const counter = { n: 0 };
  const get = makeGetter(deps.token, deps.fetch, counter);
  const u = urlsFor(project);
  const out = {
    project: project.name, readAt: new Date(nowMs).toISOString(), state: 'ok', reason: null,
    retryAfter: null, blobs: {}, history: {},
  };
  let failure = null;
  const fail = (f) => {
    if (!failure || f.reason === 'rate-limit') failure = f;
  };
  const tasks = [];
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
  await pool(tasks, MAX_PARALLEL);
  if (failure) {
    out.state = 'cant-read';
    out.reason = failure.reason;
    out.retryAfter = failure.retryAfter;
  }
  out.githubRequests = counter.n;
  return out;
}
