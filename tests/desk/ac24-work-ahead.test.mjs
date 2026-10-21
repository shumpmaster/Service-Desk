// ac-test: S-001/AC24 — Work ahead by milestones (M3A; S-001 "Work ahead by milestones", draft 5),
// built in the sandbox view (`?sandbox`) and reached from its Home's "Work ahead" control. Service-
// Desk's records are the real ones at 77bfeae (tests/desk/fixtures/j11-77bfeae/, with its
// trace-notes.txt from v3_checks trace as the oracle); every plan, estimate, later-work list, ask,
// question and answer added here is made up (NOT a real record), and Personal-Org-Operating-Model is
// read in poom/'s placeholder form only. The page itself is drawn under the fake DOM, fake timers and
// the fake desk function, so the screens and taps are the page's own.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSandbox, findAll, byClass } from './sandbox-helpers.mjs';
import { findKeyed } from './sandbox-fixtures.mjs';
import { textRuns } from './screen-text.mjs';
import { loadApp } from './page-harness.mjs';
import { fixture } from './helpers.mjs';
import { repo, gitSha } from './fake-desk.mjs';
import { SD, POOM, waSetup, WORKED, LATER, estLine, planText, memStore, j77Files, j77Notes, poomFiles } from './wa-fixtures.mjs';
import { planBody, DRAFT_KEY, WA } from '../../src/lib/workahead.js';
import { snapOf } from './wa-fixtures.mjs';
import { j11Records, timelineOf, phaseView } from '../../src/lib/sandbox.js';
import { runsContext } from '../../src/lib/feed.js';

const at = (s) => Date.parse(s);
const NOW = at('2026-10-18T18:00:00Z'); // 18 Oct, 13:00 in Chicago
const SIX = ['MD1', 'MD2', 'MD3', 'M3A', 'M3B', 'M3C'];
const DOC = j77Files()['docs/PROJECT.md'];
/** docs/PROJECT.md with a made-up sprint on one milestone's plan line (NOT the real record). */
const withSprint = (id, sprint) => DOC.replace(new RegExp(`(\\(${id}\\) · done when [^\\n]*? · phase: [A-Za-z]+)\\n`), `$1 · sprints: ${sprint}\n`);

async function open({ now = NOW, extra = {}, store = memStore(), hash = '#/work', projects = null, poom = poomFiles(), sd = SD, linkCap } = {}) {
  const setup = waSetup({ extra, projects, poom, sd, linkCap });
  const app = await loadSandbox({ ...setup, hash, now, store });
  app.repos = setup.repos;
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}
const cls = (e, c) => ` ${e.className || ''} `.includes(` ${c} `);
const rows = (app) => byClass(app.view, 'sb-wa-row');
const codesOf = (app) => rows(app).map((r) => byClass(r, 'code')[0].textContent);
const rowOf = (app, id) => rows(app).find((r) => byClass(r, 'code')[0].textContent === id);
const inRow = (app, id, c) => {
  const e = byClass(rowOf(app, id), c)[0];
  return e ? e.textContent : null;
};
const finishOf = (app, id) => {
  const t = inRow(app, id, 'sb-wa-fin');
  return t ? t.replace(/^Rough finish: /, '') : null;
};
const card = (app) => byClass(app.view, 'sb-wa-big')[0].textContent;
const btn = (app, k) => findKeyed(app, k);
const key = (id) => `Service-Desk|${id}`;
const press = async (app, el, k) => {
  el.dispatch('keydown', { key: k });
  await app.flush();
};

// ---------------------------------------------------------------------------
// The oracle

test('AC24: the oracle — `v3_checks.py trace` at 77bfeae puts each project milestone in the run the desk reads it in (MD1 to MD3 in Design i2, the now run; M3A and M3B in Build i2; M3C in Launch i1)', () => {
  const want = new Map();
  let run = null;
  for (const l of j77Notes()) {
    const r = /^(Discovery|Design|Build|Launch) i(\d+)$/.exec(l);
    if (r) {
      run = `${r[1]} i${r[2]}`;
      continue;
    }
    const m = /^ {2}(M[0-9A-Z]{1,7}) "/.exec(l);
    if (m && run) want.set(m[1], run);
  }
  assert.deepEqual([...want.entries()], [['M1', 'Build i1'], ['M2', 'Build i1'], ['M2B', 'Build i1'], ['MD1', 'Design i2'], ['MD2', 'Design i2'], ['MD3', 'Design i2'],
    ['M3A', 'Build i2'], ['M3B', 'Build i2'], ['M3C', 'Launch i1']]);
  const snap = snapOf(j77Files());
  const j = j11Records(SD, snap);
  const tl = timelineOf(j);
  const pv = phaseView(SD, tl, snap.tree, j);
  const ctx = runsContext(SD, snap, j, tl, pv, NOW, 'America/Chicago');
  const got = new Map();
  for (const r of ctx.cols.runs) for (const m of r.project) got.set(m.id, `${r.phase} i${r.iteration}`);
  assert.deepEqual([...got.entries()].sort(), [...want.entries()].sort());
  assert.equal(`${ctx.now.phase} i${ctx.now.iteration}`, 'Design i2', 'the now run');
  assert.equal(ctx.next.id, 'MD3', 'the next to reach');
});

// ---------------------------------------------------------------------------
// The way in, and the accepted views unchanged

// From stage 2 (AC82, AC81 "Until stage 3", AC86): Home's "Work ahead ›" control goes, as frames H1 to
// H5 draw none, and the bar's Plan tab is the way to Work ahead. This case, AC24's for the control, is
// rewritten for the Plan tab (AC82: "AC24's case for the control rewritten in stage 2's pull request for
// the Plan tab"; draft 4, the Critic's note 2, round 3): the same screen, opened the same way, one tap.
test('AC24 (from stage 2, AC82): Home has no "Work ahead" control; the bar\'s Plan tab opens the screen: "All projects" over "Work ahead", "6 milestones to go · 3 reached", with Back and Home', async () => {
  const app = await open({ hash: '#/' });
  try {
    assert.equal(findKeyed(app, 'work-ahead'), null, 'no control on Home');
    assert.doesNotMatch(byClass(app.view, 'v2-home')[0].textContent, /Work ahead/, 'nor its words');
    const tab = findKeyed(app, 'tab:plan');
    assert.ok(tab, 'the bar\'s Plan tab');
    assert.equal(tab.attrs.href, '#/work');
    assert.equal(byClass(tab, 'v2-tabw')[0].textContent, 'Plan');
    await app.tap(tab);
    await app.go('#/work');
    const hdr = byClass(app.view, 'sb-hdr')[0];
    assert.deepEqual(textRuns(hdr, () => false), ['Back', 'Home', 'All projects', 'Work ahead', '6 milestones to go · 3 reached']);
    assert.ok(findKeyed(app, 'nav-home') && findKeyed(app, 'nav-back'));
    assert.equal(findKeyed(app, 'tab:plan').attrs['aria-current'], 'page', 'Plan current');
  } finally {
    app.restore();
  }
});

