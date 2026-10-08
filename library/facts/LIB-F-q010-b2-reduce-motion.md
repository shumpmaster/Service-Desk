---
id: LIB-F-q010-b2
form: fact
claim: "Honour the OS reduce-motion setting so that non-essential motion can be disabled (WCAG 2.3.3, Level AAA; the CSS prefers-reduced-motion query is a technique for it; Apple HIG accessibility, Reduce Motion). Apple adds that where motion carries meaning you should replace it with a dissolve, highlight fade or colour shift rather than remove it."
grade: B
checked_on: 2026-10-08
shelf_life: 12 months
topics: [accessibility, mobile, design]
sources:
  - https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html  # prefers-reduced-motion technique, disables non-essential animation
  - https://developer.apple.com/design/human-interface-guidelines/accessibility  # via JSON: "Replacing transitions in x-, y-, and z-axes with fades to avoid motion"
  - https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria  # "don't remove the animation entirely... dissolve, highlight fade, or color shift"
note: "The first sentence has independent sources (W3C and Apple). The replace-with-fade sentence is Apple only (two pages, same publisher). The AAA level was read in an earlier round, and this round's read of the page did not repeat it."
opened_by: source-checker (Q-010, 2026-10-08)
---
