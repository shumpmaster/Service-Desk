// AC55 (spec S-001, trial-view notes 6 and 7): the Status screen's "Your last action" line, and
// "More detail" rebuilt in the new design inside the sandbox, with the accepted views' facts.
// ac-test: S-001/AC55
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, fixture } from './helpers.mjs';
import { repo, pr } from './fake-desk.mjs';
import { loadApp, findAll as findAllApp } from './page-harness.mjs';
import { readFileSync } from 'node:fs';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll, linksIn, El0 } from './sandbox-helpers.mjs';
import { NOW, iso, v3, v25, fullRepo, twoProjects, DESIGN_LAB_OPEN, DESIGN_LAB_WORDS, longRuling, lineLines, findKeyed, layout } from './sandbox-fixtures.mjs';
import { lastAction, ownerActions, doneToday } from '../../src/lib/sandbox.js';
import { POLL_MS } from '../../src/lib/scheduler.js';

const P = v3('A');
const dec = (min, extra = {}) => ({ shape: 'decision', item: 'P-001', gate: 'dor', card: 4, word: 'build', record: 'decisions/P-001/dor-4.md', proxy: false, time: iso(NOW - min * 60e3), ...extra });

/** A snapshot holding the given decisions/questions files: { name: [line-1 text, minutes ago, line-2 Proxy?] }. */
function snapWith(files, { withHistory = true, read = true } = {}) {
  const tree = new Map([['decisions/P-001/dor-4.md', {}]]);
  const records = new Map();
  const history = new Map();
  for (const [name, [line1, min, proxy]] of Object.entries(files)) {
    const path = `decisions/questions/${name}.md`;
    tree.set(path, {});
    if (read) records.set(path, { line1, line2Proxy: Boolean(proxy) });
    if (withHistory) history.set(path, { oldest: iso(NOW - min * 60e3) });
  }
  return { tree, records, history };
}
const la = (model, snap, project = P) => lastAction(project, model, snap, null, new Date(NOW), 'America/Chicago');

test('AC55: "Your last action" — a card answer latest, a ruling latest, a proxy ruling, a profile approval, neither, a v2.5 project, and ruling times not all in', () => {
  const card = la({ allEntries: [dec(30)] }, snapWith({ 'P-001-design-pick': ['Ruling: the five agreed screens are the direction', 90] }));
  assert.equal(card.text, 'Your last action: P-001: you answered dor-4 with build · 09:30');
  assert.equal(card.code, 'P-001 dor-4');
  assert.equal(card.link, 'https://github.com/shumpmaster/A/blob/main/decisions/P-001/dor-4.md');
  const ruling = la({ allEntries: [dec(120)] }, snapWith({ 'P-001-design-pick': ['Ruling: the five agreed screens are the direction', 30] }));
  assert.equal(ruling.text, 'Your last action: the five agreed screens are the direction · 09:30');
  assert.equal(ruling.code, 'P-001-design-pick');
  assert.equal(ruling.link, 'https://github.com/shumpmaster/A/blob/main/decisions/questions/P-001-design-pick.md');
  const proxy = la({ allEntries: [] }, snapWith({ 'P-001-x': ['Ruling: A', 10, true] }));
  assert.equal(proxy.text, 'Your last action: A (proxy) · 09:50');
  const cardProxy = la({ allEntries: [dec(5, { proxy: true })] }, snapWith({}));
  assert.equal(cardProxy.text, 'Your last action: P-001: you answered dor-4 with build (proxy) · 09:55');
  const profile = la({ allEntries: [] }, snapWith({ 'P-002-user-profile-1': ['Decision: approve', 10], 'P-002-other': ['Decision: approve', 5] }));
  assert.equal(profile.text, 'Your last action: approve · 09:50', 'a profile approval counts; a Decision: line elsewhere does not');
  assert.equal(la({ allEntries: [] }, snapWith({})).text, 'Your last action: not recorded');
  assert.equal(la({}, snapWith({}), v25('B')).text, 'Your last action: not recorded (operating model v2.5.1 records rulings in the ledger)');
  const pending = la({ allEntries: [dec(30)] }, snapWith({ 'P-001-design-pick': ['Ruling: x', 90] }, { withHistory: false }));
  assert.equal(pending.text, 'Your last action: not available yet', 'until every ruling\'s time has arrived');
  const unread = la({ allEntries: [dec(30)] }, snapWith({ 'P-001-design-pick': ['Ruling: x', 10] }, { read: false }));
  assert.equal(unread.text, 'Your last action: not available yet', 'a newer ruling not read yet may be the latest');
  const older = la({ allEntries: [dec(5)] }, snapWith({ 'P-001-design-pick': ['Ruling: x', 300] }, { read: false }));
  assert.equal(older.text, 'Your last action: P-001: you answered dor-4 with build · 09:55', 'an older one not read yet cannot be');
});

