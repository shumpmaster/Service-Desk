// The MD sandbox's screens after the owner's trial-view notes 2 (spec S-001, AC57 to AC72; J11, J12):
// the Status screen's phase boxes and branch drawing (AC57), the Home tile's phases (AC58, AC65), the
// Timeline as the project's breakdown (AC59, AC60, AC61), the Queue's "Unblocks" (AC66), the Team
// cards (AC67), the phase marker (AC68), the agents' gaps in slate (AC69), why a run began (AC70),
// the stalled line (AC71) and the safe-to-approve line on a waiting deploy (AC72). Pure: from one
// project's read model, its records as last read and the clock; the page (public/sandbox.js) only
// draws what these return.
//
// The rules everywhere: every word, count and date comes from a record, or is one of the fixed
// labels the criteria quote; a value no record gives says so ("not recorded", "not available"),
// never a value of the desk's own (AC41). Plain names first, codes after (AC64). Nothing here moves.

import { DESK_PHASES, isAppliedDecision } from './timeline.js';
import { NOT_RECORDED, NOT_AVAILABLE, deskWords, standardWord, treeLink, pullLink, commitLink, columnsOf, nowRule, runStateOf,
  queueView, hasWorkFiled, reachedDateWords } from './sandbox.js';
import { entryShape, entryWords, parseWorkflowRuns, questionName, firstMilestoneLine, milestoneValue, cardMilestoneLine } from './records.js';
import { dayKey, zonedToUtc } from './timefmt.js';
import { checksMark, prBodyParts, TOO_MANY_WORDS } from './pulls.js';
import { REVIEW_VERDICT_RE } from './j11.js';
import { BOUNDARY_WORDS } from './model.js';

