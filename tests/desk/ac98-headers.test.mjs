// ac-test: S-001/AC98 — the headers sized up across the desk (stage HD1; the owner's "Can you appropriately size up all of the
// text that serves as headers across the entire desk?", the approved header picture with the owner's answers B, A and A):
// each role in AC98's table, by selector, its computed size, weight and colour in light and dark (forced, as the walks read
// it), at 360 and 414 px, on every screen and sheet the fixtures draw (Home with "Since you last looked" and with it off;
// Waiting with questions and none, the strip with cards and none, one project shown and every one; a project's page with its
// phases opened and the v2.5 one's "Not used by this project"; Plan and a milestone's sheet; the Timeline's goal labels; Team,
// a member's page and its sheets; the Details views; every v2 sheet); each head's words --ink and the counts, mono notes and
// "Mark as seen" beside them keeping their own looks; the kept-small roles unchanged, each measured; the tokens unchanged;
// the two headings split at their first " · " ("Since you last looked · <time>" with the time in Plex Mono 400 12 px, "· in
// the last 7 days" and "Milestones by phase · <count>" in Plex Sans), the words unchanged and in the one `h2`, their rows
// letting the control beside them move under them (one line at 360 px is measured in Chromium by
// tests/desk/tools/hd1-shots.mjs, which fails a heading on two lines; the fake DOM lays out no text); the gate sheet's title
// at 20 px still held to two lines. The page is the sandbox's own code under the fake DOM, on the suite's fixtures (each
// labelled in tests/desk/fixtures/README.md; HD1's own made-up "last looked" in tests/desk/hd1-fixtures.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, findAll, byClass, openIdle } from './sandbox-helpers.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { textSetup } from './screen-text.mjs';
import { NOW } from './sandbox-fixtures.mjs';
import { memStore, waSetup, WORKED } from './wa-fixtures.mjs';
import { openSD, openFolds } from './tv2-fixtures.mjs';
import { mixState, quietState, gatesState, GATE_KEY, GATE4, MIX_PROJECT } from './glance-fixtures.mjs';
import { busiestState } from './qw1-fixtures.mjs';
import { stripState } from './qw2-fixtures.mjs';
import { vt1State, DAY5, windowCards, chi } from './vt1-fixtures.mjs';
import { hd1Open, openPhases, lookedAt, noneTrackedState, H } from './hd1-fixtures.mjs';
import { PF_ROWS } from '../../src/public/lib/portfolio.js';
import { POLL_MS } from '../../src/lib/scheduler.js';

const CSS_TEXT = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
const rulesOf = (sandboxCss) => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(sandboxCss, 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
};
const RULES = rulesOf(CSS_TEXT);
/** The stylesheet before HD1 (src/public/sandbox.css at 2c20c9a, kept as tests/desk/fixtures/hd1/sandbox-2c20c9a.css), for the kept-small roles. */
const BASE_RULES = rulesOf(readFileSync(join(SRC, '..', 'tests', 'desk', 'fixtures', 'hd1', 'sandbox-2c20c9a.css'), 'utf8'));
const plain = (v) => String(v || '').replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');
const INK = { light: { ink: '#18191c', ink2: '#5c5f66' }, dark: { ink: '#ecedef', ink2: '#a2a5ac' } };
const THEMES = ['light', 'dark'];
const WIDTHS = [360, 414];
function looks(app, theme, width, rules = RULES) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), rules, { scheme: 'light', width, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) {
    if (!n.el) continue;
    out.set(n.el, { colour: plain(n.style.get('color')), size: plain(n.style.get('font-size')), weight: plain(n.style.get('font-weight')),
      family: plain(n.style.get('font-family')), decl: (p) => plain(n.declared.get(p)) });
  }
  return out;
}
const has = (el, c) => ` ${el.className || ''} `.includes(` ${c} `);
const up = (el, c) => { for (let a = el.parent; a; a = a.parent) if (has(a, c)) return true; return false; };

/**
 * AC98's roles, each a test of an element and its look: [name, is(el), size, weight, colour ('ink' | 'ink2' | null: its own),
 * mono, kept]. The section and sheet-block heads, the sub-heads, the group heads and the empty line as AC98's table has them;
 * the titles the owner's; and the kept-small roles (`kept`) exactly as the stylesheet before HD1 draws them, and at the size
 * and weight given where one is.
 */
