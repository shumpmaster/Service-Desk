// The desk function's request handling (spec S-001, J6 request checks, J8, AC13).
// Order: the Access check (403, before anything else and before any GitHub call), then the
// method (405), the content type (415), the Origin (403), then the body (400). No CORS headers
// are ever sent, so no other origin can read a response.

import { checkAccess } from './access.js';
import { pollProject, readBlobs, BLOB_BATCH, SHA_RE, HISTORY_PATH_RE } from './github.js';
import CONFIG from './config.js';

const MAX_ETAGS = 7;
const MAX_ETAG_BYTES = 2048;
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

function validateBlobs(body, config) {
  const project = projectByName(body.project, config);
  if (!project) return { error: 'unknown project' };
  const blobs = body.blobs == null ? [] : body.blobs;
  const history = body.history == null ? [] : body.history;
  if (!Array.isArray(blobs) || !Array.isArray(history)) return { error: 'bad lists' };
  if (blobs.some((s) => typeof s !== 'string' || !SHA_RE.test(s))) return { error: 'bad sha' };
  if (history.some((p) => typeof p !== 'string' || !HISTORY_PATH_RE.test(p))) return { error: 'bad history path' };
  const budget = new Set(blobs).size + 2 * new Set(history).size;
  if (budget > BLOB_BATCH) return { error: `budget ${budget} is over ${BLOB_BATCH}` };
  return { req: { project, blobs: [...new Set(blobs)], history: [...new Set(history)] } };
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
  const ghDeps = { token, fetch: fetchImpl, now };
  const out = kind === 'poll' ? await pollProject(v.req, ghDeps) : await readBlobs(v.req, ghDeps);
  const github = out.githubRequests;
  delete out.githubRequests;
  const bytes = new TextEncoder().encode(JSON.stringify(out)).length;
  out.cost = { github, bytes };
  return reply(200, out);
}
