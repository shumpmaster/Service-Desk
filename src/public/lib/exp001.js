// EXP-001's runner (experiments/EXP-001-o3-cpu-walltime.md; spec S-001, AC14, AC15).
// The panel (`?exp=001`) drives the real desk function from the owner's signed-in browser:
//   H1: 300 steady polls, alternating between two repositories, one step every 10 s;
//   H2: 20 cold loads (10 per repository): a poll with head null, then every blob call its tree needs;
//   H3: 20 heaviest-case blob calls against the largest repository: its 25 largest docs/ and
//       specs/ blobs, docs/LEDGER.md first.
// H2 and H3 are interleaved with H1: after every 15 polls, one cold load and one heavy call.
// Each call records its set, HTTP status, any Cloudflare error code, wall time and J6's cost.
// Pure apart from the injected `call`, `clock` and `perf`; no DOM.

import { neededReads } from './model.js';
import { parseTree } from './records.js';
import { batches, BLOB_BATCH } from './scheduler.js';

export const STEP_MS = 10_000;
export const WALL_LIMIT_MS = 30_000;

/** The run's plan: [{ set: 'H1'|'H2'|'H3', project }]. */
export function plan(projects, heavyName) {
  const steps = [];
  let cold = 0;
  for (let i = 0; i < 300; i++) {
    steps.push({ set: 'H1', project: projects[i % projects.length].name });
    if ((i + 1) % 15 === 0) {
      steps.push({ set: 'H2', project: projects[cold % projects.length].name });
      steps.push({ set: 'H3', project: heavyName });
      cold++;
    }
  }
  return steps;
}

/** The 25 blobs H3 asks for: docs/LEDGER.md, then the largest docs/** and specs/*.md blobs. */
export function heavyBlobs(tree, n = BLOB_BATCH) {
  const all = [...tree.entries()].filter(([p]) => p.startsWith('docs/') || /^specs\/[^/]+\.md$/.test(p));
  all.sort((a, b) => (b[1].size || 0) - (a[1].size || 0));
  const ledger = all.find(([p]) => p === 'docs/LEDGER.md');
  const rest = all.filter(([p]) => p !== 'docs/LEDGER.md');
  const picked = ledger ? [ledger, ...rest] : rest;
  return picked.slice(0, n).map(([path, e]) => ({ path, sha: e.sha, size: e.size || 0 }));
}

function pct(values, p) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)];
}

/**
 * Create a run. opts: { config, call(path, body) → Promise<{ ok, status, json?, reason?, cfError?,
 * bytes? }>, clock: { now, setTimeout }, perf: () => ms, isVisible, onProgress(run) }.
 */
