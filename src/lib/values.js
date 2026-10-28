// The value targets shown (spec S-001, AC97; J25; stage VT1 of "The desk's value targets shown: M3B"): the Chief of
// Staff's weekly value check (J25, intake/value-checks.jsonl), the goals of the planning project's five targets, the
// launch and the 14 days after it, and what the project page's "Value targets" row and its sheet show for each target:
// its figure, its small chart against its goal line, its good or bad mark in words, and the Chief of Staff's check.
// Pure: from one project's section 6 and 3 (J11), the J25 lines read, AC21's waits and the clock; the page
// (public/sandbox.js) only draws what these return.
//
// The rules: every figure is the record's or worked out from the records the desk reads; nothing is guessed and an
// unmeasured target never reads as 0 (AC41, AC97). No date of the desk's own shows before launch (P-001-m3b-launch-date.md,
// A). The goals are fixed here for the planning project's five, each with the section 6 line it comes from, which a test
// checks against the project document (AC97, "The goals": a reworded line fails the build until the goal follows).

import { dayKey, countedMs, median, zonedToUtc } from './timefmt.js';
import { validDate } from './j11.js';
import { cardRows, notReadText } from './asked.js';

export const VALUE_CHECKS_PATH = 'intake/value-checks.jsonl';
export const CHECK_STATES = ['on track', 'met', 'missed', 'not measured'];
const KEYS = ['time', 'project', 'target', 'from', 'to', 'figure', 'value', 'state', 'source', 'session'];
const SKEW_MS = 10 * 60_000;
const MAX_VALUE = 100_000;
const DAY = 86400e3;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---------------------------------------------------------------------------
// J25: the weekly value check's lines

const ISO_UTC_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|\+00:00)$/;
/** A time whose fields are a real moment (as J14's reader has it): no 30 Feb, no 24:00. */
const realTime = (s) => {
  const ms = Date.parse(s);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 19) === s.slice(0, 19);
};

/**
 * The value check file's lines (J25's form), read without the clock or J7, so the page caches them by sha:
 * [{ n (1-based), ok, e: { time (ms), timeText, project, target, from, to, figure, value, state, source, session }, why,
 * project?, target? }]. Blank lines are passed over. A line is malformed when it is not one JSON object, a key is missing
 * or extra (`value` among them: a line without it is malformed), or a value is of the wrong kind or out of its form.
 */
export function parseValueChecks(text) {
  const out = [];
  String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n').forEach((raw, i) => {
    if (!raw.trim()) return;
    const n = i + 1;
    let v;
    try {
      v = JSON.parse(raw);
    } catch {
      out.push({ n, ok: false, why: 'not one JSON object' });
      return;
    }
    if (!v || typeof v !== 'object' || Array.isArray(v)) {
      out.push({ n, ok: false, why: 'not one JSON object' });
      return;
    }
    const named = { project: typeof v.project === 'string' && v.project ? v.project : null, target: typeof v.target === 'string' && v.target ? v.target : null };
    const bad = (why) => out.push({ n, ok: false, why, ...named });
    const keys = Object.keys(v);
    const missing = KEYS.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !KEYS.includes(k));
    if (missing.length) return bad(`missing ${missing.join(', ')}`);
    if (extra.length) return bad(`an extra key: ${extra.join(', ')}`);
    if (typeof v.time !== 'string' || !ISO_UTC_RE.test(v.time) || !realTime(v.time)) return bad('its time is not a UTC time ending Z or +00:00');
    if (!named.project) return bad('its project is not a name');
    if (!named.target) return bad('its target is not an id');
    if (typeof v.from !== 'string' || typeof v.to !== 'string' || !validDate(v.from) || !validDate(v.to)) return bad('its from and to are not real dates (yyyy-mm-dd)');
    if (v.from > v.to) return bad('its from is after its to');
    if (typeof v.figure !== 'string' || !v.figure.trim()) return bad('its figure is not words');
    if (v.figure.length > 60) return bad('its figure is over 60 characters');
    if (v.figure.includes(' · ')) return bad('its figure holds " · "');
    if (v.value !== null && !(Number.isInteger(v.value) && v.value >= 0 && v.value <= MAX_VALUE)) return bad('its value is not a whole number from 0 to 100,000, or null');
    if (!CHECK_STATES.includes(v.state)) return bad('its state is not on track, met, missed or not measured');
    if (typeof v.source !== 'string' || !v.source.trim()) return bad('its source is not words');
    if (typeof v.session !== 'string' || !v.session.trim()) return bad('its session is not a string');
    out.push({ n, ok: true, e: { time: Date.parse(v.time), timeText: v.time, project: v.project, target: v.target, from: v.from, to: v.to, figure: v.figure,
      value: v.value, state: v.state, source: v.source, session: v.session } });
  });
  return out;
}

export const targetKey = (project, id) => `${project}|${id}`;
/** The planning project's targets whose line must carry a number (J25: a `null` value with another state is malformed). */
const NUMBERED = new Set(['V1', 'V2', 'V3', 'V5']);

