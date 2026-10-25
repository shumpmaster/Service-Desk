// AC59 (the Timeline as the project's breakdown, read from the bottom up), AC60 (each milestone's
// sprints), AC61 (the records the why lines, Context and Why come from, in the forms of model S-032,
// frozen 2026-10-16 and adopted with model v3.4.0 on 2026-10-17, with the display leniencies AC61 names) and AC64 (plain terms first), trial-view notes 2, notes 6 to 9, 13, 14, 17, 18, 21, 23, 24,
// 26 and 27 (2026-10-16). From J11's fixture (Service-Desk at 3117150), J12's fixture (built from
// REST answers, NOT as GitHub sent it) and AC61's fixture (NOT real records).
// ac-test: S-001/AC59 ac-test: S-001/AC60 ac-test: S-001/AC61 ac-test: S-001/AC64
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SRC, CONFIG } from './helpers.mjs';
import { loadSandbox, linksIn, treePaths, traceNotes, j11Files, El0 } from './sandbox-helpers.mjs';
import { models, openSD, keyed, sdRepo, ac61Answer, AC61_DOC, byClass, findAll, SD3, pullNodes, answerOf, node } from './tv2-fixtures.mjs';
import { madeUp } from './j12-fixture.mjs';
import { prBodyParts, contextBullet, keptPull } from '../../src/lib/pulls.js';
import { parseProjectDoc, purposeItems, milestoneLines, standardLines } from '../../src/lib/j11.js';
import { feedView, runsContext } from '../../src/lib/feed.js';

