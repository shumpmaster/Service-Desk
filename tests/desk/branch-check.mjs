// AC49's check of a running log's branch drawing (spec S-001, AC49, trial-view note 11), shared by
// the AC49 and J13 tests: the drawing read back from the shapes the page drew.
import assert from 'node:assert/strict';
import { findAll } from './sandbox-helpers.mjs';

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
export function checkDrawing(where, branch, rows) {
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

