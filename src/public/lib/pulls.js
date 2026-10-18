// J12 on the page's side (spec S-001, MD sandbox; AC60, AC61, AC72; trial-view notes 2): the
// GraphQL answer the function hands back raw, judged here, and each pull request cut down to what
// the Timeline and the Queue's deploy check use. Also AC61 (c)'s reader of a pull request's body:
// its `Milestone:` line, its Context bullets and its Why. Pure: no network, no DOM, no storage.

import { plainInline } from './j11.js';

export const NOT_RECORDED = 'not recorded';
export const PULLS_MAX = 300; // J12: at most 3 pages of 100 are read, and at most 300 kept, the newest
export const PULLS_MAX_PAGES = 3;
// J12: the device's own store for them, apart from the blob cache. v2 from 2026-10-17 (model 3.5.0's
// records, draft 5): each kept entry holds whether its merge is the asks-merge job's, so the key moved
// on and v1 is removed on load, every entry read again from J12.
export const PULLS_KEY = 'desk-pulls-v2';
export const OLD_PULLS_KEYS = ['desk-pulls-v1'];
export const PULLS_RATE_MS = 60 * 60e3; // J12: after a RATE_LIMITED answer, no read for 60 minutes, then the read again (C; draft 6)
// J12's backoff (2026-10-17, the desk follow-ups; build review round 2 of trial-view notes 2, N1): after
// any other failed read, the next J12 read comes 5, 10, 20 and 40 minutes after failures in a row,
// then every 60 minutes until a read answers; an answer sets it back to the start. A RATE_LIMITED
// answer keeps PULLS_RATE_MS and leaves the step as it was. Held in memory, so each opening starts at 5.
export const PULLS_BACKOFF_MS = Object.freeze([5, 10, 20, 40, 60].map((m) => m * 60e3));

/** The wait after the failure that follows `step` failures in a row (0 for the first): 5, 10, 20, 40, then 60 minutes. */
export function pullsBackoffMs(step) {
  const i = Number.isInteger(step) && step > 0 ? step : 0;
  return PULLS_BACKOFF_MS[Math.min(i, PULLS_BACKOFF_MS.length - 1)];
}
export const TOO_MANY_WORDS = 'older pull requests not read (over 300)';
export const CANT_READ_CHECKS = "the desk's token can't read checks";
export const NO_CHECKS = 'no checks recorded for this pull request';

const CHECK_STATES = new Set(['SUCCESS', 'FAILURE', 'ERROR', 'PENDING', 'EXPECTED']);

// ---------------------------------------------------------------------------
// AC61 (c): a pull request body's `Milestone:` line, Context and Why (model S-032 AC6, as frozen on
// 2026-10-16 at 24987db, merged in Personal-Org-Operating-Model at c816cec, and adopted here with
// model v3.4.0, L-0015). For a body in S-032's form these read as S-032's forms say, as its draft 1
// (7108d1d) did, so the reader is unchanged. The desk reads exactly these and checks no form
// (S-032's `pr-body` check does that in the project's own CI); a body out of form is read as AC61's
// "Where the desk differs from S-032" says, its display leniencies included.

const MILESTONE_RE = /^Milestone:[ \t]*(.*)$/;
const NONE_RE = /^none \((.+)\)$/;
const HEADING_RE = /^#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/;
const OPENING_RE = /^#{1,6}[ \t]+what this means for you:?[ \t]*$/i;
const EXCEPTION_RE = /^none beyond the ruling quoted in why\.?$/i;
const SOURCE_TAIL = ' (source: ';

const headingWord = (l) => {
  const m = HEADING_RE.exec(l);
  return m ? m[1].replace(/:$/, '').trim().toLowerCase() : null;
};

/** The lines of a section whose heading (any level, a colon allowed, case ignored) is `word`: from it to the next heading or the end; the first such counts. */
function sectionOf(lines, word) {
  const i = lines.findIndex((l) => headingWord(l) === word);
  if (i < 0) return null;
  const out = [];
  for (let j = i + 1; j < lines.length; j++) {
    if (HEADING_RE.test(lines[j])) break;
    out.push(lines[j]);
  }
  return out;
}

/** Where the `## What this means for you` paragraph ends (the line after it), or 0 with no such heading (C: the whole body is read). */
function afterOpening(lines) {
  const i = lines.findIndex((l) => OPENING_RE.test(l));
  if (i < 0) return 0;
  let j = i + 1;
  while (j < lines.length && !lines[j].trim()) j++;
  while (j < lines.length && lines[j].trim() && !HEADING_RE.test(lines[j])) j++;
  return j;
}

