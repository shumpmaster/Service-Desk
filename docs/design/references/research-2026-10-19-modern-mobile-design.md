# Research memo, 2026-10-19: what makes modern mobile triage and project apps clean, fast and focused

The Researcher's memo for the owner's design audit request (docs/design/references/owner-request-2026-10-19-design-steward.md). It is kept here as the audit's basis. Its principles section (12) is quoted word for word below; the rest is summarised.

**Read this first (the Researcher's own caveat, word for word):** "Web fetch failed with "ENOTFOUND" on nearly every host. That includes linear.app, nngroup.com, w3.org, github.blog, docs.github.com, culturedcode.com, superhuman.com, todoist.com, figma.com, the Linear designers' personal sites and web.archive.org." Only Apple's Human Interface Guidelines pages and one Anthropic article were opened directly; everything else came from search-result summaries and is provisional until a source checker can open it. The session's network policy blocks those hosts.

## 12. Principles for judging Service-Desk's screens (word for word)

1. **The first screen answers "what's waiting on me?"; everything else is one tap down.** (A: P-glance-disclosure-01, 1.1, 1.2.) *On the phone:* the top of the opening screen is the waiting list with its count, and project status and timelines come after it or in another section.
2. **Every element earns its place by relevance, not by being available.** (B: 1.3, 1.5.) *On the phone:* squint at a row. Any ID, timestamp, chip or label not needed to decide what to do goes into the detail view.
3. **Uniform items are a list, not a grid of cards.** (B/C: 1.6.) *On the phone:* waiting items are rows separated by space or hairlines, not boxed and shadowed cards.
4. **One visible primary action per item, and at most one or two prominent buttons per view.** (A: 5.10.) *On the phone:* each row or sheet shows its one verb (Merge, Answer, Approve). Secondary actions sit behind the sheet.
5. **Swipe speeds things up; it is never the only way.** (A/B: 5.1–5.3, 5.5.) *On the phone:* swipe for Done or Snooze, the same actions visible in the detail sheet, and a firm swipe threshold so scrolling doesn't fire them.
6. **Reversible actions get undo, not "are you sure?"; save warnings for unexpected, irreversible loss.** (A/C: 5.11, 5.12.) *On the phone:* "Snoozed until tomorrow · Undo" appears in place. A confirmation step appears only where an action cannot be taken back.
7. **Colour means something, and each colour means one thing.** (A: 3.1–3.3.) *On the phone:* a neutral structure, accent only on the primary action and on "needs you", and no decorative colour per project.
8. **Status is a shape plus a word, never colour alone.** (A/B: 6.1–6.3, 3.5.) *On the phone:* a small consistent glyph with a short label ("Waiting on you", "Blocked", "Live"). Icon-only status is limited to a tiny, learned set.
9. **A few text sizes, with weight and contrast doing the work.** (A: 2.1–2.2.) *On the phone:* about 3–4 sizes, body near 17 pt, nothing under 11 pt, no light weights, and layouts that survive larger text.
10. **Navigation is visible, small and labelled.** (A/B: 4.1–4.3.) *On the phone:* either one scrolling screen, or a bottom bar of 2–4 single-word labelled tabs. No hamburger menu for core sections. Tab badges only for critical counts. Choosing between the two is taste.
11. **Details open in a sheet, one at a time.** (A/B: 7.1, 7.2.) *On the phone:* tapping an item opens a half-height sheet with the context needed to decide and the action. Drag it up for the full detail, swipe it down to dismiss.
12. **"All clear" is an honest, calm state, distinct from loading or failure.** (A/B: 8.1, 8.2.) *On the phone:* "Nothing waiting on you · checked 2 min ago", never a blank list or an endless spinner. Celebration is optional and a matter of taste.
13. **Response feels instant, and motion is brief, purposeful and optional.** (A/B: 9.1, 9.4–9.6.) *On the phone:* tapping Done moves the row within about 0.1 s. Pending remote actions show progress in the row itself. No entrance animations on every visit. Reduced-motion settings are respected.
14. **The work comes first, not the chrome or the brand.** (A/B: 10.4, 1.5.) *On the phone:* no logo bar, a compact title, and navigation visually quieter than the list.
15. **Be distinctive by deliberate choice and conventional in behaviour.** (Mostly taste; B/C: 10.1–10.4.) *On the phone:* a chosen typeface pairing and a single accent rather than the default kit, plain-voiced labels written for this owner, and standard tab bar, sheet and list behaviour.

## Summary of the evidence sections (1–11)

- **Density and hierarchy:** Apple's HIG (opened) puts the most important items top and leading, groups with space, limits on-screen controls on iPhone and keeps secondary actions one step away. Linear's own accounts (excerpts) describe cutting visual noise, giving the work area precedence, fewer icons and dividers. Cards suit mixed content; uniform items read better as a list (PatternFly, NN/g; excerpts).
- **Type:** iOS default sizes run Large Title 34 to Caption 2 11 pt, body 17; few typefaces; hierarchy by weight, size and colour; no light weights (Apple, opened).
- **Colour:** reserve colour for status and primary actions, one meaning per colour, never colour alone; badges only for critical items (Apple, opened).
- **Navigation:** tab bars for navigation only, few labelled tabs, controls low on the screen; hidden navigation hurts discoverability (Apple opened; NN/g excerpt). Single screen versus a small tab bar is taste.
- **Triage:** swipe is endorsed on iPhone but must have a visible equivalent; swipe discoverability is weak and accidental fires are reported (Apple opened; NN/g and GitHub excerpts). Linear, GitHub and Superhuman offer done and snooze; Things uses start dates. One or two prominent buttons per view; undo over confirmation for reversible actions.
- **Status:** a shape plus a word; most icons need labels (NN/g excerpt; Apple opened).
- **Disclosure:** sheets for scoped tasks, medium detent, one at a time, not for navigation (Apple opened; NN/g excerpt).
- **Empty states:** calm, honest, distinct from loading or failure, with the last-checked time (Apple opened; library P-stale-visible-01).
- **Motion:** brief, purposeful, cancellable, never the only signal; about 0.1 s feels instant (Apple opened; Nielsen excerpt).
- **Generic "AI" look:** critics describe default kits (Inter everywhere, purple gradients, rounded shadowed cards, default component tokens); the remedy is deliberate typeface, colour and voice choices with conventional behaviour (Anthropic article opened, critics excerpts; mostly taste).

## Open research questions it raises

1. What a phone web app can do for haptics, edge swipes (and the browser's own back swipe), bottom sheets and the user's chosen text size, which decides whether principles 5, 9, 11 and 13 can be built as written.
2. Optimistic display against in-place progress for irreversible remote actions such as a merge.
3. Snooze against start dates in triage.