const ROLES = [
  ['a screen\'s title (.v2-title)', (e) => e.tag === 'h1' && has(e, 'v2-title'), '28px', '600', 'ink'],
  ['an older screen\'s title (.sb-hdr h1)', (e) => e.tag === 'h1' && up(e, 'sb-hdr'), '28px', '600', 'ink'],
  ['a sheet\'s title (.v2-stitle)', (e) => has(e, 'v2-stitle'), '20px', '600', 'ink'],
  ['a Team sheet\'s title (.sb-sheet-t)', (e) => has(e, 'sb-sheet-t'), '20px', '600', 'ink'],
  ['a section head\'s words (.v2-shw)', (e) => has(e, 'v2-shw') && !has(e, 'v2-plhw'), '15px', '600', 'ink'],
  ['a Plan group\'s name (.v2-plhw > span)', (e) => e.tag === 'span' && e.parent && has(e.parent, 'v2-plhw') && !e.className, '15px', '600', 'ink'],
  ['a Home group\'s name (.v2-hgt)', (e) => has(e, 'v2-hgt'), '15px', '600', 'ink'],
  ['"More detail" (.v2-mds)', (e) => e.tag === 'span' && e.parent && has(e.parent, 'v2-mds'), '15px', '600', 'ink'],
  ['Waiting\'s section head (.v2-kh)', (e) => has(e, 'v2-kh'), '15px', '600', 'ink'],
  ['a sheet\'s block head (.v2-bh)', (e) => has(e, 'v2-bh'), '15px', '600', 'ink'],
  ['a target\'s head (.v2-vth)', (e) => has(e, 'v2-vth'), '15px', '600', 'ink'],
  ['an older screen\'s section head (.sb-h2)', (e) => has(e, 'sb-h2'), '15px', '600', 'ink'],
  ['a Team sheet\'s block head (.sb-sec h3)', (e) => e.tag === 'h3' && e.parent && has(e.parent, 'sb-sec'), '15px', '600', 'ink'],
  ['a lane\'s head (.v2-lh)', (e) => has(e, 'v2-lh'), '13px', '600', 'ink'],
  ['a group\'s name (.v2-gn)', (e) => has(e, 'v2-gn'), '13px', '600', 'ink'],
  ['a run\'s head (.v2-runh)', (e) => has(e, 'v2-runh'), '13px', '600', 'ink'],
  ['a goal\'s label (.v2-goal .v2-label)', (e) => has(e, 'v2-label') && up(e, 'v2-goal'), '13px', '600', 'ink2'],
  ['Plan\'s card label (.v2-plcard > .v2-label)', (e) => has(e, 'v2-label') && e.parent && has(e.parent, 'v2-plcard'), '13px', '600', 'ink2'],
  ['"More detail"\'s sub-head (.sb-h3)', (e) => has(e, 'sb-h3') && (up(e, 'v2-home') || up(e, 'v2-proj')), '13px', '600', 'ink'],
  ['an opened phase\'s group head (.v2-subh)', (e) => has(e, 'v2-subh'), '12px', '600', 'ink'],
  ['an empty section\'s line (.v2-kq)', (e) => has(e, 'v2-kq'), '13px', '500', 'ink2'],
  ['a heading\'s small part (.v2-htail)', (e) => has(e, 'v2-htail'), '12px', '400', 'ink2'],
  ['a heading\'s time (.v2-htime)', (e) => has(e, 'v2-htime'), '12px', '400', 'ink2', true],
  // Kept small, on purpose (AC98's list): each as it was before HD1, measured against the stylesheet at 2c20c9a; and AC97's
  // figure and the briefing's count, the tokens' 24 and 18 px, by their sizes too.
  ['kept: the Timeline\'s band (.v2-tpn)', (e) => has(e, 'v2-tpn'), '12px', '600', 'ink', false, true],
  ['kept: the Timeline\'s compact title (.v2-tn)', (e) => has(e, 'v2-tn'), '15px', '600', null, false, true],
  ['kept: Technical, Context and Why (.v2-bn)', (e) => has(e, 'v2-bn'), '11px', '500', 'ink2', false, true],
  ['kept: a card\'s kind label (.v2-kd)', (e) => has(e, 'v2-kd'), null, null, null, false, true],
  ['kept: a board button (.v2-step)', (e) => has(e, 'v2-step'), null, null, null, false, true],
  ['kept: a fold (.v2-fold)', (e) => has(e, 'v2-fold'), null, null, null, false, true],
  ['kept: a field label (.v2-field > .v2-label)', (e) => has(e, 'v2-label') && e.parent && has(e.parent, 'v2-field'), null, null, null, false, true],
  ['kept: a tab (.v2-tab)', (e) => has(e, 'v2-tab'), null, null, null, false, true],
  ['kept: the Now line (.v2-nowl)', (e) => has(e, 'v2-nowl'), null, null, null, false, true],
  ['kept: Team\'s eyebrow (.sb-eyebrow)', (e) => has(e, 'sb-eyebrow') && up(e, 'sb-hdr'), null, null, null, false, true],
  ['kept: a tile\'s name (.v2-tnm)', (e) => has(e, 'v2-tnm'), '13px', '600', null, false, true],
  ['kept: a phase row\'s name (.v2-sn)', (e) => has(e, 'v2-sn'), '13px', '500', null, false, true],
  ['kept: AC97\'s figure (.v2-vbig)', (e) => has(e, 'v2-vbig'), '24px', '600', 'ink', false, true],
  ['kept: the briefing\'s count (.v2-brief.k-you .v2-bt1)', (e) => has(e, 'v2-bt1') && e.parent && has(e.parent, 'k-you'), '18px', '600', 'ink', false, true],
];