test('AC55 + AC52: a Critic\'s verdict in decisions/questions/, newer than every ruling and card answer, is never named nor shown in "Done today"; nor is a -notes file', () => {
  const snap = snapWith({ 'P-001-design-pick': ['Ruling: the five agreed screens', 60], 'P-001-milestones-adoption-critic-1': ['Verdict: FAIL', 5] });
  snap.tree.set('decisions/questions/P-001-design-pick-notes.md', {});
  snap.history.set('decisions/questions/P-001-design-pick-notes.md', { oldest: iso(NOW - 60e3) });
  const model = { allEntries: [dec(120)] };
  assert.equal(la(model, snap).text, 'Your last action: the five agreed screens · 09:00');
  assert.ok(!ownerActions(P, model, snap, null).actions.some((a) => /critic/.test(a.code)));
  const done = doneToday(P, model, snap, new Date(NOW), 'America/Chicago');
  assert.ok(!done.some((d) => /critic|Verdict/.test(`${d.text} ${d.code}`)), JSON.stringify(done));
});

test('AC55: the line sits just above the waiting bar, with its link and its code; the reason the merges are missing is one tap away', async () => {
  const setup = twoProjects();
  setup.repos.Alpha.commit({ 'decisions/questions/Alpha-older.md': 'Ruling: A\nProxy: done at the owner\'s request\n' });
  setup.repos.Alpha.history['decisions/questions/Alpha-older.md'] = [{ commit: { committer: { date: iso(NOW - 30 * 60e3) } } }];
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const screen = byClass(app.view, 'sb-screen')[0];
    const kids = screen.children;
    const at = kids.findIndex((c) => c.className === 'sb-last');
    assert.ok(at > 0, 'the line is there');
    assert.ok(kids[at + 1].className.includes('sb-actions'), 'just above the bar');
    const bar = byClass(kids[at + 1], 'sb-btn')[0];
    assert.match(bar.textContent, /decision|to merge|gate ruling|Nothing waits on you/, 'the bar says whether anything waits');
    const line = kids[at];
    assert.match(line.textContent, /^Your last action: A \(proxy\) · \d\d:\d\d Alpha-older/);
    assert.equal(linksIn(line).find((l) => l.text === 'Alpha-older').href, 'https://github.com/shumpmaster/Alpha/blob/main/decisions/questions/Alpha-older.md');
    assert.match(line.textContent, /your merges aren't recorded in what the desk reads/);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// A long ruling line, clipped (the owner's follow-up ruling of 2026-10-16, answer 2)

test('AC55 (2026-10-16): the owner\'s real record is one line 1 of about 1,800 characters, read as the desk reads it', () => {
  const line1 = DESIGN_LAB_OPEN.split('\n')[0];
  assert.ok(line1.length > 1700 && line1.length < 1900, `${line1.length} characters`);
  assert.ok(line1.startsWith('Ruling: 11 Ruling: 1 I see no need for it if it’s not doing anything right now., 2 Yes, 3 Agree, 4 Agree, 5 Yes, 6 Yes, 7 Under decisions, 8 Keep, 9 Linked, 10 Go with the recommendation., 11 Yes'));
  assert.ok(DESIGN_LAB_WORDS.startsWith('11 Ruling: 1 I see no need'));
  assert.ok(DESIGN_LAB_WORDS.endsWith('(only dropped or killed ones go under Closed)?'), 'to the end of line 1');
});

for (const [w, h] of [[360, 740], [414, 896]]) {
  test(`AC55 (2026-10-16) at ${w}×${h}: with the owner's real record as the latest ruling, "Your last action" shows its first three lines faded, then its time and code outside the control; the control "Show the whole of P-001-design-lab-open" opens a bubble whose text is the words exactly, held in the viewport above the bottom bar; Escape, a tap outside, "Close" and a second tap each close it, focus back on the control`, async () => {
    const setup = longRuling();
    const app = await loadSandbox({ ...setup, hash: '#/p/Alpha', now: NOW });
    const undo = layout(El0);
    try {
      window.innerHeight = h;
      await app.advance(1000);
      await app.advance(POLL_MS);
      const line = byClass(app.view, 'sb-last')[0];
      assert.equal(line.textContent.replace(/Your merges\?.*$/, ''), `Your last action: ${DESIGN_LAB_WORDS} · 09:50 P-001-design-lab-open`, 'the whole line, word for word, then the time and code');
      assert.equal(findKeyed(app, 'line:last'), null, 'until the browser has measured it, the line is plain text');
      lineLines(app, 'last', 47);
      await app.resize(w);
      const ctl = findKeyed(app, 'line:last');
      assert.ok(ctl, 'past three lines: a control');
      assert.equal(ctl.tag, 'button');
      assert.equal(ctl.attrs.type, 'button');
      assert.ok(!('tabindex' in ctl.attrs) && !('disabled' in ctl.attrs), 'in the tab order');
      assert.equal(ctl.attrs['aria-label'], 'Show the whole of P-001-design-lab-open');
      assert.equal(ctl.attrs['aria-expanded'], 'false');
      assert.equal(byClass(ctl, 'sb-line-w')[0].textContent, DESIGN_LAB_WORDS, 'the page holds the whole line; the box shows three lines of it');
      assert.ok(findKeyed(app, 'lineclip:last').className.split(' ').includes('over'), 'the fade at the cut');
      assert.doesNotMatch(line.textContent, /…$|\.\.\.$/, 'no ellipsis added');
      // The time and the code follow the box, outside the control; a tap on them opens nothing.
      const meta = byClass(line, 'sb-line-m')[0];
      assert.ok(meta && !findAll(ctl, (e) => e === meta).length, 'the time and code sit outside the button');
      assert.match(meta.textContent, /^09:50 P-001-design-lab-open$/, 'clipped, the time and code start their own line');
      const code = linksIn(meta).find((l) => l.text === 'P-001-design-lab-open');
      assert.equal(code.href, 'https://github.com/shumpmaster/Alpha/blob/main/decisions/questions/P-001-design-lab-open.md');
      await app.tap(byClass(meta, 'sb-last-when')[0]);
      await app.tap(code.el);
      assert.equal(findKeyed(app, 'linebubble:last'), null, 'a tap on the time or the code does not open the bubble');
      assert.equal(app.loc.hash, '#/p/Alpha');
      for (const how of ['Escape', 'outside', 'Close', 'second tap']) {
        await app.tap(findKeyed(app, 'line:last'));
        const bub = findKeyed(app, 'linebubble:last');
        assert.ok(bub, `a tap opens it (${how})`);
        assert.equal(bub.attrs.role, 'dialog');
        assert.equal(ctl.attrs['aria-expanded'], 'true');
        assert.equal(ctl.attrs['aria-controls'], bub.attrs.id);
        assert.equal(byClass(bub, 'sb-bubble-t')[0].textContent, DESIGN_LAB_WORDS, 'the whole line, word for word, from "11 Ruling: 1 I see no need…" to its end');
        assert.ok(bub.className.split(' ').includes('held'), `taller than the viewport: held in it (${bub.className})`);
        assert.equal(bub.children[0], byClass(bub, 'sb-bubble-top')[0], '"Close" at its top');
        const close = byClass(bub.children[0], 'sb-close')[0];
        assert.equal(close.attrs['aria-label'], 'Close');
        if (how === 'Escape') await app.key('Escape');
        else if (how === 'outside') await app.tap(app.view);
        else if (how === 'Close') await app.tap(close);
        else await app.tap(findKeyed(app, 'line:last'));
        assert.equal(findKeyed(app, 'linebubble:last'), null, `closed by ${how}`);
        assert.equal(document.activeElement, findKeyed(app, 'line:last'), `focus back on the control (${how})`);
        assert.equal(ctl.attrs['aria-expanded'], 'false');
      }
      for (const key of ['Enter', ' ']) {
        ctl.focus();
        ctl.dispatch('keydown', { key });
        await app.flush();
        assert.ok(findKeyed(app, 'linebubble:last'), `${key === ' ' ? 'Space' : key} opens it`);
        ctl.dispatch('keydown', { key });
        await app.flush();
        assert.equal(findKeyed(app, 'linebubble:last'), null, `${key === ' ' ? 'Space' : key} again closes it`);
      }
      // A ruling of three lines or fewer: whole, at its own height, no fade, no control.
      await app.go('#/p/Beta');
      lineLines(app, 'last', 1);
      await app.resize(w);
      assert.equal(findKeyed(app, 'line:last'), null, 'a short ruling has no control');
      assert.ok(!findKeyed(app, 'lineclip:last').className.includes('over'), 'and no fade');
      // Draft 4 (N1): the one-line form, "<words> · <time>" then the code, all in the line itself.
      const shortLine = findKeyed(app, 'lineclip:last');
      assert.match(shortLine.textContent, /^Your last action: B, keep it as it is · 09:55 P-002-short$/, 'words, time and code on one line');
      assert.equal(byClass(byClass(app.view, 'sb-last')[0], 'sb-line-m').length, 0, 'nothing moved to a line of its own');
    } finally {
      undo();
      app.restore();
    }
  });
}

test('AC55 (2026-10-16): a card answer and a profile approval are never clipped (rulings only); the clip judged again when the width changes', async () => {
  const setup = longRuling();
  setup.repos.Beta.commit({ 'decisions/questions/P-002-user-profile-1.md': `Decision: ${'approve '.repeat(80)}\n` });
  setup.repos.Beta.history['decisions/questions/P-002-user-profile-1.md'] = [{ commit: { committer: { date: iso(NOW - 60e3) } } }];
  const app = await loadSandbox({ ...setup, hash: '#/p/Beta', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.match(byClass(app.view, 'sb-last')[0].textContent, /^Your last action: approve approve/);
    assert.equal(findKeyed(app, 'lineclip:last'), null, 'a profile approval has no line box: never clipped');
    await app.go('#/p/Alpha');
    lineLines(app, 'last', 4);
    await app.resize(360);
    assert.ok(findKeyed(app, 'line:last'), 'four lines at 360 px: the control');
    await app.tap(findKeyed(app, 'line:last'));
    assert.ok(findKeyed(app, 'linebubble:last'));
    lineLines(app, 'last', 3);
    await app.resize(414);
    assert.equal(findKeyed(app, 'line:last'), null, 'three lines at 414 px: no control');
    assert.equal(findKeyed(app, 'linebubble:last'), null, 'and its bubble is gone');
  } finally {
    app.restore();
  }
});

test('AC55 (draft 4, N3): a clipped proxy ruling\'s bubble holds line 1 only, word for word; "(proxy)" sits outside it, after the clipped words', async () => {
  const setup = longRuling();
  setup.repos.Alpha.commit({ 'decisions/questions/P-001-design-lab-open.md': DESIGN_LAB_OPEN.replace('\n', '\nProxy: done at the owner\'s request\n') });
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    lineLines(app, 'last', 47);
    await app.resize(360);
    const ctl = findKeyed(app, 'line:last');
    assert.equal(byClass(ctl, 'sb-line-w')[0].textContent, DESIGN_LAB_WORDS);
    assert.doesNotMatch(ctl.textContent, /\(proxy\)/, 'not in the control');
    const meta = byClass(byClass(app.view, 'sb-last')[0], 'sb-line-m')[0];
    assert.match(meta.textContent, /^\(proxy\) · 09:50 P-001-design-lab-open$/, 'after the clipped words, outside the control');
    await app.tap(ctl);
    const bub = findKeyed(app, 'linebubble:last');
    assert.equal(byClass(bub, 'sb-bubble-t')[0].textContent, DESIGN_LAB_WORDS, 'line 1 only, word for word');
    assert.doesNotMatch(bub.textContent, /\(proxy\)/, 'no "(proxy)" in the bubble');
  } finally {
    app.restore();
  }
});

test('AC55 (draft 4, B1): while the whole-line bubble is open, a poll bringing a new ruling whose time is unread leaves the line and the bubble as they were, scrolled where they were, with "A newer action is arriving. Close this to see it."; once closed, the line reads "not available yet", then the new ruling', async () => {
  const setup = longRuling();
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    lineLines(app, 'last', 47);
    await app.resize(360);
    const ctl = findKeyed(app, 'line:last');
    await app.tap(ctl);
    const bub = findKeyed(app, 'linebubble:last');
    bub.scrollTop = 120;
    const textBefore = byClass(bub, 'sb-bubble-t')[0].textContent;
    // A new ruling lands; its history read is held back, so its time is not yet read.
    setup.repos.Alpha.commit({ 'decisions/questions/P-001-newer.md': 'Ruling: C, the newest\n' });
    setup.repos.Alpha.history['decisions/questions/P-001-newer.md'] = [{ commit: { committer: { date: iso(NOW - 60e3) } } }];
    const call = app.server.call;
    let holdHistory = true;
    app.server.call = async (path, body) => {
      if (holdHistory && body && Array.isArray(body.history) && body.history.includes('decisions/questions/P-001-newer.md')) {
        const r = await call(path, { ...body, history: body.history.filter((x) => x !== 'decisions/questions/P-001-newer.md') });
        return r;
      }
      return call(path, body);
    };
    await app.advance(POLL_MS);
    await app.tick();
    // The data now says "not available yet": what lastAction alone would draw.
    assert.equal(lastAction(v3('Alpha'), app.desk.model('Alpha'), app.desk.snapshot('Alpha'), null, new Date(app.now), 'America/Chicago').state, 'pending', 'the fixture: the line would change');
    assert.equal(findKeyed(app, 'linebubble:last'), bub, 'the same bubble, still open');
    assert.equal(bub.scrollTop, 120, 'at the same scroll position');
    assert.equal(byClass(bub, 'sb-bubble-t')[0].textContent, textBefore, 'unchanged');
    assert.equal(findKeyed(app, 'line:last'), ctl, 'on the same control');
    const note = byClass(bub, 'sb-bubble-note')[0];
    assert.ok(note, 'it says so');
    assert.equal(note.textContent, 'A newer action is arriving. Close this to see it.');
    assert.doesNotMatch(app.text(), /not available yet/, 'the line stays as it was while the bubble is open');
    await app.tap(byClass(bub, 'sb-close')[0]);
    assert.equal(findKeyed(app, 'linebubble:last'), null, 'closed by the owner');
    assert.match(byClass(app.view, 'sb-last')[0].textContent, /^Your last action: not available yet/, 'then the line shows its new state');
    holdHistory = false;
    app.server.call = call;
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    lineLines(app, 'last', 1); // the browser's measure of the new, short line
    await app.resize(360);
    assert.match(byClass(app.view, 'sb-last')[0].textContent, /^Your last action: C, the newest · 09:59 P-001-newer/, 'and the new ruling once its time arrives');
  } finally {
    app.restore();
  }
});

test('AC55 + AC54 (build review 1, N2): a turned phone places an open bubble again, so it stays inside the screen and clear of the bottom bar', async () => {
  const setup = longRuling();
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha', now: NOW });
  const undo = layout(El0, { bubbleTop: 200, bubbleH: 200 });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    lineLines(app, 'last', 47);
    await app.resize(360);
    await app.tap(findKeyed(app, 'line:last'));
    const bub = findKeyed(app, 'linebubble:last');
    assert.ok(bub.className.split(' ').includes('down'), `at 360×740 it fits below (${bub.className})`);
    window.innerHeight = 360; // turned: 740×360, the bubble's 200..400 now runs under the bar
    await app.resize(740);
    assert.equal(findKeyed(app, 'linebubble:last'), bub, 'still open, the same bubble');
    assert.ok(bub.className.split(' ').includes('held'), `placed again for the new screen: held inside it (${bub.className})`);
    window.innerHeight = 740;
    await app.resize(360);
    assert.ok(bub.className.split(' ').includes('down'), `turned back: below its control again (${bub.className})`);
  } finally {
    undo();
    app.restore();
  }
});

