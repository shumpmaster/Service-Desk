// AC49, as trial-view note 11 changed it (2026-10-15): the running log's branch drawing, on every
// member's page, read back from the shapes the page drew.
// ac-test: S-001/AC49
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll, j11Files, SD3 } from './sandbox-helpers.mjs';
import { NOW, twoProjects } from './sandbox-fixtures.mjs';
import { branchLayout } from '../../src/lib/sandbox.js';

const ROW_H = 44;
const centre = (i) => i * ROW_H + ROW_H / 2;
const num = (el, k) => Number(el.attrs[k]);

/** Read the drawing back: its lines, curves and dots, by kind. */
function shapes(svg) {
  const all = findAll(svg, () => true);
  return {
    lines: all.filter((e) => e.tag === 'line'),
    paths: all.filter((e) => e.tag === 'path'),
    dots: all.filter((e) => e.tag === 'circle' && e.attrs['data-kind'] === 'dot'),
  };
}

/** Check one member's drawing against its rows (AC49's test, note 11). */
function checkDrawing(where, branch, rows) {
  const svgs = findAll(branch, (e) => e.tag === 'svg');
  assert.equal(svgs.length, 1, `${where}: one drawing behind all the log's rows, never one per row`);
  const { lines, paths, dots } = shapes(svgs[0]);
  // Every straight piece is vertical.
  for (const l of lines) assert.equal(num(l, 'x1'), num(l, 'x2'), `${where}: a straight piece that is not vertical`);
  // The only other pieces are one fork and at most one join per lane: curves out and back.
  for (const pth of paths) assert.match(pth.attrs['data-kind'], /^(fork|join)$/, `${where}: a slanted piece that is neither a fork nor a join`);
  const laneLines = lines.filter((l) => l.attrs['data-kind'] === 'lane');
  const main = lines.filter((l) => l.attrs['data-kind'] === 'main');
  assert.equal(main.length, rows.length ? 1 : 0, `${where}: one main line`);
  const n = rows.length;
  const spans = [];
  for (const ll of laneLines) {
    const id = ll.attrs['data-lane'];
    const idx = rows.map((r, i) => (r === id ? i : -1)).filter((i) => i >= 0);
    const top = idx[0];
    const bottom = idx[idx.length - 1];
    const x = num(ll, 'x1');
    assert.equal(num(ll, 'y1'), centre(top), `${where}: ${id}'s line starts at its newest row`);
    const forks = paths.filter((pth) => pth.attrs['data-kind'] === 'fork' && pth.attrs['data-lane'] === id);
    const joins = paths.filter((pth) => pth.attrs['data-kind'] === 'join' && pth.attrs['data-lane'] === id);
    if (bottom === n - 1) {
      assert.equal(forks.length, 0, `${where}: ${id} is open at the oldest row shown: no fork`);
      assert.equal(num(ll, 'y2'), n * ROW_H, `${where}: ${id} runs in straight from the edge`);
    } else {
      assert.equal(forks.length, 1, `${where}: ${id} forks once`);
      assert.equal(Number(forks[0].attrs['data-row']), bottom, `${where}: ${id} forks at its oldest row`);
      assert.equal(num(ll, 'y2'), centre(bottom));
      assert.match(forks[0].attrs.d, new RegExp(` ${x} ${centre(bottom)}$`), `${where}: the fork ends on ${id}'s line at its row`);
    }
    assert.ok(joins.length <= 1, `${where}: ${id} joins at most once`);
    if (joins.length) assert.equal(Number(joins[0].attrs['data-row']), top, `${where}: ${id} joins at the row where its work is filed`);
    else assert.ok(lines.some((l) => l.attrs['data-kind'] === 'stub' && l.attrs['data-lane'] === id), `${where}: ${id} is not filed: a dashed stub`);
    spans.push({ id, x, top, bottom });
  }
  // Each dot sits on its lane's line (the main line for a row with no lane), at its row's centre.
  const mainX = main.length ? num(main[0], 'x1') : null;
  for (const d of dots) {
    const i = Number(d.attrs['data-row']);
    assert.ok(Math.abs(num(d, 'cy') - centre(i)) <= 1, `${where}: row ${i}'s dot off its row's centre`);
    const sp = spans.find((s) => s.id === rows[i]);
    const x = sp ? sp.x : mainX;
    assert.ok(Math.abs(num(d, 'cx') - x) <= 1, `${where}: row ${i}'s dot off its lane's line`);
  }
  assert.equal(dots.length, n, `${where}: a dot per row`);
  // Two lanes open at once never share a place across.
  for (const a of spans) {
    for (const b of spans) {
      if (a === b) continue;
      if (a.top <= b.bottom && b.top <= a.bottom) assert.notEqual(a.x, b.x, `${where}: ${a.id} and ${b.id} are open at once in one place`);
    }
  }
  return spans.length;
}

