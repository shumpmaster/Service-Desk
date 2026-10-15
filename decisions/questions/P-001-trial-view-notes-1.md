Ruling: on the desk's Home screen, each card shows a brief project summary taken from the project's README, the "latest" line moves into a bubble that opens on hover or tap, the cards stay a grid on the phone, and the projects sit in three collapsible groups: Active, Done, and Closed or not run by the desk
Proxy: done at the owner's request (the owner wrote in the session on 2026-10-14 after trying the sandbox on the preview, and answered two follow-up questions; each is quoted verbatim below)

The owner's notes, verbatim:
"On the trial view. A few notes:

1. Can we introduce a brief project summary  that doesn’t get clipped off at the top of the card on the home page that takes the place of the “latest” text.
2. Move the latest text the be a popup bubble that appears on hover (and the mobile version of hover) also not clipping it.
3. Currently on my phone the cards are just single rows, I liked the summary view being a grid of sorts so I could look across multiple projects - can we condense the current structure down to accommodate that?
4. Can we introduce essentially a collapsible function for projects that aren’t active or, in this case not covered by the service desk?"

Follow-up questions and answers:
1. "Where should each card's brief project summary come from? (The desk never writes its own words about a project.)" Answer: "README's first paragraph (Recommended)" (option text: "Each project's own README already opens with what it is. It updates itself when the project changes. I'd also tighten Service Desk's README opening, which today is vague."). The other option offered: "A line in the desk's settings".
2. "Which projects go in the collapsible group, and how does it start?" (options "Not run by the desk, or Done; closed (Recommended)" and "Same group, starts open"). Answer, in the owner's words: "Active, Done, and closed or NA so 3 collapsible groupings"

How it is read:
- Summary: the first paragraph after the title in the project's README.md on its default branch, shown whole (it wraps, never clipped). With no README or no paragraph, the card says "no summary in this project's README".
- The "latest" line (today the "where it's heading" line of AC37, or a v2.5 project's latest ledger title) is no longer printed on the card; a small control on the card opens it in a bubble, on hover with a pointer and on tap on a phone, never clipped.
- The grid: two columns on a phone, as in the lab's Home screen.
- Three groups, each collapsible: Active; Done; Closed or not applicable (a project the desk does not take through its phases, such as a v2.5 project, or one that was closed). Active starts open; Done and Closed or not applicable start closed. A closed group's header still says when something in it waits on the owner, so nothing that needs the owner is hidden. The phone remembers each group's open or closed state.
- This is the owner sending the candidate back with changes (AC44 step 3); the pick of the five screens stands.

Further notes (batched; the owner asked on 2026-10-14: "Well I still have more review to perform, should we log all of the requests then batch them through at once?"):

5. On the Status screen (screenshot: docs/design/references/trial-view/2026-10-14-status-1119.png, 11:19 on the owner's phone), verbatim: "On this page- 2 things, you are technically waiting on me right now but that isn’t shown here."
   How it is read: the screen was right about the records: nothing waiting on the owner had been filed in Service-Desk. The asks were only in the session (the S-031 approval and S-001's ten design-lab questions). The fix is in the process, not the screen: every ask of the owner is filed as a question or card in its project, so the desk sees it. Those two are filed in their own pull requests.
6. Same screen, verbatim: "Right above that bar, can you record my last action or decision just so I can orient to it quickly"
   How it is read: just above the "Nothing waits on you" / "N waiting" bar on a project's Status screen, a line "Your last action:" naming the owner's most recent recorded decision (a ruling file or card answer) or merge in that project, with its time and a link to its record; "not recorded" when no record gives one.

Notes 7 to 13, the owner's message verbatim (with five screenshots, docs/design/references/trial-view/2026-10-14-merge-sheet-1127.png, -queue-1128.png, -team-log-1130.png, -timeline-1131.png and -timeline-1133.png):
"The more detail section on the bottom of that same page takes me back to an outdated version?

The back button takes you all the way back to the home page, please introduce a second back button that just brings you back 1 page if possible.

This popup screen has no easy way to just close out the pop up, please make sure that exist on every pop up

Should done today really be 2 p-001 records?

The running log is messed up on every pop up

The timeline doesn’t look like what we discussed originally, and additionally it’s a little difficult to exactly grasp the timeline flow and critical elements

And last item on this pass is the milestones in the timeline are so bland you would honestly miss them, nor does the grouping function work here for the actual tkmeljne"

How each is read:
7. Status screen, "More detail": its links open the accepted M2 views (Pipeline, Time asked, Agents), which keep the old look (AC36 keeps every M1/M2 view reachable). To settle in the batch: either those details are drawn in the new design inside the sandbox, or the links say plainly that they open the current desk's view.
8. Back: the header's back control goes to Home. Add a second control that goes back one screen (the previous screen in the sandbox's own history), keeping the Home one.
9. Sheets (the pop-up panels, such as the pull request sheet at 11:27): every sheet gets a visible close control at its top, as well as closing on a tap outside it or the Escape key.
10. "Done today" listed two Service-Desk rulings (P-001-reviewer-verdict-files and P-001-design-pick). They are two separate rulings made today, so two rows is right, but each row shows only its file name. Each row should say what was ruled in words (the ruling's first line), with the code after it.
11. The Team screen's running log (11:30): the branch line is drawn wrongly (lanes start and end at angles, dots off the line). Fix the drawing on every member's log.
12. The Timeline does not match the agreed screen 4 (docs/design/screens/04-timeline.html: one line per phase run, newest at the top, tinted icon tiles on a thin line, iterations, stalls and confirmations in place), and its flow and critical points are hard to grasp. Rebuild it to the agreed screen.
13. The Timeline's milestones are too plain to notice, and the grouping (steps under the milestone they belong to; the standard milestones box folding away) does not work on the real timeline. Make milestones stand out as headings on the line, and group each phase run's steps under their milestones as the agreed screen does.

Notes 14 and 15, the owner's message verbatim (2026-10-15):
"Two more things to add - 1 it seems like every time the app refreshes it will revert popups in utilizing or it will close pages.

2 whereever a ruling is requested can you format it in a question, then answer box that would then prefill my rulings?"

How each is read:
14. Each minute's refresh redraws the screen and loses what the owner was doing: an open sheet or bubble closes, a page jumps back, typed text or a picked option is lost. A refresh must keep the screen as the owner left it: the same screen, any open sheet or bubble, the scroll position, and anything typed or picked; new data fills in around it. Only the owner closes what they opened.
15. Wherever a ruling is asked of the owner (an owner question in questions/, a decision card, a gate card), the sheet shows each question on its own, followed by its own answer box: the options as choices when the question lists them, the recommendation labelled but not picked, and a text box for the owner's own words. The answers then prefill the ruling file the owner commits (decisions/questions/<name>.md for a question, the card's answer file for a card), each answer under its question's number, in the form the project's rules require. A question file holding several numbered questions (such as questions/P-001-design-lab-open.md) gets one question-and-answer pair per number.

The batch closed, the owner's words verbatim (2026-10-15): "That’s everything for this batch"

Note 7 settled: "Note 7: the Status screen's "More detail" links open the old desk's Pipeline, Time asked and Agents pages. What should they do?" Answer: "Rebuild in new design (Recommended)" (option text: "Those three views get drawn in the new look inside the trial view, so you never land somewhere that looks like a different app. It makes this batch's build bigger."). The other options offered: "Keep, label clearly" and "Remove the links".
