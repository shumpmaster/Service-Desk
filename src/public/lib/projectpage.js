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
import { NOT_RECORDED, NOT_AVAILABLE, deskWords, standardWord, hasWorkFiled, reachedDateWords, PHASES_READING, PHASES_NOT_AVAILABLE } from './sandbox.js';
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
  milestonesHead: (n) => `Milestones by phase · yours and the model's ${n}`,
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
  yours: 'Yours',
  standardOf: (n) => `The model's standard ${n === 1 ? 'one' : NUMBER_WORDS[n] || n}`,
  notUsed: 'Not used by this project',
  olderPipeline: 'older pipeline',
  ledgerLatest: 'Latest in the ledger',
  records: 'Records',
});
const NUMBER_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

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
 * ahead", "planned", or "not recorded" (AC57's states, J11). Done is not a column. A v2.5 project's
 * strip holds its last four sprints instead, "closed" or "open" (frame 8; J9). Untracked: { tracked:
 * false, words }.
 */
export function phaseStrip(ctx, snap) {
  const { project, pv } = ctx;
  if (project.model !== 'v3') {
    const s = sprintStrip(snap);
    if (!s.tracked) return { tracked: false, words: s.words };
    const W = { now: 'open', done: 'closed', unrec: 'not read yet' };
    return { tracked: true, sprints: true, cells: s.rows[0].cells.map((c) => ({ phase: c.id, cls: null, icon: c.icon, bar: 'solid', words: W[c.state], now: c.state === 'now' })) };
  }
  if (!ctx.tl || !pv || !pv.tracked) return { tracked: false, words: pv && pv.why ? pv.why : 'Phases not tracked' };
  const cells = DESK_PHASES.map((phase) => {
    const runs = ctx.cols.runs.filter((r) => r.phase === phase);
    const cell = { phase, cls: PHASE_CLASS[phase], icon: 'unrec', bar: 'dashed', words: NOT_RECORDED, now: false };
    if (pv.done) return { ...cell, icon: 'check', bar: 'solid', words: 'finished' };
    if (!ctx.now || !runs.length) return cell;
    const st = (r) => ctx.state.get(r);
    const nowRun = runs.find((r) => st(r) === 'now');
    if (nowRun) return { ...cell, icon: 'half', bar: 'solid', words: `run ${ctx.cols.k.get(nowRun)} · now`, now: true };
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
 * recorded>". Returns [{ key, words, quote, source }]: `quote` (the record's reason, quoted) and
 * `source` ({ words, href }) only where a record gives the reason.
 */
export function ranAgainLines(ctx, tz, bandOf = null) {
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
    if (b.quote) out.push({ key, words: `${lead}“${b.quote}”`, quote: b.quote, source: b.source });
    else if (b.plain) out.push({ key, words: `${lead}${b.plain} (${b.code})`, quote: null, source: b.source });
    else if (b.reading) out.push({ key, words: `${lead}${NOT_AVAILABLE} yet`, quote: null, source: b.source });
    else out.push({ key, words: `${lead}${NOT_RECORDED}`, quote: null, source: null, missing: true });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Milestones by phase (AC83, frames 5, 6 and 6b)

/** A list of standard ids in words: "Design-2 to Design-5" when they run on without a gap, else "Design-2, Design-4". */
export function idRange(ids) {
  if (ids.length <= 1) return ids.join('');
  const n = ids.map((id) => Number(/-(\d+)$/.exec(id)[1]));
  const runOn = n.every((x, i) => i === 0 || x === n[i - 1] + 1);
  return runOn ? `${ids[0]} to ${ids[ids.length - 1]}` : ids.join(', ');
}

/** A rough finish as a milestone's row says it (AC24's, where it gives one): "rough finish 22–25 Oct", "only your acceptance remains", or null. */
export function finishWords(f, { label = true } = {}) {
  if (!f || f.na || !f.words) return null;
  if (f.accept) return f.words;
  return label ? `rough finish ${f.words}` : f.words;
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
 * One standard milestone (AC83): reached, taken on, skipped (each with its why where its line gives
 * one), not reached, not needed; or, with no state recorded, one of the three states told apart: not
 * used by this project ("skipped · why: …"), not recorded yet (a dashed circle with "?"), and no record
 * in the model (a slashed circle), for the standard milestones the model's trace never reads.
 */
function stdRow(ctx, run, s, old) {
  const plan = ctx.standard[s.id] || null;
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
  // Taken on by its line, with no state in the model's records yet: its line's words (AC83: "never shown as missing").
  if (plan && plan.state === 'taken on') return { ...base, icon: 'planned', state: 'taken on', words: `taken on${why}`, soft: true };
  if (NOT_RECORDED_IDS.has(s.id)) return { ...base, icon: 'nomodel', state: 'no record', words: 'no record for this in the model yet', soft: true };
  return { ...base, icon: 'unrec', state: 'not recorded', words: 'not recorded yet', soft: true };
}

/**
 * Milestones by phase (AC83): one line per phase, read from the bottom up (Launch at the top,
 * Discovery at the foot), each { phase, cls, word, detail, runs, whyOnce }:
 * - word, at the right: "planned", "run <k> ahead", "run <k> · now", "finished" (or "not recorded");
 * - detail: { yours, earlier, std: { bold, rest } }, "Yours: <each own milestone's id, with "reached",
 *   "in progress" or nothing> · run <k>: <earlier runs' reached ones> reached · Standard: <k> of <n>
 *   <reached | recorded>" ("0 of <n>, not recorded yet" when none of its lines exists);
 * - runs, opened: the latest first, { k, head, latest, own (the first at the foot), std (`<Phase>-1` at
 *   the foot), gathered }; earlier runs smaller, their standard milestones gathered where none was
 *   recorded ("Design-2 to Design-5 · not recorded, or no record in the model").
 * - whyOnce: where at least one of the phase's standard milestones has no why written yet, the one
 *   line saying so (P-001-why-line.md, A).
 * `finishOf(code)` gives AC24's rough finish for one of the project's own milestones; `bandOf(run)`
 * the Timeline's band for a run (its label, frame 7b's dates).
 */
export function milestonesByPhase(ctx, { finishOf = null, bandOf = null, ruled = false } = {}) {
  const { project, pv } = ctx;
  if (project.model !== 'v3' || !ctx.tl || !pv || !pv.tracked) return { tracked: false, words: pv && pv.why ? pv.why : 'Phases not tracked' };
  const lines = LIST_TOP_DOWN.map((phase) => {
    const runs = ctx.cols.runs.filter((r) => r.phase === phase);
    const st = (r) => ctx.state.get(r);
    const n = STANDARD_COUNT[phase];
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
    // The line of detail.
    const own = latest ? [...latest.project].sort((a, b) => a.lineno - b.lineno) : [];
    const ownWord = (r, m) => (m.dropped ? ' dropped' : m.reached ? ' reached' : hasWorkFiled(r, m) ? ' in progress' : '');
    const yours = own.length ? own.map((m) => `${m.id}${ownWord(latest, m)}`).join(', ') : null;
    const earlier = runs.slice(0, -1).map((r) => ({ k: ctx.cols.k.get(r), ids: [...r.project].sort((a, b) => a.lineno - b.lineno).filter((m) => m.reached && !m.dropped).map((m) => m.id) }))
      .filter((e) => e.ids.length).map((e) => `run ${e.k}: ${e.ids.join(', ')} reached`);
    const ids = STANDARD_MILESTONES.filter((m) => m[1] === phase).map((m) => m[0]);
    const lines3 = ids.map((id) => ctx.standard[id]).filter(Boolean);
    const skipped = lines3.filter((l) => l.state === 'skipped').length;
    const takenOn = lines3.filter((l) => l.state === 'taken on').length;
    const states = latest ? latest.standard.map((s) => standardWord(s.state)) : [];
    const reached = states.filter((w) => w === 'reached' || w === 'carried over').length;
    const recorded = states.filter((w) => w !== 'not recorded').length;
    const everRun = runs.some((r) => st(r) && st(r) !== 'still to come' && st(r) !== 'not recorded');
    let std;
    if (reached > 0) std = { bold: `${reached} of ${n}`, rest: ` reached${skipped ? `, ${skipped} skipped` : ''}` };
    else if (!everRun) {
      const extras = [takenOn ? `${takenOn} taken on` : null, skipped ? `${skipped} skipped` : null].filter(Boolean);
      std = { bold: `0 of ${n}`, rest: extras.length ? `, ${extras.join(', ')}` : ', not recorded yet' };
    } else std = { bold: `${recorded} of ${n}`, rest: ` recorded${skipped ? `, ${skipped} skipped` : ''}` };
    // Opened: each run, the latest first.
    const runViews = [...runs].reverse().map((r, i) => {
      const isLatest = i === 0;
      const k = ctx.cols.k.get(r);
      const band = bandOf ? bandOf(r) : null;
      const head = `Run ${k} · ${band && band.label ? band.label : st(r) === 'still to come' ? 'planned' : ({ now: 'now', finished: 'finished', 'gone back over': 'gone back over' }[st(r)] || NOT_RECORDED)}`;
      const ownRows = [...r.project].sort((a, b) => a.lineno - b.lineno).map((m) => ownRow(ctx, r, m, isLatest ? finishOf : null, !isLatest)).reverse();
      let stdRows = r.standard.map((s) => stdRow(ctx, r, s, !isLatest));
      let gathered = null;
      if (!isLatest) {
        const gone = stdRows.filter((x) => x.state === 'not recorded' || x.state === 'no record');
        if (gone.length) {
          const both = gone.some((x) => x.state === 'no record') && gone.some((x) => x.state === 'not recorded');
          const w = both ? 'not recorded, or no record in the model' : gone[0].state === 'no record' ? 'no record for this in the model yet' : 'not recorded';
          gathered = { ids: gone.map((x) => x.id), words: `${idRange(gone.map((x) => x.id))} · ${w}` };
          stdRows = stdRows.filter((x) => !gone.includes(x));
        }
      }
      return { k, key: `${r.phase}-i${r.iteration}`, head, latest: isLatest, own: ownRows, std: [...stdRows].reverse(), stdCount: r.standard.length, gathered };
    });
    const noWhy = ids.some((id) => !(ctx.standard[id] && ctx.standard[id].why));
    const whyOnce = noWhy ? `Why each is taken on or skipped: not written yet. ${project.name}'s Chief of Staff writes its lines${ruled ? ' (your ruling, P-001-standard-milestones)' : ''}.` : null;
    return { phase, cls: PHASE_CLASS[phase], word, now: word.endsWith('· now'), detail: { yours, earlier, std }, runs: runViews, whyOnce };
  });
  return { tracked: true, n: STANDARD_TOTAL, lines };
}

/** The detail line in words, as one string (its bold part included): for assistive technology and the tests. */
export function detailWords(d) {
  const parts = [];
  if (d.yours) parts.push(`Yours: ${d.yours}`);
  parts.push(...d.earlier);
  parts.push(`Standard: ${d.std.bold}${d.std.rest}`);
  return parts.join(' · ');
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
