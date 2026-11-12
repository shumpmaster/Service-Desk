# Research memo (revision 6): Q-026, Event vocabularies: closed sets, open labels, free text, or none (2026-11-12)

*Researcher, depth 2. This revision answers `research/Q-026-source-check.md` (round 6 of checking: verdict FAIL, one entry filed, three held). Research is blind. **I read every page this round through a summarising fetch, not as raw text.** The quotes below are what the summariser returned, so the Source checker needs to re-read them raw.*

**Grade key:** as in revision 4. Each statement is marked **[F]** fact, **[E]** estimate or **[O]** opinion.

**Unchanged:** everything in revision 5 except the three held entries. The checker has now filed eight entries. To the seven listed in revision 5 it added `F-incidentio-severity-ownership-01`. None of the eight is proposed again.

## What changed in the findings

### 1. Linear: narrowed to what two pages support
- **[F, A]** On the round-6 raw read, the checker confirmed two things on two vendor pages each:
  - Statuses form "a group of ordered issue statuses defined per-team", with a default workflow that teams can customise (`conceptual-model` and `issue-property`).
  - Triage is "outside the normal workflow" (`triage`; `issue-property` also calls triage a status category).
- **[F, A, new second page, summarised]** Linear's developer docs, https://linear.app/developers/graphql, say:
  - "If an issue is created without a specified `stateId` … the issue will be assigned to the team's first state in the Backlog workflow state category."
  - "If the "Triage" feature is turned on for the team, then the issue will be assigned to the Triage workflow state."
  - With `issue-property`, this makes two vendor pages saying that a team's statuses fall into named categories, and that Backlog is one of them. This page does not list the other categories.
- **[F, A, one page only]** These are still only on `issue-property`, and I have now moved all of them into the held entry `F-linear-category-rules-01`:
  - teams can reorder statuses within a category
  - "the categories themselves stay in a fixed order"
  - at least one status must remain in each category
- **Where I looked for a second page this round, without success:**
  - `configuring-workflows` returns 404 in its plain, `.md` and `?_rsc=` forms. A search index still shows that page with the reorder and fixed-order wording, but an index snippet is not a readable page, so I do not cite it.
  - `teams.md` says only "Workflows can be customized per team."
  - `issue-properties-home.md` has no body text.
  - `issue-relations` returns 404 in both forms.
  - `developers/filtering` shows `state.type` values only inside code examples.
- **Duplicates:**
  - **[F, A, conflicting vendor pages]** The 2026-05-21 changelog says "Duplicate issues now use a dedicated status type". The `issue-property` page calls Duplicate "a system-managed status that cannot be renamed or customized", but the checker has not yet confirmed that quote raw. The `triage` page still says, twice, that duplicates go to "a Canceled status type".
  - **[E]** That the triage page is out of date is my inference from the dates. Linear does not say so.
  - I have moved this claim into its own entry, `F-linear-duplicate-status-01`. It is on hold until the owner rules on Q-e (pages that disagree) and Q-f (does a changelog count as a page).

### 2. incident.io: the permission rule is still on one page
- The checker's raw read confirmed the hide and restrict wording on `incident-types`, so the conflict from round 5 is resolved and `F-incidentio-severity-ownership-01` is filed.
- **[F, A, one page only]** "Managing severities requires the Manage organization settings permission" is still only on `severities`. I re-read `user-permissions.md`. Its role lists say "View organization settings (except billing)" for Standard and "Edit organization settings" for Admin, and nothing about severities. A second-source search turned up only the same `severities` page and the 2026-04-08 changelog, which is about restricting who sets a severity, not who manages severities. incident.io's help-centre article on user permissions returns 404.
- **[O]** For Q-026 §D (who owns the vocabulary), the filed ownership entry carries the substance. The name of the permission is a detail.

