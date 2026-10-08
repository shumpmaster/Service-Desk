// The Orchestrator's hold cards (AC46) and merge cards (AC47), through the page's real scheduler
// and a fake desk function, with fixtures in the exact forms orchestrator_git.py writes.
// ac-test: S-001/AC46 ac-test: S-001/AC47
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk, POLL_MS } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { makeBox, boxRank } from '../../src/lib/universe.js';
import { answerPlan } from '../../src/lib/links.js';
import { fakeClock, fixture, CONFIG, SD } from './helpers.mjs';
import { repo, fakeServer } from './fake-desk.mjs';
import { loadApp, find } from './page-harness.mjs';

const START = Date.parse('2026-10-08T15:00:00Z');
const GOV = '.github/workflows/governance.yml';
const om = (p) => fixture(`orchestrator-m2/${p}`);
const HOLD_A = 'queue/ci-hold-e2ab9c55e561.md';
const HOLD_B = 'queue/ci-hold-4a2448939173.md';
const CONFLICT = 'queue/P-002-merge-conflict.md';
const BYHAND = 'queue/Q-007-merge-by-hand.md';
const TIP_P002 = '0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c';
const TIP_Q007 = '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d';

function setup(files, runs = []) {
  const clock = fakeClock(START);
  const repos = {
    'Service-Desk': repo({
      'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
      'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
      ...files,
    }, [], runs),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], []),
  };
  const server = fakeServer(repos, CONFIG, clock);
  const desk = createDesk({ config: CONFIG, call: server.call, clock, store: createStore(null), isVisible: () => true });
  const box = () => makeBox(desk.model('Service-Desk'), desk.states.get('Service-Desk'), desk, clock.now());
  const kinds = (k) => box().model.flagged.filter((f) => f.kind === k);
  const blobCalls = () => server.calls.filter((c) => c.path === '/api/blobs' && c.project === 'Service-Desk');
  return { clock, repos, sd: repos['Service-Desk'], server, desk, box, kinds, blobCalls };
}
const gov = (status, conclusion, n = 300) => ({ path: GOV, event: 'workflow_dispatch', status, conclusion, run_number: n });

test('AC46: a hold card is flagged while governance on the head is failed or running, cleared when it passes, never "can\'t parse"', async () => {
  const s = setup({ [HOLD_A]: om(HOLD_A) }, [gov('completed', 'failure')]);
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  let holds = s.kinds('hold');
  assert.equal(holds.length, 1);
  assert.equal(holds[0].title, "Hold card — the default branch's governance run is not green");
  assert.equal(holds[0].hold.parsed.tip, 'e2ab9c55e561faa25c8186d560fa8bb076c54d32');
  assert.equal(holds[0].hold.parsed.state, 'failed');
  assert.equal(holds[0].hold.parsed.heldFor, 75);
  assert.equal(holds[0].hold.actionsLink, 'https://github.com/shumpmaster/Service-Desk/actions/workflows/governance.yml');
  assert.equal(s.box().flaggedCount, 1);
  assert.equal(boxRank(s.box()), 0, 'flagged like any waiting card');
  assert.ok(!s.box().model.activity.some((a) => a.kind === 'unparsed'));
  // A re-run in progress: still flagged.
  s.sd.runs = [gov('in_progress', null, 301)];
  await s.clock.runUntil(START + POLL_MS + 1000);
  assert.equal(s.kinds('hold').length, 1);
  // The latest governance run on the head concludes success: cleared.
  s.sd.runs = [gov('completed', 'failure', 300), gov('completed', 'success', 301)];
  await s.clock.runUntil(START + 2 * POLL_MS + 1000);
  assert.equal(s.kinds('hold').length, 0);
  assert.equal(s.box().flaggedCount, 0);
  // Deleted: not flagged (governance failing again, so only the deletion clears it).
  s.sd.runs = [gov('completed', 'failure', 302)];
  await s.clock.runUntil(START + 3 * POLL_MS + 1000);
  assert.equal(s.kinds('hold').length, 1);
  s.sd.commit({ [HOLD_A]: null });
  await s.clock.runUntil(START + 4 * POLL_MS + 1000);
  assert.equal(s.kinds('hold').length, 0);
});

