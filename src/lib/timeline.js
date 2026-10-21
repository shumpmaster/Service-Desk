// The model's timeline of one v3 project (spec S-001, J11; AC50, AC51): a port of model S-023
// AC7's `Timeline` (governance/checks/v3_checks.py, model v3.3.0) and the phase rules it uses
// (governance/checks/orchestrator.py: PHASE_OF_STAGE, iterations, is_applied_decision,
// is_graduation). Pure: it reads the records J11 names, already parsed, and never the desk's own
// reckoning. `lines()` prints the same lines as `python3 governance/checks/v3_checks.py trace`
// (without the `NOTE: ` prefix), which is the test oracle (tests/desk/fixtures/j11-3117150/).
//
// Two file parts read records J11 doesn't name, and are "not recorded" here (the model can say more):
// - Launch-4 reads the handover package's "Its own monitoring and feedback" section;
// - Discovery-3's groundwork map is read from intake/requests/Q-*.toml's question, where the model
//   reads the Orchestrator's copy in research/<item>.md (the same text).

export const PHASE_OF_STAGE = { 1: 'Discovery', 2: 'Discovery', 3: 'Design', 4: 'Build', 5: 'Build', 6: 'Launch', 7: 'Operate', 8: 'Review' };
export const DESK_PHASES = ['Discovery', 'Design', 'Build', 'Launch'];
const BOUNDARY_WORDS = { dor: ['recycle', 're-aim'], criteria: ['recycle', 'revise'], launch: ['recycle', 'revise'] };

export const STANDARD_MILESTONES = [
  ['Discovery-1', 'Discovery', 'An idea worth exploring'],
  ['Discovery-2', 'Discovery', 'Success defined'],
  ['Discovery-3', 'Discovery', "The expert's questions answered"],
  ['Discovery-4', 'Discovery', 'The right problem chosen'],
  ['Discovery-5', 'Discovery', 'What already exists is known'],
  ['Discovery-6', 'Discovery', 'The risks are known'],
  ['Discovery-7', 'Discovery', 'Scope, limits and owners agreed'],
  ['Discovery-8', 'Discovery', 'A brief ready to rule on'],
  ['Design-1', 'Design', 'Done defined in real scenarios'],
  ['Design-2', 'Design', 'How the pieces connect is mapped'],
  ['Design-3', 'Design', 'Every unknown has a test'],
  ['Design-4', 'Design', 'Every fact is backed by evidence'],
  ['Design-5', 'Design', 'The design fits together'],
  ['Design-6', 'Design', 'A plan that passed review'],
  ['Build-1', 'Build', 'Tests written before the work'],
  ['Build-2', 'Build', 'The work is built'],
  ['Build-3', 'Build', 'Independently reviewed and passing'],
  ['Build-4', 'Build', 'The experiments are answered'],
  ['Build-5', 'Build', 'Everything built fits together'],
  ['Launch-1', 'Launch', "It's live"],
  ['Launch-2', 'Launch', 'An operating team is in place'],
  ['Launch-3', 'Launch', "It's handed over"],
  ['Launch-4', 'Launch', 'Its own monitoring and feedback works'],
  ['Launch-5', 'Launch', 'Graduated'],
];
export const STANDARD_IDS = STANDARD_MILESTONES.map((m) => m[0]);
export const NOT_RECORDED_IDS = new Set(['Discovery-1', 'Discovery-4', 'Discovery-6', 'Design-3', 'Design-5', 'Build-4', 'Build-5',
  'Launch-1', 'Launch-2', 'Launch-5']);
const REDO = {
  'Discovery-5': [['critic', 2]], 'Discovery-7': [['critic', 2]], 'Discovery-8': [['critic', 2]],
  'Design-1': [['definer', 3]], 'Design-6': [['definer', 3], ['critic', 3]],
  'Build-1': [['check-author', 4], ['critic', 4]], 'Build-2': [['builder', 5], ['checks', 5]],
  'Build-3': [['builder', 5], ['reviewer', 5]],
  'Launch-3': [['builder', 6], ['reviewer', 6]], 'Launch-4': [['builder', 6], ['reviewer', 6]],
};
const BRIEF_IDS = new Set(['Discovery-5', 'Discovery-7', 'Discovery-8']);

