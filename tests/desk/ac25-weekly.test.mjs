// ac-test: S-001/AC25 — the weekly file and its offer, pure (stage VT3 of "The desk's value targets shown: M3B"; AC25's third
// part as changed for M3B): the file's path and body exactly in J5's form for a made-up week (J5's own example), every
// connected project's items by key, the open times one line a day to the second, cut from the device's milliseconds and
// never rounded (:59.999 written :59), the week's V5 line, "Records from" only where the notes start after the week's Monday,
// and a week before launch's trial line; one file a device; each skipped week its own file, offered together; the offer by
// its one condition (a finished week this device keeps notes for, from Monday 00:00 in `ownerTimeZone`, with no file from
// this device in the portfolio's tree), its three wordings, the weeks before launch's week grouped as a trial; and the link
// in J3's form against the portfolio repository, AC17's Copy past `linkCap` and with `contentPrefill: false`, and AC18's
// words with `webCommitsToDefault: false`.
// join-test: S-001/J5 — the weekly file as J5 (changed for M3B) writes it: `metrics/service-desk/<YYYY>-W<ww>-<device>.md` in
// J7's `portfolio` repository, in its form.
// Every time, key and device here is made up, NOT a real record (tests/desk/fixtures/README.md, VT3).
import test from 'node:test';
import assert from 'node:assert/strict';
import { isoWeek, weekPath, weekFile, notedWeeks, weeklyOffer, weekLink, portfolioTarget, v5Line, isoCut, WEEKLY_WORDS, WEEKLY_DIR } from '../../src/lib/weekly.js';
import { newFileUrl } from '../../src/lib/links.js';
import { J5_WEEK, J5_FILE, notesOf, TZ, MONDAY, z, chi, weeksOfWindows, H, MIN, S } from './vt3-fixtures.mjs';

const W46 = MONDAY('2026-11-09'); // Mon 9 Nov 2026 00:00 in Chicago (06:00Z)
const MON16 = MONDAY('2026-11-16');
const V5_7 = { ms: 130 * MIN, k: 7, words: null };

test('J5 + AC25: the week\'s file exactly in J5\'s form (J5\'s own made-up example): its path in the portfolio repository, the week\'s ISO name and "the week of 9 Nov", the device, the V5 line, "Records from", the open times one line a day, every item by its AC73 key, the marks', () => {
  assert.equal(WEEKLY_DIR, 'metrics/service-desk');
  assert.equal(weekPath('2026-11-09', 'd3fa2'), 'metrics/service-desk/2026-W46-d3fa2.md');
  assert.equal(weekFile({ notes: notesOf({ ...J5_WEEK }), start: W46, tz: TZ, trial: false, v5: V5_7 }), J5_FILE);
  // The ISO week of the week's Monday: the year of its Thursday (53 weeks in 2026; 4 Jan 2027 the first of 2027).
  assert.deepEqual(['2026-01-05', '2026-11-09', '2026-12-28', '2027-01-04', '2025-12-29'].map(isoWeek), ['2026-W02', '2026-W46', '2026-W53', '2027-W01', '2026-W01']);
});

