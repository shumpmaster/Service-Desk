I've written the Q-023 memo below. I wrote nothing to disk because I have no write tool. The Orchestrator records this memo, and the Source checker checks it.

---

# Memo — Q-023: what an event record must hold for work to be rebuilt from records alone

Researcher · 2026-11-12 · depth 2 · topics: github, attribution, automation, change-reporting, status-reports, agents

**How to read the marks.** Every statement is marked **fact**, **estimate** or **opinion**, with a grade:
- **A**: two or more pages from the publisher or the standard itself.
- **B**: one page from the publisher, or a page read through a summarising fetch.
- **C**: a secondary source only.

I read every source today through a summarising fetch, so the Source checker should re-open the exact wording. I have not checked any of my own facts.

**Library entries this builds on:**
- L-F1, L-F2, L-F10: what GitHub credits a token's actions to.
- L-F3: issue comments carry `performed_via_github_app`.
- F-gh-12 and F-gh-12b: schedule timing, delays and dropped runs.
- F-Q004-1: webhook redelivery only within 3 days.
- F-Q004-9: the Events API can lag by up to 6 h.
- F-Q004-12: webhooks can arrive out of order.
- LIB-P-a: webhooks are "not a durable log", so reconcile by listing.
- LIB-F-g: cost fields are estimates.

## Field scan

I looked at four groups of sources:
- **Version control and hosts:** git commits, trailers, notes, garbage collection (gc), push and log; GitHub REST for commits, pull-request (PR) reviews, check runs, workflow runs, deployment reviews, audit log and Events API; GitHub's retention settings and changelog.
- **Pipeline event standards:** CloudEvents 1.0, CDEvents with its links spec, OpenTelemetry's log data model and CI/CD attributes, W3C Trace Context, SLSA v1.0 provenance.
- **General provenance and audit practice:** W3C PROV-O, NIST SP 800-53 AU-3 and AU-8, the OWASP Logging Cheat Sheet, RFC 3339.
- **Event sourcing:** correlation and causation IDs (Axon docs, Greg Young as quoted by Arkency).
- **Archiving:** Software Heritage IDs (SWHID).

I did not open the NIST primary text: the CSRC catalogue would not render. NIST items rest on mirror sites and are graded C.

## 1. Who or what wrote it, and in what capacity

**1.1 Fact (A). Git records two identities on every commit.** Each commit holds an author (name, email, date) and a committer (name, email, commit time). Per the Pro Git book: "The author is the person who originally wrote the work, whereas the committer is the person who last applied the work."
- Sources: git-scm.com/docs/git-commit-tree; git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History

**1.2 Fact (A). Git trailers are a standard place for extra key-value lines.** They sit at the end of the commit message after a blank line, in the form `key: value`; keys are ASCII letters, digits and hyphens. GitHub reads the `Co-authored-by: name <email>` trailer and credits each co-author.
- Sources: git-scm.com/docs/git-interpret-trailers; docs.github.com/…/creating-a-commit-with-multiple-authors

**1.3 Fact (A). PROV-O names the "on whose behalf" relation.**
- *Delegation* (`actedOnBehalfOf`): "the assignment of authority and responsibility to an agent … to carry out a specific activity as a delegate or representative."
- *Attribution* (`wasAttributedTo`) and *association* (`wasAssociatedWith`) are separate relations.
- A qualified association can carry `hadRole` ("the function that the agent served") and `hadPlan`.
- Source: w3.org/TR/prov-o (a W3C Recommendation; one document, but it is the standard itself)

**1.4 Fact (A). GitHub Actions separates who started a run from who started a re-run.**
- `github.actor`: "the user that triggered the initial workflow run."
- `github.triggering_actor`: "the user that initiated the workflow run". The docs say the two "may differ" on a re-run.
- `run_id` "does not change if you re-run"; `run_attempt` goes up with each re-run.
- Sources: docs.github.com/…/contexts; docs.github.com/en/rest/actions/workflow-runs

**1.5 Fact (B). GitHub's records of acting through an app are uneven.**
- Issue comments carry `performed_via_github_app` (L-F3, already filed).
- The PR review object as fetched lists `user`, `body`, `state`, `commit_id`, `submitted_at` and `author_association`, and I did not see `performed_via_github_app`. This is an absence seen through a summary, so treat it as unconfirmed, as the Source checker did for L-F3.
- Source: docs.github.com/en/rest/pulls/reviews

