// The MD sandbox tests' shared fixtures (spec S-001, AC42's H5 extremes, AC48–AC56): projects
// holding one item of each queue group, and the page opened on them.
import { fixture, CONFIG } from './helpers.mjs';
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

