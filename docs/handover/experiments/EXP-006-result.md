# EXP-006 result — Cloudflare Access with the desk's notifications

registration: experiments/EXP-006-access-push.md   spec: S-001 (AC74 to AC78, J16 to J21; Setup
N10, N12)
run: in part, on the preview, from the notifications' setup (Setup N5 to N8) to the owner's
walk-through on 2026-10-31; most cases were never run as registered, and their result was never
recorded
recorded by: the Builder, 2026-10-31, from the Chief of Staff's hand-over before stage LA1 (Setup
CS39), with the run records it names; the Builder ran nothing and holds no token. No secret and no
billing figure is recorded here.

## What this means for you

Only part of this experiment has a record. What is known: notifications and their tap work on the
preview as you set them up; the usage token was never made, so the desk shows no Actions figures;
and whether a sign-in exception exists in Access is unknown, so you look for one before launch
(step O8 (d)). The rest of the cases were not recorded, so they are not counted as passed or
failed.

**Grades used here:** **A**, a run record or the code read; **B**, the owner's own words, as
recorded; **C**, not recorded, or a reading of what the records imply.

## What is known

| Case | Result | Evidence | Grade |
|---|---|---|---|
| 1. The Home Screen web app opens with no Safari bar (its manifest read) | Not recorded as its own case. A push subscription on the iPhone needs the desk added to the Home Screen, and case 3 shows one works, which implies the manifest was read | Cases 2 and 3 below | C |
| 2. "Turn on notifications" subscribes | Works: the test notification arrived (case 3). Which path subscribed it (Declarative Web Push or the service worker) was not recorded | Case 3's records | A for the run, B for the arrival; the path C |
| 3. A test push shows, and its tap opens the desk | **Works on the preview, as set up** | desk-notify run 41203166648 (workflow_dispatch, `test` = `true`), success at 2026-10-31T12:54:53Z (reviews/S-001/_launch-evidence.md; read by the Reviewer in Build's join-up review, reviews/S-001/_reviewer-build.md); the owner's W3, "as said": the test arrived and its tap opened the desk (reviews/S-001/_owner-walkthrough.md) | A for the run; B for the arrival and the tap |
| 4. The same with the Access session ended | Not recorded | — | C |
| 5. Each trigger route's delay, (5a) to (5h) | Not recorded as measured. The Reviewer read desk-notify on Service-Desk's main since 2026-10-24: 2413 runs, none failed, which says the sender ran, not how fast | reviews/S-001/_reviewer-build.md | A for the runs; the delays C |
| 6 to 10 | Not recorded | — | C |
| 11. Whether GitHub reports Actions use, and which token reads it | **Not run: the usage token ("Desk: Actions use", Setup N12) was never made** | The owner, 2026-10-31: it was never made (B). desk-notify's logs show `DESK_BILLING_TOKEN:` empty (A, as handed over). With no token, the desk's line reads "GitHub Actions use: not set up yet (Setup N12)" (A: src/lib/github.js:951, src/lib/notifyview.js:253) | A and B |
| 12. The icon and taps after the move to the sandbox view | Not recorded (Setup N13 was "only if needed") | — | C |

**The Access exception (Setup N10).** Whether any Access bypass application exists, for
`/sw.js`, `/manifest.webmanifest` or `/icons/*` on the preview's address, is unknown: the owner
said "Not sure" (B). Cases 1 to 3 working means either the exception was not needed or it was
added; the records don't say which (C).

## Against the deciding threshold

- **Pass** needs cases 1 to 4, and (5a) to (5e) and (5g) each under 5 minutes. Case 3 passes (A,
  B), case 2 in effect (B), case 1 only by implication (C), and case 4 and case 5's delays were
  never recorded (C). So the threshold is **not judged**: neither a pass nor a fail is recorded.
- **Case 11's fallback is not taken.** It applies when the case finds GitHub reports no Actions use,
  or every token kind refused. The case was never run, so J7's `actionsUsage.reported` stays
  absent (true), and nothing in the desk changes.
- **No other fallback is taken,** since no case is recorded as failing.

## What changes

No code or config.
- **The operating notes** (docs/handover/desk-operations.md): every usage-token step, the launch's
  L2b among them, now applies "only if you later make one"; at launch there is no usage token to
  regenerate. Until one is made, GitHub's own usage e-mails (Setup N11) are the owner's only Actions
  alert.
- **The launch's step O8 (d):** the owner looks in Zero Trust, Access, Applications for an exception
  on the preview's address, and adds the same three for `needs-you.pages.dev` if one is there.

## Open

- What O8 (d) finds, which the Chief of Staff can add here.
- If the owner later makes a usage token: case 11 then runs as registered (Setup N12's test), and
  its kind, scope and differences are recorded here.
- Cases 4 to 10 and 12 have no record. Nothing in the launch plan waits on them; the sender's tests
  and its run history are the launch review's evidence for it (S-001, S5).
