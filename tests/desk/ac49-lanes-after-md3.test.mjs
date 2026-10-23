// ac-test: S-001/AC49 — the running log's lanes after MD3 (stage 4 of "After MD3", specs/S-001.md:2326; AC49, changed,
// :3709-3734 and :3780-3787; "Ruling: A — on a running log, lanes open together always look different; lanes from
// different times may share a look, their rows naming them", decisions/questions/P-001-lanes-alike.md): each lane takes the
// first look no lane still open where it starts is using, a fifth open at once taking `--ink` solid; and every row on a
// lane names its lane in words. Made-up logs (lanes-fixtures.mjs, NOT real records) and every fixture's real or made-up log.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG, SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll, openIdle } from './sandbox-helpers.mjs';
import { textSetup } from './screen-text.mjs';
import { NOW, extremes } from './sandbox-fixtures.mjs';
import { SD3, sdRepo } from './tv2-fixtures.mjs';
import { cosLanes, ownerStubs, COS_CASES, LANES_NOW } from './lanes-fixtures.mjs';
import { branchLayout, LANE_LOOKS } from '../../src/lib/sandbox.js';

const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const ROW = 44;
const rowOf = (y, n) => Math.min(n - 1, Math.round((Number(y) - ROW / 2) / ROW));
const overlap = (a, b) => !(a.top > b.bottom + 1 || a.bottom < b.top - 1);

/** The drawn lanes of the log on screen: { id, shade, top, bottom } (rows newest first), read back from the drawing. */
function drawnLanes(app) {
  const branch = byClass(app.view, 'sb-branch')[0];
  if (!branch) return null;
  const n = byClass(branch, 'sb-brow').length;
  return findAll(branch, (e) => e.attrs && e.attrs['data-kind'] === 'lane').map((l) => ({ id: l.attrs['data-lane'], shade: Number(/shade-(\d)/.exec(l.attrs.class)[1]),
    top: rowOf(l.attrs.y1, n), bottom: rowOf(l.attrs.y2, n) }));
}
/** AC49's rule on one log: each lane's look is none of those used by lanes still open where it starts, unless all four are. Returns [failures, most open together]. */
function lookRule(lanes, where) {
  const fails = [];
  let most = 0;
  const order = [...lanes].sort((a, b) => b.bottom - a.bottom || a.top - b.top);
  order.forEach((l, i) => {
    const open = order.slice(0, i).filter((o) => overlap(o, l));
    most = Math.max(most, open.length + 1);
    const busy = new Set(open.map((o) => o.shade));
    if (busy.size < LANE_LOOKS && busy.has(l.shade)) fails.push(`${where}: ${l.id} shares look ${l.shade} with a lane open where it starts`);
    if (busy.size < LANE_LOOKS && l.shade !== [0, 1, 2, 3].find((s) => !busy.has(s))) fails.push(`${where}: ${l.id} takes look ${l.shade}, not the first free`);
    if (busy.size === LANE_LOOKS && l.shade !== 0) fails.push(`${where}: ${l.id}, a fifth open at once, takes look ${l.shade}, not --ink solid`);
  });
  return [fails, most];
}

test('AC49 (after MD3): the looks as a rule — four open together take the four looks in order; a fifth opening while the first is open, after three came and went, never takes the first\'s look; five open together, the fifth takes --ink solid', () => {
  const log = (lanes) => lanes.map((lane) => ({ lane }));
  const shades = (L) => Object.fromEntries(L.lanes.map((l) => [l.id, l.shade]));
  // Newest first. Four open together.
  assert.deepEqual(shades(branchLayout(log(['A', 'B', 'C', 'D', 'D', 'C', 'B', 'A']), () => false)), { A: 0, B: 1, C: 2, D: 3 });
  // A open the whole time; B, C and D one after another; then E while A is still open.
  const fifth = shades(branchLayout(log(['A', 'E', 'E', null, 'D', 'D', null, 'C', 'C', null, 'B', 'B', 'A']), () => false));
  assert.notEqual(fifth.E, fifth.A, 'never the look of a lane still open');
  assert.equal(fifth.A, 0);
  // Five open together.
  const five = shades(branchLayout(log(['A', 'B', 'C', 'D', 'E', 'E', 'D', 'C', 'B', 'A']), () => false));
  assert.deepEqual([five.A, five.B, five.C, five.D], [0, 1, 2, 3]);
  assert.equal(five.E, 0, 'with all four in use, the first look, --ink solid');
  // Lanes from different times may share a look (P-001-lanes-alike.md, A).
  const apart = shades(branchLayout(log(['B', 'B', null, null, 'A', 'A']), () => true));
  assert.equal(apart.A, apart.B);
});

