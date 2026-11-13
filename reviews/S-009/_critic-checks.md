# S-009 — the Critic's review of the locked checks (the outside-build plan, step 5)

*Recorded by the Chief of Staff's session (session_01QBwHGMmHGgB3fLufS5ELH2) as `orchestrator`, under L-0051. Each round's Critic return, verbatim under its heading; the latest round first, as the pipeline reads this record's first verdict. At most three rounds; a third failure goes back to the owner.*

## Round 3, the last — checks at build/check-author/S-009-r3 20ed529 (session branch b6c8fbe); dispatched about 2026-11-13T16:05Z, returned about 16:07Z (times from the session, approximate)

*Recorded by the Chief of Staff's session (session_01QBwHGM9A8Rm6ghUgprr5tF) as `orchestrator`, after the owner's answer A (decisions/questions/P-003-S-009-checks-lock.md).*

Verdict: PASS

Round 3 of 3, checks in /home/user/wt-check-author-S-009-r3 after commit 20ed529. **N1 is closed.** A build that takes a `dor` gate card's mark from its notes when the card has no gate case now fails a built-only check. **N2 is closed without opening a hole that matters.** The dropped assertions fixed today's behaviour from guesses. The J7 comparison with the record now carries them on the baseline cases, and those cases hold the records that matter: gate cards with notes, with and without a gate case, a question and a pull request, under every failure mode. Every assertion that remains is backed by the spec. I found one narrow, unlikely gap: no check looks at a gate card more than a day old for its board or buttons (non-blocking N1 below). The three changes break nothing else and reopen no earlier finding. All findings are non-blocking.

**What I read:** all in /home/user/wt-check-author-S-009-r3:
- specs/S-009.md: lines 1-212, which take in AC1-AC19, J1-J8 and the facts at :229.
- tests/acceptance/S-009/: s009-hold-show.test.mjs, s009-j5-sender.test.mjs, s009-j6-count.test.mjs, s009-lib.mjs, s009-j7-baseline.test.mjs, README.md and cases/baseline/S009-B-desk-ok.json.

I also read /home/user/Service-Desk/reviews/S-009/_critic-checks.md (rounds 2 and 1). I kept to the changed lines and what they touch, so I did not re-read the other test files, the other case files, package.json, run-all.cjs or the rubrics. I did not read src/, tests/desk/, docs/handover/ or the reading. I ran nothing; every finding comes from reading the files.

## 1. N1: closed
- **The new case.** s009-hold-show.test.mjs:144-145 adds P-253-dor-1:
  - its words are GATE_WORDS, so `recycle` is one of its words;
  - its notes say `Recommendation: \`recycle\``;
  - it has no `cases` entry (withCards, s009-lib.mjs:163-173, adds none);
  - it is run with no failure (`deskCase` defaults to `fail: []`, lib :144-145).
- **What it asserts.** :148-150 asserts `on_list: true, marked: null` for it.
- **The wrong build fails.** Round 2's wrong build was `gateCase ?? (gate === 'dor' ? notesWord : null) ?? section5`. It gives `recycle`, so it fails :150.
- **A correct build passes.** It takes the gate case, then section 5 (spec :229). The case form gives card files no section 5 (spec :150), so the mark is `null` and :150 holds.
- **Still checked.**
  - :152-156 checks that a `dor` card's gate case beats its notes.
  - :150 still checks the `criteria` and `launch` cards with notes, so round 1's B1 stays closed.

## 2. N2: closed, no hole that matters
- **The assertions dropped:**
  - `on_board`, `buttons` and the notice for the gate cards (hold-show :136-150);
  - the question's notice (AC19, :126-128);
  - the gate card's first-run notice in J5's desk case (j5 :43-44).
- **The assertions kept, each backed by the spec:**
  - `on_list: true` for gate cards and questions on a good read (hold-show :126, :132, :150). J7 :169's coverage rule makes the record show these as `on_list`, so "as today" agrees.
  - `marked: null` for gate cards with no gate case (:150), from spec :229 and :150.
  - The gate case's word (:156), from AC9 :36 and J7 :169's mark rule.
  - J5 :46-49, no notice for any card on a failed read, still follows J5 :118-119 and J8 :179.
  - None of these fixes a behaviour the spec leaves to the record.
