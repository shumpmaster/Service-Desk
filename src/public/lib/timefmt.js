// Time formatting in the owner's time zone (J7 ownerTimeZone). Uses the runtime's Intl data.

const cache = new Map();
function parts(date, timeZone) {
  let f = cache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    });
    cache.set(timeZone, f);
  }
  const out = {};
  for (const p of f.formatToParts(date)) out[p.type] = p.value;
  return out;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** HH:MM in the zone. */
export function hhmm(date, timeZone) {
  const p = parts(date, timeZone);
  return `${p.hour}:${p.minute}`;
}

/** The calendar day in the zone, as YYYY-MM-DD. */
export function dayKey(date, timeZone) {
  const p = parts(date, timeZone);
  return `${p.year}-${p.month}-${p.day}`;
}

/** J9's `<t>`: HH:MM in the zone, with the date in front when it isn't today. */
export function whenText(date, now, timeZone) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'time not recorded';
  const p = parts(date, timeZone);
  const t = `${p.hour}:${p.minute}`;
  if (dayKey(date, timeZone) === dayKey(now, timeZone)) return t;
  return `${MONTHS[Number(p.month) - 1]} ${Number(p.day)} ${t}`;
}

/** Always with the date: "Oct 7 05:00" (for times that may not be today, such as a DEFAULT's). */
export function dateTimeText(date, timeZone) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'time not recorded';
  const p = parts(date, timeZone);
  return `${MONTHS[Number(p.month) - 1]} ${Number(p.day)} ${p.hour}:${p.minute}`;
}

/** A duration in words: 2 h 8 min, 45 min, 30 s. */
export function durationText(ms) {
  if (!Number.isFinite(ms) || ms < 0) return 'not recorded';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d} d ${h} h`;
  if (h > 0) return `${h} h ${m} min`;
  if (m > 0) return `${m} min`;
  return `${s} s`;
}

// ---------------------------------------------------------------------------
// V5's counting clock (J2, J7 v5Clock): only the overlap with the clock's windows counts.

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** The UTC time of a wall-clock time in the zone (window edges follow daylight-saving changes). */
export function zonedToUtc(y, mo, d, hh, mm, timeZone) {
  const wall = Date.UTC(y, mo - 1, d, hh, mm);
  let guess = wall;
  for (let i = 0; i < 3; i++) {
    const p = parts(new Date(guess), timeZone);
    const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute));
    const next = wall - (asUtc - guess);
    if (next === guess) break;
    guess = next;
  }
  return guess;
}

/**
 * The counted length of [startMs, endMs) (V5): its overlap with the clock's windows, computed day
 * by day in the zone. `clock` null means elapsed time, every day.
 */
export function countedMs(startMs, endMs, clock, timeZone) {
  if (!(endMs > startMs)) return 0;
  if (!clock) return endMs - startMs;
  const [fh, fm] = clock.from.split(':').map(Number);
  const [th, tm] = clock.to.split(':').map(Number);
  const days = new Set(clock.days);
  const p = parts(new Date(startMs), timeZone);
  let day = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day));
  let total = 0;
  for (let guard = 0; guard < 4000; guard++) {
    const dt = new Date(day);
    const y = dt.getUTCFullYear();
    const mo = dt.getUTCMonth() + 1;
    const d = dt.getUTCDate();
    const from = zonedToUtc(y, mo, d, fh, fm, timeZone);
    if (from >= endMs) break;
    if (days.has(WEEKDAYS[dt.getUTCDay()])) {
      const to = zonedToUtc(y, mo, d, th, tm, timeZone);
      total += Math.max(0, Math.min(to, endMs) - Math.max(from, startMs));
    }
    day += 86400e3;
  }
  return total;
}

/** The median of a list of numbers (the mean of the two middle ones for an even count), or null. */
export function median(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** AC21's form: "<h>h <m>m" (whole minutes). */
export function hoursMinutes(ms) {
  const m = Math.floor(ms / 60000);
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}
