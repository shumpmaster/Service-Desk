// ac-test: S-001/AC25 — the device's notes and "Didn't need me" on the desk (stage VT2 of "The desk's value targets shown:
// M3B"; AC25's first two parts as changed for M3B): open windows from the page's visible and hidden events and its unload,
// their end written at the page's 15-second tick (the kill case: a window ends at its last write); first shown once per AC73
// key at the first read counting the item while visible, never again when it leaves and comes back; a card raised while the
// desk is closed first shown at the next opening's read; a held question noted only once its hold ends and it is counted; no
// note and no control for a portfolio card; "Didn't need me" on every kind of counted item's sheet as its last line (below
// `sheetFoot` on a question's and a gate's sheet; below "Done ✓ · Close", "Undo · Close" or "Close" alone), and on the "No
// longer waiting" and "being recorded" sheets of a noted item; neutral (`--t-small` `--ink2` under a hairline, never `--you`,
// at least 24 px tall); kept with its mark on a confirming and a kicked-back sheet; the mark and "Unmark" kept through a
// refresh (AC56), on that device only; nothing else on the board, Home, the counts or the calls changing for a mark; and
// storage that throws: "Not noted on this device" on the targets' sheet, no control, and nothing else broken.
// join-test: S-001/J5 — the notes' storage on the page: under `desk-metrics-v1`, in the wrapped store, on this device only.
// The page is the sandbox's own code under the fake DOM, on made-up projects (NOT real: tests/desk/vt2-fixtures.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { byClass, findAll } from './sandbox-helpers.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { NOT_NOTED } from '../../src/lib/metrics.js';
import {
  NOW, MIN, H, KEYS, HELD_KEY, HELD_PATH, REC_KEY, REC_NOW, TARGETS_NOW, everyKind, withHeld, heldText, recordingState, targetsState,
  vt2Open, notesIn, sheetOf, sheetParts, dnmLine, buttonText, openSheet, memStore, METRICS_KEY,
} from './vt2-fixtures.mjs';

const COUNTED = ['card', 'question', 'gate', 'pr', 'deploy', 'hold', 'merge', 'missing'];
const dnmButton = (app) => { const l = dnmLine(app); return l ? findAll(l, (e) => e.tag === 'button')[0] : null; };
const inActs = (app, text) => findAll(byClass(sheetOf(app), 'v2-acts')[0], (e) => e.tag === 'button' && e.textContent === text)[0];
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const plain = (v) => String(v || '').replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');
function cascaded(app, scheme = 'light') {
  const tree = treeOf(app.view, { className: document.documentElement.className, attrs: {} });
  return nodes(cascade(tree, RULES, { scheme, width: 360, reducedMotion: false }));
}

test('AC25 + J5 on the page: a window opens at load (visible) and at each visible event, ends at each hidden event and at the unload, its end written at every 15-second tick; a tab killed with no hidden event ends at its last write', async () => {
  const store = memStore();
  const app = await vt2Open(everyKind({ portfolio: false }), { store });
  const t0 = NOW;
  try {
    assert.deepEqual(notesIn(store).windows, [[t0, t0]], 'opened at load, the page visible');
    assert.match(notesIn(store).device, /^d[0-9a-f]{4}$/);
    await app.advance(14_000);
    await app.tick();
    assert.deepEqual(notesIn(store).windows, [[t0, t0 + 15_000]], 'its end written at the tick');
    await app.advance(5_000);
    await app.visibility('hidden');
    assert.deepEqual(notesIn(store).windows, [[t0, t0 + 20_000]], 'ended at the hidden event');
    await app.advance(10 * MIN);
    await app.tick();
    assert.deepEqual(notesIn(store).windows, [[t0, t0 + 20_000]], 'a tick while hidden writes nothing');
    await app.visibility('visible');
    const t1 = t0 + 20_000 + 10 * MIN;
    await app.advance(3_000);
    await app.winEvent('pagehide');
    assert.deepEqual(notesIn(store).windows, [[t0, t0 + 20_000], [t1, t1 + 3_000]], 'a second window, ended at the unload');
    await app.visibility('visible');
    await app.advance(15_000);
    await app.tick();
    await app.advance(15_000);
    await app.tick();
  } finally {
    // Killed: no hidden event, no unload.
    app.restore();
  }
  const t2 = NOW + 20_000 + 10 * MIN + 3_000;
  const w = notesIn(store).windows;
  assert.deepEqual(w[2], [t2, t2 + 30_000], 'the killed window ends at its last write');
  const again = await vt2Open(everyKind({ portfolio: false }), { store, now: t2 + H });
  try {
    assert.deepEqual(notesIn(store).windows.slice(2), [[t2, t2 + 30_000], [t2 + H, t2 + H]], 'the next load opens its own; the killed one keeps its end');
  } finally {
    again.restore();
  }
});

