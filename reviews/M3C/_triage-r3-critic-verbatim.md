**One focused confirmation review**, after a small draft 4.

Caveat: I have no shell, so I could not diff b26e876, 76776c7 and c36977e. For what changed between drafts I relied on the reviewers' item-by-item accounts (r2 81-90, r3 95-119). I checked the cited lines on the branch (HEAD build/definer/launch-plan).

**1. The failure chain**
- **Round 1:**
  - B1, steps of 10 minutes or more: a writing defect.
  - B2, the fallback that can't run: a wrong fact about workflow_dispatch and the main-only rules (r1 30-36).
  - B3: a brief or orchestration gap that rests on wrong facts. The Launch-gate question had already been put to the owner, misreading the M3F ruling and citing a record that doesn't say it (r1 38-44). Its answer was later superseded as "not fairly put" (P-001-m3c-launch-gate-2.md:5).
- **The moved target:** the owner switched to gate first (launch-gate-2.md:1). Option B was costed at "about a day" (:10). The plan then found about 3 days, and the owner had to be asked again (launch-gate-3.md:6-8). Owner minutes later rose from 80 to 110 (r3 7).
- **Round 2,** all from the switch:
  - B1, the Build standard lines put unfairly: a wrong fact, "the same kind of fault as round 1's B3" (r2 23-27).
  - B2, reviews the Reviewer cannot do: a wrong input about the Reviewer's access and tools (r2 30-34).
  - B3, the gate never filed as an ask, plus the naming hazard: an orchestration gap. Filing asks under S-033 is the Chief of Staff's process (r2 42-46).
- **Round 3,** all from the switch:
  - B1, run records that can't exist: a wrong fact about the workflows' path triggers. It came in with the fix for r2 B2 (r3 26-36).
  - B2, a kill by proxy: a wrong input. decisions/README.md:57 names only "the launch approval", while :5-7 and ROUTING.toml:424 refuse a proxy on any closing word (r3 43-46). It came in with the fix for r2 B3.
- **Share:** 3 of 3 round-2 blockers and 2 of 2 round-3 blockers (5 of 5) trace to the switch to gate first. The code side has been sound since round 2 (r2 3).
- **Root cause:**
  - The route, a scope decision, was put to the owner before the plan was sized, first unfairly.
  - The Definer was then handed the whole gate procedure: asks, record names, proxy rules and the Reviewer's evidence. It apparently got none of the rules behind it, since each fix broke one of them. I could not see the brief.
  - Originating stage: 3, Define, which owns scope (OPERATING_MODEL.md:140).
- **Self-implication (D-050):** r2's suggested fix, "desk-deploy run logs" (r2 37), led to r3 B1. r3 N3 is a regression in r2's own screen-word check (r3 121).

**2. Round 3's blockers**
- Both are local and small (r3 3):
  - B1: one preview run started by hand, about 3 owner minutes, and a CI record that exists (r3 38-41).
  - B2: sentence fixes at 4301-4302, 18833-18835 and 21471, plus a rule against asks-merge (r3 47-51).
- The rest of draft 3 is sound: "Nothing else is broken" (r3 115-119), and every round-2 item is fixed (r3 96-113).
- Non-blocking items that still matter: N4 (L3 merges before it checks), N10 (a "null" branch would make a preview deployment), N2 (question 3 is marked reversible and has a default).

**3. Recommendation: one focused confirmation review**
- **Why not the others:**
  - Re-specify: the code side is sound.
  - Re-scope: the owner confirmed gate first twice (launch-gate-2.md:1, -3.md:1).
  - Drop: nothing calls for it.
- **What it covers:** only the diff from c36977e to draft 4.
  - r3 B1: the preview run at R, an existing CI record, W1-W4 gathered before S3.
  - r3 B2: no closing word by proxy, both D-066 sentences, no asks-merge, question 3's WHY.
  - N2, N3, N4, N9 and N10.
  - No new findings outside the diff unless the diff causes them.
- **How the Chief of Staff should brief:**
  1. Size the plan before putting a route or scope question to the owner, and give its cost from the sized draft.
  2. Have the Critic check every owner question before it is filed (D-032, D-055). r1 B3 and r2 B1 were both unfair questions.
  3. When a ruling changes the plan's shape, write a fresh brief that names the governing sources: decisions/README.md:5-7 and 53-69, ROUTING.toml, OPERATING_MODEL.md:100, the Reviewer's pack and tools (PACKS.toml), and the workflows' triggers.
  4. Keep the gate procedure in the Chief of Staff's own case, with the spec citing it rather than restating the rules (compare r1 N9).