export const PHASE_CLASS = { Discovery: 'ph-disc', Design: 'ph-des', Build: 'ph-build', Launch: 'ph-launch', Done: 'ph-done' };
export const PHASE_TOKEN = { Discovery: '--ph-disc', Design: '--ph-des', Build: '--ph-build', Launch: '--ph-launch', Done: '--idle' };
export const TOP_DOWN = ['Done', 'Launch', 'Build', 'Design', 'Discovery'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const cap = (w) => (w ? w[0].toUpperCase() + w.slice(1) : w);
const t = (x) => (typeof x === 'string' ? Date.parse(x) : x);

/** A date in the owner's zone, as the mockups write it: "30 Sep". */
export function dayWords(ms, tz) {
  const k = dayKey(new Date(ms), tz).split('-');
  return `${Number(k[2])} ${MONTHS[Number(k[1]) - 1]}`;
}

/** J9's headline words for a log entry, with no time (AC60, AC67, AC71: dates only, never a clock time). */
export function headlineWords(e) {
  const w = entryWords(e, '\u0000');
  return w ? w.replace(/,? \u0000/, '').replace('\u0000', '') : null;
}

/** "PR #44, #52": a pull request right after another drops its "PR " (AC57's "Work filed: PR #44, #52"). */
export function sprintList(ids) {
  return ids.map((x, i) => (i && /^PR #/.test(x) && /^PR #/.test(ids[i - 1]) ? x.slice(3) : x)).join(', ');
}

// ---------------------------------------------------------------------------
// The shared rules: runs, their states, and each milestone's mark (AC57's ordered rules, AC59's icons)

/**
 * The pieces every screen here needs from the model's timeline, once per project. `nowMs` and `tz`
 * (the clock and ownerTimeZone) give a reached date its year only when it is not this year (AC50).
 */
export function runsContext(project, snap, j, tl, pv, nowMs, tz) {
  const cols = columnsOf(tl);
  const now = pv && pv.nowRun ? pv.nowRun : null;
  const rule = nowRule(tl);
  const state = new Map(cols.runs.map((r) => [r, runStateOf(r, cols.runs, now)]));
  let next = null;
  if (now && rule === 'open') {
    // A milestone marked reached counts as work filed (AC50, from 2026-10-17): never the next to reach.
    next = [...now.project].sort((a, b) => a.lineno - b.lineno).find((m) => !m.dropped && !hasWorkFiled(now, m)) || null;
  }
  const doc = (j && j.projectDoc) || {};
  return { project, snap, j, tl, pv, cols, now, rule, state, next, standard: doc.standard || {}, tree: (snap && snap.tree) || new Map(),
    nowMs: Number.isFinite(nowMs) ? nowMs : Date.now(), tz: tz || 'UTC' };
}

/** A run's words: "finished", "finished, then gone back over", "now", "still to come" or "not recorded". */
export const RUN_WORDS = { finished: 'finished', 'gone back over': 'finished, then gone back over', now: 'now', 'still to come': 'still to come', 'not recorded': 'not recorded' };

/**
 * A milestone's rule, in AC57's order, the first that fits giving it: 1 skipped, not needed or
 * dropped; 2 next to reach; 3 any other milestone of a run still to come; 4 reached, carried over or
 * work filed in a run gone back over; 5 reached or carried over; 6 work filed (the now run or a run
 * finished and standing); 7 no work filed yet; 8 not reached; 9 not recorded. Returns { rule, status
 * (AC57's words), feed (AC59's words), soft }.
 */
export function milestoneRule(ctx, run, kind, m) {
  const st = ctx.state.get(run) || 'not recorded';
  if (kind === 'std') {
    const w = standardWord(m.state);
    const plan = ctx.standard[m.id];
    const skipped = Boolean(plan && plan.state === 'skipped');
    let status = cap(w);
    if (skipped) status = w === 'not recorded' || w === 'not needed' ? 'Skipped' : `${cap(w)} · planned as skipped`;
    if (skipped || w === 'not needed') return { rule: 1, status, feed: skipped ? 'skipped' : 'not needed', soft: true };
    if (st === 'still to come') return { rule: 3, status: w === 'not recorded' ? 'Still to come' : status, feed: 'planned', soft: false };
    if ((w === 'reached' || w === 'carried over') && st === 'gone back over') return { rule: 4, status, feed: `${w} · gone back over`, soft: false };
    if (w === 'reached' || w === 'carried over') return { rule: 5, status, feed: w, soft: false };
    if (w === 'not reached') return { rule: 8, status: 'Not reached', feed: 'not reached', soft: false };
    return { rule: 9, status: 'Not recorded', feed: 'not recorded', soft: true };
  }
  const sprints = run.sprints[m.id] || [];
  const filed = sprints.length > 0;
  if (m.dropped) return { rule: 1, status: 'Dropped', feed: 'dropped', soft: true };
  // A line carrying ` · reached: <date>` (J11, model S-033 AC7; from 2026-10-17), and only such a
  // line, says "reached", with its date, its sprints still listed (AC50, AC57, AC59). It is never the
  // next to reach (AC50) and never "Still to come" (AC57's rule 3): rule 4 in a run gone back over,
  // rule 5 everywhere else.
  if (m.reached) {
    const d = reachedDateWords(m.reached, ctx.nowMs, ctx.tz);
    const status = `Reached ${d}${filed ? ` · work filed: ${sprintList(sprints)}` : ''}`;
    if (st === 'gone back over') return { rule: 4, status, feed: `reached ${d} · gone back over`, soft: false, reached: d };
    return { rule: 5, status, feed: `reached ${d}`, soft: false, reached: d };
  }
  const words = filed ? `Work filed: ${sprintList(sprints)}` : 'No work filed yet';
  if (ctx.next && run === ctx.now && m.id === ctx.next.id) return { rule: 2, status: `${words} · next to reach`, feed: 'next to reach', soft: false };
  if (st === 'still to come') return { rule: 3, status: words, feed: 'planned', soft: false };
  if (filed && st === 'gone back over') return { rule: 4, status: words, feed: 'work filed · gone back over', soft: false };
  if (filed && (st === 'now' || st === 'finished')) return { rule: 6, status: words, feed: 'work filed', soft: false };
  if (!filed) return { rule: 7, status: words, feed: 'planned', soft: false };
  return { rule: 9, status: words, feed: 'not recorded', soft: true };
}
/** AC57's mark for each rule (the Status screen's plain circles and rings). */
export const STATUS_MARK = { 1: 'dashed', 2: 'gold', 3: 'empty', 4: 'light', 5: 'filled', 6: 'half', 7: 'empty', 8: 'red', 9: 'dashed' };
/** AC59's icon for each rule (the Timeline's plain neutral circles, each with an icon inside). */
export const FEED_ICON = { 1: 'skip', 2: 'next', 3: 'planned', 4: 'pastcheck', 5: 'check', 6: 'half', 7: 'planned', 8: 'cross', 9: 'unrec' };

/** A run's dot (AC57): finished filled; gone back over the lighter fill; now the gold ring or, under AC50's second rule, the half-filled circle; still to come an empty ring; with no now run a dashed ring. */
function dotMark(ctx, r) {
  const st = ctx.state.get(r);
  if (st === 'finished') return 'filled';
  if (st === 'gone back over') return 'light';
  if (st === 'now') return ctx.rule === 'open' ? 'gold' : 'half';
  if (st === 'still to come') return 'todo';
  return 'dashed';
}

/**
 * The branch drawing's dots and lines (AC57, AC58, AC65): one column per run, a dot for each phase
 * run in its phase's row, the latest run carrying on with a still-to-come dot in each later phase's
 * row through Done; a line between each dot and the next one up in its column (dashed into a
 * still-to-come dot), and one curve where each later run starts, from the last dot of the run
 * before it. Rows: Discovery 0 to Done 4 (bottom up).
 */
export function branchShape(ctx) {
  const rowOf = (phase) => (phase === 'Done' ? 4 : DESK_PHASES.indexOf(phase));
  const dots = [];
  for (const r of ctx.cols.runs) dots.push({ k: ctx.cols.k.get(r), row: rowOf(r.phase), phase: r.phase, mark: dotMark(ctx, r), run: r });
  if (ctx.cols.runs.length) {
    const last = ctx.cols.runs[ctx.cols.runs.length - 1];
    const k = ctx.cols.k.get(last);
    for (let row = rowOf(last.phase) + 1; row <= 4; row++) {
      const phase = row === 4 ? 'Done' : DESK_PHASES[row];
      dots.push({ k, row, phase, mark: row === 4 ? (ctx.pv && ctx.pv.done ? 'filled' : 'todo') : 'todo', run: null });
    }
  }
  const lines = [];
  const curves = [];
  for (let k = 1; k <= ctx.cols.count; k++) {
    const col = dots.filter((d) => d.k === k);
    for (let i = 1; i < col.length; i++) lines.push({ k, from: col[i - 1].row, to: col[i].row, dashed: col[i].mark === 'todo' });
    if (k > 1) {
      const prev = dots.filter((d) => d.k === k - 1);
      if (prev.length && col.length) curves.push({ fromK: k - 1, fromRow: prev[prev.length - 1].row, toK: k, toRow: col[0].row });
    }
  }
  return { cols: ctx.cols.count, dots, lines, curves };
}

// ---------------------------------------------------------------------------
// AC70: why a run began

/**
 * For each run that starts a new column (run 2 and later), why it began (AC70): the latest boundary
 * line of the run's item before the run's first routed line (model S-023 AC6: an applied decision
 * whose gate word sends the work back), with its record's first `Reason:` line, its date and its
 * source; or "why it went back: not recorded" (slate, AC69) with no such line or no such record.
 */
export function runBegan(ctx, r, tz) {
  const k = ctx.cols.k.get(r);
  const i = ctx.cols.runs.indexOf(r);
  if (!(k > 1) || (i > 0 && ctx.cols.k.get(ctx.cols.runs[i - 1]) === k)) return null;
  const none = { k, head: `Run ${k} began`, missing: true, words: `Run ${k} began · why it went back: not recorded` };
  if (r.item == null || r.first == null) return none;
  const lines = (ctx.tl.byItem.get(r.item) || []).filter(([p, o]) => p < r.first && isAppliedDecision(o) && (BOUNDARY_WORDS[o.gate] || []).includes(o.word));
  if (!lines.length) return none;
  const o = lines[lines.length - 1][1];
  const record = typeof o.record === 'string' ? o.record : null;
  if (!record || !ctx.tree.has(record)) return none;
  const rec = ctx.snap && ctx.snap.records ? ctx.snap.records.get(record) : undefined;
  const at = t(o.time);
  const head = `Run ${k} began${Number.isFinite(at) ? ` · ${dayWords(at, tz)}` : ''}`;
  const source = { words: `${o.proxy === true ? 'ruling by proxy' : 'your ruling'} · ${record}`, href: treeLink(ctx.project, ctx.tree, record) };
  if (rec === undefined) return { k, head, reading: true, words: 'why it went back: not available yet', source };
  if (rec && rec.reason) return { k, head, quote: rec.reason, source };
  return { k, head, plain: 'sent back at a gate, with no reason written', code: `${o.gate}: ${o.word}`, source };
}

// ---------------------------------------------------------------------------
// AC57: the Status screen's phases

const STATUS_KEY = {
  runs: [['filled', 'finished'], ['light', 'finished, then gone back over'], ['gold', 'now: holds the next milestone to reach'], ['todo', 'still to come']],
  milestones: [['filled', 'reached'], ['half', 'work under way'], ['gold', 'next to reach'], ['empty', 'no work filed yet'], ['red', 'not reached'],
    ['dashed', 'not taken on, or not recorded']],
};
export { STATUS_KEY };

/** The why line of a milestone (AC57, AC61): "why: <text>" as written, or "why: not recorded". */
function whyOf(ctx, kind, m) {
  const why = kind === 'std' ? (ctx.standard[m.id] ? ctx.standard[m.id].why : null) : m.why;
  return why ? { text: `why: ${why}`, recorded: true } : { text: 'why: not recorded', recorded: false };
}

/**
 * The Status screen's phases (AC57): from the top, Done, Launch, Build, Design, Discovery, each a
 * box with its state word and every run of its phase, latest first; each run's milestones from the
 * last at the top to the first at the bottom; and the branch drawing. Returns { tracked, why?, boxes,
 * shape, key }.
 */
export function statusPhases(ctx, tz) {
  const { project, pv } = ctx;
  if (project.model !== 'v3') return { tracked: false, why: 'Phases not tracked' };
  if (!ctx.tl || !pv.tracked) return { tracked: false, why: pv.why || 'Phases not tracked' };
  const boxes = TOP_DOWN.map((phase) => {
    if (phase === 'Done') return { phase, cls: PHASE_CLASS.Done, word: pv.done ? 'Done' : 'After the Launch gate', done: true, runs: [], foldable: false };
    const ph = pv.phases.find((x) => x.phase === phase);
    const runs = ctx.cols.runs.filter((r) => r.phase === phase);
    const latest = runs[runs.length - 1] || null;
    const views = [...runs].reverse().map((r) => runView(ctx, r, r === latest, tz));
    const folded = runs.length > 0 && runs.every((r) => ctx.state.get(r) === 'finished');
    return { phase, cls: PHASE_CLASS[phase], word: ph ? ph.word : NOT_RECORDED, now: Boolean(ph && ph.now), runs: views, foldable: true, startFolded: folded };
  });
  return { tracked: true, boxes, shape: branchShape(ctx), key: STATUS_KEY };
}

function runView(ctx, r, latest, tz) {
  const k = ctx.cols.k.get(r);
  const st = ctx.state.get(r) || 'not recorded';
  const own = [...r.project].sort((a, b) => a.lineno - b.lineno).map((m) => {
    const x = milestoneRule(ctx, r, 'own', m);
    return { id: m.id, name: m.name, code: m.id, words: x.status, mark: STATUS_MARK[x.rule], rule: x.rule, soft: x.soft, why: whyOf(ctx, 'own', m) };
  });
  const std = r.standard.map((s) => {
    const x = milestoneRule(ctx, r, 'std', s);
    return { id: s.id, name: deskWords(s.name), code: s.id, words: x.status, mark: STATUS_MARK[x.rule], rule: x.rule, soft: x.soft, why: whyOf(ctx, 'std', s), shown: x.status };
  });
  // In an earlier run, the standard milestones whose state is "not recorded" gather behind one line (C, as drawn).
  const gather = latest ? [] : std.filter((s) => s.rule === 9);
  const listed = std.filter((s) => !gather.includes(s));
  const counts = new Map();
  for (const s of std) counts.set(s.words.toLowerCase(), (counts.get(s.words.toLowerCase()) || 0) + 1);
  const ORDER = ['reached', 'carried over', 'still to come', 'not reached', 'skipped', 'not needed', 'not recorded'];
  const rank = (w) => (ORDER.indexOf(w) < 0 ? ORDER.length : ORDER.indexOf(w));
  return {
    key: `${r.phase}-i${r.iteration}`, k, tag: `Run ${k}`, head: `${r.phase} i${r.iteration} · ${RUN_WORDS[st]}`, state: st, latest,
    // From the top: the project's own milestones, the last first; then the standard ones, <Phase>-n first.
    milestones: [...own].reverse(), standard: [...listed].reverse(), gathered: [...gather].reverse(),
    gatherWords: gather.length ? `${gather.length} not recorded, one tap away` : null,
    stdLine: std.length ? `Standard milestones · ${[...counts.entries()].sort((a, b) => rank(a[0]) - rank(b[0])).map(([w, n]) => `${n} ${w}`).join(' · ')}` : null,
    began: runBegan(ctx, r, tz),
  };
}

// ---------------------------------------------------------------------------
// AC58 and AC65: the Home tile's phases

/**
 * The Home tile's phases (AC65, governing AC58 where they differ): the where-it-is line, five small
 * boxes from the top Done to Discovery with the tile's own words, and the compact branch drawing,
 * whose dots are the Timeline's icons in plain circles.
 */
export function tilePhases(ctx) {
  const { project, pv } = ctx;
  const rows = TOP_DOWN.map((phase) => ({ phase, cls: PHASE_CLASS[phase], word: '', now: false, done: phase === 'Done' }));
  if (project.model !== 'v3' || !ctx.tl || !pv.tracked) return { tracked: false, line: pv && pv.why ? pv.why : 'Phases not tracked', rows };
  const now = ctx.now;
  let line;
  let cls = null;
  if (pv.done) line = 'Done';
  else if (!now) line = 'where it is: not recorded';
  else {
    cls = PHASE_CLASS[now.phase];
    line = now.iteration > 1 ? `${now.phase}, ${now.iteration <= 10 ? `${ORDINALS[now.iteration]} time through` : `time ${now.iteration} through`}` : now.phase;
  }
  const multi = ctx.cols.count > 1;
  for (const row of rows) {
    if (row.phase === 'Done') continue;
    const ph = pv.phases.find((x) => x.phase === row.phase);
    if (!ph || !now) {
      row.word = NOT_RECORDED;
      continue;
    }
    row.now = ph.now;
    if (ph.now) row.word = multi ? `now · run ${ctx.cols.k.get(now)}` : 'now';
    else if (ph.word === 'Finished') row.word = 'finished';
    else if (/^Run \d+ still to come$/.test(ph.word)) row.word = `run ${/\d+/.exec(ph.word)[0]} to come`;
    else row.word = 'not started';
  }
  const shape = branchShape(ctx);
  const ICON = { filled: 'check', light: 'pastcheck', gold: 'next', half: 'half', todo: 'planned', dashed: 'unrec' };
  for (const d of shape.dots) d.icon = ICON[d.mark];
  return { tracked: true, line, cls, rows, shape, done: pv.done };
}

// ---------------------------------------------------------------------------
// AC68: the phase marker

/** The phase marker under a project screen's title (AC68): the now phase in its colour, its run, and the next milestone to reach. */
export function markerView(ctx) {
  const { project, pv } = ctx;
  if (project.model !== 'v3') return { link: false, words: 'Phases not tracked', cls: null };
  if (!ctx.tl || !pv.tracked) return { link: false, words: pv.why || 'Phases not tracked', cls: null };
  if (pv.done) return { link: true, words: 'Done', cls: PHASE_CLASS.Done };
  if (!ctx.now) return { link: true, words: 'Which phase is now is not recorded', cls: null };
  const now = ctx.now;
  return {
    link: true, cls: PHASE_CLASS[now.phase], phase: now.phase,
    run: ctx.cols.count > 1 ? `${now.phase} · run ${ctx.cols.k.get(now)}` : now.phase,
    next: ctx.next ? `now · next to reach: ${ctx.next.id}` : 'now · next to reach: none, every milestone has work filed',
  };
}

// ---------------------------------------------------------------------------
// AC59, AC60 and AC61: the Timeline

const isPr = (id) => /^PR #\d+$/.test(id);
const prNum = (id) => Number(id.slice(4));

/** A pull request's review mark (AC60): from its verdict files under reviews/<n>/ on the default branch. */
function reviewMark(ctx, n) {
  const paths = [...ctx.tree.keys()].filter((p) => {
    const m = REVIEW_VERDICT_RE.exec(p);
    return m && Number(m[1]) === n;
  });
  if (!paths.length) return { mark: '–', word: 'review', why: 'review not recorded' };
  const recs = paths.map((p) => (ctx.snap.records ? ctx.snap.records.get(p) : undefined));
  if (recs.some((r) => r === undefined)) return { mark: '–', word: 'review', why: 'review not available yet: its verdict files are still being read' };
  if (recs.some((r) => r && r.verdict === 'FAIL')) return { mark: '✕', word: 'review', why: null };
  if (recs.every((r) => r && r.verdict === 'PASS')) return { mark: '✓', word: 'review', why: null };
  return { mark: '–', word: 'review', why: 'review not recorded: a verdict file decides neither PASS nor FAIL' };
}

/** The pull requests J12 holds, by number, and why they are missing when they are. */
function pullsIndex(snap, model) {
  const p = snap && snap.pulls;
  // J12's awkward cases: after a refusal, a rate limit or a failed read, every pull-request part of
  // AC60 shows "not available" with the reason, never what an earlier read kept as if it were current.
  const failed = Boolean(p && p.failure);
  const list = p && p.list && !failed ? p.list : null;
  const by = new Map((list || []).map((x) => [x.number, x]));
  let missing = null;
  if (!list) missing = failed ? p.failure : "the pull requests haven't been read yet";
  // An open one's title and body come from J1's open list on every poll (J12).
  for (const o of (failed ? [] : (model && model.pulls)) || []) {
    if (!Number.isInteger(o.number)) continue;
    const kept = by.get(o.number);
    by.set(o.number, { ...(kept || { mergedAt: null, mergeCommit: null, checks: null, createdAt: o.createdAt || null }), number: o.number, title: o.title,
      state: 'OPEN', head: o.head || (kept && kept.head) || null, parts: o.parts || prBodyParts(''), open: true });
  }
  return { by, list, missing, tooMany: Boolean(p && p.tooMany), fieldError: p ? p.fieldError : null };
}

/** The model's timeline lines for an item that are steps (its dispatches), with their times. */
function stepTimes(ctx, item) {
  return (ctx.tl.byItem.get(item) || []).filter(([, o]) => o.action === 'dispatch').map(([, o]) => t(o.time)).filter(Number.isFinite);
}

/**
 * The Timeline (AC59, AC60, AC61): the project's breakdown read from the bottom up. Returns
 * { ok, words? , top, bottom, blocks: [run blocks, top first], nowAt, notes, index } where index
 * maps each sprint's id to where it is first drawn (for AC66's and AC67's links).
 */
export function feedView(ctx, model, nowMs, tz) {
  const { project, pv, tree } = ctx;
  if (project.model !== 'v3') return { ok: false, words: 'Phases not tracked' };
  if (!ctx.tl || !pv.tracked) return { ok: false, words: `The Timeline: ${NOT_AVAILABLE} until the project's records are read.` };
  const runs = ctx.cols.runs;
  if (!runs.length) return { ok: false, words: `No runs: the phases are ${NOT_RECORDED}.` };
  const doc = (ctx.j && ctx.j.projectDoc) || null;
  const pulls = pullsIndex(ctx.snap, model);
  const merges = (ctx.j && ctx.j.merges) || [];
  const records = (ctx.snap && ctx.snap.records) || new Map();
  const notes = [];
  const date = (ms) => (Number.isFinite(ms) ? dayWords(ms, tz) : null);

  // Every sprint the plan (and the model's timeline) ties to a milestone, and where.
  const listed = new Map(); // id → [{ run, id (milestone), kind }]
  for (const r of runs) {
    for (const m of r.project) for (const sid of r.sprints[m.id] || []) {
      if (!listed.has(sid)) listed.set(sid, []);
      listed.get(sid).push({ run: r, ms: m.id, kind: 'own' });
    }
    for (const s of r.standard) for (const sid of r.sprints[s.id] || []) {
      if (!listed.has(sid)) listed.set(sid, []);
      listed.get(sid).push({ run: r, ms: s.id, kind: 'std' });
    }
  }
  const ownIds = new Map();
  for (const r of runs) for (const m of r.project) if (!ownIds.has(m.id)) ownIds.set(m.id, r);
  const stdIds = new Set(runs.flatMap((r) => r.standard.map((s) => s.id)));

  // A run's times (AC59, N6): its steps and decisions, and the J12 merge times of its milestones' pull requests.
  const times = new Map();
  for (const r of runs) {
    const ts = [];
    for (const [, o] of r.decisions) ts.push(t(o.time));
    if (r.item != null && !ctx.tl.merged(r.item)) for (const [, o] of r.routed) if (o.action === 'dispatch') ts.push(t(o.time));
    const ids = [...r.project.flatMap((m) => r.sprints[m.id] || []), ...r.standard.flatMap((s) => r.sprints[s.id] || []), ...r.untagged];
    for (const sid of ids) {
      if (isPr(sid)) {
        const pr = pulls.by.get(prNum(sid));
        if (pr && pr.mergedAt && !r.untagged.includes(sid)) ts.push(t(pr.mergedAt));
      } else ts.push(...stepTimes(ctx, sid));
    }
    times.set(r, ts.filter(Number.isFinite));
  }
  const earliest = new Map(runs.map((r) => [r, times.get(r).length ? Math.min(...times.get(r)) : null]));
  const placeByTime = (ms) => {
    let at = null;
    for (const r of runs) if (earliest.get(r) != null && earliest.get(r) <= ms) at = r;
    return at || runs[0];
  };

  // Merged pull requests J12 holds that no list names: by their Milestone: line, or untied.
  const named = new Map(); // milestone id → [{ pr, run }]
  const untied = new Map(runs.map((r) => [r, []])); // run → [{ id, pr, none?, unknown? }]
  for (const pr of pulls.list || []) {
    if (!pr.mergedAt) continue; // an open one is in the Queue (AC52); a closed one was never merged
    const sid = `PR #${pr.number}`;
    if (listed.has(sid)) continue;
    const ml = pr.parts && pr.parts.milestone;
    const run = placeByTime(t(pr.mergedAt));
    if (ml && ml.ids) {
      const held = ml.ids.filter((id) => ownIds.has(id) || stdIds.has(id));
      const unknown = ml.ids.filter((id) => !ownIds.has(id) && !stdIds.has(id));
      for (const id of held) {
        if (!named.has(id)) named.set(id, []);
        named.get(id).push({ pr, run: ownIds.has(id) ? ownIds.get(id) : run, std: !ownIds.has(id) });
      }
      if (!held.length) untied.get(run).push({ id: sid, pr, unknown });
      continue;
    }
    untied.get(run).push({ id: sid, pr, none: ml && ml.none ? ml.none : null });
  }
  for (const [r, list] of untied) for (const x of list) times.get(r).push(t(x.pr.mergedAt));

  // One sprint, top to bottom (AC60).
  const sprintView = (sid, run, msId, extra = {}) => {
    const key = `${run.phase}-i${run.iteration}:${msId || 'untied'}:${sid}`;
    const feeds = msId ? `${run.phase} i${run.iteration} · ${msId}` : `${run.phase} i${run.iteration} · not tied to a milestone`;
    if (isPr(sid)) {
      const n = prNum(sid);
      const pr = pulls.by.get(n);
      if (!pr) {
        const why = pulls.list && !pulls.tooMany ? 'not recorded in what the desk reads' : NOT_AVAILABLE;
        const reason = pulls.list ? (pulls.tooMany ? TOO_MANY_WORDS : 'the pull requests the desk reads hold none of this number into the default branch') : pulls.missing;
        return { key, id: sid, code: sid, missing: why, reason, technical: [{ text: feeds }] };
      }
      const also = (listed.get(sid) || []).map((x) => x.ms).filter((x) => x !== msId);
      const tech = [feeds, pr.head ? pr.head : 'branch not recorded', ...also.map((x) => `also feeds ${x}`)];
      if (extra.unknown && extra.unknown.length) tech.push(...extra.unknown.map((id) => `names ${id}, which the plan does not hold`));
      const merged = pr.mergedAt ? { mark: '✓', word: 'merged', why: null } : pr.state === 'OPEN' ? { mark: '', word: 'open', why: null }
        : { mark: '', word: 'closed, not merged', why: null };
      const parts = pr.parts || prBodyParts('');
      return {
        key, id: sid, code: sid, at: pr.mergedAt ? t(pr.mergedAt) : null, date: pr.mergedAt ? date(t(pr.mergedAt)) : 'date not recorded',
        marks: [merged, reviewMark(ctx, n), checksMark(pr)], title: pr.title, none: extra.none || null,
        technical: [{ text: tech.join(' · ') }],
        context: parts.context && parts.context.length ? parts.context : null, why: parts.why && parts.why.length ? parts.why : null,
        tasks: { href: `${pullLink(project, n)}/commits`, line: "Opens the pull request's commits on GitHub; each one says who made it." },
      };
    }
    const steps = stepTimes(ctx, sid);
    const at = steps.length ? Math.max(...steps) : null;
    const mergeRows = merges.filter((m) => m.item === sid);
    const marks = [mergeRows.length ? { mark: '✓', word: 'merged', why: null } : { mark: '–', word: 'merged', why: 'not merged' }];
    let title;
    if (/^Q-/.test(sid)) {
      const outs = (ctx.tl.byItem.get(sid) || []).filter(([, o]) => o.trigger === 'outcome' && o.role === 'source-checker');
      const v = outs.length ? outs[outs.length - 1][1].verdict : null;
      marks.push(v === 'PASS' ? { mark: '✓', word: 'source-checked', why: null } : v === 'FAIL' ? { mark: '✕', word: 'source-checked', why: null }
        : { mark: '–', word: 'source check not recorded', why: null });
      const req = records.get(`intake/requests/${sid}.toml`);
      title = req && req.sentence ? `Research: ${req.sentence}` : 'title not recorded';
    } else {
      const lines = (ctx.tl.byItem.get(sid) || []).map(([, o]) => ({ ...o, shape: entryShape(o) })).filter((o) => o.shape);
      title = lines.length ? headlineWords(lines[lines.length - 1]) || 'title not recorded' : 'title not recorded';
    }
    const tech = [{ text: feeds }];
    const st = ctx.j && ctx.j.statuses ? ctx.j.statuses[sid] : null;
    const specPath = st && typeof st.spec === 'string' ? [...tree.keys()].find((p) => new RegExp(`^specs/${st.spec}(?:-[^/]*)?\\.md$`).test(p)) : null;
    for (const p of [`research/${sid}-memo.md`, `research/${sid}-source-check.md`, specPath]) if (p && tree.has(p)) tech.push({ text: p, href: treeLink(project, tree, p) });
    const tip = mergeRows.length ? mergeRows[mergeRows.length - 1].item_tip : null;
    return {
      key, id: sid, code: sid, at, date: Number.isFinite(at) ? date(at) : 'date not recorded', marks, title, technical: tech, context: null, why: null,
      tasks: typeof tip === 'string' ? { href: `https://github.com/${project.repo}/commits/${tip}`, line: "Opens the history on GitHub up to this run's last commit, newest first; the run's own commits are at the top." }
        : { none: 'Tasks: not recorded' },
    };
  };
  const latestAt = (list) => {
    const xs = list.map((x) => x.at).filter(Number.isFinite);
    return xs.length ? Math.max(...xs) : null;
  };

  // The rows of each run, bottom up, then drawn top down (AC59's delivery order).
  const blocks = new Map();
  for (const r of runs) {
    const st = ctx.state.get(r);
    const rk = `${r.phase}-i${r.iteration}`;
    const noDate = [];
    const dated = [];
    const noWork = [];
    const gatherNr = [];
    const gatherStc = [];
    for (const s of r.standard) {
      const x = milestoneRule(ctx, r, 'std', s);
      const namedHere = (named.get(s.id) || []).filter((e) => e.run === r);
      const sprints = (r.sprints[s.id] || []).map((sid) => sprintView(sid, r, s.id));
      const named2 = namedHere.map((e) => sprintView(`PR #${e.pr.number}`, r, s.id));
      if (x.rule !== 1 && !sprints.length && !named2.length) {
        if (st === 'still to come') {
          gatherStc.push({ id: s.id, name: deskWords(s.name), code: s.id, words: 'still to come' });
          continue;
        }
        if (x.feed === 'not recorded') {
          gatherNr.push({ id: s.id, name: deskWords(s.name), code: s.id, words: 'not recorded' });
          continue;
        }
      }
      noDate.push(msRow(ctx, r, 'std', s, x, sprints, named2));
    }
    for (const m of [...r.project].sort((a, b) => a.lineno - b.lineno)) {
      const x = milestoneRule(ctx, r, 'own', m);
      const sprints = (r.sprints[m.id] || []).map((sid) => sprintView(sid, r, m.id));
      const named2 = (named.get(m.id) || []).filter((e) => e.run === r).map((e) => sprintView(`PR #${e.pr.number}`, r, m.id));
      const row = msRow(ctx, r, 'own', m, x, sprints, named2);
      // A milestone marked reached (J11, from 2026-10-17) is never planned (AC59). With no dated
      // sprint it takes its reached date for its place, so it sits below Now (C); with a dated sprint
      // it keeps its latest sprint's date, so marking it reached never moves it.
      const reachedAt = m.reached ? reachedOrderMs(m.reached, tz) : null;
      if (latestAt(sprints) == null && reachedAt != null) dated.push({ ...row, at: reachedAt });
      else if (!sprints.length) noWork.push(row);
      else if (latestAt(sprints) == null) noDate.push(row);
      else dated.push({ ...row, at: latestAt(sprints) });
    }
    // Newest first by their dates (C, as drawn), those with no date last.
    const loose = [...r.untagged.map((sid) => sprintView(sid, r, null)),
      ...untied.get(r).map((x) => sprintView(x.id, r, null, { none: x.none, unknown: x.unknown }))]
      .map((x, i) => [x, i]).sort((a, b) => (b[0].at == null ? -Infinity : b[0].at) - (a[0].at == null ? -Infinity : a[0].at) || a[1] - b[1]).map(([x]) => x);
    if (loose.length) {
      const toFile = loose.filter((x) => !x.none).length;
      const n = loose.length;
      const sp = (k) => `${k} sprint${k === 1 ? '' : 's'}`;
      dated.push({ kind: 'untied', key: `${rk}:untied`, icon: 'flag', name: 'Not tied to a milestone',
        words: toFile === n ? `${sp(n)} · for the agents to file` : `${sp(n)} · ${toFile} for the agents to file`,
        sentence: 'No milestone in the plan lists these sprints, and they name none.', sprints: loose, at: latestAt(loose), untied: true });
    }
    dated.sort((a, b) => {
      const d = (a.at == null ? -Infinity : a.at) - (b.at == null ? -Infinity : b.at);
      if (d) return d;
      if (a.untied !== b.untied) return a.untied ? 1 : -1;
      return (a.lineno || 0) - (b.lineno || 0);
    });
    const gathers = [];
    const g = (list, tail) => (list.length ? { kind: 'gather', key: `${rk}:gather:${tail}`, items: list,
      words: `${list.length} standard ${r.phase} milestone${list.length === 1 ? '' : 's'} · ${tail === 'stc' ? 'still to come' : 'not recorded for this run'}` } : null);
    for (const x of [g(gatherNr, 'nr'), g(gatherStc, 'stc')]) if (x) gathers.push(x);
    const ts = times.get(r);
    const band = {
      name: `${r.phase}${runs.filter((x) => x.phase === r.phase).map((x) => ctx.cols.k.get(x)).filter((v, i, a) => a.indexOf(v) === i).length > 1 ? ` · run ${ctx.cols.k.get(r)}` : ''}`,
      cls: PHASE_CLASS[r.phase],
      state: { finished: 'finished', 'gone back over': 'gone back over', now: 'now', 'still to come': 'planned', 'not recorded': 'not recorded' }[st],
      dates: st === 'still to come' ? null : ts.length ? (dayKey(new Date(Math.min(...ts)), tz) === dayKey(new Date(Math.max(...ts)), tz)
        ? date(Math.min(...ts)) : `${date(Math.min(...ts))} to ${date(Math.max(...ts))}`) : 'dates not recorded',
    };
    band.words = band.dates ? `${band.dates} · ${band.state}` : band.state;
    // Bottom up: the gathered lines, the rows no date places, the dated ones, then those with no work filed yet.
    const up = [...gathers, ...noDate, ...dated, ...noWork];
    blocks.set(r, { key: rk, run: r, state: st, band, began: runBegan(ctx, r, tz), up, planned: noWork, hasTime: ts.length > 0 });
  }

  // From the top: what we're delivering; runs still to come, latest first; the now run's planned
  // milestones; the Now line; the rest of the now run; earlier runs, newest first; where we started.
  const now = ctx.now;
  let nowRunAt = now;
  let nowNote = null;
  if (!now) {
    const timed = runs.filter((r) => blocks.get(r).hasTime);
    nowRunAt = timed.length ? timed[timed.length - 1] : runs[0];
    nowNote = 'which run is now is not recorded';
  }
  const ni = runs.indexOf(nowRunAt);
  const order = [];
  for (let i = runs.length - 1; i >= 0; i--) {
    const b = blocks.get(runs[i]);
    if (i > ni) order.push({ ...b, rows: [...b.up].reverse(), plan: true });
    else if (i === ni) {
      const planned = now ? [...b.planned].reverse() : [];
      const rest = [...b.up].filter((x) => !planned.includes(x)).reverse();
      order.push({ ...b, plannedRows: planned, rows: rest, nowLine: { words: `Now · ${dayWords(nowMs, tz)}`, sub: 'ahead above · done below', note: nowNote } });
    } else order.push({ ...b, rows: [...b.up].reverse() });
  }
  const pur = doc && doc.purpose ? doc.purpose : { found: 'no-intent', items: [] };
  const item0 = pur.items[0] || null;
  const item1 = pur.items[1] || null;
  const quoted = item0 && /^["“]/.test(item0) && /["”]$/.test(item0);
  const allTimes = [...times.values()].flat();
  const top = {
    label: "What we're delivering", text: item0 || NOT_RECORDED, recorded: Boolean(item0),
    source: { words: `The project's purpose${quoted ? ', in your words' : ''} · docs/PROJECT.md, Intent`, href: treeLink(project, tree, 'docs/PROJECT.md') },
    finish: 'Finish line: Done, after the Launch gate',
  };
  const bottom = {
    label: 'Where we started', text: item1 ? firstSentenceOf(item1) : NOT_RECORDED, recorded: Boolean(item1),
    source: { words: `docs/PROJECT.md, Intent · the project began ${allTimes.length ? dayWords(Math.min(...allTimes), tz) : NOT_RECORDED}`, href: treeLink(project, tree, 'docs/PROJECT.md') },
  };
  if (pulls.tooMany) notes.push(TOO_MANY_WORDS);
  if (!pulls.list) notes.push(`Pull requests: ${NOT_AVAILABLE} (${pulls.missing})`);
  // Where each sprint is first drawn, for the Queue's and the Team's links (AC66, AC67).
  const index = new Map();
  for (const b of order) {
    for (const row of [...(b.plannedRows || []), ...b.rows]) {
      for (const sp of [...(row.sprints || []), ...(row.named || [])]) if (!index.has(sp.id)) index.set(sp.id, { run: b.key, row: row.key, sprint: sp.key });
    }
  }
  const msIndex = new Map();
  for (const b of order) for (const row of [...(b.plannedRows || []), ...b.rows]) if (row.kind === 'ms' && !msIndex.has(row.code)) msIndex.set(row.code, { run: b.key, row: row.key });
  return { ok: true, top, bottom, blocks: order, notes, index, msIndex, iconsKey: FEED_ICONS_KEY, bulletsKey: ['Technical', 'Context', 'Why'] };
}

/**
 * Where a reached date sits among the Timeline's dated rows (AC59, C): the start of that calendar day
 * in the owner's zone, so a sprint merged later that day sorts above it. Only the order uses it: the
 * words show the date as written (AC50).
 */
function reachedOrderMs(date, tz) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date));
  return m ? zonedToUtc(Number(m[1]), Number(m[2]), Number(m[3]), 0, 0, tz || 'UTC') : null;
}

