# Handoff — the desk's timeline work (P-005), 12 November 2026, part 4: research done; the plan's stop rule is met by the access research

*Written by the Chief of Staff (session_01QBwHGJzc87ezrCJjztgrMp). Follows part 3 (docs/handoff/2026-11-12-chief-of-staff-p005-3.md). Covers about 11:55 to 21:20 UTC. Times are UTC and approximate to a few minutes.*

## What this means for the owner
All five research items for the timeline are done. But the access research shows that acting from the timeline (answering, approving and merging as the owner) needs a new credential with write access, something hosted to run on a timer, and data leaving the repositories, and the plan's stop rule says such a finding comes back to the owner before anything more is done. So the project request and the experiments question are not filed yet; the next session puts that choice to the owner first.

## Done
- **The owner's answer on specification text: A** (decisions/questions/P-005-spec-sources.md, #376), and the rule line (governance/standards/sources.md; L-0048; #377, the Reviewer's PASS and the owner's "Approve", merged by the owner).
- **Q-026 stop card 1: `re-specify`**, the owner's own answer (#382). The same PR recorded the owner's open-ended proxy, L-0049: "Honestly you can run autonomously as you did overnight. You stoppage point is our first design mock up. Please notify me if any significant blockers arise", read as narrowly as L-0047.
- **Q-026's next three source checks** filed nine entries, among them the OpenTelemetry finding card 1 held, and held three (two single-page vendor facts; one Linear fact its own pages disagree on). Triage raised **stop card 2**.
- **Stop card 2, left to the owner** (notes: decisions/Q-026/stop-2-notes.md, #389; the Critic: FAIL, FAIL, PASS). The owner was notified by phone. Set out three options; the owner chose "Option 1": rule on the source rule first, then `re-specify`.
- **The vendor-pages question** (questions/P-005-vendor-pages.md, #390; the Critic: rounds 1 to 3 FAIL, round 4 PASS), answered "A: file all three (Recommended)" (#391), and its rule lines (governance/standards/sources.md; L-0050; #392, the Reviewer's PASS and the owner's "Approve", merged by the owner): a vendor's changelog counts as one of its pages; a fact its pages disagree on is filed as a record of what each says; a single-page fact is filed marked "single page"; the last two are not load-bearing.
- **Stop card 2: `re-specify`** by the owner's Option 1 (#393, merged by proxy). The next round failed on a memo that did not restate the entry; the one after passed. **Q-026 is done (21:06)**; its merge into main is the merge gate's next step, not seen yet at 21:20.
- **Orchestrator runs started by hand** under the proxy, about 16:33, 17:23, 18:12 and 20:47, each when the loop's run ended without starting the next one. Holds seen were all "the latest governance run on <head> is running"; none was "absent".

## What the research found, against the plan
A helper mapped the memos onto the plan (this session's transcript; summary here):
- **Q-027, access (the stop rule's trigger).** Reading needs a read-only fine-grained token, which cannot read check runs; the notifications inbox needs a classic token, which can also write. Acting needs write permissions (Deployments, Contents, Pull requests); only a GitHub App user token marks an action as both the owner's and made through the app (P-gh-owner-action-01, grade C, opinion); a personal token has no documented marker. Approving deploys needs the reviewer role, and on Free, Pro and Team plans required reviewers exist only for public repositories (F-gh-env-01). Central timers need a Cloudflare Worker (F-cf-cron-01); an App needs a webhook receiver; webhooks send full payloads and Apple sees alert metadata (F-webpush-09). No money figure is given; tier is not discussed. The memo's owner questions: account type, plan, how far back links must work, whether Cloudflare may hold copies. Where "Looked at it; remember" state lives is not addressed.
- **Q-024, alerts.** No source gives a daily cap for one person who is not watching continuously; the nearest is an on-call guide of about two pages per twelve hours, "not a finding for this setting". So answer 2 ("Any single thing that needs me.") stands; the stop rule's Q-024 clause is not met. Whether an iPhone web-app push can be Time Sensitive is unknown.
- **Q-023, records.** Who (principal, actor, role, delegation), six kinds of link, and occurrence time kept apart from record time; no standard has a project or milestone field; checks, runs and statuses expire with Actions retention (90 days by default) since 2026-10-01, so facts must be copied into a durable record at event time.
- **Q-025, as-of and gaps.** An as-of label shows the picture's age, not the data's; no-data and late get their own states; a stopped feed is caught by an outside heartbeat. A record written by the watched actor is weaker evidence than the platform's; the memo does not name the Orchestrator-versus-agent split.
- **Q-026, classification.** Most systems layer a small closed set (for counting and colour), an open producer-named kind, and free text; the model's own steps go in the same envelope under a namespace with a named owner, or a separate stream, shown together; about six to seven colour categories is a limit (scatterplots, not timelines).

## What waits on the owner
1. **Acting from the timeline** (the stop rule, docs/projects/P-005.md section 6): keep acting as the owner in scope, with a new write credential (a GitHub App, or a fine-grained token), a hosted receiver or timer, and data leaving the repositories as Q-027 sets out; or drop acting, so the timeline only reads and links to where the owner acts; or something between (for example acting only where no new credential is needed). Q-027's own questions (account type and plan, link lifetime, Cloudflare holding copies) and the deploy-approval limit on private repositories belong with it. Filed as a question first, read cold by the Critic.
2. **The Q-026 stop-card answers were recorded with `proxy: true` on the dispatch log**, because the decisions check makes any card answer committed by the Chief of Staff carry a `Proxy:` line (D-066); stop-1 and stop-2 were the owner's own words. A fault for the Orchestrator's owner, not a ruling.

## Next, in order
1. Confirm Q-026 merged into main (research/Q-026-memo.md on main). If the loop has stopped, start a run by hand (the proxy allows it).
2. Draft the acting question (above), have the Critic read it cold, file it, and put it to the owner.
3. On the answer: redraft the plan to draft 4: section 7's unknowns answered from the five memos (with their filed entry ids), the open lists and risks updated, section 8's three "once Q-024 / Q-027 returns" items reconciled, section 5's limits and tier set from the answer, section 1's "until Q-025 returns" line settled. Value targets, misses and the stop rule stay drafts for the owner.
4. Then file the experiments question: its draft, passed by the Critic at round 4 with one mechanical fix the checks confirmed, is docs/handoff/2026-11-12-P-005-experiments-question-draft.md. Re-read it against draft 4 before filing (its Context names Q-023 as done; add the other four), then file intake/requests/P-005.toml (kind = "project", no `enters`) for the formal readiness check.

## Faults seen, for the Orchestrator's owner
- The loop repeatedly ended a run without starting the next (runs 1007, 1013, 1019, 1040: "Start the next run" skipped), leaving outcomes unread until a run was started by hand.
- Card answers by the owner show `proxy: true` on the dispatch log (above).
- A Triage session's return said the status counters (plan_round, sessions) disagree with the control records.

## Critic and Reviewer returns this session
- Rule line, spec text (#377): the Reviewer PASS, round 1.
- Experiments question draft: the Critic FAIL, FAIL, FAIL, PASS.
- Stop card 2 notes: FAIL, FAIL, PASS.
- Vendor-pages question: FAIL, FAIL, FAIL, PASS.
- Rule lines, vendor pages (#392): the Reviewer PASS, round 1.

## Token checkpoint
Helper runs this session, with their reported figures, are in sessions/chief-of-staff/session_01QBwHGJzc87ezrCJjztgrMp.jsonl: two Reviewer runs, eleven Critic runs and one mapping helper. Their start times are worked back from the reported durations and are approximate to within about ten minutes. This session's own use was not read.
