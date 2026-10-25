# M3E stage G9: the Design reviewer's round 1 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g9 at f9b5d9a (G9's work over d968b1e).

---

Verdict: FAIL

The build matches my per-screen list (below) on every soft box. It fails on one point only: the run-heading call that AC92 (d) left to me and that the G9 row includes. I call that the run heading should outrank its two group headings, and the build left it as it was. The fix is a small CSS change with no new colour, size or box (see B1). Everything else passes.

---

## PART 1, FOR THE SPEC: the Design reviewer's per-screen list (AC92 (e)'s table)
*(Written so the Definer can copy it into AC92 (e)'s table. A screen not listed has no box.)*

| Screen | Its soft box | Why |
|---|---|---|
| **Home** | The briefing, as built: the count, its parts, its due and undo lines and any can't-read lines (AC82, AC91 (a)). Nothing else. | What needs the owner is why the desk exists (V1), and the ruling names this box. Tiles are already boxes. "Since you last looked" is a list of lines, and a box never wraps a list (reading (h)). |
| **A project's page (v3)** | One box: the sentence, with the tally under it, "<R> of <T> milestones reached · <sprints>". The tally is summed over the page and counts each sprint once, using (c)'s one sprint form. Where T sums to 0 it reads "no milestones tracked yet · <sprints>". There is no tally where the phases aren't tracked. | It answers "where is it heading and how far has it got", which is the page's job (AC83) and the content the ruling names. |
| ↳ the waits row "◆ <n> wait on you" | **Not in the box** (the decision AC92 (e) left to me) | (i) The vermilion ◆ already makes it the loudest thing on the page, so a box would double the emphasis ("shouldn't be overdone"). (ii) It is a tappable row in the page's list of rows (with "At work now"). Boxing it would wrap a row of a list and put a tap target on the soft box's flat grey ground, where round 2 keeps an outline for things you tap or type in. (iii) When nothing waits it is absent or reads "Nothing waiting on you", so the box would change shape with the state. (iv) Moving it up beside the sentence would reorder frame 5 (part B item 31). It still sits on the first 360×740 screen, right under the strip (about 508 px down). |
| ↳ strip, "ran again", "Your last action", "At work now" | Not in the box | Strip: the box's padding broke "Discover/y" at 360 px (round 2), and the arrow already marks it. The other lines are history or context, not "close to or as important". |
| **A v2.5 project's page** (POOM) | The sentence alone, in the same box | The same place answers the same question on every project. The older pipeline doesn't track phases, so there is no tally. |
| **A page with nothing known** (never read in this opening, or nothing recorded) | The box stays, holding the words for the unknown ("not available until the project's records are read", "not recorded", "no milestones tracked yet · no sprints filed yet"), never a number | It is an honest answer in the same place (items 4 and 5). A box that comes and goes with the state would shift the page. It is the record's state, not an agents' gap: it names no one who should fill it (AC69). The owner may change this (Q1). |
| **An opened phase** | None. The why-not-written line is a plain line (as built). | It sits inside the page's list of rows (reading (h)). The G6 headings and the arrow already set it apart. A filled box never holds an agents' gap. |
| **Timeline** | None | The Now line and the arrow anchor it. The two goal boxes (`.v2-goal`) stay as built and are not soft boxes. |
| **Plan** | None | The arrow marks the milestone next to reach. The ordering card (`.v2-plcard`) stays as built and is not a soft box. |
| **Waiting** | None | Ruled (reading (c)). The Done lane's shading is a lane, not a box. |
| **A card's sheet** (question or gate) | None | A box never goes inside a sheet. The settle/undo line already leads with an icon and bold text, and the options are outlined. |
| **Team, a member's page** | None | Cards are already boxes. No single fact there outranks the rest; "At work now" sits on the page and on the Home tiles. |
| **The Pipeline view** (v2.5) | None | Its "now" is already the page's boxed sentence, one tap back. |
| **Details, Since you last looked, the portfolio, the failed-load screen** | None | Round 2's list, unchanged. |

Wrapping: the tally wraps like any other line (the approved mock wraps it at 360 px too). See note N1.

## PART 1, FOR THE SPEC: the run-heading call (AC92 (d))
**Call: yes, a run's heading outranks its two group headings.** In an opened phase:
- `.v2-runh` takes `--ink` instead of `--ink2`, and weight 600 instead of 500. The size stays 11 px.
- Each run heading after the first in an opened phase gets a 1 px `--line` rule above it, with 8 px over it. That is the standard group heading's own rule and gap.
- Every token already exists: no new colour, size or box.

Why:
- **Part A item 8 (type roles), and note 21's chain of goal → phases → milestones.** A run holds both groups, so its heading should not read weaker than the groups inside it.
- **What G6 found (N1), measured again here:** the run heading is 500 11 px `--ink2` (6.4:1 light, 7.72:1 dark), while "Your milestones · n" and "Standard checklist · …" are 500 11 px `--ink` (17.58:1 and 16.25:1). The only rule sits inside a run, so the boundary between runs is the weakest divider on the screen. In /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9-design/pairs/runheads-after-414-light.png, the grey "Run 1 · 5–8 Oct · gone back over" sits straight under run 2's fold with no divider.
- The new heading contrasts 17.58:1 (light) and 16.25:1 (dark).
- It is reversible, and the owner sees it on the preview (AC92 (d): no question is put).

---

## Plain summary for the owner
The project page now opens with a soft grey box, the same look as Home's briefing. It holds where the project is heading and, under that, a one-line count of how far it has got: "8 of 16 milestones reached · 17 sprints · 9 merged, 8 not read". The grey "why not written yet" box inside an opened phase is now a plain line, so a grey box only ever means "the most important thing here". Home keeps its briefing, and no other screen gets a box, so it isn't overdone. The "waits on you" row stays out of the box: it is already the one vermilion thing on the page, and boxing it too would double up. One thing is still to do. Inside an opened phase, each "Run 1 / Run 2" heading should look stronger than the "Your milestones" and "Standard checklist" headings under it, with a thin line between runs. Today it is the faintest heading there, so runs blur together.

## Findings
- **B1 (blocking; the G9 row and AC92 (d)'s call; part A item 8).** The run heading is unchanged at src/public/sandbox.css:1053 (`.v2-runh { font: var(--t-label); color: var(--ink2); padding: 8px 0 2px; }`), against the call above. Evidence: dump-after/g9-page-design-why-360x740-{light,dark}.json (heads: runh 500 11px rgb(92,95,102) / rgb(162,165,172); subh 500 11px ink) and pairs/runheads-after-414-light.png. The fix is the CSS above, plus the rule on the second and later run headings, with a test case.

## Evidence by checklist item (the after tree is f9b5d9a, the before tree d968b1e, both exported with `git archive`; the g9- captures come from the tool, 11 states × 2 widths × 2 themes)
- **1 Rulings.** P-001-glance2-anchor (A, widened): boxes appear only on Home (the briefing) and on a project's page. None is vermilion, inside a card or inside a sheet. Reading (c): Waiting has no box (g9-waiting-done reports "no box"). Reading (h): most screens have none. The test ac92-glance-boxes walks every route and finds boxes only where the list names them.
- **2 Spec, AC92 (e).** The box measures padding 12px, radius 12px, gap 4px 10px, `--bg2` ground, no border, no shadow. That is identical to the `.v2-brief` dump. AC83: the sentence comes first in the box. The why line is `--t-small` `--ink2` with the eye icon, and its ground is now rgba(0,0,0,0) (before: `--bg2`).
- **5 No made-up figures.** The tally agrees with the page:
  - 8/16 is 0/2 + 3/5 + 1/5 + 4/4;
  - 17 sprints is 0 + 4 + 6 + 7;
  - 9 merged is 2 + 7, and 8 not read is 4 + 4;
  - it matches the head, "Milestones by phase · 8 of 16 reached";
  - where T is 0 it says so in words, and a page never read shows no tally.
- **6 Every project.** All rendered without error:
  - Service-Desk (`text`, real records at 77bfeae, and `mix` with its made-up later Launch run);
  - POOM v2.5 (the sentence alone);
  - md-extremes: Alpha with a 0-of-14 count, Epsilon with its long name, `quiet` with nothing recorded;
  - a page never read in this opening.
- **8, 27 Type roles and sizes.** Sentence 400 15px; tally 400 12px with "8 of 16" in 500 12px. All are on the scale and set in IBM Plex Sans (item 23).
- **10, 25 Contrast.**
  - Sentence: 16.42:1 light, 15.6:1 dark.
  - Tally: 5.97:1 light, 7.41:1 dark on `--bg2`; its bold count 16.42:1 and 15.6:1.
  - Why line: 6.4:1 light, 7.72:1 dark.
- **12 Width.** Nothing scrolls sideways in any of the 88 before and after dumps.
- **13, 14 Colour.** The change adds no colour that carries meaning.
- **24 Motion.** The CSS diff adds no transition or animation.
- **Screen reader.** The box's aria snapshot is two paragraphs in order, the sentence then "8 of 16 milestones reached · 17 sprints · 9 merged, 8 not read". The box has no role and nothing is hidden.
- **26 Mock.** The page matches round 2's q2 mock (r2-q2-page-after), except the tally's "17 sprints: 9 merged" becomes "17 sprints · 9 merged". That is AC92 (c)'s one form, set by the spec.
- **Home and Waiting** are pixel-identical before and after, apart from the clock digits ("checked n s ago", the wait timers).
- **Tests.** The full desk suite passes on the f9b5d9a export, 1313/1313 (`node --test --test-concurrency=4 tests/desk/*.test.mjs`); ac92-glance-boxes plus ac83-page pass 27/27. The repository is untouched (`git status` is clean).

## Notes (non-blocking)
- **N1, the tally's wrap at 360 px.** It breaks inside a part: "… 9 merged, 8" / "not read". The approved mock broke it the same way ("8 not / read"), so this is not a finding. The Definer could keep each part whole; otherwise the owner judges it on the preview. At 414 px it fits on one line.
- **N2, the dark theme.** The box's ground is 1.04:1 against the page, so it is very faint. That is the briefing's ruled look, and the box is decoration, not text.
- **N3, the arrow.** The strip's arrow now sits 3 px under the box's edge and 3 px over its bar. The gap from the box to the strip is unchanged at 12 px, as the mock draws it.
- **N4, the same count twice.** The tally and the section head both say "8 of 16", as the spec requires.
- **N5, page length.** Content moves down 62 px at 360 px wide. The waits row and "At work now" still fit on the first screen.
- **N6, a true zero.** "0 of 14 milestones reached" in md-extremes' box is a zero taken from the record, not the old standard-checklist zero.
- **N7, pre-existing.** The known `--soft` follow-up is not touched.

## Questions for the owner (asked, not picked)
- **Q1.** On a project where nothing is recorded yet, or not read yet, the box shows only "not recorded" or "not available" words (pair 04). Which do you want?
  - A. Keep the box there always: the same place answers the same question. This is my recommendation.
  - B. Show no box until something is recorded.

## Before/after pairs for the owner (left: before d968b1e, right: after f9b5d9a)
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9-design/owner-pairs-final/01-project-page-box-and-tally-360x740-light-MADE-UP-NOT-real.png: the sentence and tally boxed. Made-up records, NOT real.
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9-design/owner-pairs-final/02-project-page-box-and-tally-414x896-dark-MADE-UP-NOT-real.png: the same in dark at 414 px, where the tally fits one line. NOT real.
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9-design/owner-pairs-final/03-opened-phase-why-line-plain-360x740-light-real-records-77bfeae.png: the why box becomes a plain line. Service-Desk's real records at 77bfeae in the test setup; the clock is made up. It also shows the grey run heading (B1).
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9-design/owner-pairs-final/04-project-with-nothing-recorded-360x740-light-MADE-UP-NOT-real.png: a project with nothing recorded, its box holding words only (Q1). NOT real.

Everything else is under /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9-design/:
- captures: shots-before/, shots-after/ and other/;
- style and text dumps: dump-before/ and dump-after/, one .json per capture;
- side-by-side crops: pairs/;
- the full suite's output: suite-after.txt.