const firstSentenceOf = (s) => {
  const m = /\.(?= |$)/.exec(s);
  return m ? s.slice(0, m.index + 1) : s;
};

/** AC59's "Status icons" key: each icon in words. */
export const FEED_ICONS_KEY = [['check', 'reached'], ['pastcheck', 'reached, then gone back over'], ['half', 'in progress: work filed'], ['next', 'next to reach'],
  ['planned', 'planned'], ['cross', 'not reached'], ['skip', 'skipped'], ['unrec', 'not recorded'], ['flag', 'for the agents to file']];

/** One milestone row on the Timeline (AC59): its icon, name, code, words, "Done when", why, and its sprints folded under it. */
function msRow(ctx, r, kind, m, x, sprints, named) {
  const why = kind === 'std' ? (ctx.standard[m.id] ? ctx.standard[m.id].why : null) : m.why;
  const planned = x.rule === 2 || x.rule === 3 || x.rule === 7;
  return {
    kind: 'ms', key: `${r.phase}-i${r.iteration}:${m.id}`, code: m.id, lineno: m.lineno || 0, name: kind === 'std' ? deskWords(m.name) : m.name,
    icon: FEED_ICON[x.rule], rule: x.rule, words: x.feed, doneWhen: kind === 'own' ? m.done : null,
    why: why ? { text: why, source: 'docs/PROJECT.md' } : null, sprints, named,
    fold: sprints.length > 1 ? `${sprints.length} sprints feed this` : sprints.length === 1 ? '1 sprint feeds this'
      : planned && kind === 'own' ? 'No sprints planned yet' : 'No sprints filed yet',
    namedFold: named.length ? `${named.length} named by its pull request, not yet in the plan` : null,
  };
}

