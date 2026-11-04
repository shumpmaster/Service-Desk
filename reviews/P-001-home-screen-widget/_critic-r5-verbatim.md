# Critic, round 5, verbatim — questions/P-001-home-screen-widget.md (2026-11-04)

Verdict: FAIL

Round 4's three blocking findings are resolved. I checked each against the records myself:
- **Projects:** the card now names three projects plus the portfolio repository. projects.json lines 8, 12, 15 and 18 confirm this.
- **Request count:** the count is now 30 + 16 × 25, which gives "hundreds". S-001 lines 14609-14613, 14618-14621 and 4954-4955 support it, as does scheduler.js line 22. Confidence is now honestly "low to medium".
- **Options:** there are three options. The service-token route is in the WHY as left out, with its reason.

Round 4's non-blocking points 5 ("partly coded") and 6 (the sender's checkout) are fixed, and point 7 is half fixed (see finding 2). Point 4 (WHY length) still stands (see finding 7).

Reading the card fresh, I found three new blocking problems. Each is small to fix.

**Self-implication flag (D-050):** blocking findings 1 and 2 come from round 4's own reasoning.
- Round 4 finding 1 used desk-notify.yml:97 as evidence that Model-Lab has no sender.
- Round 4 finding 7 said a package.json change "would make the change R3 (line 18)".

The card took both from round 4. Please route accordingly.

**Stop rule (D-044):** this is round 5. The model allows three rounds before Triage traces the root cause and the owner gets one summary. Escalation is for the Orchestrator to decide.

## BLOCKING

1. **Context bullet, line 52: "today only Service-Desk's exists".**
   - **What is wrong:** none of the cited lines says Model-Lab has no sender.
     - desk-notify.yml:97 shows only that Service-Desk's own workflow runs `--project Service-Desk`. Under J16 (S-001:16479-16486), each project's sender lives in that project's own repository, so this line proves nothing about Model-Lab.
     - S-001:2126-2128 and handover:35-37 are about the operating-model project only.
   - **Is the fact true?** Probably. The local clone /home/user/Model-Lab/.github/workflows/ holds only asks-merge, orchestrator, governance, pr-body and scrub-proof. But that is not cited, and I can't confirm the clone is current.
   - **Fix:** cite a record that says it, or word the bullet to what the cited lines support.
   - Option B's cost "Until senders are set up for the other two projects" rests on this bullet.
   - **Stage:** question drafting (Context fact check). Round 4's Critic introduced the reasoning.

2. **Context bullet, line 55 ("…as is the package file … line 18"), and BLAST RADIUS, line 37 ("R3, with your approval, if it changes the package file").**
   - **What is wrong:** the class is computed wrongly.
     - The desk has no root package.json. Its package file is src/package.json (files found: src/package.json, tests/desk/package.json, .github/deploy-tools/package.json).
     - The risk-paths.toml line 18 rule `"package.json"` is anchored: govlib.glob_to_regex builds `^…$`, and path_class uses glob_match on the full path. So it matches only a root package.json.
     - src/package.json therefore computes as R1, through `src/**` (line 27).
   - **What does hold:** your approval is still required. review_check.py flags any changed dependency manifest by file name at any depth (govlib.is_manifest, lines 997-1001; review_check.py lines 19-22 and 283-284), and that flag adds `owner` to the required reviews.
   - **Fix:** say "class R1, but changing the package file needs your approval".
   - **Stage:** question drafting (Context fact check, and the computed field). Round 4's Critic introduced it.

3. **WHY, line 6: "Every option puts a read-only GitHub key on your phone … able to read the desk's three projects … and the portfolio repository."**
   - **What is wrong:** no record supports this for option B, or for C's portfolio access.
     - Under B the widget reads a summary the sender saves. The card itself says where that summary would live "is unsolved" (line 27). So B's key might need to read one place only.
     - The card states as fact that B needs the same broad key as A, which hides a possible security gain of B.
     - It is also unstated whether C's counts need the portfolio repository.
   - **Fix:** say the key's reach under B depends on where the summary is saved, or drop the "every option" claim.
   - **Stage:** option costing (fairness, even costing).

## NON-BLOCKING

4. **Option A's cost, line 16, and line 12: "Later refreshes read only what changed."**
   - The poll call that finds what changed still runs on every refresh. That is up to 30 requests per project, or 23 in a steady poll (S-001:14620-14621), for each of three projects plus the portfolio.
   - The figures are also given "per project" without saying there are three, so a non-expert won't multiply.
   - Suggest something like "every refresh still makes a few dozen requests per project, for three projects".
   - **Stage:** option costing.

5. **The service-token route, WHY line 8, "gains nothing here".**
   - It would gain one thing: the phone would hold a Cloudflare key to the desk's read-only server instead of a GitHub key.
   - "Gains little here" or "gains only …" would be fairer.
   - **Stage:** question drafting.

6. **Context bullet, line 56: "comes back only as new work, starting with a Discovery scaled to its size".**
   - OPERATING_MODEL §3 "Graduation and re-entry" lets a defect go straight to Build or a short Design. Only add-on or revision work starts a Discovery.
   - It is true for this case (an addition), but "an addition to a graduated product starts with a Discovery…" would be exact.
   - **Stage:** question drafting.

7. **WHY length.**
   - Line 6 alone is about nine sentences, against D-019's "background (≤ 5 lines)". On a phone it runs to many screen lines.
   - It is shorter than round 4's and plain, but still over.
   - **Stage:** question drafting.

8. **BLAST RADIUS, line 37, "if it touches only the desk's source and tools", and Option A's gain, line 13, "nothing the live desk runs changes".**
   - `src/` includes R3 paths: src/notify/**, src/config/projects.json and the three judgment modules (risk-paths.toml lines 20-24).
   - The line also allows the packed file to go into the page's served files, which the live desk serves.
   - Suggest "touches only ordinary source and tools, not the sender's files" and "nothing the live desk's sign-in, server or sender runs changes".
   - **Stage:** question drafting.

9. **"Your answer already given", line 42.**
   - The owner's "Option 2" and the mockup wording ("the desk's own summary", "needs a desk change") appear in no record other than this card. No handoff or session file in the repository holds this session id.
   - In the precedent, round 3 checked the quoted answers against a handoff record.
   - Recording the session's exchange somewhere checkable before the card goes out would let it be verified.
   - **Stage:** question drafting (record-keeping).

10. **WHY, line 6: "it can read your repositories but not change them".**
    - This reads as all of the owner's repositories. The next clause narrows it.
    - "It can read only these repositories, and change none" would be clearer.
    - **Stage:** question drafting.

## Correct as written (checked myself)
- Context bullets access.js:1-4; S-001 J8:15510-15512; api.js:1-4 and model.js:1-3; collect.mjs:1-6; S-001:14609-14613 and 14618-14621; S-001:4954-4955, 14606-14607 and scheduler.js:22; projects.json:8, 12, 15 and 18; J16:16479-16486; desk-notify.yml:31; state.mjs:1-5 and desk-notify.yml:99-106; risk-paths.toml:20-24, 27 and 48-49 are true and say what is claimed.
- B's sender is R3 with your approval; B covers only what waits on you.
- RISK CLASS R0; REVERSIBILITY reversible; DEFAULT and TIMEOUT none with the graduation reason; Milestone line in form; "Until you rule, nothing is built" covers the no-decision case; the recommendation gives its confidence, what would change it and the fallback; CHECKED in the precedent's form; vendor facts kept out of Context.