test('AC49 (note 11): every member\'s running log in the roster fixture, the Chief of Staff\'s included, is drawn as the agreed screen 3 draws it', async () => {
  const config = { ...CONFIG, projects: [SD3] };
  const app = await loadSandbox({ config, repos: { 'Service-Desk': repo(j11Files()) }, hash: '#/p/Service-Desk/team', now: NOW });
  try {
    await app.advance(1000);
    // AC67 (2026-10-16): each card is a box whose name links to the member's page.
    const ids = byClass(app.view, 'sb-tile-n').map((t) => t.attrs.href.split('/').pop());
    assert.ok(ids.includes('chief-of-staff') && ids.includes('researcher') && ids.includes('orchestrator'), ids.join(' '));
    let lanes = 0;
    let drawn = 0;
    for (const id of ['owner', ...ids]) {
      await app.go(`#/p/Service-Desk/team/${id}`);
      const branch = byClass(app.view, 'sb-branch')[0];
      if (id === 'chief-of-staff') {
        assert.equal(branch, undefined, 'the Chief of Staff has no log');
        assert.match(app.text(), /Its sessions aren't recorded, so there is no running log\./);
        continue;
      }
      if (!branch) continue;
      drawn++;
      const rows = byClass(branch, 'sb-brow').map((li) => byClass(li, 'sb-brow-lane')[0].textContent).map((t) => (t === 'project' ? null : t));
      lanes += checkDrawing(id, branch, rows);
    }
    assert.ok(drawn >= 4, `${drawn} members drawn`);
    assert.ok(lanes >= 10, `${lanes} lanes checked`);
  } finally {
    app.restore();
  }
});

test('AC49 (note 11): the layout\'s rules on small cases — fork at the oldest row, join where filed, a stub otherwise, from the edge when open at the oldest row, places never shared at once', () => {
  const log = (lanes) => lanes.map((lane) => ({ lane }));
  // Newest first: B opens and is filed while A is open; A is open at the oldest row shown.
  const L = branchLayout(log(['A', 'B', 'B', 'A', null, 'A']), (lane) => lane === 'B');
  const A = L.lanes.find((l) => l.id === 'A');
  const B = L.lanes.find((l) => l.id === 'B');
  assert.deepEqual([A.top, A.bottom, A.edge, A.fork, A.join, A.stub], [0, 5, true, false, null, true]);
  assert.deepEqual([B.top, B.bottom, B.edge, B.fork, B.join, B.stub], [1, 2, false, true, 1, false]);
  assert.notEqual(A.slot, B.slot, 'open at once: different places');
  assert.equal(L.dots[4].slot, 0, 'a row with no lane sits on the main line');
  // Lanes that never overlap may share a place, with a row between them.
  const L2 = branchLayout(log(['C', 'C', null, 'D', 'D', null]), () => true);
  assert.equal(L2.lanes.find((l) => l.id === 'C').slot, L2.lanes.find((l) => l.id === 'D').slot);
  const L3 = branchLayout(log(['C', 'D', 'D', 'E']), () => false);
  const at = (id) => L3.lanes.find((l) => l.id === id).slot;
  assert.notEqual(at('C'), at('D'), 'next to each other without a row between: different places');
  assert.notEqual(at('D'), at('E'));
});

test('AC49: the Team member pages of the sandbox fixture still draw without error, the log rows opening their sheets', async () => {
  const app = await loadSandbox({ ...twoProjects(), hash: '#/p/Alpha/team/builder', now: NOW });
  try {
    await app.advance(1000);
    const branch = byClass(app.view, 'sb-branch')[0];
    assert.ok(branch);
    const rows = byClass(branch, 'sb-brow').map((li) => byClass(li, 'sb-brow-lane')[0].textContent).map((t) => (t === 'project' ? null : t));
    checkDrawing('builder', branch, rows);
    assert.ok(findAll(branch, (e) => e.tag === 'a').some((a) => /\/team\/builder\/now$/.test(a.attrs.href)), 'the "now" row opens Working now');
  } finally {
    app.restore();
  }
});
