# Project document — <project name>

*One document, two parts (D-052). Part 1 is settled when the owner approves the move to Build; Part 2
stays living. The Critic checks Part 1 against the definition of ready.*

# Part 1 — The brief

*Lines in italics are instructions. CI checks that every section below has content beyond its instruction once a spec is frozen (S-009).*

## 1. Scope
*What is in, what is explicitly out, and where it must work (target devices or places).*

## 2. Strategy
*In plain language: the chain from the deliverables to the value — how this work produces it.*

## 3. The 25,000-foot plan
*The deliverables two levels deep, with the dependencies between them.*

## 4. Owners
*An owner for every deliverable, including anything that needs the owner or an outside party.*

## 5. Limits
*The spend ceiling, the data boundaries (what data may go to which outside service), and the tier (T1, T2 or T3 by the tier triggers), which is the project's trust level.*

## 6. Value and stop rule
*This project's own measure of value, the target and date, and what counts as a miss — including the cost to the owner's time. Write each value target on its own line starting with its ID, like `V1: <measure>, <target>, <date>`; spec criteria trace to these IDs.*

## 7. Solid foundation
*Every load-bearing unknown, each answered with evidence (library entry or research memo), including through research sub-projects if needed.*

## 8. Clear and consistent
*Key terms defined; constraints checked against each other and found not to contradict.*

# Part 2 — The intent

## Intent
The owner's purpose, preferences and trade-offs for this project, and what he would hate. Drafted by
the Chief of Staff from conversations, portfolio defaults and past rulings; confirmed on the
move-to-Build card.

*Draft 1, 2026-09-30. Chief of Staff, from the owner's answers in the intent-capture conversation
on that date, the Operations-Hub record (its MISSION.md, SCOPE.md and docs/research/001, the
Pocket Universe design guide), and the model's L-0115 (D-081). Quotes are the owner's own words.
The owner has not yet confirmed it; confirmation comes on the move-to-Build card.*

### Purpose
- "I envisioned the service desk to be more of real time interactive planning, scheduling and
  interactive workbench."
- Service Desk replaces Operations-Hub, which is a read-only page answering "does anything need
  me?" and linking out to GitHub. The owner chose to **act from the desk**, not only look.
- On launch it takes over the old page's Cloudflare Pages project and address. Until then the old
  page stays live and untouched, and the desk publishes only to a preview (L-0115).

### What the first usable version covers
The owner picked all four:
1. **The Universe screen:** one box per project, with state, headline, sprint and main-branch
   health. This is the old hub's core and must not get worse.
2. **Decision cards:** v3's seven-part cards and owner questions, readable in full on the desk.
3. **Team and pipeline:** where each project sits in the v3 stages (Shape, Build, Run), who is
   working, and what comes next.
4. **Spend and time:** spend against each project's ceiling, and the cost to the owner's time.

### Preferences and trade-offs
- **Phone first.** Desktop is a bigger view of the same thing.
- **Open to the desk becoming the easier way to run projects.** The model was designed to run from
  a Claude Code window. The owner clarified: "if a design can be reached that makes future projects
  or builds easier to run via the service desk than the are in a Claude code session - I am open to
  that. I just hadn't thought that far so I can't be definitive about what is possible yet." So
  running work from the desk is welcome where it is genuinely easier than a Claude Code session,
  but it is not yet a requirement. Shape should find out what is possible and show the owner, and
  the owner decides then.
- **Spend follows value.** "I'm open to most anything if the value can be justified." There is no
  fixed ceiling yet. Every paid service carries its value case, and Part 1 §5 still needs a
  number.
- **Four weeks, with a faster route shown.** Launch by 2026-10-28 is acceptable, "but with a route
  to timeline compression if we work it aggressively." The plan should show what could shorten it
  and what that would cost.
- **Acting means write access.** The old hub deferred write-back because the page would then hold
  the owner's credentials, which makes it T2 and needs a security review (Operations-Hub
  SCOPE.md). The owner accepted that trade by choosing to act from the desk.

### What the owner would hate
- **False alarms.** It flags things that don't need the owner, and trust erodes.
- **Missed decisions.** Something waits on the owner while the desk says "quiet".
- **Upkeep on the owner.** Time spent on tokens, configuration or adding repositories.

### Carried forward, to reconfirm
These come from the Pocket Universe design guide (Operations-Hub docs/research/001), not from this
conversation:
- Exceptions first, activity second. Quiet is the success state.
- Only flag what needs a human. A gate catching a problem, or an agent retrying, is activity.
- The desk is never a source of truth. Every action writes back to the repository under the owner's
  identity.

### Open tensions for Shape
These are questions for Shape to answer with evidence, not rulings:
1. **Workbench versus source of truth.** Planning and scheduling need state. Does it live in the
   project and portfolio repositories (the model's rule: the repository is the memory), or does
   the desk keep its own?
2. **Real time versus a static page.** The old hub is a static page rebuilt hourly. A real-time,
   interactive desk needs a live backend, which bears on spend, tier and the data boundaries.
3. **Could the desk be an easier way to run projects than a Claude Code session?** What is
   possible: starting or steering sessions, driving each project's Orchestrator, or only recording
   the owner's rulings for the Orchestrator to act on? What would each cost in spend, tier and
   upkeep? The owner is open to it but has not decided (see Preferences).
4. **The spend ceiling and the tier** that Part 1 §5 must state.
