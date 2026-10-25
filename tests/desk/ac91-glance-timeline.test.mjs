// ac-test: S-001/AC91 — G4 of "After the glance audit": the Timeline opens with what comes next in view, part (i)
// (specs/S-001.md, AC91 (i): "opened at Now, the Timeline is scrolled so that the top of the Now line sits one third of the
// way down the viewport (its height divided by 3, rounded), so the nearest milestone above Now and its run's shared line
// (AC90) show under the pinned header and band; where less lies above Now, as far as it goes. A refresh keeps the owner's
// scroll (AC56), and a link that opens the Timeline at one of its sprints scrolls to that sprint as built"), with AC59's
// and AC84's changed parts ("it rests with the Now line a third of the way down the screen").
// ac-test: S-001/AC59 ac-test: S-001/AC84
//
// The page harness: the sandbox's own code under the fake DOM, on Service-Desk's records (tv2-fixtures.mjs: J11's fixture
// at 3117150 with J12's built answer, as AC59's and AC84's tests use them). The fake DOM lays out nothing, so each test
// gives the page the browser's measures (getBoundingClientRect) and reads the calls it makes to window.scrollTo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from './helpers.mjs';
import { loadSandbox, byClass, findAll, El0 } from './sandbox-helpers.mjs';
import { sdRepo, SD3 } from './tv2-fixtures.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';

const NOW16 = Date.parse('2026-10-16T18:00:00Z');
const HEAD = 90; // the compact pinned header with the phase line
const BAND = 36; // a pinned band

/** The browser's measures for the Timeline: the Now line's top at `now`, a sprint's at `sprint`, the header and a band. */
function measures({ now = 2200, sprint = 3000, width = 360 } = {}) {
  const saved = Object.getOwnPropertyDescriptor(El0.prototype, 'getBoundingClientRect');
  El0.prototype.getBoundingClientRect = function rect() {
    const box = (top, height) => ({ top, bottom: top + height, height, left: 0, right: width, width });
    if (this.attrs && this.attrs['data-k'] === 'nowline') return box(now, 28);
    if (this.attrs && this.attrs['data-sprint']) return box(sprint, 40);
    if (` ${this.className} `.includes(' v2-tlhead ')) return box(0, HEAD);
    if (` ${this.className} `.includes(' sb-pband ')) return box(HEAD, BAND);
    return box(0, 0);
  };
  return () => {
    if (saved) Object.defineProperty(El0.prototype, 'getBoundingClientRect', saved);
    else delete El0.prototype.getBoundingClientRect;
  };
}

async function openPage(hash = '#/p/Service-Desk') {
  const app = await loadSandbox({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() }, hash, now: NOW16 });
  await app.advance(1000);
  return app;
}

test('AC91 (i): opened at Now, the Timeline asks the top of the Now line to rest a third of the way down the viewport (its height divided by 3, rounded), at 360 × 740 and 414 × 896, below the pinned header and band', async () => {
  for (const [w, h] of [[360, 740], [414, 896]]) {
    const undo = measures({ width: w });
    try {
      const app = await openPage();
      try {
        window.innerWidth = w;
        window.innerHeight = h;
        app.scrolls.length = 0;
        await app.go('#/p/Service-Desk/timeline');
        assert.deepEqual(app.scrolls, [[0, 2200 - Math.round(h / 3)]], `${w}×${h}: one call, the Now line's top at ${Math.round(h / 3)} px`);
        const top = 2200 - app.scrolls[0][1];
        assert.equal(top, Math.round(h / 3));
        assert.ok(top > HEAD + BAND, 'under the pinned header and band, with room above the line for what comes next');
        assert.ok(findAll(app.view, (e) => e.attrs && e.attrs['data-k'] === 'nowline').length === 1, 'the Now line drawn once');
      } finally {
        app.restore();
      }
    } finally {
      undo();
    }
  }
});

test('AC91 (i): where less lies above Now than a third of the viewport, the Timeline opens as far up as it goes (the top), never a negative scroll', async () => {
  const undo = measures({ now: 120 });
  try {
    const app = await openPage();
    try {
      window.innerHeight = 740;
      app.scrolls.length = 0;
      await app.go('#/p/Service-Desk/timeline');
      assert.deepEqual(app.scrolls, [[0, 0]], 'at the top: the Now line at 120 px, less than 247');
    } finally {
      app.restore();
    }
  } finally {
    undo();
  }
});

test('AC91 (i) with AC56: a refresh keeps the owner\'s scroll — no call to scroll, at Now or anywhere — and the phase line\'s tap brings the Now line back to the same third', async () => {
  const undo = measures();
  try {
    const app = await openPage('#/p/Service-Desk/timeline');
    try {
      window.innerHeight = 740;
      await app.advance(POLL_MS);
      app.scrolls.length = 0;
      window.scrollY = 1234; // the owner's own scroll
      await app.advance(POLL_MS);
      app.module.refresh();
      await app.flush();
      await app.tick();
      assert.deepEqual(app.scrolls, [], 'the refresh and the tick leave the owner where they are');
      byClass(app.view, 'v2-phl')[0].dispatch('click', { preventDefault() {} });
      await app.flush();
      assert.deepEqual(app.scrolls, [[0, 1234 + 2200 - 247]], 'the tap: the Now line\'s top a third of the way down again');
    } finally {
      app.restore();
    }
  } finally {
    undo();
  }
});

test('AC91 (i): a link that opens the Timeline at one of its sprints still lands on that sprint, just under the pinned header and band, as built (sandbox.js\'s scrollToTarget), never at Now', async () => {
  const undo = measures({ sprint: 3000 });
  try {
    const app = await openPage();
    try {
      window.innerHeight = 740;
      app.scrolls.length = 0;
      await app.go('#/p/Service-Desk/timeline/sprint/Q-013');
      assert.ok(findAll(app.view, (e) => e.attrs && e.attrs['data-sprint'] === 'Q-013').length, 'the sprint drawn, its milestone\'s sprints opened');
      assert.deepEqual(app.scrolls, [[0, 3000 - HEAD - BAND - 8]], 'to the sprint, under the header and its band');
      assert.ok(!app.scrolls.some(([, y]) => y === 2200 - 247), 'not to Now');
    } finally {
      app.restore();
    }
  } finally {
    undo();
  }
});
