# P-003: a dry run of the Design gate's Critic on case 1 (draft 3), the Critic's return verbatim

*Run by the Chief of Staff on 2026-11-05 (session session_01QBwHGKAZuqWeeC6Mst4w88): the same Critic session as dry runs 1 and 2, resumed, on the same hand-built pack with the case at 8a44a65. Not a pipeline verdict; the real gate Critic runs once the case is on the default branch. Its return follows, unchanged.*

---

Verdict: PASS

This is round 3 of the dry run, against the revised docs/gates/P-003/design-gate-1-case.md. I read only inside the pack. All of round 2's blocking citations are fixed, and nothing new blocks.

**Round 2, re-checked**
- B1, §4 line 25 (fixed): "The Builder" now cites docs/projects/P-003.md:69, the row for the Builder and the tests.
- B1, §4 line 23 (fixed): it now also cites P-003.md:57, which is Design-2, mapping how the views join.
- B1, §8 line 47 (fixed): "the brief is settled" now cites P-003.md:3, "Part 1 is settled when the owner approves the move out of Discovery". Line 48 also adds :81 for tier T1, which is correct.
- N1 (fixed): §6 line 38 now reads "usage: per helper run, no total [research/P-003-sizing-findings.md:3]". It is no longer wrong (see N1 below).
- N2 (fixed): §3 line 19 now says "a dry run failed it". The dry run's findings 4–6 are about the borrowing, so this is supported.
- N3 (fixed): §2 line 12 now says "not marked on it", which matches P-003.md:32.

**Blocking**
None.

**Notes**

N1. §6, line 38: the usage line is accurate but tells the owner little.
- It gives no figure, although the record it cites holds one: 91,414 tokens for the sizing helper.
- "Per helper run" undersells what the pack holds. The Critic's runs on this item also record token counts (reviews/P-003-m4-line/_critic-r1/r2-verbatim.md:3; reviews/P-003-critic-pack-cap/_critic-r1/r2/r3-verbatim.md:3).

N2. §3, line 19: borrowing was not the dry run's only reason. Finding 1, the missing standard lines, "fails on its own" (_critic-dry-run-1-verbatim.md:7, :11–16). It is also a symptom of the plan living in the desk's first plan, so the line is fair, if narrow.

N3. Carried from round 2: §4 still does not say who writes and reviews the spec in Design. P-003.md §4 does not record that either.

N4. Form:
- Word count: by my count, §§1–8 hold about 323 counted words, within 350.
- §1 is plain English, leads with what failed, and has no paths or ids in its words.
- The milestones block is in §9, and its events match dispatch-log lines 114–130. I cannot check that it is exactly what `v3_checks gates` printed.

N5. No self-implication flag (D-050). This round re-checks my own earlier rounds, and nothing touches the readiness PASS in reviews/P-003/_critic-dor.md.

## The Critic's independent view

**The Critic's recommendation:** proceed.
- The brief passed its readiness check on its own plan (reviews/P-003/_critic-dor.md).
- Its one load-bearing unknown, the size and place of the change, is answered by research/P-003-sizing-findings.md.
- New spend is $0 and the tier is T1 (docs/projects/P-003.md:79–81).
- Nothing is built before the owner rules the Build gate (P-003.md:61).
- The stop rule is concrete (P-003.md:92).

**Citation check:** Every claim cites a record that supports it. §6 line 38 is supported but gives no figure (N1).

**Milestones:**
- Discovery-1 and Discovery-6 are taken on (P-003.md:48, :53) and read "not recorded". That is not a finding. The case says no record marks them reached and claims neither.
- Discovery-3 reads "not reached" and was skipped by the owner's ruling (decisions/questions/P-003-standard-lines.md). The case says why (appendix, line 56), so it is not a finding.
- Discovery-4 reads "not recorded" and is skipped: not a finding.
- Discovery-2, 5, 7 and 8 read reached.
- The project's own milestone, M4, is in Build and no sprint could exist before this gate: not a finding. Its name and "done when" read as an achievement, not a task.

I can't measure my token use exactly; my estimate is about 100k for all three rounds together.
