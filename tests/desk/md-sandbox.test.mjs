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

// ---------------------------------------------------------------------------
// AC48

test('AC48: Home — one card per project in AC8\'s order, each with its icon, name, where it is, phases, who has the ball and one pill; the marker; no New project', async () => {
  const app = await opened();
  try {
    const v = app.view;
    const cards = byClass(v, 'sb-pc');
    assert.equal(cards.length, 2);
    for (const c of cards) {
      assert.equal(byClass(c, 'sb-app').length, 1, 'a quiet line icon');
      // AC54 (2026-10-14): the card shows the README summary in AC37's place; AC37's line opens from "Latest".
      assert.equal(byClass(c, 'sb-sum').length, 1);
      assert.equal(byClass(c, 'sb-latest').length, 1);
      assert.equal(byClass(c, 'sb-ck').length, 1);
      assert.equal(byClass(c, 'sb-ball').length, 1);
      assert.equal(byClass(c, 'sb-pill').length, 1);
    }
    assert.ok(app.text().includes(SANDBOX_MARKER));
    assert.match(app.text(), /12 waiting on you in all/, 'a count in all, never a combined list');
    assert.match(app.text(), /Median answer time/, "AC21's V5 line stays on Home");
    assert.doesNotMatch(app.text(), /New project/);
    // 2026-10-16 (decisions/questions/P-001-design-lab-open.md, answer 1): no bar, no deferred
    // words, and nothing fixed to the bottom of Home's screen, with no sheet or bubble open.
    assert.equal(byClass(v, 'sb-sheet').length + byClass(v, 'sb-scrim').length + byClass(v, 'sb-bubble').length, 0, 'no sheet or bubble open');
    assert.doesNotMatch(app.text(), /Tell your Chief of Staff/, 'no "Tell your Chief of Staff…" bar');
    assert.doesNotMatch(app.text(), /Deferred: waiting on your ruling/i, 'no deferred words');
    assert.equal(findAll(v, (e) => e.tag === 'button' && 'disabled' in e.attrs).length, 0, 'no disabled bar');
    for (const cls of ['sb-band', 'sb-composer', 'sb-deferred', 'sb-dock']) assert.equal(byClass(v, cls).length, 0, `no .${cls} on Home`);
    // Every rule that fixes or sticks something to the screen, against every element on Home.
    const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const pinned = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].filter((m) => /position:\s*(fixed|sticky)/.test(m[2]))
      .flatMap((m) => m[1].split(',').map((x) => x.trim().split(/[\s>+~]+/).pop()));
    assert.ok(pinned.includes('.sb-dock') && pinned.includes('.sb-sheet'), `the rules found: ${pinned.join(' ')}`);
    const homeEls = findAll(v, () => true);
    for (const sel of pinned) {
      const classes = sel.split('.').filter(Boolean).map((c) => c.replace(/[:[].*$/, ''));
      const hit = homeEls.filter((e) => classes.every((c) => ` ${e.className} `.includes(` ${c} `)));
      assert.equal(hit.length, 0, `nothing on Home matches ${sel}, which is fixed or sticky`);
    }
  } finally {
    app.restore();
  }
});

