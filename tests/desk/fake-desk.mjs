// A fake desk function for driving the page's real scheduler (AC1–AC8, AC14). It answers J6's
// poll and blob calls from in-memory repositories, honours the page's ETags the way the real
// function does (a null page for a matching ETag), and records every call with the fake time.

import { urlsFor, pageUrl } from '../../src/lib/github.js';
import { createHash } from 'node:crypto';

const etagOf = (s) => `"${createHash('sha1').update(s).digest('hex')}"`;
export const gitSha = (s) => createHash('sha1').update(`blob ${s}`).digest('hex');

/**
 * An in-memory repository: files { path: text }, pulls [GitHub PR objects], runs [workflow runs].
 * A run may be given short, as { name, status, conclusion }: it is then a push run of
 * `.github/workflows/<name>.yml`, run number 1, on whatever the head is (J1's 3a).
 */
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
      const runs = r.runs.map((x, i) => ({ path: x.path || `.github/workflows/${x.name}.yml`, name: x.name || x.path,
        event: x.event || 'push', status: x.status, conclusion: x.conclusion, run_number: x.run_number || i + 1,
        head_sha: head, html_url: `https://github.com/${project.repo}/actions/runs/${i + 1}` }));
      const runLists = ['push', 'workflow_dispatch'].map((ev) => {
        const url = u.runs(head, ev);
        const list = runs.filter((x) => x.event === ev);
        const raw = JSON.stringify({ total_count: list.length, workflow_runs: list });
        return { url, raw, etag: etagOf(raw + head), is304: (body.etags || {})[url] === etagOf(raw + head) };
      });
      const etags = body.etags || {};
      const bEtag = etagOf(head);
      const pEtag = etagOf(pullsRaw);
      const branch304 = body.head === head && etags[u.branch] === bEtag;
      const p304 = etags[u.pulls] === pEtag;
      const c304 = r.checksForbidden || runLists.every((l) => l.is304);
      const tree = body.head === head ? null : JSON.stringify({ sha: head, truncated: Boolean(r.truncated),
        tree: Object.entries(r.files).map(([p, t]) => ({ path: p, type: 'blob', sha: gitSha(t), size: t.length })) });
      let state = branch304 && p304 && c304 ? 'unchanged' : 'ok';
      if (f && f.state === 'partial') state = 'partial';
      return { ok: true, status: 200, json: { ...base, state, reason: state === 'partial' ? 'too-many' : null,
        head: branch304 ? null : { sha: head, treeSha: head, committedAt: null },
        etags: r.checksForbidden ? { [u.branch]: bEtag, [u.pulls]: pEtag }
          : { [u.branch]: bEtag, [u.pulls]: pEtag, ...Object.fromEntries(runLists.map((l) => [l.url, l.etag])) },
        pulls: [p304 ? null : pullsRaw], pullUrls: [u.pulls], pullNext: [p304 ? null : false],
        checks: r.checksForbidden ? [] : runLists.map((l) => (l.is304 ? null : l.raw)),
        checkUrls: r.checksForbidden ? [] : runLists.map((l) => l.url),
        checkNext: r.checksForbidden ? [] : runLists.map((l) => (l.is304 ? null : false)),
        checksState: r.checksForbidden ? 'cant-read' : 'ok', tree } };
    }
    const texts = new Map(Object.values(r.files).map((t) => [gitSha(t), t]));
    const blobs = {};
    for (const s of body.blobs) blobs[s] = texts.has(s) ? texts.get(s) : null;
    const history = {};
    for (const p of body.history) history[p] = [JSON.stringify(r.history[p] || [{ commit: { committer: { date: '2026-10-06T10:00:00Z' } } }])];
    const compare = {};
    for (const c of body.compare || []) {
      const key = `${c.base}...${c.head}`;
      const ans = r.compare ? r.compare(c.base, c.head) : null;
      compare[key] = ans == null ? null : JSON.stringify({ status: ans });
    }
    return { ok: true, status: 200, json: { ...base, state: 'ok', blobs, history, compare } };
  }
  return { call, calls };
}

// The PR #40 review's example (N4): a dispatch-log line whose `item` is an object with
// non-callable toString and valueOf. From M2 the page type-checks log lines (AC31), so this line is
// named in notes and skipped; it no longer throws.
export const BAD_LOG_LINE = '{"action":"dispatch","time":"2026-10-06T18:30:00Z","item":{"toString":1,"valueOf":1},"role":"builder","stage":5}';

export { pageUrl };

// A record that still throws while a project's model is built (AC30's drawing case): a pull
// request whose title is an object with non-callable toString and valueOf. It parses as JSON;
// turning it into the flagged PR's title throws.
export const BAD_PR = { ...pr(66, 'x'), title: { toString: 1, valueOf: 1 } };