test('AC24 (AC43): the accepted views, without ?sandbox, have no Work ahead control or screen', async () => {
  const repos = waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } }).repos;
  for (const hash of ['', '#/work']) {
    const app = await loadApp({ hash, repos, now: NOW });
    try {
      await app.advance(62_000);
      assert.doesNotMatch(app.els.view.textContent, /Work ahead|Rough finish|milestones to go/);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// Which milestones, their order and their states

test('AC24: with no plan, MD1 to M3C in section 3\'s order under "No plan recorded yet"; "Reached · 3" folded, opening to M1 7 Oct, M2 18 Oct and M2B 18 Oct', async () => {
  const app = await open();
  try {
    assert.deepEqual(codesOf(app), SIX);
    assert.match(app.text(), /No plan recorded yet/);
    // Draft 6 (the ruling on build review round 1, D): with no move made, "No changes yet"; "No plan recorded yet" heads the order.
    assert.equal(byClass(app.view, 'sb-wa-state')[0].textContent, 'No changes yet');
    assert.equal(findKeyed(app, 'wa-order').textContent, 'No plan recorded yet');
    const fold = findKeyed(app, 'fold:reached');
    assert.equal(fold.textContent, 'Reached · 3▸');
    assert.equal(fold.attrs['aria-expanded'], 'false');
    assert.doesNotMatch(app.text(), /Every project's status visible on the phone/);
    await app.tap(fold);
    const items = byClass(app.view, 'reached').map((e) => textRuns(e, () => false).join(' '));
    assert.deepEqual(items, ["Every project's status visible on the phone M1 7 Oct", 'Cards answered straight from the desk M2 18 Oct', 'Agent usage shown on the desk M2B 18 Oct']);
    await app.tap(findKeyed(app, 'fold:reached'));
    assert.equal(byClass(app.view, 'reached').length, 0, 'folds on a second tap');
    // Each row: its place ("1st of 6" for the reader), name, code, phase in words with its colour, "done when".
    const r1 = rows(app)[0];
    assert.deepEqual(textRuns(byClass(r1, 'sb-wa-ord')[0], () => false), ['1', '1st of 6']);
    assert.equal(byClass(r1, 'sb-wa-name')[0].textContent, 'What a good desk looks like is known');
    assert.equal(byClass(r1, 'sb-wa-ph')[0].textContent, 'Design');
    assert.ok(cls(r1, 'ph-des') && cls(byClass(r1, 'sb-wa-ph')[0], 'ph-des'));
    assert.ok(cls(rowOf(app, 'M3C'), 'ph-launch'));
    assert.equal(inRow(app, 'MD1', 'sb-wa-done'), 'Done when source-checked design research sets out what a good desk looks like and why');
    assert.equal(byClass(r1, 'sb-wa-proj').length, 0, 'one v3 project: its name not repeated on rows');
  } finally {
    app.restore();
  }
});

test('AC24: the states, as Status gives them — MD1 and MD2 work filed (half-filled), MD3 next to reach (gold ring), M3A to M3C no work filed (empty ring); a made-up sprint on M3A: "Work filed" with the empty ring, under way', async () => {
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED() } });
  const state = (id) => [inRow(app, id, 'sb-wa-st'), byClass(byClass(rowOf(app, id), 'sb-wa-st')[0], 'sb-mk')[0].className];
  try {
    assert.deepEqual(state('MD1'), ['Work filed: Q-013', 'sb-mk m-half']);
    assert.deepEqual(state('MD2'), ['Work filed: PR #72, #74, #75, #77', 'sb-mk m-half']);
    assert.deepEqual(state('MD3'), ['No work filed yet · next to reach', 'sb-mk m-gold']);
    for (const id of ['M3A', 'M3B', 'M3C']) assert.deepEqual(state(id), ['No work filed yet', 'sb-mk m-empty']);
    assert.doesNotMatch(app.text(), /work done|accept\?|in progress/i);
    // The same marks as the Status screen gives the same milestones.
    await app.go('#/p/Service-Desk');
    const ms = byClass(app.view, 'sb-ms');
    const mark = (id) => byClass(ms.find((m) => byClass(m, 'code')[0].textContent === id), 'sb-mk')[0].className;
    assert.deepEqual(SIX.map(mark), ['sb-mk m-half', 'sb-mk m-half', 'sb-mk m-gold', 'sb-mk m-empty', 'sb-mk m-empty', 'sb-mk m-empty']);
  } finally {
    app.restore();
  }
  // M3A with a made-up sprint, in Build i2 (a run still to come): Status's words and the empty ring;
  // under way for the rough finish (on 20 Oct its 4–7 counts from 18 Oct: 2–5 left).
  const app2 = await open({ now: at('2026-10-20T18:00:00Z'), extra: { 'docs/PROJECT.md': withSprint('M3A', 'PR #901'), 'intake/estimates.jsonl': WORKED() } });
  try {
    const st = byClass(rowOf(app2, 'M3A'), 'sb-wa-st')[0];
    assert.equal(st.textContent, 'Work filed: PR #901');
    assert.equal(byClass(st, 'sb-mk')[0].className, 'sb-mk m-empty');
    // MD3 3–5 not under way from 20 Oct: 23 Oct – 25 Oct; M3A then 2–5 more: 25 Oct – 30 Oct.
    assert.equal(finishOf(app2, 'MD3'), '23 Oct – 25 Oct');
    assert.equal(finishOf(app2, 'M3A'), '25 Oct – 30 Oct');
  } finally {
    app2.restore();
  }
});

// ---------------------------------------------------------------------------
// The estimate and the rough finish