/**
 * Each target's checks (J25): its readable lines in file order, the last its latest check, the rest its history.
 * input: { lines (parseValueChecks'), nowMs, projects (J7's), targetsOf(name) → Set of section 6's ids, or null where
 * section 6 is not read }. Returns { checks: Map(key → [{ ...e, n }]), unreadable: Map(key → n) (a newer line for it
 * could not be read), notes: [string] (the planning project's notes, "value checks line <n>: <reason>") }.
 */
export function readValueChecks({ lines, nowMs, projects, targetsOf = () => null }) {
  const checks = new Map();
  const unreadable = new Map();
  const notes = [];
  let latestSoFar = null;
  for (const l of lines || []) {
    const pName = l.e ? l.e.project : l.project;
    const id = l.e ? l.e.target : l.target;
    const mark = (why) => {
      notes.push(`value checks line ${l.n}: ${why}`);
      // J25: "when its project and target can be read, that target's measure adds 'a newer check could not be read'".
      if (pName != null && id != null) unreadable.set(targetKey(pName, id), l.n);
    };
    if (!l.ok) {
      mark(l.why);
      continue;
    }
    const e = l.e;
    if (e.time > nowMs + SKEW_MS) {
      mark("its time is more than 10 minutes after the page's clock");
      continue;
    }
    const proj = (projects || []).find((p) => p && p.name === e.project);
    if (!proj) {
      mark(`${e.project} is not a connected project`);
      continue;
    }
    if (proj.planning === true && NUMBERED.has(e.target) && e.value === null && e.state !== 'not measured') {
      mark(`its value is null with the state ${e.state}: only a not measured line has no number`);
      continue;
    }
    if (latestSoFar && e.time < latestSoFar.time) notes.push(`value checks line ${l.n} is dated before line ${latestSoFar.n}`);
    if (!latestSoFar || e.time >= latestSoFar.time) latestSoFar = { n: l.n, time: e.time };
    if (proj.model !== 'v3') {
      notes.push(`value checks line ${l.n}: ${e.project} is a v2.5 project, which shows no value targets`);
      continue;
    }
    const held = targetsOf(e.project);
    if (held && !held.has(e.target)) {
      notes.push(`value checks line ${l.n}: ${e.project}'s section 6 has no target ${e.target}`);
      continue;
    }
    const k = targetKey(e.project, e.target);
    if (!checks.has(k)) checks.set(k, []);
    checks.get(k).push({ ...e, n: l.n });
    unreadable.delete(k);
  }
  return { checks, unreadable, notes };
}

// ---------------------------------------------------------------------------
// The goals (AC97, "The goals"), fixed for the planning project's five, each with the section 6 line it comes from
// as CS36 left it (7b69b2b).

export const GOALS = Object.freeze({
  V1: { name: 'Missed decisions', words: 'none missed in the 14 days', kind: 'total', max: 0, scale: 3, tick: 0, at: '0', label: 'goal 0',
    line: 'V1: Missed decisions: items waiting on the owner in a connected project that the desk did not show within 5 minutes, 0 over the first 14 days after launch' },
  V2: { name: 'False alarms', words: 'at most 1 a week', kind: 'weekly', max: 1, scale: 3, tick: 1, at: '33', label: 'goal ≤ 1',
    line: 'V2: False alarms: items the desk flagged that did not need the owner, at most 1 a week over the first 14 days after launch' },
  V3: { name: 'Your upkeep', words: 'at most 30 minutes a week', kind: 'weekly', max: 30, scale: 60, tick: 30, at: '50', label: 'goal ≤ 30m', minutes: true,
    line: 'V3: Owner upkeep: the owner\'s time on the desk itself (tokens, settings, adding repositories), at most 30 minutes a week after launch' },
  V4: { name: 'Replacement', words: 'both at launch', kind: 'steps',
    line: 'V4: Replacement: the desk serves the Operations-Hub address and the old repository is archived, at launch' },
  V5: { name: 'Your response time', words: 'under 4h', kind: 'median', under: 240, scale: 480, tick: 240, at: '50', label: 'goal < 4h',
    line: 'V5: Owner response time: the median time from a card appearing in a connected project to its answer being committed, counting only 07:00 to 22:00 Monday to Friday (America/Chicago), with a card still open at the window\'s end counted at its wait so far, tracked and shown on the desk, under 4 hours, over the first 14 days after launch' },
});

// ---------------------------------------------------------------------------
// Launch and the 14 days (AC97, "Launch and the 14 days"; "When a weekly check is due")

const keyMs = (k) => Date.UTC(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, Number(k.slice(8, 10)));
const msKey = (ms) => new Date(ms).toISOString().slice(0, 10);
export const addDays = (k, n) => msKey(keyMs(k) + n * DAY);
/** The Wednesday after the Monday-to-Sunday week holding a day: that week's check is due by its end. */
export function dueOf(k) {
  const wd = (new Date(keyMs(k)).getUTCDay() + 6) % 7; // Monday 0 … Sunday 6
  return addDays(k, 6 - wd + 3);
}
/** "3 Dec": a day in words, as the desk writes a date (no year). */
export const dayWords = (k) => `${Number(k.slice(8, 10))} ${MONTHS[Number(k.slice(5, 7)) - 1]}`;
/** "3 – 6 Dec", "28 Nov – 4 Dec", or one date when both are the same day (P-001-m3b-picture-small.md, A, (d)). */
export function rangeWords(a, b) {
  if (a === b) return dayWords(a);
  if (a.slice(0, 7) === b.slice(0, 7)) return `${Number(a.slice(8, 10))} – ${dayWords(b)}`;
  return `${dayWords(a)} – ${dayWords(b)}`;
}