/** Every role's elements on the screen, in both themes at both widths: each as its role says. Returns the roles met. */
function checkRoles(app, where, met, fails) {
  const els = findAll(app.view, () => true);
  const hits = [];
  for (const role of ROLES) for (const e of els) if (role[1](e)) hits.push([role, e]);
  if (!hits.length) return;
  const kept = hits.some(([role]) => role[6]);
  for (const theme of THEMES) {
    for (const w of WIDTHS) {
      const L = looks(app, theme, w);
      const B = kept ? looks(app, theme, w, BASE_RULES) : null;
      for (const [[name, , size, weight, colour, mono, isKept], e] of hits) {
        const l = L.get(e);
        if (!l) continue;
        met.add(name);
        const at = `${where} · ${theme} ${w} · ${name} "${(e.textContent || '').slice(0, 30)}"`;
        if (isKept) {
          const b = B.get(e);
          const look = (x) => [x.size, x.weight, x.colour, x.family];
          if (JSON.stringify(look(l)) !== JSON.stringify(look(b))) fails.add(`${at}: ${JSON.stringify(look(l))}, before HD1 ${JSON.stringify(look(b))}`);
          if (size && (l.size !== size || l.weight !== weight)) fails.add(`${at}: ${l.size} ${l.weight}, not ${size} ${weight}`);
          if (colour && l.colour !== INK[theme][colour]) fails.add(`${at}: ${l.colour}`);
          continue;
        }
        const got = [l.size, l.weight, colour ? l.colour : '-', mono ? /Plex Mono/.test(l.family) : !/Plex Mono/.test(l.family)];
        const want = [size, weight, colour ? INK[theme][colour] : '-', true];
        if (JSON.stringify(got) !== JSON.stringify(want)) fails.add(`${at}: ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`);
      }
    }
  }
}
const hrefsIn = (app, re) => [...new Set(findAll(app.view, (e) => e.tag === 'a' && re.test(e.attrs.href || '')).map((a) => a.attrs.href))];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Every screen and sheet of the page's projects, as the stage-8 walk visits them (ac88-dark.test.mjs, everyScreen). */
async function everyScreen(app, projects, where, met, fails) {
  const visit = async (hash, prepare = null) => {
    await app.go('#/');
    await app.go(hash);
    if (prepare) await prepare(app);
    checkRoles(app, `${where} ${hash}`, met, fails);
  };
  await visit('#/');
  await visit('#/since');
  for (const r of PF_ROWS) await visit(`#/pf/${r}`);
  await visit('#/waiting');
  for (const h of hrefsIn(app, /^#\/waiting\/card\//)) await visit(h);
  await visit('#/work');
  for (const h of hrefsIn(app, /^#\/work\/ms\//).slice(0, 2)) await visit(h);
  for (const p of projects) {
    const base = `#/p/${encodeURIComponent(p.name)}`;
    await visit(base, openPhases);
    await visit(`#/waiting/${encodeURIComponent(p.name)}`);
    if (p.model === 'v3') for (const s of ['info', 'values', 'experiments', 'timeline', 'notes']) await visit(`${base}/${s}`);
    else await visit(`${base}/pipeline`);
    for (const s of ['asked', 'agents', 'team']) await visit(`${base}/${s}`);
    await app.go(`${base}/team`);
    await openIdle(app);
    for (const m of hrefsIn(app, new RegExp(`^${esc(base)}/team/[^/]+$`)).slice(0, 2)) {
      await visit(m);
      for (const s of hrefsIn(app, new RegExp(`^${esc(m)}/(now(/[^/]+)?|e/\\d+)$`)).slice(0, 2)) await visit(s);
    }
  }
}

test('AC98: each header role, by selector — its computed size, weight and colour in light and dark at 360 and 414 px — on every screen and sheet of the `text` fixture (Service-Desk, a made-up v3 project with one card of each kind, a v2.5 project): titles 28 and 20 px, section and sheet-block heads 600 15 px --ink, sub-heads 600 13 px each in its colour, an opened phase\'s group heads 600 12 px, the kept-small roles as they were', async () => {
  const met = new Set();
  const fails = new Set();
  const t = textSetup();
  const app = await loadSandbox({ ...t, hash: '#/', now: NOW, store: lookedAt(NOW - 20 * H) });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await everyScreen(app, t.config.projects, 'text', met, fails);
  } finally {
    app.restore();
  }
  assert.deepEqual([...fails], []);
  // The rest are met on the next test's screens (the briefing's count, AC97's figure, Waiting's empty line, Plan's card,
  // Technical, Context and Why) or are on no screen these fixtures draw.
  for (const name of ROLES.map((r) => r[0]).filter((n) => !/briefing|figure|\.v2-kq|\.v2-tpn|Team sheet's title|sb-sec h3|\.v2-tab|\.v2-label\)$|\.v2-bn|plcard/.test(n))) {
    assert.ok(met.has(name), `${name}: met on a screen (not met: ${ROLES.map((r) => r[0]).filter((n) => !met.has(n)).join('; ')})`);
  }
});

test('AC98: Home with "Since you last looked" and with it off, Waiting with questions and with none, the strip with cards and with none, one project shown and every one, the gate\'s and the targets\' sheets — each role as AC98 sizes it, the kept-small roles as they were, at 360 and 414 px in both themes', async () => {
  const met = new Set();
  const fails = new Set();
  const visitAll = async (app, where, hashes) => {
    for (const h of hashes) {
      await app.go(h);
      checkRoles(app, `${where} ${h}`, met, fails);
    }
  };
  // Home with the markers on (a time), and off (nothing kept on the device).
  let app = await hd1Open();
  try {
    await visitAll(app, 'mix', ['#/', '#/waiting', `#/waiting/${MIX_PROJECT}`, '#/work']);
  } finally {
    app.restore();
  }
  app = await loadSandbox({ ...mixState(), hash: '#/', now: NOW, store: null });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.ok(findAll(app.view, (e) => e.dataset && e.dataset.k === 'since-off').length, 'the markers off');
    await visitAll(app, 'mix, markers off', ['#/']);
  } finally {
    app.restore();
  }
  // Waiting with nothing in the section and nothing kicked back.
  app = await loadSandbox({ ...quietState(), hash: '#/waiting', now: NOW, store: memStore() });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.ok(byClass(app.view, 'v2-kq').length >= 2, '"Questions for you · none" and "Kicked back · none"');
    await visitAll(app, 'quiet', ['#/waiting']);
  } finally {
    app.restore();
  }
  // The busiest section, a kicked-back question in it.
  const b = busiestState();
  app = await loadSandbox({ ...b, hash: '#/waiting', now: NOW, store: b.store() });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.ok(byClass(app.view, 'v2-kh').length >= 1, 'the section\'s head with questions');
    await visitAll(app, 'busiest', ['#/waiting']);
  } finally {
    app.restore();
  }
  // The strip with cards (qw2-fixtures.mjs's strip state).
  const st = stripState();
  app = await loadSandbox({ ...st, hash: '#/waiting', now: NOW, store: lookedAt(NOW - 5 * H, st.seed) });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.equal(byClass(findAll(app.view, (e) => e.dataset && e.dataset.k === 'lane:kick')[0], 'v2-kh').length, 1, 'the strip\'s head with cards');
    await visitAll(app, 'strip', ['#/waiting']);
  } finally {
    app.restore();
  }
  // A gate's sheet, and the targets' sheet with its figures.
  app = await loadSandbox({ ...gatesState(), hash: `#/waiting/card/${encodeURIComponent(GATE_KEY(MIX_PROJECT, GATE4))}`, now: NOW, store: memStore() });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await visitAll(app, 'gates', [`#/waiting/card/${encodeURIComponent(GATE_KEY(MIX_PROJECT, GATE4))}`]);
  } finally {
    app.restore();
  }
  // The Timeline with its sprints' folds opened (Technical, Context and Why), on the tv2 fixture's Service-Desk records.
  app = await openSD('#/p/Service-Desk/timeline');
  try {
    await openFolds(app, 'v2-fold');
    await visitAll(app, 'tv2', ['#/p/Service-Desk/timeline']);
  } finally {
    app.restore();
  }
  // Plan's ordering, its card "Rough finish, in this order" (wa-fixtures.mjs's made-up estimates, NOT real).
  const wa = waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } });
  app = await loadSandbox({ ...wa, hash: '#/work', now: NOW, store: memStore() });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    await app.tap(findAll(app.view, (e) => e.dataset && e.dataset.k === 'plan-order')[0]);
    await visitAll(app, 'plan ordering', []);
    checkRoles(app, 'plan ordering #/work', met, fails);
  } finally {
    app.restore();
  }
  app = await loadSandbox({ ...vt1State({ lines: DAY5, cards: windowCards() }), hash: '#/p/Service-Desk/values', now: chi('2026-12-07', '15:00'), store: memStore() });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    await visitAll(app, 'day 5', ['#/p/Service-Desk/values']);
  } finally {
    app.restore();
  }
  assert.deepEqual([...fails], []);
  for (const name of ['an empty section\'s line (.v2-kq)', 'Waiting\'s section head (.v2-kh)', 'a heading\'s small part (.v2-htail)', 'a heading\'s time (.v2-htime)',
    'kept: AC97\'s figure (.v2-vbig)', 'kept: the briefing\'s count (.v2-brief.k-you .v2-bt1)', 'a target\'s head (.v2-vth)', 'a sheet\'s title (.v2-stitle)',
    'kept: Technical, Context and Why (.v2-bn)', 'kept: the Timeline\'s band (.v2-tpn)', 'Plan\'s card label (.v2-plcard > .v2-label)']) {
    assert.ok(met.has(name), `${name}: met`);
  }
});

