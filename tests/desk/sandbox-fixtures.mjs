// The MD sandbox tests' shared fixtures (spec S-001, AC42's H5 extremes, AC48–AC56): projects
// holding one item of each queue group, and the page opened on them.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fixture, CONFIG, SRC } from './helpers.mjs';
import { repo, pr } from './fake-desk.mjs';
import { loadSandbox, j11Files } from './sandbox-helpers.mjs';

export const NOW = Date.parse('2026-10-14T15:00:00Z');
export const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
export const md = (p) => fixture(`md-extremes/${p}`);
export const om = (p) => fixture(`orchestrator-m2/${p}`);

export const v3 = (name) => ({ name, repo: `shumpmaster/${name}`, defaultBranch: 'main', model: 'v3', planning: false,
  webCommitsToDefault: true, contentPrefill: true, contentParam: 'value' });
export const v25 = (name) => ({ ...v3(name), model: 'v2.5' });

/**
 * A v3 project holding one item of each group (AC52's fixture): a card and a question (Decisions),
 * a hold card (Decisions, C), a Build-gate card (Gate rulings), a PR from a branch with a slash and
 * a merge card (Merges), and a deploy waiting for approval (Deploys, shown not counted).
 */
export function fullRepo(tag, { long = false } = {}) {
  const raised = (min) => iso(NOW - min * 60e3);
  const log = [
    { item: 'P-002', action: 'dispatch', role: 'critic', route: 'plan-review', stage: 3, time: raised(300), trigger: 'step', gate: null },
    { item: 'P-002', trigger: 'outcome', session: `P-002:plan-review:${raised(300)}`, role: 'critic', result: 'ok', verdict: 'PASS', record: 'reviews/P-002/plan.md', time: raised(280) },
    { item: 'P-002', action: 'card', card: 1, gate: 'criteria', role: 'critic', route: 'build-gate', stage: 4, time: raised(270), trigger: 'x' },
    { item: 'Q-020', action: 'card', card: 1, gate: 'stop', role: 'critic-triage', route: 'third-fail', stage: 2, time: raised(200), trigger: 'x' },
    { item: 'P-003', action: 'dispatch', role: 'builder', route: 'ready-dispatch', stage: 5, time: raised(20), trigger: 'step', gate: null },
  ].map((o) => JSON.stringify(o)).join('\n');
  const files = {
    'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
    [`dispatch-log/2026-10.jsonl`]: `${log}\n`,
    'dispatch-log/2026-09.jsonl': '',
    'status/P-002.toml': 'kind = "project"\nstage = 4\nstate = "waiting-owner"\nrole = "critic"\ngate = "criteria"\ncard = 1\n',
    'status/Q-020.toml': 'kind = "research"\nstage = 2\nstate = "waiting-owner"\nrole = "critic-triage"\ngate = "stop"\ncard = 1\n',
    'status/P-003.toml': `kind = "project"\nstage = 5\nstate = "dispatched"\nrole = "builder"\ndispatched_at = "${raised(20)}"\n`,
    'queue/P-002-criteria-1.md': md('gate-card.md').replace(/P-002/g, 'P-002'),
    'docs/gates/P-002/build-gate-1-case.md': md('gate-case.md'),
    'queue/Q-020-stop-1.md': long ? md('long-card.md') : md('long-card.md').replace(/^Research Q-020 failed.*$/m, `Research Q-020 (${tag}) failed: re-specify, drop or retry?`),
    [`questions/${tag}-pick.md`]: long ? md('long-question.md') : `# Ruling needed: ${tag}'s question\n\nWHY: a test.\nOPTIONS:\n  A. Yes.\n  B. No.\nRECOMMENDATION: B — no.\nRISK CLASS: R0\nREVERSIBILITY: reversible\nBLAST RADIUS: none\nDEFAULT: B\nTIMEOUT: 24\n`,
    'questions/_TEMPLATE.md': fixture('service-desk/questions/_TEMPLATE.md'),
    'queue/ci-hold-4a2448939173.md': om('queue/ci-hold-4a2448939173.md'),
    'queue/P-002-merge-conflict.md': om('queue/P-002-merge-conflict.md'),
    'docs/PROJECT.md': j11Files()['docs/PROJECT.md'],
    'governance/SURFACES.md': j11Files()['governance/SURFACES.md'],
    '.github/workflows/orchestrator.yml': j11Files()['.github/workflows/orchestrator.yml'],
    'reviews/P-002/plan.md': 'Verdict: PASS\n',
  };
  const r = repo(files, [pr(80, `${tag}: a change to merge`, { head: 'build/builder/md-sandbox', headRepo: `shumpmaster/${tag}` })],
    [{ name: 'governance', status: 'completed', conclusion: 'failure' }, { name: 'desk-deploy', status: 'waiting', conclusion: null }]);
  r.history[`questions/${tag}-pick.md`] = [{ commit: { committer: { date: raised(400) } } }];
  return r;
}