/** Launch: the date M3C's line in section 3 carries in ` · reached:` (J11), or null. */
export function launchOf(doc) {
  const m = doc && Array.isArray(doc.milestones) ? doc.milestones.find((x) => x && x.id === 'M3C') : null;
  return m && m.reached && validDate(m.reached) ? m.reached : null;
}

/** The window's days from a launch day: L, W1 (the day after), WN (the 14th day after), D1 and DN (the checks' due days). */
export function windowDays(L) {
  if (!L) return null;
  const W1 = addDays(L, 1);
  const WN = addDays(L, 14);
  return { L, W1, WN, D1: dueOf(W1), DN: dueOf(WN) };
}

/** Where today stands: 'before' (no reached date, or today before it), 'launch', 'window' (W1 to WN) or 'after'. */
export function phaseOf(today, days) {
  if (!days || today < days.L) return 'before';
  if (today === days.L) return 'launch';
  if (today <= days.WN) return 'window';
  return 'after';
}

/** A day's start in the zone, as a time. */
const dayStart = (k, tz) => zonedToUtc(Number(k.slice(0, 4)), Number(k.slice(5, 7)), Number(k.slice(8, 10)), 0, 0, tz);

// ---------------------------------------------------------------------------
// V5's figure (AC21's computation): before W1 AC21's own; in the window and after it, the cards raised in it

/**
 * V5's figure. input: { phase, days, projects: [{ name, v3, readOk, model, tree }] (every connected project), nowMs, config }.
 * Returns { ms (the median) | null, k (the cards), words (AC21's words where there is no figure), gone (the log months J2
 * reads no longer cover the window) }.
 */
export function v5Figure({ phase, days, projects, nowMs, config }) {
  const v3 = (projects || []).filter((p) => p.v3);
  const waiting = v3.filter((p) => !p.readOk || !p.model || !p.model.logLoaded).map((p) => p.name);
  const notRead = waiting.length ? notReadText(waiting) : null;
  const tz = config.ownerTimeZone;
  if (phase === 'before' || phase === 'launch') {
    if (notRead) return { ms: null, k: 0, words: `Median answer time, weekday cards, last 14 days: ${notRead}`, gone: false };
    const waits = v3.flatMap((p) => p.model.v5Waits || []);
    if (!waits.length) return { ms: null, k: 0, words: 'Median answer time, weekday cards, last 14 days: no weekday cards in the last 14 days', gone: false };
    return { ms: median(waits), k: waits.length, words: null, gone: false };
  }
  const start = dayStart(days.W1, tz);
  const end = dayStart(addDays(days.WN, 1), tz);
  // The dispatch-log months J2 reads (the current one and the one before, UTC; model.js logMonths): the window's
  // first day before them, and its cards are no longer read.
  const now = new Date(nowMs);
  const prevStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1);
  const head = phase === 'window' ? 'Median, live so far' : `Median, ${rangeWords(days.W1, days.WN)}`;
  if (start < prevStart) return { ms: null, k: 0, words: null, gone: true };
  if (notRead) return { ms: null, k: 0, words: `${head}: ${notRead}`, gone: false };
  const waits = [];
  for (const p of v3) {
    const rows = cardRows(p.model.allEntries || [], p.tree || new Map(), nowMs, Infinity);
    for (const r of rows) {
      if (r.raisedAt < start || r.raisedAt >= end) continue;
      // A card open at the window's end, or answered after it, counted at its wait to that end (V5's line).
      if (r.state === 'answered') waits.push(countedMs(r.raisedAt, Math.min(r.answeredAt, end), config.v5Clock, tz));
      else if (r.state === 'open') waits.push(countedMs(r.raisedAt, Math.min(nowMs, end), config.v5Clock, tz));
    }
  }
  if (!waits.length) return { ms: null, k: 0, words: `${head}: no weekday cards`, gone: false };
  return { ms: median(waits), k: waits.length, words: null, gone: false };
}

// ---------------------------------------------------------------------------
// The words (AC97)

export const VALUES_WORDS = Object.freeze({
  smallPlanning: 'From the project document, section 6 · weekly checks by your Chief of Staff',
  smallOther: 'From the project document, section 6',
  j25: (s) => `Weekly checks: ${s === 'failed' ? 'not available' : 'not read yet'}`,
  whole: 'The whole target',
  earlier: (k) => `${k} earlier check${k === 1 ? '' : 's'}`,
  stopHead: 'Miss and stop rule',
  newer: 'a newer check could not be read',
  windowWords: 'first 14 days',
});
const cosLine = (dateK, state) => `Your Chief of Staff's check, ${dayWords(dateK)}: ${state}`;
const cap = (w) => (w ? w[0].toUpperCase() + w.slice(1) : w);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
/**
 * A median in the approved picture's form, "2h 05m" (round 2's images; AC97's "4h 00m"): whole minutes, rounded as AC21's
 * line rounds them (sandbox.js, v5Line) for AC21's own figure before W1, and cut to the whole minute from W1, where the desk
 * judges it, so a median the words call "3h 59m" is always within and "4h 00m" never is.
 */
