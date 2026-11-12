Checked the pages against the source check. Now writing revision 8.

# Research memo (revision 8): Q-026, Event vocabularies: closed sets, open labels, free text, or none (2026-11-12)

*Researcher, depth 2. This revision answers `research/Q-026-source-check.md` (round 8: FAIL, nothing filed, because the Duplicate entry's text was not in the folder). Research is blind. I read every page this round through a summarising fetch, not as raw text. The checker's raw readings are cited where they exist.*

**Grade key:** as in revision 4. Each statement is marked **[F]** fact, **[E]** estimate or **[O]** opinion.

**Unchanged:** everything else in revision 6. Nine entries are already filed and are not proposed again, including `F-linear-status-categories-01` and `F-incidentio-severity-ownership-01`.

**Standard applied:** `governance/standards/sources.md` is not in my pack. I am working from the checker's summary of its rulings on Q-e and Q-f:
- A vendor changelog counts as one of its documentation pages.
- Where a vendor's own pages disagree, the entry records each page with its date and does not say which one is current. Such an entry is not load-bearing.
- A fact found on only one vendor page may be filed marked "single page". It is also not load-bearing.

## What changed

### 1. `F-linear-duplicate-status-01` is now written out in full as a disagreement record
- Earlier revisions said "unchanged from revision 6" and never restated the entry. That was the reason for the FAIL. The full text is now below.
- The revision 6 reading that the `triage` page is out of date has been **removed from the entry**. It stays here only as **[O]**: the changelog says this behaviour is new as of 2026-05-21, so the `triage` page may come from before that change. I did not check this, and the entry does not depend on it.

### 2. Re-proposed with the "single page" mark: `F-linear-category-rules-01` and `F-incidentio-severity-permission-01`
- Revision 7 withdrew both because no second vendor page could be found. The new standard allows single-page facts with the mark, so I am proposing them again. Neither is load-bearing for Q-026.

## Proposed library entries (revision 8)

```
---
id: F-linear-duplicate-status-01
form: fact
standing: disagreement record (vendor's own pages disagree), not load-bearing
claim: "Linear's own pages disagree on the status type a duplicate issue receives.
  (a) linear.app/docs/issue-property (undated; read 2026-11-12): issues marked as
  duplicates are moved into a reserved 'Duplicate' status, listed as a status type
  separate from Canceled.
  (b) linear.app/changelog/2026-05-21-project-slack-channels (dated 2026-05-21):
  'Duplicate issues now use a dedicated status type in Linear'; 'every issue with a
  duplicate status must now link to the original issue'; duplicate issues 'appear in
  the canceled section in focus-grouped issue lists'.
  (c) linear.app/docs/triage (undated; read 2026-11-12): after marking a triage issue
  as a duplicate and choosing the issue to merge into, 'the new issue is updated to a
  Canceled status type'.
  This entry does not say which page is current."
grade: A (each statement is the vendor's own page; the disagreement itself is the fact)
topics: [status-reports, dashboards, change-reporting]
shelf_life: 6 months
sources:
  - https://linear.app/docs/issue-property   # "Issues marked as duplicates are automatically moved into a reserved Duplicate status." (checker raw: stripped-text lines 1052–1053; Canceled/Duplicate as separate types, lines 1108–1112)
  - https://linear.app/changelog/2026-05-21-project-slack-channels   # "Duplicate issues now use a dedicated status type in Linear and move context to the original issue." (checker raw line 546); "every issue with a duplicate status must now link to the original issue" (line 550); "Duplicate issues now appear in the canceled section in focus-grouped issue lists instead of active buckets" (line 649)
  - https://linear.app/docs/triage   # "Once selected, the new issue is updated to a Canceled status type." (checker raw: lines 1156–1168)
---
```

Note for the checker on (a): my summarising fetch returned the wording "automatically moved". Your raw note has "moved" and a separate phrase, "applied automatically when an issue is marked as a duplicate". Please file whichever wording the raw text actually carries. My fetch also returned "this is a system-managed status that cannot be renamed or customized". That line is **not** part of the claim, because no one has read it raw.

```
---
id: F-linear-category-rules-01
form: fact
standing: single page, not load-bearing
claim: "Linear: teams can reorder statuses within each status category, but the
  categories stay in a fixed order; statuses can be removed as long as at least one
  status exists in each category."
grade: A
topics: [status-reports, dashboards]
shelf_life: 12 months
sources:
  - https://linear.app/docs/issue-property   # "Teams can reorder statuses within each status category, but the categories themselves stay in a fixed order."; "remove statuses (as long as at least one status exists in each category)"
---
```

```
---
id: F-incidentio-severity-permission-01
form: fact
standing: single page, not load-bearing
claim: "incident.io: managing severities requires the 'Manage organization settings'
  permission; organisations can rename severities, rewrite their descriptions, or add
  their own."
grade: A
topics: [monitoring, status-reports]
shelf_life: 18 months
sources:
  - https://docs.incident.io/incidents/severities   # "Managing severities requires the Manage organization settings permission."; "Rename them, rewrite their descriptions, or add your own to match how your team thinks about impact."
---
```

**[O]** None of the three changes the answer to Q-026. They add detail to §D (who owns the vocabulary):
- In Linear, the vendor owns the categories and some system statuses, and the customer names statuses within those categories.
- In incident.io, holders of an admin-level permission own the severity set.

## Field scan (this round)
- Four summarising fetches: `issue-property`, `triage`, the 2026-05-21 changelog, and incident.io `severities`. Every quote above came back in these fetches.
- **Still not covered:** the literature on controlled vocabularies and records management, ITIL change categories, and evidence on how vocabulary drift turns out in practice.

## Six-part contract
1. **What I changed**
   - Wrote out the full text of `F-linear-duplicate-status-01` as a disagreement record. Each page is listed with its date, and the entry does not say which is current.
   - Removed the "triage page is out of date" inference from that entry.
   - Re-proposed `F-linear-category-rules-01` and `F-incidentio-severity-permission-01`, marked "single page".
2. **Why**
   - The checker could not check an entry whose text was missing (round 8 FAIL).
   - The new standard in `sources.md` now allows disagreement records and single-page facts.
   - The checker's open question 1 asked for both changes.
3. **What I verified:** I have no shell, so I ran no commands.
   - I ran four WebFetch calls (summarising, not raw) on 2026-11-12.
   - Every quoted sentence came back as stated, except the "automatically" wording difference flagged above.
   - The changelog page date came back as May 21, 2026.
4. **What is undone**
   - `WorkflowState.type` in Linear's `schema.graphql`.
   - The literature on controlled vocabularies, ITIL change categories, and vocabulary drift.
   - I have not read `governance/standards/sources.md` myself, because it is not in my pack.
5. **What is needed outside my lane**
   - **Source checker:** read the three entries raw. Confirm the exact wording of the issue-property quote. Check that my `standing:` field matches the mark the standard uses.
   - **Orchestrator:** add `governance/standards/sources.md` to the researcher pack for Q-026, so the marks can be applied exactly.
6. **Open questions**
   - Q-a to Q-d stand.
   - Q-e and Q-f are answered by the standard.
   - Q-g (single-page facts on hold) is now answered by the "single page" mark.
   - New, Q-h: should a disagreement record carry a shorter shelf life by default (I used 6 months), since one of the pages is likely to change?

Sources:
- [Linear issue properties](https://linear.app/docs/issue-property)
- [Linear triage](https://linear.app/docs/triage)
- [Linear changelog 2026-05-21](https://linear.app/changelog/2026-05-21-project-slack-channels)
- [incident.io severities](https://docs.incident.io/incidents/severities)