// ac-test: S-001/AC86 — Plan (desk mockup v2, stage 5; specs/S-001.md:7030-7068): AC24's Work ahead in
// the Plan tab, drawn as frame 11, top down, next first (P-001-plan-order.md, A). AC24's own cases run on
// the Plan tab in tests/desk/ac24-work-ahead.test.mjs, each kept, none dropped (:7065-7066); this file
// checks what AC86 adds: the tab's title line, "⇅" opening AC24's ordering, the groups, each row's icon,
// words and right-hand value, "Not milestones yet", the ideas section's words while the portfolio isn't
// read (AC87), each milestone's sheet, and that Home has no "Work ahead ›" control.
//
// Service-Desk's records are the real ones at 77bfeae (tests/desk/fixtures/j11-77bfeae/); every estimate,
// plan, later-work line, question, gate card and the second project "Example" added here is made up (NOT
// a real record), as in tests/desk/wa-fixtures.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSandbox, findAll, byClass } from './sandbox-helpers.mjs';
import { findKeyed } from './sandbox-fixtures.mjs';
import { textRuns } from './screen-text.mjs';
import { fixture } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { SD, POOM, waSetup, WORKED, LATER, estLine, planText, memStore, j77Files, viewOf } from './wa-fixtures.mjs';
import { WA, shortRange } from '../../src/lib/workahead.js';

const at = (s) => Date.parse(s);
const NOW = at('2026-10-18T18:00:00Z'); // 18 Oct, 13:00 in Chicago
const SIX = ['MD1', 'MD2', 'MD3', 'M3A', 'M3B', 'M3C'];
const DOC = j77Files()['docs/PROJECT.md'];
const withSprint = (id, sprint) => DOC.replace(new RegExp(`(\\(${id}\\) · done when [^\\n]*? · phase: [A-Za-z]+)\\n`), `$1 · sprints: ${sprint}\n`);

async function open({ now = NOW, extra = {}, store = memStore(), hash = '#/work', projects = null, more = null } = {}) {
  const setup = waSetup({ extra, projects });
  if (more) Object.assign(setup.repos, more);
  const app = await loadSandbox({ ...setup, hash, now, store });
  app.repos = setup.repos;
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}
const cls = (e, c) => ` ${e.className || ''} `.includes(` ${c} `);
const rows = (app) => findAll(app.view, (e) => cls(e, 'v2-plli') && e.attrs && e.attrs['data-row'] != null);
const iconOf = (r) => findAll(byClass(r, 'v2-plrow')[0], (e) => e.tag === 'svg')[0].attrs.class.split(' ')[1];
const parts = (r) => ({ icon: iconOf(r), name: byClass(r, 'v2-plname')[0].textContent, mono: byClass(r, 'v2-plm')[0].textContent, right: byClass(r, 'v2-plv')[0].textContent });
const key = (id, p = 'Service-Desk') => `${p}|${id}`;

// ---------------------------------------------------------------------------
// The tab's title line, and Home

test('AC86: the Plan tab\'s title line — "Plan", "⇅" named "Change the order" (an icon, not pressed), and "Rough finish from today, <date> · an expectation, never a deadline", its date today\'s in Chicago; on mockup v2\'s ground', async () => {
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED() } });
  try {
    assert.deepEqual(textRuns(findKeyed(app, 'plan-top'), () => false), ['Plan']);
    assert.equal(findKeyed(app, 'plan-top').children[0].tag, 'h1');
    const b = findKeyed(app, 'plan-order');
    assert.equal(b.tag, 'button');
    assert.equal(b.attrs['aria-label'], 'Change the order');
    assert.equal(b.attrs['aria-pressed'], 'false');
    assert.equal(b.textContent, '', 'its mark an icon (AC81: ⇅ is in no served file)');
    assert.match(findAll(b, (e) => e.tag === 'svg')[0].attrs.class, /\bvi-order\b/);
    assert.equal(findKeyed(app, 'plan-sub').textContent, 'Rough finish from today, 18 Oct · an expectation, never a deadline');
    assert.ok(document.documentElement.classList.contains('v2-page'), 'Plan is drawn on mockup v2\'s ground');
    assert.equal(findKeyed(app, 'tab:plan').attrs['aria-current'], 'page');
  } finally {
    app.restore();
  }
  // Chicago's date, not UTC's: at 03:30Z on 18 Oct it is still 17 Oct.
  const early = await open({ now: at('2026-10-18T03:28:58Z') });
  try {
    assert.equal(findKeyed(early, 'plan-sub').textContent, 'Rough finish from today, 17 Oct · an expectation, never a deadline');
  } finally {
    early.restore();
  }
});