const NOW16 = Date.parse('2026-10-16T18:00:00Z');
// From stage 3 (S-001 AC84, specs/S-001.md:6857-6946; AC59 and AC60, "Changed by AC84", :4740 and :4927):
// the Timeline's content and order stand and its look is frame 7b's. Each page case below that read the
// old look (its classes, its bullet colours, its fold words) is rewritten one for one for AC84's, saying so;
// every case on the Timeline's model (lib/feed.js) stands as it was.
const FOLD = /\b(?:sb|v2)-fold\b/;
const css = () => readFileSync(`${SRC}/public/sandbox.css`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (sel) => {
  const m = new RegExp(`(?:^|\\n)${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`).exec(css());
  assert.ok(m, `a rule for ${sel}`);
  return m[1];
};
const block = (feed, key) => feed.blocks.find((b) => b.key === key);
const rowsOf = (b) => [...(b.plannedRows || []), ...b.rows];
const row = (feed, key, code) => rowsOf(block(feed, key)).find((x) => x.code === code);
const label = (x) => (x.kind === 'ms' ? x.code : x.kind === 'untied' ? 'untied' : `gather(${x.items.length})`);
const docLines = () => j11Files()['docs/PROJECT.md'].split('\n');

// ---------------------------------------------------------------------------
// AC59

test('AC59: the order from the top — "What we\'re delivering", Launch i1, Build i2, the planned part of Design i2, the Now line, the rest of Design i2, Build i1, Design i1, Discovery i1, "Where we started"', () => {
  const { feed } = models({ now: NOW16 });
  assert.equal(feed.ok, true);
  assert.deepEqual(feed.blocks.map((b) => b.key), ['Launch-i1', 'Build-i2', 'Design-i2', 'Build-i1', 'Design-i1', 'Discovery-i1']);
  const d2 = block(feed, 'Design-i2');
  assert.deepEqual(d2.plannedRows.map(label), ['MD3', 'MD2'], 'the planned milestones above the Now line');
  assert.equal(d2.nowLine.words, 'Now · 16 Oct');
  assert.equal(d2.nowLine.sub, 'ahead above · done below');
  assert.deepEqual(d2.rows.map(label), ['untied', 'MD1', 'gather(6)'], 'the rest of the now run below it');
  assert.ok(feed.blocks.every((b) => b === d2 || !b.nowLine), 'one Now line');
});

test('AC59: both cards\' text against lines 480 to 483 of the fixture\'s docs/PROJECT.md, word for word; "the project began" with its date; "not recorded" with no Intent', () => {
  const lines = docLines();
  const first = `${lines[479].slice(2)} ${lines[480].trim()}`;
  const second = `${lines[481].slice(2)} ${lines[482].trim()}`;
  const { feed } = models({ now: NOW16 });
  assert.equal(feed.top.label, "What we're delivering");
  assert.equal(feed.top.text, first);
  assert.equal(feed.top.text, '"I envisioned the service desk to be more of real time interactive planning, scheduling and interactive workbench."');
  assert.equal(feed.top.source.words, "The project's purpose, in your words · docs/PROJECT.md, Intent", '"in your words": the item is wholly a quotation');
  assert.equal(feed.top.source.href, 'https://github.com/shumpmaster/Service-Desk/blob/main/docs/PROJECT.md');
  assert.equal(feed.top.finish, 'Finish line: Done, after the Launch gate');
  assert.equal(feed.bottom.label, 'Where we started');
  assert.ok(second.startsWith(feed.bottom.text), 'the first sentence of the second item');
  assert.equal(feed.bottom.text, 'Service Desk replaces Operations-Hub, which is a read-only page answering "does anything need me?" and linking out to GitHub.');
  assert.equal(models({ answer: null }).feed.bottom.source.words, 'docs/PROJECT.md, Intent · the project began 30 Sep', 'with J11\'s fixture alone: 30 Sep (2026-10-01T01:46:42Z)');
  const noIntent = j11Files()['docs/PROJECT.md'].replace(/^## Intent\n/m, '## Not the intent\n');
  const none = models({ extra: { 'docs/PROJECT.md': noIntent } }).feed;
  assert.equal(none.top.text, 'not recorded');
  assert.equal(none.bottom.text, 'not recorded');
  assert.deepEqual(purposeItems('# x\n\n## Intent\n\nNo purpose here.\n').items, []);
  assert.equal(purposeItems('# x\n\n## Intent\n\nNo purpose here.\n').found, 'no-purpose');
  assert.equal(models().feed.top.source.words.includes('in your words'), true);
});

test('AC59: each band\'s words, its colour token, its dates and state, and that it is pinned (position: sticky)', () => {
  const { feed } = models({ now: NOW16 });
  assert.deepEqual(feed.blocks.map((b) => [b.band.name, b.band.cls, b.band.words]), [
    ['Launch', 'ph-launch', 'planned'],
    ['Build · run 2', 'ph-build', 'planned'],
    ['Design · run 2', 'ph-des', '8 Oct to 16 Oct · now'],
    ['Build · run 1', 'ph-build', '7 Oct to 8 Oct · gone back over'],
    ['Design · run 1', 'ph-des', '5 Oct to 8 Oct · gone back over'],
    ['Discovery', 'ph-disc', '30 Sep to 5 Oct · finished'],
  ]);
  // Without J12, Build i1 has no step, so no time: "dates not recorded".
  assert.equal(block(models({ answer: null }).feed, 'Build-i1').band.words, 'dates not recorded · gone back over');
  // Rewritten for AC84 ("the bands", :6903-6906): each run's name in 600 12 px with a small square in its
  // phase's colour, its dates or state in Plex Mono at the right, pinned under the header while its run is
  // on screen, a hairline under it and no box around it.
  assert.match(rule('.v2-tph'), /position: sticky; top: 96px;/, 'pinned, under the pinned header');
  assert.match(rule('.v2-tph'), /border-bottom: 1px solid var\(--line\);/, 'a hairline under it');
  assert.doesNotMatch(rule('.v2-tph'), /border: |border-radius|box-shadow/, 'no box around it');
  assert.match(rule('.v2-tpn'), /font: 600 12px\/1\.3 var\(--font\);/);
  assert.match(rule('.v2-tpd'), /font: var\(--t-mono\);/);
  assert.match(css(), /\.v2 \.ph-des \{ --phc: var\(--ph-des\); \}/, 'its square in its phase\'s colour');
  assert.deepEqual(feed.blocks.map((b) => b.band.label), ['planned', 'planned', '8 Oct – now', '7–8 Oct · gone back over', '5–8 Oct · gone back over', '30 Sep – 5 Oct · finished'],
    'the same dates and states, in frame 7b\'s form');
  assert.match(rule('.v2-tblk'), /position: relative;/, 'each band is pinned within its own run\'s stretch, so the next one takes its place');
});

test('AC59 (note 26): the line — in its band\'s phase colour, unbroken through each band, dashed only for planned stretches, as thin and light as version 6 draws it', async () => {
  // Rewritten for AC84 ("the rail", :6915-6916; frame 7b's .tseg): a thin line in the phase's colour down the
  // band's left edge, solid through what has happened and dashed through what is planned.
  assert.match(rule('.v2-tseg::before'), /width: 1\.5px; background: var\(--phc\); opacity: \.55;/);
  assert.match(rule('.v2-tseg.plan::before'), /background: repeating-linear-gradient\(var\(--phc\) 0 4px, transparent 4px 8px\); opacity: \.7;/);
  assert.match(rule('.v2-tseg::before'), /top: 0; bottom: 0;/, 'from the stretch\'s top to its bottom');
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    const segs = byClass(app.view, 'v2-tseg');
    const planned = segs.filter((x) => x.className.split(' ').includes('plan')).map((x) => x.attrs['data-k']);
    assert.deepEqual(planned, ['seg:Launch-i1', 'seg:Build-i2', 'seg:Design-i2:plan'], 'dashed: the runs still to come, and the now run above Now');
    for (const b of byClass(app.view, 'v2-tblk')) assert.ok(/\bph-(disc|des|build|launch)\b/.test(b.className), 'each stretch in its band\'s colour');
  } finally {
    app.restore();
  }
});

test('AC59: each milestone\'s icon and words, its "Done when" against its section 3 line, and the slate "Why not recorded yet · for the agents to add" with J11\'s fixture', () => {
  const { feed } = models({ now: NOW16 });
  const want = { MD3: ['planned', 'planned'], MD2: ['next', 'next to reach'], MD1: ['half', 'work filed'], M2B: ['pastcheck', 'work filed · gone back over'],
    M2: ['pastcheck', 'work filed · gone back over'], M1: ['pastcheck', 'work filed · gone back over'], M3A: ['planned', 'planned'], M3B: ['planned', 'planned'],
    M3C: ['planned', 'planned'], 'Design-6': ['cross', 'not reached'], 'Design-1': ['pastcheck', 'reached · gone back over'], 'Discovery-8': ['check', 'reached'] };
  const all = feed.blocks.flatMap((b) => rowsOf(b).filter((x) => x.kind === 'ms'));
  for (const [code, [icon, words]] of Object.entries(want)) {
    const x = all.find((r) => r.code === code);
    assert.deepEqual([x.icon, x.words], [icon, words], code);
  }
  const doc = parseProjectDoc(j11Files()['docs/PROJECT.md']);
  for (const x of all.filter((r) => /^M/.test(r.code))) {
    assert.equal(x.doneWhen, doc.milestones.find((m) => m.id === x.code).done, `${x.code}: done when`);
    assert.equal(x.why, null, `${x.code}: why not recorded`);
  }
  assert.deepEqual(all.filter((x) => x.icon === 'next').map((x) => x.code), ['MD2'], 'MD2 alone has the gold ring');
  assert.ok(all.every((x) => x.icon !== 'next' || x.code === 'MD2'));
});

test('AC59 + AC48: no milestone\'s circle uses a phase or state colour of its own; only "next to reach" takes the gold ring', () => {
  const sheet = css();
  for (const m of sheet.matchAll(/(\.sb-ic[^{]*)\{([^}]*)\}/g)) {
    const used = [...m[2].matchAll(/var\((--[a-z0-9-]+)\)/g)].map((x) => x[1]);
    for (const tok of used.filter((t) => !/^--s\d$/.test(t))) {
      assert.ok(['--muted', '--surf', '--ink', '--soft', '--gold', '--you', '--mono', '--t-code'].includes(tok), `${m[1].trim()}: ${tok}`);
      if (tok === '--gold') assert.match(m[1], /i-next/, 'gold is the next to reach ring alone');
      if (tok === '--you') assert.match(m[1], /i-you/, 'coral is the owner\'s diamond alone (AC69)');
    }
  }
});

test('AC59 (note 21): the delivery order within each run — first the rows no date places (the standard milestones, then any milestone whose sprints have no date), then the dated ones by their latest sprint, "Not tied to a milestone" among them, then those with no work filed yet', () => {
  const { feed } = models({ now: NOW16 });
  const up = (key) => block(feed, key).up.map(label);
  assert.deepEqual(up('Discovery-i1'), ['gather(4)', 'Discovery-2', 'Discovery-5', 'Discovery-7', 'Discovery-8', 'untied']);
  assert.deepEqual(up('Design-i1'), ['gather(4)', 'Design-1', 'Design-6', 'untied']);
  assert.deepEqual(up('Build-i1'), ['gather(5)', 'M1', 'M2', 'M2B', 'untied'], 'M1 (#41, 7 Oct 21:30), M2 (#44, 8 Oct 14:08), M2B (#52, 8 Oct 17:51), the untied (#58, 8 Oct 21:35)');
  assert.deepEqual(up('Design-i2'), ['gather(6)', 'MD1', 'untied', 'MD2', 'MD3']);
  assert.deepEqual(up('Build-i2'), ['gather(5)', 'M3A', 'M3B']);
  assert.deepEqual(up('Launch-i1'), ['gather(5)', 'M3C']);
  // When J12's read has failed, a milestone whose sprints have no date sits with the rows no date places.
  const noJ12 = models({ answer: null }).feed;
  assert.deepEqual(block(noJ12, 'Build-i1').up.map(label), ['gather(5)', 'M1', 'M2', 'M2B']);
});

// Rewritten in G6 of "After the glance audit" (AC59's gathered line, changed by AC92 (d): "the gathered line reads
// "Standard checklist · <n> not recorded for this run ›" in place of "<n> standard <Phase> milestones · not recorded for
// this run""): it read "6 standard Design milestones · not recorded for this run", and a run still to come's "5 standard
// Build milestones · still to come"; that one now reads "Standard checklist · 5 still to come" the same way (C, as round 2's
// mock, changes2.js q5). The count, the rows it gathers, its fold and its list are as before.
test('AC59 (AC92 (d), rewritten in G6): the gathered "not recorded" line and its count, opening on a tap; Build i2\'s and Launch i1\'s "Standard checklist · 5 still to come" lines, with no rows for them', async () => {
  const { feed } = models({ now: NOW16 });
  const g = (key) => rowsOf(block(feed, key)).filter((x) => x.kind === 'gather').map((x) => x.words);
  assert.deepEqual(g('Design-i2'), ['Standard checklist · 6 not recorded for this run']);
  assert.deepEqual(g('Build-i2'), ['Standard checklist · 5 still to come']);
  assert.deepEqual(g('Launch-i1'), ['Standard checklist · 5 still to come']);
  assert.deepEqual(rowsOf(block(feed, 'Design-i2')).filter((x) => x.kind === 'gather').map((x) => x.items.length), [6], 'the six it gathers');
  assert.ok(!rowsOf(block(feed, 'Build-i2')).some((x) => /^Build-\d/.test(x.code || '')), 'no rows for them');
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    const f = keyed(app, 'fold:Design-i2:gather:nr');
    assert.equal(f.attrs['aria-expanded'], 'false');
    await app.tap(f);
    const list = byClass(keyed(app, 'gather:Design-i2:gather:nr'), 'v2-glist')[0]; // AC84's look (from `sb-glist`)
    assert.equal(list.children.length, 6, 'listed in place on a tap');
    assert.match(list.textContent, /Done defined in real scenarios Design-1 not recorded/);
  } finally {
    app.restore();
  }
});

