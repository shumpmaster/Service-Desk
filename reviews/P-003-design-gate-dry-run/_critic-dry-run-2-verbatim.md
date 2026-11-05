# P-003: a dry run of the Design gate's Critic on case 1 (draft 2), the Critic's return verbatim

*Run by the Chief of Staff on 2026-11-05 (session session_01QBwHGKAZuqWeeC6Mst4w88): the same Critic session as dry run 1, resumed, on the same hand-built pack with the case at 6bd3de1 (answering dry run 1). Not a pipeline verdict. Its return follows, unchanged.*

---

Verdict: FAIL

This is round 2 of the dry run, against the revised docs/gates/P-003/design-gate-1-case.md. I read only inside the pack.

Both round-1 blocking findings are fixed. The case still fails on one point: in three places a claim cites line numbers that don't say it. Each fix is small, because the right line sits in the same file.

**Round 1, re-checked**
- B1 (fixed): §1 line 6 now reads "nothing is built until the Build gate, which you rule". docs/projects/P-003.md:61 supports it.
- B2 (fixed): appendix line 55 now lists all three rulings, and the cited records match.
- N1 (fixed): appendix line 54 now gives four runs, the error, and the proxy answer. Dispatch-log lines 114–129 and decisions/P-003/dor-fail-2.md:2 support it.
- N2 (fixed): §1 line 5 now cites the dispatch log, which holds the error and both FAILs.
- N3 (fixed): §3 line 19 now cites reviews/P-003-dor-dry-run/_critic-dry-run-1-verbatim.md. Its findings 4–6 are about the borrowing, so the line is supported. See N2 below.
- N4 (fixed): §5 line 33 now says "no record marks them reached". This is honest, and neither milestone is claimed reached.
- N5 (fixed): the codes are gone from §§1–8, and "review round" is now generic.
- N6 (partly fixed): §4 now names the Builder and says no date is recorded, and §6 says "usage not recorded". See B1 and N1 below.

**Blocking**

B1. Three claims cite lines that do not say them.
- §4, line 25: "The Builder then builds the fix itself" cites docs/projects/P-003.md:44 and :68. Line 44 names no builder. Line 68 is the Chief of Staff's row (plan, notes, resubmission). The Builder's row is line 69.
- §8, line 47: "the brief is settled" cites P-003.md:44 and :86, and neither says it. P-003.md:3 does: "Part 1 is settled when the owner approves the move out of Discovery".
- §4, line 23: "maps how the views join" cites P-003.md:56 and :58. That is Design-2, at line 57, which is not cited. This is the least serious of the three.

**Notes**

N1. §6, line 38: "usage not recorded" cites P-003.md:90, which is about running costs, not usage so far.
- The pack does hold some of this phase's usage, as token counts per run: research/P-003-sizing-findings.md:3 (91,414 tokens); reviews/P-003-m4-line/_critic-r1-verbatim.md:3 and _critic-r2-verbatim.md:3; reviews/P-003-critic-pack-cap/_critic-r1/r2/r3-verbatim.md:3.
- No total exists. "Partly recorded, no total" would be accurate. "Not recorded" slightly understates it.

N2. §3, line 19: "borrowing from the desk's first plan failed it". The record is a dry run of draft 2, not one of the pipeline's two FAILs, whose texts are not in the pack. An owner may read "it" as the real check.

N3. §2, line 12: "unshown recommendation" is a little stronger than P-003.md:32, which says the recommendation "is not marked on the card". The pack holds no record of what those cards' section 5 showed.

N4. §4 names only the Builder. It does not say who writes and reviews the spec in Design. P-003.md §4 does not record that either, so it is a form gap rather than an error.

N5. Word count: by my count, §§1–8 hold about 323 counted words, within 350. §1 opens in plain English, leads with what failed, and has no paths or ids in its words. The milestones block is in §9, and its events match dispatch-log lines 114–130. I cannot check that it is exactly what `v3_checks gates` printed.

N6. No self-implication flag (D-050). This round re-checks my own round-1 findings, and nothing here touches the readiness PASS in reviews/P-003/_critic-dor.md.

## The Critic's independent view

**The Critic's recommendation:** proceed. The brief passed its readiness check on its own plan (reviews/P-003/_critic-dor.md). Its one load-bearing unknown, the size and place of the change, is answered by research/P-003-sizing-findings.md. Spend is $0 and the tier is T1 (docs/projects/P-003.md:79–81). Nothing is built before the owner rules the Build gate (P-003.md:61). The stop rule is concrete (P-003.md:92). The case's three line citations in B1 need correcting before the owner reads it.

**Citation check:**
- §4, line 25: "The Builder" is cited to P-003.md:44 and :68, and neither names the Builder (line 69 does).
- §8, line 47: "the brief is settled" is cited to P-003.md:44 and :86, and neither says it (line 3 does).
- §4, line 23: "maps how the views join" is cited to P-003.md:56 and :58 (it is line 57).
- §6, line 38: "usage not recorded" is cited to P-003.md:90, which does not cover usage, and the pack holds per-run token counts.
- Every other claim cites a record that supports it.

**Milestones:**
- Discovery-1 and Discovery-6 are taken on (P-003.md:48, :53) and read "not recorded". That is not a finding. The case now says plainly that no record marks them reached, and claims neither.
- Discovery-3 is "not reached" and was skipped by the owner's ruling (decisions/questions/P-003-standard-lines.md). The case says why (appendix, line 56), so it is not a finding.
- Discovery-4 reads "not recorded" and is skipped: not a finding.
- Discovery-2, 5, 7 and 8 read reached.
- The project's own milestone, M4, is in Build and no sprint could exist before this gate: not a finding. Its name and "done when" read as an achievement, not a task.

I can't measure my token use exactly; my estimate is about 90k for both rounds together.
