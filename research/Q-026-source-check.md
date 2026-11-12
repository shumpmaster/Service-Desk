Verdict: FAIL

I filed nothing this round. The one entry still proposed can't be checked as written, because its text isn't in this folder.

**Findings**
- **Proposed entry missing.** `research/Q-026-memo.md` (lines 28–30, 38) says `F-linear-duplicate-status-01` is "unchanged from revision 6". Revision 6 isn't in this folder, and the memo never states the claim or its quotes. The only wording I have is the quotes listed in `research/Q-026-source-check.md` (lines 22–26). I won't write the claim myself, because the checker's job is to confirm what the memo claims. This is the reason for the FAIL.
- **Sources re-fetched raw today (2026-11-12).** Tags stripped, quotes checked in the text.
  - `linear.app/docs/issue-property`:
    - Lines 1052–1053 of the stripped text: issues marked as duplicates are moved into a reserved "Duplicate" status.
    - Lines 1108–1112 list Canceled and Duplicate as separate status types. Duplicate is "applied automatically when an issue is marked as a duplicate".
  - `linear.app/docs/triage` (lines 1156–1168) ties Canceled to the mark-as-duplicate action. This matches the earlier note that it says "a Canceled status type", though I only skimmed it this round.
  - `linear.app/changelog/2026-05-21-project-slack-channels`:
    - Line 546: "Duplicate issues now use a dedicated status type in Linear and move context to the original issue."
    - Line 550: every issue with a duplicate status must now link to the original issue.
    - Line 649: duplicates now appear in the canceled section of focus-grouped lists.
- **The blocker is gone.** `governance/standards/sources.md` now rules on the earlier open questions Q-e and Q-f.
  - A vendor changelog counts as one of its documentation pages.
  - Where a vendor's own pages disagree, the entry records what each page says, with its page and date, and does not say which is current. Such an entry is not load-bearing.
  - A fact found on only one vendor page may be filed marked "single page", also not load-bearing.
- **What this allows.** The Duplicate entry can be filed as a disagreement record: `issue-property` and the changelog say Duplicate is its own status type, and `triage` says Canceled. The memo's reading that the `triage` page is out of date is an inference, so it must stay out.
- **Memo is out of date.** Revision 7 was written before these rulings. It still says the Duplicate entry waits on the owner, and it withdrew `F-linear-category-rules-01` and `F-incidentio-severity-permission-01`. Both could now be filed marked "single page", but only if the Researcher re-proposes them. I can't file entries nobody proposed.
- **Already filed, not re-checked.** `F-linear-status-categories-01` and `F-incidentio-severity-ownership-01` are in `library/facts/`. I only read their entry files this round.

**Open questions**
1. Researcher: please revise the memo to state the Duplicate entry's claim and quotes, framed as a disagreement record under the new standard. Also say whether to re-propose the two withdrawn entries as "single page".
2. Linear `schema.graphql` (`WorkflowState.type`) is still not opened. The memo lists it as undone, and it's outside this brief.
3. The memo says the topics on controlled vocabularies, ITIL change categories and vocabulary drift are not covered. Nothing about them can be filed.