test('AC86: Home has no "Work ahead ›" control (AC82, AC81 "Until stage 3"); the bar\'s Plan tab is the way in', async () => {
  const app = await open({ hash: '#/' });
  try {
    assert.equal(findKeyed(app, 'work-ahead'), null);
    assert.doesNotMatch(byClass(app.view, 'v2-home')[0].textContent, /Work ahead/);
    assert.equal(findAll(app.view, (e) => e.tag === 'a' && e.attrs.href === '#/work').length, 1, 'only the bar\'s Plan tab');
    assert.equal(findKeyed(app, 'tab:plan').attrs.href, '#/work');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The order control

test('AC86: "⇅" opens AC24\'s ordering — the state line, the card, one list in the owner\'s order with each row\'s place and its move up and down, the bar with "Record plan" — and closes it; kept through a refresh; Enter and Space work it', async () => {
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED() } });
  const moves = () => findAll(app.view, (e) => e.tag === 'button' && /^wa-(up|down):/.test(e.dataset.k || ''));
  try {
    assert.equal(moves().length, 0, 'Plan itself: no move controls');
    assert.equal(findKeyed(app, 'wa-card'), null);
    assert.equal(findKeyed(app, 'wa-bar'), null, 'no bar while nothing has changed');
    await app.tap(findKeyed(app, 'plan-order'));
    assert.equal(findKeyed(app, 'plan-order').attrs['aria-pressed'], 'true');
    assert.equal(moves().length, 12, 'move up and move down on each of six rows');
    assert.deepEqual(moves().slice(0, 2).map((b) => b.attrs['aria-label']), ['Move MD1 up', 'Move MD1 down']);
    assert.ok(moves().every((b) => b.textContent === '' && findAll(b, (e) => e.tag === 'svg').length === 1), 'their arrows icons (AC81: ▲ and ▼ are in no served file)');
    assert.deepEqual(textRuns(findKeyed(app, 'wa-card'), () => false), ['Rough finish, in this order', '29 Oct – 6 Nov', WA.cardNote]);
    assert.equal(byClass(app.view, 'v2-plstate')[0].textContent, 'No changes yet');
    assert.equal(findKeyed(app, 'wa-plan').attrs['aria-label'], 'Milestones in your order');
    assert.deepEqual(rows(app).map((r) => textRuns(byClass(r, 'v2-plord')[0], () => false)), SIX.map((_, i) => [String(i + 1), `${['1st', '2nd', '3rd', '4th', '5th', '6th'][i]} of 6`]));
    assert.deepEqual(textRuns(findKeyed(app, 'wa-bar'), () => false), ['No changes yet', 'Record plan']);
    assert.equal(findKeyed(app, 'wa-record').tag, 'a');
    // A refresh keeps it open (AC56).
    app.module.refresh();
    await app.flush();
    assert.equal(findKeyed(app, 'plan-order').attrs['aria-pressed'], 'true');
    assert.equal(moves().length, 12);
    // Closed again: Plan as frame 11 draws it.
    findKeyed(app, 'plan-order').dispatch('keydown', { key: 'Enter' });
    await app.flush();
    assert.equal(findKeyed(app, 'plan-order').attrs['aria-pressed'], 'false');
    assert.equal(moves().length, 0);
    assert.equal(findKeyed(app, 'wa-card'), null);
    findKeyed(app, 'plan-order').dispatch('keydown', { key: ' ' });
    await app.flush();
    assert.equal(moves().length, 12, 'Space opens it too');
  } finally {
    app.restore();
  }
});

test('AC86: a draft order shows on Plan with the ordering closed — the rows in the draft\'s order, "Draft not recorded · …" and the bar with "Record plan", so a draft is never out of sight', async () => {
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED() } });
  try {
    await app.tap(findKeyed(app, 'plan-order'));
    await app.tap(findKeyed(app, `wa-up:${key('M3A')}`));
    await app.tap(findKeyed(app, 'plan-order'));
    assert.equal(findKeyed(app, 'plan-order').attrs['aria-pressed'], 'false');
    assert.deepEqual(rows(app).map((r) => parts(r).mono.split(' · ')[0]), ['MD1', 'MD2', 'M3A', 'MD3', 'M3B', 'M3C']);
    assert.deepEqual(rows(app).map((r) => parts(r).right), ['your acceptance', 'your acceptance', '22–25 Oct', '25–30 Oct', '27 Oct – 3 Nov', '29 Oct – 6 Nov'], 'every finish follows the draft');
    assert.equal(byClass(app.view, 'v2-plstate')[0].textContent, 'Draft not recorded · your changes are on this phone only');
    assert.deepEqual(textRuns(findKeyed(app, 'wa-bar'), () => false), ['Changed · not recorded', 'Record plan']);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The groups and the rows

test('AC86: each row — its icon (AC57\'s states as the page draws them), its plain-English name, "<id> · <phase> · about <low>–<high> days" where J14 gives an estimate, and at its right its rough finish ("21–23 Oct"), or "your acceptance" for AC24\'s "once you accept it"; top down, next first', async () => {
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED() } });
  try {
    assert.deepEqual(rows(app).map(parts), [
      { icon: 'st-half', name: 'What a good desk looks like is known', mono: 'MD1 · Design', right: 'your acceptance' },
      { icon: 'st-half', name: 'The desk\'s look and screens chosen', mono: 'MD2 · Design', right: 'your acceptance' },
      { icon: 'st-next', name: 'The chosen design running on the real back end', mono: 'MD3 · Design · about 3–5 days', right: '21–23 Oct' },
      { icon: 'st-planned', name: 'Work ahead planned and scheduled from the desk', mono: 'M3A · Build · about 4–7 days', right: '25–30 Oct' },
      { icon: 'st-planned', name: 'The desk\'s value targets shown', mono: 'M3B · Build · about 2–4 days', right: '27 Oct – 3 Nov' },
      { icon: 'st-planned', name: 'The desk live at the needs-you address', mono: 'M3C · Launch · about 2–3 days', right: '29 Oct – 6 Nov' },
    ]);
    // Its state in words for the reader, beside the icon (the icon is hidden from assistive technology).
    assert.deepEqual(rows(app).map((r) => byClass(byClass(r, 'v2-plrow')[0], 'sb-vh').map((e) => e.textContent).join('')),
      ['1st of 6: Work filed: Q-013', '2nd of 6: Work filed: PR #72, #74, #75, #77', '3rd of 6: No work filed yet · next to reach', '4th of 6: No work filed yet', '5th of 6: No work filed yet', '6th of 6: No work filed yet']);
    assert.ok(rows(app).every((r) => byClass(r, 'v2-plunder').length === 0), 'nothing under a row with an estimate and a finish');
    // Each row opens its sheet.
    assert.deepEqual(rows(app).map((r) => byClass(r, 'v2-plrow')[0].attrs.href), SIX.map((id) => `#/work/ms/Service-Desk/${id}`));
  } finally {
    app.restore();
  }
});

