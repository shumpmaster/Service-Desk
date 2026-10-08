// The page itself (src/public/app.js), loaded under a minimal fake DOM with fake timers and a fake
// desk function, so the start-up and render paths the browser runs are the ones tested
// (PR #40 review, N4 and N6).
// ac-test: S-001/AC4 ac-test: S-001/AC5
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, CONFIG } from './helpers.mjs';
import { repo, BAD_PR } from './fake-desk.mjs';
import { loadApp } from './page-harness.mjs';

function cleanRepos({ badRecord = false } = {}) {
  const sd = (p) => fixture(`service-desk/${p}`);
  return {
    'Service-Desk': repo({
      'queue/README.md': sd('queue/README.md'),
      'governance/ROUTING.toml': sd('governance/ROUTING.toml'),
      'status/P-001.toml': fixture('service-desk/status/P-001@7da0fd7.toml'),
      'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
    }, badRecord ? [BAD_PR] : [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]),
    'Personal-Org-Operating-Model': repo({
      'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'),
      'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md'),
    }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]),
  };
}

const polls = (app) => app.fetchCalls.filter((c) => c.path === '/api/poll').length;

test('Page (review N6): opened at #/p/%E0, the desk shows the Universe, starts polling and reaches Quiet', async () => {
  const app = await loadApp({ hash: '#/p/%E0', repos: cleanRepos() });
  try {
    assert.equal(app.state().textContent, 'Checking…');
    const view = app.els.view.textContent;
    for (const p of CONFIG.projects) assert.ok(view.includes(p.name), `the Universe lists ${p.name}`);
    assert.equal(app.timers.size, CONFIG.projects.length, 'desk.start() scheduled one poll per project');
    await app.advance(1000);
    assert.equal(polls(app), CONFIG.projects.length);
    assert.equal(app.state().textContent, 'Quiet');
    await app.advance(60_000);
    assert.equal(polls(app), 2 * CONFIG.projects.length, 'and keeps polling');
  } finally {
    app.restore();
  }
});

test('Page (review N4) + AC30: a record makes one project\'s box throw; that box says so, the other is drawn, never "Quiet", polling goes on', async () => {
  // ac-test: S-001/AC30
  const app = await loadApp({ repos: cleanRepos({ badRecord: true }) });
  try {
    await app.advance(1000);
    const s = app.state();
    assert.equal(s.textContent, "Not quiet: can't show 1 project");
    assert.equal(s.className, 'cant-read');
    const view = app.els.view.textContent;
    assert.match(view, /Service-Desk\s*Can't show this project: /);
    assert.ok(view.includes('Personal-Org-Operating-Model'), 'the other box is drawn');
    assert.ok(view.includes('quiet'), 'and says quiet');
    assert.match(app.els.foot.textContent, /Updated /, 'the footer is drawn');
    const first = polls(app);
    await app.advance(2 * 60_000);
    assert.equal(polls(app), first + 2 * CONFIG.projects.length, 'polled every 60 s after the throw');
    assert.notEqual(app.state().textContent, 'Quiet');
  } finally {
    app.restore();
  }
});

test('Page (review N6): when even the first render\'s error state can\'t be drawn, the desk still starts', async () => {
  const app = await loadApp({ hash: '#/p/%E0', repos: cleanRepos(), breakView: true });
  try {
    assert.match(app.state().textContent, /^Can't show the desk: view is broken/);
    assert.equal(app.timers.size, CONFIG.projects.length, 'desk.start() ran');
    await app.advance(1000);
    assert.equal(polls(app), CONFIG.projects.length);
    assert.notEqual(app.state().textContent, 'Quiet');
  } finally {
    app.restore();
  }
});

test('Page AC32: signed out while a box throws, and then while the whole view throws — the line still says "Signed out"', async () => {
  // ac-test: S-001/AC32
  const repos = cleanRepos({ badRecord: true });
  const app = await loadApp({ repos });
  try {
    await app.advance(1000);
    assert.match(app.els.view.textContent, /Can't show this project/);
    // The Access session goes: every call now answers 403.
    for (const r of Object.values(repos)) r.fail = { kind: 'signed-out' };
    await app.advance(60_000);
    assert.equal(app.state().textContent, 'Signed out — reload to sign in');
    assert.equal(app.state().className, 'signed-out');
    // Now drawing the view throws too: the render-error message never replaces the line.
    app.els.view.replaceChildren = () => { throw new Error('view is broken'); };
    await app.advance(60_000);
    assert.equal(app.state().textContent, 'Signed out — reload to sign in');
  } finally {
    app.restore();
  }
});
