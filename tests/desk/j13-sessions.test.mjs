// J13 (spec S-001, model 3.5.0's records, 2026-10-17; model S-033 AC6 and its J3): the Chief of
// Staff's session lines on the Team screen and in who has the ball (AC49, AC67).
//
// Fixtures: tests/desk/fixtures/j13/ (tests/desk/tools/j13-fixtures.py made them): `real/`, the first
// session file on the default branch, at 21bc250; `good/`, session files the model's own
// `v3_checks sessions` passes (good/check.txt), NOT real records; `bad/`, out-of-form lines with the
// model's failure for each in bad/check.txt, NOT a real record. Times are on 2026-10-17 (UTC).
// join-test: S-001/J13
// ac-test: S-001/AC49 ac-test: S-001/AC67
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { FIX, CONFIG, fixture } from './helpers.mjs';
import { repo, gitSha } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll, linksIn, j11Files, SD3 } from './sandbox-helpers.mjs';
import { v3 } from './sandbox-fixtures.mjs';
import { checkDrawing } from './branch-check.mjs';
import { SESSION_PATH_RE, parseSessionFile, piecesOf, cosSessions, utcTime, utcParts, COS_OPEN_MS } from '../../src/lib/cos.js';
import { ballLines, teamView, memberPage, workingNow, cosWorkingNow, cosView, summarySheet, helperWords, endWords, cosUsageLines, COS_COST_NR,
  queueView } from '../../src/lib/sandbox.js';
import { memberIcon, memberWork } from '../../src/lib/feed.js';
import { neededReads, parseRecord, recordKind, buildModel } from '../../src/lib/model.js';

const DIR = join(FIX, 'j13');
const read = (sub, name) => readFileSync(join(DIR, sub, 'sessions', 'chief-of-staff', `${name}.jsonl`), 'utf8');
const GOOD = Object.fromEntries(readdirSync(join(DIR, 'good', 'sessions', 'chief-of-staff')).map((f) => [f.replace(/\.jsonl$/, ''), read('good', f.replace(/\.jsonl$/, ''))]));
const BAD = read('bad', 's-bad');
const REAL_ID = 'session_012RJPVKAoLga2RkqLYRDcBY';
const REAL = read('real', REAL_ID);
const P = (id) => `sessions/chief-of-staff/${id}.jsonl`;
const at = (hhmm) => new Date(`2026-10-17T${hhmm}:00Z`);
const TZ = 'UTC';
const SURFACES = j11Files()['governance/SURFACES.md'];

/** A snapshot holding the named session files (parsed as the page caches them) and the roster. */
function snapOf(names, { texts = {}, unread = [] } = {}) {
  const files = { 'governance/SURFACES.md': SURFACES, ...Object.fromEntries(names.map((n) => [P(n), texts[n] != null ? texts[n] : GOOD[n] != null ? GOOD[n] : n === 's-bad' ? BAD : REAL])) };
  const tree = new Map(Object.entries(files).map(([p, t]) => [p, { sha: gitSha(t), size: t.length }]));
  const records = new Map();
  for (const [p, t] of Object.entries(files)) if (!unread.includes(p)) records.set(p, parseRecord(recordKind(p, 'v3'), t, p));
  return { tree, records, history: new Map(), checkPages: [] };
}
const jOf = (snap) => ({ ready: true, tree: snap.tree, surfaces: snap.records.get('governance/SURFACES.md'), logRows: [], logSource: [], merges: [] });
const EMPTY_Q = { waiting: 0, rows: [], groups: [] };
const team = (names, now, opts) => {
  const snap = snapOf(names, opts);
  const j = jOf(snap);
  const tv = teamView(SD3, { items: [] }, snap, j, EMPTY_Q, [], now, TZ);
  return { snap, j, tv, cos: tv.members.find((m) => m.id === 'chief-of-staff'), member: (id) => tv.members.find((m) => m.id === id) };
};

// ---------------------------------------------------------------------------
// J13: where, the lines, the model's findings

