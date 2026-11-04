# Critic, round 1, verbatim — questions/P-001-home-screen-widget.md (2026-11-04)

Verdict: FAIL

The question's form matches the template and the S-033 paragraph: it has the Milestone line, WHY, options, recommendation, the computed fields, the owner's earlier answer kept apart from Context, and a Context section. Its plain-English opening is good. But it contradicts itself on gates, understates the costs of option B and part of A, and three Context bullets do not say what their cited records say. The stage that failed is the Chief of Staff's drafting of the question, and for findings 5 to 7 its sourcing of Context.

BLOCKING

1. WHY line 10 against option C, line 22. Line 10 says "Whichever you choose, the widget is new behaviour, so it starts as its own small piece of work … and your three gates". Option C's Gain says "no desk change, no gates". Both cannot be true. The owner cannot tell whether C costs gates. Line 8, "each way changes something you have kept closed so far", also fits C poorly: C changes nothing in the desk, and what it opens is a GitHub token on the phone. Stage: question drafting.

2. Option B, lines 16-19, and BLAST RADIUS, line 25, understate B. The card speaks of "the notification sender" as one thing. The spec says each project has its own sender, "run by each project's own workflow for that project alone: Workflow 3 for Service-Desk, Workflow 4 for Personal-Org-Operating-Model … never reads another project" (specs/S-001.md J16, lines 16479-16486). The workflow runs `--project Service-Desk` only (.github/workflows/desk-notify.yml:97). So B means changing two senders in two repositories, each an owner-approval change in its own repository, and the widget would then read two summaries. Neither the Cost nor the BLAST RADIUS says so. Stage: question drafting (costing).

3. The options are costed unevenly on secrets. A's Cost says "a secret lives on your phone". B (line 17) and C (line 21) also put a read-only GitHub token on the phone, which can read the repositories' records directly, but neither Cost says so. That makes A look worse than it is, compared with B and C. Stage: question drafting (costing).

4. Option A, lines 13-14, overclaims for the widget-side variant. "works out the summary with the desk's own code" means a copy of the desk's code running in Scriptable, outside the repository. That copy falls out of step whenever the desk changes, which is the same drift that C's Cost admits. So "Gain: the summary matches the desk exactly" holds only for the server-side variant. Either state the copy's upkeep and drift as a cost of the widget-side variant, or limit the Gain to the server-side one. The recommendation (line 24) leans on this Gain. Stage: question drafting.

5. Context bullet 7, line 38, does not support what it is used for. It says "the page's code is R1". The BLAST RADIUS, though, relies on the class of the sign-in check and the server call (src/lib/access.js, src/functions/api/). Those are R1 under the catch-all `src/**` (risk-paths.toml:27), not as "the page's code". Page code served from src/public/** also needs the design reviewer (lines 48-49). The bullet cites the file with no lines (R3 is at :20, R1 at :27). Restate it as the sign-in check's and server's class, with those lines. Stage: Context sourcing.

6. Context bullet 6, line 37, uses the wrong word and leaves out a fact. The sender's memory is not "one workflow file". It is one workflow artifact (`desk-notify-state`, uploaded at desk-notify.yml:99-106) holding a signed state file. In it, item keys are keyed hashes and the JWT and usage parts are encrypted (src/notify/state.mjs:1-5). "Workflow file" in this repository means the .yml. "Kept for seven days" (line 106) is correct. Stage: Context sourcing.

7. Context bullet 2, line 33, cites the wrong section. It says "specs/S-001.md, J8, line 20141". Line 20141 sits in the experiments section (EXP-001, from line 20139), not in J8. J8 (from line 15497) says the same thing at lines 15510-15512 ("An Access service token carries no `email`, so it could never pass J8"). The fact is true, but the cross-reference sends the reader to the wrong place. Stage: Context sourcing.

8. Part 7 of the decision card, who has checked it, is missing (OPERATING_MODEL "Decision cards (D-019)"). The precedent was failed for this at round 1, finding 4, and passed at round 3 with a CHECKED line. Add the line once this check is recorded. Stage: question drafting.

NON-BLOCKING

9. RECOMMENDATION, line 24: "the only option that gives the desk's own wording" is too strong. B gives the desk's own wording for what waits on you (collect.mjs:1-4), though not each project's state and headline. "The only option that gives the desk's whole summary" would be accurate. Medium confidence is honest, and the condition that would change it is stated.

10. DEFAULT, line 26: of the two reasons given for "none", the second ("a change to the desk's sign-in [is] the owner's ruling") has no backing in risk-paths.toml. The sign-in check is R1, ceiling A2 (AGENTS.md §3). The first reason (new work on a graduated product, and the owner approving every production deploy, OPERATING_MODEL §3) is enough on its own, as it was for the precedent. Drop or correct the second reason.

11. Context bullet 3, line 34, cites api.js and model.js with no lines. model.js:1-3 ("says what each view shows. No network, no DOM") supports the page-side half; give lines for both files.

12. Context bullet 4, line 35, is true (J1, lines 14612-14613). The fact that matters for option A's server-side variant is in the same passage: the poll call already uses up to 29 of the 30 requests, "with 1 to spare" (line 14614). Adding it would make the "medium" confidence visible.

13. Completeness: C (mockup 1, which the owner did not choose) is offered as a fallback, but mockup 3, the one-tap launcher, is not mentioned. Either say why it is left out, or don't revive C beyond a fallback. Offering C is fair as long as its cost against the owner's "Option 2" is plain, and it is ("Rules out: the desk's wording").

14. Reading on a phone: the WHY is plain. Option lines 13, 15 and 19 are long single sentences, and B's Cost packs four separate costs into one line; splitting them would help. "Read-only GitHub token" is not explained in plain words. R0/R1/R3 in BLAST RADIUS is acceptable as a cross-reference, as in the precedent.

15. Correct as written: RISK CLASS R0 (questions/** is R0, risk-paths.toml:28); REVERSIBILITY reversible; the Milestone line "none (…)" in the precedent's form; the owner's answer "Option 2" kept apart from Context and quoted word for word; bullet 1 (access.js:1-4 says "no test-only exception, no service tokens"); bullet 5 (cron every 5 minutes at desk-notify.yml:31; the desk's own readers at collect.mjs:1-4); bullet 8 (OPERATING_MODEL §3 "Graduation and re-entry" says a graduated product comes back as new work "starts a new Discovery, scaled to its size … the owner still approves every production deploy"). The facts about Cloudflare service tokens come from Cloudflare's documentation, not a record, and are rightly kept out of Context.
