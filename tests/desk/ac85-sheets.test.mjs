// ac-test: S-001/AC85 — the question's and the gate's sheets (desk mockup v2, frames 3, 3b and 4;
// stage 4), from made-up records (the "Letters" project, NOT real records, labelled so in
// tests/desk/fixtures/ac85/README.md and tests/desk/fixtures/README.md) and the real question files in
// the fixtures (notify/ac77-real's P-001-next-work.md, trial-view's P-001-design-lab-open.md). The suite
// has no browser: the page is the sandbox's own code under the fake DOM, the fake desk function and the
// scheduler's fake clock; the sizes are read from sandbox.css, as AC42's, AC62's and AC80's tests read
// them, and the stage's pull request carries Chromium captures at 360 × 740 and 414 × 896, light and
// dark, beside frames 3, 3b and 4.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC, FIX, fixture } from './helpers.mjs';
import { loadSandbox, byClass, findAll, linksIn } from './sandbox-helpers.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { WORDS } from '../../src/lib/board.js';
import { questionMark } from '../../src/lib/board.js';
import { parseQuestion } from '../../src/lib/records.js';
import { parseGateCase } from '../../src/lib/j11.js';
import { CANT_SPLIT } from '../../src/lib/sandbox.js';
import { SHEET_WORDS, undoLine, blastLine, splitChoice, whyOpening, gateViews, gateWords, viewRows, gateTitle, standardLine, caseWord, settleWhen, reversibilityRest, defaultLetter } from '../../src/lib/sheets.js';
import { lettersRepo, lettersConfig, NOW, Q, GATE, NEXT_WORK, DESIGN_LAB, RAISED } from './ac85-fixtures.mjs';
import { defaultLabel } from '../../src/lib/records.js';
import { settleAt } from '../../src/lib/home.js';
import { OLD_BLOB_CACHE_KEYS, BLOB_CACHE_KEY, createDesk } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { fakeServer } from './fake-desk.mjs';
import { fakeClock } from './helpers.mjs';

const TZ = 'America/Chicago';
const ac85 = (p) => readFileSync(join(FIX, 'ac85', p), 'utf8');
const CSS = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
const rule = (sel) => {
  const m = CSS.match(new RegExp(`(?:^|\\n)${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`));
  assert.ok(m, `a rule for ${sel}`);
  return m[1];
};

async function openLetters({ repos = null, hash = '#/waiting' } = {}) {
  const app = await loadSandbox({ config: lettersConfig(), repos: repos || { Letters: lettersRepo() }, hash, now: NOW });
  await app.advance(1000);
  await app.advance(POLL_MS);
  return app;
}
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const sheet = (app) => byClass(app.view, 'v2-sheet')[0] || null;
const route = (id) => `#/waiting/card/${encodeURIComponent(id)}`;
async function openSheet(app, id) { await app.go(route(id)); return sheet(app); }
const decodeValue = (href) => decodeURIComponent(/[?&]value=([^&]*)$/.exec(href)[1]);
const btn = (sh, label) => byClass(sh, 'v2-abtn').find((b) => b.tag === 'a' && b.textContent === label);
const fileOf = (app, label) => decodeValue(btn(sheet(app), label).attrs.href);
const box = (app, n = 1) => findAll(sheet(app), (e) => e.tag === 'textarea' && new RegExp(`^words:.*#${n}$`).test(e.dataset.k || ''))[0];
async function type(app, text, n = 1) {
  const ta = box(app, n);
  ta.value = text;
  ta.dispatch('input', { target: ta });
  await app.flush();
}
/** The browser's measure of a three-line box (the fake DOM lays out no text): its content `lines` lines of 15 px at 1.45. */
function clipLines(app, id, lines) {
  const c = keyed(app, `clip:${id}`);
  assert.ok(c, `the clip ${id}`);
  const LINE = 21.75;
  c.clientHeight = Math.round(Math.min(3, lines) * LINE);
  c.scrollHeight = Math.round(lines * LINE);
  return c;
}

const SEND = Q('P-003-send-issue');
const NEXT = Q('P-001-next-work');
const LAB = Q('P-001-design-lab-open');
const MIXED = Q('P-003-mixed');
const NODEF = Q('P-003-no-default');

// The files AC80's buttons open with the box empty, character for character (AC53's lettered form).
const SEND_BLOCK = ['  A. Send now — To all members at once.', '  B. Send to 10 first — Then to the rest tomorrow, if nothing bounces.', '  C. Hold — Until the Launch gate is ruled.'];
const sendFile = (l) => ['Ruling: ' + l, '', 'Question: questions/P-003-send-issue.md', "Milestone: none (made up for AC85's test; NOT a real record)", '',
  'Question, as put: Send the first paid issue to every member?', 'Options, as put:', ...SEND_BLOCK, ''].join('\n');
const NEXT_BLOCK = NEXT_WORK.split('\n').filter((l) => /^ {2}[A-E]\. /.test(l));
const nextFile = (l) => ['Ruling: ' + l, '', 'Question: questions/P-001-next-work.md', 'Milestone: M3A', '',
  'Question, as put: Which piece of later work comes next?', 'Options, as put:', ...NEXT_BLOCK, ''].join('\n');
const LAB_LINES = DESIGN_LAB.split('\n');
const LAB_BLOCK = LAB_LINES.slice(LAB_LINES.indexOf('OPTIONS:') + 1, LAB_LINES.findIndex((l) => l.startsWith('RECOMMENDATION:')));

// ---------------------------------------------------------------------------
// Every sheet (frames 3, 3b and 4)

test('AC85 every sheet: the head in Plex Mono, "<project> · <kind> · <its name or id> · <milestone> · waiting <age>", each part only when its record gives it; its title in --t-sheet; a 44 × 44 px close', async () => {
  const app = await openLetters();
  try {
    const heads = [
      [SEND, /^Letters · question · P-003-send-issue · waiting 21 m$/, 'Send the first paid issue to every member?'], // its Milestone line is `none (…)`: no milestone part
      [NEXT, /^Letters · question · P-001-next-work · M3A · waiting 2 h 54 m$/, 'Which piece of later work comes next?'],
      [LAB, /^Letters · question · P-001-design-lab-open · waiting 5 h 1 m$/, "eleven short questions on the desk's screens"], // the old form: no Milestone line
      [GATE, /^Letters · gate · P-003 · waiting 3 h 1 m$/, null],
    ];
    for (const [id, meta, title] of heads) {
      const sh = await openSheet(app, id);
      assert.ok(sh, id);
      assert.equal(byClass(sh, 'v2-grab').length, 1, 'its grab handle');
      const head = byClass(sh, 'v2-shead')[0];
      const m = byClass(head, 'v2-mono')[0];
      assert.match(m.textContent, meta, id);
      if (title) assert.equal(byClass(head, 'v2-stitle')[0].textContent, title);
      const close = byClass(head, 'v2-x44')[0];
      assert.equal(close.attrs['aria-label'], 'Close');
      assert.equal(byClass(app.view, 'v2-scrim').length, 1, 'over a dimmed screen');
    }
    assert.match(rule('.v2-x44'), /width: 44px; height: 44px;/);
    assert.match(rule('.v2-stitle'), /font: var\(--t-sheet\)/);
    assert.match(CSS, /--t-sheet: 600 18px\/1\.3 var\(--font\);/);
    assert.match(rule('.v2-mono'), /font: var\(--t-mono\)/);
    assert.match(CSS, /--mono: "IBM Plex Mono"/);
    assert.match(rule('.v2-sheet'), /max-height: calc\(100% - 56px\); overflow-y: auto;/, 'a sheet taller than the screen scrolls inside itself (AC55\'s rule)');
  } finally {
    app.restore();
  }
});

