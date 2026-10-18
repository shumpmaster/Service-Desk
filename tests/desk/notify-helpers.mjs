// Helpers for the sender's tests (spec S-001, AC73 to AC78, J16 to J21): scratch git checkouts
// written with git's plumbing, a fake GitHub, a fake push service that decrypts what it is sent with
// the subscription's own private key, an artifact store for J18's state, and a harness that runs the
// sender as Workflow 3 would, run after run, on a fake clock. No network, no secret: every key here is
// made for the test run and thrown away.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { createECDH, createHmac, createDecipheriv, generateKeyPairSync, randomBytes } from 'node:crypto';
import { deflateRawSync } from 'node:zlib';
import { runSender } from '../../src/notify/sender.mjs';
import { openCheckout } from '../../src/notify/checkout.mjs';
import { FIX } from './helpers.mjs';

export const NOTIFY_FIX = join(FIX, 'notify');
export const REPO = 'shumpmaster/Service-Desk';
export const API = 'https://api.github.com';
export const T0 = Date.parse('2026-10-18T12:00:00Z');
export const MIN = 60e3;
export const HOUR = 3600e3;

// ---------------------------------------------------------------------------
// Scratch checkouts

const GIT_ENV = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_AUTHOR_NAME: 'made-up',
  GIT_AUTHOR_EMAIL: 'made-up@agents.invalid', GIT_COMMITTER_NAME: 'made-up', GIT_COMMITTER_EMAIL: 'made-up@agents.invalid' };
const scratch = [];

function git(cwd, args, { input, env = {} } = {}) {
  return execFileSync('git', args, { cwd, input, env: { ...GIT_ENV, ...env }, maxBuffer: 256 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] });
}

export function tempDir(prefix = 'notify-') {
  const d = mkdtempSync(join(tmpdir(), prefix));
  scratch.push(d);
  return d;
}

/** Remove every scratch directory (call from an `after` hook). */
export function cleanScratch() {
  while (scratch.length) rmSync(scratch.pop(), { recursive: true, force: true });
}

/**
 * Write a history with git's plumbing, as tests/desk/tools/notify-fixtures.py `build_repo` does:
 * case = { commits: [{ id, parents: [id], files: { path: text | Buffer | null }, message, date? }] };
 * each commit's tree is its first parent's with `files` applied (null removes a path). HEAD is the
 * last commit. Returns { root, shas }.
 */
export function buildRepo(c, root = tempDir()) {
  git(root, ['init', '-q', root]);
  const index = join(root, '.git', 'case-index');
  const shas = {};
  const trees = {};
  c.commits.forEach((cm, k) => {
    const files = cm.parents.length ? { ...trees[cm.parents[0]] } : {};
    for (const [p, t] of Object.entries(cm.files)) {
      if (t == null) delete files[p];
      else files[p] = t;
    }
    trees[cm.id] = files;
    rmSync(index, { force: true });
    for (const p of Object.keys(files).sort()) {
      const blob = git(root, ['hash-object', '-w', '--stdin'], { input: Buffer.isBuffer(files[p]) ? files[p] : Buffer.from(files[p], 'utf8') }).toString().trim();
      git(root, ['update-index', '--add', '--cacheinfo', `100644,${blob},${p}`], { env: { GIT_INDEX_FILE: index } });
    }
    const tree = git(root, ['write-tree'], { env: { GIT_INDEX_FILE: index } }).toString().trim();
    const date = cm.date || `2026-10-18T10:${String(k).padStart(2, '0')}:00+00:00`;
    const args = ['commit-tree', tree];
    for (const p of cm.parents) args.push('-p', shas[p]);
    shas[cm.id] = git(root, args, { input: Buffer.from(cm.message || `commit ${cm.id}\n`), env: { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } }).toString().trim();
  });
  git(root, ['update-ref', 'HEAD', shas[c.commits[c.commits.length - 1].id]]);
  return { root, shas };
}

/** Every file under a fixture directory: { relPath: Buffer }. */
export function filesUnder(dir) {
  const out = {};
  const walk = (d) => {
    for (const n of readdirSync(d)) {
      const f = join(d, n);
      if (statSync(f).isDirectory()) walk(f);
      else out[relative(dir, f).split('\\').join('/')] = readFileSync(f);
    }
  };
  walk(dir);
  return out;
}

/**
 * A checkout from layers of files: the first commit holds `base`; then each of `later` as its own
 * commit at its date (a question's raised time is its adding commit's committer date).
 * layers: { base: { path: text }, baseDate, later: [{ files, date, message }] }.
 */