// ---------------------------------------------------------------------------
// AC66: the Queue's "Unblocks", each milestone's why, and the Context fold

/**
 * A record's own `Milestone:` line and `## Context` section, in AC61 (c)'s form (J2; model S-033 AC2
 * and AC5, from 2026-10-17): for a question file, its first `Milestone:` line in column 0; for a
 * card, the line directly under its `answer:` line; and for each, its Context section, from its
 * heading to the next heading or the file's end (a card's stops before any `## 8.`).
 */
function ownParts(text, kind) {
  const line = kind === 'card' ? cardMilestoneLine(text) : firstMilestoneLine(text);
  return { milestone: milestoneValue(line), context: prBodyParts(text).context };
}

/** A milestone's plain name and why, by its code (AC66): a project milestone's (AC61 (a)) or a standard one's (AC61 (b)). */
function milestoneInfo(ctx, id) {
  for (const r of ctx.cols.runs) {
    const m = r.project.find((x) => x.id === id);
    if (m) return { code: id, name: m.name, why: m.why ? { text: m.why, source: 'docs/PROJECT.md' } : null };
    const s = r.standard.find((x) => x.id === id);
    if (s) return { code: id, name: deskWords(s.name), why: ctx.standard[id] && ctx.standard[id].why ? { text: ctx.standard[id].why, source: 'docs/PROJECT.md' } : null };
  }
  return null;
}

