// Locked inputs for the baseline runs (spec S-007, "baseline run"). The recorder and the tests
// both build their records from here, so "the same inputs" is true by construction.
import { T0, at, card, gateCard, entry, notes, notesPath, records } from './lib.mjs';

// ---- AC9: every non-decision kind, beside decision cards, under each read failing in turn ----
export const D1 = 'Q-019-stop-1';     // decision, notes recommend drop
export const D2 = 'Q-017-failure-2';  // decision, no notes
export const G1 = 'Q-020-dor-1';      // gate; a notes file sits beside it and must be ignored
export const G2 = 'Q-020-criteria-1';
export const G3 = 'Q-020-launch-1';
export const QN = 'Q-021';            // owner question (seam maps the neutral id)
export const PR = 'pr-42';            // pull-request card (seam maps the neutral id)
export const NON_DECISION = [G1, G2, G3, QN, PR];
export const AC9_MOMENT = at(T0, 2);
export const FAIL_MODES = ['none', 'queue', 'notes', 'log'];

export function ac9Records(mode) {
  const fail = {};
  if (mode === 'queue') fail.queue = true;
  if (mode === 'notes') fail.files = [notesPath(D1)];
  if (mode === 'log') fail.log = true;
  return records({
    cards: [card(D1), card(D2), gateCard(G1, 'proceed'), gateCard(G2, 'recycle'), gateCard(G3, 'proceed')],
    others: [{ kind: 'question', id: QN }, { kind: 'pr', id: PR }],
    files: {
      [notesPath(D1)]: notes('drop'),
      [notesPath(G1)]: notes('drop'), // a gate card's notes: the desk must not look for it (AC9)
    },
    log: [D1, D2, G1, G2, G3].map((id) => entry(id, T0)),
    fail,
  });
}

// ---- AC15 / J4: what the desk opens today for a card not on its list ---------------------------
export const X = 'Q-030-stop-1';
export const NOT_ON_LIST_IDS = [X, D1, D2];
export const NOT_ON_LIST_MOMENT = AC9_MOMENT;
export function notOnListRecords() {
  // Only non-decision cards: none of NOT_ON_LIST_IDS is in queue/.
  return records({
    cards: [gateCard(G1, 'proceed')],
    others: [{ kind: 'question', id: QN }],
    log: [entry(G1, T0)],
  });
}
// Adds the not-on-list context (the gate card and question above) to post-fix records, so the
// desk around a card not on its list matches the baseline's.
export function inNotOnListContext(r) {
  const ctx = notOnListRecords();
  return { ...r, cards: [...ctx.cards, ...r.cards], others: [...ctx.others, ...(r.others ?? [])], log: [...ctx.log, ...r.log] };
}

// ---- AC10: the reads the desk makes --------------------------------------------------------------
export const D3 = 'Q-022-stop-1'; // decision, notes recommend resubmit
export const AC10_MOMENT = AC9_MOMENT;
export function ac10Records() {
  return records({
    cards: [card(D1), card(D2), card(D3), gateCard(G1)],
    files: {
      [notesPath(D1)]: notes('drop'),
      [notesPath(D3)]: notes('resubmit'),
      [notesPath(G1)]: notes('drop'),
      'decisions/Q-090/stop-1-notes.md': notes('drop'), // notes of a card no longer in queue/
    },
    log: [D1, D2, D3, G1].map((id) => entry(id, T0)),
  });
}
// Decision cards in queue/ whose notes file is in the tree: one content read each (AC10).
export const AC10_NOTES_READS = [notesPath(D1), notesPath(D3)];
export const AC10_NOT_READ = [notesPath(G1), 'decisions/Q-090/stop-1-notes.md'];

// ---- AC14: sender sequences -----------------------------------------------------------------------
// Each step gives the records for the post-fix run and the card list (J5 form) the sender should be
// handed at that run; the baseline hands the base sender the lists.
const S = D1; // the one decision card in each sequence, raised T0
const base = (extra = {}) => ({ cards: [card(S)], log: [entry(S, T0)], ...extra });
const withNotes = (w) => ({ [notesPath(S)]: notes(w) });
const shownRec = (w) => [{ id: S, kind: 'decision', state: `shown, recommended ${w}` }];
const shownNo = [{ id: S, kind: 'decision', state: 'shown, no recommendation yet' }];

export const SEQUENCES = {
  // first showing: held, then notes arrive (AC2, AC14)
  firstShow: [
    { moment: at(T0, 1), records: records(base()), list: [] },
    { moment: at(T0, 2), records: records(base({ files: withNotes('drop') })), list: shownRec('drop') },
    { moment: at(T0, 3), records: records(base({ files: withNotes('drop') })), list: shownRec('drop') },
  ],
  // first showing after a day with no notes (AC4, AC14)
  dayPasses: [
    { moment: at(T0, 23, 59), records: records(base()), list: [] },
    { moment: at(T0, 24), records: records(base()), list: shownNo },
    { moment: at(T0, 25), records: records(base()), list: shownNo },
  ],
  // AC5 / AC14 first case: shown with no recommendation, then the word arrives
  changed: [
    { moment: at(T0, 25), records: records(base()), list: shownNo },
    { moment: at(T0, 26), records: records(base({ files: withNotes('drop') })), list: shownRec('drop') },
    { moment: at(T0, 27), records: records(base({ files: withNotes('drop') })), list: shownRec('drop') },
  ],
  // AC14 second case: leaves the list on a failed queue/ read, then shows again
  leaveByFailedRead: [
    { moment: at(T0, 2), records: records(base({ files: withNotes('drop') })), list: shownRec('drop') },
    { moment: at(T0, 3), records: records(base({ files: withNotes('drop'), fail: { queue: true } })), list: [] },
    { moment: at(T0, 4), records: records(base({ files: withNotes('drop') })), list: shownRec('drop') },
  ],
  // AC14 second case: leaves the list on a failed notes read, then shows again
  leaveByFailedNotes: [
    { moment: at(T0, 2), records: records(base({ files: withNotes('drop') })), list: shownRec('drop') },
    { moment: at(T0, 3), records: records(base({ files: withNotes('drop'), fail: { files: [notesPath(S)] } })), list: [] },
    { moment: at(T0, 4), records: records(base({ files: withNotes('drop') })), list: shownRec('drop') },
  ],
  // AC14 second case: leaves the list back to held (notes removed in its first day), then shows again (J3)
  leaveToHeld: [
    { moment: at(T0, 2), records: records(base({ files: withNotes('drop') })), list: shownRec('drop') },
    { moment: at(T0, 3), records: records(base()), list: [] },
    { moment: at(T0, 4), records: records(base({ files: withNotes('drop') })), list: shownRec('drop') },
  ],
  // AC17: log not got, a card without notes is not shown, then shows once the log is read
  logFails: [
    { moment: at(T0, 25), records: records(base({ fail: { log: true } })), list: [] },
    { moment: at(T0, 26), records: records(base()), list: shownNo },
  ],
};
export const SEQUENCE_CARD = S;