export function hm(ms, round = false) {
  const m = round ? Math.round(ms / 60000) : Math.floor(ms / 60000);
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
}

/** A bar's value in words, in Plex Mono at its right: "2", "20m", "2h 20m"; past the scale, "6, past the scale". */
function barValue(v, goal, past) {
  const w = goal.minutes ? `${v}m` : goal.kind === 'median' ? hm(v * 60000) : String(v);
  return past ? `${w}, past the scale` : w;
}
/** One bar against a target's scale: { label, value (words), width (0 to 100), zero, past, fill }. `v` in the target's unit (V5 in minutes). */
function bar(label, v, goal, fill) {
  const past = v > goal.scale;
  return { label, value: barValue(v, goal, past), width: past ? 100 : (v / goal.scale) * 100, zero: v === 0, past, fill };
}
const chartOf = (goal, bars) => ({ at: goal.at, label: goal.label, bars });

/** A J25 line's day in the zone. */
const dateOfLine = (l, tz) => dayKey(new Date(l.time), tz);

/**
 * Lines that count once each: a later line covering exactly the same days as an earlier one is its re-check and takes
 * its place (J25: "two checks of one target, the second counting"), so a week never counts twice.
 */
function weeksOf(lines) {
  const by = new Map();
  for (const l of lines) by.set(`${l.from}|${l.to}`, l);
  return [...by.values()];
}

/** The verdict words, "Within target" or "Outside target", with " so far" in the window. */
const verdictWords = (within, phase) => `${within ? 'Within' : 'Outside'} target${phase === 'window' ? ' so far' : ''}`;

/**
 * The check's mark over the desk's verdict (P-001-m3b-disagree.md, A): the latest window line's `met` or `missed` sets the
 * mark and the verdict's first part; with `on track` or `not measured`, or none, the desk's own verdict is the mark and no
 * difference line shows. Where `met` stands against outside, or `missed` against within: "The desk's own reading: …".
 */
function withCheck(t, check, desk, tz) {
  if (!check) return t;
  t.lines.push(cosLine(dateOfLine(check, tz), check.state));
  if (check.state === 'met' || check.state === 'missed') {
    const met = check.state === 'met';
    t.mark = met ? 'check' : 'cross';
    t.verdict = { ...t.verdict, mark: t.mark, first: met ? 'Met' : 'Missed' };
    if (desk && desk.within !== null && desk.within !== met) t.lines.push(`The desk's own reading: ${desk.words.toLowerCase()}`);
  }
  return t;
}

/**
 * The final check saying `not measured` (draft 11): the target's latest line, its `to` on or after WN, in the window (on WN
 * itself) or after it. An earlier week's `not measured` line, the final check not in, keeps draft 10's rule, the desk's
 * verdict the mark.
 */
const finalNotMeasured = (check, days) => Boolean(check && check.state === 'not measured' && days && check.to >= days.WN);
/**
 * A latest window line saying `not measured` sets the planned ring: with no figure of the desk's own, and, on the final check,
 * even with one (the owner's answer "Grey ring (Recommended)", B, decisions/questions/P-001-m3b-not-measured-mark.md), the
 * figure and its chart still shown, every bar grey `--ink3`, judged by no one. Its line, "Not measured · your Chief of Staff's
 * check, <date>", takes the place of the check line; no difference line, the check having made no judgment to differ from.
 */
function notMeasured(t, check, goalLine, tz) {
  t.mark = 'planned';
  t.verdict = { mark: 'planned', first: 'Not measured', second: `your Chief of Staff's check, ${dayWords(dateOfLine(check, tz))}` };
  if (t.chart) t.chart = { ...t.chart, bars: t.chart.bars.map((b) => ({ ...b, fill: 'grey' })) };
  t.lines = t.lines.filter((l) => !l.startsWith('Weekly check:'));
  t.lines.push(goalLine);
  return t;
}

/**
 * The targets of a v3 project's section 6, each as the sheet shows it, and the row (AC97). input: { project, doc (J11's
 * parse of docs/PROJECT.md), planning (the project J7 marks `"planning": true`), j25: { state: 'ok' | 'none' | 'pending' |
 * 'failed', checks, unreadable } (readValueChecks', for every project), v5In ({ projects, config }: v5Figure's input less
 * the phase, the planning project only), nowMs, tz }. Returns null where section 6 holds no `V<n>:` line.
 */
