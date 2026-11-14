**Research memo (2026-11-14): what defines the styling of well-regarded apps now, and what reads as current or dated**

*By the Researcher, at the owner's request ("dispatch a researcher to define the current trending modern app styling out there today, and identify the criteria that make it such"), briefed neutrally: it was not told which direction the owner leans to. Recorded verbatim by the orchestrator, session session_01QBwHGKbJwQiq23S3G2JJet. Its proposed library entries are not yet source-checked, so none is load-bearing until a Source checker passes it.*

MEMO: Current visual styling of well-regarded apps, and what reads as current versus dated
Date: 14 November 2026. Depth: level 2 (primary vendor pages where they could be opened, plus reputable press). Topics: design, mobile, accessibility.

**Limits first.** I opened Apple's newsroom and HIG pages, Google's design and developer blogs, Linear's and Shortcut's own posts, Fluent 2, NN/g, and two dated critiques of overused trends. Google's m3.material.io pages are rendered by JavaScript and returned no text, so Material's exact spring and type numbers are not confirmed. Spring values I found come only from third-party ports and are marked low. The Apple Newsroom post for iOS 27 did not turn up in search, so the iOS 27 changes rest on MacRumors and other press. I found no new Microsoft design language in this period, only gradual Fluent and Mica work. No source measures how widespread any style is across third-party apps, so every "how widespread" statement is an estimate. Nothing here comes from memory: anything I could not source is marked unconfirmed. Library entries already on file that touch this topic: F-platform-targets-contrast-01 and F-wcag22-01 (touch targets, contrast, colour not used alone, reduced motion). I rely on them and do not repeat them.

---

## 1. The main styling families now