test('J13: the path rule — sessions/chief-of-staff/<session id>.jsonl only; another folder under sessions/, a name with a `.`, a subfolder, ignored', () => {
  assert.ok(SESSION_PATH_RE.test(P(REAL_ID)));
  for (const p of ['sessions/other/x.jsonl', 'sessions/chief-of-staff/a.b.jsonl', 'sessions/chief-of-staff/sub/x.jsonl', 'sessions/chief-of-staff/x.json',
    `sessions/chief-of-staff/${'a'.repeat(101)}.jsonl`, 'sessions/chief-of-staff/.jsonl']) {
    assert.equal(SESSION_PATH_RE.test(p), false, p);
    assert.equal(recordKind(p, 'v3'), null, `${p} is not read`);
  }
  assert.equal(recordKind(P(REAL_ID), 'v3'), 'cos-session');
  assert.equal(recordKind(P(REAL_ID), 'v2.5'), null, 'v3 projects only');
});

test('J13: the real start line at 21bc250 reads as written; one piece under way, its doing as written', () => {
  const f = parseSessionFile(REAL, P(REAL_ID));
  assert.deepEqual(f.notes, []);
  assert.equal(f.lines.length, 1);
  assert.equal(f.lines[0].doing, 'Revising the desk plan (S-001) so the desk reads the records model 3.5.0 added: open questions with their milestone and facts, the Chief of Staff sessions, and milestones reached');
  assert.equal(f.lines[0].at, Date.parse('2026-10-17T22:11:23Z'));
  const { pieces } = piecesOf(f, P(REAL_ID), Date.parse('2026-10-17T23:00:00Z'));
  assert.deepEqual(pieces.map((x) => x.state), ['working']);
});