/**
 * One Context bullet, its continuation lines joined with one space (AC61 (c)): { fact, source }:
 * the source is the text inside the bullet's last ` (source: ` and its closing `)` at the end; the
 * exception bullet has `exception: true` and no source; a bullet not in that form keeps its words
 * as the fact with source null ("source not recorded"). An empty fact or source is "not recorded".
 */
export function contextBullet(text) {
  const t = String(text).trim();
  if (EXCEPTION_RE.test(t)) return { fact: t, source: null, exception: true };
  const at = t.lastIndexOf(SOURCE_TAIL);
  if (at >= 0 && t.endsWith(')')) {
    const fact = t.slice(0, at).trim();
    const source = t.slice(at + SOURCE_TAIL.length, -1).trim();
    return { fact: fact || NOT_RECORDED, source: source || NOT_RECORDED, exception: false };
  }
  return { fact: t || NOT_RECORDED, source: null, exception: false };
}

/**
 * A pull request body's parts as AC61 (c) reads them: { milestone: null | { none: reason } | { ids },
 * context: null | [{ fact, source, exception }], why: null | [paragraph] }. Nothing else of the body
 * is kept (J12).
 */
export function prBodyParts(body) {
  const lines = String(body == null ? '' : body).replace(/\r\n?/g, '\n').split('\n');
  let milestone = null;
  for (let i = afterOpening(lines); i < lines.length; i++) {
    const m = MILESTONE_RE.exec(lines[i]);
    if (!m) continue;
    const v = m[1].trim();
    const none = NONE_RE.exec(v);
    milestone = none ? { none: none[1].trim() } : { ids: v.split(', ').map((x) => x.trim()).filter(Boolean) };
    break;
  }
  let context = null;
  const ctx = sectionOf(lines, 'context');
  if (ctx) {
    context = [];
    let cur = null;
    for (const l of ctx) {
      if (/^- /.test(l)) {
        if (cur != null) context.push(contextBullet(cur));
        cur = l.slice(2);
      } else if (cur != null && /^[ \t]+\S/.test(l)) cur += ` ${l.trim()}`;
      else {
        if (cur != null) context.push(contextBullet(cur));
        cur = null; // a line in the section that is no bullet is not shown
      }
    }
    if (cur != null) context.push(contextBullet(cur));
  }
  let why = null;
  const w = sectionOf(lines, 'why');
  if (w) {
    const paras = [];
    let p = [];
    for (const l of w) {
      const t = l.replace(/^>[ \t]?/, '').trim();
      if (!t) {
        if (p.length) paras.push(plainInline(p.join(' ')));
        p = [];
      } else p.push(t);
    }
    if (p.length) paras.push(plainInline(p.join(' ')));
    why = paras;
  }
  return { milestone, context, why };
}

// ---------------------------------------------------------------------------
// J12, the asks-merge job's merges (from 2026-10-17; the owner's answer "B. Off the Timeline
// (Recommended)", decisions/questions/P-001-asks-merge-on-desk.md).

const TRAILER_RE = /^([A-Za-z0-9-]+)[ \t]*:([^\n]*)$/; // Python's `.`: anything but a line feed
const GIT_PREFIXES = ['Signed-off-by: ', '(cherry picked from commit '];
// Python's white space (str.isspace, str.strip with no argument), which `parse_trailers` uses; it differs
// from JavaScript's \s and trim(): U+001C to U+001F and U+0085 count, U+FEFF does not (build review
// round 1, N1).
const PY_SPACE = '\t\n\v\f\r\x1c\x1d\x1e\x1f \x85\xa0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000';
const PY_EDGES_RE = new RegExp(`^[${PY_SPACE}]+|[${PY_SPACE}]+$`, 'g');
const PY_SPACE_RE = new RegExp(`^[${PY_SPACE}]$`);
/** Python's str.strip() with no argument. */
export const pyStrip = (s) => String(s).replace(PY_EDGES_RE, '');
/** Python's str.isspace() for one character (false for the empty string). */
export const pyIsSpace = (c) => PY_SPACE_RE.test(c);
const isBlank = (l) => !pyStrip(l);
const startsSpace = (c) => c.length === 1 && pyIsSpace(c);

