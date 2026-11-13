# Handoff — the desk's timeline work (P-005), 13 November 2026, part 8: the Design gate held once, case 2 with the gate Critic, and the copying job ruled

*Written by the Chief of Staff (session_01QBwHGJaKPAWHLvefBrVkKb). Follows part 7 (docs/handoff/2026-11-13-chief-of-staff-p005-7.md). Covers about 05:20 to 14:50 UTC on 13 November (the session's worker was restarted twice in between), under the owner's proxy L-0049 up to the Design gate. Times are UTC and approximate to a few minutes.*

## What this means for the owner
The owner ruled twice this session. They held the timeline's first Design gate case, so case 2 was written, and the gate Critic is reading it now; a fresh gate card comes to the owner next. And they approved the job that keeps lasting copies of GitHub's run and check results: a daily job in all four repositories, with about 12 cents a month of new spend on the private two. Nothing runs yet: the job is built in the operating model and each repository adopts it, which the owner approves there. On the public repositories nothing should be lost before about 29 December 2026; the private two the owner can check, or raise to 400 days.

## Done
- **Design gate, case 1** (docs/gates/P-005/design-gate-1-case.md): the gate Critic recommended hold (reviews/P-005/_design-gate-1-critic.md on item/P-005): no reason for Discovery-3 and -5 reading not reached, the M7 copying risk only in the appendix, some citations not supporting their lines; its word estimate (550 to 600) was wrong against `v3_checks gates` (350). Notes: decisions/P-005/dor-2-notes.md. The owner answered in session "Hold for case 2 (Recommended)" (decisions/P-005/dor-2.md, #418).
- **Why the two steps read not reached**, found in governance/checks/v3_checks.py: Discovery-3's file rule reads only decisions/questions/<item>-groundwork.md or -discovery.md, and P-005's ruling is -groundwork-shortlist.md; Discovery-5's `research_settled` needs every research item routed before the readiness pass to have passed, and Q-028 (filed by this session under Discovery-5) was open at 05:00:53.
- **Design gate, case 2** (docs/gates/P-005/design-gate-2-case.md, #420): the reason in plain words in section 1 and the appendix, the copying risk in section 5, citations fixed. One cold read (hold, four citation points, fixed). The gate Critic was dispatched on it at about 14:45.
- **Q-028** passed its third source check at 06:03:19 (research/Q-028-memo.md, research/Q-028-source-check.md).
- **The copying-job question** (questions/P-005-copying-job.md, #421, merged by asks-merge) after six cold reads (FAIL x5: unhedged deletion, the 60-day public-schedule rule missing, what a copy keeps overstated, reversibility form, a shell-mangled cost line, the account's recorded billing missed, private check results' staleness; then PASS). The owner answered in session "A: Daily, all four (Recommended)" (decisions/questions/P-005-copying-job.md, #422, merged by asks-merge).
- **Seen on GitHub's public API, 13 November**: Service-Desk was created 2026-09-30 and its oldest run is from that day; Model-Lab was created 2026-11-01. So neither public repository holds a result older than 90 days yet.

## Proxy actions this session (since part 7)
Merged #418 and #420 (records only, checks green). Recorded two owner answers given in session. No gate ruling.

## What waits on the owner
1. **The Design gate, case 2**, once the gate Critic's record and the fresh card are up (queue/P-005-dor-*.md). The ruling is the owner's; L-0049 ends there in practice.
2. **Adopting the copying job** in each repository, when it is built in the operating model.
3. Optionally: raising the private repositories' retention to 400 days; checking the private two's oldest runs.

## Next, in order
1. Read the gate Critic's view of case 2 and the card; write decisions/P-005/dor-3-notes.md (the card number as the Orchestrator names it). On a further hold, case 3; never edit a case after its Critic is dispatched.
2. Brief the copying job for the operating model: the ruling's "How it is carried out" (decisions/questions/P-005-copying-job.md) and research/Q-028-memo.md are the brief's sources; it is built in Personal-Org-Operating-Model by its own builders and reviewed there.
3. Tell the operating model's owner about the two timeline rules above (Discovery-3's file name; Discovery-5's settling across every research item).

## Faults seen, for the Orchestrator's owner
- The Discovery-3 and Discovery-5 rules above make a later item's case show research-backed steps as not reached.
- A source-checker session for Q-028 dispatched at 05:56:59 was logged as an anomaly ("the item is returned, not dispatched; ignored") at the same moment as the PASS from the 05:54:17 session.
- Writing a heredoc unquoted lets the shell expand `$12` and `$0`; quote heredocs that hold dollar amounts.

## Critic returns this session (since part 7)
- Gate Critic, case 1: hold. Cold read of case 2: hold (fixed). Copying-job card: FAIL, FAIL, FAIL, FAIL, FAIL, PASS.

## Token checkpoint
Helper runs, with their reported figures, are in sessions/chief-of-staff/session_01QBwHGJaKPAWHLvefBrVkKb.jsonl. This session's own use was not read.
