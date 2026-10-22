// Work ahead by milestones (spec S-001, AC24, J4, J14, J15; M3A, from 2026-10-18): the owner's plan
// (J4: milestones only, with no dates), the Chief of Staff's rough estimates (J14), the later-work
// list and its asks (J15), and the rough finish's arithmetic (AC24's steps 1 to 6). Pure: no network,
// no DOM, no Node built-ins; dates through Intl in the owner's time zone (J7's ownerTimeZone).

import { dayKey } from './timefmt.js';

export const PLAN_DIR = 'docs/planning/';
const PLAN_NAME = '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{4}Z-[0-9]{2}';
/** J4's file name: `docs/planning/<YYYY-MM-DD>T<HHMM>Z-<nn>.md`. */
export const PLAN_PATH_RE = new RegExp(`^docs/planning/(${PLAN_NAME})\\.md$`);
export const PLAN_NAME_RE = new RegExp(`^${PLAN_NAME}$`);
export const PLAN_HEADER = ['Order', 'Project', 'Milestone'];
export const ESTIMATES_PATH = 'intake/estimates.jsonl';
export const LATER_WORK_PATH = 'intake/later-work.md';
export const ASKS_DIR = 'intake/milestone-asks/';
/** J15's ask: `intake/milestone-asks/<W-id>-<YYYY-MM-DD>T<HHMM>Z.md`, the tap's minute in UTC. */
export const ASK_PATH_RE = /^intake\/milestone-asks\/(W[0-9]+)-([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2})([0-9]{2})Z\.md$/;
/** J15's question and answer, by name: `(decisions/)questions/<item>-later-work-<w-id>.md`. */
export const LATER_Q_RE = /^(decisions\/)?questions\/[A-Z]+-[0-9]+-later-work-(w[0-9]+)\.md$/;
/** AC24's draft, kept on the device (C). */
export const DRAFT_KEY = 'desk-plan-draft-v1';
/** J14: an estimate more than this many days old is "may be out of date" (a setting to tune, like AC71's 3 days). */
export const STALE_DAYS = 7;
/** J14 (draft 3): a line timed up to 10 minutes after the page's clock is read, not skipped. */
export const SKEW_MS = 10 * 60_000;
export const MAX_DAYS = 365;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---------------------------------------------------------------------------
// The desk's own fixed words on the screen (AC24): never "deadline" but in "never a deadline", nor
// "due", "late", "overdue" or "target" (the test checks every one of these).

export const WA = Object.freeze({
  title: 'Work ahead',
  eyebrow: 'All projects',
  control: 'Work ahead',
  toGo: (n, m) => `${n} ${n === 1 ? 'milestone' : 'milestones'} to go · ${m} reached`,
  cardTitle: 'Rough finish, in this order',
  cardNote: 'From the estimates below, added up in your order from today. An expectation, never a deadline.',
  estimateKey: 'Estimate',
  noEstimate: 'Estimate: not made yet',
  estimateNA: 'Estimate: not available',
  mayBeOld: 'may be out of date',
  newerUnreadable: 'a newer estimate line could not be read',
  zeroZero: 'no work left · waiting on your acceptance',
  byCoS: 'your Chief of Staff',
  finish: 'Rough finish',
  onceAccepted: 'once you accept it',
  notInPlan: 'not in your recorded plan',
  noPlan: 'No plan recorded yet',
  draft: 'Draft · not recorded',
  draftChanged: 'your changes are on this phone only',
  current: 'Current plan',
  noChanges: 'No changes yet',
  changed: 'Changed · not recorded',
  record: 'Record plan',
  cantRecord: "Can't record plans: no project is set for planning",
  recordOff: 'Record plan is off until your milestones are read',
  // AC17's fallback (build review round 1, E and F): the words name the cause.
  copyLength: (what) => `Too long for a link: GitHub opens with the file name only; copy ${what} below, then paste it there`,
  copyPrefill: (what) => `This repository doesn't take prefilled content: GitHub opens with the file name only; copy ${what} below, then paste it there`,
  draftNotKept: 'draft not kept on this device',
  setAside: 'A newer plan was recorded; your draft was set aside',
  reached: 'Reached',
  dropped: 'Dropped',
  notYet: 'Not milestones yet',
  notYetLine: 'Your picks from the 16 Oct audit. Tap one to ask for it as a milestone; your Chief of Staff files the question at its next session, and once you approve it, it can be planned here. (Your "how long the agents think it will take" pick is now the estimates on this screen.)',
  tapToAsk: 'Tap to ask for it as a milestone',
  questionFiled: 'Question filed · in your Queue',
  notAdded: 'Not added',
  noLaterWork: 'No later work recorded yet',
  notAvailable: 'not available',
  noWork: 'No work filed yet',
  nextToReach: 'No work filed yet · next to reach',
  goneBack: 'Work filed · gone back over',
  olderPipeline: 'It runs on the older pipeline, so it has no milestones to order here',
  noOpenSprint: 'No open sprint',
  sprintUnclear: 'sprint unclear',
  moveUp: (code) => `Move ${code} up`,
  moveDown: (code) => `Move ${code} down`,
  // From stage 5 (AC86, frame 11): Work ahead as the Plan tab, its own words as the frame draws them.
  planTitle: 'Plan',
  changeOrder: 'Change the order',
  planSub: (today) => `Rough finish from today, ${today} · an expectation, never a deadline`,
  ahead: (project) => `${project} · milestones ahead`,
  yourAcceptance: 'your acceptance',
  afterRuling: 'after your ruling',
  ideas: 'Ideas · from the portfolio',
  ideasNotRead: "Not read yet: your portfolio isn't connected to the desk",
  onTimeline: 'On the Timeline',
  // A milestone's sheet (AC86): AC24's card note, less its "From the estimates below", which a sheet has no list below for.
  sheetFinishNote: 'Added up in your order from today. An expectation, never a deadline.',
  doneWhen: 'Done when',
});

