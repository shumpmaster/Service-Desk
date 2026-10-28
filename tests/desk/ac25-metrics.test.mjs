// ac-test: S-001/AC25 — the device's notes, pure (stage VT2 of "The desk's value targets shown: M3B"; AC25's first two parts
// as changed for M3B): the device's code (`d` and four hex digits, made once and kept); open windows from open to close, to the
// second, their end also written at every 15-second tick so a window whose tab was killed ends at its last write, split at
// Monday 00:00 in `ownerTimeZone` (Chicago, through a change of clocks); first shown once per AC73 key, only in an open window,
// kept when the item leaves and comes back; "Didn't need me" marks only for a noted item, unmarked, both kept through a reload;
// each week's notes kept 8 weeks from the week's end, the oldest dropped first; and storage that throws turning the notes off
// with nothing thrown.
// join-test: S-001/J5 — the notes' storage: under `desk-metrics-v1`, through the wrapped store (src/lib/store.js), every read
// and write guarded; kept: the device code, the open windows, first-shown by AC73 key, marks with their time, the date the
// notes start; the week Monday to Sunday in `ownerTimeZone`.
// Every time and key here is made up, NOT a real record (tests/desk/fixtures/README.md, VT2).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../../src/lib/store.js';
import { createMetrics, weekStart, nextWeekStart, keptFrom, deviceCode, METRICS_KEY, KEEP_WEEKS, NOT_NOTED, DNM_WORDS } from '../../src/lib/metrics.js';
import { memStore } from './wa-fixtures.mjs';

const TZ = 'America/Chicago';
const S = 1000;
const MIN = 60 * S;
const H = 60 * MIN;
const DAY = 24 * H;
const T0 = Date.parse('2026-10-14T15:00:12.345Z'); // Wed 14 Oct, 10:00:12.345 in Chicago (made up)
/** A clock the test moves, a backing store it can read and break, and the notes made on them. */
function rig({ at = T0, backing = memStore(), random = () => 0.5 } = {}) {
  const clock = { t: at };
  const make = () => createMetrics({ store: createStore(backing), now: () => clock.t, tz: TZ, random });
  return { clock, backing, make, m: make(), kept: () => JSON.parse(backing.m.get(METRICS_KEY)) };
}

test('AC25 + J5: the device\'s code, `d` and four hex digits, made once and kept with its notes under desk-metrics-v1; the date its notes start', () => {
  assert.equal(deviceCode(() => 0), 'd0000');
  assert.equal(deviceCode(() => 0.999999), 'dffff');
  assert.match(deviceCode(), /^d[0-9a-f]{4}$/);
  const r = rig({ random: () => 0x3a7c / 0x10000 });
  assert.equal(r.m.device, 'd3a7c');
  r.m.open();
  assert.equal(r.kept().device, 'd3a7c', 'kept with its notes');
  assert.equal(r.kept().from, '2026-10-14', 'the day its notes start, in Chicago');
  assert.equal(r.kept().v, 1);
  // Made once: a reload reads the same code, whatever a new one would be.
  const again = createMetrics({ store: createStore(r.backing), now: () => r.clock.t, tz: TZ, random: () => 0 });
  assert.equal(again.device, 'd3a7c');
  assert.equal(again.notes.from, '2026-10-14');
  // What is kept in another form starts afresh, never breaking.
  const odd = memStore({ [METRICS_KEY]: JSON.stringify({ v: 1, device: 'not-a-code', windows: 'x' }) });
  const fresh = createMetrics({ store: createStore(odd), now: () => T0, tz: TZ, random: () => 0 });
  assert.equal(fresh.device, 'd0000');
  assert.deepEqual(fresh.notes.windows, []);
  const bad = memStore({ [METRICS_KEY]: '{not json' });
  assert.equal(createMetrics({ store: createStore(bad), now: () => T0, tz: TZ, random: () => 0 }).device, 'd0000');
});

