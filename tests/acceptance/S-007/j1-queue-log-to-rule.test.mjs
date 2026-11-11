// join-test: S-007/J1
// queue/ and the dispatch log on the main branch -> the rule (D1). Real records into the real rule
// through the seam's ruleList / monitor, fed through the desk's real log reader (README.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  seam, T0, at, card, gateCard, entry, notes, notesPath, records,
  HELD, NOREC, rec, stateIn, hasFlag, sameInstant,
} from './lib.mjs';

const run = (r, moment) => seam.ruleList({ records: r, moment });

test('join-test: S-007/J1 — the Builder states the log reader facts the rule relies on', () => {
  const f = seam.logReader;
  assert.ok(f && Array.isArray(f.cardEntryFields) && f.cardEntryFields.length > 0, 'logReader.cardEntryFields must name the card entry fields');
  assert.ok(['all', 'first', 'last'].includes(f.duplicates), "logReader.duplicates must be 'all', 'first' or 'last'");
  assert.equal(typeof seam.cardFileForm, 'string', 'seam.cardFileForm must state the card-file form found in src/lib');
  assert.ok(seam.cardFileForm.length > 0);
});

test('join-test: S-007/J1 — kind comes from <gate>; dor-fail is a decision card, not a dor gate card', async () => {
  const dec = ['Q-040-dor-fail-1', 'Q-041-stop-1', 'Q-042-failure-3'];
  const gate = ['Q-043-dor-1', 'Q-044-criteria-2', 'Q-045-launch-1'];
  const r = records({
    cards: [...dec.map((id) => card(id)), ...gate.map((id) => gateCard(id))],
    log: [...dec, ...gate].map((id) => entry(id, T0)),
  });
  const list = await run(r, at(T0, 1));
  const kind = (id) => list.cards.find((c) => c.id === id)?.kind;
  for (const id of dec) {
    assert.equal(kind(id), 'decision', id);
    assert.equal(stateIn(list, id), HELD, `${id} raised 1h ago with no notes is held`);
  }
  for (const id of gate) {
    assert.equal(kind(id), 'gate', id);
    assert.ok(stateIn(list, id) == null, `${id}: gate cards carry no new state`);
  }
});

test('join-test: S-007/J1 — raise time comes from the card entry; a day from it the card shows', async () => {
  const id = 'Q-041-stop-1';
  const r = records({ cards: [card(id)], log: [entry(id, T0)] });
  assert.equal(stateIn(await run(r, at(T0, 23, 59)), id), HELD);
  assert.equal(stateIn(await run(r, at(T0, 24)), id), NOREC);
  assert.equal(stateIn(await run(r, at(T0, 100)), id), NOREC);
});

test('join-test: S-007/J1 — another card\'s entry does not give this card its raise time', async () => {
  const a = 'Q-041-stop-1';
  const b = 'Q-041-stop-2';
  const r = records({ cards: [card(a), card(b)], log: [entry(a, at(T0, -48)), entry(b, T0)] });
  const list = await run(r, at(T0, 1));
  assert.equal(stateIn(list, a), NOREC);
  assert.equal(stateIn(list, b), HELD);
});

test('join-test: S-007/J1 — log got, no entry for the card: raised before the read part, shown at once', async () => {
  const a = 'Q-050-stop-1';
  const b = 'Q-051-stop-1';
  const r = records({ cards: [card(a), card(b)], files: { [notesPath(b)]: notes('resubmit') }, log: [entry('Q-099-stop-1', T0)] });
  const list = await run(r, T0);
  assert.equal(stateIn(list, a), NOREC);
  assert.equal(stateIn(list, b), rec('resubmit'));
  assert.ok(!hasFlag(list.flags, 'log'), 'a log that was got gives no log flag');
  const mon = await seam.monitor({ records: r, moment: T0 });
  assert.equal(mon.entries.find((e) => e.id === a)?.raised, 'not recorded');
});

test('join-test: S-007/J1 — log not got: shown only if notes with a recommended word are there', async () => {
  const a = 'Q-050-stop-1';
  const b = 'Q-051-stop-1';
  const r = records({ cards: [card(a), card(b)], files: { [notesPath(b)]: notes('drop') }, log: [entry(a, T0), entry(b, T0)], fail: { log: true } });
  const list = await run(r, at(T0, 48));
  assert.equal(stateIn(list, a), undefined, 'no state for a card the read cannot decide');
  assert.equal(stateIn(list, b), rec('drop'));
  assert.ok(hasFlag(list.flags, 'log'));
});

test('join-test: S-007/J1 — queue/ not got: no decision card gets a state', async () => {
  const a = 'Q-050-stop-1';
  const r = records({ cards: [card(a)], files: { [notesPath(a)]: notes('drop') }, log: [entry(a, T0)], fail: { queue: true } });
  const list = await run(r, at(T0, 48));
  assert.deepEqual(list.cards.filter((c) => c.kind === 'decision'), []);
  assert.ok(hasFlag(list.flags, 'queue'));
});

test('join-test: S-007/J1 — two card entries: the earliest among those the reader returns, in either order', async () => {
  const id = 'Q-060-stop-1';
  const early = T0;
  const late = at(T0, 12);
  const dup = seam.logReader?.duplicates;
  for (const order of [[early, late], [late, early]]) {
    const r = records({ cards: [card(id)], log: order.map((t) => entry(id, t)) });
    // 'all': the rule picks the earliest. 'first' / 'last': the reader returns one, which is the raise time.
    const expected = dup === 'all' ? early : dup === 'first' ? order[0] : order[1];
    const mon = await seam.monitor({ records: r, moment: at(T0, 20) });
    const got = mon.entries.find((e) => e.id === id);
    assert.ok(got && sameInstant(got.raised, expected), `order ${order}: raised ${got?.raised}, expected ${expected} (reader returns ${dup})`);
    // The desk's state follows the same pick: a day from `expected`.
    assert.equal(stateIn(await run(r, at(expected, 23, 59)), id), HELD);
    assert.equal(stateIn(await run(r, at(expected, 24)), id), NOREC);
  }
});

test('join-test: S-007/J1 — clock skew: negative age counts as under a day, never reset (the spec\'s example)', async () => {
  const id = 'Q-070-stop-1';
  const raised = '2026-11-10T10:00:00.000Z';
  const r = records({ cards: [card(id)], log: [entry(id, raised)] });
  assert.equal(stateIn(await run(r, '2026-11-10T09:58:00.000Z'), id), HELD);
  assert.equal(stateIn(await run(r, '2026-11-11T09:59:00.000Z'), id), HELD);
  assert.equal(stateIn(await run(r, '2026-11-11T10:00:00.000Z'), id), NOREC);
});

test('join-test: S-007/J1 — a raise time far in the future holds the card until it plus 24 hours', async () => {
  const id = 'Q-071-stop-1';
  const raised = '2030-01-01T00:00:00.000Z';
  const r = records({ cards: [card(id)], log: [entry(id, raised)] });
  assert.equal(stateIn(await run(r, at(T0, 0)), id), HELD);
  assert.equal(stateIn(await run(r, at(T0, 48)), id), HELD);
  assert.equal(stateIn(await run(r, at(raised, 23, 59)), id), HELD);
  assert.equal(stateIn(await run(r, at(raised, 24)), id), NOREC);
});
