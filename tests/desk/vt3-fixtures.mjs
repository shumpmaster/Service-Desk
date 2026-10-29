// VT3's fixtures (spec S-001, AC25's third part and J5 as changed for M3B; stage VT3 of "The desk's value targets shown:
// M3B"): every one made up, NOT a real record, and labelled so in tests/desk/fixtures/README.md. Service-Desk as VT1's state
// holds it (section 3 and 6 at 7b69b2b over its records at 77bfeae, real), with a made-up launch day or none, made-up
// dispatch-log cards in the week of Mon 9 Nov 2026, and the made-up portfolio (pf-fixtures.mjs) as J7's `portfolio`, its
// tree holding whichever made-up weekly files a test puts there; the device's notes (`desk-metrics-v1`) written by hand
// in lib/metrics.js's form, J5's own made-up example among them (its device d3fa2, its windows, items and mark).
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { vt1State, chi, isoZ } from './vt1-fixtures.mjs';
import { pfFiles, addPortfolio, withPortfolio } from './pf-fixtures.mjs';
import { METRICS_KEY } from '../../src/lib/metrics.js';
import { zonedToUtc } from '../../src/lib/timefmt.js';

export { chi, memStore, METRICS_KEY };
export const H = 3600e3;
export const MIN = 60e3;
export const S = 1000;
export const TZ = 'America/Chicago';
/** The made-up launch day these tests count from (NOT a plan: launch has no date, P-001-m3b-launch-date.md, A). */
export const LAUNCH_EARLY = '2026-11-02';
/** The clock: Mon 16 Nov 2026, 10:00 in Chicago, the week of 9 Nov just ended (made up). */
export const MON16 = chi('2026-11-16', '10:00');
/** A day's 00:00 in Chicago, as a time (through either offset: `chi` is winter's alone). */
export const MONDAY = (day) => zonedToUtc(Number(day.slice(0, 4)), Number(day.slice(5, 7)), Number(day.slice(8, 10)), 0, 0, TZ);
export const DEVICE = 'd3fa2';

/** A UTC time, written. */
export const z = (iso) => Date.parse(iso);

/**
 * J5's own made-up week (the spec's example, NOT a real record), the week of Mon 9 Nov 2026: its windows (some ending at
 * .999 of a second, to be cut, never rounded), its two first-shown items and its one mark; the notes start on 10 Nov.
 */
export const J5_WEEK = Object.freeze({
  windows: [[z('2026-11-10T13:02:11.000Z'), z('2026-11-10T13:09:40.999Z')], [z('2026-11-10T18:15:03.500Z'), z('2026-11-10T18:20:57.999Z')],
    [z('2026-11-11T12:58:30.000Z'), z('2026-11-11T13:31:02.000Z')]],
  shown: { 'Service-Desk|card|queue/P-002-dor-1.md': z('2026-11-10T13:03:05.999Z'), 'Personal-Org-Operating-Model|pr|42': z('2026-11-10T18:16:40.000Z') },
  marks: { 'Service-Desk|pr|251': z('2026-11-10T18:17:02.000Z') },
});
/** J5's example file for that week, word for word, as the device in J5_WEEK writes it (a week after launch). */
export const J5_FILE = `Week: 2026-W46 (the week of 9 Nov)   Device: d3fa2
V5 median (weekday cards): 2h 10m over 7 cards
Records from: 2026-11-10
## Open windows (UTC)
2026-11-10: 13:02:11-13:09:40, 18:15:03-18:20:57
2026-11-11: 12:58:30-13:31:02
## First shown (UTC)
- 2026-11-10T13:03:05Z Service-Desk|card|queue/P-002-dor-1.md
- 2026-11-10T18:16:40Z Personal-Org-Operating-Model|pr|42
## Didn't need me (UTC)
- 2026-11-10T18:17:02Z Service-Desk|pr|251
`;

/** The device's notes in lib/metrics.js's form (made up). */
export function notesOf({ device = DEVICE, from = '2026-11-10', windows = [], shown = {}, marks = {} } = {}) {
  return { v: 1, device, from, windows: windows.map((w) => [...w]), shown: { ...shown }, marks: { ...marks } };
}
/** A store holding `notes` (and `extra`). */
export const storeWith = (notes, extra = {}) => memStore({ [METRICS_KEY]: JSON.stringify(notes), ...extra });
/** A made-up window in a week, a day key and Chicago times. */
export const win = (day, from, to) => [chi(day, from), chi(day, to)];
/** One made-up window in each of the weeks whose Mondays are given (Tuesday 09:00 to 09:30 in Chicago). */
export const weeksOfWindows = (mondays) => mondays.map((m) => {
  const tue = new Date(Date.parse(`${m}T00:00:00Z`) + 86400e3).toISOString().slice(0, 10);
  return win(tue, '09:00', '09:30');
});

