Verdict: FAIL

All 13 round-1 findings are fixed or soundly answered. The code side of draft 2 works: CS37 → CS38 → LA2, the address split and what graduation does to the desk. Three new blocking findings fail it, all in how the gate itself is run:
- the first new owner question is not fairly put;
- the join-up review and the launch review are written as steps the Reviewer cannot do;
- the Launch-gate ruling is never filed as an ask, and the way the records are named lets a "hold" show Service-Desk as Done.

I worked read-only in /home/user/sd-ladef at 76776c7. Spec line numbers are specs/S-001.md there.

**Checks.** `check_all.sh . e477cc2`: every step passes except `surface_guard diff`. Its 6 violations are the Chief of Staff's own commits from the push branch, brought in by the merge at 0944153. On the definer's own commit (`--range 0944153..76776c7 --branch build/definer/launch-plan`) it passes. That is an effect of the range, not a finding. `v3_checks gates`, `milestones` and `scope` pass. The tree was still clean afterwards.

**What I relied on, graded**
- **A (read myself):**
  - desk-deploy.yml:43, 96-160, 164-198; desk_pick_commit.sh:42, 46; desk_preview_check.py:58-80; sw.js:21-31.
  - projects.json:6 and both config.js:20; j7-config.test.mjs:37, 49, 55, 65, 90, 96-97, 126; notify-j17-push.test.mjs:101, 109.
  - src/lib/sandbox.js:254-255, 379; src/public/sandbox.js:1040-1057; projectpage.js:103; portfolio.js:135; board.js:440. The sender imports nothing about phases or graduation (sender.mjs:9-19).
  - v3_checks.py: `gate_runs` (1254-1273), the case rules (2425-2700; the launch case must cite docs/handover/ and reviews/S-001/reviewer.md, from status/P-001.toml `spec`), `build_gate_passed` (1763), the standard-line rules (1946-1977), `ruling_why` (1811). PACKS.toml `[roles.critic-gate]`.
  - risk-paths.toml; SURFACES.md; HOLDOUTS.md (empty); LEDGER L-0003; OPERATING_MODEL.md:114, 116, 126, 128, 160-174, 199, 201; _GATE.md; docs/handover/_TEMPLATE.md; decisions/README.md:53-69; the three answer records.
- **C (could not check):** today's Cloudflare and GitHub screen names (CS39 is meant to read them); what the CS37 listing will print; whether a Pages rollback keeps secrets.

**Blocking**

**B1. Question 1 (21186-21200) tells the owner that only Build-1 was never done. Build-2 and Build-3 weren't met as the model writes them either.**
- Build-2's done-when is "built to the frozen plan" (OPERATING_MODEL.md:166). S-001 never froze.
- Build-3's is "it holds against the hidden tests too" (:167). governance/HOLDOUTS.md holds none, and the spec itself says "there are no hidden tests" (3917-3918).
- Option A then says "The other nine lines … are taken on, each checked by the Critic". The owner would rule believing everything else was done the model's way.
- This is the same kind of fault as round 1's B3.
- Fix: before it is filed, say in the question that Build-2 and Build-3 were met against the draft spec, with no hidden tests, and how the case will show that. Or offer `skipped` with reasons for those parts as well.

**B2. The join-up review (S3, 4008-4024) and the launch review (S5, 4029-4033) are written as things the Reviewer does on the preview. It cannot.**
- The preview is behind Access for the owner's email only (Setup C2-C4, 18009-18022).
- The Reviewer has no sign-in, no iPhone and no write tool. It cannot open "the desk from the Home Screen icon", tap an N8 notification, or merge a pull request and push it through a held `preview` run.
- Past reviews worked from code and DOM walks, not the live preview (for example reviews/239/reviewer.md:88: "no Playwright or Chromium").
- As written, both reviews must FAIL or stall: "an unverifiable claim is a FAIL".
- Fix: say how each path is checked end to end:
  - the fixture-driven DOM and function walks under tests/desk;
  - the records: desk-deploy run logs, desk-notify test runs, the owner's captures;
  - or the owner walking the paths with the Chief of Staff, as owner steps with minutes.

  Say the same for "running on the preview" in S5.

