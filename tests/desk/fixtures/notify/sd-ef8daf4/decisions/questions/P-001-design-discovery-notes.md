# Design discovery map (Researcher, discovery pass, 2026-10-07)

This is a map of questions, not graded fact. It shaped the eight owner questions in P-001-design-discovery.md and research Q-010 and Q-011.

Key: O = only the owner can answer; R = published research answers it; E = an experiment answers it, in the design lab or the sandbox.

## Questions an expert would ask
- **A. Goals and use moments**
  - A1 When the desk is opened: a glance, a review, or both (O).
  - A2 What the owner wants to be able to say after 5 seconds (O).
  - A3 What "the outcome is shaping up to be" means, as an example sentence (O).
  - A4 Phone only, or also a laptop (O).
  - A5 How long a real visit is (E).
  - A6 How often the Access login interrupts a glance (E/R).
- **B. Information architecture**
  - B1 One to-do list, or waits grouped by project (O).
  - B2 Which of each project's facts show and which fold away (E).
  - B3 Where usage, the timeline and planning live: the main scroll, tabs or drill-downs (E).
  - B4 Whether boxes reordering on each poll causes mis-taps (R/E).
  - B5 How a v2.5 project's reduced view avoids looking broken (E).
- **C. Visual language**
  - C1 Calm or rich, and a reference app (O).
  - C2 How many statuses need their own colour or icon (R).
  - C3 Whether "needs you" should be red (O+R).
  - C4 Icons with or without labels (R).
  - C5 Personality versus a plain tool (O).
- **D. Data visualisation**
  - D1 A linear stage track misleads when work loops back or stalls (R/E).
  - D2 Whether a track belongs to each item or each project (E).
  - D3 Whether any data exists for "next events" (E).
  - D4 Putting minutes and days on one time axis (R/E).
  - D5 What the owner would do with a context or usage gauge (O).
  - D6 Whether the gauges' denominators exist at all (R).
  - D7 Whether an "outcome so far" line can be built from the records without guessing (E).
- **E. Interaction**
  - E1 Feedback after answering, before the answer is read back (E).
  - E2 Answering inline versus reading first (O).
  - E3 Touch targets and thumb reach (R).
  - E4 A manual refresh against the request budget (E).
  - E5 Flicker or scroll jumps on the 60 s re-render (E).
- **F. Notifications and attention**
  - F1 How the owner learns of waits while the desk is closed (O+R).
  - F2 How fast a card needs the owner (O).
  - F3 Whether irreversible or self-defaulting decisions differ from routine PRs (O).
  - F4 "New since you last looked" (O/E).
  - F5 A count in the tab title or favicon (E).
  - F6 Keeping activity visually below "needs you" (E).
- **G. Accessibility**
  - G1 The owner's reading conditions (O).
  - G2 Colour not used alone, and contrast minimums (R).
  - G3 Charts surviving large text and zoom (R/E).
  - G4 Reduced motion (R).
- **H. Performance and technical constraints**
  - H1 Charts hand-built in CSS or SVG, with no packages, because the deploy installs nothing under src/ (known).
  - H2 Whether the security headers allow the fonts and SVG a mockup assumes (E).
  - H3 Installing to the home screen, and how that works with Access (R/E).
  - H4 How the sandbox is entered without weakening trust in the real view (O/E).
  - H5 Extremes: 5 projects, 12 waits, long titles, a 360 px screen (E).
- **I. Trust and honesty**
  - I1 An "as of" marker per project (R/E).
  - I2 Stale data visibly degrading (R/E).
  - I3 Progress bars implying a percentage done (R).
  - I4 Telling unknown apart from zero (E).
  - I5 Quoting records versus summarising them (O).
- **J. Iteration and testing**
  - J1 How the owner judges mockups (O).
  - J2 What counts as better: a 5-second glance test, V2 and V5 (R/E).
  - J3 Who reviews design and accessibility, with no human designer (O).

## Gaps the map found in the first draft of Q-010
1. Attention while the desk is closed: polling only while open can't meet "I don't want to have to remember to ask".
2. Change awareness on a live screen: reordering, "new since", layout shift.
3. Stages that loop back or stall, and items in one project sitting at different stages.
4. The "outcome so far" line, and summarising without overclaiming.
5. Missing and estimated values inside charts.
6. The timeline's future half, which has no forecast data.
7. Mixed time scales.
8. How to evaluate a design built for one user.
9. Information-design literature.

The draft also over-weighted settled checklist items (touch targets, contrast) and gauges whose use and data were unproven.

## Design traps to avoid
1. Beautiful but still pull-only.
2. Busy hides the action.
3. Decorative charts.
4. False progress.
5. Polish implies freshness.
6. Alarm fatigue from colour.
7. Targets that move under the thumb.
8. An overclaiming outcome line.
9. Designing on ideal data.
10. Constraint creep: chart libraries, blocked fonts, refresh against the request budget.
11. Judged as pictures, used as glances.