test('AC86: where AC24 gives no value — no estimate, a stale one, one run past, J14 unread — the row says so in AC24\'s words and shows nothing made up at its right; a range across the year\'s end', async () => {
  // No estimate for MD3: its row and those after it say why; no value at their right.
  const noEst = await open({ extra: { 'intake/estimates.jsonl': WORKED().split('\n').filter((l) => !l.includes('"MD3"')).join('\n') } });
  try {
    const r = rows(noEst);
    assert.deepEqual(r.map((x) => parts(x).right), ['your acceptance', 'your acceptance', '', '', '', '']);
    assert.equal(parts(r[2]).mono, 'MD3 · Design', 'no days without an estimate');
    // Rewritten for AC90 (specs/S-001.md:8011-8022; AC86's note, :7678-7681): MD3's own "Estimate: not made yet" stays (no other
    // row shares it); the rough finish not available for the four rows from MD3 on is said once at the group's head.
    assert.deepEqual(byClass(r[2], 'v2-plgap').map((g) => g.textContent), ['Estimate: not made yet']);
    for (const x of r.slice(3)) assert.deepEqual(byClass(x, 'v2-plgap').map((g) => g.textContent), []);
    assert.deepEqual(byClass(findKeyed(noEst, 'wa-once:Service-Desk'), 'v2-plgap').map((g) => g.textContent), ['4 rough finishes not available: MD3 has no estimate yet']);
  } finally {
    noEst.restore();
  }
  // A stale estimate (8 days): "may be out of date" on the row, still counted.
  const est = [estLine('MD1', 0, 0), estLine('MD2', 0, 0), estLine('MD3', 3, 5, '2026-10-10T17:00:00Z'), estLine('M3A', 4, 7), estLine('M3B', 3, 3), estLine('M3C', 2, 3)].join('\n');
  const stale = await open({ extra: { 'intake/estimates.jsonl': est } });
  try {
    assert.deepEqual(parts(rows(stale)[2]), { icon: 'st-next', name: 'The chosen design running on the real back end', mono: 'MD3 · Design · about 3–5 days · may be out of date', right: '21–23 Oct' });
    assert.equal(parts(rows(stale)[4]).mono, 'M3B · Build · about 3 days', 'equal low and high');
  } finally {
    stale.restore();
  }
  // Under way and past its estimate on 24 Oct: AC24's words, no days, no value.
  const past = await open({ now: at('2026-10-24T18:00:00Z'), extra: { 'docs/PROJECT.md': withSprint('MD3', 'PR #902'), 'intake/estimates.jsonl': WORKED() } });
  try {
    const r = rows(past)[2];
    assert.equal(parts(r).mono, 'MD3 · Design');
    assert.equal(parts(r).right, '');
    assert.equal(parts(r).icon, 'st-half', 'work filed, under way');
    // Rewritten for AC90 (as above): its own words stay; the shared rough finish is said once at the head.
    assert.deepEqual(byClass(r, 'v2-plgap').map((g) => g.textContent), ['past its estimate of 3–5 days, made 18 Oct; waiting on a new one']);
    assert.deepEqual(byClass(findKeyed(past, 'wa-once:Service-Desk'), 'v2-plgap').map((g) => g.textContent), ['4 rough finishes not available: MD3 is past its estimate']);
  } finally {
    past.restore();
  }
  // Across the year's end: the year shown, as AC24 has it.
  const ye = await open({ now: at('2026-12-29T18:00:00Z'), extra: { 'intake/estimates.jsonl': WORKED('2026-12-29T17:00:00Z') } });
  try {
    assert.deepEqual(rows(ye).slice(2).map((x) => parts(x).right), ['1–3 Jan 2027', '5–10 Jan 2027', '7–14 Jan 2027', '9–17 Jan 2027']);
    assert.equal(findKeyed(ye, 'plan-sub').textContent, 'Rough finish from today, 29 Dec · an expectation, never a deadline');
  } finally {
    ye.restore();
  }
});

