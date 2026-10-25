// ac-test: S-001/AC91 — G4 of "After the glance audit": a project's page and the one date form, parts (j) and (l)
// (specs/S-001.md, AC91 (j): "calm looks calm": "Nothing waiting on you" takes the soft row, 400 13 px `--ink2`
// (`.v2-prtt.soft`), its ✓ and "checked <age> ago" unchanged, "◆ <n> wait on you" staying 500 13 px `--ink`; "ran
// again, said once" (P-001-glance-ran-again.md, A): where two or more ran-again lines have no reason recorded, they become
// one, "<Phase> and <Phase> ran again · why: not recorded", each phase named once, in the strip's order, in the grey of a gap
// the agents fill, a recorded line and a reading one kept apart, a single one unchanged; AC91 (l): "Your last action" on a
// project's page and the dates on a team member's page read "14 Oct, 09:40" for an earlier day, never "Oct 14 09:40", and
// "09:30" alone for today; J9's `whenText` and its other uses unchanged), with AC83's, AC55's and AC49's changed parts.
// ac-test: S-001/AC83 ac-test: S-001/AC55 ac-test: S-001/AC49
//
// The page is the sandbox's own code under the fake DOM, on the fixture states of tests/desk/glance-fixtures.mjs (`quiet`
// and `mix`: Service-Desk's records at 77bfeae, real, and a made-up project, NOT real records) and AC55's and AC49's own
// fixtures (sandbox-fixtures.mjs's two made-up projects; Service-Desk's dispatch log at 3117150, real, with one made-up line
// labelled where it is written). Each look is the cascade of the page's own stylesheets (tests/desk/css-cascade.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC, CONFIG } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll, j11Files, SD3 } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { twoProjects, iso } from './sandbox-fixtures.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { quietState, mixState, MIX_PROJECT, SD, NOW } from './glance-fixtures.mjs';
import { sayUnrecordedOnce } from '../../src/lib/projectpage.js';
import { workingNow, cosWorkingNow, cosPieceWords, memberEntryWords } from '../../src/lib/sandbox.js';
import { cosLanes, LANES_NOW } from './lanes-fixtures.mjs';
import { v3 } from './sandbox-fixtures.mjs';
import { whenText, dayTimeText } from '../../src/lib/timefmt.js';

const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');
const THEMES = [['light', '#18191c', '#5c5f66'], ['dark', '#ecedef', '#a2a5ac']];
const TZ = 'America/Chicago';
const J9_FORM = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2} \d\d:\d\d\b/;

/** Each drawn element's cascaded look in a theme, at 360 px: el → { size, weight, color }. */
function looks(app, theme) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width: 360, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) if (n.el) out.set(n.el, { size: plain(n.style.get('font-size')), weight: plain(n.style.get('font-weight')), color: plain(n.style.get('color')) });
  return out;
}
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
async function open(state, hash) {
  const app = await loadSandbox({ ...state, hash, now: NOW, store: memStore() });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}

// ---------------------------------------------------------------------------
// (j) The project page

test('AC91 (j): calm looks calm — "Nothing waiting on you" in the soft row, 400 13 px --ink2, its ✓ and "checked <age> ago" unchanged; "◆ <n> wait on you" stays 500 13 px --ink; in light and dark', async () => {
  // One page open at a time: each app's restore puts back the globals it found (sandbox-helpers.mjs).
  const calm = await open(quietState(), `#/p/${MIX_PROJECT}`);
  try {
    const row = keyed(calm, 'page-waits');
    const title = byClass(row, 'v2-prtt')[0];
    assert.equal(title.textContent, 'Nothing waiting on you');
    assert.equal(title.className, 'v2-prtt soft');
    assert.equal(findAll(row, (e) => e.tag === 'svg')[0].attrs.class.split(' ')[1], 'st-check', 'its ✓, as built');
    assert.match(byClass(row, 'v2-small')[0].textContent, /^checked \d+ s ago$/, 'and "checked <age> ago", as built');
    for (const [theme, , ink2] of THEMES) {
      const a = looks(calm, theme).get(title);
      assert.deepEqual([a.size, a.weight, a.color], ['13px', '400', ink2], `${theme}: the calm row soft`);
    }
    // "At work now" keeps its own weight (draft 2, the plan review's N2).
    assert.equal(byClass(keyed(calm, 'page-work'), 'v2-prtt')[0].className, 'v2-prtt');
  } finally {
    calm.restore();
  }
  const waits = await open(mixState(), `#/p/${MIX_PROJECT}`);
  try {
    const busy = byClass(keyed(waits, 'page-waits'), 'v2-prtt')[0];
    assert.match(busy.textContent, /^\d+ wait on you$/);
    assert.equal(busy.className, 'v2-prtt');
    for (const [theme, ink] of THEMES) {
      const b = looks(waits, theme).get(busy);
      assert.deepEqual([b.size, b.weight, b.color], ['13px', '500', ink], `${theme}: what waits keeps its weight`);
    }
  } finally {
    waits.restore();
  }
});

