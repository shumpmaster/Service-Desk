// The weekly file (spec S-001, AC25's third part and J5, as changed for M3B; stage VT3 of "The desk's value targets shown:
// M3B"): from each Monday 00:00 in `ownerTimeZone`, each finished week this device still keeps notes for (lib/metrics.js),
// and whose file from this device is not in the private portfolio repository's tree (J23's read), offered once, as one
// file in J5's form at `metrics/service-desk/<YYYY>-W<ww>-<device>.md`; the weeks before launch's week offered too, as a
// trial, grouped under one line. Pure: from the notes, the clock, the zone, the launch day, the portfolio's tree and V5's
// figure for a week; the page (public/sandbox.js) builds each link (links.js, J3's form) and draws the line and the block.

import { dayKey } from './timefmt.js';
import { weekStart, weekStartAfter, nextWeekStart, keptFrom } from './metrics.js';
import { dayWords, hm } from './values.js';
import { cappedNewFileLink } from './links.js';

/** Where a device's week goes in the portfolio repository (J5 as changed). */
export const WEEKLY_DIR = 'metrics/service-desk';
export const WEEKLY_WORDS = Object.freeze({
  last: "Last week's desk figures are ready to save",
  one: 'A week of desk figures is ready to save',
  many: (k) => `${k} weeks of desk figures are ready to save`,
  head: 'Your weekly figures',
  trial: 'Before launch: a trial, not counted',
  save: (monday) => `Save the week of ${dayWords(monday)}`,
  kept: 'Notes are kept on this device for 8 weeks, then dropped.',
  // AC17's words naming the cause (as Plan's links say it, workahead.js), and AC18's, the week in place of the card.
  copyLength: 'Too long for a link: GitHub opens with the file name only; copy the week below, then paste it there',
  copyPrefill: "This repository doesn't take prefilled content: GitHub opens with the file name only; copy the week below, then paste it there",
  copyButton: 'Copy the week',
  webCommits: (branch) => `This repository doesn't take commits to ${branch} from the web. On GitHub, choose 'Create a new branch' and then open the pull `
    + 'request GitHub offers; the week stays offered until that pull request is merged.',
});
const V5_HEAD = 'V5 median (weekday cards)';

/** The ISO week of a day (`YYYY-MM-DD`), `<YYYY>-W<ww>`: the year of its week's Thursday, and that Thursday's week number. */
export function isoWeek(k) {
  const d = new Date(`${k}T00:00:00Z`);
  const wd = (d.getUTCDay() + 6) % 7; // Monday 0
  const thu = new Date(d.getTime() + (3 - wd) * 86400e3);
  const y = thu.getUTCFullYear();
  const jan1 = Date.UTC(y, 0, 1);
  const n = Math.floor((thu.getTime() - jan1) / 86400e3 / 7) + 1;
  return `${y}-W${String(n).padStart(2, '0')}`;
}
/** A device's file for the week whose Monday is `monday` (a day key in the zone). */
export const weekPath = (monday, device) => `${WEEKLY_DIR}/${isoWeek(monday)}-${device}.md`;

const inWeek = (t, start, end) => t >= start && t < end;
/** A time as J5 writes it, cut to the second from the device's milliseconds, never rounded (12:00:59.999 is 12:00:59). */
export const isoCut = (ms) => `${new Date(Math.floor(ms / 1000) * 1000).toISOString().slice(0, 19)}Z`;
const hmsCut = (ms) => new Date(Math.floor(ms / 1000) * 1000).toISOString().slice(11, 19);

/**
 * The finished weeks whose notes this device keeps (its open windows, first-shown notes and marks), each by its Monday
 * 00:00 in `tz` as a time, newest first: a week with a window of some length, a first-shown note or a mark, ended by
 * `nowMs` (from Monday 00:00 in `tz`), and not yet dropped (KEEP_WEEKS from its end).
 */
export function notedWeeks(notes, nowMs, tz) {
  if (!notes) return [];
  const thisWeek = weekStart(nowMs, tz);
  const from = keptFrom(nowMs, tz);
  const weeks = new Set();
  const add = (t) => {
    const w = weekStart(t, tz);
    if (w < thisWeek && w >= from) weeks.add(w);
  };
  for (const [a, b] of notes.windows || []) if (b > a) add(a);
  for (const t of Object.values(notes.shown || {})) add(t);
  for (const t of Object.values(notes.marks || {})) add(t);
  return [...weeks].sort((x, y) => y - x);
}

/** The open windows of [start, end) as J5's lines, one a UTC day, each window `HH:MM:SS-HH:MM:SS`; one across midnight UTC split there, its first part ending `24:00:00`. */
function windowLines(windows, start, end) {
  const days = new Map();
  const put = (a, b, endWords) => {
    const k = new Date(a).toISOString().slice(0, 10);
    if (!days.has(k)) days.set(k, []);
    days.get(k).push({ a, words: `${hmsCut(a)}-${endWords || hmsCut(b)}` });
  };
  for (const [a0, b0] of [...(windows || [])].sort((x, y) => x[0] - y[0])) {
    if (!(b0 > a0) || !inWeek(a0, start, end)) continue;
    let a = a0;
    for (;;) {
      const mid = Date.UTC(new Date(a).getUTCFullYear(), new Date(a).getUTCMonth(), new Date(a).getUTCDate() + 1);
      if (b0 <= mid) {
        put(a, b0);
        break;
      }
      put(a, mid, '24:00:00');
      a = mid;
    }
  }
  return [...days.keys()].sort().map((k) => `${k}: ${days.get(k).sort((x, y) => x.a - y.a).map((x) => x.words).join(', ')}`);
}

