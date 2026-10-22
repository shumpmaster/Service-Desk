// AC55 (spec S-001, trial-view notes 6 and 7): the Status screen's "Your last action" line, and
// "More detail" rebuilt in the new design inside the sandbox, with the accepted views' facts.
// ac-test: S-001/AC55
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, fixture, FIX } from './helpers.mjs';
import { join } from 'node:path';
import { detailRepos, facts, WHEN, CASES } from './accepted-views.mjs';
import { repo, pr } from './fake-desk.mjs';
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

// Rewritten in stage 3 (S-001 AC55, "Changed by AC83", specs/S-001.md:4235-4237: "in the trial view "Your last
// action" sits under the project page's phase strip (frame 5)"; AC83, :6768-6771): the line sat just above
// the Status screen's waiting bar.
test('AC55, changed by AC83: the line sits under the page\'s phase strip, in small text, with its link and its code, and the row saying whether anything waits follows it; the reason the merges are missing is one tap away', async () => {
  const setup = twoProjects();
  setup.repos.Alpha.commit({ 'decisions/questions/Alpha-older.md': 'Ruling: A\nProxy: done at the owner\'s request\n' });
  setup.repos.Alpha.history['decisions/questions/Alpha-older.md'] = [{ commit: { committer: { date: iso(NOW - 30 * 60e3) } } }];
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const screen = byClass(app.view, 'sb-screen')[0];
    const kids = screen.children;
    const at = kids.findIndex((c) => c.dataset && c.dataset.k === 'under');
    assert.ok(at > 0, 'the lines under the strip are there');
    assert.equal(kids[at - 1].dataset.k, 'strip', 'under the phase strip');
    const line = byClass(kids[at], 'sb-last')[0];
    assert.ok(line, 'the line is there');
    assert.equal(kids[at + 1].dataset.k, 'page-rows', 'then the two rows');
    const waits = byClass(kids[at + 1], 'v2-prow')[0];
    assert.match(waits.textContent, /\d+ waits? on you|Nothing waiting on you/, 'the first says whether anything waits');
    assert.match(line.textContent, /^Your last action: A \(proxy\) · \d\d:\d\d Alpha-older/);
    assert.equal(linksIn(line).find((l) => l.text === 'Alpha-older').href, 'https://github.com/shumpmaster/Alpha/blob/main/decisions/questions/Alpha-older.md');
    assert.match(line.textContent, /your merges aren't recorded in what the desk reads/);
    // In small text (frame 5): the line takes --t-small on the page, not the old screen's quoted-record role.
    const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
    assert.match(css, /\.v2-proj \.sb-last-t, \.v2-proj \.sb-line-w, \.v2-proj \.sb-last-when, \.v2-proj \.sb-sep \{ font: var\(--t-small\); color: var\(--ink2\); \}/);
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

test('AC55 (draft 4, B1): while the whole-line bubble is open, a poll bringing a new ruling whose time is unread leaves the line and the bubble as they were, scrolled where they were, with "This has changed since you opened it. Close this to see the latest."; once closed, the line reads "not available yet", then the new ruling', async () => {
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
    assert.equal(note.textContent, 'This has changed since you opened it. Close this to see the latest.');
    assert.doesNotMatch(app.text(), /not available yet/, 'the line stays as it was while the bubble is open');
    await app.tap(byClass(bub, 'sb-close')[0]);
    assert.equal(findKeyed(app, 'linebubble:last'), null, 'closed by the owner');
    assert.match(byClass(app.view, 'sb-last')[0].textContent, /^Your last action: not available yet/, 'then the line shows its new state');
    assert.equal(findKeyed(app, 'line:last'), null, 'its control has gone with the old line');
    assert.equal(document.activeElement, findKeyed(app, 'last-action'), 'so focus goes to the "Your last action" line (draft 5)');
    assert.equal(findKeyed(app, 'last-action').attrs.tabindex, '-1', 'which can take it');
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

test('AC55 (build review 2, N-R2-2): after a hold, closed and opened again, the bubble shows the new line, with no notice', async () => {
  const setup = longRuling();
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    lineLines(app, 'last', 47);
    await app.resize(360);
    await app.tap(findKeyed(app, 'line:last'));
    // A newer long ruling arrives with its time: the line would change under the open bubble.
    const NEWER = `Ruling: ${'a newer long ruling, '.repeat(40)}end`;
    setup.repos.Alpha.commit({ 'decisions/questions/P-001-newer-long.md': `${NEWER}\n` });
    setup.repos.Alpha.history['decisions/questions/P-001-newer-long.md'] = [{ commit: { committer: { date: iso(NOW - 60e3) } } }];
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    const held = findKeyed(app, 'linebubble:last');
    assert.equal(byClass(held, 'sb-bubble-t')[0].textContent, DESIGN_LAB_WORDS, 'held: the old words');
    assert.equal(byClass(held, 'sb-bubble-note')[0].textContent, 'This has changed since you opened it. Close this to see the latest.');
    await app.key('Escape');
    assert.match(byClass(app.view, 'sb-last')[0].textContent, /^Your last action: a newer long ruling/, 'closed: the new line');
    lineLines(app, 'last', 20);
    await app.resize(414);
    await app.resize(360);
    const ctl = findKeyed(app, 'line:last');
    assert.equal(ctl.attrs['aria-label'], 'Show the whole of P-001-newer-long');
    await app.tap(ctl);
    const again = findKeyed(app, 'linebubble:last');
    assert.equal(byClass(again, 'sb-bubble-t')[0].textContent, NEWER.replace(/^Ruling: /, ''), 'opened again: the new line, not the held one');
    assert.equal(byClass(again, 'sb-bubble-note').length, 0, 'and no notice');
    await app.advance(POLL_MS);
    assert.equal(findKeyed(app, 'linebubble:last'), again, 'a refresh with nothing changed: no notice');
    assert.equal(byClass(again, 'sb-bubble-note').length, 0);
  } finally {
    app.restore();
  }
});

test('AC55 (build review 2, N-R2-3): a card answer keeps the one-line form "Your last action: <words> · <time>" then its code', async () => {
  const setup = twoProjects();
  const log = `${setup.repos.Alpha.files['dispatch-log/2026-10.jsonl']}${JSON.stringify({ item: 'P-002', trigger: 'decision', gate: 'criteria', card: 1, word: 'proceed', record: 'decisions/P-002/criteria-1.md', time: iso(NOW - 20 * 60e3) })}\n`;
  setup.repos.Alpha.commit({ 'dispatch-log/2026-10.jsonl': log, 'decisions/P-002/criteria-1.md': 'Decision: proceed\n' });
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const line = byClass(byClass(app.view, 'sb-last')[0], 'sb-last-t')[0];
    assert.equal(line.tag, 'p', 'one paragraph');
    assert.equal(line.textContent, 'Your last action: P-002: you answered criteria-1 with proceed · 09:40 P-002 criteria-1');
    const sep = byClass(line, 'sb-sep')[0];
    const when = byClass(line, 'sb-last-when')[0];
    assert.ok(sep && sep.parent === line && when.parent === line, 'the " · ", the time and the code sit in the same line as the words');
    assert.equal(byClass(line, 'sb-line-m').length + byClass(line, 'sb-lineclip').length, 0, 'never moved to a line of its own, never clipped');
    const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
    assert.doesNotMatch(css, /\.sb-sep \{[^}]*display: none/, 'the separator is never hidden');
    assert.doesNotMatch(css, /\.sb-last-when \{[^}]*display: block/, 'nor the time put on its own line');
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
  // From stage 1a (AC81): the bar Home · Waiting · Plan floats at every screen's foot, the project
  // screens' included; the room kept clear is the bar's own room, one value for both.
  assert.match(rule('.sb-screen'), /--sb-clear: var\(--sb-dock-h\);/, 'on every screen, the room kept clear is the bar\'s room');
  assert.match(css, /html\.sb \{[^}]*--sb-dock-h: 88px;/, 'set once (88 px: the 60 px bar, 14 px above the foot, and 14 px clear above it)');
  assert.match(rule('.v2-bar'), /bottom: calc\(14px \+ env\(safe-area-inset-bottom, 0px\)\);/, 'the bar 14 px above the foot');
  assert.match(rule('.v2-bar'), /height: 60px;[^]*padding: 4px;/, 'and drawn 60 px tall');
  assert.match(rule('.v2-tab'), /min-height: 52px;/, 'the tabs fit the bar: 52 + 4 + 4 = 60, AC81\'s 52 px tap areas');
  assert.doesNotMatch(css, /\.sb-dock\b|\.sb-tab\b/, 'the project screens\' own bar is gone');
  assert.match(rule('.sb-bubble-top'), /position: sticky; top: -8px; background: var\(--surf\);/, 'its top row, with "Close", stays in view while it scrolls');
  assert.match(rule('.sb-bubble'), /padding: var\(--s2\) var\(--s3\) var\(--s3\);/, 'its top padding (8 px, AC62) is what the sticky row rises by');
  const held = /\n(\.sb-bubble\.held,[^{]*)\{([^}]*)\}/.exec(css);
  assert.ok(held, 'the held rule');
  // Stage 8 (AC44, step 4): old Home's two-column bubbles (`.col-l`, `.col-r`) went at stage 7, and their rules, which
  // nothing drew once the desk became `/`, at stage 8; the held rule outweighs every placed rule that is left (AC55's
  // bubble "held to the viewport's height, less a margin", specs/S-001.md:4282-4283).
  for (const sel of ['.sb-sumbox > .sb-bubble.held', '.sb-linebox > .sb-bubble.held']) {
    assert.ok(held[1].split(',').map((x) => x.trim()).includes(sel), `it outweighs the placed rules: ${sel}`);
  }
  // The rules before mockup v2's block, as this case read them (the block's own are AC81's).
  const raw = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  const early = raw.slice(0, raw.indexOf('Desk mockup v2 (spec S-001')).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(early.length > 1000 && early.length < css.length, 'the part before mockup v2\'s block');
  const placed = [...early.matchAll(/(?:^|\n)([^{}\n@]*\.sb-bubble[^{}]*)\{([^}]*)\}/g)].filter((m) => /\b(left|right|top):/.test(m[2]) && !/\.held/.test(m[1]))
    .flatMap((m) => m[1].split(',').map((x) => x.trim()));
  for (const sel of placed) {
    const want = sel.includes('>') ? `${sel.split('>')[0].trim()} > .sb-bubble.held` : '.sb-bubble.held';
    assert.ok(held[1].split(',').map((x) => x.trim()).includes(want), `${sel}: outweighed by ${want}`);
  }
  assert.doesNotMatch(css, /\.col-[lr]\b/, 'no two-column bubble rule is left to outweigh');
  assert.match(held[2], /position: fixed; top: 8px; bottom: auto; left: max\(16px, calc\(50% - 264px\)\); right: max\(16px, calc\(50% - 264px\)\);/, 'held in the viewport, inside the gutters');
  // The line box: at most three lines, the rest hidden, a fade into the row's background, no ellipsis.
  // AC62 (2026-10-16): a ruling's words take the quoted record's role (.9rem at 1.45): three lines are 4.35em.
  assert.match(css, /--t-quote: 400 \.9rem\/1\.45 var\(--font\);/);
  assert.match(rule('.sb-lineclip'), /font: var\(--t-quote\); max-height: 4\.35em; overflow: hidden; overflow: clip;/);
  assert.match(rule('.sb-lineclip.over'), /height: 4\.35em;/);
  assert.match(rule('.sb-lineclip.over::after'), /background: linear-gradient\(to right, transparent, var\(--surf\) 85%\);/);
  assert.match(rule('.sb-last'), /background: var\(--surf\);/, 'the fade ends in "Your last action"\'s background');
  assert.match(rule('.sb-card'), /background: var\(--surf\);/, 'and in "Done today"\'s');
  assert.doesNotMatch(css, /line-clamp|text-overflow:\s*ellipsis/);
});

// ---------------------------------------------------------------------------
// "More detail": the same facts as the accepted views

// From stage 8 (AC44, step 4, specs/S-001.md:2918-2921 and the brief's item 8, :14465-14469: "the chosen design becomes the
// desk's default view and the sandbox and any unchosen candidate are removed"): the accepted views are gone, so the
// facts they drew for these fixtures are the record taken at bd4097d, the last commit that drew them
// (tests/desk/accepted-views.mjs, tests/desk/tools/accepted-views-snapshot.mjs), and each of the desk's views is
// compared with it both ways, as before.
const ACCEPTED = JSON.parse(readFileSync(join(FIX, 'accepted-views-bd4097d.json'), 'utf8'));

/**
 * The desk's own navigation words, and nothing else: Home and Back, and the project screens' row Status ·
 * Timeline · Team · Waiting from stage 1a (AC81) (the bar at every screen's foot is left out whole, in facts()).
 */
const SB_NAV = /^(Home|Back|Status|Timeline|Team|Waiting)$/;

for (const [kind, , deskHash, names] of CASES) {
  for (const name of names) {
    // AC68 (2026-10-16): a v3 project's Pipeline view folds into the Timeline; the v2.5 reduced view stays, with the same facts.
    test(`AC55: the rebuilt ${kind} view for ${name} shows the same values and words as the accepted view (as recorded at bd4097d)`, async () => {
      const rec = ACCEPTED.views[`${kind}|${name}`];
      assert.ok(rec, `${kind}|${name} recorded`);
      const accepted = rec.facts;
      const acceptedText = rec.text;
      assert.ok(accepted.length >= 3, `${accepted.length} facts`);
      const sb = await loadSandbox({ config: CONFIG, repos: detailRepos(), hash: `#/p/${name}/${deskHash}`, search: '', now: WHEN });
      try {
        await sb.advance(1000);
        await sb.advance(POLL_MS);
        // A fold's words are in the text whether it is open or not, as in the accepted view's details.
        const text = sb.view.textContent.replace(/\s+/g, ' ');
        for (const f of accepted) assert.ok(text.includes(f), `${kind} for ${name}: "${f}" is missing`);
        assert.doesNotMatch(text, /Can't show/);
        // And the other way (build review N1): every value and word of the desk's view is in the accepted
        // view, the desk's navigation words aside (Home and Back, the bar's tabs, AC81).
        const extra = facts(sb.view).filter((f) => !SB_NAV.test(f) && !acceptedText.includes(f));
        assert.deepEqual(extra, [], `${kind} for ${name}: the desk shows words the accepted view did not`);
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
    // AC68: no Pipeline link for a v3 project; the v2.5 project keeps its reduced view.
    assert.ok(!seen.has('#/p/Service-Desk/pipeline') && seen.has('#/p/Service-Desk/asked') && seen.has('#/p/Service-Desk/agents'));
    assert.ok(seen.has('#/p/Personal-Org-Operating-Model/pipeline'));
    assert.ok(seen.size > 20, `${seen.size} routes`);
  } finally {
    app.restore();
  }
  void findAll;

  void fullRepo;
});
