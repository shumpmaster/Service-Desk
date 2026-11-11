# S-007 review rubric: the criteria a test cannot fully check

Locked with tests/acceptance/S-007/. Written by check-author from the frozen spec (specs/S-007.md)
only. The Reviewer applies each item to the build's diff and handover and records PASS or FAIL with
the evidence (file and line). Any FAIL fails the build.

## R1. The seam carries no logic (all join tests)
- [ ] `tests/desk/s007-seam.mjs` (and any stand-in it uses) contains no rule logic: no age arithmetic, no `Recommendation:` parsing, no kind-from-gate parsing, no pick between two `card` entries, and no state strings worked out in the seam. It only builds inputs from the neutral records and reports what src/ code returns.
- [ ] The seam feeds records through the desk's real read path (real log reader, real tree read, real card-sheet code from src/public/sandbox.js). Only the network is replaced.
- [ ] The views' results (`queue`, `board`, `homeCount`, `lines`, `Sheet`) are read from what the real view code renders, not from the rule's list.
- [ ] `Sender.run` and `Sender.list` run the real src/notify/** code. `senderFromLists` changes no file under src/notify/**; any stand-in it uses lives under tests/desk/.
- [ ] `monitor` calls the same rule code in src/lib/ that the views and the sender use (AC11, AC13), not a copy.

## R2. AC10: no new access (static part)
- [ ] The diff adds no new repository, host or origin to any read, and no new credential, secret or token name (search the diff for `fetch(`, URLs, `env.`, `process.env`, `secret`, `token`).
- [ ] The diff adds no write (no POST/PUT/PATCH/DELETE, no commit or contents API write) and no call to a new outside service.
- [ ] Whether a notes file exists comes from the file tree the desk already reads. Notes content is read only for decision cards in queue/ whose notes file is in that tree, once each per read.
- [ ] No change to the desk's read schedule or polling interval.

## R3. AC12: running needs nothing new
- [ ] The diff adds no new setting, environment variable, binding, secret, cron or schedule, workflow step, or manual step for the owner or any agent (check wrangler/Pages config, `.github/**`, package manifests and any config files in the diff).
- [ ] The notes reads run inside the existing read cycle, so they start and stop with it.

## R4. AC13: the monitoring run (static part)
- [ ] There is a way to run the rule on the records at a past commit and a chosen moment (a script or exported call, named in the operating notes) that gives, for each decision card in queue/ at that commit, its id, its raise time as recorded (or `not recorded`) and its state, or the AC16 / AC17 flag.
- [ ] That run reads nothing but the records at that commit and the moment it is given: no clock of its own (no `Date.now()` / `new Date()` without an argument on its path), no network, nothing stored between runs.
- [ ] It works on records from before M4 was live: it needs no record, field or file that M4 adds.

## R5. AC18: operating notes in the handover package (docs/handover/**)
The Builder names the file in the build's return. In plain words, the notes say:
- [ ] what a held decision card is and when it shows (notes with a recommended word, a day after its recorded raise time, or at once if raised before the part of the log read);
- [ ] what "No Chief of Staff recommendation yet" means, and that it gives way when notes arrive;
- [ ] what each of the three lines means, word for word: "Decision cards not shown: queue/ could not be read", "Decision cards not shown: the Chief of Staff's notes could not be read", "Decision cards without Chief of Staff notes not shown: the dispatch log could not be read". Also that they show on the queue and Home only, and that the cards come back by themselves once the records are read;
- [ ] how to run the rule on the records at a commit and a moment (AC13): the command or call, its inputs and its output (id, raise time or `not recorded`, state, or the flag);
- [ ] how to work out J6's check moments (main line = first-parent history; the commit current at a moment; a card's arrival; due time plus each later commit changing queue/, a notes file, the dispatch log or the rule's code in src/lib/; stop at the first commit without the card file; the rule's code as at that commit, or as M4 merged it for a commit before M4) and its two figures (V6 due = recorded raise time + 24h, a card with no recorded raise time is never held; second figure due = arrival + 24h; a failed read at a check moment is reported as a failed read, not a miss);
- [ ] that the V6 held-too-long figure can be other than 0 only if the rule's code on the main branch changes after M4, that the second figure finds holds caused by a skewed or malformed raise time, and that neither finds a view showing a card with neither mark;
- [ ] how to roll back: redeploy the previous production deployment of the desk, then revert the merge.
- [ ] No internal codes are left unexplained (state strings and flags appear only beside their meaning).

## R6. AC19: feedback and the review card need no change
- [ ] Nothing in the diff special-cases questions or review cards by id or title. A question goes through the unchanged path (AC9 tests), and a review card that is a decision card goes through the one rule like any other (AC1 to AC8 tests).

## R7. Mark and line style (join-up review, "consistent type")
- [ ] The mark uses the card sheet's existing label style, and the three lines use the queue's and Home's existing notice style. No new colours or classes are added beyond what that needs.

## R8. One rule, in one place (AC11, J3)
- [ ] The state is worked out in one place in src/lib/. The queue, Home's count, the board, the card sheet (src/public/sandbox.js and its generated copies) and the sender all take the list it makes; no view works out a decision card's state, age or word on its own.
- [ ] The generated copies of src/public/sandbox.js are regenerated from it, not hand-edited.

## R9. Locked checks and the baseline untouched
- [ ] No file under tests/acceptance/S-007/ or checks/S-007/ is changed by the build branch.
- [ ] `tests/desk/S-007-baseline.json` names the base commit, and that commit is on the main branch (the build's base, before any change for this fix).
