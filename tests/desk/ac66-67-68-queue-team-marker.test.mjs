// AC66 (the Queue: what each item unblocks and why, the facts behind the ask, neutral group marks,
// "Done today" on the Timeline), AC67 (the Team cards: circle icons, "last:", "feeds", "On the
// Timeline ›") and AC68 (one phase marker on the four project screens; "More detail" without the
// v3 Pipeline view, with "Record notes"), trial-view notes 2, notes 28 to 31 (2026-10-16). From
// AC52's two-project fixtures with added records (NOT real records), AC49's and J11's fixtures.
// ac-test: S-001/AC66 ac-test: S-001/AC67 ac-test: S-001/AC68
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FIX, SRC } from './helpers.mjs';
import { pr } from './fake-desk.mjs';
import { byClass, findAll, linksIn, loadSandbox } from './sandbox-helpers.mjs';
import { NOW, iso, md, twoProjects, opened, v25, fullRepo } from './sandbox-fixtures.mjs';
import { openSD, keyed, models, AC61_DOC, SD3, CONFIG, j11Files, sdRepo, railLayout } from './tv2-fixtures.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { markerView, runsContext } from '../../src/lib/feed.js';

// The live file was tidied away by the model 3.5.0 sync (S-033); this fixture is its last version (dc97190).
const REAL_QUESTION = readFileSync(`${FIX}/trial-view/P-001-design-lab-open.md`, 'utf8');
const q = (title, extra = '') => `# Ruling needed: ${title}\n\nWHY: a test.\nOPTIONS:\n  A. Yes.\n  B. No.\nRECOMMENDATION: B — no.\nRISK CLASS: R0\nREVERSIBILITY: reversible\nBLAST RADIUS: none\nDEFAULT: B\nTIMEOUT: 24\n${extra}`;

/** AC52's two projects, Alpha with AC66's added records (NOT real records). */
function ac66Setup({ doc = null } = {}) {
  const setup = twoProjects();
  const A = setup.repos.Alpha;
  A.commit({
    ...(doc ? { 'docs/PROJECT.md': doc } : {}),
    'questions/Alpha-ms.md': q('a question naming its milestone', '\nMilestone: MD1\n\n## Context\n- The owner picked the look on 16 Oct (source: decisions/questions/P-001-design-lab-open.md)\n- A fact with no source\n'),
    'questions/Alpha-none.md': q('a question naming none', '\nMilestone: none (a records-only question)\n'),
    'questions/P-001-design-lab-open.md': REAL_QUESTION,
    'queue/Q-013-stop-1.md': md('long-card.md').replace(/Q-020/g, 'Q-013'),
    'status/Q-013.toml': 'kind = "research"\nstage = 2\nstate = "waiting-owner"\nrole = "critic-triage"\ngate = "stop"\ncard = 1\n',
  });
  const p44 = pr(44, 'A pull request the plan names', { head: 'build/builder/m2-answering', headRepo: 'shumpmaster/Alpha' });
  const p81 = pr(81, 'A pull request named by its body', { head: 'build/builder/x', headRepo: 'shumpmaster/Alpha' });
  p81.body = '## What this means for you\nA change.\n\nMilestone: MD3\n\n## Context\n- A body fact (source: docs/PROJECT.md)\n';
  A.pulls.push(p44, p81);
  return setup;
}

// From stage 1a (AC80): "Unblocks", the milestone's why and the Context fold sit in each card's sheet.
const sheetOf = async (app, key) => app.go(`#/waiting/Alpha/card/${encodeURIComponent(key)}`);
const unb = (app, key) => keyed(app, `unb:${key}`);

// ---------------------------------------------------------------------------
// AC66