test('AC24: the worked example — every date and the card, across 1 Nov 2026\'s daylight-saving change; 20 Oct with no new estimate, the rest two days later', async () => {
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED() } });
  try {
    assert.deepEqual(SIX.map((id) => finishOf(app, id)), ['once you accept it', 'once you accept it', '21 Oct – 23 Oct', '25 Oct – 30 Oct', '27 Oct – 3 Nov', '29 Oct – 6 Nov']);
    assert.equal(card(app), '29 Oct – 6 Nov');
    assert.equal(inRow(app, 'MD1', 'sb-wa-est'), 'Estimate no work left · waiting on your acceptance · your Chief of Staff, 18 Oct');
    assert.equal(inRow(app, 'MD3', 'sb-wa-est'), 'Estimate about 3–5 days of work · your Chief of Staff, 18 Oct');
    assert.match(app.text(), /From the estimates below, added up in your order from today\. An expectation, never a deadline\./);
    assert.doesNotMatch(app.text(), /launch target|11 Nov|V4/, 'the mockup\'s launch-target line is not built');
  } finally {
    app.restore();
  }
  const app2 = await open({ now: at('2026-10-20T18:00:00Z'), extra: { 'intake/estimates.jsonl': WORKED() } });
  try {
    assert.deepEqual(SIX.map((id) => finishOf(app2, id)), ['once you accept it', 'once you accept it', '23 Oct – 25 Oct', '27 Oct – 1 Nov', '29 Oct – 5 Nov', '31 Oct – 8 Nov']);
    assert.equal(card(app2), '31 Oct – 8 Nov');
  } finally {
    app2.restore();
  }
});

test('AC24: under way — MD3 estimated 3–5 on 18 Oct reads 21 Oct – 23 Oct on 20 Oct, "23 Oct" on 23 Oct, and past its estimate on 24 Oct', async () => {
  const extra = { 'docs/PROJECT.md': withSprint('MD3', 'PR #902'), 'intake/estimates.jsonl': WORKED() };
  const day = async (d) => {
    const app = await open({ now: at(`2026-10-${d}T18:00:00Z`), extra });
    try {
      return { f: SIX.map((id) => finishOf(app, id)), card: card(app), md3: inRow(app, 'MD3', 'sb-wa-est') };
    } finally {
      app.restore();
    }
  };
  const d20 = await day(20);
  assert.equal(d20.f[2], '21 Oct – 23 Oct', 'the finish an estimate gives stays fixed while it holds');
  const d23 = await day(23);
  assert.equal(d23.f[2], '23 Oct', 'the last day of its range: today\'s date, not "once you accept it"');
  const d24 = await day(24);
  assert.deepEqual(d24.f, ['once you accept it', 'once you accept it', ...Array(4).fill('not available: MD3 is past its estimate')]);
  assert.equal(d24.card, 'not available: MD3 is past its estimate');
  assert.equal(d24.md3, 'Estimate past its estimate of 3–5 days, made 18 Oct; waiting on a new one');
});

test('AC24: a 0-to-0 estimate 30 days old still reads "once you accept it", never stale; a stale one (8 days) shows "may be out of date" and still counts; equal low and high', async () => {
  const est = [estLine('MD1', 0, 0, '2026-09-18T17:00:00Z'), estLine('MD2', 0, 0), estLine('MD3', 3, 5, '2026-10-10T17:00:00Z'), estLine('M3A', 4, 7),
    estLine('M3B', 3, 3), estLine('M3C', 2, 3)].join('\n');
  const app = await open({ extra: { 'intake/estimates.jsonl': est } });
  try {
    assert.equal(finishOf(app, 'MD1'), 'once you accept it');
    assert.doesNotMatch(inRow(app, 'MD1', 'sb-wa-est'), /may be out of date/);
    assert.equal(inRow(app, 'MD3', 'sb-wa-est'), 'Estimate about 3–5 days of work · your Chief of Staff, 10 Oct · may be out of date');
    assert.equal(finishOf(app, 'MD3'), '21 Oct – 23 Oct', 'still counted, from today since it is not under way');
    assert.equal(inRow(app, 'M3B', 'sb-wa-est'), 'Estimate about 3 days of work · your Chief of Staff, 18 Oct');
  } finally {
    app.restore();
  }
});

test('AC24: the time-zone boundary — estimates timed 03:00Z on 18 Oct (17 Oct in Chicago): at 03:30Z today is 17 Oct; at 05:30Z it is 18 Oct and every finish a day later, turned on the 15-second tick', async () => {
  const app = await open({ now: at('2026-10-18T03:28:58Z'), extra: { 'intake/estimates.jsonl': WORKED('2026-10-18T03:00:00Z') } });
  try {
    assert.equal(inRow(app, 'MD3', 'sb-wa-est'), 'Estimate about 3–5 days of work · your Chief of Staff, 17 Oct');
    assert.deepEqual(SIX.map((id) => finishOf(app, id)), ['once you accept it', 'once you accept it', '20 Oct – 22 Oct', '24 Oct – 29 Oct', '26 Oct – 2 Nov', '28 Oct – 5 Nov']);
    await app.visibility('hidden');
    await app.advance(2 * 3600e3); // 05:30Z: Chicago's midnight has passed
    await app.visibility('visible');
    await app.tick();
    assert.deepEqual(SIX.map((id) => finishOf(app, id)), ['once you accept it', 'once you accept it', '21 Oct – 23 Oct', '25 Oct – 30 Oct', '27 Oct – 3 Nov', '29 Oct – 6 Nov']);
    assert.equal(card(app), '29 Oct – 6 Nov');
  } finally {
    app.restore();
  }
});