/** The milestones whose plan lists name a sprint id, in section 3's order (AC66, AC67). */
function planMilestonesOf(ctx, sid) {
  const out = [];
  for (const r of ctx.cols.runs) {
    for (const m of [...r.project].sort((a, b) => a.lineno - b.lineno)) if ((r.sprints[m.id] || []).includes(sid) && !out.includes(m.id)) out.push(m.id);
  }
  return out;
}

/**
 * What a waiting item unblocks (AC66), from the first record below that gives it: the item's own
 * `Milestone:` line; for a card, its item in a plan list; for a pull request, the plan lists naming
 * it, else its body's `Milestone:` line; otherwise "Unblocks: milestone not recorded".
 * Returns { none?, missing?, milestones: [{ code, name, why }], byPr?, context, code? }.
 */
export function unblocksOf(ctx, row) {
  const f = row.flag;
  let parts = null;
  if (f.kind === 'question') parts = ownParts(f.question.parsed ? f.question.parsed.text : '', 'question');
  else if (f.kind === 'card') parts = ownParts(f.card.parsed ? f.card.parsed.text : '', 'card');
  else if (f.kind === 'pr') parts = f.pr.parts || prBodyParts('');
  const context = parts && parts.context && parts.context.length ? parts.context : null;
  const known = (ids) => ids.map((id) => milestoneInfo(ctx, id) || { code: id, name: null, why: null });
  if ((f.kind === 'question' || f.kind === 'card') && parts && parts.milestone && (parts.milestone.none || parts.milestone.ids.length)) {
    if (parts.milestone.none) return { none: parts.milestone.none, milestones: [], context };
    return { milestones: known(parts.milestone.ids), context };
  }
  if (f.kind === 'card') {
    const ids = planMilestonesOf(ctx, f.card.item);
    if (ids.length) return { milestones: known(ids), context };
  }
  if (f.kind === 'pr') {
    const ids = planMilestonesOf(ctx, `PR #${f.pr.number}`);
    if (ids.length) return { milestones: known(ids), context };
    if (parts && parts.milestone && parts.milestone.none) return { none: parts.milestone.none, milestones: [], context };
    if (parts && parts.milestone && parts.milestone.ids.length) return { milestones: known(parts.milestone.ids), byPr: true, context };
  }
  return { missing: true, milestones: [], context };
}