// VT2's round 2 (the Reviewer's N1, M17): the page's own split, in ownerTimeZone (Chicago), not UTC.
test('AC25 on the page: a window open across Monday 00:00 in Chicago (ownerTimeZone) is split there, at the tick after it, not at Monday 00:00 UTC', async () => {
  const MON = Date.parse('2026-10-19T05:00:00Z'); // Mon 19 Oct, 00:00 CDT; Monday 00:00 UTC was five hours before
  const t0 = MON - 30_000; // Sun 18 Oct, 23:59:30 in Chicago
  const store = memStore();
  const app = await vt2Open(everyKind({ portfolio: false }), { store, now: t0 });
  try {
    assert.deepEqual(notesIn(store).windows, [[t0, t0]]);
    await app.advance(14_000);
    await app.tick();
    assert.deepEqual(notesIn(store).windows, [[t0, t0 + 15_000]], 'Sunday still, in Chicago');
    await app.advance(30_000);
    await app.tick();
    assert.deepEqual(notesIn(store).windows, [[t0, MON], [MON, MON + 15_000]], 'split at Monday 00:00 in Chicago');
    await app.advance(5_000);
    await app.visibility('hidden');
    assert.deepEqual(notesIn(store).windows, [[t0, MON], [MON, MON + 20_000]]);
  } finally {
    app.restore();
  }
});

// VT2's round 2 (the Reviewer's N1, M22): a page loaded in a background tab.
test('AC25 on the page: a page loaded hidden opens no window and notes nothing, its reads included, until it becomes visible; then a window opens and its read notes what it counts', async () => {
  const store = memStore();
  const app = await vt2Open(everyKind({ portfolio: false }), { store, visibility: 'hidden' });
  try {
    await app.advance(2 * POLL_MS);
    await app.tick();
    const n = notesIn(store);
    assert.ok(n === null || (n.windows.length === 0 && Object.keys(n.shown).length === 0), `no window, no note: ${JSON.stringify(n)}`);
    const opened = app.now;
    await app.visibility('visible');
    assert.deepEqual(notesIn(store).windows, [[opened, opened]], 'a window from the visible event');
    await app.advance(POLL_MS);
    const shown = Object.values(notesIn(store).shown);
    assert.equal(shown.length, COUNTED.length, 'every counted item noted at the opening\'s read');
    assert.ok(shown.every((t) => t >= opened), 'none before the page was visible');
  } finally {
    app.restore();
  }
});

// VT2's round 2 (the Reviewer's N4): a page restored from the back-forward cache.
test('AC25 on the page: a page restored from the back-forward cache (pageshow, persisted) and visible opens a window again, even with no visible event; a second open changes nothing', async () => {
  const store = memStore();
  const app = await vt2Open(everyKind({ portfolio: false }), { store });
  const t0 = NOW;
  try {
    await app.advance(9_000);
    await app.winEvent('pagehide', { persisted: true });
    assert.deepEqual(notesIn(store).windows, [[t0, t0 + 10_000]], 'ended at the unload');
    await app.advance(H);
    const back = app.now;
    await app.winEvent('pageshow', { persisted: true });
    assert.deepEqual(notesIn(store).windows, [[t0, t0 + 10_000], [back, back]], 'a window again on restore');
    await app.visibility('visible');
    await app.advance(14_000);
    await app.tick();
    assert.deepEqual(notesIn(store).windows, [[t0, t0 + 10_000], [back, back + 14_000]], 'one window, its end written at the tick');
    // A first load's pageshow (not persisted) opens nothing more.
    await app.winEvent('pageshow', { persisted: false });
    assert.equal(notesIn(store).windows.length, 2);
  } finally {
    app.restore();
  }
  // Restored while hidden: no window until it is visible.
  const hid = await vt2Open(everyKind({ portfolio: false }), { store: memStore() });
  try {
    await hid.winEvent('pagehide', { persisted: true });
    await hid.advance(H);
    document.visibilityState = 'hidden';
    await hid.winEvent('pageshow', { persisted: true });
    assert.equal(notesIn(hid.store).windows.length, 1, 'restored hidden: no window');
  } finally {
    hid.restore();
  }
});

