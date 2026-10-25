// A project's page (spec S-001, AC83; desk mockup v2, frames 5, 6, 6b and 8; stage 3), and the short
// phase line atop the Timeline and the Team screen (AC84; AC68, changed; P-001-timeline-marker.md, A).
// Pure: from one project's context (feed.js's runsContext), its records as last read and the clock;
// the page (public/sandbox.js) only draws what these return.
//
// The rules: every word, count and date comes from a record or is one of the fixed words the criteria
// quote; a value no record gives says so ("not recorded", "not available"), never a value of the desk's
// own (AC41). The phases and milestones keep AC57's rules for each run's and each milestone's state
// (AC57, changed by AC83): this module only lays them out as the page draws them.

import { DESK_PHASES, STANDARD_MILESTONES, NOT_RECORDED_IDS } from './timeline.js';
import { milestoneRule, FEED_ICON, PHASE_CLASS, runBegan, dayWords } from './feed.js';
import { NOT_RECORDED, NOT_AVAILABLE, deskWords, standardWord, reachedDateWords, PHASES_READING, PHASES_NOT_AVAILABLE } from './sandbox.js';
import { sprintStrip } from './home.js';
import { dayKey } from './timefmt.js';
import { SPEC_PATH_RE } from './j11.js';

/** The phases bottom up on the page's list (AC83, note 15): Launch at the top, Discovery at the foot. */
export const LIST_TOP_DOWN = ['Launch', 'Build', 'Design', 'Discovery'];
/** How many standard milestones each phase has in the model's table (24 today: 8, 6, 5 and 5). */
export const STANDARD_COUNT = Object.fromEntries(DESK_PHASES.map((p) => [p, STANDARD_MILESTONES.filter((m) => m[1] === p).length]));
export const STANDARD_TOTAL = STANDARD_MILESTONES.length;

/** The page's fixed words (AC83, frames 5, 6 and 8). */
export const PAGE_WORDS = Object.freeze({
  overview: 'Overview',
  timeline: 'Timeline',
  // AC92 (c), from G5: "Milestones by phase · <R> of <T> reached", R and T summed over the phases, in place of "yours and
  // the model's <n>"; where T sums to 0, "Milestones by phase · none tracked yet", never "0 of 0" (G5's review, round 1,
  // note 2); where the phases aren't tracked (no sums), the head alone, never a count the records don't give.
  milestonesHead: (c) => (!c ? 'Milestones by phase' : c.T ? `Milestones by phase · ${c.R} of ${c.T} reached` : 'Milestones by phase · none tracked yet'),
  startFoot: '↑ start at the foot',
  rest: 'The rest',
  values: 'Value targets',
  valuesSmall: (n) => `${n} target${n === 1 ? '' : 's'} · measured on the desk once that is built`,
  experiments: 'Experiments',
  experimentsSmall: (n) => `${n} registered`,
  details: 'Details',
  detailsSmall: 'Agents and usage · time asked of you · CI · record notes',
  nothingWaiting: 'Nothing waiting on you',
  checking: 'Checking…',
  // AC92 (d), from G6 (P-001-glance2-standard.md, A): an opened phase's two heads on every run, "Your milestones · <n>" and
  // "Standard checklist · <n> · <h> tracked" (or "· none tracked this run"), in place of "Yours" and "The model's standard <n>".
  yoursHead: (n) => `Your milestones · ${n}`,
  standardHead: (n, h) => `Standard checklist · ${n} · ${h ? `${h} tracked` : 'none tracked this run'}`,
  // The untracked ones folded into one row (AC92 (d)): "<n> not tracked this run: <a> not recorded yet, <b> no record in the
  // model", each part left out when 0; the words are "not tracked", not "not used" (the ruling).
  untracked: (a, b) => `${a + b} not tracked this run: ${[a ? `${a} not recorded yet` : null, b ? `${b} no record in the model` : null].filter(Boolean).join(', ')}`,
  notUsed: 'Not used by this project',
  olderPipeline: 'older pipeline',
  ledgerLatest: 'Latest in the ledger',
  records: 'Records',
});

// ---------------------------------------------------------------------------
// The one sentence (AC83) and the short phase line (AC84)

/** "first time through", "second time through", then "run <k>" (AC83's sentence). */
export function throughWords(k) {
  if (k === 1) return 'first time through';
  if (k === 2) return 'second time through';
  return `run ${k}`;
}

/**
 * AC83's one sentence (`--t-lead`): for a v3 project "<now phase>, <first time through | second time
 * through | run <k>>. Next: <the next milestone to reach, by its plain-English name>." ("Next: not
 * recorded" when AC50 gives none), "Done." once the project is (AC50); for a v2.5 project "Sprint <id>
 * is open." or "No open sprint." then "Nothing waits on you." or "<n> wait on you." (frame 8).
 * `waits` is { n, read } (the board's count for the project and its read state); until the project is
 * read the waits part is left out, never a quiet "Nothing waits on you" (Part A item 5; C).
 */