test('AC49 (after MD3): on the made-up logs — four open together drawn in four looks; the fifth lane opening while the first is open drawn in another look; five open, the fifth in --ink solid', async () => {
  const s = cosLanes();
  const app = await loadSandbox({ config: { ...CONFIG, projects: s.projects }, repos: s.repos, hash: '#/', now: LANES_NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    const at = async (name) => {
      await app.go(`#/p/${name}/team/chief-of-staff`);
      const lanes = drawnLanes(app);
      assert.ok(lanes, `${name}: its log drawn`);
      return Object.fromEntries(lanes.map((l) => [l.id.split(' ')[0], l]));
    };
    const four = await at('Lanes-four');
    assert.deepEqual(['four-a', 'four-b', 'four-c', 'four-d'].map((k) => four[k].shade), [0, 1, 2, 3]);
    const fifth = await at('Lanes-fifth');
    assert.ok(overlap(fifth['fifth-a'], fifth['fifth-e']), 'A is still open where E starts');
    assert.notEqual(fifth['fifth-e'].shade, fifth['fifth-a'].shade);
    const five = await at('Lanes-five');
    assert.deepEqual(['five-a', 'five-b', 'five-c', 'five-d', 'five-e'].map((k) => five[k].shade), [0, 1, 2, 3, 0]);
    for (const [name, lanes] of [['four', four], ['fifth', fifth], ['five', five]]) {
      const [fails] = lookRule(Object.values(lanes), name);
      assert.deepEqual(fails, []);
    }
  } finally {
    app.restore();
  }
});

test('AC49 (after MD3): on every fixture\'s log, no two lanes open at the same time share a look while at most four are open; the most open together is reported', async (t) => {
  const setups = [['text', textSetup()], ['md-extremes', extremes()], ['service-desk + J12', { config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } }],
    ['owner stubs (made up)', { config: { ...CONFIG, projects: ownerStubs().projects }, repos: ownerStubs().repos, now: LANES_NOW }],
    ['Chief of Staff lanes (made up)', { config: { ...CONFIG, projects: cosLanes().projects }, repos: cosLanes().repos, now: LANES_NOW }]];
  const fails = [];
  let logs = 0;
  let most = 0;
  let mostReal = 0;
  for (const [label, s] of setups) {
    const app = await loadSandbox({ config: s.config, repos: s.repos, hash: '#/', now: s.now || NOW });
    try {
      await app.advance(1000);
      await app.advance(61_000);
      for (const p of s.config.projects) {
        const base = `#/p/${encodeURIComponent(p.name)}`;
        await app.go(`${base}/team`);
        await openIdle(app);
        const members = [...new Set(findAll(app.view, (e) => e.tag === 'a' && new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/team/[^/]+$`).test(e.attrs.href || '')).map((a) => a.attrs.href))];
        for (const m of members) {
          await app.go(m);
          const lanes = drawnLanes(app);
          if (!lanes) continue;
          logs++;
          const [f, n] = lookRule(lanes, `${label} ${m}`);
          fails.push(...f);
          most = Math.max(most, n);
          if (!/made up/.test(label)) mostReal = Math.max(mostReal, n);
        }
      }
    } finally {
      app.restore();
    }
  }
  t.diagnostic(`${logs} logs; the most lanes open together: ${most} (made-up logs included), ${mostReal} on the fixtures' own logs`);
  assert.ok(logs > 30, `${logs} logs`);
  assert.equal(most, 5, 'the made-up five open at once');
  assert.ok(mostReal <= 3, `the fixtures' own logs hold at most three open together, as measured (${mostReal})`);
  assert.deepEqual(fails, []);
});

test('AC49 (after MD3): the owner\'s made-up log — three lanes, the first filed and joined, the second and third open, each in its stub, on a dashed and a dotted lane', async () => {
  const s = ownerStubs();
  const app = await loadSandbox({ config: { ...CONFIG, projects: s.projects }, repos: s.repos, hash: '#/p/Lanes-owner/team/owner', now: LANES_NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    const lanes = Object.fromEntries(drawnLanes(app).map((l) => [l.id, l]));
    assert.deepEqual(['Q-901', 'Q-902', 'Q-903'].map((k) => lanes[k].shade), [0, 1, 2]);
    const branch = byClass(app.view, 'sb-branch')[0];
    const stubs = findAll(branch, (e) => e.attrs && /\bstub\b/.test(e.attrs.class || ''));
    assert.deepEqual(stubs.map((e) => e.attrs['data-lane']).sort(), ['Q-902', 'Q-903'], 'stubs on lanes 2 and 3 only');
    assert.deepEqual(stubs.map((e) => /shade-(\d)/.exec(e.attrs.class)[1]).sort(), ['1', '2'], 'on the dashed and the dotted look');
  } finally {
    app.restore();
  }
});

test('AC49 (after MD3): every row on a lane names its lane — a pipeline log\'s lane rows begin with their item; on the Chief of Staff\'s log each helper and end row carries " · <its piece\'s doing>", cut at one line, the whole in its summary sheet, and never another piece\'s', async () => {
  // Pipeline logs (the fixtures' Service-Desk researcher's, 11 lanes, among them).
  const sd = await loadSandbox({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() }, hash: '#/p/Service-Desk/team', now: NOW });
  try {
    await sd.advance(1000);
    await sd.advance(61_000);
    await openIdle(sd);
    let rows = 0;
    for (const m of [...new Set(findAll(sd.view, (e) => e.tag === 'a' && /^#\/p\/Service-Desk\/team\/[^/]+$/.test(e.attrs.href || '')).map((a) => a.attrs.href))]) {
      if (/chief-of-staff$/.test(m)) continue;
      await sd.go(m);
      for (const li of byClass(sd.view, 'sb-brow')) {
        const lane = byClass(li, 'sb-brow-lane')[0].textContent;
        if (lane === 'project') continue;
        rows++;
        assert.ok(byClass(li, 'sb-brow-t')[0].textContent.startsWith(lane), `${m}: "${byClass(li, 'sb-brow-t')[0].textContent}" names ${lane}`);
      }
    }
    assert.ok(rows > 40, `${rows} lane rows`);
  } finally {
    sd.restore();
  }
  // The Chief of Staff's log (made up): its pieces' doings.
  const s = cosLanes();
  const app = await loadSandbox({ config: { ...CONFIG, projects: s.projects }, repos: s.repos, hash: '#/p/Lanes-fifth/team/chief-of-staff', now: LANES_NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    const doing = Object.fromEntries(Object.entries(COS_CASES.fifth).map(([id, t]) => [id, JSON.parse(t.split('\n')[0]).doing]));
    const lis = byClass(app.view, 'sb-brow');
    let named = 0;
    for (const li of lis) {
      const lane = byClass(li, 'sb-brow-lane')[0].textContent.split(' ')[0];
      const text = byClass(li, 'sb-brow-t')[0].textContent;
      const of = byClass(li, 'sb-brow-of')[0] || null;
      if (/^Started: /.test(text)) {
        assert.ok(text.includes(doing[lane]), 'a start row names its piece in its words');
        assert.equal(of, null);
        continue;
      }
      named++;
      assert.ok(of, `"${text}" names its piece`);
      assert.equal(of.textContent, ` · ${doing[lane]}`, 'its own piece\'s doing, as written');
      for (const [id, d] of Object.entries(doing)) if (id !== lane) assert.ok(!of.textContent.includes(d), 'never another piece\'s');
      assert.ok(of.attrs['data-clip'], 'cut at one line, measured');
    }
    assert.equal(named, 5, 'A\'s and E\'s helper rows, and B\'s, C\'s and D\'s end rows');
    // Cut at one line with the fade, once the browser measures it cut; the whole in the row's summary sheet.
    const first = byClass(app.view, 'sb-brow-of')[0];
    first.scrollHeight = 40;
    first.clientHeight = 17;
    await app.resize(360);
    await app.flush();
    assert.match(byClass(app.view, 'sb-brow-of')[0].className, /\bover\b/);
    const i = lis.findIndex((li) => byClass(li, 'sb-brow-of').length && !/\bnow\b/.test(li.className));
    await app.go(`#/p/Lanes-fifth/team/chief-of-staff/e/${i}`);
    const lane = byClass(lis[i], 'sb-brow-lane')[0].textContent.split(' ')[0];
    assert.ok(app.text().includes(`· ${doing[lane]}`), 'the whole, in its summary sheet');
  } finally {
    app.restore();
  }
});

test('AC49 (after MD3): the piece\'s cut — one line of the row\'s role, hidden past it with no scroll, the fade at its end in the log\'s own ground', () => {
  const css = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = (sel) => ([...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].find((x) => x[1].trim() === sel) || [null, null, ''])[2];
  assert.match(rule('.sb-brow-of'), /max-height: 1\.35em; overflow: hidden; overflow: clip;/);
  assert.match(rule('.sb-brow a'), /font: var\(--t-meta\)/, 'the row\'s role, at 1.35');
  assert.match(rule('.sb-brow-of.over::after'), /background: linear-gradient\(to right, transparent, var\(--surf\) 85%\);/);
  assert.match(rule('.sb-branch'), /background: var\(--surf\);/, 'the log\'s ground');
});
