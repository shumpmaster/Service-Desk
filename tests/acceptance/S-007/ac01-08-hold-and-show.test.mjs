// S-007 AC1 to AC8: holding and showing (the rule, D1, and what the owner sees, D2),
// checked through the real desk and the real sender.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  seam, T0, at, card, entry, notes, notesPath, records,
  HELD, NOREC, rec, MARK, norm, ids, noticeIds, stateIn, viewState, marked, saysRecommends,
} from './lib.mjs';

const K = 'Q-019-stop-1';

async function look(r, moment) {
  const desk = await seam.openDesk();
  const snap = await desk.read({ records: r, moment });
  const state = await viewState(desk, snap, K);
  const sheet = snap.queue.some((x) => x.id === K) ? await desk.open(K, 'link') : null;
  await desk.close?.();
  const sender = await seam.openSender();
  const run = await sender.run({ records: r, moment });
  await sender.close?.();
  return { snap, state, sheet, notified: noticeIds(run).includes(K) };
}

test('AC1 — no notes, raised under a day ago: held off the queue, Home, board, buttons and notices', async () => {
  const r = records({ cards: [card(K)], log: [entry(K, T0)] });
  for (const m of [at(T0, 0), at(T0, 1), at(T0, 23, 59)]) {
    const v = await look(r, m);
    assert.equal(v.state, 'not shown', m);
    assert.deepEqual(ids(v.snap.queue), [], m);
    assert.deepEqual(ids(v.snap.board), [], m);
    assert.equal(v.snap.homeCount, 0, m);
    assert.equal(v.notified, false, m);
  }
  const desk = await seam.openDesk();
  await desk.read({ records: r, moment: at(T0, 1) });
  for (const via of ['link', 'notice']) {
    const s = await desk.open(K, via);
    assert.equal(s.answerable, false, `${via} offers no answer buttons`);
    assert.deepEqual(s.buttons, [], `${via}: no buttons`);
  }
  await desk.close?.();
});

test('AC2 — notes arrive with a word: shown on the next read of the open desk, that button only; notified at the next run', async () => {
  const held = records({ cards: [card(K)], log: [entry(K, T0)] });
  const noted = records({ cards: [card(K)], files: { [notesPath(K)]: notes('drop') }, log: [entry(K, T0)] });
  const desk = await seam.openDesk();
  const s1 = await desk.read({ records: held, moment: at(T0, 1) });
  assert.deepEqual(ids(s1.queue), []);
  const s2 = await desk.read({ records: noted, moment: at(T0, 1, 10) });
  assert.deepEqual(ids(s2.queue), [K]);
  assert.deepEqual(ids(s2.board), [K]);
  assert.equal(s2.homeCount, 1);
  const sheet = await desk.open(K, 'link');
  assert.equal(sheet.answerable, true);
  assert.deepEqual(marked(sheet), ['drop']);
  assert.ok(saysRecommends(sheet.text, 'drop'), 'card sheet says the Chief of Staff recommends drop');
  await desk.close?.();
  const sender = await seam.openSender();
  assert.equal(noticeIds(await sender.run({ records: held, moment: at(T0, 1) })).includes(K), false);
  assert.equal(noticeIds(await sender.run({ records: noted, moment: at(T0, 1, 10) })).includes(K), true);
  await sender.close?.();
});

test('AC3 — the defect: section 5 never marks a decision card; only the notes word does', async () => {
  // Q-019 stop-1 as it happened: section 5 named re-specify, the notes recommended drop.
  const v = await look(records({ cards: [card(K, 're-specify')], files: { [notesPath(K)]: notes('drop') }, log: [entry(K, T0)] }), at(T0, 2));
  assert.deepEqual(marked(v.sheet), ['drop']);
  // Section 5 alone, whatever word it names: no notes, a day on -> nothing marked.
  for (const s5 of ['drop', 're-specify', 'resubmit']) {
    const n = await look(records({ cards: [card(K, s5)], log: [entry(K, T0)] }), at(T0, 30));
    assert.deepEqual(marked(n.sheet), [], `section 5 names ${s5}: no button marked`);
  }
  // Section 5 and notes differ: only the notes word.
  const d = await look(records({ cards: [card(K, 'drop')], files: { [notesPath(K)]: notes('resubmit') }, log: [entry(K, T0)] }), at(T0, 2));
  assert.deepEqual(marked(d.sheet), ['resubmit']);
  // Section 5 names the same word as the notes: still only that one.
  const s = await look(records({ cards: [card(K, 'drop')], files: { [notesPath(K)]: notes('drop') }, log: [entry(K, T0)] }), at(T0, 2));
  assert.deepEqual(marked(s.sheet), ['drop']);
});

