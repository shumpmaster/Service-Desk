I've fixed the one blocking finding in specs/S-007.md: the list of changed lines in the line 11 note now includes line 3. Nothing else in the spec changed.

**1. What I changed**
- In the note at line 11, the list of changed lines now reads "line 1 (id), line 3 (status: `draft` here, `superseded` in S-006), line 4 (lineage), this note, …".
- No other line changed. The file is still 231 lines long, so every line number the note cites still holds.

**2. Why**
- The owner's ruling says to "list every changed line" (decisions/P-003/stop-12.md:3). The plan review found that S-007's line 3 differs from S-006's but was not in the list (reviews/S-007/plan.md, Finding 1).
- S-006 named its own line 3 in its list (specs/S-006.md:11), so I followed that.
- I kept the change to one clause because the ruling also says "Do not grow it."

**3. What I verified** (by reading and searching the files; I had no shell, so no command-line diff was run)
- **Line 3:** read specs/S-006.md lines 1–20. Line 3 is `status: superseded`, and S-007's line 3 is `status: draft`, so the finding is real.
- **Id swaps:** searched both files for `S-006`/`S-007`. The `S-006` → `S-007` swaps are exactly at lines 83, 97, 106, 116, 122, 145, 229 and 230, as the note says. In S-007, `S-006` appears only at lines 4, 11 and 18, which are all listed as changed.
- **AC13:** read S-006 lines 45–48. The differences from S-007's AC13 match the note: two cards become three, case (a) is reworded, and the old line 48 becomes case (c).
- **The rest:** I relied on the reviewer's line-by-line comparison for everything else. Apart from line 3, it found only the listed differences.

**4. What is undone**
- The spec is still `draft`. It still has to go through the Critic's plan review again, then the freeze gate, then the owner's scenario card.

**5. What is needed outside my lane**
- The Orchestrator sets line 3's status at the freeze gate and S-006's status on supersession. I didn't touch S-006.
- The Build gate must carry the reviewer's second point: the tests/desk/ path and the behaviour of the code in src/ can't be checked from this pack. The spec already does this (lines 188–190 and 209).

**6. Open questions**
- **Who sets line 3** (the reviewer's question 1): I named line 3 as changed but didn't say who sets the status, to avoid growing the note. If the Critic wants it said that the Orchestrator, not the Definer, sets it, that is one more clause in line 11.
- **Line 47:** case (b) of AC13 ends with a full stop while case (a) ends with a semicolon, and case (c) follows it. I didn't fix this. Line 47 isn't on the change list, and the ruling says to carry everything except the listed lines unchanged.