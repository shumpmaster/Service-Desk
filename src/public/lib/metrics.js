// The device's notes (spec S-001, AC25's first two parts as changed for M3B; J5's storage; stage VT2 of "The desk's value
// targets shown: M3B"): on each device, unseen, when the desk is open (its open windows, to the second) and when it first
// shows each thing waiting on the owner in a connected project (its first-shown time, once per AC73 key), and the owner's
// "Didn't need me" marks. They feed V1 (missed decisions) and V2 (false alarms) through VT3's weekly file.
//
// Kept on this device only, under `desk-metrics-v1`, through the wrapped store (src/lib/store.js; J5: "every read and write
// is wrapped so that a failure … shows "metrics not recorded on this device" and nothing else breaks"); nothing is stored on
// Cloudflare and no call is added. Each week's notes are kept 8 weeks from the week's end, the oldest dropped first. Pure
// apart from the store and the clock it is given.

import { dayKey, zonedToUtc } from './timefmt.js';

export const METRICS_KEY = 'desk-metrics-v1';
/** Weeks a week's notes are kept from its end (AC25, "Kept 8 weeks"). */
export const KEEP_WEEKS = 8;
/** What the targets' sheet says where the device keeps nothing (VT2's row). */
export const NOT_NOTED = 'Not noted on this device';
/** The control's words (AC25, "Didn't need me"; C, (k)). */
export const DNM_WORDS = Object.freeze({ mark: "Didn't need me", marked: 'Marked as not needing you', unmark: 'Unmark' });
const DAY = 86400e3;

/** Monday 00:00 in `tz` of the week holding `ms` (a Monday-to-Sunday week in `ownerTimeZone`, C, (l)), as a time. */
export const weekStart = (ms, tz) => weekStartAfter(ms, 0, tz);
/** Monday 00:00 in `tz` of the week `n` weeks after the one holding `ms` (n may be negative), by the calendar, so a change of
 * clocks in between moves no week's edge. */
export function weekStartAfter(ms, n, tz) {
  const k = dayKey(new Date(ms), tz);
  const d = new Date(`${k}T00:00:00Z`);
  const wd = (d.getUTCDay() + 6) % 7;
  const m = new Date(d.getTime() + (7 * n - wd) * DAY);
  return zonedToUtc(m.getUTCFullYear(), m.getUTCMonth() + 1, m.getUTCDate(), 0, 0, tz);
}
/** Monday 00:00 in `tz` of the week after the one holding `ms`. */
export const nextWeekStart = (ms, tz) => weekStartAfter(ms, 1, tz);
/**
 * The start of the oldest week still kept at `nowMs` (AC25, "Kept 8 weeks": each week's notes stay for 8 weeks from the week's
 * end): a week ending at the start of the week after it is dropped once 8 more weeks have begun and ended, so at `nowMs` the
 * weeks kept are the one holding it and the 8 before it.
 */
export const keptFrom = (nowMs, tz) => weekStartAfter(nowMs, -KEEP_WEEKS, tz);

/** A new device code: `d` and four hex digits (C, (n)). */
export function deviceCode(random = Math.random) {
  return `d${Math.floor(random() * 0x10000).toString(16).padStart(4, '0')}`;
}

/** The notes as kept, or null where what is kept is not in their form (then they start afresh). */
function readNotes(v) {
  if (!v || typeof v !== 'object' || v.v !== 1 || typeof v.device !== 'string' || !/^d[0-9a-f]{4}$/.test(v.device)) return null;
  const windows = Array.isArray(v.windows) ? v.windows.filter((w) => Array.isArray(w) && w.length === 2 && Number.isFinite(w[0]) && Number.isFinite(w[1]) && w[1] >= w[0]) : [];
  const times = (o) => Object.fromEntries(Object.entries(o && typeof o === 'object' ? o : {}).filter(([, t]) => Number.isFinite(t)));
  return { v: 1, device: v.device, from: typeof v.from === 'string' ? v.from : null, windows, shown: times(v.shown), marks: times(v.marks) };
}

