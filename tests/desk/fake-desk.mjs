// A fake desk function for driving the page's real scheduler (AC1–AC8, AC14). It answers J6's
// poll and blob calls from in-memory repositories, honours the page's ETags the way the real
// function does (a null page for a matching ETag), and records every call with the fake time.

import { urlsFor, pageUrl } from '../../src/lib/github.js';
import { createHash } from 'node:crypto';

const etagOf = (s) => `"${createHash('sha1').update(s).digest('hex')}"`;
export const gitSha = (s) => createHash('sha1').update(`blob ${s}`).digest('hex');

/** An in-memory repository: files { path: text }, pulls [GitHub PR objects], runs [check runs]. */
export function repo(files = {}, pulls = [], runs = []) {
  const r = { files: { ...files }, pulls: [...pulls], runs: [...runs], commits: 0, fail: null, history: {} };
  r.commit = (changes = {}) => {
    for (const [p, t] of Object.entries(changes)) {
      if (t == null) delete r.files[p];
      else r.files[p] = t;
    }
    r.commits++;
  };
  r.head = () => createHash('sha1').update(`${r.commits}:${JSON.stringify(Object.keys(r.files).sort().map((p) => [p, r.files[p]]))}`).digest('hex');
  return r;
}

export function pr(number, title, { draft = false, base = 'main', head = `feature-${number}`, login = 'shumpmaster',
  headRepo = 'shumpmaster/Service-Desk' } = {}) {
  return { number, title, html_url: `https://github.com/shumpmaster/Service-Desk/pull/${number}`, draft,
    base: { ref: base }, head: { ref: head, repo: headRepo == null ? null : { full_name: headRepo } }, user: { login },
    created_at: '2026-10-06T12:00:00Z', state: 'open' };
}

/**
 * fakeServer({ name: repo }, config, clock) → { call(path, body), calls: [{ path, project, at }] }.
 * A repo's `fail` can be set to { kind: 'network' | 'signed-out' | 'cloudflare' } or
 * { state: 'cant-read', reason, retryAfter? } or { state: 'partial' }.
 */
export function fakeServer(repos, config, clock) {
  const calls = [];
  const byName = (n) => config.projects.find((p) => p.name === n);
  async function call(path, body) {
    calls.push({ path, project: body.project, at: clock.now(), body });
    const r = repos[body.project];
    const project = byName(body.project);
    const f = r.fail;
    if (f && f.kind === 'network') return { ok: false, status: 0, reason: 'network' };
    if (f && f.kind === 'signed-out') return { ok: false, status: 403, reason: 'signed-out' };
    if (f && f.kind === 'cloudflare') return { ok: false, status: 503, reason: 'cloudflare', cfError: 1102, words: 'Cloudflare or desk-function error (HTTP 503, Error 1102)' };
    const base = { project: body.project, readAt: new Date(clock.now()).toISOString(), reason: null, retryAfter: null, cost: { github: 3, bytes: 100 } };
    if (f && f.state === 'cant-read') return { ok: true, status: 200, json: { ...base, state: 'cant-read', reason: f.reason, retryAfter: f.retryAfter || null } };
    if (path === '/api/poll') {
      const u = urlsFor(project);
      const head = r.head();
      const pullsRaw = JSON.stringify(r.pulls);
      const checksRaw = JSON.stringify({ total_count: r.runs.length, check_runs: r.runs });
      const etags = body.etags || {};
      const bEtag = etagOf(head);
      const pEtag = etagOf(pullsRaw);
      const cEtag = etagOf(checksRaw + head);
      const branch304 = body.head === head && etags[u.branch] === bEtag;
      const p304 = etags[u.pulls] === pEtag;
      const c304 = etags[u.checks(head)] === cEtag;
      const tree = body.head === head ? null : JSON.stringify({ sha: head, truncated: Boolean(r.truncated),
        tree: Object.entries(r.files).map(([p, t]) => ({ path: p, type: 'blob', sha: gitSha(t), size: t.length })) });
      let state = branch304 && p304 && c304 ? 'unchanged' : 'ok';
      if (f && f.state === 'partial') state = 'partial';
      return { ok: true, status: 200, json: { ...base, state, reason: state === 'partial' ? 'too-many' : null,
        head: branch304 ? null : { sha: head, treeSha: head, committedAt: null },
        etags: { [u.branch]: bEtag, [u.pulls]: pEtag, [u.checks(head)]: cEtag },
        pulls: [p304 ? null : pullsRaw], pullUrls: [u.pulls], pullNext: [p304 ? null : false],
        checks: [c304 ? null : checksRaw], checkUrls: [u.checks(head)], checkNext: [c304 ? null : false],
        checksState: r.checksForbidden ? 'cant-read' : 'ok', tree } };
    }
    const texts = new Map(Object.values(r.files).map((t) => [gitSha(t), t]));
    const blobs = {};
    for (const s of body.blobs) blobs[s] = texts.has(s) ? texts.get(s) : null;
    const history = {};
    for (const p of body.history) history[p] = [JSON.stringify(r.history[p] || [{ commit: { committer: { date: '2026-10-06T10:00:00Z' } } }])];
    return { ok: true, status: 200, json: { ...base, state: 'ok', blobs, history } };
  }
  return { call, calls };
}

// The PR #40 review's example (N4): a dispatch-log line whose `item` is an object with
// non-callable toString and valueOf. It parses as JSON and matches the dispatch shape; turning it
// into words throws while the model is built.
export const BAD_LOG_LINE = '{"action":"dispatch","time":"2026-10-06T18:30:00Z","item":{"toString":1,"valueOf":1},"role":"builder","stage":5}';

export { pageUrl };
