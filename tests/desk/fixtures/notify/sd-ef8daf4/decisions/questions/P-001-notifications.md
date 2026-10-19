Ruling: phone notifications are sent as Web Push to the desk installed on the owner's iPhone Home Screen, by the Orchestrator's GitHub run when it raises a card; the subscription is kept as a GitHub secret the owner sets; no database and no new Cloudflare service; built in M3
Proxy: none; the owner answered in the session on 2026-10-08 (multiple choice, verbatim selections below)

Basis: research/Q-011-memo.md (revision 6, source check PASS, merged into main by the Orchestrator 2026-10-08). The owner's discovery answer 1, "Phone notifications" (P-001-design-discovery.md).

Questions and answers:
1. "What phone do you use for the desk?" Answer: "iPhone".
   Consequence (Q-011 W1, W3, W4): Web Push works only for the desk added to the Home Screen as a web app (iOS/iPadOS 16.4 or later; manifest display standalone), and permission is asked after a tap, never on load. iOS 18.4 and later also offer Declarative Web Push, which needs no service worker to show a notification (D1).
2. "How should the desk tell you something needs you while it's closed?" Options offered:
   - "Desk push via GitHub (Recommended)": when the Orchestrator raises a card, its GitHub run sends a push to the installed desk; the owner allows notifications once and pastes one value into a GitHub secret; no database or new Cloudflare service; the tap opens the card; needs one small experiment, because how Cloudflare Access treats the desk's service worker is not documented (Q-011 X1, X2, X9).
   - "GitHub Mobile app": the Orchestrator opens a GitHub issue assigned to the owner per card; whether a bot's assignment pushes is not documented (G5).
   - "Desk push via Cloudflare": a scheduled Worker sends it, with the subscription in KV; needs an exception to the desk's no-server-state rule (S-001) and a second deploy target.
   Answer: "Desk push via GitHub (Recommended)".
3. "Fix the secret-scrubbing proof in the model repo now?" Answer: "Yes, fix it now (Recommended)". (Recorded here because it was asked in the same sitting; the work is in Personal-Org-Operating-Model.)

Follow-ups:
- The Definer adds the notification route to S-001 for M3: the manifest and service worker (or Declarative Web Push on iOS 18.4+), the permission button, the send from the Orchestrator's card step (a model change to the Orchestrator workflow, raised there), VAPID keys and the subscription held as secrets the owner sets by hand, and an experiment registration for the Access question (service worker, manifest and click-through behind Access, Q-011 Q-f).
- Q-011's open questions that bear on it: Q-f (Access and the service worker) becomes the experiment; Q-d and Q-j do not change the iPhone route.