export function checkoutOf({ base, baseDate = '2026-10-01T00:00:00+00:00', later = [] }) {
  const commits = [{ id: 'c0', parents: [], files: base, date: baseDate, message: 'the records\n' }];
  later.forEach((l, i) => commits.push({ id: `c${i + 1}`, parents: [`c${i}`], files: l.files, date: l.date, message: l.message || `later ${i + 1}\n` }));
  const { root, shas } = buildRepo({ commits });
  return { root, shas, head: shas[commits[commits.length - 1].id], open: () => openCheckout(root) };
}

// ---------------------------------------------------------------------------
// Keys made for the test run

export function makeVapid() {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const jwk = privateKey.export({ format: 'jwk' });
  const raw = Buffer.concat([Buffer.from([4]), Buffer.from(jwk.x, 'base64url'), Buffer.from(jwk.y, 'base64url')]);
  return { pem: privateKey.export({ format: 'pem', type: 'sec1' }).toString(), publicB64: raw.toString('base64url'), raw };
}

/** A made-up subscription and the phone's half of it (its private key, to decrypt). */
export function makeSubscription(endpoint = `https://web.push.apple.com/made-up-${randomBytes(6).toString('hex')}`) {
  const ecdh = createECDH('prime256v1');
  ecdh.generateKeys();
  const auth = randomBytes(16);
  const value = JSON.stringify({ endpoint, expirationTime: null, keys: { p256dh: ecdh.getPublicKey().toString('base64url'), auth: auth.toString('base64url') } });
  return { value, endpoint, uaPrivate: ecdh.getPrivateKey(), uaPublic: ecdh.getPublicKey(), auth };
}

/** Decrypt an `aes128gcm` body (RFC 8291) as the phone would. */
export function decryptPush(body, sub) {
  const salt = body.subarray(0, 16);
  const rs = body.readUInt32BE(16);
  const idlen = body[20];
  const asPublic = body.subarray(21, 21 + idlen);
  const ct = body.subarray(21 + idlen);
  const ecdh = createECDH('prime256v1');
  ecdh.setPrivateKey(sub.uaPrivate);
  const secret = ecdh.computeSecret(asPublic);
  const h = (k, d) => createHmac('sha256', k).update(d).digest();
  const prkKey = h(sub.auth, secret);
  const ikm = h(prkKey, Buffer.concat([Buffer.from('WebPush: info\0'), sub.uaPublic, asPublic, Buffer.from([1])]));
  const prk = h(salt, ikm);
  const cek = h(prk, Buffer.from('Content-Encoding: aes128gcm\0\x01', 'binary')).subarray(0, 16);
  const nonce = h(prk, Buffer.from('Content-Encoding: nonce\0\x01', 'binary')).subarray(0, 12);
  const d = createDecipheriv('aes-128-gcm', cek, nonce);
  d.setAuthTag(ct.subarray(ct.length - 16));
  const plain = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
  let end = plain.length - 1;
  while (end >= 0 && plain[end] === 0) end--;
  if (plain[end] !== 2) throw new Error('no last-record delimiter');
  return { rs, asPublic, text: plain.subarray(0, end).toString('utf8') };
}

