// S-005 AC11: the queue, Home's count, the board, the card sheet (src/public/sandbox.js) and the
// sender give every decision card the same state from the same records and one handed-in moment.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  seam, T0, at, card, entry, notes, notesPath, records,
  HELD, decisionStates, viewState, withFakeClock,
} from './lib.mjs';

const A = 'Q-019-stop-1';   // raised T0, no notes
const B = 'Q-017-failure-2'; // raised T0, notes: resubmit
const C = 'Q-031-dor-fail-1'; // raised T0 + 2h, no notes
const D = 'Q-032-stop-1';   // raised before the read part of the log
const ALL = [A, B, C, D];
const R = records({
  cards: ALL.map((id) => card(id)),
  files: { [notesPath(B)]: notes('resubmit') },
  log: [entry(A, T0), entry(B, T0), entry(C, at(T0, 2))],
});
const MOMENTS = [at(T0, -1), at(T0, 23, 59), at(T0, 24), at(T0, 24, 1), at(T0, 26), at(T0, 26, 1)];

// "held" on the rule list and "not shown" in the views are the same state.
const asView = (s) => (s === HELD || s === undefined ? 'not shown' : s);

async function allStates(records_, moment, desk) {
  const rule = decisionStates(await seam.ruleList({ records: records_, moment }));
  const sender = await seam.openSender();
  const sent = decisionStates(await sender.list({ records: records_, moment }));
  await sender.close?.();
  const snap = await desk.read({ records: records_, moment });
  const out = {};
  for (const id of ALL) {
    out[id] = {
      rule: asView(rule[id]),
      sender: asView(sent[id]),
      views: await viewState(desk, snap, id),
    };
  }
  const shown = Object.values(out).filter((s) => s.rule !== 'not shown').length;
  return { out, homeCount: snap.homeCount, shown };
}

test('AC11 — at moments before, at and after raise + 24h, every decision card has one state everywhere', async () => {
  const desk = await seam.openDesk();
  for (const m of MOMENTS) {
    const { out, homeCount, shown } = await allStates(R, m, desk);
    for (const id of ALL) {
      const s = out[id];
      assert.equal(s.sender, s.rule, `${m} ${id}: sender ${s.sender} vs rule ${s.rule}`);
      assert.equal(s.views, s.rule, `${m} ${id}: views ${s.views} vs rule ${s.rule}`);
    }
    assert.equal(homeCount, shown, `${m}: Home's count`);
  }
  await desk.close?.();
});

test('AC11 — a desk open for hours, a desk just opened and the sender agree (no memory of earlier reads)', async () => {
  const longOpen = await seam.openDesk();
  for (const m of MOMENTS) await longOpen.read({ records: R, moment: m }); // hours of reads
  await longOpen.read({ records: { ...R, fail: { queue: true } }, moment: at(T0, 27) });
  const target = at(T0, 24, 1);
  const a = await allStates(R, target, longOpen);
  const fresh = await seam.openDesk();
  const b = await allStates(R, target, fresh);
  assert.deepEqual(a.out, b.out);
  // Going back in time on the same desk gives the earlier moment's states: nothing is kept.
  const back = await allStates(R, at(T0, 1), longOpen);
  const freshBack = await allStates(R, at(T0, 1), fresh);
  assert.deepEqual(back.out, freshBack.out);
  await longOpen.close?.();
  await fresh.close?.();
});

test('AC11 — the rule never reads a clock: moving the process clock changes nothing', async () => {
  for (const m of [at(T0, 23, 59), at(T0, 24)]) {
    const early = await withFakeClock('2020-01-01T00:00:00Z', () => seam.ruleList({ records: R, moment: m }));
    const late = await withFakeClock('2035-06-01T00:00:00Z', () => seam.ruleList({ records: R, moment: m }));
    assert.deepEqual(decisionStates(early), decisionStates(late), m);
    const s1 = await withFakeClock('2020-01-01T00:00:00Z', async () => { const s = await seam.openSender(); const l = await s.list({ records: R, moment: m }); await s.close?.(); return l; });
    const s2 = await withFakeClock('2035-06-01T00:00:00Z', async () => { const s = await seam.openSender(); const l = await s.list({ records: R, moment: m }); await s.close?.(); return l; });
    assert.deepEqual(decisionStates(s1), decisionStates(s2), `sender list at ${m}`);
  }
});

test('AC11 — a partial read gives the decidable cards the state a full read gives, never a different one', async () => {
  for (const m of MOMENTS) {
    const full = decisionStates(await seam.ruleList({ records: R, moment: m }));
    const partial = decisionStates(await seam.ruleList({ records: { ...R, fail: { log: true } }, moment: m }));
    for (const [id, s] of Object.entries(partial)) assert.equal(s, full[id], `${m} ${id}`);
  }
});
