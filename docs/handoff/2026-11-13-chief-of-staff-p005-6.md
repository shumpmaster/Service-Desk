# Handoff — the desk's timeline work (P-005), 13 November 2026, part 6: reading and lasting copies ruled, the plan at draft 5, and the project request filed

*Written by the Chief of Staff (session_01QBwHGL64KjMdsZ4DVaQDkL). Follows part 5 (docs/handoff/2026-11-13-chief-of-staff-p005-5.md). Covers about 02:20 to 03:45 UTC on 13 November, under the owner's proxy L-0049. Times are UTC and approximate to a few minutes.*

## What this means for the owner
The owner made three rulings this session. The timeline reads with the desk's read-only key and no GitHub App is made. GitHub's run and check results are kept for the whole life of the work as copies saved in each project's own repository, with nothing stored at Cloudflare. And both record-reading experiments run during Design. The plan's fifth draft carries the first two, and the timeline is now filed as a project, so its plan goes to the Critic's formal readiness check. One thing waits on the owner soon: the change that writes those copies is its own question, and until it is approved nothing is copied, so results past GitHub's 90 days are being lost meanwhile.

## Done
- **The reading question** (questions/P-005-reading.md, #403): the Critic's cold reads in fresh sessions on a different model: FAIL (the card said the read key can read deploys and commit statuses; its actual permissions are Contents, Metadata, Pull requests and Actions read, docs/handover/desk-operations.md), then PASS, five non-blocking notes applied.
- **The lasting-copies question** (questions/P-005-lasting-copies.md, #403): FAIL (it called itself reversible but refused to default; estimates stated as facts; B called "no new spend" with no source; jargon), FAIL (Cloudflare's "no country" stated for all storage, when Durable Objects can be held to a jurisdiction; B's design read as fact; C's "no second ruling" unsupported), FAIL (the 1 October start rests on one page, which the vendor-pages ruling says no decision may rest on; A's "everything else stays reachable" unsupported), PASS, four non-blocking notes applied. #403 was merged by asks-merge.
- **The owner's answers**, given by the session's question tool: "A: Keep the read key (Recommended)" and "B: Copies as repo files (Recommended)" (decisions/questions/P-005-reading.md and P-005-lasting-copies.md, #404). Asks-merge cannot close the second, since its question is irreversible in part, so both went in one pull request, which the owner merged.
- **The plan, draft 5** (docs/projects/P-005.md, #405, merged by proxy under L-0049 with every check green): sections 1, 5, 7 and 8 set to the two rulings; the open list now holds the records change that writes the copies, and how alerts reach the owner from every project, chosen in Design. The Critic's informal read: PASS, six non-blocking notes, four applied. It found that the desk's own spec records check runs and statuses readable with the read key only because Service-Desk is public (specs/S-001.md, AC79's known limit); the plan now cites it.
- **The experiments question**, updated against draft 4 (its Context now names all five research items done, E2's open items and the acting ruling): the Critic PASS, two non-blocking notes applied. Filed with **the project request** intake/requests/P-005.toml (kind = "project", earlier = "P-001", no `enters`) in #407, merged by proxy under L-0049. The owner answered "A: Run both (Recommended)" (decisions/questions/P-005-experiments.md, #408, merged by asks-merge with this session's lines).
- **P-005 routed** by Orchestrator run gha-43359825449-1: status/P-005.toml at stage 2, state "ready", role "critic", plan round 0, waiting for the Critic's readiness check.

## What waits on the owner
1. **The records change for lasting copies**: an automated job in each repository writes each run's and check's result into a file there, since the desk holds no key that can write. It is a change to what the projects record, made in the operating model and filed as its own question with what it writes, how often and what it costs against the $0 ceiling. Until it is approved, nothing is copied; if GitHub's deleting has started, results from about mid-August on pass 90 days day by day and are lost for good.
2. At the Design gate: the list in docs/projects/P-005.md, section 7, "For the owner at the Design gate".
3. When the build needs them: adding Deployments and Commit statuses read to the desk's read key, the owner's own click on GitHub's token page; the key's value does not change.

## Next, in order
1. Read the outcome of P-005's readiness check (status/P-005.toml; the dispatch log). If the loop has stopped, start a run by hand (the proxy allows it). On a FAIL, fix what it names and resubmit; on a PASS, the item waits for its Design gate case (docs/gates/_GATE.md).
2. Draft the records-change question for lasting copies (above): which job writes the copies, where in each repository, how often, with what token (each repository's own workflow token), what a copy can read from GitHub with it, and what it costs. It is an operating-model change, so the change itself is made in Personal-Org-Operating-Model by the owner's ruling. Have the Critic read it cold, file it and put it.
3. The Design gate case once the readiness check passes, from docs/gates/_GATE.md.

## Faults seen, for the Orchestrator's owner
- A local merge simulation with `Merged-By:`/`Delegation:` lines in its message is read by `record_checks merges` as an asks-merge merge and fails on its author; a plain merge message, as GitHub's own test merge has, passes. Simulate with a plain message unless the pull request is meant for asks-merge, and then with the workflow's identity.
- The desk's page code reads check runs (src/lib/github.js, line 113) with a key that cannot read them on a private repository; the spec records this as a known limit, so it is not a fault, but the timeline inherits it.

## Critic returns this session
- Reading question: FAIL, PASS.
- Lasting-copies question: FAIL, FAIL, FAIL, PASS.
- Experiments question: PASS.
- Plan draft 5 (informal): PASS.

## Token checkpoint
Helper runs this session, with their reported figures, are in sessions/chief-of-staff/session_01QBwHGL64KjMdsZ4DVaQDkL.jsonl: eight Critic runs. Their start times are worked back from the reported durations and are approximate. This session's own use was not read.
