I've revised the Q-023 memo below. I re-opened every source the Source checker could not confirm, and also checked the personal-account audit log, which was an open question. Nothing is written to disk because I have no write tool; the Orchestrator should record the memo word for word.

---

# Memo — Q-023, revision 2: what an event record must hold for work to be rebuilt from records alone

Researcher · 2026-11-12 · depth 2 · topics: github, attribution, automation, change-reporting, status-reports, agents

**What this revision covers.** It changes only the items the source check (research/Q-023-source-check.md) did not confirm, plus any wording it corrected. Sections it confirmed and filed (`F-rec-*` and `P-rec-*`) are cited by their library ID and not repeated. I read every source today through a summarising fetch and asked for exact quotes. I have not checked any of my own facts.

**Grades** (same key as revision 1):
- **A**: two or more pages from the publisher or the standard itself.
- **B**: one such page.
- **C**: a secondary source only.

Per the checker, a standard that is one document gets B.

## Already filed, not changed
- F-rec-git-identity-01 (§1.1, §2.1, with the checker's wording: dates "can be given in" `<unix-timestamp> <time-zone-offset>`)
- F-rec-actions-actor-attempt-01 (§1.4)
- F-rec-deploy-review-01 (§1.6)
- F-rec-audit-content-01 (§1.7, §2.5; now B from the NIST OSCAL catalog, which the checker read)
- F-rec-prov-delegation-01 (§1.3, delegation part)
- F-rec-two-times-01 (§2.3)
- F-rec-rfc3339-unknown-offset-01 (§2.4, B)
- F-rec-event-identity-01 (§3.1, §3.2)
- F-rec-merge-methods-01 and F-rec-git-expiry-01 (§4.1)
- F-rec-actions-retention-02 (§5.1)
- F-rec-host-windows-01 (§5.2)
- P-rec-correlation-causation-01 (§3.3, §3.4)
- P-rec-self-contained-durable-01 (§5.5)

## Revised sections

**1.2 Fact (A). Co-author trailers.**
- A trailer is a `key: value` line at the end of the commit message (git-interpret-trailers, confirmed by the checker).
- GitHub says: "Add one `Co-authored-by: name <name@example.com>` line for each co-author".
- *Correction:* GitHub does not credit every co-author unconditionally. Its page says: "For the commit to count as a contribution, use an email address associated with their account on GitHub.com."
- Sources: git-scm.com/docs/git-interpret-trailers; docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors

**1.3a Fact (B). PROV-O keeps attribution and association apart.**
- "Attribution is the ascribing of an entity to an agent."
- "An activity association is an assignment of responsibility to an agent for an activity, indicating that the agent had a role in the activity."
- So attribution is about things produced and association is about activities. Delegation (already filed) is a third relation, between agents.
- Source: w3.org/TR/prov-o (one document)

**1.5 Fact (B), an absence. PR reviews document no app field.**
- The documented review object for "Get a review for a pull request" lists `id`, `node_id`, `user`, `body`, `state`, `is_copilot_code_review`, `copilot_code_review_effort`, `html_url`, `pull_request_url`, `_links`, `submitted_at`, `commit_id`, `body_html`, `body_text` and `author_association`.
- When asked, the fetch said `performed_via_github_app` does not appear on the page.
- This shows the field is not *documented*. It does not prove the API never returns it.
- Source: docs.github.com/en/rest/pulls/reviews

**2.2 Revised: Fact (B), and the open part stays open.**
- *Check runs:* times are "ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ" (unchanged from revision 1).
- *Git commits API:* the date text reads "This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ." Yet the request example is `"2008-07-09T16:13:30+12:00"`. The example is an *input*, so it shows only that an offset can be supplied.
- *Commits REST API:* gives author and committer dates only as `string, format: date-time`, with no example value and no statement about time zones.
- Not established: whether reads keep the author's original offset.
- *Withdrawn:* the audit-log "milliseconds since the epoch" claim. I did not re-open it.
- Sources: docs.github.com/en/rest/checks/runs; docs.github.com/en/rest/git/commits; docs.github.com/en/rest/commits/commits

**3.2 Correction. `chainId` is not described as "optional".**
- The links spec says: "The `chainId` is an ID that will be generated when a new CDEvent chain is wanted or if no CDEvent chain is present", and "This ID will follow the UUID format."
- Whether it is required is not stated in what I read, so I removed "optional".
- Link fields as fetched: `chainId`, `linkType` (START, END, PATH, RELATION), `timestamp` ("omitted when embedded in CDEvent context") and `tags`. Each type adds its own fields: START has `start`; END has `from` and `end`; PATH has `from` and `to`; RELATION has `linkKind`, `source` and `target`.
- Source: github.com/cdevents/spec/blob/main/links.md

**4.3 Revised.**
- *Fact (A), already filed in F-rec-merge-methods-01:* squash merges combine commits into one, and rebase merges replace the committer and the SHAs.
- *Downgraded to estimate:* "individual authors survive only as `Co-authored-by` trailers". GitHub's co-author page says nothing about squash merges, and I found no source for it.

**4.4 Revised: Fact (B) plus an estimate.**
- *Facts:*
  - `git notes` works "without touching the objects themselves", and "By default, notes are saved to and read from `refs/notes/commits`" (git-notes).
  - The usual fetch refspec set by clone is `+refs/heads/*:refs/remotes/origin/*`, plus "any tag that points into the histories being fetched" (git-fetch).
  - With `push.default=simple`, git push will "push the current branch with the same name on the remote" (git-push).
  - Copying notes during rewrites "Does not have a default value; you must configure this variable" (git-notes, `notes.rewriteRef`).
- *Estimate (my inference, not stated by any page):* because notes live under `refs/notes/`, which neither default covers, they do not reach or leave the host unless a refspec names them. None of the three pages says this outright.
- Sources: git-scm.com/docs/git-notes; git-scm.com/docs/git-fetch; git-scm.com/docs/git-push

**5.1 Addition (A). The pre-announcements confirm the change and add two points.**
- The 2026-07-17 and 2026-08-27 changelogs both say checks, workflow runs and statuses were "retained for 400+ days regardless of your retention configuration", and that from October 1, 2026 they follow the Actions retention setting, "a default of 90 days", with a public-repository maximum of 90 days.
- Both add that the change "applies to checks and statuses created by Actions as well as third-party applications".
- 2026-08-27 also says: "Export or archive anything you need to keep beyond your configured retention period."
- Sources: github.blog/changelog/2026-07-17-actions-retention-will-cover-checks-workflow-runs-and-statuses/; github.blog/changelog/2026-08-27-actions-retention-will-cover-checks-workflow-runs-and-statuses

**5.2a Fact (B). Personal accounts have a security log of 90 days.**
- "The security log lists all actions performed within the last 90 days."
- It covers "actions you've performed and actions others have performed that involve you".
- Its `repo` category "Contains all activities related to the repositories you own."
- Not stated in what I read: who else can view it, and whether it can be exported or read through an API.
- Source: docs.github.com/en/authentication/keeping-your-account-and-data-secure/reviewing-your-security-log

**5.3 Revised: Fact (B) for each item.**
- *Permalinks:* a link with a commit ID in place of `main` means "the file content will not change". By contrast, "The version of a file at the head of branch can change as new commits are made." *Correction:* the words "permanently link" are not on the page, so I withdrew them.
- *PR refs:* "The remote `refs/pull/` namespace is *read-only*." Heads can be fetched with `git fetch origin pull/ID/head:BRANCH_NAME`.
- *Restoring branches:* "You can restore the head branch of a closed pull request … click **Restore branch**."
- Sources: docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files; …/checking-out-pull-requests-locally; …/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request

**5.4 Revised: Fact (B). SWHID, now from the specification itself.** The docs.softwareheritage.org page and the arXiv paper are dropped.
- *Syntax:* "A core identifier is composed of four fields, each separated by a colon": `swh`, version `1`, an object type and a hex hash.
- *Object types:* `cnt`, `dir`, `rev`, `rel`, `snp`.
- *Git compatibility:* "SWHIDs for contents, directories, revisions, and releases are compatible with the way the current version of Git proceeds for computing identifiers for its objects". However: "Git compatibility is practical, but incidental and is not guaranteed to be maintained in future versions of this specification, nor across different versions of Git."
- *Qualifiers:* `origin`, `visit`, `anchor`, `path`, `lines` and `bytes`, written as `key=value` pairs separated by `;`.
- *Correction to revision 1:* turning a git SHA into a `swh:1:rev:` ID works today, but the spec does not promise it will keep working.
- Sources: swhid.org/specification/v1.2/5.Core_identifiers/; swhid.org/specification/v1.2/6.Qualified_identifiers/

## Proposed library entries (new or amended)

```yaml
---
id: F-rec-coauthor-trailer-01
form: fact
claim: "Git trailers are 'key: value' lines at the end of a commit message. GitHub asks for one 'Co-authored-by: name <name@example.com>' line per co-author; 'For the commit to count as a contribution, use an email address associated with their account on GitHub.com.'"
grade: A
topics: [github, attribution]
shelf_life: 24 months
sources:
  - https://git-scm.com/docs/git-interpret-trailers
  - https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors
---
---
id: F-rec-prov-attribution-association-01
form: fact
claim: "W3C PROV-O: 'Attribution is the ascribing of an entity to an agent' (wasAttributedTo); 'An activity association is an assignment of responsibility to an agent for an activity, indicating that the agent had a role in the activity' (wasAssociatedWith). Distinct from Delegation (F-rec-prov-delegation-01)."
grade: B
topics: [attribution, agents]
shelf_life: 120 months
sources:
  - https://www.w3.org/TR/prov-o/
note: standard; single document.
---
---
id: F-rec-git-default-refs-01
form: fact
claim: "By default git notes live in refs/notes/commits; clone's usual fetch refspec is +refs/heads/*:refs/remotes/origin/* plus tags pointing into fetched history; push.default=simple pushes the current branch only; notes.rewriteRef has no default."
grade: B
topics: [github, change-reporting]
shelf_life: 36 months
sources:
  - https://git-scm.com/docs/git-notes
  - https://git-scm.com/docs/git-fetch
  - https://git-scm.com/docs/git-push
note: "One page per claim. That notes therefore are not pushed or fetched by default is the researcher's inference; no page states it."
---
---
id: F-rec-actions-retention-notice-01
form: fact
claim: "GitHub's 2026-07-17 and 2026-08-27 notices: from 2026-10-01 the Actions retention setting covers checks and statuses 'created by Actions as well as third-party applications'; previously kept 400+ days; public-repo maximum 90 days; GitHub advises 'Export or archive anything you need to keep beyond your configured retention period.'"
grade: A
topics: [github, automation, status-reports]
shelf_life: 6 months
sources:
  - https://github.blog/changelog/2026-07-17-actions-retention-will-cover-checks-workflow-runs-and-statuses/
  - https://github.blog/changelog/2026-08-27-actions-retention-will-cover-checks-workflow-runs-and-statuses
note: amends F-rec-actions-retention-02 (third-party checks also expire).
---
---
id: F-rec-personal-security-log-01
form: fact
claim: "A GitHub personal account's security log 'lists all actions performed within the last 90 days', including actions by others that involve the account; its repo category 'Contains all activities related to the repositories you own.'"
grade: B
topics: [github, attribution]
shelf_life: 12 months
sources:
  - https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/reviewing-your-security-log
note: viewers other than the account holder, export and API access not established.
---
---
id: F-rec-host-refs-01
form: fact
claim: "GitHub: a file link using a commit ID instead of a branch means 'the file content will not change', while a branch head 'can change as new commits are made'; the refs/pull/ namespace is read-only and fetchable as pull/ID/head; 'You can restore the head branch of a closed pull request' via Restore branch."
grade: B
topics: [github, change-reporting]
shelf_life: 24 months
sources:
  - https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files
  - https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/checking-out-pull-requests-locally
  - https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request
note: one page per claim.
---
---
id: F-rec-swhid-01
form: fact
claim: "SWHID v1.2: core identifier swh:1:<type>:<hash> with types cnt, dir, rev, rel, snp; qualifiers origin, visit, anchor, path, lines, bytes as ;key=value. Compatible today with git object IDs for cnt/dir/rev/rel, but 'Git compatibility is practical, but incidental and is not guaranteed'."
grade: B
topics: [change-reporting, status-reports]
shelf_life: 60 months
sources:
  - https://www.swhid.org/specification/v1.2/5.Core_identifiers/
  - https://www.swhid.org/specification/v1.2/6.Qualified_identifiers/
note: one specification.
---
---
id: F-rec-pr-review-fields-01
form: fact
claim: "GitHub's documented PR review object lists id, node_id, user, body, state, is_copilot_code_review, copilot_code_review_effort, html_url, pull_request_url, _links, submitted_at, commit_id, body_html, body_text, author_association; performed_via_github_app is not documented for reviews."
grade: B
topics: [github, attribution, agents]
shelf_life: 12 months
sources:
  - https://docs.github.com/en/rest/pulls/reviews
note: absence in documentation, seen through a summary; not proof the API never returns it.
---
```

## Gaps still open
- Whether GitHub's REST commit reads keep the author's original UTC offset (§2.2).
- Whether app-performed reviews, merges and deployment approvals record the app (§1.5 shows only the documented review schema).
- Whether the personal security log can be seen by others, exported or read through an API.
- Whether git keeps `Co-authored-by` lines when GitHub squash-merges (§4.3).
- Whether git notes are not pushed by default: no source states it directly (§4.4).
- Whether `chainId` is required or optional (§3.2).
- What happens to `refs/pull/*` when a repository is deleted or transferred.

---

## Six-part contract

**1. What changed**
- **Re-sourced and confirmed:** §1.2 co-author trailers, §1.3a attribution versus association, §5.1 the two pre-announcement changelogs, §5.3 permalinks, `refs/pull` and Restore branch, and §5.4 SWHID. SWHID now cites swhid.org spec v1.2 instead of the blocked docs page and the search extracts.
- **New:** §5.2a, the personal-account security log.
- **Corrected:**
  - GitHub credits a co-author only if the email is linked to a GitHub account.
  - "Permanently link" is removed.
  - "Optional `chainId`" is removed.
  - SWHID compatibility with git is "not guaranteed".
- **Downgraded:**
  - Notes not being pushed or fetched by default is now an estimate.
  - Squash merges keeping co-authors as trailers is now an estimate.
- **Withdrawn:** the audit-log milliseconds-since-epoch claim.
- **New library entries proposed:** 8.

**2. Why.** The source check listed these claims as not confirmed. Each one now either quotes a page I opened today or is marked as an estimate or a gap.

**3. What I checked.** I ran no commands; I have no shell. I did 18 page fetches and 1 search, all asking for exact quotes:
- git-notes, git-fetch and git-push
- GitHub's co-author, restore-branch, permalink and checkout-PR pages
- GitHub's PR reviews, commits REST and git commits REST pages
- the personal security log page (3 fetches for exact wording)
- the 2026-07-17 and 2026-08-27 changelogs
- swhid.org spec v1.2: the table of contents (empty in the fetch), and clauses 5 and 6
- CDEvents links.md and PROV-O

**4. What is undone.** Everything under "Gaps still open". I also did not re-open the audit-log export format or the arXiv SWHID paper.

**5. Needed outside my lane.**
- The Source checker should re-check the revised items and the 8 new entries.
- The Source checker should decide whether F-rec-actions-retention-02 needs the amendment about third-party checks.
- The Orchestrator should record this revision.

**6. Open questions.** I am raising these as neutral research questions and have closed none:
- Do GitHub's REST commit endpoints return the author's original UTC offset or a time converted to UTC?
- Which objects a GitHub App creates (reviews, merges, deployment approvals) record that app?
- Who can read a personal account's security log, and can it be exported or read through an API?
- On the standards-only grades, I followed the checker and graded one-document standards B. Whether that becomes the rule is for the owner or Chief of Staff to decide.

Nothing here needs a level-5 expert or a paid source.

Sources:
- [git-notes](https://git-scm.com/docs/git-notes)
- [git-fetch](https://git-scm.com/docs/git-fetch)
- [git-push](https://git-scm.com/docs/git-push)
- [git-interpret-trailers](https://git-scm.com/docs/git-interpret-trailers)
- [GitHub co-authored commits](https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors)
- [Restoring PR branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request)
- [Permanent links](https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files)
- [Checking out PRs locally](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/checking-out-pull-requests-locally)
- [PR reviews REST](https://docs.github.com/en/rest/pulls/reviews)
- [Commits REST](https://docs.github.com/en/rest/commits/commits)
- [Git commits REST](https://docs.github.com/en/rest/git/commits)
- [Personal security log](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/reviewing-your-security-log)
- [Changelog 2026-07-17](https://github.blog/changelog/2026-07-17-actions-retention-will-cover-checks-workflow-runs-and-statuses/)
- [Changelog 2026-08-27](https://github.blog/changelog/2026-08-27-actions-retention-will-cover-checks-workflow-runs-and-statuses)
- [SWHID v1.2 core identifiers](https://www.swhid.org/specification/v1.2/5.Core_identifiers/)
- [SWHID v1.2 qualified identifiers](https://www.swhid.org/specification/v1.2/6.Qualified_identifiers/)
- [CDEvents links](https://github.com/cdevents/spec/blob/main/links.md)
- [PROV-O](https://www.w3.org/TR/prov-o/)