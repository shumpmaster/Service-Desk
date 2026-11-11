// S-007 AC14 (the sender, unchanged, sends at first showing and as today otherwise) and AC15
// (nothing withdrawn; a notice or link to a card off the list opens the not-on-list view).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seam, baseline, gitOk, T0, at, card, entry, notes, notesPath, records, norm, noticeIds, marked } from './lib.mjs';
import { SEQUENCES, SEQUENCE_CARD as S, X, D1, inNotOnListContext } from './scenarios.mjs';

async function runSequence(steps) {
  const sender = await seam.openSender();
  const out = [];
  for (const step of steps) out.push(noticeIds(await sender.run({ records: step.records, moment: step.moment })));
  await sender.close?.();
  return out;
}

test('AC14 — src/notify/** is unchanged from the base commit', () => {
  const base = baseline().baseCommit;
  assert.ok(gitOk('cat-file', '-e', `${base}^{commit}`), 'base commit present (CI: fetch-depth 0)');
  assert.ok(gitOk('diff', '--quiet', base, 'HEAD', '--', 'src/notify/'), 'src/notify/** changed in a commit: the build must stop and return (J5)');
  assert.ok(gitOk('diff', '--quiet', 'HEAD', '--', 'src/notify/'), 'src/notify/** changed in the working tree');
});

test('AC14 — the lists the post-fix code hands the sender are the ones the baseline was given', async () => {
  for (const [name, steps] of Object.entries(SEQUENCES)) {
    const sender = await seam.openSender();
    for (const [i, step] of steps.entries()) {
      const l = await sender.list({ records: step.records, moment: step.moment });
      const shown = (l.cards ?? []).filter((c) => c.kind === 'decision' && c.state !== 'held').map(({ id, kind, state }) => ({ id, kind, state }));
      assert.deepEqual(shown, step.list, `${name} step ${i}`);
    }
    await sender.close?.();
  }
});

test('AC14 — no notice while held or not shown; one at the first run the card is shown', async () => {
  const first = await runSequence(SEQUENCES.firstShow);
  assert.deepEqual(first[0], [], 'held: no notice');
  assert.deepEqual(first[1], [S], 'first showing (notes arrive): notice');
  const day = await runSequence(SEQUENCES.dayPasses);
  assert.deepEqual(day[0], [], 'held: no notice');
  assert.deepEqual(day[1], [S], 'first showing (a day passes): notice');
  const changed = await runSequence(SEQUENCES.changed);
  assert.deepEqual(changed[0], [S], 'first showing (no recommendation yet): notice');
  const log = await runSequence(SEQUENCES.logFails);
  assert.deepEqual(log[0], [], 'not shown on a failed log read: no notice');
  assert.deepEqual(log[1], [S], 'first showing: notice');
  for (const name of ['leaveByFailedRead', 'leaveByFailedNotes', 'leaveToHeld']) {
    const r = await runSequence(SEQUENCES[name]);
    assert.deepEqual(r[0], [S], `${name}: first showing`);
    assert.deepEqual(r[1], [], `${name}: off the list: no notice`);
  }
});

for (const name of Object.keys(SEQUENCES)) {
  test(`AC14 — notices equal the base sender's for the same list sequence (${name})`, async () => {
    const base = baseline().ac14[name];
    assert.ok(Array.isArray(base) && base.length === SEQUENCES[name].length, 'baseline recorded this sequence');
    const got = await runSequence(SEQUENCES[name]);
    assert.deepEqual(got, base.map((r) => noticeIds(r)));
  });
}

const sheetCore = (s) => ({ answerable: s.answerable, buttons: s.buttons, text: norm(s.text) });

test('AC15 — a held or not-shown decision card: notice and link open what the base desk opens for a card not on its list', async () => {
  const b = baseline().notOnList[X];
  assert.ok(b?.link && b?.notice, 'baseline recorded the not-on-list views');
  const heldRecs = inNotOnListContext(records({ cards: [card(X)], log: [entry(X, at(T0, 1))] }));
  const shownRecs = inNotOnListContext(records({ cards: [card(X)], files: { [notesPath(X)]: notes('drop') }, log: [entry(X, at(T0, 1))] }));
  const cases = [
    ['held', heldRecs],
    ['queue/ not read', { ...shownRecs, fail: { queue: true } }],
    ['notes not read', { ...shownRecs, fail: { files: [notesPath(X)] } }],
    ['log not read, no notes', { ...heldRecs, fail: { log: true } }],
  ];
  for (const [name, r] of cases) {
    const desk = await seam.openDesk();
    await desk.read({ records: r, moment: at(T0, 2) });
    for (const via of ['link', 'notice']) {
      const s = await desk.open(X, via);
      assert.equal(s.answerable, false, `${name} / ${via}: no answer buttons`);
      assert.deepEqual(sheetCore(s), sheetCore(b[via]), `${name} / ${via}`);
    }
    await desk.close?.();
  }
});

test('AC15 — a notice sent, the card goes back to held: the notice opens the not-on-list view', async () => {
  // Shown with notes, then the notes are removed within its first day (J3).
  const shown = inNotOnListContext(records({ cards: [card(X)], files: { [notesPath(X)]: notes('drop') }, log: [entry(X, T0)] }));
  const held = inNotOnListContext(records({ cards: [card(X)], log: [entry(X, T0)] }));
  const desk = await seam.openDesk();
  await desk.read({ records: shown, moment: at(T0, 2) });
  assert.equal((await desk.open(X, 'notice')).answerable, true);
  await desk.read({ records: held, moment: at(T0, 3) });
  for (const via of ['link', 'notice']) {
    const s = await desk.open(X, via);
    assert.deepEqual(sheetCore(s), sheetCore(baseline().notOnList[X][via]), via);
  }
  await desk.close?.();
});

test('AC15 — once the card shows again, the notice and link open it as shown', async () => {
  const shown = records({ cards: [card(D1)], files: { [notesPath(D1)]: notes('drop') }, log: [entry(D1, T0)] });
  const desk = await seam.openDesk();
  await desk.read({ records: { ...shown, fail: { queue: true } }, moment: at(T0, 2) });
  assert.equal((await desk.open(D1, 'notice')).answerable, false);
  await desk.read({ records: shown, moment: at(T0, 3) });
  for (const via of ['link', 'notice']) {
    const s = await desk.open(D1, via);
    assert.equal(s.answerable, true, via);
    assert.deepEqual(marked(s), ['drop'], via);
  }
  await desk.close?.();
});

test('AC15 — the fix withdraws nothing', async () => {
  for (const name of ['leaveByFailedRead', 'leaveByFailedNotes', 'leaveToHeld', 'logFails']) {
    const sender = await seam.openSender();
    for (const step of SEQUENCES[name]) {
      const r = await sender.run({ records: step.records, moment: step.moment });
      assert.deepEqual(r.withdrawn ?? [], [], name);
    }
    await sender.close?.();
  }
});