- **Is the J7 comparison enough for these kinds?** Yes, on the baseline cases:
  - **Which fields are compared.** `deskProjection` (lib :198-206) compares, for every card that is not a decision card: `on_list`, `on_board`, `buttons` and `marked`, plus their `notices`, `home_count` less the decision cards on the list, and `lines` with the AC16 and AC17 lines removed.
  - **On which cases.** j7 :135-143 runs this on every `desk` baseline case. A `notes`-failing case is compared with the record's `log`-failing case (:138).
  - **What the records hold.** S009-B-desk-ok.json:6-74 holds:
    - P-101-dor-1, with a gate case and notes;
    - P-102-criteria-1, with notes and no gate case, the same set-up as the built-only P-250;
    - P-103-launch-1, with neither;
    - a question and a pull request;
    - a decision card that is shown (P-104) and one that is held (P-105).
  - **What a wrong build would have to do.** A build that changes a gate card's board, buttons or notice because the card has notes would trip P-101 or P-102. So would a build that runs gate cards through the decision-card rule: P-103, under a day old with no notes, would go off the list, and P-102 would gain `kill`. Either fails j7 :141. A build that breaks notices for questions or pull requests fails the same comparison.
  - **AC19.** A question shows by its kind, and J7 compares the kind on `question:release-timing`. Dropping the notice for a second question name (`v6-feedback`) opens no hole a plausible build could use.
  - **J5.** The sender cases are compared in full against the record (j7 :146-152), gate card included. That covers what j5 :43 used to assert.

## 3. Other effects
- **Nothing broken.**
  - The new case ids (`S009-X-ac9-gatenotes`, `S009-X-ac9-dorcase`) are unique.
  - `recs2` is a fresh object from withCards, so changing it at :155 affects no other case.
  - P-253-dor-1 is not a decision id (lib :35-38).
  - No unused or missing import.
- **No earlier finding reopened.**
  - Round 1's B1 still holds: hold-show :150 and the baseline P-102 card.
  - Round 2's N8 test name is unchanged (:112).
  - N6 is closed: j6 :7-8 now points to README open point 1, and README.md:24-27 is that AC13/J6 point.

## Blocking findings
None.

## Non-blocking findings
1. **No check looks at a gate card more than a day old for its board or buttons, now that hold-show's old assertions are gone.**
   - **The baseline gate cards are all young.** They were raised 08:00-08:20 against a moment of 12:00 (S009-B-desk-ok.json:44-56), so J7's comparison never sees an old gate card.
   - **The built-only checks see only part of it.** The background P-100-dor-1 was raised 2026-11-01 (lib :158), and P-251-launch-1 is 30 hours old (hold-show :143). They are checked only for `on_list` and `marked` (:132, :150).
   - **What could slip through.** A build that changes `on_board` or `buttons` for gate cards a day old or more, and only for them, would pass. So would one that drops an old `dor` card's gate-case word: no case has an old gate card with a gate case.
   - **Likelihood.** Low: a build that ran gate cards through the decision rule at all would fail on P-103 and P-102.
   - **The fix it would take.** A check would need an older gate card in the baseline cases, which are locked with the record. This is carried as a risk, not a reason to fail.
2. **The comment at hold-show.test.mjs:137-139 overstates AC9.** It says AC9 fixes "only that a gate card is listed". AC9 (spec :36) asks for "exactly as before" across all its fields. The test itself is right; only the wording is off.

## Open questions
- Should the owner's case name non-blocking N1 (no old gate card in the record) beside round 1's N2 (the AC13 list) as a carried risk?
- Separately, outside the changed lines: no check compares a gate card's card-sheet text. For example, the "No Chief of Staff recommendation yet" mark appearing on a gate card's sheet would pass every check. AC9's test, as the spec defines it (spec :36), does not list sheet text, so this is a spec matter, not a gap in the checks.

No earlier check of mine is involved in any finding.