test('AC86: a rough finish written shorter at a row\'s right — "<d>–<d> <Mon>" within a month, AC24\'s "<from> – <to>" across months, one date for one day, the year when not this year', () => {
  const t = '2026-10-18';
  assert.equal(shortRange('2026-10-22', '2026-10-25', t), '22–25 Oct');
  assert.equal(shortRange('2026-10-27', '2026-11-05', t), '27 Oct – 5 Nov');
  assert.equal(shortRange('2026-10-23', '2026-10-23', t), '23 Oct');
  assert.equal(shortRange('2027-01-01', '2027-01-03', t), '1–3 Jan 2027');
  assert.equal(shortRange('2026-12-30', '2027-01-02', t), '30 Dec – 2 Jan 2027');
});

// The build review's B1 (stage 5, round 1): a waiting gate card is a row of its own at the top of its
// project's group, as frame 11 draws it ("Launch gate · waits on you", desk-v2.html:840), taken as Home's tile
// takes it (any gate card waiting in the project, AC82); no milestone row loses its icon or finish to it. A
// reading for the Definer to confirm.
const GATE_ID = 'Service-Desk|gate|queue/P-003-launch-1.md';
/** A made-up Launch-gate card (NOT a real record: AC85's fixture), its `Milestone:` line as given, or none, and its dispatch line. */
function gateExtra(milestoneLine) {
  const base = fixture('ac85/queue/P-003-launch-1.md');
  const card = milestoneLine == null ? base : base.replace(/(answer: [^\n]*\n)/, `$1${milestoneLine}\n`);
  const log = `${j77Files()['dispatch-log/2026-10.jsonl'].trimEnd()}\n${JSON.stringify({ item: 'P-003', action: 'card', card: 1, gate: 'launch', role: 'user-rep', route: 'launch-gate', stage: 6, gate_n: 1, time: '2026-10-18T15:00:00Z', trigger: 'x' })}\n`;
  return { 'queue/P-003-launch-1.md': card, 'dispatch-log/2026-10.jsonl': log };
}
const gateRows = (app) => findAll(app.view, (e) => cls(e, 'v2-plli') && e.attrs && e.attrs['data-gate'] != null);
const WORKED_RIGHT = ['your acceptance', 'your acceptance', '21–23 Oct', '25–30 Oct', '27 Oct – 3 Nov', '29 Oct – 6 Nov'];
const WORKED_ICONS = ['st-half', 'st-half', 'st-next', 'st-planned', 'st-planned', 'st-planned'];

test('AC86 (B1): a gate card in the model\'s real form, its `Milestone:` line every milestone of the spec — one gate row of its own at the top of the group, the ◆, "<Phase> gate · waits on you", "after your ruling"; every milestone row keeps its icon and finish', async () => {
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED(), ...gateExtra('Milestone: M1, M2, M2B, MD1, MD2, MD3, M3A, M3B, M3C') } });
  try {
    const g = gateRows(app);
    assert.equal(g.length, 1, 'exactly one gate row');
    const list = byClass(findKeyed(app, 'wa-grp:Service-Desk'), 'v2-rows')[0];
    assert.equal(list.children[0], g[0], 'at the top of its project\'s group');
    assert.equal(g[0].attrs['data-gate'], GATE_ID);
    const title = 'The Launch gate: the launch review passed. The case for going live and graduating the product, with its own monitoring and feedback confirmed running, is in the gate document. Proceed, hold, recycle or kill?';
    assert.deepEqual(parts(g[0]), { icon: 'st-you', name: title, mono: 'Launch gate · waits on you', right: 'after your ruling' }, 'the card\'s title, as the board shows it');
    // Rewritten for AC89 (i) (specs/S-001.md:7896-7903): a gate's sheet opened from Plan sits over Plan, so it closes back to Plan.
    assert.equal(byClass(g[0], 'v2-plrow')[0].attrs.href, `#/work/card/${encodeURIComponent(GATE_ID)}`, 'it opens the gate card\'s sheet over Plan');
    await app.go('#/waiting');
    assert.equal(findKeyed(app, `cardlink:${GATE_ID}`).textContent, title, 'the same title on the board');
    await app.go('#/work');
    assert.deepEqual(rows(app).map((r) => parts(r).icon), WORKED_ICONS, 'each milestone its own state\'s icon');
    assert.deepEqual(rows(app).map((r) => parts(r).right), WORKED_RIGHT, 'each its own finish, and "your acceptance" for AC24\'s "once you accept it"');
    assert.equal(textRuns(byClass(findKeyed(app, 'wa-grp:Service-Desk'), 'v2-plh')[0], () => false)[1], '6', 'the count: milestones ahead, the gate not among them');
    // Rewritten at stage 6a of "After MD3" (AC89 (k), specs/S-001.md:7932-7933; AC86's note, :7676-7677): "a gate card is
    // never counted in a milestone row's '<n> waiting on you in your Queue' (AC24's note); its own row says it waits".
    assert.ok(rows(app).every((r) => byClass(r, 'v2-plyou').length === 0), 'no milestone row counts the gate card');
    // In the ordering the gate is no row: it is in no order and no plan.
    await app.tap(findKeyed(app, 'plan-order'));
    assert.equal(gateRows(app).length, 0);
    assert.doesNotMatch(new URL(findKeyed(app, 'wa-record').attrs.href).searchParams.get('value'), /gate|P-003/);
  } finally {
    app.restore();
  }
});

