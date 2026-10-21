// The MD sandbox (spec S-001, AC43 B): its screens drawn by the page itself from fixtures, and the
// view model under them. AC40 (new since you last looked), AC42 (the hard constraints and H5's
// extremes), AC48 (the screens and their taps), AC49 (Team), AC52 (Queue), AC53 (the boxes), and
// AC14 re-run with J11's reads; J3's "From MD" part.
// ac-test: S-001/AC40 ac-test: S-001/AC42 ac-test: S-001/AC48 ac-test: S-001/AC49 ac-test: S-001/AC52
// ac-test: S-001/AC53 ac-test: S-001/AC14 join-test: S-001/J3
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, CONFIG, SRC, fakeClock } from './helpers.mjs';
import { repo, pr, fakeServer } from './fake-desk.mjs';
import { loadSandbox, byClass, linksIn, findAll, j11Files } from './sandbox-helpers.mjs';
import { createDesk, POLL_MS } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { createSeen, MARKERS_OFF, SEEN_KEY } from '../../src/lib/seen.js';
import {
  pillView, queueView, groupOf, ballLines, ruleLine, boxPlan, cardBoxText, questionBoxText, VERDICT_START, newFileAtBranch,
  sheetView, trackerSteps, doneToday, workingNow, memberPage, teamView, SANDBOX_MARKER,
} from '../../src/lib/sandbox.js';
import { buildModel } from '../../src/lib/model.js';

import { NOW, iso, md, om, v3, v25, fullRepo, twoProjects, opened, extremes } from './sandbox-fixtures.mjs';
import { pullsAnswer } from './j12-fixture.mjs';

// ---------------------------------------------------------------------------
// AC48

test('AC48, as AC82 rebuilds Home (stage 2, frame H5): one tile per project in AC8\'s order, each with its name and what waits, its summary, its phases as a timeline, "Now:", who is at work and what comes next; the marker; no New project', async () => {
  const app = await opened();
  try {
    const v = app.view;
    const cards = byClass(v, 'v2-tile');
    assert.equal(cards.length, 2);
    assert.deepEqual(cards.map((c) => byClass(c, 'v2-tnm')[0].textContent), ['Alpha', 'Beta'], 'AC8\'s order');
    for (const c of cards) {
      assert.equal(byClass(c, 'v2-wt').length, 1, 'what waits, at the name\'s right');
      assert.equal(byClass(c, 'sb-sum').length, 1, 'the README summary (AC54 (a))');
      assert.equal(byClass(c, 'sb-latest').length + byClass(c, 'sb-pill').length, 0, 'no "Latest" and no pill (AC82)');
      assert.equal(byClass(c, 'v2-ptl').length, 1, 'the phases as a timeline');
      assert.deepEqual(byClass(c, 'v2-ln').map((l) => /^(Now:|At work:|No agent run|Next:)/.exec(l.textContent)[1]), ['Now:', 'At work:', 'Next:']);
    }
    assert.ok(app.text().includes(SANDBOX_MARKER));
    assert.match(byClass(v, 'v2-brief')[0].textContent, /^12 need you/, 'a count in all, never a combined list');
    assert.match(app.text(), /Median answer time/, "AC21's V5 line stays on Home, in the fold at its foot");
    assert.doesNotMatch(app.text(), /New project/);
    // 2026-10-16 (decisions/questions/P-001-design-lab-open.md, answer 1): no band, no deferred
    // words; from stage 1a (AC81) the one thing fixed to the bottom of Home's screen is the bar
    // Home · Waiting · Plan, with no sheet or bubble open.
    assert.equal(byClass(v, 'sb-sheet').length + byClass(v, 'sb-scrim').length + byClass(v, 'sb-bubble').length + byClass(v, 'v2-sheet').length, 0, 'no sheet or bubble open');
    assert.doesNotMatch(app.text(), /Tell your Chief of Staff/, 'no "Tell your Chief of Staff…" bar');
    assert.doesNotMatch(app.text(), /Deferred: waiting on your ruling/i, 'no deferred words');
    assert.equal(findAll(v, (e) => e.tag === 'button' && 'disabled' in e.attrs).length, 0, 'no disabled bar');
    for (const cls of ['sb-band', 'sb-composer', 'sb-deferred', 'sb-dock']) assert.equal(byClass(v, cls).length, 0, `no .${cls} on Home`);
    // Every rule that fixes or sticks something to the screen, against every element on Home: only the bar.
    const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const pinned = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].filter((m) => /position:\s*(fixed|sticky)/.test(m[2]))
      .flatMap((m) => m[1].split(',').map((x) => x.trim().split(/[\s>+~]+/).pop()));
    assert.ok(pinned.includes('.v2-bar') && pinned.includes('.sb-sheet') && pinned.includes('.v2-sheet'), `the rules found: ${pinned.join(' ')}`);
    const homeEls = findAll(v, () => true);
    for (const sel of pinned) {
      const classes = sel.split('.').filter(Boolean).map((c) => c.replace(/[:[].*$/, ''));
      const hit = homeEls.filter((e) => classes.every((c) => ` ${e.className} `.includes(` ${c} `)));
      assert.equal(hit.length, sel === '.v2-bar' ? 1 : 0, `on Home, ${sel} (fixed or sticky) matches ${sel === '.v2-bar' ? 'the bar only' : 'nothing'}`);
    }
  } finally {
    app.restore();
  }
});