test('AC55 + AC54 (2026-10-16): every bubble is held to the viewport\'s height less a margin, clear of the bottom bar, scrolling up and down inside itself and never sideways, its "Close" row in view (the CSS; the browser check is in the pull request)', () => {
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = (sel) => {
    const m = new RegExp(`(?:^|\\n)${sel.replace(/[.()>]/g, (c) => `\\${c}`)} \\{([^}]*)\\}`).exec(css);
    assert.ok(m, `${sel} has its rule`);
    return m[1];
  };
  const b = rule('.sb-bubble');
  assert.match(b, /max-height: calc\(100vh - var\(--sb-clear, 0px\) - 16px\); max-height: calc\(100dvh - var\(--sb-clear, 0px\) - 16px\);/, 'the viewport\'s height less 8 px at each end and the bar');
  assert.match(b, /overflow-y: auto; overflow-x: hidden;/, 'up and down inside itself, never sideways');
  // Build review 1, N4: the room kept clear is the bar's own height, one value for both.
  assert.match(rule('.sb-screen:has(> .sb-dock)'), /--sb-clear: var\(--sb-dock-h\);/, 'on the project screens, the room kept clear is the bottom bar\'s height');
  assert.match(rule('.sb-dock'), /height: var\(--sb-dock-h\); overflow: hidden;/, 'and the bar is drawn at exactly that height');
  assert.match(css, /html\.sb \{[^}]*--sb-dock-h: 65px;/, 'set once (65 px: 52 px tabs, 4 + 8 px padding, 1 px hairline)');
  assert.match(rule('.sb-tab'), /min-height: 52px;/, 'the tabs fit the bar: 52 + 12 + 1 = 65');
  assert.match(rule('.sb-dock'), /padding: 4px 8px 8px;/);
  assert.match(rule('.sb-dock'), /border-top: 1px solid/);
  assert.match(rule('.sb-bubble-top'), /position: sticky; top: -6px; background: var\(--surf\);/, 'its top row, with "Close", stays in view while it scrolls');
  const held = /\n(\.sb-bubble\.held,[^{]*)\{([^}]*)\}/.exec(css);
  assert.ok(held, 'the held rule');
  for (const sel of ['.sb-sumbox > .sb-bubble.held', '.sb-linebox > .sb-bubble.held', '.sb-bubble.held.col-l', '.sb-bubble.held.col-r', '.sb-sumbox > .sb-bubble.held.col-l', '.sb-sumbox > .sb-bubble.held.col-r']) {
    assert.ok(held[1].split(',').map((x) => x.trim()).includes(sel), `it outweighs the placed rules: ${sel}`);
  }
  assert.match(held[2], /position: fixed; top: 8px; bottom: auto; left: max\(16px, calc\(50% - 264px\)\); right: max\(16px, calc\(50% - 264px\)\);/, 'held in the viewport, inside the gutters');
  // The line box: at most three lines, the rest hidden, a fade into the row's background, no ellipsis.
  assert.match(rule('.sb-lineclip'), /line-height: 1\.4; max-height: 4\.2em; overflow: hidden; overflow: clip;/);
  assert.match(rule('.sb-lineclip.over'), /height: 4\.2em;/);
  assert.match(rule('.sb-lineclip.over::after'), /background: linear-gradient\(to right, transparent, var\(--surf\) 85%\);/);
  assert.match(rule('.sb-last'), /background: var\(--surf\);/, 'the fade ends in "Your last action"\'s background');
  assert.match(rule('.sb-card'), /background: var\(--surf\);/, 'and in "Done today"\'s');
  assert.doesNotMatch(css, /line-clamp|text-overflow:\s*ellipsis/);
});