// ---------------------------------------------------------------------------
// Dates, as calendar days in ownerTimeZone (AC24's steps 1 and 5)

const keyParts = (k) => k.split('-').map(Number);
/** Whole calendar days from one `YYYY-MM-DD` to another (negative when the second is earlier). */
export function daysBetween(a, b) {
  const [y1, m1, d1] = keyParts(a);
  const [y2, m2, d2] = keyParts(b);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}
/** A `YYYY-MM-DD` plus n calendar days: a daylight-saving change moves no date. */
export function addDays(k, n) {
  const [y, m, d] = keyParts(k);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}
/** "<d> <Mon>", with the year when it is not today's year ("3 Jan 2027"), as the desk shows dates. */
export function dateWords(k, todayKey) {
  const [y, m, d] = keyParts(k);
  return `${d} ${MONTHS[m - 1]}${todayKey && keyParts(todayKey)[0] !== y ? ` ${y}` : ''}`;
}
/** A range "<from> – <to>", one date when both are the same day. */
export function rangeWords(from, to, todayKey) {
  return from === to ? dateWords(from, todayKey) : `${dateWords(from, todayKey)} – ${dateWords(to, todayKey)}`;
}
/**
 * A rough finish as Plan's rows show it at their right (AC86, frame 11: "22–25 Oct"): within one month
 * "<d>–<d> <Mon>", across months AC24's "<from> – <to>", one date when both are the same day; with the
 * year when it is not today's (AC24, step 5). Every date is AC24's, only written shorter.
 */
export function shortRange(from, to, todayKey) {
  if (from === to) return dateWords(from, todayKey);
  const [y1, m1, d1] = keyParts(from);
  const [y2, m2] = keyParts(to);
  if (y1 === y2 && m1 === m2) return `${d1}–${dateWords(to, todayKey)}`;
  return rangeWords(from, to, todayKey);
}
/** Today: the calendar date now in ownerTimeZone (AC24, step 1). */
export const todayOf = (nowMs, tz) => dayKey(new Date(nowMs), tz);

// ---------------------------------------------------------------------------
// J4: the plan

/** The project whose J7 entry holds `"planning": true` (a v3 one; the build allows one), or null. */
export function planningProject(config) {
  return ((config && config.projects) || []).find((p) => p && p.planning === true && p.model === 'v3') || null;
}

/**
 * The plans in a tree (J4's ordering rule): { names (sorted), current (the greatest name, or null),
 * odd (paths under docs/planning/ out of form: activity, "can't parse") }.
 */
