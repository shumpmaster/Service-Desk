# S-009 — the Critic's review of the locked checks (the outside-build plan, step 5)

*Recorded by the Chief of Staff's session (session_01QBwHGMmHGgB3fLufS5ELH2) as `orchestrator`, under L-0051. Each round's Critic return, verbatim under its heading; the latest round first, as the pipeline reads this record's first verdict. At most three rounds; a third failure goes back to the owner.*

## Round 1 — checks at build/check-author/S-009 37181d0 (session branch 47e0530); dispatched about 2026-11-13T15:08Z, returned about 15:14Z (times from the session, approximate)

Verdict: FAIL

One blocking gap: a plausible wrong build can break AC9 for gate cards and still pass every locked check. Everything else is non-blocking. The J7 check carries out line 23 and J7 as written, the case set meets J7's list and all its coverage rules, every join J1 to J8 carries its mark, and I found no check that a correct build cannot pass. The fix is in the checks only, and this is round 1 of 3.

Read: specs/S-009.md (all 296 lines), every file under tests/acceptance/S-009/ (all 12 case files), tests/acceptance/package.json, tests/acceptance/run-all.cjs, tests/acceptance/README.md, checks/S-009/AC18-rubric.md and checks/S-009/review-rubric.md, all in /home/user/wt-check-author-S-009 at build/check-author/S-009. I did not read src/, tests/desk/ or the reading. I ran nothing; every finding comes from reading.

## Blocking

**B1. A gate card's notes are never tested, so AC9 can be broken with every check passing.**
- **What AC9 requires.** A gate card's Recommended mark comes "from its gate case as today, and the desk does not look for notes for it" (spec :36). Today, a gate card with no gate case falls back to its own section 5 (spec :229). AC10 allows one notes read only "for each decision card in queue/" (spec :37, :175).
- **What the cases hold.** In every case, the only gate card with notes is the `dor` card, and it also has a gate case (cases/baseline/S009-B-desk-ok.json:36-42, the same in every desk and open baseline case). The `criteria` and `launch` cards have neither. The built-only background gate card P-100-dor-1 has no notes (s009-lib.mjs:152-159). No J-test adds notes to a gate card.
- **The wrong build that passes.** It works out the mark as gate case first, then notes, then section 5 for gate cards only: `mark = gateCase ?? notesWord ?? (decision ? null : section5)`. The `dor` card still shows its gate case's word, and nothing else in the cases tells the difference. So every comparison passes (s009-j7-baseline.test.mjs:133-142), and so do the coverage mark rule (:79-83) and every J-test.
- **A second wrong build that passes.** It reads a gate card's notes file but ignores it. With `notes` failing, it would then hide every decision card and show the AC16 line and a "Can't read" line, even when the rule needs no notes file.
- **Why the rubric does not cover it.** Both breaks can be seen through J7's forms. Rubric R4 (review-rubric.md:13) covers reads only in general terms, so it is not standing in for something the forms cannot see.
- **Fix needed in the checks.** Add a `criteria` or `launch` card with notes naming one of its words and no gate case: as a baseline case beside a no-failure twin, or as a built-only case asserting `marked: null` (the card file has no section 5, spec :150). Add a built-only J8-style case where the only notes are a gate card's, with `notes` failing, asserting no notes line, no "Can't read" line and a non-empty `notices`, as s009-j8-reads.test.mjs:52-62 already does for an unneeded `stop-2` file.

## Non-blocking

