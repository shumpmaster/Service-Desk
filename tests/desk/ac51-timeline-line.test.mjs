// AC51, as trial-view notes 12 and 13 changed it (2026-10-15): the Timeline rebuilt to the agreed
// screen 4 — one run on screen, its steps under their milestone and sprint, milestones as bold
// neutral headings, the standard milestones box folded.
// ac-test: S-001/AC51
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CONFIG, SRC } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll, j11Files, j11Snapshot, traceNotes, SD3 } from './sandbox-helpers.mjs';
import { NOW } from './sandbox-fixtures.mjs';
import { j11Records, timelineOf, phaseView, timelineView } from '../../src/lib/sandbox.js';

/** The NOTE lines as placements: run → [{ ms, sprint, time, role, kind }] (a run's own steps under "untagged", its item as the sprint). */
function placements() {
  const out = new Map();
  let run = null;
  let ms = null;
  let sprint = null;
  for (const l of traceNotes()) {
    const ind = /^ */.exec(l)[0].length;
    const t = l.trim();
    if (ind === 0) {
      run = /^([A-Z][a-z]+ i\d+)/.exec(t)[1];
      out.set(run, []);
      ms = null;
    } else if (ind === 2) {
      ms = t === 'untagged' ? 'untagged' : t.split(' ')[0];
      sprint = null;
    } else if (ind === 4 && t.startsWith('sprint ')) sprint = t.slice(7);
    else if (ind === 4) out.get(run).push({ ms: 'untagged', sprint: 'P-001', time: t.split(' ')[1], role: t.startsWith('step ') ? t.split(' ')[2] : '', kind: t.split(' ')[0] });
    else if (ind === 6) out.get(run).push({ ms, sprint, time: t.split(' ')[1], role: t.split(' ')[2], kind: 'step' });
  }
  return out;
}