export function planFiles(tree) {
  const names = [];
  const odd = [];
  for (const p of (tree && tree.keys ? tree.keys() : [])) {
    if (!p.startsWith(PLAN_DIR)) continue;
    const m = PLAN_PATH_RE.exec(p);
    if (m) names.push(m[1]);
    else odd.push(p);
  }
  // Plain byte (ASCII) order: fixed-width fields make it time order.
  names.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return { names, current: names.length ? names[names.length - 1] : null, odd: odd.sort() };
}
export const planPath = (name) => `${PLAN_DIR}${name}.md`;

/** The next plan's name for this minute (UTC): the lowest `<nn>` not already in the tree (J4). */
export function nextPlanName(tree, nowMs) {
  const t = new Date(nowMs);
  const p2 = (n) => String(n).padStart(2, '0');
  const minute = `${t.getUTCFullYear()}-${p2(t.getUTCMonth() + 1)}-${p2(t.getUTCDate())}T${p2(t.getUTCHours())}${p2(t.getUTCMinutes())}Z`;
  for (let n = 1; n <= 99; n++) {
    const name = `${minute}-${p2(n)}`;
    if (!tree || !tree.has(planPath(name))) return name;
  }
  return null; // a hundred plans in one minute: none is offered until the next
}

/** When a plan was recorded, from its name (the time in it is the recording's, never a date for the work). */
export function planTime(name) {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2})([0-9]{2})Z-[0-9]{2}$/.exec(name || '');
  return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5])) : NaN;
}

const cells = (line) => {
  const s = line.trim();
  if (!s.startsWith('|') || !s.endsWith('|')) return null;
  return s.slice(1, -1).split('|').map((c) => c.trim());
};

/**
 * Read a plan's text (J4, "How the page reads it"): { ok, rows: [{ order, project, milestone }],
 * planLine, supersedes } or { ok: false, why }. The table whose header row is exactly `| Order |
 * Project | Milestone |`, cells trimmed; its rows in their `Order`, which must run 1, 2, 3… with no
 * gap. A header of any other form, or no such table, can't be read.
 */
export function parsePlan(text) {
  const lines = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
  const planL = lines.find((l) => l.startsWith('Plan:'));
  const supL = lines.find((l) => l.startsWith('Supersedes:'));
  const planLine = planL == null ? null : planL.slice(5).trim();
  const supersedes = supL == null ? null : supL.slice(11).trim();
  const hi = lines.findIndex((l) => {
    const c = cells(l);
    return c && c.length === 3 && c.every((x, i) => x === PLAN_HEADER[i]);
  });
  if (hi < 0) return { ok: false, why: 'no table whose header is | Order | Project | Milestone |' };
  const rows = [];
  let i = hi + 1;
  if (i < lines.length && /^\|(\s*:?-{3,}:?\s*\|){3}\s*$/.test(lines[i].trim())) i++;
  for (; i < lines.length; i++) {
    const c = cells(lines[i]);
    if (!c) break;
    if (c.length !== 3 || !/^[0-9]+$/.test(c[0])) return { ok: false, why: `a row out of form: ${lines[i].trim()}` };
    rows.push({ order: Number(c[0]), project: c[1], milestone: c[2] });
  }
  const orders = rows.map((r) => r.order).sort((a, b) => a - b);
  if (orders.some((o, k) => o !== k + 1)) return { ok: false, why: 'its Order does not run 1, 2, 3… with no gap' };
  rows.sort((a, b) => a.order - b.order);
  return { ok: true, rows, planLine, supersedes };
}

/** A plan's body as the page writes it (J4's form): milestones only, with no date and no estimate. */
export function planBody(name, supersedes, rows) {
  const out = [`Plan: ${name}`, `Supersedes: ${supersedes || 'none'}`, '', '| Order | Project | Milestone |', '|---|---|---|'];
  rows.forEach((r, i) => out.push(`| ${i + 1} | ${r.project} | ${r.milestone} |`));
  return `${out.join('\n')}\n`;
}

// ---------------------------------------------------------------------------
// J14: the estimates