**N1. The check does not require the record to hash the tests/desk/ helpers the adapter imports.**
- s009-j7-baseline.test.mjs:50-51 requires hashes only for the adapter and the case files. Line 23 and J7 :158 say the record hashes "each other file under tests/ the adapter reads": fake-desk.mjs, sandbox-helpers.mjs and notify-helpers.mjs (spec :148).
- tests/desk/** is in the Builder's lane (spec :202). The Reviewer's re-run uses the base commit's helpers, so it cannot see a helper changed in the second dispatch.
- If the session's record leaves a helper out, the built side could run on a changed helper and nothing would notice. The check could require a hash for every tests/ file the adapter imports, which it can find statically.

**N2. AC13 and J6: the list the rule hands to the count cannot be tested. This is a gap in the spec, not in the checks.**
- The spec asks for a test that checks "the id, raise time and state the rule gives each card" (spec :45), and for J6's test to cover "the handed-over list's form" (spec :145).
- J7's forms give no entry point for that list. s009-j6-count.test.mjs:4-8 says so, and works out states from `desk` results instead.
- So a build with no runnable list, or one that reports a wrong raise time (`not recorded` for case (c)), passes every check. Only rubric R7 catches it (review-rubric.md:16).
- The rubric is a fair stand-in because the forms truly cannot see this. Triage should route it to the spec stage. The J6 mark covers the rule's states at the check moments, not the list.

**N3. AC2's "only that one" button marked, and "its card sheet says the Chief of Staff recommends that word", are not really checked, and the rubric does not list them.**
- `marked` is a single word (spec :154), so a sheet marking two buttons cannot be seen.
- `o.shows.includes('re-specify')` (s009-hold-show.test.mjs:44) is true anyway, because every card file's Options lines hold each word (spec :150).
- Add both to review-rubric.md.

**N4. The AC18 test asks for more than AC18 does.**
- AC18 asks the notes to say "in plain words" what each line means (spec :65-68). s009-ac18-operating-notes.test.mjs:30-36 demands exact substrings, including a straight apostrophe in "the Chief of Staff's notes could not be read".
- Correct notes that paraphrase the lines, or that use a curly apostrophe, would fail. This is not impossible to pass, since the Builder can read the check, but it is stricter than the spec.
- Accept either apostrophe, as isCantReadLine already does (s009-lib.mjs:40-41).

**N5. Two edge cases in the poison run.**
- **Symlinks.** `fs.cpSync` at s009-j7-baseline.test.mjs:110 leaves out `verbatimSymlinks: true`. So a relative symlink outside src/ (for example a workspace link in root node_modules pointing into src/) is rewritten to an absolute path into the real, unpoisoned src/. An adapter importing through it would pass the poison run. Adding `verbatimSymlinks: true` closes this.
- **Exit code.** A run that writes a valid result and then exits non-zero counts as "failed" (s009-lib.mjs:124-126, used at :125 of the J7 test). Spec :171 says "A run that writes a result … the check fails". This is a small mismatch.

**N6. The form of the record's hash keys is fixed only by the README.**
- The check requires keys exactly `tests/desk/baseline/adapter.mjs` and `tests/acceptance/S-009/cases/baseline/<file>` (s009-j7-baseline.test.mjs:50-51; README.md:8-10). Spec :158 does not fix the form.
- A record keyed `./tests/...` or by absolute path would fail coverage and stop the build. The session's brief should name the key form, or the check should normalise keys.

**N7. AC11's "no memory of earlier reads, nothing kept on a device" (spec :21, :40) is not in rubric R5 (review-rubric.md:14).**
- One-read cases cannot see it, so it belongs in the rubric, and R5 should name it.
- s009-j3-card-list.test.mjs:65-70 runs the same case in two fresh processes, so it does not test memory of earlier reads either.

**N8. The AC8 test is close to empty.**
- s009-hold-show.test.mjs:112-119 shows "notes" only as a pull request's title. The case form cannot hold another branch, so the test only shows a young card with no notes is held.
- It is harmless, and R3 stands in properly. Its name should not suggest it tests AC8.

## Answers to the six questions

1. **Does each criterion have a check that fails a build that breaks it?**
   - AC1, AC4 to AC7, AC9 (except B1), AC11 (its observable part), AC14 to AC17 and AC19 have checks that would fail on a breaking build.
   - Criteria that can be broken while every check passes: AC9 (B1), AC2's single mark (N3), and AC13's list (N2).
   - Rubric items standing in where J7's forms truly cannot see: AC3 (no section 5 in card files, spec :150), the 60-second schedule in AC4/AC5, AC8, the reads in AC10, AC12, AC13, src/notify/** unchanged, J3's answered card and J4's left-open sheet.
2. **The baseline cases.** They meet J7's list. The no-failure, queue/notes/log in the `path` form and queue in the `call` form cases are all present. The `dor` card's gate case and notes recommend different words. There is one decision card with notes and one without. AC14 has its two sender cases. AC15 has one id, P-106-stop-1, not in queue/, by notice and by link, each with no failure and with the log failing. s009-case-set.test.mjs enforces the twin rule and the open-card rule. s009-j7-baseline.test.mjs:73-102 implements rules (a), (b) and (c), the last for notice cases only.
3. **The J7 check.** It carries out line 23 and J7: the record and note paths, the note's SHA-256, `base_commit` 04b722ec…, hash matching, coverage, the notes-equals-no-failure rule, the gate-case mark rule, the poison run on every file under src/, the comparisons (including notes-failing compared with log-failing in the same form, Home's count less the decision cards on the list, and the new lines removed), and AC15's two built-only cases. It reads no branch history. The gaps are N1, N5 and N6.
4. **Join marks.** J1 to J8 are each marked at the head of a test file that exercises the join. J6's covers only part of the join (N2).
5. **The Check author's eight open points.** I could not find them. README.md lists none, and the only pointer in a comment, s009-j6-count.test.mjs:7-8, refers to "the Check author's return", which my charter keeps out of my pack. I judged the interpretations the files show:
   - The AC3, AC8 and AC13 list gaps are real gaps in the spec.
   - Accepting `results` entries as text or as objects (s009-lib.mjs:64-66) fits spec :158's wording.
   - Accepting either apostrophe in "Can't read", and squashing whitespace in `shows`, can hide no meaningful difference.
   - J3's "no log line when no decision card is left out" (s009-j3-card-list.test.mjs:50-53) and J8's "Can't read" line on a failed notes read (s009-j8-reads.test.mjs:31) are correct readings of spec :100 and :165.
   - None of these lets a wrong build pass. B1 is a gap in what the case set covers, not in how a point was read.
6. **False stops.** I found none that a correct build cannot pass. The nearest is N4.

## Open questions
- Please give me the Check author's eight open points directly, or confirm they are only in its return; I will then judge them one by one.
- N2 needs a decision outside the checks: either a spec change that gives J7 an entry point for AC13's list, or acceptance that rubric R7 stands in for it.
- On a failed read, "Can't read <project> since HH:MM: <words>" may word a notes failure differently from a log failure. If so, the line comparison at spec :165 would stop a correct build. The spec accepts that stop (:260, :270), but the owner may not expect it.

No earlier check of mine is involved in any finding.

*The session's note after the return, not part of it: on the Critic's first open question, the Check author's eight open points are in its return to the session, not in the files; they go into the round-2 brief. N2 (AC13's list has no entry point in J7's forms) is a gap in the frozen spec, not the checks, and is carried as a risk with rubric R7 standing in, to be named to the owner. B1 and N1 and N3 to N8 go back to the Check author.*
