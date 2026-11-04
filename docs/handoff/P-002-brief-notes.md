# The pull-request briefing page (Service-Desk P-002): notes for its brief, draft 0

*Written 2026-11-04 by the Chief of Staff (session_01QBwHGMwrG5sPqzJg8VyemJ). The briefing work's brief goes in a plan of its own in Service-Desk (docs/projects/P-002.md), which can exist only once the model's tools change, S-035, is frozen, built and adopted by the desk (the owner's ruling: "B: own plan, tools first (Recommended)", Service-Desk decisions/questions/P-002-plan-place.md). Until then its material is gathered here, beside the handoffs, by the brief section it feeds, and is carried over word for word when the plan is filed. Nothing here is ruled: each line is a finding with its record, or a draft for the owner to approve at the Design gate.*

*Records read: research/P-002-shell-helper-findings.md (a read-only helper's audit; not source-checked, so nothing from it enters the library), research/Q-020-memo.md and research/Q-021-memo.md (both passed their source checks: research/Q-020-source-check.md, research/Q-021-source-check.md). Grades are the memos' own; "close", "mid" and "far" are their closeness to one owner overseeing several projects built mostly by AI agents.*

## For section 1, Scope: what the page has to work with
- **Descriptions are mostly right, but go stale.** Of 30 merged desk pull requests, 24 descriptions match what changed; 3 leave out real parts, 1 says something the change did not do, 2 cannot be checked from the change (helper, Part 1). 26 of the 30 got more commits after they were opened, which is where the stale descriptions come from (#148: 29 of 33 commits after opening).
- **Merge commits are not a reliable copy of the description.** 40 of 260 merges have an empty body, 11 of them after the setup guide said merge commits keep Context and Why (helper, Part 1; docs/SETUP.md:60). So the page must read descriptions from the pull request itself, not from git.
- **Much of what reaches main has no pull request.** About 7 pull requests merge into the desk's repository a day, peaking at 36; beside them, 189 automated run commits, 13 item merges and 43 web-editor files reached main with none (helper, Part 2). A page of pull requests alone would miss these; scope must say whether they are in.
- **What the desk already reads.** Open pull requests with their `Milestone:` line, Context and Why already parsed (records.js, pulls.js), merged ones by GraphQL with body and merge commit, at most 300 kept; Service-Desk already has 266, so the cap is near (helper, Part 3). Not read: reviews, review requests, labels, GitHub milestones. The waiting sheet does use the description's milestone and Context (correcting the Q-019 memo).

## For section 5, Limits
- **Read limits.** The 300-pull-request cap (pulls.js:9-10) will be passed soon on the desk's own repository; the page needs a window (for example since the owner last looked) rather than all history.
- **Edit history is not readable** from these sessions (GraphQL refused), so the page cannot rely on knowing when a description changed, only on comparing it with the commits.
- **Which content may leave the repositories** is not settled by Q-021 and stays the owner's ruling (data boundary, earlier answer 8).

## For section 6, Value targets and stop rule (drafts, for the owner)
- **Trap to measure against (Q-020, strongest finding):** many notices at once, and repeated unchanged ones, lower the share acted on (Q-020 1.1, 1.3, B, far; 1.4, B, mid-close; 6.1, a documented case of a new item read as "historical" among 36 repeats). A value target could be: what needs the owner is never buried among routine changes.
- **Approving every change does not lower failures** in software delivery, and large changes get less useful review (Q-020 3.1, B, close; 3.2, C, close). This counts against a page that asks the owner to approve each change.
- **Stop-rule candidate:** if a summary the page shows is found wrong on a point the owner acted on, and the check meant to catch it did not, stop and re-plan.

## For section 7, Unknowns to settle before Design (from the gaps the memos found)
- **U-a. Machine-written summaries or the author's own description?** Agent-written pull-request descriptions grossly mismatch their code in at least 1.7% of 23,247 cases, most often by claiming changes not made, and those were accepted far less often (Q-021 A1, B, close). Errors are more common for long or many-source input and topics the source lacks (A5, A8). Our own audit: 4 of 30 descriptions wrong or incomplete, mostly from staleness (helper). Unknown: whether a fresh summary of the diff would beat the description as written; only a cheap trial on our own pull requests can say.
- **U-b. How it is checked.** Automatic checkers are weak on hard cases (Q-021 B1, A, mid); a model judging its own output scores it higher (B2, B and C); an independent check with the source to hand is favoured but untested on change summaries (B8, opinion). Citing the source for each claim, and retracting any claim without one, is the vendor's own advice (B5, C). Anything shown should therefore be checked by a party other than its author, against the diff.
- **U-c. Whether to mark origin or checking.** A bare "AI-generated" mark slightly lowers trust in true and false items alike (C1, B, far); marking only some items makes the rest look checked (C3, B, far); first-person uncertainty reduces over-reliance (C4, B, mid); explanations make people accept answers whether right or wrong, while source passages help checking (C5). Draft rule for the brief: either every item carries its mark or none does; show the source line a claim rests on rather than an explanation.
- **U-d. Staleness.** Code comments that fall behind the code are tied to later bugs (Q-021 D1, C); nothing is known about how readers notice a stale summary (D3, gap). Since 26 of 30 of our pull requests change after opening, the page must say which commit each summary describes.
- **U-e. Format and amount.** No evidence either way for digest versus list versus status page, for how many items a phone screen holds, or for weeks when volume swings several-fold (Q-020 1.7, 2.5, 7.3, gaps). Predictable batches have modest, distant support over instant delivery, and switching notices off entirely has none (2.1-2.5). These go to a cheap trial, not to research.
- **U-f. Restoring context per project.** The cost of switching between projects, not reading speed, may limit how many one owner can oversee (Q-020 4.1-4.3, untested opinion). A brief that restores context on each switch would target that.

## For section 8, Clear and consistent: traps for the design
From the earlier handoff, now with their evidence:
- Never a bare "nothing failed": an empty page must say what was read and when (Q-020 6.1; P-stale-visible-01 in the library).
- Name the commit each summary describes (helper Part 1; Q-021 D).
- Interrupt only for new items needing action; repeated or unchanged items are activity, not alerts (Q-020 1.1-1.4).
- Mark all or none (Q-021 C3).

## For Part 2, Intent
- Self-reports by the one who did the work lean optimistic in human studies (Q-020 5.1, B; 5.2-5.3, D); nothing tests AI agents (5.4, gap). The owner's intent should say whether the page shows the builders' own accounts, someone else's, or both side by side.

## Next
1. When S-035 lands in the desk, file P-002's project request with docs/projects/P-002.md, carrying these notes into its sections, and have the Critic check Part 1 against the definition of ready.
2. Propose the cheap trial for U-a, U-b and U-e on the desk's own recent pull requests, as a Design milestone.
