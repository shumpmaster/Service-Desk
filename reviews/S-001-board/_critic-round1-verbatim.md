# Critic, round 1, on the board amendment (S-001 AC80, J22) at 0670766 (verbatim)

Verdict: FAIL

**For the owner:** The amendment builds what you asked for and ruled: three lanes side by side, smaller text, one button per card, "Verdict" only when a change's risk needs it, one button per option on questions, about 5 minutes before a card is kicked back, and Done keeping 24 hours. Two things have to be fixed before it can be built.
- **A wrong "merge" prompt.** If you ask for changes on a pull request, the desk would still show it as "Step 2 of 2: merge". That is the 19 October mistake in a new form.
- **Missing gate details.** When you rule on a gate, the card's details no longer show the case summary or the links to the case and the Critic's view. They also no longer say what happens after each answer. You never asked for these to go, and the mockup didn't show gate cards.

One more thing is for you to decide, not the Definer. You said twice that you move the card first and then act. On the approved board, once a card is in Done its button is gone and only "Undo" is left.

How I checked: I have no shell, so I couldn't run `git diff 304144d..0670766` or `git show origin/orch/board-mockup:…`. I read specs/S-001.md as it is in /home/user/sd-def-board, and the owner-request file, board.html and board/README.md as they are in /home/user/sd-orch-board. I couldn't confirm those copies match commit 0670766 and b3e2a6b. The five rulings I read on the def-board worktree.

**Blocking**

A. **A "requested changes" verdict makes the card the merge** (lines 9223–9226, 5366, 5377–5378, 5284). J22 counts "its verdict is on its branch" when `reviews/<n>/owner.md` is there, whatever it says, or when the owner check reads "Owner requested changes". A confirmed verdict then brings "Step 2 of 2: merge" with the note "Verdict in. Next, the merge." So a FAIL verdict, or one the owner edited on GitHub (which line 5323 allows), sends the owner to merge. owner_signal.py:165-166 posts `failure` "Owner requested changes" for exactly that case. Confirming the verdict step is fine. Offering the merge after it is not. The criterion needs a step, or "Open ↗" with words, for requested changes, and a test case for it. Route: Definer.

B. **The board's sheet drops what the response sheet showed for gate, hold and merge cards** (5324–5338 against AC52 3193–3219). AC80 replaces AC52's response sheet. Its sheet list leaves out:
- a gate card's quoted case paragraph, its links to the case and the Critic's view, and the user-representative line;
- "what happens next" for each option;
- a gate card's quoted recommendation (the "Recommended" label at 5303–5305 covers lettered questions only);
- AC46's and AC47's words for hold and merge cards;
- "what was checked" (CI, AC29).

The page still reads the case and the Critic's view (line 8016), but nothing shows them. No ruling or mockup removes these: version 5 draws no gate cards, as line 1525 says. The "differs from the mockup" list doesn't name the loss, and the owner summary doesn't mention it. A one-tap gate ruling with no route to the case is not a choice the Definer may make alone. Either carry these into the sheet, or list the removal for the Chief of Staff to put to the owner. AC52's cases that stand (3116–3118) should then name them. Route: Definer.

**Non-blocking**

C. **The lane's name was never shown as confirmed** (1469–1476, 5244). P-001-board-bounce.md line 14 says the lane is "named in the redone mockup for the owner to confirm". Version 5 still carries "'Kicked back' is your word; the name is yours to confirm" (board.html:138). The spec uses "Kicked back" without saying the owner's approval of version 5 confirms the name. Say so and cite it, or have the Chief of Staff ask. Route: Definer, with the Chief of Staff if it isn't settled.

D. **The owner's order, "move then act", isn't supported** (5347–5348; board.html:241-244). The request says "I drag and drop a … card to complete and then I click the one link". The version 2 follow-up says "if i move a card over and then pass my verdict or update". An unconfirmed Done row offers only "Undo", with no step button. Version 5 is drawn the same way and the owner approved it, so this is not the Definer's error. It is still worth one question: should an unconfirmed Done row keep its step button? Route: Chief of Staff, to the owner.