/**
 * [[key, value]] from a commit message's final trailer paragraph, as the model's
 * `govlib.parse_trailers` finds it (governance/checks/govlib.py:660, following `git
 * interpret-trailers --parse`): CRLF made LF; trailing blank and `#` comment lines dropped; the title
 * (up to the first blank line) never holds trailers; the last paragraph is a trailer block when every
 * line of it is a trailer or a continuation, or when it holds a git-generated line (`Signed-off-by: `,
 * "(cherry picked from commit ") and at least a quarter of it is trailers; comment lines skipped,
 * continuation lines unfolded, values stripped, keys as spelled.
 */
export function parseTrailers(message, commentChar = '#') {
  const lines = String(message == null ? '' : message).replace(/\r\n/g, '\n').split('\n');
  while (lines.length && (isBlank(lines[lines.length - 1]) || lines[lines.length - 1].startsWith(commentChar))) lines.pop();
  let i = 0;
  while (i < lines.length && (lines[i].startsWith(commentChar) || !isBlank(lines[i]))) i++;
  const endOfTitle = i;
  let end = lines.length;
  while (end > endOfTitle && isBlank(lines[end - 1])) end--;
  let start = end;
  while (start > endOfTitle && !isBlank(lines[start - 1])) start--;
  if (start <= endOfTitle || start >= end) return [];
  let trailerLines = 0;
  let nonTrailer = 0;
  let possibleCont = 0;
  let recognized = false;
  for (const line of lines.slice(start, end).reverse()) {
    if (line.startsWith(commentChar)) {
      nonTrailer += possibleCont;
      possibleCont = 0;
      continue;
    }
    if (GIT_PREFIXES.some((x) => line.startsWith(x))) {
      trailerLines++;
      possibleCont = 0;
      recognized = true;
      continue;
    }
    if (TRAILER_RE.test(line)) {
      trailerLines++;
      possibleCont = 0;
    } else if (startsSpace(line.slice(0, 1))) possibleCont++;
    else {
      nonTrailer += 1 + possibleCont;
      possibleCont = 0;
    }
  }
  nonTrailer += possibleCont;
  if (!((recognized && trailerLines * 3 >= nonTrailer) || (trailerLines && !nonTrailer))) return [];
  const out = [];
  let current = null;
  for (const line of lines.slice(start, end).filter((l) => !l.startsWith(commentChar))) {
    const m = TRAILER_RE.exec(line);
    if (m) {
      current = [m[1], pyStrip(m[2])];
      out.push(current);
    } else if (startsSpace(line.slice(0, 1)) && current) {
      const extra = pyStrip(line);
      if (extra) current[1] = pyStrip(`${current[1]} ${extra}`);
    } else current = null;
  }
  return out;
}

export const JOB_AUTHOR = 'github-actions[bot]'; // asks_merge.BOT (governance/checks/asks_merge.py:76)

/**
 * Whether a merge is the asks-merge job's (J12): its merge commit's final trailer paragraph holds
 * exactly one `Merged-By` trailer (the key in any case), `orchestrator`, and its author's name is
 * `github-actions[bot]`, as the model's `merged_by_problems` checks (asks_merge.py:371-382). A `null`
 * merge commit is not the job's (false). A merge commit with no message string gives null: J12 has
 * not read it (J12's "lacks the field").
 */
export function isJobMerge(mergeCommit) {
  if (mergeCommit == null) return false;
  if (typeof mergeCommit !== 'object' || typeof mergeCommit.message !== 'string') return null;
  const author = mergeCommit.author && typeof mergeCommit.author.name === 'string' ? mergeCommit.author.name : null;
  const by = parseTrailers(mergeCommit.message).filter(([k]) => k.toLowerCase() === 'merged-by').map(([, v]) => v);
  return author === JOB_AUTHOR && by.length === 1 && by[0] === 'orchestrator';
}

// ---------------------------------------------------------------------------
// J12: the GraphQL answer, judged by the page (the function does not parse it).

/**
 * A pull request as the page keeps it (J12, "What the page keeps"): never the rest of its body, and
 * of its merge commit's message only `job`, whether the merge is the asks-merge job's (from
 * 2026-10-17; left out when J12's answer gives no message, so the entry reads as one J12 has not read).
 */
export function keptPull(n, checks) {
  const out = {
    number: n.number, title: n.title, state: n.state, mergedAt: n.mergedAt || null, createdAt: n.createdAt || null,
    head: typeof n.headRefName === 'string' ? n.headRefName : null,
    mergeCommit: n.mergeCommit && typeof n.mergeCommit.oid === 'string' ? n.mergeCommit.oid : null,
    checks, parts: prBodyParts(n.body),
  };
  const job = isJobMerge(n.mergeCommit);
  if (job !== null) out.job = job;
  return out;
}