test('AC25: first shown once per AC73 key, at the first read counting it while visible — every counted kind in a connected project, never a portfolio card; an item that leaves and comes back keeps its first time', async () => {
  const st = everyKind();
  const app = await vt2Open(st);
  try {
    const n = notesIn(app.store);
    for (const k of COUNTED) assert.ok(Number.isFinite(n.shown[KEYS[k]]), `${k}: noted`);
    assert.equal(n.shown[KEYS.portfolio], undefined, 'no note for a portfolio card');
    assert.equal(Object.keys(n.shown).length, COUNTED.length, 'nothing else noted');
    const first = n.shown[KEYS.card];
    assert.ok(first >= NOW && first <= NOW + 1000, 'at the read that counted it');
    // It leaves (its card file removed) and comes back two reads later: its first time stays.
    const files = everyKind().repos.Alpha.files;
    const onBoard = () => findAll(app.view, (e) => e.tag === 'a' && e.attrs.href === `#/waiting/card/${encodeURIComponent(KEYS.card)}`).length > 0;
    assert.ok(onBoard());
    st.repos.Alpha.commit({ 'queue/Q-020-stop-1.md': null, 'status/Q-020.toml': null });
    await app.advance(POLL_MS);
    assert.ok(!onBoard(), 'it left');
    st.repos.Alpha.commit({ 'queue/Q-020-stop-1.md': files['queue/Q-020-stop-1.md'], 'status/Q-020.toml': files['status/Q-020.toml'] });
    await app.advance(POLL_MS);
    assert.ok(onBoard(), 'it came back');
    assert.equal(notesIn(app.store).shown[KEYS.card], first, 'its first time kept');
  } finally {
    app.restore();
  }
});

test('AC25: a card raised while the desk is closed is first shown at the next opening\'s read, not before; nothing is noted while the page is hidden', async () => {
  const st = everyKind({ portfolio: false });
  const app = await vt2Open(st);
  const NEW = 'Alpha|question|questions/Alpha-later.md';
  try {
    await app.visibility('hidden');
    st.repos.Alpha.commit({ 'questions/Alpha-later.md': '# Ruling needed: A made-up later question (VT2, NOT real)\n\nWHY: made up.\nRISK CLASS: R0\nREVERSIBILITY: reversible\nBLAST RADIUS: none\nDEFAULT: none\nTIMEOUT: none\n' });
    await app.advance(3 * POLL_MS);
    assert.equal(notesIn(app.store).shown[NEW], undefined, 'not noted while closed');
    const opened = app.now;
    await app.visibility('visible');
    assert.equal(notesIn(app.store).shown[NEW], undefined, 'not noted before the opening\'s read');
    await app.advance(POLL_MS);
    const at = notesIn(app.store).shown[NEW];
    assert.ok(Number.isFinite(at) && at >= opened, 'first shown at the opening\'s read');
    assert.ok(app.text().includes('A made-up later question'));
  } finally {
    app.restore();
  }
});

test('AC25: a read that finishes while the page is hidden counts nothing; its item is first shown at the opening\'s own read, never at the drawing on opening', async () => {
  const st = everyKind({ portfolio: false });
  const app = await vt2Open(st);
  const NEW = 'Alpha|question|questions/Alpha-in-flight.md';
  try {
    // A poll is under way when the page is hidden: its calls held until then.
    const call = app.server.call.bind(app.server);
    let release = null;
    const held = new Promise((ok) => { release = ok; });
    app.server.call = async (path, body) => { await held; return call(path, body); };
    st.repos.Alpha.commit({ 'questions/Alpha-in-flight.md': '# Ruling needed: A made-up question read while hidden (VT2, NOT real)\n\nWHY: made up.\nRISK CLASS: R0\nREVERSIBILITY: reversible\nBLAST RADIUS: none\nDEFAULT: none\nTIMEOUT: none\n' });
    await app.advance(POLL_MS);
    await app.visibility('hidden');
    app.server.call = call;
    release();
    await app.flush();
    await app.advance(1000);
    assert.equal(notesIn(app.store).shown[NEW], undefined, 'read while hidden: not noted');
    // Back 10 seconds later: the page draws what it read at once; the opening's own read comes at its poll's mark.
    await app.advance(10_000);
    const opened = app.now;
    await app.visibility('visible');
    assert.ok(app.text().includes('A made-up question read while hidden'), 'drawn on opening, from the read made while hidden');
    assert.equal(notesIn(app.store).shown[NEW], undefined, 'not noted by the drawing on opening');
    await app.advance(POLL_MS);
    const at = notesIn(app.store).shown[NEW];
    assert.ok(Number.isFinite(at) && at > opened, 'first shown at the opening\'s read');
  } finally {
    app.restore();
  }
});