test('AC66: each "Unblocks" by its order, in each card\'s sheet (AC80) — the item\'s own Milestone: line, a card\'s item in a plan list, a pull request in a plan list or by its body, "none (<reason>)", and "milestone not recorded" (the real P-001-design-lab-open.md among them)', async () => {
  const app = await opened(ac66Setup(), '#/waiting/Alpha');
  try {
    await app.advance(POLL_MS);
    const line = async (key) => {
      await sheetOf(app, key);
      return byClass(unb(app, key), 'v2-unb-l').map((x) => x.textContent);
    };
    assert.deepEqual(await line('q:Alpha-ms'), ['Unblocks What a good desk looks like is known MD1'], '1. its own Milestone: line');
    assert.deepEqual(await line('q:Alpha-none'), ['Unblocks no milestone: a records-only question']);
    assert.deepEqual(await line('card:queue/Q-013-stop-1.md'), ['Unblocks What a good desk looks like is known MD1'], '2. a card on Q-013, which MD1\'s list names');
    assert.deepEqual(await line('pr:44'), ['Unblocks Cards answered straight from the desk M2', 'Unblocks Agent usage shown on the desk M2B'], '3. the plan lists naming PR #44, in section 3\'s order');
    assert.deepEqual(await line('pr:81'), ['Unblocks The chosen design running on the real back end MD3 · named by its pull request, not yet in the plan'], '3. failing those, its body');
    assert.deepEqual(await line('q:P-001-design-lab-open'), ['Unblocks: milestone not recorded'], 'the real record names none');
    assert.match(byClass(unb(app, 'q:P-001-design-lab-open'), 'v2-unb-l')[0].className, /\bgap\b/, 'slate (AC69)');
    for (const key of ['q:Alpha-pick', 'card:queue/Q-020-stop-1.md', 'card:queue/P-002-criteria-1.md', 'pr:80']) assert.deepEqual(await line(key), ['Unblocks: milestone not recorded'], key);
  } finally {
    app.restore();
  }
});

test('AC66: each milestone\'s why beside it, in the card\'s sheet — the why line as written with its source (AC61\'s fixture), or the slate "Why not recorded yet · for the agents to add"; no why with no milestone', async () => {
  const app = await opened(ac66Setup({ doc: AC61_DOC }), '#/waiting/Alpha');
  try {
    await app.advance(POLL_MS);
    const why = async (key) => {
      await sheetOf(app, key);
      return byClass(unb(app, key), 'v2-wl').map((x) => [x.textContent, /\bgap\b/.test(x.className)]);
    };
    assert.deepEqual(await why('q:Alpha-ms'), [['Why the desk\'s look rests on published design guidance, not on taste docs/PROJECT.md'.replace(' docs', 'docs'), false]]);
    assert.deepEqual(await why('pr:44'), [['Why not recorded yet · for the agents to add', true], ['Why "It\'s important for me to see timelines and context windows to be able to drive things."docs/PROJECT.md', false]]);
    assert.deepEqual(await why('q:Alpha-none'), []);
    assert.deepEqual(await why('q:P-001-design-lab-open'), []);
  } finally {
    app.restore();
  }
});

test('AC66: each Context fold, in the card\'s sheet — closed to start, opened and closed by a tap, Enter or Space; the facts each with its source, "source not recorded"; "Context: not recorded" otherwise; kept through a refresh', async () => {
  const app = await opened(ac66Setup(), '#/waiting/Alpha');
  try {
    await app.advance(POLL_MS);
    await sheetOf(app, 'q:Alpha-ms');
    const f = () => keyed(app, 'fold:ctx:q:Alpha-ms');
    assert.equal(f().attrs['aria-expanded'], 'false');
    assert.equal(keyed(app, 'facts:q:Alpha-ms'), null);
    await app.tap(f());
    const facts = findAll(keyed(app, 'facts:q:Alpha-ms'), (e) => e.tag === 'li').map((x) => x.textContent);
    assert.deepEqual(facts, ['The owner picked the look on 16 Octdecisions/questions/P-001-design-lab-open.md', 'A fact with no sourcesource not recorded']);
    await app.advance(POLL_MS);
    assert.equal(f().attrs['aria-expanded'], 'true', 'kept through a refresh (AC56)');
    f().dispatch('keydown', { key: 'Enter', preventDefault() {} });
    await app.flush();
    assert.equal(keyed(app, 'facts:q:Alpha-ms'), null);
    f().dispatch('keydown', { key: ' ', preventDefault() {} });
    await app.flush();
    assert.ok(keyed(app, 'facts:q:Alpha-ms'));
    await sheetOf(app, 'pr:81');
    await app.tap(keyed(app, 'fold:ctx:pr:81'));
    assert.equal(keyed(app, 'facts:pr:81').textContent, 'A body factdocs/PROJECT.md', 'a pull request: its body\'s Context');
    await sheetOf(app, 'q:P-001-design-lab-open');
    await app.tap(keyed(app, 'fold:ctx:q:P-001-design-lab-open'));
    const none = keyed(app, 'facts:q:P-001-design-lab-open');
    assert.equal(none.textContent, 'Context: not recorded');
    assert.match(none.className, /\bgap\b/);
  } finally {
    app.restore();
  }
});