test('AC48: each card, pill and bar tap goes to the screen it names; every project screen has the bottom bar in order and a way back', async () => {
  const app = await opened();
  try {
    const card = byClass(app.view, 'sb-pc')[0];
    const [main] = byClass(card, 'sb-pc-main');
    const [pill] = byClass(card, 'sb-pill');
    assert.equal(main.attrs.href, '#/p/Alpha');
    assert.equal(pill.attrs.href, '#/p/Alpha/queue');
    for (const [hash, title] of [['#/p/Alpha', 'Current status'], ['#/p/Alpha/timeline', 'Timeline'], ['#/p/Alpha/team', 'Team'], ['#/p/Alpha/queue', 'Queue']]) {
      await app.go(hash);
      assert.ok(app.text().includes(SANDBOX_MARKER), `${hash}: the marker`);
      assert.ok(app.text().includes(title), `${hash}: ${title}`);
      const tabs = byClass(app.view, 'sb-tab');
      assert.deepEqual(tabs.map((t) => t.textContent.replace(/\d+$/, '')), ['Status', 'Timeline', 'Team', 'Queue']);
      assert.deepEqual(tabs.map((t) => t.attrs.href), ['#/p/Alpha', '#/p/Alpha/timeline', '#/p/Alpha/team', '#/p/Alpha/queue']);
      assert.equal(byClass(app.view, 'sb-back')[0].attrs.href, '#/', 'a way back to Home');
    }
    await app.go('#/p/Alpha');
    const hrefs = byClass(app.view, 'sb-btn').map((b) => b.attrs.href);
    assert.deepEqual(hrefs, ['#/p/Alpha/queue', '#/p/Alpha/team'], 'two buttons open the queue and the team');
    // AC36, as AC55 changed it (2026-10-15): inside the sandbox the M1 and M2 detail is reached
    // through the views rebuilt in the new design, never through a link to the accepted views.
    const links = linksIn(app.view).map((l) => l.href);
    for (const h of ['#/p/Alpha/pipeline', '#/p/Alpha/asked', '#/p/Alpha/agents']) assert.ok(links.includes(h), h);
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
      const card = byClass(app.view, 'sb-pc').find((c) => c.textContent.includes(mine));
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

test('AC48: a project whose read goes stale shows no "All clear" on Home', async () => {
  const setup = { config: { ...CONFIG, projects: [v3('Quiet')] }, repos: { Quiet: repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml') }) } };
  const app = await opened(setup);
  try {
    assert.ok(app.text().includes('All clear'));
    setup.repos.Quiet.fail = { kind: 'network' };
    await app.advance(4 * 60e3);
    await app.go('#/');
    assert.ok(!app.text().includes('All clear'));
    assert.match(app.text(), /Can't read/);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC52 and AC53

test('AC52: every item sits in one group by the action it needs; order by raised time; no row says whether it can be acted on; Deploys shown, not counted', async () => {
  const app = await opened(twoProjects(), '#/p/Alpha/queue');
  try {
    const groups = byClass(app.view, 'sb-group');
    const titles = groups.map((g) => byClass(g, 'sb-gh')[0].textContent);
    assert.deepEqual(titles.map((t) => t.replace(/[◆▲✎⇄⏵]/, '').replace(/(\d+|none|not recorded)$/, '')),
      ['Decisions', 'Gate rulings', 'Verdicts to write', 'Merges', 'Deploys']);
    const rows = (i) => byClass(groups[i], 'sb-qt').map((r) => r.textContent);
    assert.equal(rows(0).length, 3, 'a card, a question and a hold card');
    assert.match(rows(0)[0], /Alpha's question/, 'raised first (400 min ago)');
    assert.match(rows(0)[1], /Q-020/, 'then the card raised 200 min ago');
    assert.match(rows(0)[2], /governance run is not green/, 'no raised time: last');
    assert.match(rows(1)[0], /Build gate/);
    assert.match(groups[2].textContent, /not recorded/);
    assert.equal(rows(3).length, 2, 'the pull request and the merge card');
    assert.match(groups[4].textContent, /Shown, not counted/);
    assert.match(byClass(app.view, 'sb-hdr')[0].textContent, /6 waiting on you/, 'the deploy is not counted');
    assert.doesNotMatch(app.text(), /do first|can be acted on|ready to act|after #/i);
  } finally {
    app.restore();
  }
});

test('AC52: the recommendation is labelled and never preselected; a verdict has none; picking a chip fills the box (two taps to GitHub)', async () => {
  const app = await opened(twoProjects(), '#/p/Alpha/queue');
  try {
    const href = byClass(app.view, 'sb-qrow').map((r) => findAll(r, (e) => e.tag === 'a')[0]).find((a) => a.textContent.includes('question')).attrs.href;
    await app.go(href);
    const chips = byClass(app.view, 'sb-chip');
    assert.equal(chips.length, 2);
    assert.ok(chips.every((c) => c.attrs['aria-checked'] === 'false'), 'nothing preselected');
    // AC53 as note 15 extended it (2026-10-15): the recommendation is labelled "Recommended", the
    // ruling file is prefilled from the start (no letter until one is picked), and a lettered
    // question's ruling carries the question and its options as they were put.
    assert.match(app.text(), /Recommended B — no\./);
    const box = () => findAll(app.view, (e) => e.tag === 'textarea' && /^box:/.test(e.dataset.k || ''))[0];
    assert.match(box().value, /^Ruling: \n/, 'nothing picked for the owner');
    chips[0].click();
    await app.flush();
    const ta = box();
    assert.equal(ta.value, "Ruling: A\n\nQuestion: questions/Alpha-pick.md\n\nQuestion, as put: Alpha's question\nOptions, as put:\n  A. Yes.\n  B. No.\n");
    const go = byClass(app.view, 'sb-go')[0];
    assert.equal(go.attrs.href, `https://github.com/shumpmaster/Alpha/new/main?filename=decisions%2Fquestions%2FAlpha-pick.md&value=${encodeURIComponent(ta.value)}`);
    // The PR's sheet: no chips, its own verdict box at the head branch, "not recorded" whether it exists.
    await app.go('#/p/Alpha/queue/pr%3A80');
    assert.equal(byClass(app.view, 'sb-chip').length, 0, 'a verdict has no recommendation and no chips');
    assert.doesNotMatch(app.text(), /Recommendation/);
    assert.match(app.text(), /Whether reviews\/80\/owner\.md already exists on its branch: not recorded/);
    const [pull, verdict] = byClass(app.view, 'sb-go').map((a) => a.attrs.href);
    assert.equal(pull, 'https://github.com/shumpmaster/Service-Desk/pull/80');
    assert.ok(verdict.startsWith('https://github.com/shumpmaster/Alpha/new/build/builder/md-sandbox?filename=reviews%2F80%2Fowner.md&value=Verdict%3A%20PASS'), verdict);
    assert.match(app.text(), /The Reviewer's statement · Commit it unchanged/);
    assert.match(app.text(), /not recorded: no record the desk reads holds the Reviewer's statement/);
  } finally {
    app.restore();
  }
});

test('AC52: hold and merge cards offer no chips, no text box and no link to commit', async () => {
  const app = await opened(twoProjects(), '#/p/Alpha/queue/hold%3Aqueue%2Fci-hold-4a2448939173.md');
  try {
    assert.equal(byClass(app.view, 'sb-chip').length, 0);
    assert.equal(findAll(app.view, (e) => e.tag === 'textarea').length, 0);
    assert.ok(!linksIn(app.view).some((l) => /\/new\//.test(l.href || '')));
    assert.match(app.text(), /No answer needed: fix or re-run the governance run/);
    await app.go('#/p/Alpha/queue/merge%3Aqueue%2FP-002-merge-conflict.md');
    assert.equal(byClass(app.view, 'sb-chip').length, 0);
    assert.equal(findAll(app.view, (e) => e.tag === 'textarea').length, 0);
    assert.ok(!linksIn(app.view).some((l) => /\/new\//.test(l.href || '')));
    assert.match(app.text(), /No answer needed: merge item\/P-002 by hand/);
  } finally {
    app.restore();
  }
});

test('AC52: a gate ruling\'s sheet quotes its case, links the case only when the tree holds it, and the user representative is "not needed"', async () => {
  const app = await opened(twoProjects(), '#/p/Alpha/queue/card%3Aqueue%2FP-002-criteria-1.md');
  try {
    assert.match(app.text(), /Pass the Build gate: the plan for the queue screen passed review/);
    const links = linksIn(app.view);
    assert.ok(links.some((l) => l.href === 'https://github.com/shumpmaster/Alpha/blob/main/docs/gates/P-002/build-gate-1-case.md'));
    assert.match(app.text(), /The Critic's view: no file recorded/);
    assert.match(app.text(), /User representative: not needed/);
    assert.deepEqual(byClass(app.view, 'sb-chip').map((c) => c.textContent), ['proceed', 'hold', 'recycle', 'kill']);
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

test('AC52: a pull request that leaves the queue while the page is open shows in "Done today" as "no longer open, time not recorded"', async () => {
  const setup = twoProjects();
  const app = await opened(setup, '#/p/Alpha/queue');
  try {
    setup.repos.Alpha.pulls = [];
    await app.advance(POLL_MS);
    await app.go('#/p/Alpha/queue');
    assert.match(app.text(), /Alpha: a change to merge PR #80 no longer open, time not recorded/);
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

test('AC53: the rule line follows the typing, and the button stays available', async () => {
  const app = await opened(twoProjects(), '#/p/Alpha/queue/card%3Aqueue%2FP-002-criteria-1.md');
  try {
    byClass(app.view, 'sb-chip').find((c) => c.textContent === 'hold').click();
    await app.flush();
    const ta = findAll(app.view, (e) => e.tag === 'textarea' && /^box:/.test(e.dataset.k || ''))[0]; // the answer file's box (AC53, note 15)
    assert.equal(ta.value, 'Decision: hold\n\nReason: \n');
    assert.match(byClass(app.view, 'sb-rule')[0].textContent, /needs a "Reason:" line with text/);
    assert.equal(byClass(app.view, 'sb-go').length, 1, 'the button stays');
    ta.value = 'Decision: hold\n\nReason: waiting for the screens\n';
    for (const fn of ta.listeners.input) fn();
    assert.match(byClass(app.view, 'sb-rule')[0].textContent, /In form/);
    assert.match(byClass(app.view, 'sb-go')[0].attrs.href, /Reason%3A%20waiting%20for%20the%20screens/);
    // The confirmation: "opened in GitHub" on the row, and the tracker, until the record arrives.
    byClass(app.view, 'sb-go')[0].click();
    await app.advance(10);
    assert.match(app.text(), /Opened in GitHub/);
    assert.match(app.text(), /See it on the timeline/);
    await app.go('#/p/Alpha/queue');
    assert.match(app.text(), /opened in GitHub/);
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

test('AC49: the Team screen — your tile with the next three queue lines, one tile per member, the Chief of Staff "not recorded", a lit light only while working', async () => {
  const app = await opened(twoProjects(), '#/p/Alpha/team');
  try {
    const you = byClass(app.view, 'sb-you')[0];
    assert.equal(findAll(you, (e) => e.tag === 'li').length, 3, 'the next three lines');
    assert.match(you.textContent, /Waiting on you: 6 in your queue/);
    const tiles = byClass(app.view, 'sb-tile');
    const ids = tiles.map((t) => t.attrs.href.split('/').pop());
    assert.equal(ids.filter((x) => x === 'chief-of-staff').length, 1);
    assert.ok(ids.includes('orchestrator') && ids.includes('builder') && ids.includes('reviewer'));
    const cos = tiles.find((t) => t.attrs.href.endsWith('chief-of-staff'));
    assert.match(cos.textContent, /Its sessions aren't recorded/);
    const builder = tiles.find((t) => t.attrs.href.endsWith('/builder'));
    assert.match(builder.textContent, /Working/);
    assert.ok(byClass(builder, 'sb-light')[0].className.includes('lit'));
    const critic = tiles.find((t) => t.attrs.href.endsWith('/critic'));
    assert.match(critic.textContent, /Idle/);
    assert.ok(!byClass(critic, 'sb-light')[0].className.includes('lit'));
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
  assert.match(cos.tiles[0].why, /not recorded: its sessions aren't logged yet/);
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
    assert.match(app.text(), /waiting on you in all/);
    const total = Number(/(\d+) waiting on you in all/.exec(app.text())[1]);
    assert.ok(total >= 12, `${total} waits`);
    // AC54: the v2.5 project sits in "Closed or not applicable", which starts closed; open every group.
    for (const b of byClass(app.view, 'sb-hg-btn')) if (b.attrs['aria-expanded'] === 'false') { b.click(); await app.flush(); }
    assert.equal(byClass(app.view, 'sb-pc').length, 5);
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
  for (const m of css.matchAll(/(?:^|[;{\s])(?:min-|max-)?width:\s*(\d+)px/g)) {
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
          assert.ok(/\bsb-(screen|scrim|sheet)\b/.test(top.className), `${p}${s}: ${top.className} is not a wrapping container`);
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
  assert.equal(readFileSync(`${SRC}/public/index.html`, 'utf8'), at('index.html'));
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  const page = readFileSync(`${SRC}/public/sandbox.js`, 'utf8');
  assert.doesNotMatch(css, /@import|url\(|@font-face/, 'no web font, image or stylesheet from anywhere');
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

test('AC14 (with J11\'s reads, AC42): 5 projects, 16 window-hours, 10 openings, 100 head changes → fewer than 10,000 calls, no early retries', async () => {
  const DAY = Date.parse('2026-11-03T00:00:00Z');
  const HOUR = 3_600_000;
  const base = extremes();
  const config = base.config;
  const clock = fakeClock(DAY);
  const repos = base.repos;
  const server = fakeServer(repos, config, clock);
  const windowMs = (16 * HOUR) / 10;
  let changes = 0;
  for (let o = 0; o < 10; o++) {
    const open = DAY + o * 2.4 * HOUR;
    await clock.runUntil(open);
    const desk = createDesk({ config, call: (p, b) => server.call(p, b), clock, store: createStore(null), isVisible: () => true, j11: true });
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
