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
