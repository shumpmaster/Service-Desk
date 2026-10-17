Verdict: FAIL

Plan review, round 1, of specs/S-001.md at d7e36e2 (build/definer/s001-model-3.5.0-records, base 368effa). I changed no files. My scratch files are under /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/.

**Checks run**
- `spec_check.py status`: OK.
- `v3_checks.py trace`: OK.
- `surface_guard.py diff --range origin/main..d7e36e2 --branch build/definer/s001-model-3.5.0-records`: OK, 1 commit. The same holds with the range written as 368effa..d7e36e2.
- origin/main moved while I was reviewing, from 368effa to 21bc250 (#83, then #84, which the asks-merge job merged). The branch still merges cleanly with it (`git merge-tree`).
- I also ran the full suite, `check_all.sh . 368effa`. One check fails: `review_check lint` on reviews/81/reviewer.md, a file the branch inherits from 368effa and that #83 fixed on main. Against the moved origin/main, `v3_checks sessions` also fails, because the branch lacks #84's session file. Neither failure is this spec's fault (see N10).

**Confirmed true against S-033 at 90f53e3 and the model's code** (governance/checks/*.py are byte-identical to the model's tools/*.py, checked with `cmp`)
- The J11 reached part matches the model's `OPTIONAL_PARTS_RE` and `MILESTONE_LINE_RE` (v3_checks.py:396-403), its `valid_date` check (:515) and its "both reached and dropped" report (:1884).
- The reached part does not change `trace` output. I ran it on a copy of 368effa with ` · reached:` added to M1's and MD2's lines, and the NOTE lines were the same with and without it.
- The desk reader's line numbers are right: j11.js:186-188 and :237-239.
- J2's question form matches questions/_TEMPLATE.md:3 and :13-14, decisions/README.md:43, and `question_milestone`/`v3_question_problems`.
- J2's card form matches `card_text` (orchestrator.py:876-953): the `Milestone:` line is line 5, and `## Context` comes after section 7 and before LAUNCH_SECTION.
- J13's path, keys and time form match v3_checks.py:2051-2058 and `session_line_problems`. "Under way" and `null` reading "not recorded" match S-033 J3.
- AC7's letter route (`reached_licence`, v3_checks.py:1958-1995) finds the `Question:` line anywhere in the record, so an added `Milestone:` line does not change it. Only asks_merge.py:214 compares answer milestones.
- Ledger entries L-0016 and L-0017, the owner's pick at P-001-trial-view-notes-2.md:165-166, P-001-m1-accept.md:1, P-001-asks-merge.md's line 2 `Proxy:` with no `Milestone:` line, and "no `^Milestone:` line in decisions/questions/" are all true.
- J3's example URL encodes correctly.
- The owner quote of 13 Oct is in docs/design/references/comments-2026-10.md:117-120.
- Roster ids equal the agent names, so J13's helper `role` matching works.

**Findings**

1. **BLOCKING: the AC19/J3 change alters the accepted view outside the sandbox, which the spec says never changes.**
   - Where the spec puts the change:
     - AC19 (:938-940) and J3 (:4428-4438) add the question's `Milestone:` line to the answer content.
     - The Areas list (:5474) puts that change in src/lib/links.js. `questionAnswerContent` and `answerPlan` there build the accepted M2 view's answer link (links.js:85-87, :122), and tests/desk/ac16-19-answering.test.mjs:92 pins today's text.
   - What it contradicts:
     - AC43 (:1272-1273): "Without `?sandbox`, the desk is exactly the accepted M2 view."
     - :1152, :2543 and :2667: "the accepted M1 and M2 views stay exactly as they are".
     - The brief (:6486): "In one pull request on the sandbox".
   - The Builder cannot meet both rules.
   - To resolve, either:
     - keep the line to the sandbox's answer box (AC53 / `questionBoxText`) and leave AC19 as it is; or
     - state the exception in AC43 and in the "accepted views" lines, with its reason (decisions/README.md:43) and its effect on the owner. Say in the brief that the accepted view changes, and name the M2 test that changes.

2. **NOTE: the stories about PR #82 are now stale.**
   - PR #82 closed unmerged at 22:32:51Z. Its governance check had failed on reviews/81/reviewer.md.
   - The same start line landed through #84, merged by github-actions[bot] at 21bc250 (22:34:10Z, with the `Merged-By: orchestrator`, `Delegation: L-0017` and `Merged-Head:` trailers).
   - Places still telling the old story: J13 (:5211 "open, not yet on the default branch", :5269), Facts relied on (:5762, :5773), the brief (:6505 "from pull request #82 once it is on main", which can no longer happen), and open question 1's Context (:6223 "waits … until its checks pass (source: pull request #82)", but #82's checks never passed).
   - The quote also conflicts. "Why now" (:461) quotes the owner as "Go ahead and", as #82's body has it; #84's body has "Go ahead". Which is the owner's exact wording can't be verified from any record.
   - To resolve, cite the line by its file at 21bc250 (or #84), and quote the owner from a record, or drop the quote.

3. **NOTE: open question 1's options are not fully fair yet.**
   - (a) The Context doesn't say that, while open, each asks-merge pull request is flagged (AC2) and turns who has the ball into "Waiting on you" through AC52's Merges. That cuts against S-033's promise that "you won't merge those small filings yourself". Every Chief of Staff piece of work opens one such pull request.
   - (b) Most of them carry `Milestone: none (…)`, as #84 does, so under (a) they collect on the Timeline under "Not tied to a milestone" (AC60, :3159-3166).
   - (c) Option (b) says what GitHub gives for the workflow's merges "can only be confirmed on your own computer" (:6235). REST now shows #84 `merged_by: github-actions[bot]`, and the merge commit's author and trailers are readable.
   - (d) Option (c) says it "needs a model change first". A desk-only route also exists: read each open pull request's file list and apply S-033 AC4's kinds. It costs extra reads and could hide a pull request the job then refuses. Name that route and why it isn't recommended.

4. **NOTE: the parsed-record cache isn't addressed.**
   - The page caches parsed records by blob sha (:4609). scheduler.js:17-23 says to bump `BLOB_CACHE_KEY` (now `desk-blobs-v5`) "whenever a parser's output changes".
   - This revision changes the parse of question files, cards, answer records, docs/PROJECT.md and the new session files. Without a bump, a device keeps the old parse of any record filed between L-0016 and the new deploy. For answer records the sha never changes, so they would read "not recorded" for good.
   - To resolve, require the bump with a test, and add src/lib/scheduler.js to the Areas list (:5472-5482).

5. **NOTE: J13's out-of-form rule can't fully mirror the model, and the fixture rule assumes it does.**
   - The model fails some lines that the page's `JSON.parse` cannot see: repeated keys (`_one_object`), and `1.0` where a whole number is needed (`type(v) is int`). Each would pass on the page.
   - J13 says the desk checks no order, yet the fixture rule (:5266-5269, :5278) expects "each out-of-form line the model's check fails" to be named and skipped.
   - An end line's `usage` with a wrong-kind figure is skipped as a whole line in J13 (:5224), but J10 marks only that key. J13 doesn't say which rule applies.
   - To resolve, list which of the model's failures the desk mirrors, and pick one rule for `usage`.

6. **NOTE: J13 gaps.**
   - An end line with no open piece (end before any start, or end after end) is not covered by :5230-5233. The model allows it. Say whether it counts for "Just finished".
   - The Working now sheet's Cost line is fixed as "can't read its own cost" (:1669), but J13 :5247 says a non-null usage figure shows as AC23 shows it.

7. **NOTE: J11's out-of-form fixture misses one position.** It lists the date `2026-02-30`, the part before ` · sprints:`, and the part after ` · dropped` (:5062), but not the part after ` · why:`. S-033 AC7 puts the part before ` · why:`, and the desk's `whyEnd` takes the why end off first, so that case needs its own test.

8. **NOTE: the fixture descriptions disagree, and one state is unspecified.**
   - AC50's test (:1789) speaks of "a made-up reached milestone with no sprints". J11 (:5062) marks MD2 reached on 2026-10-16. AC57 (:2887) and AC59 (:3099) say "<its date>". Pin MD2 and "16 Oct" in all four.
   - AC57's rule 3 (:2810) comes before rule 5, so a reached milestone in a run still to come would get "Still to come" and an empty ring while its words say "Reached <date>". Say which wins.

9. **NOTE: the fixture claims and the desk-answer fallback overstate what is checked.**
   - :4399 calls the answer records "made and passed by the model's own code". Only the Chief of Staff's proxy form is checked by model code (asks_merge.py `classify`, :214). The owner's own form and the desk's letter form are checked by none, unless the letter form is run through `reached_licence`. Name the code for each, or label them as made from decisions/README.md:43.
   - The fallback for a desk-written answer rests on "a question file is not changed once filed" (:4328-4329, C). S-033's Adoption step 3 does change open question files, and nothing in the model forbids edits. State it as a known limit.
   - The J3 change also departs from S-033 J1's sentence that a desk-written answer "has no `Milestone:` line". That departure is harmless (finding 1 aside) but should be named, and passed to the model as a correction to J1's text.

10. **NOTE: the plain-English lead and the branch's base.**
    - The amendment note (:454-) opens with "Why now", full of paths and ids. It doesn't first say what is left undone: the Chief of Staff's tokens and cost stay "not recorded", asks-merge pull requests show as before until you rule, a tidied question file can't be read, M1 isn't marked reached yet, and the 8-hour limit applies. AGENTS.md's "Plain English first" rule asks for that lead.
    - Before landing, merge the new main into the branch so `review_check lint` and `v3_checks sessions` pass.

**What I judged acceptable**
- The (C) choices are reasonable for the Definer to make: the 8-hour limit, case 3's place in who has the ball, crediting helpers to their own members, rows timed at a helper's `ended`, the time-zone-free reached date, a reached milestone counting as filed, and its placing by reached date.
- Open question 2 is a real choice with fair options, and it fits ruling 5 (P-001-design-lab-1.md:20).

**Open questions:** none beyond findings 1 and 3.