const UNREAD_SENTENCE = `Where it's heading: ${NOT_AVAILABLE} until the project's records are read.`;
export function pageSentence(ctx, { snap, waits = null } = {}) {
  const { project, pv } = ctx;
  if (project.model !== 'v3') {
    // Not read yet: where it is heading is unknown, said in words as Home's tile says it, never "No open sprint."
    if (!(snap && snap.tree)) return UNREAD_SENTENCE;
    const s = sprintStrip(snap);
    const open = s.tracked && s.open ? s.open : null;
    const many = s.tracked && s.rows && s.rows[0].cells.filter((c) => c.state === 'now').length > 1;
    const first = open ? `Sprint ${open} is open.` : many ? 'Which sprint is open is unclear.' : 'No open sprint.';
    if (!waits || waits.read !== 'ok') return first;
    return `${first} ${waits.n > 0 ? `${waits.n} ${waits.n === 1 ? 'waits' : 'wait'} on you.` : 'Nothing waits on you.'}`;
  }
  if (!ctx.tl || !pv || !pv.tracked) {
    return pv && (pv.why === PHASES_READING || pv.why === PHASES_NOT_AVAILABLE) ? UNREAD_SENTENCE : 'Phases not tracked.';
  }
  if (pv.done) return 'Done.';
  const now = ctx.now;
  const next = ctx.next ? ctx.next.name : NOT_RECORDED;
  if (!now) return `Which phase is now is not recorded. Next: ${next}.`;
  return `${now.phase}, ${throughWords(ctx.cols.k.get(now))}. Next: ${next}.`;
}

/**
 * The first part of AC83's sentence (AC84, draft 4): for a v3 project the whole sentence with its
 * ". Next: " written " · Next: " and its closing "." dropped; for a v2.5 project the sentence's first
 * sentence as it stands ("Sprint <id> is open." or "No open sprint.").
 */
export function firstPart(sentence, model) {
  if (model !== 'v3') return String(sentence).split(/(?<=\.) /)[0];
  return String(sentence).replace('. Next: ', ' · Next: ').replace(/\.$/, '');
}

/**
 * The short phase line atop the Timeline and the Team screen (AC84; AC68, changed): the now phase's
 * small square in its colour, then the first part of AC83's sentence, from the same records. Returns
 * { cls (the square's phase class, or null), words }.
 */
export function phaseLine(ctx, opts = {}) {
  const words = firstPart(pageSentence(ctx, opts), ctx.project.model);
  let cls = null;
  if (ctx.project.model === 'v3' && ctx.pv && ctx.pv.tracked) cls = ctx.pv.done ? PHASE_CLASS.Done : ctx.now ? PHASE_CLASS[ctx.now.phase] : null;
  return { cls, words };
}

// ---------------------------------------------------------------------------
// The phase strip (AC83, frame 5)

/**
 * The phase strip: Discovery, Design, Build and Launch left to right, each { phase, cls, icon, bar
 * ('solid' | 'dashed'), words, now }: "finished", "run <k> · now", "run <k> gone back over · run <k+1>
 * ahead", "planned", or "not recorded" (AC57's states, J11); `here` marks the cell the arrow points down at (AC92 (b),
 * from G8). Done is not a column. A v2.5 project's strip holds its last four sprints instead, "closed" or "open" (frame
 * 8; J9), `here` on the open one where one alone is open. Untracked: { tracked: false, words }.
 */
export function phaseStrip(ctx, snap) {
  const { project, pv } = ctx;
  if (project.model !== 'v3') {
    const s = sprintStrip(snap);
    if (!s.tracked) return { tracked: false, words: s.words };
    const W = { now: 'open', done: 'closed', unrec: 'not read yet' };
    return { tracked: true, sprints: true, cells: s.rows[0].cells.map((c) => ({ phase: c.id, cls: null, icon: c.icon, bar: 'solid', words: W[c.state], now: c.state === 'now', here: c.here })) };
  }
  if (!ctx.tl || !pv || !pv.tracked) return { tracked: false, words: pv && pv.why ? pv.why : 'Phases not tracked' };
  const cells = DESK_PHASES.map((phase) => {
    const runs = ctx.cols.runs.filter((r) => r.phase === phase);
    const cell = { phase, cls: PHASE_CLASS[phase], icon: 'unrec', bar: 'dashed', words: NOT_RECORDED, now: false };
    if (pv.done) return { ...cell, icon: 'check', bar: 'solid', words: 'finished' };
    if (!ctx.now || !runs.length) return cell;
    const st = (r) => ctx.state.get(r);
    const nowRun = runs.find((r) => st(r) === 'now');
    // AC92 (b), from G8: `here`, the cell the arrow points down at, the phase holding the now run itself.
    if (nowRun) return { ...cell, icon: 'half', bar: 'solid', words: `run ${ctx.cols.k.get(nowRun)} · now`, now: true, here: nowRun === ctx.now };
    const latest = runs[runs.length - 1];
    if (st(latest) === 'still to come') {
      const before = runs.filter((r) => st(r) !== 'still to come');
      if (before.length) {
        return { ...cell, icon: 'pastcheck', words: `run ${ctx.cols.k.get(before[before.length - 1])} gone back over · run ${ctx.cols.k.get(latest)} ahead` };
      }
      return { ...cell, icon: 'planned', words: 'planned' };
    }
    if (st(latest) === 'finished') return { ...cell, icon: 'check', bar: 'solid', words: 'finished' };
    return cell;
  });
  return { tracked: true, cells };
}

