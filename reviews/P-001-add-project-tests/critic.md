Verdict: PASS

The Critic's cold reading of questions/P-001-add-project-tests.md, on a different model from its writer, verbatim: round 1 (FAIL), round 2 (PASS with three wording fixes, applied). Recorded by the orchestrator. Session session_01QBwHGJH9m3A4Ray7WpHzBo, 2026-11-01.

## Round 1
Verdict: FAIL

The card is mostly fair, but its route claim for option A rests on a reading of the model that the model's own text does not support. Several Context facts are also unchecked, and the language is not plain enough.

1. Option A and the recommendation overclaim on the route (blocking).
- OPERATING_MODEL §3 "Graduation and re-entry" says a graduated product comes back only as "ordinary new work". A defect goes "straight to Build, on a small fix spec" only if it copies frozen criteria unchanged.
- The same section says a defect "whose fix would change or add a criterion or contradict a locked check, starts a new Discovery, scaled to its size. The Chief of Staff proposes which, and the owner approves."
- Rewriting the desk's locked tests is changing locked checks. So option A does not clearly fit the fix-spec route, and it is arguably the route §3 sends to a Discovery.
- The "checks found wrong" route (§4 "Feedback routing", stage 4) is the in-flight routing. §3 does not say it applies to a graduated product.
- The desk's own handover (docs/handover/desk-operations.md lines 60-61) and L-0020 limit the post-launch exception to four settings jobs: "Anything else is new work: a defect fix goes through a short Design of its own, and an addition through a small Discovery."
- Adding Model-Lab is one of those four jobs. Fixing the tests is not.
- The card therefore cannot say A is "the shortest route the model allows for checks found wrong" as settled fact.
- Change the A line "Treated as checks found wrong, which is logged and needs your approval, and counts as no one's failure" to say that the model has no explicit rule for this case. For example: "The model does not say whether a graduated product's wrong tests may be fixed this way. Choosing A is you approving it as an exception, logged like L-0020's four settings jobs."
- Change the RECOMMENDATION from "this is the shortest route the model allows for checks found wrong" to "this is the shortest route; it needs your ruling because the model's re-entry rule (§3) points to a new Discovery for anything that changes locked checks".
- Add a Context bullet quoting §3 and the handover's "Anything else is new work" line (desk-operations.md lines 60-61). The current Context cites only §4 and §2, so the owner sees only the supportive rule.

2. Option B is misdescribed and unevenly costed.
- B is called "the full route the model uses for new work on a graduated product: a brief, research if needed, and your Design gate". §3 and the handover give two routes by kind of work: a short Design for a defect, a small Discovery for an addition.
- A ruling that wrong tests are a defect would point to the short Design, not a Discovery. The card names neither.
- "A day or more, and several more asks" has no source. Say that it is an estimate, or drop it.
- B is the route that follows the rule most closely, yet it is the only option with "Slower" in its description. Add what B gains: it is the cleanest fit to the model, and it leaves a record.

3. Option C hides its cost.
- C says "nothing changes". It should also say the wall stays: every future "add a project" job will hit the same 50 failures, and the handover's promise that adding a project is one line stays false.

4. Context facts that are unsupported or unchecked.
- "50 of 1,568 tests fail; 206 of 206 on main" cites the Builder's return. No such record exists in the repo, and it is labelled "uncommitted". I could not run `git diff` in the worktree because I have no shell tool. Cite a committed record, or mark the figures as the Builder's unrecorded claim.
- I confirmed these facts:
  - tests/desk/helpers.mjs line 22 (J7_FILE reads the live settings file) and line 31 (CONFIG is derived from it).
  - tests/desk/j7-config.test.mjs line 24 (the list is pinned) and line 93 (the project names are pinned).
  - The handover's "one entry in the desk's settings file and one repository added to the read token; nothing else changes".
- I did not confirm tests/desk/j23-versions.test.mjs line 138 or j7 lines 23-25.
- The WHY claims the fake GitHub answers "only for the two projects they know". Context does not state this, and it gets no source. Add a source or soften the claim.
- The WHY says "the desk builds and works with it". The only support is the Builder's return. Say so.

5. Plain English (S-026). The following are not plain for a non-expert:
- "pin the project list"
- "stand-in for GitHub"
- "live settings file"
- "check author"
- "R3"
- "Design gate"
- "checks found wrong"
- the unexplained "about an hour of agent work"

The WHY is one dense paragraph. The model asks for background of at most five lines with no jargon. Suggested rewording of the second half of the WHY: "50 of the desk's own safety-check tests then fail, because they were written to expect exactly the two projects the desk shows today."

6. Risk, reversibility and default.
- R3 is right: §2 says tests are R3 and the owner's. "Reversible" is plausible for a test change.
- The template asks for a DEFAULT letter and a TIMEOUT in hours. "none" is acceptable for an R3 ask, but say "none: R3 never defaults".
- The blast-radius line should also name the deploy approvals. The desk's tile and tests change, and the change goes live through two approvals.
- If option A is chosen as an exception, add that it sets a precedent for fixing graduated tests without a Discovery.

What is fair. There are three options and a clear recommendation. A's cost is honest ("about an hour", plus the verdict, merge and two deploy approvals). Nothing is made to look bad, and Context bullet 4 correctly quotes §4. The fault is the route framing, not the balance.

No files written or changed.

## Round 2
Verdict: PASS

My round-1 findings are resolved. I have three small wording fixes and none of them blocks.

Resolved.
- Route claims (my finding 1): A is now framed as an exception the model does not provide. It names the precedent and is logged like the four routine settings jobs. The recommendation says it needs the owner's ruling because the rule points to B.
- Context quotes: Context now quotes §3's locked-check clause and the handover's lines 60-61 (with L-0020).
- B's description (my finding 2): B now states what it gains, "fits the rules exactly" and "leaves the full record". Its estimate is marked as one.
- C's cost (my finding 3): C now states its lasting cost.
- Builder's figures (my finding 4): They are marked as an unrecorded report, and the fake-GitHub claim is gone.
- Plain English (my finding 5): The jargon is reduced.
- Risk fields (my finding 6): Default reads "none (R3 never defaults)", and the blast radius names the deploys and the precedent.

Fixes to make.
1. Wrong line number for j23. Line 137 is the title of the `publishesModel` test. The pinned two-project assertion is line 138. Change "tests/desk/j23-versions.test.mjs line 137" to "line 138". The j7 lines 24 and 93 and the helpers lines 22 and 31 check out. I read the j7 and helpers files in the Builder's worktree. I did not open j7 line 23 or 25.
2. B's "fits the rules exactly" is stronger than the records. The handover (line 61) says a defect fix goes through "a short Design of its own". Only §3's locked-check clause points to a Discovery. Context quotes both, but B reads as if only one applies. Change "It fits the rules exactly and leaves the full record." to "It follows §3's locked-check clause, which we read as governing over the handover's 'short Design' line for a defect; it leaves the full record." This keeps B honest about the tension and does not undersell it.
3. Context bullet 3 has a garbled quote. It reads "A graduated product's fix 'whose fix would change…'". Change it to: "For a graduated product, a defect 'whose fix would change or add a criterion or contradict a locked check, starts a new Discovery, scaled to its size. The Chief of Staff proposes which, and the owner approves.'"

Nothing in the card now makes an option look bad. A, B and C are each costed, and the recommendation discloses that it goes against the rule's own route.