/** A made-up ran-again line (NOT a real record): `kind` 'missing' (no reason recorded), 'quote' (recorded) or 'reading'. */
const line = (phase, kind, n = 2) => ({
  key: `again:${phase}-i${n}`, phase, source: kind === 'missing' ? null : { words: 'its record' }, quote: kind === 'quote' ? 'a reason' : null,
  words: `${phase} ran again from 8 Oct · why it went back: ${kind === 'missing' ? 'not recorded' : kind === 'quote' ? '“a reason”' : 'not available yet'}`,
  ...(kind === 'missing' ? { missing: true } : {}),
});
const said = (lines) => sayUnrecordedOnce(lines).map((x) => x.words);

test('AC91 (j): ran again, said once — two unrecorded lines become "Design and Build ran again · why: not recorded", three "Discovery, Design and Build …", in the strip\'s order, each phase named once; a recorded line and a reading one kept apart; a single one unchanged', () => {
  assert.deepEqual(said([line('Design', 'missing'), line('Build', 'missing')]), ['Design and Build ran again · why: not recorded']);
  assert.deepEqual(said([line('Build', 'missing'), line('Discovery', 'missing'), line('Design', 'missing')]), ['Discovery, Design and Build ran again · why: not recorded'],
    'the strip\'s order (Discovery, Design, Build, Launch), whatever order the runs came in');
  assert.deepEqual(said([line('Design', 'missing', 2), line('Build', 'missing'), line('Design', 'missing', 3)]), ['Design and Build ran again · why: not recorded'],
    'a phase that ran again twice is named once');
  assert.deepEqual(said([line('Design', 'missing', 2), line('Design', 'missing', 3)]), ['Design ran again · why: not recorded'], 'one phase twice: still one line');
  // A recorded line keeps its own date and reason (AC70); a line still reading keeps its own; the one line takes the first
  // unrecorded line's place.
  const mixed = sayUnrecordedOnce([line('Discovery', 'quote'), line('Design', 'missing'), line('Build', 'reading'), line('Launch', 'missing')]);
  assert.deepEqual(mixed.map((x) => x.words), [
    'Discovery ran again from 8 Oct · why it went back: “a reason”',
    'Design and Launch ran again · why: not recorded',
    'Build ran again from 8 Oct · why it went back: not available yet',
  ]);
  assert.deepEqual(mixed.map((x) => Boolean(x.missing)), [false, true, false], 'the one line still a gap the agents fill');
  assert.equal(mixed[1].source, null);
  assert.deepEqual(mixed[1].phases, ['Design', 'Launch']);
  // A single unrecorded line keeps AC83's form, its date included.
  const one = [line('Discovery', 'quote'), line('Design', 'missing')];
  assert.deepEqual(sayUnrecordedOnce(one), one);
  assert.deepEqual(said([line('Design', 'missing')]), ['Design ran again from 8 Oct · why it went back: not recorded']);
  assert.deepEqual(said([]), []);
});

test('AC91 (j): on the page — the made-up project\'s two unrecorded runs said once, under the strip, in the grey of a gap the agents fill (--ink2) in light and dark; Service-Desk\'s single one (77bfeae) unchanged', async () => {
  const mix = await open(mixState(), `#/p/${MIX_PROJECT}`);
  try {
    const under = keyed(mix, 'under');
    const lines = under.children.slice(0, -1);
    assert.deepEqual(lines.map((x) => x.textContent), ['Design and Build ran again · why: not recorded']);
    assert.equal(lines[0].className, 'v2-small gap');
    for (const [theme, , ink2] of THEMES) assert.equal(looks(mix, theme).get(lines[0]).color, ink2, `${theme}: --ink2`);
    assert.ok(!/ran again from/.test(mix.text()), 'the dates stay on the Timeline');
    await mix.go(`#/p/${encodeURIComponent(SD.name)}`);
    assert.deepEqual(keyed(mix, 'under').children.slice(0, -1).map((x) => x.textContent), ['Design ran again from 8 Oct · why it went back: not recorded']);
  } finally {
    mix.restore();
  }
});