/**
 * The device's notes. createMetrics({ store, now, tz, random }) → {
 *   off (the device keeps nothing: the store can't be read or written), device, notes,
 *   open() (a window starts: the page visible), close() (it ends: hidden, or unloaded), tick() (its end written again, every
 *   15 seconds while it is open), isOpen, openedAt (the open window's start, or null),
 *   shown(keys) (each key's first-shown time, now, once, only in an open window), hasShown(key),
 *   mark(key), unmark(key), isMarked(key) }.
 * A window open across Monday 00:00 in `tz` is split there. Each write prunes the weeks older than 8 from their end.
 */
export function createMetrics({ store, now, tz, random = Math.random }) {
  let notes = null;
  try {
    notes = readNotes(store ? store.getJSON(METRICS_KEY, null) : null);
  } catch {
    notes = null;
  }
  if (!notes) notes = { v: 1, device: deviceCode(random), from: dayKey(new Date(now()), tz), windows: [], shown: {}, marks: {} };
  let cur = -1; // the index of this opening's open window, or -1
  let openedAt = null; // when this opening's window started (before any Monday split), or null while closed
  let failed = false;
  const write = () => {
    prune();
    try {
      if (!store || store.setJSON(METRICS_KEY, notes) === false) failed = true;
    } catch {
      failed = true;
    }
  };
  /** Drop each week ended more than 8 weeks ago, the oldest first: its windows, first-shown times and marks. */
  function prune() {
    const from = keptFrom(now(), tz);
    const gone = (ms) => ms < from;
    const keepOpen = cur >= 0 ? notes.windows[cur] : null;
    notes.windows = notes.windows.filter((w) => w === keepOpen || !gone(w[0]));
    cur = keepOpen ? notes.windows.indexOf(keepOpen) : -1;
    for (const k of ['shown', 'marks']) notes[k] = Object.fromEntries(Object.entries(notes[k]).filter(([, at]) => !gone(at)));
  }
  /** The open window's end moved to `t`, split at each Monday 00:00 it crosses. */
  function extend(t) {
    if (cur < 0) return;
    let w = notes.windows[cur];
    for (let edge = nextWeekStart(w[0], tz); t >= edge; edge = nextWeekStart(edge, tz)) {
      w[1] = edge;
      w = [edge, edge];
      notes.windows.push(w);
      cur = notes.windows.length - 1;
    }
    w[1] = Math.max(w[0], t);
  }
  const m = {
    get off() {
      return failed || !store || !store.usable;
    },
    get device() {
      return notes.device;
    },
    get notes() {
      return notes;
    },
    get isOpen() {
      return cur >= 0;
    },
    /** When the window open now started, or null while none is open. */
    get openedAt() {
      return cur >= 0 ? openedAt : null;
    },
    open() {
      if (cur >= 0) return;
      const t = now();
      notes.windows.push([t, t]);
      cur = notes.windows.length - 1;
      openedAt = t;
      write();
    },
    tick() {
      if (cur < 0) return;
      extend(now());
      write();
    },
    close() {
      if (cur < 0) return;
      extend(now());
      cur = -1;
      write();
    },
    /** First shown: each key counted now, in an open window, not noted before on this device. */
    shown(keys) {
      if (cur < 0) return false;
      const t = now();
      let added = false;
      for (const k of keys) {
        if (typeof k !== 'string' || Object.prototype.hasOwnProperty.call(notes.shown, k)) continue;
        notes.shown[k] = t;
        added = true;
      }
      if (added) write();
      return added;
    },
    hasShown(key) {
      return Object.prototype.hasOwnProperty.call(notes.shown, key);
    },
    isMarked(key) {
      return Object.prototype.hasOwnProperty.call(notes.marks, key);
    },
    mark(key) {
      if (!m.hasShown(key) || m.isMarked(key)) return;
      notes.marks[key] = now();
      write();
    },
    unmark(key) {
      if (!m.isMarked(key)) return;
      delete notes.marks[key];
      write();
    },
  };
  return m;
}