/**
 * The week of 9 Nov's made-up cards (NOT real records), weekday cards raised in Chicago: six answered within the day (1h,
 * 1h 30m, 2h 10m, 2h 30m, 3h, 3h 30m) and one raised Fri 13 Nov 20:00, open at the week's end, counted 2h (to 22:00; the
 * weekend not counted; counted to the clock, Mon 16 Nov 10:00, it would be 5h): the median 2h 10m over 7 cards. One raised
 * the Sunday before and one the Monday after fall outside.
 */
export function weekCards() {
  const c = (n, day, at, h) => ({ n, raised: chi(day, at), answered: h == null ? null : chi(day, at) + h * H });
  return [c(200, '2026-11-08', '23:00', 0.5), c(201, '2026-11-09', '09:00', 1), c(202, '2026-11-10', '09:00', 1.5), c(203, '2026-11-10', '13:00', 3.5),
    c(204, '2026-11-11', '09:00', 2 + 1 / 6), c(205, '2026-11-12', '09:00', 2.5), c(206, '2026-11-13', '09:00', 3), c(207, '2026-11-13', '20:00', null),
    c(208, '2026-11-16', '08:00', 0.25)];
}

/**
 * VT3's state: Service-Desk launched on `launch` (null: before launch), November's dispatch log holding `cards`, the made-up
 * portfolio as J7's `portfolio` (with `pfConf`'s keys, which J7's check refuses beyond `repo` and `defaultBranch`) whose tree also holds
 * `pfMore` (made-up weekly files), and J7's `linkCap` as given. `portfolio: false` leaves J7's `portfolio` out.
 */
export function vt3State({ launch = LAUNCH_EARLY, cards = weekCards(), pfMore = {}, pfConf = {}, linkCap = null, portfolio = true } = {}) {
  const st = vt1State({ launch, nov: cards });
  if (linkCap != null) st.config = { ...st.config, linkCap };
  if (!portfolio) return st;
  const c = withPortfolio(st.config);
  st.config = { ...c, portfolio: { ...c.portfolio, ...pfConf } };
  st.pf = addPortfolio(st.repos, pfFiles({ more: pfMore }));
  return st;
}
/** A made-up weekly file in the portfolio's tree for `monday`'s week from `device` (its text made up, NOT a real record). */
export const landed = (path) => ({ [path]: 'Week: made up for VT3\'s tests (NOT a real record)\n' });

/** The page opened on `st` at `now` with `store`, read twice (the projects and the portfolio). */
export async function vt3Open(st, { hash = '#/', now = MON16, store = memStore() } = {}) {
  const app = await loadSandbox({ ...st, hash, now, store });
  await app.advance(1000);
  await app.advance(61_000);
  app.store = store;
  return app;
}
export const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
export const weeklyLine = (app) => keyed(app, 'home-weekly');
export const weeklyBlock = (app) => keyed(app, 'vt-weekly');
export const sheetOf = (app) => byClass(app.view, 'v2-sheet')[0] || null;
/** Each week's "Save the week of …" link in the block, in order: { text, href, file (its file name), content (its prefilled text, or null) }. */
export function saveLinks(app) {
  const b = weeklyBlock(app);
  if (!b) return [];
  return findAll(b, (e) => e.tag === 'a').map((a) => {
    const u = new URL(a.attrs.href);
    return { text: a.textContent, href: a.attrs.href, file: u.searchParams.get('filename'), content: u.searchParams.get('value'), el: a };
  });
}
export { isoZ };

// ---------------------------------------------------------------------------
// VT3_OPENS: the screens VT3's cascade checks walk (tests/desk/ac88-dark.test.mjs), page loads kept few (the suite's
// memory: two), each [where, open() → app, [[hash, prepare(app)?]]]. Made up, NOT real.

/** Eight weeks' made-up notes, 21 Sep to 9 Nov: the most a device keeps; with launch made up as Wed 4 Nov, six before launch. */
export const EIGHT = ['2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09'];
export const VT3_OPENS = [
  ['one week (made up): Home\'s foot with "Last week\'s desk figures are ready to save", then the sheet\'s "Your weekly figures"',
    () => vt3Open(vt3State(), { store: storeWith(notesOf({ ...J5_WEEK })) }), [['#/'], ['#/p/Service-Desk/values/weekly']]],
  ['eight weeks (made up), six before launch: "8 weeks of …", and the block with its trial weeks grouped and AC17\'s Copy past `linkCap`',
    () => vt3Open(vt3State({ launch: '2026-11-04', linkCap: 200 }), { store: storeWith(notesOf({ from: '2026-09-21', windows: weeksOfWindows(EIGHT) })) }),
    [['#/'], ['#/p/Service-Desk/values/weekly']]],
];