/**
 * Where a "Done today" row's sprint is on the Timeline (AC66), from the Timeline's model `feed` and
 * the records as last read: { sprint } or { ms } to link to; { job: true } for a merge J12 marks as
 * the asks-merge job's that no plan line lists ("not on the Timeline: merged by the automatic job");
 * or null ("sprint: not recorded").
 * - a card answered: its item, when the item is a sprint on the Timeline;
 * - a pull request: its own sprint (AC60); a job's merge has none unless a plan line lists it, when
 *   the plan wins and it links there (J12; the owner's answer "B. Off the Timeline (Recommended)");
 * - a ruling (from 2026-10-17, model S-033's J1): the milestone named by its answer record's first
 *   `Milestone:` line after line 1, so it still links once its question is tidied away; for an
 *   answer with none, its question file's, while the tree holds that file (J2); otherwise none.
 */
export function doneTarget(feed, snap, kind, code) {
  if (!feed || !feed.ok) return null;
  const tree = (snap && snap.tree) || new Map();
  const records = (snap && snap.records) || new Map();
  if (kind === 'card' || kind === 'pr') {
    const sprint = kind === 'card' ? String(code).split(' ')[0] : String(code);
    if (feed.index.has(sprint)) return { sprint };
    const n = kind === 'pr' && /^PR #\d+$/.test(sprint) ? Number(sprint.slice(4)) : null;
    const kept = n != null && snap && snap.pulls && snap.pulls.list && !snap.pulls.failure ? snap.pulls.list.find((x) => x.number === n) : null;
    return kept && kept.mergedAt && kept.job === true ? { job: true } : null;
  }
  if (kind === 'ruling') {
    const ans = tree.has(`decisions/questions/${code}.md`) ? records.get(`decisions/questions/${code}.md`) : null;
    let line = ans && ans.milestone ? ans.milestone : null;
    if (!line) {
      const qp = `questions/${code}.md`;
      const q = tree.has(qp) ? records.get(qp) : null;
      line = q && q.text ? firstMilestoneLine(q.text) : null;
    }
    const v = milestoneValue(line);
    const id = v && v.ids ? v.ids.find((x) => feed.msIndex.has(x)) : null;
    return id ? { ms: id } : null;
  }
  return null;
}
export const JOB_MERGE_WORDS = 'not on the Timeline: merged by the automatic job';

