# P-003's milestone line (M4), the Critic's check, round 1 — verbatim

*Dispatched by the Chief of Staff in session session_01QBwHGMwrG5sPqzJg8VyemJ on 2026-11-04 against the working tree (docs/PROJECT.md:118, uncommitted). Returned FAIL. Recorded unchanged below. The Critic's run: 49,313 tokens, 8 tool uses, about 1 minute.*

---

Verdict: FAIL

The line checked (docs/PROJECT.md:118, working tree):
- The Chief of Staff's recommendation on every decision card (M4) · done when a decision card waits off the owner's queue until the Chief of Staff's notes for it are on the main branch, then shows with the notes' recommended answer and that answer's button marked Recommended, and, if no notes have arrived a day after it was raised, shows anyway marked "No Chief of Staff recommendation yet", gate cards staying as they are, on the desk's preview, each with its tests · phase: Build · for: P-003 · why: twice on 3 November the owner answered a decision card the opposite way to what they meant, because the desk showed only a pointer to the Chief of Staff's notes and marked no answer as recommended

**Blocking findings**

1. **The name claims more than the ruling and the line's own "done when" deliver.** "The Chief of Staff's recommendation on every decision card" says every card carries the recommendation. The ruling's scope (decisions/questions/P-001-card-recommendation.md:23) and this line's own "done when" both have a card show after a day *without* one, marked "No Chief of Staff recommendation yet". The brief's success line (PROJECT.md:595) says it correctly: every card has "either the Chief of Staff's recommendation marked or the 'No Chief of Staff recommendation yet' mark". The name therefore says something the ruling does not, and the owner would be accepting a name the work never reaches. The name needs rewording so it does not claim "every". Fixing it is not my job.
   - Routes to: P-003's Discovery, the Chief of Staff's milestone drafting. After the rewording the line comes back to me before it goes to the owner.

**Checked and sound**
- **Form:** the line parses against MILESTONE_LINE_RE (v3_checks.py:411-421) in order: name, (M4), done when, phase: Build, ` · for: P-003`, then ` · why:` last. The why has no " · " in it and starts and ends with a non-space.
- **Name:** NAME_ID_RE (:429) finds no codes or ids in it.
- **Id:** M4 is unique. The only other uses of "M4" in the repository are mutation labels in review files, SVG path data, and intake/requests/P-003.toml:8, which refers to this line. No spec or other milestone uses it.
- **Done when:** it describes a state reached, not a task. Each part can be tested on the preview with fixtures: held, shown with the recommendation, the one-day fallback, gate cards unchanged.
- **Why:** plain words, and it says why the project needs the fix (two wrong answers caused by the missing mark).
- **Scope:** the line covers all four parts of the ruling's scope (hold, show with recommendation and Recommended button, one-day fallback mark, gate cards untouched) and adds nothing beyond it.
- **Brief and request:** the brief (PROJECT.md:577-603) and intake/requests/P-003.toml agree with the line and with the ruling. Both have P-003, no `enters`, a short Discovery, approval at P-003's Design gate, review by the Reviewer and the design reviewer, Build and Launch gates, the owner approving the deploy, and the interim duty on the Chief of Staff. The brief leaves out pull-request cards, which is consistent: those come from pull requests, not queue/ (src/lib/board.js:555).

**Non-blocking notes**
1. **The brief goes slightly past the ruling's words.** It also holds the card "off Home's count" (:584) and shows the fallback "with no button marked" (:586). Both follow from the ruling and neither contradicts it. The owner approves them with the brief.
2. **The brief's "or their first answer word" (:598) could recreate the original fault.** If the notes have no `RECOMMENDATION:` line, the desk would take a recommendation from their first answer word, which could mark a button the Chief of Staff never recommended. Discovery should settle this before Build. (Chief of Staff / Definer)
3. **One case is not covered.** Neither the line nor the ruling says what a card shown under the fallback does when its notes arrive later. Read literally, "then shows with the notes' recommended answer" covers it. Worth making explicit in the spec.
4. **"each with its tests"** is carried over from the earlier lines, but this line has one achievement. Minor.
5. **Place in the list:** a Build line sits after M3C's Launch line (:117) and before the standard lines. That is reasonable for a later item, and the owner rules the order when approving it.
6. **Records not yet listed:** the Milestones lead-in (:105) does not yet name M4's approval and Critic records. Add them once they exist.
7. **One source not read directly:** I have no shell, so I could not run `git show 72966f0a:questions/P-001-card-recommendation.md`. I checked against the question and scope as the ruling record quotes them (:6-8, :23).

Files: /home/user/Service-Desk/docs/PROJECT.md, /home/user/Service-Desk/decisions/questions/P-001-card-recommendation.md, /home/user/Service-Desk/intake/requests/P-003.toml, /home/user/Service-Desk/governance/checks/v3_checks.py