test('AC46: with Actions: read missing, governance can\'t be read, so an open hold card stays flagged (review N2)', async () => {
  const s = setup({ [HOLD_A]: om(HOLD_A) }, [gov('completed', 'success')]);
  s.sd.checksForbidden = true;
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  assert.equal(s.kinds('hold').length, 1);
});

test('AC46: with two hold cards only the newest (by creation, from history) is flagged; the other is activity, its blob never read', async () => {
  const s = setup({ [HOLD_A]: om(HOLD_A), [HOLD_B]: om(HOLD_B) }, [gov('completed', 'failure')]);
  s.sd.history[HOLD_A] = [{ commit: { committer: { date: '2026-10-08T10:00:00Z' } } }];
  s.sd.history[HOLD_B] = [{ commit: { committer: { date: '2026-10-07T10:00:00Z' } } }];
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  const holds = s.kinds('hold');
  assert.deepEqual(holds.map((f) => f.hold.path), [HOLD_A]);
  assert.ok(s.box().model.activity.some((a) => a.text === `replaced by a newer hold card: ${HOLD_B}`));
  assert.equal(s.desk.states.get('Service-Desk').failure, null, 'read successfully');
  const asked = s.blobCalls().flatMap((c) => c.body.history || []);
  assert.deepEqual(asked.filter((p) => p.startsWith('queue/')).sort(), [HOLD_B, HOLD_A].sort(), 'each creation time once');
  // The older card's blob was never asked for.
  const { gitSha } = await import('./fake-desk.mjs');
  const blobs = s.blobCalls().flatMap((c) => c.body.blobs);
  assert.ok(blobs.includes(gitSha(om(HOLD_A))));
  assert.ok(!blobs.includes(gitSha(om(HOLD_B))));
  // Steady polls ask nothing again.
  const n = s.blobCalls().length;
  await s.clock.runUntil(START + 2 * POLL_MS + 1000);
  assert.equal(s.blobCalls().length, n);
});

test('AC47: both steps flagged while open; a merges.jsonl line for its tip clears one; never "can\'t parse"', async () => {
  const s = setup({ [CONFLICT]: om(CONFLICT), [BYHAND]: om(BYHAND) });
  s.sd.compare = () => 'diverged';
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  let merges = s.kinds('merge');
  assert.deepEqual(merges.map((f) => f.title).sort(), ['P-002: merge conflict', 'Q-007: merge by hand']);
  const q = merges.find((f) => f.merge.item === 'Q-007');
  assert.equal(q.merge.parsed.tip, TIP_Q007);
  assert.equal(q.merge.branchLink, 'https://github.com/shumpmaster/Service-Desk/tree/item/Q-007');
  assert.match(q.merge.parsed.decision, /the gate cannot satisfy what it needs/);
  assert.ok(q.merge.parsed.why && q.merge.parsed.whatToDo);
  assert.ok(!s.box().model.activity.some((a) => a.kind === 'unparsed'));
  // The gate merges P-002 and records it.
  s.sd.commit({ 'status/merges.jsonl': om('status/merges.jsonl') });
  await s.clock.runUntil(START + POLL_MS + 1000);
  merges = s.kinds('merge');
  assert.deepEqual(merges.map((f) => f.merge.item), ['Q-007']);
});

test('AC47: a compare answer of ahead or identical (a by-hand merge) clears it; diverged or a failed read leaves it flagged', async () => {
  for (const [answer, flagged] of [['ahead', false], ['identical', false], ['diverged', true], ['behind', true], [null, true]]) {
    const s = setup({ [BYHAND]: om(BYHAND) });
    const asked = [];
    s.sd.compare = (base, head) => {
      asked.push([base, head]);
      return answer;
    };
    s.desk.start();
    await s.clock.runUntil(START + 1000);
    assert.equal(s.kinds('merge').length, flagged ? 1 : 0, String(answer));
    assert.equal(asked.length, 1, 'asked once');
    assert.equal(asked[0][0], TIP_Q007);
    assert.equal(asked[0][1], s.sd.head(), 'against the default-branch head');
    assert.equal(s.desk.states.get('Service-Desk').failure, null, 'a failed compare doesn\'t make the project unreadable');
    // Steady polls don't ask again; a head change asks again unless the answer was final.
    await s.clock.runUntil(START + POLL_MS + 1000);
    assert.equal(asked.length, 1);
    s.sd.commit({ 'docs/x.md': 'x' });
    await s.clock.runUntil(START + 2 * POLL_MS + 1000);
    assert.equal(asked.length, flagged ? 2 : 1, `${answer}: asked again on a new head only when not merged`);
  }
});

