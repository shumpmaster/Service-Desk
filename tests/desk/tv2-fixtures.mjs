// The trial-view notes 2 tests' shared fixtures (spec S-001, AC57 to AC72, J12): Service-Desk at
// 3117150 (J11's fixture) with J12's answer built from REST answers, AC61's made-up records, the
// sandbox opened on them, and a browser-like layout for the branch drawing's measures.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG, FIX } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, j11Files, j11Snapshot, El0, SD3, findAll, byClass } from './sandbox-helpers.mjs';
import { NOW } from './sandbox-fixtures.mjs';
import { pullsAnswer, pullNodes, answerOf, node } from './j12-fixture.mjs';
import { j11Records, timelineOf, phaseView } from '../../src/lib/sandbox.js';
import { runsContext, feedView } from '../../src/lib/feed.js';
import { judgePulls } from '../../src/lib/pulls.js';

export const TZ = 'America/Chicago';
export const AC61_DOC = readFileSync(join(FIX, 'ac61', 'docs', 'PROJECT.md'), 'utf8');
/** AC61's made-up pull requests (NOT real records), as J12's nodes. */
export const ac61Nodes = () => JSON.parse(readFileSync(join(FIX, 'ac61', 'pulls.json'), 'utf8')).nodes
  .map((n) => ({ ...node(n.number, { title: n.title, body: n.body, mergedAt: n.mergedAt, createdAt: n.createdAt }) }));
/** J12's answer with AC61's made-up pull requests added to the built ones, newest first. */
export const ac61Answer = () => answerOf([...ac61Nodes(), ...pullNodes()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));

/** Service-Desk's repository at 3117150, J12 answering with `answer` (the built one by default), and AC61's plan when asked. */
export function sdRepo({ answer = pullsAnswer(), ac61 = false, extra = {} } = {}) {
  const r = repo({ ...j11Files(), ...(ac61 ? { 'docs/PROJECT.md': AC61_DOC } : {}), ...extra });
  r.pullsAnswer = answer;
  return r;
}

/** The sandbox opened on Service-Desk (and the other projects given), at NOW, after its first two cycles. */
export async function openSD(hash = '#/p/Service-Desk', { repoOpts = {}, more = {}, store = null } = {}) {
  const projects = [SD3, ...Object.values(more).map((m) => m.project)];
  const repos = { 'Service-Desk': sdRepo(repoOpts), ...Object.fromEntries(Object.entries(more).map(([k, v]) => [k, v.repo])) };
  const app = await loadSandbox({ config: { ...CONFIG, projects }, repos, hash, now: NOW, store });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}

/** The view models straight from the fixture's records (no page): the snapshot, the timeline, AC57's context and AC59's feed. */
export function models({ ac61 = false, answer = pullsAnswer(), extra = {}, now = NOW } = {}) {
  const snap = j11Snapshot({ ...(ac61 ? { 'docs/PROJECT.md': AC61_DOC } : {}), ...extra });
  const v = answer == null ? null : judgePulls(typeof answer === 'string' ? answer : answer);
  snap.pulls = v && v.ok ? { list: v.pulls, failure: null, tooMany: false, fieldError: v.fieldError } : { list: null, failure: v ? v.reason : 'not read', tooMany: false };
  const j = j11Records(SD3, snap);
  const tl = timelineOf(j);
  const pv = phaseView(SD3, tl, snap.tree, j);
  const ctx = runsContext(SD3, snap, j, tl, pv);
  const feed = feedView(ctx, { pulls: [] }, now, TZ);
  return { snap, j, tl, pv, ctx, feed };
}

export const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
export const svgKids = (svg) => findAll(svg, () => true);

/** Open every fold of a kind on the screen (buttons with aria-expanded="false" whose class holds `cls`), as many rounds as it takes. */
export async function openFolds(app, cls = 'sb-fold') {
  for (let i = 0; i < 8; i++) {
    const folds = findAll(app.view, (e) => e.tag === 'button' && e.attrs['aria-expanded'] === 'false' && ` ${e.className} `.includes(` ${cls} `));
    if (!folds.length) return;
    for (const f of folds) {
      f.click();
      await app.flush();
    }
  }
}

/**
 * A browser-like layout for the branch drawings (AC57, AC65): the drawing's box at `top`, and each
 * phase name's row centred at the y given for it (relative to the box's top). Returns a function
 * that undoes it.
 */
export function railLayout(ys, { top = 300, height = 900 } = {}) {
  const saved = Object.getOwnPropertyDescriptor(El0.prototype, 'getBoundingClientRect');
  El0.prototype.getBoundingClientRect = function rect() {
    const ph = this.attrs && this.attrs['data-pname'];
    if (ph && typeof ys[ph] === 'number') return { top: top + ys[ph] - 10, bottom: top + ys[ph] + 10, height: 20, left: 40, right: 200, width: 160 };
    if (this.attrs && this.attrs['data-rail']) return { top, bottom: top + height, height, left: 16, right: 344, width: 328 };
    return { top: 0, bottom: 0, height: 0, left: 0, right: 0, width: 0 };
  };
  return () => {
    if (saved) Object.defineProperty(El0.prototype, 'getBoundingClientRect', saved);
    else delete El0.prototype.getBoundingClientRect;
  };
}

export { SD3, CONFIG, NOW, byClass, findAll, pullsAnswer, pullNodes, answerOf, node, j11Files, j11Snapshot };