// Rewritten in G4 of "After the glance audit" (AC59's note "After the glance audit"; AC91 (i)): the Timeline opens with the
// top of the Now line a third of the way down the viewport (its height divided by 3, rounded), no longer just under the
// pinned band, so what comes next above Now is in view; still never on a refresh.
test('AC59 (note 18; AC91 (i), rewritten in G4): the Now line\'s place, the Timeline opening with it a third of the way down the screen (360×740 and 414×896), and no scroll back on a refresh', async () => {
  for (const [w, h] of [[360, 740], [414, 896]]) {
    const saved = Object.getOwnPropertyDescriptor(El0.prototype, 'getBoundingClientRect');
    El0.prototype.getBoundingClientRect = function rect() {
      if (this.attrs && this.attrs['data-k'] === 'nowline') return { top: 2200, bottom: 2236, height: 36, left: 0, right: w, width: w };
      if (` ${this.className} `.includes(' sb-pband ')) return { top: 0, bottom: 38, height: 38, left: 0, right: w, width: w };
      return { top: 0, bottom: 0, height: 0, left: 0, right: 0, width: 0 };
    };
    try {
      const app = await loadSandbox({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() }, hash: '#/p/Service-Desk', now: NOW16 });
      try {
        window.innerWidth = w;
        window.innerHeight = h;
        await app.advance(1000);
        app.scrolls.length = 0;
        await app.go('#/p/Service-Desk/timeline');
        assert.deepEqual(app.scrolls, [[0, 2200 - Math.round(h / 3)]], `${w}×${h}: the Now line's top a third of the way down`);
        assert.equal(2200 - app.scrolls[0][1], Math.round(h / 3), 'in view, with a third of the screen above it');
        assert.ok(2200 - app.scrolls[0][1] > 38 + 8, 'below the pinned band, with room above for what comes next');
        app.scrolls.length = 0;
        window.scrollY = 3000;
        await app.advance(61_000);
        app.module.refresh();
        await app.flush();
        await app.tick();
        assert.deepEqual(app.scrolls, [], 'never on a refresh');
      } finally {
        app.restore();
      }
    } finally {
      if (saved) Object.defineProperty(El0.prototype, 'getBoundingClientRect', saved);
      else delete El0.prototype.getBoundingClientRect;
    }
  }
  // With no now run (AC50's "not recorded"), it sits above the latest run that holds a time, and says so.
  const m = models({ now: NOW16 });
  const pv = { ...m.pv, nowRun: null };
  const feed = feedView(runsContext(SD3, m.snap, m.j, m.tl, pv), { pulls: [] }, NOW16, 'UTC');
  const at = feed.blocks.find((b) => b.nowLine);
  assert.equal(at.key, 'Design-i2');
  assert.equal(at.nowLine.note, 'which run is now is not recorded');
});

test('AC59 + AC51 (ruling 2): no clock time or duration on the Timeline, and every link a path the fixture\'s tree holds or a pull request', async () => {
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    // Every fold opened: from stage 3 (AC84) they are `v2-fold` (rewritten so, from `sb-fold`).
    for (let i = 0; i < 6; i++) {
      const folds = findAll(app.view, (e) => e.tag === 'button' && e.attrs['aria-expanded'] === 'false' && FOLD.test(e.className));
      if (!folds.length) break;
      for (const f of folds) { f.click(); await app.flush(); }
    }
    const feed = keyed(app, 'feed');
    assert.doesNotMatch(feed.textContent, /\b\d{1,2}:\d{2}\b/, 'no clock time');
    assert.doesNotMatch(feed.textContent, /\b\d+ ?(?:min|h|s|d|hours?|minutes?)\b(?! [a-z])/, 'no duration');
    const tree = new Set(treePaths());
    for (const l of linksIn(feed)) {
      const href = l.href || '';
      if (href.startsWith('https://github.com/shumpmaster/Service-Desk/blob/main/')) assert.ok(tree.has(decodeURIComponent(href.split('/blob/main/')[1])), href);
      else assert.match(href, /^https:\/\/github\.com\/shumpmaster\/Service-Desk\/(pull\/\d+(\/commits)?|commits\/[0-9a-f]{40})$/, href);
    }
  } finally {
    app.restore();
  }
});