/**
 * Whether J12 has read a kept pull request's merge (J12, AC60): a merged entry without the job's yes
 * or no (one kept before the key moved, or an answer with no message) has not been read, and is
 * placed only under a plan line that lists it, shown as a listed pull request J12 lacks.
 */
export const pullRead = (p) => Boolean(p) && (!p.mergedAt || typeof p.job === 'boolean');

/** The check rollup state of a node's last commit (J12): one of CHECK_STATES, or null. */
function rollupOf(n) {
  const nodes = n && n.commits && Array.isArray(n.commits.nodes) ? n.commits.nodes : [];
  const last = nodes[nodes.length - 1];
  const s = last && last.commit && last.commit.statusCheckRollup ? last.commit.statusCheckRollup.state : null;
  return CHECK_STATES.has(s) ? s : null;
}

/**
 * Judge one J12 answer (raw text, or null for a failed read). Returns
 * { ok: true, pulls: [kept], hasNext, cursor, fieldError } or { ok: false, rate, reason }:
 * - null, or not JSON: a failed read;
 * - an error whose `type` is RATE_LIMITED: a rate limit for J12 only (rate: true);
 * - `data` null or missing, or no `repository`: a failed read, the first error's message (or the answer's own) as the reason;
 * - an error whose `path` ends in the check rollup, with the rest of `data` present: the rest is used,
 *   each pull request's checks holding that error's message (AC60's "the desk's token can't read checks").
 */
export function judgePulls(raw) {
  if (raw == null) return { ok: false, rate: false, reason: "the pull requests' read failed: GitHub could not be reached" };
  let v;
  try {
    v = JSON.parse(raw);
  } catch {
    return { ok: false, rate: false, reason: "the pull requests' read failed: GitHub's answer is not JSON" };
  }
  const errors = v && Array.isArray(v.errors) ? v.errors : [];
  if (errors.some((e) => e && e.type === 'RATE_LIMITED')) {
    const e = errors.find((x) => x && x.type === 'RATE_LIMITED');
    return { ok: false, rate: true, reason: `GitHub's GraphQL rate limit: ${typeof e.message === 'string' ? e.message : 'no message'}` };
  }
  const repo = v && v.data && v.data.repository;
  const conn = repo && repo.pullRequests;
  if (!repo || !conn || !Array.isArray(conn.nodes)) {
    const first = errors.find((e) => e && typeof e.message === 'string');
    const msg = first ? first.message : v && typeof v.message === 'string' ? v.message : 'no repository in the answer';
    return { ok: false, rate: false, reason: `the pull requests' read failed: ${msg}` };
  }
  const fieldErr = errors.find((e) => e && Array.isArray(e.path) && e.path[e.path.length - 1] === 'statusCheckRollup');
  const fieldError = fieldErr ? (typeof fieldErr.message === 'string' ? fieldErr.message : 'no message') : null;
  const pulls = conn.nodes.filter((n) => n && Number.isInteger(n.number) && typeof n.title === 'string')
    .map((n) => keptPull(n, fieldError ? { error: fieldError } : { state: rollupOf(n) }));
  const info = conn.pageInfo || {};
  return { ok: true, pulls, hasNext: info.hasNextPage === true, cursor: typeof info.endCursor === 'string' ? info.endCursor : null, fieldError };
}

/** Merge a page into what is kept (J12): each one replaces the one kept under its number; at most 300, the newest by creation. */
export function mergePulls(kept, page) {
  const by = new Map((kept || []).map((p) => [p.number, p]));
  for (const p of page) by.set(p.number, p);
  return [...by.values()].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) || b.number - a.number).slice(0, PULLS_MAX);
}

/** A pull request's checks mark (AC60): { mark, word, why } from what J12 gave. */
export function checksMark(pr) {
  const c = pr && pr.checks;
  if (c && c.error) return { mark: '–', word: 'checks', why: `checks not recorded: ${CANT_READ_CHECKS}` };
  const s = c && c.state;
  if (s === 'SUCCESS') return { mark: '✓', word: 'checks', why: null };
  if (s === 'FAILURE' || s === 'ERROR') return { mark: '✕', word: 'checks', why: null };
  if (s === 'PENDING' || s === 'EXPECTED') return { mark: '…', word: 'checks', why: null };
  return { mark: '–', word: 'checks', why: `checks not recorded: ${NO_CHECKS}` };
}