test('AC24: an under-way estimate dated after today (5 minutes after the page\'s clock, across Chicago\'s midnight) counts 0 days since; one 11 minutes after is skipped as malformed', async () => {
  // The page's clock: 04:57Z on 18 Oct, 23:57 on 17 Oct in Chicago. MD3 under way (a made-up sprint).
  const clock = at('2026-10-18T04:55:58Z') + 62_000; // after open()'s 62 seconds: 04:57:00Z
  const in5 = new Date(clock + 5 * 60e3).toISOString().replace('.000Z', 'Z'); // 05:02Z: 18 Oct in Chicago
  const in11 = new Date(clock + 11 * 60e3).toISOString().replace('.000Z', 'Z');
  const est = [estLine('MD1', 0, 0, in5), estLine('MD2', 0, 0, in5), estLine('MD3', 3, 5, in5), estLine('M3A', 4, 7, in11)].join('\n');
  const app = await open({ now: at('2026-10-18T04:55:58Z'), extra: { 'docs/PROJECT.md': withSprint('MD3', 'PR #902'), 'intake/estimates.jsonl': est } });
  try {
    assert.equal(app.now, clock);
    assert.equal(inRow(app, 'MD3', 'sb-wa-est'), 'Estimate about 3–5 days of work · your Chief of Staff, 18 Oct');
    assert.equal(finishOf(app, 'MD3'), '20 Oct – 22 Oct', 'from today, 17 Oct: 3–5 days, 0 counted since its date');
    assert.equal(inRow(app, 'M3A', 'sb-wa-est'), 'Estimate: not made yet');
    assert.equal(finishOf(app, 'M3A'), 'not available: M3A has no estimate yet');
    await app.go('#/p/Service-Desk/notes');
    assert.match(app.text(), /estimates line 4: its time is more than 10 minutes after the page's clock/);
  } finally {
    app.restore();
  }
});

test('AC24: no estimate for the third row — rows 1 and 2 keep theirs, rows 3 to 6 and the card read "not available: MD3 has no estimate yet"', async () => {
  const est = WORKED().split('\n').filter((l) => !l.includes('"MD3"')).join('\n');
  const app = await open({ extra: { 'intake/estimates.jsonl': est } });
  try {
    assert.equal(inRow(app, 'MD3', 'sb-wa-est'), 'Estimate: not made yet');
    assert.deepEqual(SIX.map((id) => finishOf(app, id)), ['once you accept it', 'once you accept it', ...Array(4).fill('not available: MD3 has no estimate yet')]);
    assert.equal(card(app), 'not available: MD3 has no estimate yet');
  } finally {
    app.restore();
  }
});

test('AC24: a range across the year\'s end shows the year', async () => {
  const t = '2026-12-29T17:00:00Z';
  const app = await open({ now: at('2026-12-29T18:00:00Z'), extra: { 'intake/estimates.jsonl': WORKED(t) } });
  try {
    assert.equal(finishOf(app, 'MD3'), '1 Jan 2027 – 3 Jan 2027');
    assert.equal(finishOf(app, 'M3A'), '5 Jan 2027 – 10 Jan 2027');
    assert.equal(inRow(app, 'MD3', 'sb-wa-est'), 'Estimate about 3–5 days of work · your Chief of Staff, 29 Dec');
  } finally {
    app.restore();
  }
});

test('AC24: J14\'s read failing — "Estimate: not available" on every row and no rough finish', async () => {
  const text = WORKED();
  const app = await loadSandbox({ ...waSetup({ extra: { 'intake/estimates.jsonl': text } }), hash: '#/work', now: NOW, store: memStore() });
  const orig = app.server.call;
  app.server.call = async (p, b) => {
    const r = await orig(p, b);
    if (p === '/api/blobs' && r.json && r.json.blobs && gitSha(text) in r.json.blobs) r.json.blobs[gitSha(text)] = null;
    return r;
  };
  try {
    await app.advance(1000);
    await app.advance(61_000);
    assert.ok(SIX.every((id) => inRow(app, id, 'sb-wa-est') === 'Estimate: not available'));
    assert.ok(SIX.every((id) => finishOf(app, id) === null), 'no rough finish');
    assert.equal(card(app), 'not available');
    assert.doesNotMatch(app.text(), /Can't read/);
  } finally {
    app.restore();
  }
});

test('AC24: an estimate\'s note longer than two lines is clipped to two, with the rest one tap away', async () => {
  const long = 'the trial view\'s last screens, then your acceptance, with the Home control shown to you first and the phone widths checked at both sizes before the preview';
  const est = WORKED().replace('the trial view\'s last screens, then your acceptance', long);
  const app = await open({ extra: { 'intake/estimates.jsonl': est } });
  try {
    const id = `wa-note:${key('MD3')}`;
    assert.equal(byClass(rowOf(app, 'MD3'), 'sb-wa-note')[0].textContent, long);
    const clip = findKeyed(app, `lineclip:${id}`);
    assert.ok(cls(clip, 'two'), 'a two-line box');
    // The browser's measure (the fake DOM lays out no text): two lines shown of five.
    clip.clientHeight = 2 * 17;
    clip.scrollHeight = 5 * 17;
    app.module.refresh();
    await app.flush();
    const b = findKeyed(app, `line:${id}`);
    assert.ok(b && b.tag === 'button', 'the clipped note is a control');
    assert.equal(b.attrs['aria-label'], "Show the whole of MD3's estimate note");
    await app.tap(b);
    const bub = findKeyed(app, `linebubble:${id}`);
    assert.ok(bub, 'the whole note, one tap away');
    assert.match(bub.textContent, new RegExp(long.replace(/[()]/g, '.')));
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Moving rows, the draft and recording the plan

test('AC24: moving rows by tap, Enter and Space — the ends disabled, focus kept on the control, the gold edge and "moved", every finish recomputed, "Changed · not recorded"', async () => {
  const store = memStore();
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED() }, store });
  try {
    assert.equal(byClass(app.view, 'sb-wa-bar')[0].children[0].textContent, 'No changes yet');
    const up1 = btn(app, `wa-up:${key('MD1')}`);
    const down6 = btn(app, `wa-down:${key('M3C')}`);
    assert.equal(up1.attrs['aria-disabled'], 'true');
    assert.equal(down6.attrs['aria-disabled'], 'true');
    assert.equal(up1.attrs['aria-label'], 'Move MD1 up');
    assert.equal(up1.tag, 'button');
    await app.tap(up1);
    assert.deepEqual(codesOf(app), SIX, 'a disabled end does nothing');
    // A tap: M3A up, above MD3.
    await app.tap(btn(app, `wa-up:${key('M3A')}`));
    assert.deepEqual(codesOf(app), ['MD1', 'MD2', 'M3A', 'MD3', 'M3B', 'M3C']);
    assert.equal(document.activeElement && document.activeElement.dataset.k, `wa-up:${key('M3A')}`, 'focus stays on the control used');
    assert.ok(cls(rowOf(app, 'M3A'), 'moved'));
    assert.deepEqual(textRuns(byClass(rowOf(app, 'M3A'), 'sb-wa-ord')[0], () => false), ['3', '3rd of 6, moved']);
    assert.deepEqual(SIX.map((id) => finishOf(app, id)), ['once you accept it', 'once you accept it', '25 Oct – 30 Oct', '22 Oct – 25 Oct', '27 Oct – 3 Nov', '29 Oct – 6 Nov']);
    assert.equal(byClass(app.view, 'sb-wa-bar')[0].children[0].textContent, 'Changed · not recorded');
    assert.equal(byClass(app.view, 'sb-wa-state')[0].textContent, 'Draft not recorded · your changes are on this phone only');
    // Enter: M3C down is disabled; M3B up, above MD3.
    await press(app, btn(app, `wa-up:${key('M3B')}`), 'Enter');
    assert.deepEqual(codesOf(app), ['MD1', 'MD2', 'M3A', 'M3B', 'MD3', 'M3C']);
    assert.ok(!cls(rowOf(app, 'M3A'), 'moved'), 'the earlier edge gone at the next move');
    assert.ok(cls(rowOf(app, 'M3B'), 'moved'));
    // Space: MD1 down.
    await press(app, btn(app, `wa-down:${key('MD1')}`), ' ');
    assert.deepEqual(codesOf(app), ['MD2', 'MD1', 'M3A', 'M3B', 'MD3', 'M3C']);
    assert.equal(document.activeElement.dataset.k, `wa-down:${key('MD1')}`);
    assert.equal(card(app), '29 Oct – 6 Nov', 'the same total, added up in the new order');
    // To the top: the up control is disabled there, and keeps the focus.
    await app.tap(btn(app, `wa-up:${key('MD1')}`));
    assert.equal(btn(app, `wa-up:${key('MD1')}`).attrs['aria-disabled'], 'true');
    assert.equal(document.activeElement.dataset.k, `wa-up:${key('MD1')}`);
    assert.deepEqual(JSON.parse(store.m.get(DRAFT_KEY)), { base: null, order: ['MD1', 'MD2', 'M3A', 'M3B', 'MD3', 'M3C'].map(key) });
  } finally {
    app.restore();
  }
});

test('AC24: the draft is kept on the device through a refresh, and set aside when a newer plan lands', async () => {
  const store = memStore();
  const app = await open({ store });
  try {
    await app.tap(btn(app, `wa-up:${key('M3B')}`));
  } finally {
    app.restore();
  }
  const again = await open({ store });
  try {
    assert.deepEqual(codesOf(again), ['MD1', 'MD2', 'MD3', 'M3B', 'M3A', 'M3C'], 'as the owner left it');
    assert.match(again.text(), /Changed · not recorded/);
    // A plan lands (recorded from elsewhere): the draft started from no plan, so it is set aside.
    const name = '2026-10-18T1805Z-01';
    const r = waSetupRepo(again);
    r.commit({ [`docs/planning/${name}.md`]: planText(name, ['M3C', 'MD1', 'MD2', 'MD3', 'M3A', 'M3B']) });
    await again.advance(61_000);
    assert.deepEqual(codesOf(again), ['M3C', 'MD1', 'MD2', 'MD3', 'M3A', 'M3B']);
    assert.match(again.text(), /A newer plan was recorded; your draft was set aside/);
    assert.equal(store.m.has(DRAFT_KEY), false);
    assert.match(byClass(again.view, 'sb-wa-state')[0].textContent, /^Current plan recorded 18 Oct, 13:05$/);
  } finally {
    again.restore();
  }
});
/** The fake desk's Service-Desk repository behind an open sandbox. */
const waSetupRepo = (app) => app.repos['Service-Desk'];

test('AC24: with local storage throwing, "draft not kept on this device", the rows still move, and nothing else breaks', async () => {
  const store = memStore();
  store.throws = true;
  const app = await open({ store, extra: { 'intake/estimates.jsonl': WORKED() } });
  try {
    assert.match(app.text(), /draft not kept on this device/);
    await app.tap(btn(app, `wa-down:${key('MD3')}`));
    assert.deepEqual(codesOf(app), ['MD1', 'MD2', 'M3A', 'MD3', 'M3B', 'M3C']);
    assert.equal(card(app), '29 Oct – 6 Nov');
    assert.match(app.text(), /Changed · not recorded/);
    await app.go('#/');
    assert.doesNotMatch(app.text(), /Can't show/);
  } finally {
    app.restore();
  }
});

test('AC24: "Record plan" — the link\'s path and its body exactly in J4\'s form, every row in the order shown, no date and no estimate; then the state once the file is in the tree', async () => {
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED() } });
  try {
    await app.tap(btn(app, `wa-up:${key('M3A')}`));
    const a = findKeyed(app, 'wa-record');
    assert.equal(a.tag, 'a');
    assert.equal(a.textContent, 'Record plan');
    const u = new URL(a.attrs.href);
    assert.equal(u.pathname, '/shumpmaster/Service-Desk/new/main');
    const name = '2026-10-18T1801Z-01'; // the minute of the page's clock (18:01:02Z), in UTC
    assert.equal(u.searchParams.get('filename'), `docs/planning/${name}.md`);
    const order = ['MD1', 'MD2', 'M3A', 'MD3', 'M3B', 'M3C'];
    const body = planBody(name, null, order.map((m) => ({ project: 'Service-Desk', milestone: m })));
    assert.equal(u.searchParams.get('value'), body);
    assert.doesNotMatch(body, /Oct|Nov|days|about/);
    assert.equal(a.attrs.target, '_blank');
    // Committed: the desk shows it as the current plan.
    waSetupRepo(app).commit({ [`docs/planning/${name}.md`]: body });
    await app.advance(61_000);
    assert.deepEqual(codesOf(app), order);
    assert.equal(byClass(app.view, 'sb-wa-state')[0].textContent, 'Current plan recorded 18 Oct, 13:01');
    assert.match(app.text(), /No changes yet/);
    assert.doesNotMatch(app.text(), /No plan recorded yet/);
    // The next one supersedes it, with the next free name.
    await app.tap(btn(app, `wa-down:${key('MD1')}`));
    const u2 = new URL(findKeyed(app, 'wa-record').attrs.href);
    assert.match(u2.searchParams.get('filename'), /^docs\/planning\/2026-10-18T1802Z-01\.md$/);
    assert.match(u2.searchParams.get('value'), new RegExp(`^Plan: 2026-10-18T1802Z-01\\nSupersedes: ${name}\\n`));
  } finally {
    app.restore();
  }
});