## Round 2 — checks at build/check-author/S-009 e27eb1d (session branch 8cca44c); dispatched about 2026-11-13T15:18Z, returned about 15:23Z (times from the session, approximate)

Verdict: PASS

Round 2 of 3, checks at build/check-author/S-009 e27eb1d. Round 1's blocking finding B1 is closed. A build that takes a `criteria` or `launch` gate card's mark from its notes now fails the J7 comparison and a built-only test. A build whose failed read of a gate card's notes hides the decision cards fails a J8 test. N1 and N3 to N8 are each handled as stated. I found no criterion that a plausible wrong build can break with every check passing, except the AC13 list. That is the spec gap round 1 already named (N2), which the session carries as a risk. I found no false stop that the spec does not already accept. All findings are non-blocking.

What I read, all in /home/user/wt-check-author-S-009: specs/S-009.md (all 296 lines), every file under tests/acceptance/S-009/ (12 baseline case files, 11 .mjs files, README.md), tests/acceptance/package.json, run-all.cjs and README.md, and checks/S-009/review-rubric.md and AC18-rubric.md. I also read /home/user/Service-Desk/reviews/S-009/_critic-checks.md. I did not read src/, tests/desk/ or reviews/S-009/_src-reading.md. I ran nothing; every finding comes from reading the files.

## 1. Round 1's findings

**B1: closed.**
- **The baseline cases now hold the card B1 asked for.** P-102-criteria-1 has notes recommending `kill` and no gate case. It is in every desk and open baseline case (for example cases/baseline/S009-B-desk-ok.json:36-38 and :41).
- **Why a wrong build fails.** The base commit reads no notes, and a card file has no section 5 (spec :150, :229). So the record cannot mark that card `kill`. The J7 comparison of cards that are not decision cards (s009-j7-baseline.test.mjs:135-143) therefore fails any build whose mark is `gateCase ?? notesWord ?? section5`, whatever the base gives.
- **The case set cannot drop it.** s009-case-set.test.mjs:82-87 fails a case set without such a card.
- **Built-only check of the mark.** s009-hold-show.test.mjs:135-152 checks that a `criteria` card and a `launch` card with notes are unmarked. It also checks that a `dor` card's gate case beats its notes.
- **Second wrong build.** s009-j8-reads.test.mjs:71-86 covers it. Only gate cards' notes fail, and the test asserts: no notes line, no "Can't read" line, non-empty `notices`, and the one decision card shown (`norec`). A build that reads gate notes and treats their failure as a failed read fails it, on the desk and on the sender.

