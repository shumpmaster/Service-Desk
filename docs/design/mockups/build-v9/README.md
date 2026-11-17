# Mockup v9 build layer

v9 is v8 plus this style layer; nothing here changes what the page does.

    python3 v9.py ../timeline-v8-craft.html ../timeline-v9-craft.html <phosphor assets>

`<phosphor assets>` is the `package/assets` folder of `npm pack @phosphor-icons/core@2.1.1` (MIT). `v9.css` is appended after v8's styles; `v9.js` replaces `header`, `needsBlock`, `projCard` and `tabbar`, and swaps the icon maps, before the first render.

Published at https://claude.ai/artifact/SropAUW2dPqkeG1MvcLrY9 (private to the owner).
