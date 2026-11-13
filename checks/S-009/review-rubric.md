# S-009 review rubric: the criteria parts no J7-form check reaches (locked)

*Check author, from specs/S-009.md (frozen). The locked checks reach the code only through J7's
case and output forms (the adapter). The items below are worded in the spec in terms those forms
cannot observe, so they are judged at the build's review by a reader of the diff. Each names its
criterion. None of them replaces a locked test; each says what the tests already cover.*

| # | Criterion | Pass when | Tests that cover the rest |
|---|---|---|---|
| R1 | AC3 | The decision card's own section 5 marks no button, whatever word it names (the J7 card file has no `## 5.` section, so no case can carry one). | s009-hold-show AC3 |
| R2 | AC4, AC5 | An open, visible desk shows the card on its next 60-second read without a reload, and the mark gives way on the next read; the read schedule (60 s while visible, none while hidden, a read once visible) is unchanged. | s009-hold-show AC4/AC5, s009-j3 (same records and moment give the same bytes) |
| R3 | AC8 | Notes are read only from the main branch's tree; no branch or pull-request read is added. | s009-hold-show AC8 |
| R4 | AC10 | The notes are read through `neededReads` and the existing blob call (desk) and checkout `blobs` (sender); no new repository, credential, write or outside service; one content read per decision card in queue/ whose notes file is in the tree. | s009-j8 (a notes failure keyed by path takes effect) |
| R5 | AC11 | The rule reads no clock: its caller hands it the moment, and every view and the sender take the one list it makes. | s009-j4 (views agree at three moments), s009-j3 |
| R6 | AC12 | No new setting, credential, schedule or step. | s009-j7 (the adapter, unchanged, runs on the built code) |
| R7 | AC13, J6 | The rule can be run on the records at a past commit and a moment, and gives a list with each decision card's id, raise time as recorded (ISO 8601 or `not recorded`) and state, or the AC16/AC17 flag; it reads no clock, network or stored state. | s009-j6 (states and the two figures from J7 desk results) |
| R8 | AC14, J5 | No file under src/notify/** changes. | s009-j7, s009-j5 |
| R9 | J3 | A card answered while held leaves the list, as any answered card does (the case form has no answer records). | none |
| R10 | J4 | A card sheet left open while the card's state changes, or while a read fails, follows J4's awkward cases (a J7 case is one read). | s009-j4 |
