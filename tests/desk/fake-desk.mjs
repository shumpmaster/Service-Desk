// A fake desk function for driving the page's real scheduler (AC1–AC8, AC14). It answers J6's
// poll and blob calls from in-memory repositories, honours the page's ETags the way the real
// function does (a null page for a matching ETag), and records every call with the fake time.

import { urlsFor, pageUrl, keptPull, keptLogLines, JOB_LOG_CHARS, portfolioUrls } from '../../src/lib/github.js';
import { jobsPart, ownerChecksPart, validatePortfolio } from '../../src/lib/api.js';
import { closedNeedsNext, CLOSED_MAX_PAGES } from '../../src/lib/prfiles.js';
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
  headRepo = 'shumpmaster/Service-Desk', sha = null, createdAt = '2026-10-06T12:00:00Z', private: priv = undefined } = {}) {
  return { number, title, html_url: `https://github.com/shumpmaster/Service-Desk/pull/${number}`, draft,
    base: { ref: base, ...(priv === undefined ? {} : { repo: { private: priv } }) },
    head: { ref: head, repo: headRepo == null ? null : { full_name: headRepo }, ...(sha ? { sha } : {}) }, user: { login },
    created_at: createdAt, state: 'open' };
}

/**
 * AC79's reads for a repository (2026-10-19), from its `jobs` field (NOT real records, made up per test):
 * { asksRuns: [run], checks: { sha: { checkRuns, statuses, workflowRuns } }, runJobs: { runId: [job] },
 * logs: { jobId: text }, commits: { sha: iso }, next: { sha: [list] }, fail: { runs, heads: [sha],
 * logs: [runId], commitTime: [sha], part } }. The poll's `jobs` part is answered with ETags honoured (a
 * matching one answers null, a 304), as the function answers it; `reads` counts each conditional request.
 */
function jobsAnswer(r, project, part) {
  const J = r.jobs || {};
  const F = J.fail || {};
  const v = jobsPart(part, project);
  if (!v || F.part) return null;
  J.reads = (J.reads || 0) + (v.runs ? 1 : 0) + 3 * v.heads.length;
  const out = { heads: {}, etags: { heads: {} }, next: {} };
  const answer = (raw, sent, failed) => {
    if (failed) return { page: false, etag: null };
    const tag = etagOf(raw);
    return sent === tag ? { page: null, etag: tag } : { page: raw, etag: tag };
  };
  if (v.runs) {
    const a = answer(JSON.stringify({ total_count: (J.asksRuns || []).length, workflow_runs: J.asksRuns || [] }), v.runs.etag, F.runs);
    out.runs = a.page;
    out.etags.runs = a.etag;
  }
  for (const hd of v.heads) {
    const c = (J.checks || {})[hd.sha] || { checkRuns: [], statuses: [], workflowRuns: [] };
    const raws = { checkRuns: JSON.stringify({ total_count: c.checkRuns.length, check_runs: c.checkRuns }), statuses: JSON.stringify(c.statuses),
      workflowRuns: JSON.stringify({ total_count: c.workflowRuns.length, workflow_runs: c.workflowRuns }) };
    out.heads[hd.sha] = {};
    out.etags.heads[hd.sha] = {};
    for (const l of ['checkRuns', 'statuses', 'workflowRuns']) {
      const a = answer(raws[l], hd.etags[l], (F.heads || []).includes(hd.sha));
      out.heads[hd.sha][l] = a.page;
      out.etags.heads[hd.sha][l] = a.etag;
    }
    if (J.next && J.next[hd.sha]) out.next[hd.sha] = J.next[hd.sha];
  }
  for (const sha of v.extra) out.heads[sha] = null;
  return out;
}

/**
 * AC80's `ownerChecks` part (J6, J22), as the function answers it (src/lib/api.js `ownerChecksPart`),
 * from the repository's `statuses`: { sha: { state, description } | raw JSON text | null (no
 * owner-verdict entry) }, with `statusFail` naming shas whose read fails (`false`); ETags honoured
 * (a matching one answers null, a 304). `statusReads` counts each conditional request.
 */
function ownerChecksAnswer(r, project, part) {
  const v = ownerChecksPart(part, project);
  if (!v) return { ownerChecks: null };
  const answers = {};
  const etags = {};
  for (const sha of v.extra) answers[sha] = false;
  for (const hd of v.heads) {
    r.statusReads = (r.statusReads || 0) + 1;
    if ((r.statusFail || []).includes(hd.sha)) {
      answers[hd.sha] = false;
      continue;
    }
    const e = (r.statuses || {})[hd.sha];
    const raw = typeof e === 'string' ? e : JSON.stringify({ state: e ? e.state : 'pending', sha: hd.sha,
      statuses: e ? [{ context: 'owner-verdict', state: e.state, description: e.description }] : [] });
    const tag = etagOf(raw);
    etags[hd.sha] = tag;
    answers[hd.sha] = hd.etag === tag ? null : raw;
  }
  return { ownerChecks: answers, ownerCheckEtags: etags };
}