test('AC25: a held question is not noted while held and has no control; first shown once its hold ends and it is counted, its sheet then ending with "Didn\'t need me"', async () => {
  const st = withHeld(everyKind({ portfolio: false }));
  const app = await vt2Open(st);
  try {
    await app.advance(POLL_MS);
    assert.ok(app.text().includes('Should Plan show estimates in days or in weeks?'), 'shown, held');
    assert.equal(notesIn(app.store).shown[HELD_KEY], undefined, 'not noted while held');
    await openSheet(app, HELD_KEY);
    assert.ok(sheetOf(app), 'its sheet ("More about it ›")');
    assert.equal(dnmLine(app), null, 'no control on a held question\'s sheet');
    await app.go('#/waiting');
    // Its hold ends (its `Asked in session:` line gone): counted, and noted at that read.
    st.repos.Alpha.commit({ [HELD_PATH]: heldText(false) });
    const before = app.now;
    await app.advance(POLL_MS);
    const at = notesIn(app.store).shown[HELD_KEY];
    assert.ok(Number.isFinite(at) && at > before, 'first shown when its hold ends and it is counted');
    await openSheet(app, HELD_KEY);
    assert.equal(sheetParts(app).at(-1), dnmLine(app), 'its sheet ends with the control');
  } finally {
    app.restore();
  }
});

test('AC25: "Didn\'t need me" as the last line of every counted kind\'s sheet — below `sheetFoot` on a question\'s and a gate\'s, below "Done ✓ · Close" on the others; none on a portfolio card\'s sheet', async () => {
  const app = await vt2Open(everyKind());
  try {
    for (const k of COUNTED) {
      await openSheet(app, KEYS[k]);
      const parts = sheetParts(app);
      const last = parts.at(-1);
      assert.ok(last && /\bv2-dnm\b/.test(last.className), `${k}: the last line is the control (${parts.map((p) => p.className).join(' | ')})`);
      assert.equal(last.textContent, "Didn't need me");
      assert.equal(findAll(last, (e) => e.tag === 'button').length, 1, `${k}: a button of its own`);
      const prev = parts.at(-2);
      if (k === 'question' || k === 'gate') assert.match(prev.className, /\bv2-foot\b/, `${k}: right below sheetFoot`);
      else assert.equal(prev.textContent, 'Done ✓Close', `${k}: right below "Done ✓ · Close"`);
      assert.equal(findAll(sheetOf(app), (e) => /\bv2-dnm\b/.test(e.className || '')).length, 1, `${k}: once`);
    }
    await openSheet(app, KEYS.portfolio);
    assert.ok(sheetOf(app), 'the portfolio card\'s sheet');
    assert.equal(dnmLine(app), null, 'no control for a portfolio card');
  } finally {
    app.restore();
  }
});

