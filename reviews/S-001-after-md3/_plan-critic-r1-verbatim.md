# S-001 after MD3: the Critic's round 1, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/definer/s001-after-md3 at 572ac1b.

---

Verdict: FAIL

What holds: all eight rulings and the MD3 acceptance are quoted word for word and match their records. AC17, AC44, AC56 and AC67 carry their rulings correctly. EXP-005 is marked withdrawn, never run, and its frozen text is left alone. The A3 sum is right: 313 × 5 = 1,565, and 9,817 + 125 + 10 = 9,952, which the stage 1a reviews' 1,562 and 7,534 support. AC90's audit counts (21, 15, 3, 5) and its quote of P-001-why-line are exact. The `Milestone: none (<why>)` lines pass governance_checks.py's form. The spec uses no gendered pronouns.

Six findings fail the amendment. All go to the Definer, as an S-001 amendment, draft 2.

**Blocking findings**

1. **AC49 contradicts its own Known limit, and the ruling it carries.** specs/S-001.md:3636 says "Any two lanes differ in their line, or in a grey far apart", and the AC49 test at :3690 checks "any two lanes apart". Known limit 6 (:13932-13933) says "a fifth lane looks like the first". The code agrees with the limit: src/lib/sandbox.js:1450 hands out the four looks in turn over all lanes, not only lanes open at the same time. So two lanes open at once can look the same. The ruling says "so every lane looks different at a glance" (P-001-desk-v2-lanes.md:1). Writing the gap down as a known limit breaks the ruling, and the owner was never asked. The fourth lane's look (`--ink` dashed, :3632-3636) goes beyond the ruling's three styles, and it is not marked C. Rule broken: no criterion may contradict another, and a ruling must be applied as given. Route: Definer. Either make the rule cover every lane open at once and test it, or have the Chief of Staff put the limit to the owner.

2. **AC89 (a) leaves out the audit's own case.** At :3696-3702 the empty-lane words cover three states: never read ("Can't read"), read earlier and being read again ("Checking…"), and before the first read ("Not read yet"). It gives no word for a project read earlier that now can't be read. That is the audit's item 2, the main defect of stage 1. "Being read again" also covers a project whose reads keep failing. That puts "Checking…" under "Can't read … since", against :3694 ("never 'checking…' while it can't be read") and part A item 4. The reviewer's question behind it (_build-1a-review-round3-verbatim.md:80-81, 93) was only about a re-read still waiting for its answer. The title line is also not defined for a project whose first read failed: there is no last successful read, and it is no longer before its first read. Rule broken: each criterion must be a testable scenario. Route: Definer.

3. **AC90 changes criteria that still say the opposite, and the amendment calls one of them unchanged.** AC24 still has every row read "Estimate: not made yet" (:9074), with no note naming AC90. AC59, AC82 and AC86 have no AC90 note either; only AC84 (:7393) and AC67 (:6004) do. The "What changes" list (:2085-2086) says M3's criteria are "Unchanged … but for AC24's note on Plan's gate row". That is false. The spec's own convention is "Changed in place, each with a note naming its ruling" (:2078). The blanket clause at :7681 ("where they differ, the part governs") leaves a Builder reading AC24 with two texts. The same gap applies to AC89 (e): AC41's "–" has no note. Route: Definer.

4. **The stage plan cannot be built stage by stage for AC90's Team part.** AC90 is stage 3. Its Team part works "in the opened idle list" (:7866-7869), and that list comes only with AC67's fold in stage 4. Stage 4's tests (:2300, :6005-6009) do not check AC90's head line in the idle list. So that part has no stage that builds and tests it. The table and the brief also disagree on which cases stage 3 changes: :2299 names AC24, AC82, AC84 and AC86 and calls them "kept", while :15313 adds AC59 and AC67. Route: Definer.

5. **The cap of 10 a day is made up, labelled as an estimate, and not fully defined.** AC89 (l) (:3806-3809) and J23 (:12174-12175) say "at most 10 a day (E: portfolio cards are rare)". A cap enforced in code is a choice (C), not an estimate (E). Three things are missing:
   - what happens to the 11th mark in a day (presumably back to "up to about 10" minutes);
   - which clock starts "a day";
   - whether the cap is per device or across devices.
   A mark is kept only on the device that made it, so a per-device cap would let two devices make 20. A3's "+10" (:13843) rests on this. The "about 5 minutes" part is fine: P-001-board-bounce.md:1, and the reviewer left it to "the owner or the Definer" (_build-6b-design-round1-verbatim.md:97). Rule broken: nothing made up; testable criteria. Route: Definer.