test('AC66 + AC69 (changed by AC80): the groups give way to the lanes\' headings; a card\'s kind icon vermilion only while it waits on the owner, grey in Done; nothing in the quiet lines or Done is coral; no lane or card rule uses a meaning colour but the grey inks and --you', async () => {
  const setup = ac66Setup();
  const app = await opened(setup, '#/waiting/Alpha');
  try {
    await app.advance(POLL_MS);
    assert.deepEqual(byClass(app.view, 'v2-lh').map((h) => h.children[0].textContent), ['Waiting on you', 'Kicked back', 'Done · last 24 h']);
    assert.equal(byClass(app.view, 'sb-gh').length, 0, 'no Queue groups');
    for (const k of byClass(byClass(app.view, 'lane-wait')[0], 'v2-kd')) assert.doesNotMatch(k.className, /\bdone\b/);
    setup.repos.Alpha.pulls = setup.repos.Alpha.pulls.filter((x) => x.number !== 44);
    await app.advance(POLL_MS);
    for (const k of byClass(byClass(app.view, 'lane-done')[0], 'v2-kd')) assert.match(k.className, /\bdone\b/);
  } finally {
    app.restore();
  }
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /\.v2-kd \.v2-k \{ color: var\(--you\); \}/, 'the kind icons of cards waiting on the owner');
  assert.match(css, /\.v2-kd\.done \.v2-k \{ color: var\(--ink2\); \}/, 'grey in Done');
  const meaning = ['--agent', '--pass', '--fail', '--merge', '--block', '--gold', '--ph-disc', '--ph-des', '--ph-build', '--ph-launch', '--b-ctx', '--b-why', '--b-tech',
    '--agents', '--passs', '--fails', '--merges', '--blocks', '--golds', '--yous', '--ok', '--bad'];
  for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const sel = m[1].trim();
    if (!/\.v2-(lane|lh|lc|grp|gn|gc|card|kd|t|m|mk|gl|gk|step|steps|undo|gatebtns|empty|more|ql|qsmall|qfold|flist|ft|fw|unb-l|wl|facts)\b/.test(sel)) continue;
    if (/\.v2-drow \.v2-k\.ok|\.v2-why\.bad|\.v2-ql\.bad/.test(sel)) continue; // the ✓ of a confirmed Done row (pass) and a failing check or unreadable project (fail), each with its word
    for (const tok of meaning) assert.ok(!m[2].includes(`var(${tok})`), `${sel} uses ${tok}`);
    if (/\.v2-(ql|qsmall|qfold|flist|ft|fw|drow|dt|more)\b/.test(sel)) assert.ok(!m[2].includes('var(--you)'), `${sel}: nothing in the quiet lines or Done is coral`);
  }
});

