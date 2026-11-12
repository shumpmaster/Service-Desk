I've written revision 5 of the memo below. The check held back two entries because each rested on one vendor page. Both are now split: the parts that two vendor pages support are re-proposed, and the parts still on one page are proposed apart and marked hold. A dated Linear changelog entry also explains why Linear's pages disagree about duplicates. As before, every page was read through a summarising fetch, so the Source checker needs to re-read each quote as raw text.

---

# Research memo (revision 5): Q-026, Event vocabularies: closed sets, open labels, free text, or none (2026-11-12)

*Researcher, depth 2. This revision answers `research/Q-026-source-check.md` (round 5 of checking, verdict FAIL, two entries held). Research is blind. **Every page this round was read through a summarising fetch, not raw;** the quotes below are what the summariser returned.*

**Grade key:** as in revision 4. Each statement is marked **[F]** fact, **[E]** estimate or **[O]** opinion.

**Unchanged:** everything in revision 4 except the two held entries. The checker has filed seven entries: `F-otel-event-name-01`, `F-otel-event-name-static-01`, `F-cloudevents-type-owner-01`, `F-cloudevents-type-prefix-01`, `F-weaver-stability-values-01`, `F-category-count-limit-01` and `P-event-vocab-layered-01`. They are not proposed again.

## What changed in the findings

### 1. Linear: a second page for part of the claim
- **[F, A]** The Linear "Concepts" page, https://linear.app/docs/conceptual-model, says:
  - "As you work on and complete issues, they'll move through workflows; a group of ordered issue statuses defined per-team."
  - "We create a default workflow for you that you can further customize in Team Settings."
  - With `issue-property`, that makes two vendor pages for: statuses are ordered, set per team, and customisable.
- **[F, A]** Two vendor pages already agreed that triage is a category outside the normal workflow (`issue-property` and `triage`; the checker confirmed the triage half).
- **[F, A, one page only]** Two rules are still only on `issue-property`:
  - the fixed order of the categories ("the categories themselves stay in a fixed order")
  - the minimum of one status per category ("as long as at least one status exists in each category")
  - The Concepts page does not list the categories or say whether they are fixed. `configuring-workflows` still returns 404, including its `.md` form and the `?_rsc=` form that a search surfaced. I could not read Linear's GraphQL schema: the raw `schema.graphql` was cut off before `WorkflowState`, and Apollo Studio returned only a title. Third-party pages (SDK mirrors, CLI source, blogs) repeat the category list, but they are not vendor pages and I do not cite them.