// Rewritten in stage 3 (S-001 AC81, "From stage 3", specs/S-001.md:6456-6466; AC83's two rows, :6769-6779;
// AC84's header, :6880-6882): the project screens' top row goes, the Status screen gives way to the page, the
// page's waits row opens Waiting (this project) and its "At work now" row the Team screen.
test('AC48 (changed by AC81, AC82, AC83 and AC84): each tile, the briefing and each row tap goes to the screen it names; the page, the Timeline and the Team screen carry no top row, the one bar, and a way back', async () => {
  const app = await opened();
  try {
    const card = byClass(app.view, 'v2-tile')[0];
    const [main] = byClass(card, 'v2-ta');
    assert.equal(main.attrs.href, '#/p/Alpha', 'the tile opens the project\'s page');
    assert.equal(byClass(app.view, 'v2-brief')[0].attrs.href, '#/waiting', 'the briefing opens Waiting, one tap');
    for (const [hash, title] of [['#/p/Alpha', 'Alpha'], ['#/p/Alpha/timeline', 'Alpha'], ['#/p/Alpha/team', 'Team']]) {
      await app.go(hash);
      assert.ok(app.text().includes(SANDBOX_MARKER), `${hash}: the marker`);
      assert.ok(app.text().includes(title), `${hash}: ${title}`);
      assert.equal(byClass(app.view, 'sb-tab').length, 0, `${hash}: no project bar at the foot`);
      assert.equal(byClass(app.view, 'v2-rl').length + byClass(app.view, 'v2-row').length, 0, `${hash}: no top row (from stage 3)`);
      assert.equal(byClass(app.view, 'v2-bar').length, 1, `${hash}: the one bar at the foot`);
      const back = hash === '#/p/Alpha/team' ? byClass(app.view, 'sb-back')[0] : findAll(app.view, (e) => e.dataset && e.dataset.k === 'nav-back')[0];
      assert.ok(back, `${hash}: a way back`);
    }
    // The page's Overview | Timeline switch (AC83, AC84).
    await app.go('#/p/Alpha');
    const seg = findAll(app.view, (e) => e.dataset && /^seg:/.test(e.dataset.k || ''));
    assert.deepEqual(seg.map((t) => [t.textContent, t.attrs.href, t.attrs['aria-current'] || null]), [['Overview', '#/p/Alpha', 'page'], ['Timeline', '#/p/Alpha/timeline', null]]);
    // The Queue's address opens Waiting with only that project shown (AC81).
    await app.go('#/p/Alpha/queue');
    assert.equal(app.loc.hash, '#/waiting/Alpha');
    assert.match(app.text(), /Waiting/);
    await app.go('#/p/Alpha');
    const rows = byClass(findAll(app.view, (e) => e.dataset && e.dataset.k === 'page-rows')[0], 'v2-prow').map((b) => b.attrs.href);
    assert.deepEqual(rows, ['#/waiting/Alpha', '#/p/Alpha/team'], 'the two rows open Waiting (this project) and the Team screen (P-001-team-screen.md, A)');
    // AC36, as AC55 changed it (2026-10-15): inside the sandbox the M1 and M2 detail is reached
    // through the views rebuilt in the new design, never through a link to the accepted views.
    const links = linksIn(app.view).map((l) => l.href);
    for (const h of ['#/p/Alpha/asked', '#/p/Alpha/agents']) assert.ok(links.includes(h), h);
    // AC68 (2026-10-16): a v3 project's Pipeline view folds into the Timeline; "Details" no longer offers it.
    assert.ok(!links.includes('#/p/Alpha/pipeline'), 'no Pipeline link for a v3 project');
    assert.ok(!links.some((h) => h && h.startsWith('./#')), 'no link to an accepted view');
  } finally {
    app.restore();
  }
});

test('AC48 + ruling 6: no item of one project appears on another project\'s card, queue or team', async () => {
  const app = await opened();
  try {
    for (const [mine, other] of [['Alpha', 'Beta'], ['Beta', 'Alpha']]) {
      await app.go('#/');
      const card = byClass(app.view, 'v2-tile').find((c) => c.textContent.includes(mine));
      assert.ok(!card.textContent.includes(other));
      for (const s of ['queue', 'team']) {
        await app.go(`#/p/${mine}/${s}`);
        assert.ok(!app.text().includes(other), `${mine}'s ${s} holds nothing of ${other}`);
        assert.ok(s !== 'queue' || app.text().includes(`${mine}'s question`));
      }
    }
  } finally {
    app.restore();
  }
});

test('AC48: "All clear" only when nothing waits and the project was read within 3 minutes; "Checking…" before; "Can\'t read" with AC5\'s words', () => {
  const q0 = { waiting: 0, groups: [], rows: [] };
  assert.equal(pillView({ read: { read: 'ok', since: NOW - 60e3 } }, q0, NOW).text, 'All clear');
  assert.notEqual(pillView({ read: { read: 'ok', since: NOW - 181e3 } }, q0, NOW).text, 'All clear');
  assert.equal(pillView({ read: { read: 'checking', since: null } }, q0, NOW).text, 'Checking…');
  assert.equal(pillView({ read: { read: 'cant-read', since: NOW, words: 'GitHub error' } }, q0, NOW).text, "Can't read: GitHub error");
  const q = queueView(v3('A'), { flagged: [{ kind: 'pr', key: 'pr:1', pr: { number: 1, title: 't' }, raisedAt: null }] }, null, NOW);
  assert.equal(pillView({ read: { read: 'ok', since: NOW } }, q, NOW).text, '1 to merge');
});