test('AC24: a current plan\'s order; a milestone the plan does not list after the listed ones, marked; a plan listing a reached milestone; a plan J4 can\'t read', async () => {
  const name = '2026-10-18T1130Z-01';
  const app = await open({ extra: { [`docs/planning/${name}.md`]: planText(name, ['M3C', 'M1', 'MD3', 'M3A']) } });
  try {
    assert.deepEqual(codesOf(app), ['M3C', 'MD3', 'M3A', 'MD1', 'MD2', 'M3B']);
    assert.deepEqual(rows(app).filter((r) => byClass(r, 'sb-wa-tag').some((t) => t.textContent === 'not in your recorded plan')).map((r) => byClass(r, 'code')[0].textContent),
      ['MD1', 'MD2', 'M3B']);
    assert.equal(byClass(app.view, 'sb-wa-state')[0].textContent, 'Current plan recorded 18 Oct, 06:30');
  } finally {
    app.restore();
  }
  const bad = await open({ extra: { [`docs/planning/${name}.md`]: '| Order | Project | Item | Not before (UTC) |\n|---|---|---|---|\n' } });
  try {
    assert.deepEqual(codesOf(bad), SIX);
    assert.match(bad.text(), /Your latest plan can't be read: 2026-10-18T1130Z-01; shown in the project document's order/);
  } finally {
    bad.restore();
  }
});