## Answers to the checker's open questions to the researcher
- **Q3, second pages:** I found none for the fixed order, the one-status minimum, reordering within a category, or the incident.io permission. These stay as **[F, A, one page only]** statements in the memo, and their entries stay HOLD. I do not withdraw them. **[O]** None of them needs to be filed for Q-026 to be answered: the parts that bear on the decision (a fixed set of categories, statuses named by the customer inside them, an organisation-owned set) are filed or re-proposed below.
- **Q4:** yes. `F-linear-status-categories-01` is re-proposed below without the reorder wording, without "additional status category", and without the duplicate sentence.

## Field scan (this round)
- **Linear:** `configuring-workflows` (three forms, all 404), `llms.txt`, `teams.md`, `issue-properties-home.md`, `issue-relations` (two forms, both 404), `developers/graphql`, `developers/filtering`.
- **incident.io:** `user-permissions.md`, a search for custom roles and permissions, and the help-centre user-permissions article (404).

**Still not covered:** controlled-vocabulary and records-management literature, and ITIL change categories.

## Proposed library entries (revision 6)

```yaml
---
id: F-linear-status-categories-01
form: fact
claim: "Linear: issue statuses form workflows, 'a group of ordered issue statuses defined per-team', with a default workflow teams can customise in Team Settings. A team's statuses fall into named workflow state categories, Backlog among them. Triage issues are excluded from views by default because triage is 'outside the normal workflow'."
grade: A
topics: [status-reports, dashboards, change-reporting]
shelf_life: 12 months
sources:
  - https://linear.app/docs/conceptual-model  # "a group of ordered issue statuses defined per-team." / "We create a default workflow for you that you can further customize in Team Settings."
  - https://linear.app/docs/issue-property  # per-team ordered statuses in status categories; triage as a status category
  - https://linear.app/developers/graphql  # "the issue will be assigned to the team's first state in the Backlog workflow state category." / "assigned to the Triage workflow state."
  - https://linear.app/docs/triage  # "By default, we exclude triage issues from all views since triage is considered to be outside the normal workflow."
note: Revision 6, narrowed as the checker asked (its open question 4). Reordering within a category moved to F-linear-category-rules-01. The duplicate status moved to F-linear-duplicate-status-01. developers/graphql was read summarised only; the checker should re-read it raw.
---
```

```yaml
---
id: F-linear-category-rules-01
form: fact
claim: "Linear: teams 'can reorder statuses within each status category, but the categories themselves stay in a fixed order', and statuses can be removed only 'as long as at least one status exists in each category'."
grade: A
topics: [status-reports, dashboards]
shelf_life: 12 months
sources:
  - https://linear.app/docs/issue-property
note: Single vendor page. HOLD under the two-page rule. Searched without success in rounds 5–6: configuring-workflows (404 in three forms; search index snippets carry the same wording but are not citable), teams.md, issue-properties-home.md, issue-relations (404), developers/graphql and developers/filtering, the GraphQL schema (cut off) and Apollo Studio (empty). The 2024-03-19 changelog shows the same design for project statuses only, so it supports the claim but is not a second page.
---
```

```yaml
---
id: F-linear-duplicate-status-01
form: fact
claim: "Linear: on 2026-05-21 Linear announced that 'Duplicate issues now use a dedicated status type' and that 'every issue with a duplicate status must now link to the original issue'. The triage page still says duplicates move to 'a Canceled status type'."
grade: A
topics: [status-reports, change-reporting]
shelf_life: 12 months
sources:
  - https://linear.app/changelog/2026-05-21-project-slack-channels  # confirmed raw by checker, round 6
  - https://linear.app/docs/issue-property  # "a system-managed status that cannot be renamed or customized" (summarised; not yet confirmed raw)
  - https://linear.app/docs/triage  # "a Canceled status type" (twice; confirmed raw by checker)
note: HOLD pending owner rulings Q-e (filing a dated newer reading against an older page) and Q-f (whether a changelog counts as a page). The claim records the conflict rather than resolving it. That the triage page is out of date is the researcher's inference, not Linear's statement.
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
note: Single vendor page. HOLD under the two-page rule. Searched without success in rounds 5–6: user-permissions (role-level 'Edit organization settings', no severities), api-keys manage_settings scope (no severities), 2023-03-14 changelog, 2026-04-08 changelog (about who may set a severity, not who manages severities), help-centre permissions article (404).
---
```

