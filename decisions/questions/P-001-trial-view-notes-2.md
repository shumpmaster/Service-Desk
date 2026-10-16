Ruling: trial-view notes, batch 2 (open): wherever the desk shows phases in order, a phase that runs again branches to the right, so the list reads in order and shows where each run branched and which milestones followed
Proxy: done at the owner's request (the owner wrote in the session on 2026-10-16 with a screenshot of the preview's Status screen, docs/design/references/trial-view/2026-10-16-status-phases-0649.png, 06:49 on the owner's phone, and answered two follow-up questions; each is quoted verbatim below)

1. The owner's note, verbatim:
"All of your suggested changes and such have landed well, I am noticing one thing here though - the app shows us back in a design iteration but also implies build is done? Chronologically that can’t be true"

Follow-up questions and answers:
1. "That screen is reading the records correctly, but the way it shows them is misleading. Build's first run did finish: those were M1 and M2, the working desk. Then the project went back into Design for a second run (\"i2\") for the new look, and Build will run again after it. How should the phase list show that?" The owner answered in their own words: "Little bit of a conceptual leap her so we might need to mock this up. But I think anywhere we have chronological phases like this, we should incorporate a branch style visual. By expanded out a second, third, fourth (however many are applicable) dot set to the right of the original milestone dot. Therefore this could read in a chronological order but also show where the iteration branched and what milestones followed suit". The options offered: "Mark the earlier run (Recommended)", "Show the runs in order", "Reset later phases".
2. "Is this one change on its own, or the start of a new batch of notes?" Answer: "Start a batch" (option text: "I log this as note 1 and wait until you say the batch is done."). The other option offered: "Just this one".

How it is read:
- The phase list keeps its four phases (and Done) in order, top to bottom, with one dot per phase.
- When a phase runs again, its new run starts a second column of dots to the right, beside the phase it went back to. The phases that follow it in that run carry on down the new column. A third or fourth run adds a third or fourth column. So the first column shows the first run (here Discovery, Design i1, Build i1), and the second shows the run now under way (Design i2, then Build i2, Launch and Done still to come).
- "Anywhere we have chronological phases like this" covers the Status screen's phase list and Home's phase checklist; the Timeline already draws runs and is checked against this.
- A mockup comes first, for the owner to judge, before any spec change.
- The batch stays open until the owner says it is done.

The owner's answers on the mockup (docs/design/mockups/phase-branches.html, published privately as "Phase Branch Mockup"), verbatim, 2026-10-16:
"This is the exact picture I had in mind. Every box list it’s runs as well, but in smaller de emphasized text, yes to point 3."
The mockup's three questions, as put: 1. "Is this the picture you had in mind: one column of dots per run, branching right?" 2. "On the Status screen, should each phase box list every run (as here), or only the latest run with the earlier ones one tap away?" 3. "Should the Timeline screen use the same branch drawing, or keep its strip of runs?"

How it is read:
- 1: yes, one column of dots per run, branching right.
- 2: every phase box lists all its runs; the earlier runs are in smaller, de-emphasized text, and the latest run reads at full size.
- 3: the Timeline screen uses the same branch drawing.

2. The owner's note, verbatim (same message):
"Additionally, when a phase was completed but branched off, make the dot fill lighter than a fully completed phase"

How it is read: a phase that finished in a run the work later branched away from (here Design i1 and Build i1, which run 2 went back over) has a lighter-filled dot than a phase that finished and stands (here Discovery). The difference is also said in words, never by colour alone.

Notes 3 to 9, the owner's message verbatim (2026-10-16, headed "Trial-View Notes", numbered 1 to 7 by the owner; with a screenshot, docs/design/references/trial-view/2026-10-16-release-changelog-example.png, and a code snippet kept whole, byte for byte, at docs/design/references/trial-view/2026-10-16-release-changelog-snippet.html, which the owner's point 7 is):
"Trial-View Notes

1. Unsure how to describe it, but the general spacing of things. I dont hate it, but there are spots that seem too spaced, and then some spots that seem too tight. 
2. Is there a way to "fix" the window so that i cant zoom in to a page? 
3. General polish of text. There is a lot of text throughout the service desk - which i want specifically - however if all of the text is formatted almost identically it all kind of blurs together. 
4. When i look at the status page, i see two things that i want to address. The milestone groupings are great, but what is missing on this page is the "holistic phase & milestone look" what i mean by that is that when we show the standard milestones that we DONT do for a particular project, it doesnt easily translate to what we DO take on - in chronologgical order. The other thing is that every milestone within the phases should have a short snippet of "why this phase was included or not included"
5. Right now on the timeline page the phases seem discrete. I want them to be complete, from start to finish. 
6. I have a code snippet for a tyoe of list component i want to take place of the timeline - please see point 7 below. The screenshot attached shows the general look. Its a dynamic release timeline that i want to adapt. I want the title of each "release" point to be a plain english description of the specific task. Then a technical sub bullet. Then a "context/what" bullet. Then a why bullet. I do still like the checkmarks and such on the right side of the screen. 
7. [the code snippet, kept whole at the path above]"

In this batch these are notes 3 (owner's 1), 4 (owner's 2), 5 (owner's 3), 6 (owner's 4), 7 (owner's 5), 8 (owner's 6) and 9 (owner's 7, the snippet). How each is read is recorded with the owner's answers to the follow-up questions.