**1.6 Fact (B). Deployment approvals have their own record.** A workflow run's review history returns `state` (approved, rejected or pending), `comment`, `environments` and `user` for each approval.
- Source: docs.github.com/en/rest/actions/workflow-runs ("Get the review history")

**1.7 Fact (C). NIST AU-3 lists six things an audit record should hold:** what type of event occurred, when, where, its source, its outcome, and "the identity of any individuals, subjects, or objects/entities associated with the event."
- Sources: tarleton.edu and upguard.com mirrors of AU-3 (the primary NIST text was not opened)

**1.8 Opinion. The surveyed systems describe a writer in up to four parts:**
- the principal, meaning who answers for it;
- the actor who actually acted (a person, a bot or an app, per L-F10);
- the capacity or role (PROV `hadRole`, GitHub `author_association`);
- any delegation (PROV `actedOnBehalfOf`, git author versus committer, GitHub `performed_via_github_app`).

Where only one identity is stored, the other parts can only be inferred. A verdict filed by one party for another fits PROV delegation exactly: the reviewer is the principal and the filer is the delegate.

## 2. When, by which clock, in which time zone

**2.1 Fact (A). Git stores time zone offsets.** Git's internal date is "`<unix-timestamp> <time-zone-offset>`", where the offset is from UTC. Each commit carries an author date and a committer date, and either can be set apart from the other (`GIT_AUTHOR_DATE`, `GIT_COMMITTER_DATE`). `git log --date=iso-strict` (`%aI`, `%cI`) prints them with the offset.
- Sources: git-scm.com/docs/git-commit-tree; git-scm.com/docs/git-log

**2.2 Fact (B). Some GitHub APIs return UTC instead of a local offset.**
- Check run times are "ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ".
- Audit-log exports give `created_at` in milliseconds since the epoch.
- The Git commits API example shows an offset (`2008-07-09T16:13:30+12:00`).
- Not established: whether the REST commit APIs keep the author's original offset on reads.
- Sources: docs.github.com/en/rest/checks/runs; docs.github.com/…/reviewing-the-audit-log-for-your-organization; docs.github.com/en/rest/git/commits

**2.3 Fact (A). Standards separate when something happened from when it was recorded.**
- OpenTelemetry has `Timestamp` ("measured by the origin clock") and `ObservedTimestamp` ("when the event was observed by the collection system").
- OWASP lists "Log date and time" and "Event date and time" separately, because "the event timestamp may be different to the time of logging".
- CDEvents `timestamp` is the time of the occurrence, but "when the time of the occurrence is not available, the time when the event was produced MAY be used".
- CloudEvents `time` is RFC 3339, and all producers for one `source` "MUST be consistent" in how they set it.
- Sources: opentelemetry.io/docs/specs/otel/logs/data-model; cheatsheetseries.owasp.org Logging Cheat Sheet; github.com/cdevents/spec spec.md; github.com/cloudevents/spec spec.md

**2.4 Fact (A). RFC 3339 can say "local zone unknown".** Numeric offsets are "local time minus UTC". An offset of `-00:00` means UTC is known but the local offset is not, which "differs semantically" from `Z` or `+00:00`.
- Source: rfc-editor.org/rfc/rfc3339 §4.2–4.3 (a standard; one document)

**2.5 Fact (C). NIST AU-8** asks that timestamps "use Coordinated Universal Time, have a fixed local time offset from Coordinated Universal Time, or … include the local time offset as part of the time stamp", at a granularity the organisation defines. OWASP adds: synchronise clocks, and where that is impossible, record the offset or a confidence level.
- Sources: upguard.com AU-8 mirror and search extracts (NIST primary not opened); OWASP as above

**2.6 Fact (A), from the library.** GitHub webhooks can arrive out of order, and GitHub says to sequence them by the timestamps in the payload (F-Q004-12). Scheduled runs can be delayed or dropped (F-gh-12b).

