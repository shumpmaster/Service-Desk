Verdict: FAIL

The memo is not clean: several of its claims could not be confirmed. Twelve fact entries and two pattern entries did pass, and I filed them in `library/facts/` and `library/patterns/`, all with IDs starting `F-rec-` or `P-rec-`. I opened the sources through a summarising fetch, so quotes are as that fetch returned them. The one exception is the NIST controls AU-3 and AU-8, which I read in NIST's own OSCAL catalog. This folder is not a git repository, so I made no commit.

**Confirmed** (memo section → filed entry)
- **§1.1, §2.1 → `F-rec-git-identity-01` (A).** `git-commit-tree` gives the author and committer fields and the `<unix-timestamp> <time-zone-offset>` format. Pro Git gives the author/committer sentence word for word. I reworded the claim so it says "can be given in" that format, because the page doesn't say it is how git stores dates.
- **§1.4 → `F-rec-actions-actor-attempt-01` (A).** The Actions contexts page matches word for word on `actor`, `triggering_actor`, `run_id`, `run_attempt` and `run_number`. The workflow-runs page lists the same fields.
- **§5.1 → `F-rec-actions-retention-02` (A).** The org retention page gives the 90-day default, the 1–90 and 1–400 day ranges, "400+ days" before, and that changes aren't retroactive. The changelog gives 2026-10-01, a public maximum of 90 days, and "won't restore data".
- **§5.2 → `F-rec-host-windows-01` (B).** The audit log page says 180 days and owners only. The Events API page says 30 days, 300 events, and 30 s to 6 h of latency. Each claim rests on one page.
- **§4.1 → `F-rec-merge-methods-01` (A).** The merge-methods page, `git-push` and `git-log --first-parent` all match. The memo's step that a pushed merge commit carries its second-parent history is the memo's reading of the push sentence, and I flagged that in the entry's note.
- **§4.1 → `F-rec-git-expiry-01` (B).** `git-gc` gives `gc.pruneExpire` as 2 weeks, `gc.reflogExpire` as 90 days and `gc.reflogExpireUnreachable` as 30 days.
- **§1.3 → `F-rec-prov-delegation-01` (B).** The PROV-O Delegation definition, `hadRole`, `hadPlan` and `xsd:dateTime` all match. I graded it B, not the memo's A, because it rests on one document and the memo's own grade key asks for two pages. I left out the claim that attribution and association are separate relations, because I did not read that part.
- **§2.3 → `F-rec-two-times-01` (A).** OpenTelemetry (`Timestamp` and `ObservedTimestamp`), OWASP, CDEvents and CloudEvents all match.
- **§2.4 → `F-rec-rfc3339-unknown-offset-01` (B).** The "local time minus UTC" and `-00:00` text matches. I graded it B because it is a single document, and I did not check the memo's §4.2–4.3 section numbers.
- **§3.1, §3.2 → `F-rec-event-identity-01` (A).** The CloudEvents and CDEvents specs and the CDEvents links spec match, including the five required CDEvents fields, `chainId` as a UUID and the four link types. I dropped the memo's "optional chainId" because I could not confirm it.
- **§1.7, §2.5 → `F-rec-audit-content-01` (B, up from the memo's C).** NIST's OSCAL catalog gives the six AU-3 items and the AU-8 timestamp wording. The Tarleton and UpGuard mirrors agree.
- **§1.6 → `F-rec-deploy-review-01` (B).** The workflow-runs page shows the review-history schema: `state` (approved, rejected, pending), `comment`, `environments` and `user`.
- **§3.3, §3.4 → `P-rec-correlation-causation-01` (B).** The Arkency quote from Greg Young matches. The Axon definitions match. The W3C `trace-id` and `parent-id` text matches. I recorded that the "same shape" link to trace context and CDEvents is my reading, not stated by those specs.
- **§5.5 → `P-rec-self-contained-durable-01` (B).** This is the memo's opinion, resting on confirmed facts. SLSA `invocationId`, check-run `external_id` and `details_url`, and the permalink page all match, except that GitHub's permalink page says "the file content will not change". The memo's "permanent while reachable" and its "will permanently link" quote are not in the fetched text, so I left them out.

**Not confirmed, so kept out of the library**
- **§5.4, Software Heritage identifiers (SWHID):** `docs.softwareheritage.org` returned an Anubis "Access Denied" page. The memo's claim rests on search extracts only.
- **§4.4, git notes not pushed or fetched by default:** the fetch result inferred this and quoted no passage. `git-notes` does confirm "without touching the objects themselves" and `refs/notes/commits`.
- **§5.3, "Restore branch":** I did not open that page.
- **§1.2, `Co-authored-by`:** I did not open the GitHub co-author page. `git-interpret-trailers` does confirm the trailer format.
- **Changelogs of 2026-07-17 and 2026-08-27:** not opened.
- **§1.5, no `performed_via_github_app` on PR reviews:** the reviews page does not list it, but that is an absence seen through a summary, and the memo marks it unconfirmed too.
- **§2.2, REST time zone behaviour:** the Git commits API shows an example with a `+12:00` offset, but its text says "…SSZ". Whether reads keep the original offset is still open.
- **§4.2, §4.6 and the §3.7 and §1.8 syntheses:** these are estimates or opinions, not source-checkable facts.

**Open questions**
- Do GitHub's REST commit reads keep the author's original UTC offset?
- Which GitHub App actions (reviews, merges, approvals) record the app?
- What audit log exists for personal-account repositories?
- The standards-only grades (A needs two pages): should one-document standards such as PROV-O and RFC 3339 count as A? I graded them B.