**B3. The Launch-gate ruling is never filed as an ask (model S-033), and the records' names make filing it unsafe.**
- The model says "every ruling put to the owner, including one asked in a session, is filed … as `questions/<name>.md` … The answer is recorded in `decisions/questions/<name>.md` under the same name" (OPERATING_MODEL.md:100). There is no card here, so L0 (4083) is such an ask. The plan files nothing.
- The graduation record needs "Question, as put: <the Launch-gate question, word for word>" (decisions/README.md:62). No such wording exists in the plan.
- Naming conflict: a proceed answer goes to decisions/questions/P-001-graduation.md (L10, 4116), but a non-proceed answer goes to P-001-launch-gate-1.md (CS42, 18645). One question file can't satisfy "under the same name" for both.
- Hazard, if the Chief of Staff files `questions/P-001-graduation.md`: the desk's answer link writes `decisions/questions/<q.name>.md` (board.js:440). The desk marks the project Done when that file merely exists (sandbox.js:254-255). So a "hold" answered from the desk would show Service-Desk as Done.
- Fix:
  - file `questions/P-001-launch-gate-1.md` (Milestone: M3C, the question's words, the four options) before O9;
  - say that a `proceed` is recorded in the graduation form at P-001-graduation.md, after go-live, and that any other ruling goes to P-001-launch-gate-1.md;
  - name this as a reading of S-033 against decisions/README.md;
  - say the question is never answered through the desk's answer link.

**Non-blocking**

- **N1. The cost the owner was told.** Option B was put as "About a day more (an estimate)" (P-001-m3c-launch-gate-2.md). Draft 2 now estimates about three days of agents' work (half a day in draft 1) and 80 minutes of the owner's time (50 in draft 1) (3801-3802). The opening should state the difference plainly and leave the owner free to re-rule.
- **N2. Question 2 (21202-21216) is narrower and more one-sided than the decision it asks for.**
  - It paraphrases the model as "brings changes … back only as new work". It leaves out that a graduated product "owns its own running" (:116), and that AC26 and AC27 make adding a project a running job. On that reading, A might need no ledger exception. Name the reading and why it doesn't hold.
  - A's cost leaves out the Design reviewer's verdict. Every J7 change touches src/public/lib/config.js, which risk-paths.toml's `[paths."src/public/**"]` reviews.
  - B's "a day or more" has no (E).
  - Neither option says that rolling back `push.deskUrl` (LA1's rollback job) falls under it, so under B the rollback is not "minutes".
  - Neither the question nor "What graduation changes" (3933-3948) says the other cost: S-001 never froze, so after graduation every defect fix goes "through a normal short Design" (:116).
  - It is due "before CS41", but LA1's notes and handover (adding a project, rolling back) depend on it, and they merge before CS41. Make it due before LA1 opens.
- **N3. The product reviewed may not be the product deployed.** Nothing holds src merges between S3 or S5 and L3. Main moves (LA1, fix-forwards), and LA2's merge commit then deploys whatever main holds. Have the case name the reviewed commit, and check at L3 that main's deployable paths differ from it only by LA2. Or hold those paths from S3.
- **N4. The join-up review can't cover LA2 or the production job (CS37 and CS38) before go-live.** Say so, and carry it into section 5 of the case as a risk.
- **N5. Launch-2 ("An operating team is in place") is taken on, but nothing names the operating team or its record.** Name it in the handover's "How to run it" and in section 4 of the case.
- **N6. The dry-run stand-ins for the two parts that start at go-live (3922-3929).** The Reviewer's own rule FAILs any named part not running on the preview. Have the handover's monitoring section name each part in the form that does run there (the sheet in its before-launch state, the trial week with the dry run). List the substitution among the case's lessons for the model.
- **N7. If the sitting stops between L1 and L10** (L7's "stop", a failed deploy, a rollback), the L0 `proceed` has no record. Say how it is recorded and whether a retry goes ahead under the same ruling.
- **N8. Round-1 N6 recurs at 18617.** CS40's `Owner-Ruling:` trailer must name decisions/questions/P-001-launch-standard-lines.md, because `ruling_why` reads the record's first line and needs `Build-1` in it. As written, it names the question file.
- **N9. Owner time is undercounted (C for the exact count).** No minutes are given for:
  - CS39's screen-name session "with the owner";
  - the owner's merges of CS40, CS41, the join-up, launch and Critic records, both questions and their answers, M3C's acceptance and its reached date.
- **N10. O8(b) (4065-4070) has the second step backwards.** Turning "Enable access policy" on again makes the wildcard application (previews) again. The edited one is the one for needs-you.pages.dev (C3: "That gives two applications"). The end state is the same.
- **N11. Two small citation slips.**
  - The user representative is in §4 (OPERATING_MODEL.md:201), not §3 (3822).
  - The Done group's header count is at src/public/sandbox.js:1057, not :1040 (3937).
- **N12. LA1 needs CS39's hand-overs** (CS37's branch and run id, EXP-006, the dry run, the screen names). "When it opens", item 3 (3990), names only the join-up review.
- **N13. CS38 (18601) says nothing about what to do** if CS37's listing shows no branch, or different branches across production deployments.
- **N14. Discovery's and Design's standard lines are missing too.** Option B's argument, "a line for every standard milestone … stays unmet", applies to them as well. Say they are out of scope for this gate.
- **N15. M3C's acceptance (CS42, 18629-18650) should be filed first** as questions/P-001-m3c-accept.md, as M3A's and M3D's were (e73e7a5, d88b2ca).

**Round 1, item by item**
- **B1 fixed:**
  - O8 is split into (a)-(d): 4, 7, 4 and 2 minutes.
  - L2 into L2a and L2b: 4 and 5.
  - L9 into L9a and L9b: 4 and 5.
  - Reading the case is O9: 8.
  - The sitting adds up to 37 minutes.
- **B2 fixed:** CS37 is merged, then run on main. `exp-002` runs only on main (yml:164), in `preview`, with main's current commit passing the pick check (:42, :46). CS38 follows, and merges before LA2 (:46).
- **B3 answered:** the question was asked again with the departure named and the M3F ruling stated as recorded. The Critic-gate quote now comes from L-0003. The residue is N1.
- **N1-N5 and N7-N10 fixed.** N6 is fixed apart from 18617, which is N8 above. On N7, regenerating keeps the token's kind, so EXP-006's unrecorded kind doesn't matter.

**Checked, no finding**
- **The order** follows §3 "Graduation and re-entry", §4 "Phase gates" and _GATE.md:
  - Build's join-up review is at reviews/S-001/_reviewer-build.md and the launch review at reviews/S-001/reviewer.md, both inside the critic-gate pack.
  - The User representative is shown as not needed (PROJECT.md:469), and section 8 holds the go-live and the graduation.
  - A hold gives launch-gate-2-case.md.
  - The owner approves the production deploy.
  - The graduation record form matches decisions/README.md, with line 2 empty.
- **The case's milestone block** is empty: there are no `gate` lines, so `gate_runs` returns []. An empty block equals the expected block, so the draft's "C until it runs" is A from the code.
- **Owner ruling for Build-1:** needed, because `build_gate_passed` is true when a Build milestone lists sprints.
- **LA2:** the split is sound. Taps change only on merge (sender.mjs:142; desk-notify.yml:75). Each pin is named, and the other uses of the preview's address are the made-up values the plan names.
- **The sitting's order:** the pick and preview checks pass with L3 → L4 → L6 on LA2's merge commit. CS42's hold covers all four deployable paths.
- **After graduation:**
  - Service-Desk goes to the Done group, which starts closed, and its header still counts what waits on the owner.
  - The cap stops counting it (portfolio.js:135).
  - Its records and queue are still read.
  - The sender still notifies: it reads no phase or graduation.
  - Other projects are untouched.
- **Classes and verdicts:**
  - CS37 and CS38: .github/**, the Chief of Staff's surface, R3: the Reviewer and the owner.
  - LA1: docs/handover/** (R0) and tests/desk (R1), the Builder's: the Reviewer only.
  - LA2: R3 for projects.json, plus the Design reviewer for src/public/lib/config.js: the Reviewer, the owner and the Design reviewer.
  - The case and the standard lines: the Chief of Staff's surface, R0.
  - The graduation record: the owner, a human committer.
- **Screen words** "More detail", "Turn on notifications", "Copy", "I've added it to GitHub" and "Before launch: a trial, not counted" match the code (home.js:46; notifyview.js:107, 113; weekly.js:20).

**Open questions**
- Will CS37's listing show a Branch for direct uploads? (Round 1's question; N13.)
- Does a Pages rollback restore a deployment with its old secrets? (C; the plan fixes forward if not.)

Spec: /home/user/sd-ladef/specs/S-001.md. Full check output: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/r2checks.txt