**2.7 Opinion.** Time alone does not order events reliably here:
- several clocks are involved (agent host, Actions runner, GitHub servers, the owner's phone);
- delivery is out of order;
- schedules slip.

The surveyed standards carry an explicit causal link alongside time (§3.3) and keep occurrence time apart from record time.

## 3. Linking an event to its work, project, milestone and run or session

**3.1 Fact (A). An event's identity comes from its ID plus its source.**
- CloudEvents requires `id`, `source`, `specversion` and `type`; "Producers MUST ensure that `source` + `id` is unique for each distinct event". `subject` is optional and names what the event is about.
- CDEvents makes `timestamp` required as well, plus a subject whose `id` "Subsequent events associated to the same subject MUST use the same".
- Sources: CloudEvents spec; CDEvents spec.md

**3.2 Fact (A). CDEvents links events into chains.** A `chainId` (a UUID) groups the events of one chain. Link types are START, END, PATH (`from`/`to`) and RELATION (`linkKind`, `source`/`target`), each with a `timestamp` and `tags`.
- Source: github.com/cdevents/spec links.md (one document, the spec itself). Other links-spec details, beyond what is quoted here, rest on the summary.

**3.3 Fact (B). Event sourcing uses a correlation ID and a causation ID.** "If you are responding to a message, you copy its correlation id as your correlation id, its message id is your causation id." Axon defines the correlation ID as the identifier of "the original message that started the entire business transaction" and the causation ID as "the immediate parent message".
- Sources: blog.arkency.com/correlation-id-and-causation-id-in-evented-systems; docs.axoniq.io …/message-correlation (two publishers, but a practitioner convention rather than a standard)

**3.4 Fact (A). Tracing standards nest one run inside another.**
- W3C `traceparent` carries a 16-byte `trace-id` for the whole trace and an 8-byte `parent-id` for the caller's step.
- OpenTelemetry's CI/CD attributes (release candidate) separate the pipeline run (`cicd.pipeline.run.id`, `cicd.pipeline.run.url.full`) from task runs (`cicd.pipeline.task.run.id`, "unique per pipeline run") and give each a result.
- Sources: w3.org/TR/trace-context; opentelemetry.io/docs/specs/semconv/registry/attributes/cicd

**3.5 Fact (A). SLSA build records carry a run ID and the inputs used.** `runDetails` holds `builder.id`, `metadata.invocationId` (which "can be useful for finding associated logs"), `startedOn` and `finishedOn` (UTC `Z`). `buildDefinition` holds `buildType`, `externalParameters` (set by the user) and `resolvedDependencies`.
- Source: slsa.dev/spec/v1.0/provenance

**3.6 Fact (A). GitHub's own run and check records point to a commit and to external IDs.**
- Workflow runs carry `id`, `run_number`, `run_attempt`, `event`, `head_sha`, `head_branch`, `path` and `run_started_at`.
- Check runs carry `head_sha`, `external_id` ("a reference for the run on the integrator's system") and `details_url`.
- Sources: docs.github.com/en/rest/actions/workflow-runs; docs.github.com/en/rest/checks/runs

**3.7 Opinion. Across these systems a record that can be rebuilt has six kinds of link:**
1. its own unique ID and its source;
2. what it is about (CloudEvents `subject` or CDEvents subject `id`);
3. the run or session it belongs to, with an attempt number;
4. the grouping above that (correlation ID, `chainId` or `trace-id`), which could map to the piece of work, the milestone and the project;
5. its direct cause (causation ID, `parent-id` or PATH `from`);
6. pointers to the host objects involved, by fixed ID (commit SHA, run ID with attempt).

None of the surveyed standards has a field for "project" or "milestone". Those are local groupings, carried as subject or correlation IDs or as tags.

## 4. Steps commonly missing, ambiguous or only reconstructable

**4.1 Fact (A). Work on a branch that was never pushed reaches the host only if a true merge commit reaches it.**
- `git push` "sends all necessary data that isn't already on the remote", so a merge commit brings its second parent's history with it.
- `--first-parent` hides those commits in log views.
- On GitHub, a merge commit adds all the branch's commits; a squash merge combines them into one; a rebase merge "always updates the committer information and creates new commit SHAs."
- The local reflog records branch movements but expires: by default 90 days, or 30 days for entries no longer reachable. Unreachable objects are pruned after a 2-week grace period.
- Sources: git-scm.com/docs/git-push; git-log; git-gc; docs.github.com/…/about-merge-methods-on-github

**4.2 Estimate (my reading, unverified).** The name of a branch never pushed survives only in text, such as git's default "Merge branch '…'" message, and its creation time is not recorded anywhere on the host. The branch's commits keep their own author and committer dates. Not source-checked: git's default merge message format.

**4.3 Fact (A). Squash and rebase merges lose or rewrite step-level history.** A squash merge leaves one commit (individual authors survive only as `Co-authored-by` trailers, per 1.2). A rebase merge replaces the committer and the SHAs (sources as 4.1).

**4.4 Fact (B). Notes can be added after the fact, but are easy to lose.** `git notes` attaches annotations "without touching the objects themselves", stored by default under `refs/notes/commits`. Per the summary, notes are not pushed or fetched by default.
- Source: git-scm.com/docs/git-notes (the push and fetch default is not in a quoted passage; needs a re-check)

**4.5 Fact (A), from the library and above. How surveyed systems mark the awkward cases:**
- *Filed for someone else:* git author versus committer, `performed_via_github_app` on comments, PROV `actedOnBehalfOf`.
- *Re-runs:* `run_attempt` with `triggering_actor`.
- *Time not known:* CDEvents allows production time instead; RFC 3339 has `-00:00`.
- *Grouped by session or run:* `invocationId`, `run_id`, `chainId`, `trace-id`.
- *Repeat delivery of one event:* CDEvents "Subsequent delivery attempts of the same event MAY share the same id."

**4.6 Opinion. Steps likely to be missing or ambiguous in a setup like this one:**
- Branch work that was squashed or rebased.
- Results filed by another party where only the filer is recorded.
- Approvals given in a host UI that leave a record only in host objects that expire. Deployment approvals are one example; PR merges are another, although the merge commit itself stays.
- Scheduled runs that were delayed or dropped, which leave no record at all (F-gh-12b).
- Actions by a conversational agent nobody dispatched, if they are not logged with a session ID.
- Owner actions on a phone, whose local time zone may differ from the runner's.

What the surveyed systems do is mark such a step explicitly: inferred, filed by X for Y, or time not known. They do not leave the field blank.

## 5. Keeping links working after the host's retention period ends

**5.1 Fact (A). Since 2026-10-01, GitHub deletes checks, workflow runs and commit statuses on the Actions retention clock.** Previously these were kept for 400+ days regardless of the setting. Artifacts and logs follow the same setting:
- default 90 days;
- public repositories 1–90 days, so 90 days at most;
- private repositories 1–400 days.

Changing the setting "won't restore data that was previously removed."
- Sources: docs.github.com/…/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization; github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses (also the 2026-07-17 and 2026-08-27 notices)

**5.2 Fact (A/B). Other GitHub records expire too:**
- The organisation audit log keeps 180 days, and "Only owners can access an organization's audit log" (B).
- The Events API returns events from the past 30 days, 300 at most, with lag of 30 s to 6 h (A, with F-Q004-9).
- Webhook redelivery works only for the past 3 days (F-Q004-1).
- Sources: docs.github.com audit-log page; docs.github.com/en/rest/activity/events

**5.3 Fact (A). Git objects and their SHAs last while something reaches them.**
- GitHub: a link to a commit SHA "will permanently link to the exact version of the file in that commit", while links by branch name change as the branch moves.
- PR heads stay fetchable under the read-only `refs/pull/ID/head`.
- A closed PR's deleted head branch can be restored with "Restore branch" (that page was seen only in search extracts, so B).
- Unreachable objects are pruned (4.1).
- Sources: docs.github.com/…/getting-permanent-links-to-files; …/checking-out-pull-requests-locally; …/deleting-and-restoring-branches-in-a-pull-request

**5.4 Fact (B). Software Heritage IDs work without the original host.** SWHIDs are intrinsic, compatible with git object hashes (`swh:1:rev:<commit sha>`), and accept context qualifiers (`origin`, `visit`, `anchor`, `path`). A commit SHA can therefore be resolved in an archive after the original host is gone, if the archive has a copy.
- Sources: search extracts of docs.softwareheritage.org persistent-identifiers and arXiv 2004.00514. The primary page refused the fetch, so this needs a re-open.

**5.5 Opinion. Practice points two ways once host records expire:**
1. **Self-contained records.** Copy the facts you need (actor, times, result, run ID, attempt, SHA) into a durable record when the event happens. LIB-P-a and PAT-Q004-1 already say "reconcile; webhooks are not a durable log." Host URLs then become hints that may break, not the record.
2. **Fixed IDs over moving ones.** Use SHAs, run ID plus attempt, and PR numbers rather than branch names or "latest". Where a link can expire, the reader shows it as expired rather than as missing.

SLSA's `invocationId` and GitHub's `external_id` follow the same idea: a stable ID owned by the record's writer, with the host's URL as a secondary pointer.

## Proposed library entries (for the Source checker)

```yaml
---
id: F-rec-git-identity-01
form: fact
claim: "Every git commit records an author (name, email, date) and a committer (name, email, commit time) separately; Pro Git: 'The author is the person who originally wrote the work, whereas the committer is the person who last applied the work.' Dates are stored as Unix time plus a UTC offset (e.g. +0100) and can be set independently via GIT_AUTHOR_DATE / GIT_COMMITTER_DATE."
grade: A
topics: [github, attribution]
shelf_life: 60 months
sources:
  - https://git-scm.com/docs/git-commit-tree
  - https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History
---
---
id: F-rec-actions-actor-attempt-01
form: fact
claim: "In GitHub Actions, github.actor is the user that triggered the initial run and github.triggering_actor the user that initiated this run; they may differ on a re-run. run_id does not change on re-run; run_attempt starts at 1 and increments per re-run; run_number increments per run of a workflow."
grade: A
topics: [github, automation, attribution]
shelf_life: 12 months
sources:
  - https://docs.github.com/en/actions/reference/workflows-and-actions/contexts
  - https://docs.github.com/en/rest/actions/workflow-runs
---
---
id: F-rec-actions-retention-02
form: fact
claim: "From 2026-10-01, GitHub checks, workflow runs and commit statuses follow the Actions retention setting (previously kept 400+ days regardless). Default 90 days; public repos 1-90 days; private repos 1-400 days. Changing the setting does not restore removed data."
grade: A
topics: [github, automation]
shelf_life: 6 months
sources:
  - https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization
  - https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses
---
---
id: F-rec-host-windows-01
form: fact
claim: "GitHub organisation audit log covers the last 180 days and only org owners can access it; the REST Events API returns at most 300 events from the past 30 days."
grade: B
topics: [github]
shelf_life: 12 months
sources:
  - https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization
  - https://docs.github.com/en/rest/activity/events
note: two different claims, one page each.
---
---
id: F-rec-merge-methods-01
form: fact
claim: "GitHub merge commits (--no-ff) add all head-branch commits to the base; squash merging combines them into one commit; rebase merging always updates committer information and creates new SHAs. git push sends all data the remote lacks, so a pushed merge commit carries its second-parent history; git log --first-parent hides it."
grade: A
topics: [github, change-reporting]
shelf_life: 24 months
sources:
  - https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github
  - https://git-scm.com/docs/git-push
  - https://git-scm.com/docs/git-log
---
---
id: F-rec-git-expiry-01
form: fact
claim: "git gc prunes unreachable objects after a default 2-week grace period; reflog entries expire after 90 days by default, or 30 days if not reachable from the current tip."
grade: B
topics: [github]
shelf_life: 36 months
sources:
  - https://git-scm.com/docs/git-gc
---
---
id: F-rec-prov-delegation-01
form: fact
claim: "W3C PROV-O defines Delegation (actedOnBehalfOf) as 'the assignment of authority and responsibility to an agent … to carry out a specific activity as a delegate or representative', separate from Attribution (wasAttributedTo) and Association (wasAssociatedWith); qualified associations carry hadRole and hadPlan; activity times are xsd:dateTime."
grade: A
topics: [attribution, agents]
shelf_life: 120 months
sources:
  - https://www.w3.org/TR/prov-o/
note: standard; single document.
---
---
id: F-rec-two-times-01
form: fact
claim: "Event standards separate occurrence time from record time: OpenTelemetry Timestamp (origin clock) vs ObservedTimestamp (collector); OWASP 'Log date and time' vs 'Event date and time'; CDEvents timestamp is occurrence time but MAY fall back to production time; CloudEvents time is RFC 3339 and producers for one source MUST be consistent in how they set it."
grade: A
topics: [automation, status-reports]
shelf_life: 36 months
sources:
  - https://opentelemetry.io/docs/specs/otel/logs/data-model/
  - https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
  - https://github.com/cdevents/spec/blob/main/spec.md
  - https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
---
---
id: F-rec-rfc3339-unknown-offset-01
form: fact
claim: "RFC 3339: offsets are 'local time minus UTC'; '-00:00' means UTC is known but the local offset is not, semantically different from 'Z' or '+00:00'."
grade: A
topics: [status-reports]
shelf_life: 120 months
sources:
  - https://www.rfc-editor.org/rfc/rfc3339
---
---
id: F-rec-event-identity-01
form: fact
claim: "CloudEvents requires id, source, specversion, type, with source+id unique per distinct event; CDEvents adds a required timestamp and a subject whose id MUST stay the same across events about it, optional chainId (UUID) and links of type START, END, PATH, RELATION; repeat deliveries MAY share an id."
grade: A
topics: [automation, change-reporting]
shelf_life: 24 months
sources:
  - https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
  - https://github.com/cdevents/spec/blob/main/spec.md
  - https://github.com/cdevents/spec/blob/main/links.md
---
---
id: F-rec-audit-content-01
form: fact
claim: "NIST SP 800-53 r5 AU-3: audit records establish event type, when, where, source, outcome, and identity of individuals/subjects/objects; AU-8: timestamps use UTC, a fixed offset from UTC, or include the local offset."
grade: C
topics: [status-reports, change-reporting]
shelf_life: 60 months
sources:
  - https://www.tarleton.edu/security-controls-catalog/audit-and-accountability-au/au-3-content-of-audit-records/
  - https://www.upguard.com/compliance/nist-sp-800-53/au/au-8.md
note: primary NIST text not opened; checker should open SP 800-53 r5 itself.
---
---
id: F-rec-deploy-review-01
form: fact
claim: "GitHub's 'Get the review history for a workflow run' returns, per approval, state (approved/rejected/pending), comment, environments and user."
grade: B
topics: [github, automation, attribution]
shelf_life: 12 months
sources:
  - https://docs.github.com/en/rest/actions/workflow-runs
---
---
id: P-rec-correlation-causation-01
form: pattern
claim: "Give every event its own ID, a correlation ID for the whole piece of work, and a causation ID naming the event that directly caused it ('copy its correlation id as your correlation id, its message id is your causation id'). The same shape appears as W3C trace-id/parent-id and CDEvents chainId/PATH links. Lets a reader rebuild order and grouping when clocks disagree or delivery is out of order (F-Q004-12)."
grade: B
topics: [automation, agents, change-reporting]
shelf_life: 36 months
sources:
  - https://blog.arkency.com/correlation-id-and-causation-id-in-evented-systems/
  - https://docs.axoniq.io/axon-framework-reference/5.0/messaging-concepts/message-correlation/
  - https://www.w3.org/TR/trace-context/
  - https://github.com/cdevents/spec/blob/main/links.md
---
---
id: P-rec-self-contained-durable-01
form: pattern
claim: "Copy what a reader needs (actor, principal and role, occurrence and record time with offset, result, run ID with attempt, commit SHA) into a durable record at event time, and link host objects by IDs that do not move (SHA, run ID+attempt, PR number) rather than branch names; treat host URLs as hints that may expire. Basis: Actions checks/runs/statuses now expire with retention (F-rec-actions-retention-02); audit log 180 d, Events API 30 d; SHA permalinks are permanent while reachable; SLSA invocationId and GitHub external_id follow this shape."
grade: B
topics: [github, status-reports, automation]
shelf_life: 12 months
sources:
  - https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses
  - https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files
  - https://slsa.dev/spec/v1.0/provenance
  - https://docs.github.com/en/rest/checks/runs
note: the conclusion is the researcher's opinion built on the cited facts.
---
```

## Gaps in this memo

- Whether GitHub's REST commit reads keep the author's original time zone offset. This matters for "in which time zone".
- Whether PR reviews and merges done by an app record the app the way `performed_via_github_app` does on comments.
- Whether personal-account repositories (as opposed to organisations) have any audit log. The setup names a user-owned repository.
- What happens to `refs/pull/*` when a repository is deleted or transferred.
- None of the surveyed standards defines fields for "project", "milestone" or "agent session". Any mapping onto them is local design, which is not my lane.

---

## Six-part contract

1. **What I changed.** Nothing on disk. My lane has no write tool. The memo above is the deliverable, for the Orchestrator to record word for word in research/.
2. **Why.** Q-023 is a depth-2 question and does not start with "Groundwork map:", so it gets a graded memo rather than a groundwork map. It covers:
   - writer and capacity;
   - time and clock;
   - links to the work and the run;
   - steps that are missing or have to be pieced together;
   - keeping links working after host retention ends.
3. **What I checked.** No commands; I have no shell. I read research/Q-023.md and the library entries sharing its topics (L-F1, F2, F3, F4, F10; F-gh-08a, 08b, 11, 12, 12b, 13; F-gh-search-02a; Q-004-facts; F-change-approval-01; F-status-optimism-01; F-automation-complacency-01; LIB-P-a; LIB-F-g). I ran about 35 web searches and page fetches. Every page listed was opened today through a summarising fetch, except two:
   - the NIST AU-3 and AU-8 primary text, which would not render, so I used mirror sites;
   - the Software Heritage SWHID page, which blocked access.

   I have not marked any fact as checked.
4. **What is undone.**
   - The NIST primary text is not opened.
   - The SWHID primary page is not opened.
   - The GitHub "Restore branch" page and the default for pushing git notes were seen only in extracts.
   - The REST commit time zone question is unresolved.
   - Three absence claims are not confirmed: PR review has no `performed_via_github_app`; the audit-log page does not mention Git events; standards have no project or milestone field.
5. **Needed from outside my lane.** The Source checker should re-open the sources, especially those flagged above. The Orchestrator needs to record the memo. Choosing which fields this setup must carry, and turning them into checks, belongs to the decision this memo serves, not to me.
6. **Open questions.** I am adding these as new research questions in neutral form; I have not closed any:
   - Do GitHub's REST commit endpoints return the author's original UTC offset or a UTC-normalised time?
   - Which GitHub objects created by a GitHub App record that app (reviews, merges, deployment approvals)?
   - What audit or security log, if any, is available for repositories owned by a personal account, and for how long?

   Nothing here needs a level-5 expert or a paid source.

Sources:
- [git-commit-tree](https://git-scm.com/docs/git-commit-tree)
- [Pro Git, Viewing the Commit History](https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History)
- [git-interpret-trailers](https://git-scm.com/docs/git-interpret-trailers)
- [git-gc](https://git-scm.com/docs/git-gc)
- [git-push](https://git-scm.com/docs/git-push)
- [git-log](https://git-scm.com/docs/git-log)
- [git-notes](https://git-scm.com/docs/git-notes)
- [GitHub co-authored commits](https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors)
- [GitHub merge methods](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github)
- [GitHub Actions retention](https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization)
- [Changelog 2026-10-01](https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses)
- [Changelog 2026-07-17](https://github.blog/changelog/2026-07-17-actions-retention-will-cover-checks-workflow-runs-and-statuses/)
- [Org audit log](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization)
- [Events API](https://docs.github.com/en/rest/activity/events)
- [Workflow runs REST](https://docs.github.com/en/rest/actions/workflow-runs)
- [Actions contexts](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts)
- [Check runs REST](https://docs.github.com/en/rest/checks/runs)
- [PR reviews REST](https://docs.github.com/en/rest/pulls/reviews)
- [Commits REST](https://docs.github.com/en/rest/commits/commits)
- [Git commits REST](https://docs.github.com/en/rest/git/commits)
- [Permanent links](https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files)
- [Checking out PRs locally](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/checking-out-pull-requests-locally)
- [Restoring PR branches](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request)
- [PROV-O](https://www.w3.org/TR/prov-o/)
- [SLSA v1.0 provenance](https://slsa.dev/spec/v1.0/provenance)
- [CloudEvents spec](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md)
- [CDEvents spec](https://github.com/cdevents/spec/blob/main/spec.md)
- [CDEvents links](https://github.com/cdevents/spec/blob/main/links.md)
- [OpenTelemetry log data model](https://opentelemetry.io/docs/specs/otel/logs/data-model/)
- [OpenTelemetry CI/CD attributes](https://opentelemetry.io/docs/specs/semconv/registry/attributes/cicd/)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [AU-3 mirror (Tarleton)](https://www.tarleton.edu/security-controls-catalog/audit-and-accountability-au/au-3-content-of-audit-records/)
- [AU-8 mirror (UpGuard)](https://www.upguard.com/compliance/nist-sp-800-53/au/au-8.md)
- [Arkency correlation and causation](https://blog.arkency.com/correlation-id-and-causation-id-in-evented-systems/)
- [Axon message correlation](https://docs.axoniq.io/axon-framework-reference/5.0/messaging-concepts/message-correlation/)
- [SWHID docs](https://docs.softwareheritage.org/devel/swh-model/persistent-identifiers.html)
- [SWHID paper](https://arxiv.org/pdf/2004.00514)