# Ruling needed: Should text boxes stay at least 16 px, with everything else sized like Linear?

Milestone: MD2
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: You said "the text boxes and element sizing can remain closest to linear is what i want." On an iPhone, a web page zooms in when you tap a text box whose text is smaller than 16 px, and stays zoomed; that is why you ruled the 16 px minimum. Linear is an app, not a web page, so it doesn't have this problem. Left unruled, text boxes stay at least 16 px and everything else follows Linear's sizes.
OPTIONS:
  A. 16 px for text boxes only — Everything else is sized like Linear; only the boxes you type in keep 16 px text, so the phone never zooms.
  B. Linear's sizes everywhere — Text boxes too; the phone zooms in when you tap one, and you pinch back out.
RECOMMENDATION: A — the page looks like Linear, and typing an answer doesn't zoom the screen.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the size of the text inside the boxes you type in
DEFAULT: A   TIMEOUT: 48

## Context
- The owner's earlier ruling on the zoom: every text box's text at least 16 px (source: decisions/questions/P-001-trial-view-notes-2.md, note 4)
- The owner's words of 2026-10-19 on sizing (source: session session_012RJPVKAoLga2RkqLYRDcBY)