// ---------------------------------------------------------------------------
// "More detail": the same facts as the accepted views

/** The fixtures AC9–AC12 and AC20–AC23's tests use, together: a card, a question, a ruling, the log, the usage record, a PR; and a v2.5 project. */
function detailRepos() {
  const sd = repo({
    'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
    'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
    'status/outcomes.jsonl': fixture('service-desk/status/outcomes-usage-frozen.jsonl'),
    'status/P-001.toml': fixture('service-desk/status/P-001@d4d0110.toml'),
    'queue/P-001-dor-fail-2.md': fixture('service-desk/queue/P-001-dor-fail-2.md'),
    'queue/P-001-stop-6.md': fixture('service-desk/queue/P-001-stop-6.md'), 'decisions/P-001/stop-6.md': 'Decision: re-scope\n',
    'questions/Q-005-sources.md': fixture('service-desk/questions/Q-005-sources.md'),
  }, [pr(61, 'Desk: a change to merge')], [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  const poom = repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), 'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md'),
    'questions/Q-030-x.md': fixture('service-desk/questions/Q-005-sources.md') });
  return { 'Service-Desk': sd, 'Personal-Org-Operating-Model': poom };
}

// Words that only move about the accepted page (its links back and across, its headings naming the page).
const NAV = /^(← All projects|← Service-Desk|← Personal-Org-Operating-Model|Time asked of you|Agents| · |Time asked of you — .*|Agents — .*|Service-Desk|Personal-Org-Operating-Model)$/;