/** AC79's log form, as the function makes it, from the repository's `jobs` field. */
function jobLogAnswer(J, id) {
  if ((J.fail && J.fail.logs || []).includes(id)) return null;
  const jobs = (J.runJobs || {})[id];
  if (!Array.isArray(jobs)) return null;
  const job = jobs.find((j) => j.name === 'merge');
  if (!job) return { job: null, ran: false, lines: null, tooLarge: false };
  const kept = { status: job.status, conclusion: job.conclusion };
  if (job.status !== 'completed' || job.conclusion == null || ['skipped', 'cancelled'].includes(job.conclusion)) return { job: kept, ran: false, lines: null, tooLarge: false };
  const text = (J.logs || {})[job.id];
  if (text == null) return null;
  if (text.length > JOB_LOG_CHARS) return { job: kept, ran: true, lines: null, tooLarge: true };
  return { job: kept, ran: true, lines: keptLogLines(text), tooLarge: false };
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
    // From stage 6b (J23): a body naming a `target` is the portfolio's, checked by the function's own allow-list.
    if (body && Object.prototype.hasOwnProperty.call(body, 'target')) return portfolioCall(path, body);
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
      const runs = r.runs.map((x, i) => ({ id: x.id ?? 1000 + i, path: x.path || `.github/workflows/${x.name}.yml`, name: x.name || x.path,
        event: x.event || 'push', status: x.status, conclusion: x.conclusion, run_number: x.run_number || i + 1,
        head_sha: x.headSha || head, html_url: `https://github.com/${project.repo}/actions/runs/${i + 1}`,
        // AC72: a run's title (GitHub's `display_title`), when the fixture gives one.
        ...(x.title != null ? { display_title: x.title } : {}) }));
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
        checksState: r.checksForbidden ? 'cant-read' : 'ok', tree, ...(body.jobs !== undefined ? { jobs: jobsAnswer(r, project, body.jobs) } : {}),
        ...(body.ownerChecks !== undefined ? ownerChecksAnswer(r, project, body.ownerChecks) : {}) } };
    }
    // J12 (2026-10-16): the blob call's optional `pulls` field, answered raw from the repository's
    // `pullsAnswer` (a raw text, or a function of the cursor giving one, or null for a failed read).
    let pullsOut;
    if (body.pulls) {
      const a = r.pullsAnswer;
      pullsOut = typeof a === 'function' ? a(body.pulls.after == null ? null : body.pulls.after) : a == null ? null : a;
    }
    // From 2026-10-19 (AC80, J22): `blobs` holds texts read by sha that are not on the default branch
    // (a verdict file on a pull request's branch); a sha `blobFail` names fails the whole call, as a
    // failed blob does at the function (src/lib/github.js). `blobCalls` records each call's shas.
    const texts = new Map([...Object.values(r.files).map((t) => [gitSha(t), t]), ...Object.entries(r.blobs || {})]);
    const blobs = {};
    for (const s of body.blobs) blobs[s] = texts.has(s) ? texts.get(s) : null;
    (r.blobCalls ||= []).push([...body.blobs]);
    if (body.blobs.some((x) => (r.blobFail || []).includes(x))) return { ok: true, status: 200, json: { ...base, state: 'cant-read', reason: 'github', blobs: {}, history: {}, compare: {} } };
    const history = {};
    // From 2026-10-18: `historyFail(path)` true gives that path a null answer (a failed history read).
    for (const p of body.history) {
      history[p] = r.historyFail && r.historyFail(p) ? null : [JSON.stringify(r.history[p] || [{ commit: { committer: { date: '2026-10-06T10:00:00Z' } } }])];
    }
    const compare = {};
    for (const c of body.compare || []) {
      const key = `${c.base}...${c.head}`;
      const ans = r.compare ? r.compare(c.base, c.head) : null;
      compare[key] = ans == null ? null : JSON.stringify({ status: ans });
    }
    // From 2026-10-18: J20's `files` (the repository's `prFiles[n]`, a list of { filename, status },
    // answered 100 to a page; `filesFail` names numbers that fail), AC77's `closed` (`closedPulls`, or
    // null when `closedFail`) and J21's `usage` (`usageAnswer`, an answer or a function of the time;
    // with none, as the function answers with no billing token: not-configured).
    const extra = {};
    if (Array.isArray(body.files)) {
      extra.files = {};
      for (const n of body.files) {
        if ((r.filesFail || []).includes(n) || !(r.prFiles && r.prFiles[n])) {
          extra.files[n] = null;
          continue;
        }
        const all = r.prFiles[n];
        const pages = [];
        for (let i = 0; i < Math.max(1, Math.ceil(all.length / 100)) && i < 3; i++) pages.push(JSON.stringify(all.slice(i * 100, (i + 1) * 100)));
        extra.files[n] = pages;
      }
    }
    // From 2026-10-20 (J24, AC82): `commits`, each pull request's commits from the repository's
    // `prCommits[n]` (a list in REST's form), 100 to a page, at most 3 pages; `commitsFail` names
    // numbers that fail (a null answer), `commitsCalls` records each call's numbers.
    if (Array.isArray(body.commits)) {
      extra.commits = {};
      (r.commitsCalls ||= []).push([...body.commits]);
      for (const n of body.commits) {
        const fails = typeof r.commitsFail === 'function' ? r.commitsFail(n) : (r.commitsFail || []).includes(n);
        if (fails || !(r.prCommits && r.prCommits[n])) {
          extra.commits[n] = null;
          continue;
        }
        const all = r.prCommits[n].slice(0, 250); // GitHub lists at most 250 commits for a pull request
        const pages = [];
        for (let i = 0; i < Math.max(1, Math.ceil(all.length / 100)) && i < 3; i++) pages.push(JSON.stringify(all.slice(i * 100, (i + 1) * 100)));
        r.commitPagesRead = (r.commitPagesRead || 0) + pages.length;
        extra.commits[n] = pages;
      }
    }
    // AC77's closed read (draft 7) as the function makes it: `closedPulls` newest updated first, 100
    // to a page, the next page only while a full page's last was updated after `since`, up to 3 (a
    // fourth needed: null); each page read counted in `closedPagesRead`. `closedFail`: null (true, or a
    // function of the call's count giving true for a failure).
    if (body.closed) {
      r.closedCalls = (r.closedCalls || 0) + 1;
      const failNow = typeof r.closedFail === 'function' ? r.closedFail(r.closedCalls) : r.closedFail;
      if (failNow) extra.closed = null;
      else {
        const all = r.closedPulls || [];
        const since = Date.parse(body.closed.since);
        const pulls = [];
        extra.closed = null;
        for (let page = 1; page <= CLOSED_MAX_PAGES + 1; page++) {
          if (page > CLOSED_MAX_PAGES) {
            pulls.length = 0;
            break;
          }
          r.closedPagesRead = (r.closedPagesRead || 0) + 1;
          const list = all.slice((page - 1) * 100, page * 100);
          pulls.push(...list.map(keptPull));
          if (!closedNeedsNext(list, all.length > page * 100, since)) {
            extra.closed = { pulls };
            break;
          }
        }
      }
    }
    // `onClosed(n)`, called after the n-th closed read's answer is made and before it returns: a test's
    // way to act while that read is in flight (draft 9, Desk 7).
    if (body.closed && r.onClosed) r.onClosed(r.closedCalls);
    // AC77's single read (draft 7): `prAnswers[n]` (a pull request in REST's form, or a function of
    // the read's count giving one), or a null answer for a number it lacks or `prFail` names.
    if (Array.isArray(body.prs)) {
      extra.prs = {};
      for (const n of body.prs) {
        r.prReads = (r.prReads || 0) + 1;
        const a = r.prAnswers ? r.prAnswers[n] : null;
        const v = typeof a === 'function' ? a(r.prReads) : a;
        extra.prs[n] = (r.prFail || []).includes(n) || !v ? null : keptPull(v);
      }
    }
    // AC79 (2026-10-19): the head commits' times and the log form, from the repository's `jobs` field.
    if (Array.isArray(body.commitTime)) {
      const J = r.jobs || {};
      extra.commitTime = {};
      for (const sha of body.commitTime) extra.commitTime[sha] = (J.fail && J.fail.commitTime || []).includes(sha) ? null : ((J.commits || {})[sha] || null);
    }
    if (Array.isArray(body.jobLog)) {
      const J = r.jobs || {};
      extra.jobLog = {};
      for (const id of body.jobLog) extra.jobLog[id] = jobLogAnswer(J, id);
    }
    if (body.usage) {
      const a = typeof r.usageAnswer === 'function' ? r.usageAnswer(clock.now()) : r.usageAnswer;
      extra.usage = a || { state: 'not-configured', asOf: new Date(clock.now()).toISOString(), period: null, summary: { ok: false, items: [] }, usage: { ok: false, items: [] }, publicRepos: null };
    }
    return { ok: true, status: 200, json: { ...base, state: 'ok', blobs, history, compare, ...extra, ...(body.pulls ? { pulls: pullsOut === undefined ? null : pullsOut } : {}) } };
  }
  /**
   * The portfolio's reads (J23, stage 6b), as the function answers them: its request checked by the
   * function's own `validatePortfolio` (a refusal is a 400, which the page's call reads as `cloudflare`);
   * the poll's branch (304 for a matching head and ETag) and, on a new head, the tree; the blob call's
   * blobs by sha. The repository is `repos[PORTFOLIO_REPO]` (made up per test, NOT real records); with none
   * the branch answers 404, as GitHub does for a repository the token can't see (`no-access`). Its `fail`
   * as a project's, `hold` (a promise it waits on), `sizes` (path → size) and `truncated` for the tree, `blobFail` for a blob.
   */
  async function portfolioCall(path, body) {
    calls.push({ path, project: null, target: body.target, at: clock.now(), body });
    const kind = path === '/api/poll' ? 'poll' : 'blobs';
    const v = validatePortfolio(body, config, kind);
    if (v.error) return { ok: false, status: 400, reason: 'cloudflare', words: `Cloudflare or desk-function error (HTTP 400: ${v.error})` };
    const r = repos[PORTFOLIO_REPO];
    // `hold`: a promise the call waits on before it answers (a read still in flight; review round 2, N7).
    if (r && r.hold) await r.hold;
    const base = { target: 'portfolio', readAt: new Date(clock.now()).toISOString(), reason: null, retryAfter: null, cost: { github: 1, bytes: 100 } };
    const f = r ? r.fail : null;
    if (f && f.kind === 'network') return { ok: false, status: 0, reason: 'network' };
    if (f && f.kind === 'signed-out') return { ok: false, status: 403, reason: 'signed-out' };
    if (f && f.kind === 'cloudflare') return { ok: false, status: 503, reason: 'cloudflare', cfError: 1102, words: 'Cloudflare or desk-function error (HTTP 503, Error 1102)' };
    if (!r) return { ok: true, status: 200, json: { ...base, state: 'cant-read', reason: 'no-access', head: null, etags: {}, tree: null } };
    if (f && f.state === 'cant-read') return { ok: true, status: 200, json: { ...base, state: 'cant-read', reason: f.reason, retryAfter: f.retryAfter || null, head: null, etags: {}, tree: null, blobs: {} } };
    if (kind === 'poll') {
      r.polls = (r.polls || 0) + 1;
      const head = r.head();
      const branch = portfolioUrls(v.req.portfolio).branch;
      const tag = etagOf(head);
      if (v.req.head === head && v.req.etags[branch] === tag) return { ok: true, status: 200, json: { ...base, state: 'unchanged', head: null, etags: { [branch]: tag }, tree: null } };
      const tree = v.req.head === head ? null : JSON.stringify({ sha: head, truncated: Boolean(r.truncated),
        tree: Object.entries(r.files).map(([p, t]) => ({ path: p, type: 'blob', sha: gitSha(t), size: (r.sizes && r.sizes[p]) || t.length })) });
      return { ok: true, status: 200, json: { ...base, state: 'ok', head: { sha: head, treeSha: head, committedAt: r.committedAt || null }, etags: { [branch]: tag }, tree } };
    }
    r.blobCalls = r.blobCalls || [];
    r.blobCalls.push([...v.req.blobs]);
    if (v.req.blobs.some((x) => (r.blobFail || []).includes(x))) return { ok: true, status: 200, json: { ...base, state: 'cant-read', reason: 'github', blobs: {} } };
    const texts = new Map(Object.values(r.files).map((t) => [gitSha(t), t]));
    return { ok: true, status: 200, json: { ...base, state: 'ok', blobs: Object.fromEntries(v.req.blobs.map((x) => [x, texts.has(x) ? texts.get(x) : null])) } };
  }
  return { call, calls };
}

/** The key of the portfolio's made-up repository among a fake server's repos (J23): never a project's name (J7's names are plain). */
export const PORTFOLIO_REPO = ':portfolio';

// The PR #40 review's example (N4): a dispatch-log line whose `item` is an object with
// non-callable toString and valueOf. From M2 the page type-checks log lines (AC31), so this line is
// named in notes and skipped; it no longer throws.
export const BAD_LOG_LINE = '{"action":"dispatch","time":"2026-10-06T18:30:00Z","item":{"toString":1,"valueOf":1},"role":"builder","stage":5}';

export { pageUrl };

// A record that still throws while a project's model is built (AC30's drawing case): a pull
// request whose title is an object with non-callable toString and valueOf. It parses as JSON;
// turning it into the flagged PR's title throws.
export const BAD_PR = { ...pr(66, 'x'), title: { toString: 1, valueOf: 1 } };