async function openTimeline(hash = '#/p/Service-Desk/timeline') {
  const app = await loadSandbox({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': repo(j11Files()) }, hash, now: NOW });
  await app.advance(1000);
  return app;
}
const isoZ = (t) => (t ? new Date(t).toISOString().replace(/\.\d+Z$/, 'Z') : t);

test('AC51 (notes 12, 13): it opens on the now run (Design i2); with no now run, on the newest run', async () => {
  const app = await openTimeline();
  try {
    assert.match(app.text(), /Design i2 · now/);
    assert.equal(byClass(app.view, 'sb-run').length, 1, 'one run on screen');
  } finally {
    app.restore();
  }
  const snap = j11Snapshot();
  const j = j11Records(SD3, snap);
  const tl = timelineOf(j);
  const pv = { ...phaseView(SD3, tl, snap.tree, j), nowRun: null };
  const tv = timelineView(SD3, snap.tree, tl, pv, j, null, 'UTC');
  const runs = tl.runs();
  assert.equal(tv.run.label, runs[runs.length - 1].label(), 'no now run: the newest run (C)');
});

test('AC51: one run on screen; the switch moves between a phase\'s runs', async () => {
  const app = await openTimeline();
  try {
    const sw = byClass(byClass(app.view, 'sb-switch')[0], 'sb-chip');
    assert.deepEqual(sw.map((a) => [a.textContent, a.attrs.href]), [['Design i1', '#/p/Service-Desk/timeline/Design-i1'], ['Design i2', '#/p/Service-Desk/timeline/Design-i2']]);
    await app.go(sw[0].attrs.href);
    assert.equal(byClass(app.view, 'sb-run').length, 1);
    assert.equal(byClass(app.view, 'sb-run')[0].children[0].textContent, 'Design i1');
  } finally {
    app.restore();
  }
});

test('AC51: every step sits under the milestone and sprint the fixture\'s NOTE lines place it under; every untagged step under "Not tied to a milestone"', async () => {
  const want = placements();
  const app = await openTimeline();
  try {
    let checked = 0;
    for (const [run, list] of want) {
      await app.go(`#/p/Service-Desk/timeline/${run.replace(' ', '-')}`);
      const rows = findAll(app.view, (e) => e.className.includes('sb-tl-row') && e.className.includes('step'));
      for (const w of list) {
        const hit = rows.find((r) => r.attrs['data-ms'] === w.ms && r.attrs['data-sprint'] === w.sprint && isoZ(r.attrs['data-time']) === w.time
          && (w.kind === 'decision' ? r.className.includes('who-you') : r.attrs['data-role'] === w.role));
        assert.ok(hit, `${run}: ${w.kind} ${w.time} ${w.role} under ${w.ms} / ${w.sprint}`);
        checked++;
      }
      // The order on the line: each step comes after its milestone's heading and its sprint's heading.
      const line = byClass(app.view, 'sb-tl')[0];
      let ms = null;
      let sprint = null;
      for (const li of line.children) {
        if (li.className.includes(' ms')) ms = li;
        if (li.className.includes(' sprint')) {
          sprint = li.attrs['data-sprint'];
          assert.equal(li.attrs['data-ms'], ms && /other/.test(ms.className) ? 'untagged' : li.attrs['data-ms']);
        }
        if (li.className.includes(' step')) assert.equal(li.attrs['data-sprint'], sprint, `${run}: a step under its sprint`);
      }
      const other = findAll(line, (e) => e.className.includes('ms other'));
      if (list.some((w) => w.ms === 'untagged')) assert.match(other[0].textContent, /Not tied to a milestone/);
    }
    assert.equal(checked, [...want.values()].flat().length, `${checked} steps placed`);
    assert.ok(checked > 80);
  } finally {
    app.restore();
  }
});

test('AC51: each milestone row is a heading with its code and state word, a capsule tile, and no colour of its own', async () => {
  const app = await openTimeline();
  try {
    const ms = findAll(app.view, (e) => e.className.includes('sb-tl-row ms') && !e.className.includes('other'));
    assert.deepEqual(ms.map((m) => byClass(m, 'sb-tl-lbl')[0].textContent), ['MD1 · work filed', 'MD3 · no work filed yet', 'MD2 · no work filed yet'], 'under way first, then newest first');
    for (const m of ms) {
      assert.equal(findAll(m, (e) => e.tag === 'h3').length, 1, 'a heading to assistive technology');
      assert.ok(byClass(m, 'sb-tl-tile')[0].className.includes('cap'));
      assert.doesNotMatch(m.className, /who-|g-|you|agent|gold/, 'no colour class');
    }
  } finally {
    app.restore();
  }
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  for (const m of css.matchAll(/([^{}]*\.(?:sb-tl-row\.ms|sb-tl-tile\.cap|sb-tl-h|sb-tl-lbl|sb-tl-msbtn)[^{}]*)\{([^}]*)\}/g)) {
    assert.doesNotMatch(m[2], /var\(--(you|agent|pass|fail|merge|block|gold)/, `${m[1].trim()} uses a colour of the palette`);
  }
});

test('AC51: each step\'s tile is centred on the line (the CSS; the browser\'s measure is in the pull request), and the line is one unbroken element', () => {
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  assert.match(css, /\.sb-tl::before \{ content: ""; position: absolute; left: 19\.5px; width: 1px; top: 18px; bottom: 18px;/, 'one 1 px line, centre at 20 px');
  assert.match(css, /\.sb-tl-row \{[^}]*grid-template-columns: 40px 1fr 28px;/, 'a 40 px icon column (centre 20 px)');
  assert.match(css, /\.sb-tl-tile \{ justify-self: center;/, 'each tile centred in its column');
  assert.match(css, /\.sb-tl-note \{[^}]*grid-template-columns: 40px 1fr;/);
});

test('AC51: the standard milestones box starts folded, opens on a tap and folds on a second', async () => {
  const app = await openTimeline();
  try {
    const box = findAll(app.view, (e) => e.tag === 'details' && /^std:/.test(e.dataset.k || ''))[0];
    assert.ok(!('open' in box.attrs), 'folded');
    assert.match(box.children[0].textContent, /Standard milestones6 not recorded/);
    box.setAttribute('open', ''); // the browser's own toggle on a tap of its summary
    assert.ok('open' in box.attrs);
    box.removeAttribute('open');
    assert.ok(!('open' in box.attrs));
    // A milestone heading's tap opens its detail in place, and a second folds it.
    const btn = findAll(app.view, (e) => /^tlms-btn:/.test(e.dataset.k || ''))[0];
    btn.click();
    await app.flush();
    assert.match(app.text(), /steps? so far.*Pieces of work: Q-013/);
    btn.click();
    await app.flush();
    assert.doesNotMatch(app.text(), /Pieces of work: Q-013/);
  } finally {
    app.restore();
  }
});

test('AC51: no clock time or duration on the line, on any run', async () => {
  const app = await openTimeline();
  try {
    for (const run of placements().keys()) {
      await app.go(`#/p/Service-Desk/timeline/${run.replace(' ', '-')}`);
      const t = byClass(app.view, 'sb-tl')[0].textContent;
      assert.doesNotMatch(t, /\b\d{1,2}:\d{2}\b/, `${run}: a clock time`);
      assert.doesNotMatch(t, /\b\d+ ?(?:min|h|s|d|hours?|minutes?)\b/, `${run}: a duration`);
    }
  } finally {
    app.restore();
  }
});

test('AC51 + AC48 (build review B2; 2026-10-16, no band on Home): the project screens\' bottom bar sits above every tile, capsule and control of the screens, and below a sheet and its scrim (the CSS; the browser\'s elementFromPoint check is in the pull request)', () => {
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const z = (sel) => {
    const m = new RegExp(`(?:^|\\n)${sel.replace(/\./g, '\\.')} \\{([^}]*)\\}`).exec(css);
    assert.ok(m, `${sel} is in the CSS`);
    const v = /z-index:\s*(-?\d+)/.exec(m[1]);
    assert.ok(v, `${sel} has a z-index of its own`);
    return Number(v[1]);
  };
  const bars = { '.sb-dock': z('.sb-dock') };
  // AC48 (2026-10-16): Home has no bottom band, so there is no `.sb-band` to stack.
  assert.doesNotMatch(css, /\.sb-band\b/, 'no `.sb-band` rule');
  const overlays = { '.sb-scrim': z('.sb-scrim'), '.sb-sheet': z('.sb-sheet') };
  // Every other rule with a z-index is something on the screens (a tile, a capsule, a card's control), the bubble aside.
  const others = [...css.matchAll(/([^{}]+)\{([^}]*z-index:\s*(-?\d+)[^}]*)\}/g)]
    .map((m) => [m[1].trim(), Number(m[3])])
    .filter(([sel]) => !['.sb-dock', '.sb-scrim', '.sb-sheet', '.sb-bubble', '.sb-sheet-top'].some((s) => sel.split(/\s*,\s*/).includes(s)) && !sel.startsWith('.sb-sheet'));
  assert.ok(others.some(([sel]) => /sb-tl-tile/.test(sel)), 'the Timeline tile is among them');
  for (const [bar, zb] of Object.entries(bars)) {
    for (const [sel, zo] of others) assert.ok(zb > zo, `${bar} (${zb}) above ${sel} (${zo})`);
    for (const [sel, zo] of Object.entries(overlays)) assert.ok(zb < zo, `${bar} (${zb}) below ${sel} (${zo})`);
  }
});
