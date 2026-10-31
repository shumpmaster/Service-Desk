# Ruling needed: During the launch sitting, may notification taps open the desk's Home instead of the card for about 20 minutes?

Milestone: M3C
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: Your ruling is that a notification's tap opens its card. In the launch sitting as planned, the notification address changes to needs-you when you merge it (L3), but your phone keeps its old subscription, through the preview, until you re-subscribe on needs-you (L9): about 20 minutes by the plan's step times (an estimate). In between, the preview only opens its own address, so a tap opens the preview's Home, not the card; the card is one tap away on Waiting. The sitting's own deploy approvals (L4, L6) will each send such a notification. Moving the address after the phone re-subscribes shrinks the gap to about a minute, at the cost of one more preview and production deploy (about 6 minutes) and a re-planned sitting. If the sitting stops after L3 and you don't retry that day, the Builder takes the address back in a pull request of its own; until it merges, taps open the preview's Home. Needed before the sitting.
OPTIONS:
  A. Accept the gap, as planned — for about 20 minutes of the sitting (and, if it stops after L3, until the address is taken back), a tap opens the desk's Home; the card is one tap away on Waiting. Nothing else changes.
  B. Close it in code — your Chief of Staff and the Builder look for a change to the sender or the service worker that keeps card taps during the switch; a new pull request and its reviews, probably a day or more before the sitting (an estimate).
  C. Move the address last — deploy the desk to needs-you first, re-subscribe your phone, then merge the address change, so the gap is about a minute. One more preview and production deploy in the sitting (about 6 more minutes of yours), and the sitting's steps L3 to L6 re-planned: a short plan change by the Definer with the Reviewer's check, a few hours before the sitting (an estimate).
RECOMMENDATION: A — the gap is short, inside a sitting you are running anyway, and nothing is lost: every card still shows on the desk; C is the better fix if any tap opening Home would bother you.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: where a notification tap opens during the launch sitting
DEFAULT: A   TIMEOUT: 168

## Context
- Your ruling that a tap opens its card (source: decisions/questions/P-001-notifications.md)
- The address change merges at L3 and the phone re-subscribes at L9 (source: specs/S-001.md, the launch steps L3 and L9a to L9b)
- The preview's service worker opens only its own address (source: src/public/sw.js:21-30)
- The sender reads main's settings each time it sends (source: .github/workflows/desk-notify.yml:73-75)
- The Design reviewer raised it on the address change, and the Critic checked this question's wording (source: their reviews, to be filed verbatim with the address change's pull request)