export function valuesView({ project, doc, planning, j25, v5In = null, nowMs, tz }) {
  const lines = doc && Array.isArray(doc.valueLines) ? doc.valueLines : [];
  if (!lines.length) return null;
  const today = dayKey(new Date(nowMs), tz);
  const known = j25 && (j25.state === 'ok' || j25.state === 'none');
  const unknownWord = j25 && j25.state === 'failed' ? 'not available' : 'not read yet';
  const linesOf = (id) => (known && j25.checks && j25.checks.get(targetKey(project.name, id))) || [];
  const newerOf = (id) => Boolean(known && j25.unreadable && j25.unreadable.has(targetKey(project.name, id)));
  const nameOf = (l) => {
    const rest = l.text.slice(l.id.length + 1).trim();
    const i = rest.indexOf(':');
    return i > 0 ? rest.slice(0, i).trim() : rest;
  };
  const earlierOf = (all, shown) => all.filter((x) => x !== shown).reverse()
    .map((x) => `${dayWords(dateOfLine(x, tz))}: ${x.figure}, ${rangeWords(x.from, x.to)} · ${x.state}`);
  const stop = doc && doc.stopRule ? doc.stopRule : null;

  if (!planning) {
    // Other projects (P-001-m3b-other-goals.md, A): each target's id and the name before its line's second colon, the
    // figure of its latest J25 line with its dates, no chart and no live verdict, the Chief of Staff's state as its mark.
    const targets = lines.map((l) => {
      const all = linesOf(l.id);
      const latest = all.length ? all[all.length - 1] : null;
      const t = { id: l.id, name: nameOf(l), quote: l.text, figure: null, aside: null, chart: null, steps: null, lines: [], earlier: [], newer: newerOf(l.id), latest };
      if (!known) {
        t.mark = null;
        t.verdict = { mark: null, first: cap(unknownWord), second: null };
        return t;
      }
      if (!latest) {
        t.mark = 'planned';
        t.verdict = { mark: 'planned', first: 'Not measured yet', second: 'weekly check not recorded yet' };
      } else {
        t.figure = { big: latest.figure, words: rangeWords(latest.from, latest.to), text: true };
        t.mark = { met: 'check', missed: 'cross', 'on track': 'half', 'not measured': 'planned' }[latest.state];
        t.verdict = { mark: t.mark, first: cap(latest.state), second: `your Chief of Staff's check, ${dayWords(dateOfLine(latest, tz))}` };
        t.earlier = earlierOf(all, latest);
      }
      return t;
    });
    return { planning: false, phase: null, days: null, small: VALUES_WORDS.smallOther, j25Line: known ? null : VALUES_WORDS.j25(j25 && j25.state), targets,
      row: otherRow(targets, known, unknownWord), stop };
  }

  const days = windowDays(launchOf(doc));
  const phase = phaseOf(today, days);
  const v5 = v5In ? v5Figure({ phase, days, projects: v5In.projects, nowMs, config: v5In.config }) : null;
  const isWindowLine = (id, x) => id === 'V4' || (days && x.to >= days.W1);
  const latestWindow = (id) => {
    if (phase === 'before') return null;
    const w = linesOf(id).filter((x) => isWindowLine(id, x));
    return w.length ? w[w.length - 1] : null;
  };
  const targets = lines.map((l) => {
    const goal = GOALS[l.id] || null;
    const all = linesOf(l.id);
    const check = latestWindow(l.id);
    const t = { id: l.id, name: goal ? goal.name : nameOf(l), quote: l.text, figure: null, aside: null, chart: null, steps: null, lines: [], earlier: [], newer: newerOf(l.id),
      latest: all.length ? all[all.length - 1] : null, check };
    if (goal && goal.kind === 'steps') return v4Target(t, { phase, days, known, unknownWord, check, tz, all, earlierOf });
    if (goal && goal.kind === 'median') return v5Target(t, goal, { phase, days, known, check, v5, tz, all, earlierOf });
    if (!goal) {
      // A target section 6 adds beyond the five has no goal the desk reads: its check's state only, as another project's.
      if (!known && phase !== 'before') return { ...t, mark: null, verdict: { mark: null, first: cap(unknownWord), second: null } };
      if (!check) return { ...t, mark: 'planned', verdict: { mark: 'planned', first: 'Not measured yet', second: 'weekly check not recorded yet' } };
      t.mark = { met: 'check', missed: 'cross', 'on track': 'half', 'not measured': 'planned' }[check.state];
      t.figure = { big: check.figure, words: rangeWords(check.from, check.to), text: true };
      t.verdict = { mark: t.mark, first: cap(check.state), second: `your Chief of Staff's check, ${dayWords(dateOfLine(check, tz))}` };
      t.earlier = earlierOf(all, check);
      return t;
    }
    return countTarget(t, goal, { phase, days, today, known, unknownWord, check, tz, all, earlierOf, linesOf });
  });
  const row = planningRow({ targets, phase, days, today, known, unknownWord, linesOf, isWindowLine });
  return { planning: true, phase, days, small: VALUES_WORDS.smallPlanning, j25Line: known ? null : VALUES_WORDS.j25(j25 && j25.state), targets, row, stop };
}

