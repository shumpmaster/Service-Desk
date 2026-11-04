# Critic, round 2, verbatim — questions/P-001-home-screen-widget.md (2026-11-04)

Verdict: FAIL

The revision fixes almost all of round 1. One new blocking error remains, and my own round-1 reading helped cause it. Option B and Context bullet 5 say a second notification sender exists in the operating-model repository. It does not. There is also a smaller stale figure on GitHub request limits.

**Self-implication flag (D-050):** blocking findings 1 and 2 both trace back to round 1's reading (its finding 2 and its finding 12). Round 1 asserted "two senders in two repositories" from the spec's design text alone. It also asked for the "1 to spare" figure without reading the next paragraph of the spec. Please route accordingly.

## Round 1 findings
- **1 (gates):** resolved. Line 10 now says "If you choose A or B", C says "needs no Discovery and no gates", and the "each way changes" sentence is gone.
- **2 (two senders):** addressed, but on a false premise. See blocking finding 1.
- **3 (keys costed evenly):** resolved. Each option now says what its phone key can read (lines 23, 35, 43).
- **4 (copy drift in A):** resolved. The "matches exactly" gain is limited to the server variant (line 20), and drift is a cost (line 25).
- **5, 6, 7 (Context sourcing):** resolved. Bullet 8 cites risk-paths.toml lines 20 and 27. Bullet 7 says "workflow artifact" and matches state.mjs:1-5 and desk-notify.yml:99-106. Bullet 2 now cites J8, lines 15510-15512, and those lines say it.
- **9 ("whole summary"), 10 (DEFAULT reason), 11 (lines for api.js and model.js), 13 (launcher left out, line 14), 14 (costs split, "read-only GitHub token" explained at line 28):** resolved.
- **12 ("1 to spare"):** done, but the figure is stale. See blocking finding 2.
- **8 (CHECKED line):** I partly disagree with how you describe the precedent. In the precedent the line was already there at round 2 (that round's note says it was "premature" on a FAIL). At round 3, the version that passed, it was still there: "The CHECKED line points at critic.md, which will hold this verdict once it is recorded". So the precedent did not wait for a recorded PASS before adding it. Still, I agree its absence now is not blocking. The condition is in non-blocking finding 3.

## BLOCKING

1. **Option B, line 28; Cost, line 31; BLAST RADIUS, line 46; Context bullet 5, line 57.**
   - **What is wrong:** line 28 says "Today there are two, one for this desk's repository and one for the operating-model repository". That is false.
     - The cited J16 (specs/S-001.md:16479-16486) describes Workflow 4 as designed, not as existing.
     - specs/S-001.md:2126-2128 says the operating-model repository's workflows folder "holds only ci.yml, launch-trial.yml, pr-body.yml and scrub-proof.yml, so there is no Workflow 4" (2026-10-23).
     - docs/handover/service-desk.md:35-37 says: "The operating-model project has no sender yet (found 2026-10-30: Setup N9 and CS16 were never done)". docs/handover/desk-operations.md:447-449 agrees.
     - The local clone at /home/user/Personal-Org-Operating-Model/.github/workflows/ holds only those four files, and its risk-paths.toml has no notify path.
   - **Why it matters:** B's real cost is building and setting up a whole new sender for the operating-model project (its own steps, secrets, environment and pin), plus changing Service-Desk's sender. Without that, the widget would show only this desk's waiting items. Line 31 ("Two senders in two repositories change … each … highest risk class") and the BLAST RADIUS's "changes two notification senders (class R3…)" describe a change to something that does not exist.
   - Bullet 5's "one for Personal-Org-Operating-Model" also needs to say it exists only in the spec, not today, and cite the records above.
   - **Stage:** Context sourcing and option costing (question drafting). Root cause: Critic round 1, finding 2.

2. **Option A, Cost, line 24 ("the desk's busiest call already uses up to 29"), and Context bullet 4, line 56 ("the poll call fits with 1 to spare", J1, lines 14612-14614).**
   - **What is wrong:** the same J1 passage goes on (specs/S-001.md:14618-14623). From AC80/J22 the poll call may carry 3 owner-check reads, and "the heaviest, every core list at 3 pages, 11 + 3 + 16 = 30, so J1's limit holds". Line 14624 adds "J8's key fetch adds at most 1". So the busiest call now uses the whole limit, not 29 with 1 to spare.
   - The cited lines say what the bullet quotes, but the record overrides them a few lines later, so the bullet is not true as it stands.
   - **Effect on the card:** the truth makes A's "may not fit" stronger, so the medium confidence holds. But the owner is given a wrong number.
   - **Stage:** Context sourcing. Root cause: Critic round 1, finding 12.

## NON-BLOCKING

3. **Missing CHECKED line (D-019 part 7, "who has checked it").** Not needed before a PASS, but the card must not reach the owner without it. Add it, pointing at reviews/P-001-home-screen-widget/critic.md, in the same change that records the passing verdict, as the precedent did by round 3.

4. **Option C, line 38: "It is a script on your phone, not part of the desk, so it needs no Discovery and no gates."** This is a claim about process, and neither Context nor the WHY supports it. The graduation rule in bullet 9 covers the product, and a phone-only script is plausibly outside it. Still, someone on the team would write it, and who reviews it is not said. Either cite the rule that puts it outside the gates, or say who writes and checks it.

5. **Option A, lines 17 and 46: understated steps and possible class.**
   - Under A the owner probably has more to do in Cloudflare than "create a service token". The Access application would also need a rule letting that token through. This comes from Cloudflare's documentation, so it rightly stays out of Context, but A's "What happens" could say "and allow it in the desk's Access settings".
   - BLAST RADIUS gives A as R1. That holds only if the summary call changes nothing under src/public/** (design reviewer) and none of the R3 shared modules (src/lib/jobcand.js, ledgergrant.js, j22.js; risk-paths.toml:22-24) that the waiting set is built from. "R1, or R3 if Discovery finds the sender's shared modules must change" would be safer.

6. **Phone reading (D-019 says background should be ≤ 5 lines, no jargon).** The WHY runs to five paragraphs (lines 6-14). That is about the precedent's length, and each term is explained. "Cloudflare Access" is never explained, which is acceptable since the owner set it up. Also, OPTIONS on line 15 has no blank line after line 14; this is cosmetic.

7. **Correct as written:**
   - RISK CLASS R0 (questions/** is R0, risk-paths.toml:28); REVERSIBILITY reversible.
   - DEFAULT/TIMEOUT none, with the single graduation reason, as in the precedent.
   - Milestone line "none (…)" in the precedent's form.
   - The owner's "Option 2" is kept apart from Context, quoted word for word, and its missing question file is admitted.
   - The recommendation is honest: "the only option that can give the desk's whole summary", medium confidence, and what would change it is named.
   - Context bullets 1, 3, 6, 7, 8 and 9 checked against their sources: access.js:1-4; api.js:1-4; model.js:1-3; desk-notify.yml:31, 97, 99-106; collect.mjs:1-4; state.mjs:1-5; risk-paths.toml:20, 27; OPERATING_MODEL §3.
   - Keeping the Cloudflare service-token facts out of Context is correct.
