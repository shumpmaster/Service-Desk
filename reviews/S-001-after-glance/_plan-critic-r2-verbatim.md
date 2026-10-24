# S-001 after the glance audit: the Critic's round 2, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/definer/glance-plan at ee4c946.

---

Verdict: FAIL

The round-1 findings are fixed. Draft 2 still fails on two blocking points, and both go back to the Definer:
- The new M3F line, in its "phase: Build" branch, breaks the milestone standard.
- Four readings that go beyond the rulings are unmarked, and one of them is credited to the rulings outright.

Both fixes are text only. Draft 3 can be short. I read specs/S-001.md at ee4c946 in /home/user/sd-definer: the amendment at :2382-2643, AC91 to AC93 at :8356-8872, the open questions at :15874-15932 and the brief at :16460-16495. I checked them against the rulings, the owner-request record, both audits, CP-01 and S-034's draft. I have no shell, so I ran no diff.

**What holds**
- **Round-1 finding 1 is fixed.**
  - The numbers and the "opening clause" narrowing are gone (grep finds no match).
  - AC92 (e) :8769-8770 uses the owner's "close to or as important".
  - Home's briefing has no line cap (AC91 (a) :8411-8412; AC92 (e) :8774-8775). That matches the ruling, which hands the screen-by-screen call to the Design reviewer (anchor record :13).
  - The ruled project-page box and Home's briefing no longer conflict with any test. Test (e) at :8822-8824 checks the briefing at five lines.
  - Three of the qualitative limits come from the round-2 rule the owner took as proposed (round-2 audit :114, :116; ruling :1): "never inside a card, tile or sheet", "never around an agents' gap" and "never vermilion". "Never on every screen" is the ruling's "occasional". Note A covers the two that are glosses.
- **Round-1 finding 2 is fixed for M3E.** Question 1 option A now states its consequence plainly (:15880-15882). Question 1's B and question 2's A agree that G10 never holds launch up (:15901, :15906-15907, :2610).
- **Round-1 finding 3 is fixed.**
  - One class per standard milestone, in a set order, with T, R, k, q, j and e defined (:8684-8707). k+q+j+e adds up to the phase's total.
  - Each sprint counts once, and "merged" comes from the Timeline's own source, dispatch-log merges included (:8708-8715).
  - The CI line is exact (:8734-8738), and test (c) covers every case I raised.
- **Round-1 finding 4 is fixed.**
  - Notes are in place at AC48 :3784, AC49 :4104, AC55 :5077, over AC65 to AC68 :6181, AC81 :7367, AC88 :8101 and AC89 (h) :8203.
  - AC89 (j)'s note at :8232 agrees with AC91 (h) :8503-8505 and with "What changes" :2495-2496.
  - (l) names its two places, which are the audit's two (audit :196). J9's `<t>` and AC78 are unchanged, and the j9 test is kept (:8549-8552, :8582-8583).
- **Notes 5 to 13 are fixed.** Spot-checks:
  - "the largest text under the title" (:2391, :2577, :8396-8398);
  - G5 in the brief (:16478-16480);
  - "Kicked back · none" (:8463);
  - the gate sheet's whole first line (:8506-8510);
  - the foot line and the can't-draw tile (:8426-8435);
  - the fixtures (:8368-8378);
  - Plan's "moved" edge after G7 (:2588-2590).
- **AC93 now matches S-034's draft:** J1 and J2, `sprints` on session lines read through J13, no milestone key, and "steps not recorded" (S-034 :5, :39, :92, :106-107). G10 is still gated (:8837-8841).
- **The interim `Milestone: none (…)` reason** still has no parentheses inside it.

**Blocking findings**

