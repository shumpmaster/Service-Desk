Verdict (P-002-route): PASS
Verdict (P-002-follow-ups): PASS

I found no blocking findings in round 2. I could not run `git show 287dfae` because I have no shell tool, so finding 1 below is unverified.

**Round-1 blockers, now resolved**
- Route: the claim that the early steps do not touch the plan is now supported.
  - intake/requests/README.md says a research request needs no milestone before approval (lines 7 to 11).
  - OPERATING_MODEL.md line 194 (§4 "Groundwork research", S-020) makes the groundwork map a research file and puts the owner's shortlist at about ten minutes.
  - Owner answers go under decisions/questions/ (AGENTS.md §5).
- Route: the 2-to-4-day and 15-to-30-minute figures are gone. Costs are now stated as "size not yet known" and "no date".
- Route: "If you do not rule, nothing starts" is now in the WHY, and the card says plainly that choosing A or B approves the new-Discovery route.
- Route: B, C and A each carry a "Rules out" line, and the recommendation now says what would change it (then B).
- Both cards: the Milestone line is now a "none (…)" line with its reason.
- Follow-ups: the "a few weeks apart" claim was replaced by "a gap of unknown length (that gate has no date)".
- Follow-ups: option C now states the cost of splitting the portfolio-pull-requests and library-patterns item, and that the briefing work may decide not to show them.
- Follow-ups: the card says to answer the route question first, and the unused "6 repos" Context bullet is gone.

**Non-blocking findings**
1. Follow-ups, Context bullet 2: the list of the six gaps could not be checked against Model-Lab commit 287dfae.
   - The ruling file on the default branch says "six gaps and the deploy-approval question", which could read as seven before the milestone view is added.
   - The card counts the deploy-approval rule among the six.
   - The Model-Lab handoffs name the pieces: deploysNeedOwner on one project only, the "default branch not found" wording, LL-21 (a project with no milestones reads as finished), and LL-25 (session-move notice).
   - Please confirm the commit lists exactly six including the deploy-approval rule.
   - If the count is off, change the bullet to "the seven are … (source: 287dfae, questions/P-001-desk-follow-ups.md, its numbered list)".
2. Follow-ups WHY: "If you do not rule, the briefing work covers only the briefing page (A below)" sits oddly with the route card, because without a route ruling nothing starts at all.
   - Suggested wording: "If you do not rule, nothing changes: the follow-ups stay as ruled, and the briefing Discovery, if you start it, covers only the briefing page (A below)."
3. Route, option A: "kept as research requests … which do not touch the plan" covers only the research items.
   - The new Discovery itself would be a project request, and the README says a project request never holds a milestone.
   - Suggested added sentence: "The project request that opens the Discovery is filed only after you rule where the plan lives, or says it holds no plan yet (confirm which)."
   - Please confirm the project request can be filed without touching docs/PROJECT.md.
4. Both cards are still dense on a phone. The "What happens / Cost" split helps. "The brief" and "the plan" are used as two names for one thing in the route WHY and Context ("the plan (the brief)", then "brief" in a Context bullet), so pick one.
5. Route Context bullet 5 says "one project document per repository … holds the desk's own graduated brief". Use "plan" to match the WHY, or gloss it once.

I edited no files. The cards are /home/user/Service-Desk/questions/P-002-route.md and /home/user/Service-Desk/questions/P-002-follow-ups.md.