test('AC25: neutral — `--t-small` `--ink2` under a hairline (`--line`), never `--you`, a text button at least 24 px tall; the same marked', async () => {
  const app = await vt2Open(everyKind({ portfolio: false }));
  try {
    for (const scheme of ['light', 'dark']) {
      await openSheet(app, KEYS.pr);
      for (const marked of [false, true]) {
        if (marked) await app.tap(dnmButton(app));
        const n = cascaded(app, scheme);
        const at = (el) => n.find((x) => x.el === el);
        const line = at(dnmLine(app));
        const btn = at(dnmButton(app));
        assert.equal(plain(line.declared.get('border-top')), `1px solid ${scheme === 'light' ? '#e7e7ea' : '#26282c'}`, 'a hairline above');
        for (const x of [line, btn]) {
          assert.equal(plain(x.declared.get('font')), '400 12px/1.4 "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', '--t-small');
          assert.equal(plain(x.declared.get('color')), scheme === 'light' ? '#5c5f66' : '#a2a5ac', '--ink2');
          assert.ok(parseFloat(plain(x.declared.get('min-height'))) >= 24, 'at least 24 px tall');
        }
        for (const x of n.filter((y) => { for (let a = y; a; a = a.parent) if (a.el === dnmLine(app)) return true; return false; })) {
          for (const p of ['color', 'background', 'background-color', 'border-color']) assert.doesNotMatch(plain(x.declared.get(p) || ''), /#c9380c|#ff7a45|you/i, 'never --you');
        }
        assert.equal(plain(btn.declared.get('text-decoration')), 'underline');
        assert.equal(plain(btn.declared.get('background')), 'none', 'a text button, no fill');
      }
      await app.tap(findAll(dnmLine(app), (e) => e.tag === 'button')[0]); // unmark for the next scheme
    }
  } finally {
    app.restore();
  }
});

test('AC25: a tap marks the item on this device — "Marked as not needing you · Unmark", "Unmark" its own button, never "Undo"; nothing else on the board, Home, the counts or the calls changes; kept through a refresh (AC56); "Unmark" undoes it; on that device only', async () => {
  const st = everyKind({ portfolio: false });
  const store = memStore();
  const app = await vt2Open(st, { store });
  const board = {};
  try {
    // Each screen drawn once first (its "checked <n> s ago" settles at its second drawing), then read.
    for (const h of ['#/waiting', '#/', '#/p/Alpha', '#/waiting', '#/', '#/p/Alpha']) {
      await app.go(h);
      board[h] = app.text();
    }
    const boardMarks = store.m.get('desk-board-marks-v1') || null;
    await openSheet(app, KEYS.question);
    const calls = app.server.calls.length;
    const tapped = dnmButton(app);
    await app.tap(tapped);
    const line = dnmLine(app);
    assert.equal(document.activeElement, tapped, 'the focus stays on its button, its words changed in place');
    assert.equal(line.textContent, 'Marked as not needing you · Unmark');
    const btns = findAll(line, (e) => e.tag === 'button');
    assert.deepEqual(btns.map((b) => b.textContent), ['Unmark'], '"Unmark" its own button');
    assert.ok(!line.textContent.includes('Undo'));
    assert.equal(sheetParts(app).at(-1), line, 'still the last line');
    assert.ok(Number.isFinite(notesIn(store).marks[KEYS.question]), 'marked, with its time');
    assert.equal(app.server.calls.length, calls, 'no call made: nothing notified, nothing sent');
    assert.equal(store.m.get('desk-board-marks-v1') || null, boardMarks, 'the board\'s own marks untouched');
    for (const h of ['#/waiting', '#/', '#/p/Alpha']) {
      await app.go(h);
      assert.equal(app.text(), board[h], `${h}: nothing else changes`);
    }
    // Kept through a refresh: its sheet opened again, and the page reloaded.
    await openSheet(app, KEYS.question);
    assert.equal(dnmLine(app).textContent, 'Marked as not needing you · Unmark');
  } finally {
    app.restore();
  }
  const again = await vt2Open(st, { store, hash: `#/waiting/card/${encodeURIComponent(KEYS.question)}` });
  try {
    assert.equal(dnmLine(again).textContent, 'Marked as not needing you · Unmark', 'kept through a reload');
    await again.tap(findAll(dnmLine(again), (e) => e.tag === 'button')[0]);
    assert.equal(dnmLine(again).textContent, "Didn't need me", 'unmarked');
    assert.equal(notesIn(store).marks[KEYS.question], undefined);
    await again.tap(dnmButton(again));
  } finally {
    again.restore();
  }
  // Another device (its own storage): its own notes, unmarked.
  const other = await vt2Open(st, { hash: `#/waiting/card/${encodeURIComponent(KEYS.question)}` });
  try {
    await other.advance(POLL_MS);
    assert.equal(dnmLine(other).textContent, "Didn't need me", 'not marked on another device');
  } finally {
    other.restore();
  }
});

test('AC25: kept with its mark on a confirming sheet ("Undo · Close") and on a kicked-back sheet ("Done ✓ · Close"), the last line on each', async () => {
  const app = await vt2Open(everyKind({ portfolio: false }));
  try {
    await openSheet(app, KEYS.card);
    await app.tap(dnmButton(app));
    await app.tap(inActs(app, 'Done ✓'));
    await openSheet(app, KEYS.card);
    assert.ok(app.text().includes('Confirming with GitHub'), 'the confirming sheet');
    let parts = sheetParts(app);
    assert.equal(parts.at(-2).textContent, 'UndoClose');
    assert.equal(parts.at(-1).textContent, 'Marked as not needing you · Unmark', 'kept with its mark, below "Undo · Close"');
    await app.go('#/waiting');
    // GitHub shows no answer: kicked back after its minutes.
    await app.advance(10 * MIN);
    await openSheet(app, KEYS.card);
    assert.ok(sheetParts(app).some((p) => p.textContent === 'Kicked back'), 'the kicked-back sheet');
    parts = sheetParts(app);
    assert.equal(parts.at(-2).textContent, 'Done ✓Close');
    assert.equal(parts.at(-1).textContent, 'Marked as not needing you · Unmark', 'kept with its mark, below "Done ✓ · Close"');
    // A question's confirming sheet: below sheetFoot, unmarked.
    await openSheet(app, KEYS.question);
    await app.tap(findAll(sheetOf(app), (e) => e.tag === 'button' && /Move to Done/.test(e.textContent))[0]);
    await openSheet(app, KEYS.question);
    parts = sheetParts(app);
    assert.match(parts.at(-2).className, /\bv2-foot\b/);
    assert.equal(parts.at(-1).textContent, "Didn't need me");
  } finally {
    app.restore();
  }
});

// VT2's round 2 (the Reviewer's N3): a gate's confirming and kicked-back sheets, and a question's kicked-back sheet, each marked.
test('AC25: kept with its mark, the last line below `sheetFoot`, on a gate\'s confirming and kicked-back sheets and a question\'s kicked-back sheet', async () => {
  const app = await vt2Open(everyKind({ portfolio: false }));
  const moveToDone = () => app.tap(findAll(sheetOf(app), (e) => e.tag === 'button' && /Move to Done/.test(e.textContent))[0]);
  const endsMarked = (what) => {
    const parts = sheetParts(app);
    assert.match(parts.at(-2).className, /\bv2-foot\b/, `${what}: below sheetFoot`);
    assert.equal(parts.at(-1).textContent, 'Marked as not needing you · Unmark', `${what}: kept with its mark, the last line`);
    assert.equal(findAll(sheetOf(app), (e) => /\bv2-dnm\b/.test(e.className || '')).length, 1, `${what}: once`);
  };
  try {
    for (const k of ['gate', 'question']) {
      await openSheet(app, KEYS[k]);
      await app.tap(dnmButton(app));
      await moveToDone();
      await openSheet(app, KEYS[k]);
      assert.ok(sheetOf(app).textContent.includes('Confirming with GitHub'), `${k}: the confirming sheet`);
      endsMarked(`${k}, confirming`);
      await app.go('#/waiting');
    }
    // GitHub shows no answer for either: both kicked back after their minutes.
    await app.advance(10 * MIN);
    for (const k of ['gate', 'question']) {
      await openSheet(app, KEYS[k]);
      assert.ok(sheetOf(app).textContent.includes('Kicked back'), `${k}: the kicked-back sheet`);
      assert.ok(!sheetOf(app).textContent.includes('Confirming with GitHub'));
      endsMarked(`${k}, kicked back`);
    }
  } finally {
    app.restore();
  }
});

test('AC25: the "No longer waiting" and "being recorded" sheets of a noted item end with the control, below "Close" alone', async () => {
  const st = everyKind({ portfolio: false });
  const app = await vt2Open(st);
  try {
    await openSheet(app, KEYS.hold);
    await app.tap(dnmButton(app));
    st.repos.Alpha.commit({ 'queue/ci-hold-4a2448939173.md': null });
    await app.advance(POLL_MS);
    assert.ok(sheetOf(app).textContent.includes('no longer'), sheetOf(app).textContent);
    const parts = sheetParts(app);
    assert.equal(parts.at(-2).textContent, 'Close', '"Close" alone');
    assert.equal(parts.at(-1).textContent, 'Marked as not needing you · Unmark', 'the "No longer waiting" sheet, with its mark');
  } finally {
    app.restore();
  }
  // A pull request counted at the first read, then being recorded by the automatic job.
  const rec = await vt2Open(recordingState(), { now: REC_NOW });
  try {
    assert.ok(Number.isFinite(notesIn(rec.store).shown[REC_KEY]), 'noted while counted');
    await openSheet(rec, REC_KEY);
    for (let i = 0; i < 4; i++) await rec.advance(POLL_MS);
    assert.ok(sheetOf(rec).textContent.includes('being recorded') || sheetOf(rec).textContent.includes('Being recorded'), sheetOf(rec).textContent);
    const parts = sheetParts(rec);
    assert.equal(parts.at(-2).textContent, 'Close');
    assert.equal(parts.at(-1).textContent, "Didn't need me", 'the "being recorded" sheet ends with the control');
  } finally {
    rec.restore();
  }
});

test('AC25 + J5: storage that throws — the targets\' sheet says "Not noted on this device", no sheet has the control, and nothing else breaks; with storage working, no such line', async () => {
  const ok = await vt2Open(targetsState(), { hash: '#/p/Service-Desk/values', now: TARGETS_NOW });
  let fine;
  try {
    assert.ok(sheetOf(ok), 'the targets\' sheet');
    assert.ok(!sheetOf(ok).textContent.includes(NOT_NOTED));
    fine = sheetParts(ok).map((p) => p.textContent);
  } finally {
    ok.restore();
  }
  const store = memStore();
  store.throws = true;
  const app = await vt2Open(targetsState(), { hash: '#/p/Service-Desk/values', now: TARGETS_NOW, store });
  try {
    const parts = sheetParts(app);
    const line = parts.find((p) => p.textContent === NOT_NOTED);
    assert.ok(line, 'the line');
    assert.match(line.className, /\bv2-small\b/);
    assert.equal(parts.indexOf(line), 2, 'under the sheet\'s small line');
    assert.deepEqual(parts.filter((p) => p !== line).map((p) => p.textContent), fine, 'nothing else on the sheet changes');
  } finally {
    app.restore();
  }
  // On every kind's sheet: no control; the board works (its cards, Done).
  const blocked = memStore();
  blocked.throws = true;
  const b = await vt2Open(everyKind({ portfolio: false }), { store: blocked });
  try {
    assert.ok(byClass(b.view, 'v2-badge')[0], 'the badge');
    for (const k of COUNTED) {
      await openSheet(b, KEYS[k]);
      assert.ok(sheetOf(b), `${k}: its sheet`);
      assert.equal(dnmLine(b), null, `${k}: no control`);
    }
    await openSheet(b, KEYS.card);
    await b.tap(inActs(b, 'Done ✓'));
    assert.ok(b.text().includes('Confirming with GitHub'), 'Done still works');
    await b.tick();
    await b.visibility('hidden');
    await b.visibility('visible');
  } finally {
    b.restore();
  }
  // Storage that starts throwing in the window: the control goes, the targets' sheet says so.
  const later = memStore();
  const c = await vt2Open(everyKind({ portfolio: false }), { store: later });
  try {
    await openSheet(c, KEYS.pr);
    assert.ok(dnmLine(c));
    later.throws = true;
    await c.tick();
    await c.go('#/waiting');
    await openSheet(c, KEYS.pr);
    assert.equal(dnmLine(c), null, 'no control once the device keeps nothing');
    assert.ok(sheetOf(c), 'the sheet still opens');
  } finally {
    c.restore();
  }
});

test('J5: the notes are under `desk-metrics-v1` on this device alone — the page keeps no other new key and writes nothing of them elsewhere', async () => {
  const store = memStore();
  const before = await vt2Open(everyKind({ portfolio: false }), { store: memStore() });
  const keysWithout = new Set();
  try {
    for (const k of before.store.m.keys()) keysWithout.add(k);
  } finally {
    before.restore();
  }
  const app = await vt2Open(everyKind({ portfolio: false }), { store });
  try {
    await openSheet(app, KEYS.card);
    await app.tap(dnmButton(app));
    assert.ok(store.m.has(METRICS_KEY));
    assert.deepEqual([...store.m.keys()].filter((k) => !keysWithout.has(k) && k !== METRICS_KEY), [], 'no other key');
    for (const c of app.server.calls) assert.ok(!JSON.stringify(c).includes(METRICS_KEY) && !JSON.stringify(c).includes(notesIn(store).device), 'nothing of them sent');
  } finally {
    app.restore();
  }
});