/** V1, V2 and V3 (AC97's two tables): their figure, chart and verdict by phase. */
function countTarget(t, goal, { phase, days, today, known, unknownWord, check, tz, all, earlierOf, linesOf }) {
  const goalLine = `Goal: ${goal.words}`;
  if (phase === 'before') {
    t.mark = 'planned';
    t.verdict = { mark: 'planned', first: 'Not measured yet', second: 'measured from launch' };
    t.lines.push(goalLine);
    return t;
  }
  if (!known) {
    // J25's read failed or not yet made: "not available" or "not read yet", with no figure, chart or mark.
    t.mark = null;
    t.verdict = { mark: null, first: cap(unknownWord), second: null };
    t.lines.push(goalLine);
    return t;
  }
  if (phase === 'launch') {
    t.mark = 'planned';
    t.verdict = { mark: 'planned', first: 'Not measured yet', second: `measured from ${dayWords(days.W1)}` };
    t.lines.push(goalLine);
    t.earlier = earlierOf(all, null);
    return t;
  }
  const windowLines = linesOf(t.id).filter((x) => x.to >= days.W1);
  const valued = weeksOf(windowLines.filter((x) => x.value !== null)).sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
  const after = phase === 'after';
  t.earlier = earlierOf(all, check);
  if (!valued.length) {
    // A recorded `not measured` (round 8, the Reviewer's B1; round 9, the Design reviewer's N1): a record that exists, so the
    // planned ring, never the dashed "?"; its line takes the place of the check line.
    if (check && check.state === 'not measured') return notMeasured(t, check, goalLine, tz);
    if (!after && today <= days.D1) {
      t.mark = 'planned';
      t.verdict = { mark: 'planned', first: 'Not measured yet', second: `first check due ${dayWords(days.D1)}` };
    } else {
      t.mark = 'unrec';
      t.verdict = { mark: 'unrec', first: 'Not measured yet', second: 'weekly check not recorded yet' };
    }
    t.lines.push(goalLine);
    return t;
  }
  let within;
  if (goal.kind === 'total') {
    const sum = valued.reduce((a, x) => a + x.value, 0);
    within = sum <= goal.max;
    const to = check ? check.to : valued[valued.length - 1].to;
    t.figure = { big: String(sum), words: `${after ? 'missed' : 'missed so far'}, ${rangeWords(days.W1, to)}` };
    t.chart = chartOf(goal, [bar(after ? rangeWords(days.W1, to) : 'So far', sum, goal, within ? 'ok' : 'bad')]);
  } else {
    // Week by week (P-001-m3b-weekly-red.md, A): outside if any week is over its goal; the big figure the worst week.
    within = valued.every((x) => x.value <= goal.max);
    let worst = valued[0];
    for (const x of valued) if (x.value > worst.value) worst = x;
    const dates = rangeWords(worst.from, worst.to);
    const one = valued.length === 1;
    if (goal.minutes) t.figure = { big: `${worst.value} min`, words: one ? `your estimate, ${dates}` : `a week at most, your estimate (${dates})` };
    // "1" "false alarm, …" and "1" "false alarm in a week, the most (…)" when the figure is 1 (draft 11).
    else t.figure = { big: String(worst.value), words: one ? `false alarm${worst.value === 1 ? '' : 's'}, ${dates}` : `false alarm${worst.value === 1 ? '' : 's'} in a week, the most (${dates})` };
    t.chart = chartOf(goal, valued.map((x) => bar(rangeWords(x.from, x.to), x.value, goal, x.value <= goal.max ? 'ok' : 'bad')));
  }
  // The final check (its `to` on or after WN) saying `not measured` sets the planned ring over the desk's figure
  // (P-001-m3b-not-measured-mark.md, B), after the window and on WN itself (draft 11, round 12); an earlier week's line, in the
  // window or after it while the final check is not in, keeps the desk's verdict the mark, the check line "not measured".
  if (finalNotMeasured(check, days)) return notMeasured(t, check, goalLine, tz);
  const words = verdictWords(within, phase);
  t.mark = within ? 'check' : 'cross';
  t.verdict = { mark: t.mark, first: words, second: `goal: ${goal.words}` };
  return withCheck(t, check, { within, words }, tz);
}

