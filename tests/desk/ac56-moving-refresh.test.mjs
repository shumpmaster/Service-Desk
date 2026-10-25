// AC56 (spec S-001, trial-view notes 8, 9 and 14): moving about the sandbox, closing what is open,
// and a refresh that leaves the screen exactly as the owner left it.
// ac-test: S-001/AC56
import test from 'node:test';
import assert from 'node:assert/strict';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { byClass, findAll, loadSandbox } from './sandbox-helpers.mjs';
import { NOW, DESIGN_LAB_PATH, twoProjects, opened, v3, fullRepo, longRuling, lineLines } from './sandbox-fixtures.mjs';
import { repo } from './fake-desk.mjs';
import { j11Files } from './sandbox-helpers.mjs';
import { readFileSync } from 'node:fs';
import { CONFIG, SRC } from './helpers.mjs';
import { SD3 } from './sandbox-helpers.mjs';
import { pullsAnswer } from './j12-fixture.mjs';
import { railLayout } from './tv2-fixtures.mjs';

const all = (node) => findAll(node, () => true);
/** From stage 3 the Status screen gives way to the project's page at the same address (AC81, AC83): its Overview. */
const onPage = (app) => byClass(app.view, 'v2-proj').length === 1 && keyed(app, 'seg:overview') && keyed(app, 'seg:overview').attrs['aria-current'] === 'page';
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const sheetEl = (app) => byClass(app.view, 'sb-sheet')[0] || byClass(app.view, 'v2-sheet')[0] || null;
// From stage 1a (AC80, AC81): the board's card sheet over Waiting, and a Done row's small sheet.
const Q_ID = 'Alpha|question|questions/Alpha-pick.md';
const DONE_ID = 'Alpha|question|questions/P-001-design-lab-open.md#answer';
const waitingCard = (id) => `#/waiting/Alpha/card/${encodeURIComponent(id)}`;