test('AC25: an open window from the page\'s visible event to its hidden one, kept to the second, never rounded; a second opening another window; the end written at each 15-second tick', () => {
  const r = rig();
  assert.equal(r.m.isOpen, false);
  r.m.open();
  assert.equal(r.m.isOpen, true);
  assert.equal(r.m.openedAt, T0);
  assert.deepEqual(r.kept().windows, [[T0, T0]], 'written at once');
  r.clock.t = T0 + 15 * S;
  r.m.tick();
  assert.deepEqual(r.kept().windows, [[T0, T0 + 15 * S]], 'its end written at the tick');
  r.clock.t = T0 + 30 * S;
  r.m.tick();
  r.clock.t = T0 + 37 * S + 250;
  r.m.close();
  assert.deepEqual(r.kept().windows, [[T0, T0 + 37 * S + 250]], 'ended at the hidden event, its seconds as they are');
  assert.equal(r.m.isOpen, false);
  assert.equal(r.m.openedAt, null);
  // Closed: a tick and a second close change nothing.
  r.clock.t = T0 + 60 * S;
  r.m.tick();
  r.m.close();
  assert.deepEqual(r.kept().windows, [[T0, T0 + 37 * S + 250]]);
  // A second opening: its own window, whatever its length (here 2 seconds).
  r.clock.t = T0 + 5 * MIN;
  r.m.open();
  r.m.open(); // a second visible event while open: still one window
  r.clock.t = T0 + 5 * MIN + 2 * S;
  r.m.close();
  assert.deepEqual(r.kept().windows, [[T0, T0 + 37 * S + 250], [T0 + 5 * MIN, T0 + 5 * MIN + 2 * S]]);
});

test('AC25 (the kill case): a window whose tab was killed with no hidden event ends at its last 15-second write; the next load opens a window of its own', () => {
  const r = rig();
  r.m.open();
  for (let i = 1; i <= 4; i++) {
    r.clock.t = T0 + i * 15 * S;
    r.m.tick();
  }
  // Killed 12 seconds after the last tick: nothing more is written.
  r.clock.t = T0 + 72 * S;
  const later = r.make();
  assert.deepEqual(later.notes.windows, [[T0, T0 + 60 * S]], 'it ends at its last write');
  r.clock.t = T0 + 2 * H;
  later.open();
  assert.deepEqual(r.kept().windows, [[T0, T0 + 60 * S], [T0 + 2 * H, T0 + 2 * H]], 'the killed window keeps its end; the new one is its own');
});

test('AC25 + J5: a window open across Monday 00:00 in Chicago is split there, at each Monday it crosses, through a change of clocks (the week Monday to Sunday in ownerTimeZone)', () => {
  // Sun 18 Oct 23:59:50 CDT to Mon 19 Oct 00:00:05 CDT (05:00Z).
  const mon = Date.parse('2026-10-19T05:00:00Z');
  assert.equal(weekStart(mon - 10 * S, TZ), Date.parse('2026-10-12T05:00:00Z'));
  assert.equal(weekStart(mon, TZ), mon);
  assert.equal(nextWeekStart(mon - 10 * S, TZ), mon);
  const r = rig({ at: mon - 10 * S });
  r.m.open();
  r.clock.t = mon - 1 * S;
  r.m.tick();
  r.clock.t = mon + 5 * S;
  r.m.tick();
  assert.deepEqual(r.kept().windows, [[mon - 10 * S, mon], [mon, mon + 5 * S]], 'split at Monday 00:00, the tick after it');
  r.clock.t = mon + 20 * S;
  r.m.close();
  assert.deepEqual(r.kept().windows, [[mon - 10 * S, mon], [mon, mon + 20 * S]]);
  // Exactly at Monday 00:00: the first week ends there and an empty piece starts the next.
  const at = rig({ at: mon - 30 * S });
  at.m.open();
  at.clock.t = mon;
  at.m.close();
  assert.deepEqual(at.kept().windows, [[mon - 30 * S, mon], [mon, mon]]);
  // Clocks go back on Sun 1 Nov: that week runs from Mon 26 Oct 00:00 CDT (05:00Z) to Mon 2 Nov 00:00 CST (06:00Z).
  const sun = Date.parse('2026-11-01T18:00:00Z');
  assert.equal(weekStart(sun, TZ), Date.parse('2026-10-26T05:00:00Z'));
  assert.equal(nextWeekStart(sun, TZ), Date.parse('2026-11-02T06:00:00Z'));
  // A window left open (a tick each 15 seconds, here only the last) over two Mondays: split at each.
  const long = rig({ at: Date.parse('2026-10-25T12:00:00Z') });
  long.m.open();
  long.clock.t = Date.parse('2026-11-03T12:00:00Z');
  long.m.tick();
  assert.deepEqual(long.kept().windows, [[Date.parse('2026-10-25T12:00:00Z'), Date.parse('2026-10-26T05:00:00Z')],
    [Date.parse('2026-10-26T05:00:00Z'), Date.parse('2026-11-02T06:00:00Z')], [Date.parse('2026-11-02T06:00:00Z'), Date.parse('2026-11-03T12:00:00Z')]]);
});

