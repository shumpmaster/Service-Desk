Verdict: FAIL

The spec's header, plan trace and citations hold up. It is not ready to freeze, because some criteria depend on records I can't see and because of the gaps below.

**What checks out**
- The `milestones: M6, M7, M8, M9, M10` header matches docs/projects/P-005.md lines 72-76, and all five are in section 3 of that plan. The spec doesn't use another item's plan.
- Every V-trace names V7, V8 or V9, which exist at plan lines 128-130.
- Every library file the spec cites is in the pack. I read four claims against their text: F-gh-env-01, F-asof-age-label-01, F-cf-02 and F-rec-pr-review-fields-01. I also checked docs/PROJECT.md lines 115, 116, 205-209 and 588-593. The spec's use of the first three claims and the PROJECT.md lines matches the files.
- The F-gh-env-01 citation is slightly loose. Spec line 141 says "only on public repositories on Free and Pro", while the fact covers Free, Pro and Team. That doesn't change any criterion.

**Findings that block the freeze**
1. **AC40, AC41 and J11 depend on files not in the pack.** They cite `experiments/P-005-E1.md` ("Rule") and `experiments/P-005-E2.md`. Neither exists here, and `reviews/S-010/_src-reading.md` doesn't either.
   - AC40 says the V7 count "uses exactly E1's rule". I can't verify that, so it is unverifiable. The spec itself says freeze waits for both experiment results (J11, line 100).
2. **AC33, AC34 and AC36 are coverage rules with empty lists** (spec lines 58, 61, 63). They point to the follow-ups ruling, intake/later-work.md, docs/design/README.md and a reading of src/, none of which the definer had.
   - A Check author can't write a locked check for "each follow-up is built or shown covered" when the follow-ups aren't listed. M9 and M10 are therefore untestable as written.
   - AC31 has the same problem: it makes M9 wait on a ruling that doesn't exist yet.
3. **AC15 has no mechanism for its phone notice.** If the alert route has stopped, it can't send "Stopped since…". J7 gives the outside check only a heartbeat and a state.
   - The notice would need a second push path from the outside check. That could mean a new service, a credential or src/notify changes, which the Stop rule and AC38 forbid or put to the owner.
   - AC15 and J7 need to say who sends the notice.
4. **AC14 and AC8 rest on undefined or unset figures.** "Twice the read interval" has no interval anywhere in the spec or plan. AC8's 2-hour stall time is only a draft (open questions 4 and 5).
   - A criterion whose threshold isn't fixed can't be locked.
5. **J5 may contradict AC38.** J5 says the route "keeps the last list it sent from". If the route is "a program on a Cloudflare timer", that stored list is a copy of waiting entries kept on Cloudflare. AC38 and plan line 120 say Cloudflare holds no copies.
   - The spec should say where that list lives.
6. **AC3 changes the plan's record-writer set** by adding "the owner" (plan line 40 names three writers). It's open question 6, but AC3, J1 and AC42 already build on it. Settle it before freeze.

**Smaller points**
- AC17 fixes a 390-pixel width. The owner's design records use 360 and 414. That isn't wrong, but name the widths so the check matches the mockups.
- Several traces are thin. AC29 (briefing mark) traces to V7, and AC30, AC31, AC33 and AC35 trace to V8, though none of them changes wait time or unseen steps. They don't fail, but the trace means little for them.
- M6 has no acceptance criterion of its own. It lives only in J11 and in AC1 to AC8's "(M6, M7)" label. Add one so M6 can be locked.

**Join-up review (docs/design/JOIN_UP_REVIEW.md form)**
Screens: the timeline, Home, Project, Team, the Timeline screen, Queue with its response card, the notifications and the widget. There are no mockups for the timeline, and README.md is outside the pack, so I can't set them side by side.

| Check | Rating | Note |
|---|---|---|
| One meaning per colour or status signal | Blocking | J2 and AC4/AC5 are consistent with each other and with PROJECT.md:115 (green and red). Nothing exists to check against, so it can't pass. |
| One navigation | Blocking | AC35 and AC24 give the intent. No design shows it. |
| Consistent type, spacing and codes | Blocking | No design to check. |
| No two screens doing the same job | Non-blocking | AC20 and J4 share one waiting list. AC34's per-screen lists are empty (finding 2). |
| Every screen's data available from the records | Blocking | Waits on E2, whose file is absent. |

Carry the blocking rows to the Design gate. Design can't be marked done on this spec until the mockups and E2's table exist.

**Open questions**
- Which route and outside check will send the "stopped" notice (finding 3)?
- Where does the alert route keep its last-sent list (finding 5)?
- Will E1, E2 and the src/ reading be added to the pack before the freeze review?