export function createRun(opts) {
  const { config, call, clock, perf } = opts;
  const isVisible = opts.isVisible || (() => true);
  const onProgress = opts.onProgress || (() => {});
  const heavy = config.projects.find((p) => p.name === 'Personal-Org-Operating-Model') || config.projects[0];
  const projects = config.projects.slice(0, 2);
  const run = {
    steps: plan(projects, heavy.name), index: 0, calls: [], state: 'ready', message: null,
    heads: {}, etags: {}, trees: {}, coldBlobCalls: {}, largestBlob: 0, startedAt: null, endedAt: null,
  };

  async function timed(set, project, path, body) {
    const t0 = perf();
    const res = await call(path, body);
    const wall = perf() - t0;
    const rec = {
      set, project, path, status: res.status, cfError: res.cfError || null, wallMs: Math.round(wall),
      completed: res.ok, excluded: res.reason === 'network', state: res.ok ? res.json.state : null,
      reason: res.ok ? res.json.reason : res.reason, github: res.ok && res.json.cost ? res.json.cost.github : null,
      bytes: res.ok && res.json.cost ? res.json.cost.bytes : null, at: new Date(clock.now()).toISOString(),
    };
    if (res.ok && res.json.blobs) {
      for (const text of Object.values(res.json.blobs)) if (text) run.largestBlob = Math.max(run.largestBlob, text.length);
    }
    run.calls.push(rec);
    return res;
  }

  async function step(s) {
    const project = config.projects.find((p) => p.name === s.project);
    if (s.set === 'H1') {
      const head = run.heads[project.name] || null;
      const res = await timed('H1', project.name, '/api/poll', { project: project.name, head, etags: head ? run.etags[project.name] || {} : {} });
      if (res.ok && res.json.head) run.heads[project.name] = res.json.head.sha;
      if (res.ok && res.json.etags) run.etags[project.name] = res.json.etags;
      if (res.ok && res.json.tree) run.trees[project.name] = parseTree(res.json.tree).blobs;
      return res.ok || res.reason !== 'network';
    }
    if (s.set === 'H2') {
      const res = await timed('H2', project.name, '/api/poll', { project: project.name, head: null, etags: {} });
      if (!res.ok || !res.json.tree) return res.ok || res.reason !== 'network';
      const tree = parseTree(res.json.tree).blobs;
      run.trees[project.name] = tree;
      const need = neededReads(project, tree, new Map(), new Date(clock.now()));
      const shas = [...new Set(need.blobs.map((b) => b.sha))];
      const parts = batches(shas, need.history);
      (run.coldBlobCalls[project.name] ||= []).push(parts.length);
      for (const b of parts) await timed('H2', project.name, '/api/blobs', { project: project.name, blobs: b.blobs, history: b.history });
      return true;
    }
    // H3
    if (!run.trees[heavy.name]) {
      const res = await timed('H3-setup', heavy.name, '/api/poll', { project: heavy.name, head: null, etags: {} });
      if (!res.ok || !res.json.tree) return res.ok || res.reason !== 'network';
      run.trees[heavy.name] = parseTree(res.json.tree).blobs;
    }
    const blobs = heavyBlobs(run.trees[heavy.name]).map((b) => b.sha);
    const res = await timed('H3', heavy.name, '/api/blobs', { project: heavy.name, blobs: [...new Set(blobs)], history: [] });
    return res.ok || res.reason !== 'network';
  }

  run.start = () => new Promise((resolve) => {
    run.state = 'running';
    run.startedAt = new Date(clock.now()).toISOString();
    let repeats = 0;
    const next = async () => {
      if (run.state !== 'running') return resolve(run);
      if (!isVisible()) {
        run.state = 'stopped';
        run.message = 'Stopped: the tab was hidden. Browsers may slow background tabs, so the run needs the tab in the foreground.';
        run.endedAt = new Date(clock.now()).toISOString();
        onProgress(run);
        return resolve(run);
      }
      if (run.index >= run.steps.length) {
        run.state = 'done';
        run.endedAt = new Date(clock.now()).toISOString();
        onProgress(run);
        return resolve(run);
      }
      const began = clock.now();
      const ok = await step(run.steps[run.index]);
      // A call that failed before reaching the function is logged, excluded and repeated (twice at most).
      if (ok || repeats >= 2) {
        run.index++;
        repeats = 0;
      } else repeats++;
      onProgress(run);
      clock.setTimeout(next, Math.max(0, began + STEP_MS - clock.now()));
    };
    next();
  });
  run.stop = () => {
    run.state = 'stopped';
    run.message = 'Stopped by the owner.';
    run.endedAt = new Date(clock.now()).toISOString();
  };
  return run;
}

