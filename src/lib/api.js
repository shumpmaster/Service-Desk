// The desk function's request handling (spec S-001, J6 request checks, J8, AC13).
// Order: the Access check (403, before anything else and before any GitHub call), then the
// method (405), the content type (415), the Origin (403), then the body (400). No CORS headers
// are ever sent, so no other origin can read a response.

import { checkAccess } from './access.js';
import { pollProject, readBlobs, BLOB_BATCH, SHA_RE, HISTORY_PATH_RE, PULLS_COST, PULLS_CURSOR_RE, USAGE_COST, CLOSED_COST, MAX_FILES_PRS, PR_COST, MAX_PRS } from './github.js';
import CONFIG from './config.js';

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
  return { req: { project, head: body.head || null, etags } };
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
  // J21 (2026-10-18, draft 4): the optional `usage` field, the account's Actions use, counting 5.
  if (body.usage != null && body.usage !== true) return { error: 'bad usage' };
  const usage = body.usage === true;
  const budget = new Set(blobs).size + 2 * new Set(history).size + pairs.length + (pulls ? PULLS_COST : 0)
    + (files ? files.length : 0) + (closed ? CLOSED_COST : 0) + (prs ? prs.length * PR_COST : 0) + (usage ? USAGE_COST : 0);
  if (budget > BLOB_BATCH) return { error: `budget ${budget} is over ${BLOB_BATCH}` };
  return { req: { project, blobs: [...new Set(blobs)], history: [...new Set(history)], compare: pairs, ...(pulls ? { pulls } : {}),
    ...(files ? { files } : {}), ...(closed ? { closed } : {}), ...(prs ? { prs } : {}), ...(usage ? { usage: { config: config.actionsUsage || null } } : {}),
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
