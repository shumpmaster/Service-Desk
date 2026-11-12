Verdict: FAIL

One entry now passes and is filed. Two entries are still held, and one is still pending a ruling, so this round fails on the brief's rule that an unverifiable claim is a FAIL. I fetched every page as raw HTML and stripped the tags. Nothing was committed, because this directory is not a git repository.

## Filed
**`library/facts/F-linear-status-categories-01.md`** (grade A, 12 months, checked 2026-11-12). Four different vendor pages support it, labelled same publisher. Each quote was confirmed in the raw text:
- **`linear.app/docs/conceptual-model`:** "a group of ordered issue statuses defined per-team" and "a default workflow for you that you can further customize in Team Settings".
- **`linear.app/docs/issue-property`:**
  - "These workflows are team-specific and come with a default set and order: Backlog > Todo > In Progress > Done > Canceled".
  - The page lists the categories Backlog, Unstarted, Started, Completed and Canceled.
- **`linear.app/developers/graphql`:** "the issue will be assigned to the team's first state in the Backlog workflow state category" and "assigned to the Triage workflow state". The page uses curly quotes around "Triage".
- **`linear.app/docs/triage`:** "we exclude triage issues from all views since triage is considered to be outside the normal workflow".

The entry leaves out the reorder wording, the fixed category order, the one-status minimum and the Duplicate status.

## Held (not filed)
- **`F-linear-category-rules-01`:** both quotes are on `issue-property` only.
  - "Teams can reorder statuses within each status category, but the categories themselves stay in a fixed order".
  - "as long as at least one status exists in each category".
  - The memo found no second page. Under `governance/standards/sources.md`, which sets a two-page rule for vendor behaviour, it stays out.
- **`F-incidentio-severity-permission-01`:** this is on `severities` only, so it stays out.
- **`F-linear-duplicate-status-01`:** I now confirm three things raw.
  - `issue-property` says Duplicate is "a system-managed status that cannot be renamed or customized".
  - The `triage` page says "a Canceled status type" twice.
  - Last round confirmed the 2026-05-21 changelog quote.
  - The entry is still not filed, because it needs rulings on Q-e and Q-f, and none exists in `governance/standards/sources.md`. Q-e asks whether a dated newer reading may be filed against an older page. Q-f asks whether a changelog counts as a page. The memo's reading that the `triage` page is out of date is an inference.

## Not done
- **Linear `schema.graphql`:** I did not open `WorkflowState`. The memo asks for it in the full schema, outside my brief.
- **Earlier incident.io filing:** `F-incidentio-severity-ownership-01` was filed last round and I did not re-open its sources.

## Open questions
1. **Owner (Q-e, Q-f):** please rule on both. The Duplicate entry depends on them.
2. **Owner (Q-g):** may a single-page vendor fact sit in the library as a HOLD entry? Under the current standard, no.
3. **Researcher:** can you find a second page for the category rules and the incident.io permission? If not, drop them.