test('AC98, "Two headings on one line": "Since you last looked · <time>" and "Milestones by phase · <count>" split at their first " · " in the one h2 — the words before it the head\'s, " · " and the rest in --t-small --ink2, a clock time in Plex Mono 400 12 px ("yesterday, 14:00", "11 Oct, 10:00", today\'s "08:00"), "in the last 7 days", the counts and "none tracked yet" in Plex Sans — the words unchanged; their rows letting the control beside them go under them', async () => {
  const check = async (app, k, want) => {
    const row = findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0];
    assert.ok(row && has(row, 'v2-shsplit'), `${k}: its row lets its control move under it`);
    const h2 = row.children[0];
    assert.equal(h2.tag, 'h2');
    assert.equal(h2.textContent, want.words, `${k}: the words unchanged, in the one h2, read whole`);
    const [lead, tail] = h2.children;
    assert.equal(lead.nodeType, 3);
    assert.equal(lead.textContent, want.words.split(' · ')[0]);
    assert.ok(has(tail, 'v2-htail'));
    const time = byClass(tail, 'v2-htime')[0] || null;
    assert.equal(Boolean(time), want.mono, `${k}: ${want.mono ? 'a time, in Plex Mono' : 'words or a count, in Plex Sans'}`);
    for (const theme of THEMES) {
      for (const w of WIDTHS) {
        const L = looks(app, theme, w);
        const h = L.get(h2);
        assert.deepEqual([h.size, h.weight, h.colour], ['15px', '600', INK[theme].ink], `${k}, ${theme} ${w}: the head's words`);
        const t = L.get(tail);
        assert.deepEqual([t.size, t.weight, t.colour, /Plex Sans/.test(t.family)], ['12px', '400', INK[theme].ink2, true], `${k}, ${theme} ${w}: " · " and the rest, --t-small --ink2`);
        if (time) {
          const m = L.get(time);
          assert.deepEqual([m.size, m.weight, m.colour, /Plex Mono/.test(m.family)], ['12px', '400', INK[theme].ink2, true], `${k}, ${theme} ${w}: the time in Plex Mono 400 12 px`);
          assert.equal(L.get(time).decl('font').replace(/ "IBM Plex Mono".*$/, ''), '400 12px/1.4', 'its pair, 400 12px/1.4');
        }
        assert.deepEqual([L.get(row).decl('flex-wrap'), L.get(row.children.at(-1)).decl('margin-left')], ['wrap', 'auto'], `${k}, ${theme} ${w}: the control under the heading where both don't fit, at its right`);
        // HD1's review, round 2, B2: what the suite can check without layout — the row and its control in the flow, so the
        // control can only sit beside the heading or wrap under it, never laid over it (positioned, moved or transformed);
        // where it sits is measured in Chromium by tools/hd1-shots.mjs.
        for (const [what, el] of [['the row', row], ['its heading', h2], ['its control', row.children.at(-1)]]) {
          const d = L.get(el);
          assert.deepEqual(['position', 'top', 'right', 'bottom', 'left', 'inset', 'transform', 'translate', 'float', 'margin-top'].map((x) => d.decl(x)).filter(Boolean), [],
            `${k}, ${theme} ${w}: ${what} in the flow, nothing moving it`);
        }
        assert.equal(L.get(row).decl('display'), 'flex', `${k}, ${theme} ${w}: the row a flex line`);
      }
    }
    const ctl = row.children.at(-1);
    assert.equal(ctl.textContent, want.control, `${k}: its control keeps its own words`);
    const L = looks(app, 'light', 360);
    assert.deepEqual([L.get(ctl).size, L.get(ctl).weight], want.controlLook, `${k}: and its own look`);
  };
  let app = await hd1Open();
  try {
    const words = findAll(app.view, (e) => e.dataset && e.dataset.k === 'since-h')[0].children[0].textContent;
    assert.match(words, /^Since you last looked · yesterday, \d\d:\d\d$/);
    await check(app, 'since-h', { words, mono: true, control: 'Mark as seen', controlLook: ['11px', '500'] });
    await app.go('#/p/Service-Desk');
    const ms = findAll(app.view, (e) => e.dataset && e.dataset.k === 'ms-h')[0].children[0].textContent;
    assert.match(ms, /^Milestones by phase · \d+ of \d+ reached$/);
    await check(app, 'ms-h', { words: ms, mono: false, control: '↑ start at the foot', controlLook: ['11px', '400'] });
  } finally {
    app.restore();
  }
  app = await hd1Open({ ago: 9 * 24 * H });
  try {
    await check(app, 'since-h', { words: 'Since you last looked · in the last 7 days', mono: false, control: 'Mark as seen', controlLook: ['11px', '500'] });
  } finally {
    app.restore();
  }
  // HD1's review, round 1, B1: every form HD1's row lists. A time with its date ("· 11 Oct, 10:00", as "· 18 Oct, 04:00"), in
  // Plex Mono with its date; today's time alone ("· 08:00"), in Plex Mono (it fits beside "Mark as seen" at 360 px, measured in
  // Chromium by tools/hd1-shots.mjs); a second count ("· 5 of 15 reached", as "· 12 of 15 reached"); and "· none tracked yet",
  // words and no count, in Plex Sans.
  app = await hd1Open({ ago: 3 * 24 * H });
  try {
    const words = findAll(app.view, (e) => e.dataset && e.dataset.k === 'since-h')[0].children[0].textContent;
    assert.match(words, /^Since you last looked · \d{1,2} [A-Z][a-z]{2}, \d\d:\d\d$/, 'a time with its date');
    await check(app, 'since-h', { words, mono: true, control: 'Mark as seen', controlLook: ['11px', '500'] });
    assert.match(byClass(findAll(app.view, (e) => e.dataset && e.dataset.k === 'since-h')[0], 'v2-htime')[0].textContent, /^\d{1,2} [A-Z][a-z]{2}, \d\d:\d\d$/, 'its date in the Mono part with its time');
  } finally {
    app.restore();
  }
  app = await hd1Open({ ago: 2 * H });
  try {
    const words = findAll(app.view, (e) => e.dataset && e.dataset.k === 'since-h')[0].children[0].textContent;
    assert.match(words, /^Since you last looked · \d\d:\d\d$/, 'today\'s time alone');
    await check(app, 'since-h', { words, mono: true, control: 'Mark as seen', controlLook: ['11px', '500'] });
  } finally {
    app.restore();
  }
  app = await loadSandbox({ ...textSetup(), hash: '#/p/Service-Desk', now: NOW, store: memStore() });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const ms = findAll(app.view, (e) => e.dataset && e.dataset.k === 'ms-h')[0].children[0].textContent;
    assert.equal(ms, 'Milestones by phase · 5 of 15 reached');
    await check(app, 'ms-h', { words: ms, mono: false, control: '↑ start at the foot', controlLook: ['11px', '400'] });
  } finally {
    app.restore();
  }
  app = await loadSandbox({ ...noneTrackedState(), hash: '#/p/Alpha', now: NOW, store: memStore() });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await check(app, 'ms-h', { words: 'Milestones by phase · none tracked yet', mono: false, control: '↑ start at the foot', controlLook: ['11px', '400'] });
  } finally {
    app.restore();
  }
  // With the markers off, the heading has no " · ": no split, no small part.
  app = await loadSandbox({ ...mixState(), hash: '#/', now: NOW, store: null });
  try {
    await app.advance(1000);
    const h2 = findAll(app.view, (e) => e.dataset && e.dataset.k === 'since-h')[0].children[0];
    assert.equal(h2.textContent, 'Since you last looked');
    assert.equal(byClass(h2, 'v2-htail').length, 0);
  } finally {
    app.restore();
  }
});

