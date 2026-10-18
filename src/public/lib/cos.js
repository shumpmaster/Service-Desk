// J13 (spec S-001, MD sandbox, page side; added 2026-10-17, model S-033 AC6 and its J3, adopted as
// L-0016): the Chief of Staff's session lines, sessions/chief-of-staff/<session id>.jsonl, read into
// pieces of work for its Team tile, running log and Working now sheet, and who has the ball (AC49,
// AC67). Pure: no network, no DOM. Every file is an optional J11 read: it never makes a project
// "Can't read" and never holds "Quiet" back.
//
// The page mirrors these of the model's findings (`v3_checks sessions`: `_one_object`, `_count`,
// `session_line_problems`, governance/checks/v3_checks.py:2073-2140) and names and skips such a
// line, the rest of its file still used. It does not mirror, and reads as written: a repeated key,
// a whole number written with a fraction or an exponent, one above 2^53, a time earlier than the
// line before, a line changed since a base, a badly named file (ignored by the path rule) and text
// that is not UTF-8 (C; the project's own CI fails each). An end line's `usage` is read by J10's
// one rule and never skips its line.

import { USAGE_KEYS, USAGE_OTHER_KEYS } from './records.js';
import { pyStrip } from './pulls.js';

// A key of a parsed line is read only when the line holds it itself: never one inherited from
// Object.prototype, so an `event` of "constructor", "__proto__" or "toString" is an unknown event
// (build review round 1, B1), as the model's dict lookup has it.
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

export const SESSIONS_DIR = 'sessions/chief-of-staff/';
export const SESSION_PATH_RE = /^sessions\/chief-of-staff\/([A-Za-z0-9_-]{1,100})\.jsonl$/; // v3_checks SESSION_FILE_RE
export const COS_OPEN_MS = 8 * 3600e3; // J13's limit (C): a start older than this with no end reads "ended, time not recorded"
export const NOT_RECORDED = 'not recorded';
export const ENDED_UNRECORDED = 'ended, time not recorded';
const KEYS = {
  start: ['event', 'session', 'time', 'doing'],
  helper: ['event', 'session', 'role', 'started', 'ended', 'reported'],
  end: ['event', 'session', 'time', 'usage'],
};
export const REPORTED_KEYS = ['tokens', 'tool_uses', 'duration_ms'];
const UTC_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(?:Z|\+00:00)$/;

/** The session id of a session file's path, or null (any other path under sessions/ is ignored). */
export function sessionIdOf(path) {
  const m = SESSION_PATH_RE.exec(String(path));
  return m ? m[1] : null;
}

/**
 * A UTC ISO-8601 time as the model reads it (`utc_time`): `yyyy-mm-ddThh:mm:ss`, an optional
 * fraction, then `Z` or `+00:00`, and a real date and time. Milliseconds, or null.
 */
export function utcTime(v) {
  const p = utcParts(v);
  return p ? p.ms : null;
}

/**
 * A UTC time to the microsecond, as the model's `utc_time` keeps it (the fraction's first six
 * digits): { ms, us } (us: the microseconds past ms, 0 to 999), or null. Years 0001 to 0099 are
 * real years, as Python's datetime has them (build review round 1, N3).
 */
export function utcParts(v) {
  const m = typeof v === 'string' ? UTC_RE.exec(v) : null;
  if (!m) return null;
  const [y, mo, d, h, mi, s] = m.slice(1, 7).map(Number);
  const frac = Number((m[7] || '0').slice(0, 6).padEnd(6, '0'));
  if (y < 1 || mo < 1 || mo > 12 || d < 1 || h > 23 || mi > 59 || s > 59) return null;
  // setUTCFullYear takes the year as written (Date.UTC would read 0 to 99 as 1900 to 1999).
  const x = new Date(0);
  x.setUTCFullYear(y, mo - 1, d);
  x.setUTCHours(h, mi, s, Math.floor(frac / 1000));
  if (x.getUTCFullYear() !== y || x.getUTCMonth() !== mo - 1 || x.getUTCDate() !== d) return null;
  return { ms: x.getTime(), us: frac % 1000 };
}
const laterThan = (a, b) => a.ms > b.ms || (a.ms === b.ms && a.us > b.us);

const isCount = (v) => v === null || (typeof v === 'number' && Number.isInteger(v) && v >= 0);
// Python's `obj[k].strip()`: a string holding a character other than white space, in Python's sense (N1).
const filled = (v) => typeof v === 'string' && pyStrip(v).length > 0;

/**
 * Why one parsed line is out of form, in the findings the page mirrors (J13), or null. `sid` is
 * the file's session id.
 */