/** A time whose fields are a real moment: they come back the same from the date they parse to (no 30 Feb, no 24:00). */
const realTime = (s) => {
  const ms = Date.parse(s);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 19) === s.slice(0, 19);
};
const ISO_UTC_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|\+00:00)$/;
const EST_KEYS = ['time', 'project', 'milestone', 'low_days', 'high_days', 'note', 'session'];
const wholeDays = (v) => Number.isInteger(v) && v >= 0 && v <= MAX_DAYS;

/**
 * The estimate file's lines (J14's form), read without the clock or J7, so the page caches them by
 * sha: [{ n (1-based), ok, e: { time (ms), timeText, project, milestone, low, high, note, session },
 * why, project?, milestone? }]. Blank lines are passed over.
 */
export function parseEstimates(text) {
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
    const named = { project: typeof v.project === 'string' ? v.project : null, milestone: typeof v.milestone === 'string' ? v.milestone : null };
    const bad = (why) => out.push({ n, ok: false, why, ...named });
    const keys = Object.keys(v);
    const missing = EST_KEYS.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !EST_KEYS.includes(k));
    if (missing.length) return bad(`missing ${missing.join(', ')}`);
    if (extra.length) return bad(`an extra key: ${extra.join(', ')}`);
    if (typeof v.time !== 'string' || !ISO_UTC_RE.test(v.time) || !realTime(v.time)) return bad('its time is not a UTC time ending Z or +00:00');
    if (typeof v.project !== 'string' || !v.project) return bad('its project is not a name');
    if (typeof v.milestone !== 'string' || !v.milestone) return bad('its milestone is not an id');
    if (!wholeDays(v.low_days) || !wholeDays(v.high_days)) return bad(`low_days and high_days must be whole numbers from 0 to ${MAX_DAYS}`);
    if (v.low_days > v.high_days) return bad('low_days is above high_days');
    if (typeof v.note !== 'string') return bad('its note is not a string');
    if (typeof v.session !== 'string') return bad('its session is not a string');
    out.push({ n, ok: true, e: { time: Date.parse(v.time), timeText: v.time, project: v.project, milestone: v.milestone, low: v.low_days, high: v.high_days,
      note: v.note, session: v.session } });
  });
  return out;
}

export const msKey = (project, id) => `${project}|${id}`;

/**
 * Each milestone's latest estimate (J14): its last readable line in file order. input: { lines
 * (parseEstimates'), nowMs, projects (J7's), held: Map(project → Set(ids) section 3 holds) }.
 * Returns { latest: Map(key → { ...e, n }), unreadable: Map(key → n) (a newer line for it could not
 * be read), notes: [string] (the planning project's notes) }.
 */