test('AC98: the gate sheet\'s title at 600 20 px still held to two lines (calc(2 * 1.3em)), in light and dark at 360 and 414 px; the tokens\' values unchanged; every new rule in mockup v2\'s block', async () => {
  const app = await loadSandbox({ ...gatesState(), hash: `#/waiting/card/${encodeURIComponent(GATE_KEY(MIX_PROJECT, GATE4))}`, now: NOW, store: memStore() });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const h2 = byClass(byClass(app.view, 'v2-sheet')[0], 'v2-stitle')[0];
    const clip = byClass(h2, 'v2-stt')[0];
    for (const theme of THEMES) {
      for (const w of WIDTHS) {
        const L = looks(app, theme, w);
        assert.deepEqual([L.get(h2).size, L.get(h2).weight], ['20px', '600'], `${theme} ${w}`);
        assert.equal(L.get(clip).decl('max-height'), 'calc(2 * 1.3em)', `${theme} ${w}: two lines of its 1.3 line height`);
        assert.match(L.get(h2).decl('font'), /^600 20px\/1\.3 /, 'the title\'s line height the token\'s, 1.3');
      }
    }
  } finally {
    app.restore();
  }
  const css = CSS_TEXT.replace(/\/\*[\s\S]*?\*\//g, '');
  const tok = Object.fromEntries([...css.slice(css.indexOf('html.sb .v2, html.sb.v2-page {')).matchAll(/(--t-[a-z]+): ([^;]+);/g)].slice(0, 9).map((m) => [m[1], m[2]]));
  assert.deepEqual(tok, {
    '--t-title': '600 24px/1.2 var(--font)', '--t-sheet': '600 18px/1.3 var(--font)', '--t-lead': '400 15px/1.45 var(--font)',
    '--t-row': '500 13px/1.35 var(--font)', '--t-body': '400 13px/1.45 var(--font)', '--t-small': '400 12px/1.4 var(--font)',
    '--t-label': '500 11px/1.35 var(--font)', '--t-mono': '400 11px/1.4 var(--mono)', '--t-input': '400 16px/1.4 var(--font)',
  }, 'the tokens\' values unchanged');
  const v2 = css.indexOf('@font-face');
  for (const sel of ['.v2-title, html.sb.v2-page .sb-hdr h1', '.v2-stitle, html.sb.v2-page .sb-sheet-t', '.v2-subh {', '.v2-kq { font: var(--t-row); }', '.v2-htail', '.v2-htime', '.v2-sh.v2-shsplit']) {
    const at = css.indexOf(sel, v2);
    assert.ok(at > v2, `${sel}: in mockup v2's block`);
  }
});
