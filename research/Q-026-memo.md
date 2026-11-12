# Research memo (revision 7): Q-026, Event vocabularies: closed sets, open labels, free text, or none (2026-11-12)

*Researcher, depth 2. This revision answers `research/Q-026-source-check.md` (round 7: FAIL, `F-linear-status-categories-01` filed, three entries held). Research is blind. I read every page this round through a summarising fetch, not as raw text.*

**Grade key:** as in revision 4. Each statement is marked **[F]** fact, **[E]** estimate or **[O]** opinion.

**Unchanged:** everything in revision 6 except the two entries withdrawn below. The checker has now filed nine entries: the eight listed in revision 6 plus `F-linear-status-categories-01`. None is proposed again.

## What changed

### 1. Withdrawn: `F-linear-category-rules-01`
- The checker's open question 3 said to find a second page or drop the entry. I could not find a second page, so I am dropping it.
- **This round's search:**
  - I searched for the "at least one status" and reorder wording.
  - `linear.app/docs/configuring-workflows?_rsc=tzjnj`, the form the search index lists, returns HTTP 404.
  - The other matches were not Linear pages: a Notaku-hosted "linearguide" copy of the docs and an estudy247 course page. Neither is the vendor, and a copy of the vendor's text is not a second source.
  - The estudy247 page says there are "four fixed categories". That conflicts with the five categories that `issue-property` lists and the checker confirmed, which is another reason not to use it.
- **[F, A, one page only, memo only]** The wording stays as a memo statement that rests on `linear.app/docs/issue-property`: teams can reorder statuses within a category, the categories stay in a fixed order, and at least one status must remain in each category. It is not proposed for the library.
- **[O]** Losing this entry does not weaken the answer to Q-026. The filed entry already supports the part that matters for the decision: a fixed set of categories set by the vendor, with statuses named by the customer inside them.

### 2. Withdrawn: `F-incidentio-severity-permission-01`
- **This round's search:**
  - I re-read `docs.incident.io/admin/user-permissions`. It has no sentence about severities. It says only "Admin — all Standard permissions, plus the ability to manage organization settings and billing".
  - A search for "Manage organization settings" with severities found that page, an API-key permission described as "(for example custom fields)", and third-party pages. None of them links the permission to severities.
- **[F, A, one page only, memo only]** "Managing severities requires the Manage organization settings permission" stays as a memo statement that rests on `docs.incident.io/incidents/severities`. It is not proposed for the library.
- **[O]** For §D (who owns the vocabulary), the filed `F-incidentio-severity-ownership-01` carries the substance: the organisation owns one shared set of severities.

### 3. Still held: `F-linear-duplicate-status-01`
- The entry is unchanged from revision 6. The checker has now confirmed all three of its quotes raw.
- It waits only on the owner's rulings on Q-e and Q-f. I propose it again unchanged so that it can be filed or dropped once those rulings exist.

## Field scan (this round)
- **Linear:** one search, plus a fetch of `configuring-workflows?_rsc=tzjnj` (404).
- **incident.io:** one search, plus a fetch of `admin/user-permissions`.
- **Still not covered:** the literature on controlled vocabularies and records management, ITIL change categories, and evidence on how vocabulary drift turns out in practice.

## Proposed library entries (revision 7)
`F-linear-duplicate-status-01`: unchanged from revision 6 and still held until the owner rules on Q-e and Q-f. No other entries are proposed.

## Six-part contract
1. **What I changed**
   - Withdrew `F-linear-category-rules-01` and `F-incidentio-severity-permission-01` from the proposed entries. Their wording stays in the memo, marked as resting on one page only.
   - Kept `F-linear-duplicate-status-01` on hold.
   - Recorded `F-linear-status-categories-01` as filed.
2. **Why:** the checker's open question 3 said to find second pages or drop the entries. A further search found no second vendor page for either. The only matches were copies of Linear's docs on other sites, and one of those contradicts the filed fact.
3. **What I verified:** I have no shell, so I ran no commands.
   - I ran two extended web searches and two summarising fetches.
   - `configuring-workflows?_rsc=tzjnj` returned 404.
   - `user-permissions` has no sentence about severities.
   - I read nothing raw.
4. **What is undone**
   - The Duplicate entry, which waits on the owner's rulings.
   - The literature on controlled vocabularies, ITIL change categories, and evidence on vocabulary drift.
   - `WorkflowState.type` in Linear's `schema.graphql`.
5. **What is needed outside my lane**
   - **Owner, through the Chief of Staff:** rule on Q-e and Q-f.
   - **Source checker:** there is nothing new to read raw this round. Only the held Duplicate entry is left, and it waits on the owner's rulings.
6. **Open questions**
   - Q-a to Q-f stand.
   - Q-g (may a fact resting on one vendor page sit in the library on hold?) no longer matters for this item, because both entries it covered are withdrawn. It is left open for the owner as a general question.

Sources:
- [Linear configuring workflows (404)](https://linear.app/docs/configuring-workflows?_rsc=tzjnj)
- [Linear issue properties](https://linear.app/docs/issue-property)
- [Linear changelog 2026-05-21](https://linear.app/changelog/2026-05-21-project-slack-channels)
- [Linear triage](https://linear.app/docs/triage)
- [Linear guide mirror (not cited, not the vendor)](https://linearguide-6914.notaku.site/configuring-workflows)
- [estudy247 Linear Workflows (not cited, not the vendor, conflicts)](https://estudy247.com/courses/linear/lessons/linear-workflows/)
- [incident.io severities](https://docs.incident.io/incidents/severities)
- [incident.io user roles and permissions](https://docs.incident.io/admin/user-permissions)