/**
 * Under the strip (AC83; AC70, unchanged in its sources): for each phase that ran again, "<phase> ran
 * again from <date> · why it went back: <the reason quoted from its record, with its source | not
 * recorded>". Returns [{ key, phase, words, quote, source }]: `quote` (the record's reason, quoted) and
 * `source` ({ words, href }) only where a record gives the reason. From G4 of "After the glance audit"
 * (AC91 (j); P-001-glance-ran-again.md, A), two or more lines with no reason recorded are said once
 * (sayUnrecordedOnce, below).
 */
export function ranAgainLines(ctx, tz, bandOf = null) {
  return sayUnrecordedOnce(ranAgainEach(ctx, tz, bandOf));
}

/** "Design and Build", "Discovery, Design and Build": a list of phases in words. */
const andList = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/**
 * Ran again, said once (AC91 (j); P-001-glance-ran-again.md, A: "repeated "ran again · why it went back: not recorded"
 * lines become one ("Design and Build ran again · why: not recorded")"): where two or more lines have no reason
 * recorded, they become one, "<Phase> and <Phase> ran again · why: not recorded", each phase named once even when it ran
 * again more than once, the phases in the strip's order (Discovery, Design, Build, Launch), in the place of the first of
 * them, still a gap the agents fill (`missing`, AC69); their dates stay on the Timeline. A line whose reason is recorded
 * keeps its own date and reason (AC70), a line still reading ("not available yet") its own, and a single unrecorded line
 * AC83's form. Pure.
 */
export function sayUnrecordedOnce(lines) {
  const un = lines.filter((x) => x.missing);
  if (un.length < 2) return lines;
  const phases = DESK_PHASES.filter((ph) => un.some((x) => x.phase === ph));
  const one = { key: 'again:unrecorded', phase: null, phases, words: `${andList(phases)} ran again · why: ${NOT_RECORDED}`, quote: null, source: null, missing: true };
  const at = lines.indexOf(un[0]);
  return [...lines.slice(0, at).filter((x) => !x.missing), one, ...lines.slice(at + 1).filter((x) => !x.missing)];
}