// Python's own words for values printed in the trace (`%s` of None, True, False).
const py = (v) => (v === null || v === undefined ? 'None' : v === true ? 'True' : v === false ? 'False' : String(v));
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const str = (v) => (v === undefined ? '' : v === null ? 'None' : String(v));
const stageOf = (o) => (Number.isInteger(o.stage) && PHASE_OF_STAGE[o.stage] ? o.stage : null);

export function isAppliedDecision(l) {
  return Boolean(l) && typeof l === 'object' && has(l, 'word') && !has(l, 'route') && !str(l.result).startsWith('refused');
}
export function isGraduation(l) {
  return isAppliedDecision(l) && l.gate === 'launch' && (l.word === 'approve' || l.word === 'proceed') && str(l.result).startsWith('done/');
}
function isBoundary(l) {
  return isAppliedDecision(l) && (BOUNDARY_WORDS[l.gate] || []).includes(l.word);
}

/** model S-023 AC6: [{ line, phase, iteration }] for each routed line of one item's lines in log order. */
export function iterations(lines) {
  const counts = {};
  let reached = new Set();
  const out = [];
  for (const l of lines) {
    if (!l || typeof l !== 'object' || Array.isArray(l)) continue;
    if (isBoundary(l)) {
      reached = new Set();
      continue;
    }
    if (!has(l, 'route') || stageOf(l) == null) continue;
    const phase = PHASE_OF_STAGE[l.stage];
    if (!reached.has(phase)) {
      counts[phase] = (counts[phase] || 0) + 1;
      reached.add(phase);
    }
    out.push({ line: l, phase, iteration: counts[phase] });
  }
  return out;
}

class Run {
  constructor(phase, iteration, item = null, first = null) {
    Object.assign(this, { phase, iteration, item, first });
    this.routed = []; // [[pos, line]]
    this.decisions = []; // [[pos, line]]
    this.project = []; // [milestone]
    this.standard = []; // [{ id, name, state, from }]
    this.sprints = {}; // milestone id -> [sprint id]
    this.untagged = [];
    this.nothingNeeded = false;
  }
  get isItemRun() {
    return this.item != null && this.routed.length > 0;
  }
  label() {
    return `${this.phase} i${this.iteration}`;
  }
}

const maxBy = (list, f) => list.reduce((a, b) => (a == null || f(b) > f(a) ? b : a), null);
const minOf = (list) => (list.length ? Math.min(...list) : null);

/**
 * Build the timeline. input: {
 *   project: parseProjectDoc's result or null; logRows: [object] in file-name, then line order;
 *   statuses: { item: fields }; merges: [object]; specs: { 'S-nnn': parseSpecDoc's result };
 *   groundwork: [Q-item]; handoverFiles: [path]; groundworkRulings: { path: true | false } }.
 */
