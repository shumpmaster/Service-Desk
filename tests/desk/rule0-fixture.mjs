// J22's rule 0 on both sides (spec S-001, stage 1b of "The desk as mockup v2"; AC73's note, J16,
// J18): one scenario, written once, fed to the page's real scheduler (through the fake desk function,
// tests/desk/fake-desk.mjs) and to the sender's collect step (through the fake GitHub,
// tests/desk/notify-helpers.mjs), so a test can hold the board's "Waiting on you" against the
// sender's set, and the page's owner-check heads against the sender's status reads: one module, two
// input layers. Every scenario here is made up (NOT real records) unless a test says otherwise.

import { createHash } from 'node:crypto';
import { createDesk, POLL_MS } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { queueView } from '../../src/lib/sandbox.js';
import { projectCards, boardView, noMarks } from '../../src/lib/board.js';
import { collect } from '../../src/notify/collect.mjs';
import { makeGitHub } from '../../src/notify/gh.mjs';
import { emptyRule0 } from '../../src/notify/state.mjs';
import { CONFIG, fakeClock } from './helpers.mjs';
import { repo, pr as deskPr, fakeServer } from './fake-desk.mjs';
import { REPO, T0, checkoutOf, makeWorld, pull, testConfig, makeVapid } from './notify-helpers.mjs';

export const POOM = 'shumpmaster/Personal-Org-Operating-Model';
export const STATE_KEY = 'r'.repeat(64);
/** git's blob sha of a text (`git hash-object`), worked out here, not from src/. */
export const blobSha = (text) => {
  const b = Buffer.from(text, 'utf8');
  return createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
};
/** A made-up head sha for a pull request number (and a generation, for a new head). */
export const headOf = (n, g = 0) => `${String(n).padStart(4, '0')}${String(g)}${'b'.repeat(35)}`;

/** Service-Desk's own rules at 304144d's form, made up short (NOT the real file): R3 for .claude/**, R1 for src/**. */
export const RISK = 'unmatched = "R1"\n[classes]\nR3 = [".claude/**", "src/notify/**"]\nR1 = ["src/**", "tests/**"]\n'
  + '[reviews]\nR0 = []\nR1 = ["reviewer"]\nR2 = ["reviewer"]\nR3 = ["reviewer", "owner"]\n'
  + '[paths."src/public/**"]\nreviews = ["design-reviewer"]\n';

/**
 * A scenario's pull request. o: { created, sha, headRepo, draft, files: [{ filename, status, sha?, previous_filename? }] }.
 * verdict(n, id, text) gives a verdict file entry whose sha is its text's real blob sha, with the text kept in `blobs`.
 */
export function scenario({ model = 'v3', priv = false, tree = { 'governance/risk-paths.toml': RISK }, pulls = [], statuses = {}, blobs = {} } = {}) {
  return { model, priv, tree, pulls, statuses, blobs };
}
export function verdict(sc, n, id, text, status = 'added') {
  const sha = blobSha(text);
  sc.blobs[sha] = text;
  return { filename: `reviews/${n}/${id}.md`, status, sha };
}

function projectOf(sc) {
  const config = testConfig(makeVapid());
  return { config, project: config.projects[sc.model === 'v3' ? 0 : 1] };
}

/**
 * The page's side: the real scheduler on the fake desk function, run for `polls` polls, then the
 * board (src/lib/board.js) built as the sandbox builds it, before any mark. Returns { keys (the
 * "Waiting on you" and "Kicked back" cards' AC73 keys), agents (their numbers), ownerHeads (the shas
 * the last poll call asked the owner check for, or []), ctx (desk.j22), model, keep (the board's
 * judgements to keep for the next head, rule 7's) }. opts: { blobFail: [sha], statusFail: [sha], polls,
 * last (an earlier keep) }.
 */