/** V4 (AC97): two steps, judged from launch day, never outside. */
function v4Target(t, { phase, days, known, unknownWord, check, tz, all, earlierOf }) {
  const goalWords = 'goal: both at launch';
  if (phase === 'before') {
    t.steps = [{ mark: 'planned', words: 'Serving the Operations-Hub address: not yet' }, { mark: 'planned', words: 'Old repository archived: not yet' }];
    t.mark = 'planned';
    t.verdict = { mark: 'planned', first: 'Not measured yet', second: goalWords };
    return t;
  }
  // The archive, by V4's latest line, whatever its dates (round 7, the Design reviewer's B3; draft 11, C, the Reviewer's Q2 and
  // Q3): `met`, archived, the step done; `missed`, "Old repository not archived" with ✕, beside the check's "Missed"; `on track`
  // or `not measured`, the step not done, as from launch day. So no V4 line but `met` reads as archived.
  const archive = known && check && check.state === 'met' ? check : null;
  const serving = { mark: 'check', words: `Serving the Operations-Hub address since ${dayWords(days.L)}` };
  if (archive) {
    t.steps = [serving, { mark: 'check', words: `Old repository archived ${dayWords(archive.from)}` }];
    t.figure = { big: '2 of 2', words: 'steps done at launch' };
    t.mark = 'check';
    t.verdict = { mark: 'check', first: 'Within target', second: goalWords };
  } else {
    let second = known ? { mark: 'planned', words: 'Old repository archived: your Chief of Staff checks it after launch' } : { mark: 'planned', words: `Old repository archived: ${unknownWord}` };
    if (known && check && check.state === 'missed') second = { mark: 'cross', words: 'Old repository not archived' };
    t.steps = [serving, second];
    t.figure = { big: '1 of 2', words: 'steps done' };
    t.mark = 'half';
    t.verdict = { mark: 'half', first: 'Under way', second: goalWords };
  }
  if (!known) return t;
  t.earlier = earlierOf(all, check);
  return withCheck(t, check, archive ? { within: true, words: 'Within target' } : null, tz);
}

/** V5 (AC97): AC21's figure in grey before W1, the desk's median judged from W1, with the weekly check's bar. */
function v5Target(t, goal, { phase, days, known, check, v5, tz, all, earlierOf }) {
  const f = v5 || { ms: null, k: 0, words: null, gone: false };
  const cards = (k) => plural(k, 'weekday card', 'weekday cards');
  const goalWords = `goal: ${goal.words}`;
  if (phase === 'before' || phase === 'launch') {
    // Before W1 nothing is judged (with V5 left grey: P-001-m3b-picture-approve.md, A).
    const label = phase === 'before' ? 'Before launch' : 'Launch day';
    if (f.ms != null) {
      t.figure = { big: hm(f.ms, true), words: `median, last 14 days, ${cards(f.k)}` };
      t.chart = chartOf(goal, [bar(label, Math.round(f.ms / 60000), goal, 'grey')]);
    } else t.aside = f.words;
    t.mark = 'planned';
    t.verdict = { mark: 'planned', first: `${label}, not counted`, second: goalWords };
    t.lines.push(phase === 'before' ? 'Measured over the first 14 days after launch' : `Measured over the 14 days from ${dayWords(days.W1)}`);
    return t;
  }
  const after = phase === 'after';
  const weekly = known && check && check.value !== null ? check : null;
  if (known) t.earlier = earlierOf(all, check);
  let ms = f.ms;
  let figWords = ms != null ? (after ? `median, ${rangeWords(days.W1, days.WN)}, ${cards(f.k)}` : `median, live so far, ${cards(f.k)}`) : null;
  const bars = [];
  if (f.gone) {
    // The window's cards no longer read (round 5, the Reviewer's N1): with no weekly V5 line, a check late; with one, its
    // figure is the record's.
    if (!weekly && known && check && check.state === 'not measured') return notMeasured(t, check, `Goal: ${goal.words}`, tz);
    if (!weekly) {
      t.mark = 'unrec';
      t.verdict = { mark: 'unrec', first: 'Not measured yet', second: 'weekly check not recorded yet' };
      t.lines.push(`Goal: ${goal.words}`);
      return t;
    }
    ms = weekly.value * 60000;
    figWords = `median, your Chief of Staff's check, ${rangeWords(weekly.from, weekly.to)}`;
  } else if (ms != null) bars.push([after ? 'First 14 days' : 'Live so far', ms]);
  if (ms == null) {
    // No figure (AC21's "no weekday cards", or the projects not read yet): the planned ring, under AC21's words.
    t.aside = f.words;
    if (known && check && check.state === 'not measured') return notMeasured(t, check, `Goal: ${goal.words}`, tz);
    t.mark = 'planned';
    t.verdict = { mark: 'planned', first: 'Not measured yet', second: goalWords };
    if (weekly && !after) t.lines.push(`Weekly check: ${weeklyWords(weekly)}`);
    return withCheck(t, known ? check : null, null, tz);
  }
  const within = ms < goal.under * 60000;
  const fill = (m) => (m < goal.under * 60000 ? 'ok' : 'bad');
  if (weekly) bars.push(['Weekly check', weekly.value * 60000]);
  t.figure = { big: hm(ms), words: figWords };
  t.chart = chartOf(goal, bars.map(([label, m]) => bar(label, Math.floor(m / 60000), goal, fill(m))));
  // The final V5 check saying `not measured` sets the planned ring over the desk's figure (P-001-m3b-not-measured-mark.md, B).
  if (known && finalNotMeasured(check, days)) return notMeasured(t, check, `Goal: ${goal.words}`, tz);
  const words = verdictWords(within, phase);
  t.mark = within ? 'check' : 'cross';
  t.verdict = { mark: t.mark, first: words, second: goalWords };
  if (weekly && !after) t.lines.push(`Weekly check: ${weeklyWords(weekly)}`);
  return withCheck(t, known ? check : null, { within, words }, tz);
}
/** "4 cards, 3 – 6 Dec": the weekly V5 line's cards, read from its figure's words, and its dates. */
function weeklyWords(l) {
  const m = /\b(\d+) cards?\b/.exec(l.figure);
  return `${m ? plural(Number(m[1]), 'card', 'cards') : l.figure}, ${rangeWords(l.from, l.to)}`;
}