// ---------------------------------------------------------------------------
// (l) One date form in the two places the audit named

test('AC91 (l): the one date form — "14 Oct, 09:40" for an earlier day (AC82\'s, with dayWords and hhmm), "09:30" alone for today; J9\'s whenText unchanged ("Oct 14 09:40")', () => {
  const now = new Date('2026-10-15T15:00:00Z'); // 10:00 on 15 Oct in Chicago
  assert.equal(dayTimeText(new Date('2026-10-14T14:40:00Z'), now, TZ), '14 Oct, 09:40');
  assert.equal(dayTimeText(new Date('2026-10-15T14:30:00Z'), now, TZ), '09:30');
  assert.equal(dayTimeText(new Date('2026-10-15T04:59:00Z'), now, TZ), '14 Oct, 23:59', 'a minute before midnight in Chicago: yesterday');
  assert.equal(dayTimeText(new Date('2026-10-15T05:01:00Z'), now, TZ), '00:01');
  assert.equal(dayTimeText(new Date('2026-11-01T18:00:00Z'), new Date('2026-11-02T15:00:00Z'), TZ), '1 Nov, 12:00', 'across the 1 Nov clock change: CST');
  assert.equal(dayTimeText(new Date('nope'), now, TZ), 'time not recorded');
  assert.equal(whenText(new Date('2026-10-14T14:40:00Z'), now, TZ), 'Oct 14 09:40', 'J9\'s `<t>`, as tests/desk/j9-pipeline.test.mjs keeps it');
  assert.equal(whenText(new Date('2026-10-15T14:30:00Z'), now, TZ), '09:30');
});

test('AC91 (l): "Your last action" on a project\'s page — an earlier day\'s date "8 Oct, 16:42" (Service-Desk at 77bfeae), never J9\'s "Oct 8 16:42"', async () => {
  const app = await open(quietState(), `#/p/${encodeURIComponent(SD.name)}`);
  try {
    const last = keyed(app, 'last-action').textContent;
    assert.match(last, /^Your last action: Q-012 closed: drop \(card stop-1\) · 8 Oct, 16:42 /);
    assert.doesNotMatch(last, J9_FORM);
  } finally {
    app.restore();
  }
});

