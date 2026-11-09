// join-test: S-005/J4
// The card list -> the views: the queue, Home's count, the board, and the card sheet
// (src/public/sandbox.js and its generated copies), driven through the seam's real desk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  seam, baseline, T0, at, card, entry, notes, notesPath, records,
  MARK, LINES, norm, hasLine, ids,
} from './lib.mjs';
import { X, D1, D2, inNotOnListContext } from './scenarios.mjs';

const H = X;   // held: raised an hour before the read, no notes
const R = D1;  // shown, recommended drop
const N = D2;  // shown, no recommendation yet
const M = at(T0, 2);

function recs(extra = {}) {
  return records({
    cards: [card(H), card(R), card(N)],
    files: { [notesPath(R)]: notes('drop') },
    log: [entry(H, at(T0, 1)), entry(R, T0), entry(N, at(T0, -25))],
    ...extra,
  });
}
const sheetCore = (s) => ({ answerable: s.answerable, buttons: s.buttons, text: norm(s.text) });

test('join-test: S-005/J4 — held cards appear in no view; shown cards appear in all', async () => {
  const desk = await seam.openDesk();
  const snap = await desk.read({ records: recs(), moment: M });
  assert.deepEqual(ids(snap.queue), [R, N].sort());
  assert.deepEqual(ids(snap.board), [R, N].sort());
  assert.equal(snap.homeCount, 2);
  for (const where of ['queue', 'home']) for (const l of Object.values(LINES)) assert.ok(!(snap.lines[where] ?? []).map(norm).includes(l), `no "${l}" on ${where}`);
  await desk.close?.();
});

test('join-test: S-005/J4 — recommended card: sheet names the word, marks that button only', async () => {
  const desk = await seam.openDesk();
  await desk.read({ records: recs(), moment: M });
  const s = await desk.open(R, 'link');
  assert.equal(s.answerable, true);
  assert.deepEqual(s.buttons.filter((b) => b.recommended).map((b) => b.word), ['drop']);
  assert.deepEqual(s.buttons.map((b) => b.word).sort(), ['drop', 're-specify', 'resubmit']);
  assert.ok(/Chief of Staff/.test(s.text) && /drop/.test(s.text), 'sheet says the Chief of Staff recommends drop');
  assert.ok(!norm(s.text).includes(MARK));
  await desk.close?.();
});

test('join-test: S-005/J4 — no-recommendation card: sheet shows the mark, marks no button', async () => {
  const desk = await seam.openDesk();
  await desk.read({ records: recs(), moment: M });
  const s = await desk.open(N, 'link');
  assert.equal(s.answerable, true);
  assert.deepEqual(s.buttons.filter((b) => b.recommended), []);
  assert.ok(norm(s.text).includes(MARK));
  await desk.close?.();
});

test('join-test: S-005/J4 — flags show their exact lines on the queue and on Home', async () => {
  const cases = [
    [{ queue: true }, ['queue']],
    [{ files: [notesPath(R)] }, ['notes']],
    [{ queue: true, files: [notesPath(R)] }, ['queue', 'notes']],
    [{ log: true }, ['log']],
  ];
  for (const [fail, want] of cases) {
    const desk = await seam.openDesk();
    const snap = await desk.read({ records: recs({ fail }), moment: M });
    for (const where of ['queue', 'home']) {
      for (const w of ['queue', 'notes', 'log']) {
        assert.equal(hasLine(snap.lines[where], w), want.includes(w), `${JSON.stringify(fail)}: line ${w} on ${where}`);
      }
    }
    await desk.close?.();
  }
});

test('join-test: S-005/J4 — direct link or notice to a held card opens what the desk opens for a card not on its list', async () => {
  const b = baseline().notOnList[H];
  const desk = await seam.openDesk();
  await desk.read({ records: inNotOnListContext(recs()), moment: M });
  for (const via of ['link', 'notice']) {
    const s = await desk.open(H, via);
    assert.equal(s.answerable, false, `${via}: no answer buttons offered`);
    assert.deepEqual(sheetCore(s), sheetCore(b[via]), `${via}: equals the base commit's not-on-list view`);
  }
  await desk.close?.();
});

test('join-test: S-005/J4 — a sheet left open: the mark gives way to the word on the next read', async () => {
  const desk = await seam.openDesk();
  await desk.read({ records: recs(), moment: M });
  const before = await desk.open(N, 'link');
  assert.ok(norm(before.text).includes(MARK));
  await desk.read({ records: recs({ files: { [notesPath(R)]: notes('drop'), [notesPath(N)]: notes('resubmit') } }), moment: at(M, 0, 5) });
  const after = await desk.currentSheet();
  assert.ok(!norm(after.text).includes(MARK), 'mark gone');
  assert.deepEqual(after.buttons.filter((x) => x.recommended).map((x) => x.word), ['resubmit']);
  await desk.close?.();
});

test('join-test: S-005/J4 — a sheet left open when a read fails shows the not-on-list view', async () => {
  for (const fail of [{ queue: true }, { files: [notesPath(R)] }]) {
    const desk = await seam.openDesk();
    await desk.read({ records: inNotOnListContext(recs()), moment: M });
    await desk.open(R, 'link');
    await desk.read({ records: inNotOnListContext(recs({ fail })), moment: at(M, 0, 5) });
    const s = await desk.currentSheet();
    assert.equal(s.answerable, false);
    assert.deepEqual(sheetCore(s), sheetCore(baseline().notOnList[R].link), JSON.stringify(fail));
    await desk.close?.();
  }
});