// ---------------------------------------------------------------------------
// The row (AC97, "The row's small line and marks")

const PARTS = [['cross', 'outside'], ['check', 'within'], ['half', 'under way'], ['unrec', 'check late'], ['planned', 'not measured yet']];
const STATE_PARTS = ['met', 'missed', 'on track', 'not measured'];
/** The parts by mark, each only when more than 0, "target" said once on the first part. */
function markParts(targets) {
  const out = [];
  for (const [mark, word] of PARTS) {
    const n = targets.filter((x) => x.mark === mark).length;
    if (n) out.push(`${n} ${word}${out.length === 0 && (mark === 'cross' || mark === 'check') ? ' target' : ''}`);
  }
  return out;
}

/** The planning project's row: its words by AC97's strict sequence of states 0 to 8, its five marks and its left icon. */
function planningRow({ targets, phase, days, today, known, unknownWord, linesOf, isWindowLine }) {
  const n = plural(targets.length, 'target', 'targets');
  const marks = targets.map((x) => ({ id: x.id, mark: x.mark }));
  let state;
  let words;
  const anyWindowLine = () => targets.some((x) => linesOf(x.id).some((l) => isWindowLine(x.id, l)));
  if (phase === 'before') {
    state = 1;
    words = 'Measured from launch · V4, replacing the old page, at launch';
  } else if (!known) {
    state = 0;
    words = `${n} · weekly checks ${unknownWord}`;
  } else if (phase === 'launch') {
    state = 2;
    words = `Measured from ${dayWords(days.W1)} · first weekly check due ${dayWords(days.D1)}`;
  } else if (phase === 'window') {
    if (anyWindowLine()) {
      state = 5;
      const parts = markParts(targets);
      words = `${n} · ${parts.join(' · ')}${parts.length > 1 ? ',' : ''} so far`;
    } else if (today <= days.D1) {
      state = 3;
      words = `Measured since ${dayWords(days.W1)} · first weekly check due ${dayWords(days.D1)}`;
    } else {
      state = 4;
      words = `Measured since ${dayWords(days.W1)} · first weekly check not recorded yet`;
    }
  } else if (!anyWindowLine()) {
    state = 6;
    words = `${n} · ${VALUES_WORDS.windowWords} over · no weekly check recorded yet`;
  } else {
    const final = targets.every((x) => {
      const all = linesOf(x.id);
      const latest = all.length ? all[all.length - 1] : null;
      return Boolean(latest && (x.id === 'V4' || latest.to >= days.WN));
    });
    if (final) {
      state = 8;
      const parts = STATE_PARTS.map((s) => [s, targets.filter((x) => x.latest && x.latest.state === s).length]).filter(([, k]) => k).map(([s, k]) => `${k} ${s}`);
      words = `${n} · ${VALUES_WORDS.windowWords} checked · ${parts.join(' · ')}`;
    } else {
      state = 7;
      words = `${n} · ${VALUES_WORDS.windowWords} over · ${markParts(targets).join(' · ')} · ${today <= days.DN ? `last checks due ${dayWords(days.DN)}` : 'last checks not recorded yet'}`;
    }
  }
  let icon;
  if (state === 0) icon = null;
  else if (marks.some((x) => x.mark === 'cross')) icon = 'cross';
  else if (state === 8 && targets.every((x) => x.latest && x.latest.state === 'met')) icon = 'check';
  else if (state === 4 || state === 6) icon = 'unrec';
  else if (marks.some((x) => x.mark === 'check' || x.mark === 'half')) icon = 'half';
  else icon = 'planned';
  return { state, words, icon, marks };
}

/** Another v3 project's row: its Chief of Staff's states only. */
function otherRow(targets, known, unknownWord) {
  const n = plural(targets.length, 'target', 'targets');
  const marks = targets.map((x) => ({ id: x.id, mark: x.mark }));
  if (!known) return { state: 0, words: `${n} · weekly checks ${unknownWord}`, icon: null, marks };
  const withLine = targets.filter((x) => x.latest);
  if (!withLine.length) return { state: null, words: `${n} · weekly check not recorded yet`, icon: 'planned', marks };
  const parts = STATE_PARTS.map((s) => [s, withLine.filter((x) => x.latest.state === s).length]).filter(([, k]) => k).map(([s, k]) => `${k} ${s}`);
  const none = targets.length - withLine.length;
  if (none) parts.push(`${none} not recorded yet`);
  let icon = 'planned';
  if (withLine.some((x) => x.latest.state === 'missed')) icon = 'cross';
  else if (withLine.length === targets.length && withLine.every((x) => x.latest.state === 'met')) icon = 'check';
  else if (withLine.some((x) => x.latest.state === 'on track' || x.latest.state === 'met')) icon = 'half';
  return { state: null, words: `${n} · ${parts.join(' · ')}`, icon, marks };
}
