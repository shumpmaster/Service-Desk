# Locked checks for S-005 (P-003): decision cards show the Chief of Staff's recommendation, or say they have none

Written by check-author from the frozen spec (specs/S-005.md) and its join sheets alone, before any
work exists. Once locked, these files are read-only to everyone, check-author included. A change
needs a new spec that supersedes S-005.

Run: `node --test tests/acceptance/S-005/` (Node 20+, no dependencies). The provenance checks need
full git history (CI: `fetch-depth: 0`).

| File | Covers |
|---|---|
| j1-queue-log-to-rule.test.mjs | `join-test: S-005/J1` |
| j2-notes-to-rule.test.mjs | `join-test: S-005/J2` |
| j3-rule-to-list.test.mjs | `join-test: S-005/J3` |
| j4-list-to-views.test.mjs | `join-test: S-005/J4` |
| j5-list-to-sender.test.mjs | `join-test: S-005/J5` |
| j6-ac13-v6-count.test.mjs | `join-test: S-005/J6`, AC13 |
| ac01-08-hold-and-show.test.mjs | AC1–AC8 (AC3 includes the reported defect, Q-019 stop-1) |
| ac09-10-unchanged.test.mjs | AC9, AC10 (against the baseline) |
| ac11-agree.test.mjs | AC11 |
| ac14-15-notices.test.mjs | AC14, AC15 (against the baseline; src/notify/** unchanged) |
| ac16-17-failed-reads.test.mjs | AC16, AC17 |
| baseline-provenance.test.mjs | the spec's "baseline run" definition |
| checks/S-005/rubric.md | AC10 (static part), AC12, AC18, AC19: reviewer rubric |
| checks/S-005/mutants.md | the broken versions these checks must catch (D-046) |

## Why there is a seam

The check author does not see src/ (D-006), so these checks cannot name the desk's modules. They
reach the real code through one adapter that the **Builder** writes at
`tests/desk/s005-seam.mjs` (path can be overridden with `S005_SEAM`). The seam does no logic of its own.
It turns the neutral records below into the inputs the real code reads (files, fetch responses, log
lines in the real format), calls the real code in src/lib/, src/public/sandbox.js and src/notify/**,
and reports what that code gives back. Any rule logic in the seam is a review failure (checks/S-005/rubric.md R1).

Join tests are real-on-real: the seam must feed the records through the same read path the desk uses
(the real log reader, the real file-tree read, the real card-sheet code). It may replace only the
network itself, for example with a fake `fetch` that serves the records and logs each request.

## The seam contract

```js
export const baseCommit;      // full 40-hex id of the build's base commit
export const cardFileForm;    // the card-file form found in src/lib, e.g. 'queue/<item>-<gate>-<n>.md' (J1)
export const logReader = {    // facts about the existing log reader (J1)
  cardEntryFields: [...],     // field names of a `card` entry
  duplicates: 'all' | 'first' | 'last',  // which entries it returns when a card has two
};

// The one rule's list (J3). Not needed at the base commit.
export async function ruleList({ records, moment })
  -> { cards: [{ id, kind: 'decision'|'gate'|'question'|'pr', state }], flags: [string] }
     // state for decision cards: 'held' | 'shown, recommended <word>' | 'shown, no recommendation yet'
     // state for other kinds: null. A decision card the read cannot decide is absent.
     // flags: 'decision cards not read: <queue/ | notes>' (one flag naming either or both, or one
     //        flag each) and 'decision cards without notes not read: dispatch log' (J3).

// The rule run for the V6 count (AC13, J6). Not needed at the base commit.
export async function monitor({ records, moment })
  -> { entries: [{ id, raised: ISO 8601 | 'not recorded', state }], flags: [string] }

// The desk as the owner sees it (queue, Home, board, card sheet). Needed at the base commit.
export async function openDesk() -> Desk
  Desk.read({ records, moment }) -> {
    queue: [{ id, text }], board: [{ id, text }], homeCount: number,
    lines: { queue: [string], home: [string] },     // notice lines shown on each
    requests: [{ method, url, auth }],              // every request this read made; auth = a hash
  }                                                 // of the credential sent, or null
  Desk.open(id, via: 'link' | 'notice') -> Sheet    // opens the card sheet as a direct link / a notice would
  Desk.currentSheet() -> Sheet                      // the open sheet as it stands after later reads
  Desk.close()                                      // optional
  Sheet = { id, answerable: boolean, buttons: [{ word, recommended: boolean }], text: string }
          // text: the sheet's visible text; buttons: [] when no answer buttons are offered

// The notification sender, src/notify/** unchanged. Needed at the base commit.
export async function openSender() -> Sender
  Sender.list({ records, moment }) -> same shape as ruleList: the list the sender takes from the
                                      card-making code at the J5 point (not needed at base)
  Sender.run({ records, moment })  -> { notices: [{ id }], withdrawn?: [{ id }] }
                                      // one sender run; the sender's own memory of what it sent
                                      // is kept inside the Sender between runs
  Sender.close()                   // optional

// Baseline only (AC14): the base sender handed a sequence of card lists at the point where it takes
// the list from the card-making code. Each list item is { id, kind, state } (J5); the seam maps it
// to today's card shape. A test stand-in for the card-making module, under tests/desk/, is allowed
// (AC14); a change under src/notify/** is not: stop and return (J5).
export async function senderFromLists(lists) -> [{ notices: [{ id }] }]   // one per list
```

The moment is always handed in (ISO 8601). The seam must not read a clock for the rule. AC11 moves
the process clock and expects no change.

## Records (neutral form)

```js
{
  cards:  [{ id: 'Q-019-stop-1', words: ['drop','re-specify','resubmit'], section5: 're-specify' }],
          // card files in queue/ on the main branch; id is <item>-<gate>-<n>; words are the answer
          // buttons; section5 is the word the card's own section 5 (or gate case) names
  others: [{ kind: 'question' | 'pr', id }],        // owner questions and pull-request cards
  files:  { 'decisions/Q-019/stop-1-notes.md': '...' }, // other files on the main branch, verbatim
  log:    [{ card: 'Q-019-stop-1', raised: ISO }],  // `card` entries, in log order, all inside the
          // part of the log the existing reader reads. A card with no entry here was raised before
          // that part (AC7). The seam writes them in the real log format.
  otherRefs: { '<branch>': { path: text } },        // files that exist only on another branch (AC8)
  fail:   { queue?: true, files?: [paths], log?: true },
          // reads that fail: queue/; the content of the listed files (they stay in the tree); the log
}
```

## The baseline (spec S-005, "baseline run")

1. At the base commit, before any change under src/, the Builder writes the seam (it must work on
   the base code for `openDesk`, `openSender().run` and `senderFromLists`).
2. Run `node tests/acceptance/S-005/record-baseline.mjs`. It refuses if src/ differs from
   `baseCommit`, and writes `tests/desk/S-005-baseline.json`.
3. Commit that file before any change under src/, and never change it again.
   baseline-provenance.test.mjs checks all three.

The inputs of every baseline run are in scenarios.mjs, shared by the recorder and the tests.
