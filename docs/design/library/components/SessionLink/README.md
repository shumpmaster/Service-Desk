# SessionLink

Where an event happened, one tap away. Chosen by the owner on 24 November 2026 (decisions/questions/P-005-design-round-7.md: answer 2, "structure the desk with links back to the Claude sessions where the things happened"; answer 4, "provide links back to the Claude conversation when available, then when not to the GitHub agent run result or whatever is available there"; answer 5).

- **One tag per event**, on its first line beside Why: **Claude** (with a blue dot) whenever a conversation stands behind the event, otherwise **Run**, otherwise **PR**.
- **Claude first.** The session that did it; for a pipeline step, which runs on its own on GitHub, the Chief of Staff session at work on the project when it ran (matched by time from the session lines); for the owner's merge, the session that prepared it.
- **The bubble** says what that session set out to do, when it started and ended, and what else on the page it touched; its button opens the conversation, and the run or pull request is a quieter link beside it.
- The links are real: sessions from the commits' `Agent-Session:` trailers and `sessions/chief-of-staff/`; runs and pull requests from GitHub. A pipeline run is a log, not a conversation.
- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use.
