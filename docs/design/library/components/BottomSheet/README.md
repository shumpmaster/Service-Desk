# BottomSheet

Tools and settings that rise from the bottom. From refs 13, 15, 16 and 17.

- 369 wide (12 from each side), radius 28, frosted: `surface-sheet` (88% opaque) blurring the page behind, `shadow-sheet` with a white inner edge; a 36 by 4 grabber.
- Top line: a TextButton left, the `sheet-title` centred, the DoneButton right.
- Inside: SegmentedRow, ToolButtons, CapsLabels, fields and a CapsulePair at the foot.
- Behind it the page dims with `scrim`. It rises; drag the grabber to resize or dismiss.
- **v33 (round 8):** opens on the spring in 450, closes in 280; the drag follows the finger with its speed, a flick or a third of the height puts it away, dragging up gives a little, the scrim fades with the drag (M5, M7).
