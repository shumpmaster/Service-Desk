# Critic, round 4, verbatim — questions/P-001-home-screen-widget.md (2026-11-04)

Verdict: FAIL

The round-3 blocking finding is fixed: the missing route is now option A, it is costed, and the WHY no longer says the desk must change. Round 3's non-blocking findings 2, 3 and 4 have also been acted on. Reading the card fresh against the records, I found three new blocking problems. One is a false Context bullet whose own cited source contradicts it. One is a wrong request count on the recommended option. One breaks the D-019 form.

**Self-implication flag (D-050):** blocking findings 1 and 2 implicate my round-3 reading. Round-3 finding 4 asked the card to "name the repositories" without checking how many there are. Round-3 finding 2 itself said the record contents take "up to 25 requests" in "the separate blob call", which is the figure the card now uses. Please route accordingly.

## BLOCKING

1. **Line 12, "The desk's two projects today are this desk (Service-Desk) and the operating model (Personal-Org-Operating-Model)"; Context bullet at line 66, "The desk connects two projects … (source: src/config/projects.json, "projects")".**
   - **What is wrong:** the cited file lists three projects, not two: Service-Desk, Personal-Org-Operating-Model and Model-Lab (projects.json lines 7-17). It also names a portfolio repository (line 18). Model-Lab was connected in PR #263 (reviews/263/design-reviewer.md:3, branch `build/builder/add-model-lab`, 2026-11-01).
   - **What follows from it, all wrong:**
     - Every key-scope line ("both projects' repositories": lines 22, 42, 50) understates what the key must read.
     - A's request count per refresh is too low by at least a third project.
     - C's "until a second sender is set up" (line 38) should say two more senders. The records show no Model-Lab sender either: desk-notify.yml:97 runs Service-Desk only.
     - The A-to-D comparison of key exposure rests on the wrong scope.
   - **Stage:** question drafting (fact check of Context). Critic round 3 also missed it.

2. **Option A, Cost line 23, "the desk's own two calls make up to about 55 per project"; Option B, Cost line 30, "reading the records' contents takes up to 25 more".**
   - **What is wrong:** 25 is the limit for one blob call, not for reading all the records' contents.
     - The desk makes up to `MAX_BLOB_CALLS_PER_CYCLE = 6` blob calls per cycle for the needed reads (src/lib/scheduler.js:22 and 1247-1271), each with a budget of 25 (S-001 J6, lines 15310-15311). A cycle that has not finished carries on into the next one ("Checking…", scheduler.js:1252-1253, 1271).
     - The spec bounds a project at up to 16 blob calls in one cycle (S-001:4954-4955, "A3: 6 + 2 × 5").
     - The page also keeps records cached by sha between reads (S-001:14606-14607). A widget starting cold has no such cache unless one is built.
   - **The true worst case:** hundreds of GitHub requests per project per refresh, not "about 55". A's feasibility under widget time and memory limits is exactly what the card's medium confidence depends on, so the error understates the recommended option's main cost and makes the recommendation look surer than the records allow. B's conclusion that a single server call cannot fit still holds, and more strongly.
   - **What would fix it:** state the count the records support (one poll call plus several blob calls a cycle, cold reads larger), and recheck whether medium confidence is still honest. Context bullet 5 (line 65) is true as worded, but it is the only support given for the 55 figure, and it does not support it.
   - **Stage:** option costing. Critic round 3 introduced the "up to 25" framing.

3. **OPTIONS, lines 16-51: four options, A to D.**
   - **What is wrong:** the operating model's "Decision cards (D-019)" asks for "2–3 options with gain, cost and reversibility".
     - The precedent had two.
     - B's server way is shown on the card itself not to fit (line 30). B's remaining way is A's copy plus a sign-in change, so B is close to a variant of A.
   - **What would fix it:** bring the card to three options, for example by folding B into a cost or rules-out note under A or into the WHY. Or record why the owner needs four.
   - **Stage:** question drafting (card form).

## NON-BLOCKING

4. **The WHY runs over five paragraphs, lines 6-14.** D-019 asks for background of no more than 5 lines. It is plain and every term is explained, but it is long on a phone. It was accepted at rounds 2 and 3, and fixing finding 3 should shorten it. **Stage:** question drafting.

5. **Option C, line 41, "a zipped, scrambled file".** state.mjs:1-5 says the file is signed, its item keys are keyed hashes, and only its JWT and usage parts are encrypted. "Scrambled" overstates this; "partly coded" would be accurate. That the file is zipped is vendor behaviour, not a record. **Stage:** question drafting.

6. **Context bullet 4, line 64, "from its own GitHub reads".** collect.mjs:2-3 says the sender builds its set from "the workflow's checkout of the default branch" plus REST reads. A widget has no checkout and must fetch every record over the API, which is part of why finding 2 matters. The bullet is true enough, but it hides that difference. **Stage:** question drafting.

7. **BLAST RADIUS, line 53, Option A "class R1".** This holds only if A's build step stays under `src/` (risk-paths.toml:27):
   - Adding a script entry to `package.json` would make the change R3 (line 18).
   - Writing the packed file under `src/public/` would add the design reviewer (lines 48-49).

   Adding "if it touches only src/tools" would make the class exact. **Stage:** question drafting.

## Correct as written (checked myself)
- **Risk and defaults:**
  - RISK CLASS R0: `questions/**` is R0 (risk-paths.toml:28).
  - REVERSIBILITY: reversible.
  - DEFAULT and TIMEOUT none, with the graduation reason. OPERATING_MODEL §3 has re-entry only as new work, and the precedent accepted the same reasoning.
- **Form against the precedent:**
  - The Milestone line is in the template's "none (why)" form.
  - The CHECKED line is in the precedent's form.
  - The owner's "Option 2" is quoted outside Context, and the missing question file is admitted (S-033).
  - The recommendation gives confidence and what would change it.
  - "What if the owner doesn't decide" is covered at line 10.
- **Context bullets checked against their cited lines and true:**
  - access.js:1-4
  - S-001 J8:15510-15512
  - api.js:1-4 and model.js:1-3
  - S-001:14609-14613 and 14618-14621 ("a poll call 30 at its heaviest, a blob call up to 25", true per call)
  - J16:16479-16486, desk-notify.yml:97, S-001:2126-2128 and handover:35-37
  - desk-notify.yml:31
  - state.mjs:1-5 and desk-notify.yml:99-106
  - risk-paths.toml:20-24, 27 and 48-49
  - OPERATING_MODEL §3 "Graduation and re-entry"
- Keeping the Cloudflare service-token and iPhone widget-limit facts out of Context, as vendor facts, is correct.