export function latestEstimates({ lines, nowMs, projects, held }) {
  const latest = new Map();
  const unreadable = new Map();
  const notes = [];
  let latestSoFar = null; // the latest-timed readable line so far, for "dated before line <m>"
  const isHeld = (p, id) => Boolean(held && held.has(p) && held.get(p).has(id));
  for (const l of lines || []) {
    const pName = l.e ? l.e.project : l.project;
    const id = l.e ? l.e.milestone : l.milestone;
    const mark = (why) => {
      notes.push(`estimates line ${l.n}: ${why}`);
      // J14: a newer line that can't be read is never silently replaced by the line before it.
      if (pName != null && id != null && isHeld(pName, id)) unreadable.set(msKey(pName, id), l.n);
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
    if (latestSoFar && e.time < latestSoFar.time) notes.push(`estimates line ${l.n} is dated before line ${latestSoFar.n}`);
    if (!latestSoFar || e.time >= latestSoFar.time) latestSoFar = { n: l.n, time: e.time };
    if (proj.model !== 'v3') {
      notes.push(`estimates line ${l.n}: ${e.project} is a v2.5 project, which has no milestones to estimate here`);
      continue;
    }
    if (!isHeld(e.project, e.milestone)) {
      notes.push(`estimates line ${l.n}: ${e.project} has no milestone ${e.milestone}`);
      continue;
    }
    const k = msKey(e.project, e.milestone);
    latest.set(k, { ...e, n: l.n });
    unreadable.delete(k);
  }
  return { latest, unreadable, notes };
}

/**
 * One estimate's standing on a day (J14, AC24): { kind: 'zero' (0 to 0: no work left, holds until
 * reached) | 'ok' | 'past' (under way, run past its high end: counts as no estimate), stale (more than
 * 7 days old; never for 'zero'), dateKey, lo, hi (the remaining days, AC24 step 2) }.
 */
export function estimateStanding(est, underway, todayKey, tz) {
  const dateKey = dayKey(new Date(est.time), tz);
  if (est.low === 0 && est.high === 0) return { kind: 'zero', stale: false, dateKey, lo: 0, hi: 0 };
  const age = daysBetween(dateKey, todayKey);
  const stale = age > STALE_DAYS;
  if (!underway) return { kind: 'ok', stale, dateKey, lo: est.low, hi: est.high };
  const e = Math.max(0, age); // dated after today (a clock a little ahead): 0 days since
  const hi = est.high - e;
  if (hi < 0) return { kind: 'past', stale, dateKey, lo: null, hi: null };
  return { kind: 'ok', stale, dateKey, lo: Math.max(0, est.low - e), hi };
}

/** "about <low>–<high> days of work", or "about <n> days of work" when equal. */
export function estimateWords(low, high) {
  return low === high ? `about ${low} ${low === 1 ? 'day' : 'days'} of work` : `about ${low}–${high} days of work`;
}
const rangeDays = (low, high) => (low === high ? `${low} ${low === 1 ? 'day' : 'days'}` : `${low}–${high} days`);
/** An estimate on Plan's row (AC86: "about <low>–<high> days"), its days of work as J14 gives them. */
export const aboutDays = (low, high) => `about ${rangeDays(low, high)}`;
export const pastWords = (est, dateText) => `past its estimate of ${rangeDays(est.low, est.high)}, made ${dateText}; waiting on a new one`;

/**
 * The rough finish (AC24, steps 3 and 4): rows in the order shown, each { code, standing (or null:
 * no estimate) }; returns { rows: [{ words, from?, to?, accept? }], card } from today, one milestone
 * after another. From the first row with no estimate, or past its estimate, every finish reads "not
 * available: <code> …".
 */
export function roughFinish(rows, todayKey) {
  let lo = 0;
  let hi = 0;
  let stop = null;
  let at = null;
  const out = rows.map((r, i) => {
    if (stop) return { words: stop, na: true, stop: at };
    const s = r.standing;
    if (!s || s.kind === 'past') {
      // `stop`: the row the reason names, so a screen without each row's project beside it (Home's tile)
      // can name that row's project (the Design reviewer's B-new, stage 2 round 2); the words are Plan's.
      at = { index: i, code: r.code, why: s && s.kind === 'past' ? 'is past its estimate' : 'has no estimate yet' };
      stop = `not available: ${r.code} ${at.why}`;
      return { words: stop, na: true, stop: at };
    }
    lo += s.lo;
    hi += s.hi;
    if (s.kind === 'zero') return { words: WA.onceAccepted, accept: true };
    const from = addDays(todayKey, lo);
    const to = addDays(todayKey, hi);
    return { words: rangeWords(from, to, todayKey), from, to };
  });
  const card = out.length ? out[out.length - 1].words : WA.notAvailable;
  return { rows: out, card };
}

// ---------------------------------------------------------------------------
// J15: the later-work list and its asks

const LATER_LINE_RE = /^- (.+?) \((W[0-9]+)\) · (.+?) · from: (\S+?)(?: · (?:added as: (M[0-9A-Z]{1,7})|(not added)))?$/;

/**
 * The later-work list (J15's form): { title, items: [{ lineno, w, name, note, from, added, notAdded }],
 * notes }. Lines not starting `- ` are passed over; one starting `- ` out of form, or a repeated W id,
 * is named in a note.
 */
export function parseLaterWork(text) {
  const lines = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
  const title = (lines.find((l) => l.startsWith('# ')) || '').slice(2).trim() || null;
  const items = [];
  const notes = [];
  const seen = new Set();
  lines.forEach((line, i) => {
    if (!line.startsWith('- ')) return;
    const m = LATER_LINE_RE.exec(line.replace(/\s+$/, ''));
    if (!m || m[3].includes(' · ')) {
      notes.push(`later-work line ${i + 1} is out of form`);
      return;
    }
    if (seen.has(m[2])) {
      notes.push(`later-work line ${i + 1}: ${m[2]} is repeated; the first counts`);
      return;
    }
    seen.add(m[2]);
    items.push({ lineno: i + 1, w: m[2], name: m[1], note: m[3], from: m[4], added: m[5] || null, notAdded: Boolean(m[6]) });
  });
  return { title, items, notes };
}

/** The ask's path for a piece of later work at this minute (UTC) (J15). */
export function askPath(w, nowMs) {
  const t = new Date(nowMs);
  const p2 = (n) => String(n).padStart(2, '0');
  return `${ASKS_DIR}${w}-${t.getUTCFullYear()}-${p2(t.getUTCMonth() + 1)}-${p2(t.getUTCDate())}T${p2(t.getUTCHours())}${p2(t.getUTCMinutes())}Z.md`;
}
/** The ask's body (J15): the owner's own record; it changes no milestone. */
export function askBody(item) {
  return `Ask: add ${item.w} as a milestone\nLater work: ${item.name} (${item.w})\nFrom: the owner, through the desk's Work ahead\n`;
}

/**
 * "Not milestones yet" (J15's states, the first that fits): input { list (parseLaterWork's), tree,
 * history (path → { oldest }), records (path → parsed), held (Set of the planning project's
 * milestone ids), tz, todayKey }. Returns { rows: [{ item, state: 'tap' | 'asked' | 'question' |
 * 'answered', words, answerPath?, askedAt? }], notAdded: [item], notes }.
 */
export function laterRows({ list, tree, history, records, held, tz, todayKey }) {
  const notes = [...(list.notes || [])];
  const ws = new Set(list.items.map((x) => x.w));
  const asks = new Map(); // W → [{ name, ms }]
  const qs = new Map(); // w (lower) → { question, answer }
  for (const p of (tree && tree.keys ? tree.keys() : [])) {
    if (p.startsWith(ASKS_DIR)) {
      const m = ASK_PATH_RE.exec(p);
      if (!m) {
        notes.push(`${p}: an ask's name out of form`);
        continue;
      }
      if (!ws.has(m[1])) {
        notes.push(`${p}: an ask for ${m[1]}, which the later-work list does not hold`);
        continue;
      }
      const ms = Date.UTC(Number(m[2]), Number(m[3]) - 1, Number(m[4]), Number(m[5]), Number(m[6]));
      if (!asks.has(m[1])) asks.set(m[1], []);
      asks.get(m[1]).push({ path: p, ms });
      continue;
    }
    const q = LATER_Q_RE.exec(p);
    if (q) {
      if (!qs.has(q[2])) qs.set(q[2], {});
      qs.get(q[2])[q[1] ? 'answer' : 'question'] = p;
    }
  }
  for (const [w, list0] of asks) {
    list0.sort((a, b) => a.ms - b.ms || (a.path < b.path ? -1 : 1));
    for (const extra of list0.slice(1)) notes.push(`${extra.path}: a second ask for ${w}; the earliest counts`);
  }
  const rows = [];
  const notAdded = [];
  for (const item of list.items) {
    if (item.added) {
      if (held && !held.has(item.added)) notes.push(`${item.w} says added as ${item.added}, which the plan does not hold`);
      continue;
    }
    if (item.notAdded) {
      notAdded.push(item);
      continue;
    }
    const q = qs.get(item.w.toLowerCase()) || {};
    if (q.answer) {
      const h = history && history.get(q.answer);
      const at = h && h.oldest ? dayKey(new Date(h.oldest), tz) : null;
      const rec = records && records.get(q.answer);
      const line1 = rec && typeof rec.line1 === 'string' ? rec.line1 : null;
      rows.push({ item, state: 'answered', answerPath: q.answer, line1,
        words: `Answered ${at ? dateWords(at, todayKey) : 'time not recorded'}: ${line1 == null ? 'not read yet' : line1}` });
      continue;
    }
    if (q.question) {
      rows.push({ item, state: 'question', words: WA.questionFiled });
      continue;
    }
    const a = asks.get(item.w);
    if (a && a.length) {
      const at = dayKey(new Date(a[0].ms), tz);
      rows.push({ item, state: 'asked', askedAt: a[0].ms, words: `Asked ${dateWords(at, todayKey)} · your Chief of Staff files the question` });
      continue;
    }
    rows.push({ item, state: 'tap', words: WA.tapToAsk });
  }
  return { rows, notAdded, notes };
}