test('AC24: a made-up ` · dropped` line — "Dropped · 1" after the reached fold, folded, opening on a tap; not in the order', async () => {
  const doc = DOC.replace('· phase: Launch\n', '· phase: Launch\n- An idea let go (M3D) · done when it is let go · phase: Build · dropped\n');
  const app = await open({ extra: { 'docs/PROJECT.md': doc } });
  try {
    assert.deepEqual(codesOf(app), SIX);
    const groups = byClass(app.view, 'sb-wa-group').map((g) => g.dataset.k);
    assert.ok(groups.indexOf('wa-g:dropped') === groups.indexOf('wa-g:reached') + 1, groups.join(' '));
    const f = findKeyed(app, 'fold:dropped');
    assert.equal(f.textContent, 'Dropped · 1▸');
    assert.doesNotMatch(app.text(), /An idea let go/);
    await app.tap(f);
    assert.match(app.text(), /An idea let go/);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Not milestones yet, the v2.5 project, and the Queue

test('AC24: "Not milestones yet" — each of J15\'s states and its words, the ask link\'s path and body, ` · added as:` leaving the group, ` · not added` folded', async () => {
  const list = `${LATER}- Answered one (W3) · a note · from: a.md
- Filed one (W4) · a note · from: a.md
- Asked one (W5) · a note · from: a.md
- Added one (W6) · a note · from: a.md · added as: M3C
- Turned down (W7) · a note · from: a.md · not added
`;
  const extra = {
    'intake/later-work.md': list,
    'decisions/questions/P-001-later-work-w3.md': 'Ruling: A — add it as a milestone, after M3B\n',
    'questions/P-001-later-work-w4.md': fixture('notify/ac77-real/questions/P-001-next-work.md').replace('Which piece of later work comes next?', 'Add the filed one as a milestone?'),
    'intake/milestone-asks/W5-2026-10-18T1500Z.md': 'Ask: add W5 as a milestone\nLater work: Asked one (W5)\nFrom: the owner, through the desk\'s Work ahead\n',
  };
  const app = await open({ extra });
  try {
    const later = byClass(app.view, 'sb-wa-later')[0];
    const items = later.children.map((li) => textRuns(li, () => false).join(' | '));
    assert.deepEqual(items, [
      'Ask or jot box | one box on the desk to ask, instruct or note an idea | Tap to ask for it as a milestone',
      "Upkeep fixes | read-access warning, M3B's criteria, more than five projects | Tap to ask for it as a milestone",
      'Answered one | a note | Answered 6 Oct: | Ruling: A — add it as a milestone, after M3B', // the fake's history: 2026-10-06
      'Filed one | a note | Question filed · in your Queue',
      'Asked one | a note | Asked 18 Oct · your Chief of Staff files the question',
    ]);
    assert.doesNotMatch(later.textContent, /Added one|Turned down/);
    assert.equal(findKeyed(app, 'wa-q:W4').attrs.href, '#/waiting/Service-Desk', 'AC80: the link opens the board, that project shown');
    const ask = new URL(findKeyed(app, 'wa-ask:W2').attrs.href);
    assert.equal(ask.searchParams.get('filename'), 'intake/milestone-asks/W2-2026-10-18T1801Z.md');
    assert.equal(ask.searchParams.get('value'), 'Ask: add W2 as a milestone\nLater work: Upkeep fixes (W2)\nFrom: the owner, through the desk\'s Work ahead\n');
    const f = findKeyed(app, 'fold:wa-notadded');
    assert.equal(f.textContent, 'Not added · 1▸');
    await app.tap(f);
    assert.match(app.text(), /Turned down/);
    assert.ok(app.text().includes(WA.notYetLine));
  } finally {
    app.restore();
  }
  const none = await open();
  try {
    assert.match(none.text(), /Not milestones yet.*No later work recorded yet/s);
  } finally {
    none.restore();
  }
});

test('AC24: Personal-Org-Operating-Model — "Open sprint: m1.4 — v3 build: specs, tools, template and agent files" linked; "No open sprint" with none; "sprint unclear" with two; never in a plan', async () => {
  const groupText = (app) => textRuns(findKeyed(app, 'wa-old:Personal-Org-Operating-Model'), () => false);
  const app = await open();
  try {
    assert.deepEqual(groupText(app), ['Personal-Org-Operating-Model', 'Open sprint: m1.4 — v3 build: specs, tools, template and agent files',
      'It runs on the older pipeline, so it has no milestones to order here']);
    const a = findAll(findKeyed(app, 'wa-old:Personal-Org-Operating-Model'), (e) => e.tag === 'a')[0];
    assert.equal(a.attrs.href, 'https://github.com/shumpmaster/Personal-Org-Operating-Model/blob/main/docs/sprints/m1.4-v3-build.md');
    assert.doesNotMatch(new URL(findKeyed(app, 'wa-record').attrs.href).searchParams.get('value'), /Personal-Org-Operating-Model/);
  } finally {
    app.restore();
  }
  const none = await open({ poom: poomFiles({}) });
  try {
    assert.equal(groupText(none)[1], 'No open sprint');
  } finally {
    none.restore();
  }
  const sprint = fixture('poom/docs/sprints/m1.4-v3-build.md');
  const two = await open({ poom: poomFiles({ 'docs/sprints/m1.4-v3-build.md': sprint, 'docs/sprints/m1.5-made-up.md': sprint }) });
  try {
    assert.equal(groupText(two)[1], 'sprint unclear');
  } finally {
    two.restore();
  }
});

test('AC24: an open question whose `Milestone:` line names MD3 — "1 waiting on you in your Queue" on MD3\'s row and no other, linked to the board (AC80)', async () => {
  const q = fixture('notify/ac77-real/questions/P-001-next-work.md').replace('Milestone: M3A', 'Milestone: MD3').replace('Which piece of later work comes next?', 'A made-up question for MD3');
  const app = await open({ extra: { 'questions/P-001-made-up-md3.md': q } });
  try {
    const you = rows(app).map((r) => (byClass(r, 'sb-wa-you')[0] || { textContent: null }).textContent);
    assert.deepEqual(you, [null, null, '1 waiting on you in your Queue', null, null, null]);
    assert.equal(findKeyed(app, `wa-q:${key('MD3')}`).attrs.href, '#/waiting/Service-Desk', 'AC80: the link opens the board, that project shown');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Never a deadline; still and plain; no planning entry

const BANNED = /\b(deadline|due|late|overdue|target)\b/i;
/** The desk's own words on the screen: its text, less every record text it shows (names, "done when" lines, notes, sprint titles, later work). */
function ownWords(app) {
  const record = [];
  for (const r of rows(app)) {
    record.push(byClass(r, 'sb-wa-name')[0].textContent);
    const d = byClass(r, 'sb-wa-done')[0];
    if (d) record.push(d.textContent.replace(/^Done when /, ''));
    const n = byClass(r, 'sb-wa-note')[0];
    if (n) record.push(n.textContent);
  }
  for (const t of byClass(app.view, 'sb-wa-t')) record.push(t.textContent);
  let text = textRuns(app.view, () => false).join('\n');
  for (const r of record.sort((a, b) => b.length - a.length)) text = text.split(r).join('');
  text = text.replace(/Open sprint: .*/g, 'Open sprint:');
  return text;
}

test('AC24: never a deadline — none of the desk\'s own fixed words says "deadline" (but in "never a deadline"), "due", "late", "overdue" or "target"; record text shows as written', async () => {
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED(), 'intake/later-work.md': LATER } });
  try {
    const own = ownWords(app).replace('never a deadline', '');
    assert.doesNotMatch(own, BANNED);
    assert.match(app.text(), /The desk's value targets shown/, 'M3B\'s name as written');
    assert.match(app.text(), /Done when the desk shows each value target \(V1 to V5\) from the project document against its measure/);
    // Every fixed word the screen can show, whatever the records.
    const fixed = Object.values(WA).map((v) => (typeof v === 'function' ? v(2, 3) : v)).join('\n').replace('never a deadline', '');
    assert.doesNotMatch(fixed, BANNED);
  } finally {
    app.restore();
  }
});

test('AC24: still and plain — two renders a day apart with no new data, every estimate under 7 days old and none run past: only dates change', async () => {
  const texts = [];
  for (const d of ['2026-10-18T18:00:00Z', '2026-10-19T18:00:00Z']) {
    const app = await open({ now: at(d), extra: { 'intake/estimates.jsonl': WORKED(), 'intake/later-work.md': LATER } });
    try {
      texts.push(textRuns(app.view, () => false).map((t) => t.replace(/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, '<date>')
        .replace(/T\d{4}Z/g, 'T<time>Z')));
      assert.doesNotMatch(app.text(), /may be out of date|past its estimate/);
    } finally {
      app.restore();
    }
  }
  assert.deepEqual(texts[1], texts[0]);
});

test('AC24: a J7 with no `planning: true` entry — section 3\'s order, "Record plan" disabled with its reason, every estimate "not available"', async () => {
  const app = await open({ sd: { ...SD, planning: false }, extra: { 'intake/estimates.jsonl': WORKED() } });
  try {
    assert.deepEqual(codesOf(app), SIX);
    const rec = findKeyed(app, 'wa-record');
    assert.equal(rec.tag, 'button');
    assert.ok('disabled' in rec.attrs);
    assert.match(app.text(), /Can't record plans: no project is set for planning/);
    assert.ok(SIX.every((id) => inRow(app, id, 'sb-wa-est') === 'Estimate: not available'));
    assert.equal(card(app), 'not available');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Build review round 1 (B to F, H), at the page

/** Open with one blob's read failing on every try (its text), as a failed optional read. */
async function openFailing(text, opts = {}) {
  const setup = waSetup({ extra: opts.extra || {} });
  const app = await loadSandbox({ ...setup, hash: '#/work', now: NOW, store: memStore() });
  app.repos = setup.repos;
  const orig = app.server.call;
  app.server.call = async (p, b) => {
    const r = await orig(p, b);
    if (p === '/api/blobs' && r.json && r.json.blobs && gitSha(text) in r.json.blobs) r.json.blobs[gitSha(text)] = null;
    return r;
  };
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}

test('AC24 (build review round 1, B): while the milestones or the current plan are unread, "Record plan" is inactive with "Record plan is off until your milestones are read", and no link is built', async () => {
  const name = '2026-10-18T1130Z-01';
  const plan = planText(name, ['M3A', 'MD3']);
  for (const [why, text] of [['the plan', plan], ['the milestone list', DOC]]) {
    const app = await openFailing(text, { extra: { [`docs/planning/${name}.md`]: plan } });
    try {
      const rec = findKeyed(app, 'wa-record');
      assert.equal(rec.tag, 'button', why);
      assert.ok('disabled' in rec.attrs, why);
      assert.match(app.text(), /Record plan is off until your milestones are read/, why);
      assert.equal(findAll(app.view, (e) => e.tag === 'a' && /\/new\/main\?filename=docs%2Fplanning/.test(e.attrs.href || '')).length, 0, `${why}: no plan link`);
    } finally {
      app.restore();
    }
  }
});

test('AC24 (build review round 1, C): the owner records their own draft — once it lands the draft clears silently, with no set-aside notice; a plan in another order still gives the notice', async () => {
  const store = memStore();
  const app = await open({ store });
  try {
    await app.tap(btn(app, `wa-up:${key('M3A')}`));
    const u = new URL(findKeyed(app, 'wa-record').attrs.href);
    waSetupRepo(app).commit({ [u.searchParams.get('filename')]: u.searchParams.get('value') });
    await app.advance(61_000);
    assert.deepEqual(codesOf(app), ['MD1', 'MD2', 'M3A', 'MD3', 'M3B', 'M3C']);
    assert.doesNotMatch(app.text(), /A newer plan was recorded; your draft was set aside/);
    assert.match(byClass(app.view, 'sb-wa-state')[0].textContent, /^Current plan recorded 18 Oct, 13:01$/);
    assert.equal(store.m.has(DRAFT_KEY), false, 'the draft cleared');
    assert.match(app.text(), /No changes yet/);
    // A draft in another order when a plan lands: the notice.
    await app.tap(btn(app, `wa-down:${key('MD1')}`));
    const other = '2026-10-18T1803Z-01';
    waSetupRepo(app).commit({ [`docs/planning/${other}.md`]: planText(other, ['M3C', 'MD1', 'MD2', 'MD3', 'M3A', 'M3B'], '2026-10-18T1801Z-01') });
    await app.advance(61_000);
    assert.match(app.text(), /A newer plan was recorded; your draft was set aside/);
  } finally {
    app.restore();
  }
});

test('AC24 (build review round 1, D; draft 6): with no move made — no plan recorded, a plan that can\'t be read, or one not read yet — the state line reads "No changes yet"; "your changes are on this phone only" only once a row has moved', async () => {
  const noPlan = await open();
  try {
    assert.equal(byClass(noPlan.view, 'sb-wa-state')[0].textContent, 'No changes yet');
    assert.equal(findKeyed(noPlan, 'wa-order').textContent, 'No plan recorded yet', 'still heading the order');
    await noPlan.tap(btn(noPlan, `wa-down:${key('MD1')}`));
    assert.equal(byClass(noPlan.view, 'sb-wa-state')[0].textContent, 'Draft not recorded · your changes are on this phone only');
  } finally {
    noPlan.restore();
  }
  const name = '2026-10-18T1130Z-01';
  const cant = await open({ extra: { [`docs/planning/${name}.md`]: '| Order | Project | Item | Not before (UTC) |\n|---|---|---|---|\n' } });
  try {
    assert.equal(byClass(cant.view, 'sb-wa-state')[0].textContent, 'No changes yet');
    assert.doesNotMatch(cant.text(), /your changes are on this phone only/);
    await cant.tap(btn(cant, `wa-up:${key('M3A')}`));
    assert.equal(byClass(cant.view, 'sb-wa-state')[0].textContent, 'Draft not recorded · your changes are on this phone only');
  } finally {
    cant.restore();
  }
  const plan = planText(name, ['M3A', 'MD3']);
  const unread = await openFailing(plan, { extra: { [`docs/planning/${name}.md`]: plan } });
  try {
    assert.equal(byClass(unread.view, 'sb-wa-state')[0].textContent, 'No changes yet');
  } finally {
    unread.restore();
  }
});

test('AC24 (build review round 1, E and F): J15\'s ask and "Record plan" show AC17\'s fallback when the link copies — words naming the cause, the text, and a copy button', async () => {
  const fallback = (app, k) => findKeyed(app, `wa-copy:${k}`);
  // Too long for a link (a cap below the ask's and the plan's length).
  const long = await open({ extra: { 'intake/later-work.md': LATER }, linkCap: 150 });
  try {
    for (const [k, what] of [['wa-ask:W1', 'the ask'], ['wa-record', 'the plan']]) {
      const f = fallback(long, k);
      assert.ok(f, k);
      assert.equal(byClass(f, 'sb-muted')[0].textContent, `Too long for a link: GitHub opens with the file name only; copy ${what} below, then paste it there`);
      assert.equal(findKeyed(long, `copy:${k}`).tag, 'button');
    }
    assert.equal(byClass(fallback(long, 'wa-ask:W1'), 'sb-value')[0].textContent, 'Ask: add W1 as a milestone\nLater work: Ask or jot box (W1)\nFrom: the owner, through the desk\'s Work ahead\n');
    const ask = new URL(findKeyed(long, 'wa-ask:W1').attrs.href);
    assert.equal(ask.searchParams.get('value'), null, 'the page opens with the file name only');
    assert.equal(ask.searchParams.get('filename'), 'intake/milestone-asks/W1-2026-10-18T1801Z.md');
  } finally {
    long.restore();
  }
  // The repository takes no prefilled content: AC17's other cause, in its own words.
  const noPrefill = await open({ extra: { 'intake/later-work.md': LATER }, sd: { ...SD, contentPrefill: false } });
  try {
    for (const [k, what] of [['wa-ask:W2', 'the ask'], ['wa-record', 'the plan']]) {
      assert.equal(byClass(fallback(noPrefill, k), 'sb-muted')[0].textContent,
        `This repository doesn't take prefilled content: GitHub opens with the file name only; copy ${what} below, then paste it there`);
    }
    assert.doesNotMatch(noPrefill.text(), /Too long for a link/);
  } finally {
    noPrefill.restore();
  }
  // Within the cap, with prefilled content: no fallback.
  const plain = await open({ extra: { 'intake/later-work.md': LATER } });
  try {
    assert.equal(fallback(plain, 'wa-ask:W1'), null);
    assert.equal(fallback(plain, 'wa-record'), null);
  } finally {
    plain.restore();
  }
});

// From stage 2 (AC82): the control this case drew is gone with today's Home; its counterpart is the Plan
// tab's word, one text, with its icon drawn as SVG beside it (AC81).
test('AC24 (build review round 1, H; from stage 2, AC82): the way in is the Plan tab, its word one text beside its icon', async () => {
  const app = await open({ hash: '#/' });
  try {
    const tab = findKeyed(app, 'tab:plan');
    const words = byClass(tab, 'v2-tabw');
    assert.equal(words.length, 1);
    assert.equal(words[0].children.length, 1);
    assert.equal(words[0].textContent, 'Plan');
    assert.equal(tab.children[0].tag, 'svg', 'its icon an SVG');
  } finally {
    app.restore();
  }
});