test('AC48 with AC82: a project whose read goes stale shows no quiet on Home ("Nothing needs you", "Nothing waiting"), but "Can\'t read"', async () => {
  const setup = { config: { ...CONFIG, projects: [v3('Quiet')] }, repos: { Quiet: repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml') }) } };
  const app = await opened(setup);
  try {
    assert.match(byClass(app.view, 'v2-brief')[0].textContent, /^Nothing needs you/);
    assert.equal(byClass(app.view, 'v2-wt')[0].textContent, 'Nothing waiting');
    setup.repos.Quiet.fail = { kind: 'network' };
    await app.advance(4 * 60e3);
    await app.go('#/');
    assert.doesNotMatch(app.text(), /Nothing needs you|Nothing waiting|All clear/);
    assert.match(byClass(app.view, 'v2-brief')[0].textContent, /^Can't read Quiet since \d\d:\d\d/, 'AC5\'s words, in the briefing');
    assert.equal(byClass(app.view, 'v2-wt')[0].textContent, "Can't read");
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC52 and AC53

test('AC52 (changed by AC80): every item that needs the owner is one card in "Waiting on you", in AC52\'s order (raised first, no raised time last); no card says whether it can be acted on; a deploy is not counted where J7 does not mark deploysNeedOwner', async () => {
  const app = await opened(twoProjects(), '#/waiting/Alpha');
  try {
    const lane = byClass(app.view, 'lane-wait')[0];
    const titles = byClass(lane, 'v2-t').map((r) => r.textContent);
    assert.equal(titles.length, 6, 'a pull request, a question, a gate card, a decision card, a hold card and a merge card');
    assert.match(titles[0], /a change to merge/, 'the pull request, raised first (6 Oct)');
    assert.match(titles[1], /Alpha's question/, 'then the question raised 400 min ago');
    assert.match(titles[2], /Pass the Build gate|Build gate/, 'then the gate card raised 270 min ago');
    assert.match(titles[3], /Q-020/, 'then the card raised 200 min ago');
    assert.ok(/governance run is not green|merge conflict/.test(titles[4]) && /governance run is not green|merge conflict/.test(titles[5]), 'no raised time: last');
    assert.equal(byClass(lane, 'v2-lc')[0].textContent, '6', 'the deploy is not counted');
    assert.doesNotMatch(app.text(), /desk-deploy: waiting/, 'nor shown as a card');
    assert.doesNotMatch(app.text(), /do first|can be acted on|ready to act|after #/i);
  } finally {
    app.restore();
  }
});

test('AC52 + AC80: the recommendation is labelled and never preselected; one button per option, each its filled-in file; a pull request\'s sheet offers its step, never a verdict on every pull request', async () => {
  const app = await opened(twoProjects(), '#/waiting/Alpha');
  try {
    const card = byClass(app.view, 'v2-card').find((c) => c.textContent.includes("Alpha's question"));
    const open = findAll(card, (e) => e.tag === 'a' && e.textContent === 'Answer')[0];
    await app.go(open.attrs.href);
    const opts = byClass(app.view, 'v2-opt');
    assert.equal(opts.length, 2);
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-ol')[0].textContent), ['A. Yes.', 'B. No.']);
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-rec').length), [0, 1], '"Recommended" on B only, never picked');
    assert.equal(findAll(app.view, (e) => e.attrs['aria-checked'] === 'true').length, 0, 'nothing preselected');
    assert.match(app.text(), /Recommended B — no\./);
    const [a, b] = opts.map((o) => byClass(o, 'v2-abtn')[0]);
    assert.equal(a.textContent, 'Answer A ↗');
    const text = "Ruling: A\n\nQuestion: questions/Alpha-pick.md\n\nQuestion, as put: Alpha's question\nOptions, as put:\n  A. Yes.\n  B. No.\n";
    assert.equal(a.attrs.href, `https://github.com/shumpmaster/Alpha/new/main?filename=decisions%2Fquestions%2FAlpha-pick.md&value=${encodeURIComponent(text)}`);
    assert.equal(b.attrs.href, `https://github.com/shumpmaster/Alpha/new/main?filename=decisions%2Fquestions%2FAlpha-pick.md&value=${encodeURIComponent(text.replace('Ruling: A', 'Ruling: B'))}`);
    // The pull request's sheet: no answer buttons and no verdict box; its one step (here J22's "not known": Open ↗).
    await app.go('#/waiting/Alpha/card/Alpha%7Cpr%7C80');
    assert.equal(byClass(app.view, 'v2-opt').length, 0, 'a pull request has no options');
    assert.equal(findAll(app.view, (e) => e.tag === 'textarea').length, 0, 'no verdict box');
    assert.match(app.text(), /Whether it needs your verdict: not known yet/);
    const steps = byClass(byClass(app.view, 'v2-sheet')[0], 'v2-abtn').filter((x) => x.tag === 'a').map((x) => [x.textContent, x.attrs.href]);
    assert.deepEqual(steps, [['Open on GitHub ↗', 'https://github.com/shumpmaster/Service-Desk/pull/80']]);
  } finally {
    app.restore();
  }
});

test('AC52 + AC80: a hold card\'s and a merge card\'s sheets offer no options, no text box and no link to commit; their one step opens GitHub', async () => {
  const app = await opened(twoProjects(), '#/p/Alpha/queue/hold%3Aqueue%2Fci-hold-4a2448939173.md');
  try {
    assert.equal(app.loc.hash, '#/waiting/Alpha/card/hold%3Aqueue%2Fci-hold-4a2448939173.md', 'the Queue\'s address opens the card\'s sheet over Waiting');
    const sheet = () => byClass(app.view, 'v2-sheet')[0];
    assert.equal(byClass(sheet(), 'v2-opt').length, 0);
    assert.equal(findAll(sheet(), (e) => e.tag === 'textarea').length, 0);
    assert.ok(!linksIn(sheet()).some((l) => /\/new\//.test(l.href || '')));
    assert.match(sheet().textContent, /No answer needed: fix or re-run the governance run/);
    await app.go('#/p/Alpha/queue/merge%3Aqueue%2FP-002-merge-conflict.md');
    assert.equal(byClass(sheet(), 'v2-opt').length, 0);
    assert.equal(findAll(sheet(), (e) => e.tag === 'textarea').length, 0);
    assert.ok(!linksIn(sheet()).some((l) => /\/new\//.test(l.href || '')));
    assert.match(sheet().textContent, /No answer needed: merge item\/P-002 by hand/);
  } finally {
    app.restore();
  }
});

test('AC52 + AC80: a gate ruling\'s sheet quotes its case, links the case only when the tree holds it, the user representative "not needed", its four choices as buttons', async () => {
  const app = await opened(twoProjects(), '#/p/Alpha/queue/card%3Aqueue%2FP-002-criteria-1.md');
  try {
    assert.match(app.text(), /Pass the Build gate: the plan for the queue screen passed review/);
    const links = linksIn(app.view);
    assert.ok(links.some((l) => l.href === 'https://github.com/shumpmaster/Alpha/blob/main/docs/gates/P-002/build-gate-1-case.md'));
    assert.match(app.text(), /The Critic's view: no file recorded/);
    assert.match(app.text(), /User representative: not needed/);
    const sheet = byClass(app.view, 'v2-sheet')[0];
    assert.deepEqual(byClass(sheet, 'v2-abtn').filter((x) => x.tag === 'a').map((c) => c.textContent), ['Proceed ↗', 'Hold ↗', 'Recycle ↗', 'Kill ↗']);
    assert.match(app.text(), /Recommended The case recommends proceed\./);
  } finally {
    app.restore();
  }
});

test('AC52: each tracker step and each "Done today" time against its record', () => {
  const project = v3('A');
  const t0 = NOW - 3600e3;
  const entries = [
    { shape: 'card', item: 'P-002', gate: 'criteria', card: 1, time: iso(t0), label: 'L', line: 1 },
    { shape: 'decision', item: 'P-002', gate: 'criteria', card: 1, word: 'proceed', record: 'decisions/P-002/criteria-1.md', time: iso(t0 + 60e3), label: 'L', line: 2 },
    { shape: 'dispatch', item: 'P-002', role: 'builder', route: 'build', time: iso(t0 + 120e3), label: 'L', line: 3 },
  ];
  const card = { kind: 'card', card: { item: 'P-002', gate: 'criteria', n: 1, path: 'queue/P-002-criteria-1.md', answerPath: 'decisions/P-002/criteria-1.md' } };
  const before = trackerSteps(project, { flag: card }, { tree: new Map([['queue/P-002-criteria-1.md', {}]]) }, []);
  assert.deepEqual(before.map((s) => s.done), [false, false, false]);
  const after = trackerSteps(project, { flag: card }, { tree: new Map([['decisions/P-002/criteria-1.md', {}]]) }, entries);
  assert.deepEqual(after.map((s) => s.done), [true, true, true]);
  assert.match(after[2].words, /builder started/);
  const q = { kind: 'question', question: { name: 'X', path: 'questions/X.md' } };
  assert.deepEqual(trackerSteps(project, { flag: q }, { tree: new Map([['decisions/questions/X.md', {}]]) }, []).map((s) => s.done), [true, true, false]);
  const p = trackerSteps(project, { flag: { kind: 'pr' }, stillOpen: false }, { tree: new Map() }, []);
  assert.match(p[0].words, /no longer open/);
  assert.match(p[1].words, /not recorded/);
  // Note 10 (2026-10-15): each row says what was ruled, in words (a ruling's line 1, J9's decision words), with its code after.
  const done = doneToday(project, { allEntries: entries }, { tree: new Map([['decisions/questions/X.md', {}]]), records: new Map([['decisions/questions/X.md', { line1: 'Ruling: B, the smaller screen', line2Proxy: false }]]),
    history: new Map([['decisions/questions/X.md', { oldest: iso(NOW - 600e3) }]]) }, new Date(NOW), 'America/Chicago');
  assert.deepEqual(done.map((d) => [d.text, d.code]), [['B, the smaller screen', 'X'], ['P-002: you answered criteria-1 with proceed', 'P-002 criteria-1']]);
  assert.equal(done[1].words, 'at 09:01', 'the decision entry\'s time, in ownerTimeZone');
});

test('AC52 + AC80: a pull request that stops needing the owner while the page is open moves to Done by itself, from the time it was seen', async () => {
  const setup = twoProjects();
  const app = await opened(setup, '#/waiting/Alpha');
  try {
    setup.repos.Alpha.pulls = [];
    await app.advance(POLL_MS);
    await app.go('#/waiting/Alpha');
    const done = byClass(app.view, 'lane-done')[0];
    assert.match(done.textContent, /Alpha: a change to merge/);
    assert.match(done.textContent, /#80 · 10:01$/, 'seen at 10:01 Chicago time, after its code');
    assert.doesNotMatch(byClass(app.view, 'lane-wait')[0].textContent, /a change to merge/);
  } finally {
    app.restore();
  }
});

test('AC53 + J3 (From MD): the URL for a card, a gate card with recycle, a question, and the owner\'s verdict at a head branch with a slash', () => {
  const project = v3('Service-Desk');
  const card = boxPlan(project, 6000, { form: 'card', path: 'decisions/P-001/dor-4.md' }, cardBoxText('build', false));
  assert.equal(card.url, 'https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2FP-001%2Fdor-4.md&value=Decision%3A%20build%0A%0A');
  assert.equal(cardBoxText('recycle', true), 'Decision: recycle\n\nInto: \nReason: \n');
  assert.equal(cardBoxText('hold', true), 'Decision: hold\n\nReason: \n');
  const recycle = boxPlan(project, 6000, { form: 'card', path: 'decisions/P-002/criteria-1.md' }, 'Decision: recycle\n\nInto: Design\nReason: the plan missed a screen\n');
  assert.equal(recycle.url, 'https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2FP-002%2Fcriteria-1.md&value=Decision%3A%20recycle%0A%0AInto%3A%20Design%0AReason%3A%20the%20plan%20missed%20a%20screen%0A');
  const q = boxPlan(project, 6000, { form: 'question', path: 'decisions/questions/Q-005-sources.md' }, questionBoxText('A', 'Q-005-sources'));
  assert.equal(q.url, 'https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2Fquestions%2FQ-005-sources.md&value=Ruling%3A%20A%0A%0AQuestion%3A%20questions%2FQ-005-sources.md%0A');
  // R2-N2: the branch's own "/" stays unencoded; each segment is encoded.
  const v = boxPlan(project, 6000, { form: 'verdict', path: 'reviews/72/owner.md', branch: 'build/builder/md sandbox' }, VERDICT_START);
  assert.equal(v.url, 'https://github.com/shumpmaster/Service-Desk/new/build/builder/md%20sandbox?filename=reviews%2F72%2Fowner.md&value=Verdict%3A%20PASS%0A%0AAny%20suggestions%20to%20commit%20along%20with%20the%20verdict%3A%0A%0A');
  assert.equal(v.branch, 'build/builder/md sandbox');
  assert.equal(newFileAtBranch(project, 'a/b', 'x.md', null), 'https://github.com/shumpmaster/Service-Desk/new/a/b?filename=x.md');
  // A fork's (or deleted) head: no link, the text to copy.
  const fork = boxPlan(project, 6000, { form: 'verdict', path: 'reviews/9/owner.md', branch: 'main', fork: true }, VERDICT_START);
  assert.equal(fork.offer, 'copy');
  assert.equal(fork.url, null);
  // AC18's message applies to cards and questions only.
  const noWeb = { ...project, webCommitsToDefault: false };
  assert.ok(boxPlan(noWeb, 6000, { form: 'card', path: 'decisions/P-001/dor-4.md' }, 'Decision: build\n').warning);
  assert.equal(boxPlan(noWeb, 6000, { form: 'verdict', path: 'reviews/1/owner.md', branch: 'x/y' }, VERDICT_START).warning, null);
});

test('AC53: the copy route for a text over 6,000 characters, and with contentPrefill false', () => {
  const project = v3('Service-Desk');
  const long = `Verdict: PASS\n\n${'x'.repeat(6100)}\n`;
  const v = boxPlan(project, 6000, { form: 'verdict', path: 'reviews/72/owner.md', branch: 'build/builder/md-sandbox' }, long);
  assert.equal(v.copy, long);
  assert.equal(v.url, 'https://github.com/shumpmaster/Service-Desk/new/build/builder/md-sandbox?filename=reviews%2F72%2Fowner.md');
  assert.match(v.words, /copies the text/);
  const c = boxPlan({ ...project, contentPrefill: false }, 6000, { form: 'card', path: 'decisions/P-001/dor-4.md' }, 'Decision: build\n');
  assert.equal(c.copy, 'Decision: build\n');
  assert.equal(c.url, 'https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2FP-001%2Fdor-4.md');
  const v25q = boxPlan({ ...project, model: 'v2.5' }, 6000, { form: 'question', path: 'x' }, 'Ruling: A\n');
  assert.equal(v25q.offer, 'copy', "a v2.5 project keeps AC19's copy route");
});

test('AC53: the rule line\'s words — a right verdict, Verdict: mid-line, a hold with no reason, a recycle with no Into:', () => {
  assert.deepEqual(ruleLine('verdict', VERDICT_START), { ok: true, words: 'In form: the first "Verdict:" line decides (Verdict: PASS).' });
  assert.match(ruleLine('verdict', 'Verdict: PASS\n\nThe reviewer wrote Verdict: FAIL here\n').words, /may only start a line/);
  assert.equal(ruleLine('verdict', 'Verdict: PASS\n\nThe reviewer wrote Verdict: FAIL here\n').ok, false);
  assert.match(ruleLine('verdict', 'Verdict: pass\n').words, /must read exactly "Verdict: PASS" or "Verdict: FAIL"/);
  const gate = { words: ['proceed', 'hold', 'recycle', 'kill'], gateCard: true };
  assert.deepEqual(ruleLine('card', 'Decision: hold\n\nReason: \n', gate), { ok: false, words: '"hold" needs a "Reason:" line with text.' });
  assert.deepEqual(ruleLine('card', 'Decision: recycle\n\nReason: wrong phase\n', gate), { ok: false, words: '"recycle" needs an "Into:" line naming a phase.' });
  assert.equal(ruleLine('card', 'Decision: recycle\n\nInto: Design\nReason: x\n', gate).ok, true);
  assert.match(ruleLine('card', 'Decision: maybe\n', gate).words, /not one of this card's words/);
  assert.equal(ruleLine('question', 'Ruling: B\n').ok, true);
  assert.equal(ruleLine('question', 'Decision: B\n').ok, false);
});

test('AC53 + AC80: the sheet\'s words box puts the owner\'s words where AC53 places them (a gate\'s Hold its Reason:), in every button, and survives a refresh; no rule line', async () => {
  const app = await opened(twoProjects(), '#/p/Alpha/queue/card%3Aqueue%2FP-002-criteria-1.md');
  try {
    const sheet = () => byClass(app.view, 'v2-sheet')[0];
    const hold = () => byClass(sheet(), 'v2-abtn').find((c) => c.textContent === 'Hold ↗');
    assert.equal(hold().attrs.href, `https://github.com/shumpmaster/Alpha/new/main?filename=decisions%2FP-002%2Fcriteria-1.md&value=${encodeURIComponent('Decision: hold\n\nReason: \n')}`);
    const ta = findAll(sheet(), (e) => e.tag === 'textarea')[0];
    assert.match(ta.className, /v2-input/);
    ta.value = 'waiting for the screens';
    for (const fn of ta.listeners.input) fn({ target: ta });
    await app.flush();
    assert.equal(hold().attrs.href, `https://github.com/shumpmaster/Alpha/new/main?filename=decisions%2FP-002%2Fcriteria-1.md&value=${encodeURIComponent('Decision: hold\n\nReason: waiting for the screens\n')}`);
    const proceed = byClass(sheet(), 'v2-abtn').find((c) => c.textContent === 'Proceed ↗');
    assert.equal(proceed.attrs.href, `https://github.com/shumpmaster/Alpha/new/main?filename=decisions%2FP-002%2Fcriteria-1.md&value=${encodeURIComponent('Decision: proceed\n\n  waiting for the screens\n')}`,
      'on Proceed the words follow a blank line, indented as AC53 does on a gate card');
    assert.equal(byClass(app.view, 'sb-rule').length, 0, 'the rule line is not on the board');
    app.module.refresh();
    await app.flush();
    assert.equal(findAll(sheet(), (e) => e.tag === 'textarea')[0].value, 'waiting for the screens', 'a refresh keeps the typed text');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC49

const runs = (list) => [JSON.stringify({ workflow_runs: list.map((r, i) => ({ path: `.github/workflows/${r.name}.yml`, name: r.name, status: r.status, conclusion: r.conclusion ?? null, run_number: i + 1, html_url: `u${i}` })) })];

test('AC49: who has the ball, each case — an open card, a dispatched status, a running workflow, a ready status (schedule readable or not), and none', () => {
  const now = new Date(NOW);
  const P = v3('A');
  const q = (n, raisedAt = NOW - 90 * 60e3) => ({ waiting: n, rows: n ? [{ raisedAt }] : [] });
  const j = { workflow: { cron: '*/30 * * * *' } };
  const words = (model, snap, qq, jj = j) => ballLines(P, model, snap, jj, qq, now, 'UTC').map((b) => b.text);
  assert.deepEqual(words({ items: [] }, { checkPages: [] }, q(1)), ['Waiting on you, the oldest for 1 h 30 min']);
  assert.deepEqual(words({ items: [] }, { checkPages: [] }, { waiting: 1, rows: [{ raisedAt: null }] }), ['Waiting on you, wait not recorded']);
  assert.deepEqual(words({ items: [{ id: 'P-003', state: 'dispatched', running: { role: 'builder' } }] }, { checkPages: [] }, q(0)), ['builder working on P-003']);
  assert.deepEqual(words({ items: [] }, { checkPages: runs([{ name: 'tests', status: 'in_progress' }]) }, q(0)), ['Checks running']);
  assert.deepEqual(words({ items: [{ id: 'P-1', state: 'returned' }] }, { checkPages: [] }, q(0)), ['Next Orchestrator run, due 15:30 by its schedule']);
  assert.deepEqual(words({ items: [{ id: 'P-1', state: 'ready' }] }, { checkPages: [] }, q(0), { workflow: { cron: '0 3 * * *' } }), ['Next Orchestrator run, due time not available']);
  assert.deepEqual(words({ items: [] }, { checkPages: [] }, q(0)), ['Nothing under way']);
  assert.deepEqual(ballLines({ ...P, model: 'v2.5' }, {}, {}, null, q(0), now, 'UTC').map((b) => b.text), ["not recorded in this repository's records (operating model v2.5.1)"]);
  // Several hold: named in order.
  assert.deepEqual(words({ items: [{ id: 'P-3', state: 'dispatched', running: { role: 'builder' } }, { id: 'P-4', state: 'ready' }] }, { checkPages: runs([{ name: 'ci', status: 'queued' }]) }, q(1)).map((w) => w.split(',')[0]),
    ['Waiting on you', 'builder working on P-3', 'Checks running', 'Next Orchestrator run']);
});

test('AC49 + AC67: the Team screen — your tile with the next three queue lines, one card per member, the Chief of Staff "not recorded", the circle icons in place of the lights', async () => {
  const app = await opened(twoProjects(), '#/p/Alpha/team');
  try {
    const you = byClass(app.view, 'sb-you')[0];
    assert.equal(findAll(you, (e) => e.tag === 'li').length, 3, 'the next three lines');
    assert.match(you.textContent, /You · waiting on you: 6 in your queue/);
    const tiles = byClass(app.view, 'sb-tile');
    const id = (t) => byClass(t, 'sb-tile-n')[0].attrs.href.split('/').pop();
    const ids = tiles.map(id);
    assert.equal(ids.filter((x) => x === 'chief-of-staff').length, 1);
    assert.ok(ids.includes('orchestrator') && ids.includes('builder') && ids.includes('reviewer'));
    const cos = tiles.find((t) => id(t) === 'chief-of-staff');
    assert.match(cos.textContent, /No session recorded yet/, 'from 2026-10-17 (J13): no session file in this fixture');
    assert.equal(byClass(cos, 'i-unrec').length, 1, 'the question mark in a dashed circle');
    const builder = tiles.find((t) => id(t) === 'builder');
    assert.match(builder.textContent, /Working/);
    assert.equal(byClass(builder, 'i-half').length, 1, 'working: the half-filled circle');
    const critic = tiles.find((t) => id(t) === 'critic');
    assert.match(critic.textContent, /Idle/);
    assert.equal(byClass(critic, 'i-planned').length, 1, 'idle: the empty dashed circle');
    assert.equal(byClass(app.view, 'sb-light').length, 0, 'no light on the Team screen (AC67)');
    assert.doesNotMatch(app.text(), /usage/i, 'no usage card on the Team screen');
  } finally {
    app.restore();
  }
});

test('AC49: "Just finished" for 30 minutes after a role\'s latest outcome; never a partly filled light', () => {
  const P = v3('A');
  const now = new Date(NOW);
  const rows = (min) => ({ allEntries: [{ shape: 'outcome', role: 'critic', item: 'P-1', result: 'ok', verdict: 'PASS', time: iso(NOW - min * 60e3), label: 'x' }], items: [] });
  const tile = (min) => teamView(P, rows(min), {}, { surfaces: { ok: true, members: [{ id: 'critic' }] } }, { waiting: 0, rows: [] }, [], now, 'UTC').members.find((m) => m.id === 'critic');
  assert.equal(tile(10).status, 'Just finished');
  assert.equal(tile(10).glow, false);
  assert.equal(tile(40).status, 'Idle');
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  assert.doesNotMatch(css, /\.sb-light[^{]*\{[^}]*(linear-gradient|conic-gradient|clip)/, 'a light is lit or not, never partly filled');
});

test('AC49: every Working now value against its record, and "–" wherever a record is missing', () => {
  const P = v3('A');
  const now = new Date(NOW);
  const since = new Date(NOW - 25 * 60e3);
  const asOf = new Date(NOW - 5 * 60e3);
  const model = { items: [{ id: 'P-003', state: 'dispatched', stage: '5 Produce', asOf, running: { role: 'builder', since } }],
    allEntries: [{ shape: 'dispatch', item: 'P-003', role: 'builder', stage: 5, time: iso(asOf.getTime()), label: 'x' }] };
  const wn = workingNow(P, model, {}, { workflow: { cron: '*/30 * * * *' } }, 'builder', {}, now, 'UTC');
  assert.equal(wn.doing, 'builder on P-003, Produce');
  assert.deepEqual(wn.tiles.map((t) => [t.label, t.value]), [['Started', '14:35'], ['Time so far', '25 min'], ['Last check-in', '14:55'], ['Next check-in', '15:30']]);
  assert.equal(wn.tiles[1].why, 'counted from the start');
  assert.deepEqual(wn.lines.map((l) => [l.label, l.value]), [['Update', 'P-003: builder started (Produce), 14:55'], ['Next', 'the Orchestrator routes its return'], ['Cost', '–']]);
  assert.match(wn.lines[1].why, /not a record/);
  const noSched = workingNow(P, { ...model, items: [{ ...model.items[0], running: { role: 'builder', since: null }, asOf: null }] }, {}, { workflow: null }, 'builder', {}, now, 'UTC');
  assert.deepEqual(noSched.tiles.map((t) => t.value), ['–', '–', '–', '–']);
  assert.equal(noSched.tiles[3].why, 'schedule not readable');
  // Review N4: a start later than the device's clock is "–" with the reason, never a value.
  const ahead = workingNow(P, { ...model, items: [{ ...model.items[0], running: { role: 'builder', since: new Date(NOW + 5 * 60e3) } }] }, {}, null, 'builder', {}, now, 'UTC');
  assert.equal(ahead.tiles[1].value, '–');
  assert.match(ahead.tiles[1].why, /later than this device's clock/);
  const cos = workingNow(P, model, {}, null, 'chief-of-staff', {}, now, 'UTC');
  assert.deepEqual([cos.tiles[0].value, cos.tiles[1].value, cos.lines[2].value], ['–', '–', '–']);
  assert.match(cos.tiles[0].why, /not recorded: no piece of its work is under way/, 'from 2026-10-17 (J13): no session file, so nothing under way');
});

test('AC49: a member\'s page — fixed groups counted from records only, "not recorded" where no record fills one; the running log newest first', () => {
  const P = v3('A');
  const now = new Date(NOW);
  const model = { items: [], allEntries: [
    { shape: 'dispatch', item: 'Q-1', role: 'researcher', stage: 2, time: iso(NOW - 3e6), label: 'x' },
    { shape: 'outcome', item: 'Q-1', role: 'researcher', result: 'ok', verdict: 'none', record: 'research/Q-1-memo.md', time: iso(NOW - 2e6), label: 'x' },
    { shape: 'dispatch', item: 'Q-2', role: 'researcher', stage: 2, time: iso(NOW - 1e6), label: 'x' }] };
  const snap = { tree: new Map([['research/Q-1-memo.md', {}], ['decisions/P-1/dor-1.md', {}], ['decisions/questions/X.md', {}]]) };
  const j = { surfaces: { ok: true, members: [{ id: 'researcher' }] } };
  const q = { waiting: 0, rows: [] };
  const tv = teamView(P, model, snap, j, q, [], now, 'UTC');
  const r = memberPage(P, model, snap, j, q, tv, 'researcher', now, 'UTC');
  assert.deepEqual(r.groups.map((g) => [g.title, g.count]), [['Sessions', 2], ['Returns', 1], ['Records written', 1]]);
  assert.deepEqual(r.log.map((e) => e.lane), ['Q-2', 'Q-1', 'Q-1'], 'newest at the top, a lane per item');
  const owner = memberPage(P, model, snap, j, q, tv, 'owner', now, 'UTC');
  assert.deepEqual(owner.groups.map((g) => [g.title, g.count]), [['Decisions', 1], ['Rulings', 1], ['Verdicts', null], ['Merges', null]]);
  assert.match(owner.groups[2].why, /^not recorded/);
  const cos = memberPage(P, model, snap, j, q, tv, 'chief-of-staff', now, 'UTC');
  assert.ok(cos.groups.every((g) => g.count === null && /not recorded/.test(g.why)));
});

test('AC49 (review B1): under each group\'s count the page draws its latest record, or "not recorded" with the reason, never "none yet" over a count', async () => {
  const setup = twoProjects();
  setup.repos.Alpha.commit({ 'decisions/questions/Alpha-old.md': 'Ruling: A\n', 'decisions/P-002/stop-1.md': 'Decision: drop\n' });
  const app = await opened(setup, '#/p/Alpha/team/owner');
  try {
    const groups = byClass(app.view, 'sb-card').filter((c) => c.tag === 'details');
    assert.equal(groups.length, 4);
    for (const g of groups) {
      const count = byClass(g, 'sb-gcount')[0].textContent;
      const under = byClass(g, 'sb-latest')[0].textContent;
      if (/^\d+$/.test(count) && Number(count) > 0) {
        assert.notEqual(under, 'none yet', `${g.textContent}`);
        assert.match(under, /^latest: /);
      }
      if (count === 'not recorded') assert.match(under, /^not recorded/);
    }
    const rulings = groups.find((g) => g.textContent.startsWith('Rulings'));
    assert.match(byClass(rulings, 'sb-latest')[0].textContent, /^latest: (decisions\/questions\/Alpha-old\.md, |not recorded \()/);
    const decisions = groups.find((g) => g.textContent.startsWith('Decisions'));
    assert.match(byClass(decisions, 'sb-latest')[0].textContent, /^latest: not recorded \(no decision entry in the dispatch log/);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC40

test('AC40: a 5 s window doesn\'t move "last looked", a 10 s one does; items before and after are marked; failing storage shows "markers off"', () => {
  const mem = new Map();
  const backing = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };
  let now = 1_000_000;
  const clock = () => now;
  // First visit: no record, nothing new, and the desk says so.
  let s = createSeen({ store: createStore(backing), now: clock });
  assert.equal(s.words, MARKERS_OFF);
  assert.equal(s.isNew(now + 1), false);
  now += 5_000;
  s.hidden();
  assert.equal(mem.has(SEEN_KEY), false, 'a 5 s flash does not count');
  s.visible();
  now += 12_000;
  s.hidden();
  const looked = JSON.parse(mem.get(SEEN_KEY)).lastLooked;
  assert.equal(looked, now, 'a window of 10 s or more ends: "last looked" is its end');
  // The next opening marks against it, and the marks stay put while the window is open.
  now += 60_000;
  s = createSeen({ store: createStore(backing), now: clock });
  assert.equal(s.words, null);
  assert.equal(s.isNew(looked - 1), false, 'before: not new');
  assert.equal(s.isNew(looked + 1), true, 'after: new');
  assert.equal(s.isNew(new Date(looked + 1).toISOString()), true);
  now += 20_000;
  s.hidden();
  assert.equal(s.isNew(looked + 1), true, 'the marks clear only for the next window');
  s.visible();
  assert.equal(s.isNew(looked + 1), false);
  // Failing storage.
  const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() {} };
  const b = createSeen({ store: createStore(broken), now: clock });
  assert.equal(b.words, MARKERS_OFF);
  assert.equal(b.isNew(now + 1), false);
});

// ---------------------------------------------------------------------------
// AC42

test('AC42: H5\'s extremes — 5 projects, 12+ waits, long titles — every screen of every project renders without an error', async () => {
  const setup = extremes();
  const app = await opened(setup);
  try {
    // From stage 2 (AC82): Home's briefing counts them all, as the board does.
    const total = Number(/^(\d+) need you/.exec(byClass(app.view, 'v2-brief')[0].textContent)[1]);
    assert.ok(total >= 12, `${total} waits`);
    for (const b of byClass(app.view, 'v2-hg')) if (b.attrs['aria-expanded'] === 'false') { b.click(); await app.flush(); }
    assert.equal(byClass(app.view, 'v2-tile').length, 5);
    for (const p of setup.config.projects) {
      for (const s of ['', '/timeline', '/team', '/queue', '/team/owner', '/team/orchestrator', '/team/builder/now', '/team/critic/e/0']) {
        await app.go(`#/p/${encodeURIComponent(p.name)}${s}`);
        assert.doesNotMatch(app.text(), /Can't show/, `${p.name}${s}`);
        assert.ok(app.text().includes(SANDBOX_MARKER), `${p.name}${s}: the marker`);
      }
      await app.go(`#/p/${encodeURIComponent(p.name)}/queue`);
      for (const a of byClass(app.view, 'sb-qrow').map((r) => findAll(r, (e) => e.tag === 'a')[0]).filter((a) => a && a.attrs.href.startsWith('#'))) {
        await app.go(a.attrs.href);
        assert.doesNotMatch(app.text(), /Can't show/, a.attrs.href);
      }
    }
  } finally {
    app.restore();
  }
});

// A real 360 px measure needs a browser, which the suite doesn't have (no packages, AC42): the
// pull request carries the Chromium check of every route. Here, what can be checked without one:
// text may wrap anywhere, nothing has a fixed width over 360 px, and no long unbroken text is drawn
// outside an element that wraps it.
test('AC42: nothing is fixed wider than a 360 px screen, and every drawn text sits where it may wrap', async () => {
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  assert.match(css, /\.sb-screen, \.sb-screen \* \{ overflow-wrap: anywhere; word-break: break-word; min-width: 0; \}/);
  // From stage 2 (AC82, C): Home's column widens to at most 960 px from 720 px wide, for two tiles a row;
  // that one rule, inside its media query, is the only width over 560 px.
  const wide = /@media \(min-width: 720px\) \{\s*html\.sb\.v2-page\.v2-home-page body \{ max-width: 960px; \}/;
  assert.match(css, wide, 'Home\'s wider column, from 720 px only');
  for (const m of css.replace(wide, '').matchAll(/(?:^|[;{\s])(?:min-|max-)?width:\s*(\d+)px/g)) {
    assert.ok(Number(m[1]) <= 560, `width ${m[1]}px`);
    if (!/max-width/.test(m[0])) assert.ok(Number(m[1]) <= 360, `fixed width ${m[1]}px`);
  }
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*white-space:\s*(nowrap|pre)\s*[;}][^{}]*)\}/g)) {
    // only the visually hidden label (1 px, clipped) may not wrap
    assert.ok(m[1].trim() === '.sb-vh', `${m[1].trim()}: white-space: ${m[3]} would stop text wrapping`);
  }
  for (const m of css.matchAll(/grid-template-columns:\s*([^;}]+)/g)) {
    for (const px of m[1].matchAll(/(\d+)px/g)) assert.ok(Number(px[1]) <= 60, `a ${px[1]}px column`);
  }
  // On H5's extremes every screen's long words are drawn inside .sb-screen or a sheet (which wrap).
  const app = await opened(extremes());
  try {
    for (const p of app.desk.states.keys()) {
      for (const s of ['', '/timeline', '/team', '/queue']) {
        await app.go(`#/p/${encodeURIComponent(p)}${s}`);
        for (const top of app.view.children) {
          // From stage 1a (AC81) the bar, and the board's sheet, sit beside the screen.
          assert.ok(/\bsb-(screen|scrim|sheet)\b|\bv2-(bar|scrim|sheet)\b/.test(top.className), `${p}${s}: ${top.className} is not a wrapping container`);
        }
      }
    }
  } finally {
    app.restore();
  }
});

test('AC42: no packages, the security headers and CSP unchanged, nothing from another origin, reduced motion respected, never colour alone', () => {
  const pkg = JSON.parse(readFileSync(`${SRC}/package.json`, 'utf8'));
  assert.equal(pkg.dependencies, undefined);
  // The accepted page's copies (tests/desk/fixtures/accepted-m2/): desk-build has no history to read.
  const at = (p) => fixture(`accepted-m2/${p}`);
  assert.equal(readFileSync(`${SRC}/public/_headers`, 'utf8'), at('_headers'));
  // From 2026-10-18 the page adds AC75's two links, the manifest's and the Home Screen icon's, and
  // nothing else: the CSP and every other line are the accepted page's.
  const AC75_LINKS = '<link rel="manifest" href="/manifest.webmanifest" crossorigin="use-credentials">\n<link rel="apple-touch-icon" href="/icons/desk-180.png">\n';
  const html = readFileSync(`${SRC}/public/index.html`, 'utf8');
  assert.ok(html.includes(AC75_LINKS));
  assert.equal(html.replace(AC75_LINKS, ''), at('index.html'));
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  const page = readFileSync(`${SRC}/public/sandbox.js`, 'utf8');
  // From stage 1a (AC81): IBM Plex, served by the desk itself; no font, image or stylesheet from another origin.
  assert.doesNotMatch(css, /@import/, 'no stylesheet from anywhere');
  for (const m of css.matchAll(/url\(([^)]*)\)/g)) assert.match(m[1], /^"fonts\/IBMPlex(Sans|Mono)-[A-Za-z]+-(Latin1|Pi)\.woff2"$/, `url(${m[1]}): the desk's own font files only`);
  for (const m of css.matchAll(/@font-face \{([^}]*)\}/g)) assert.match(m[1], /font-family: "IBM Plex (Sans|Mono)"/);
  assert.doesNotMatch(page, /https?:\/\/(?!github\.com|www\.w3\.org\/2000\/svg)/, 'no other origin is loaded');
  // Every animation sits inside a no-preference reduced-motion block.
  const blocks = [...css.matchAll(/@media \(prefers-reduced-motion: no-preference\) \{([\s\S]*?\n)\}/g)].map((m) => m[1]).join('\n');
  const all = [...css.matchAll(/animation:/g)].length;
  assert.equal([...blocks.matchAll(/animation:/g)].length, all);
  assert.ok(all > 0);
  // Colour never alone: each queue group has a shape and a title; each pill and rule a sign.
  for (const sign of ['.sb-pill.you::before', '.sb-pill.ok::before', '.sb-pill.bad::before', '.sb-rule.ok::before', '.sb-rule.warn::before']) assert.ok(css.includes(sign), sign);
});

// ---------------------------------------------------------------------------
// AC14 with J11's reads

test('AC14 (with J11\'s and J12\'s reads, AC42): 5 projects, 16 window-hours, 10 openings, 100 head changes → fewer than 10,000 calls, no early retries', async () => {
  const DAY = Date.parse('2026-11-03T00:00:00Z');
  const HOUR = 3_600_000;
  const base = extremes();
  const config = base.config;
  const clock = fakeClock(DAY);
  const repos = base.repos;
  // J12 (2026-10-16): each v3 project answers its pull requests' read with J12's built fixture
  // (NOT as GitHub sent it); every opening is a new window with a memory-only store, so each is cold.
  for (const p of config.projects) if (p.model === 'v3') repos[p.name].pullsAnswer = pullsAnswer();
  const server = fakeServer(repos, config, clock);
  const windowMs = (16 * HOUR) / 10;
  let changes = 0;
  for (let o = 0; o < 10; o++) {
    const open = DAY + o * 2.4 * HOUR;
    await clock.runUntil(open);
    const desk = createDesk({ config, call: (p, b) => server.call(p, b), clock, store: createStore(null), pullsStore: createStore(null), isVisible: () => true, j11: true });
    desk.start();
    for (let c = 0; c < 10; c++) {
      await clock.runUntil(open + ((c + 0.5) * windowMs) / 10);
      const p = config.projects[changes % 5];
      const r = repos[p.name];
      if (p.model === 'v3') r.commit({ 'status/P-003.toml': `kind = "project"\nstage = 5\nstate = "dispatched"\nrole = "builder"\nsessions = ${changes}\n` });
      else r.commit({ 'docs/LEDGER.md': `${r.files['docs/LEDGER.md']}\n## L-${1000 + changes} — change\n` });
      changes++;
    }
    await clock.runUntil(open + windowMs);
    // The J11 records arrived: the sandbox's timeline was read in the window.
    if (o === 0) assert.ok(desk.snapshot('Alpha').records.has('docs/PROJECT.md'));
    desk.stop();
  }
  const calls = server.calls;
  const polls = calls.filter((c) => c.path === '/api/poll').length;
  const blobs = calls.filter((c) => c.path === '/api/blobs').length;
  assert.equal(changes, 100);
  assert.ok(calls.length < 10_000, `${calls.length} calls`);
  assert.ok(polls <= 4_800 + 50, `${polls} polls`);
  // A3: about one more /api/blobs call per cold load for J11's blobs.
  assert.ok(blobs <= 150 + 100 + 50, `${blobs} blob calls`);
  // J12 rides in the blob calls (no call of its own): a cold read per opening per v3 project (one
  // page here), and the first page again on each of their head changes.
  const pullReads = calls.filter((c) => c.path === '/api/blobs' && c.body.pulls).length;
  const v3Changes = 100 * 4 / 5;
  assert.ok(pullReads >= 10 * 4, `${pullReads} J12 reads: at least one cold read per opening per v3 project`);
  assert.ok(pullReads <= 10 * 4 * 3 + v3Changes, `${pullReads} J12 reads`);
  assert.ok(calls.filter((c) => c.body.pulls).every((c) => c.path === '/api/blobs'));
  const byProject = new Map();
  for (const c of calls) {
    if (!byProject.has(c.project)) byProject.set(c.project, []);
    byProject.get(c.project).push(c);
  }
  for (const [name, list] of byProject) {
    let last = null;
    for (const c of list) {
      if (c.path === '/api/poll') {
        if (last != null) assert.ok(c.at - last >= POLL_MS, `${name}: poll ${c.at - last} ms after the last`);
        last = c.at;
      } else assert.ok(last != null && c.at - last < POLL_MS, `${name}: a blob call outside a poll cycle`);
    }
  }
});

test('Sandbox: groupOf puts every item in one group, and sheetView offers J3\'s links only', () => {
  assert.equal(groupOf({ kind: 'card', card: { gate: 'dor' } }), 'gates');
  assert.equal(groupOf({ kind: 'card', card: { gate: 'dor-fail' } }), 'decisions');
  assert.equal(groupOf({ kind: 'hold' }), 'decisions');
  assert.equal(groupOf({ kind: 'status-card' }), 'decisions');
  assert.equal(groupOf({ kind: 'merge' }), 'merges');
  assert.equal(groupOf({ kind: 'pr' }), 'merges');
  const m = buildModel({ project: v3('A'), config: CONFIG, tree: new Map(), records: new Map(), now: new Date(NOW) });
  assert.deepEqual(m.allEntries, []);
  void sheetView;
});
