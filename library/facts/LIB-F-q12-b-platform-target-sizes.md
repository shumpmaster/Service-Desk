---
id: LIB-F-q12-b
form: fact
title: Apple and Google touch-target guidance differ
topics: [accessibility, mobile, design]
grade: A (each a platform guideline; reported without choosing)
checked_on: 2026-10-08
shelf_life: 12 months
opened_by: source-checker (Q-012), fetch extracts; Apple via the HIG JSON endpoint
memo: research/Q-012-memo.md (section 9)
sources:
  - https://developer.apple.com/design/human-interface-guidelines/accessibility
  - https://developer.android.com/guide/topics/ui/accessibility/apps
  - https://support.google.com/accessibility/android/answer/7101858
---
- Apple HIG (Accessibility), iOS/iPadOS: default control size 44x44 pt, minimum 28x28 pt (table).
- Android Developers: "at least 48dp x 48dp. Larger is even better." Google Accessibility Help: "at least 48x48dp, separated by 8dp of space or more".
Caution: one fetch of the Apple HTML page returned "minimum 44x44"; the JSON endpoint returned the table with 28x28. Re-read the table in a browser before relying on the 28 pt figure. The memo's "Android/Material" label is dropped: no Material page was read.