/** A list section's lines: `- <time> <key>`, by time, then key. */
const keyLines = (byKey, start, end) => Object.entries(byKey || {}).filter(([, t]) => inWeek(t, start, end))
  .sort((x, y) => x[1] - y[1] || (x[0] < y[0] ? -1 : 1)).map(([k, t]) => `- ${isoCut(t)} ${k}`);

/** V5's line for the week (J5: the week's cards, or "no weekday cards"), from values.js's v5Week. */
export function v5Line(v5) {
  if (!v5) return `${V5_HEAD}: not available`;
  if (v5.words) return `${V5_HEAD}: ${v5.words}`;
  return `${V5_HEAD}: ${hm(v5.ms)} over ${v5.k} card${v5.k === 1 ? '' : 's'}`;
}

/**
 * A week's file in J5's form (as changed for M3B). input: { notes, start (the week's Monday 00:00 in `tz`), tz, trial
 * (a week before launch's), v5 (values.js's v5Week for the week) }.
 */
export function weekFile({ notes, start, tz, trial = false, v5 = null }) {
  const end = nextWeekStart(start, tz);
  const monday = dayKey(new Date(start), tz);
  const lines = [`Week: ${isoWeek(monday)} (the week of ${dayWords(monday)})   Device: ${notes.device}`];
  if (trial) lines.push('Before launch: a trial, not counted');
  lines.push(v5Line(v5));
  // "Records from" only where this device's notes start after the week's Monday (storage cleared, or a new device).
  if (notes.from && notes.from > monday) lines.push(`Records from: ${notes.from}`);
  lines.push('## Open windows (UTC)', ...windowLines(notes.windows, start, end));
  lines.push('## First shown (UTC)', ...keyLines(notes.shown, start, end));
  lines.push("## Didn't need me (UTC)", ...keyLines(notes.marks, start, end));
  return `${lines.join('\n')}\n`;
}

/**
 * The offer (AC25, "The weekly offer", by its one condition): null where nothing is offered (the device keeps nothing, the
 * portfolio's tree is not read, or every noted week's file is in it), else { line (Home's words), weeks: [{ start, monday,
 * path, trial, words, content }] newest first }. input: { notes, off (the device keeps nothing), nowMs, tz, launch (M3C's
 * reached day, or null before launch), tree (the portfolio's tree, a Map by path, or null where not read), v5Of(start, end) }.
 */
export function weeklyOffer({ notes, off, nowMs, tz, launch, tree, v5Of = () => null }) {
  if (off || !notes || !tree) return null;
  const launchWeek = launch ? weekStart(Date.parse(`${launch}T12:00:00Z`), tz) : null;
  const weeks = notedWeeks(notes, nowMs, tz).map((start) => {
    const monday = dayKey(new Date(start), tz);
    return { start, monday, path: weekPath(monday, notes.device), trial: launchWeek == null || start < launchWeek };
  }).filter((w) => !tree.has(w.path));
  if (!weeks.length) return null;
  for (const w of weeks) {
    w.words = WEEKLY_WORDS.save(w.monday);
    w.content = weekFile({ notes, start: w.start, tz, trial: w.trial, v5: v5Of(w.start, nextWeekStart(w.start, tz)) });
  }
  const last = weekStartAfter(nowMs, -1, tz);
  const line = weeks.length === 1 && weeks[0].start === last ? WEEKLY_WORDS.last : weeks.length === 1 ? WEEKLY_WORDS.one : WEEKLY_WORDS.many(weeks.length);
  return { line, weeks };
}

/**
 * The portfolio repository as J3's links take it (J5 as changed): J7's `portfolio` entry, `repo` and `defaultBranch`, with
 * J7's defaults for the keys it lacks (`contentParam` `value`, `contentPrefill` and `webCommitsToDefault` true).
 */
export function portfolioTarget(pf) {
  if (!pf || !pf.repo || !pf.defaultBranch) return null;
  return { repo: pf.repo, defaultBranch: pf.defaultBranch, contentParam: pf.contentParam || 'value', contentPrefill: pf.contentPrefill !== false,
    webCommitsToDefault: pf.webCommitsToDefault !== false };
}

/**
 * A week's link (J3's form against the portfolio repository's default branch): { url, copy (AC17: the file's text where the
 * link holds the file name only, past `linkCap` or with `contentPrefill` false), copyWords (the cause), warning (AC18's,
 * where `webCommitsToDefault` is false) }.
 */
export function weekLink(target, week, linkCap) {
  const link = cappedNewFileLink(target, week.path, week.content, linkCap);
  const copyWords = link.copy == null ? null : target.contentPrefill === false ? WEEKLY_WORDS.copyPrefill : WEEKLY_WORDS.copyLength;
  return { url: link.url, copy: link.copy, copyWords, warning: target.webCommitsToDefault === false ? WEEKLY_WORDS.webCommits(target.defaultBranch) : null };
}