export function twoProjects() {
  const config = { ...CONFIG, projects: [v3('Alpha'), v3('Beta')] };
  return { config, repos: { Alpha: fullRepo('Alpha'), Beta: fullRepo('Beta') } };
}

export async function opened(setup = twoProjects(), hash = '#/') {
  const app = await loadSandbox({ ...setup, hash, now: NOW });
  await app.advance(1000);
  return app;
}

export function extremes() {
  const projects = [v3('Alpha'), v3('Beta'), v3('Gamma'), v25('Delta'), v3('Epsilon-with-a-very-long-project-name-that-wraps')];
  const config = { ...CONFIG, projects };
  const repos = {};
  for (const p of projects) {
    if (p.model === 'v2.5') {
      repos[p.name] = repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), 'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md'),
        'questions/Delta-1.md': md('long-question.md') });
    } else repos[p.name] = fullRepo(p.name, { long: true });
  }
  return { config, repos };
}


// ---------------------------------------------------------------------------
// The design-lab answers (2026-10-16): the owner's real record as filed, whose line 1 runs to about
// 1,800 characters (decisions/questions/P-001-design-lab-open.md), read from the tree as it stands.

export const DESIGN_LAB_OPEN = readFileSync(join(SRC, '..', 'decisions', 'questions', 'P-001-design-lab-open.md'), 'utf8');
/** Its words as the desk shows them: line 1 without its leading `Ruling: ` (AC52, AC55). */
export const DESIGN_LAB_WORDS = DESIGN_LAB_OPEN.split('\n')[0].replace(/^Ruling:\s*/, '');
export const DESIGN_LAB_PATH = 'decisions/questions/P-001-design-lab-open.md';

/**
 * Alpha with the owner's real record as its latest ruling, answered 10 minutes before NOW, and a
 * short ruling 30 minutes before; Beta with a short ruling as its latest. Both today.
 */
export function longRuling() {
  const setup = twoProjects();
  const at = (min) => [{ commit: { committer: { date: iso(NOW - min * 60e3) } } }];
  setup.repos.Alpha.commit({ [DESIGN_LAB_PATH]: DESIGN_LAB_OPEN, 'decisions/questions/P-001-short.md': 'Ruling: A, as recommended\n' });
  Object.assign(setup.repos.Alpha.history, { [DESIGN_LAB_PATH]: at(10), 'decisions/questions/P-001-short.md': at(30) });
  setup.repos.Beta.commit({ 'decisions/questions/P-002-short.md': 'Ruling: B, keep it as it is\n' });
  Object.assign(setup.repos.Beta.history, { 'decisions/questions/P-002-short.md': at(5) });
  return setup;
}

/**
 * The browser's measure of a ruling's line box (the fake DOM lays out no text): it holds at most
 * three lines (60.5 px at 20.16 px a line, as Chromium draws .9rem at 1.4) and its words `lines` lines.
 */
export function lineLines(app, id, lines) {
  const c = findKeyed(app, `lineclip:${id}`);
  if (!c) throw new Error(`no line box ${id}`);
  const LINE = 20.16;
  c.clientHeight = Math.round(Math.min(3, lines) * LINE);
  c.scrollHeight = Math.round(lines * LINE);
  return c;
}
export const findKeyed = (app, k) => {
  const walk = (n) => {
    for (const c of n.children || []) {
      if (c.dataset && c.dataset.k === k) return c;
      const f = walk(c);
      if (f) return f;
    }
    return null;
  };
  return walk(app.view);
};

/**
 * Lay the page out as a browser would, for the bubble's placement: every element gets a box, the
 * bar at every screen's foot (AC81) its 60 px, 14 px above the foot of the viewport, and an open bubble the height
 * `bubbleH` (its content, before the CSS holds it) from `bubbleTop`. Returns a function that undoes it.
 */
export function layout(El, { bubbleTop = 200, bubbleH = 1400 } = {}) {
  const saved = Object.getOwnPropertyDescriptor(El.prototype, 'getBoundingClientRect');
  El.prototype.getBoundingClientRect = function rect() {
    const vh = globalThis.window.innerHeight;
    const cls = ` ${this.className} `;
    if (cls.includes(' v2-bar ')) return { top: vh - 74, bottom: vh - 14, left: 16, right: globalThis.window.innerWidth - 16, height: 60, width: globalThis.window.innerWidth - 32 };
    if (cls.includes(' sb-bubble ')) return { top: bubbleTop, bottom: bubbleTop + bubbleH, left: 16, right: globalThis.window.innerWidth - 16, height: bubbleH, width: globalThis.window.innerWidth - 32 };
    return { top: 100, bottom: 160, left: 16, right: globalThis.window.innerWidth - 16, height: 60, width: globalThis.window.innerWidth - 32 };
  };
  globalThis.window.scrollBy = () => {};
  return () => {
    if (saved) Object.defineProperty(El.prototype, 'getBoundingClientRect', saved);
    else delete El.prototype.getBoundingClientRect;
  };
}