test('J13: the files `v3_checks sessions` passes read with no note; each piece\'s state, at 7 h 59 min and at 8 h; a start after a start; an end line with no open piece', () => {
  assert.match(readFileSync(join(DIR, 'good', 'check.txt'), 'utf8'), /^exit 0\n[\s\S]*OK: the Chief of Staff's session lines are in their form/);
  for (const [n, t] of Object.entries(GOOD)) assert.deepEqual(parseSessionFile(t, P(n)).notes, [], n);
  const state = (name, now) => piecesOf(parseSessionFile(GOOD[name], P(name)), P(name), now.getTime());
  assert.deepEqual(state('s-ended', at('12:00')).pieces.map((x) => [x.state, x.helpers.length]), [['ended', 2]]);
  assert.deepEqual(state('s-open', at('12:00')).pieces.map((x) => x.state), ['working']);
  assert.deepEqual(state('s-restart', at('12:00')).pieces.map((x) => x.state), ['unrecorded', 'ended'], 'a start after a start: ended, time not recorded');
  assert.deepEqual(state('s-old', at('11:29')).pieces.map((x) => x.state), ['working'], '7 h 59 min: still under way');
  assert.deepEqual(state('s-old', at('11:30')).pieces.map((x) => x.state), ['unrecorded'], '8 h: ended, time not recorded');
  assert.equal(COS_OPEN_MS, 8 * 3600e3);
  assert.deepEqual(state('s-old', at('02:00')).pieces.map((x) => x.state), ['working'], 'a start later than now (a clock ahead) is under way');
  const o = state('s-orphan', at('12:00'));
  assert.deepEqual(o.orphans.map((x) => x.line.n), [1, 4], 'one before any start, one after an end');
  assert.deepEqual(o.pieces.map((x) => [x.state, x.end.n]), [['ended', 3]]);
});

test('J13: each line the desk mirrors is named in the notes and skipped, the rest of its file used; each it does not mirror is read as written, with the model\'s failure beside it', () => {
  const model = readFileSync(join(DIR, 'bad', 'check.txt'), 'utf8');
  const failed = [...model.matchAll(/s-bad\.jsonl line (\d+):/g)].map((m) => Number(m[1]));
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  assert.deepEqual(failed, [...range(2, 24), ...range(26, 33)], 'the model fails lines 2 to 24 and 26 to 33');
  const f = parseSessionFile(BAD, P('s-bad'));
  const skipped = f.notes.filter((n) => /; skipped$/.test(n)).map((n) => Number(/line (\d+):/.exec(n)[1]));
  assert.deepEqual(skipped, [...range(2, 20), ...range(27, 33)], 'lines 2 to 20 and 27 to 33: the findings the desk mirrors');
  const readLines = f.lines.map((l) => l.n);
  assert.deepEqual(readLines, [1, 21, 22, 23, 24, 25, 26]);
  // Not mirrored, read as written: a repeated key (JSON.parse keeps the last), 1.0 for a count, a time earlier than the line before.
  const l21 = f.lines.find((l) => l.n === 21);
  assert.equal(l21.doing, 'a repeated key');
  assert.equal(f.lines.find((l) => l.n === 22).reported.tokens, 1);
  assert.equal(f.lines.find((l) => l.n === 23).at, Date.parse('2026-10-17T08:00:00Z'));
  for (const n of [21, 22, 23]) assert.ok(failed.includes(n), `line ${n}: the model's CI fails it`);
  // Each mirrored reason in words.
  const why = (n) => f.notes.find((x) => x.includes(`line ${n}:`));
  assert.match(why(2), /not one JSON object/);
  assert.match(why(3), /not one JSON object/, 'NaN: JSON.parse refuses it, as the model\'s parse_constant does');
  assert.match(why(4), /missing key event/);
  assert.match(why(5), /event is not a string/);
  assert.match(why(6), /unknown event "pause"/);
  assert.match(why(7), /missing key doing/);
  assert.match(why(8), /extra key note/);
  assert.match(why(9), /session is not a string/);
  assert.match(why(10), /not its lines' session/);
  assert.match(why(11), /doing is not a string holding/);
  assert.match(why(12), /role is not a string holding/);
  assert.match(why(13), /time "2026-10-17 09:11:00" is not UTC/);
  assert.match(why(14), /2026-02-30T09:12:00Z" is not UTC/, 'not a real date');
  assert.match(why(15), /reported is not an object/);
  assert.match(why(16), /reported: missing key duration_ms/);
  assert.match(why(17), /reported: extra key cost/);
  assert.match(why(18), /reported tokens: not a whole number/);
  assert.match(why(19), /reported tokens: not a whole number/);
  assert.match(why(20), /started after it ended/);
  for (const n of [2, 13, 20]) assert.match(why(n), new RegExp(`^sessions/chief-of-staff/s-bad\\.jsonl line ${n}: `), 'file, line and reason');
  // Build review round 1, B1: an event naming a property every object inherits is an unknown event, as the model's dict has it.
  assert.match(why(27), /unknown event "constructor"/);
  assert.match(why(28), /unknown event "__proto__"/);
  assert.match(why(29), /unknown event "toString"/);
  assert.match(why(30), /unknown event "hasOwnProperty"/);
  for (const n of [27, 28, 29, 30]) assert.match(model, new RegExp(`line ${n}: unknown event '`), `line ${n}: the model's verdict`);
  // N1: U+001C and U+0085 are white space, as Python's str.strip has them.
  assert.match(why(31), /doing is not a string holding a character other than white space/);
  assert.match(why(32), /doing is not a string holding a character other than white space/);
  // N3: read to the microsecond, as the model's utc_time keeps it.
  assert.match(why(33), /started after it ended/);
});

test('J13 (build review round 1): a file with such lines leaves the project read, "All clear", and the rest of the file used', async () => {
  const files = { 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), 'governance/SURFACES.md': SURFACES,
    [P('s-ended')]: `${GOOD['s-ended']}{"event": "constructor"}\n{"event": "__proto__", "session": "s-ended"}\n` };
  const app = await loadSandbox({ config: { ...CONFIG, projects: [v3('Alpha')] }, repos: { Alpha: repo(files) }, hash: '#/', now: at('12:00').getTime() });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    assert.match(app.text(), /All clear/);
    assert.doesNotMatch(app.text(), /Can't read/);
    await app.go('#/p/Alpha/team');
    assert.match(findAll(app.view, (e) => e.dataset && e.dataset.member === 'chief-of-staff')[0].textContent, /Idle/, 'the rest of the file used');
  } finally {
    app.restore();
  }
});

test('J13 (build review round 1, N1 and N3): a doing of U+FEFF alone is read, as Python keeps it; years 0001 to 0099 are real years; times compared to the microsecond', () => {
  assert.deepEqual(parseSessionFile(GOOD['s-edge'], P('s-edge')).notes, [], 'both lines read: the model passes them (good/check.txt)');
  assert.equal(parseSessionFile(GOOD['s-edge'], P('s-edge')).lines[0].doing, '\ufeff');
  const y = parseSessionFile(GOOD['s-year50'], P('s-year50'));
  assert.deepEqual(y.notes, []);
  assert.equal(new Date(y.lines[0].at).getUTCFullYear(), 50);
  assert.equal(y.lines[1].at - y.lines[0].at, 3600500);
  assert.equal(utcTime('0001-01-01T00:00:00Z'), new Date('0001-01-01T00:00:00Z').getTime(), 'the year 1, not 1901');
  assert.equal(utcTime('0000-01-01T00:00:00Z'), null, 'year 0 is no year to Python');
  assert.equal(utcTime('0099-02-29T00:00:00Z'), null, '99 is no leap year');
  assert.equal(utcTime('0096-02-29T00:00:00Z'), new Date('0096-02-29T00:00:00Z').getTime());
  assert.deepEqual(utcParts('2026-10-17T10:33:00.0000059Z'), { ms: Date.parse('2026-10-17T10:33:00Z'), us: 5 }, 'the fraction\'s first six digits');
  assert.deepEqual(utcParts('2026-10-17T10:33:00.123456Z'), { ms: Date.parse('2026-10-17T10:33:00.123Z'), us: 456 });
});

test('J13: an end line\'s usage by J10\'s one rule — a wrong-kind figure marks only its key, "not recorded" and named, and the line still closes its piece; a usage that is not an object gives every figure "not recorded"', () => {
  const f = parseSessionFile(BAD, P('s-bad'));
  const { pieces } = piecesOf(f, P('s-bad'), at('12:00').getTime());
  assert.deepEqual(pieces.map((x) => [x.start.n, x.state, x.end ? x.end.n : null]), [[1, 'unrecorded', null], [21, 'unrecorded', null], [23, 'ended', 24], [25, 'ended', 26]]);
  const c = pieces[2].end.usage;
  assert.equal(c.cost_usd_estimate, 'not recorded');
  assert.equal(c.duration_ms, 600000, 'the other figures still read');
  assert.ok(f.notes.some((n) => /line 24: usage\.cost_usd_estimate is of the wrong kind; shown as not recorded/.test(n)));
  const d = pieces[3].end.usage;
  assert.ok(Object.values(d).every((v) => v === 'not recorded'));
  assert.ok(f.notes.some((n) => /line 26: its usage is not an object; every figure shown as not recorded/.test(n)));
  assert.equal(pieces[1].helpers.length, 1, 'line 22, read as written, belongs to the piece opened at line 21');
});

test('J13: every `null` figure reads "not recorded", never "not available" (AC23\'s exception for session lines); figures as AC23 shows them', () => {
  const f = parseSessionFile(GOOD['s-ended'], P('s-ended'));
  const [, h1, h2, e] = f.lines;
  assert.equal(helperWords(h1, at('12:00'), TZ), 'definer helper · 08:05 to 08:40 · 52,340 tokens · 31 tool uses · 35 min 0 s');
  assert.equal(helperWords(h2, at('12:00'), TZ), 'ux-researcher helper · 08:45 to 09:00 · tokens not recorded · tool uses not recorded · run time not recorded');
  assert.equal(endWords(e), 'Handed back · 1 h 10 min 0 s');
  const lines = cosUsageLines(e.usage);
  assert.ok(lines.every((l) => !/not available/.test(l)), lines.join(' | '));
  assert.ok(lines.some((l) => /input not recorded/.test(l)));
  assert.equal(lines[lines.length - 1], 'Cost: not recorded');
  assert.equal(utcTime('2026-10-17T09:00:00.123456789+00:00'), Date.parse('2026-10-17T09:00:00.123Z'), 'a fraction and +00:00, as the model reads them');
  assert.equal(utcTime('2026-10-17T24:00:00Z'), null);
});

test('J13: each session file is an optional J11 read — never "Can\'t read" for it; a failed session blob leaves "read successfully" and "All clear" unchanged, the Chief of Staff\'s tile "not available"', async () => {
  const snap = snapOf(['s-ended']);
  const now = at('12:00');
  const plain = neededReads(SD3, snap.tree, new Map(), now, { j11: true });
  assert.ok(plain.optional.blobs.some((b) => b.path === P('s-ended')), 'an optional read');
  assert.ok(!plain.blobs.some((b) => b.path === P('s-ended')), 'not a needed read');
  assert.ok(!neededReads(SD3, snap.tree, new Map(), now, {}).optional.blobs.some((b) => b.path === P('s-ended')), 'only with the sandbox\'s flag');
  // The page, with the session file's blob failing on every read.
  const files = { 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), 'governance/SURFACES.md': SURFACES, [P('s-ended')]: GOOD['s-ended'] };
  const app = await loadSandbox({ config: { ...CONFIG, projects: [v3('Alpha')] }, repos: { Alpha: repo(files) }, hash: '#/', now: at('12:00').getTime() });
  const orig = app.server.call;
  const bad = gitSha(GOOD['s-ended']);
  app.server.call = async (p, b) => {
    const r = await orig(p, b);
    if (p === '/api/blobs' && r.json && r.json.blobs && bad in r.json.blobs) r.json.blobs[bad] = null;
    return r;
  };
  try {
    await app.advance(1000);
    await app.advance(61_000);
    assert.match(app.text(), /All clear/);
    assert.doesNotMatch(app.text(), /Can't read/);
    await app.go('#/p/Alpha/team');
    const tile = findAll(app.view, (e) => e.dataset && e.dataset.member === 'chief-of-staff')[0];
    assert.match(tile.textContent, /not available/);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC49: who has the ball, the tile, the log, the sheets

test('AC49 (J13): "Chief of Staff working" in who has the ball, once, in its place — after an agent working, before checks running', () => {
  const snap = snapOf(['s-open', 's-two']);
  snap.checkPages = [JSON.stringify({ total_count: 1, workflow_runs: [{ path: '.github/workflows/governance.yml', name: 'governance', status: 'in_progress', conclusion: null, event: 'push', run_number: 1, head_sha: 'a'.repeat(40), html_url: 'x' }] })];
  const model = { items: [{ id: 'P-001', state: 'dispatched', running: { role: 'builder', since: at('11:50') } }] };
  const lines = ballLines(SD3, model, snap, jOf(snap), EMPTY_Q, at('12:00'), TZ);
  assert.deepEqual(lines.map((l) => l.who), ['agent', 'cos', 'checks']);
  assert.equal(lines[1].text, 'Chief of Staff working');
  assert.deepEqual(ballLines(SD3, { items: [] }, snapOf(['s-ended']), null, EMPTY_Q, at('12:00'), TZ).map((l) => l.text), ['Nothing under way']);
  assert.deepEqual(ballLines(SD3, { items: [] }, snapOf([]), null, EMPTY_Q, at('12:00'), TZ).map((l) => l.text), ['Nothing under way'], 'no session file: nothing in who has the ball');
});

test('AC49 (J13): the Chief of Staff\'s tile — Working, the piece started last named; Just finished at 29 and not at 31 minutes; Idle with its last work; "ended, time not recorded"; "No session recorded yet"', () => {
  const w = team(['s-open', 's-two'], at('12:00')).cos;
  assert.equal(w.status, 'Working');
  assert.equal(w.last, 'Recording your answers to the two desk questions, since 11:30', 'two under way: the one started last');
  assert.equal(team(['s-ended'], at('09:39')).cos.status, 'Just finished', '29 minutes after its end line');
  const idle = team(['s-ended'], at('09:41')).cos;
  assert.equal(idle.status, 'Idle', '31 minutes');
  assert.equal(idle.last, "Filing your question on the desk plan's fourth review, 09:10");
  const old = team(['s-old'], at('12:00')).cos;
  assert.deepEqual([old.status, old.last], ['Idle', 'A piece left open overnight, ended, time not recorded'], 'past 8 hours');
  assert.equal(team(['s-old'], at('11:29')).cos.status, 'Working', 'at 7 h 59 min');
  const restart = team(['s-restart'], at('12:00')).cos;
  assert.equal(restart.last, 'A second piece, 07:00');
  assert.equal(cosSessions(snapOf(['s-restart']), at('12:00').getTime()).pieces[0].state, 'unrecorded', 'the first: ended, time not recorded');
  const none = team([], at('12:00')).cos;
  assert.deepEqual([none.status, none.last], ['No session recorded yet', 'not recorded']);
  assert.doesNotMatch(JSON.stringify(team([], at('12:00')).tv), /sessions aren't recorded/, 'never "Its sessions aren\'t recorded" again');
});

test('AC49 (J13): an end line with no open piece — its own "Handed back (no recorded start)" row, and "Just finished" at 29 minutes', () => {
  const t = team(['s-orphan'], at('05:54'));
  assert.equal(t.cos.status, 'Just finished', '29 minutes after the end line after an end');
  const page = memberPage(SD3, { items: [] }, t.snap, t.j, EMPTY_Q, t.tv, 'chief-of-staff', at('05:54'), TZ);
  const rows = page.log.map((r) => r.text);
  assert.deepEqual(rows, ['Handed back (no recorded start) · 15 min 0 s · 05:25', 'Handed back · 10 min 0 s · 05:20', 'Started: A short piece · 05:10',
    'Handed back (no recorded start) · 1 min 0 s · 05:00']);
  assert.deepEqual(page.log.map((r) => r.lane), [null, 's-orphan line 2', 's-orphan line 2', null], 'the two with no open piece on the main line');
  assert.equal(team(['s-orphan'], at('05:56')).cos.status, 'Idle', '31 minutes');
});

test('AC49 (J13): the log — each piece a lane leaving the main line at its start and joining back at its end; one under way ends in the stub, its latest row "now"; one ended unrecorded says so; drawn as screen 3 draws it', async () => {
  const t = team(['s-ended', 's-open', 's-restart'], at('12:00'));
  const page = memberPage(SD3, { items: [] }, t.snap, t.j, EMPTY_Q, t.tv, 'chief-of-staff', at('12:00'), TZ);
  assert.deepEqual(page.log.map((r) => [r.text, r.lane, r.now]), [
    ['definer helper · 11:10 to 11:31 · 1,200 tokens · 4 tool uses · 21 min 0 s', 's-open line 1', true],
    ["Started: Revising the desk plan for model 3.5.0's records · 11:00", 's-open line 1', false],
    ['Handed back · 1 h 10 min 0 s · 09:10', 's-ended line 1', false],
    ['ux-researcher helper · 08:45 to 09:00 · tokens not recorded · tool uses not recorded · run time not recorded', 's-ended line 1', false],
    ['definer helper · 08:05 to 08:40 · 52,340 tokens · 31 tool uses · 35 min 0 s', 's-ended line 1', false],
    ["Started: Filing your question on the desk plan's fourth review · 08:00", 's-ended line 1', false],
    ['Handed back · 30 min 0 s · 07:00', 's-restart line 2', false],
    ['Started: A second piece · 06:30', 's-restart line 2', false],
    ['Started: A first piece that never handed back · 06:00 · ended, time not recorded', 's-restart line 1', false],
  ]);
  const lane = (id) => page.layout.lanes.find((l) => l.id === id);
  assert.deepEqual([lane('s-ended line 1').join, lane('s-ended line 1').stub], [2, false], 'joins back at its end line\'s row');
  assert.deepEqual([lane('s-open line 1').join, lane('s-open line 1').stub], [null, true], 'under way: the dashed stub');
  assert.deepEqual([lane('s-restart line 1').join, lane('s-restart line 1').stub], [null, true], 'ended unrecorded: the dashed stub');
  assert.deepEqual(page.upNext, [], 'no "Up next": no record names its next step');
  assert.ok(page.log.every((r) => !/not available/.test(r.text)));
  // Its groups, counted from the session lines.
  const g = Object.fromEntries(page.groups.map((x) => [x.title, x]));
  assert.deepEqual([g.Sessions.count, g['Pieces of work'].count, g.Helpers.count], [3, 4, 3]);
  assert.equal(g['Questions put to you'].count, null);
  // On the page: the drawing read back as AC49's test reads every member's.
  const files = { 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), 'governance/SURFACES.md': SURFACES,
    ...Object.fromEntries(['s-ended', 's-open', 's-restart'].map((n) => [P(n), GOOD[n]])) };
  const app = await loadSandbox({ config: { ...CONFIG, projects: [v3('Alpha')] }, repos: { Alpha: repo(files) }, hash: '#/p/Alpha/team/chief-of-staff', now: at('12:00').getTime() });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    const branch = byClass(app.view, 'sb-branch')[0];
    assert.ok(branch, 'the Chief of Staff\'s log is drawn');
    const rows = byClass(branch, 'sb-brow').map((li) => byClass(li, 'sb-brow-lane')[0].textContent).map((x) => (x === 'project' ? null : x));
    assert.equal(checkDrawing('chief-of-staff', branch, rows), 4, 'four pieces, four lanes');
    assert.ok(linksIn(branch).some((l) => /\/team\/chief-of-staff\/now$/.test(l.href)), 'the "now" row opens Working now');
    assert.match(app.text(), /Working/);
  } finally {
    app.restore();
  }
});

test('AC49 (J13): every Chief of Staff Working now value against its line; Cost "not recorded" while it runs, and "estimate $x.xx" for a made-up end line with a cost after it ends', () => {
  const t = team(['s-open'], at('12:00'));
  const page = memberPage(SD3, { items: [] }, t.snap, t.j, EMPTY_Q, t.tv, 'chief-of-staff', at('12:00'), TZ);
  const wn = workingNow(SD3, { items: [] }, t.snap, t.j, 'chief-of-staff', page, at('12:00'), TZ);
  assert.equal(wn.doing, "Chief of Staff: Revising the desk plan for model 3.5.0's records");
  const tile = Object.fromEntries(wn.tiles.map((x) => [x.label, x]));
  assert.deepEqual([tile.Started.value, tile['Time so far'].value, tile['Time so far'].why, tile['Last check-in'].value], ['11:00', '1 h 0 min', 'counted from the start', '11:31']);
  assert.deepEqual([tile['Next check-in'].value, tile['Next check-in'].why], ['–', 'the Chief of Staff runs on no schedule']);
  const line = Object.fromEntries(wn.lines.map((x) => [x.label, x]));
  assert.equal(line.Update.value, 'definer helper · 11:10 to 11:31 · 1,200 tokens · 4 tool uses · 21 min 0 s');
  assert.equal(line.Next.value, 'hands the work back to you');
  assert.match(line.Next.why, /fixed statement of the model's rule \(S-033 AC6/);
  assert.deepEqual([line.Cost.value, line.Cost.why], ['–', COS_COST_NR]);
  const two = team(['s-two'], at('12:00'));
  const w2 = workingNow(SD3, { items: [] }, two.snap, two.j, 'chief-of-staff', memberPage(SD3, { items: [] }, two.snap, two.j, EMPTY_Q, two.tv, 'chief-of-staff', at('12:00'), TZ), at('12:00'), TZ);
  assert.deepEqual([w2.lines[0].value, w2.lines[0].why], ['–', 'no helper recorded yet']);
  // After it ends: its end line's cost.
  const cs = cosSessions(snapOf(['s-cost']), at('12:00').getTime());
  const done = cosWorkingNow(cs, cs.pieces[0], at('12:00'), TZ);
  assert.equal(done.lines[2].value, 'estimate $1.23');
  const cs2 = cosSessions(snapOf(['s-ended']), at('12:00').getTime());
  assert.deepEqual([cosWorkingNow(cs2, cs2.pieces[0], at('12:00'), TZ).lines[2].why], [COS_COST_NR], 'a null cost after it ends: still not recorded');
});

test('AC49 (J13): a session line\'s summary sheet — its words, the line as written linked to its file; Why and For you "not recorded in the session line"; an end line\'s figures one tap away, each null "not recorded"', () => {
  const t = team(['s-ended'], at('12:00'));
  const page = memberPage(SD3, { items: [] }, t.snap, t.j, EMPTY_Q, t.tv, 'chief-of-staff', at('12:00'), TZ);
  const end = page.log[0];
  const sm = summarySheet(SD3, t.snap, end, EMPTY_Q);
  assert.equal(sm.what, 'Handed back · 1 h 10 min 0 s · 09:10');
  assert.equal(sm.quote, GOOD['s-ended'].split('\n')[3]);
  assert.equal(sm.link, 'https://github.com/shumpmaster/Service-Desk/blob/main/sessions/chief-of-staff/s-ended.jsonl');
  assert.equal(sm.why, 'not recorded in the session line');
  assert.equal(sm.forYou, 'not recorded in the session line');
  assert.ok(sm.figures.some((x) => x === 'Run time: 1 h 10 min 0 s'));
  assert.ok(sm.figures.every((x) => !/not available/.test(x)));
});

test('AC49 (J13): a `definer` helper line gives the Definer\'s tile "Just finished" and its last work, never "Working"; a helper whose role the roster lacks shows on the Chief of Staff\'s page only', () => {
  const t = team(['s-open'], at('12:00'));
  const d = t.member('definer');
  assert.ok(d, 'the roster holds the definer');
  assert.equal(d.status, 'Just finished', '29 minutes after the helper ended (11:31)');
  assert.equal(d.last, 'a helper session for the Chief of Staff, 11:31');
  const later = team(['s-open'], at('12:02')).member('definer');
  assert.deepEqual([later.status, later.last], ['Idle', 'last: a helper session for the Chief of Staff, 11:31']);
  assert.ok(!team(['s-open'], at('11:20')).tv.members.some((m) => m.status === 'Working' && m.id === 'definer'), 'never "Working"');
  const e = team(['s-ended'], at('12:00'));
  assert.ok(!e.tv.members.some((m) => m.id === 'ux-researcher'), 'no tile for a role the roster lacks');
  const page = memberPage(SD3, { items: [] }, e.snap, e.j, EMPTY_Q, e.tv, 'chief-of-staff', at('12:00'), TZ);
  assert.ok(page.log.some((r) => /^ux-researcher helper/.test(r.text)), 'on the Chief of Staff\'s page');
  // The Definer's own log: the helper line as a row of its own, on the main line.
  const dp = memberPage(SD3, { items: [] }, t.snap, t.j, EMPTY_Q, t.tv, 'definer', at('12:00'), TZ);
  const row = dp.log.find((r) => r.entry.shape === 'cos-helper');
  assert.deepEqual([row.text, row.lane], ['definer helper · 11:10 to 11:31 · 1,200 tokens · 4 tool uses · 21 min 0 s', null]);
});

// ---------------------------------------------------------------------------
// AC67: the cards

test('AC67 (J13): the Chief of Staff\'s icon for each of AC49\'s status words; its "last:" and "feeds: not recorded"; a helper\'s "last:" on the Definer\'s card', async () => {
  const icon = (names, now) => memberIcon(team(names, now).cos.status);
  assert.equal(icon(['s-open'], at('12:00')), 'half', 'Working');
  assert.equal(icon(['s-ended'], at('09:39')), 'check', 'Just finished');
  assert.equal(icon(['s-ended'], at('12:00')), 'planned', 'Idle');
  assert.equal(icon([], at('12:00')), 'unrec', 'No session recorded yet');
  assert.equal(team(['s-ended'], at('12:00')).cos.card, "last: Filing your question on the desk plan's fourth review, 17 Oct");
  // memberWork: a helper later than the Definer's latest outcome entry is its last work, feeding no milestone.
  const w = memberWork({ cols: { runs: [] } }, null, [], 'definer', TZ, { at: at('11:31').getTime() });
  assert.deepEqual([w.last, w.feeds, w.link, w.helper], ['last: a helper session for the Chief of Staff, 17 Oct', null, null, true]);
  // On the page.
  const files = { 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), 'governance/SURFACES.md': SURFACES, [P('s-ended')]: GOOD['s-ended'] };
  const app = await loadSandbox({ config: { ...CONFIG, projects: [v3('Alpha')] }, repos: { Alpha: repo(files) }, hash: '#/p/Alpha/team', now: at('12:00').getTime() });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    const card = (id) => findAll(app.view, (e) => e.dataset && e.dataset.member === id)[0];
    const cos = card('chief-of-staff');
    assert.match(cos.textContent, /Idle/);
    assert.match(cos.textContent, /last: Filing your question on the desk plan's fourth review, 17 Oct/);
    assert.match(cos.textContent, /feeds: not recorded/);
    assert.equal(linksIn(cos).filter((l) => /On the Timeline/.test(l.text)).length, 0, 'no "On the Timeline ›" link');
    assert.equal(byClass(cos, 'i-planned').length, 1);
    const definer = card('definer');
    assert.match(definer.textContent, /last: a helper session for the Chief of Staff, 17 Oct/);
    assert.match(definer.textContent, /feeds: not recorded/);
  } finally {
    app.restore();
  }
});

test('AC49 (J13): the Agents list under "More detail" stays as it is (the owner\'s answer A: Team screen only)', () => {
  const src = readFileSync(join(FIX, '..', '..', '..', 'src', 'lib', 'asked.js'), 'utf8');
  assert.doesNotMatch(src, /chief-of-staff|cos\.js|sessions\/chief-of-staff/, 'the Agents view reads no session line');
});
