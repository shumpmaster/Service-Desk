# For the building session: the records the timeline design now assumes

*Written by the Chief of Staff's design session (session_01QBwHGLabYiZK6jrjfzcfBm) on 26 November 2026, for the session that owns the pipeline, the records and the operating model. The design session changes no spec, status, governance or pipeline file. This note lists what the timeline mockups (v17 to v36) draw from records that do not exist yet, so the building session can decide how, and whether, to keep them. It sits beside docs/design/requests/2026-11-15-agent-action-records.md (each agent's actions in plain English), which still stands.*

## What this means for the owner
The timeline you have ruled on draws some things the records do not hold yet. In the mockups they are examples, marked so. For the desk to show them for real, the pipeline has to start keeping ten kinds of record. Some need nothing more than a field filled in. Others are new: an answer you give from the desk, the run under way right now, and when you last looked. Each item below says what it is, where the design uses it, what exists today and what is missing. Nothing here is decided until the building session takes it up and puts any ruling it needs to you.

## The records

1. **When each milestone and sprint began, or is meant to begin.**
   - Used for: the order of the list, top down by when work began or is meant to (v26, R6 answers 13 and 14); a phase with no events showing its planned milestones on the map (v34, round 8 answer 6, item 6).
   - Today: no record carries a milestone's or sprint's start, or a planned start. The mockups' start times are examples.

2. **Which event needs which, and why each happened.**
   - Used for: Needs and Then unlocks on an event, the chain on the map (v17, v21); the Why sentence on each event (v19, v21).
   - Today: no record says which event needs which, or why an event happened. Every requirement and reason drawn is an example.

3. **The Claude session behind each pipeline run.**
   - Used for: each event's link back to the conversation behind it, Claude first, then the run or pull request (v27, R7 answers 2 and 4), and the session's name on the tag (v34, item 9).
   - Today: the pipeline's steps run headless in GitHub Actions (`gha-<run>` trailers); the mockups match each run to the Chief of Staff session at work then, by the session lines' start and end. No record joins them.

4. **Each milestone's criteria, and which pass.**
   - Used for: a milestone's gauge, criteria met of its criteria (v32, R7 answers 25 and 26); the dashed empty ring where none are on record (v34, item 11); a gate's sheet listing what it waits for (v35).
   - Today: only M6 has a count from a spec (S-011's 38 acceptance criteria, none passing). Design-5, Design-3 and Design-6 say what they would count.

5. **Each place on the desk having its own address.**
   - Used for: a session linking back to the exact place on the desk (R7 answer 4's way back); the Context view's links.
   - Today: the desk has no addresses below the project.

6. **An answer given from the desk.**
   - Used for: the stop card's Answer and its choices (v35, round 8 answer 9); a question's Answer in the list of what waits on you (v36, round 8 answer 12, item 4).
   - Today: the owner answers in a Claude session or on GitHub. No record says the desk can record an answer; every Answer button in the mockups is an example that sends nothing.

7. **The pipeline at work right now.**
   - Used for: the At work now row and its sheet (v36, item 5).
   - Today: the Chief of Staff's start and what it set out to do are in its session lines (sessions/chief-of-staff/), and the pipeline's last dispatch is in dispatch-log/. Nothing records that a run is under way right now; the desk would read GitHub's run status.

8. **When the owner last looked.**
   - Used for: the blue dot on what is new since you last looked, and the count on the phase heading (v36, item 6; P-001-design-discovery answer 8).
   - Today: nothing records it. It may belong on the phone rather than in the repository. The time in the mockup (13 Nov, 11:00 pm) is an example.

9. **A session's own tokens and context.**
   - Used for: what a session used, in its link bubble: its helpers and their tokens, and a context meter (v36, item 8; P-001-usage-and-context ruling B).
   - Today: helpers' tokens are recorded in 174 of 184 helper lines. Every session's end line has fields for its own tokens, its context window and its context peak, but they are blank in all 49. The context meter is an example.

10. **A pipeline run's tokens.**
    - Used for: the same bubble, for an event a pipeline run did (v36, item 8).
    - Today: a run keeps only its model and turn limit (reviews/*/_control/*.json), not its tokens.

## Open for the building session to settle
- Which of these the pipeline should keep, and where each lives so the desk can read it.
- Which need a ruling from the owner first: an answer recorded from the desk (6) changes how rulings reach the repository; when the owner last looked (8) may belong only on the phone.
- Whether the numbers and the order can be worked out from records already kept (1), rather than stored.

## The pictures
The current mockup and what each version adds: docs/design/mockups/TIMELINE-CURRENT.md. The options behind items 6 to 10: docs/design/mockups/options-r8-kinds/ and options-r8-purpose/ (each README lists its records).