test('AC86 (B1): a gate card with no `Milestone:` line still gives its gate row; Home\'s tile and Plan agree ("Next: the Launch gate, after your ruling" and Plan\'s ◆ row); with none waiting, neither shows one', async () => {
  for (const [label, extra] of [['no Milestone: line', gateExtra(null)], ['one milestone named', gateExtra('Milestone: M3C')]]) {
    const app = await open({ hash: '#/', extra: { 'intake/estimates.jsonl': WORKED(), ...extra } });
    try {
      const next = byClass(findKeyed(app, 'card:Service-Desk'), 'v2-ln').map((l) => l.textContent).find((t) => /^Next:/.test(t));
      assert.equal(next, 'Next: the Launch gate, after your ruling', `${label}: Home`);
      await app.go('#/work');
      assert.equal(gateRows(app).length, 1, `${label}: Plan`);
      assert.deepEqual(rows(app).map((r) => parts(r).right), WORKED_RIGHT, `${label}: every finish kept`);
      assert.deepEqual(rows(app).map((r) => parts(r).icon), WORKED_ICONS, `${label}: every icon kept`);
      // Marked done on this device: it leaves the board, so both lose it at once (AC80).
      await app.go(`#/waiting/card/${encodeURIComponent(GATE_ID)}`);
      await app.tap(findKeyed(app, 'sheet-done'));
      await app.go('#/work');
      assert.equal(gateRows(app).length, 0, `${label}: marked done, no gate row`);
      await app.go('#/');
      assert.doesNotMatch(byClass(findKeyed(app, 'card:Service-Desk'), 'v2-ln').map((l) => l.textContent).join('\n'), /gate, after your ruling/, `${label}: nor on Home`);
    } finally {
      app.restore();
    }
  }
  const none = await open({ extra: { 'intake/estimates.jsonl': WORKED() } });
  try {
    assert.equal(gateRows(none).length, 0);
    assert.ok(rows(none).every((r) => parts(r).icon !== 'st-you'));
  } finally {
    none.restore();
  }
});

test('AC86: a question naming a milestone keeps the row\'s icon and finish and adds AC24\'s "<n> waiting on you in your Queue", its ◆ vermilion beside words in ink; the same line in the sheet', async () => {
  const q = fixture('notify/ac77-real/questions/P-001-next-work.md').replace('Milestone: M3A', 'Milestone: MD3').replace('Which piece of later work comes next?', 'A made-up question for MD3');
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED(), 'questions/P-001-made-up-md3.md': q } });
  try {
    const r = rows(app)[2];
    assert.deepEqual([parts(r).icon, parts(r).right], ['st-next', '21–23 Oct']);
    const you = byClass(r, 'v2-plyou')[0];
    assert.equal(you.textContent, '1 waiting on you in your Queue');
    assert.match(findAll(you, (e) => e.tag === 'svg')[0].attrs.class, /\bst-you\b/);
    await app.go('#/work/ms/Service-Desk/MD3');
    assert.equal(byClass(byClass(app.view, 'v2-sheet')[0], 'v2-plyou')[0].textContent, '1 waiting on you in your Queue');
  } finally {
    app.restore();
  }
  // The view: a gate card naming a milestone no longer touches that row (pure).
  const gateRow = { flag: { kind: 'card', card: { gate: 'launch', parsed: { text: 'answer: write `x`\nMilestone: M3B\n' } } } };
  const v = viewOf({ extra: { 'intake/estimates.jsonl': WORKED() }, nowMs: NOW, rows: [gateRow] });
  const m3b = v.rows.find((x) => x.code === 'M3B');
  // Rewritten at stage 6a (AC89 (k), specs/S-001.md:7932-7933): nor is it counted in the row's waiting.
  assert.deepEqual([m3b.icon, m3b.right, m3b.waiting], ['planned', { kind: 'finish', words: '27 Oct – 3 Nov' }, 0]);
});

// The build review's B2 (stage 5, round 1): J14's "a newer estimate line could not be read" under the
// estimate the row shows (specs/S-001.md:10361-10364), on the row and in the sheet.
test('AC86 with J14: a newer estimate line that can\'t be read — the row says "a newer estimate line could not be read" under the estimate it shows, and so does its sheet; no other row says it', async () => {
  const bad = JSON.stringify({ time: '2026-10-18T17:30:00Z', project: 'Service-Desk', milestone: 'MD3', low_days: 9.5, high_days: 12, note: '', session: 'made_up' });
  const app = await open({ extra: { 'intake/estimates.jsonl': `${WORKED()}${bad}\n` } });
  try {
    const r = rows(app)[2];
    assert.equal(parts(r).mono, 'MD3 · Design · about 3–5 days', 'the estimate it shows, the older line\'s');
    assert.deepEqual(byClass(r, 'v2-plnewer').map((x) => x.textContent), ['a newer estimate line could not be read']);
    assert.ok(rows(app).filter((x) => x !== r).every((x) => byClass(x, 'v2-plnewer').length === 0));
    await app.go('#/work/ms/Service-Desk/MD3');
    const sh = byClass(app.view, 'v2-sheet')[0];
    assert.equal(byClass(sh, 'v2-plest')[0].textContent, 'about 3–5 days of work · your Chief of Staff, 18 Oct');
    assert.deepEqual(byClass(sh, 'v2-plnewer').map((x) => x.textContent), ['a newer estimate line could not be read']);
    await app.go('#/work/ms/Service-Desk/MD2');
    assert.equal(byClass(byClass(app.view, 'v2-sheet')[0], 'v2-plnewer').length, 0);
  } finally {
    app.restore();
  }
});

