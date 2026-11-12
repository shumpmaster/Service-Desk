Verdict: FAIL

I filed one entry and held back three. I fetched every cited page as raw HTML and stripped the tags, then compared each quote with the memo. Nothing was committed, because this directory is not a git repository. Under the brief, an unverifiable claim makes the round FAIL, and the three held entries each contain such a claim.

## Filed
**`library/facts/F-incidentio-severity-ownership-01.md`** (grade A, 18 months, checked 2026-11-12). Every quote was confirmed in the raw text:
- **`docs.incident.io/incidents/severities`:** "hide severities that don't apply, and restrict who's allowed to set a particular severity".
- **`docs.incident.io/incidents/incident-types`:** "severities are shared across incident types and their order will remain consistent", "hidden the Minor severity", "restrict which users are allowed to select a particular severity for a given incident type", "Who can set this severity?" and "only available on our Pro or Enterprise plan".
  - Last round's raw read reported that this page lacks the hide and restrict wording. The page as served today has it. Either it changed or last round's read missed it.
- **`incident.io/changelog/incident-role-restrictions`:** dated April 8, 2026. It says "enabled per incident type, not in the general severity configuration, and is available for our Pro and Enterprise customers".
- **`docs.incident.io/api-reference/severities-v1`:** "picked from one of the severities configured in your organisations settings".

That is four different pages of the vendor's own site, which meets the two-page rule for vendor behaviour. The entry is labelled same publisher.

## Not filed
- **`F-linear-status-categories-01`: not confirmed as written.**
  - Two pages confirm "a group of ordered issue statuses defined per-team" and the default workflow ("further customize in Team Settings"). Those are `conceptual-model` and `issue-property`.
  - Two pages confirm that triage is "outside the normal workflow". The `triage` page says it directly, and `issue-property` calls triage "an additional status category".
  - "Teams can reorder statuses within each status category" appears only on `issue-property`. The `conceptual-model` page does not say it.
  - "An additional status category" appears only on `issue-property`. The `triage` page does not use that wording.
  - The 2026-05-21 changelog confirms "Duplicate issues now use a dedicated status type" and "every issue with a duplicate status must now link to the original issue".
  - `triage` still says duplicates go to "a Canceled status type", twice. The memo's reading that this is older wording is an inference, not something Linear says.
  - Whether a changelog counts as a second page is the memo's open question Q-f, and no ruling covers it. The standard says "two different pages of that vendor's documentation".
  - The entry needs narrowing to the supported parts, or the rulings on Q-e and Q-f.
- **`F-linear-category-rules-01`: held.** Both quotes ("the categories themselves stay in a fixed order", "as long as at least one status exists in each category") are on `issue-property` only. The 2024-03-19 changelog ("under the categories: Backlog, Planned, Started, Completed, and Canceled") is about project statuses, not issues, so it is not a second source.
- **`F-incidentio-severity-permission-01`: held.** "Managing severities requires the Manage organization settings permission" and "Rename them, rewrite their descriptions, or add your own" are confirmed on `severities` only, as the memo itself says.

## Not re-read
- **Linear changelog `2024-03-19`:** read only for the quote above.
- **Other pages:** `user-permissions`, `api-keys`, the 2023-03-14 changelog and the 404 `configuring-workflows` page. These are negative-result pages used only to explain why a second page was not found, so I did not rely on them.
- **Linear schema:** the memo's request for `WorkflowState` in the full `schema.graphql` is not done. I did not open it.

## Open questions
1. **Owner (Q-f):** does a vendor changelog count as a second page under the two-page rule?
2. **Owner (Q-e):** when a vendor's pages disagree, may the library file the dated newer reading and note the older one?
3. **Researcher:** can you supply a second Linear page for fixed category order, the one-status-per-category minimum and reordering within categories? Alternatively, can you supply one for the incident.io permission rule? Or should those be dropped?
4. **Researcher:** should `F-linear-status-categories-01` be re-proposed without the reorder and "additional status category" wording? Without them, `conceptual-model` and `triage` support the rest.