6. **AC69 now holds two notes that disagree.** The new note (:6113-6116) says vermilion is drawn only on the ◆, Waiting's badge, the cards' kind icons and the briefing's mark. The board note just below it (:6117-6119) still says cards' "edges and buttons" are coral. The AC69 test (:6141-6143) and :6126 list "an item in the Queue" as coral. "Queue rows' edges" is also not defined now that the Queue screen is gone. Route: Definer.

**Non-blocking findings**

7. **The cost risk is out of date.** A3 now leaves 48 to spare (:13843). Risks (:14531-14537) still says the margin is 183 and "the next addition … is counted against the 183". J23's cost paragraph (:12181-12184) leaves out the 10 extra reads. The owner's paragraph does not say the margin fell from 183 to 48. Route: Definer.

8. **CS27 is called moot on a record the repository does not hold.** CS27 (:13237-13240) and (a) item 6 (:2106-2108) rest on "the Orchestrator's working list of 2026-10-21". No such file is in the repository. The same list is the source of the sorting at :2087-2088. Rule broken: the repository is the memory. Route: Definer, who should cite a committed record; or the Orchestrator commits the list.

9. **The owner's paragraph uses an id.** :2012 says "You accepted MD3 on 23 Oct" with no plain name. Earlier leads write "The chosen design running on the real back end" (MD3) (:1660). AGENTS.md §4 says no codes or ids in that paragraph. It also says each of the eight steps is "one pull request you can try on the preview" (:2017), but step 8 changes nothing on screen. Route: Definer.

10. **Small mismatches in the follow-ups and stages.**
    - (b) item 30 (:2218-2220) says "Stage 8", but stage 8's row (:2304) names only item 36.
    - AC89 (f)'s test at stage 6 needs a fixture that opens a bubble, which item 30 places at stage 8.
    - Stage 1 says "AC83's cases kept" (:2297, :15310), but AC89 (c) changes AC83's waits row, so those cases change.
    - Route: Definer.

11. **Stage 8's milestone reason is not true of its work.** It would say "the MD3 design audit's fixes" (:2310), but stage 8 is item 36: tests and tools from the stage reviews, not the audit. The form is allowed; the words should be true. Route: Definer.

12. **Counts and references that don't line up.**
    - :2325 says "the eight rulings above", but nine are quoted. :14769-14772 is clear about it.
    - (a) item 22 (:2148) points to J23 for `no-access`, but J23 does not use that word.
    - Route: Definer.

13. **EXP-005's frozen text uses "he/him/his"** (experiments/EXP-005-md-glance-test.md:33, 41-46, 57-59). The new note leaves the frozen part as it was, which is right, and it adds no pronouns. Any rewording needs a superseding record. No action is needed unless the model's rule against gendered pronouns covers frozen records.

Checked and fine:
- 7 days (AC56) and the waits row's "the redesign question" are marked C.
- The `Milestone: none (<why>)` lines are allowed by the model's rules. M3B's and M3C's "done when" match docs/PROJECT.md:113-114. The new milestone is rightly flagged for the owner, not made here.
- J6's `no-access` matches src/lib/github.js:423.
- J16's settled readings match the stage 1b reviews.
- orchestrator.py:923-934 says what (a) item 16 says.

Self-implication (D-050): none. No earlier check of mine covered this draft.

Files: /home/user/sd-def-md3-after/specs/S-001.md, /home/user/sd-def-md3-after/experiments/EXP-005-md-glance-test.md, /home/user/sd-def-md3-after/src/lib/sandbox.js, /home/user/sd-def-md3-after/docs/design/audit-2026-10-22.md, /home/user/sd-def-md3-after/reviews/S-001-desk-v2/_build-1a-review-round3-verbatim.md, /home/user/sd-def-md3-after/reviews/S-001-desk-v2/_build-6b-design-round1-verbatim.md