**Round 1's non-blocking findings:**
- **N1 (hashes for imported tests/ files): handled.** s009-j7-baseline.test.mjs:53 requires a hash for every tests/ file the adapter imports. s009-lib.mjs:241-257 finds those files by following relative imports from the adapter.
- **N3 (AC2's single mark and its words): handled.** Rubric R11 (review-rubric.md:20) names both.
- **N4 (AC18 test too strict): handled.** s009-ac18-operating-notes.test.mjs:26-33 now checks only that the notes exist and name the mark, with either apostrophe and any case or spacing. AC18-rubric.md items 1 to 7 carry the rest.
- **N5 (poison run edge cases): handled.**
  - Symlinks: the copy keeps relative symlinks as they are (`verbatimSymlinks: true`, j7 :112), and symlinks inside src/ are replaced with the poison line (:119).
  - Exit code: `wroteResult` no longer depends on the exit code (lib :125-127), so any run that writes a result in J7's form fails the poison run, as spec :171 says.
- **N6 (hash key form): handled.** lib :234 ignores a leading "./" or "/" and turns back-slashes into "/". README :8-10 names the key form.
- **N7 (AC11's "no memory"): handled.** R5 (rubric :14) now names "no memory of earlier reads, nothing kept on a device".
- **N8 (AC8 test name): handled.** hold-show :112 is now named "partial; the rest is rubric R3".

## 2. Can each criterion be broken while every check passes?

- **Checks that fail a breaking build:**
  - AC1, AC4 (the 24-hour boundary), AC5, AC6, AC7, AC19: hold-show tests, J1, J2, J4.
  - AC2: the word and the `marked` field.
  - AC9: the J7 comparison, hold-show :135, J8 :71.
  - AC11, its observable part: J4 at three moments, and the same bytes in J3 :65.
  - AC14: J7 :146 and J5.
  - AC15: J7 :154-178 and J4 :54-79.
  - AC16 and AC17: J1, J2, J3, J4, J8, and J7 for cards that are not decision cards.
  - AC18, its mechanical part: the notes exist and name the mark.
- **Rubric items standing in where J7's forms truly cannot see:**
  - AC3 (R1): card files have no `## 5.` section (spec :150).
  - AC4 and AC5's 60-second schedule (R2): a case is one read.
  - AC8 (R3): the case form holds only the main branch's records.
  - AC10 (R4) and AC12 (R6).
  - AC11's "no memory" (R5).
  - AC2's single mark and its words (R11): `marked` is one word, and `shows` holds every word.
  - src/notify/** unchanged (R8).
  - J3's card answered while held (R9) and J4's sheet left open (R10).
  - Each is unobservable through the case and output forms, so each stand-in is fair.
- **Can be broken with every check passing:** only AC13's handed-over list (id, raise time or `not recorded`, flag). That is round 1's N2, a gap in the spec carried with R7 standing in. My N1 below is a narrow leftover of AC9.

## 3. The baseline cases

- **J7's list** (spec :160-162) is met:
  - One card each of `dor`, `criteria` and `launch`, an owner question and a pull request, beside a decision card with notes (P-104-stop-1) and one without (P-105-failure-1).
  - The `dor` card's gate case says `hold` and its notes say `recycle`.
  - No failure, then `queue`, `notes` and `log` failing in the `path` form, then `queue` failing in the `call` form.
  - Two `sender` cases, one for each of AC14's cases.
  - Four `open` cases for the one id P-106-stop-1, which is not in queue/: by notice and by link, each with no failure and with `log` failing.
- **Coverage rules:** rules (a) and (b) (j7 :77-96), rule (c) for notice cases only (:101-104), the notes-equals-no-failure rule (:88-90), the gate-case mark rule (:80-85) and the on_list rule (:76) are all implemented.
- **Twin and open-card rules:** case-set :34-45.
- **The new criteria card breaks none of these.** All desk and open cases still share identical records and moment, so every failing case keeps its twin. Today's code reads no notes, so the new notes cannot affect rules (a), (b) or (c) at the base. The mark rule looks only at the `dor` card.

## 4. s009-j7-baseline.test.mjs against line 23 and J7

It carries out line 23 and J7:
- **Paths and base commit:** the record and note paths (lib :18-19), and `base_commit` equal to 04b722ecd45fd5ffb3f133a29475b8777c9bab1f (lib :21, j7 :41).
- **The note:** it must hold the record's SHA-256 (j7 :38-40).
- **Hashes:** they must cover the adapter, every case file and every imported tests/ file, and every hashed file must match (j7 :51-58). No comparison runs unless this passes.
- **Coverage:** checked before the poison run (:62-106).
- **Poison run:** every file under src/, whatever its type, is replaced with `throw new Error('baseline-poison')`, then the adapter runs on every case (:108-131).
- **Comparisons:**
  - A notes failure is compared with the record's `log`-failing case in the same form (:138, lib :224-228).
  - Home's count less the decision cards on the list, with the AC16 and AC17 lines removed (lib :198-206).
  - The `sender` cases' notices in full (:146-152).
  - AC15's two built-only cases, held and not shown on a failed log read (:162-178).
- It reads no branch history.

## 5. Join marks

`join-test: S-009/J<n>` is on line 1 of each test file:
- J1: s009-j1-cards-log
- J2: s009-j2-notes-word
- J3: s009-j3-card-list
- J4: s009-j4-views
- J5: s009-j5-sender
- J6: s009-j6-count
- J7: s009-j7-baseline
- J8: s009-j8-reads

Each file exercises its join. J6 covers the states at the check moments, not the list's form (the carried spec gap).

## 6. The README's open points (tests/acceptance/S-009/README.md:22-49)

- **Points 1 to 5:** real limits of the forms, each matched to a rubric item.
- **Point 6:** keeping the far-future raise time inside a month file the desk reads is right for the case form. A build that treats a far-future time as malformed and shows the card at once fails j1 :74.
- **Point 7, interpretations:** each follows the spec, including that a failed notes read shows a can't-read line (spec :165) and that both AC16 lines show when both reads fail (AC16). None of them lets a wrong build pass. Key normalising and whitespace collapsing can only stop a build, never pass a wrong one.
- **Point 8:** AC18's plain-words test belongs in the rubric.

## 7. False stops

None found beyond stops the spec already accepts: the Home-count assumption (:164), and notes-failure versus log-failure wording (Risks :260). N2 below is a conditional risk.

## Blocking findings
None.

## Non-blocking findings

**N1. A `dor` gate card with no gate case never has its notes read successfully on a no-failure read, so a dor-only use of notes would pass.** This finding implicates the earlier Critic check (round 1): its B1 fix named only `criteria` or `launch` cards (_critic-checks.md:21).
- **The cases.**
  - The baseline `dor` card has a gate case (S009-B-desk-ok.json:36-38).
  - hold-show :148-151 gives its `dor` card a gate case.
  - j8 :78 gives P-100-dor-1 notes with no gate case, but with `notes` failing, so they are never got.
- **The wrong build that passes.** It uses notes for `dor` cards only, for example `gateCase ?? (gate === 'dor' ? notesWord : null) ?? section5`. The likelihood is low.
- **Fix in the checks.** Add a no-failure built-only `dor` card with notes and no gate case to hold-show :135, asserting `marked: null`.

**N2. Built-only tests hard-code today's behaviour for gate cards, questions and pull-request cards; the record comparison already covers it.**
- **Where.**
  - hold-show :144-145 asserts `on_board` and `buttons` true and a notice for `criteria` and `launch` cards.
  - hold-show :127 and j5 :43 assert that a question and a gate card are notified on a first run.
- **Why it matters.** Coverage rule (b) asks only for non-empty `notices`, and the spec does not say today's board shows gate cards. If the base commit differs, a correct build stops here. The spec only partly supports the notice assertions (AC9 "notifies", J5 :119).
- **Fix.** Compare with the record's result instead, or drop those fields.

**N3. Leftover of round 1's N1 and N5.**
- adapterTestImports (lib :238-248) follows only relative, literal imports. It misses a `new URL(...)` or non-literal `import()`, and files read with `fs`. README :47 and lib :240 say so, and the Reviewer's confirmation (spec :23) covers it.
- An absolute symlink outside src/ that points into the real src/ still escapes the poison (j7 :112).

**N4. The case-set B1 test checks for a backticked word anywhere in the notes, not for a J2 `Recommendation:` line** (case-set :85). The locked case does hold a proper J2 line (desk-ok :41), so this is harmless.

**N5. The AC18 test passes on any .md or .txt file under docs/handover/P-003/ that names the mark** (ac18 :16-33), including one that existed before the build. AC18-rubric.md carries the substance.

**N6. A stale comment.** s009-j6-count.test.mjs:7-8 still says the gap is in "the Check author's return". It is now README point 1.

## Open questions
- N2 rests on whether today's board shows gate cards and offers their buttons. Only the record will show it. Does the session accept a stop there, or should the Check author fix N2 before locking?
- AC13's list (round 1 N2) is still a spec gap carried as a risk with R7 standing in. Is it confirmed to go into the owner's case?
- J1's far-future raise time in the real log: a real entry is written to the current month's file, not to its raise time's month file. So the case form cannot reach the real case, and the J1 test can never show it. Whether the real desk holds that card as J1 says is open; that is in the spec, not the checks.

*The session's note after the return, not part of it: the checks passed at round 2 of 3. N1 (a dor card with notes and no gate case on a good read) and N2 (built-only tests asserting today's behaviour for gate cards, questions and pull-request cards, a possible false stop) are put to the owner before the checks are locked, in questions/P-003-S-009-checks-lock.md, since a fix needs round 3, the last. Round 1's N2 (AC13's list) stays a spec gap carried as a risk.*

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