## Six-part contract

1. **What I changed**
   - **`F-linear-status-categories-01`:** re-proposed narrower, without the reorder wording, without "additional status category" and without the duplicate sentence. It adds Linear's developer docs as a second page for the claim that statuses sit in named categories.
   - **`F-linear-category-rules-01`:** now also holds the reordering rule. Still on hold.
   - **`F-linear-duplicate-status-01`:** new. It records the dated changelog and the conflicting triage page side by side, and is on hold until the owner rules on Q-e and Q-f.
   - **`F-incidentio-severity-permission-01`:** still on hold, with the record of this round's search added.
   - **Memo:** `F-incidentio-severity-ownership-01` is now listed as filed.
2. **Why:** the round-6 check (open questions 3 and 4) found the reorder wording, "additional status category" and the duplicate status each resting on one page, or on a changelog that no ruling covers. Narrowing the main entry means it rests only on sources the checker confirmed, plus one new page for it to read raw.
3. **What I verified:** I have no shell, so I ran no commands.
   - I made about 16 summarising fetches and searches.
   - **Found:** the developer-docs Backlog/Triage sentences.
   - **Searched without success:** a second Linear page for the category rules (several pages, three returning 404) and a second incident.io page for the permission rule.
   - **Not checked:** none of this round's quotes has been read raw by me.
4. **What is undone**
   - Second pages for the Linear category rules and the incident.io permission rule.
   - `WorkflowState.type` in Linear's full `schema.graphql`.
   - Controlled-vocabulary literature and ITIL change categories.
   - Evidence on how vocabulary drift turns out in practice.
5. **What is needed outside my lane**
   - **Source checker:** re-read `linear.app/developers/graphql` raw, and the `issue-property` sentence on Duplicate.
   - **Anyone with a shell:** read `WorkflowState` in the `linear/linear` `schema.graphql`.
   - **Owner, through the Chief of Staff:** rule on Q-e and Q-f. That ruling decides `F-linear-duplicate-status-01`.
6. **Open questions**
   - Q-a to Q-f from earlier rounds stand.
   - **New, Q-g:** may a single-page vendor fact sit in the library as a HOLD entry with its search record, so that later research can find it, rather than being dropped? This would cover `F-linear-category-rules-01` and `F-incidentio-severity-permission-01`.

Sources:
- [Linear Concepts](https://linear.app/docs/conceptual-model)
- [Linear issue properties](https://linear.app/docs/issue-property)
- [Linear triage](https://linear.app/docs/triage)
- [Linear developers: GraphQL](https://linear.app/developers/graphql)
- [Linear developers: filtering](https://linear.app/developers/filtering)
- [Linear teams](https://linear.app/docs/teams.md)
- [Linear llms.txt](https://linear.app/llms.txt)
- [Linear configuring workflows (404)](https://linear.app/docs/configuring-workflows)
- [Linear changelog 2026-05-21](https://linear.app/changelog/2026-05-21-project-slack-channels)
- [Linear changelog 2024-03-19](https://linear.app/changelog/2024-03-19-custom-statuses-for-projects)
- [incident.io severities](https://docs.incident.io/incidents/severities)
- [incident.io user permissions](https://docs.incident.io/admin/user-permissions.md)
- [incident.io changelog: Incident role restrictions](https://incident.io/changelog/incident-role-restrictions)
- [incident.io help centre permissions article (404)](https://incident-io-knowledge-base.help.usepylon.com/articles/6578562894-can-we-set-different-user-permissions%3F)