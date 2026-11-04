# Critic, round 3, verbatim — questions/P-001-home-screen-widget.md (2026-11-04)

Verdict: FAIL

Round 3 fixes every round-2 finding, and I checked each Context bullet against its source myself: all nine are true. One new blocking problem remains, and rounds 1 and 2 both missed it. The card leaves out a workable option, and that gap makes the WHY and the recommendation untrue.

**Self-implication flag (D-050):** blocking finding 1 implicates my own round-1 and round-2 readings. Both passed line 8 and the recommendation's "only option" claim without raising the missing option. Please route accordingly.

## Round-2 findings
- **1 (second sender):** resolved. Lines 29 and 33, BLAST RADIUS line 48 and bullet 5 (line 60) now say the operating-model project has no sender yet. The sources say so: specs/S-001.md:2126-2128, docs/handover/service-desk.md:35-37 and desk-notify.yml:97. J16:16479-16486 is correctly framed as "the spec designs".
- **2 (stale figure):** resolved. Line 25 and bullet 4 (line 59) say the heaviest poll call makes 30. specs/S-001.md:14621 says "11 + 3 + 16 = 30".
- **3 (CHECKED):** present at line 50, in the precedent's form.
- **4 (C's gates):** resolved. Line 40 now proposes it, names the writer and the Reviewer, and asks the owner.
- **5 (A's steps and class):** resolved. Line 18 has "allow it in the desk's Access settings", and line 48 has the conditional R3. A residual precision point is non-blocking finding 3.
- **6 (phone length):** the blank line is fixed. The length remains (non-blocking finding 5).

## BLOCKING

1. **Line 8: "So the desk's summary can reach a widget only if the desk changes (options A and B)". Also RECOMMENDATION line 47 ("the only option that can give the desk's whole summary") and option C line 40 ("shows counts only").**
   - **What is wrong:** the options leave out a combination the records make plain. The widget could read GitHub itself with a read-only GitHub token, as C does, and work out the summary with a copy of the desk's code, as A's second way does.
     - The page's read model is pure. Given the tree, the records, the PR and workflow-run pages and the clock, it "says … what each view shows. No network, no DOM" (src/lib/model.js:1-3, the card's own bullet 3).
     - The sender already builds its set that way, straight from GitHub reads (collect.mjs:1-4).
     - Done this way, the desk is not changed, Access is not touched, there is no 30-request limit (that limit is the server's), and no R3 sender change is needed.
   - **What it costs:** it has the same copy-drift cost as A's second way (line 26) and the same GitHub key cost as C (line 45).
   - **Why it matters:** it is plausibly the cheapest route to what the owner chose ("Option 2"). Without it:
     - Line 8 is false.
     - C is unfairly narrowed to counts.
     - The recommendation's "only option" claim does not hold.
   - **What would fix it:** add it as an option, or fold it into C as a variant, costed evenly. Or say in the WHY, with a source, why it cannot work.
   - **Stage:** question drafting (completeness of options). Critic rounds 1 and 2 also missed it.

## NON-BLOCKING

2. **Option A, Cost line 25 ("the desk's busiest call already uses all 30. A new summary call may not fit").**
   - **What is wrong:** the reasoning is off. A new call gets its own 30-request limit, because the limit is per call ("per invocation", specs/S-001.md:14612-14613). The real problem is what the new call must do.
     - It would have to make the poll call's reads, which reach 30 at the heaviest (line 14621).
     - It would also have to read the records' contents, which the separate blob call does in up to 25 requests (lines 14611-14612).
   - **Effect:** as one call, the server way looks unlikely to fit, not merely "may not". That leans A on its second way, whose "matches the desk exactly" gain does not hold (line 21).
   - **What would fix it:** state the reason that way, and recheck whether medium confidence is still honest.
   - **Stage:** option costing.

3. **BLAST RADIUS, line 48: "class R3 … if Discovery finds the shared code the sender also runs must change".**
   - **What is wrong:** not all code the sender shares is R3.
     - The sender also runs src/lib/model.js (collect.mjs imports it at line 6), and that file is R1.
     - Only jobcand.js, ledgergrant.js and j22.js are R3 (risk-paths.toml:22-24).
     - A change to a page module also changes its served copy under src/public/lib/, which needs the design reviewer (risk-paths.toml:43-49).
   - **What would fix it:** "R3 if the sender's R3 shared modules change; the design reviewer too if a page module changes".
   - **Stage:** question drafting.

4. **The key lines are uneven.** B's line 37 says "every record in those repositories", but no repositories are named nearby. C's line 45 says "every record in your repositories". Use the same words in both, and name the repositories. **Stage:** question drafting.

5. **Phone reading (D-019 asks for background of no more than 5 lines).** The WHY still runs from line 6 to line 14. Its terms are explained, so this is acceptable, as at round 2.

6. **Correct as written:**
   - RISK CLASS R0 (questions/** is R0, risk-paths.toml:28) and REVERSIBILITY reversible.
   - DEFAULT and TIMEOUT none, with the graduation reason (OPERATING_MODEL §3).
   - The Milestone line, in the template's "none (why)" form.
   - The owner's "Option 2" is kept out of Context, quoted word for word, and the missing question file is admitted.
   - "What if the owner doesn't decide" is covered at line 10.
   - Context bullets 1 to 9 each match their cited lines:
     - access.js:1-4
     - S-001 J8:15510-15512
     - api.js:1-4 and model.js:1-3
     - S-001 J1:14612-14613 and 14618-14621
     - J16:16479-16486, desk-notify.yml:97, S-001:2126-2128 and handover:35-37
     - desk-notify.yml:31 and collect.mjs:1-4
     - state.mjs:1-5 and desk-notify.yml:99-106
     - risk-paths.toml:20-24, 27 and 48-49
     - OPERATING_MODEL §3
   - Keeping the Cloudflare service-token facts out of Context is correct.
