Verdict: FAIL

Draft 2 fixes both round-1 blocking findings and all eight notes in the criteria' own text. One blocking defect is left: AC52's test still asks for the very display the B1 fix removed. It takes one line to fix.

**Blocking findings**

B1. AC52's test still checks words for "a ruling whose first line is not in form". The new B1 rule says such files are never shown, so the test and its criterion contradict each other.
- specs/S-001.md:1391-1393 (the AC52 test bullet, unchanged by 577dddb) reads: "each "Done today" row's words against its record's first line or J9's decision words, with the code after, for two rulings made on the same day, and the words for a ruling whose first line is not in form."
- Draft 2 deleted the words that test checked ("ruling's first line not in form", formerly at AC52). It replaced them at 1333-1339: a file whose line 1 does not start `Ruling:` (or `Decision:` for a profile approval) "is not the owner's and is ignored: never shown, never counted." AC55 at 1684-1690 says the same.
- Why it is blocking: the test is about to be locked, and it requires a row that the criterion forbids. A Builder meeting this test has two choices. One is to keep the old "not in form" row, which puts back round-1 B1 (a Critic's `Verdict: FAIL` file showing in "Done today"). The other is to ignore the test. Either way, the locked check and the build disagree.
- Reproducing case: in decisions/questions/, P-001-milestones-adoption-critic-1.md has line 1 `Verdict: FAIL`. Under 1391-1393 the test expects "the words for" it. Under 1333-1339 it must not appear.
- Fix: replace the clause with "and that a file whose line 1 starts neither `Ruling:` nor (for a profile approval) `Decision:`, such as a Critic's verdict, is not shown". AC55's test (1723-1724) already checks this for "Done today", so the clause could simply be removed instead.

**Round-1 findings, checked against draft 2 (git diff 677a862..577dddb)**
- B1 (Critic's verdict credited to the owner): fixed in AC55 (1684-1690), AC52 (1333-1339), the summary (103-105), and AC55's test, which has a profile-approval fixture and a newer `Verdict: FAIL` file (1719-1724). decisions/README.md:45-47 confirms the `<item>-user-profile-<n>.md` / `Decision: approve` form. I checked line 1 of every file in decisions/questions/. Every owner ruling starts `Ruling:`. The only other line-1 forms are the Critic files (`Verdict:`) and the `-notes.md` files (`#`), so the rule sorts every file there today correctly. The one gap is the stale test line in B1 above.
- B2 (refresh defined too narrowly): fixed. 1753-1755 now counts every redraw the owner did not cause. 1756-1759 limits the 15-second tick to the time-dependent text, which answers my open question; the redraw it replaces is still at origin/main:src/public/sandbox.js:736. The test (1770-1789) runs all four kinds of refresh, and checks element identity for the tick. Both are testable.
- N1 (Escape and focus): fixed at 1580-1582, 1749-1750 and in test (b) at 1656-1657.
- N2 (lane with no fork): fixed at 1035-1036.
- N3 (what a card's answer carries): answered at 1488-1495. The reason holds against practice. Every existing card answer in decisions/P-001, Q-002, Q-003, Q-005 and Q-006 holds only `Decision:` and an optional `Proxy:` line. decisions/README.md:8-9 says later lines on a gate card are not read. (See N2 below on README:37.)
- N4 (line breaks and `; ` in an answer): addressed at 1503-1505 and 1513-1515, with test coverage at 1522-1523. See N1 below on the order of the two replacements.
- N5 (recommendation prefix): fixed at 1474-1478.
- N6 (which run opens): fixed at 1223-1224, with a test at 1265-1266.
- N7 (milestone colour): settled by the owner, "Bold headings, no colour (Recommended)" (decisions/questions/P-001-trial-view-notes-1.md, last paragraph). AC51 at 1234-1238 and 1251 is consistent with that answer. See N3 below.
- N8 (test states on different screens): fixed. The test now runs in four steps, one per screen (1775-1786). I checked that each named state exists in the spec: the Home groups and their starting states (1601, 1627), "More detail" (1703), "Done today" (1314), and the milestone detail and the standard milestones box (1243-1246).

**Non-blocking notes**

N1. AC53's joining rule (1503-1505) does not say which replacement runs first. The order matters: for "a;" followed by a line break and "b", joining the line first gives "a, b", but replacing `; ` first gives "a; b", which leaves a `; ` in line 1. Say "line breaks first", and add that case to the test at 1522-1523.

N2. decisions/README.md:37 says "A ruling record holds only the ruling: the `Decision:` or `Ruling:` line, any `Proxy:` line, the question and its options exactly as they were put". Read literally, that covers card answers too. The spec's reason at 1488-1495 matches every card answer actually on file and is marked (C). Still, the README wording and the spec now differ on paper. The README could be clarified later; nothing in the build depends on it.

N3. AC51's milestone styling (1234-1238, 1251) cites only AC48. The owner's own answer ("Bold headings, no colour", P-001-trial-view-notes-1.md) was committed at 0713f0e, after draft 2. Cite it there and in the lineage, so the trace rests on the owner's ruling and not only on the earlier rule.

N4. The B1 fix silently drops an owner ruling whose line 1 is mistyped (for example, lower-case `ruling:` or an empty line 1). Before, it showed as "not in form". The owner will not see that such a ruling went unread. The fix is acceptable, and decisions/README.md makes line 1 mandatory. Consider flagging such a file as an anomaly elsewhere, but only when its name matches an open question in questions/.

N5. On a phase-gate card, the owner's free words go "after a blank line as J3's note" (1486-1488). If the owner's text holds a line beginning `Into:`, `Reason:`, `Nothing needed:` or `User-Override:`, the Orchestrator would read it as a field (README:8-16). This was there before draft 2. A one-line guard would close it, for example indenting each note line or flagging it on the rule line.

**Anything the new text breaks**
Apart from B1, nothing. Draft 2 also left the rest of the amendment alone: the spec is unchanged between 577dddb and e1630d8, and only the record and the round-1 review were added. None of the new text uses he, his or him.

**What I ran** (read-only)
- Read reviews/S-001-trial-view-1/_plan-review-round1-verbatim.md.
- `git diff 677a862..577dddb -- specs/S-001.md` and `git diff 577dddb..e1630d8 --stat`.
- Read specs/S-001.md lines 1216-1262, 1310-1340 and 1384-1396, and grepped the spec for "not in form", "Done today", the group names, "More detail" and the standard milestones box.
- Line 1 of every file in decisions/questions/, and the first lines of every card answer in decisions/*/.
- decisions/README.md lines 1-49, and the tail of decisions/questions/P-001-trial-view-notes-1.md.
- `git show origin/main:src/public/sandbox.js | grep setInterval`: line 736, the 15-second render.
- `spec_check.py status --root .`: OK. `spec_check.py facts --root . --base origin/main`: OK, 0 specs frozen. `v3_checks.py trace --root .`: OK. `v3_checks.py milestones --root . --base origin/main`: OK, 9 milestones.
- A pronoun grep: no matches.
- `git status --short` was clean afterwards.

Files: /home/user/sd-tv1/specs/S-001.md, /home/user/sd-tv1/decisions/README.md, /home/user/sd-tv1/decisions/questions/P-001-trial-view-notes-1.md, /home/user/sd-tv1/decisions/questions/P-001-milestones-adoption-critic-1.md, /home/user/sd-tv1/reviews/S-001-trial-view-1/_plan-review-round1-verbatim.md
