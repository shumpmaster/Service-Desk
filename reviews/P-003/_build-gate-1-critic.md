## The Critic's independent view

The case is mostly well sourced and its figures match the spec. It asks the owner to freeze criteria while saying itself that the freeze may be refused. I read only the files in this folder. The dispatch log and `decisions/questions/P-003-*` were not among the files I read, so I could not check the appendix's round counts or the cited rulings.

**The Critic's recommendation:** hold. Proceeding freezes AC1 to AC19, and the case says the evidence check rejects eleven of the spec's facts. That leaves Design-4 "not reached". The case never says why the owner should proceed anyway. It only says a refused freeze "returns to you as a card" (section 5). Fixing the facts so each cites a line is small Definer work and should happen before the owner is asked. If the owner would rather decide now, the case must state that choice and its cost in plain words. The spec itself is sound: the plan review passed it with no blocking finding, and the plan, V6 and cost figures agree with the records. The remaining defects are in the case, listed below.

**Citation check:**
- **§5 line 65, "eleven" facts.** Neither specs/S-005.md:169 nor :186 contains a count or a rejection. Those lines are two individual facts, and the spec lists about fifteen. Section 9 (line 95) repeats the claim. No record in this folder holds "eleven" or says the check rejects them.
- **§1 line 5, status/P-003.toml.** It is cited for "the plan passed". The file shows `last_verdict = "none"`, `plan_round = 1` and `next_gate = "criteria"`. It does not say the plan passed, so only reviews/S-005/plan.md:1 supports that claim.
- **§6 visual and text alternative, "no card is held longer than a day".** The records do not support this.
  - specs/S-005.md:197 says a skewed or malformed raise time can hold a card past a day.
  - AC16 and AC17 hide cards for as long as a read fails.
  - docs/projects/P-003.md:109 excludes failed reads from the miss count.
  - The line cites only docs/projects/P-003.md:107.
- **§1 line 15, "its one sizable risk".** Section 5 lists six risks. The plan review (plan.md:23) says the estimate is the Definer's, not a measurement, and that the Builder may hit the limit. The recommendation and §3 present the new size as settled.
- **§7 line 81.** The stop rule in the plan (docs/projects/P-003.md:113) covers a third "readiness or plan-review round", not a build round. Build rounds come from specs/S-005.md:213. The spec also stops the build if it needs a change to `src/notify/**`, and the case leaves that out.
- **§3 line 36.** It says both join-up differences are "carried below as risks". Only the board and notifications difference appears in §5 (line 62). The type and spacing difference (specs/S-005.md:156) is not carried, though the Build gate is where the form requires it.
- **Form.**
  - By my count sections 1 to 8 run well over 350 words, excluding citations.
  - The §3 standard visual (thumbnails of the agreed screens) is missing, and the case does not say that P-003 has no design files (specs/S-005.md:150).
  - The §1 "proposer's recommendation" line is placed after the visual. This is acceptable.
- **Appendix line 93.** "Written five times", "first four failed" and "three stopped" cite dispatch-log/2026-11.jsonl, which I could not read. I could confirm only stop-5, stop-6 and stop-7 as separate files. The milestone block's own steps show nine Definer runs.
- **All other claims.** The plan citations in §2, §4 and §6 to §8 (docs/projects/P-003.md:34, :46, :67 to :71, :84 to :88, :96 to :107) and the spec citations (specs/S-005.md:26, :72, :154, :180 to :183, :213, :221 to :223) say what the case claims.

**Milestones:**
- **Design-4, "Every fact is backed by evidence": not reached.** This is a finding. The case does not explain why the owner is asked to proceed without it, and §5 shows the milestone is the live problem.
- **Design-3 (skipped in the plan).** "Not recorded" is not a finding.
- **Design-5 and Design-6, "not recorded".** These are not findings. Design-5's reason (the join-up review sits in the spec, specs/S-005.md:147) and Design-6's reason (the spec has not frozen) are both consistent with the records.
- **Build and Launch standard lines (docs/projects/P-003.md:67 to :75).** Build-1, Build-3 and Build-4 are skipped with whys that match the owner's hidden-tests ruling and the plan. The rest are taken on, each with a why.
- **M4, "Every decision card shows the Chief of Staff's recommendation, or says it has none".** It reads as an achievement and carries a why. It has no sprint, but none could exist before this gate, so that is not a finding.
- **Milestone block.** It shows only the Design iteration. I could not check it against `v3_checks gates` output, so the Orchestrator should confirm it was machine-printed, not hand-written.