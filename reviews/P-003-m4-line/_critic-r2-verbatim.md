# P-003's milestone line (M4), the Critic's check, round 2 — verbatim

*Dispatched by the Chief of Staff in session session_01QBwHGMwrG5sPqzJg8VyemJ on 2026-11-04 against the working tree, after round 1's FAIL (_critic-r1-verbatim.md). Returned PASS. Recorded unchanged below. The Critic's run: 44,477 tokens, 8 tool uses, about 1 minute. After it, its non-blocking note 1 was answered in the brief only (notes with no usable `Recommendation:` line are treated as no notes); the line itself is unchanged.*

---

Verdict: PASS

Line checked (docs/PROJECT.md:118, working tree):
- Every decision card shows the Chief of Staff's recommendation, or says it has none (M4) · done when a decision card waits off the owner's queue until the Chief of Staff's notes for it are on the main branch, then shows with the notes' recommended answer and that answer's button marked Recommended, and, if no notes have arrived a day after it was raised, shows anyway marked "No Chief of Staff recommendation yet", gate cards staying as they are, and a card shown that way takes the recommendation once the notes arrive, on the desk's preview, with its tests · phase: Build · for: P-003 · why: twice on 3 November the owner answered a decision card the opposite way to what they meant, because the desk showed only a pointer to the Chief of Staff's notes and marked no answer as recommended

**Blocking findings:** none. Round 1's finding 1 is resolved. The new name says each card carries either the recommendation or a note that it has none. That matches the ruling's scope (decisions/questions/P-001-card-recommendation.md:23) and the brief's success line (PROJECT.md:595). The brief defines "decision card" as a non-gate card (:584), so gate cards being excluded does not make "every" untrue.

**Checked and sound**
- **Form:** the line parses against MILESTONE_LINE_RE (v3_checks.py:419-421) in order: name, (M4), done when, phase: Build, ` · for: P-003`, then ` · why:` last. There is no " · " inside the done-when or the why, and the why starts and ends with a non-space (WHY_RE :413).
- **Name:** NAME_ID_RE (:429) finds no code or id in it. It names an achievement in plain words, not a task.
- **Done when:** it describes states reached and nothing anyone does. Each part can be tested on the preview: the card held, shown with the recommendation, the one-day fallback, gate cards unchanged, and late notes replacing the mark. "with its tests" now fits a line with a single achievement (round-1 note 4 resolved).
- **Why:** unchanged from round 1, in plain words, and it says why the project needs the fix.
- **Id:** M4 is unique (as found in round 1; nothing new uses it).
- **Scope:** the line covers all four parts of the ruling's scope and adds nothing beyond it. The late-notes clause is how the ruling already reads ("once they are, it shows with the notes' recommendation"), now said outright (round-1 note 3 resolved).
- **Notes' real form:** decisions/Q-019/stop-1-notes.md:3 and decisions/Q-017/stop-2-notes.md:3 both open with `Recommendation: \`drop\`, ...`, a capitalised `Recommendation:` line with the word in backticks and more text after it. The brief's rule (:598), to take the word only from that line and only when it names one of the card's words, fits both. The old "first answer word" fallback is gone (round-1 note 2 resolved).
- **Brief and request agree with the line and the ruling:** brief :584-587 and :598, intake/requests/P-003.toml:3-9. The request's summary leaves out the late-notes case, but it is a summary and says nothing against the line.

**Non-blocking notes**
1. **One gap is still open: notes on main with no usable `Recommendation:` line.** Brief :598 says such notes "count as no recommendation, so no button is marked". It does not say whether the card is then held until the day is up and shown with the "No Chief of Staff recommendation yet" mark, or shown at once with no mark. If it is shown with no mark, it breaks the success line (:595) and the name's "or says it has none". The line's "then shows with the notes' recommended answer" does not cover this case either. The real notes always carry the line, so this is unlikely in practice. Route: Chief of Staff (brief wording) and Definer (spec): say plainly that such notes are treated as no notes.
2. **Still slightly past the ruling's words:** "off Home's count" (:584) and "with no button marked" (:586). Both follow from the ruling. The owner approves them with the brief.
3. **Place in the list:** a Build line after M3C's Launch line (:117). The owner rules the order when approving.
4. **Lead-in records (:105):** M4's approval record and Critic record are not listed yet. Add them once they exist.

Files: /home/user/Service-Desk/docs/PROJECT.md, /home/user/Service-Desk/decisions/questions/P-001-card-recommendation.md, /home/user/Service-Desk/intake/requests/P-003.toml, /home/user/Service-Desk/governance/checks/v3_checks.py, /home/user/Service-Desk/decisions/Q-019/stop-1-notes.md, /home/user/Service-Desk/decisions/Q-017/stop-2-notes.md, /home/user/Service-Desk/reviews/P-003-m4-line/_critic-r1-verbatim.md