E. **The why line claims more than the desk knows** (5331, with 9230–9233 and 9246–9249).
- "It needs no verdict from you, only the merge." also shows while the owner check is not read, not yet posted, past the 3-head cap, or unreadable in the private project. In those cases a verdict may in fact be needed, for example a weakened test. The words need hedging there, for example "By its files, …".
- (b) reads only `Owner verdict needed`. "Owner: after agents · …" is also `pending` (owner_signal.py:172-179) and gets neither a step nor words.

Route: Definer.

F. **Two silent removals.**
- AC53's text box goes as "(C)" (5322–5323). That reverses the owner's 13 October words ("a text box … write up my message"). The removal is backed by ruling C ("one tap and commit") and the approved version 5. Cite those instead of (C), and tell the owner in the plain summary (1427–1452).
- AC52's "how long it has waited" (3156) is on neither the card nor the sheet (5273–5278, 5324–5330). AC52's note (3112–3118) doesn't list it among the replaced parts. Say it goes, or keep it.

Route: Definer.

G. **The "unchanged" claims are wrong in places.**
- Lines 1566–1567 call AC1–AC51 and AC54–AC61 unchanged. AC14's test (2015), AC24 (6597) and AC56 (3755) were changed.
- Home's top line gains "Nothing waiting on you · confirming with GitHub" (5351–5352). Line 1512 says other screens keep everything but their counts, and the owner summary doesn't mention it.

Route: Definer.

H. **One top line can't be tested as written** (5249–5250). With 0 waiting and some kicked back, the words don't say whether the line reads "0 waiting on you · 1 kicked back" or "1 kicked back" (version 5, board.html:249). Route: Definer.

I. **A few gaps in what the card and board show.**
- The card's contents (5273–5278) omit the kicked-back reason and the step 2 note, which 5298 and 5381 put on the card.
- An AC77 question whose answer is being recorded has no place on the board: it is in no lane and no quiet line (5266–5272).
- AC77's check that an item is still open when an answer link is tapped (5980ff) isn't restated for the board's links. It stands by default, but the board's plain links make it easy to miss.

Route: Definer.

J. **One test lacks its fixture** (5456 against 5429–5431). "Version 5's eight example cards all in view" needs a fixture of those eight cards, and the test's fixture list doesn't name one. Route: Definer.

K. **Cosmetic.** Lines are wrapped raggedly, with one or two words alone on a line, at 1438–1443, 1501–1505, 5355–5358, 5392–5397, 5402–5413, 5442–5444 and 9251–9253. Route: Definer.

**The (C) choices I checked and found within the Definer's lane:**
- one board per project;
- the step table, and "Open ↗" where the step isn't known;
- one button per word for decision and gate cards, with `Reason: ` and `Into: ` left for the owner;
- the device key `desk-board-marks-v1` and its failure words;
- `KICK_BACK_MINUTES` as a setting, a failed read kicking back, and a mark judged only after the first successful poll;
- Done's sources from the records;
- the quiet lines and their folds;
- the notification tap's lane rules;
- the 3-head owner-check cap;
- Setup G4 left optional;
- the bottom "Close" at 36 px, which is version 5 as drawn.

Rulings A/A/A/C/B are each quoted word for word and applied. The plain summary is plain and honest about the private-project gap, but is short of items B, F and G above.

Files: /home/user/sd-def-board/specs/S-001.md; /home/user/sd-def-board/decisions/questions/P-001-board-*.md; /home/user/sd-orch-board/docs/design/references/owner-request-2026-10-19-board.md; /home/user/sd-orch-board/docs/design/mockups/board.html; /home/user/sd-orch-board/docs/design/mockups/board/README.md; /home/user/sd-def-board/governance/checks/owner_signal.py
