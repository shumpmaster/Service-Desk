# Project document — <project name>

*One document, two parts (D-052). Part 1 is settled when the owner approves the move out of Discovery; after that its milestones change only as section 3 says; Part 2
stays living. The Critic checks Part 1 against the definition of ready.*

# Part 1 — The brief

*Lines in italics are instructions. CI checks that every section below has content beyond its instruction once a spec is frozen (S-009), and section 9 once a project is approved or waits on its Design gate (S-025).*

## 1. Scope
*What is in, what is explicitly out, and where it must work (target devices or places).*

## 2. Strategy
*In plain language: the chain from the deliverables to the value — how this work produces it.*

## 3. The 25,000-foot plan
*The deliverables two levels deep, with the dependencies between them. The second level is the milestones: each phase's standard milestones come with the model (OPERATING_MODEL.md §4); list here the project's own, at least one, after the standard ones in each phase and side by side with them, one per line, name first: `<plain-English name> (M<id>) · done when <what is achieved> · phase: <Discovery, Design, Build or Launch>`; a milestone added for later work on the product, a fix or a small addition filed as a new project item that the owner has not given a plan of its own, then gives that item: ` · for: P-<n>`, and a later item with a plan of its own lists its milestones in docs/projects/<item>.md, with no ` · for:` (S-035); give each such item at least one, which its spec names in its header. Each is an achievement, never a task: use the name the owner would use, with no codes or ids in it, and say what is achieved, not what someone does. End every line you draft or reword with why the project needs it, in plain words: ` · why: <reason>`, with no ` · ` inside the reason; once written, a why is changed, never removed, and the owner may change it through the Chief of Staff. Draft them here during Discovery; the owner approves them at the Design gate. After that, have the Critic check each new or reworded line (adding or changing a why is a rewording): a new one before it goes to the owner, a reworded one before it is committed (a rewording needs no owner ruling); add one only with the owner's approval, and drop one, or change its order, its phase or its ` · for:` item, only by the owner's ruling; never delete or renumber one (a move into the item's own plan, by the owner's ruling, is not a deletion, S-035): to drop it, add ` · dropped` after its other parts, before any ` · why:`. A milestone built outside the pipeline names its sprints after its phase, before any ` · dropped` or ` · why:`: ` · sprints: PR #40, PR #41`. Also give each standard milestone one line anywhere in this section, saying whether this project takes it on and why: `- <Phase>-<n> (standard) · taken on · why: <reason>` or `- <Phase>-<n> (standard) · skipped · why: <reason>`, where `<Phase>-<n>` is its place in the model's table, Discovery-1 to Launch-5; one line holds for every run of its phase. Write Discovery's and Design's in the brief, ruled with the Design gate, and Build's and Launch's before the Build gate, ruled with it. Until its gate is ruled, adding or changing a line needs the Critic's check. After it, anything that drops work needs the owner's ruling: a change from taken on to skipped, a line removed, or a line first added as skipped; taking on more work (a change from skipped to taken on, or a line first added as taken on) and a change of its why alone need only the Critic's check. Skipping one excuses no record a check or a gate needs. When the owner accepts one of the project's own milestones, add ` · reached: <yyyy-mm-dd>` after any ` · sprints:` part and before any ` · dropped` or ` · why:`, in a commit whose `Owner-Ruling:` trailer names the owner's acceptance record; only the owner's ruling adds, changes or removes it (S-033).*

## 4. Owners
*An owner for every deliverable, including anything that needs the owner or an outside party.*

## 5. Limits
*The spend ceiling, the data boundaries (what data may go to which outside service), and the tier (T1, T2 or T3 by the tier triggers), which is the project's trust level.*

## 6. Value and stop rule
*This project's own measure of value, the target and date, and what counts as a miss — including the cost to the owner's time. Write each value target on its own line starting with its ID, like `V1: <measure>, <target>, <date>`; spec criteria trace to these IDs.*

## 7. Solid foundation
*Every load-bearing unknown, each answered with evidence (library entry or research memo), including through research sub-projects if needed. Name the groundwork map this rests on (research/<Q-id>-memo.md) and the owner's answers to its shortlist, or say why no map was needed.*

## 8. Clear and consistent
*Key terms defined; constraints checked against each other and found not to contradict.*

## 9. The target user
*Either the one line `The owner is the user.`, or the two lines `Profile: docs/users/PROFILE.md` and `Approved: decisions/questions/<project item>-user-profile-<n>.md`. Build the profile from Discovery's research, in the form docs/users/_PROFILE.md, and have the owner approve it before the definition-of-ready check (S-025).*

# Part 2 — The intent

## Intent
The owner's purpose, preferences and trade-offs for this project, and what they would hate. Drafted by
the Chief of Staff from conversations, portfolio defaults and past rulings; confirmed on the
move-to-Design card.