export async function pageSide(sc, opts = {}) {
  const { project } = projectOf(sc);
  const r = repo({ ...sc.tree }, sc.pulls.map((p) => deskPr(p.n, `PR ${p.n}`, { headRepo: p.headRepo === undefined ? project.repo : p.headRepo,
    sha: p.sha || headOf(p.n), createdAt: p.created || '2026-10-18T10:00:00Z', private: sc.priv, draft: p.draft === true })));
  r.prFiles = Object.fromEntries(sc.pulls.filter((p) => p.files).map((p) => [p.n, p.files]));
  r.blobs = { ...sc.blobs };
  r.statuses = { ...sc.statuses };
  r.blobFail = opts.blobFail || [];
  r.statusFail = opts.statusFail || [];
  const config = { ...CONFIG, projects: [project] };
  const clock = fakeClock(T0);
  const server = fakeServer({ [project.name]: r }, config, clock);
  const m = new Map();
  const waits = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } };
  const desk = createDesk({ config, call: (p, b) => server.call(p, b), clock, store: null, waitsStore: createStore(waits), isVisible: () => true, j11: true });
  desk.start();
  await clock.runUntil(T0 + (opts.polls || 3) * POLL_MS + 1000);
  desk.stop();
  const ctx = desk.j22(project.name);
  const model = desk.model(project.name);
  const snap = desk.snapshot(project.name);
  const q = queueView(project, model, snap, clock.now());
  const rows = [...q.rows, ...(q.deploysCounted ? q.deploys : [])];
  const pc = projectCards({ project, model, snap, j22: ctx, rows, last: opts.last || new Map(), nowMs: clock.now(), tz: 'America/Chicago', linkCap: 6000 });
  const view = boardView({ projects: [{ project, cards: pc.cards, agents: pc.agents, read: { ok: true } }], marks: noMarks(), nowMs: clock.now(), tz: 'America/Chicago' });
  const keys = view.lanes.filter((l) => l.key === 'wait' || l.key === 'kick').flatMap((l) => l.groups.flatMap((g) => g.rows.map((c) => c.id))).sort();
  const polled = server.calls.filter((c) => c.path === '/api/poll' && c.body && Array.isArray(c.body.ownerChecks));
  const ownerHeads = polled.length ? polled.at(-1).body.ownerChecks.map((x) => x.sha) : [];
  return { keys, agents: pc.agents.map((a) => a.number).sort((a, b) => a - b), ownerHeads, ctx, model, r, keep: pc.keep };
}

/**
 * The sender's side: J16's set step (src/notify/collect.mjs) on a checkout of the scenario's tree and
 * the fake GitHub. Returns { c (collect's answer), keys (the set's keys), agents, statusShas (the
 * heads whose owner check it read, in order), w }. opts: { world (a function changing the world),
 * last (J18's opened rule-0 part), stateKey, checkout }.
 */
export async function senderSide(sc, opts = {}) {
  const { config, project } = projectOf(sc);
  const w = makeWorld();
  w.pulls = sc.pulls.map((p) => pull(p.n, { sha: p.sha || headOf(p.n), created: p.created || '2026-10-18T10:00:00Z',
    headRepo: p.headRepo === undefined ? project.repo : p.headRepo, private: sc.priv, draft: p.draft === true }));
  for (const p of sc.pulls) if (p.files) w.files[p.n] = p.files;
  w.gitBlobs = { ...sc.blobs };
  w.statuses = { ...sc.statuses };
  if (opts.world) opts.world(w);
  // The fake answers another project's paths as it answers Service-Desk's.
  const fetch = project.repo === REPO ? w.fetch : (url, init) => w.fetch(String(url).replace(`/repos/${project.repo}/`, `/repos/${REPO}/`), init);
  const co = opts.checkout || checkoutOf({ base: { ...sc.tree }, baseDate: '2026-10-17T00:00:00+00:00' });
  const gh = makeGitHub({ token: 't', fetch });
  const c = await collect({ project, config, checkout: co.open(), gh, nowMs: T0, stateKey: opts.stateKey || STATE_KEY, cand: {},
    rule0: opts.last || emptyRule0() });
  const statusShas = w.ghCalls.map((x) => /\/commits\/([0-9a-f]{40})\/status$/.exec(x.path.split('?')[0])).filter(Boolean).map((x) => x[1]);
  return { c, keys: c.read ? c.set.map((x) => x.key).sort() : null, agents: c.read ? [...c.rule0.agents].sort((a, b) => a - b) : null, statusShas, w, co, project };
}

export const prKey = (project, n) => `${project}|pr|${n}`;
