  /* ================= v39: the map is drawn to the card's inner box, so its width is the card's width less its padding
     (0 while the card is not laid out, so the callers' own fallback still applies) ================= */
  function __vpIn(v) { if (!v || !v.clientWidth) return 0; var cs = getComputedStyle(v); return Math.max(0, v.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0)); }