export function lineProblem(sid, obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return 'not one JSON object';
  if (!own(obj, 'event')) return 'missing key event';
  if (typeof obj.event !== 'string') return 'event is not a string';
  const keys = own(KEYS, obj.event) ? KEYS[obj.event] : null;
  if (!keys) return `unknown event ${JSON.stringify(obj.event)} (start, helper or end)`;
  const missing = keys.filter((k) => !own(obj, k));
  if (missing.length) return `missing key ${missing.join(', ')}`;
  const extra = Object.keys(obj).filter((k) => !keys.includes(k)).sort();
  if (extra.length) return `extra key ${extra.join(', ')}`;
  if (typeof obj.session !== 'string') return 'session is not a string';
  if (obj.session !== sid) return `the file's name is not its lines' session (${JSON.stringify(obj.session)})`;
  for (const k of ['doing', 'role']) if (keys.includes(k) && !filled(obj[k])) return `${k} is not a string holding a character other than white space`;
  for (const k of ['time', 'started', 'ended']) if (keys.includes(k) && utcTime(obj[k]) == null) return `${k} ${JSON.stringify(obj[k])} is not UTC ISO-8601 (yyyy-mm-ddThh:mm:ssZ)`;
  if (obj.event === 'helper') {
    const rep = obj.reported;
    if (!rep || typeof rep !== 'object' || Array.isArray(rep)) return 'reported is not an object';
    const rm = REPORTED_KEYS.filter((k) => !own(rep, k));
    if (rm.length) return `reported: missing key ${rm.join(', ')}`;
    const rx = Object.keys(rep).filter((k) => !REPORTED_KEYS.includes(k)).sort();
    if (rx.length) return `reported: extra key ${rx.join(', ')}`;
    const bad = REPORTED_KEYS.filter((k) => !isCount(rep[k]));
    if (bad.length) return `reported ${bad.join(', ')}: not a whole number of 0 or more, or null`;
    if (laterThan(utcParts(obj.started), utcParts(obj.ended))) return 'the helper started after it ended';
  }
  return null;
}

/**
 * An end line's `usage`, by J10's one rule (J13): each figure its value, or "not recorded" for
 * `null` (AC23's exception for session lines: a figure no record holds), for a key missing, and for
 * a value of the wrong kind; an extra key ignored. Each but `null` is named. A `usage` that is not
 * an object gives every figure "not recorded", named once. J10's looser bounds: no upper bound, and
 * `derived` any list of names.
 */
export function readUsage(u, where) {
  const notes = [];
  const out = {};
  const all = [...USAGE_KEYS, ...USAGE_OTHER_KEYS];
  if (!u || typeof u !== 'object' || Array.isArray(u)) {
    for (const k of all) out[k] = NOT_RECORDED;
    notes.push(`${where}: its usage is not an object; every figure shown as not recorded`);
    return { usage: out, notes };
  }
  for (const k of all) {
    if (!own(u, k)) {
      out[k] = NOT_RECORDED;
      notes.push(`${where}: usage.${k} is missing; shown as not recorded`);
      continue;
    }
    const x = u[k];
    if (x === null) {
      out[k] = NOT_RECORDED;
      continue;
    }
    let ok;
    if (k === 'derived') ok = Array.isArray(x) && x.every((n) => typeof n === 'string');
    else if (k === 'would_have_stopped') ok = typeof x === 'boolean';
    else if (k === 'cost_usd_estimate') ok = typeof x === 'number' && Number.isFinite(x) && x >= 0;
    else ok = typeof x === 'number' && Number.isInteger(x) && x >= 0;
    if (ok) out[k] = Array.isArray(x) ? [...x] : x;
    else {
      out[k] = NOT_RECORDED;
      notes.push(`${where}: usage.${k} is of the wrong kind; shown as not recorded`);
    }
  }
  for (const k of Object.keys(u).filter((x) => !all.includes(x)).sort()) notes.push(`${where}: usage.${k} is not a usage key; ignored`);
  return { usage: out, notes };
}

/**
 * One session file, as the page caches it by blob sha (J13): { session, lines: [{ n, event, at,
 * … }], notes }. Lines split on LF, a final empty one dropped (the model's `_session_lines`); each
 * line read with JSON.parse; one the page mirrors a finding for is named in `notes` (file, line,
 * reason) and skipped.
 */
