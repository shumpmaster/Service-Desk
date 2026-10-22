// The page itself (src/public/app.js and, from stage 8, the desk it starts, src/public/sandbox.js), loaded through its
// entry under the desk's fake DOM with fake timers and the fake desk function, so the start-up and render paths the
// browser runs are the ones tested (PR #40 review, N4 and N6). From stage 8 (AC44, step 4, specs/S-001.md:2918-2921) the
// accepted views are gone and `/` is the desk: each case below is the accepted page's, kept for the desk.
// ac-test: S-001/AC4 ac-test: S-001/AC5
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, CONFIG } from './helpers.mjs';
import { repo, BAD_PR, PORTFOLIO_REPO } from './fake-desk.mjs';
import { pfFiles, withPortfolio } from './pf-fixtures.mjs';
import { loadSandbox, byClass } from './sandbox-helpers.mjs';

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
    // The committed config names the portfolio (J7, stage 6b), so the desk reads it too: a made-up portfolio with
    // nothing on its queue (NOT real records), so the state line can reach "Quiet".
    [PORTFOLIO_REPO]: repo(pfFiles()),
  };
}

// The projects' polls (the portfolio's own read, J23, is counted apart).
const polls = (app) => app.server.calls.filter((c) => c.path === '/api/poll' && c.target !== 'portfolio').length;
// The entry reads the committed config, which names the portfolio (J7); the fake function is given the same.
const open = (o) => loadSandbox({ config: withPortfolio(CONFIG), now: Date.now(), search: '', entry: true, ...o });

test('Page (review N6): opened at #/p/%E0, the desk shows Home with every project, starts polling and reaches Quiet', async () => {
  const app = await open({ hash: '#/p/%E0', repos: cleanRepos() });
  try {
    assert.equal(app.els['screen-state'].textContent, 'Checking…');
    const view = app.view.textContent;
    for (const p of CONFIG.projects) assert.ok(view.includes(p.name), `Home lists ${p.name}`);
    await app.advance(1000);
    assert.equal(polls(app), CONFIG.projects.length, 'desk.start() polled each project');
    assert.equal(app.els['screen-state'].textContent, 'Quiet');
    await app.advance(60_000);
    assert.equal(polls(app), 2 * CONFIG.projects.length, 'and keeps polling');
  } finally {
    app.restore();
  }
});

test('Page (review N4) + AC30: a record makes one project\'s box throw; that tile says so, the other is drawn, never "Quiet", polling goes on', async () => {
  // ac-test: S-001/AC30
  const app = await open({ hash: '#/', repos: cleanRepos({ badRecord: true }) });
  try {
    await app.advance(1000);
    assert.equal(app.els['screen-state'].textContent, "Not quiet: can't show 1 project");
    const view = app.view.textContent;
    assert.match(view, /Can't show this project: /);
    assert.ok(view.includes('Personal-Org-Operating-Model'), 'the other tile is drawn');
    // The accepted page's footer is gone with it (stage 8); Home's foot, its "More detail", is drawn.
    assert.equal(byClass(app.view, 'v2-mdetail').length, 1, 'Home is drawn to its foot');
    const first = polls(app);
    await app.advance(2 * 60_000);
    assert.equal(polls(app), first + 2 * CONFIG.projects.length, 'polled every 60 s after the throw');
    assert.notEqual(app.els['screen-state'].textContent, 'Quiet');
  } finally {
    app.restore();
  }
});

test('Page (review N6): when even the first render\'s error state can\'t be drawn, the desk still starts', async () => {
  const app = await open({ hash: '#/p/%E0', repos: cleanRepos(), breakView: true });
  try {
    assert.match(app.els['screen-state'].textContent, /^Can't show the desk: view is broken/);
    await app.advance(1000);
    assert.equal(polls(app), CONFIG.projects.length, 'desk.start() ran');
    assert.notEqual(app.els['screen-state'].textContent, 'Quiet');
  } finally {
    app.restore();
  }
});

test('Page AC32: signed out while a box throws, and then while the whole view throws — the line still says "Signed out", and the tab too', async () => {
  // ac-test: S-001/AC32
  const repos = cleanRepos({ badRecord: true });
  const app = await open({ hash: '#/', repos });
  try {
    await app.advance(1000);
    assert.match(app.view.textContent, /Can't show this project/);
    // The Access session goes: every call now answers 403.
    for (const r of Object.values(repos)) r.fail = { kind: 'signed-out' };
    await app.advance(60_000);
    assert.equal(app.els['screen-state'].textContent, 'Signed out — reload to sign in');
    // From stage 8 the accepted header's coloured class is gone with it; the desk's tab title carries the line.
    assert.equal(document.title, 'Service Desk — Signed out — reload to sign in');
    // Now drawing the view throws too: the render-error message never replaces the line.
    for (const m of ['append', 'appendChild', 'insertBefore', 'removeChild', 'replaceChildren']) app.view[m] = () => { throw new Error('view is broken'); };
    await app.advance(60_000);
    assert.equal(app.els['screen-state'].textContent, 'Signed out — reload to sign in');
  } finally {
    app.restore();
  }
});
