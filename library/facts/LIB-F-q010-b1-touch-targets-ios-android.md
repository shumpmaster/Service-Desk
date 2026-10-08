---
id: LIB-F-q010-b1
form: fact
claim: "Apple guidance: iOS/iPadOS controls default to 44x44 pt, and a button needs a hit region of at least 44x44 pt. Android guidance: touch targets of at least 48x48 dp (about 9 mm)."
grade: B
checked_on: 2026-10-08
shelf_life: 6 months
topics: [mobile, accessibility]
sources:
  - https://developer.apple.com/design/human-interface-guidelines/accessibility  # via tutorials/data JSON: table iOS/iPadOS default 44x44 pt (minimum column 28x28 pt, NOT filed)
  - https://developer.apple.com/design/human-interface-guidelines/buttons  # via JSON: "a button needs a hit region of at least 44x44 pt"
  - https://developer.android.com/guide/topics/ui/accessibility/apps  # "at least 48dp×48dp. Larger is even better."
  - https://support.google.com/accessibility/android/answer/7101858  # "at least 48x48dp, separated by 8dp... about 9mm"
note: "Each platform's figure rests on two pages of that platform's own publisher (label: same publisher). This is the vendor's own guidance, not an independent source. The iOS 28 pt minimum is single source and contradicted by the Buttons page, so it is out. The Google page gives 8 dp spacing, but the Android developer page does not, so spacing is also out. Open owner question Q-010-e: does same-publisher count for design guidance (the ruling covers product behaviour)?"
opened_by: source-checker (Q-010, 2026-10-08)
---