test('AC4 — a day on with no notes: shown with the mark, no button marked, notified; the open desk shows it without a reload', async () => {
  const r = records({ cards: [card(K)], log: [entry(K, T0)] });
  const desk = await seam.openDesk();
  const before = await desk.read({ records: r, moment: at(T0, 23, 59) });
  assert.deepEqual(ids(before.queue), []);
  const after = await desk.read({ records: r, moment: at(T0, 24) });
  assert.deepEqual(ids(after.queue), [K]);
  assert.deepEqual(ids(after.board), [K]);
  assert.equal(after.homeCount, 1);
  const sheet = await desk.open(K, 'link');
  assert.equal(sheet.answerable, true);
  assert.ok(norm(sheet.text).includes(MARK));
  assert.deepEqual(marked(sheet), []);
  await desk.close?.();
  const sender = await seam.openSender();
  assert.equal(noticeIds(await sender.run({ records: r, moment: at(T0, 23, 59) })).includes(K), false);
  assert.equal(noticeIds(await sender.run({ records: r, moment: at(T0, 24) })).includes(K), true);
  await sender.close?.();
});

test('AC5 — the mark gives way when notes with a word arrive', async () => {
  const desk = await seam.openDesk();
  await desk.read({ records: records({ cards: [card(K)], log: [entry(K, T0)] }), moment: at(T0, 25) });
  assert.ok(norm((await desk.open(K, 'link')).text).includes(MARK));
  await desk.read({ records: records({ cards: [card(K)], files: { [notesPath(K)]: notes('re-specify') }, log: [entry(K, T0)] }), moment: at(T0, 26) });
  const s = await desk.open(K, 'link');
  assert.ok(!norm(s.text).includes(MARK));
  assert.deepEqual(marked(s), ['re-specify']);
  await desk.close?.();
});

test('AC6 — notes with no recommended word count as no notes', async () => {
  const bad = [
    '# Notes\n\nWe lean towards `drop`.\n',   // no Recommendation: line
    'Recommendation: drop\n',                   // no backticked word
    'Recommendation: `proceed`\n',              // backticked word not a card word
  ];
  for (const text of bad) {
    const r = records({ cards: [card(K, 'drop')], files: { [notesPath(K)]: text }, log: [entry(K, T0)] });
    const early = await look(r, at(T0, 23));
    assert.equal(early.state, 'not shown', `held in its first day: ${JSON.stringify(text)}`);
    assert.equal(early.notified, false);
    const later = await look(r, at(T0, 24));
    assert.equal(later.state, NOREC, JSON.stringify(text));
    assert.deepEqual(marked(later.sheet), []);
  }
});

test('AC7 — raise time older than the read part of the log: shown at once', async () => {
  const bare = records({ cards: [card(K)], log: [entry('Q-099-dor-1', T0)] });
  const v = await look(bare, T0);
  assert.equal(v.state, NOREC);
  assert.equal(v.notified, true);
  const noted = records({ cards: [card(K)], files: { [notesPath(K)]: notes('drop') }, log: [entry('Q-099-dor-1', T0)] });
  const n = await look(noted, T0);
  assert.equal(n.state, rec('drop'));
  assert.equal(n.notified, true);
});

test('AC8 — notes only on a branch other than main count as no notes', async () => {
  const r = records({ cards: [card(K)], log: [entry(K, T0)], otherRefs: { 'build/chief-of-staff/notes': { [notesPath(K)]: notes('drop') } } });
  assert.equal((await look(r, at(T0, 2))).state, 'not shown');
  assert.equal(stateIn(await seam.ruleList({ records: r, moment: at(T0, 2) }), K), HELD);
  const later = await look(r, at(T0, 25));
  assert.equal(later.state, NOREC);
  assert.deepEqual(marked(later.sheet), []);
});
