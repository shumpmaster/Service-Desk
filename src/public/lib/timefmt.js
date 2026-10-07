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
