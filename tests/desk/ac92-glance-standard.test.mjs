// ac-test: S-001/AC92 — G6 of "After the glance audit": the standard checklist set apart, part (d) (specs/S-001.md, AC92
// (d); round 2, item 5; P-001-glance2-standard.md, A: "Your milestones · n" and "Standard checklist · n · k tracked" as
// clear heads, a rule above the standard group, the untracked ones folded into one line worded "not tracked" (a tap lists
// them), the owner's rows in the row weight, and "· standard" in the Timeline's meta line; AC83 and AC84, changed): in an
// opened phase, every run, earlier ones included, under two heads in --t-label --ink, the standard group with a 1 px --line
// rule above its head and 8 px over it; h per run; the standard rows not tracked in that run folded into one row, "<n> not
// tracked this run: <a> not recorded yet, <b> no record in the model ›", listed in place on a tap, Enter or Space, each with
// its own mark and words (part B item 30's three states), kept on a refresh (AC56); skipped, not-needed and "taken on · not
// recorded by the model" rows kept; the owner's own rows' names 500 13 px and a standard row's 400 13 px; and on the
// Timeline, "<id> · standard · <its state words>", the name 400 13 px, and the gathered line "Standard checklist · <n> not
// recorded for this run ›". ac-test: S-001/AC83 ac-test: S-001/AC84
//
// R3-b (the plan review's carried risk, round 3: "(d) names class 5 only as "the model can't record" … G6 should pick one
// and test it"): a taken-on standard row outside its run's h reads "taken on · not recorded by the model", whether the model
// can't record it or its run is neither now nor still to come (a finished phase's, or an earlier run gone back over); one in
// h, "taken on". Its cases are below.
//
// The records: Service-Desk's at 77bfeae, real (tests/desk/fixtures/j11-77bfeae/), as `text` holds them; `standard`, the
// same with every standard line written in section 3 (tests/desk/glance-fixtures.mjs, made up, NOT real records); J11's
// fixture at 3117150, real, for the Timeline (tv2-fixtures.mjs's openSD, J12's built answer, NOT as GitHub sent it); and the
// made-up runs written below, each NOT a real record. The page is the sandbox's own code under the fake DOM; each look is
// the cascade of the page's own stylesheets (tests/desk/css-cascade.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { openSD } from './tv2-fixtures.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { textState, standardState, mixState, gatesState, STANDARD_SKIPPED, MIX_PROJECT, SD, NOW } from './glance-fixtures.mjs';
import { STANDARD_MILESTONES, NOT_RECORDED_IDS } from '../../src/lib/timeline.js';
import { milestonesByPhase, trackedInRun, detailLines, PAGE_WORDS } from '../../src/lib/projectpage.js';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { answerOf, node } from './j12-fixture.mjs';

const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');
const THEMES = [['light', '#18191c', '#5c5f66', '#e7e7ea'], ['dark', '#ecedef', '#a2a5ac', '#26282c']];
/** Each drawn element's cascaded look in a theme, at 360 px: el → { size, weight, color, borderTop, marginTop }. */
function looks(app, theme) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width: 360, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) {
    if (!n.el) continue;
    out.set(n.el, { size: plain(n.style.get('font-size')), weight: plain(n.style.get('font-weight')), color: plain(n.style.get('color')),
      borderTop: plain(n.declared.get('border-top') || ''), marginTop: plain(n.declared.get('margin-top') || '') });
  }
  return out;
}
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const lineOf = (app, ph) => findAll(keyed(app, 'ms-lines'), (e) => e.attrs && e.attrs['data-phase'] === ph)[0];
const foldOf = (app, ph) => findAll(lineOf(app, ph), (e) => e.tag === 'button')[0];
const rowsIn = (el) => findAll(el, (e) => / v2-sm /.test(` ${e.className} `));
const idsIn = (el) => rowsIn(el).map((r) => byClass(r, 'v2-id')[0].textContent);
const wordsOf = (r) => byClass(r, 'v2-sms')[0].textContent;
const iconOf = (el) => findAll(el, (e) => e.tag === 'svg')[0].attrs.class.split(' ')[1];
const heads = (el) => byClass(el, 'v2-subh').map((x) => x.textContent);
const untrBtn = (app, key) => findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['data-untracked'] === key)[0] || null;
const PHASES = ['Launch', 'Build', 'Design', 'Discovery'];

/** Opens a project's page on a state (one page open at a time: each app's restore puts back the globals it found). */
async function openPage(state, hash = `#/p/${SD.name}`) {
  const app = await loadSandbox({ ...state, hash, now: NOW, store: memStore() });
  await app.advance(1000);
  await app.advance(POLL_MS);
  return app;
}
async function openAll(app) {
  for (const ph of PHASES) await app.tap(foldOf(app, ph));
}

/**
 * A made-up context (NOT real records), enough for milestonesByPhase: runs as { phase, iteration, state (the run's), std:
 * { id: state } }, every other standard milestone of the run "not recorded", no own milestones; `standard` the section-3
 * lines ({ id: { state: 'taken on' | 'skipped' } }); `groundwork` the groundwork requests J11 read.
 */
function fake({ runs, standard = {}, groundwork = [] }) {
  const rs = runs.map((r) => ({ phase: r.phase, iteration: r.iteration || 1, project: [], sprints: {}, untagged: [],
    standard: STANDARD_MILESTONES.filter((m) => m[1] === r.phase).map(([id, , name]) => ({ id, name, state: (r.std || {})[id] || 'not recorded' })) }));
  const state = new Map(rs.map((r, i) => [r, runs[i].state]));
  return { project: { name: 'Made-up', model: 'v3' }, tl: {}, pv: { tracked: true, done: false }, now: rs.find((r) => state.get(r) === 'now') || null,
    cols: { runs: rs, k: new Map(rs.map((r) => [r, r.iteration])) }, state, standard, j: { groundwork }, runs: rs };
}
const runView = (ctx, phase, iteration) => milestonesByPhase(ctx).lines.find((l) => l.phase === phase).runs.find((r) => r.key === `${phase}-i${iteration}`);

// ---------------------------------------------------------------------------
// h, per run