test('J5 + AC25: times written cut to the second from the device\'s milliseconds, never rounded (12:00:59.999 is 12:00:59); a day with no window has no line; a day\'s windows in order, joined by ", "; one across midnight UTC split there; a zero-length window left out; only the week\'s own windows and items', () => {
  assert.equal(isoCut(z('2026-11-10T12:00:59.999Z')), '2026-11-10T12:00:59Z');
  const notes = notesOf({
    from: '2026-11-01',
    windows: [
      [z('2026-11-12T23:59:30.999Z'), z('2026-11-13T00:00:10.500Z')], // across midnight UTC
      [z('2026-11-12T12:00:00.999Z'), z('2026-11-12T12:00:59.999Z')],
      [z('2026-11-12T08:00:00.000Z'), z('2026-11-12T08:00:00.000Z')], // no length
      [z('2026-11-12T09:00:00.000Z'), z('2026-11-12T09:30:00.000Z')],
      [z('2026-11-05T09:00:00.000Z'), z('2026-11-05T09:30:00.000Z')], // the week before
      [W46 + 7 * 24 * H, W46 + 7 * 24 * H + MIN], // the week after (Mon 16 Nov 00:00 Chicago)
    ],
    shown: { 'Alpha|pr|1': z('2026-11-12T12:00:59.999Z'), 'Alpha|pr|0': z('2026-11-05T12:00:00Z'), 'Beta|card|queue/x.md': z('2026-11-12T12:00:59.999Z') },
    marks: { 'Alpha|pr|1': z('2026-11-13T00:00:00.999Z'), 'Alpha|pr|9': W46 - 1 },
  });
  assert.equal(weekFile({ notes, start: W46, tz: TZ, v5: { ms: null, k: 0, words: 'no weekday cards' } }), [
    'Week: 2026-W46 (the week of 9 Nov)   Device: d3fa2',
    'V5 median (weekday cards): no weekday cards',
    '## Open windows (UTC)',
    '2026-11-12: 09:00:00-09:30:00, 12:00:00-12:00:59, 23:59:30-24:00:00',
    '2026-11-13: 00:00:00-00:00:10',
    '## First shown (UTC)',
    '- 2026-11-12T12:00:59Z Alpha|pr|1',
    '- 2026-11-12T12:00:59Z Beta|card|queue/x.md',
    "## Didn't need me (UTC)",
    '- 2026-11-13T00:00:00Z Alpha|pr|1',
  ].join('\n') + '\n', 'no "Records from" where the notes start before the week\'s Monday; the week\'s edges in Chicago');
  // A window starting on the week's last second in Chicago is the week's; one starting at Monday 00:00 the next week's.
  const edge = notesOf({ from: '2026-11-01', windows: [[MON16 - 1000, MON16], [MON16, MON16 + 5000]] });
  assert.match(weekFile({ notes: edge, start: W46, tz: TZ }), /\n2026-11-16: 05:59:59-06:00:00\n## First shown/);
});

test('J5: "Records from" only where the notes start after the week\'s Monday (storage cleared, or a new device); a week before launch\'s file has its trial line under its first line; V5\'s line in each of its forms', () => {
  const base = { ...J5_WEEK };
  assert.match(weekFile({ notes: notesOf({ ...base, from: '2026-11-12' }), start: W46, tz: TZ, v5: V5_7 }), /\nRecords from: 2026-11-12\n/);
  assert.doesNotMatch(weekFile({ notes: notesOf({ ...base, from: '2026-11-09' }), start: W46, tz: TZ, v5: V5_7 }), /Records from/, 'from the Monday itself: none');
  assert.doesNotMatch(weekFile({ notes: notesOf({ ...base, from: '2026-10-01' }), start: W46, tz: TZ, v5: V5_7 }), /Records from/);
  const trial = weekFile({ notes: notesOf({ ...base }), start: W46, tz: TZ, trial: true, v5: V5_7 }).split('\n');
  assert.deepEqual(trial.slice(0, 3), ['Week: 2026-W46 (the week of 9 Nov)   Device: d3fa2', 'Before launch: a trial, not counted', 'V5 median (weekday cards): 2h 10m over 7 cards']);
  assert.equal(v5Line({ ms: 61 * MIN + 59 * S, k: 1, words: null }), 'V5 median (weekday cards): 1h 01m over 1 card', 'cut to the minute, never rounded; one card');
  assert.equal(v5Line({ ms: null, k: 0, words: 'no weekday cards' }), 'V5 median (weekday cards): no weekday cards');
  assert.equal(v5Line({ ms: null, k: 0, words: 'not available until Alpha has been read' }), 'V5 median (weekday cards): not available until Alpha has been read');
});

test('AC25: the weeks offered — each finished week this device keeps notes for, newest first, from Monday 00:00 in Chicago (not before), never the week running; a week with no notes (the desk not opened) none; kept 8 weeks', () => {
  const notes = notesOf({ windows: weeksOfWindows(['2026-10-26', '2026-11-09']), shown: { 'Alpha|pr|1': chi('2026-11-17', '10:00') } });
  // Sunday 15 Nov 23:59:59.999 in Chicago: the week of 9 Nov is still running.
  assert.deepEqual(notedWeeks(notes, MON16 - 1, TZ), [MONDAY('2026-10-26')]);
  // Monday 00:00: it is finished; the week of 2 Nov (no notes) is never offered; the week of 16 Nov (running) not yet.
  assert.deepEqual(notedWeeks(notes, MON16, TZ), [W46, MONDAY('2026-10-26')]);
  // A week dropped after 8 weeks from its end is no longer offered: the week of 26 Oct ends 2 Nov, kept to 28 Dec.
  assert.deepEqual(notedWeeks(notes, MONDAY('2026-12-28') - 1, TZ), [MONDAY('2026-11-16'), W46, MONDAY('2026-10-26')]);
  assert.deepEqual(notedWeeks(notes, MONDAY('2026-12-28'), TZ), [MONDAY('2026-11-16'), W46]);
  // A week noted only by a first-shown note, or only by a mark, is offered too; a window of no length is no note.
  assert.deepEqual(notedWeeks(notesOf({ marks: { k: chi('2026-11-03', '10:00') } }), MON16, TZ), [MONDAY('2026-11-02')]);
  assert.deepEqual(notedWeeks(notesOf({ windows: [[chi('2026-11-03', '10:00'), chi('2026-11-03', '10:00')]] }), MON16, TZ), []);
});

test('AC25: the offer by its one condition — gone once the portfolio\'s tree holds every offered week\'s file for this device, back while the notes are kept if one is deleted; its words: "Last week\'s …", "A week of …" (last week saved, an older one not), "<k> weeks of …"; one file a device; each skipped week its own file', () => {
  const notes = notesOf({ from: '2026-10-01', windows: weeksOfWindows(['2026-10-19', '2026-11-02', '2026-11-09']) });
  const offer = (tree, n = notes) => weeklyOffer({ notes: n, off: false, nowMs: MON16, tz: TZ, launch: '2026-10-01', tree: new Map(tree.map((p) => [p, {}])) });
  const p = (m, d = 'd3fa2') => weekPath(m, d);
  const all = offer([]);
  assert.equal(all.line, '3 weeks of desk figures are ready to save');
  assert.deepEqual(all.weeks.map((w) => [w.monday, w.path, w.words]), [['2026-11-09', p('2026-11-09'), 'Save the week of 9 Nov'], ['2026-11-02', p('2026-11-02'), 'Save the week of 2 Nov'],
    ['2026-10-19', p('2026-10-19'), 'Save the week of 19 Oct']], 'newest first; the skipped weeks each their own file (none for the week of 26 Oct, not noted)');
  assert.ok(all.weeks.every((w) => w.content.startsWith(`Week: ${isoWeek(w.monday)} (the week of `)), 'each its own week\'s file');
  assert.equal(offer([p('2026-10-19'), p('2026-11-02')]).line, WEEKLY_WORDS.last, 'only last week: "Last week\'s desk figures are ready to save"');
  assert.equal(WEEKLY_WORDS.last, "Last week's desk figures are ready to save");
  assert.equal(offer([p('2026-11-09'), p('2026-11-02')]).line, 'A week of desk figures is ready to save', 'last week saved, an older week deleted');
  assert.equal(offer([p('2026-11-09'), p('2026-11-02'), p('2026-10-19')]), null, 'gone once every file is in the tree');
  // One file a device: another device's files leave this device's weeks offered, and its own path names it.
  assert.equal(offer([p('2026-11-09', 'd0001'), p('2026-11-02', 'd0001'), p('2026-10-19', 'd0001')]).weeks.length, 3);
  const other = offer([], { ...notes, device: 'd0001' });
  assert.deepEqual(other.weeks.map((w) => w.path), [p('2026-11-09', 'd0001'), p('2026-11-02', 'd0001'), p('2026-10-19', 'd0001')]);
  // Nothing offered where the device keeps nothing, the tree isn't read, or there are no notes.
  assert.equal(weeklyOffer({ notes, off: true, nowMs: MON16, tz: TZ, launch: null, tree: new Map() }), null, 'storage throwing: nothing offered');
  assert.equal(weeklyOffer({ notes, off: false, nowMs: MON16, tz: TZ, launch: null, tree: null }), null, 'the tree not read');
  assert.equal(weeklyOffer({ notes: null, off: false, nowMs: MON16, tz: TZ, launch: null, tree: new Map() }), null);
});

test('AC25: the weeks before launch\'s week offered as a trial (all of them before launch), from launch\'s week on counted; each trial week\'s file with its trial line', () => {
  const notes = notesOf({ from: '2026-10-01', windows: weeksOfWindows(['2026-10-26', '2026-11-02', '2026-11-09']) });
  const at = (launch) => weeklyOffer({ notes, off: false, nowMs: MON16, tz: TZ, launch, tree: new Map() }).weeks.map((w) => [w.monday, w.trial]);
  assert.deepEqual(at(null), [['2026-11-09', true], ['2026-11-02', true], ['2026-10-26', true]], 'no reached date: every week a trial');
  assert.deepEqual(at('2026-11-04'), [['2026-11-09', false], ['2026-11-02', false], ['2026-10-26', true]], 'launch on Wed 4 Nov: its week counted');
  assert.deepEqual(at('2026-11-02'), [['2026-11-09', false], ['2026-11-02', false], ['2026-10-26', true]], 'launch on a Monday');
  assert.deepEqual(at('2026-11-01'), [['2026-11-09', false], ['2026-11-02', false], ['2026-10-26', false]], 'launch on Sun 1 Nov, the week of 26 Oct\'s last day');
  const w = weeklyOffer({ notes, off: false, nowMs: MON16, tz: TZ, launch: '2026-11-04', tree: new Map() }).weeks;
  assert.match(w[2].content, /^Week: 2026-W44 \(the week of 26 Oct\)   Device: d3fa2\nBefore launch: a trial, not counted\n/);
  assert.doesNotMatch(w[0].content, /Before launch/);
});

test('J3 + AC17 + AC18: a week\'s link — J3\'s form against the portfolio repository\'s default branch, J7\'s defaults for the keys its entry lacks; past `linkCap`, or with `contentPrefill: false`, the file name only and the file to copy, with the cause\'s words; with `webCommitsToDefault: false`, AC18\'s words', () => {
  const t = portfolioTarget({ repo: 'shumpmaster/portfolio', defaultBranch: 'main' });
  assert.deepEqual(t, { repo: 'shumpmaster/portfolio', defaultBranch: 'main', contentParam: 'value', contentPrefill: true, webCommitsToDefault: true });
  assert.equal(portfolioTarget(null), null);
  const week = { path: weekPath('2026-11-09', 'd3fa2'), content: J5_FILE };
  const l = weekLink(t, week, 6000);
  assert.equal(l.url, `https://github.com/shumpmaster/portfolio/new/main?filename=${encodeURIComponent(week.path)}&value=${encodeURIComponent(J5_FILE)}`);
  assert.equal(l.url, newFileUrl(t, week.path, J5_FILE));
  assert.deepEqual([l.copy, l.copyWords, l.warning], [null, null, null]);
  const long = weekLink(t, week, 200);
  assert.equal(long.url, `https://github.com/shumpmaster/portfolio/new/main?filename=${encodeURIComponent(week.path)}`, 'the file name only');
  assert.equal(long.copy, J5_FILE, 'the file, character for character, to copy');
  assert.equal(long.copyWords, 'Too long for a link: GitHub opens with the file name only; copy the week below, then paste it there');
  const np = weekLink({ ...t, contentPrefill: false }, week, 6000);
  assert.equal(np.url, long.url);
  assert.equal(np.copy, J5_FILE);
  assert.equal(np.copyWords, "This repository doesn't take prefilled content: GitHub opens with the file name only; copy the week below, then paste it there");
  const nw = weekLink({ ...t, webCommitsToDefault: false }, week, 6000);
  assert.equal(nw.warning, "This repository doesn't take commits to main from the web. On GitHub, choose 'Create a new branch' and then open the pull request GitHub offers; the week stays offered until that pull request is merged.");
  assert.equal(nw.url, l.url, 'the link itself J3\'s, unchanged');
});

// VT3's round 2 (the Reviewer's N4: B23 and B24, the V5 line's two guards, left standing by his plants).
test('J5 (VT3\'s review, N4): the week\'s V5 line says why it has no figure — a v3 project not read, or its dispatch log not loaded ("not available until <project> has been read"), and a week older than the dispatch-log months the desk reads (the current and the one before, UTC)', async () => {
  const { v5Week } = await import('../../src/lib/values.js');
  const config = { ownerTimeZone: TZ, v5Clock: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], from: '07:00', to: '22:00' } };
  const read = (name, extra = {}) => ({ name, v3: true, readOk: true, model: { logLoaded: true, allEntries: [] }, tree: new Map(), ...extra });
  const week = { startMs: W46, endMs: MON16 };
  assert.deepEqual(v5Week({ projects: [read('Service-Desk'), read('Alpha', { readOk: false })], ...week, nowMs: MON16, config }),
    { ms: null, k: 0, words: 'not available until Alpha has been read' });
  assert.deepEqual(v5Week({ projects: [read('Service-Desk', { model: { logLoaded: false, allEntries: [] } })], ...week, nowMs: MON16, config }),
    { ms: null, k: 0, words: 'not available until Service-Desk has been read' }, 'the log not loaded');
  assert.equal(v5Week({ projects: [read('Old', { v3: false, readOk: false })], ...week, nowMs: MON16, config }).words, 'no weekday cards', 'a v2.5 project is not waited on');
  // The week of 9 Nov seen on Mon 4 Jan 2027: J2 reads December's and January's logs only.
  assert.deepEqual(v5Week({ projects: [read('Service-Desk')], ...week, nowMs: chi('2027-01-04', '10:00'), config }),
    { ms: null, k: 0, words: 'not available: the dispatch log months the desk reads no longer cover this week' });
  // On Tue 1 Dec 2026, November's log is still read.
  assert.equal(v5Week({ projects: [read('Service-Desk')], ...week, nowMs: chi('2026-12-01', '10:00'), config }).words, 'no weekday cards');
});

// VT3's review, round 2, F1 (draft 13's row: "a sub-second one kept").
test('J5 (VT3\'s review, round 2, F1): a window shorter than a second is kept, its two times cut to the same second (13:02:11.200 to 13:02:11.900 written 13:02:11-13:02:11); only a window of no length at all is left out', () => {
  const notes = notesOf({ from: '2026-11-01', windows: [[z('2026-11-10T13:02:11.200Z'), z('2026-11-10T13:02:11.900Z')], [z('2026-11-10T14:00:00.500Z'), z('2026-11-10T14:00:00.500Z')]] });
  const lines = weekFile({ notes, start: W46, tz: TZ, v5: V5_7 }).split('\n');
  assert.deepEqual(lines.slice(lines.indexOf('## Open windows (UTC)') + 1, lines.indexOf('## First shown (UTC)')), ['2026-11-10: 13:02:11-13:02:11']);
  assert.deepEqual(notedWeeks(notes, MON16, TZ), [W46], 'and its week offered');
});
