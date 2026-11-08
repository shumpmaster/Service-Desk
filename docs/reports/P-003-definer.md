I've drafted S-004 as the spec that replaces S-003, and marked S-003 superseded. It is a draft, not frozen, and goes to the Critic next.

## 1. What I changed
- **New file `specs/S-004.md`** (status `draft`, `milestones: M4`, lineage `[S-001, S-002, S-003]`, work type `fix`).
  - **Read failures follow the plan now.** S-003's AC16 is split in two:
    - **AC16:** if a read can't get queue/ or the notes, no decision card is shown, counted or notified. The queue and Home name what failed, with exact wording for the line.
    - **AC17:** if a read can't get the dispatch log, cards whose notes give a recommended word still show and notify as usual. The rest are left off, with the line "Decision cards without Chief of Staff notes not shown: the dispatch log could not be read", shown only while at least one card is actually left off.
  - **Views and sender agree (AC11 and the card-list join, J3):** a read that misses some records gives a card no state or the same state as a full read, never a different one.
  - **Monitoring (AC13 and a new join, J6):** these say exactly what the rule hands the Chief of Staff's V6 count, and how the count's two kinds of miss are worked out. The rule also runs on records from before M4 was live, so the count can be tried on past records before the Launch gate.
  - **AC18 (operating notes) is back,** owned by the Builder in the handover package. That adds `docs/handover/**` to the areas the work touches.
  - **AC19:** the owner's feedback (filed as a question) and the review card after 2026-12-31 follow the existing rules for their kind of card.
  - **Notifications (AC14, AC15):** these now also cover a card that leaves the list because a read failed.
  - Join tests are relabelled `S-004/J1`–`J6`, and the size estimate is restated.
  - S-003's open question 1 is closed. Three questions remain, and none holds up the freeze.
- **`specs/S-003.md`:** I changed only the status word to `superseded`. The brief expected it to read `frozen`, but it read `draft`. I replaced that word and left the rest of the line, including "(not ready to freeze until the owner rules on open question 1)", untouched.

## 2. Why
- The owner ruled S-003's criteria wrong ("criteria-wrong", "flawed plan", `stop-6.md`). S-003 had broken from the plan on what happens when the log can't be read. The plan's section 1 now settles that case itself, so S-004 takes the plan's words.
- The plan's section 4 gives the operating notes to the Builder, and its section 6 relies on "the spec's monitoring criterion". So both belong in the spec.
- The `stop-5.md` ruling still holds: the weekly check, the reports and the end-of-year card stay with the Chief of Staff, outside this spec.
- `dor-3`, `dor-4`, `dor-fail-1` and `dor-fail-2` are rulings on the plan, and none changes the criteria.

## 3. What I verified
- A search for trace tags in S-004 found 19 criteria (AC1–AC19), each traced to V6.
- A search for status lines shows S-003 `superseded`, S-004 `draft` and S-002 unchanged; S-004 has no `S-003/J` labels left.
- I re-read the `docs/PROJECT.md` lines S-004 cites (85, 121, 125, 127, 540, 588, 616) and the library entries F-cf-02, P-notice-actionable-01, P-stale-visible-01 and F-automation-complacency-01. They say what S-004 says they do.
- No tests were run; this lane writes no code.

## 4. What is undone
- **Not committed:** this folder isn't a git repository, so nothing went to `build/definer/P-003`.
- **Not reviewed or frozen:** S-004 still needs the Critic's plan review, the freeze gate and the owner's scenario card.
- **Size:** the restated estimate is about 90–130 lines and 15–23 tests. The top of that is close to the stop rule's 24 tests.

## 5. Needed outside my lane
- **Critic:** the plan review of S-004.
- **Builder:** name the exact operating-notes file under `docs/handover/` in the build's return.
- **Check author:** the locked checks for S-004 once it is frozen.
- **Chief of Staff:** the weekly count, reports, feedback questions and review card, as the plan already says.
- **Not in this pack:** the sizing findings, S-003's plan review and the owner's original ruling record. I relied on them second-hand, as the spec's limits say.

## 6. Open questions
- **For the owner** (S-004's three, none blocking the freeze):
  1. Should a later change stop the sender from repeating a notice?
  2. Is it acceptable that a malformed future raise time holds a card until that time plus a day?
  3. A single notes file that can't be fetched hides every decision card, as the plan's wording reads. Is that acceptable, or should it hide only that card?
- **For the Critic and owner:** I added `docs/handover/**` to the areas touched for AC18. Please confirm that is within the fix's scope.
- **For the Critic and owner:** S-003's leftover wording "(not ready to freeze until…)" now sits next to `superseded`. Was keeping it unchanged the intent?