test('AC85 every sheet: it closes on the close, a tap outside it or Escape, focus going back to the card', async () => {
  const app = await openLetters();
  try {
    for (const id of [SEND, GATE]) {
      for (const how of ['control', 'outside', 'escape']) {
        await app.go('#/waiting');
        const link = keyed(app, `cardlink:${id}`);
        assert.ok(link, `the card ${id}`);
        await app.tap(link);
        await app.go(link.attrs.href);
        assert.ok(sheet(app), `${id}: open`);
        if (how === 'control') await app.tap(byClass(sheet(app), 'v2-x44')[0]);
        else if (how === 'outside') await app.tap(byClass(app.view, 'v2-scrim')[0]);
        else await app.key('Escape');
        await app.flush();
        assert.equal(sheet(app), null, `${id}: closed by ${how}`);
        assert.equal(app.loc.hash, '#/waiting');
        assert.equal(document.activeElement, keyed(app, `cardlink:${id}`), `${id}: focus back on the card (${how})`);
      }
    }
    // Frame 3 draws no "Close" button at the foot: the visible close is the 44 px control at the top.
    await openSheet(app, SEND);
    assert.equal(keyed(app, 'sheet-close2'), null);
    await openSheet(app, GATE);
    assert.equal(keyed(app, 'sheet-close2'), null);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// A question's sheet (frames 3 and 3b)

test('AC85 a question\'s opening: the first paragraph of its WHY in --t-lead, whole while it fits three lines (no fade, no control); past them, faded at the cut with the whole one tap away, kept open through a refresh', async () => {
  const app = await openLetters();
  try {
    const sh = await openSheet(app, NEXT);
    const why = parseQuestion(NEXT_WORK, 'P-001-next-work').why;
    let c = keyed(app, `clip:why:${NEXT}`);
    assert.equal(c.textContent, why, 'its whole text, word for word');
    assert.match(c.className, /\bv2-lead\b/);
    assert.doesNotMatch(c.className, /\bover\b/, 'not measured yet: shown as it fits');
    assert.equal(keyed(app, `clipbtn:why:${NEXT}`), null);
    // Three lines or fewer: whole, no fade, no control.
    clipLines(app, `why:${NEXT}`, 3);
    await app.resize(360);
    assert.doesNotMatch(keyed(app, `clip:why:${NEXT}`).className, /\bover\b/);
    assert.equal(keyed(app, `clipbtn:why:${NEXT}`), null);
    // Past three: faded, with "Read it all".
    clipLines(app, `why:${NEXT}`, 5);
    await app.resize(360);
    c = keyed(app, `clip:why:${NEXT}`);
    assert.match(c.className, /\bover\b/, 'faded at the cut');
    const more = keyed(app, `clipbtn:why:${NEXT}`);
    assert.equal(more.textContent, SHEET_WORDS.readAll);
    assert.equal(more.attrs['aria-expanded'], 'false');
    await app.tap(more);
    c = keyed(app, `clip:why:${NEXT}`);
    assert.match(c.className, /\bopen\b/);
    assert.doesNotMatch(c.className, /\bover\b/);
    assert.equal(c.textContent, why, 'the whole, one tap away');
    assert.equal(keyed(app, `clipbtn:why:${NEXT}`).attrs['aria-expanded'], 'true');
    assert.equal(keyed(app, `clipbtn:why:${NEXT}`).textContent, SHEET_WORDS.readLess);
    await app.advance(POLL_MS);
    assert.match(keyed(app, `clip:why:${NEXT}`).className, /\bopen\b/, 'kept open through a refresh');
    assert.ok(sh);
    // The look: three lines at most in the lead's role, faded at the cut, whole once opened.
    assert.match(rule('.v2-clip'), /max-height: calc\(3 \* 1\.45em\)/);
    assert.match(rule('.v2-clip'), /overflow: hidden/);
    assert.match(rule('.v2-clip.v2-lead'), /font: var\(--t-lead\)/);
    assert.match(CSS, /--t-lead: 400 15px\/1\.45 var\(--font\);/);
    assert.match(rule('.v2-clip.over'), /mask-image: linear-gradient\(#000 60%, transparent\)/);
    assert.match(rule('.v2-clip.open'), /max-height: none/);
  } finally {
    app.restore();
  }
  assert.equal(whyOpening({ why: 'One.\n\nTwo.' }), 'One.', 'the first paragraph');
  assert.equal(whyOpening({ why: null }), 'not given', "AC12's words for a file with no WHY");
});

test('AC85 whether it can be undone, or settles itself: the lock and "Can\'t be undone. …", the clock and "Settles itself as <letter> on <when> if left …", AC12\'s "not given" words otherwise, and the eye with the blast radius and risk; on its card, the lock or clock line', async () => {
  const app = await openLetters();
  try {
    const forms = [
      [SEND, 'lock', "Can't be undone.", " An email can't be unsent. Never settles itself: it waits for you (per the question file).", "Blast radius: every member's inbox · risk R2"],
      [NEXT, 'clock', 'Settles itself as A', ' on Wed 21 Oct, 13:07 if left (per the question file: 48 hours). Reversible.', 'Blast radius: the order of the coming work only; nothing built changes · risk R0'],
      [NODEF, null, null, 'Reversibility: reversible · Default: not given', "Blast radius: the digest's day only · risk R0"],
      // Its DEFAULT names no letter, so it is quoted as the file writes it (stage 4's build review, round 1, B1).
      [LAB, null, null, 'Reversibility: reversible · Default: per the question file: DEFAULT none — these are yours and never default',
        'Blast radius: the desk\'s screens and, for 5, 6 and 10, a later operating-model change you approve separately · risk R0'],
    ];
    for (const [id, icon, bold, rest, eye] of forms) {
      const sh = await openSheet(app, id);
      const marks = byClass(sh, 'v2-marks')[0];
      const [undo, blast] = byClass(marks, 'v2-mark');
      assert.equal(undo.textContent, `${bold || ''}${rest}`, id);
      if (bold) assert.equal(findAll(undo, (e) => e.tag === 'b')[0].textContent, bold, `${id}: its words in bold`);
      const svg = findAll(undo, (e) => e.tag === 'svg')[0];
      assert.equal(svg ? /vi-(\w+)/.exec(svg.className || svg.attrs.class)[1] : null, icon, `${id}: told apart by its icon, never colour alone`);
      assert.equal(blast.textContent, eye);
      assert.ok(findAll(blast, (e) => e.tag === 'svg' && /vi-eye/.test(e.attrs.class)).length, 'the eye');
    }
    // On the board, the card's lock or clock line, and nothing for a question that settles nothing.
    await app.go('#/waiting');
    const mk = (id) => { const c = findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === id)[0]; const m = byClass(c, 'v2-mk')[0]; return m ? m.textContent : null; };
    assert.equal(mk(SEND), "Can't be undone");
    assert.equal(mk(NEXT), 'Settles as A · Wed 13:07');
    assert.equal(mk(NODEF), null, 'no default: nothing settles');
    assert.equal(mk(LAB), null, '"DEFAULT: none" and "TIMEOUT: none": nothing settles, so the card implies none (AC12)');
    assert.equal(mk(MIXED), 'Settles as A · Tue 14:59');
  } finally {
    app.restore();
  }
});

test('AC85 the undo and settle forms, pure: the rest of the REVERSIBILITY line, the time in the owner\'s zone, no raised time, a DEFAULT naming no letter', () => {
  const q = (o) => ({ reversibility: null, default: null, timeout: null, riskClass: null, blastRadius: null, ...o });
  assert.deepEqual(undoLine(q({ reversibility: 'irreversible' }), null, TZ), { kind: 'irreversible', icon: 'lock', bold: "Can't be undone.", text: ' Never settles itself: it waits for you (per the question file).' });
  assert.equal(undoLine(q({ reversibility: 'irreversible (R3)' }), null, TZ).text, ' (R3). Never settles itself: it waits for you (per the question file).');
  assert.equal(reversibilityRest('irreversible — a sent email stays sent.'), 'A sent email stays sent.');
  assert.equal(reversibilityRest('irreversible'), '');
  const raised = Date.parse('2026-10-19T18:37:00Z');
  assert.deepEqual(undoLine(q({ reversibility: 'reversible', default: 'C', timeout: '48' }), raised, TZ),
    { kind: 'settles', icon: 'clock', bold: 'Settles itself as C', text: ' on Wed 21 Oct, 13:37 if left (per the question file: 48 hours). Reversible.' }, "frame 3b's own words");
  assert.equal(undoLine(q({ reversibility: 'reversible', default: 'B', timeout: '1' }), raised, TZ).text, ' on Mon 19 Oct, 14:37 if left (per the question file: 1 hour). Reversible.');
  assert.equal(undoLine(q({ reversibility: 'reversible', default: 'C', timeout: '48' }), null, TZ).text,
    ' 48 hours after it was raised, if left (per the question file: 48 hours; its raised time not recorded). Reversible.');
  assert.equal(undoLine(q({ reversibility: 'reversible', default: 'none', timeout: '48' }), raised, TZ).kind, 'other', 'a DEFAULT naming no letter settles nothing');
  assert.equal(undoLine(q({ reversibility: 'reversible', default: 'C', timeout: 'none' }), raised, TZ).text, 'Reversibility: reversible · Default: per the question file: defaults to C (TIMEOUT not given)');
  assert.equal(undoLine(q({}), raised, TZ).text, 'Reversibility: not given · Default: not given');
  assert.equal(blastLine(q({})), 'Blast radius: not given · risk not given');
  assert.equal(settleWhen(Date.parse('2026-12-31T23:30:00Z'), TZ), 'Thu 31 Dec, 17:30');
  assert.equal(defaultLetter({ default: 'C — the board only' }), 'C');
  assert.equal(defaultLetter({ default: 'none — these are yours' }), null);
  // The card agrees with the sheet (board.js's questionMark).
  assert.equal(questionMark(q({ reversibility: 'reversible', default: 'none — never', timeout: 'none' }), raised, TZ), null);
  // A DEFAULT naming no letter with a TIMEOUT in hours (round 1, N1): no clock, never "Settles as null".
  assert.equal(questionMark(q({ reversibility: 'reversible', default: 'none', timeout: '48' }), raised, TZ), null);
  assert.equal(questionMark(q({ reversibility: 'reversible', default: 'none — this is your pick and never defaults (AC43)', timeout: '48' }), raised, TZ), null);
  assert.equal(questionMark(q({ reversibility: 'reversible', default: 'C', timeout: 'none' }), raised, TZ), null);
  assert.deepEqual(questionMark(q({ reversibility: 'reversible', default: 'C', timeout: '48' }), raised, TZ), { icon: 'clock', words: 'Settles as C · Wed 13:37' });
  assert.deepEqual(questionMark(q({ reversibility: 'reversible', default: 'C', timeout: '48' }), null, TZ), { icon: 'clock', words: 'Settles as C' });
  assert.deepEqual(questionMark(q({ reversibility: 'irreversible' }), null, TZ), { icon: 'lock', words: "Can't be undone" });
});

test('AC85 one box per option: "<letter>. <its words>" with the description under it, "Recommended" on the recommended one only, never picked or set apart by colour alone, and its own "Answer <letter> ↗" opening AC80\'s file, exactly, with the box empty', async () => {
  const app = await openLetters();
  try {
    for (const [id, letters, rec, file] of [[SEND, ['A', 'B', 'C'], 'B', sendFile], [NEXT, ['A', 'B', 'C', 'D', 'E'], 'A', nextFile]]) {
      const sh = await openSheet(app, id);
      const opts = byClass(sh, 'v2-opt');
      assert.equal(opts.length, letters.length, 'one box per option');
      const text = id === SEND ? ac85('questions/P-003-send-issue.md') : NEXT_WORK;
      const lines = text.split('\n').filter((l) => /^ {2}[A-Z]\. /.test(l));
      opts.forEach((o, i) => {
        const [w, d] = lines[i].slice(2 + 3).split(' — ');
        assert.equal(byClass(o, 'v2-ol')[0].textContent, `${letters[i]}. ${w}`);
        assert.equal(byClass(byClass(o, 'v2-ol')[0], 'v2-letter')[0].textContent, `${letters[i]}.`, 'the letter its own element');
        assert.equal(byClass(o, 'v2-od')[0].textContent, d, 'the description under it');
        const buttons = byClass(o, 'v2-abtn');
        assert.equal(buttons.length, 1, 'its own button');
        assert.equal(buttons[0].textContent, `Answer ${letters[i]} ↗`);
        assert.equal(buttons[0].className, 'v2-abtn', 'no button set apart');
        assert.equal(decodeValue(buttons[0].attrs.href), file(letters[i]), `${letters[i]}: AC80's file, character for character`);
        assert.match(buttons[0].attrs.href, new RegExp(`^https://github\\.com/shumpmaster/Letters/new/main\\?filename=decisions%2Fquestions%2F${id.split('/').pop().replace('.md', '')}\\.md&value=`));
        assert.equal(buttons[0].attrs.target, '_blank');
      });
      assert.deepEqual(opts.map((o) => byClass(o, 'v2-rec').map((r) => r.textContent)), letters.map((l) => (l === rec ? ['Recommended'] : [])), '"Recommended" on one only');
      assert.equal(findAll(sh, (e) => e.attrs['aria-checked'] === 'true' || e.attrs['aria-pressed'] === 'true' || e.attrs['aria-selected'] === 'true').length, 0, 'none picked');
      assert.ok(opts.every((o) => o.className === 'v2-opt'), 'every box alike');
    }
    // The look (P-001-answer-choice-spacing.md): room inside each box and between them; the label in words, not colour.
    assert.match(rule('.v2-opts'), /gap: 8px/);
    assert.match(rule('.v2-opt'), /padding: 10px 12px; border: 1px solid var\(--line\); border-radius: 12px;/);
    assert.match(rule('.v2-rec'), /background: var\(--chip\)/);
  } finally {
    app.restore();
  }
  assert.deepEqual(splitChoice('Send now — To all members at once.'), { words: 'Send now', desc: 'To all members at once.' });
  assert.deepEqual(splitChoice('Yes.'), { words: 'Yes.', desc: null });
  assert.deepEqual(splitChoice('A — b — c'), { words: 'A', desc: 'b — c' });
});

test('AC85 the owner\'s own words: "Your own words, if you want them in the answer", a 16 px box, empty with "Optional"; its text in every button\'s file after a blank line, character for character, kept through a refresh; empty again, each file exactly AC80\'s', async () => {
  const app = await openLetters();
  try {
    const sh = await openSheet(app, SEND);
    const field = byClass(sh, 'v2-field')[0];
    assert.equal(byClass(field, 'v2-label')[0].textContent, 'Your own words, if you want them in the answer');
    const ta = box(app);
    assert.equal(ta.value, '', 'empty by default');
    assert.equal(ta.attrs.placeholder, 'Optional');
    assert.equal(ta.className, 'v2-input');
    for (const l of ['A', 'B', 'C']) assert.equal(fileOf(app, `Answer ${l} ↗`), sendFile(l));
    const words = 'Please send the first ten from the test list.\nThen tell me.';
    await type(app, words);
    for (const l of ['A', 'B', 'C']) assert.equal(fileOf(app, `Answer ${l} ↗`), `${sendFile(l)}\n${words}\n`, `${l}: the words after a blank line`);
    // Kept through a refresh (AC56).
    await app.advance(POLL_MS);
    assert.equal(box(app).value, words);
    assert.equal(fileOf(app, 'Answer B ↗'), `${sendFile('B')}\n${words}\n`);
    // Closed and opened again in this window, still there.
    await app.go('#/waiting');
    await openSheet(app, SEND);
    assert.equal(box(app).value, words);
    await type(app, '');
    for (const l of ['A', 'B', 'C']) assert.equal(fileOf(app, `Answer ${l} ↗`), sendFile(l), 'emptied: exactly AC80\'s file again');
    // 16 px, so the phone never zooms (AC63; P-001-text-box-size.md).
    assert.match(rule('.v2-input'), /font: var\(--t-input\)/);
    assert.match(CSS, /--t-input: 400 16px\/1\.4 var\(--font\);/);
  } finally {
    app.restore();
  }
});

test('AC85 a numbered question: each number its own box, with its recommendation and a text box (P-001-sheet-boxes.md, A), and one "Answer ↗" opening AC53\'s numbered file', async () => {
  const app = await openLetters();
  try {
    const sh = await openSheet(app, LAB);
    const opts = byClass(sh, 'v2-opt');
    assert.equal(opts.length, 11, 'one box per question');
    opts.forEach((o, i) => {
      assert.match(byClass(o, 'v2-ol')[0].textContent, new RegExp(`^${i + 1}\\. `));
      assert.equal(byClass(o, 'v2-rec').length, 1, 'its own recommendation, labelled');
      assert.equal(findAll(o, (e) => e.tag === 'textarea').length, 1, 'its own box');
    });
    assert.equal(byClass(opts[0], 'v2-od')[0].textContent, 'Recommended leave deferred');
    assert.equal(byClass(opts[10], 'v2-od')[0].textContent, 'Recommended yes, Active');
    assert.equal(byClass(sh, 'v2-abtn').filter((b) => b.tag === 'a').length, 1, 'one button');
    const empty = ['Ruling: ', '', 'Question: questions/P-001-design-lab-open.md', '', 'Questions, as put:', ...LAB_BLOCK, ''].join('\n');
    assert.equal(fileOf(app, 'Answer ↗'), empty, 'with every box empty, AC53\'s numbered form, `Ruling: ` to complete');
    await type(app, 'leave deferred', 1);
    await type(app, 'agree;\nas drawn', 3);
    assert.equal(fileOf(app, 'Answer ↗'), ['Ruling: 1 leave deferred; 3 agree, as drawn', '', 'Question: questions/P-001-design-lab-open.md', '', 'Questions, as put:', ...LAB_BLOCK, ''].join('\n'),
      'each answer with its number, a blank number left out, a line break and "; " joined');
    assert.match(rule('.v2-opt.num'), /grid-template-columns: minmax\(0, 1fr\)/, 'the question over its box, at the box\'s full width');
  } finally {
    app.restore();
  }
});

test('AC85 a question that can\'t be split keeps AC53\'s one box and AC80\'s one button: the line saying so, the file whole, one text box, "Answer ↗"', async () => {
  const app = await openLetters();
  try {
    const sh = await openSheet(app, MIXED);
    assert.equal(keyed(app, 'cant-split').textContent, `${CANT_SPLIT} (its lettered and numbered lines are mixed).`);
    assert.ok(keyed(app, 'fallback-text').innerHTML.includes('A numbered line among lettered ones'), 'the file shown whole');
    assert.equal(findAll(sh, (e) => e.tag === 'textarea').length, 1);
    assert.deepEqual(byClass(sh, 'v2-abtn').filter((b) => b.tag === 'a').map((b) => b.textContent), ['Answer ↗']);
    assert.equal(fileOf(app, 'Answer ↗'), 'Ruling: \n\nQuestion: questions/P-003-mixed.md\n');
    await type(app, 'A, as recommended.');
    assert.equal(fileOf(app, 'Answer ↗'), 'Ruling: \n\nQuestion: questions/P-003-mixed.md\n\nA, as recommended.\n');
    assert.ok(linksIn(sh).some((l) => l.href === 'https://github.com/shumpmaster/Letters/blob/main/questions/P-003-mixed.md'), 'its link');
  } finally {
    app.restore();
  }
});

test('AC85 "✓ Move to Done · then answer on GitHub" marks the card as AC80\'s "Done ✓" does: it heads Done, confirming, and leaves the count; its sheet then offers "Undo"', async () => {
  const app = await openLetters();
  try {
    for (const id of [NEXT, GATE]) {
      await openSheet(app, id);
      const b = keyed(app, 'sheet-done');
      assert.equal(b.tag, 'button');
      // Its accessible name reads its two parts apart (the rulebook's part A, item 19; design review round 1, N3).
      assert.equal(b.textContent, 'Move to Done · then answer on GitHub');
      assert.equal(byClass(b, 'sb-vh')[0].textContent, ' · ', 'the separator, for a screen reader only');
      assert.equal(byClass(b, 'v2-sv')[0].textContent, ' · then answer on GitHub');
      assert.ok(findAll(b, (e) => e.tag === 'svg' && /vi-done/.test(e.attrs.class)).length, 'the ✓, as an icon');
      await app.tap(b);
      assert.equal(app.loc.hash, '#/waiting', 'the sheet closes on the mark');
      const done = byClass(keyed(app, 'lane:done'), 'v2-card conf').map((c) => byClass(c, 'v2-kd')[0].textContent);
      assert.ok(done.includes(WORDS.confirming), 'it heads Done, confirming with GitHub');
      await openSheet(app, id);
      assert.equal(keyed(app, 'sheet-done'), null);
      assert.equal(keyed(app, 'sheet-undo').textContent, 'Undo');
      assert.equal(keyed(app, 'sheet-state').textContent, WORDS.confirming);
    }
    await app.go('#/waiting');
    assert.equal(byClass(keyed(app, 'lane:wait'), 'v2-lc')[0].textContent, '4', 'both left the count at once');
    // The gate's Done card keeps its step while it is confirming (P-001-board-done-button.md, A): its four buttons, and "Undo".
    const conf = byClass(keyed(app, 'lane:done'), 'v2-card conf').find((c) => c.textContent.includes('The Launch gate'));
    assert.deepEqual(byClass(conf, 'v2-step').map((b) => b.textContent), ['Proceed', 'Hold', 'Recycle', 'Kill']);
    assert.equal(decodeValue(byClass(conf, 'v2-step')[1].attrs.href), 'Decision: hold\n\nReason: \n');
    assert.equal(byClass(conf, 'v2-undo')[0].textContent, 'Undo');
    await openSheet(app, NEXT);
    await app.tap(keyed(app, 'sheet-undo'));
    await app.go('#/waiting');
    assert.equal(byClass(keyed(app, 'lane:wait'), 'v2-lc')[0].textContent, '5', '"Undo" returns it');
    assert.match(rule('.v2-sitem'), /min-height: 44px/);
  } finally {
    app.restore();
  }
});

test('AC85 "▸ The whole question · and the file each answer writes": a fold holding the question file rendered whole (AC12) and each button\'s path and text, the text exactly what its link carries; kept open through a refresh', async () => {
  const app = await openLetters();
  try {
    await openSheet(app, SEND);
    const fold = keyed(app, `fold:whole:${SEND}`);
    assert.equal(fold.textContent, 'The whole question · and the file each answer writes');
    assert.equal(fold.attrs['aria-expanded'], 'false');
    assert.equal(keyed(app, `wholebody:${SEND}`), null, 'folded');
    await app.tap(fold);
    assert.equal(keyed(app, `fold:whole:${SEND}`).attrs['aria-expanded'], 'true');
    const body = keyed(app, `wholebody:${SEND}`);
    const rec = keyed(app, 'whole-record');
    assert.ok(rec.innerHTML.includes('Send the first paid issue to every member?'), 'the file rendered whole: its title');
    assert.ok(/every member(&#39;|&#x27;|')s inbox/.test(rec.innerHTML), 'its fields');
    assert.ok(rec.innerHTML.includes('NOT a real record: made up for AC85'), 'to its Context');
    const words = 'Please send the first ten.';
    await type(app, words);
    const items = findAll(keyed(app, 'whole-files'), (e) => e.tag === 'li');
    assert.equal(items.length, 3, 'each button');
    for (const [i, l] of ['A', 'B', 'C'].entries()) {
      const li = items[i];
      assert.equal(byClass(li, 'v2-small')[0].textContent, `Answer ${l} ↗ writes decisions/questions/P-003-send-issue.md at main`);
      assert.equal(findAll(li, (e) => e.tag === 'pre')[0].textContent, fileOf(app, `Answer ${l} ↗`), `${l}: what a tap commits`);
      assert.equal(findAll(li, (e) => e.tag === 'pre')[0].textContent, `${sendFile(l)}\n${words}\n`);
    }
    await app.advance(POLL_MS);
    assert.ok(keyed(app, `wholebody:${SEND}`), 'kept open through a refresh');
    assert.ok(body);
    assert.match(rule('.v2-pre'), /white-space: pre-wrap; overflow-wrap: anywhere;/, 'never sideways (AC12)');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// A gate's sheet (frame 4; P-001-gate-card.md, A)

test('AC85 a gate\'s sheet: "<Phase> gate: <the card\'s question>"; "The case opens", quoted, three lines at most, the whole case one tap away; "Their views"; the phase\'s standard milestones; the four choices, each with what follows, "Recommended" on the case\'s recommendation, "Can\'t be undone" on Kill only; "Your reason"', async () => {
  const app = await openLetters();
  try {
    const sh = await openSheet(app, GATE);
    assert.equal(byClass(sh, 'v2-stitle')[0].textContent,
      'Launch gate: The launch review passed. The case for going live and graduating the product, with its own monitoring and feedback confirmed running, is in the gate document. Proceed, hold, recycle or kill?');
    const heads = byClass(sh, 'v2-bh').map((x) => x.textContent);
    assert.deepEqual(heads.slice(0, 2), ['The case opens', 'Their views']);
    const opening = parseGateCase(ac85('docs/gates/P-003/launch-gate-1-case.md')).opening;
    const quote = keyed(app, `clip:case:${GATE}`);
    assert.equal(quote.textContent, opening, 'the case\'s plain-English opening, quoted whole in its box');
    assert.match(quote.className, /\bv2-quote\b/);
    clipLines(app, `case:${GATE}`, 6);
    await app.resize(360);
    assert.match(keyed(app, `clip:case:${GATE}`).className, /\bover\b/, 'three lines at most, faded');
    assert.equal(keyed(app, `clipbtn:case:${GATE}`), null, 'the whole case is its link');
    const whole = linksIn(sheet(app)).find((l) => l.text === 'Read the whole case ↗');
    assert.equal(whole.href, 'https://github.com/shumpmaster/Letters/blob/main/docs/gates/P-003/launch-gate-1-case.md');
    // Their views: the Critic's verdict word and its line, the user representative's, from the card's record.
    assert.deepEqual(byClass(sheet(app), 'v2-vw').map((x) => x.textContent), ['Critic', 'User representative']);
    assert.deepEqual(byClass(sheet(app), 'v2-vt').map((x) => x.textContent), [
      'recycle into Design — the handover package names no on-call hours, and the sign-up asks for a card before a sample letter.',
      'reject — "I\'d leave at the card form. Show me a letter first."']);
    assert.equal(keyed(app, 'std-line').textContent, "Launch's standard milestones: 3 taken on, 1 skipped");
    // The four choices.
    const opts = byClass(sheet(app), 'v2-opt');
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-ol')[0].textContent), ['Proceed', 'Hold', 'Recycle', 'Kill']);
    // What follows, in the card's own words, its `code` drawn as code (design review round 1, N4c; the rulebook's item 19).
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-od')[0].textContent), [
      'the Launch gate is passed: the product goes live and graduates (done), as approve does.',
      'not yet: nothing moves; the Chief of Staff updates the case under the next number, the Critic reads it again, and a fresh card follows (needs a Reason: line).',
      'back into an earlier phase as its next iteration (Into: <Phase> and a Reason: line); rounds reset.',
      'the project is closed (kill). A Proxy: line is refused on this word.'], 'what follows, in the card\'s own words');
    assert.deepEqual(opts.map((o) => findAll(byClass(o, 'v2-od')[0], (e) => e.tag === 'code').map((c) => c.textContent)),
      [['approve'], ['Reason:'], ['Into: <Phase>', 'Reason:'], ['Proxy:']], 'each `…` a code element, its words as text');
    assert.ok(!opts.some((o) => byClass(o, 'v2-od')[0].textContent.includes('`')), 'no raw backtick');
    assert.match(rule('.v2-code'), /font-family: var\(--mono\)/);
    // The foot's "Why it is here", the card's section 2, the same way.
    assert.equal(keyed(app, 'foot-why').textContent, "Why it is here: Route launch-gate of governance/ROUTING.toml (model S-012) sends this card to the owner. NOT a real record: made up for AC85's test.");
    assert.deepEqual(findAll(keyed(app, 'foot-why'), (e) => e.tag === 'code').map((c) => c.textContent), ['launch-gate']);
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-rec').length), [1, 0, 0, 0], '"Recommended" on the case\'s recommendation (proceed), never the Critic\'s (recycle)');
    assert.deepEqual(opts.map((o) => (keyed(app, 'kill-lock') && o.contains(keyed(app, 'kill-lock')) ? keyed(app, 'kill-lock').textContent : null)), [null, null, null, "Can't be undone"]);
    assert.ok(findAll(keyed(app, 'kill-lock'), (e) => e.tag === 'svg' && /vi-lock/.test(e.attrs.class)).length, 'with the lock');
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-abtn')[0].textContent), ['Proceed ↗', 'Hold ↗', 'Recycle ↗', 'Kill ↗']);
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-abtn')[0].className), ['v2-abtn', 'v2-abtn', 'v2-abtn', 'v2-abtn danger']);
    assert.equal(findAll(sheet(app), (e) => e.attrs['aria-checked'] === 'true' || e.attrs['aria-pressed'] === 'true').length, 0, 'none picked');
    // "Your reason".
    const field = byClass(sheet(app), 'v2-field')[0];
    assert.equal(byClass(field, 'v2-label')[0].textContent, 'Your reason (the answer file asks for one on Hold and Recycle)');
    assert.equal(box(app).attrs.placeholder, 'Optional for Proceed and Kill');
    assert.match(rule('.v2-abtn.danger'), /box-shadow: inset 0 0 0 1px var\(--line2\); background: var\(--bg\);/);
    // The whole card one tap away: the card rendered whole and each button's file.
    await app.tap(keyed(app, `fold:whole:${GATE}`));
    assert.ok(/The Critic(&#39;|&#x27;|')s recommendation/.test(keyed(app, 'whole-record').innerHTML), 'the card rendered whole');
    assert.deepEqual(findAll(keyed(app, 'whole-files'), (e) => e.tag === 'li').map((li) => byClass(li, 'v2-small')[0].textContent),
      ['Proceed ↗', 'Hold ↗', 'Recycle ↗', 'Kill ↗'].map((l) => `${l} writes decisions/P-003/launch-1.md at main`));
  } finally {
    app.restore();
  }
});

test('AC85 the gate\'s reason: with the box empty, each file is AC80\'s; its text fills `Reason: ` for Hold and Recycle (decisions/README.md:13) and follows a blank line for Proceed and Kill (AC53\'s placement, each line indented), character for character; Recycle\'s `Into: ` left to complete', async () => {
  const app = await openLetters();
  try {
    await openSheet(app, GATE);
    const want0 = { 'Proceed ↗': 'Decision: proceed\n\n', 'Hold ↗': 'Decision: hold\n\nReason: \n', 'Recycle ↗': 'Decision: recycle\n\nInto: \nReason: \n', 'Kill ↗': 'Decision: kill\n\n' };
    for (const [l, t] of Object.entries(want0)) {
      assert.equal(fileOf(app, l), t, `${l} with the box empty`);
      assert.match(btn(sheet(app), l).attrs.href, /^https:\/\/github\.com\/shumpmaster\/Letters\/new\/main\?filename=decisions%2FP-003%2Flaunch-1\.md&value=/);
    }
    await type(app, 'The sign-up must show\na sample letter first.');
    const want = {
      'Proceed ↗': 'Decision: proceed\n\n  The sign-up must show\n  a sample letter first.\n',
      'Hold ↗': 'Decision: hold\n\nReason: The sign-up must show a sample letter first.\n',
      'Recycle ↗': 'Decision: recycle\n\nInto: \nReason: The sign-up must show a sample letter first.\n',
      'Kill ↗': 'Decision: kill\n\n  The sign-up must show\n  a sample letter first.\n',
    };
    for (const [l, t] of Object.entries(want)) assert.equal(fileOf(app, l), t, l);
    // The board's four buttons carry the same files (AC80): the box's words with them.
    await app.go('#/waiting');
    const gate = findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === GATE)[0];
    assert.deepEqual(byClass(gate, 'v2-step').map((b) => [b.textContent, decodeValue(b.attrs.href)]), Object.entries(want0).map(([l, t]) => [l.replace(' ↗', ''), t]),
      'the card\'s own buttons: AC80\'s files, the sheet\'s words left in the sheet');
  } finally {
    app.restore();
  }
});

test('AC85 on the board: the gate\'s card shows its four buttons in two rows, with "Critic: <its word>" and "User rep: <its word>" above them, the Critic\'s word read from its record from this stage', async () => {
  const app = await openLetters();
  try {
    const gate = findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === GATE)[0];
    assert.equal(byClass(gate, 'v2-kd')[0].textContent, 'Gate · Launch');
    assert.deepEqual(byClass(gate, 'v2-gl').map((l) => l.textContent), ['Critic: recycle into Design', 'User rep: reject']);
    const kids = gate.children.map((c) => c.className);
    assert.ok(kids.indexOf('v2-gatebtns') > kids.lastIndexOf('v2-gl'), 'the two lines above the buttons');
    assert.deepEqual(byClass(byClass(gate, 'v2-gatebtns')[0], 'v2-step').map((b) => b.textContent), ['Proceed', 'Hold', 'Recycle', 'Kill']);
    assert.match(rule('.v2-gatebtns'), /grid-template-columns: 1fr 1fr;/, 'two rows of two');
  } finally {
    app.restore();
  }
});

test('AC85 their views where the records differ: "not recorded" where no record gives the Critic\'s or the representative\'s line; nothing for the user representative where the owner is the user; "did not run"; no case file: no link and no "Recommended"', async () => {
  const card = ac85('queue/P-003-launch-1.md');
  const variants = [
    { what: 'no lines recorded', card: card.replace(/^The Critic: .*$/m, "The Critic: (the Critic's line is not recorded)").replace(/^The user representative \(a simulation.*$/m, "The user representative (a simulation, not real users): (the representative's line is not recorded)"),
      rows: [['Critic', 'not recorded'], ['User representative', 'not recorded']], lines: ['Critic: not recorded', 'User rep: not recorded'] },
    { what: 'the owner is the user', card: card.replace(/^The user representative \(a simulation.*$/m, 'The user representative: not needed. The brief records that the owner is the user (docs/PROJECT.md, section 9).'),
      doc: true, rows: [['Critic', 'recycle into Design — the handover package names no on-call hours, and the sign-up asks for a card before a sample letter.']], lines: ['Critic: recycle into Design', 'User rep: not needed'] },
    { what: 'did not run', card: card.replace(/^The user representative \(a simulation.*$/m, 'The user representative did not run: no proposal was written for this gate. Answer `hold` to have it run on an updated case and proposal.'),
      rows: [['Critic', 'recycle into Design — the handover package names no on-call hours, and the sign-up asks for a card before a sample letter.'], ['User representative', 'did not run: no proposal was written for this gate']], lines: ['Critic: recycle into Design', 'User rep: did not run'] },
  ];
  for (const v of variants) {
    const extra = v.doc ? { 'docs/PROJECT.md': ac85('docs/PROJECT.md').replace(/Profile: .*\nApproved: .*\n/, 'The owner is the user.\n') } : {};
    const app = await openLetters({ repos: { Letters: lettersRepo({ gateCard: v.card, extra }) } });
    try {
      const gate = findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === GATE)[0];
      assert.deepEqual(byClass(gate, 'v2-gl').map((l) => l.textContent), v.lines, v.what);
      const sh = await openSheet(app, GATE);
      const vw = byClass(sh, 'v2-vw').map((x) => x.textContent);
      const vt = byClass(sh, 'v2-vt').map((x) => x.textContent);
      assert.deepEqual(vw.map((w, i) => [w, vt[i]]), v.rows, v.what);
    } finally {
      app.restore();
    }
  }
  // No case file: "The case: no file recorded", no link, and no "Recommended" (the card's section 5 quotes only the views).
  const app = await openLetters({ repos: { Letters: lettersRepo({ withCase: false }) } });
  try {
    const sh = await openSheet(app, GATE);
    assert.ok(!linksIn(sh).some((l) => l.text === 'Read the whole case ↗'));
    assert.match(sh.textContent, /The case: no file recorded/);
    assert.equal(keyed(app, `clip:case:${GATE}`).textContent, 'not recorded: no case file');
    assert.deepEqual(byClass(sh, 'v2-opt').map((o) => byClass(o, 'v2-rec').length), [0, 0, 0, 0], 'never the Critic\'s word as the recommendation');
  } finally {
    app.restore();
  }
});

test('AC85 the gate sheet\'s parts, pure: the views a card quotes, the card\'s two words, the title, the standard line and the case\'s recommendation', () => {
  const card = ac85('queue/P-003-launch-1.md');
  assert.deepEqual(gateViews(card), {
    critic: { word: 'recycle into Design', line: 'recycle into Design — the handover package names no on-call hours, and the sign-up asks for a card before a sample letter.' },
    user: { word: 'reject', line: 'reject — "I\'d leave at the card form. Show me a letter first."' } });
  assert.deepEqual(gateViews('## 5. Recommendation\nThe case recommends proceed.\n'), { critic: null, user: null });
  assert.deepEqual(gateWords('', { criticInTree: true }), { critic: 'its view is on GitHub', user: 'not recorded' }, "with no word quoted, stage 1a's words stand");
  assert.deepEqual(gateWords('', { ownerIsUser: true }), { critic: 'not recorded', user: 'not needed' });
  assert.deepEqual(viewRows(card, true).map((r) => r.who), ['Critic'], 'nothing for the representative where the owner is the user');
  assert.equal(gateTitle({ gate: 'criteria', parsed: { text: '## 1. The decision\nThe plan passed review. Pass?\n' } }), 'Build gate: The plan passed review. Pass?');
  assert.equal(gateTitle({ gate: 'dor', parsed: { text: '## 1. The decision\nThe Design gate: the project passed. Proceed?\n' } }), 'Design gate: The project passed. Proceed?', 'the phase said once');
  assert.equal(gateTitle({ gate: 'launch', parsed: null }), 'Launch gate: not recorded');
  assert.equal(standardLine('launch', null), "Launch's standard milestones: not available");
  assert.equal(standardLine('criteria', { standard: {} }), "Build's standard milestones: not recorded yet");
  assert.equal(standardLine('dor', { standard: { 'Design-1': { state: 'taken on' }, 'Design-2': { state: 'skipped' }, 'Build-1': { state: 'taken on' } } }), "Design's standard milestones: 1 taken on, 1 skipped");
  const rec = parseGateCase(ac85('docs/gates/P-003/launch-gate-1-case.md'));
  assert.equal(rec.recommendation, 'proceed');
  assert.equal(caseWord(rec), 'proceed');
  assert.equal(caseWord(parseGateCase('## 1. The ask\nA.\n\n**The proposer\'s recommendation:** recycle into Design — why\n')), 'recycle');
  assert.equal(caseWord(parseGateCase('## 1. The ask\nA.\n')), null);
  assert.equal(parseGateCase(fixture('md-extremes/gate-case.md')).recommendation, 'proceed');
});

test('AC85 a v2.5 project\'s question (AC19\'s copy route, as today, AC53): AC85\'s layout, its copy buttons in their boxes, and the fold showing each text to copy, at no path', async () => {
  const OLDER = { name: 'Older', repo: 'shumpmaster/Older', defaultBranch: 'main', model: 'v2.5', planning: false, webCommitsToDefault: true, contentPrefill: true, contentParam: 'value' };
  const q = '# Ruling needed: A made-up v2.5 question\n\nWHY: NOT a real record: made up for AC85\'s test.\nOPTIONS:\n  A. Keep it — As it is.\n  B. Drop it — Gone.\nRECOMMENDATION: A — keep.\nRISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: none\nDEFAULT: A   TIMEOUT: 24\n';
  const r = (await import('./fake-desk.mjs')).repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), 'questions/N-old.md': q });
  r.history = { 'questions/N-old.md': [{ commit: { committer: { date: new Date(NOW - 30 * 60e3).toISOString().replace(/\.\d+Z$/, 'Z') } } }] };
  const app = await loadSandbox({ config: { ...lettersConfig(), projects: [OLDER] }, repos: { Older: r }, hash: '#/waiting', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const sh = await openSheet(app, 'Older|question|questions/N-old.md');
    assert.ok(sh, 'its sheet');
    assert.equal(keyed(app, 'clip:why:Older|question|questions/N-old.md').textContent, "NOT a real record: made up for AC85's test.");
    assert.match(byClass(byClass(sh, 'v2-marks')[0], 'v2-mark')[0].textContent, /^Settles itself as A on Tue 20 Oct, 15:30 if left \(per the question file: 24 hours\)\. Reversible\.$/);
    assert.deepEqual(byClass(sh, 'v2-opt').map((o) => [byClass(o, 'v2-ol')[0].textContent, byClass(o, 'v2-od')[0].textContent, byClass(o, 'v2-abtn')[0].textContent]),
      [['A. Keep it', 'As it is.', 'Copy answer A'], ['B. Drop it', 'Gone.', 'Copy answer B']]);
    assert.equal(byClass(sh, 'v2-abtn').filter((b) => b.tag === 'a').length, 0, 'no link: text to copy');
    await app.tap(keyed(app, 'fold:whole:Older|question|questions/N-old.md'));
    const items = findAll(keyed(app, 'whole-files'), (e) => e.tag === 'li');
    assert.deepEqual(items.map((li) => byClass(li, 'v2-small')[0].textContent), ['Copy answer A copies this text, for your session', 'Copy answer B copies this text, for your session']);
    assert.match(findAll(items[0], (e) => e.tag === 'pre')[0].textContent, /^Ruling: A\n/);
  } finally {
    app.restore();
  }
});


// ---------------------------------------------------------------------------
// Stage 4's build review, round 1: B1 (a default the file doesn't give), N1 to N3

/** Service-Desk's real questions/P-001-design-pick.md at f8dfd1b: reversible, `DEFAULT: none — this is your pick and never defaults (AC43)`, `TIMEOUT: none`. */
const DESIGN_PICK = fixture('trial-view/P-001-design-pick.md');
const PICK_WORDS = 'per the question file: DEFAULT none — this is your pick and never defaults (AC43)';

test('AC85 + AC12 (round 1, B1): a DEFAULT naming no letter is no default — the sheet quotes it as written, the card shows no clock, Home counts nothing settling; no letter from elsewhere in the field ("AC43"), no raw time', async () => {
  const p = parseQuestion(DESIGN_PICK, 'P-001-design-pick');
  assert.equal(p.default, 'none — this is your pick and never defaults (AC43)', 'the real file\'s field');
  assert.equal(defaultLetter(p), null);
  const app = await openLetters({ repos: { Letters: lettersRepo({ extra: { 'questions/P-001-design-pick.md': DESIGN_PICK } }) } });
  try {
    const card = findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === Q('P-001-design-pick'))[0];
    assert.ok(card, 'its card');
    assert.equal(byClass(card, 'v2-mk').length, 0, 'the card: no lock or clock line');
    const sh = await openSheet(app, Q('P-001-design-pick'));
    const undo = byClass(byClass(sh, 'v2-marks')[0], 'v2-mark')[0];
    assert.equal(undo.textContent, `Reversibility: reversible · Default: ${PICK_WORDS}`, 'the sheet: what the file says, word for word');
    assert.doesNotMatch(sh.textContent, /defaults to|Settles/);
  } finally {
    app.restore();
  }
  // DEFAULT none with a TIMEOUT in hours: still no default, and no time of any kind.
  const none48 = { reversibility: 'reversible', default: 'none', timeout: '48', riskClass: null, blastRadius: null };
  const raised = Date.parse('2026-10-19T18:37:00Z');
  assert.deepEqual(undoLine(none48, raised, TZ), { kind: 'other', icon: null, bold: null, text: 'Reversibility: reversible · Default: per the question file: DEFAULT none' });
  assert.equal(questionMark(none48, raised, TZ), null);
  assert.equal(settleAt(none48, raised), null, "Home's briefing: nothing settles itself");
  assert.equal(settleAt({ ...none48, default: 'C' }, raised), raised + 48 * 3600e3, 'a letter still settles');
  assert.equal(settleAt(p, raised), null);
  // A letter starting the field is still read ("C — …").
  assert.equal(defaultLetter({ default: 'C — the board only' }), 'C');
  assert.equal(defaultLabel({ reversibility: 'reversible', default: 'C — the board only', timeout: '24' }, new Date(raised), (d) => d.toISOString()), 'per the question file: defaults to C at 2026-10-20T18:37:00.000Z');
});

test('AC85 (round 1, N2): the blob cache key is v7, and v6 is among the old keys, so a parse stored under it is dropped from storage', async () => {
  assert.equal(BLOB_CACHE_KEY, 'desk-blobs-v7');
  assert.ok(OLD_BLOB_CACHE_KEYS.includes('desk-blobs-v6'));
  const backing = new Map([['desk-blobs-v6', JSON.stringify({ 'gate-case:0000': { opening: 'an old parse, with no recommendation' } })]]);
  const storage = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, v), removeItem: (k) => backing.delete(k) };
  const clock = fakeClock(NOW);
  const config = lettersConfig();
  const server = fakeServer({ Letters: lettersRepo() }, config, clock);
  const desk = createDesk({ config, call: (pth, b) => server.call(pth, b), clock, store: createStore(storage), pullsStore: createStore(null), isVisible: () => true, j11: true });
  assert.equal(backing.has('desk-blobs-v6'), false, 'the v6 key is dropped, not left to fill storage');
  desk.start();
  await clock.runUntil(clock.now() + 2 * POLL_MS);
  desk.stop();
  const rec = desk.snapshot('Letters').records.get('docs/gates/P-003/launch-gate-1-case.md');
  assert.equal(rec.recommendation, 'proceed', 'the case read and parsed afresh, its recommendation with it');
});

test('AC85 (round 1, N3): a v2.5 question\'s text to copy carries the owner\'s words, after a blank line, in each copy button\'s text and in the fold', async () => {
  const OLDER = { name: 'Older', repo: 'shumpmaster/Older', defaultBranch: 'main', model: 'v2.5', planning: false, webCommitsToDefault: true, contentPrefill: true, contentParam: 'value' };
  const q = '# Ruling needed: A made-up v2.5 question\n\nWHY: NOT a real record: made up for AC85\'s test.\nOPTIONS:\n  A. Keep it — As it is.\n  B. Drop it — Gone.\nRECOMMENDATION: A — keep.\nRISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: none\nDEFAULT: A   TIMEOUT: 24\n';
  const r = (await import('./fake-desk.mjs')).repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), 'questions/N-old.md': q });
  const copied = [];
  const app = await loadSandbox({ config: { ...lettersConfig(), projects: [OLDER] }, repos: { Older: r }, hash: '#/waiting', now: NOW,
    globals: { navigator: { clipboard: { writeText: async (t) => { copied.push(t); } } } } });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const id = 'Older|question|questions/N-old.md';
    await openSheet(app, id);
    const base = (l) => ['Ruling: ' + l, '', 'Question: questions/N-old.md', '', 'Question, as put: A made-up v2.5 question', 'Options, as put:', '  A. Keep it — As it is.', '  B. Drop it — Gone.', ''].join('\n');
    await type(app, 'Keep it for now.\nAsk me again in May.');
    await app.tap(keyed(app, `fold:whole:${id}`));
    const pres = findAll(keyed(app, 'whole-files'), (e) => e.tag === 'pre').map((x) => x.textContent);
    const want = ['A', 'B'].map((l) => `${base(l)}\nKeep it for now.\nAsk me again in May.\n`);
    assert.deepEqual(pres, want, 'the fold: each text with the words, character for character');
    for (const [i, l] of ['A', 'B'].entries()) {
      const b = byClass(sheet(app), 'v2-abtn').find((x) => x.textContent === `Copy answer ${l}`);
      await app.tap(b);
      assert.equal(copied[i], want[i], `Copy answer ${l}: what it copies`);
    }
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Stage 4's design review, round 1: B1 (the record's list numbers), N4a (focus back from the step); the
// Reviewer's round 2, R2-N1 (defaultLetter's anchor)

test('AC85 + AC12 (design review round 1, B1): the whole record keeps its lists — each number as the file writes it, a list starting at 2 included, and its bullets — in the fold and in the one-box fallback', async () => {
  const { renderMarkdown } = await import('../../src/lib/markdown.js');
  // Pure: the file's own numbers with `numbers`; without it, the accepted views' output as it always was (AC43).
  assert.equal(renderMarkdown('  A. x\n  2. y\n  3. z', { numbers: true }), '<p>A. x</p>\n<ol><li value="2">y</li><li value="3">z</li></ol>');
  assert.equal(renderMarkdown('1. a\n1. b\n4. c', { numbers: true }), '<ol><li value="1">a</li><li value="1">b</li><li value="4">c</li></ol>', 'repeated or skipped, as written');
  assert.equal(renderMarkdown('- a\n- b', { numbers: true }), '<ul><li>a</li><li>b</li></ul>');
  assert.equal(renderMarkdown('  A. x\n  2. y'), '<p>A. x</p>\n<ol><li>y</li></ol>', 'the accepted views unchanged');
  const app = await openLetters();
  try {
    // The numbered question's fold: "1." to "11.", each the file's.
    await openSheet(app, LAB);
    await app.tap(keyed(app, `fold:whole:${LAB}`));
    const lab = keyed(app, 'whole-record').innerHTML;
    for (let n = 1; n <= 11; n++) assert.ok(lab.includes(`<li value="${n}">`), `number ${n}`);
    // The file that can't be split, shown whole on the sheet itself: its "2." stays, which is why it can't be split.
    await openSheet(app, MIXED);
    assert.match(keyed(app, 'fallback-text').innerHTML, /A\. The first choice\.<\/p>\n<ol><li value="2">A numbered line among lettered ones\.<\/li><\/ol>/);
    // A question's Context bullets.
    await openSheet(app, SEND);
    await app.tap(keyed(app, `fold:whole:${SEND}`));
    assert.match(keyed(app, 'whole-record').innerHTML, /<ul><li>NOT a real record: made up for AC85/);
  } finally {
    app.restore();
  }
  // The look: inside a sheet the record's lists keep their marks, over the v2 resets.
  assert.match(rule('.v2-sheet .sb-record ol'), /list-style: decimal; padding-left: 1\.6em;/);
  assert.match(rule('.v2-sheet .sb-record ul'), /list-style: disc; padding-left: 1\.2em;/);
  assert.match(CSS, /:where\(\.v2\) :where\(ol, ul\) \{ list-style: none; padding: 0; \}/, 'the reset they outrank, zero-specificity');
});

test('AC85 (design review round 1, N4a): a sheet opened from the card\'s "Answer" step gives the focus back to that step when it closes, by the close, a tap outside or Escape', async () => {
  const app = await openLetters();
  try {
    for (const how of ['control', 'outside', 'escape']) {
      await app.go('#/waiting');
      const step = keyed(app, `step:${NEXT}`);
      assert.equal(step.textContent, 'Answer');
      await app.tap(step);
      await app.go(step.attrs.href);
      assert.ok(sheet(app));
      if (how === 'control') await app.tap(byClass(sheet(app), 'v2-x44')[0]);
      else if (how === 'outside') await app.tap(byClass(app.view, 'v2-scrim')[0]);
      else await app.key('Escape');
      await app.flush();
      assert.equal(sheet(app), null);
      assert.equal(document.activeElement, keyed(app, `step:${NEXT}`), `focus back on the card's step (${how})`);
    }
  } finally {
    app.restore();
  }
});

test('AC12 + AC85 (Reviewer round 2, R2-N1): a default\'s letter must start the field — a capital later in it is no default', () => {
  assert.equal(defaultLetter({ default: 'see option B' }), null);
  assert.equal(defaultLetter({ default: 'none, unlike B' }), null);
  assert.equal(defaultLetter({ default: '  B' }), 'B', 'leading spaces trimmed');
  assert.equal(defaultLabel({ reversibility: 'reversible', default: 'see option B', timeout: '24' }, null), 'per the question file: DEFAULT see option B');
});
