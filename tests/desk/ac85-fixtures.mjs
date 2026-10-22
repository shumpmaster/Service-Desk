// AC85's project (spec S-001, stage 4): the made-up "Letters" (NOT real records,
// tests/desk/fixtures/ac85/README.md) with a Launch-gate card in the Orchestrator's form, its case,
// docs/PROJECT.md's lines, and its questions, beside two real question files from the fixtures
// (notify/ac77-real's P-001-next-work.md and trial-view's P-001-design-lab-open.md). Shared by
// tests/desk/ac85-sheets.test.mjs and the stage's Chromium captures.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIX, fixture, CONFIG } from './helpers.mjs';
import { repo } from './fake-desk.mjs';

export const LETTERS = { name: 'Letters', repo: 'shumpmaster/Letters', defaultBranch: 'main', model: 'v3', planning: false, webCommitsToDefault: true,
  contentPrefill: true, contentParam: 'value' };
export const NOW = Date.parse('2026-10-19T21:00:00Z'); // 16:00 in the owner's time zone (America/Chicago)
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
const ac85 = (p) => readFileSync(join(FIX, 'ac85', p), 'utf8');

/** The real question files AC85's test renders. */
export const NEXT_WORK = fixture('notify/ac77-real/questions/P-001-next-work.md');
export const DESIGN_LAB = fixture('trial-view/P-001-design-lab-open.md');

/** Each question's raised time, minutes before NOW. */
export const RAISED = { 'P-003-send-issue': 20, 'P-001-next-work': 173, 'P-001-design-lab-open': 300, 'P-003-no-default': 45, 'P-003-mixed': 61 };
/** The gate card's raised time (its `card` entry in the dispatch log), minutes before NOW. */
export const GATE_RAISED = 180;

export function lettersRepo({ extra = {}, gateCard = ac85('queue/P-003-launch-1.md'), withCase = true } = {}) {
  const at = (min) => iso(NOW - min * 60e3);
  const log = [
    { item: 'P-003', action: 'card', card: 1, gate: 'launch', role: 'user-rep', route: 'launch-gate', stage: 6, gate_n: 1, time: at(GATE_RAISED), trigger: 'x' },
  ].map((o) => JSON.stringify(o)).join('\n');
  const files = {
    'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
    'dispatch-log/2026-10.jsonl': `${log}\n`,
    'dispatch-log/2026-09.jsonl': '',
    'status/P-003.toml': ac85('status/P-003.toml'),
    'queue/P-003-launch-1.md': gateCard,
    'docs/PROJECT.md': ac85('docs/PROJECT.md'),
    'questions/_TEMPLATE.md': fixture('service-desk/questions/_TEMPLATE.md'),
    'questions/P-003-send-issue.md': ac85('questions/P-003-send-issue.md'),
    'questions/P-003-no-default.md': ac85('questions/P-003-no-default.md'),
    'questions/P-003-mixed.md': ac85('questions/P-003-mixed.md'),
    'questions/P-001-next-work.md': NEXT_WORK,
    'questions/P-001-design-lab-open.md': DESIGN_LAB,
    'README.md': '# Letters\n\nNOT a real project: made up for AC85\'s test.\n',
    ...extra,
  };
  if (withCase) files['docs/gates/P-003/launch-gate-1-case.md'] = ac85('docs/gates/P-003/launch-gate-1-case.md');
  const r = repo(files, [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  for (const [name, min] of Object.entries(RAISED)) r.history[`questions/${name}.md`] = [{ commit: { committer: { date: at(min) } } }];
  return r;
}

export const lettersConfig = () => ({ ...CONFIG, projects: [LETTERS] });
/** A sheet's address on the board: a question by its name, the gate card by its file. */
export const Q = (name) => `Letters|question|questions/${name}.md`;
export const GATE = 'Letters|gate|queue/P-003-launch-1.md';