/** A device whose AC40 "last looked" is 10 hours before NOW, so "Since you last looked" lists the fixtures' lines (AC82, J24). */
const looked = () => {
  const mem = new Map([['desk-seen-v1', JSON.stringify({ lastLooked: NOW - 10 * 3600e3 })]]);
  return { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
};
async function openedLooked(setup, hash = '#/') {
  const app = await loadSandbox({ ...setup, hash, now: NOW, store: looked() });
  await app.advance(1000);
  return app;
}

/** Every kind of refresh (AC56): the minute's poll, the 15-second tick, a history read arriving, and a redraw with no new data. */
async function everyRefresh(app, setup, changed = true) {
  await app.tick();
  if (changed) setup.repos.Alpha.commit({ 'decisions/questions/Alpha-later.md': 'Ruling: B\n' }); // a new ruling: its history read arrives
  await app.advance(POLL_MS);
  await app.tick();
  await app.advance(POLL_MS); // a poll with no new data
  const mod = app.module;
  mod.refresh(); // a redraw with nothing new at all
  await app.flush();
}

// Rewritten in stage 3 (S-001 AC81, "From stage 3", specs/S-001.md:6456-6464; AC84's header, :6879-6880): the
// Status screen gives way to the page, and the Timeline's header holds the back control only (frame 7b),
// the bar's Home tab serving Home (AC81); the Team screen keeps its header until stage 7 (AC88).
test('AC56 back (changed by AC81 and AC84): Home → the page → Waiting (this project) → a card\'s sheet → Timeline; "Back" gives Waiting, then from Team and the Timeline Waiting again; the bar\'s "Home" gives Home; no "Back" on a screen opened first', async () => {
  const app = await opened(twoProjects(), '#/');
  try {
    assert.equal(byClass(app.view, 'sb-prev').length + byClass(app.view, 'v2-round').length, 0, 'Home has no Back');
    await app.go('#/p/Alpha');
    assert.ok(onPage(app), 'the project\'s page');
    await app.go('#/p/Alpha/queue'); // the Queue's address: Waiting with only Alpha shown, no history step of its own
    assert.equal(app.loc.hash, '#/waiting/Alpha');
    await app.go(waitingCard('Alpha|pr|80'));
    await app.go('#/p/Alpha/timeline');
    const back = () => keyed(app, 'nav-back');
    assert.deepEqual([back().tag, back().attrs['aria-label']], ['button', 'Back'], 'the Timeline\'s back control, a step back');
    assert.equal(byClass(app.view, 'sb-back').length, 0, 'no Home control in the Timeline\'s compact header (frame 7b)');
    assert.equal(byClass(byClass(app.view, 'v2-bar')[0], 'v2-tab')[0].attrs.href, '#/', 'the bar\'s Home tab');
    back().click();
    await app.flush();
    assert.equal(app.loc.hash, '#/waiting/Alpha', 'Back goes one screen back: the sheet was not a screen');
    assert.equal(sheetEl(app), null, 'and Waiting shows without the sheet');
    // Waiting has no project header: the bar's Home and the browser's back serve it; the history goes on.
    await app.go('#/p/Alpha/team');
    byClass(app.view, 'sb-prev')[0].click();
    await app.flush();
    assert.equal(app.loc.hash, '#/waiting/Alpha');
    await app.go('#/p/Alpha/timeline');
    back().click();
    await app.flush();
    assert.equal(app.loc.hash, '#/waiting/Alpha');
    await app.go('#/p/Alpha');
    assert.ok(onPage(app));
    assert.deepEqual([keyed(app, 'nav-back').tag, keyed(app, 'nav-back').attrs['aria-label']], ['button', 'Back'], 'the page\'s back control');
    await app.tap(byClass(byClass(app.view, 'v2-bar')[0], 'v2-tab')[0]);
    await app.go('#/');
    assert.equal(byClass(app.view, 'v2-title')[0].textContent, 'Home', 'Home (AC82, from stage 2)');
  } finally {
    app.restore();
  }
  const first = await opened(twoProjects(), '#/p/Alpha/team');
  try {
    assert.equal(byClass(first.view, 'sb-prev').length, 0, 'no "Back" on the screen the sandbox opened on');
    assert.equal(byClass(first.view, 'sb-back').length, 1, 'but "Home" is there');
    await first.go('#/p/Alpha/team/builder');
    assert.equal(byClass(first.view, 'sb-prev').length, 1);
  } finally {
    first.restore();
  }
  // The page and the Timeline opened first: their back control goes up (the page to Home, the Timeline to
  // the page), a link, never a step back through a history entry.
  for (const [hash, up] of [['#/p/Alpha', '#/'], ['#/p/Alpha/timeline', '#/p/Alpha']]) {
    const one = await opened(twoProjects(), hash);
    try {
      const b = findAll(one.view, (e) => e.dataset && e.dataset.k === 'nav-back')[0];
      assert.deepEqual([b.tag, b.attrs.href, b.attrs['aria-label']], ['a', up, 'Back'], hash);
    } finally {
      one.restore();
    }
  }
});

test('AC56 close (changed by AC80): a Done row\'s sheet has "Close" at its top (44 px), and the control, a tap outside and Escape each close it, focus back on its row', async () => {
  const app = await opened(longRuling(), '#/waiting/Alpha');
  try {
    await app.advance(POLL_MS);
    for (const how of ['control', 'outside', 'escape']) {
      const row = keyed(app, `drowlink:${DONE_ID}`);
      assert.ok(row, 'the ruling\'s Done row');
      row.click();
      await app.go(waitingCard(DONE_ID));
      const sh = sheetEl(app);
      assert.ok(sh, `open (${how})`);
      assert.match(sh.textContent, /P-001-design-lab-open/);
      const close = byClass(byClass(sh, 'v2-shead')[0], 'v2-x44')[0];
      assert.equal(close.attrs['aria-label'], 'Close');
      assert.equal(document.activeElement, close);
      if (how === 'control') await app.tap(close);
      else if (how === 'outside') await app.tap(byClass(app.view, 'v2-scrim')[0]);
      else await app.key('Escape');
      assert.equal(sheetEl(app), null, `closed by ${how}`);
      assert.equal(app.loc.hash, '#/waiting/Alpha');
      assert.equal(document.activeElement, keyed(app, `drowlink:${DONE_ID}`), `focus back on its row (${how})`);
    }
  } finally {
    app.restore();
  }
});

// Each sheet: the screen it sits on, the control that opens it, and its route.
const SHEETS = [
  ['the card\'s sheet (a question)', '#/waiting/Alpha', `cardlink:${Q_ID}`, waitingCard(Q_ID)],
  ['the card\'s sheet (a pull request)', '#/waiting/Alpha', 'cardlink:Alpha|pr|80', waitingCard('Alpha|pr|80')],
  ['the summary sheet', '#/p/Alpha/team/critic', 'log:0', '#/p/Alpha/team/critic/e/0'],
  ['the Working now sheet', '#/p/Alpha/team/builder', 'log:now', '#/p/Alpha/team/builder/now'],
  // From stage 3 the page's sheets (AC83): "About the phases", in mockup v2's sheet (rewritten from the Status
  // screen's info sheet), and "Experiments" from the rest's rows.
  ['the page\'s "About the phases" sheet (v2)', '#/p/Alpha', 'info', '#/p/Alpha/info'],
  ['the page\'s "Experiments" sheet (v2)', '#/p/Alpha', 'rest:experiments', '#/p/Alpha/experiments'],
];

test('AC56 close: every sheet has "Close" at its top (44 px), and the control, a tap outside and Escape each close it, with focus back on its opener', async () => {
  const app = await opened(twoProjects(), '#/');
  try {
    for (const [what, screen, openerKey, route] of SHEETS) {
      for (const how of ['control', 'outside', 'escape']) {
        await app.go(screen);
        const op = keyed(app, openerKey);
        assert.ok(op, `${what}: its opener ${openerKey}`);
        // A link inside a fold is tapped with its fold open, as the owner must open it to reach the link (the fake DOM
        // draws a closed fold's links too); a closed fold's control takes the focus instead (AC89 (i), stage 2's design
        // review, B1: ac89-after-md3.test.mjs).
        for (let a = op.parentNode; a; a = a.parentNode) if (a.tag === 'details') a.setAttribute('open', '');
        op.click(); // the tap that follows the link
        await app.go(route);
        const sh = sheetEl(app);
        assert.ok(sh, `${what}: open`);
        // The board's sheet (AC85's look): its grab handle, then its head with the 44 px close at its top right.
        const board = / sheet \(/.test(what) || /\(v2\)$/.test(what);
        const top = board ? byClass(sh, 'v2-shead')[0] : byClass(sh, 'sb-sheet-top')[0];
        assert.equal(sh.children[board ? 1 : 0], top, `${what}: the close control sits at the top`);
        const close = byClass(top, board ? 'v2-x44' : 'sb-close')[0];
        assert.equal(close.attrs['aria-label'], 'Close');
        if (board) assert.match(readFileSync(`${SRC}/public/sandbox.css`, 'utf8'), /\.v2-x44 \{ width: 44px; height: 44px;/, 'its target is 44 by 44');
        assert.equal(document.activeElement, close, `${what}: focus moves into the sheet`);
        if (how === 'control') await app.tap(close);
        else if (how === 'outside') await app.tap(byClass(app.view, board ? 'v2-scrim' : 'sb-scrim')[0]); // a real tap: the press takes focus off the sheet first
        else await app.key('Escape');
        await app.flush();
        assert.equal(sheetEl(app), null, `${what}: closed by ${how}`);
        assert.equal(app.loc.hash, screen, `${what}: back on its screen`);
        assert.equal(document.activeElement, keyed(app, openerKey), `${what}: focus back on its opener (${how})`);
      }
    }
  } finally {
    app.restore();
  }
});

test('AC56 close (changed by AC82): the "Since you last looked" sheet ("<n> more since <time> ›") has "Close" at its top (44 px), and the control, a tap outside and Escape each close it, focus back on its opener', async () => {
  const app = await openedLooked(twoProjects(), '#/');
  try {
    for (const how of ['control', 'outside', 'escape']) {
      await app.advance(2000);
      const more = keyed(app, 'since-more');
      assert.ok(more, 'the "<n> more" line');
      assert.match(more.textContent, /^\d+ more since /);
      await app.tap(more);
      await app.go(more.attrs.href);
      const sheet = keyed(app, 'since-sheet');
      assert.ok(sheet, `the sheet (${how})`);
      assert.equal(sheet.attrs.role, 'dialog');
      const close = keyed(app, 'sheet-close');
      assert.equal(close.attrs['aria-label'], 'Close');
      assert.ok(byClass(sheet, 'v2-shead')[0].children.includes(close), 'at its top');
      assert.match(readFileSync(`${SRC}/public/sandbox.css`, 'utf8'), /\.v2-x44 \{ width: 44px; height: 44px;/, 'its target is 44 by 44');
      if (how === 'control') await app.tap(close);
      else if (how === 'outside') await app.tap(keyed(app, 'v2-scrim'));
      else await app.key('Escape');
      await app.flush();
      assert.equal(keyed(app, 'since-sheet'), null, `closed by ${how}`);
      assert.equal(app.loc.hash, '#/', `Home (${how})`);
      assert.equal(document.activeElement, keyed(app, 'since-more'), `focus back on its opener (${how})`);
    }
  } finally {
    app.restore();
  }
});

/** The browser's measure of a card's summary (the fake DOM lays out no text): its box three lines, its text `lines` lines. */
function clipLines(app, name, lines) {
  const c = keyed(app, `sumclip:${name}`);
  assert.ok(c, `${name}'s summary box`);
  c.clientHeight = 52;
  c.scrollHeight = Math.round(lines * 17.28);
}
const LONG_README = '# Long\n\nA summary long enough to run past three lines on the card, so that its first three lines show with the fade and the whole of it opens in a bubble.\n';

test('AC56 close: the whole-summary bubble has "Close" at its top, and the control, a tap outside and Escape each close it, focus back on the summary control', async () => {
  const setup = twoProjects();
  setup.repos.Alpha.commit({ 'README.md': LONG_README });
  const app = await opened(setup, '#/');
  try {
    clipLines(app, 'Alpha', 5);
    await app.resize(360);
    for (const how of ['control', 'outside', 'escape']) {
      const ctl = keyed(app, 'sum:Alpha');
      assert.ok(ctl, 'the summary control');
      await app.tap(ctl);
      const bub = keyed(app, 'sumbubble:Alpha');
      assert.ok(bub, `open (${how})`);
      assert.equal(bub.children[0], byClass(bub, 'sb-bubble-top')[0], 'the close control sits at the top');
      const close = byClass(bub.children[0], 'sb-close')[0];
      assert.equal(close.attrs['aria-label'], 'Close');
      assert.match(readFileSync(`${SRC}/public/sandbox.css`, 'utf8'), /\.sb-close \{[^}]*min-width: 44px; min-height: 44px;/, 'its target is 44 by 44');
      if (how === 'control') await app.tap(close);
      else if (how === 'outside') await app.tap(app.view);
      else await app.key('Escape');
      assert.equal(keyed(app, 'sumbubble:Alpha'), null, `closed by ${how}`);
      assert.equal(document.activeElement, keyed(app, 'sum:Alpha'), `focus back on the summary control (${how})`);
    }
  } finally {
    app.restore();
  }
});

/** A screen with the owner's real record (2026-10-16): its whole-line control, measured past three lines. */
async function longLine(hash, id) {
  const setup = longRuling();
  const app = await opened(setup, hash);
  await app.advance(POLL_MS);
  lineLines(app, id, 47);
  await app.resize(360);
  return { app, setup };
}

for (const [where, hash, id] of [['"Your last action"', '#/p/Alpha', 'last']]) {
  test(`AC56 close (2026-10-16): ${where}'s whole-line bubble has "Close" at its top, and the control, a tap outside and Escape each close it, focus back on its control`, async () => {
    const { app } = await longLine(hash, id);
    try {
      for (const how of ['control', 'outside', 'escape']) {
        const ctl = keyed(app, `line:${id}`);
        assert.ok(ctl, 'the whole-line control');
        await app.tap(ctl);
        const bub = keyed(app, `linebubble:${id}`);
        assert.ok(bub, `open (${how})`);
        assert.equal(bub.attrs.role, 'dialog');
        assert.equal(bub.children[0], byClass(bub, 'sb-bubble-top')[0], 'the close control sits at the top');
        const close = byClass(bub.children[0], 'sb-close')[0];
        assert.equal(close.attrs['aria-label'], 'Close');
        assert.match(readFileSync(`${SRC}/public/sandbox.css`, 'utf8'), /\.sb-close \{[^}]*min-width: 44px; min-height: 44px;/, 'its target is 44 by 44');
        if (how === 'control') await app.tap(close);
        else if (how === 'outside') await app.tap(app.view);
        else await app.key('Escape');
        assert.equal(keyed(app, `linebubble:${id}`), null, `closed by ${how}`);
        assert.equal(document.activeElement, keyed(app, `line:${id}`), `focus back on its control (${how})`);
      }
      assert.equal(app.loc.hash, hash, 'a bubble is not a screen: nothing moved');
    } finally {
      app.restore();
    }
  });
}

test('AC56 refresh, Status (step 2b, 2026-10-16): "Your last action"\'s whole-line bubble open, scrolled part way, with the screen scrolled and focus on its control, all stay through every kind of refresh', async () => {
  const { app, setup } = await longLine('#/p/Alpha', 'last');
  try {
    const ctl = keyed(app, 'line:last');
    await app.tap(ctl);
    const bub = keyed(app, 'linebubble:last');
    assert.ok(bub);
    bub.scrollTop = 300; // part way down the owner's 1,800 characters
    app.scrolls.length = 0;
    await everyRefresh(app, setup);
    assert.ok(onPage(app), 'the same screen (the page, in the Status screen\'s place from stage 3)');
    assert.equal(keyed(app, 'linebubble:last'), bub, 'the same bubble, still open');
    assert.equal(bub.scrollTop, 300, 'scrolled where it was');
    assert.equal(keyed(app, 'line:last'), ctl, 'on the same control');
    assert.equal(ctl.attrs['aria-expanded'], 'true');
    assert.equal(document.activeElement, ctl, 'which keeps the focus');
    assert.deepEqual(app.scrolls, [], 'no refresh moves the screen\'s scroll');
  } finally {
    app.restore();
  }
});

test('AC56 refresh, Status (step 2b, draft 4): with that bubble open and scrolled part way, a poll bringing a new ruling whose time is still unread leaves it open, unchanged and scrolled where it was, saying "This has changed since you opened it. Close this to see the latest."; closed by the owner, the line reads "not available yet", then the new ruling once its time arrives', async () => {
  const { app, setup } = await longLine('#/p/Alpha', 'last');
  try {
    const ctl = keyed(app, 'line:last');
    await app.tap(ctl);
    const bub = keyed(app, 'linebubble:last');
    bub.scrollTop = 300;
    const words = byClass(bub, 'sb-bubble-t')[0].textContent;
    setup.repos.Alpha.commit({ 'decisions/questions/Alpha-newest.md': 'Ruling: D\n' });
    setup.repos.Alpha.history['decisions/questions/Alpha-newest.md'] = [{ commit: { committer: { date: new Date(app.now).toISOString() } } }];
    const call = app.server.call;
    app.server.call = (path, body) => call(path, body && Array.isArray(body.history) ? { ...body, history: body.history.filter((x) => !x.endsWith('Alpha-newest.md')) } : body);
    app.scrolls.length = 0;
    await app.advance(POLL_MS); // the poll: the new ruling's file, its time held back
    await app.tick(); // the 15-second tick
    app.module.refresh(); // a redraw with nothing new
    await app.flush();
    assert.equal(keyed(app, 'linebubble:last'), bub, 'the same bubble, still open');
    assert.equal(bub.scrollTop, 300, 'at the same scroll position');
    assert.equal(byClass(bub, 'sb-bubble-t')[0].textContent, words, 'unchanged');
    assert.equal(byClass(bub, 'sb-bubble-note')[0].textContent, 'This has changed since you opened it. Close this to see the latest.');
    assert.equal(keyed(app, 'line:last'), ctl);
    assert.deepEqual(app.scrolls, []);
    await app.key('Escape');
    assert.equal(keyed(app, 'linebubble:last'), null, 'closed only by the owner');
    assert.match(byClass(app.view, 'sb-last')[0].textContent, /^Your last action: not available yet/);
    assert.equal(keyed(app, 'line:last'), null, 'its control gone');
    assert.equal(document.activeElement, keyed(app, 'last-action'), 'focus on the "Your last action" line (draft 5)');
    app.server.call = call;
    await app.advance(POLL_MS); // its history read arrives
    await app.advance(POLL_MS);
    lineLines(app, 'last', 1);
    await app.resize(360);
    assert.match(byClass(app.view, 'sb-last')[0].textContent, /^Your last action: D · /);
  } finally {
    app.restore();
  }
});

test('AC56 refresh, Waiting (step 3b, changed by AC80): a Done group opened past its three rows, with a Done row\'s sheet open and scrolled part way, all stay through every kind of refresh', async () => {
  const setup = longRuling();
  for (const n of [1, 2, 3]) {
    setup.repos.Alpha.commit({ [`decisions/questions/P-001-more-${n}.md`]: `Ruling: A, number ${n}\n` });
    setup.repos.Alpha.history[`decisions/questions/P-001-more-${n}.md`] = [{ commit: { committer: { date: new Date(NOW - (40 + n) * 60e3).toISOString() } } }];
  }
  const app = await opened(setup, '#/waiting/Alpha');
  try {
    await app.advance(POLL_MS);
    const more = keyed(app, 'more:Alpha');
    assert.ok(more, 'more than three rows: "<n> more"');
    assert.match(more.textContent, /^2 more/);
    await app.tap(more);
    assert.equal(keyed(app, 'more:Alpha').attrs['aria-expanded'], 'true');
    keyed(app, `drowlink:${DONE_ID}`).click();
    await app.go(waitingCard(DONE_ID));
    const sh = sheetEl(app);
    sh.scrollTop = 300;
    app.scrolls.length = 0;
    await everyRefresh(app, setup);
    assert.equal(sheetEl(app), sh, 'the same sheet, still open');
    assert.equal(sh.scrollTop, 300, 'scrolled part way, where it was');
    assert.equal(keyed(app, 'more:Alpha').attrs['aria-expanded'], 'true', 'the group stays open');
    assert.deepEqual(app.scrolls, []);
  } finally {
    app.restore();
  }
});

test('AC56 close (draft 5): a held "Your last action" bubble closed onto a new, short ruling: the control goes once the line is measured, and focus goes to the "Your last action" line', async () => {
  const { app, setup } = await longLine('#/p/Alpha', 'last');
  try {
    await app.tap(keyed(app, 'line:last'));
    setup.repos.Alpha.commit({ 'decisions/questions/Alpha-short-newest.md': 'Ruling: a later short one\n' });
    setup.repos.Alpha.history['decisions/questions/Alpha-short-newest.md'] = [{ commit: { committer: { date: new Date(app.now).toISOString() } } }];
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.ok(byClass(keyed(app, 'linebubble:last'), 'sb-bubble-note').length, 'held, with the notice');
    await app.key('Escape');
    lineLines(app, 'last', 1); // the browser measures the new line: one line
    await app.resize(360);
    assert.match(byClass(app.view, 'sb-last')[0].textContent, /^Your last action: a later short one · /);
    assert.equal(keyed(app, 'line:last'), null, 'no control for a short line');
    assert.equal(document.activeElement, keyed(app, 'last-action'), 'focus on the "Your last action" line, not lost');
  } finally {
    app.restore();
  }
});

for (const how of ['Close', 'Escape', 'outside']) {
  test(`AC56 refresh, Waiting (step 3b, changed by AC80): a Done row's sheet open and scrolled part way, the clock run past midnight in ownerTimeZone: the sheet stays as it was, with the notice; closed (${how}), the row shows "yesterday, <time>" and focus is back on it`, async () => {
    const setup = longRuling();
    // Asia/Tokyo: NOW (15:00Z) is midnight there; the rulings were filed at 23:50 and 23:30 the day before.
    setup.config = { ...setup.config, ownerTimeZone: 'Asia/Tokyo' };
    const app = await loadSandbox({ ...setup, hash: '#/waiting/Alpha', now: NOW - 3 * 60e3 });
    try {
      await app.advance(1000);
      await app.advance(POLL_MS);
      const row = () => findAll(app.view, (e) => e.dataset && e.dataset.k === `done:${DONE_ID}`)[0];
      assert.match(row().textContent, / · 23:50$/, 'before midnight: today, 23:50 (the row\'s ✓ is its mark)');
      keyed(app, `drowlink:${DONE_ID}`).click();
      await app.go(waitingCard(DONE_ID));
      const sh = sheetEl(app);
      sh.scrollTop = 300;
      const words = sh.textContent;
      app.scrolls.length = 0;
      await app.advance(3 * POLL_MS); // past midnight in Tokyo, with the polls that follow
      await app.tick();
      app.module.refresh();
      await app.flush();
      assert.ok(Date.now() > NOW, 'the clock is past midnight');
      assert.equal(sheetEl(app), sh, 'the same sheet, still open');
      assert.equal(sh.scrollTop, 300, 'at the same scroll position');
      assert.ok(sh.textContent.startsWith(words.slice(0, 40)), 'unchanged');
      assert.match(sh.textContent, /This has changed since you opened it\. Close this to see the latest\./);
      assert.match(sh.textContent, /done 23:50/, 'the time as it was when it opened');
      assert.deepEqual(app.scrolls, []);
      if (how === 'Close') await app.tap(byClass(sh, 'v2-x44')[0]);
      else if (how === 'Escape') await app.key('Escape');
      else await app.tap(byClass(app.view, 'v2-scrim')[0]);
      assert.equal(sheetEl(app), null, `closed by the owner (${how})`);
      assert.match(row().textContent, / · yesterday, 23:50$/, 'the row shows its new words: still in Done, within its 24 hours');
      assert.equal(document.activeElement, keyed(app, `drowlink:${DONE_ID}`), 'focus back on the row');
      // Opened again: the latest, and no notice.
      keyed(app, `drowlink:${DONE_ID}`).click();
      await app.go(waitingCard(DONE_ID));
      assert.match(sheetEl(app).textContent, /done yesterday, 23:50/);
      assert.doesNotMatch(sheetEl(app).textContent, /This has changed/);
    } finally {
      app.restore();
    }
  });
}

test('AC56 refresh, Waiting (step 3b, changed by AC80): a Done row\'s sheet open: a new Done row holds the sheet as it was, with no notice (its row did not change); a change to its row adds the notice; closed and opened again, the latest, with no notice', async () => {
  const setup = longRuling();
  const app = await loadSandbox({ ...setup, hash: '#/waiting/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    keyed(app, `drowlink:${DONE_ID}`).click();
    await app.go(waitingCard(DONE_ID));
    const sh = sheetEl(app);
    // Another ruling filed now: the open row itself is unchanged.
    setup.repos.Alpha.commit({ 'decisions/questions/P-001-later.md': 'Ruling: C, a later one\n' });
    setup.repos.Alpha.history['decisions/questions/P-001-later.md'] = [{ commit: { committer: { date: new Date(app.now).toISOString() } } }];
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.equal(sheetEl(app), sh, 'the same sheet, still open');
    assert.doesNotMatch(sh.textContent, /This has changed/, 'no notice: its own row has not changed');
    // Now the open row's own record changes.
    const CHANGED = `Ruling: ${'a reworded design-lab ruling, '.repeat(4)}end`;
    setup.repos.Alpha.commit({ [DESIGN_LAB_PATH]: `${CHANGED}\n` });
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.equal(sheetEl(app), sh, 'still the same sheet');
    assert.match(sh.textContent, /This has changed since you opened it\. Close this to see the latest\./);
    assert.doesNotMatch(sh.textContent, /a reworded design-lab ruling/, 'unchanged words');
    await app.key('Escape');
    assert.equal(sheetEl(app), null, 'closed by the owner');
    keyed(app, `drowlink:${DONE_ID}`).click();
    await app.go(waitingCard(DONE_ID));
    const again = sheetEl(app);
    assert.match(again.textContent, /a reworded design-lab ruling/, 'the new words, not the held ones');
    assert.doesNotMatch(again.textContent, /This has changed/, 'and no notice');
    await app.advance(POLL_MS);
    assert.equal(sheetEl(app), again, 'a refresh with nothing changed keeps it');
    assert.doesNotMatch(again.textContent, /This has changed/);
  } finally {
    app.restore();
  }
});

test('AC56 refresh, Home (changed by AC82): the Done group opened, the active group closed, and the "Since you last looked" sheet open all stay through every kind of refresh', async () => {
  // Two one-of-each projects, so the list runs past its four lines and "<n> more" opens the sheet.
  const setup = { config: { ...CONFIG, projects: [v3('Alpha'), v3('Beta'), v3('Done-one')] },
    repos: { Alpha: fullRepo('Alpha'), Beta: fullRepo('Beta'), 'Done-one': repo({ ...j11Files(), 'decisions/questions/P-001-graduation.md': 'Ruling: graduate\n' }) } };
  const app = await openedLooked(setup, '#/');
  try {
    await app.advance(POLL_MS);
    keyed(app, 'hgroup-btn:done').click();
    keyed(app, 'hgroup-btn:active').click();
    await app.flush();
    await app.go('#/since');
    const sheet = keyed(app, 'since-sheet');
    assert.ok(sheet, 'the sheet is open');
    app.scrolls.length = 0;
    await everyRefresh(app, setup);
    assert.equal(keyed(app, 'hgroup-btn:done').attrs['aria-expanded'], 'true', 'Done stays open');
    assert.equal(keyed(app, 'hgroup-btn:active').attrs['aria-expanded'], 'false', 'the active group stays closed');
    assert.equal(keyed(app, 'since-sheet'), sheet, 'the same sheet, still open');
    assert.match(byClass(app.view, 'v2-brief')[0].textContent, /need you/, 'with the changed data shown');
    assert.deepEqual(app.scrolls, []);
  } finally {
    app.restore();
  }
});

test('AC56 refresh, Home (step 1b): the same groups, with a tile\'s whole-summary bubble open, all stay through every kind of refresh', async () => {
  const setup = { config: { ...CONFIG, projects: [v3('Alpha'), v3('Done-one')] },
    repos: { Alpha: fullRepo('Alpha'), 'Done-one': repo({ ...j11Files(), 'decisions/questions/P-001-graduation.md': 'Ruling: graduate\n', 'README.md': LONG_README }) } };
  const app = await opened(setup, '#/');
  try {
    await app.advance(POLL_MS);
    keyed(app, 'hgroup-btn:done').click();
    keyed(app, 'hgroup-btn:active').click();
    await app.flush();
    clipLines(app, 'Done-one', 5);
    await app.resize(360);
    const ctl = keyed(app, 'sum:Done-one');
    assert.ok(ctl, 'the summary control');
    await app.tap(ctl);
    const bub = keyed(app, 'sumbubble:Done-one');
    assert.ok(bub, 'the summary bubble is open');
    assert.equal(findAll(app.view, (e) => e.dataset && /^bubble:/.test(e.dataset.k || '')).length, 0, 'the only bubble: no "Latest" (AC82)');
    app.scrolls.length = 0;
    await everyRefresh(app, setup);
    assert.equal(keyed(app, 'hgroup-btn:done').attrs['aria-expanded'], 'true', 'Done stays open');
    assert.equal(keyed(app, 'hgroup-btn:active').attrs['aria-expanded'], 'false', 'the active group stays closed');
    assert.equal(keyed(app, 'sumbubble:Done-one'), bub, 'the same bubble, still open');
    assert.equal(keyed(app, 'sum:Done-one'), ctl, 'on the same control');
    assert.equal(ctl.attrs['aria-expanded'], 'true');
    assert.equal(document.activeElement, ctl, 'which keeps the focus');
    assert.match(byClass(app.view, 'v2-brief')[0].textContent, /need you/, 'with the changed data shown');
    assert.deepEqual(app.scrolls, []);
  } finally {
    app.restore();
  }
});

test('AC56 refresh, Status: the screen scrolled and focus on "More detail" stay through every kind of refresh', async () => {
  const setup = twoProjects();
  const app = await opened(setup, '#/p/Alpha');
  try {
    const more = keyed(app, 'more-detail');
    assert.ok(more);
    more.focus();
    app.scrolls.length = 0;
    await everyRefresh(app, setup);
    assert.ok(onPage(app), 'the same screen (the page, in the Status screen\'s place from stage 3)');
    assert.equal(document.activeElement, more, 'focus stays on the same control');
    assert.ok(app.view.contains(more));
    assert.deepEqual(app.scrolls, [], 'no refresh moves the scroll');
  } finally {
    app.restore();
  }
});

test('AC56 refresh, Waiting (changed by AC80): an open, scrolled card sheet with its words typed (cursor mid-text) and a Done group opened all stay; its item answered, the sheet says so and keeps the text', async () => {
  const setup = longRuling();
  for (const n of [1, 2, 3]) {
    setup.repos.Alpha.commit({ [`decisions/questions/P-001-more-${n}.md`]: `Ruling: A, number ${n}\n` });
    setup.repos.Alpha.history[`decisions/questions/P-001-more-${n}.md`] = [{ commit: { committer: { date: new Date(NOW - (40 + n) * 60e3).toISOString() } } }];
  }
  const app = await opened(setup, '#/waiting/Alpha');
  try {
    await app.advance(POLL_MS);
    await app.tap(keyed(app, 'more:Alpha'));
    keyed(app, `cardlink:${Q_ID}`).click();
    await app.go(waitingCard(Q_ID));
    const sh = sheetEl(app);
    sh.scrollTop = 240;
    const box = findAll(sh, (e) => e.tag === 'textarea')[0];
    assert.ok(box, 'the words box');
    const typed = 'My own words, typed here.';
    box.value = typed;
    box.dispatch('input', { target: box });
    box.focus();
    box.setSelectionRange(5, 5);
    app.scrolls.length = 0;
    await everyRefresh(app, setup);
    assert.equal(sheetEl(app), sh, 'the same sheet, still open');
    assert.equal(sh.scrollTop, 240, 'scrolled where it was');
    assert.equal(document.activeElement, box, 'focus stays in the box');
    assert.equal(box.value, typed);
    assert.equal(box.selectionStart, 5, 'the cursor stays mid-text');
    assert.match(byClass(sh, 'v2-abtn').find((a) => a.textContent === 'Answer A ↗').attrs.href, /My%20own%20words%2C%20typed%20here\./, 'in each button');
    assert.equal(keyed(app, 'more:Alpha').attrs['aria-expanded'], 'true', 'the Done group stays open');
    assert.deepEqual(app.scrolls, []);
    // A poll in which its item is answered: the sheet stays open, says so, and keeps the text.
    setup.repos.Alpha.commit({ 'decisions/questions/Alpha-pick.md': 'Ruling: B\n\nQuestion: questions/Alpha-pick.md\n' });
    await app.advance(POLL_MS);
    assert.equal(sheetEl(app), sh, 'still open');
    assert.match(sh.textContent, /That no longer waits on you/);
    assert.equal(findAll(sh, (e) => e.tag === 'textarea')[0], box);
    assert.equal(box.value, typed, 'what was typed stays');
    assert.equal(document.activeElement, box);
  } finally {
    app.restore();
  }
});

/** Service-Desk at 3117150 with J12's answer, beside Alpha (whose records every refresh changes). */
function withSD() {
  const setup = twoProjects();
  const sd = repo(j11Files());
  sd.pullsAnswer = pullsAnswer();
  setup.config = { ...setup.config, projects: [...setup.config.projects, SD3] };
  setup.repos['Service-Desk'] = sd;
  return setup;
}

test('AC56 refresh, Timeline (step 4, 2026-10-16: AC59, AC60): scrolled away from Now, one milestone\'s sprints opened and a "Not tied to a milestone" line\'s sprints opened: each stays as it was, and the screen does not scroll back to Now', async () => {
  const setup = withSD();
  const app = await opened(setup, '#/p/Service-Desk/timeline');
  try {
    await app.advance(POLL_MS);
    const fold = (k) => keyed(app, `fold:sprints:${k}`);
    const ms = fold('Build-i1:M2B:run1');
    const untied = fold('Design-i2:untied:run2');
    assert.ok(ms && untied, 'both folds drawn');
    assert.equal(ms.attrs['aria-expanded'], 'false', 'every list starts folded');
    await app.tap(ms);
    await app.tap(untied);
    assert.equal(fold('Build-i1:M2B:run1').attrs['aria-expanded'], 'true');
    const tasks = keyed(app, 'tasks:Build-i1:M2B');
    assert.ok(tasks, 'its sprints are open');
    window.scrollY = 2400; // the owner scrolled away from Now
    app.scrolls.length = 0;
    await everyRefresh(app, setup);
    assert.equal(fold('Build-i1:M2B:run1').attrs['aria-expanded'], 'true', 'the milestone\'s sprints stay open');
    assert.equal(fold('Design-i2:untied:run2').attrs['aria-expanded'], 'true', 'and the untied ones');
    assert.equal(keyed(app, 'tasks:Build-i1:M2B'), tasks, 'the same element');
    assert.deepEqual(app.scrolls, [], 'no scroll back to Now on a refresh');
  } finally {
    app.restore();
  }
});

// Rewritten in stage 3 (S-001 AC57, "Changed by AC83", specs/S-001.md:4478-4486; AC83's milestones by phase,
// "folding or opening one line never moves another, and a refresh keeps each as the owner left it (AC56)"):
// the Status screen's boxes and drawing give way to the page's phase lines, and the drawing to Home's tile.
test('AC56 refresh, the page (AC83, in the Status screen\'s place): one phase line opened and folded again and two opened, with an opened earlier run\'s rows: each stays as it was, the same elements, through every kind of refresh', async () => {
  const setup = withSD();
  const app = await opened(setup, '#/p/Service-Desk');
  try {
    await app.advance(POLL_MS);
    const line = (ph) => findAll(app.view, (e) => e.tag === 'button' && e.attrs['aria-label'] === ph && / v2-stdr /.test(` ${e.className} `))[0];
    await app.tap(line('Launch')); // open, then fold again
    await app.tap(line('Launch'));
    await app.tap(line('Discovery'));
    await app.tap(line('Design'));
    assert.equal(line('Launch').attrs['aria-expanded'], 'false');
    assert.equal(line('Discovery').attrs['aria-expanded'], 'true');
    const design = keyed(app, 'stdl:Design');
    assert.ok(design && keyed(app, 'old:Design-i1:run1'), 'Design opened, its earlier run listed');
    await everyRefresh(app, setup);
    assert.equal(line('Launch').attrs['aria-expanded'], 'false', 'Launch stays folded');
    assert.equal(line('Discovery').attrs['aria-expanded'], 'true', 'Discovery stays open');
    assert.equal(keyed(app, 'stdl:Design'), design, 'Design stays open, the same element');
    assert.ok(keyed(app, 'old:Design-i1:run1'), 'its earlier run still listed');
  } finally {
    app.restore();
  }
});

test('AC56: the 15-second tick changes only the time-dependent text; every other element is the same element before and after', async () => {
  // From stage 3 (AC83) a project's page with something waiting shows its waits by name, with no time on them;
  // its time-dependent text is "checked <age> ago" on the row saying nothing waits (frame 8), so the page is
  // also drawn for a project with nothing waiting, `Quiet` (made up, NOT a real record), where it must change.
  const quiet = () => ({ config: { ...CONFIG, projects: [v3('Alpha'), v3('Quiet')] }, repos: { Alpha: fullRepo('Alpha'), Quiet: repo({ 'README.md': '# Quiet\n' }) } });
  for (const hash of ['#/', '#/p/Alpha', '#/p/Quiet', '#/p/Alpha/queue', '#/p/Alpha/queue/q%3AAlpha-pick', '#/p/Alpha/team', '#/p/Alpha/team/builder/now', '#/p/Alpha/timeline']) {
    const app = await opened(hash === '#/p/Quiet' ? quiet() : twoProjects(), hash);
    try {
      app.desk.stop(); // no poll: only the clock moves on
      await app.advance(7 * 60e3);
      const mid = all(app.view);
      const midTexts = mid.map((e) => e.textContent);
      await app.tick();
      const after = all(app.view);
      assert.equal(after.length, mid.length, `${hash}: no element added or removed`);
      after.forEach((e, i) => assert.equal(e, mid[i], `${hash}: element ${i} is the same element`));
      const changed = after.filter((e, i) => e.textContent !== midTexts[i]);
      for (const e of changed) {
        const self = e._live || findAll(e, (x) => x._live).length;
        assert.ok(self, `${hash}: only time-dependent text changes (${e.tag}.${e.className})`);
      }
      if (hash !== '#/p/Alpha/timeline' && hash !== '#/p/Alpha') assert.ok(changed.some((e) => e._live), `${hash}: the time-dependent text did change`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// AC56, changed after MD3 (specs/S-001.md:4843-4868; "Ruling: A — typed words and scroll come back after a full reload,
// on this phone only", decisions/questions/P-001-audit-reload.md): the reload step. A full reload is the page loaded
// again from the same device storage, after the page was hidden, as iOS does to a Home Screen app.

/** A device's storage, in memory, kept across loads; `throws` makes every read and write refuse (wa-fixtures.mjs's form). */
function device() {
  const m = new Map();
  const s = { throws: false, m,
    getItem(k) { if (s.throws) throw new Error('blocked'); return m.has(k) ? m.get(k) : null; },
    setItem(k, v) { if (s.throws) throw new Error('blocked'); m.set(k, String(v)); },
    removeItem(k) { if (s.throws) throw new Error('blocked'); m.delete(k); } };
  return s;
}
/** The page hidden, then loaded again from the same device storage at the same address (and later, if given). */
async function fullReload(app, setup, store, later = 0) {
  const hash = app.loc.hash;
  const now = app.now + later;
  await app.visibility('hidden');
  app.restore();
  const b = await loadSandbox({ ...setup, hash, now, store });
  await b.advance(1000);
  await b.advance(POLL_MS);
  return b;
}
const boxIn = (app) => findAll(sheetEl(app), (e) => e.tag === 'textarea')[0] || null;
async function typeIn(app, words) {
  const box = boxIn(app);
  box.value = words;
  box.dispatch('input', { target: box });
  return box;
}
const WORDS_TYPED = 'My own words, typed before the reload (made up for the test).';

test('AC56 reload (changed after MD3): a sheet open and scrolled part way, words typed in its box and the screen under it scrolled — after a full reload, the sheet, its words and both scrolls are as they were, on this device only', async () => {
  const setup = twoProjects();
  const store = device();
  let app = await loadSandbox({ ...setup, hash: waitingCard(Q_ID), now: NOW, store });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await typeIn(app, WORDS_TYPED);
    sheetEl(app).scrollTop = 120;
    window.scrollY = 500;
    assert.ok(JSON.parse(store.m.get('desk-sheet-words-v1')).words[`${Q_ID}#1`], 'kept on the device, under a key of its own');
    assert.equal(JSON.parse(store.m.get('desk-sheet-words-v1')).words[`${Q_ID}#1`].text, WORDS_TYPED);
    app = await fullReload(app, setup, store);
    assert.equal(app.loc.hash, waitingCard(Q_ID), 'the sheet comes back by its address');
    assert.ok(sheetEl(app), 'the sheet open');
    assert.equal(boxIn(app).value, WORDS_TYPED, 'its words');
    assert.equal(sheetEl(app).scrollTop, 120, 'the sheet scrolled where it was');
    assert.deepEqual(app.scrolls.at(-1), [0, 500], 'the screen under it scrolled where it was');
    assert.match(byClass(sheetEl(app), 'v2-abtn').find((a) => a.textContent === 'Answer A ↗').attrs.href, /My%20own%20words/, 'in each answer link, as before the reload');
    // Never sent anywhere: no call to the desk function carries them.
    assert.ok(!app.server.calls.some((c) => JSON.stringify(c.body || {}).includes('My own words')), 'never sent');
  } finally {
    app.restore();
  }
  // Another device keeps only its own: a fresh storage has no words.
  const other = await loadSandbox({ ...setup, hash: waitingCard(Q_ID), now: NOW, store: device() });
  try {
    await other.advance(1000);
    await other.advance(POLL_MS);
    assert.equal(boxIn(other).value, '');
  } finally {
    other.restore();
  }
});

test('AC56 reload (changed after MD3): the words are gone after the box is emptied, after the item\'s answer arrives and its sheet is closed, and after 7 days; while its sheet is open, an answer arriving keeps them', async () => {
  // Emptied.
  let setup = twoProjects();
  let store = device();
  let app = await loadSandbox({ ...setup, hash: waitingCard(Q_ID), now: NOW, store });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await typeIn(app, WORDS_TYPED);
    await typeIn(app, '');
    assert.equal(store.m.has('desk-sheet-words-v1'), false, 'nothing kept once the box is emptied');
    app = await fullReload(app, setup, store);
    assert.equal(boxIn(app).value, '');
  } finally {
    app.restore();
  }
  // The answer arrives: kept while the sheet is open (AC56), dropped once it is closed.
  setup = twoProjects();
  store = device();
  app = await loadSandbox({ ...setup, hash: waitingCard(Q_ID), now: NOW, store });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await typeIn(app, WORDS_TYPED);
    setup.repos.Alpha.commit({ 'decisions/questions/Alpha-pick.md': 'Ruling: B\n\nQuestion: questions/Alpha-pick.md\n' });
    await app.advance(POLL_MS);
    assert.match(sheetEl(app).textContent, /That no longer waits on you/);
    assert.equal(boxIn(app).value, WORDS_TYPED, 'still open: what was typed stays');
    assert.ok(store.m.has('desk-sheet-words-v1'), 'and stays kept');
    await app.key('Escape');
    await app.advance(POLL_MS);
    assert.equal(store.m.has('desk-sheet-words-v1'), false, 'closed, and its item no longer waits: dropped');
  } finally {
    app.restore();
  }
  // Seven days.
  setup = twoProjects();
  store = device();
  app = await loadSandbox({ ...setup, hash: waitingCard(Q_ID), now: NOW, store });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await typeIn(app, WORDS_TYPED);
    app = await fullReload(app, setup, store, 6 * 86400e3);
    assert.equal(boxIn(app).value, WORDS_TYPED, 'six days later, still kept');
    app = await fullReload(app, setup, store, 86400e3 + 60e3);
    assert.equal(boxIn(app).value, '', 'past 7 days from its typing: gone');
    assert.equal(store.m.has('desk-sheet-words-v1'), false);
  } finally {
    app.restore();
  }
});

test('AC56 reload (changed after MD3): with the device\'s storage refusing writes, a reload clears the words, with no error, and nothing else changes', async () => {
  const setup = twoProjects();
  const store = device();
  store.throws = true;
  let app = await loadSandbox({ ...setup, hash: waitingCard(Q_ID), now: NOW, store });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await typeIn(app, WORDS_TYPED);
    assert.equal(boxIn(app).value, WORDS_TYPED, 'kept for this window');
    app = await fullReload(app, setup, store);
    assert.ok(sheetEl(app), 'the sheet comes back by its address');
    assert.equal(boxIn(app).value, '', 'the words cleared');
    assert.ok(cardsOn(app) > 0, 'the board drawn as before');
  } finally {
    app.restore();
  }
});
const cardsOn = (app) => byClass(app.view, 'v2-card').length;

test('AC56 reload (changed after MD3; the amendment\'s (b) item 23): Home\'s scroll comes back after a full reload; back without a reload, nothing is put back', async () => {
  const setup = twoProjects();
  const store = device();
  let app = await loadSandbox({ ...setup, hash: '#/', now: NOW, store });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    window.scrollY = 640;
    app = await fullReload(app, setup, store);
    assert.deepEqual(app.scrolls.at(-1), [0, 640], 'Home scrolled where it was');
    // Hidden and shown again with no reload: the page keeps its own scroll, and the kept one is forgotten.
    await app.visibility('hidden');
    await app.visibility('visible');
    assert.equal(store.m.has('desk-scroll-v1'), false);
  } finally {
    app.restore();
  }
  // A reload to another address puts nothing back.
  const s2 = device();
  s2.m.set('desk-scroll-v1', JSON.stringify({ hash: '#/work', y: 300, sheetY: 0 }));
  const b = await loadSandbox({ ...setup, hash: '#/', now: NOW, store: s2 });
  try {
    await b.advance(1000);
    await b.advance(POLL_MS);
    assert.ok(!b.scrolls.some(([, y]) => y === 300), 'another screen\'s scroll is not put back');
  } finally {
    b.restore();
  }
});

// The Reviewer's stage 2 notes D1, D7 and D9 (AC56, changed after MD3, P-001-audit-reload.md, A).
test('AC56 reload (changed after MD3; the Reviewer\'s D1): words typed for a project the desk can\'t read are kept — through a reload while it fails, its card not drawn — and come back once it is read again', async () => {
  const setup = twoProjects();
  const store = device();
  let app = await loadSandbox({ ...setup, hash: waitingCard(Q_ID), now: NOW, store });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await typeIn(app, WORDS_TYPED);
    await app.key('Escape');
    // The project's read now fails, and the question file is gone from what the read would see: judged only for a
    // project read successfully, the words stay.
    const file = setup.repos.Alpha.files['questions/Alpha-pick.md'];
    assert.ok(file, 'the question file');
    delete setup.repos.Alpha.files['questions/Alpha-pick.md'];
    setup.repos.Alpha.fail = { state: 'cant-read', reason: 'no-access' };
    await app.advance(POLL_MS);
    app = await fullReload(app, setup, store);
    assert.equal(findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === Q_ID).length, 0, 'its card not drawn');
    assert.ok(JSON.parse(store.m.get('desk-sheet-words-v1')).words[`${Q_ID}#1`], 'kept while Alpha can\'t be read');
    await app.advance(5 * POLL_MS);
    assert.equal(JSON.parse(store.m.get('desk-sheet-words-v1')).words[`${Q_ID}#1`].text, WORDS_TYPED, 'still kept, poll after poll');
    // Read again: the card waits, and its sheet has the words.
    setup.repos.Alpha.files['questions/Alpha-pick.md'] = file;
    setup.repos.Alpha.fail = null;
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    await app.go(waitingCard(Q_ID));
    assert.equal(boxIn(app).value, WORDS_TYPED, 'back in its box');
  } finally {
    app.restore();
  }
});

test('AC56 reload (changed after MD3; the Reviewer\'s D7): the scroll being put back stops at the owner\'s own input — a tap, a wheel, a touch or a key — and the screen is not scrolled again', async () => {
  for (const ev of ['pointerdown', 'wheel', 'touchstart', 'keydown']) {
    const setup = twoProjects();
    const store = device();
    store.m.set('desk-scroll-v1', JSON.stringify({ hash: '#/', y: 640, sheetY: 0 }));
    const app = await loadSandbox({ ...setup, hash: '#/', now: NOW, store });
    try {
      // Before every project has been read, the restore keeps trying at each drawing.
      await app.flush();
      assert.ok(app.scrolls.some(([, y]) => y === 640), `${ev}: put back at the first drawing`);
      const n = app.scrolls.length;
      await app.docEvent(ev, {});
      await app.advance(1000);
      await app.advance(POLL_MS);
      assert.equal(app.scrolls.filter(([, y]) => y === 640).length, app.scrolls.slice(0, n).filter(([, y]) => y === 640).length, `${ev}: never scrolled back after the owner's input`);
    } finally {
      app.restore();
    }
  }
});

test('AC56 reload (changed after MD3; the Reviewer\'s D9): the kept scroll is removed from the device once it is read, so a second reload with no hiding between puts nothing back', async () => {
  const setup = twoProjects();
  const store = device();
  store.m.set('desk-scroll-v1', JSON.stringify({ hash: '#/', y: 640, sheetY: 0 }));
  let app = await loadSandbox({ ...setup, hash: '#/', now: NOW, store });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.ok(app.scrolls.some(([, y]) => y === 640), 'put back once');
    assert.equal(store.m.has('desk-scroll-v1'), false, 'removed once used');
    // A reload with no `pagehide` between (a crash, a forced reload): nothing kept, so nothing put back.
    app.restore();
    app = await loadSandbox({ ...setup, hash: '#/', now: NOW, store });
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.ok(!app.scrolls.some(([, y]) => y === 640), 'not put back a second time');
  } finally {
    app.restore();
  }
});

// Stage 2's design review, round 1, B1, carried to every sheet that opens from a fold: a Done row's sheet whose row sits
// under its group's "<n> more", which a reload keeps closed, gives the focus to that "<n> more" when it closes.
test('AC56 reload + AC89 (i): a Done row\'s sheet, its row under the group\'s "<n> more", open when the page reloads — Escape returns focus to the closed "<n> more" control, never to the body', async () => {
  const setup = longRuling();
  for (const n of [1, 2, 3]) {
    setup.repos.Alpha.commit({ [`decisions/questions/P-001-more-${n}.md`]: `Ruling: A, number ${n}\n` });
    setup.repos.Alpha.history[`decisions/questions/P-001-more-${n}.md`] = [{ commit: { committer: { date: new Date(NOW - (40 + n) * 60e3).toISOString() } } }];
  }
  const HIDDEN = 'Alpha|question|questions/P-001-more-3.md#answer'; // the fifth row: under "2 more"
  const store = device();
  let app = await loadSandbox({ ...setup, hash: '#/waiting/Alpha', now: NOW, store });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await app.tap(keyed(app, 'more:Alpha'));
    keyed(app, `drowlink:${HIDDEN}`).click();
    await app.go(waitingCard(HIDDEN));
    assert.ok(sheetEl(app), 'its sheet');
    app = await fullReload(app, setup, store);
    assert.ok(sheetEl(app), 'back after the reload');
    assert.equal(keyed(app, 'more:Alpha').attrs['aria-expanded'], 'false', 'the group\'s "<n> more" closed after the reload');
    assert.equal(keyed(app, `drowlink:${HIDDEN}`), null, 'its row not drawn');
    await app.key('Escape');
    await app.flush();
    assert.equal(app.loc.hash, '#/waiting/Alpha');
    assert.equal(document.activeElement, keyed(app, 'more:Alpha'), 'focus on the fold\'s own control');
  } finally {
    app.restore();
  }
});
