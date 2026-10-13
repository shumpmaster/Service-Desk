# <item> — the <Phase> gate

## 1. The ask
*The decision sought and your recommendation, with why; at the Launch gate, the go-live and the graduation together. Write the case at docs/gates/<item>/<phase>-gate-<n>-case.md (design, build or launch; n as the Orchestrator's wait names it) from this form, keeping each instruction line as it is or deleting it. Every line that states a fact ends with its citations, [<path>] or [<path>:<line>], each a record the Critic's gate pack holds; for later work, cite the owner's ruling record. Sections 1 to 8 hold at most 350 counted words, not counting citations, visuals, captions, headings, these instructions, the "Nothing needed in Build" section or the appendix. A visual draws only from the records its caption cites, adds no number, rating or trend they do not hold, draws an unknown value hatched and labelled (for example "not measured yet"), and has a text alternative that states its numbers. Standard visual: where the project is in the six phases, with this gate marked (S-024).*

**The proposer's recommendation:** <proceed, hold, recycle into <Phase>, or kill> — <why> [<path>]

## 2. The vision
*Why the project exists and what changes for the owner, from the project document's strategy (docs/PROJECT.md section 2); cite no file outside this repository. Standard visual: the owner's way of working today, against the change.*

## 3. What this phase taught us
*The closing phases' findings, each a conclusion that changes the picture, with its evidence. At the Build gate, Design's join-up review (reviews/<spec>/plan.md); at the Launch gate, Build's join-up review (reviews/<spec>/_reviewer-build.md) and the lessons for the operating model. Standard visuals: fit against limits, such as an allowance against the need; at the Build gate, thumbnails of the agreed screens from docs/design/.*

## 4. The plan for the next phase
*Its milestones, approach, who does what, and dates or estimates where they are recorded. At the Launch gate the next phase is the product's own: how it will run, monitor itself, take feedback and review its own value after it leaves the desk, citing the handover package's "Its own monitoring and feedback" section in docs/handover/ and the launch review, reviews/<spec>/reviewer.md. Standard visual: how the deliverables depend on each other, from section 3 of the project document and its milestones.*

## 5. The risks
*Each risk, with what would happen, what we would do, and where it stands now; a rating only where a record supports it. Any join-up difference not yet fixed is a risk here.*

## 6. Cost and limits
*The spend ceiling, the cost to the owner's time, and usage so far where the records hold it; otherwise "not recorded". Standard visual: the owner-time caps, from the project document's limits and value targets.*

## 7. Kill criteria
*The project's stop rule and value targets (docs/PROJECT.md section 6): what would make proceeding wrong.*

## 8. What the owner is agreeing to
*Every commitment the ruling carries: value targets, tier, spend ceiling, dates; at the Build gate, the frozen criteria; at the Launch gate, the go-live and the graduation.*

## Nothing needed in Build
*Build gate only, and only when you propose passing Build with nothing needed; delete this section otherwise. Each line cites its records; section 1 asks the owner to pass Build on this record, which only the owner rules, in the owner's own words. Not counted in the 350 words.*

### What was checked
*Each frozen criterion, and the work or record that already meets it.*

### What was adjusted
*Each requirement changed because of it: Build's five standard milestones, shown not needed; each project milestone of Build, by id, dropped or moved to another phase by the owner's ruling at this gate; and anything a later gate would otherwise read from Build, such as Build's join-up review.*

### Why nothing is needed
*Why the frozen criteria need no build work.*

## 9. Appendix: the phase record
<details>
<summary>The phase record</summary>

*Folded away and not counted: the milestone list, what was produced, iterations and their reasons, failed checks that were fixed, the owner's rulings in the phase, open items and blockers, and the phase's own checks. Copy the milestone block exactly as `v3_checks gates` prints it; never write its lines by hand. Standard visual: research and check outcomes. The case ends with the closing </details> line; the Critic section below is the Critic's record, never part of the case.*

```milestones
<the block `v3_checks gates` prints for this case>
```

</details>

<!-- The Critic section: the gate Critic's record, reviews/<item>/_<phase>-gate-<n>-critic.md, never part of the case. -->

## The Critic's independent view
*The Critic's own view of the case, written by the Critic (role critic-gate), who never copies or changes the case and writes no verdict line.*

**The Critic's recommendation:** <proceed, hold, recycle into <Phase>, or kill> — <why>

**Citation check:** <each claim that cites no record, or a record that does not say it, by section and line; or "Every claim cites a record that supports it">

**Milestones:** <the findings on the case's milestone list>