/** AC66's neutral group marks; a group holding anything that waits on the owner shows the coral diamond instead. */
export const GROUP_MARK = { decisions: '◇', gates: '▲', verdicts: '✎', merges: '⇄', deploys: '▸' };

// ---------------------------------------------------------------------------
// AC67: the Team cards

/** A member card's state icon (AC67): Working half-filled, Just finished a check, Idle an empty dashed circle, not recorded a question mark. */
export function memberIcon(status) {
  if (status === 'Working') return 'half';
  if (status === 'Just finished') return 'check';
  if (status === 'Idle') return 'planned';
  if (/^Waiting on you/.test(status)) return 'you';
  return 'unrec';
}
export const TEAM_KEY = [['half', 'working'], ['check', 'just finished'], ['planned', 'idle'], ['you', 'waiting on you'], ['unrec', 'not recorded']];

/** The milestone an item feeds as a sprint (AC67): the first, in section 3's order, whose plan list names it; or null ("not tied to a milestone"). */
export function itemFeeds(ctx, item) {
  const ids = planMilestonesOf(ctx, item);
  const info = ids.length ? milestoneInfo(ctx, ids[0]) : null;
  return info ? { code: info.code, name: info.name } : null;
}

/**
 * A member's "last:" and "feeds" (AC67): the item and J9's words for the member's latest outcome
 * entry, with its date; the milestone that item feeds as a sprint, from the plan's lists; and, when
 * it is a sprint on the Timeline, where.
 */
