// AC56 (spec S-001, trial-view notes 8, 9 and 14): moving about the sandbox, closing what is open,
// and a refresh that leaves the screen exactly as the owner left it.
// ac-test: S-001/AC56
import test from 'node:test';
import assert from 'node:assert/strict';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { byClass, findAll } from './sandbox-helpers.mjs';
import { twoProjects, opened, v3, fullRepo, longRuling, lineLines } from './sandbox-fixtures.mjs';
import { repo } from './fake-desk.mjs';
import { j11Files } from './sandbox-helpers.mjs';
import { readFileSync } from 'node:fs';
import { CONFIG, SRC } from './helpers.mjs';

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

test('AC56 refresh, Timeline: a milestone\'s detail and the standard milestones box, opened, stay open', async () => {
  const setup = twoProjects();
  const app = await opened(setup, '#/p/Alpha/timeline');
  try {
    const std = findAll(app.view, (e) => e.tag === 'details' && /^std:/.test(e.dataset.k || ''))[0];
    std.setAttribute('open', '');
    const msBtn = findAll(app.view, (e) => e.tag === 'button' && /^tlms-btn:/.test(e.dataset.k || ''))[0];
    msBtn.click();
    await app.flush();
    assert.equal(msBtn.attrs['aria-expanded'], 'true');
    const detail = findAll(app.view, (e) => /^tldetail:/.test(e.dataset.k || ''))[0];
    assert.ok(detail, "the milestone's detail is open in place");
    await everyRefresh(app, setup);
    assert.ok(app.view.contains(std) && 'open' in std.attrs, 'the standard milestones box stays open');
    assert.equal(msBtn.attrs['aria-expanded'], 'true', "the milestone's detail stays open");
    assert.ok(app.view.contains(detail));
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