/** J7 with the sender's settings, clearly fake (never src/config/projects.json). */
export function testConfig(vapid, extra = {}) {
  return {
    ownerLogin: 'shumpmaster', ownerTimeZone: 'America/Chicago', v5Clock: null, linkCap: 6000,
    push: { vapidPublicKey: vapid.publicB64, deskUrl: 'https://desk.example.invalid' },
    actionsUsage: { account: 'shumpmaster', includedMinutes: 3000 },
    projects: [
      { name: 'Service-Desk', repo: REPO, defaultBranch: 'main', model: 'v3', planning: true, webCommitsToDefault: true,
        contentPrefill: true, contentParam: 'value', deploysNeedOwner: true },
      { name: 'Personal-Org-Operating-Model', repo: 'shumpmaster/Personal-Org-Operating-Model', defaultBranch: 'main', model: 'v2.5',
        planning: false, webCommitsToDefault: true, contentPrefill: true, contentParam: 'value' },
    ],
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// Zips (as actions/upload-artifact makes them)

export function makeZip(entries) {
  const locals = [];
  const cens = [];
  let off = 0;
  for (const [name, data] of Object.entries(entries)) {
    const nameBuf = Buffer.from(name);
    const comp = deflateRawSync(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(8, 8);
    lh.writeUInt32LE(comp.length, 18);
    lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(8, 10);
    ch.writeUInt32LE(comp.length, 20);
    ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt32LE(off, 42);
    locals.push(lh, nameBuf, comp);
    cens.push(ch, nameBuf);
    off += lh.length + nameBuf.length + comp.length;
  }
  const cd = Buffer.concat(cens);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(entries).length, 8);
  end.writeUInt16LE(Object.keys(entries).length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(off, 16);
  return Buffer.concat([...locals, cd, end]);
}

// ---------------------------------------------------------------------------
// A fake GitHub and a fake push service

const json = (status, body, headers = {}) => ({ status, body: typeof body === 'string' ? body : JSON.stringify(body), headers: { 'content-type': 'application/json', 'x-ratelimit-remaining': '4000', ...headers } });

/**
 * The world the sender reads: a fake GitHub (REST and downloads) and a fake push service.
 * world: { pulls: [pr], files: { n: [file] }, waiting: [run], runs: { id: run }, checks: { sha: {...} },
 *   asksRuns: [run], jobs: { runId: [job] }, logs: { jobId: text }, commits: { sha: date },
 *   issues: [issue], usage: { summary, usage, repos }, fail: { pathPrefix: status }, remaining,
 *   push: (req) → { status, body } }.
 */
export function makeWorld(init = {}) {
  const w = {
    pulls: [], files: {}, waiting: [], runs: {}, checks: {}, asksRuns: [], jobs: {}, logs: {}, commits: {}, issues: [],
    usage: null, fail: {}, remaining: '4000', pushes: [], ghCalls: [], usageCalls: [], nextIssue: 1,
    artifacts: [], stateRuns: [], blobs: {}, push: () => ({ status: 201 }), ...init,
  };
  const listRoute = (items) => json(200, items);
  w.fetch = async (url, init2 = {}) => {
    const u = new URL(String(url));
    const method = (init2.method || 'GET').toUpperCase();
    const headers = new Headers(init2.headers || {});
    if (u.hostname === 'blobs.example.invalid') {
      const b = w.blobs[u.pathname];
      return b ? new Response(b, { status: 200 }) : new Response('', { status: 404 });
    }
    if (u.hostname !== 'api.github.com') {
      // The push service.
      const body = Buffer.from(init2.body || []);
      const req = { url: String(url), headers, body, at: w.now ? w.now() : null };
      w.pushes.push(req);
      const ans = w.push(req) || { status: 201 };
      return new Response(ans.body == null ? '' : (typeof ans.body === 'string' ? ans.body : JSON.stringify(ans.body)), { status: ans.status });
    }
    const path = u.pathname + u.search;
    if (/\/settings\/billing\/|\/users\/[^/]+\/repos/.test(u.pathname)) {
      w.usageCalls.push({ path, headers });
      const r = w.usage ? w.usage(path) : null;
      const ans = r || { status: 404, body: { message: 'Not Found' } };
      return new Response(typeof ans.body === 'string' ? ans.body : JSON.stringify(ans.body), { status: ans.status, headers: ans.headers || {} });
    }
    w.ghCalls.push({ method, path, headers, body: init2.body });
    const ans = route(method, u, init2);
    const h = new Headers(ans.headers || {});
    return new Response(ans.status === 302 || ans.status === 304 ? null : ans.body, { status: ans.status, headers: h });
  };

  function route(method, u, init2) {
    const p = u.pathname;
    const q = u.searchParams;
    for (const [prefix, status] of Object.entries(w.fail)) if ((p + u.search).startsWith(prefix)) return json(status, { message: 'made-up failure' });
    const rem = { 'x-ratelimit-remaining': String(w.remaining) };
    const base = `/repos/${REPO}`;
    if (method === 'GET' && p === `${base}/pulls` && q.get('state') === 'closed') return json(200, w.closed || [], rem);
    if (method === 'GET' && p === `${base}/pulls`) return json(200, q.get('page') && q.get('page') !== '1' ? [] : w.pulls, rem);
    let m = /^\/repos\/[^/]+\/[^/]+\/pulls\/(\d+)\/files$/.exec(p);
    if (m) {
      const all = w.files[m[1]] || [];
      const page = Number(q.get('page') || 1);
      const slice = all.slice((page - 1) * 100, page * 100);
      const more = all.length > page * 100;
      return json(200, slice, { ...rem, ...(more ? { link: `<${API}${p}?per_page=100&page=${page + 1}>; rel="next"` } : {}) });
    }
    if (p === `${base}/actions/runs` && q.get('status') === 'waiting') return json(200, { total_count: w.waiting.length, workflow_runs: w.waiting }, rem);
    if (p === `${base}/actions/runs` && q.get('head_sha')) {
      const c = w.checks[q.get('head_sha')];
      if (q.get('event')) return json(200, { workflow_runs: (w.headRuns && w.headRuns[q.get('event')]) || [] }, rem);
      return json(200, { workflow_runs: (c && c.workflowRuns) || [] }, rem);
    }
    m = /^\/repos\/[^/]+\/[^/]+\/actions\/runs\/(\d+)$/.exec(p);
    if (m) return w.runs[m[1]] ? json(200, w.runs[m[1]], rem) : json(404, { message: 'Not Found' }, rem);
    m = /^\/repos\/[^/]+\/[^/]+\/commits\/([0-9a-f]{40})\/check-runs$/.exec(p);
    if (m) return json(200, { check_runs: (w.checks[m[1]] && w.checks[m[1]].checkRuns) || [] }, rem);
    m = /^\/repos\/[^/]+\/[^/]+\/commits\/([0-9a-f]{40})\/statuses$/.exec(p);
    if (m) return listRoute((w.checks[m[1]] && w.checks[m[1]].statuses) || []);
    m = /^\/repos\/[^/]+\/[^/]+\/commits\/([0-9a-f]{40})$/.exec(p);
    if (m) return w.commits[m[1]] ? json(200, { sha: m[1], commit: { committer: { date: w.commits[m[1]] } } }, rem) : json(404, {}, rem);
    if (p === `${base}/actions/workflows/asks-merge.yml/runs`) return json(200, { workflow_runs: w.asksRuns }, rem);
    m = /^\/repos\/[^/]+\/[^/]+\/actions\/runs\/(\d+)\/jobs$/.exec(p);
    if (m) return json(200, { jobs: w.jobs[m[1]] || [] }, rem);
    m = /^\/repos\/[^/]+\/[^/]+\/actions\/jobs\/(\d+)\/logs$/.exec(p);
    if (m) {
      if (w.logs[m[1]] == null) return json(404, { message: 'Not Found' }, rem);
      w.blobs[`/log/${m[1]}`] = Buffer.from(w.logs[m[1]]);
      return { status: 302, headers: { location: `https://blobs.example.invalid/log/${m[1]}`, ...rem } };
    }
    // J18's store.
    if (p === `${base}/actions/workflows/desk-notify.yml/runs`) {
      if (w.statusFilterRefused && q.get('status') === 'success') return json(422, { message: 'Validation Failed' }, rem);
      const runs = [...w.stateRuns].filter((r) => (q.get('status') === 'success' ? r.conclusion === 'success' : r.status === 'completed'))
        .sort((a, b) => b.id - a.id).slice(0, 100);
      return json(200, { total_count: runs.length, workflow_runs: runs }, rem);
    }
    m = /^\/repos\/[^/]+\/[^/]+\/actions\/runs\/(\d+)\/artifacts$/.exec(p);
    if (m) return json(200, { artifacts: w.artifacts.filter((a) => a.workflow_run.id === Number(m[1])) }, rem);
    // The repository's artifacts by name (J18's fallback; draft 6, dating a failed list).
    if (p === `${base}/actions/artifacts`) {
      const list = w.artifacts.filter((a) => a.name === q.get('name')).map(({ zip, ...a }) => a)
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 100);
      return json(200, { total_count: list.length, artifacts: list }, rem);
    }
    m = /^\/repos\/[^/]+\/[^/]+\/actions\/artifacts\/(\d+)\/zip$/.exec(p);
    if (m) {
      const a = w.artifacts.find((x) => x.id === Number(m[1]));
      if (!a) return json(404, {}, rem);
      w.blobs[`/zip/${a.id}`] = a.zip;
      return { status: 302, headers: { location: `https://blobs.example.invalid/zip/${a.id}`, ...rem } };
    }
    // AC76's issue.
    if (method === 'GET' && p === `${base}/issues`) return json(200, w.issues.filter((i) => i.state === 'open'), rem);
    if (method === 'POST' && p === `${base}/issues`) {
      const b = JSON.parse(init2.body);
      const issue = { number: w.nextIssue++, state: 'open', ...b };
      w.issues.push(issue);
      return json(201, issue, rem);
    }
    m = /^\/repos\/[^/]+\/[^/]+\/issues\/(\d+)$/.exec(p);
    if (m && method === 'PATCH') {
      const i = w.issues.find((x) => x.number === Number(m[1]));
      Object.assign(i, JSON.parse(init2.body));
      return json(200, i, rem);
    }
    return json(599, { message: `no route for ${method} ${p}` });
  }
  return w;
}

/** A made-up open pull request in REST's form. */
export function pull(n, o = {}) {
  return { number: n, title: o.title ?? `A made-up pull request #${n}`, html_url: `https://github.com/${REPO}/pull/${n}`, draft: o.draft ?? false,
    base: { ref: o.base ?? 'main' }, head: { ref: o.head ?? `cos/made-up-${n}`, sha: o.sha ?? `${String(n).padStart(4, '0')}${'e'.repeat(36)}`,
      repo: o.headRepo === null ? null : { full_name: o.headRepo ?? REPO } },
    user: { login: o.login ?? 'shumpmaster' }, author_association: o.association ?? 'OWNER',
    created_at: o.created ?? '2026-10-18T11:00:00Z', updated_at: o.updated ?? '2026-10-18T11:00:00Z', body: o.body ?? '' };
}

/** A fake clock: now() and a sleep that only moves it. */
export function clock(start = T0) {
  const c = { t: start, sleeps: [] };
  c.now = () => c.t;
  c.sleep = async (ms) => {
    c.sleeps.push(ms);
    c.t += ms;
  };
  c.advance = (ms) => {
    c.t += ms;
  };
  return c;
}

/**
 * A harness running the sender as Workflow 3 does, run after run, with J18's state uploaded as an
 * artifact of each run that wrote it. opts: { config, project (name), checkout (() → checkout or a
 * scratch from checkoutOf), world, vapid, sub, stateKey, billingToken }.
 */
export function harness(opts) {
  const vapid = opts.vapid || makeVapid();
  const sub = opts.sub || makeSubscription();
  const world = opts.world || makeWorld();
  const clk = opts.clock || clock();
  world.now = clk.now;
  const config = opts.config || testConfig(vapid);
  const project = config.projects.find((p) => p.name === (opts.project || 'Service-Desk'));
  const h = { vapid, sub, world, clock: clk, config, project, runs: [], stateKey: opts.stateKey || randomBytes(32).toString('hex'), nextRun: 1000,
    env: {}, outRoot: tempDir('notify-out-') };
  h.checkout = opts.checkout;
  h.run = async (o = {}) => {
    const id = h.nextRun++;
    const outDir = join(h.outRoot, String(id));
    const logs = [];
    const env = { GITHUB_REPOSITORY: project.repo, GITHUB_EVENT_NAME: o.event || 'schedule', GITHUB_TOKEN: 'made-up-workflow-token',
      DESK_VAPID_PRIVATE_KEY: vapid.pem, DESK_VAPID_SUBJECT: 'mailto:owner@example.invalid', DESK_PUSH_SUBSCRIPTION: (o.sub || h.sub).value,
      DESK_NOTIFY_STATE_KEY: h.stateKey, ...(opts.billingToken ? { DESK_BILLING_TOKEN: opts.billingToken } : {}), ...h.env, ...(o.env || {}) };
    if (o.test) env.DESK_NOTIFY_TEST = o.test;
    const pushesBefore = world.pushes.length;
    const callsBefore = world.ghCalls.length;
    const code = await runSender({ project, config, env, fetch: world.fetch, now: clk.now, sleep: clk.sleep,
      openCheckout: () => (typeof h.checkout === 'function' ? h.checkout() : h.checkout.open()), log: (l) => logs.push(l), outDir });
    const wrote = existsSync(join(outDir, 'state.json'));
    const run = { id, code, logs, wrote, pushes: world.pushes.slice(pushesBefore), ghCalls: world.ghCalls.slice(callsBefore), outDir, at: clk.now() };
    // Workflow 3's upload step: only when the program wrote the state.
    const at = new Date(clk.now()).toISOString();
    world.stateRuns.push({ id, path: '.github/workflows/desk-notify.yml', repository: { full_name: project.repo }, head_repository: { full_name: project.repo },
      head_branch: 'main', event: o.event || 'schedule', status: 'completed', conclusion: o.conclusion || (code === 0 ? 'success' : 'failure'), created_at: at });
    if (wrote && !o.noUpload) {
      const zip = makeZip({ 'state.json': readFileSync(join(outDir, 'state.json')), 'state.sig': readFileSync(join(outDir, 'state.sig')) });
      world.artifacts.push({ id: id + 50000, name: 'desk-notify-state', expired: false, size_in_bytes: zip.length, created_at: at, workflow_run: { id }, zip });
    }
    run.payloads = run.pushes.map((p) => {
      try {
        return JSON.parse(decryptPush(p.body, h.sub).text);
      } catch {
        return null;
      }
    });
    h.runs.push(run);
    clk.advance(o.after ?? 5 * MIN);
    return run;
  };
  h.state = (run = h.runs[h.runs.length - 1]) => JSON.parse(readFileSync(join(run.outDir, 'state.json'), 'utf8'));
  return h;
}
