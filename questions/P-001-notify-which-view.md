# Ruling needed: Should notifications open your page, the new design, instead of the older view?

Milestone: none (notifications are not yet a milestone; this ruling decides which view the Home Screen icon and a notification's tap open)

WHY: You use the new design at the preview's address with ?sandbox. As built, the desk's Home Screen icon and every notification tap open the plain address, the older view the new design will replace when you accept it. Notifications work there today, but it isn't the page you use. Making them open the new design is a small change to the spec and the code, with its own review and pull request.
OPTIONS:
  A. Go live now, switch later — Turn notifications on today with the older view; then make the icon and taps open the new design as a quick follow-up.
  B. Wait for the new design — Hold notifications until the icon and taps open the new design.
  C. Keep the older view — Leave it as built until the new design becomes the desk at MD3.
RECOMMENDATION: A — notifications start today, and you are on your own page within a short follow-up.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: which view the Home Screen icon and notification taps open; what notifies does not change
DEFAULT: A   TIMEOUT: 48

## Context
- The Home Screen icon opens the start address "/" (source: src/public/manifest.webmanifest on main)
- The new design runs only with ?sandbox, and a notification's tap opens "/?open=<item>" (source: src/public/app.js line 983 on main; specs/S-001.md AC74 on main)
- The spec built notifications into the desk as accepted, with no ?sandbox needed (source: specs/S-001.md, the brief's "Notifications, first", on main)
- The owner said, opening the plain address, "This isn't my page? The ui looks massively different" (source: the session on 2026-10-19)