// The Design reviewer's finding 1 (stage 5, round 1): grouped by project, a reason naming another project's
// milestone says whose it is, as Home's tile does (AC82); within a project, AC24's words as they are.
test('AC86: a rough finish not available because of another project\'s milestone names that project ("not available: Example\'s MD1 has no estimate yet") on the row, in the sheet and on the card; within one project, AC24\'s words', async () => {
  const EX = { ...SD, name: 'Example', repo: 'example/made-up', planning: false };
  const name = '2026-10-18T1130Z-01';
  const plan = `Plan: ${name}\nSupersedes: none\n\n| Order | Project | Milestone |\n|---|---|---|\n| 1 | Service-Desk | MD1 |\n| 2 | Example | MD1 |\n| 3 | Service-Desk | MD2 |\n`;
  const app = await open({ projects: [SD, EX, POOM], more: { Example: repo(j77Files()) }, extra: { [`docs/planning/${name}.md`]: plan, 'intake/estimates.jsonl': WORKED() } });
  try {
    const gap = (project, id) => {
      const g = findKeyed(app, `wa-grp:${project}`);
      const r = findAll(g, (e) => e.attrs && e.attrs['data-row'] === id)[0];
      return byClass(r, 'v2-plgap').map((x) => x.textContent);
    };
    // Rewritten for AC90 (specs/S-001.md:8011-8022; AC86's note, :7678-7681): each reason the group's rows share is said once
    // at its head, in the same words, and no row repeats it.
    const once = (project) => byClass(findKeyed(app, `wa-once:${project}`), 'v2-plgap').map((x) => x.textContent);
    assert.deepEqual(gap('Service-Desk', 'MD1'), [], 'before it: its own finish');
    assert.deepEqual(gap('Service-Desk', 'MD2'), []);
    assert.ok(once('Service-Desk').some((w) => /^\d+ rough finishes not available: Example's MD1 has no estimate yet$/.test(w)), JSON.stringify(once('Service-Desk')));
    assert.deepEqual(gap('Example', 'MD1'), [], 'its own: said at the head');
    assert.deepEqual(gap('Example', 'MD2'), []);
    assert.ok(once('Example').some((w) => /^\d+ milestones · no estimates yet$/.test(w)), JSON.stringify(once('Example')));
    assert.ok(once('Example').some((w) => /^\d+ rough finishes not available: MD1 has no estimate yet$/.test(w)), 'AC24\'s words, once');
    await app.go('#/work/ms/Service-Desk/MD2');
    assert.equal(byClass(byClass(app.view, 'v2-sheet')[0], 'v2-plfin')[0].textContent, 'not available: Example\'s MD1 has no estimate yet');
    await app.go('#/work');
    await app.tap(findKeyed(app, 'plan-order'));
    assert.equal(byClass(app.view, 'v2-plbig')[0].textContent, 'not available: Example\'s MD1 has no estimate yet', 'the card adds up both projects');
  } finally {
    app.restore();
  }
  // One project: AC24's words, the card too.
  const one = await open({ extra: { 'intake/estimates.jsonl': WORKED().split('\n').filter((l) => !l.includes('"MD3"')).join('\n') } });
  try {
    await one.tap(findKeyed(one, 'plan-order'));
    assert.equal(byClass(one.view, 'v2-plbig')[0].textContent, 'not available: MD3 has no estimate yet');
  } finally {
    one.restore();
  }
});

test('AC86 with AC24: the state line reads "Current plan · recorded <date>, <time>", with AC24\'s "·" (specs/S-001.md:8444; the Design reviewer\'s finding 2)', async () => {
  const name = '2026-10-18T1130Z-01';
  const app = await open({ extra: { [`docs/planning/${name}.md`]: planText(name, ['M3A', 'MD3']) } });
  try {
    const st = byClass(app.view, 'v2-plstate')[0];
    assert.deepEqual(textRuns(st, () => false), ['Current plan', '· recorded 18 Oct, 06:30']);
    assert.equal(st.textContent, 'Current plan · recorded 18 Oct, 06:30');
  } finally {
    app.restore();
  }
});

test('AC86: the groups — one for each connected v3 project, "<project> · milestones ahead" with its count, in the order of each project\'s first milestone in the owner\'s one order; in the ordering, that one order as one list, each row naming its project', async () => {
  // "Example", a second v3 project, made up (NOT real): Service-Desk's records under another name.
  const EX = { ...SD, name: 'Example', repo: 'example/made-up', planning: false };
  const name = '2026-10-18T1130Z-01';
  const order = [['Example', 'MD3'], ['Service-Desk', 'MD1'], ['Service-Desk', 'MD2'], ['Example', 'MD1']];
  const plan = `Plan: ${name}\nSupersedes: none\n\n| Order | Project | Milestone |\n|---|---|---|\n${order.map(([p, m], i) => `| ${i + 1} | ${p} | ${m} |`).join('\n')}\n`;
  const app = await open({ projects: [SD, EX, POOM], more: { Example: repo(j77Files()) },
    extra: { [`docs/planning/${name}.md`]: plan, 'intake/estimates.jsonl': `${WORKED()}${estLine('MD3', 1, 2, '2026-10-18T17:00:00Z', '', 'Example')}\n` } });
  try {
    const groups = byClass(app.view, 'v2-plgrp').filter((g) => /^wa-grp:/.test(g.dataset.k));
    assert.deepEqual(groups.map((g) => textRuns(byClass(g, 'v2-plh')[0], () => false)), [['Example · milestones ahead', '6'], ['Service-Desk · milestones ahead', '6']],
      'Example first: its MD3 is first in the owner\'s order');
    assert.ok(groups.every((g) => findAll(byClass(g, 'v2-plh')[0], (e) => e.tag === 'svg' && /\bvi-proj\b/.test(e.attrs.class)).length === 1), 'a folder before each project\'s name');
    const codes = (g) => findAll(g, (e) => e.attrs && e.attrs['data-row'] != null).map((r) => r.attrs['data-row']);
    assert.deepEqual(codes(groups[0]), ['MD3', 'MD1', 'MD2', 'M3A', 'M3B', 'M3C'], 'Example\'s, in the owner\'s order, then those the plan does not list');
    assert.deepEqual(codes(groups[1]), ['MD1', 'MD2', 'MD3', 'M3A', 'M3B', 'M3C']);
    assert.equal(parts(rows(app)[0]).right, '19–20 Oct', 'Example\'s MD3 first: 1–2 days from today');
    // The ordering: AC24's one order across projects, as one list, each row naming its project.
    await app.tap(findKeyed(app, 'plan-order'));
    assert.deepEqual(rows(app).slice(0, 4).map((r) => parts(r).mono),
      ['MD3 · Design · about 1–2 days · Example', 'MD1 · Design · Service-Desk', 'MD2 · Design · Service-Desk', 'MD1 · Design · Example']);
    assert.equal(byClass(app.view, 'v2-plgrp').filter((g) => /^wa-grp:/.test(g.dataset.k)).length, 0);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Below the milestones

test('AC86: after the milestones, AC24\'s v2.5 lines, then "Not milestones yet" with its count and AC24\'s rows ("<name>" over "<W-id> · <project>"), then "Ideas · from the portfolio", which says the portfolio isn\'t read yet (AC87, 6a)', async () => {
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED(), 'intake/later-work.md': LATER } });
  try {
    const order = byClass(app.view, 'v2-plgrp').map((g) => g.dataset.k);
    assert.deepEqual(order, ['wa-grp:Service-Desk', 'wa-g:reached', 'wa-old:Personal-Org-Operating-Model', 'wa-later', 'wa-ideas']);
    const later = findKeyed(app, 'wa-later');
    assert.deepEqual(textRuns(byClass(later, 'v2-plh')[0], () => false), ['Not milestones yet', '2']);
    const r = byClass(later, 'v2-plli');
    assert.deepEqual(r.map((x) => [byClass(x, 'v2-plname')[0].textContent, byClass(x, 'v2-mono')[0].textContent]), [['Ask or jot box', 'W1 · Service-Desk'], ['Upkeep fixes', 'W2 · Service-Desk']]);
    assert.ok(r.every((x) => findAll(x, (e) => e.tag === 'svg' && /\bst-planned\b/.test(e.attrs.class)).length === 1), 'a dashed ring, as drawn');
    assert.ok(r.every((x) => findAll(x, (e) => e.tag === 'svg' && /\bvi-chev\b/.test(e.attrs.class)).length === 1), 'a chevron: a tap asks');
    const ideas = findKeyed(app, 'wa-ideas');
    assert.deepEqual(textRuns(ideas, () => false), ['Ideas · from the portfolio', 'Not read yet: your portfolio isn\'t connected to the desk']);
    assert.equal(byClass(ideas, 'v2-mono').length, 0, 'no count: nothing is read');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// A milestone's sheet

test('AC86: a tap on a row opens its sheet — AC24\'s whole row: its code, phase in its colour, its state beside its icon, "Done when", the estimate and its note, the rough finish in AC24\'s words, and the milestone on the Timeline; it closes on its close, a tap outside and Escape, focus back on the row', async () => {
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED() } });
  try {
    await app.tap(byClass(rows(app)[2], 'v2-plrow')[0]);
    await app.go(byClass(rows(app)[2], 'v2-plrow')[0].attrs.href);
    let sh = byClass(app.view, 'v2-sheet')[0];
    assert.ok(sh, 'the sheet');
    assert.equal(sh.attrs.role, 'dialog');
    assert.equal(sh.attrs['aria-label'], 'The chosen design running on the real back end');
    assert.deepEqual(textRuns(sh, () => false), ['MD3', '·', 'Design', 'The chosen design running on the real back end', 'No work filed yet · next to reach',
      'Done when', 'the chosen look runs on the desk\'s real back end, showing real records, on its preview site',
      'Estimate', 'about 3–5 days of work · your Chief of Staff, 18 Oct', 'the trial view\'s last screens, then your acceptance',
      'Rough finish', '21 Oct – 23 Oct', 'Added up in your order from today. An expectation, never a deadline.', 'On the Timeline']);
    assert.ok(cls(byClass(sh, 'v2-plph')[0], 'ph-des'));
    assert.match(findAll(byClass(sh, 'v2-plst')[0], (e) => e.tag === 'svg')[0].attrs.class, /\bst-next\b/);
    assert.equal(findKeyed(app, 'wa-timeline').attrs.href, '#/p/Service-Desk/timeline/ms/MD3');
    assert.ok(cls(findKeyed(app, 'sheet-close'), 'v2-x44'), 'its 44 px close');
    // It closes on its close, a tap outside or Escape, focus back on the row it opened from (AC56).
    for (const how of ['control', 'outside', 'escape']) {
      if (how !== 'control') {
        const row = findKeyed(app, `wa-open:${key('MD1')}`);
        await app.tap(row);
        await app.go(row.attrs.href);
        sh = byClass(app.view, 'v2-sheet')[0];
        assert.equal(byClass(sh, 'v2-plfin')[0].textContent, 'once you accept it');
      }
      if (how === 'control') await app.tap(findKeyed(app, 'sheet-close'));
      else if (how === 'outside') await app.tap(byClass(app.view, 'v2-scrim')[0]);
      else await app.key('Escape');
      await app.flush();
      assert.equal(byClass(app.view, 'v2-sheet').length, 0, how);
      assert.equal(app.loc.hash, '#/work');
      assert.equal(document.activeElement && document.activeElement.dataset.k, `wa-open:${key(how === 'control' ? 'MD3' : 'MD1')}`, `focus back on the row (${how})`);
    }
    // A milestone no longer ahead (reached): Plan alone.
    await app.go('#/work/ms/Service-Desk/M1');
    assert.equal(byClass(app.view, 'v2-sheet').length, 0);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Its words and its marks

test('AC86: Plan draws ◆, ▲, ▼, ⇅ and ▸ only as icons, never as text, on the tab, in its ordering and in a sheet (AC81)', async () => {
  const card = fixture('ac85/queue/P-003-launch-1.md').replace(/(answer: [^\n]*\n)/, '$1Milestone: M3C\n');
  const log = `${j77Files()['dispatch-log/2026-10.jsonl'].trimEnd()}\n${JSON.stringify({ item: 'P-003', action: 'card', card: 1, gate: 'launch', role: 'user-rep', route: 'launch-gate', stage: 6, gate_n: 1, time: '2026-10-18T15:00:00Z', trigger: 'x' })}\n`;
  const app = await open({ extra: { 'intake/estimates.jsonl': WORKED(), 'intake/later-work.md': LATER, 'queue/P-003-launch-1.md': card, 'dispatch-log/2026-10.jsonl': log } });
  try {
    const texts = [app.text()];
    await app.tap(findKeyed(app, 'plan-order'));
    await app.tap(findKeyed(app, 'fold:reached'));
    texts.push(app.text());
    await app.go('#/work/ms/Service-Desk/M3C');
    texts.push(app.text());
    for (const t of texts) for (const c of ['◆', '▲', '▼', '⇅', '▸', '▾']) assert.ok(!t.includes(c), `${c} never as text`);
  } finally {
    app.restore();
  }
});

test('AC86: Plan\'s own new words never say "deadline" but in "never a deadline", nor "due", "late", "overdue" or "target" (AC24\'s rule, specs/S-001.md:8432-8434)', () => {
  const BANNED = /\b(deadline|due|late|overdue|target)\b/i;
  const mine = [WA.planTitle, WA.changeOrder, WA.planSub('18 Oct'), WA.ahead('Service-Desk'), WA.yourAcceptance, WA.afterRuling, WA.ideas, WA.ideasNotRead, WA.onTimeline, WA.doneWhen, WA.sheetFinishNote];
  for (const w of mine) assert.doesNotMatch(w.replaceAll('never a deadline', ''), BANNED, w);
  assert.match(WA.planSub('18 Oct'), /an expectation, never a deadline$/, 'the rough finish labelled an expectation (P-001-m3a-finish.md)');
});

test('AC86: Plan\'s records stay where they are (P-001-portfolio-plan.md, A): the plan and the estimates read from Service-Desk, and "Record plan" opens GitHub there, filled in, for the owner to commit', async () => {
  const name = '2026-10-18T1130Z-01';
  const app = await open({ extra: { [`docs/planning/${name}.md`]: planText(name, ['M3A', 'MD3']), 'intake/estimates.jsonl': WORKED() } });
  try {
    assert.deepEqual(rows(app).map((r) => parts(r).mono.split(' · ')[0]), ['M3A', 'MD3', 'MD1', 'MD2', 'M3B', 'M3C']);
    assert.equal(byClass(app.view, 'v2-plstate')[0].textContent, 'Current plan · recorded 18 Oct, 06:30');
    await app.tap(findKeyed(app, 'plan-order'));
    const u = new URL(findKeyed(app, 'wa-record').attrs.href);
    assert.equal(u.origin + u.pathname, 'https://github.com/shumpmaster/Service-Desk/new/main');
    assert.match(u.searchParams.get('filename'), /^docs\/planning\/2026-10-18T1801Z-01\.md$/);
  } finally {
    app.restore();
  }
});