test('AC59, changed by AC84: a v2.5 project shows "Phases not tracked" and nothing else but its header, its phase line (AC84) and the bottom bar', async () => {
  const app = await openSD('#/', { more: { Delta: { project: { ...SD3, name: 'Delta', repo: 'shumpmaster/Delta', model: 'v2.5' }, repo: sdRepo() } } });
  try {
    await app.go('#/p/Delta/timeline');
    const screen = byClass(app.view, 'sb-screen')[0];
    assert.match(screen.textContent, /Phases not tracked/);
    assert.equal(byClass(screen, 'v2-feed').length + byClass(screen, 'v2-tblk').length, 0, 'no feed (rewritten from `sb-feed`, AC84)');
    // From stage 8 (AC43's marker carried "until stage 8", specs/S-001.md:13702): no marker before the header.
    assert.deepEqual(screen.children.map((c) => c.className.split(' ')[0]), ['v2-tlhead', 'v2-small'], 'the header with its phase line, and the words');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC60

test('AC60: which sprints sit under each milestone, against the fixture\'s NOTE lines — M2B PR #44 and PR #52, MD1 Q-013, PR #44 under both M2 and M2B; each untagged sprint under its run\'s "Not tied to a milestone"', () => {
  const { feed } = models({ now: NOW16 });
  const notes = traceNotes();
  const want = new Map();
  let run = null;
  let ms = null;
  for (const l of notes) {
    const ind = /^ */.exec(l)[0].length;
    const t = l.trim();
    if (ind === 0) { run = /^([A-Z][a-z]+) i(\d+)/.exec(t); run = `${run[1]}-i${run[2]}`; continue; }
    if (ind === 2) { ms = t === 'untagged' ? 'untied' : t.split(' ')[0]; continue; }
    if (ind === 4 && t.startsWith('sprint ')) {
      const k = `${run}:${ms}`;
      if (!want.has(k)) want.set(k, []);
      want.get(k).push(t.slice(7));
    }
  }
  for (const [k, ids] of want) {
    const [rk, code] = k.split(':');
    const r = code === 'untied' ? rowsOf(block(feed, rk)).find((x) => x.kind === 'untied') : row(feed, rk, code);
    const shown = r.sprints.map((s) => s.id);
    for (const id of ids) assert.ok(shown.includes(id), `${k}: ${id}`);
    if (code !== 'untied') assert.deepEqual(shown, ids, k);
  }
  assert.deepEqual(row(feed, 'Build-i1', 'M2B').sprints.map((s) => s.id), ['PR #44', 'PR #52']);
  assert.deepEqual(row(feed, 'Design-i2', 'MD1').sprints.map((s) => s.id), ['Q-013']);
  assert.ok(row(feed, 'Build-i1', 'M2').sprints.some((s) => s.id === 'PR #44'), 'PR #44 under M2 as well');
});

test('AC60: untied merged pull requests placed by their merge time (18 in Design i2 at 3117150, #59 to #77), one merged before every run in the first, and an open one not placed', () => {
  const { feed } = models({ now: NOW16 });
  const untied = (key) => rowsOf(block(feed, key)).find((x) => x.kind === 'untied');
  const prs = (key) => untied(key).sprints.map((s) => s.id).filter((x) => /^PR/.test(x)).map((x) => Number(x.slice(4))).sort((a, b) => a - b);
  assert.deepEqual(prs('Design-i2'), [59, 60, 61, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77]);
  assert.equal(untied('Design-i2').words, '18 sprints · for the agents to file');
  assert.equal(untied('Design-i2').sentence, 'No milestone in the plan lists these sprints, and they name none.');
  assert.deepEqual(prs('Build-i1'), [42, 43, 47, 48, 49, 50, 51, 54, 55, 56, 57, 58]);
  assert.ok(!feed.blocks.some((b) => rowsOf(b).some((x) => x.kind === 'untied' && x.sprints.some((s) => s.id === 'PR #62'))), 'PR #62 was closed, not merged: not placed');
  // Made up (NOT real records): one merged before every run, and one open.
  const nodes = [...pullNodes(), node(990, { mergedAt: '2026-09-01T12:00:00Z' }), node(991, { mergedAt: null })];
  const f2 = models({ answer: answerOf(nodes), now: NOW16 }).feed;
  const first = rowsOf(block(f2, 'Discovery-i1')).find((x) => x.kind === 'untied');
  assert.ok(first.sprints.some((s) => s.id === 'PR #990'), 'merged before every run: in the first run');
  assert.ok(!f2.blocks.some((b) => rowsOf(b).some((x) => (x.sprints || []).some((s) => s.id === 'PR #991'))), 'an open one is in the Queue, not here');
});

test('AC60, changed by AC84 and by AC92 (c) in G5: each list starts folded ("<s> sprints · <m> merged ›", frame 7b), and opens and folds by a tap, Enter and Space, with its state and its mark', async () => {
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    const f = () => keyed(app, 'fold:sprints:Build-i1:M1');
    assert.equal(f().attrs['aria-expanded'], 'false');
    // AC84 (:6914-6915): "then "<n> sprints ▸", folded" (rewritten from AC60's "2 sprints feed this"); the mark an icon (AC81).
    // Rewritten in G5 of "After the glance audit" (AC84's fold, changed by AC92 (c): "<sprints> ›" in the one sprint form,
    // "4 sprints · 3 merged ›"): it read "2 sprints" before G5; M1's two are merged in J12's read.
    assert.equal(f().textContent, '2 sprints · 2 merged');
    assert.equal(byClass(f(), 'vi-chev').length, 1, 'folded: its mark');
    assert.equal(keyed(app, 'tasks:Build-i1:M1'), null);
    await app.tap(f());
    assert.equal(f().attrs['aria-expanded'], 'true');
    assert.equal(byClass(f(), 'vi-chevdown').length, 1, 'open: its mark');
    assert.equal(byClass(keyed(app, 'tasks:Build-i1:M1'), 'v2-sp').length, 2);
    f().dispatch('keydown', { key: 'Enter' });
    await app.flush();
    assert.equal(f().attrs['aria-expanded'], 'false');
    f().dispatch('keydown', { key: ' ' });
    await app.flush();
    assert.equal(f().attrs['aria-expanded'], 'true');
    assert.equal(keyed(app, 'fold:sprints:Design-i2:MD1').textContent, '1 sprint · 1 merged', 'one: "1 sprint" (rewritten in G5, as above; it read "1 sprint")');
    assert.match(keyed(app, 'mile:Design-i2:MD2').textContent, /No sprints planned yet/);
  } finally {
    app.restore();
  }
});

test('AC60: each sprint\'s date, code, marks and words — a review that passed, one that failed and one not recorded; each checks state, and "checks not recorded" with its reason', () => {
  const extra = { 'reviews/52/reviewer.md': 'Verdict: FAIL\n\nMade up for the test (NOT a real record).\n' };
  const { feed } = models({ now: NOW16, extra });
  const sp = (rk, code, id) => row(feed, rk, code).sprints.find((s) => s.id === id);
  const marks = (s) => s.marks.map((m) => `${m.mark} ${m.word}${m.why ? ` (${m.why})` : ''}`.trim());
  assert.deepEqual([sp('Build-i1', 'M2B', 'PR #44').date, sp('Build-i1', 'M2B', 'PR #44').code], ['8 Oct', 'PR #44']);
  assert.deepEqual(marks(sp('Build-i1', 'M2B', 'PR #44')), ['✓ merged', '✓ review', '✓ checks'], 'reviews/44: owner.md and reviewer.md both PASS');
  assert.deepEqual(marks(sp('Build-i1', 'M2B', 'PR #52')), ['✓ merged', '✕ review', '✓ checks'], 'reviews/52/reviewer.md FAIL (made up)');
  assert.deepEqual(marks(sp('Build-i1', 'M1', 'PR #40')), ['✓ merged', '✓ review', '✕ checks']);
  assert.deepEqual(marks(sp('Build-i1', 'M1', 'PR #41')), ['✓ merged', '✓ review', '– checks (checks not recorded: no checks recorded for this pull request)']);
  const untied = rowsOf(block(feed, 'Design-i2')).find((x) => x.kind === 'untied');
  assert.deepEqual(marks(untied.sprints.find((s) => s.id === 'PR #77')), ['✓ merged', '– review (review not recorded)', '✕ checks'], 'no reviews/77/ in the tree at 3117150');
  assert.deepEqual(marks(sp('Design-i2', 'MD1', 'Q-013')), ['✓ merged', '✓ source-checked']);
  assert.equal(sp('Design-i2', 'MD1', 'Q-013').date, '8 Oct', 'a pipeline item: the date of its latest step');
});

test('AC60 (N7): with J12\'s made-up field error for the check rollup, each checks mark reads "– checks" with "the desk\'s token can\'t read checks" one tap away; the rest of the answer is used', () => {
  const answer = madeUp('field-error').body;
  const { feed } = models({ answer, now: NOW16 });
  const untied = rowsOf(block(feed, 'Design-i2')).find((x) => x.kind === 'untied');
  const s = untied.sprints.find((x) => x.id === 'PR #77');
  assert.equal(s.title, "Trial view: roomier answer choices, Home's bar removed, long rulings clipped to three lines");
  assert.deepEqual(s.marks[2], { mark: '–', word: 'checks', why: "checks not recorded: the desk's token can't read checks" });
});

test('AC60 + AC64: each pull request\'s title against J12\'s fixture, character for character (#77\'s, and #40\'s, which starts with a code); a research run\'s title', () => {
  const { feed } = models({ now: NOW16 });
  const titles = new Map(pullNodes().map((n) => [n.number, n.title]));
  for (const b of feed.blocks) for (const x of rowsOf(b)) for (const s of x.sprints || []) if (/^PR #/.test(s.id) && !s.missing) assert.equal(s.title, titles.get(Number(s.id.slice(4))), s.id);
  assert.equal(row(feed, 'Build-i1', 'M1').sprints[0].title, 'M1: the desk\'s read-only status page (S-001 AC1–AC15)', 'shown as written');
  assert.equal(row(feed, 'Design-i2', 'MD1').sprints[0].title, 'Research: From published design guidance only: how should a phone-first status dashboard, used by one person to oversee several automated software projects, be designed so a few-second glance tells the owner where to drill in, with dashboard-level detail one step down rather than on the first screen?');
});

test('AC60 + AC61 (B1): a pull request placed by its Milestone: line alone — MD3, a standard one (Design-4), an id the plan does not hold — shown apart, changing no state, word, mark, order, now run or next milestone to reach; "Milestone: none (<reason>)" with its reason, outside the count to file', () => {
  const plain = models({ ac61: true, answer: answerOf(pullNodes()), now: NOW16 }).feed;
  const { feed, pv } = models({ ac61: true, answer: ac61Answer(), now: NOW16 });
  assert.equal(pv.nowRun.label(), 'Design i2');
  const md3 = row(feed, 'Design-i2', 'MD3');
  assert.equal(md3.namedFold, '1 named by its pull request, not yet in the plan');
  assert.deepEqual(md3.named.map((s) => s.id), ['PR #901']);
  assert.deepEqual([md3.icon, md3.words, md3.fold], ['planned', 'planned', 'No sprints planned yet'], 'MD3 as it is without it');
  assert.deepEqual([row(feed, 'Design-i2', 'MD2').icon], ['next'], 'MD2 still next to reach');
  assert.deepEqual(block(feed, 'Design-i2').plannedRows.map(label), block(plain, 'Design-i2').plannedRows.map(label), 'the delivery order unchanged');
  assert.deepEqual(row(feed, 'Design-i2', 'MD1').named.map((s) => s.id), ['PR #902']);
  const d4 = row(feed, 'Design-i2', 'Design-4');
  assert.ok(d4, 'the standard milestone it names gets a row, in the run its merge time places it in');
  assert.deepEqual([d4.icon, d4.words], ['unrec', 'not recorded'], 'keeping its own state');
  assert.deepEqual(d4.named.map((s) => s.id), ['PR #903']);
  const untied = rowsOf(block(feed, 'Design-i2')).find((x) => x.kind === 'untied');
  const s909 = untied.sprints.find((s) => s.id === 'PR #909');
  assert.ok(s909.technical[0].text.includes('names MZ9, which the plan does not hold'));
  const s904 = untied.sprints.find((s) => s.id === 'PR #904');
  assert.equal(s904.none, 'a records-only change');
  assert.equal(untied.words, '24 sprints · 23 for the agents to file');
  assert.equal(untied.sentence, 'No milestone in the plan lists these sprints, and they name none.');
  assert.ok(!untied.sprints.some((s) => ['PR #901', 'PR #902', 'PR #903'].includes(s.id)), 'one named by its pull request is not counted as untied');
});

test('AC60, changed by AC84: each bullet\'s label and order, each a small grey word with a grey left edge, never a colour of its own (P-001-timeline-labels.md, A); the Technical words for a pull request and a research run; "not recorded" for Context and Why with no section', async () => {
  const { feed } = models({ now: NOW16 });
  const pr44 = row(feed, 'Build-i1', 'M2B').sprints[0];
  assert.equal(pr44.technical[0].text, 'Build i1 · M2B · build/builder/m2-answering · also feeds M2');
  const q13 = row(feed, 'Design-i2', 'MD1').sprints[0];
  assert.deepEqual(q13.technical.map((t) => t.text), ['Design i2 · MD1', 'research/Q-013-memo.md', 'research/Q-013-source-check.md']);
  assert.ok(q13.technical.slice(1).every((t) => t.href && t.href.startsWith('https://github.com/shumpmaster/Service-Desk/blob/main/research/')));
  assert.equal(pr44.context, null);
  assert.equal(pr44.why, null);
  assert.equal(q13.context, null);
  // Rewritten for AC84 (:6917-6926): the bullets' own colours (AC60's tokens) give way to the grey labels.
  assert.match(rule('.v2-bl'), /border-left: 2px solid var\(--line2\);/, 'a grey left edge in --line2');
  assert.match(rule('.v2-bn'), /font: var\(--t-label\); color: var\(--ink2\);/, 'each label a small grey word in --ink2');
  assert.doesNotMatch(rule('.v2-bn'), /text-transform|border:|background/, 'never boxed or in capitals');
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    await app.tap(keyed(app, 'fold:sprints:Build-i1:M2B'));
    const task = byClass(keyed(app, 'tasks:Build-i1:M2B'), 'v2-sp')[0];
    const rows = byClass(task, 'v2-bl');
    assert.deepEqual(rows.map((l) => [l.className, byClass(l, 'v2-bn')[0].textContent]), [['v2-bl tech', 'Technical'], ['v2-bl ctx', 'Context'], ['v2-bl why', 'Why']]);
    assert.equal(byClass(rows[1], 'v2-bt')[0].textContent, 'not recorded');
    assert.equal(byClass(rows[2], 'v2-bt')[0].textContent, 'not recorded');
    assert.match(byClass(rows[1], 'v2-bt')[0].className, /\bgap\b/, 'in the agents\' grey (AC69)');
  } finally {
    app.restore();
  }
});

test('AC60 (note 24): the tasks link — a pull request\'s commits, a pipeline item with a merge line, and one without; no task or step of its own on the Timeline', async () => {
  const { feed } = models({ now: NOW16 });
  const pr44 = row(feed, 'Build-i1', 'M2B').sprints[0];
  assert.deepEqual(pr44.tasks, { href: 'https://github.com/shumpmaster/Service-Desk/pull/44/commits', line: "Opens the pull request's commits on GitHub; each one says who made it." });
  const q13 = row(feed, 'Design-i2', 'MD1').sprints[0];
  assert.deepEqual(q13.tasks, { href: 'https://github.com/shumpmaster/Service-Desk/commits/403b56696e6ec30c0ebb0733802f09a9ffb42702',
    line: "Opens the history on GitHub up to this run's last commit, newest first; the run's own commits are at the top." });
  const merges = j11Files()['status/merges.jsonl'].split('\n').filter((l) => !l.includes('"Q-013"')).join('\n');
  const f2 = models({ now: NOW16, extra: { 'status/merges.jsonl': merges } }).feed;
  assert.deepEqual(row(f2, 'Design-i2', 'MD1').sprints[0].tasks, { none: 'Tasks: not recorded' });
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    // Every fold opened: from stage 3 (AC84) they are `v2-fold` (rewritten so, from `sb-fold`).
    for (let i = 0; i < 6; i++) {
      const folds = findAll(app.view, (e) => e.tag === 'button' && e.attrs['aria-expanded'] === 'false' && FOLD.test(e.className));
      if (!folds.length) break;
      for (const f of folds) { f.click(); await app.flush(); }
    }
    const text = keyed(app, 'feed').textContent;
    // A record's own words may say "step" (#25's title does); the desk draws no step of its own.
    assert.doesNotMatch(text, /(?:researcher|source-checker|builder|reviewer|check-author) (?:started|finished)/, 'no step of a sprint drawn');
    assert.equal(findAll(keyed(app, 'feed'), (e) => /\bsb-(?:step|tl-step|dot)\b/.test(e.className || '')).length, 0, 'no step dots');
    // AC84 (:6922): "then "Tasks in this sprint ↗"" (rewritten from "→").
    assert.ok(linksIn(keyed(app, 'feed')).some((l) => l.text === 'Tasks in this sprint ↗' && /\/pull\/44\/commits$/.test(l.href)));
  } finally {
    app.restore();
  }
});

test('AC60 + AC57 (Still and plain): no version badge on the Timeline', async () => {
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    assert.doesNotMatch(keyed(app, 'feed').textContent, /\bv\d+\.\d+(\.\d+)?\b|version \d/i);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC61

test('AC61 (a): a why end is taken off before the line is read, so the line keeps its name, "done when", phase, sprints and dropped mark; empty, " · "-holding and part-after whys are out of form', () => {
  const plain = milestoneLines(j11Files()['docs/PROJECT.md']).milestones;
  const withWhy = milestoneLines(AC61_DOC);
  for (const m of withWhy.milestones) {
    const p = plain.find((x) => x.id === m.id);
    assert.deepEqual({ ...m, why: null, lineno: 0 }, { ...p, why: null, lineno: 0 }, `${m.id}: unchanged but for its why`);
  }
  assert.equal(withWhy.milestones.find((m) => m.id === 'M2B').why, '"It\'s important for me to see timelines and context windows to be able to drive things."');
  assert.equal(withWhy.milestones.find((m) => m.id === 'MD1').why, 'the desk\'s look rests on published design guidance, not on taste');
  const dropped = milestoneLines('# Part 1\n## 3. Plan\n- A thing (M7) · done when done · phase: Build · dropped · why: no longer wanted\n').milestones[0];
  assert.deepEqual([dropped.dropped, dropped.why], [true, 'no longer wanted']);
  const bad = withWhy.problems.map((p) => p.message);
  assert.ok(bad.includes('a milestone line out of form: its why holds " · ", or has another part after it'));
  assert.equal(bad.filter((x) => /its why holds/.test(x)).length, 2, 'a why holding " · ", and one with " · dropped" after it');
  assert.ok(!withWhy.milestones.some((m) => /^MZ/.test(m.id)), 'skipped, the rest still shown');
  const empty = milestoneLines('# Part 1\n## 3. Plan\n- A thing (M7) · done when done · phase: Build · why: \n');
  assert.equal(empty.milestones.length, 0);
  assert.match(empty.problems[0].message, /its why is empty/);
  // The model's runs and sprints are unchanged by a why (J11: the same expected runs and sprints).
  assert.deepEqual(models({ ac61: true }).tl.lines(), traceNotes());
});

test('AC61 (b): standard lines — "taken on" and "skipped" with their whys; "Skipped" and "planned as skipped"; the notes for a line out of form, a repeated one and one naming no standard milestone', () => {
  const { standard, problems } = standardLines(AC61_DOC);
  assert.deepEqual(Object.keys(standard).sort(), ['Build-4', 'Discovery-1', 'Discovery-2']);
  assert.deepEqual(standard['Build-4'], { state: 'skipped', why: 'the desk runs no experiments; each change is checked by its own tests', lineno: standard['Build-4'].lineno });
  assert.equal(standard['Discovery-1'].state, 'taken on');
  assert.deepEqual(problems.map((p) => p.message), [
    'a standard-milestone line out of form: <Phase>-<n> (standard) · taken on (or skipped) · why: <reason>',
    'standard milestone Build-4 is repeated: the first line counts',
    'a standard-milestone line names Launch-9, which is no standard milestone',
  ]);
  const { feed } = models({ ac61: true, answer: ac61Answer(), now: NOW16 });
  const b4 = rowsOf(block(feed, 'Build-i2')).find((x) => x.code === 'Build-4');
  assert.ok(b4, 'a skipped standard milestone gets its row in a run still to come');
  assert.deepEqual([b4.icon, b4.words, b4.why.text], ['skip', 'skipped', 'the desk runs no experiments; each change is checked by its own tests']);
  assert.equal(row(feed, 'Discovery-i1', 'Discovery-2').words, 'skipped');
});

test('AC61 (c): the Milestone: line for each id kind; both heading forms; each Context fact and source, the exception bullet, "source not recorded", the joined continuation line, and the Why text', () => {
  const nodes = Object.fromEntries(JSON.parse(readFileSync(`${SRC}/../tests/desk/fixtures/ac61/pulls.json`, 'utf8')).nodes.map((n) => [n.number, prBodyParts(n.body)]));
  assert.deepEqual(nodes[901].milestone, { ids: ['MD3'] });
  assert.deepEqual(nodes[903].milestone, { ids: ['Design-4'] });
  assert.deepEqual(nodes[909].milestone, { ids: ['MZ9'] });
  assert.deepEqual(nodes[904].milestone, { none: 'a records-only change' });
  assert.equal(nodes[908].milestone, null);
  assert.deepEqual(nodes[901].context, [
    { fact: "The owner's notes asked for the phases to read from the bottom up", source: 'decisions/questions/P-001-trial-view-notes-2.md', exception: false },
    { fact: 'Version 6 of the mockup was approved', source: 'docs/design/mockups/status-and-timeline.html', exception: false }]);
  assert.deepEqual(nodes[901].why, ['So a glance shows where the work is.', 'And a second paragraph, kept as its own.']);
  assert.deepEqual(nodes[902].context, [{ fact: 'A fact under a level-three heading with a colon', source: 'research/Q-013-memo.md', exception: false }], '### Context:');
  assert.deepEqual(nodes[902].why, ['The why under a level-one heading in lower case.'], '# why');
  assert.deepEqual(nodes[904].context, [{ fact: 'none beyond the ruling quoted in Why.', source: null, exception: true }]);
  assert.deepEqual(nodes[905].context, [{ fact: 'None beyond the ruling quoted in Why', source: null, exception: true }], 'case ignored');
  assert.deepEqual(nodes[905].why, ['"One thing to change here. The answer choices are a little tight"']);
  assert.deepEqual(nodes[906].context, [{ fact: 'A fact whose source is not named', source: null, exception: false },
    { fact: 'A fact with one', source: 'docs/PROJECT.md', exception: false }]);
  assert.deepEqual(nodes[907].context, [{ fact: 'A fact that runs on to a second, indented line', source: 'docs/PROJECT.md', exception: false }], 'joined with one space; the line that is no bullet is not shown');
  assert.deepEqual([nodes[908].context, nodes[908].why], [null, null]);
  assert.deepEqual(contextBullet('A fact (source: )'), { fact: 'A fact', source: 'not recorded', exception: false }, 'an empty source shows "not recorded"');
});

test('AC61 (the desk follow-ups, 2026-10-17): three display leniencies — closing #s on a Context or Why heading, `Milestone:M2` with no space, and Why before Context — each read as the form reads it', () => {
  // Made-up bodies (NOT real records), each one S-032's `pr-body` check would fail.
  const lead = '## What this means for you\nA paragraph in plain English.\n\n';
  const closing = prBodyParts(`${lead}Milestone: MD3\n\n## Context ##\n- A fact under a heading with closing hashes (source: docs/PROJECT.md)\n\n### Why ###\nThe why under one too.\n`);
  assert.deepEqual(closing.milestone, { ids: ['MD3'] });
  assert.deepEqual(closing.context, [{ fact: 'A fact under a heading with closing hashes', source: 'docs/PROJECT.md', exception: false }], '## Context ##');
  assert.deepEqual(closing.why, ['The why under one too.'], '### Why ###');
  const nospace = prBodyParts(`${lead}Milestone:M2\n\n## Context\n- A fact (source: reviews/77/reviewer.md)\n\n## Why\nBecause.\n`);
  assert.deepEqual(nospace.milestone, { ids: ['M2'] }, 'Milestone:M2');
  assert.deepEqual(prBodyParts(`${lead}Milestone:none (a records-only change)\n`).milestone, { none: 'a records-only change' }, 'Milestone:none (…)');
  const order = prBodyParts(`${lead}## Why\nThe why, first.\n\nIts second paragraph.\n\n## Context\n- A fact after the why (source: docs/PROJECT.md)\n\nMilestone: MD1, Design-4\n`);
  assert.deepEqual(order.why, ['The why, first.', 'Its second paragraph.'], 'Why before Context');
  assert.deepEqual(order.context, [{ fact: 'A fact after the why', source: 'docs/PROJECT.md', exception: false }]);
  assert.deepEqual(order.milestone, { ids: ['MD1', 'Design-4'] }, 'the Milestone: line after both sections');
  // The same parts are what J12 keeps of such a body.
  const kept = keptPull(node(960, { body: `${lead}## Why ##\nW.\n\n## Context ##\n- F (source: S)\n\nMilestone:M2\n` }), 'SUCCESS');
  assert.deepEqual(kept.parts, { milestone: { ids: ['M2'] }, context: [{ fact: 'F', source: 'S', exception: false }], why: ['W.'] });
});

test('AC61: on the page, the why text word for word on Status and the Timeline; each Context fact with its source, "source not recorded", and the Why; "not recorded" for each with J11\'s fixture as it is', async () => {
  const app = await openSD('#/p/Service-Desk/timeline', { repoOpts: { ac61: true, answer: ac61Answer() } });
  try {
    // AC84 (:6913-6914): "Why <…>" with the label in weight 500 and the text in body; its source after it.
    assert.match(keyed(app, 'mile:Build-i1:M2B').textContent, /Why "It's important for me to see timelines and context windows to be able to drive things\." · docs\/PROJECT\.md/);
    await app.tap(keyed(app, 'fold:sprints:Design-i2:untied'));
    const task = (n) => findAll(app.view, (e) => e.attrs && e.attrs['data-sprint'] === `PR #${n}`)[0];
    // AC84 (frame 7b: "… reached · docs/LEDGER.md, L-0016"): each fact, then " · " and its source, in grey.
    assert.match(task(906).textContent, /A fact whose source is not named · source not recorded/);
    assert.match(task(906).textContent, /A fact with one · docs\/PROJECT\.md/);
    assert.match(task(905).textContent, /ContextNone beyond the ruling quoted in WhyWhy"One thing to change here\./);
    await app.tap(keyed(app, 'fold:named:Design-i2:MD3'));
    assert.match(task(901).textContent, /So a glance shows where the work is\.And a second paragraph, kept as its own\./);
    // From stage 3 the Status screen gives way to the page (AC81, AC83): a project milestone's why shows on the
    // Timeline (above), and a standard milestone's on the page, from its section 3 line, "· why: <its why>".
    await app.go('#/p/Service-Desk');
    await app.tap(findAll(app.view, (e) => e.tag === 'button' && e.attrs['aria-label'] === 'Build')[0]);
    assert.match(app.text(), /Build-4 The experiments are answeredskipped · why: the desk runs no experiments; each change is checked by its own tests/);
  } finally {
    app.restore();
  }
  const plain = await openSD('#/p/Service-Desk/timeline');
  try {
    // Rewritten for AC90 (specs/S-001.md:8023-8025; AC59's note, :5246-5249): Build run 1's three milestones have no why yet, so
    // it is said once under its band, and M2B shows no why line of its own until it has one.
    assert.equal(keyed(plain, 'whyonce:Build-i1').textContent, 'Why not recorded yet for 3 of 3 milestones · for the agents to add');
    assert.doesNotMatch(keyed(plain, 'mile:Build-i1:M2B').textContent, /Why/);
  } finally {
    plain.restore();
  }
});

// ---------------------------------------------------------------------------
// AC64

test('AC64: no milestone row or band name starts with a code; Technical is never a sprint\'s first bullet; no fixed word holds "untagged", "stage <n>" or "dispatch"', async () => {
  const { feed } = models({ ac61: true, answer: ac61Answer(), now: NOW16 });
  const CODE = /^(?:[A-Z]{1,3}-?\d|PR #|M[0-9A-Z]{1,7}\b|S-\d|Q-\d)/;
  for (const b of feed.blocks) {
    assert.doesNotMatch(b.band.name, CODE, b.band.name);
    for (const x of rowsOf(b)) if (x.kind === 'ms' || x.kind === 'untied') assert.doesNotMatch(x.name, CODE, `${b.key}: ${x.name}`);
  }
  const app = await openSD('#/p/Service-Desk/timeline', { repoOpts: { ac61: true, answer: ac61Answer() } });
  try {
    // Every fold opened: from stage 3 (AC84) they are `v2-fold` (rewritten so, from `sb-fold`).
    for (let i = 0; i < 6; i++) {
      const folds = findAll(app.view, (e) => e.tag === 'button' && e.attrs['aria-expanded'] === 'false' && FOLD.test(e.className));
      if (!folds.length) break;
      for (const f of folds) { f.click(); await app.flush(); }
    }
    // Rewritten for AC84's look (v2-sp, v2-spt and v2-bl in place of sb-task, sb-etitle and sb-bul).
    const sprints = byClass(app.view, 'v2-sp');
    assert.ok(sprints.length > 10, `${sprints.length} sprints drawn`);
    for (const t of sprints) {
      const ls = byClass(t, 'v2-bl');
      if (ls.length) assert.equal(ls[0].className, 'v2-bl tech');
      assert.ok(!byClass(t, 'v2-spt').length || t.children.indexOf(byClass(t, 'v2-spt')[0]) < t.children.indexOf(ls[0]), 'the title before the bullets');
    }
    // The desk's own words on these screens: every text node outside the records' words.
    const own = readFileSync(`${SRC}/lib/feed.js`, 'utf8') + readFileSync(`${SRC}/public/sandbox.js`, 'utf8');
    const fixed = [...own.matchAll(/'([^'\n]*(?:untagged|dispatch|stage \d)[^'\n]*)'/gi)].map((m) => m[1]).filter((w) => / /.test(w) && !/^[a-z-]+$/.test(w));
    for (const w of fixed) assert.ok(!/^[A-Z]/.test(w) || /record|route|log/.test(w), `a fixed word holds a working term: "${w}"`);
    for (const screen of ['#/p/Service-Desk/timeline', '#/p/Service-Desk']) {
      await app.go(screen);
      const text = app.text();
      assert.doesNotMatch(text, /untagged/i);
      assert.doesNotMatch(text, /\bstage \d/i);
      assert.doesNotMatch(text, /\bdispatch/i);
      assert.doesNotMatch(text.replace(/(?:Discovery|Design|Build|Launch) i\d/g, ''), /\bi\d\b/, '"i<n>" only after its phase\'s name');
    }
  } finally {
    app.restore();
  }
});

test('AC60 + J12 (build review round 1, B2): while a J12 failure is set, every pull-request part shows "not available" with the reason one tap away, never what an earlier read kept', async () => {
  const m = models({ now: NOW16 });
  const reason = "the pull requests' read failed: GitHub could not be reached";
  // A list kept from before PR #52 merged, without PR #44, and today's read failed.
  const kept = m.snap.pulls.list.map((p) => (p.number === 52 ? { ...p, state: 'OPEN', mergedAt: null, mergeCommit: null } : p)).filter((p) => p.number !== 44);
  const snap = { ...m.snap, pulls: { list: kept, failure: reason, tooMany: false, fieldError: null } };
  const feed = feedView(runsContext(SD3, snap, m.j, m.tl, m.pv), { pulls: [] }, NOW16, 'America/Chicago');
  const m2b = row(feed, 'Build-i1', 'M2B');
  assert.deepEqual(m2b.sprints.map((s) => [s.id, s.missing, s.reason, s.marks || null]), [['PR #44', 'not available', reason, null], ['PR #52', 'not available', reason, null]]);
  for (const b of feed.blocks) for (const x of rowsOf(b)) for (const s of x.sprints || []) if (/^PR #/.test(s.id)) assert.equal(s.missing, 'not available', s.id);
  assert.ok(!feed.blocks.some((b) => rowsOf(b).some((x) => x.kind === 'untied' && x.sprints.some((s) => /^PR #/.test(s.id)))), 'no pull request placed from the old list');
  assert.deepEqual(feed.notes, [`Pull requests: not available (${reason})`]);
  // On the page: the reason one tap away.
  const app = await openSD('#/p/Service-Desk/timeline', { repoOpts: {} });
  try {
    app.server.call = ((call) => (path, body) => call(path, body).then((res) => (body && body.pulls && res.json ? { ...res, json: { ...res.json, pulls: null } } : res)))(app.server.call);
    app.desk.states.get('Service-Desk').j12.wait = null;
    app.desk.states.get('Service-Desk').j12.head = 'f'.repeat(40);
    await app.advance(61_000);
    await app.tap(keyed(app, 'fold:sprints:Build-i1:M2B'));
    const tasks = keyed(app, 'tasks:Build-i1:M2B');
    assert.match(tasks.textContent, /PR #44 not available/);
    assert.match(tasks.textContent, /PR #52 not available/);
    assert.doesNotMatch(tasks.textContent, /✓ merged/);
    // The reason, behind its "Why" control when it has one.
    const why = findAll(tasks, (e) => e.tag === 'button' && e.attrs['aria-expanded'] === 'false');
    for (const w of why) await app.tap(w);
    assert.match(keyed(app, 'tasks:Build-i1:M2B').textContent, /the pull requests' read failed/);
  } finally {
    app.restore();
  }
});

test('AC60 (draft 6, N6a): only a merged pull request is placed by its own Milestone: line; an open one naming MD3 is not on the Timeline (it is in the Queue)', () => {
  const open = node(950, { mergedAt: null, body: '## What this means for you\nA change.\n\nMilestone: MD3\n', title: 'An open one naming MD3 (made up, NOT a real record)' });
  const merged = node(951, { mergedAt: '2026-10-12T12:00:00Z', body: '## What this means for you\nA change.\n\nMilestone: MD3\n', title: 'A merged one naming MD3 (made up)' });
  const { feed } = models({ answer: answerOf([open, merged, ...pullNodes()]), now: NOW16 });
  const md3 = row(feed, 'Design-i2', 'MD3');
  assert.deepEqual(md3.named.map((x) => x.id), ['PR #951']);
  assert.ok(!feed.blocks.some((b) => rowsOf(b).some((x) => [...(x.sprints || []), ...(x.named || [])].some((y) => y.id === 'PR #950'))));
});
