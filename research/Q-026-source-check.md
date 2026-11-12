Verdict: PASS

I opened all four cited pages raw today (2026-11-12), with scripts and tags stripped. Every quote in the three proposed entries is in the page text, and all three entries are now filed. The Duplicate entry's claim is the page-by-page disagreement, and the entry does not say which page is current.

**Findings** (line numbers are in the stripped text of each page)
- **`F-linear-duplicate-status-01`: confirmed. It is filed as a disagreement record, not load-bearing, under `governance/standards/sources.md`.**
  - `linear.app/docs/issue-property`:
    - Line 93: "Issues marked as duplicates are automatically moved into a reserved Duplicate status."
    - Lines 118–119 list Canceled and Duplicate as separate types: "Duplicate (applied automatically when an issue is marked as a duplicate)".
    - The memo's "automatically moved" wording was right. The earlier checker note had dropped "automatically", and I filed the raw wording.
  - Changelog `2026-05-21-project-slack-channels`:
    - Line 15 is the date, May 21, 2026.
    - Line 45: "Duplicate issues now use a dedicated status type in Linear and move context to the original issue."
    - Line 47: every issue with a duplicate status must now link to the original issue.
    - Line 76: duplicates now appear in the canceled section of focus-grouped lists "instead of active buckets".
  - `linear.app/docs/triage`, lines 125–126: "Once selected, the new issue is updated to a Canceled status type."
  - Pages (a) and (c) disagree: Duplicate is its own status type on one page and Canceled on the other.
  - I left out the memo's inference that the `triage` page is out of date. I also left out "system-managed, cannot be renamed", which I did not look for in the raw text.
- **`F-linear-category-rules-01`: confirmed, filed marked "single page", not load-bearing.** `issue-property` line 105 says teams can reorder statuses within a category but the categories stay in a fixed order. Line 104 says statuses can be removed as long as at least one exists in each category.
- **`F-incidentio-severity-permission-01`: confirmed, filed marked "single page", not load-bearing.** On `docs.incident.io/incidents/severities`, the page says managing severities requires the "Manage organization settings" permission. Line 165 says "Rename them, rewrite their descriptions, or add your own…".
- **Entry format.** The three files are in `library/facts/` with checked-on date, shelf life, grade, topics and `opened_by`. Shelf lives are 6, 12 and 18 months, as the memo proposed.
- **Not re-checked.** `F-linear-status-categories-01` and `F-incidentio-severity-ownership-01` were already filed in an earlier round. I only read their entry files.

**Open questions**
1. The memo's Q-h asks whether disagreement records should default to a shorter shelf life. I kept the proposed 6 months, but the standard does not say. That needs an owner ruling.
2. The pages `issue-property` and `triage` carry no date. The disagreement entry records them as undated, so later readers cannot tell which is newer. Re-check it when the entry's shelf life ends.
3. Linear's `schema.graphql` (`WorkflowState.type`) is still not opened. The memo's topics on controlled vocabularies, ITIL change categories and vocabulary drift are still uncovered. Nothing about them can be filed.