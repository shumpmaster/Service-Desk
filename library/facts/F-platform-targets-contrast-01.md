---
id: F-platform-targets-contrast-01
form: fact
claim: "Platform guidelines differ and no choice is made. Touch targets: Apple (iOS, iPadOS, Accessibility page) default control size 44x44 pt, minimum 28x28 pt; Google Android 'at least 48dpx48dp. Larger is even better.'; WCAG 2.5.8 is 24x24 CSS px (AA) and 2.5.5 is 44x44 CSS px (AAA) (see F-wcag22-01). Units differ (pt, dp, CSS px). Text contrast: Apple table - up to 17 pts, all weights, 4.5:1; 18 pts, all weights, 3:1; all sizes bold, 3:1; Android - 'If the text is smaller than 18sp, or if the text is bold and smaller than 14sp, use foreground and background colors that result in a color contrast ratio of at least 4.5:1. For all other text, set the color contrast ratio to at least 3:1.' Apple allows 3:1 for bold text at any size; WCAG and Android set the bold threshold at 14 (pt / sp). Apple colour: 'Convey information with more than color alone.' Apple reduced motion: 'When this setting is active, ensure your app or game responds by reducing automatic and repetitive animations, including zooming, scaling, and peripheral motion.' Material's own wording was not opened and is not claimed."
grade: A
topics: [accessibility, mobile]
checked_on: 2026-10-08
shelf_life: 12 months
opened_by: source-checker (Q-013, 2026-10-08); Apple through its public JSON and Android HTML, both via a summarising fetch, not raw
memo: research/Q-013-memo.md
publisher_note: each figure is a single authoritative source for its own platform; the entry records the disagreement
sources:
  - https://developer.apple.com/design/human-interface-guidelines/accessibility
  - https://developer.android.com/guide/topics/ui/accessibility/apps
---
