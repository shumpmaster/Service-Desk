// Made-up running logs for AC49's lanes after MD3 (stage 4; the amendment's (b) items 30, second part, and 36; specs/S-001.md
// :3709-3734). Every record here is made up, NOT a real record (tests/desk/fixtures/README.md, "After MD3, stage 4"):
// - `cosLanes()`: a project whose Chief of Staff's session lines give a log with lanes (J13's form, as
//   tests/desk/fixtures/j13/good/ writes it): four pieces open together; a fifth opening while the first is still open
//   after three others ended; five open together;
// - `ownerStubs()`: a project whose owner's log has three lanes, the first filed and the second and third still open,
//   so stubs are drawn on a dashed and a dotted lane.
import { fixture } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { j11Files } from './sandbox-helpers.mjs';

export const LANES_NOW = Date.parse('2026-10-17T12:00:00Z');
const T = (hhmm) => `2026-10-17T${hhmm}:00Z`;
const NULL_USAGE = { input_tokens: null, output_tokens: null, cache_read_input_tokens: null, cache_creation_input_tokens: null, num_turns: null, duration_ms: 600000,
  context_window: null, autocompact_threshold: null, context_peak: null, compactions: null, derived: ['context_peak'], would_have_stopped: null, cost_usd_estimate: null };
const start = (s, time, doing) => JSON.stringify({ event: 'start', session: s, time: T(time), doing });
const helper = (s, from, to) => JSON.stringify({ event: 'helper', session: s, role: 'definer', started: T(from), ended: T(to), reported: { tokens: null, tool_uses: null, duration_ms: null } });
const end = (s, time) => JSON.stringify({ event: 'end', session: s, time: T(time), usage: NULL_USAGE });
const file = (lines) => `${lines.join('\n')}\n`;
const base = () => ({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), 'governance/SURFACES.md': j11Files()['governance/SURFACES.md'],
  'README.md': '# A made-up project\n\nNOT a real project: made up for AC49\'s lanes after MD3.\n' });
const project = (name) => ({ name, repo: `shumpmaster/${name}`, defaultBranch: 'main', model: 'v3', planning: false, webCommitsToDefault: true, contentPrefill: true, contentParam: 'value' });
const P = (id) => `sessions/chief-of-staff/${id}.jsonl`;

/** The made-up session files of each case (NOT real), by case. */
export const COS_CASES = {
  // Four pieces open together: each starts, and each has a helper after the last start, none handed back.
  four: Object.fromEntries(['a', 'b', 'c', 'd'].map((x, i) => [`four-${x}`, file([start(`four-${x}`, `0${8 + i}:00`.slice(-5), `Made-up piece ${x.toUpperCase()}, open with three others`),
    helper(`four-${x}`, '11:00', `11:${10 + i * 5}`)])])),
  // The fifth lane on the log opens while the first is still open, after three others came and went (the case the old
  // turn-taking got wrong: it gave the fifth the first one's look).
  fifth: {
    'fifth-a': file([start('fifth-a', '06:00', 'Made-up piece A, open the whole time'), helper('fifth-a', '11:00', '11:30')]),
    'fifth-b': file([start('fifth-b', '06:30', 'Made-up piece B'), end('fifth-b', '07:00')]),
    'fifth-c': file([start('fifth-c', '07:30', 'Made-up piece C'), end('fifth-c', '08:00')]),
    'fifth-d': file([start('fifth-d', '08:30', 'Made-up piece D'), end('fifth-d', '09:00')]),
    'fifth-e': file([start('fifth-e', '09:30', 'Made-up piece E, opening while A is open'), helper('fifth-e', '10:00', '10:30')]),
  },
  // Five open together: the fifth takes the first look, --ink solid.
  five: Object.fromEntries(['a', 'b', 'c', 'd', 'e'].map((x, i) => [`five-${x}`, file([start(`five-${x}`, `0${6 + i}:00`.slice(-5), `Made-up piece ${x.toUpperCase()}, one of five open`),
    helper(`five-${x}`, '11:00', `11:${10 + i * 5}`)])])),
};

/** A project of each case, its Chief of Staff's log drawn from its made-up session files. */
export function cosLanes() {
  const projects = [];
  const repos = {};
  for (const [k, files] of Object.entries(COS_CASES)) {
    const name = `Lanes-${k}`;
    projects.push(project(name));
    repos[name] = repo({ ...base(), ...Object.fromEntries(Object.entries(files).map(([id, t]) => [P(id), t])) });
  }
  return { projects, repos };
}

/** The owner's made-up log (NOT real): three cards raised in turn; the first answered, its decision filed; the other two waiting. */
export function ownerStubs() {
  const prev = '0'.repeat(64);
  const card = (item, n, time) => JSON.stringify({ action: 'card', card: n, gate: 'stop', item, prev, reason: 'Made up for the test (NOT a real record).', role: 'critic', route: 'triage-return', stage: 2, time: T(time), trigger: 'step' });
  const decision = (item, n, time) => JSON.stringify({ card: n, gate: 'stop', item, prev, proxy: false, record: `decisions/${item}/stop-${n}.md`, result: 'ready/2/researcher', time: T(time), trigger: 'decision', word: 're-specify' });
  const log = file([card('Q-901', 1, '06:00'), card('Q-902', 1, '07:00'), card('Q-903', 1, '08:00'), decision('Q-901', 1, '09:00')]);
  const name = 'Lanes-owner';
  return { projects: [project(name)], repos: { [name]: repo({ ...base(), 'dispatch-log/2026-10.jsonl': log, 'decisions/Q-901/stop-1.md': 'Decision: re-specify\n\nMade up (NOT a real record).\n' }) } };
}
