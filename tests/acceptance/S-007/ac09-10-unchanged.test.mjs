// S-007 AC9 (other kinds exactly as before, under each read failing in turn) and AC10 (the only
// new read is a notes file's content, one per decision card in queue/ with notes in the tree).
// Both compare with the recorded baseline run (tests/desk/S-007-baseline.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seam, baseline, norm, withoutNewLines } from './lib.mjs';
import {
  FAIL_MODES, ac9Records, AC9_MOMENT, NON_DECISION, D1, D2,
  ac10Records, AC10_MOMENT, AC10_NOTES_READS, AC10_NOT_READ,
} from './scenarios.mjs';

const row = (rows, id) => {
  const r = (rows ?? []).find((x) => x.id === id);
  return r ? norm(r.text) : null;
};
const sheetCore = (s) => ({ answerable: s.answerable, buttons: s.buttons, text: norm(s.text) });

for (const mode of FAIL_MODES) {
  test(`AC9 — gate cards, questions and pull-request cards as before this fix (read failing: ${mode})`, async () => {
    const b = baseline().ac9[mode];
    const desk = await seam.openDesk();
    const snap = await desk.read({ records: ac9Records(mode), moment: AC9_MOMENT });
    for (const id of NON_DECISION) {
      assert.equal(row(snap.queue, id), row(b.snap.queue, id), `${id}: on the queue or not, and its row`);
      assert.equal(row(snap.board, id), row(b.snap.board, id), `${id}: on the board or not, and its row`);
      assert.deepEqual(sheetCore(await desk.open(id, 'link')), sheetCore(b.sheets[id]), `${id}: card sheet and its marked button`);
    }
    // Home's count, less the decision cards each run put on the queue.
    const dec = (s) => (s.queue ?? []).filter((r) => r.id === D1 || r.id === D2).length;
    assert.equal(snap.homeCount - dec(snap), b.snap.homeCount - dec(b.snap), "Home's count for these kinds");
    // Any line shown, other than the three new ones.
    for (const where of ['queue', 'home']) {
      assert.deepEqual(withoutNewLines(snap.lines[where]), withoutNewLines(b.snap.lines[where]), `lines on ${where}`);
    }
    await desk.close?.();
    const sender = await seam.openSender();
    const run = await sender.run({ records: ac9Records(mode), moment: AC9_MOMENT });
    const pick = (ns) => (ns ?? []).filter((n) => NON_DECISION.includes(n.id)).map((n) => n.id).sort();
    assert.deepEqual(pick(run.notices), pick(b.notices), 'notices for these kinds');
    await sender.close?.();
  });
}

const touches = (reqs, p) => (reqs ?? []).filter((q) => q.url.includes(p) || q.url.includes(encodeURIComponent(p)));

test('AC9 — the desk does not look for notes for a gate card (nor for a card not in queue/)', async () => {
  const desk = await seam.openDesk();
  const snap = await desk.read({ records: ac10Records(), moment: AC10_MOMENT });
  await desk.close?.();
  for (const p of AC10_NOT_READ) {
    assert.equal(touches(snap.requests, p).length, touches(baseline().ac10.requests, p).length, `no new read of ${p}`);
  }
});

function multisetMinus(a, b) {
  const left = [...b.map((q) => `${q.method} ${q.url}`)];
  const out = [];
  for (const q of a) {
    const k = `${q.method} ${q.url}`;
    const i = left.indexOf(k);
    if (i >= 0) left.splice(i, 1); else out.push(q);
  }
  return out;
}

test('AC10 — the one new kind of read: a notes file content, one per decision card with notes in the tree', async () => {
  const before = baseline().ac10.requests;
  assert.ok(Array.isArray(before) && before.length > 0, 'baseline recorded the desk requests');
  const desk = await seam.openDesk();
  const snap = await desk.read({ records: ac10Records(), moment: AC10_MOMENT });
  await desk.close?.();
  const after = snap.requests;
  assert.ok(Array.isArray(after) && after.length > 0, 'seam reports the desk requests');

  const origins = new Set(before.map((q) => new URL(q.url).origin));
  const methods = new Set(before.map((q) => q.method));
  for (const q of after) {
    assert.ok(origins.has(new URL(q.url).origin), `no new outside service: ${q.url}`);
    assert.ok(methods.has(q.method) && !['POST', 'PUT', 'PATCH', 'DELETE'].includes(q.method), `no write: ${q.method} ${q.url}`);
  }
  const added = multisetMinus(after, before);
  for (const p of AC10_NOTES_READS) assert.equal(touches(added, p).length, 1, `exactly one content read of ${p}`);
  assert.equal(added.length, AC10_NOTES_READS.length, `no other new read: ${added.map((q) => q.url).join(', ')}`);
  // Same credential: every request carries an auth the baseline's requests carried (seam reports a hash).
  const auths = (qs) => new Set(qs.map((q) => q.auth ?? null));
  assert.deepEqual([...auths(after)].filter((x) => !auths(before).has(x)), [], 'no new credential');
});