/** Each run that went back, its own line (AC83, AC70): ranAgainLines' lines before they are said once. */
export function ranAgainEach(ctx, tz, bandOf = null) {
  const { project, pv } = ctx;
  if (project.model !== 'v3' || !ctx.tl || !pv || !pv.tracked) return [];
  const out = [];
  for (const r of ctx.cols.runs) {
    const band0 = bandOf ? bandOf(r) : null;
    const b = runBegan(ctx, r, tz, band0 && band0.span ? band0.span[0] : null);
    if (!b) continue;
    let date = /^Run \d+ began (\d{1,2} [A-Z][a-z]{2})$/.exec(b.head || '');
    date = date ? date[1] : null;
    if (!date) {
      const routed = r.routed && r.routed.length ? Date.parse(r.routed[0][1].time) : NaN;
      const band = bandOf ? bandOf(r) : null;
      if (Number.isFinite(routed)) date = dayWords(routed, tz);
      else if (band && band.span) date = dayWords(band.span[0], tz);
    }
    const lead = `${r.phase} ran again${date ? ` from ${date}` : ''} · why it went back: `;
    const key = `again:${r.phase}-i${r.iteration}`;
    const phase = r.phase;
    if (b.quote) out.push({ key, phase, words: `${lead}“${b.quote}”`, quote: b.quote, source: b.source });
    else if (b.plain) out.push({ key, phase, words: `${lead}${b.plain} (${b.code})`, quote: null, source: b.source });
    else if (b.reading) out.push({ key, phase, words: `${lead}${NOT_AVAILABLE} yet`, quote: null, source: b.source });
    else out.push({ key, phase, words: `${lead}${NOT_RECORDED}`, quote: null, source: null, missing: true });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Milestones by phase (AC83, frames 5, 6 and 6b)

/** A rough finish as a milestone's row says it (AC24's, where it gives one): "rough finish 22–25 Oct", "only your acceptance remains", or null. */
export function finishWords(f, { label = true } = {}) {
  if (!f || f.na || !f.words) return null;
  if (f.accept) return f.words;
  return label ? `rough finish ${f.words}` : f.words;
}

// ---------------------------------------------------------------------------
// Every milestone and sprint counted (AC92 (c); round 2, item 4; P-001-glance2-counts.md, A; built in G5)

/** A sprint the Timeline marks "✓ merged" (AC60: a pull request's `mergedAt` in J12, a pipeline item's merge in the dispatch log). */
const mergedMark = (v) => Boolean(v && Array.isArray(v.marks) && v.marks.some((x) => x && x.word === 'merged' && x.mark === '✓'));

/**
 * The sprints of a list of the Timeline's sprint views, each id once: { s, m, w }. s is every one; m those the Timeline
 * marks "✓ merged", from the same view, so the count and the ticks never disagree; w the pull requests it draws as not
 * read (J12's read does not hold them: "not recorded in what the desk reads" or "not available"). A pipeline item is
 * never in w; an open pull request, one closed unmerged and a pipeline item with no merge are in s only.
 */
export function sprintCount(views) {
  const by = new Map();
  for (const v of views || []) if (v && v.id != null && !by.has(v.id)) by.set(v.id, v);
  let m = 0;
  let w = 0;
  for (const v of by.values()) {
    if (mergedMark(v)) m++;
    else if (v.missing && /^PR #\d+$/.test(v.id)) w++;
  }
  return { s: by.size, m, w };
}

/**
 * AC92 (c)'s one sprint form, used everywhere a sprint count shows: "<s> sprints" ("1 sprint"), then " · " and its
 * parts, "<m> merged" when m is 1 or more and "<w> not read" when w is 1 or more, joined by ", ", or "none merged yet"
 * when both are 0; "no sprints filed yet" when s is 0. Null (no count) gives "sprints not available".
 */
export function sprintsWords(c) {
  if (!c) return `sprints ${NOT_AVAILABLE}`;
  if (!c.s) return 'no sprints filed yet';
  const parts = [c.m ? `${c.m} merged` : null, c.w ? `${c.w} not read` : null].filter(Boolean);
  return `${c.s} sprint${c.s === 1 ? '' : 's'} · ${parts.length ? parts.join(', ') : 'none merged yet'}`;
}

/**
 * The Timeline's block for one run (feed.js, feedView), or null: the block drawn for that very run, and only where none is
 * (a run from another reading of the records) the block whose key, "<Phase>-i<n>", is the run's. Two runs can share a key
 * (a project's first item's run and a later item's, as `mix`'s made-up project has two "Build-i1" runs), so the key
 * alone can give the other run's block (G5's review, round 1, B1).
 */
export function blockOf(feed, run) {
  if (!feed || !feed.ok || !run) return null;
  return feed.blocks.find((x) => x.run === run) || feed.blocks.find((x) => x.key === `${run.phase}-i${run.iteration}`) || null;
}

/** Every sprint view the Timeline draws in one run's block: under its milestones (their plan lists and `Milestone:` lines) and "Not tied to a milestone". */
export function runSprintViews(feed, run) {
  const b = blockOf(feed, run);
  if (!b) return [];
  return [...(b.plannedRows || []), ...b.rows].flatMap((row) => [...(row.sprints || []), ...(row.named || [])]);
}

/** The sprints the Timeline draws under one milestone in one run (its fold's, AC84): { s, m, w }, or null where the Timeline isn't drawn. */
export function milestoneSprints(feed, run, id) {
  if (!feed || !feed.ok) return null;
  const b = blockOf(feed, run);
  const row = b ? [...(b.plannedRows || []), ...b.rows].find((x) => x.kind === 'ms' && x.code === id) : null;
  return sprintCount(row ? row.sprints : []);
}

/** Whether the model can record a state for a standard milestone (AC92 (c), class 5): not one of NOT_RECORDED_IDS, not Launch-4, not Discovery-3 while no groundwork is recorded. */
export function modelRecords(ctx, id) {
  if (NOT_RECORDED_IDS.has(id) || id === 'Launch-4') return false;
  if (id === 'Discovery-3') return Boolean(ctx.j && Array.isArray(ctx.j.groundwork) && ctx.j.groundwork.length);
  return true;
}

/**
 * The standard milestone's class in its phase (AC92 (c); C, readings (f), (g) and (i), P-001-glance-plan-readings.md, A),
 * the first that fits, from AC61's line and its states in every run of the phase: 1 skipped (its line); 2 reached
 * ("reached" or "carried over" in any run, a run gone back over included); 3 not needed (recorded, never reached); 4
 * tracked, not reached ("not reached" recorded in a run, or "taken on" by its line, the model able to record its state,
 * and its phase with a run now or still to come); 5 taken on, not recorded by the model (taken on, nothing recorded, and
 * the model can't record it, or its phase has no run now or still to come); 6 not tracked.
 * R3-a (the plan review's carried risk, round 3): a phase whose runs are neither finished nor now nor still to come
 * (their state "not recorded") has no run now or to come, so a taken-on recordable milestone there falls to class 5,
 * "taken on, not recorded by the model", never to class 6: its count agrees with its row's "taken on" (C), which from G6
 * (R3-b; AC92 (d)) reads "taken on · not recorded by the model", such a run being neither now nor still to come.
 */
export function standardClass(ctx, runs, id) {
  const plan = ctx.standard[id] || null;
  if (plan && plan.state === 'skipped') return 1;
  const words = runs.map((r) => {
    const s = r.standard.find((x) => x.id === id);
    return s ? standardWord(s.state) : 'not recorded';
  });
  if (words.some((w) => w === 'reached' || w === 'carried over')) return 2;
  if (words.includes('not needed')) return 3;
  if (words.includes('not reached')) return 4;
  if (plan && plan.state === 'taken on') {
    const live = runs.some((r) => ['now', 'still to come'].includes(ctx.state.get(r)));
    return modelRecords(ctx, id) && live ? 4 : 5;
  }
  return 6;
}

/**
 * One phase's counts (AC92 (c)): each milestone once in its phase, whatever number of runs list it. T is the phase's own
 * milestones (docs/PROJECT.md section 3) not dropped, over every run (a planned one of an earlier run counts, round 2's
 * F2), and its standard ones in classes 2 and 4 (a recorded "not reached" is tracked, round 2's F1); R those of T reached
 * (an own one whose line carries `· reached:`, a standard one in class 2). For the checklist, k is classes 2 and 4, o
 * class 5, q class 6, j class 1 and e class 3, so k + o + q + j + e is the phase's standard milestones. The sprints, each
 * once, as the Timeline draws them in the phase's runs (sprintCount), or null where the Timeline isn't drawn.
 */
export function phaseCounts(ctx, phase, feed = null) {
  const runs = ctx.cols.runs.filter((r) => r.phase === phase);
  const own = new Map();
  for (const r of runs) for (const m of r.project) if (!own.has(m.id)) own.set(m.id, m);
  const ownCounted = [...own.values()].filter((m) => !m.dropped);
  const cls = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const ids = STANDARD_MILESTONES.filter((m) => m[1] === phase).map((m) => m[0]);
  for (const id of ids) cls[standardClass(ctx, runs, id)]++;
  const T = ownCounted.length + cls[2] + cls[4];
  const R = ownCounted.filter((m) => m.reached).length + cls[2];
  let sprints = null;
  if (feed && feed.ok) sprints = sprintCount(runs.flatMap((r) => runSprintViews(feed, r)));
  else if (!ctx.cols.runs.length) sprints = { s: 0, m: 0, w: 0 };
  return { phase, R, T, n: ids.length, k: cls[2] + cls[4], o: cls[5], q: cls[6], j: cls[1], e: cls[3], sprints };
}

/**
 * Each phase's folded line, its two lines of detail (AC92 (c)): "<R> of <T> reached · <sprints>" (R and T the bold part,
 * 500 12 px `--ink`), or "no milestones tracked yet · <sprints>" with a T of 0 (C); and "Standard checklist: <k> tracked
 * · <o> taken on, not recorded by the model · <q> not tracked · <j> skipped · <e> not needed", each part left out when
 * it is 0; with k of 0, "Standard checklist: none tracked (<n>)", then its other parts, the not-tracked one apart, which
 * "none tracked" already says (C: as AC92 (c)'s example, "Standard checklist: none tracked (5)", and round 2's L2 have
 * it). The unused ones are said in words, never as "0 of <n>".
 */
export function countLines(c) {
  const sp = sprintsWords(c.sprints);
  const reached = c.T ? { bold: `${c.R} of ${c.T}`, rest: ` reached · ${sp}` } : { bold: null, rest: `no milestones tracked yet · ${sp}` };
  const rest = [c.o ? `${c.o} taken on, not recorded by the model` : null, c.j ? `${c.j} skipped` : null, c.e ? `${c.e} not needed` : null];
  const parts = c.k ? [`${c.k} tracked`, rest[0], c.q ? `${c.q} not tracked` : null, rest[1], rest[2]] : [`none tracked (${c.n})`, ...rest];
  return { reached, standard: `Standard checklist: ${parts.filter(Boolean).join(' · ')}` };
}

/**
 * One of the project's own milestones as the page's list shows it (AC83): its status icon (AC59's
 * set), id, plain-English name, and its state in words (AC57's states, AC50's reached date) with AC24's
 * rough finish where one exists.
 */
function ownRow(ctx, run, m, finishOf, old) {
  const x = milestoneRule(ctx, run, 'own', m);
  const f = !m.dropped && !m.reached && finishOf ? finishWords(finishOf(m.id)) : null;
  return { kind: 'own', id: m.id, name: m.name, icon: FEED_ICON[x.rule], rule: x.rule, words: [x.feed, f].filter(Boolean).join(' · '), soft: x.soft, old };
}

/**
 * Whether a standard milestone is tracked in one run (AC92 (d)'s h, per run, where (c)'s count is per phase): "reached",
 * "carried over" or "not reached" recorded for it in that run, its line not marking it skipped (the states of (c)'s
 * classes 2 and 4); or "taken on" by its line, the model able to record its state (modelRecords), while that run is now or
 * still to come. A "not needed" recorded in the run, and a skipped one whatever state it records, are outside h, as they
 * are outside (c)'s k, so in a phase with one run the head's h is its line's k (G6's review, round 1, note 1; the
 * Definer's narrowing of h from "a state recorded in that run", which counted them).
 */
export function trackedInRun(ctx, run, s) {
  const plan = ctx.standard[s.id] || null;
  if (plan && plan.state === 'skipped') return false;
  if (['reached', 'carried over', 'not reached'].includes(standardWord(s.state))) return true;
  if (s.state !== 'not recorded') return false;
  return Boolean(plan && plan.state === 'taken on' && modelRecords(ctx, s.id) && ['now', 'still to come'].includes(ctx.state.get(run)));
}

/**
 * One standard milestone (AC83): reached, taken on, skipped (each with its why where its line gives
 * one), not reached, not needed; or, with no state recorded, one of the three states told apart: not
 * used by this project ("skipped · why: …"), not recorded yet (a dashed circle with "?"), and no record
 * in the model (a slashed circle), for the standard milestones the model's trace never reads.
 */
function stdRow(ctx, run, s, old) {
  const plan = ctx.standard[s.id] || null;
  const tracked = trackedInRun(ctx, run, s);
  const why = plan && plan.why ? ` · why: ${plan.why}` : '';
  const w = standardWord(s.state);
  const base = { kind: 'std', id: s.id, name: deskWords(s.name), old };
  const gone = ctx.state.get(run) === 'gone back over';
  // A line marking it skipped (AC57's rule 1): "skipped", or, where the model records a state, that state
  // "· planned as skipped" (AC57's words), never shown as missing.
  if (plan && plan.state === 'skipped') {
    const recorded = ['reached', 'carried over', 'not reached'].includes(w);
    return { ...base, icon: 'skip', state: 'skipped', words: `${recorded ? `${w} · planned as skipped` : 'skipped'}${why}`, soft: true };
  }
  if (w === 'reached' || w === 'carried over') return { ...base, icon: gone ? 'pastcheck' : 'check', state: 'reached', words: `${w}${why}`, soft: false };
  if (w === 'not reached') return { ...base, icon: 'cross', state: 'not reached', words: `not reached${why}`, soft: false };
  if (w === 'not needed') return { ...base, icon: 'skip', state: 'not needed', words: `not needed${why}`, soft: true };
  // Taken on by its line, with no state in the model's records yet: its line's words (AC83: "never shown as missing"). From
  // G6 (AC92 (d)), one outside h (tracked in that run) reads "taken on · not recorded by the model": one the model can't
  // record (class 5 in (c)), in any run; and, R3-b (the plan review's carried risk, round 3), a recordable one in a run that
  // is neither now nor still to come (a finished phase's, class 5 too, or an earlier run gone back over), so every row a
  // run's head leaves out of its "<h> tracked" says why, as the phase line's "taken on, not recorded by the model" does (C).
  if (plan && plan.state === 'taken on') {
    return { ...base, icon: 'planned', state: 'taken on', tracked, words: `taken on${tracked ? '' : ' · not recorded by the model'}${why}`, soft: true };
  }
  if (NOT_RECORDED_IDS.has(s.id)) return { ...base, icon: 'nomodel', state: 'no record', words: 'no record for this in the model yet', soft: true };
  return { ...base, icon: 'unrec', state: 'not recorded', words: 'not recorded yet', soft: true };
}

/**
 * Milestones by phase (AC83): one line per phase, read from the bottom up (Launch at the top,
 * Discovery at the foot), each { phase, cls, word, counts, detail, runs, whyOnce }:
 * - word, at the right: "planned", "run <k> ahead", "run <k> · now", "finished" (or "not recorded");
 * - counts and detail, from G5 (AC92 (c)), in place of "Yours: … · Standard: <k> of <n> …": the phase's counts
 *   (phaseCounts) and its two lines of detail (countLines), "<R> of <T> reached · <sprints>" over "Standard checklist: …";
 * - runs, opened: the latest first, { k, head, latest, own (the first at the foot), std (`<Phase>-1` at
 *   the foot), stdCount, h, untracked }; earlier runs smaller. From G6 (AC92 (d)), every run, earlier ones included, is
 *   drawn under two heads, "Your milestones · <n>" and "Standard checklist · <n> · <h> tracked", h the standard ones
 *   tracked in that run (trackedInRun); its standard rows not tracked there ("not recorded yet", or "no record for this
 *   in the model yet") leave `std` for `untracked`, { n, a, b, words, rows }, one row that lists them in place on a tap,
 *   in place of an earlier run's gathered line ("Design-2 to Design-5 · not recorded, or no record in the model");
 *   skipped, not-needed and taken-on rows stay listed. From G5 (AC92 (c)), a milestone's row
 *   with sprints drawn under it on the Timeline adds them after its state words, in the one sprint form ("work filed · 1
 *   sprint · 1 merged"). From G8 (AC92 (b)), in the now phase only, the now run's next-to-reach row carries `here`, the
 *   arrow on the phase's thin line beside it;
 * - whyOnce: where at least one of the phase's standard milestones has no why written yet, the one
 *   line saying so (P-001-why-line.md, A).
 * The head's sums are { R, T } over the phases. `finishOf(code)` gives AC24's rough finish for one of the project's own
 * milestones; `bandOf(run)` the Timeline's band for a run (its label, frame 7b's dates); `feed` the Timeline's model
 * (feed.js, feedView), whose sprints the counts take, so the page and the Timeline never disagree.
 */
export function milestonesByPhase(ctx, { finishOf = null, bandOf = null, ruled = false, feed = null } = {}) {
  const { project, pv } = ctx;
  if (project.model !== 'v3' || !ctx.tl || !pv || !pv.tracked) return { tracked: false, words: pv && pv.why ? pv.why : 'Phases not tracked' };
  const withSprints = (row, run) => {
    const c = milestoneSprints(feed, run, row.id);
    return c && c.s ? { ...row, words: `${row.words} · ${sprintsWords(c)}`, sprints: c } : row;
  };
  const lines = LIST_TOP_DOWN.map((phase) => {
    const runs = ctx.cols.runs.filter((r) => r.phase === phase);
    const st = (r) => ctx.state.get(r);
    const latest = runs[runs.length - 1] || null;
    // The state word at the right.
    let word = NOT_RECORDED;
    if (pv.done) word = 'finished';
    else if (ctx.now && runs.length) {
      const nowRun = runs.find((r) => st(r) === 'now');
      if (nowRun) word = `run ${ctx.cols.k.get(nowRun)} · now`;
      else if (st(latest) === 'still to come') word = runs.some((r) => st(r) !== 'still to come') ? `run ${ctx.cols.k.get(latest)} ahead` : 'planned';
      else if (st(latest) === 'finished') word = 'finished';
    }
    const nowPhase = word.endsWith('· now');
    // The two lines of detail (AC92 (c)).
    const counts = phaseCounts(ctx, phase, feed);
    const ids = STANDARD_MILESTONES.filter((m) => m[1] === phase).map((m) => m[0]);
    // Opened: each run, the latest first.
    const runViews = [...runs].reverse().map((r, i) => {
      const isLatest = i === 0;
      const k = ctx.cols.k.get(r);
      const band = bandOf ? bandOf(r) : null;
      const head = `Run ${k} · ${band && band.label ? band.label : st(r) === 'still to come' ? 'planned' : ({ now: 'now', finished: 'finished', 'gone back over': 'gone back over' }[st(r)] || NOT_RECORDED)}`;
      // AC92 (b), from G8: in the now phase only, the now run's next-to-reach row (AC57's rule 2, which holds only in the now
      // run) takes `here`, the arrow on the phase's thin line beside it; the run is the run itself, never its key.
      const here = (x) => (nowPhase && r === ctx.now && x.rule === 2 ? { ...x, here: true } : x);
      const ownRows = [...r.project].sort((a, b) => a.lineno - b.lineno).map((m) => here(withSprints(ownRow(ctx, r, m, isLatest ? finishOf : null, !isLatest), r))).reverse();
      const stdRows = r.standard.map((s) => withSprints(stdRow(ctx, r, s, !isLatest), r));
      // AC92 (d), from G6: every run, earlier ones included, takes the two heads; the standard rows not tracked in that run
      // ("not recorded yet", or "no record for this in the model yet") fold into one row, listed in place on a tap.
      const out = stdRows.filter((x) => x.state === 'not recorded' || x.state === 'no record');
      const a = out.filter((x) => x.state === 'not recorded').length;
      const untracked = out.length ? { n: out.length, a, b: out.length - a, words: PAGE_WORDS.untracked(a, out.length - a), rows: [...out].reverse() } : null;
      const h = r.standard.filter((s) => trackedInRun(ctx, r, s)).length;
      return { k, key: `${r.phase}-i${r.iteration}`, head, latest: isLatest, own: ownRows, std: stdRows.filter((x) => !out.includes(x)).reverse(), stdCount: r.standard.length, h, untracked };
    });
    const noWhy = ids.some((id) => !(ctx.standard[id] && ctx.standard[id].why));
    const whyOnce = noWhy ? `Why each is taken on or skipped: not written yet. ${project.name}'s Chief of Staff writes its lines${ruled ? ' (your ruling, P-001-standard-milestones)' : ''}.` : null;
    return { phase, cls: PHASE_CLASS[phase], word, now: nowPhase, counts, detail: countLines(counts), runs: runViews, whyOnce };
  });
  const sum = { R: lines.reduce((a, l) => a + l.counts.R, 0), T: lines.reduce((a, l) => a + l.counts.T, 0) };
  return { tracked: true, n: STANDARD_TOTAL, sum, sprints: pageSprints(ctx, feed), lines };
}

/**
 * The page's sprints, each once however many phases, runs or milestones draw it (AC92 (e): the tally's "<sprints>",
 * "summed over the page, each sprint once"): the Timeline's sprint views in every run, by the run itself (blockOf), as
 * each phase's count takes them (phaseCounts); { s: 0, m: 0, w: 0 } where there is no run; null where the Timeline isn't
 * drawn, so the words say "not available", never a count the records don't give.
 */
export function pageSprints(ctx, feed = null) {
  if (feed && feed.ok) return sprintCount(ctx.cols.runs.flatMap((r) => runSprintViews(feed, r)));
  return ctx.cols.runs.length ? null : { s: 0, m: 0, w: 0 };
}

/**
 * The one-line tally under the page's sentence, in its soft box (AC92 (e); P-001-glance2-anchor.md, A: "the project page
 * gets its boxed sentence and tally"): "<R> of <T> milestones reached · <sprints>", R and T summed over the phases as the
 * section's head sums them (AC92 (c)), R and T the bold part, and the sprints in (c)'s one form, each sprint once
 * ("8 of 16 milestones reached · 17 sprints · 9 merged, 8 not read"); "no milestones tracked yet · <sprints>" where T sums
 * to 0, never "0 of 0", as a phase's line says it (C). Null where the phases aren't tracked (milestonesByPhase's
 * `tracked: false`), so the box holds the sentence alone. Returns { bold, rest }, as countLines' `reached`.
 */
export function pageTally(mv) {
  if (!mv || !mv.tracked) return null;
  const sp = sprintsWords(mv.sprints);
  return mv.sum.T ? { bold: `${mv.sum.R} of ${mv.sum.T}`, rest: ` milestones reached · ${sp}` } : { bold: null, rest: `no milestones tracked yet · ${sp}` };
}

/** The two lines of detail in words (their bold part included): for assistive technology and the tests. */
export function detailLines(d) {
  return [`${d.reached.bold || ''}${d.reached.rest}`, d.standard];
}

// ---------------------------------------------------------------------------
// The rest (AC83, frame 5) and a v2.5 project's page (frame 8)

/** "V1 to V5" when the ids run on from the first to the last, else each named. */
export function targetIds(lines) {
  const ids = lines.map((l) => l.id);
  if (ids.length <= 1) return ids.join('');
  const n = ids.map((id) => Number(id.slice(1)));
  return n.every((x, i) => i === 0 || x === n[i - 1] + 1) ? `${ids[0]} to ${ids[ids.length - 1]}` : ids.join(', ');
}

/**
 * The rest's rows (AC83): "Value targets <ids>" when docs/PROJECT.md section 6 holds `V<n>:` lines
 * (null otherwise), with each line word for word for its sheet; "Experiments", counted from the tree's
 * `experiments/EXP-*.md` files, with their names for its sheet.
 */
export function restRows(j, tree) {
  const doc = j && j.projectDoc;
  const lines = doc && doc.valueLines ? doc.valueLines : [];
  const values = lines.length ? { title: `${PAGE_WORDS.values} ${targetIds(lines)}`, small: PAGE_WORDS.valuesSmall(lines.length), lines } : null;
  const files = [...((tree && tree.keys && tree.keys()) || [])].filter((p) => /^experiments\/EXP-[^/]+\.md$/.test(p)).sort();
  // A tree not read yet: "not available", never "0 registered" (the Design reviewer's B2).
  const read = Boolean(tree && tree.keys);
  const experiments = { title: PAGE_WORDS.experiments, small: read ? PAGE_WORDS.experimentsSmall(files.length) : NOT_AVAILABLE, names: files.map((p) => p.slice('experiments/'.length).replace(/\.md$/, '')), read };
  return { values, experiments };
}

/**
 * A v2.5 project's rows (frame 8): "CI on <default branch>: <AC29's state>"; "Latest in the ledger:
 * <its id> · <date> · <its title>" (J9); "Records: <n> ledger entries · <n> specs" from J9's ledger read
 * and the tree; then "Not used by this project", in the frame's words, the questions row only while
 * the tree holds neither a questions nor a queue folder, the agent runs row only while it holds no
 * dispatch log.
 */
/**
 * AC89 (k): the v2.5 page's CI row gives its workflow and date where AC29's read gives them (" · <workflow> · <date>"),
 * and " · workflow and date not read" otherwise; nothing more where the state itself says the runs weren't read.
 */
function ciFrom(model, nowMs, tz) {
  if (!model || !model.ciKnown) return '';
  const r = model.ciRun;
  if (!r || !r.name) return ' · workflow and date not read';
  if (r.at == null) return ` · ${r.name} · date not read`;
  return ` · ${r.name} · ${reachedDateWords(dayKey(new Date(r.at), tz || 'UTC'), nowMs, tz)}`;
}

/**
 * Details' CI line (AC92 (c); round 2's "only if simple", C; reading (a), P-001-glance-plan-readings.md, A; built in G5):
 * "CI on <branch>: <AC29's state> · <y> of <x> workflows passed", adding ", <z> running" when z is 1 or more ("1 of 1
 * workflow passed" for a single one, C), from the counted workflows (records.js, ciCounts). `ciPassed` is the part after
 * AC29's state: none when x is 0, AC29's state is "none", or the runs aren't read (no counts).
 */
export function ciPassed(model) {
  const c = model && model.ciCounts;
  if (!c || !c.x || model.ci === 'none') return '';
  return ` · ${c.y} of ${c.x} workflow${c.x === 1 ? '' : 's'} passed${c.z ? `, ${c.z} running` : ''}`;
}
/** The whole line, as Details draws it ("not available" with no model yet). */
export const ciWords = (project, model) => `CI on ${project.defaultBranch}: ${model ? model.ci : NOT_AVAILABLE}${ciPassed(model)}`;

export function v25Rows(project, model, snap, nowMs, tz) {
  // A tree not read yet: every row "not available", never a zero or "not recorded" (the Design reviewer's B2).
  const read = Boolean(snap && snap.tree);
  const tree = read ? snap.tree : new Map();
  const ledger = snap && snap.records ? snap.records.get('docs/LEDGER.md') : undefined;
  let latest;
  if (!read) latest = NOT_AVAILABLE;
  else if (!tree.has('docs/LEDGER.md')) latest = NOT_RECORDED;
  else if (!ledger) latest = NOT_AVAILABLE;
  else latest = ledger.id ? [ledger.id, ledger.date ? reachedDateWords(ledger.date, nowMs, tz) : 'date not recorded', ledger.title].join(' · ') : NOT_RECORDED;
  const specs = [...tree.keys()].filter((p) => SPEC_PATH_RE.test(p) && !p.startsWith('specs/_')).length;
  const entries = !tree.has('docs/LEDGER.md') ? NOT_RECORDED : ledger && Number.isInteger(ledger.count) ? `${ledger.count} ledger entr${ledger.count === 1 ? 'y' : 'ies'}` : `ledger entries ${NOT_AVAILABLE}`;
  const has = (prefix) => [...tree.keys()].some((p) => p.startsWith(prefix));
  const notUsed = [
    { title: 'Phases, gates and standard milestones', words: "They come with the v3 pipeline. This project runs the older pipeline's sprints and ledger." },
    { title: 'The Timeline', words: 'Also v3. Its sprints are the strip above.' },
  ];
  if (read && !has('questions/') && !has('queue/')) notUsed.push({ title: 'Questions and cards', words: 'No questions or queue folder: it asks you through pull requests.' });
  if (read && !has('dispatch-log/')) notUsed.push({ title: 'Agent runs', words: 'No dispatch log.' });
  return {
    ci: `CI on ${project.defaultBranch}: ${model && model.ci ? model.ci : read ? NOT_RECORDED : NOT_AVAILABLE}${ciFrom(model, nowMs, tz)}`,
    latest,
    records: read ? `${entries} · ${specs} spec${specs === 1 ? '' : 's'}` : NOT_AVAILABLE,
    notUsed,
  };
}