export function parseSessionFile(text, path) {
  const sid = sessionIdOf(path);
  const parts = String(text == null ? '' : text).split('\n');
  if (parts.length && parts[parts.length - 1] === '') parts.pop();
  const lines = [];
  const notes = [];
  parts.forEach((raw, i) => {
    const n = i + 1;
    const where = `${path} line ${n}`;
    let obj;
    try {
      obj = JSON.parse(raw);
    } catch {
      obj = undefined;
    }
    const why = obj === undefined ? 'not one JSON object' : lineProblem(sid, obj);
    if (why) {
      notes.push(`${where}: ${why}; skipped`);
      return;
    }
    // raw: the line as written, which a row's summary sheet quotes (AC49).
    if (obj.event === 'start') lines.push({ n, event: 'start', at: utcTime(obj.time), time: obj.time, doing: obj.doing, raw });
    else if (obj.event === 'helper') {
      lines.push({ n, event: 'helper', role: obj.role, started: obj.started, ended: obj.ended, startedAt: utcTime(obj.started), at: utcTime(obj.ended),
        reported: { tokens: obj.reported.tokens, tool_uses: obj.reported.tool_uses, duration_ms: obj.reported.duration_ms }, raw });
    } else {
      const u = readUsage(obj.usage, where);
      notes.push(...u.notes);
      lines.push({ n, event: 'end', at: utcTime(obj.time), time: obj.time, usage: u.usage, raw });
    }
  });
  return { session: sid, lines, notes };
}

/**
 * The pieces of work of one parsed file (S-033's J3), in its line order: a start opens one; the
 * next end closes it at its time; a start after a start with no end between closes the earlier one
 * as "ended, time not recorded"; an end with no open piece closes nothing and stands on its own
 * (`orphans`); a helper belongs to the piece most recently opened before it, or to none
 * (`looseHelpers`). Under way: no end, no later start, and its start less than 8 hours before now
 * (a start later than now is under way); from 8 hours, "ended, time not recorded".
 */
export function piecesOf(file, path, nowMs) {
  const pieces = [];
  const orphans = [];
  const looseHelpers = [];
  let open = null;
  let last = null;
  for (const l of file.lines) {
    if (l.event === 'start') {
      if (open) open.unrecorded = true;
      open = { path, session: file.session, start: l, helpers: [], end: null, unrecorded: false };
      pieces.push(open);
      last = open;
    } else if (l.event === 'helper') {
      if (last) last.helpers.push(l);
      else looseHelpers.push({ path, session: file.session, line: l });
    } else if (open) {
      open.end = l;
      open = null;
    } else orphans.push({ path, session: file.session, line: l });
  }
  for (const p of pieces) {
    if (p.end || p.unrecorded) p.state = p.end ? 'ended' : 'unrecorded';
    else p.state = nowMs - p.start.at < COS_OPEN_MS ? 'working' : 'unrecorded';
  }
  return { pieces, orphans, looseHelpers };
}

/**
 * Every session file of the project together (J13; AC49): { state, files, pieces, orphans,
 * looseHelpers, notes, missing } from the tree and the records as last read. state: 'none' (no
 * session file in the tree), 'reading' (some not read yet, or a read failed: "not available"), or
 * 'ok'. Pieces are in start order across files.
 */
export function cosSessions(snap, nowMs) {
  const tree = (snap && snap.tree) || new Map();
  const records = (snap && snap.records) || new Map();
  const paths = [...tree.keys()].filter((p) => SESSION_PATH_RE.test(p)).sort();
  const out = { state: paths.length ? 'ok' : 'none', paths, pieces: [], orphans: [], looseHelpers: [], notes: [], missing: [] };
  for (const p of paths) {
    const rec = records.get(p);
    if (!rec || !Array.isArray(rec.lines)) {
      out.missing.push(p);
      continue;
    }
    out.notes.push(...rec.notes);
    const r = piecesOf(rec, p, nowMs);
    out.pieces.push(...r.pieces);
    out.orphans.push(...r.orphans);
    out.looseHelpers.push(...r.looseHelpers);
  }
  if (out.missing.length) out.state = 'reading';
  out.pieces.sort((a, b) => a.start.at - b.start.at);
  return out;
}

/** Every helper line, with its piece (or none), for the members' tiles and logs (AC49, AC67). */
export function helperLines(cs) {
  return [...cs.pieces.flatMap((p) => p.helpers.map((line) => ({ line, piece: p, path: p.path }))),
    ...cs.looseHelpers.map((x) => ({ line: x.line, piece: null, path: x.path }))];
}

/** The latest end line's time, any end line's (a piece's or one with no open piece), or null. */
export function latestEndAt(cs) {
  const ts = [...cs.pieces.filter((p) => p.end).map((p) => p.end.at), ...cs.orphans.map((o) => o.line.at)].filter(Number.isFinite);
  return ts.length ? Math.max(...ts) : null;
}