test('AC91 (l): today\'s time becomes a date on the 15-second tick that crosses midnight in ownerTimeZone — "Your last action" (its live time) and a member\'s page (drawn again on that tick)', async () => {
  const T = Date.parse('2026-10-15T04:59:30Z'); // 23:59:30 on 14 Oct in Chicago
  // "Your last action": a made-up ruling (NOT a real record) at 23:49 on 14 Oct, on sandbox-fixtures.mjs's made-up project.
  const setup = twoProjects();
  setup.repos.Alpha.commit({ 'decisions/questions/Alpha-late.md': 'Ruling: B\n' });
  setup.repos.Alpha.history['decisions/questions/Alpha-late.md'] = [{ commit: { committer: { date: iso(T - 10 * 60e3) } } }];
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha', now: T });
  try {
    await app.advance(1000);
    const when = () => byClass(keyed(app, 'last-action'), 'sb-last-when')[0].textContent;
    assert.equal(when(), '23:49', 'today');
    await app.tick();
    assert.equal(when(), '23:49', 'still today on the tick before midnight');
    await app.advance(30_000);
    await app.tick();
    assert.equal(when(), '14 Oct, 23:49', 'after midnight: a date, on the tick');
  } finally {
    app.restore();
  }
  // A member's page: Service-Desk's dispatch log at 3117150 (real) with one made-up outcome line for the Definer at 23:30
  // on 14 Oct (NOT a real record).
  const files = j11Files();
  const LOG = 'dispatch-log/2026-10.jsonl';
  const made = { item: 'P-001', record: 'docs/reports/P-001-definer.md', result: 'ok', role: 'definer', session: 'P-001:made-up-for-G4',
    time: new Date(T - 29.5 * 60e3).toISOString().replace(/\.\d+Z$/, 'Z'), trigger: 'outcome', verdict: 'none' };
  files[LOG] = `${files[LOG].trimEnd()}\n${JSON.stringify(made)}\n`;
  const team = await loadSandbox({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': repo(files) }, hash: '#/p/Service-Desk/team/definer', now: T });
  try {
    await team.advance(1000);
    const newest = () => byClass(byClass(team.view, 'sb-branch')[0], 'sb-brow-t')[0].textContent;
    // From G4's fix round, the time after " · " (AC91 (l)'s note "After G4's reviews").
    assert.equal(newest(), 'P-001: definer finished — ok · 23:30');
    await team.advance(30_000);
    await team.tick();
    assert.equal(newest(), 'P-001: definer finished — ok · 14 Oct, 23:30', 'drawn again on the tick that crossed midnight');
    assert.doesNotMatch(team.text(), J9_FORM);
  } finally {
    team.restore();
  }
});

// ---------------------------------------------------------------------------
// (l), from G4's fix round (AC91 (l)'s note "After G4's reviews": the sheets over a member's page take the one form, and a
// member page's lines built from J9's entry words put their time after " · ")

test('AC91 (l), G4\'s fix round: the sheets over a member\'s page in the one date form — Working now\'s Started, Last check-in and Update, the Chief of Staff\'s too, and a handed-back piece\'s words, from an earlier day; Next check-in stays "HH:MM"', () => {
  const now = new Date('2026-10-15T15:00:00Z'); // 10:00 on 15 Oct in Chicago
  const since = new Date('2026-10-15T03:35:00Z'); // 22:35 on 14 Oct
  const asOf = new Date('2026-10-15T04:55:00Z'); // 23:55 on 14 Oct
  // A made-up dispatched item and its dispatch line (NOT real records).
  const model = { items: [{ id: 'P-003', state: 'dispatched', stage: '5 Produce', asOf, running: { role: 'builder', since } }],
    allEntries: [{ shape: 'dispatch', item: 'P-003', role: 'builder', stage: 5, time: asOf.toISOString(), label: 'x' }] };
  const wn = workingNow(v3('A'), model, {}, { workflow: { cron: '*/30 * * * *' } }, 'builder', {}, now, TZ);
  assert.deepEqual(wn.tiles.map((t) => [t.label, t.value]), [['Started', '14 Oct, 22:35'], ['Time so far', '11 h 25 min'], ['Last check-in', '14 Oct, 23:55'], ['Next check-in', '10:30']],
    'Started and Last check-in in the one form; Next check-in, a time to come, "HH:MM"');
  assert.equal(wn.lines[0].value, 'P-003: builder started (Produce) · 14 Oct, 23:55', 'Update: the headline words, " · ", the time');
  const today = workingNow(v3('A'), { ...model, items: [{ ...model.items[0], asOf: new Date('2026-10-15T14:20:00Z'), running: { role: 'builder', since: new Date('2026-10-15T14:10:00Z') } }] },
    {}, { workflow: { cron: '*/30 * * * *' } }, 'builder', {}, now, TZ);
  assert.deepEqual([today.tiles[0].value, today.tiles[2].value], ['09:10', '09:20'], 'today: "HH:MM" alone, as before');
  // The Chief of Staff's piece (made up, NOT real records): started yesterday, a helper since.
  const piece = { path: 'sessions/chief-of-staff/s.jsonl', session: 's', start: { n: 1, at: Date.parse('2026-10-15T04:40:00Z'), doing: 'A made-up piece' },
    helpers: [{ role: 'definer', startedAt: Date.parse('2026-10-15T04:50:00Z'), at: Date.parse('2026-10-15T14:00:00Z'), reported: { tokens: null, tool_uses: null, duration_ms: null } }], end: null, state: 'working' };
  const cw = cosWorkingNow({ pieces: [piece], orphans: [], looseHelpers: [] }, piece, now, TZ);
  assert.deepEqual(cw.tiles.map((t) => [t.label, t.value]), [['Started', '14 Oct, 23:40'], ['Time so far', '10 h 20 min'], ['Last check-in', '09:00'], ['Next check-in', '–']]);
  assert.match(cw.lines[0].value, /^definer helper · 14 Oct, 23:50 to 09:00 · /, 'Update: the helper\'s times in the one form');
  // A handed-back piece's words, as its sheet shows them.
  const ended = { ...piece, state: 'ended', end: { at: Date.parse('2026-10-15T04:58:00Z') } };
  assert.equal(cosPieceWords(ended, now, TZ, dayTimeText), 'A made-up piece · handed back 14 Oct, 23:58');
  assert.equal(cosPieceWords(ended, now, TZ), 'A made-up piece · handed back Oct 14 23:58', 'J9\'s form where no member page asks for the one form');
  for (const v of [...wn.tiles, ...wn.lines, ...cw.tiles, ...cw.lines].map((x) => x.value)) assert.doesNotMatch(String(v), J9_FORM);
});

test('AC91 (l), G4\'s fix round: on the page, a handed-back piece\'s sheet over the Chief of Staff\'s page reads its earlier day in the one form, as the row it opens from', async () => {
  // lanes-fixtures.mjs's Lanes-fifth (made-up session lines, NOT real), a day after its pieces: piece B handed back at 07:00Z
  // on 17 Oct, 02:00 in Chicago.
  const s = cosLanes();
  const app = await loadSandbox({ config: { ...CONFIG, projects: s.projects }, repos: s.repos, hash: '#/p/Lanes-fifth/team/chief-of-staff', now: LANES_NOW + 24 * 3600e3 });
  try {
    await app.advance(1000);
    const rows = byClass(app.view, 'sb-brow-t').map((r) => r.textContent);
    assert.ok(rows.some((r) => /^Handed back · .* · 17 Oct, 02:00$/.test(r)), 'the row: "17 Oct, 02:00"');
    await app.go(`#/p/Lanes-fifth/team/chief-of-staff/now/${encodeURIComponent('fifth-b line 1')}`);
    const sheet = byClass(app.view, 'sb-sheet')[0] || byClass(app.view, 'v2-sheet')[0];
    assert.ok(sheet.textContent.includes('Chief of Staff: Made-up piece B · handed back 17 Oct, 02:00'), sheet.textContent);
    assert.doesNotMatch(app.text(), J9_FORM);
  } finally {
    app.restore();
  }
});

test('AC91 (l), G4\'s fix round: a line built from J9\'s entry words on a member\'s page — the headline words, " · ", the time in the one form; " (proxy)" stays after a ruling\'s words; null where J9 gives none', () => {
  const now = new Date('2026-10-15T15:00:00Z');
  const at = (iso) => ({ time: iso });
  assert.equal(memberEntryWords({ shape: 'card', item: 'Q-012', gate: 'stop', card: 1, ...at('2026-10-08T17:22:00Z') }, now, TZ), 'Q-012: waiting on you — card stop-1 · 8 Oct, 12:22');
  assert.equal(memberEntryWords({ shape: 'card', item: 'Q-012', gate: 'stop', card: 1, ...at('2026-10-15T17:22:00Z') }, now, TZ), 'Q-012: waiting on you — card stop-1 · 12:22', 'today');
  assert.equal(memberEntryWords({ shape: 'decision', item: 'P-001', gate: 'dor', card: 4, word: 'build', proxy: true, ...at('2026-10-08T17:22:00Z') }, now, TZ),
    'P-001: you answered dor-4 with build (proxy) · 8 Oct, 12:22');
  assert.equal(memberEntryWords({ shape: 'outcome', item: 'P-001', role: 'critic', result: 'ok', verdict: 'FAIL', ...at('2026-10-08T17:22:00Z') }, now, TZ),
    'P-001: critic finished — ok, verdict FAIL · 8 Oct, 12:22', 'the verdict\'s comma kept: only the time moves');
  assert.equal(memberEntryWords({ shape: 'anomaly', item: 'Q-013', ...at('2026-10-08T21:48:00Z') }, now, TZ), 'Q-013: Orchestrator anomaly · 8 Oct, 16:48');
  assert.equal(memberEntryWords({ shape: 'nothing-j9-names', ...at('2026-10-08T21:48:00Z') }, now, TZ), null);
});