test('AC25: first shown once per AC73 key per device, only in an open window; an item that leaves and comes back keeps its first time; one noted on another device is not noted here', () => {
  const r = rig();
  const a = 'Alpha|card|queue/a.md';
  const b = 'Alpha|pr|12';
  assert.equal(r.m.shown([a]), false, 'no window open: nothing noted');
  assert.equal(r.m.hasShown(a), false);
  r.m.open();
  r.clock.t = T0 + 3 * S;
  assert.equal(r.m.shown([a]), true);
  r.clock.t = T0 + 9 * MIN;
  r.m.shown([a, b]);
  assert.deepEqual(r.kept().shown, { [a]: T0 + 3 * S, [b]: T0 + 9 * MIN }, 'each at its first read, once');
  // It leaves (not counted at a read) and comes back, in this window and the next: its first time stays.
  r.m.shown([b]);
  r.m.close();
  r.clock.t = T0 + 3 * H;
  const later = r.make();
  later.open();
  later.shown([a, b]);
  assert.deepEqual(r.kept().shown, { [a]: T0 + 3 * S, [b]: T0 + 9 * MIN });
  assert.equal(later.shown([a]), false, 'nothing new: nothing written');
  // Another device (another browser profile, its own storage): its own notes.
  const other = rig({ at: T0 + 4 * H, random: () => 0.25 });
  assert.equal(other.m.hasShown(a), false);
  assert.notEqual(other.m.device, r.m.device);
});

test('AC25: "Didn\'t need me" marks only an item this device noted; the mark kept with its time; "Unmark" removes it; both kept through a reload, on that device only', () => {
  assert.deepEqual({ ...DNM_WORDS }, { mark: "Didn't need me", marked: 'Marked as not needing you', unmark: 'Unmark' });
  const r = rig();
  const a = 'Alpha|question|questions/a.md';
  r.m.open();
  r.m.mark(a);
  assert.equal(r.m.isMarked(a), false, 'not noted: no mark');
  r.m.shown([a]);
  r.clock.t = T0 + 2 * MIN;
  r.m.mark(a);
  assert.equal(r.m.isMarked(a), true);
  assert.deepEqual(r.kept().marks, { [a]: T0 + 2 * MIN }, 'with its time');
  r.clock.t = T0 + 3 * MIN;
  r.m.mark(a);
  assert.deepEqual(r.kept().marks, { [a]: T0 + 2 * MIN }, 'a second tap keeps the first time');
  const reloaded = r.make();
  assert.equal(reloaded.isMarked(a), true, 'kept through a reload');
  reloaded.unmark(a);
  assert.equal(reloaded.isMarked(a), false);
  assert.deepEqual(r.kept().marks, {});
  assert.equal(r.make().isMarked(a), false, 'unmarked, kept so');
  assert.equal(r.make().hasShown(a), true, 'its first-shown note stays');
});