**A. Layered translucent glass (Apple "Liquid Glass").**
- **What Apple announced (fact, high).** Apple announced it on 9 June 2025 for iOS 26, iPadOS 26, macOS Tahoe 26, watchOS 26 and tvOS 26. Apple describes a "translucent material [that] reflects and refracts its surroundings". Its colour "intelligently adapts between light and dark environments". Controls form "a distinct functional layer that sits above apps". Tab bars shrink as you scroll. Controls are drawn "concentric with the rounded corners of modern hardware". [Apple Newsroom 2025-06-09]
- **First revision (fact, high).** iOS 26.1 added a choice between Clear and Tinted under Settings > Display & Brightness > Liquid Glass. Tinted is more opaque and has more contrast. [Tom's Guide, MacRumors, Oct 2025]
- **iOS 27 refinements (fact, medium; press only, Apple's post not opened).** Announced at WWDC on 8 June 2026:
  - a transparency slider running from clear to fully tinted
  - better diffusion of content behind the glass
  - a darkened edge around glass elements and brighter highlights
  - a uniform top toolbar when content scrolls under it
  - support for Reduce Transparency and Increase Contrast
  - sharper icons
  - "macOS 27 Golden Gate" sidebar and window-corner changes
  [MacRumors 2026-06-10; SiliconANGLE 2026-06-08]
- **Microsoft (estimate, medium).** Microsoft continues with Fluent 2 and Mica and is moving old Windows screens onto Fluent. I found no new design language. [press, 2026]
- **How widespread (estimate, medium).** It is the default for any app on Apple platforms that uses the system controls.

**B. Expressive shape and colour (Google "Material 3 Expressive").**
- **What Google announced (fact, high).** Google announced it on 13 May 2025 [9to5Google]:
  - an expanded colour range to "sharpen hierarchy and clarify key actions"
  - a library of 35 shapes with built-in morphing between them
  - spring physics, split into spatial springs (movement) and effects springs (colour and opacity)
  - new type styles for variable fonts, including "emphasized" text
- **Shipping (fact, medium; press dates).** It shipped to Pixel phones in Android 16 QPR1 in early September 2025. [9to5Google 2025-09-03]
- **Wear OS (fact, high).** It came to Wear OS too, including shape morphing and "embraces the versatility of variable fonts". [Android Developers Blog 2025-08-25]
- **Google's research (fact, high).** Google reports 46 studies with more than 18,000 participants. People found key elements "up to four times faster". The age gap disappeared for users over 45. [design.google, undated, tied to I/O 2025]
- **Google's own caveats (fact, high).** Expressive design is not for every product: banking should keep established patterns. Breaking a list pattern lowered usability. "A strong minority" preferred calmer designs. [same source]
- **How widespread (estimate, medium).** It is the Android system look on Pixel and in Google's own apps. Third-party uptake was not measured.

**C. Calm, dense neutral (productivity tools).**
- **Linear, 12 March 2026 (fact, high).** Linear's refresh aims at "preserving that rich density of information without letting the interface feel overwhelming". It moved to a warmer grey that is "less saturated" but crisp, and warns "too warm... looks muddy". It dimmed the sidebar, used fewer and smaller icons, dropped coloured icon backgrounds, used fewer separators, and gave tabs and borders rounder corners with "softening the contrast". [Linear blog]
- **Shortcut, 18 November 2025 (fact, high).** Shortcut's redesign is titled "calmer, clearer, faster". It made colour "functional, not just decorative", added breathing room and adjusted dark-mode contrast. [Shortcut blog]
- **Vercel (fact, high).** Vercel's Geist system pairs a sans with a mono typeface (Geist Sans and Geist Mono). [vercel.com/geist]
- **Fluent 2 (fact, high).** Fluent 2 keeps radii small: 4 px by default, 8 for large buttons, 12 for popovers. [fluent2.microsoft.design]
- **How widespread (estimate, low to medium).** It reads as the shared style of well-regarded developer and productivity tools, but I have only two primary redesign posts to support that.

**D. The generic template or AI-default look (to recognise, not a vendor family).** See section 3.

## 2. Observable criteria per family

**A. Liquid Glass**
- **Depth.** Glass is used only on the control and navigation layer. Apple: "Don't use Liquid Glass in the content layer", and "Use Liquid Glass effects sparingly." The regular variant "blurs and adjusts the luminosity" for legibility. Use it for anything with a lot of text. The clear variant is only for use over media, with "a dark dimming layer of 35% opacity" over bright content. [Apple HIG Materials, opened Nov 2026] (fact, high)
- **Shape.** Capsules and corners nested concentrically inside the device corners (fact, high).
- **Colour.** Tint comes from the content behind; colour appears sparingly in controls (fact, high for the tint).
- **Motion.** Controls morph, and bars shrink on scroll (fact, high). Apple's spring API uses two parameters, duration and bounce, with presets smooth, snappy and bouncy. Bounce above about 0.4 "may feel too exaggerated". [WWDC23 session 10158; predates the period] (fact, medium)
- **Type.** Not documented in the sources I opened.

**B. Material 3 Expressive**
- **Shape.** Mixed and morphing shapes (35 presets), with shape used to emphasise things (fact, high).
- **Colour.** Higher-contrast "containment" (filled containers) and dynamic colour, or brand colour on Wear OS (fact, high).
- **Type.** Variable fonts with emphasized styles (fact, high). Exact sizes and weights are unconfirmed.
- **Motion.** Springs instead of fixed durations (fact, high). Third-party ports cite stiffness 1,400 with damping 0.9 (standard, fast) and 380 with damping 0.8 (expressive, default). These are unconfirmed and low confidence.
- **Size.** Larger key actions, for example the Send button (fact, high).

**C. Calm dense**
- **Colour.** Tuned neutrals (warm or cool grey) with one accent, and colour reserved for meaning (fact, high, from Linear and Shortcut).
- **Line.** Few separators. Borders are soft and low in contrast (fact, high).
- **Shape.** Small to medium radii, 4 to 12 px in Fluent 2 (fact, high).
- **Iconography.** Fewer, smaller and monochrome icons (fact, high).
- **Type.** A sans plus a mono for technical data (fact, high for Geist). Using tabular numerals for data is common practice, but I found no primary source and it is unconfirmed.
- **Density.** High, with hierarchy shown by dimming less important chrome rather than by adding boxes (fact, high).

**How status is shown (all families).** Design systems agree that colour reinforces status and a label defines it. Adobe Spectrum: "Status lights should always include a label. Color alone is not enough." Dynatrace says to pair colour with an icon, shape or text. [Spectrum, Dynatrace docs, undated] (fact, high; consistent with F-wcag22-01)

## 3. What reads as dated, overused or "AI-generated"

- **The AI-default look (fact, medium).** A deterministic scan by Krebs (20 April 2026) of 1,590 Show HN landing pages flagged 22% with four or more of these patterns:
  - Inter everywhere, or stock pairings: Space Grotesk, Instrument Serif, Geist
  - an italic serif accent word in a sans headline
  - purple accents
  - permanent dark mode with grey body text and marginal contrast
  - gradients applied broadly, and coloured glows
  - a badge above a centred hero headline
  - cards with coloured top or left borders, and identical icon-topped feature cards
  - numbered steps and rows of statistics
  - emoji icons in navigation, and all-caps labels
  - shadcn/ui defaults and glassmorphism

  The page reports both 1,400 and 1,590 pages and says "16 patterns" while listing 18, so the figures carry some error.
- **Where the purple comes from (opinion, low).** Commentators trace it to Tailwind's default indigo. [superdesign, dev.to, 2026]
- **Trends creatives are "so over" (opinion, medium).** A Creative Boom survey (21 April 2026) names: glassmorphism and liquid glass used out of context, gradients drained of intent, lazy minimalism, lazy maximalism, bento grids, motion for its own sake, Y2K revival, and template culture.
- **The next default "tell" (opinion, low).** Some now see cream backgrounds with serif type as the new default look. [Claude Code HQ, undated]
- **What reads as dated (estimate, medium).** I infer this from the direction of the 2025–26 vendor changes rather than from a source that says it outright:
  - flat, uniform shapes with low-contrast dividers (Google framed M3 Expressive as moving beyond these)
  - heavy separators and boxes in dense tools (Linear removed these)
  - icons in every row with coloured backgrounds
  - cool blue-grey neutrals (Linear moved away from them)
  - decorative gradients

## 4. Accessibility and legibility concerns

- **Glass (fact, high).**
  - NN/g (Budiu, 10 October 2025): "anything placed on top of something else becomes harder to see". It also reports text overlapping text (Mail's search bar over email previews), purposeless motion ("Motion for motion's sake is not usability"), cramped tab bars, and controls that appear and disappear.
  - Apple's remedies are the regular variant for text, a 35% dimming layer, respecting Reduce Transparency and Increase Contrast, the iOS 26.1 Tinted setting and the iOS 27 slider.
  - Implication (estimate): text over glass needs checking against the worst-case background, because the backdrop changes. A single contrast check is not enough.
- **Expressive (opinion, low; fact, high for Google's claim).** Google says its components exceed the minimum standards for touch-target size and contrast. Critics, in blogs only, say that without strong dividers, scanning dense lists gets harder. I found no independent audit.
- **Calm dense (estimate, medium).** Softened contrast and dimmed chrome can drop secondary text and borders below 4.5:1 for text and 3:1 for interface parts (F-wcag22-01). Linear's custom themes let users raise contrast (fact, high).
- **Motion (fact, high; already in the library).** Springs and morphing must respect Reduce Motion (F-platform-targets-contrast-01).

## 5. Fit for a dense, status-driven timeline on a phone

Everything in this section is an estimate or opinion, medium confidence.
- **Calm dense** fits a timeline best. It keeps density, puts colour only where it means something, and gets hierarchy from dimming rather than containers. The risks are a generic look (it sits close to the AI-default patterns: Inter, dark mode, grey text) and contrast that drifts too low.
- **Liquid Glass** suits only the chrome around the timeline. By Apple's own rule, the timeline is content and should not be glass. Bars floating over a scrolling timeline bring the legibility risks NN/g reported. On Android it would look foreign.
- **Expressive** helps show the most important item: Google's research found key elements spotted up to four times faster. It costs vertical space through larger components and containment. Google itself warns against breaking list patterns, and notes that a minority prefer calmer designs.
- **A hybrid**, calm dense content inside each platform's native chrome, is a common reading of the guidance. No source tests it for timelines.

---

## Table of families

| Family | Colour | Type | Shape | Depth | Line and icons | Density | Motion | Status |
|---|---|---|---|---|---|---|---|---|
| Liquid Glass | Tint taken from content; sparse accent | n/c | Capsules, concentric corners | Translucent controls layer only | System symbols | Medium | Morphing; springs (duration and bounce) | n/c |
| M3 Expressive | Wider range, high-contrast containers, dynamic or brand colour | Variable fonts, emphasized styles | 35 morphing shapes | Containment over shadow | Larger key actions | Lower | Spatial and effects springs | Emphasis by size and colour |
| Calm dense | Tuned neutral plus one accent; colour means something | Sans plus mono | 4–12 px | Mostly flat, soft borders | Few, small, monochrome icons | High | Restrained (n/c) | Label plus colour |
| AI default (avoid) | Purple, gradients, glows | Inter, stock pairings | Uniform rounded cards | Glass, coloured shadows | Emoji, coloured card edges | Medium | n/c | n/c |

n/c = not confirmed in sources opened.

## Sources

1. Apple Newsroom, "new software design", 2025-06-09. https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
2. Apple HIG, Materials (JSON), opened 2026-11-14. https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json
3. Tom's Guide / MacRumors on iOS 26.1 Tinted, Oct 2025. https://www.tomsguide.com/phones/iphones/ios-26-1-lets-you-adjust-liquid-glass-transparency-on-your-iphone-heres-how-to-do-it ; https://www.macrumors.com/how-to/ios-26-1-reduce-liquid-glass-effects/
4. MacRumors, "How Liquid Glass is changing in iOS 27", 2026-06-10. https://www.macrumors.com/2026/06/10/how-liquid-glass-is-changing-in-ios-27/
5. SiliconANGLE, WWDC 2026, 2026-06-08. https://siliconangle.com/2026/06/08/apple-refines-liquid-glass-design-expands-child-safety-tools-wwdc/
6. NN/g, Budiu, "Liquid Glass Is Cracked…", 2025-10-10. https://www.nngroup.com/articles/liquid-glass/
7. Apple WWDC23 session 10158, "Animate with springs", 2023-06. https://developer.apple.com/videos/play/wwdc2023/10158/
8. 9to5Google, M3 Expressive, 2025-05-13. https://9to5google.com/2025/05/13/android-16-material-3-expressive-redesign/
9. 9to5Google, Android 16 QPR1, 2025-09-03. https://9to5google.com/2025/09/03/android-16-qpr1-pixel/
10. Android Developers Blog, M3 Expressive for Wear OS, 2025-08-25. https://android-developers.googleblog.com/2025/08/introducing-material-3-expressive-for-wear-os.html
11. design.google, "Better, Easier, Emotional UX", undated (I/O 2025). https://design.google/library/expressive-material-design-google-research
12. Linear, "Behind the latest design refresh", 2026-03-12. https://linear.app/blog/behind-the-latest-design-refresh
13. Shortcut, "Designing a calmer, clearer, faster Shortcut", 2025-11-18. https://www.shortcut.com/blog/designing-a-calmer-clearer-faster-shortcut
14. Fluent 2, Shapes, undated, opened 2026-11-14. https://fluent2.microsoft.design/shapes
15. Vercel Geist, undated. https://vercel.com/geist
16. Krebs, "Scoring Show HN submissions for AI design patterns", 2026-04-20. https://adriankrebs.ch/blog/design-slop/
17. Creative Boom, "10 trends creatives are so over in 2026", 2026-04-21. https://creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/
18. Adobe Spectrum, Status light, undated. https://spectrum.adobe.com/page/status-light ; Dynatrace, Status and health, undated. https://developer.dynatrace.com/design/patterns/status-and-health/

## Proposed library entries

Topics for all entries: design, mobile, and accessibility where relevant.
- **F-design-lg-01.** Apple announced Liquid Glass on 9 June 2025 for iOS 26, iPadOS 26, macOS Tahoe 26, watchOS 26 and tvOS 26: a translucent material that "reflects and refracts", with controls as a functional layer above apps. Source 1. Grade A. Shelf life 12 months.
- **F-design-lg-02.** The Apple HIG says "Don't use Liquid Glass in the content layer" and "Use Liquid Glass effects sparingly". Use the regular variant for text-heavy components. Use clear only over media, with a 35% dark dimming layer over bright content. Source 2. Grade A. Shelf life 12 months.
- **F-design-lg-03.** iOS 26.1 added a Clear or Tinted Liquid Glass setting. iOS 27 (WWDC 2026-06-08) adds a transparency slider and support for Reduce Transparency and Increase Contrast. Sources 3–5. Grade B (press). Shelf life 6 months.
- **F-design-lg-04.** NN/g (2025-10-10) found that iOS 26 glass reduces legibility, shows text overlapping text, and adds motion without purpose. Source 6. Grade B (one expert source). Shelf life 12 months.
- **F-design-m3e-01.** M3 Expressive (2025-05-13) adds 35 morphing shapes, spatial and effects springs, a wider colour range and emphasized type. It shipped to Pixel in Android 16 QPR1 in September 2025. Sources 8–10. Grade B. Shelf life 12 months.
- **F-design-m3e-02.** Google reports 46 studies with more than 18,000 participants, key elements spotted up to four times faster, and the age gap erased for users over 45. It cautions against breaking established patterns and notes that a strong minority prefer calmer designs. Source 11. Grade B (self-reported). Shelf life 24 months.
- **F-design-calm-01.** Linear's refresh of 2026-03-12 keeps information density while using warmer, less saturated greys, a dimmer sidebar, fewer and smaller icons, fewer separators, and rounder, softer borders. Source 12. Grade A for what Linear did. Shelf life 12 months.
- **F-design-fluent-01.** Fluent 2 corner radii are 0, 2, 4 (the default), 8 and 12 px, plus circle. Source 14. Grade A. Shelf life 24 months.
- **F-design-slop-01.** A CSS and DOM scan of 1,590 Show HN pages (2026-04-20) found 22% showing four or more AI-default patterns (Inter, purple, broad gradients, glassmorphism, shadcn, icon cards and others). The source's own counts are inconsistent. Source 16. Grade C. Shelf life 12 months.
- **F-design-overused-01.** Creative Boom's survey (2026-04-21) lists glassmorphism used out of context, gradients, bento grids and motion for its own sake as trends creatives are tired of. Source 17. Grade C (opinion survey). Shelf life 12 months.
- **P-design-status-01 (pattern).** Status shown as colour plus a text label, and optionally an icon or shape, never colour alone. Source 18, with F-wcag22-01. Grade A. Shelf life 24 months.

**New questions for the Chief of Staff.**
- What are Material's official spring values and type scale? The m3.material.io pages need opening without JavaScript, or a check of the androidx source.
- Is there an independent contrast audit of M3 Expressive or Liquid Glass components?
- Is there any published research on dense timelines or activity feeds on phones?