test('AC47: the item closed clears it; `done` does not; the card file deleted clears it', async () => {
  const s = setup({ [BYHAND]: om(BYHAND), 'status/Q-007.toml': 'kind = "query"\nstate = "done"\n' });
  s.sd.compare = () => 'diverged';
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  assert.equal(s.kinds('merge').length, 1, 'done is exactly an item waiting to merge');
  s.sd.commit({ 'status/Q-007.toml': 'kind = "query"\nstate = "closed"\noutcome = "drop"\n' });
  await s.clock.runUntil(START + POLL_MS + 1000);
  assert.equal(s.kinds('merge').length, 0);
  const t = setup({ [BYHAND]: om(BYHAND) });
  t.sd.compare = () => 'diverged';
  t.desk.start();
  await t.clock.runUntil(START + 1000);
  assert.equal(t.kinds('merge').length, 1);
  t.sd.commit({ [BYHAND]: null });
  await t.clock.runUntil(START + POLL_MS + 1000);
  assert.equal(t.kinds('merge').length, 0);
});

test('AC46/AC47: neither counts in time asked or V5, and neither is offered an answer link', async () => {
  const s = setup({ [HOLD_A]: om(HOLD_A), [BYHAND]: om(BYHAND) }, [gov('completed', 'failure')]);
  s.sd.compare = () => 'diverged';
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  const m = s.box().model;
  assert.equal(m.flagged.length, 2);
  assert.ok(!m.timeAsked.cards.some((r) => /ci-hold|merge/.test(r.path)));
  assert.equal(answerPlan(SD, CONFIG.linkCap, { kind: 'hold' }, null, '').offer, 'none');
  assert.equal(answerPlan(SD, CONFIG.linkCap, { kind: 'merge', item: 'Q-007' }, null, '').offer, 'none');
});

test('Page AC46/AC47: the hold and merge views show their fields and sections, say no answer is needed, and offer no answer link', async () => {
  const repos = {
    'Service-Desk': repo({ [HOLD_A]: om(HOLD_A), [CONFLICT]: om(CONFLICT) }, [], [gov('completed', 'failure')]),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], []),
  };
  repos['Service-Desk'].compare = () => 'diverged';
  let app = await loadApp({ hash: `#/p/Service-Desk/hold/${encodeURIComponent(HOLD_A)}`, repos });
  try {
    await app.advance(1000);
    const text = app.els.view.textContent;
    assert.match(text, /the default branch's governance run is not green/);
    assert.match(text, /e2ab9c55e561faa25c8186d560fa8bb076c54d32/);
    assert.match(text, /75 minutes/);
    assert.match(text, /No answer needed: fix or re-run the governance run; this clears once it passes\./);
    assert.match(text, /What to do/);
    assert.ok(find(app.els.view, (e) => e.tag === 'a' && e.attrs.href === 'https://github.com/shumpmaster/Service-Desk/actions/workflows/governance.yml'));
    assert.equal(find(app.els.view, (e) => e.className === 'go' || (e.attrs && /\/new\//.test(e.attrs.href || ''))), null);
  } finally {
    app.restore();
  }
  app = await loadApp({ hash: `#/p/Service-Desk/merge/${encodeURIComponent(CONFLICT)}`, repos });
  try {
    await app.advance(1000);
    const text = app.els.view.textContent;
    assert.match(text, /P-002: merge conflict/);
    assert.match(text, new RegExp(TIP_P002));
    assert.match(text, /No answer needed: merge item\/P-002 by hand, or change the item and let the merge gate try again\./);
    for (const h of ['The decision', 'Why', 'What to do']) assert.ok(text.includes(h), h);
    assert.ok(find(app.els.view, (e) => e.tag === 'a' && e.attrs.href === 'https://github.com/shumpmaster/Service-Desk/tree/item/P-002'));
    assert.equal(find(app.els.view, (e) => e.className === 'go' || (e.attrs && /\/new\//.test(e.attrs.href || ''))), null);
  } finally {
    app.restore();
  }
});