/** The sandbox's own navigation words, and nothing else: its marker, Home, Back and the bottom bar's four tabs. */
const SB_NAV = /^(Sandbox: candidate design|Home|Back|Status|Timeline|Team|Queue)$/;

/** Each element's own text (its text-node children, joined) and each leaf's text, in the accepted view. */
function facts(view) {
  const out = new Set();
  const walk = (n) => {
    for (const c of n.children || []) {
      if (c.tag) {
        const own = c.children.filter((x) => !x.tag).map((x) => x.textContent).join('').replace(/\s+/g, ' ').trim();
        if (own) out.add(own);
        walk(c);
      }
    }
  };
  walk(view);
  return [...out].filter((t) => !NAV.test(t) && /[A-Za-z0-9]/.test(t));
}

const WHEN = Date.parse('2026-10-07T12:00:00Z');

for (const [kind, acceptedHash, sandboxHash] of [
  ['Pipeline', '', 'pipeline'], ['Time asked', 'asked', 'asked'], ['Agents', 'agents', 'agents'],
]) {
  for (const name of ['Service-Desk', 'Personal-Org-Operating-Model']) {
    if (kind === 'Agents' && name !== 'Service-Desk') continue;
    test(`AC55: the rebuilt ${kind} view for ${name} shows the same values and words as the accepted view`, async () => {
      const route = `#/p/${name}${acceptedHash ? `/${acceptedHash}` : ''}`;
      const acc = await loadApp({ hash: route, repos: detailRepos(), now: WHEN });
      let accepted;
      let acceptedText;
      try {
        await acc.advance(1000);
        await acc.advance(POLL_MS);
        accepted = facts(acc.els.view);
        acceptedText = acc.els.view.textContent.replace(/\s+/g, ' ');
      } finally {
        acc.restore();
      }
      assert.ok(accepted.length >= 3, `${accepted.length} facts`);
      if (process.env.SHOW_FACTS) console.log(kind, name, accepted.length, accepted.slice(0, 40));
      const sb = await loadSandbox({ config: CONFIG, repos: detailRepos(), hash: `#/p/${name}/${sandboxHash}`, now: WHEN });
      try {
        await sb.advance(1000);
        await sb.advance(POLL_MS);
        // A fold's words are in the text whether it is open or not, as in the accepted view's details.
        const text = sb.view.textContent.replace(/\s+/g, ' ');
        for (const f of accepted) assert.ok(text.includes(f), `${kind} for ${name}: "${f}" is missing`);
        assert.doesNotMatch(text, /Can't show/);
        // And the other way (build review N1): every value and word of the sandbox's view is in the
        // accepted view, the sandbox's navigation words aside (its marker, Home and Back, the bottom bar's tabs).
        const extra = facts(sb.view).filter((f) => !SB_NAV.test(f) && !acceptedText.includes(f));
        assert.deepEqual(extra, [], `${kind} for ${name}: the sandbox shows words the accepted view does not`);
      } finally {
        sb.restore();
      }
    });
  }
}

test('AC55: no element of the sandbox links to an accepted M1 or M2 view, on any route', async () => {
  const app = await loadSandbox({ config: CONFIG, repos: detailRepos(), hash: '#/', now: WHEN });
  try {
    await app.advance(1000);
    for (const b of byClass(app.view, 'sb-hg-btn')) if (b.attrs['aria-expanded'] === 'false') { b.click(); await app.flush(); }
    const seen = new Set();
    const queue = ['#/'];
    while (queue.length && seen.size < 400) {
      const hsh = queue.shift();
      if (seen.has(hsh)) continue;
      seen.add(hsh);
      await app.go(hsh);
      for (const l of linksIn(app.view)) {
        const href = l.href || '';
        if (!href) continue; // an anchor with no href (a strip phase with no run) links nowhere
        assert.ok(href.startsWith('#/') || href.startsWith('https://github.com/'), `${hsh}: ${href}`);
        if (href.startsWith('#/')) {
          assert.doesNotMatch(href, /^#\/p\/[^/]+\/(card|q|hold|merge)\//, `${hsh}: ${href} is an accepted view`);
          if (!seen.has(href)) queue.push(href);
        }
      }
    }
    assert.ok(seen.has('#/p/Service-Desk/pipeline') && seen.has('#/p/Service-Desk/asked') && seen.has('#/p/Service-Desk/agents'));
    assert.ok(seen.size > 20, `${seen.size} routes`);
  } finally {
    app.restore();
  }
  void findAll;
  void findAllApp;
  void fullRepo;
});
