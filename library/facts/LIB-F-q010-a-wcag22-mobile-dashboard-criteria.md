---
id: LIB-F-q010-a
form: fact
claim: "WCAG 2.2: 2.5.8 (AA) pointer targets at least 24x24 CSS px with five exceptions (spacing, equivalent, inline, user-agent control, essential); 2.5.5 (AAA) at least 44x44 CSS px; 1.4.3 (AA) text 4.5:1, large text (at least 18pt, or 14pt bold) 3:1; 1.4.11 (AA) UI/graphics 3:1 against adjacent colours, not rounded (2.999:1 fails); 1.4.1 (A) colour not the only means of conveying information; 4.1.3 (AA) status messages programmatically determinable without taking focus; 2.2.2 (A) auto-updating information needs pause/stop/hide or frequency control, with no 5-second exception for auto-updating."
grade: A
checked_on: 2026-10-08
shelf_life: 24 months
topics: [accessibility, mobile, design, dashboards]
sources:
  - https://www.w3.org/TR/WCAG22/  # 1.4.3 and 1.4.1 text read (same publisher)
  - https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html  # "at least 24 by 24 CSS pixels", five exceptions
  - https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html  # AAA, 44 by 44
  - https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html  # 4.5:1; large 18pt / 14pt bold
  - https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html  # AA; "2.999:1 would not meet"
  - https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html  # Level A
  - https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html  # AA
  - https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html  # Level A; "no five second exception for auto-updating"
independence: "same publisher (W3C normative text plus Understanding documents); a standard, not a vendor-behaviour claim"
opened_by: source-checker (Q-010, 2026-10-08)
---
