**Design audit (2026-11-14): the style and theme of the timeline mockup v5, and three directions for modernising it**

*By the Design reviewer, at the owner's request ("get an external audit on the general style and theme … I don't want the functionality changed, I just want to review a couple possibilities for significant modernization in the elements, shapes colors lines etc."), on docs/design/mockups/timeline-v5-plan.html. Recorded verbatim by the orchestrator, session session_01QBwHGKbJwQiq23S3G2JJet. Its screenshots and measurements were kept outside the repository, in the session's scratch folder.*

The v5 timeline mockup works and holds together at both widths, but its style fails measurable checks in several places, and it clashes with standing rulings in three ways only the owner can settle. Light mode is the weak theme. In the fully opened view, 69 of 160 text pieces fall below 4.5:1 contrast, and 10 fall below 3:1. Most of this comes from the light grey ink and from fading past rows with opacity. The dashed branch line is almost invisible in light mode, at 1.53:1. That matters because "dashed means a branch" is one of the locked meanings. The mockup also uses the dashed line for a second meaning, "planned". It uses diamonds and squares for things outside the locked key, and it sets Inter instead of the ruled IBM Plex. I measured everything below in Chromium. I could not check one thing: whether the owner treats the timeline basis (blue for the owner's step) as replacing the desk's vermilion "needs you" ruling. Nothing was changed.

## Audit findings

**How I captured it:** Playwright and Chromium at 360×740 and 414×896, light and dark. I opened the desk, then the "tl" project, then M6 (`.pl.progress .crow`), then sprint S-011, then the Stop event. The web fonts loaded (Inter and JetBrains Mono, confirmed with `document.fonts`). No sideways scroll at either width (0 px), and no script errors.

1. **The typeface breaks the type ruling (item 23, P-001-redesign-type.md).** The page loads Inter and JetBrains Mono (line 5). In the open view 125 text elements use Inter and 35 use JetBrains Mono, so none use Plex. "Inter everywhere" is also one of the research's generic "AI look" marks (a note only, not a finding).
2. **Sizes and weights are off the ruled scale (item 27, as far as it applies; "Sized like Linear").** Measured sizes: 30, 16, 14 and 10 px, none of which are on the scale (28/24/20/18/15/13/12/11). Weights 700 (42 elements) and 800 (the NOW tag) are also used, but the ruling allows only 400/500/600. The 10 px text appears 18 times on the desk view: the repo line, the phase-bar names, "last 10" and "THE DESK".
3. **Text contrast is too low in light mode (item 10).**
   - `--ink-4` #8a8a83 measures 3.21:1 on the ground and 3.47:1 on the surface. It is used for sub-lines, counts, phase notes and the swipe hint.
   - Past rows are faded with opacity (lines 159–165 and 255): .74, then .6, then .5. Timestamps then measure 2.26:1, kind names 3.0:1, "Reached" 3.33:1 and "1 sprint" 2.2:1.
   - Counts below 4.5:1 in light mode: desk 30 of 76, plan 32 of 113, open view 69 of 160.
   - Dark mode: the white "4 for you" badge on `--you` #5b8cff measures 3.16:1, and the sub-lines 4.30:1.
4. **Marks are too faint (WCAG 1.4.11, 3:1 for non-text; item 25 in dark).**
   - Light: `--branch-line` #c9c9c4 measures 1.53:1 on the ground and 1.66:1 on the surface. That colour draws the dashed branch, the desk connectors and the planned milestone rings. `--rule` measures 1.21:1.
   - Dark: `--branch-line` #4d4d47 measures 2.17:1.
   - White icons on the state fills, dark mode: on running #d4952e 2.58:1 (fails), on done 3.01:1, on you 3.16:1.
   - In light mode `--running` measures 3.36:1 and `--idle` 3.21:1 on the ground. Both pass, with little margin.
5. **The dashed line carries a second meaning (basis: "a branch (dashed line)"; item 14).** In the plan view, main is drawn dashed above NOW to mean "planned" (`.pfut`, line 191, `3px dashed`). You can see it in 414-light-2-plan-now.png. The desk-to-project connectors are also dashed (line 108), so a project reads as a branch. The milestone-to-sprint connector is solid while the sprint-to-event connector is dashed (lines 241 and 247).
6. **Shapes are added outside the key (basis: "Needing a new entry in the key … needs the owner's word"; item 14).**
   - The project's own milestones are drawn as rotated squares, i.e. diamonds (line 210). In desk v2 the diamond means "needs you", or a grey diamond for gaps the agents own.
   - Sprints are drawn as 12 px rounded squares (line 246). That is the shape family the second row of kinds uses (gate/decision/research/stop, `.sq`).
   - Milestones are bare 16 px dots, with no icon.
7. **The state words go beyond the five (basis: "the state word in that colour").** The plan rows say Reached, Passed, In progress, Planned, Not recorded and "Not reached in the records" (line 456). These are mapped onto the five state colours, but the basis's words are Done/passed, Running, Failed, Waiting on you and Not started.
8. **The radii have no system.** I measured 15 different corner radii in the plan view: 2, 3, 4, 5, 6, 7, 10, 11, 12, 14, 15, 16 and 18 px. Cards are 12, pills 12, buttons 10, the mode bar 17 and the back button 18.
9. **A line crosses text.** With M6 open, the `.br-out` connector runs through the start of the title "The records can carry the timeline" (360-dark-3b-milestone.png). The `.br-lane` sits at left 82 px, inside the text column, which starts at 64 px.
10. **Lines and nodes are heavy and inconsistent.** Main is 3 px ink. The branch is 2–2.5 px dashed in a pale grey, and the desk trunk is 3 px. Nodes come in sizes 30 (NOW), 24, 22, 20, 16, 12 and 10 px, each with a 3 px ring knocked out in the ground colour. Wider-spaced cards, the blue-washed panels and an infinite pulse ring on NOW all compete for attention. That weighs against "not heavy" in the steward request.
11. **Passes:** reduced motion is respected (lines 177 and 232, and the JS `REDUCED` flag). Tap targets: rows 36–44 px and the smallest control 28 px, all at least 24. Every state colour has its word beside it, so colour is never the only signal (item 13).

## Three directions

All three keep the locked key. The seven kinds stay icons in circles, and the second row (gate, decision, research, stop) stays icons in rounded squares. The five states keep their colour with the word beside it. Blue is only for the owner's step. Main is a solid line and a branch is a dashed line. "By <who>" and the event's reading order stay. Every ratio below is measured against both the ground and the surface, and the minimum is quoted.

### A. Plex Ledger (warm paper, hairline)
**Concept:** Follows the standing type ruling and desk v2's Linear sizing. The look is a quiet ledger on warm paper: hairline rules, no fills behind rows, and colour only on nodes and state words. This answers "clean … not heavy … not a live-database look".

| Token | Light | Dark |
|---|---|---|
| ground / surface | #f7f6f2 / #ffffff | #121211 / #1b1b19 |
| ink / ink-2 / ink-3 | #1b1a17 / #45433d / #605d55 | #ecebe6 / #c3c1b9 / #9d9a92 |
| rule | #dedbd3 | #2e2d2a |
| main line / branch line | #1b1a17 / #8c8880 | #ecebe6 / #7d7a72 |
| done / running / failed / you / idle | #1f7a45 / #a8670a / #c0321a / #1d4ed8 / #7a776f | #3fb36a / #e0a03a / #ef6a4f / #6b95ff / #8a877f |
| text variants (same order) | #1a6a3c / #8a5306 / #a62a15 / #1d4ed8 / #57544d | #74d398 / #f0bd66 / #f8957e / #9bb8ff / #b0ada5 |
| icon on fill | #ffffff | #121211 |

- **Type:** IBM Plex Sans 400/500/600 and IBM Plex Mono 400/500. Sizes 28/20/15/13/12/11 only.
- **Radii:** 4 for pills and the second-row squares, 8 for cards, full for circles.
- **Lines:** main 2 px solid. Branch 1.5 px dashed (4/3).
- **Nodes:** 18 px circles with a 2 px ground knock-out, and 8 px dots for events inside sprints.
- **Depth:** none; separation by 1 px rules.
- **Motion:** short (150–220 ms), no infinite pulse. NOW gets one static 2 px blue ring.
- **Measured:** marks at least 3.26:1 (the branch, light). Text at least 5.85:1. Icon on fill at least 4.56:1.
- **Risk:** the low emphasis could make NOW less findable, so it needs the static ring and its blue word.

### B. Signal Rail (transit map)
**Concept:** A metro-map treatment drawn from the owner's branch-timeline reference ("a running log that looks something like this image") and Structured's rolled-up consecutive timeline. Main is a bold rail and branches are dashed spurs. Nodes are stations and gates are platforms. It has the most graphic character of the three.

| Token | Light | Dark |
|---|---|---|
| ground / surface | #ffffff / #f4f5f7 | #0b0d10 / #15181d |
| ink / ink-2 / ink-3 | #0e1116 / #3b4250 / #5a6272 | #eef1f5 / #c0c6d0 / #9aa2ae |
| rule | #e3e6eb | #262b33 |
| main line / branch line | #0e1116 / #6b7383 | #eef1f5 / #7c8594 |
| done / running / failed / you / idle | #0f8a4a / #c27100 / #d1301f / #2448e0 / #7a8394 | #34c773 / #f2a531 / #ff6b57 / #6e8cff / #6f7787 |
| text variants | #0b6e3b / #8f5200 / #b3261a / #2448e0 / #545c6b | #5fe08f / #ffc061 / #ff8e7e / #9db1ff / #aab2bf |
| icon on fill | #ffffff | #0b0d10 |

- **Type:** Geist 400/500/600 with Geist Mono. This needs the owner to replace P-001-redesign-type.md.
- **Radii:** 6 on second-row squares, 10 on cards, full on stations.
- **Lines:** main 4 px solid with round caps. Branch 2.5 px dashed (6/4). The joins are 2.5 px quarter-circle curves with a 12 px radius.
- **Nodes:** 22 px stations with a 3 px ground ring, and 10 px for events.
- **Depth:** none.
- **Motion:** the line draws itself (keep the pen) at 300–600 ms ease-out. A pulse only on Running, once.
- **Measured:** marks at least 3.40:1 (running, light). Text at least 5.62:1. Icon on fill at least 3.71:1.
- **Risks:** the type ruling has to change. A 4 px rail risks the "heavy" look. Light amber icons sit at 3.71:1, the lowest margin.

### C. Soft Depth (iOS-native)
**Concept:** Soft, rounded and tactile, after the Abode, Tiimo and Lifesum references. Rows sit in grouped inset cards, each state word becomes a tinted chip, and nodes are rings filled with a soft tint.

| Token | Light | Dark |
|---|---|---|
| ground / surface | #f2f3f6 / #ffffff | #101216 / #1a1d23 |
| ink / ink-2 / ink-3 | #15171c / #424754 / #5c6270 | #eceef3 / #c2c6d0 / #9ba1ad |
| rule | #e2e4ea | #2b2f37 |
| main line / branch line | #2a2e37 / #7b8193 | #d5d9e2 / #737a88 |
| done / running / failed / you / idle | #23915a / #c47a12 / #d6452f / #3156e8 / #7d8392 | #45c27e / #eaa74a / #f2705a / #7593ff / #7f8693 |
| text variants | #17703f / #8c5208 / #b23420 / #2a4bd0 / #565c69 | #7fdca7 / #f5c47e / #ff9c8a / #a5b8ff / #aeb4c0 |
| icon on fill | #ffffff | #101216 |

- **Type:** Figtree 400/500/600 with JetBrains Mono. This also needs the type ruling replaced.
- **Radii:** 8 for chips, 16 for cards, 10 for second-row squares.
- **Lines:** main 2.5 px solid. Branch 2 px dashed (3/3).
- **Nodes:** 20 px.
- **Depth:** a soft shadow on cards, 0 1px 2px rgba(0,0,0,.06) plus 0 4px 12px rgba(0,0,0,.04) in light. In dark, depth comes from raising the surface.
- **Motion:** spring-like, 250–350 ms.
- **Measured:** marks at least 3.08:1 (running, light). Text at least 5.51:1. Icon on fill at least 3.42:1.
- **Risks:** "rounded shadowed cards" is a named AI-look mark. The tinted chips put a second patch of colour behind each state word. Light running is close to the 3:1 bar, and so are done (3.59) and failed (3.98).

## Recommendation
**A, Plex Ledger.** It is the only direction that keeps every standing ruling (Plex, the Linear scale, weights 400–600) as well as the basis. It fixes every measured failure: marks at least 3.26:1, text at least 5.85:1, and dark icons drawn on the fill instead of white. It removes the faded-opacity past rows; age would be shown by moving from ink-2 to ink-3, never below 4.5:1. It cuts the radii to three and the node sizes to two, which answers "not heavy". If the owner wants more character, B's quarter-circle joins can be taken into A at A's line weights without changing any meaning.

## Open questions for the owner
1. **Blue or vermilion?** The basis makes blue the owner's step. The desk's standing ruling (P-001-redesign-type.md, item 14) keeps vermilion `--you` as "needs you". Does the basis replace that ruling on the timeline only, or across the desk? I do not pick.
2. **Planned work above NOW** is drawn dashed in v5, but dashed means a branch. Should planned main become solid in the idle grey, or does "dashed" need a new entry in the key?
3. **Own milestones as diamonds and sprints as squares:** do these shapes get key entries, or are milestones and sprints drawn as plain circle dots with their words?
4. **Plan state words** (Reached, In progress, Planned, Not recorded, "Not reached in the records"): are they allowed beside the five state colours, or must each row use one of the five words?
5. **Type:** Plex as ruled (A), or would the owner reopen the typeface (B or C)?