// Rewritten in G6's fix round (G6's review, round 1, note 1; the Definer's narrowing of AC92 (d)'s h): h counted "a state
// recorded in that run", "not needed" and a skipped line's recorded state among them; it now counts only "reached",
// "carried over" or "not reached" on a line not marked skipped (the states of (c)'s classes 2 and 4), and the recordable
// taken-on ones while the run is now or still to come.
test('AC92 (d): h per run (narrowed in G6\'s fix round) — "reached", "carried over" or "not reached" recorded in that run on a line not marked skipped, or "taken on" by its line, the model able to record it, while that run is now or still to come; never "not needed", a skipped one whatever it records, one the model can\'t record (Launch-4, NOT_RECORDED_IDS, Discovery-3 with no groundwork), one not recorded, or a taken-on one in a run finished or gone back over', () => {
  const ctx = fake({
    runs: [
      { phase: 'Design', iteration: 1, state: 'gone back over', std: { 'Design-1': 'reached', 'Design-6': 'not reached', 'Design-2': 'reached' } },
      { phase: 'Design', iteration: 2, state: 'now', std: { 'Design-1': 'reached (carried over from Design i1)', 'Design-6': 'not needed' } },
      { phase: 'Launch', iteration: 1, state: 'still to come' },
      { phase: 'Discovery', iteration: 1, state: 'finished', std: { 'Discovery-1': 'reached' } },
    ],
    standard: { 'Design-4': { state: 'taken on' }, 'Design-3': { state: 'taken on' }, 'Design-2': { state: 'skipped' },
      'Launch-3': { state: 'taken on' }, 'Launch-4': { state: 'taken on' }, 'Launch-1': { state: 'taken on' }, 'Discovery-2': { state: 'taken on' }, 'Discovery-3': { state: 'taken on' } },
  });
  const [d1, d2, l1, disc] = ctx.runs;
  const t = (run, id) => trackedInRun(ctx, run, run.standard.find((s) => s.id === id));
  assert.deepEqual(['Design-1', 'Design-6', 'Design-4', 'Design-3', 'Design-2', 'Design-5'].map((id) => t(d2, id)), [true, false, true, false, false, false],
    'run 2 (now): carried over recorded; Design-6\'s "not needed" outside h; Design-4 taken on and recordable; Design-3 taken on but of NOT_RECORDED_IDS; Design-2 skipped, nothing recorded; Design-5 not recorded');
  assert.deepEqual(['Design-1', 'Design-6', 'Design-4', 'Design-2'].map((id) => t(d1, id)), [true, true, false, false],
    'run 1 (gone back over): reached and not reached recorded; Design-4 taken on, outside h; Design-2 skipped by its line though "reached" is recorded, outside h');
  assert.deepEqual(['Launch-3', 'Launch-4', 'Launch-1', 'Launch-2'].map((id) => t(l1, id)), [true, false, false, false], 'a run still to come: Launch-3 in h; Launch-4 and Launch-1 (the model can\'t record them) and Launch-2 (no line) not');
  assert.deepEqual(['Discovery-1', 'Discovery-2', 'Discovery-3'].map((id) => t(disc, id)), [true, false, false], 'a finished run: only what it recorded');
  assert.ok(NOT_RECORDED_IDS.has('Design-3') && NOT_RECORDED_IDS.has('Launch-1') && !NOT_RECORDED_IDS.has('Design-4'));
  // Discovery-3 is recordable only while groundwork is recorded for the project.
  const now = (groundwork) => fake({ runs: [{ phase: 'Discovery', iteration: 1, state: 'now' }], standard: { 'Discovery-3': { state: 'taken on' } }, groundwork });
  const no = now([]);
  const yes = now(['Q-001']);
  assert.equal(trackedInRun(no, no.runs[0], no.runs[0].standard[2]), false, 'no groundwork: outside h');
  assert.equal(trackedInRun(yes, yes.runs[0], yes.runs[0].standard[2]), true, 'groundwork recorded: in h');
  // The heads' numbers, from the same runs.
  assert.deepEqual([runView(ctx, 'Design', 2).h, runView(ctx, 'Design', 1).h, runView(ctx, 'Launch', 1).h, runView(ctx, 'Discovery', 1).h], [2, 2, 1, 1]);
  assert.equal(PAGE_WORDS.standardHead(6, 3), 'Standard checklist · 6 · 3 tracked');
  assert.equal(PAGE_WORDS.standardHead(5, 0), 'Standard checklist · 5 · none tracked this run', 'never "0 tracked"');
  assert.equal(PAGE_WORDS.yoursHead(3), 'Your milestones · 3');
});