1. **The M3F line fails the milestone standard in its Build branch, and its "not a condition of the Build gate" is untrue there.**
   - Evidence: :15894-15900 gives "phase: <Build if the model release lands before launch; otherwise later work after launch, with ` · for:` …>" and then says "It is not a condition of the Build gate or of the launch". :2596-2600 says the same.
   - A Build milestone must be needed to reach the Build gate (D-052). A Build milestone the gate doesn't need fails that.
   - It is also not true in practice. At the gate, an unreached Build milestone is a finding whenever its sprint could exist before the gate (the Critic's gate rule). Once S-034 is released, G10's sprint could exist, so M3F would hold the gate after all.
   - "Before launch" is also the wrong test. If the release lands after the Build gate but before launch, the line adds a milestone to a phase already passed.
   - Rules: D-052, and no two statements in conflict.
   - Route: Definer. Either make M3F always later work, ` · for: <the item filed for it>`, or say that if it is added before the Build gate it is a Build-gate condition, and tell the owner. Then make :2596-2601 and question 2's A match. The Critic checks the actual line before it is filed.

2. **Readings beyond the rulings are unmarked, not put to the owner, and in one place credited to the rulings.** Each can go into question 4 as a reversible reading.
   - **(a) The red words and the red border that stay.**
     - AC92 (a) :8609-8611 and :8623-8633 keep red words on every error state, and keep AC75's warning with "its words and its 1 px border in `--bad` … the one red border". It says "The ruling is about status marks".
     - The ruling says "on the 14–16 px mark only, never on words, rows or borders", and has the one red tile border removed (palette record :1).
     - The proposal the owner took allowed one exception: "Words stay ink or grey, except the can't-read line" (round-2 audit :53).
     - Keeping the can't-read words is ruled. Keeping the other error words and a red border is the Definer's reading. It needs a C mark and a line to the owner. Today only the stage table hints at it (:2583).
   - **(b) A milestone reached once stays reached.**
     - :2532-2534 lists "still counted as reached (AC92 (c))" under "all settled by the rulings".
     - No ruling or question settles it: round-2 question 5 (:306) asked about colour only.
     - AC92 (c) :8691-8693 counts a milestone reached in run 1 and "not reached" in run 2 as reached, while run 2 shows a red ✕. That is a defensible reading of "what we've completed so far", but it is the Definer's.
   - **(c) "Not needed" left out of T.**
     - :8694-8695 leaves "not needed" out of T.
     - Option A, as put, counts "as proposed" (counts record :8), and the proposal's T takes in standard milestones "with a recorded state" (round-2 audit :203).
     - Leaving it out fits "the unused standard ones said in words" and the owner's complaint, but it departs from the letter of the proposal, so it is a reading too.
   - Rules: a ruling applied as it reads; every reading marked C; nothing credited to a ruling that the ruling doesn't say.
   - Route: Definer.
     - Mark (a) to (c) C.
     - Correct :2532-2534.
     - Add them to question 4 as readings (e) to (g), each standing unless the owner says otherwise.

**Non-blocking notes**
- **A. Two box limits are glosses.** "Most screens having none" and "never a whole list of rows" (:8773-8774) are the Definer's glosses of "occasional" and "overdone". Both are consistent with the round-2 table the owner approved, but neither is in the ruling. Mark them C, and name them in question 4 (d), which today tells the owner the Design reviewer's list alone "is the rule" (:15931-15932).
- **B. M3E's "done when" is wider than meant.** It reads "the owner's 24 October glance answers show" (:15885-15886), and those answers include the pieces of work (counts ruling :1). Add "the pieces of work apart (M3F)" so M3E can't be read as waiting on S-034.
- **C. The owner's paragraph opens with something now untrue.** It says "Nothing failed and nothing was skipped" (:2384), but draft 1 failed both checks. This spec's own earlier amendments say so in their plain paragraphs (:1161, :1431), and AGENTS.md §4 says to lead with failures.
- **D. A running workflow may read as a failure.** n counts it but k can't (:8735-8738), so "2 of 3 workflows passed" may read as a failure. Say what a running one shows. Test (c) lists running workflows without their words.
- **E. The box's tally has only one form.** "<R> of <T> milestones reached · <s> sprints · <m> merged" (:8788) lacks the ", <w> not read" and "merges not read" forms of (c).
- **F. Whether the goal boxes count as boxes is open.** The Timeline's goal boxes and Plan's card are left to the Design reviewer (:8795-8796), but the table gives those screens "none" and test (e) allows a box "only on the screens the table names" (:8822). Say whether `.v2-goal` and Plan's card count as boxes for the test.
- **G. AC93 names only one way a step reaches its milestone.** It gives the sprint's `Milestone:` line (:8849). S-034 also names the spec's header and the research request's tag (S-034 :68).
- **H. Question 2's costs rest on no record.** It cites "about a day of work, CP-01" (:15910-15912), but CP-01 holds no such figure. The "ten minutes" per stage has no record either. Cite the dates (M3D's reviews 23 Oct, accepted 24 Oct) or mark the costs as the Definer's estimate.
- **I. The letter k means three things:** tracked per phase in (c), tracked per run in (d), and workflows passed on the CI line. Minor, but the plan review flagged the same kind of clash for u.

**Open questions**
- For the owner, through question 4: should error lines and the notifications warning keep their red words and border? Should a milestone reached in an earlier run count as reached when a later run records it not reached? Should "not needed" sit outside the total? (Finding 2.)
- For the Definer: under finding 1, is M3F always later work with ` · for:`, or a Build-gate condition when it is added before the gate?

**Self-implication (D-050):** yes. Finding 1 implicates my round-1 check. Round 1 said "Option B's M3F line also passes", and its route suggested "G10 under a milestone that is not a Build-gate condition" without saying that such a milestone then can't sit in Build. Whoever runs Triage should weigh that.

Files:
- /home/user/sd-definer/specs/S-001.md
- /home/user/sd-definer/decisions/questions/P-001-glance2-palette.md
- /home/user/sd-definer/decisions/questions/P-001-glance2-counts.md
- /home/user/sd-definer/decisions/questions/P-001-glance2-anchor.md
- /home/user/sd-definer/docs/design/audit-2026-10-24-round-2.md
- /home/user/sd-definer/docs/design/references/owner-request-2026-10-24-glance-emphasis.md
- /home/user/sd-definer/docs/PROJECT.md
- /home/user/sd-definer/docs/CHECKPOINT.md
- /home/user/Personal-Org-Operating-Model/specs/S-034-tasks-and-steps.md
- /home/user/Personal-Org-Operating-Model/OPERATING_MODEL.md