/** Per-set measures (EXP-001 "Measure"). */
export function summarize(run) {
  const sets = {};
  for (const set of ['H1', 'H2', 'H3']) {
    const calls = run.calls.filter((c) => c.set === set && !c.excluded);
    const walls = calls.filter((c) => c.completed).map((c) => c.wallMs);
    sets[set] = {
      calls: calls.length,
      excluded: run.calls.filter((c) => c.set === set && c.excluded).length,
      error1102: calls.filter((c) => c.cfError === 1102).length,
      error1027: calls.filter((c) => c.cfError === 1027).length,
      otherCfErrors: calls.filter((c) => c.cfError && c.cfError !== 1102 && c.cfError !== 1027).length,
      wallFailures: calls.filter((c) => c.completed && c.wallMs >= WALL_LIMIT_MS).length,
      notCompleted: calls.filter((c) => !c.completed).length,
      rateLimited: calls.filter((c) => c.reason === 'rate-limit').length,
      maxWallMs: walls.length ? Math.max(...walls) : null,
      p95WallMs: pct(walls, 95),
      maxBytes: Math.max(0, ...calls.map((c) => c.bytes || 0)),
      maxGithub: Math.max(0, ...calls.map((c) => c.github || 0)),
    };
    const s = sets[set];
    s.pass = s.calls > 0 && s.error1102 === 0 && s.error1027 === 0 && s.wallFailures === 0 && s.notCompleted === 0;
  }
  const repos = {};
  for (const [name, tree] of Object.entries(run.trees)) {
    let bytes = 0;
    for (const e of tree.values()) bytes += e.size || 0;
    const cold = run.coldBlobCalls[name] || [];
    repos[name] = { files: tree.size, blobBytes: bytes, coldBlobCallsMax: cold.length ? Math.max(...cold) : null };
  }
  return { sets, repos, largestBlob: run.largestBlob, startedAt: run.startedAt, endedAt: run.endedAt, state: run.state };
}

/** The result file's text (docs/handover/experiments/EXP-001-result.md). */
export function resultMarkdown(summary, batch = BLOB_BATCH) {
  const L = [];
  L.push('# EXP-001 result — CPU and wall time on the preview', '');
  L.push(`run: ${summary.startedAt || 'not started'} to ${summary.endedAt || 'not ended'} (${summary.state})   BLOB_BATCH: ${batch}`);
  L.push('recorded by: the EXP-001 panel (`?exp=001`), committed by the owner', '');
  L.push('| Set | Calls | Excluded | 1102 | 1027 | Other CF | Wall ≥ 30 s | Not completed | Rate-limited | Max wall ms | p95 wall ms | Max cost.bytes | Max cost.github | Pass (panel) |');
  L.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const [set, s] of Object.entries(summary.sets)) {
    L.push(`| ${set} | ${s.calls} | ${s.excluded} | ${s.error1102} | ${s.error1027} | ${s.otherCfErrors} | ${s.wallFailures} | ${s.notCompleted} | ${s.rateLimited} | ${s.maxWallMs ?? '—'} | ${s.p95WallMs ?? '—'} | ${s.maxBytes} | ${s.maxGithub} | ${s.pass ? 'yes' : 'no'} |`);
  }
  L.push('', '## Repositories at the run', '', '| Repository | Tree files | Blob bytes | Blob calls per cold load (max) |', '|---|---|---|---|');
  for (const [name, r] of Object.entries(summary.repos)) {
    L.push(`| ${name} | ${r.files} | ${r.blobBytes} | ${r.coldBlobCallsMax ?? '—'} |`);
  }
  L.push('', `Largest single blob returned: ${summary.largestBlob} characters.`, '');
  L.push('## CPU (from the Cloudflare dashboard, filled in by the owner)', '');
  L.push('H1 p99 CPU: not available', 'H2 p99 CPU: not available', 'H3 p99 CPU: not available', '');
  L.push('The raw per-call table is pasted below from the panel\'s copy button.', '');
  return L.join('\n');
}

/** The raw per-call table as markdown. */
export function rawTable(run) {
  const L = ['| # | Set | Project | Path | Status | CF error | Wall ms | State | Reason | cost.github | cost.bytes | At |',
    '|---|---|---|---|---|---|---|---|---|---|---|---|'];
  run.calls.forEach((c, i) => {
    L.push(`| ${i + 1} | ${c.set}${c.excluded ? ' (excluded)' : ''} | ${c.project} | ${c.path} | ${c.status} | ${c.cfError ?? ''} | ${c.wallMs} | ${c.state ?? ''} | ${c.reason ?? ''} | ${c.github ?? ''} | ${c.bytes ?? ''} | ${c.at} |`);
  });
  return L.join('\n');
}