test('AC25 (Kept 8 weeks): each week\'s notes stay for 8 weeks from the week\'s end, the oldest dropped first — its windows, first-shown times and marks', () => {
  assert.equal(KEEP_WEEKS, 8);
  // The week of Mon 5 Oct (CDT) ends Mon 12 Oct 00:00; 8 weeks on is Mon 7 Dec 00:00 CST (06:00Z), past a change of clocks.
  const w1 = Date.parse('2026-10-07T15:00:00Z'); // Wed 7 Oct
  const w2 = Date.parse('2026-10-14T15:00:00Z'); // Wed 14 Oct, the week after
  const drop1 = Date.parse('2026-12-07T06:00:00Z');
  const drop2 = Date.parse('2026-12-14T06:00:00Z');
  assert.equal(keptFrom(drop1 - 1, TZ), Date.parse('2026-10-05T05:00:00Z'));
  assert.equal(keptFrom(drop1, TZ), Date.parse('2026-10-12T05:00:00Z'));
  const r = rig({ at: w1 });
  const a = 'Alpha|card|queue/a.md';
  const b = 'Alpha|card|queue/b.md';
  r.m.open();
  r.m.shown([a]);
  r.m.mark(a);
  r.clock.t = w1 + 30 * S;
  r.m.close();
  r.clock.t = w2;
  r.m.open();
  r.m.shown([b]);
  r.m.mark(b);
  r.clock.t = w2 + 30 * S;
  r.m.close();
  // A write one second before the first week's 8 weeks end keeps it.
  r.clock.t = drop1 - S;
  r.m.open();
  assert.deepEqual(Object.keys(r.kept().shown), [a, b]);
  assert.equal(r.kept().windows.length, 3);
  r.m.close();
  // At its end the oldest week goes, all of it; the next week stays.
  r.clock.t = drop1;
  r.m.open();
  const k = r.kept();
  assert.deepEqual(Object.keys(k.shown), [b]);
  assert.deepEqual(Object.keys(k.marks), [b]);
  assert.deepEqual(k.windows.map((w) => w[0]), [w2, drop1 - S, drop1], 'the first week\'s window gone; the open one kept');
  r.m.close();
  r.clock.t = drop2;
  r.m.open();
  assert.deepEqual(r.kept().shown, {});
  assert.deepEqual(r.kept().marks, {});
  assert.deepEqual(r.kept().windows.map((w) => w[0]), [drop1 - S, drop1, drop2]);
  // A window open now is kept while it is open, whatever its start (here one left open over 9 weeks).
  const left = rig({ at: w1 });
  left.m.open();
  left.clock.t = w1 + 70 * DAY;
  left.m.tick();
  const pieces = left.kept().windows;
  assert.ok(pieces.length >= 2 && pieces[pieces.length - 1][1] === w1 + 70 * DAY, 'the open piece kept');
  assert.ok(pieces.every((w) => w[0] >= keptFrom(w1 + 70 * DAY, TZ)), 'the older pieces dropped');
});

test('AC25 + J5: storage that throws (a private window, blocked or full) turns the notes off, never throwing; the words the targets\' sheet then says', () => {
  assert.equal(NOT_NOTED, 'Not noted on this device');
  const blocked = memStore();
  blocked.throws = true;
  const r = rig({ backing: blocked });
  assert.doesNotThrow(() => { r.m.open(); r.m.shown(['x']); r.m.tick(); r.m.close(); });
  assert.equal(r.m.off, true);
  // A store whose reads work and whose writes fail: off at the first write.
  const full = memStore();
  const f = createMetrics({ store: createStore(full), now: () => T0, tz: TZ });
  assert.equal(f.off, false);
  full.setItem = () => { throw new Error('quota'); };
  f.open();
  assert.equal(f.off, true);
  // No storage at all.
  assert.equal(createMetrics({ store: createStore(null), now: () => T0, tz: TZ }).off, true);
  assert.equal(createMetrics({ store: null, now: () => T0, tz: TZ }).off, true);
  // A store whose read throws, as createStore never does: off, the notes in memory only.
  const odd = { usable: true, getJSON() { throw new Error('x'); }, setJSON() { throw new Error('x'); } };
  const o = createMetrics({ store: odd, now: () => T0, tz: TZ });
  assert.doesNotThrow(() => o.open());
  assert.equal(o.off, true);
  // A working store: on.
  assert.equal(rig().m.off, false);
});