export function memberWork(ctx, feed, rows, id, tz) {
  let e = null;
  if (id === 'orchestrator') e = [...rows].reverse().find((x) => Object.prototype.hasOwnProperty.call(x, 'route') || x.shape === 'decision') || null;
  else e = [...rows].reverse().find((x) => x.shape === 'outcome' && x.role === id) || null;
  if (!e) return { last: 'not recorded in what the desk reads', feeds: null, link: null };
  const at = t(e.time);
  const last = `last: ${headlineWords(e) || NOT_RECORDED}${Number.isFinite(at) ? `, ${dayWords(at, tz)}` : ''}`;
  const item = typeof e.item === 'string' ? e.item : null;
  const ids = item ? planMilestonesOf(ctx, item) : [];
  const info = ids.length ? milestoneInfo(ctx, ids[0]) : null;
  const place = item && feed && feed.ok ? feed.index.get(item) : null;
  return { last, item, feeds: info ? { code: info.code, name: info.name } : null, link: place ? item : null };
}

// ---------------------------------------------------------------------------
// AC71: the stalled-project line on the Home card

export const STALL_MS = 72 * 3600e3;

/**
 * "No movement for <n> days · last: <what>, <date>" (AC71), or null: the project Active, read within
 * the last 3 minutes, nothing waiting on the owner, its reads all in, and its last movement at least
 * 72 hours old. Movements: the head commit's time, a merged pull request (J12), an open one's
 * update (J1), a dispatch-log entry (J9); on a tie, the first of those last three, then the commit.
 */
export function stalledLine(project, box, snap, j, model, group, waiting, nowMs, tz) {
  if (project.model !== 'v3' || group !== 'active' || waiting > 0) return null;
  const read = box && box.read;
  if (!read || read.read !== 'ok' || read.since == null || nowMs - read.since > 180e3) return null;
  if (!snap || !snap.pulls || !snap.pulls.list || snap.pulls.failure || !j || !j.ready) return null;
  const moves = [];
  for (const pr of snap.pulls.list) if (pr.mergedAt) moves.push({ at: t(pr.mergedAt), rank: 0, words: `PR #${pr.number} merged` });
  for (const pr of (model && model.pulls) || []) if (pr.updatedAt) moves.push({ at: t(pr.updatedAt), rank: 1, words: `PR #${pr.number} updated` });
  for (const o of j.logRows) {
    const shape = entryShape(o);
    if (!shape) continue;
    const w = headlineWords({ ...o, shape });
    if (w) moves.push({ at: t(o.time), rank: 2, words: w });
  }
  if (snap.headAt) moves.push({ at: t(snap.headAt), rank: 3, words: `a commit on ${project.defaultBranch}` });
  const ok = moves.filter((m) => Number.isFinite(m.at));
  if (!ok.length) return null;
  ok.sort((a, b) => b.at - a.at || a.rank - b.rank);
  const last = ok[0];
  if (nowMs - last.at < STALL_MS) return null;
  const n = Math.floor((nowMs - last.at) / 86400e3);
  return { words: `No movement for ${n} day${n === 1 ? '' : 's'} · last: ${last.words}, ${dayWords(last.at, tz)}` };
}

// ---------------------------------------------------------------------------
// AC72: safe to approve, on each waiting deploy

const SHA40 = /^deploy ([0-9a-f]{40})(?![0-9a-f])/;

/** The commit a waiting deploy would deploy (AC72): a push run's head; a hand-started one's from its title, `deploy <sha> — <note>`. */
export function deployCommit(run) {
  if (run.event === 'push') return typeof run.headSha === 'string' && /^[0-9a-f]{40}$/.test(run.headSha) ? run.headSha : null;
  if (run.event === 'workflow_dispatch') {
    const m = SHA40.exec(typeof run.title === 'string' ? run.title : '');
    return m ? m[1] : null;
  }
  return null;
}

/**
 * Whether a waiting deploy's commit is the merge commit of a pull request the Reviewer passed
 * (AC72), from J12's merge commits and reviews/<n>/reviewer.md on the default branch. The desk
 * only says: no row offers an approval of its own.
 */
export function deployCheck(project, snap, run) {
  const tree = (snap && snap.tree) || new Map();
  const cant = (reason) => ({ kind: 'cant', words: "Can't check this deploy yet", reason });
  const sha = deployCommit(run);
  if (!sha) return cant("the deploy's commit isn't readable from its title");
  const p = snap && snap.pulls;
  // Never a pass, or a "don't approve", from a list that is not current (J12 failed, the read at the
  // current head not answered yet, or a cold read under way): "Can't check this deploy yet".
  if (!p || !p.list) return cant(`the pull requests' merge commits aren't read yet${p && p.failure ? ` (${p.failure})` : ''}`);
  if (p.failure) return cant(p.failure);
  if (p.current === false) return cant("the pull requests at the current head aren't read yet");
  const pr = p.list.find((x) => x.mergeCommit === sha && x.mergedAt);
  if (!pr) return { kind: 'bad', words: "Doesn't match a reviewed pull request: don't approve", reason: 'no merge of a passed pull request has this commit', sha };
  const path = `reviews/${pr.number}/reviewer.md`;
  if (!tree.has(path)) return { kind: 'bad', words: "Doesn't match a reviewed pull request: don't approve", reason: `PR #${pr.number} has no Reviewer verdict on ${project.defaultBranch}`, sha };
  const rec = snap.records ? snap.records.get(path) : undefined;
  if (rec === undefined) return cant(`${path} is still being read`);
  if (rec && rec.verdict === 'PASS') {
    return { kind: 'ok', words: `Matches PR #${pr.number}'s merge · Reviewer PASS`, sha, sources: [
      { words: path, href: treeLink(project, tree, path) }, { words: `the merge commit on ${project.defaultBranch}`, href: commitLink(project, sha) }] };
  }
  const reason = rec && rec.verdict === 'FAIL' ? `PR #${pr.number}'s Reviewer verdict is FAIL` : `PR #${pr.number} has no Reviewer verdict on ${project.defaultBranch}`;
  return { kind: 'bad', words: "Doesn't match a reviewed pull request: don't approve", reason, sha };
}

/** The waiting deploys of AC52's Deploys group, each with AC72's check. */
export function deployRows(project, snap) {
  if (!snap || !snap.checkPages) return [];
  const { runs } = parseWorkflowRuns(snap.checkPages);
  return runs.filter((r) => r.status === 'waiting').map((r) => ({ run: r, check: deployCheck(project, snap, r) }));
}

export { queueView, questionName, pullLink };