test('AC66 (changed by AC80): each confirmed Done row\'s sheet links "On the Timeline" — a card answered on a sprint, a ruling whose question names a milestone — and "sprint: not recorded" otherwise', async () => {
  const setup = ac66Setup();
  const A = setup.repos.Alpha;
  const at = (min) => [{ commit: { committer: { date: iso(NOW - min * 60e3) } } }];
  const log = `${A.files['dispatch-log/2026-10.jsonl']}${[
    { item: 'Q-013', trigger: 'decision', gate: 'stop', card: 1, word: 'retry', record: 'decisions/Q-013/stop-1.md', time: iso(NOW - 20 * 60e3) },
    { item: 'P-002', trigger: 'decision', gate: 'criteria', card: 1, word: 'proceed', record: 'decisions/P-002/criteria-1.md', time: iso(NOW - 25 * 60e3) },
  ].map((o) => JSON.stringify(o)).join('\n')}\n`;
  A.commit({
    'dispatch-log/2026-10.jsonl': log, 'decisions/Q-013/stop-1.md': 'Decision: retry\n', 'decisions/P-002/criteria-1.md': 'Decision: proceed\n',
    'questions/P-001-ms-pick.md': q('a question naming MD2', '\nMilestone: MD2\n'), 'decisions/questions/P-001-ms-pick.md': 'Ruling: A\n',
    'decisions/questions/P-001-plain-pick.md': 'Ruling: B\n',
  });
  Object.assign(A.history, { 'decisions/questions/P-001-ms-pick.md': at(30), 'decisions/questions/P-001-plain-pick.md': at(35) });
  const app = await loadSandbox({ ...setup, hash: '#/waiting/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    const sheetLink = async (id) => {
      await app.go(`#/waiting/Alpha/card/${encodeURIComponent(`${id}#answer`)}`);
      const sh = byClass(app.view, 'v2-sheet')[0];
      assert.ok(sh, id);
      return { sh, link: linksIn(sh).find((l) => l.text === 'On the Timeline') };
    };
    assert.equal((await sheetLink('Alpha|card|queue/Q-013-stop-1.md')).link.href, '#/p/Alpha/timeline/sprint/Q-013', 'a card answered: its item, a sprint on the Timeline');
    assert.equal((await sheetLink('Alpha|question|questions/P-001-ms-pick.md')).link.href, '#/p/Alpha/timeline/ms/MD2', 'a ruling: the milestone its question names');
    for (const id of ['Alpha|gate|queue/P-002-criteria-1.md', 'Alpha|question|questions/P-001-plain-pick.md']) {
      const { sh, link } = await sheetLink(id);
      assert.equal(link, undefined, id);
      assert.match(sh.textContent, / · sprint: not recorded/, id);
    }
    // The link opens the Timeline at that sprint, its milestone's sprints opened.
    await app.go('#/p/Alpha/timeline/sprint/Q-013');
    assert.equal(keyed(app, 'fold:sprints:Design-i2:MD1').attrs['aria-expanded'], 'true');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC67

test('AC67: each card\'s state icon and word, with the key above; no light, no glow, nothing that loops on the Team screen', async () => {
  const app = await opened(twoProjects(), '#/p/Alpha/team');
  try {
    const key = byClass(app.view, 'sb-tkey')[0];
    assert.deepEqual(findAll(key, (e) => /\bsb-keye\b/.test(e.className || '')).map((e) => [byClass(e, 'sb-ic')[0].className.match(/i-[a-z]+/)[0], e.textContent]),
      [['i-half', 'working'], ['i-check', 'just finished'], ['i-planned', 'idle'], ['i-you', 'waiting on you'], ['i-unrec', 'not recorded']]);
    const tiles = byClass(app.view, 'sb-tile');
    const id = (t) => byClass(t, 'sb-tile-n')[0].attrs.href.split('/').pop();
    const icon = (t) => byClass(t, 'sb-ic')[0].className.match(/i-[a-z]+/)[0];
    const want = { builder: ['i-half', 'Working'], critic: ['i-check', 'Just finished'], researcher: ['i-planned', 'Idle'], 'chief-of-staff': ['i-unrec', 'No session recorded yet'] }; // from 2026-10-17, J13: no session file in this fixture
    for (const [m, [ic, word]] of Object.entries(want)) {
      const t = tiles.find((x) => id(x) === m);
      if (m === 'critic') continue; // the critic's outcome is 280 minutes old in this fixture: Idle (AC49's own test covers "Just finished")
      assert.equal(icon(t), ic, m);
      assert.match(t.textContent, new RegExp(word.replace(/[()]/g, '\\$&')), m);
    }
    assert.equal(byClass(app.view, 'sb-light').length, 0);
    assert.ok(!findAll(app.view, (e) => /glow/.test(e.className || '')).length);
    assert.equal(byClass(byClass(app.view, 'sb-you')[0], 'i-you').length, 1, 'the owner\'s tile: the coral diamond');
  } finally {
    app.restore();
  }
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  assert.doesNotMatch(css, /infinite/, 'no infinite animation');
  assert.doesNotMatch(css, /\.sb-light/, 'no light rule');
});

test('AC67: each card\'s "last:" and "feeds" against its records (J11\'s fixture) — Q-013\'s members feeding MD1, P-001 "not tied to a milestone", "not recorded in what the desk reads"; each link\'s target', async () => {
  const app = await openSD('#/p/Service-Desk/team');
  try {
    const tiles = byClass(app.view, 'sb-tile');
    const card = (m) => tiles.find((t) => byClass(t, 'sb-tile-n')[0].attrs.href.endsWith(`/team/${m}`));
    const parts = (m) => [byClass(card(m), 'sb-muted').map((x) => x.textContent).find((x) => /^last: |^not recorded/.test(x)) || null, byClass(card(m), 'sb-feeds')[0]?.textContent || null,
      (linksIn(card(m)).find((l) => /On the Timeline/.test(l.text)) || {}).href || null];
    assert.deepEqual(parts('researcher'), ['last: Q-013: researcher finished — ok, 8 Oct', 'feeds MD1 · What a good desk looks like is known', '#/p/Service-Desk/timeline/sprint/Q-013']);
    assert.deepEqual(parts('source-checker'), ['last: Q-013: source-checker finished — ok, verdict PASS, 8 Oct', 'feeds MD1 · What a good desk looks like is known', '#/p/Service-Desk/timeline/sprint/Q-013']);
    assert.deepEqual(parts('definer'), ['last: P-001: definer finished — ok, 6 Oct', 'feeds: not tied to a milestone', null], 'P-001, the project item itself, is no sprint');
    assert.match(byClass(card('definer'), 'sb-feeds')[0].className, /\bgap\b/, 'slate (AC69)');
    assert.deepEqual(parts('builder'), ['not recorded in what the desk reads', null, null], 'work outside the pipeline');
    // The link opens the Timeline at that sprint, its milestone's sprints opened.
    await app.go('#/p/Service-Desk/timeline/sprint/Q-013');
    assert.equal(keyed(app, 'fold:sprints:Design-i2:MD1').attrs['aria-expanded'], 'true');
    assert.ok(findAll(app.view, (e) => e.attrs && e.attrs['data-sprint'] === 'Q-013').length);
  } finally {
    app.restore();
  }
});

test('AC67: the owner\'s tile — "You · waiting on you: <n> in your queue", its next lines each with "· unblocks <code>", "· unblocks: milestone not recorded" or "· unblocks no milestone: <reason>"', async () => {
  const app = await opened(ac66Setup(), '#/p/Alpha/team');
  try {
    await app.advance(POLL_MS);
    const you = byClass(app.view, 'sb-you')[0];
    assert.match(you.textContent, /^You · waiting on you: 12 in your queue/);
    const lines = findAll(you, (e) => e.tag === 'li').map((l) => l.textContent.replace(/ · waiting [^·]+/, ' '));
    assert.deepEqual(lines, ['Nexta question naming its milestone Alpha-ms · unblocks MD1', 'Thena question naming none Alpha-none · unblocks no milestone: a records-only question',
      'Latereleven short questions on the desk\'s screens P-001-design-lab-open · unblocks: milestone not recorded']);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC68

test('AC68 (changed by AC81: the Queue screen gone, so three screens): the same marker on Status, Timeline and Team — "Design · run 2", "now · next to reach: MD2", "Timeline ›", in the Design colour; a real link named "Open the Timeline at Now"', async () => {
  const app = await openSD('#/p/Service-Desk');
  try {
    for (const s of ['', '/timeline', '/team']) {
      await app.go(`#/p/Service-Desk${s}`);
      const ms = byClass(app.view, 'sb-pmark');
      assert.equal(ms.length, 1, s);
      const [m] = ms;
      assert.deepEqual([m.tag, m.attrs.href, m.attrs['aria-label']], ['a', '#/p/Service-Desk/timeline', 'Open the Timeline at Now'], s);
      assert.deepEqual(m.children.map((c) => c.textContent.trim()).filter(Boolean), ['Design · run 2', 'now · next to reach: MD2', 'Timeline ›'], s);
      assert.match(m.className, /\bph-des\b/, `${s}: in Design's colour`);
      // Under the project's name and the screen's title.
      const screen = byClass(app.view, 'sb-screen')[0];
      const i = screen.children.indexOf(m);
      assert.ok(i > 0 && screen.children.slice(0, i).some((c) => /\bsb-hdr\b/.test(c.className)), `${s}: under the header`);
    }
  } finally {
    app.restore();
  }
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  assert.match(css, /\.ph-des \{ --ph: var\(--ph-des\); \}/);
  assert.match(css, /\.sb-pmark-run \{[^}]*color: var\(--ph, var\(--ink\)\)/);
});

test('AC68: the marker\'s other forms — no next to reach, Done, which phase is now not recorded, and "Phases not tracked" for v2.5 with no colour and no link', async () => {
  const m = models();
  const base = m.ctx;
  assert.deepEqual(markerView({ ...base, next: null }).next, 'now · next to reach: none, every milestone has work filed');
  assert.deepEqual(markerView({ ...base, pv: { ...base.pv, done: true } }), { link: true, words: 'Done', cls: 'ph-done' });
  assert.deepEqual(markerView({ ...base, now: null }), { link: true, words: 'Which phase is now is not recorded', cls: null });
  assert.deepEqual(markerView({ ...base, project: { ...SD3, model: 'v2.5' } }), { link: false, words: 'Phases not tracked', cls: null });
  const app = await openSD('#/', { more: { Delta: { project: v25('Delta'), repo: fullRepo('Delta') } } });
  try {
    for (const s of ['', '/timeline', '/team']) {
      await app.go(`#/p/Delta${s}`);
      const [mk] = byClass(app.view, 'sb-pmark');
      assert.deepEqual([mk.tag, mk.textContent, mk.className], ['p', 'Phases not tracked', 'sb-pmark none'], s);
    }
  } finally {
    app.restore();
  }
});

test('AC68: a tap, Enter and Space on the marker open the Timeline with the Now line in view, one screen step; on the Timeline it scrolls back to Now', async () => {
  for (const how of ['tap', 'Enter', ' ']) {
    const app = await openSD('#/p/Service-Desk/team');
    const undo = railLayout({});
    try {
      const mk = () => byClass(app.view, 'sb-pmark')[0];
      app.scrolls.length = 0;
      if (how === 'tap') {
        // A real link: the browser follows its href on a tap.
        await app.tap(mk());
        await app.go(mk().attrs.href);
      } else {
        mk().dispatch('keydown', { key: how, preventDefault() {} });
        await app.flush();
      }
      assert.equal(app.loc.hash, '#/p/Service-Desk/timeline', how);
      assert.ok(keyed(app, 'nowline'), `${how}: the Timeline, with its Now line`);
      assert.ok(app.scrolls.length >= 1, `${how}: scrolled to Now`);
      // One step: Back returns to Team, and no further.
      await app.tap(keyed(app, 'nav-back'));
      assert.equal(app.loc.hash, '#/p/Service-Desk/team', `${how}: back to Team`);
      assert.equal(keyed(app, 'nav-back'), null, `${how}: one step only`);
      // On the Timeline itself, it scrolls back to Now.
      await app.go('#/p/Service-Desk/timeline');
      app.scrolls.length = 0;
      window.scrollY = 5000;
      const onTl = byClass(app.view, 'sb-pmark')[0];
      onTl.dispatch('keydown', { key: how === 'tap' ? 'Enter' : how, preventDefault() {} });
      await app.flush();
      assert.equal(app.scrolls.length, 1, `${how}: scrolled back to Now on the Timeline`);
      assert.equal(app.loc.hash, '#/p/Service-Desk/timeline');
    } finally {
      undo();
      app.restore();
    }
  }
});

test('AC68: "More detail" offers no Pipeline link for v3 and keeps "Reduced view and waits" for v2.5; "Record notes (2)" with a malformed record line and an out-of-form plan line, listing both word for word; none offered with no notes', async () => {
  const setup = twoProjects();
  const A = setup.repos.Alpha;
  A.commit({ 'status/outcomes.jsonl': '' });
  const clean = await opened(setup, '#/p/Alpha/info');
  try {
    await clean.advance(POLL_MS);
    assert.equal(keyed(clean, 'more:pipeline'), null, 'no Pipeline link for a v3 project');
    assert.equal(keyed(clean, 'more:notes'), null, 'no notes: no Record notes');
    assert.ok(keyed(clean, 'more:asked') && keyed(clean, 'more:agents'), 'Time asked and Agents');
  } finally {
    clean.restore();
  }
  const doc = A.files['docs/PROJECT.md'].replace(/^(- .*\(MD3\).*)$/m, '$1 · why: a · b');
  A.commit({ 'dispatch-log/2026-10.jsonl': `${A.files['dispatch-log/2026-10.jsonl']}not json at all\n`, 'docs/PROJECT.md': doc });
  const app = await opened(setup, '#/p/Alpha/info');
  try {
    await app.advance(POLL_MS);
    const link = keyed(app, 'more:notes');
    assert.equal(link.textContent, 'Record notes (2)');
    await app.tap(link);
    await app.go(link.attrs.href);
    const notes = findAll(byClass(app.view, 'sb-screen')[0], (e) => e.tag === 'li').map((x) => x.textContent);
    const lineno = doc.split('\n').findIndex((l) => /\(MD3\)/.test(l)) + 1;
    assert.deepEqual(notes, ['dispatch-log/2026-10.jsonl line 6 is not JSON; skipped',
      `docs/PROJECT.md line ${lineno}: a milestone line out of form: its why holds " · ", or has another part after it`]);
    // From stage 1a (AC81): the one bar at its foot, no project bar and no top row; Back returns to Status.
    assert.equal(byClass(app.view, 'v2-bar').length, 1, 'the bar at its foot');
    assert.equal(byClass(app.view, 'sb-dock').length + byClass(app.view, 'v2-row').length, 0, 'no project bar, no top row');
    assert.ok(keyed(app, 'nav-back'), 'and the back control');
  } finally {
    app.restore();
  }
  const d = await openSD('#/p/Delta/info', { more: { Delta: { project: v25('Delta'), repo: fullRepo('Delta') } } });
  try {
    assert.equal(keyed(d, 'more:pipeline').textContent, 'Reduced view and waits');
  } finally {
    d.restore();
  }
});

test('AC68: a v3 project\'s Pipeline route opens the Timeline at Now in its place, without a history step of its own; the v2.5 reduced view stays', async () => {
  const app = await openSD('#/p/Service-Desk/team');
  try {
    const replaced = [];
    app.loc.replace = (to) => { replaced.push(to); app.loc.hash = to; };
    await app.go('#/p/Service-Desk/pipeline');
    assert.deepEqual(replaced, ['#/p/Service-Desk/timeline'], 'the history entry replaced');
    assert.equal(app.loc.hash, '#/p/Service-Desk/timeline');
    assert.ok(keyed(app, 'feed'));
    await app.tap(keyed(app, 'nav-back'));
    assert.equal(app.loc.hash, '#/p/Service-Desk/team', 'Back never returns to the Pipeline route');
  } finally {
    app.restore();
  }
  const start = await openSD('#/p/Service-Desk/pipeline');
  try {
    assert.ok(keyed(start, 'feed'), 'opened on the route: the Timeline in its place');
    assert.equal(keyed(start, 'nav-back'), null, 'no history step');
  } finally {
    start.restore();
  }
  const d = await openSD('#/p/Delta/pipeline', { more: { Delta: { project: v25('Delta'), repo: fullRepo('Delta') } } });
  try {
    assert.match(d.text(), /Reduced view \(operating model v2\.5\.1\)/);
  } finally {
    d.restore();
  }
});