export function buildTimeline(input) {
  const project = input.project || { milestones: [], problems: [], valueTargets: [], scopeLimitsOwnersFilled: false };
  const milestones = project.milestones || [];
  const statuses = input.statuses || {};
  const merges = (input.merges || []).filter((m) => m && typeof m.item === 'string');
  const specs = input.specs || {};
  const groundwork = new Set(input.groundwork || []);
  const handoverFiles = input.handoverFiles || [];
  const groundworkRulings = input.groundworkRulings || {};
  const log = (input.logRows || []).filter((o) => o && typeof o === 'object' && !Array.isArray(o)).map((o, i) => [i, o]);
  const byItem = new Map();
  for (const [pos, obj] of log) if (typeof obj.item === 'string') {
    if (!byItem.has(obj.item)) byItem.set(obj.item, []);
    byItem.get(obj.item).push([pos, obj]);
  }
  const projectItems = [...byItem.keys()].filter((i) => i.startsWith('P-') && byItem.get(i).some(([, o]) => has(o, 'route'))).sort();
  const first = projectItems.length ? projectItems[0] : null;
  const notes = [];
  const blocks = [];
  let allRuns = [];
  const linesOf = (item) => byItem.get(item) || [];

  // -- step 1: an item's own runs
  function itemRuns(item) {
    const lines = linesOf(item);
    const posOf = new Map(lines.map(([p, o]) => [o, p]));
    const runs = new Map();
    const order = [];
    for (const { line, phase, iteration } of iterations(lines.map(([, o]) => o))) {
      const key = `${phase}\u0000${iteration}`;
      if (!runs.has(key)) {
        runs.set(key, new Run(phase, iteration, item, posOf.get(line)));
        order.push(runs.get(key));
      }
      runs.get(key).routed.push([posOf.get(line), line]);
    }
    order.sort((a, b) => a.first - b.first);
    for (const [p, o] of lines) {
      if (has(o, 'route') || !isAppliedDecision(o)) continue;
      const before = order.filter((r) => r.routed.some(([rp]) => rp < p));
      const owner = before.length ? maxBy(before, (r) => Math.max(...r.routed.filter(([rp]) => rp < p).map(([rp]) => rp)))
        : (order[0] || null);
      if (owner) owner.decisions.push([p, o]);
    }
    for (const r of order) {
      r.nothingNeeded = r.phase === 'Build' && r.routed.some(([, o]) => o.nothing_needed === 'Build');
      for (const [, o] of [...r.routed, ...r.decisions]) {
        if (!has(o, 'nothing_needed') || o.nothing_needed === null) continue;
        const nn = o.nothing_needed;
        const expected = nn === 'Build' && ((has(o, 'route') && r.phase === 'Build') || (!has(o, 'route') && o.gate === 'criteria'));
        if (!expected) notes.push(`${item}: a line holding nothing_needed = ${JSON.stringify(nn)} in ${r.label()} marks nothing: only Build can be passed with nothing needed`);
      }
    }
    return order;
  }

  function graduation(item) {
    for (const [p, o] of linesOf(item)) if (isGraduation(o)) return [p, o];
    return null;
  }

  // -- steps 2 to 4: where the project milestones go
  function placeMilestones(item, runs) {
    const firstItem = item === first;
    const mine = milestones.filter((m) => (m.forItem == null) === firstItem && (firstItem || m.forItem === item));
    let lead;
    if (firstItem) {
      const cut = minOf(runs.flatMap((r) => r.routed.filter(([, o]) => ['Build', 'Launch'].includes(PHASE_OF_STAGE[o.stage])).map(([p]) => p)));
      lead = runs.filter((r) => cut == null || r.first < cut);
    } else lead = [];
    const seq = [...lead];
    const count = {};
    for (const r of lead) count[r.phase] = (count[r.phase] || 0) + 1;
    let prev = seq.length ? seq[seq.length - 1] : null;
    for (const m of mine) {
      if (m.phase === 'Discovery') {
        const disc = (firstItem ? lead : runs).filter((r) => r.phase === 'Discovery');
        let target = firstItem && disc.length ? disc[disc.length - 1] : (disc[0] || null);
        if (!target) {
          target = seq.find((r) => r.phase === 'Discovery' && r.iteration === 1) || null;
          if (!target) {
            target = new Run('Discovery', 1);
            seq.unshift(target);
            count.Discovery = (count.Discovery || 0) + 1;
          }
        }
        target.project.push(m);
        continue;
      }
      if (prev && prev.phase === m.phase) {
        prev.project.push(m);
        continue;
      }
      count[m.phase] = (count[m.phase] || 0) + 1;
      prev = new Run(m.phase, count[m.phase]);
      prev.project.push(m);
      seq.push(prev);
    }
    const rest = runs.filter((r) => !lead.includes(r));
    let before = lead.length ? lead[lead.length - 1] : null;
    for (const r of rest) {
      const twin = seq.find((x) => x.item == null && x.phase === r.phase && x.iteration === r.iteration);
      if (twin) {
        r.project = [...twin.project, ...r.project];
        seq[seq.indexOf(twin)] = r;
      } else {
        seq.splice(before && seq.includes(before) ? seq.indexOf(before) + 1 : 0, 0, r);
      }
      before = r;
    }
    return seq;
  }

  // -- step 5: the standard milestones of every run
  function match(item, phase, pos, research = false) {
    const pool = research ? allRuns : blocks.filter((b) => b[0] === item).flatMap((b) => b[1]).filter((r) => r.isItemRun);
    const cands = pool.filter((r) => r.phase === phase && r.first <= pos);
    if (cands.length) return maxBy(cands, (r) => r.first);
    const own = pool.filter((r) => r.item === item).sort((a, b) => a.first - b.first);
    if (own.length && pos < own[0].first && own[0].phase === phase) return own[0];
    return null;
  }

  const redoMatch = (o, mid) => (o.action === 'dispatch' || o.action === 'run-checks')
    && (REDO[mid] || []).some(([role, stage]) => o.role === role && o.stage === stage);

  function groundworkDispatched(run, after = -Infinity) {
    for (const q of groundwork) {
      for (const [p, o] of linesOf(q)) {
        if (p > after && o.action === 'dispatch' && (o.role === 'researcher' || o.role === 'source-checker')
          && match(run.item, 'Discovery', p, true) === run) return true;
      }
    }
    return false;
  }

  function redoes(run, mid) {
    if (BRIEF_IDS.has(mid) && run.phase === 'Discovery' && run.iteration >= 2) return true;
    if (mid === 'Discovery-3') return groundworkDispatched(run);
    return run.routed.some(([, o]) => redoMatch(o, mid));
  }

  function redoneAfter(run, mid, pos) {
    if (mid === 'Discovery-3') return groundworkDispatched(run, pos);
    return run.routed.some(([p, o]) => p > pos && redoMatch(o, mid));
  }

  const routeLines = (item, route) => linesOf(item).filter(([, o]) => o.route === route);

  function researchSettled(dorPos) {
    for (const [q, lines] of byItem) {
      if (!q.startsWith('Q-')) continue;
      const routed = lines.filter(([, o]) => has(o, 'route')).map(([p]) => p);
      if (!routed.length || Math.min(...routed) >= dorPos) continue;
      if (lines.some(([p, o]) => p < dorPos && o.route === 'source-pass')) continue;
      if (lines.some(([p, o]) => p < dorPos && isAppliedDecision(o) && str(o.result).startsWith('closed/'))) continue;
      return false;
    }
    return true;
  }

  function logPart(item, run, mid) {
    const matched = (lines, phase = run.phase) => lines.filter(([p]) => match(item, phase, p) === run && !redoneAfter(run, mid, p)).map(([p]) => p);
    if (mid === 'Discovery-3') {
      for (const q of groundwork) {
        for (const [p, o] of linesOf(q)) {
          if (o.route === 'source-pass' && match(item, 'Discovery', p, true) === run && !redoneAfter(run, mid, p)) return 'ok';
        }
      }
      return null;
    }
    if (BRIEF_IDS.has(mid)) {
      for (const p of matched(routeLines(item, 'dor-pass'))) if (mid !== 'Discovery-5' || researchSettled(p)) return 'ok';
      return null;
    }
    const route = { 'Design-1': 'define-to-plan-review', 'Build-1': 'checks-pass', 'Build-2': 'checks-run-pass',
      'Build-3': 'review-pass', 'Launch-4': 'launch-pass' }[mid];
    if (route) return matched(routeLines(item, route)).length ? 'ok' : null;
    if (mid === 'Design-6') {
      const passes = matched(routeLines(item, 'plan-pass'));
      if (!passes.length) return null;
      const lo = Math.min(...passes);
      const freezes = linesOf(item).filter(([p, o]) => (o.route === 'freeze-frozen' || o.route === 'freeze-nothing-needed')
        && p > lo && match(item, 'Design', p) === run);
      return freezes.length ? 'ok' : 'later';
    }
    if (mid === 'Launch-3') {
      const passes = matched(routeLines(item, 'launch-pass'));
      if (!passes.length) return null;
      const grad = graduation(item);
      if (grad && grad[0] > Math.min(...passes) && match(item, 'Launch', grad[0]) === run) return 'ok';
      return 'later';
    }
    return 'none';
  }

  function filePart(item, mid) {
    const st = statuses[item] || {};
    if (mid === 'Discovery-2') return (project.valueTargets || []).length > 0;
    if (mid === 'Discovery-3') {
      for (const suffix of ['groundwork', 'discovery']) if (groundworkRulings[`decisions/questions/${item}-${suffix}.md`] === true) return true;
      return false;
    }
    if (mid === 'Discovery-7') return Boolean(project.scopeLimitsOwnersFilled);
    if (mid === 'Design-2' || mid === 'Design-4') {
      const spec = typeof st.spec === 'string' ? specs[st.spec] : null;
      if (!spec) return 'not-recorded';
      return mid === 'Design-2' ? spec.hasJoins : spec.factsOk;
    }
    if (mid === 'Launch-3') return handoverFiles.length > 0;
    if (mid === 'Launch-4') return 'not-recorded';
    return 'none';
  }

  function stateOf(item, r, prev, mid, latest, latestItem, state) {
    if (r.nothingNeeded) return ['not needed', null];
    if (NOT_RECORDED_IDS.has(mid) || !r.isItemRun) return ['not recorded', null];
    let log = logPart(item, r, mid);
    let origin = log === 'ok' ? r.label() : null;
    if (log == null && r.iteration >= 2 && prev && !redoes(r, mid)) {
      const carried = state.get(prev) && state.get(prev)[mid];
      if (carried && carried[0]) {
        log = 'ok';
        origin = carried[1];
      }
    }
    if (!state.has(r)) state.set(r, {});
    state.get(r)[mid] = [log === 'ok', origin];
    if (mid === 'Discovery-3' && !groundwork.size) return ['not recorded', null];
    const filed = filePart(item, mid);
    if (filed !== 'none' && latest[r.phase] !== r) return ['not recorded', null];
    if (filed === 'not-recorded') return ['not recorded', null];
    if (log === 'none') return filed === true ? ['reached', null] : ['not reached', null];
    if (log === 'later') {
      if (latestItem[r.phase] === r && filed !== false) return ['not recorded', null];
      return ['not reached', null];
    }
    if (log === 'ok' && filed !== false) {
      return origin === r.label() ? ['reached', null] : [`reached (carried over from ${origin})`, origin];
    }
    return ['not reached', null];
  }

  function standardStates(item, runs) {
    const latest = {};
    const latestItem = {};
    for (const r of runs) {
      latest[r.phase] = r;
      if (r.isItemRun) latestItem[r.phase] = r;
    }
    const state = new Map();
    const sorted = [...runs].sort((a, b) => (a.phase < b.phase ? -1 : a.phase > b.phase ? 1 : a.iteration - b.iteration));
    for (const r of sorted) {
      const prev = runs.find((x) => x.isItemRun && x.phase === r.phase && x.iteration === r.iteration - 1) || null;
      r.standard = [];
      for (const [id, phase, name] of STANDARD_MILESTONES) {
        if (phase !== r.phase) continue;
        const [st, from] = stateOf(item, r, prev, id, latest, latestItem, state);
        r.standard.push({ id, name, state: st, from });
      }
    }
  }

  // -- step 6: sprints and steps
  const specIds = (sid) => (sid != null && specs[sid] ? specs[sid].milestones.ids : []);

  function sprints() {
    const byId = new Map(milestones.map((m) => [m.id, m]));
    const tied = new Map();
    const listed = new Set();
    for (const m of milestones) for (const s of m.sprints) if (!s.startsWith('PR #')) listed.add(s);
    for (const mg of merges) {
      const it = mg.item;
      let ids = [];
      const st = statuses[it] || {};
      if (it === first) {
        const sids = [mg.spec, ...(Array.isArray(st.superseded) ? st.superseded : [])];
        for (const sid of sids) ids.push(...specIds(sid).filter((i) => byId.has(i) && byId.get(i).forItem == null));
      } else if (it.startsWith('P-')) {
        ids = milestones.filter((m) => m.forItem === it).map((m) => m.id);
      } else if (typeof st.milestone === 'string') {
        ids = byId.has(st.milestone) || STANDARD_IDS.includes(st.milestone) ? [st.milestone] : [];
      }
      const seen = [];
      for (const i of ids) {
        if (seen.includes(i)) continue;
        seen.push(i);
        if (!tied.has(i)) tied.set(i, []);
        tied.get(i).push(it);
      }
      if (!seen.length && !listed.has(it)) {
        const runs = blocks.filter((b) => b[0] === first).flatMap((b) => b[1]).filter((r) => r.isItemRun);
        const lines = linesOf(it).filter(([, o]) => has(o, 'route')).map(([p]) => p);
        let target = null;
        if (runs.length && lines.length) {
          const lo = Math.min(...lines);
          const cands = runs.filter((r) => r.first <= lo);
          target = cands.length ? maxBy(cands, (r) => r.first) : runs.reduce((a, b) => (b.first < a.first ? b : a));
        } else if (runs.length) target = runs.reduce((a, b) => (b.first < a.first ? b : a));
        if (target) target.untagged.push(it);
      }
    }
    const every = blocks.flatMap((b) => b[1]);
    for (const r of every) {
      for (const m of r.project) {
        const t = tied.get(m.id) || [];
        r.sprints[m.id] = [...t, ...m.sprints.filter((s) => !t.includes(s))];
      }
    }
    for (const mid of STANDARD_IDS) {
      const phase = mid.split('-')[0];
      for (const x of tied.get(mid) || []) {
        const lines = linesOf(x).filter(([, o]) => has(o, 'route')).map(([p]) => p);
        let target = lines.length ? match(first, phase, Math.min(...lines), true) : null;
        if (!target) target = every.find((r) => r.phase === phase) || null;
        if (target && !(target.sprints[mid] || []).includes(x)) (target.sprints[mid] ||= []).push(x);
      }
    }
  }

  for (const item of projectItems) {
    const runs = itemRuns(item);
    blocks.push([item, runs, graduation(item)]);
    allRuns = allRuns.concat(runs.filter((r) => r.isItemRun));
  }
  for (const b of blocks) b[1] = placeMilestones(b[0], b[1]);
  for (const [item, runs] of blocks) standardStates(item, runs);
  sprints();

  const merged = (item) => merges.some((mg) => mg.item === item);
  const stepsOf = (item) => linesOf(item).filter(([, o]) => o.action === 'dispatch');

  function sprintLines(s) {
    const out = [`    sprint ${s}`];
    if (!s.startsWith('PR #')) for (const [, o] of stepsOf(s)) out.push(`      step ${py(o.time)} ${py(o.role)} stage ${py(o.stage)}`);
    return out;
  }

  function runLines(run) {
    const out = [run.label() + (run.nothingNeeded ? ' (nothing needed)' : '')];
    for (const s of run.standard) {
      out.push(`  ${s.id} "${s.name}": ${s.state}`);
      for (const x of run.sprints[s.id] || []) out.push(...sprintLines(x));
    }
    for (const m of run.project) {
      out.push(`  ${m.id} "${m.name}"${m.dropped ? ' (dropped)' : ''}`);
      for (const x of run.sprints[m.id] || []) out.push(...sprintLines(x));
    }
    if (run.untagged.length) {
      out.push('  untagged');
      for (const x of run.untagged) out.push(...sprintLines(x));
    }
    let steps = [...run.decisions];
    if (run.item != null && !merged(run.item)) steps = steps.concat(run.routed.filter(([, o]) => o.action === 'dispatch'));
    steps.sort((a, b) => a[0] - b[0]);
    for (const [, o] of steps) {
      if (has(o, 'route')) out.push(`    step ${py(o.time)} ${py(o.role)} stage ${py(o.stage)}`);
      else out.push(`    decision ${py(o.time)} ${py(o.gate)} ${py(o.word)}`);
    }
    return out;
  }

  /** The runs with no project item: when no item has routed lines, the milestones alone (lines()). */
  let bare = null;
  function bareRuns() {
    if (bare) return bare;
    bare = placeMilestones(null, []);
    for (const r of bare) {
      for (const [id, phase, name] of STANDARD_MILESTONES) if (phase === r.phase) r.standard.push({ id, name, state: 'not recorded', from: null });
    }
    return bare;
  }

  function lines() {
    const out = [];
    blocks.forEach(([item, runs, grad], n) => {
      if (n) {
        const f = runs.filter((r) => r.isItemRun).reduce((a, b) => (a == null || b.first < a.first ? b : a), null);
        out.push(`Later work ${n}: ${item} into ${f ? f.phase : 'nothing'}`);
      }
      for (const r of runs) out.push(...runLines(r));
      if (grad) out.push(`Graduated ${py(grad[1].time)}`);
    });
    if (!blocks.length) for (const r of bareRuns()) out.push(...runLines(r));
    return out;
  }

  /** Every run in the timeline's order: the first item's, then each later item's (or the bare runs). */
  const runs = () => (blocks.length ? blocks.flatMap((b) => b[1]) : bareRuns());

  return {
    first, blocks, notes, lines, runs, byItem, merged, log,
    graduated: blocks.length ? Boolean(blocks[0][2]) : false,
    graduationLine: blocks.length && blocks[0][2] ? blocks[0][2][1] : null,
  };
}
