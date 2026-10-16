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
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const sheetEl = (app) => byClass(app.view, 'sb-sheet')[0] || null;

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

test('AC56 back: Home → Status → Queue → a sheet → Timeline; "Back" twice gives Queue then Status, "Home" gives Home; no "Back" on a screen opened first', async () => {
  const app = await opened(twoProjects(), '#/');
  try {
    assert.equal(byClass(app.view, 'sb-prev').length, 0, 'Home has no Back');
    await app.go('#/p/Alpha');
    await app.go('#/p/Alpha/queue');
    await app.go('#/p/Alpha/queue/pr%3A80');
    await app.go('#/p/Alpha/timeline');
    const back = () => byClass(app.view, 'sb-prev')[0];
    assert.equal(back().attrs['aria-label'], 'Back');
    assert.equal(byClass(app.view, 'sb-back')[0].attrs['aria-label'], 'Home');
    back().click();
    await app.flush();
    assert.equal(app.loc.hash, '#/p/Alpha/queue', 'Back goes one screen back: the sheet was not a screen');
    assert.equal(sheetEl(app), null, 'and the queue shows without the sheet');
    back().click();
    await app.flush();
    assert.equal(app.loc.hash, '#/p/Alpha');
    assert.match(app.text(), /Current status/);
    assert.equal(byClass(app.view, 'sb-back')[0].attrs.href, '#/');
    await app.go('#/');
    assert.match(app.text(), /Your desk/);
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
});

// Each sheet: the screen it sits on, the control that opens it, and its route.
const SHEETS = [
  ['the response sheet', '#/p/Alpha/queue', 'row:q:Alpha-pick', '#/p/Alpha/queue/q%3AAlpha-pick'],
  ['the pull request sheet', '#/p/Alpha/queue', 'row:pr:80', '#/p/Alpha/queue/pr%3A80'],
  ['the summary sheet', '#/p/Alpha/team/critic', 'log:0', '#/p/Alpha/team/critic/e/0'],
  ['the Working now sheet', '#/p/Alpha/team/builder', 'log:now', '#/p/Alpha/team/builder/now'],
  ['the info screen', '#/p/Alpha', 'info', '#/p/Alpha/info'],
];

test('AC56 close: every sheet has "Close" at its top (44 px), and the control, a tap outside and Escape each close it, with focus back on its opener', async () => {
  const app = await opened(twoProjects(), '#/');
  try {
    for (const [what, screen, openerKey, route] of SHEETS) {
      for (const how of ['control', 'outside', 'escape']) {
        await app.go(screen);
        const op = keyed(app, openerKey);
        assert.ok(op, `${what}: its opener ${openerKey}`);
        op.click(); // the tap that follows the link
        await app.go(route);
        const sh = sheetEl(app);
        assert.ok(sh, `${what}: open`);
        const top = byClass(sh, 'sb-sheet-top')[0];
        assert.equal(sh.children[0], top, `${what}: the close control sits at the top`);
        const close = byClass(top, 'sb-close')[0];
        assert.equal(close.attrs['aria-label'], 'Close');
        assert.equal(document.activeElement, close, `${what}: focus moves into the sheet`);
        if (how === 'control') await app.tap(close);
        else if (how === 'outside') await app.tap(byClass(app.view, 'sb-scrim')[0]); // a real tap: the press takes focus off the sheet first
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

test('AC56 close: the "Latest" bubble has "Close" at its top, and the control, a tap outside and Escape each close it, focus back on its control without reopening it', async () => {
  const app = await opened(twoProjects(), '#/');
  try {
    for (const how of ['control', 'outside', 'escape']) {
      await app.advance(2000);
      const ctl = keyed(app, 'latest:Alpha');
      await app.tap(ctl); // a real tap: the press, the focus it gives, the click
      const bub = keyed(app, 'bubble:Alpha');
      assert.ok(bub);
      const close = byClass(bub.children[0], 'sb-close')[0];
      assert.equal(close.attrs['aria-label'], 'Close');
      if (how === 'control') close.click();
      else if (how === 'outside') await app.tap(app.view); // the page's background: the press takes focus off the control, as in a browser
      else await app.key('Escape');
      await app.flush();
      assert.equal(keyed(app, 'bubble:Alpha'), null, `closed by ${how}`);
      assert.equal(document.activeElement, keyed(app, 'latest:Alpha'), `focus back on the control (${how})`);
      assert.equal(keyed(app, 'bubble:Alpha'), null, `and it does not reopen (${how})`);
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
  if (id.startsWith('done:')) keyed(app, 'done-today').setAttribute('open', '');
  lineLines(app, id, 47);
  await app.resize(360);
  return { app, setup };
}

for (const [where, hash, id] of [['"Your last action"', '#/p/Alpha', 'last'], ['"Done today"', '#/p/Alpha/queue', 'done:P-001-design-lab-open']]) {
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
    assert.match(app.text(), /Current status/, 'the same screen');
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

test('AC56 refresh, Queue (step 3b, 2026-10-16): "Done today" opened, with a ruling row\'s whole-line bubble open and scrolled part way, all stay through every kind of refresh', async () => {
  const { app, setup } = await longLine('#/p/Alpha/queue', 'done:P-001-design-lab-open');
  try {
    const fold = keyed(app, 'done-today');
    const ctl = keyed(app, 'line:done:P-001-design-lab-open');
    await app.tap(ctl);
    const bub = keyed(app, 'linebubble:done:P-001-design-lab-open');
    assert.ok(bub);
    bub.scrollTop = 300;
    app.scrolls.length = 0;
    await everyRefresh(app, setup);
    assert.equal(keyed(app, 'done-today'), fold);
    assert.ok('open' in fold.attrs, '"Done today" stays open');
    assert.equal(keyed(app, 'linebubble:done:P-001-design-lab-open'), bub, 'the same bubble, still open');
    assert.equal(bub.scrollTop, 300, 'scrolled part way, where it was');
    assert.equal(keyed(app, 'line:done:P-001-design-lab-open'), ctl);
    assert.equal(ctl.attrs['aria-expanded'], 'true');
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

for (const how of ['Close', 'Escape', 'outside', 'second tap']) {
  test(`AC56 refresh, Queue (step 3b, draft 5): "Done today" open with a ruling row's bubble open and scrolled part way, the clock run past midnight in ownerTimeZone and a poll that drops the row: the bubble stays, unchanged, with the notice; closed (${how}), the fold shows its new state and focus is on its header`, async () => {
    const setup = longRuling();
    // Asia/Tokyo: NOW (15:00Z) is midnight there; the rulings were filed at 23:50 and 23:30 the day before.
    setup.config = { ...setup.config, ownerTimeZone: 'Asia/Tokyo' };
    const app = await loadSandbox({ ...setup, hash: '#/p/Alpha/queue', now: NOW - 3 * 60e3 });
    try {
      await app.advance(1000);
      await app.advance(POLL_MS);
      const fold = keyed(app, 'done-today');
      fold.setAttribute('open', '');
      lineLines(app, 'done:P-001-design-lab-open', 47);
      await app.resize(360);
      assert.match(keyed(app, 'done-today-h').textContent, /^Done today \(2\)$/, 'before midnight: two rulings today');
      const ctl = keyed(app, 'line:done:P-001-design-lab-open');
      await app.tap(ctl);
      const bub = keyed(app, 'linebubble:done:P-001-design-lab-open');
      assert.ok(bub);
      bub.scrollTop = 300;
      const words = byClass(bub, 'sb-bubble-t')[0].textContent;
      app.scrolls.length = 0;
      await app.advance(3 * POLL_MS); // past midnight in Tokyo, with the polls that follow
      await app.tick();
      app.module.refresh();
      await app.flush();
      assert.ok(Date.now() > NOW, 'the clock is past midnight');
      assert.equal(keyed(app, 'linebubble:done:P-001-design-lab-open'), bub, 'the same bubble, still open');
      assert.equal(bub.scrollTop, 300, 'at the same scroll position');
      assert.equal(byClass(bub, 'sb-bubble-t')[0].textContent, words, 'unchanged');
      assert.equal(byClass(bub, 'sb-bubble-note')[0].textContent, 'This has changed since you opened it. Close this to see the latest.');
      assert.ok('open' in keyed(app, 'done-today').attrs, 'the fold stays open');
      assert.deepEqual(app.scrolls, []);
      if (how === 'Close') await app.tap(byClass(bub, 'sb-close')[0]);
      else if (how === 'Escape') await app.key('Escape');
      else if (how === 'outside') await app.tap(app.view);
      else await app.tap(keyed(app, 'line:done:P-001-design-lab-open'));
      assert.equal(keyed(app, 'linebubble:done:P-001-design-lab-open'), null, `closed by the owner (${how})`);
      assert.equal(keyed(app, 'done-today-h').textContent, 'Done today (0)', 'the fold shows its new state: the rulings were yesterday');
      assert.equal(keyed(app, 'line:done:P-001-design-lab-open'), null, 'the row and its control are gone');
      assert.equal(document.activeElement, keyed(app, 'done-today-h'), 'focus on "Done today"\'s header');
    } finally {
      app.restore();
    }
  });
}

test('AC56 refresh, Queue (step 3b, draft 5): a "Done today" row\'s bubble open: a new row today holds the fold as it was, with no notice (that row did not change); a change to that row adds the notice; closed and opened again, the bubble and fold show the latest, with no notice', async () => {
  const setup = longRuling();
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha/queue', now: NOW });
  const ID = 'done:P-001-design-lab-open';
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    keyed(app, 'done-today').setAttribute('open', '');
    lineLines(app, ID, 47);
    await app.resize(360);
    assert.equal(keyed(app, 'done-today-h').textContent, 'Done today (2)');
    await app.tap(keyed(app, `line:${ID}`));
    const bub = keyed(app, `linebubble:${ID}`);
    const words = byClass(bub, 'sb-bubble-t')[0].textContent;
    // Another ruling filed today: the open row itself is unchanged.
    setup.repos.Alpha.commit({ 'decisions/questions/P-001-later.md': 'Ruling: C, a later one\n' });
    setup.repos.Alpha.history['decisions/questions/P-001-later.md'] = [{ commit: { committer: { date: new Date(app.now).toISOString() } } }];
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.equal(keyed(app, `linebubble:${ID}`), bub, 'the same bubble, still open');
    assert.equal(keyed(app, 'done-today-h').textContent, 'Done today (2)', 'the fold held as it was: nothing moves under the open bubble');
    assert.equal(byClass(bub, 'sb-bubble-note').length, 0, 'no notice: its own row has not changed');
    // Now the open row's own record changes.
    const CHANGED = `Ruling: ${'a reworded design-lab ruling, '.repeat(40)}end`;
    setup.repos.Alpha.commit({ [DESIGN_LAB_PATH]: `${CHANGED}\n` });
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.equal(keyed(app, `linebubble:${ID}`), bub, 'still the same bubble');
    assert.equal(byClass(bub, 'sb-bubble-t')[0].textContent, words, 'unchanged');
    assert.equal(byClass(bub, 'sb-bubble-note')[0].textContent, 'This has changed since you opened it. Close this to see the latest.');
    await app.key('Escape');
    assert.equal(keyed(app, `linebubble:${ID}`), null, 'closed by the owner');
    assert.equal(keyed(app, 'done-today-h').textContent, 'Done today (3)', 'the fold shows its new state');
    lineLines(app, ID, 40);
    await app.resize(414);
    await app.resize(360);
    await app.tap(keyed(app, `line:${ID}`));
    const again = keyed(app, `linebubble:${ID}`);
    assert.ok(again, 'opened again');
    assert.equal(byClass(again, 'sb-bubble-t')[0].textContent, CHANGED.replace(/^Ruling: /, ''), 'the new words, not the held ones');
    assert.equal(byClass(again, 'sb-bubble-note').length, 0, 'and no notice');
    assert.equal(keyed(app, 'done-today-h').textContent, 'Done today (3)', 'the fold as it is now, not as it was held');
    await app.advance(POLL_MS);
    assert.equal(keyed(app, `linebubble:${ID}`), again, 'a refresh with nothing changed keeps it');
    assert.equal(byClass(again, 'sb-bubble-note').length, 0, 'with no notice');
  } finally {
    app.restore();
  }
});

test('AC56 refresh, Home: the Done group opened, the Active group closed, and a "Latest" bubble open all stay through every kind of refresh', async () => {
  const setup = { config: { ...CONFIG, projects: [v3('Alpha'), v3('Done-one')] },
    repos: { Alpha: fullRepo('Alpha'), 'Done-one': repo({ ...j11Files(), 'decisions/questions/P-001-graduation.md': 'Ruling: graduate\n' }) } };
  const app = await opened(setup, '#/');
  try {
    await app.advance(POLL_MS);
    keyed(app, 'hgroup-btn:done').click();
    keyed(app, 'hgroup-btn:active').click();
    await app.flush();
    const ctl = keyed(app, 'latest:Done-one');
    ctl.dispatch('pointerdown', { pointerType: 'touch' });
    ctl.click();
    await app.flush();
    const bub = keyed(app, 'bubble:Done-one');
    assert.ok(bub, 'the bubble is open');
    app.scrolls.length = 0;
    await everyRefresh(app, setup);
    assert.equal(keyed(app, 'hgroup-btn:done').attrs['aria-expanded'], 'true', 'Done stays open');
    assert.equal(keyed(app, 'hgroup-btn:active').attrs['aria-expanded'], 'false', 'Active stays closed');
    assert.equal(keyed(app, 'bubble:Done-one'), bub, 'the same bubble, still open');
    assert.match(app.text(), /waiting on you in all/, 'with the changed data shown');
    assert.deepEqual(app.scrolls, []);
  } finally {
    app.restore();
  }
});

test('AC56 refresh, Home (step 1b): the same groups, with a card\'s whole-summary bubble open in place of "Latest", all stay through every kind of refresh', async () => {
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
    assert.equal(keyed(app, 'bubble:Done-one'), null, 'in place of the "Latest" bubble: one bubble at a time');
    app.scrolls.length = 0;
    await everyRefresh(app, setup);
    assert.equal(keyed(app, 'hgroup-btn:done').attrs['aria-expanded'], 'true', 'Done stays open');
    assert.equal(keyed(app, 'hgroup-btn:active').attrs['aria-expanded'], 'false', 'Active stays closed');
    assert.equal(keyed(app, 'sumbubble:Done-one'), bub, 'the same bubble, still open');
    assert.equal(keyed(app, 'sum:Done-one'), ctl, 'on the same control');
    assert.equal(ctl.attrs['aria-expanded'], 'true');
    assert.equal(document.activeElement, ctl, 'which keeps the focus');
    assert.match(app.text(), /waiting on you in all/, 'with the changed data shown');
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
    assert.match(app.text(), /Current status/, 'the same screen');
    assert.equal(document.activeElement, more, 'focus stays on the same control');
    assert.ok(app.view.contains(more));
    assert.deepEqual(app.scrolls, [], 'no refresh moves the scroll');
  } finally {
    app.restore();
  }
});

test('AC56 refresh, Queue: an open, scrolled sheet with a choice picked and text typed (cursor mid-text) and "Done today" open all stay; its item answered, the sheet says so and keeps the text', async () => {
  const setup = twoProjects();
  const app = await opened(setup, '#/p/Alpha/queue');
  try {
    keyed(app, 'done-today').setAttribute('open', '');
    keyed(app, 'row:q:Alpha-pick').click();
    await app.go('#/p/Alpha/queue/q%3AAlpha-pick');
    const sh = sheetEl(app);
    sh.scrollTop = 240;
    byClass(sh, 'sb-chip')[1].click();
    await app.flush();
    const box = findAll(sh, (e) => e.tag === 'textarea' && /^box:/.test(e.dataset.k || ''))[0];
    assert.ok(box, 'the prefilled box');
    const typed = `${box.value}My own words, typed here.`;
    box.value = typed;
    box.dispatch('input', { target: box });
    box.focus();
    box.setSelectionRange(5, 5);
    app.scrolls.length = 0;
    await everyRefresh(app, setup);
    assert.equal(sheetEl(app), sh, 'the same sheet, still open');
    assert.equal(sh.scrollTop, 240, 'scrolled where it was');
    assert.equal(byClass(sh, 'sb-chip')[1].attrs['aria-checked'], 'true', 'the choice stays picked');
    assert.equal(document.activeElement, box, 'focus stays in the box');
    assert.equal(box.value, typed);
    assert.equal(box.selectionStart, 5, 'the cursor stays mid-text');
    assert.ok('open' in keyed(app, 'done-today').attrs, '"Done today" stays open');
    assert.deepEqual(app.scrolls, []);
    // A poll in which its item is answered: the sheet stays open, says so, and keeps the text.
    setup.repos.Alpha.commit({ 'decisions/questions/Alpha-pick.md': 'Ruling: B\n\nQuestion: questions/Alpha-pick.md\n' });
    await app.advance(POLL_MS);
    assert.equal(sheetEl(app), sh, 'still open');
    assert.match(sh.textContent, /This has left your queue/);
    assert.match(sh.textContent, /answer recorded: decisions\/questions\/Alpha-pick\.md is on main/);
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
    const ms = fold('Build-i1:M2B');
    const untied = fold('Design-i2:untied');
    assert.ok(ms && untied, 'both folds drawn');
    assert.equal(ms.attrs['aria-expanded'], 'false', 'every list starts folded');
    await app.tap(ms);
    await app.tap(untied);
    assert.equal(fold('Build-i1:M2B').attrs['aria-expanded'], 'true');
    const tasks = keyed(app, 'tasks:Build-i1:M2B');
    assert.ok(tasks, 'its sprints are open');
    window.scrollY = 2400; // the owner scrolled away from Now
    app.scrolls.length = 0;
    await everyRefresh(app, setup);
    assert.equal(fold('Build-i1:M2B').attrs['aria-expanded'], 'true', 'the milestone\'s sprints stay open');
    assert.equal(fold('Design-i2:untied').attrs['aria-expanded'], 'true', 'and the untied ones');
    assert.equal(keyed(app, 'tasks:Build-i1:M2B'), tasks, 'the same element');
    assert.deepEqual(app.scrolls, [], 'no scroll back to Now on a refresh');
  } finally {
    app.restore();
  }
});

test('AC56 refresh, Status (step 4b, 2026-10-16: AC57): one phase box folded and another opened from folded, and an earlier run\'s gathered standard milestones opened: each stays as it was, and the drawing\'s dots stay level with their phase names', async () => {
  const setup = withSD();
  const app = await opened(setup, '#/p/Service-Desk');
  const ys = { Done: 40, Launch: 140, Build: 300, Design: 560, Discovery: 820 };
  try {
    await app.advance(POLL_MS);
    const name = (ph) => findAll(keyed(app, `pbox:${ph}`), (e) => e.tag === 'button' && e.attrs['data-pname'] === ph)[0];
    await app.tap(name('Launch')); // fold an open box
    await app.tap(name('Discovery')); // open the one that starts folded
    await app.tap(keyed(app, 'fold:gather:Design-i1'));
    assert.equal(name('Launch').attrs['aria-expanded'], 'false');
    assert.equal(name('Discovery').attrs['aria-expanded'], 'true');
    assert.ok(keyed(app, 'gathered:Design-i1'));
    await everyRefresh(app, setup);
    assert.equal(name('Launch').attrs['aria-expanded'], 'false', 'Launch stays folded');
    assert.equal(name('Discovery').attrs['aria-expanded'], 'true', 'Discovery stays open');
    assert.ok(keyed(app, 'gathered:Design-i1'), 'the gathered milestones stay open');
    const undo = railLayout(ys);
    try {
      app.module.refresh();
      await app.flush();
      const dots = findAll(byClass(keyed(app, 'pboxes'), 'sb-rail')[0], (e) => e.attrs['data-kind'] === 'dot');
      for (const d of dots) assert.ok(Math.abs(Number(d.attrs.cy) - ys[d.attrs['data-phase']]) <= 1, `${d.attrs['data-phase']}: level with its name after the refresh`);
    } finally {
      undo();
    }
  } finally {
    app.restore();
  }
});

test('AC56: the 15-second tick changes only the time-dependent text; every other element is the same element before and after', async () => {
  for (const hash of ['#/', '#/p/Alpha', '#/p/Alpha/queue', '#/p/Alpha/queue/q%3AAlpha-pick', '#/p/Alpha/team', '#/p/Alpha/team/builder/now', '#/p/Alpha/timeline']) {
    const app = await opened(twoProjects(), hash);
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
      if (hash !== '#/p/Alpha/timeline') assert.ok(changed.some((e) => e._live), `${hash}: the time-dependent text did change`);
    } finally {
      app.restore();
    }
  }
});