- **[F, A] Supporting, not a second page for the issue rule:** the Linear changelog of 2024-03-19 (https://linear.app/changelog/2024-03-19-custom-statuses-for-projects) says, for **project** statuses: "Go to workspace settings > projects to create or modify statuses under the categories: *Backlog, Planned, Started, Completed,* and *Canceled.*" Linear uses the same design (a fixed set of categories, with statuses the customer names inside them) for a second object. This page is about projects, not issues.
- **[F, A] The duplicate disagreement now has a date.** The Linear changelog entry of 2026-05-21, "Issue duplicates" (https://linear.app/changelog/2026-05-21-project-slack-channels), says: "Duplicate issues now use a dedicated status type in Linear and move context to the original issue." It also says "every issue with a duplicate status must now link to the original issue."
- **[E]** The triage page's "updated to a *Canceled* status type" is probably text from before 2026-05-21 that was not updated. The `issue-property` wording ("a system-managed status that cannot be renamed or customized") matches the changelog. This is my inference from dates. Linear has not said the triage page is out of date.
  - It turns the closed-set growth in §B into a **[F, A]** fact with a date: Linear added a status type on 2026-05-21.
  - It also bears on the owner's Q-e. A changelog entry with a date may let the library file the newer reading and note the older one, rather than choose between them.

### 2. incident.io: second pages for most of the claim, not the permission rule
- **[F, A]** The incident-types page, https://docs.incident.io/incidents/incident-types (fetched as `.md`), returned:
  - "severities are shared across incident types and their order will remain consistent."
  - "we've hidden the Minor severity by clicking the toggle visibility button to the right of the severity panel."
  - "You can restrict which users are allowed to select a particular severity for a given incident type" and "use the **Who can set this severity?** section to build your restriction."
  - "Incident types are only available on our Pro or Enterprise plan."
  - **The checker reported that this page covers only customised descriptions and shared order.** My summariser returned the hide and restrict sentences above. The checker should re-read the page raw, in case it has changed or my summariser is wrong.
- **[F, A]** The incident.io changelog "Incident role restrictions", dated 2026-04-08 (https://incident.io/changelog/incident-role-restrictions), says:
  - "we've released the ability to restrict who can set particular incident severities."
  - "This feature can be enabled per incident type, not in the general severity configuration, and is available for our Pro and Enterprise customers."
- **[F, A]** The Severities API reference (https://docs.incident.io/api-reference/severities-v1, fetched as `.md`) says: "Each incident has a severity, picked from one of the severities configured in your organisations settings." Together with the `severities` page, that makes two pages for: the organisation configures the set.
- **[F, A, one page only]** The rule that managing severities "requires the **Manage organization settings** permission" is still only on `severities`.
  - The API-keys page describes the `manage_settings` scope as "Change organization-level configuration such as custom fields, and manage the catalog." It does not mention severities.
  - The user-permissions page lists an "Edit organization settings" permission and no severities.
  - The 2023-03-14 permissions changelog mentions no severities.
  - So I do not count these pages as a second source.
- **[F, A, one page only]** The full wording "Rename them, rewrite their descriptions, or add your own" is also only on `severities`.
- **[O]** For Q-026 §D (who owns the vocabulary), the two-page facts are the useful part:
  - The organisation defines the set.
  - The set is shared, with one order across incident types.
  - Each incident type can hide a value or restrict who may set it.
  - The named permission is a detail.

## Corrections to revision 4
- **§B, "change over time" for closed sets:** Linear's added status type now has a date, 2026-05-21, from the vendor's changelog. The "seems to have added recently" estimate becomes a fact. That the triage page is stale stays an estimate.
- **§D:** incident.io restricting who may set a value is now on two pages (the incident-types doc and the 2026-04-08 changelog). The named permission is still on one page.

## Field scan (new this round)
- Linear: Concepts page, two changelog entries (2024-03-19 and 2026-05-21), `configuring-workflows` in three forms (all 404), the GraphQL schema (cut off) and Apollo Studio (empty).
- incident.io: user-permissions, restrict-incident-type-management (no severity content), the Severities API reference, the foundations guide (best practice only, no product behaviour), `llms-full.txt`, the 2023-03-14 and 2026-04-08 changelogs, and incident-types.

**Still not covered:** controlled-vocabulary and records-management literature, and ITIL change categories.

## Proposed library entries (revision 5)

```yaml
---
id: F-linear-status-categories-01
form: fact
claim: "Linear: issue statuses form workflows, 'a group of ordered issue statuses defined per-team', with a default workflow teams can customise; teams can reorder statuses within a status category. Triage is 'an additional status category' whose issues are excluded from views by default as 'outside the normal workflow'. On 2026-05-21 Linear announced that 'Duplicate issues now use a dedicated status type'."
grade: A
topics: [status-reports, dashboards, change-reporting]
shelf_life: 12 months
sources:
  - https://linear.app/docs/issue-property  # "Teams can reorder statuses within each status category"; "Triage is an additional status category that acts as an Inbox for your team."
  - https://linear.app/docs/conceptual-model  # "they'll move through workflows; a group of ordered issue statuses defined per-team." / "We create a default workflow for you that you can further customize in Team Settings."
  - https://linear.app/docs/triage  # "By default, we exclude triage issues from all views since triage is considered to be outside the normal workflow."
  - https://linear.app/changelog/2026-05-21-project-slack-channels  # "Duplicate issues now use a dedicated status type in Linear and move context to the original issue."
note: Revision 5, narrowed. Fixed category order and the one-status-per-category minimum moved to F-linear-category-rules-01 (single page). The duplicate sentence comes from a dated changelog, the vendor's own record of a change; the triage page's older 'Canceled status type' wording is left out as probably out of date (researcher's inference). Short shelf life because the set changed in 2026.
---
```

```yaml
---
id: F-linear-category-rules-01
form: fact
claim: "Linear: 'the categories themselves stay in a fixed order', and statuses can be removed only 'as long as at least one status exists in each category'."
grade: A
topics: [status-reports, dashboards]
shelf_life: 12 months
sources:
  - https://linear.app/docs/issue-property
note: Single vendor page. HOLD under the two-page rule for vendor behaviour. Supporting only, not a second page for issues: the 2024-03-19 changelog (https://linear.app/changelog/2024-03-19-custom-statuses-for-projects) shows the same fixed-category design for project statuses ('create or modify statuses under the categories: Backlog, Planned, Started, Completed, and Canceled'). configuring-workflows, the likely second page, returns 404.
---
```

```yaml
---
id: F-incidentio-severity-ownership-01
form: fact
claim: "incident.io: each incident's severity is 'picked from one of the severities configured in your organisations settings'; severities 'are shared across incident types and their order will remain consistent'; per incident type an organisation can hide a severity and restrict who may set it ('restrict who can set particular incident severities… enabled per incident type, not in the general severity configuration'; Pro and Enterprise plans)."
grade: A
topics: [monitoring, status-reports]
shelf_life: 18 months
sources:
  - https://docs.incident.io/incidents/severities  # "Within an incident type you can override a severity's description, hide severities that don't apply, and restrict who's allowed to set a particular severity."
  - https://docs.incident.io/incidents/incident-types  # "severities are shared across incident types and their order will remain consistent." / "You can restrict which users are allowed to select a particular severity for a given incident type"
  - https://incident.io/changelog/incident-role-restrictions  # 2026-04-08: "This feature can be enabled per incident type, not in the general severity configuration"
  - https://docs.incident.io/api-reference/severities-v1  # "Each incident has a severity, picked from one of the severities configured in your organisations settings."
note: Revision 5, narrowed. The 'Manage organization settings' permission and the exact 'Rename them… add your own' wording moved to F-incidentio-severity-permission-01 (single page). Checker to re-read incident-types raw: round 5 found only description and order there, while my summarised fetch returned the hide and restrict sentences.
---
```

```yaml
---
id: F-incidentio-severity-permission-01
form: fact
claim: "incident.io: default severities 'are a starting point, not a rule. Rename them, rewrite their descriptions, or add your own'; 'Managing severities requires the Manage organization settings permission.'"
grade: A
topics: [monitoring, status-reports]
shelf_life: 18 months
sources:
  - https://docs.incident.io/incidents/severities
note: Single vendor page. HOLD under the two-page rule. Searched and not counted: user-permissions (an 'Edit organization settings' permission, no severities); api-keys (manage_settings 'such as custom fields, and manage the catalog', no severities); the 2023-03-14 permissions changelog (no severities).
---
```

---

## Six-part contract

1. **What I changed**
   - **`F-linear-status-categories-01`:** narrowed to what two vendor pages support, with the Concepts page added. It now includes the duplicate status type, dated by the 2026-05-21 changelog.
   - **`F-linear-category-rules-01`:** new. It holds the single-page rules (fixed order, one status per category) and is marked hold.
   - **`F-incidentio-severity-ownership-01`:** narrowed to the organisation-configured, shared set with per-type hide and restrict. Three new sources: incident-types, the 2026-04-08 changelog and the API reference.
   - **`F-incidentio-severity-permission-01`:** new. It holds the single-page permission and rename wording and is marked hold.
   - **Memo:** §B and §D corrected.
2. **Why:** the round-5 check held both entries because each rested on one page (its open question 1), and it pointed out that Linear's pages disagree on duplicates. Splitting each entry lets the parts with two sources be filed now, without stretching any source.
3. **What I verified:** I have no shell, so I ran no commands. I made about 21 summarising fetches and searches.
   - **Confirmed:**
     - Linear: the Concepts page wording, the 2026-05-21 and 2024-03-19 changelog wording, and the `issue-property` quotes again.
     - incident.io: the incident-types hide and restrict wording, the 2026-04-08 changelog wording, and the API reference sentence.
   - **Negative results:**
     - Linear: `configuring-workflows` returns 404 in all three forms. The GraphQL schema was cut off and Apollo Studio was empty.
     - incident.io: user-permissions, api-keys, the 2023-03-14 changelog, restrict-incident-type-management and the foundations guide say nothing about who may manage severities.
   - **Conflict with the checker:** what I read on incident-types differs from round 5's raw read.
4. **What is undone**
   - Second pages for the Linear category rules and the incident.io permission rule.
   - Reading Linear's `WorkflowState.type` description in the official schema.
   - Controlled-vocabulary literature and ITIL.
   - Evidence on how vocabulary drift turns out in practice.
5. **What is needed outside my lane**
   - **Source checker:** re-read raw:
     - incident-types (the hide and restrict sentences)
     - the Linear Concepts page
     - both Linear changelog entries
     - the incident.io 2026-04-08 changelog
     - the Severities API reference
   - **Source checker or anyone with a shell:** read `WorkflowState` in the full `linear/linear` `schema.graphql`. If its `type` description lists the categories, it may be the second page for the category list (though probably not for the fixed-order rule).
   - **Owner:** rule on the checker's open questions 2 and 3.
6. **Open questions**
   - Q-a to Q-e from earlier rounds stand.
   - **Q-e, refined:** where a vendor's dated changelog announces a change, may the library treat the newer reading as current and record the older page's wording as out of date with its date, instead of filing neither?
   - **New, Q-f:** does a vendor changelog entry count as a separate "page" under the two-page rule, given that the same publisher wrote it?
   - The checker's open question 1 can close for the parts re-proposed here. It stays open for the two hold entries.

Sources:
- [Linear issue properties](https://linear.app/docs/issue-property)
- [Linear Concepts](https://linear.app/docs/conceptual-model)
- [Linear triage](https://linear.app/docs/triage)
- [Linear changelog 2026-05-21, Issue duplicates](https://linear.app/changelog/2026-05-21-project-slack-channels)
- [Linear changelog 2024-03-19, Custom statuses for projects](https://linear.app/changelog/2024-03-19-custom-statuses-for-projects)
- [Linear changelog page 2](https://linear.app/changelog/page/2)
- [Linear configuring workflows (404)](https://linear.app/docs/configuring-workflows)
- [Linear GraphQL schema (cut off)](https://raw.githubusercontent.com/linear/linear/master/packages/sdk/src/schema.graphql)
- [incident.io severities](https://docs.incident.io/incidents/severities)
- [incident.io incident types](https://docs.incident.io/incidents/incident-types)
- [incident.io changelog: Incident role restrictions](https://incident.io/changelog/incident-role-restrictions)
- [incident.io Severities API](https://docs.incident.io/api-reference/severities-v1)
- [incident.io user permissions](https://docs.incident.io/admin/user-permissions)
- [incident.io restrict incident type management](https://docs.incident.io/admin/restrict-incident-type-management)
- [incident.io llms-full.txt (api-keys passage)](https://docs.incident.io/llms-full.txt)
- [incident.io changelog 2023-03-14](https://incident.io/changelog/2023-03-14)
- [incident.io severities guide](https://incident.io/guide/foundations/severities)