test('AC92 (d) (G6\'s fix round, the Definer\'s narrowing): in a phase with one run, the head\'s h equals the phase line\'s k — each state and line, "not needed" and a skipped one with a recorded state among them; and on Service-Desk\'s records at 77bfeae (real) and on `standard` (made up, NOT real), each one-run phase\'s head against its line', async () => {
  const one = (state, std, standard) => {
    const ctx = fake({ runs: [{ phase: 'Design', iteration: 1, state, std }], standard });
    const line = milestonesByPhase(ctx).lines.find((l) => l.phase === 'Design');
    return [line.runs[0].h, line.counts.k];
  };
  const STD = { 'Design-1': 'reached', 'Design-2': 'reached', 'Design-3': 'not needed', 'Design-4': 'not reached', 'Design-6': 'reached (carried over from Design i1)' };
  const LINES = { 'Design-2': { state: 'skipped' }, 'Design-5': { state: 'taken on' }, 'Design-6': { state: 'taken on' }, 'Design-4': { state: 'taken on' } };
  for (const state of ['now', 'still to come', 'finished', 'not recorded']) {
    const [h, k] = one(state, STD, LINES);
    assert.equal(h, k, `${state}: h ${h}, k ${k}`);
    assert.equal(h, 3, `${state}: Design-1, Design-4 and Design-6; not Design-2 (skipped, though reached), Design-3 (not needed) or Design-5 (the model can't record it)`);
  }
  // A recordable taken-on one with nothing recorded: in h and in k while the run is now or still to come, out of both otherwise.
  for (const [state, want] of [['now', 1], ['still to come', 1], ['finished', 0]]) assert.deepEqual(one(state, {}, { 'Design-4': { state: 'taken on' } }), [want, want], state);
  // On the records: each phase with one run, its head's h against its line's k.
  for (const st of [textState(), standardState()]) {
    const app = await openPage(st);
    try {
      for (const ph of PHASES) {
        await app.tap(foldOf(app, ph));
        const open = keyed(app, `stdl:${ph}`);
        if (byClass(open, 'v2-runh').length !== 1) continue;
        const h = /· (\d+) tracked$/.exec(heads(open)[1]);
        const k = /Standard checklist: (\d+) tracked/.exec(byClass(foldOf(app, ph), 'v2-sdl')[1].textContent);
        assert.equal(h ? Number(h[1]) : 0, k ? Number(k[1]) : 0, `${ph}: "${heads(open)[1]}" against "${byClass(foldOf(app, ph), 'v2-sdl')[1].textContent}"`);
      }
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// The heads and the rule, on every run

test('AC92 (d), on Service-Desk\'s records at 77bfeae (real): every run, earlier ones included, under two heads, "Your milestones · <n>" and "Standard checklist · <n> · <h> tracked" (or "· none tracked this run"), in --t-label --ink, in light and dark; the standard group with a 1 px --line rule above its head and 8 px over it', async () => {
  const app = await openPage(textState());
  try {
    await openAll(app);
    const want = {
      Launch: ['Your milestones · 1', 'Standard checklist · 5 · none tracked this run'],
      Build: ['Your milestones · 2', 'Standard checklist · 5 · none tracked this run', 'Your milestones · 3', 'Standard checklist · 5 · none tracked this run'],
      Design: ['Your milestones · 3', 'Standard checklist · 6 · none tracked this run', 'Your milestones · 0', 'Standard checklist · 6 · 2 tracked'],
      Discovery: ['Your milestones · 0', 'Standard checklist · 8 · 4 tracked'],
    };
    for (const ph of PHASES) {
      const open = keyed(app, `stdl:${ph}`);
      assert.deepEqual(heads(open), want[ph], ph);
      // Each run's head first, then its two heads: the run heads and the head pairs alternate.
      const seq = findAll(open, (e) => / v2-(runh|subh) /.test(` ${e.className} `)).map((e) => (/v2-runh/.test(e.className) ? 'run' : /\bstd\b/.test(e.className) ? 'std' : 'yours'));
      assert.deepEqual(seq, byClass(open, 'v2-runh').flatMap(() => ['run', 'yours', 'std']), `${ph}: two heads under every run`);
    }
    // An earlier run (Design run 1, gone back over) now has its heads; before G6 it had none (sandbox.js, the old branch).
    const old = keyed(app, 'old:Design-i1:run1');
    assert.match(old.className, /\bv2-oldrun\b/);
    assert.deepEqual(heads(old), ['Your milestones · 0', 'Standard checklist · 6 · 2 tracked']);
    for (const [theme, ink] of THEMES) {
      const L = looks(app, theme);
      // Rewritten in HD1 (forced: AC98 draws an opened phase's two group heads at 600 12 px --ink, one step under its run's head;
      // tests/desk/ac92-glance-standard.test.mjs:195).
      for (const hd of byClass(keyed(app, 'ms-lines'), 'v2-subh')) {
        assert.deepEqual([L.get(hd).size, L.get(hd).weight, L.get(hd).color], ['12px', '600', ink], `${theme}: "${hd.textContent}" at 600 12 px --ink (AC98)`);
      }
      const std = byClass(keyed(app, 'stdl:Design'), 'v2-subh').filter((x) => /\bstd\b/.test(x.className));
      assert.equal(std.length, 2);
      for (const hd of std) assert.deepEqual([L.get(hd).borderTop, L.get(hd).marginTop], [`1px solid ${THEMES.find((x) => x[0] === theme)[3]}`, '8px'], `${theme}: the rule above the standard head, 8 px over it`);
      for (const hd of byClass(keyed(app, 'stdl:Design'), 'v2-subh').filter((x) => !/\bstd\b/.test(x.className))) assert.equal(L.get(hd).borderTop, '', 'no rule above the owner\'s head');
    }
  } finally {
    app.restore();
  }
});

/** An opened phase's run heads, in the order drawn, each found by its run, its key and its run number, never by its key alone. */
const runHeads = (app, ph) => byClass(keyed(app, `stdl:${ph}`), 'v2-runh').map((el) => {
  const m = /^runh:(.+):run(\d+)$/.exec(el.dataset.k || '');
  assert.ok(m, `a run head keyed by its run: ${el.dataset.k}`);
  return { el, key: m[1], k: Number(m[2]), run: `${m[1]} run ${m[2]}`, text: el.textContent };
});

// G9's round 2 (AC92 (d), changed: the Design reviewer's call, G9's design review, round 1, B1): a run's head outranks its
// two group heads.
test('AC92 (d), from G9\'s round 2: an opened phase\'s run heads outrank its two group heads — each in --ink at weight 600, 13 px over their 12 px from HD1 (AC98; 11 px both before), in light and dark; each after the first set apart by a 1 px --line rule with 8 px over it, the standard group head\'s own rule and gap, and none above the first (the latest run\'s); on `mix`\'s made-up project, Build\'s runs with its two "Build-i1" runs (gone back over and still to come), and on `gates`\', Launch\'s three "Launch-i1" runs (NOT real records), each run found by itself', async () => {
  const cases = [
    [mixState(), 'Build', ['Build-i1 run 3', 'Build-i2 run 2', 'Build-i1 run 1'], { 'Build-i1 run 3': /^Run 3 · planned$/, 'Build-i1 run 1': /· gone back over$/ }],
    [gatesState(), 'Launch', ['Launch-i1 run 4', 'Launch-i1 run 3', 'Launch-i1 run 2'], {}],
  ];
  for (const [state, ph, runs, said] of cases) {
    const app = await openPage(state, `#/p/${MIX_PROJECT}`);
    try {
      await app.tap(foldOf(app, ph));
      const rh = runHeads(app, ph);
      assert.deepEqual(rh.map((r) => r.run), runs, `${ph}: every run's head, each its own run`);
      assert.equal(new Set(rh.map((r) => r.el)).size, runs.length, `${ph}: one head for each run`);
      for (const [run, re] of Object.entries(said)) assert.match(rh.find((r) => r.run === run).text, re, `${ph}: ${run}'s head`);
      // The runs that share a key are each found by the run itself, so each is held to its own place: first or not.
      const shared = rh.filter((r) => rh.filter((x) => x.key === r.key).length > 1);
      assert.ok(shared.length >= 2, `${ph}: two or more runs share a key (${shared.map((r) => r.run).join(', ')})`);
      const std = byClass(keyed(app, `stdl:${ph}`), 'v2-subh').filter((x) => /\bstd\b/.test(x.className));
      const groups = byClass(keyed(app, `stdl:${ph}`), 'v2-subh');
      assert.equal(groups.length, 2 * runs.length, `${ph}: two group heads under every run`);
      for (const [theme, ink, , line] of THEMES) {
        const L = looks(app, theme);
        rh.forEach((r, i) => {
          const at = L.get(r.el);
          // Rewritten in HD1 (forced: AC98 draws a run's head at 600 13 px and its two group heads at 600 12 px, so the run's
          // head outranks them by a size step, no longer by weight at one size; tests/desk/ac92-glance-standard.test.mjs:239).
          assert.deepEqual([at.size, at.weight, at.color], ['13px', '600', ink], `${theme}: ${ph}'s ${r.run} head in --ink at 600, 13 px (AC98)`);
          for (const g of groups) {
            assert.equal(L.get(g).color, ink, `${theme}: the group head "${g.textContent}" stays --ink`);
            assert.equal(L.get(g).weight, at.weight, `${theme}: "${g.textContent}" at the run head's weight, 600`);
            assert.ok(parseFloat(at.size) > parseFloat(L.get(g).size), `${theme}: ${r.run}'s head (${at.size}) outranks "${g.textContent}" (${L.get(g).size}) by a size step`);
            assert.equal(L.get(g).size, '12px', `${theme}: the group heads 12 px`);
          }
          if (i === 0) assert.deepEqual([at.borderTop, at.marginTop], ['', ''], `${theme}: no rule above the first run's head (${r.run})`);
          else {
            assert.deepEqual([at.borderTop, at.marginTop], [`1px solid ${line}`, '8px'], `${theme}: a 1 px --line rule with 8 px over it above ${r.run}'s head`);
            assert.deepEqual([at.borderTop, at.marginTop], [L.get(std[0]).borderTop, L.get(std[0]).marginTop], `${theme}: the standard group head's own rule and gap`);
          }
        });
      }
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// The untracked ones folded, and the three states after the fold's tap

test('AC92 (d): the untracked ones folded into one row — the dashed ring, "<n> not tracked this run: <a> not recorded yet, <b> no record in the model", the chevron, in --t-small --ink2; each part left out when 0; never "not used"; an earlier run\'s in place of its gathered line', async () => {
  assert.equal(PAGE_WORDS.untracked(4, 2), '6 not tracked this run: 4 not recorded yet, 2 no record in the model', 'as the ruling\'s option A');
  assert.equal(PAGE_WORDS.untracked(3, 0), '3 not tracked this run: 3 not recorded yet');
  assert.equal(PAGE_WORDS.untracked(0, 2), '2 not tracked this run: 2 no record in the model');
  const app = await openPage(textState());
  try {
    await openAll(app);
    const words = (key) => byClass(untrBtn(app, key), 'v2-untrw')[0].textContent;
    assert.deepEqual(['Launch-i1', 'Build-i2', 'Build-i1', 'Design-i2', 'Design-i1', 'Discovery-i1'].map(words), [
      '5 not tracked this run: 2 not recorded yet, 3 no record in the model',
      '5 not tracked this run: 3 not recorded yet, 2 no record in the model',
      '5 not tracked this run: 3 not recorded yet, 2 no record in the model',
      '6 not tracked this run: 4 not recorded yet, 2 no record in the model',
      '4 not tracked this run: 2 not recorded yet, 2 no record in the model',
      '4 not tracked this run: 1 not recorded yet, 3 no record in the model',
    ], 'Design run 2 as round 2\'s mock read it (r2-q5-design-after), and Launch as its r2-q5-launch-after');
    assert.doesNotMatch(keyed(app, 'ms-lines').textContent, /not used/, 'the ruling\'s "not tracked", never "not used"');
    assert.doesNotMatch(keyed(app, 'ms-lines').textContent, /to Design-5 · not recorded, or no record in the model/, 'the earlier run\'s gathered line gone');
    const b = untrBtn(app, 'Design-i2');
    assert.equal(b.attrs['aria-expanded'], 'false', 'folded on opening');
    assert.equal(b.parent.className, 'v2-untr', 'one row, last in the standard list');
    assert.equal(b.parent.parent, keyed(app, 'std:Design-i2'));
    assert.equal(b.parent.parent.children.at(-1), b.parent);
    assert.deepEqual(rowsIn(keyed(app, 'std:Design-i2')), [], 'none of the six listed while folded');
    const ring = findAll(b, (e) => e.tag === 'svg')[0];
    assert.match(ring.attrs.class, /\bst-planned\b/, 'the dashed ring');
    assert.ok(findAll(ring, (e) => e.tag === 'circle' && /\bdash\b/.test(e.attrs.class || '')).length === 1, 'its ring dashed');
    assert.equal(ring.attrs['aria-hidden'], 'true');
    assert.equal(byClass(b, 'vi-chev').length, 1, 'the chevron, ›');
    for (const [theme, , ink2] of THEMES) {
      const L = looks(app, theme);
      const w = byClass(b, 'v2-untrw')[0];
      assert.deepEqual([L.get(w).size, L.get(w).weight, L.get(w).color], ['12px', '400', ink2], `${theme}: --t-small --ink2`);
    }
  } finally {
    app.restore();
  }
  // The fold row's words wrap (AC42): no rule of its own holds them to one line.
  const css = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const own = css.split('}').filter((r) => /\.v2-untr/.test(r.split('{')[0]));
  assert.ok(own.length >= 2, 'its rules');
  for (const r of own) assert.doesNotMatch(r, /nowrap|text-overflow/, r);
});

test('AC92 (d) and part B item 30: the fold\'s tap (and Enter or Space) lists the untracked rows in place under it, each with its own mark and words — "not recorded yet" with the dashed circle and "?", "no record for this in the model yet" with the slashed circle — the first at the foot; the skipped ones listed apart; a refresh keeps it as the owner left it (AC56); a second tap folds them again', async () => {
  const app = await openPage(textState());
  try {
    await app.tap(foldOf(app, 'Design'));
    await app.tap(untrBtn(app, 'Design-i2'));
    assert.equal(untrBtn(app, 'Design-i2').attrs['aria-expanded'], 'true');
    assert.equal(byClass(untrBtn(app, 'Design-i2'), 'vi-chevdown').length, 1, 'its mark turned down');
    const std = keyed(app, 'std:Design-i2');
    assert.deepEqual(idsIn(std), ['Design-6', 'Design-5', 'Design-4', 'Design-3', 'Design-2', 'Design-1'], 'in place, Design-1 at the foot');
    assert.equal(std.children.indexOf(untrBtn(app, 'Design-i2').parent), 0, 'under the fold row');
    const row = (id) => rowsIn(std).find((r) => byClass(r, 'v2-id')[0].textContent === id);
    for (const id of ['Design-6', 'Design-4', 'Design-2', 'Design-1']) assert.deepEqual([iconOf(row(id)), wordsOf(row(id))], ['st-unrec', 'not recorded yet'], `${id}: a dashed circle with "?"`);
    for (const id of ['Design-5', 'Design-3']) assert.deepEqual([iconOf(row(id)), wordsOf(row(id))], ['st-nomodel', 'no record for this in the model yet'], `${id}: a slashed circle`);
    // A refresh keeps it as the owner left it (AC56): opened, the same elements.
    const first = rowsIn(std)[0];
    app.module.refresh();
    await app.flush();
    assert.equal(untrBtn(app, 'Design-i2').attrs['aria-expanded'], 'true', 'kept open');
    assert.equal(rowsIn(keyed(app, 'std:Design-i2'))[0], first, 'the same element');
    // Folded again by a second tap; Enter and Space open it as a tap does.
    await app.tap(untrBtn(app, 'Design-i2'));
    assert.equal(untrBtn(app, 'Design-i2').attrs['aria-expanded'], 'false');
    assert.deepEqual(rowsIn(keyed(app, 'std:Design-i2')), []);
    for (const key of ['Enter', ' ']) {
      untrBtn(app, 'Design-i2').dispatch('keydown', { key, preventDefault() {} });
      await app.flush();
      assert.equal(untrBtn(app, 'Design-i2').attrs['aria-expanded'], 'true', `${JSON.stringify(key)} opens it`);
      untrBtn(app, 'Design-i2').dispatch('keydown', { key, preventDefault() {} });
      await app.flush();
      assert.equal(untrBtn(app, 'Design-i2').attrs['aria-expanded'], 'false', `${JSON.stringify(key)} folds it`);
    }
    // An earlier run's fold opens on its own; folding or opening one never opens another.
    await app.tap(untrBtn(app, 'Design-i1'));
    assert.deepEqual(idsIn(keyed(app, 'std:Design-i1')), ['Design-6', 'Design-1', 'Design-5', 'Design-4', 'Design-3', 'Design-2'], 'run 1: its two tracked rows, then the four folded ones under the fold row');
    assert.equal(untrBtn(app, 'Design-i2').attrs['aria-expanded'], 'false');
  } finally {
    app.restore();
  }
  // The three states together after the fold's tap, on `standard` with Build-4's line alone (made up, NOT real): not used
  // by this project ("skipped" with its why), listed apart, outside the fold; not recorded yet and no record in the model,
  // in the fold.
  const st = await openPage(standardState({ ids: ['Build-4'] }));
  try {
    await st.tap(foldOf(st, 'Build'));
    const std = keyed(st, 'std:Build-i1');
    const skipped = rowsIn(std).find((r) => byClass(r, 'v2-id')[0].textContent === 'Build-4');
    assert.deepEqual([iconOf(skipped), wordsOf(skipped)], ['st-skip', 'skipped · why: made up for the test, Build-4'], 'skipped, listed while the fold is closed');
    assert.equal(byClass(untrBtn(st, 'Build-i1'), 'v2-untrw')[0].textContent, '4 not tracked this run: 3 not recorded yet, 1 no record in the model');
    await st.tap(untrBtn(st, 'Build-i1'));
    const after = rowsIn(keyed(st, 'std:Build-i1'));
    const by = (id) => after.find((r) => byClass(r, 'v2-id')[0].textContent === id);
    assert.deepEqual([[iconOf(by('Build-4')), wordsOf(by('Build-4'))], [iconOf(by('Build-3')), wordsOf(by('Build-3'))], [iconOf(by('Build-5')), wordsOf(by('Build-5'))]],
      [['st-skip', 'skipped · why: made up for the test, Build-4'], ['st-unrec', 'not recorded yet'], ['st-nomodel', 'no record for this in the model yet']],
      'the three states told apart after the fold\'s tap, each with its mark and words');
    assert.ok(NOT_RECORDED_IDS.has('Build-5') && !NOT_RECORDED_IDS.has('Build-3'));
  } finally {
    st.restore();
  }
});

/** The opened phase's lists holding each fold row with key `key`, in the order drawn, and each fold's state. */
const sharedFolds = (app, ph, key) => findAll(keyed(app, `stdl:${ph}`), (e) => e.tag === 'button' && e.attrs && e.attrs['data-untracked'] === key);
const foldStates = (app, ph, key) => sharedFolds(app, ph, key).map((b) => b.attrs['aria-expanded']);
const listedUnder = (app, ph, key) => sharedFolds(app, ph, key).map((b) => rowsIn(b.parent.parent).length);

test('AC92 (d) and AC56 (G6\'s review, round 1, B1): runs that share a key ("<Phase>-i<n>") keep a fold each — on `mix`\'s made-up project, Build\'s two "Build-i1" runs, and on `gates`\', Launch\'s three "Launch-i1" runs (NOT real records): a tap on one run\'s fold opens that one only, a refresh keeps it so, and a tap on another opens it alone beside it', async () => {
  for (const [state, ph, key, n] of [[mixState(), 'Build', 'Build-i1', 2], [gatesState(), 'Launch', 'Launch-i1', 3]]) {
    const app = await openPage(state, `#/p/${MIX_PROJECT}`);
    try {
      await app.tap(foldOf(app, ph));
      const runs = sharedFolds(app, ph, key).map((b) => b.attrs['data-runk']);
      assert.equal(runs.length, n, `${ph}: ${n} runs keyed ${key}, each with its fold`);
      assert.equal(new Set(runs).size, n, `${ph}: each its own run number (${runs.join(', ')})`);
      const before = listedUnder(app, ph, key);
      assert.deepEqual(foldStates(app, ph, key), runs.map(() => 'false'));
      await app.tap(sharedFolds(app, ph, key)[0]);
      const one = runs.map((_, i) => (i === 0 ? 'true' : 'false'));
      assert.deepEqual(foldStates(app, ph, key), one, `${ph}: only the tapped run's fold opens`);
      const after = listedUnder(app, ph, key);
      assert.ok(after[0] > before[0], `${ph}: the tapped run lists its untracked rows`);
      assert.deepEqual(after.slice(1), before.slice(1), `${ph}: the other runs list nothing more`);
      app.module.refresh();
      await app.flush();
      assert.deepEqual(foldStates(app, ph, key), one, `${ph}: a refresh keeps it as the owner left it`);
      assert.deepEqual(listedUnder(app, ph, key), after);
      await app.tap(sharedFolds(app, ph, key)[n - 1]);
      assert.deepEqual(foldStates(app, ph, key), runs.map((_, i) => (i === 0 || i === n - 1 ? 'true' : 'false')), `${ph}: the last run's opens beside it, any between stays folded`);
      await app.tap(sharedFolds(app, ph, key)[0]);
      assert.deepEqual(foldStates(app, ph, key), runs.map((_, i) => (i === n - 1 ? 'true' : 'false')), `${ph}: folding the first leaves the last open`);
    } finally {
      app.restore();
    }
  }
});

test('AC59 and AC92 (d) (G6\'s review, round 1, outside G6\'s row): on the Timeline, runs that share a key keep a gathered line each — on `gates`\' made-up project (NOT real records), its three "Launch-i1" runs\' "Standard checklist · 5 still to come" lines: a tap on one opens that one only, and a refresh keeps it so', async () => {
  const app = await openPage(gatesState(), `#/p/${MIX_PROJECT}/timeline`);
  try {
    const lines = () => findAll(app.view, (e) => e.tag === 'button' && e.dataset && /^fold:Launch-i1:gather:stc:run\d+$/.test(e.dataset.k || ''));
    assert.equal(lines().length, 3, 'three runs keyed Launch-i1, a line each');
    assert.equal(new Set(lines().map((b) => b.dataset.k)).size, 3, 'each keyed by its run');
    const lists = () => lines().map((b) => byClass(b.parent, 'v2-glist').length);
    await app.tap(lines()[1]);
    assert.deepEqual(lines().map((b) => b.attrs['aria-expanded']), ['false', 'true', 'false'], 'only the tapped run\'s line opens');
    assert.deepEqual(lists(), [0, 1, 0], 'and lists its milestones');
    app.module.refresh();
    await app.flush();
    assert.deepEqual(lines().map((b) => b.attrs['aria-expanded']), ['false', 'true', 'false'], 'a refresh keeps it so');
    assert.deepEqual(lists(), [0, 1, 0]);
  } finally {
    app.restore();
  }
});

/**
 * `mix` with both of its made-up project's "Build-i1" runs holding a sprint "Not tied to a milestone" (NOT real records): a
 * made-up step sending P-002 to its Build stage 260 minutes before the clock, so its run 1 has a time, and two made-up
 * merged pull requests, #901 (250 minutes before, in run 1) and #902 (5 minutes before, in P-003's run 3).
 */
function sharedUntied() {
  const st = mixState();
  const a = st.repos[MIX_PROJECT];
  const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
  const line = { item: 'P-002', action: 'dispatch', role: 'builder', route: 'ready-dispatch', stage: 5, time: iso(NOW - 260 * 60e3), trigger: 'step', gate: null };
  a.commit({ 'dispatch-log/2026-10.jsonl': `${a.files['dispatch-log/2026-10.jsonl'].trimEnd()}\n${JSON.stringify(line)}\n` });
  a.pullsAnswer = answerOf([node(901, { mergedAt: iso(NOW - 250 * 60e3) }), node(902, { mergedAt: iso(NOW - 5 * 60e3) })]);
  return st;
}

test('AC60, AC84 and AC83 (G6\'s review, round 1, outside G6\'s row, older than G6): runs that share a key keep their folds apart — on the Timeline, both "Build-i1" runs\' "Not tied to a milestone" (made up, NOT real records) open on their own and stay so on a refresh; on the page, the runs\' heads and earlier-run containers keyed by run', async () => {
  const app = await openPage(sharedUntied(), `#/p/${MIX_PROJECT}/timeline`);
  try {
    const folds = () => findAll(app.view, (e) => e.tag === 'button' && e.dataset && /^fold:sprints:Build-i1:untied:run\d+$/.test(e.dataset.k || ''));
    assert.deepEqual(folds().map((b) => b.dataset.k), ['fold:sprints:Build-i1:untied:run3', 'fold:sprints:Build-i1:untied:run1'], 'one fold each, keyed by its run');
    const state = () => folds().map((b) => b.attrs['aria-expanded']);
    const opened = () => folds().map((b) => byClass(b.parent, 'v2-sp').map((x) => x.attrs['data-sprint']).join());
    await app.tap(folds()[1]);
    assert.deepEqual(state(), ['false', 'true'], 'only the tapped run\'s fold opens');
    assert.deepEqual(opened(), ['', 'PR #901'], 'and only its sprint is drawn');
    app.module.refresh();
    await app.flush();
    assert.deepEqual(state(), ['false', 'true'], 'a refresh keeps it so');
    await app.tap(folds()[0]);
    assert.deepEqual(opened(), ['PR #902', 'PR #901'], 'the other opens beside it');
    await app.tap(folds()[1]);
    assert.deepEqual(state(), ['true', 'false'], 'folding one leaves the other open');
  } finally {
    app.restore();
  }
  const page = await openPage(mixState(), `#/p/${MIX_PROJECT}`);
  try {
    await page.tap(foldOf(page, 'Build'));
    const open = keyed(page, 'stdl:Build');
    const ks = findAll(open, (e) => e.dataset && /^(runh|old):/.test(e.dataset.k || '')).map((e) => e.dataset.k);
    assert.deepEqual(ks, ['runh:Build-i1:run3', 'runh:Build-i2:run2', 'old:Build-i2:run2', 'runh:Build-i1:run1', 'old:Build-i1:run1'], 'every run\'s head and container its own key');
    assert.equal(new Set(ks).size, ks.length);
  } finally {
    page.restore();
  }
});

// ---------------------------------------------------------------------------
// Skipped, not-needed and "taken on · not recorded by the model" rows kept; R3-b

test('AC92 (d): skipped, not-needed and taken-on rows stay listed, outside the fold — "skipped · why: …", "not needed", "taken on · why: …" in h, and "taken on · not recorded by the model" for one the model can\'t record (class 5 in (c)), outside h', () => {
  const ctx = fake({
    runs: [{ phase: 'Build', iteration: 1, state: 'now', std: { 'Build-1': 'not needed', 'Build-3': 'reached' } }],
    standard: { 'Build-4': { state: 'taken on', why: 'made up' }, 'Build-2': { state: 'taken on' }, 'Build-5': { state: 'skipped', why: 'made up, not needed here' } },
  });
  const r = runView(ctx, 'Build', 1);
  assert.deepEqual(r.std.map((x) => [x.id, x.words]), [
    ['Build-5', 'skipped · why: made up, not needed here'],
    ['Build-4', 'taken on · not recorded by the model · why: made up'],
    ['Build-3', 'reached'],
    ['Build-2', 'taken on'],
    ['Build-1', 'not needed'],
  ], 'Build-4, of NOT_RECORDED_IDS: its why after the words');
  assert.ok(NOT_RECORDED_IDS.has('Build-4') && !NOT_RECORDED_IDS.has('Build-2'));
  assert.equal(r.untracked, null, 'nothing left to fold');
  // Rewritten in G6's fix round (the Definer's narrowing of h): Build-1's recorded "not needed" is outside h, as it is outside k.
  assert.equal(r.h, 2, 'Build-2 (taken on, recordable, now) and Build-3 (reached); not Build-1 (not needed), Build-4 (the model can\'t record it) or Build-5 (skipped, nothing recorded)');
  // The phase line's count agrees: Build-4 is "1 taken on, not recorded by the model".
  assert.match(milestonesByPhase(ctx).lines.find((l) => l.phase === 'Build').detail.standard, /· 1 taken on, not recorded by the model ·/);
});

test('R3-b (the plan review\'s carried risk, round 3), picked: a recordable taken-on row outside h — in a finished phase, or in an earlier run gone back over — reads "taken on · not recorded by the model", as one the model can\'t record does; in its run now or still to come, "taken on"; on `standard` (made up, NOT real) the finished phase\'s rows agree with its line\'s count', async () => {
  // Made up (NOT real): a finished Build, and a Design whose run 1 went back over and run 2 is now.
  const ctx = fake({
    runs: [
      { phase: 'Build', iteration: 1, state: 'finished', std: { 'Build-1': 'reached' } },
      { phase: 'Design', iteration: 1, state: 'gone back over' },
      { phase: 'Design', iteration: 2, state: 'now' },
    ],
    standard: { 'Build-3': { state: 'taken on' }, 'Design-4': { state: 'taken on' } },
  });
  const words = (phase, k, id) => runView(ctx, phase, k).std.find((x) => x.id === id).words;
  assert.equal(words('Build', 1, 'Build-3'), 'taken on · not recorded by the model', 'a finished phase: class 5 in (c), outside h');
  assert.equal(words('Design', 1, 'Design-4'), 'taken on · not recorded by the model', 'an earlier run gone back over: outside its h');
  assert.equal(words('Design', 2, 'Design-4'), 'taken on', 'the run now: in h');
  assert.deepEqual([runView(ctx, 'Design', 1).h, runView(ctx, 'Design', 2).h, runView(ctx, 'Build', 1).h], [0, 1, 1]);
  for (const [phase, k] of [['Build', 1], ['Design', 1]]) assert.ok(!(runView(ctx, phase, k).untracked.rows.some((x) => /taken on/.test(x.words))), `${phase} run ${k}: never folded`);
  // On the page, from `standard`: Discovery, finished, its four recordable taken-on rows with nothing recorded read
  // "taken on · not recorded by the model", as its line counts them; Design's run 1 (gone back over) and run 2 (now).
  const app = await openPage(standardState());
  try {
    await app.tap(foldOf(app, 'Discovery'));
    await app.tap(foldOf(app, 'Design'));
    const disc = rowsIn(keyed(app, 'std:Discovery-i1'));
    const taken = disc.filter((r) => /^taken on/.test(wordsOf(r)));
    assert.deepEqual(taken.map((r) => [byClass(r, 'v2-id')[0].textContent, wordsOf(r)]), ['Discovery-6', 'Discovery-4', 'Discovery-3', 'Discovery-1'].map((id) => [id, `taken on · not recorded by the model · why: made up for the test, ${id}`]));
    const n = Number(/· (\d+) taken on, not recorded by the model/.exec(byClass(foldOf(app, 'Discovery'), 'v2-sdl')[1].textContent)[1]);
    assert.equal(n, taken.length, 'the line\'s count and the rows agree');
    assert.equal(heads(keyed(app, 'stdl:Discovery'))[1], 'Standard checklist · 8 · 4 tracked', 'h leaves them out');
    assert.equal(untrBtn(app, 'Discovery-i1'), null, 'every line written: nothing folded');
    const d = (k, id) => wordsOf(rowsIn(keyed(app, `std:Design-i${k}`)).find((r) => byClass(r, 'v2-id')[0].textContent === id));
    assert.equal(d(2, 'Design-4'), 'taken on · why: made up for the test, Design-4', 'run 2, now: in h');
    assert.equal(d(1, 'Design-4'), 'taken on · not recorded by the model · why: made up for the test, Design-4', 'run 1, gone back over: outside h');
    assert.equal(d(2, 'Design-5'), 'taken on · not recorded by the model · why: made up for the test, Design-5', 'Design-5, of NOT_RECORDED_IDS');
    assert.equal(d(2, 'Design-2'), `skipped · why: made up for the test, Design-2`);
    assert.ok(STANDARD_SKIPPED.includes('Design-2'));
    assert.deepEqual(heads(keyed(app, 'stdl:Design')), ['Your milestones · 3', 'Standard checklist · 6 · 3 tracked', 'Your milestones · 0', 'Standard checklist · 6 · 2 tracked'],
      'run 2: Design-1, Design-4 and Design-6 (taken on, recordable, now); run 1: Design-1 and Design-6, recorded');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The weights

test('AC92 (d): weights — the owner\'s own rows\' names in --t-row (500 13 px); a standard row\'s name in 400 13 px; their colours as AC83 has them (--ink, a soft row --ink2); an earlier run\'s rows smaller (12 px, note 2) with the same weights; in light and dark', async () => {
  const app = await openPage(standardState());
  try {
    for (const ph of ['Design', 'Build', 'Discovery']) await app.tap(foldOf(app, ph));
    const name = (k, id) => byClass(findAll(keyed(app, k), (e) => e.attrs && e.attrs['data-ms'] === id)[0], 'v2-smn')[0];
    for (const [theme, ink, ink2] of THEMES) {
      const L = looks(app, theme);
      const at = (el) => [L.get(el).size, L.get(el).weight, L.get(el).color];
      assert.deepEqual(at(name('own:Design-i2', 'MD1')), ['13px', '500', ink], `${theme}: an own row, work filed`);
      assert.deepEqual(at(name('own:Design-i2', 'MD3')), ['13px', '500', ink], `${theme}: an own row, next to reach`);
      const m3a = findAll(keyed(app, 'own:Build-i2'), (e) => e.attrs && e.attrs['data-ms'] === 'M3A')[0];
      assert.deepEqual(at(name('own:Build-i2', 'M3A')), ['13px', '500', /\bsoft\b/.test(m3a.className) ? ink2 : ink], `${theme}: an own row, planned, its colour as AC83 has it`);
      assert.deepEqual(at(name('std:Discovery-i1', 'Discovery-8')), ['13px', '400', ink], `${theme}: a tracked standard row, reached`);
      assert.deepEqual(at(name('std:Design-i2', 'Design-1')), ['13px', '400', ink2], `${theme}: a tracked standard row, taken on (soft, --ink2 as AC83 has it)`);
      assert.deepEqual(at(name('own:Build-i1', 'M1')), ['12px', '500', ink2], `${theme}: an earlier run's own row, smaller, 500`);
      assert.deepEqual(at(name('std:Design-i1', 'Design-6')), ['12px', '400', ink2], `${theme}: an earlier run's standard row, smaller, 400`);
    }
    assert.ok(rowsIn(keyed(app, 'own:Design-i2')).every((r) => /\bown\b/.test(r.className)) && rowsIn(keyed(app, 'std:Design-i2')).every((r) => /\bstd\b/.test(r.className)));
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The Timeline

test('AC92 (d) and AC84, changed: on the Timeline a standard milestone\'s meta line reads "<id> · standard · <its state words>" ("Design-6 · standard · not reached"), its name 400 13 px, the owner\'s own keeping AC84\'s 500; the gathered line reads "Standard checklist · <n> not recorded for this run ›", a run still to come\'s "Standard checklist · <n> still to come ›"', async () => {
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    const ms = (code) => findAll(app.view, (e) => e.attrs && e.attrs['data-ms'] === code && / v2-ms /.test(` ${e.className} `))[0];
    const meta = (code) => byClass(ms(code), 'v2-msm')[0].textContent;
    assert.equal(meta('Design-6'), 'Design-6 · standard · not reached', 'as AC92 (d) writes it');
    assert.equal(meta('Design-1'), 'Design-1 · standard · reached · gone back over');
    assert.equal(meta('Discovery-8'), 'Discovery-8 · standard · reached');
    assert.equal(meta('M2B'), 'M2B · work filed · gone back over', 'the owner\'s own: no "standard"');
    assert.equal(meta('MD2'), 'MD2 · next to reach');
    const stds = byClass(app.view, 'v2-ms').filter((m) => /^(Discovery|Design|Build|Launch)-\d$/.test(m.attrs['data-ms']));
    assert.ok(stds.length >= 6, `${stds.length} standard milestones drawn`);
    for (const m of stds) {
      assert.match(m.className, /\bstd\b/);
      assert.match(byClass(m, 'v2-msm')[0].textContent, new RegExp(`^${m.attrs['data-ms']} · standard · `));
    }
    for (const m of byClass(app.view, 'v2-ms').filter((x) => /^M/.test(x.attrs['data-ms'] || ''))) assert.doesNotMatch(m.className, /\bstd\b/);
    for (const [theme, ink] of THEMES) {
      const L = looks(app, theme);
      const t = (code) => { const e = byClass(ms(code), 'v2-mstt')[0]; return [L.get(e).size, L.get(e).weight, L.get(e).color]; };
      assert.deepEqual(t('Design-6'), ['13px', '400', ink], `${theme}: a standard milestone's name, 400 13 px`);
      assert.deepEqual(t('M2B'), ['13px', '500', ink], `${theme}: an own milestone's, --t-row as AC84 has it`);
    }
    const g = (key) => keyed(app, `fold:${key}`);
    assert.equal(g('Design-i2:gather:nr:run2').textContent, 'Standard checklist · 6 not recorded for this run');
    assert.equal(byClass(g('Design-i2:gather:nr:run2'), 'vi-chev').length, 1, 'its ›');
    assert.equal(g('Design-i1:gather:nr:run1').textContent, 'Standard checklist · 4 not recorded for this run');
    assert.equal(g('Build-i2:gather:stc:run2').textContent, 'Standard checklist · 5 still to come');
    assert.equal(g('Launch-i1:gather:stc:run2').textContent, 'Standard checklist · 5 still to come');
    assert.doesNotMatch(app.view.textContent, /\d+ standard (Discovery|Design|Build|Launch) milestones?/, 'the old words gone');
    await app.tap(g('Design-i2:gather:nr:run2'));
    assert.match(byClass(keyed(app, 'gather:Design-i2:gather:nr:run2'), 'v2-glist')[0].textContent, /Done defined in real scenarios Design-1 not recorded/, 'still listed in place on a tap (AC59)');
  } finally {
    app.restore();
  }
});
