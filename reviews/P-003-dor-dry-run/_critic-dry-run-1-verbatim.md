# P-003: a dry run of the definition-of-ready check on draft 2, the Critic's return verbatim

Run by the Chief of Staff on 2026-11-04 (session session_01QBwHGK3RYTVPrSa4MEcix4), before any resubmission: a fresh read-only Critic session given only the pack the session runner builds for P-003's real check (`session_runner.py pack`, the plan entry P-003 critic ready-dispatch stage 2, on draft 2's working tree), plus one line telling it to read with Read rather than Grep. Line numbers are of the pack's copy of draft 2 before the four later fixes in this pull request. Not a pipeline verdict; recorded by the orchestrator.

Verdict: FAIL

The brief is not ready. One finding fails on its own (finding 1, missing standard lines). A Part 2 contradiction (finding 3), the stale Part 1 statuses that P-003 leans on (finding 4) and several claims nothing in the pack supports (finding 6) each fail too. All paths below are under /tmp/claude-0/-home-user/f71fef48-f47f-5169-b369-ec7e6173e4fc/scratchpad/p003-pack/.

## Findings

**1. Section 3 has no Discovery or Design standard lines (model S-032).**
- docs/PROJECT.md:118-127 has standard lines only for Build-1 to Build-5 and Launch-1 to Launch-5.
- There is no `- Discovery-<n> (standard) · taken on|skipped · why: …` line and no `- Design-<n> (standard) …` line anywhere in section 3. A search for `(Discovery|Design)-\d` matches only the instruction text at line 69.
- Section 3's own instruction (line 69) says to write Discovery's and Design's lines in the brief, ruled with the Design gate, and that "one line holds for every run of its phase".
- P-003 is running Discovery now and has a Design gate ahead. Its own records cite a Discovery standard milestone: decisions/questions/P-003-critic-pack-cap.md:4 says "Milestone: Discovery-8".
- My rules fail a brief whose section 3 lacks any of these lines.

**2. Section 3 lists no milestone for P-003.**
- docs/PROJECT.md:596 says P-003 "adds no line to section 3 before its Design gate". M4 appears only in Part 2 (line 642).
- The definition of ready wants section 3 to list the project's own milestones, drafted for the owner to approve at the Design gate. Line 69 says "Draft them here during Discovery".
- I accept there is a real tension in the model here: line 69 also says that after approval a milestone is added "only with the owner's approval". The brief has picked one reading without a ruling.
- It needs either the line drafted in section 3 marked as proposed, or an owner ruling that a later-work item's proposed line may sit in Part 2. Neither is in the pack.
- On its own merits, the M4 line passes the milestone-form check: its name reads as an achievement, it has `· phase: Build`, `· for: P-003` and a plain-words `· why:`.

**3. P-003's Part 2 contradicts itself and its research (point 8).**
- docs/PROJECT.md:632-633 says "the desk only reads the records it reads today". Line 678 says "reading their word is one small new read per card".
- research/P-003-sizing-findings.md:21 says a notes file "is never read" today. Lines 28 and 61 of the findings call for a new `recordKind` and blob read.
- So the fix does read a new kind of record, and the "does not cover" line is false as written.

**4. The Part 1 statuses P-003 relies on contradict each other (point 8).** P-003 takes points 1, 4, 5, 6 and 9 from Part 1 (lines 594-602), so these matter here.
- O5 is shown both ways:
  - lines 234 and 249 say "Answered (O5, closed)" and "O5, closed by research Q-008";
  - lines 256, 404 and 412 say O5 is "open into Define".
- V4's date is shown both ways:
  - line 196 says V4 has no date, because the owner dropped it (decisions/questions/P-001-m3b-launch-date.md);
  - line 467 says "V4 is proposed at 2026-11-11 and set on the move-to-Build card", and line 472 says "to keep V4".
- Several things are still called proposed or unapproved after the owner ruled on them or the work was finished:
  - line 13 says Part 1 is "Not yet approved";
  - line 188 says the values are "Proposed";
  - lines 153 and 158 call the spend ceilings "(proposed)", while line 533 says the owner set $0 on the move-to-Build card;
  - all of this in a project whose M3C was reached on 2026-11-01 (line 117).

**5. Point 6 (value and stop rule) is not P-003's own.**
- Lines 657-659 give a success statement only. There is no date, no measure or way to count it, no miss, and no cost to the owner's time.
- Line 599 borrows Part 1's stop rule. That rule (lines 201-202) is about "the redesign" before the desk's launch, which has already happened.
- The borrowing rests on the claim in line 584 below, which nothing supports.

**6. Claims that cite no record, or a record not in the pack.** Under the dry run's rules, each of these is a FAIL.
- **Line 583-584**, "which the owner accepted for small additions": no ruling is cited, and none is in decisions/. A search for borrow / "Success defined" / "Scope, limits" finds nothing outside PROJECT.md and design HTML. Points 5 and 6 lean on this.
- **Lines 610-611 and the M4 why**, "Twice on 3 November the owner answered a decision card the opposite way to what they meant":
  - decisions/Q-019/stop-1.md and decisions/Q-017/stop-2.md each hold only "Decision: re-specify", with no date and no owner's words about intent;
  - the later stop-2 and stop-3 records say "drop", and the findings say the notes recommended `drop`, which suggests the claim but does not record it;
  - the owner's quoted words ("Proceed with the fix", P-001-card-recommendation.md:17) don't say it either.
- **Lines 611-612**, that those cards' section 5 "was only a pointer to the Chief of Staff's notes": the queue/ card files are not in the pack. The findings check the code, not those cards' section 5.
- **Line 596**, "as the request says (intake/requests/P-003.toml)": not in the pack.
- **Lines 638-639**, "reviews/P-003-m4-line/critic.md, PASS at round 2": not in the pack.
- **Line 583**, "model S-035": no record.
- **Line 656**, governance/risk-paths.toml as the source of the required reviewers: not in the pack.

**7. Owners and limits misstate where the change lands (points 4 and 5).**
- Line 690 says the build is on "src/lib/ and its copies in src/public/".
- The findings (lines 22, 56 and 69) say the sheet text is in src/public/sandbox.js, which is written by hand and is not a copy.
- The findings (lines 15 and 28) also show the notification sender (src/notify/collect.mjs) reuses neededReads, recordKind and parseRecord, so the change reaches it.
- P-004's section (line 725) says changes to src/notify/** and "three shared files the sender runs" need the owner's approval. P-003's review list (lines 655-656) names only the Reviewer and the design reviewer.

## Open questions
1. Are model.js and records.js among the "three shared files the sender runs" in governance/risk-paths.toml:20-24? If so, P-003's change needs the owner's review. That file is not in the pack, so I couldn't check.
2. When the fix is deployed, what happens to a card the owner was already notified about and that is then held? The findings (line 67, notifyview.js:337) say it would re-check as "gone". The rule at line 686 covers only cards not yet shown.
3. The done-when of M4 (line 642) names only the owner's queue. "What it covers" (lines 621-622, 686) also holds the card off Home's count and the notifications, and adds the rule for cards with no recorded raise time. Should the line say so, or is it enough that the tests cover it?
4. M1, M2, M2B, MD1, MD2, MD3 and M3C (lines 106-111 and 117) have no ` · why:`. That is allowed only if the owner approved them before the project took model 3.4.0. The pack doesn't show when that was; the copy of the definition of ready says model 3.3.2.
5. Does the owner want later-work milestones proposed in Part 2, or drafted in section 3 as proposed? This settles finding 2.
