// AC51, as trial-view notes 2 left it (2026-10-16): the Timeline screen is now AC59 and AC60
// (tests/desk/ac59-60-timeline.test.mjs). The tests for what those replace (one run on screen, the
// phase strip and run switch, newest at the top, steps on the line, milestone capsules, the
// standard milestones box) went with it; what stays of AC51 is its link rule, and the project
// screens' bottom bar above everything on them.
// ac-test: S-001/AC51
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CONFIG, SRC } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, linksIn, j11Files, treePaths, SD3 } from './sandbox-helpers.mjs';
import { NOW } from './sandbox-fixtures.mjs';
import { pullsAnswer } from './j12-fixture.mjs';

test('AC51\'s link rule on the rebuilt Timeline: every link is a path the tree holds, a pull request (or its commits), a merge commit, or an item\'s history; none is guessed', async () => {
  const r = repo(j11Files());
  r.pullsAnswer = pullsAnswer();
  const app = await loadSandbox({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': r }, hash: '#/p/Service-Desk/timeline', now: NOW });
  try {
    await app.advance(1000);
    // Every fold open, so every sprint's links are drawn.
    for (let i = 0; i < 6; i++) {
      const folds = [];
      const walk = (n) => { for (const c of n.children || []) { if (c.tag === 'button' && c.attrs['aria-expanded'] === 'false' && /sb-fold/.test(c.className)) folds.push(c); walk(c); } };
      walk(app.view);
      if (!folds.length) break;
      for (const f of folds) { f.click(); await app.flush(); }
    }
    const tree = new Set(treePaths());
    const base = 'https://github.com/shumpmaster/Service-Desk';
    const links = linksIn(app.view).map((l) => l.href).filter((h) => h && !h.startsWith('#/'));
    assert.ok(links.length > 40, `${links.length} links`);
    for (const h of links) {
      if (h.startsWith(`${base}/blob/main/`)) assert.ok(tree.has(decodeURIComponent(h.slice(`${base}/blob/main/`.length))), `${h}: a path the tree holds`);
      else assert.match(h, new RegExp(`^${base}/(pull/\\d+(/commits)?|commit/[0-9a-f]{40}|commits/[0-9a-f]{40})$`), h);
    }
  } finally {
    app.restore();
  }
});

test('AC51 + AC48 + AC81 (build review B2; 2026-10-16, no band on Home; from stage 1a the bar Home · Waiting · Plan at every screen\'s foot): the bar sits above every band, tile and control of the screens, and below a sheet and its scrim (the CSS; the browser\'s elementFromPoint check is in the pull request)', () => {
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const z = (sel) => {
    const m = new RegExp(`(?:^|\\n)${sel.replace(/\./g, '\\.')} \\{([^}]*)\\}`).exec(css);
    assert.ok(m, `${sel} is in the CSS`);
    const v = /z-index:\s*(-?\d+)/.exec(m[1]);
    assert.ok(v, `${sel} has a z-index of its own`);
    return Number(v[1]);
  };
  // AC81 (stage 1a): the project screens' own bar is gone; the one bar is Home · Waiting · Plan.
  assert.doesNotMatch(css, /\.sb-dock\b/, 'no `.sb-dock` rule');
  const bars = { '.v2-bar': z('.v2-bar') };
  // AC48 (2026-10-16): Home has no bottom band, so there is no `.sb-band` to stack.
  assert.doesNotMatch(css, /\.sb-band\b/, 'no `.sb-band` rule');
  const overlays = { '.sb-scrim': z('.sb-scrim'), '.sb-sheet': z('.sb-sheet'), '.v2-scrim': z('.v2-scrim'), '.v2-sheet': z('.v2-sheet') };
  // Every other rule with a z-index is something on the screens (a band, a drawing, a card's control), the bubble aside.
  const others = [...css.matchAll(/([^{}]+)\{([^}]*z-index:\s*(-?\d+)[^}]*)\}/g)]
    .map((m) => [m[1].trim(), Number(m[3])])
    .filter(([sel]) => !['.v2-bar', '.sb-scrim', '.sb-sheet', '.v2-scrim', '.v2-sheet', '.sb-bubble', '.sb-sheet-top'].some((s) => sel.split(/\s*,\s*/).includes(s)) && !sel.startsWith('.sb-sheet') && !sel.startsWith('.v2-sheet'));
  assert.ok(others.some(([sel]) => /v2-card\.lifted/.test(sel)), 'and the board\'s lifted card (AC80)');
  assert.ok(others.some(([sel]) => /sb-pband/.test(sel)), 'the Timeline\'s pinned band is among them');
  assert.ok(others.some(([sel]) => /sb-rail/.test(sel)), 'and the branch drawing');
  for (const [bar, zb] of Object.entries(bars)) {
    for (const [sel, zo] of others) assert.ok(zb > zo, `${bar} (${zb}) above ${sel} (${zo})`);
    for (const [sel, zo] of Object.entries(overlays)) assert.ok(zb < zo, `${bar} (${zb}) below ${sel} (${zo})`);
  }
});
